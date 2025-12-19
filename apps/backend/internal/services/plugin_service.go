package services

import (
	"context"
	"errors"
	"fmt"
	"io"
	"sort"

	"github.com/Masterminds/semver/v3"
	"github.com/cvtestorg/next-market/backend/internal/models"
	"github.com/cvtestorg/next-market/backend/pkg/parser"
	"github.com/cvtestorg/next-market/backend/pkg/storage"
	"gorm.io/gorm"
)

// PluginService 插件服务
type PluginService struct {
	db      *gorm.DB
	storage *storage.S3Storage
	parser  *parser.Parser
}

// NewPluginService 创建插件服务实例
func NewPluginService(db *gorm.DB, storage *storage.S3Storage) *PluginService {
	return &PluginService{
		db:      db,
		storage: storage,
		parser:  parser.NewParser(),
	}
}

// UploadPlugin 上传插件
func (s *PluginService) UploadPlugin(ctx context.Context, reader io.Reader, fileData []byte, publisherID uint) (*models.Plugin, error) {
	// 1. 解析包内容
	parsed, err := s.parser.ParseTgz(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to parse package: %w", err)
	}

	// 2. 验证版本号格式
	_, err = semver.NewVersion(parsed.PackageJSON.Version)
	if err != nil {
		return nil, fmt.Errorf("invalid version format: %w", err)
	}

	// 3. 查找或创建插件记录
	var plugin models.Plugin
	err = s.db.Where("npm_package_name = ?", parsed.PackageJSON.Name).First(&plugin).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 创建新插件
			plugin = models.Plugin{
				NPMPackageName:       parsed.PackageJSON.Name,
				DisplayName:          parsed.PackageJSON.Name,
				Description:          parsed.PackageJSON.Description,
				Type:                 models.PluginType(parsed.GetPluginType()),
				Visibility:           models.VisibilityPublic,
				Source:               models.SourceLocal,
				MaxVersionsRetention: 10,
				PublisherID:          publisherID,
				Keywords:             parsed.GetKeywords(),
			}
			
			if err := s.db.Create(&plugin).Error; err != nil {
				return nil, fmt.Errorf("failed to create plugin: %w", err)
			}
		} else {
			return nil, fmt.Errorf("failed to query plugin: %w", err)
		}
	}

	// 4. 检查版本是否已存在
	var existingVersion models.PluginVersion
	err = s.db.Where("plugin_id = ? AND version = ?", plugin.ID, parsed.PackageJSON.Version).First(&existingVersion).Error
	if err == nil {
		return nil, fmt.Errorf("version %s already exists", parsed.PackageJSON.Version)
	}

	// 5. 上传文件到S3
	pluginPath, err := s.storage.UploadPlugin(ctx, parsed.PackageJSON.Name, parsed.PackageJSON.Version, fileData)
	if err != nil {
		return nil, fmt.Errorf("failed to upload plugin file: %w", err)
	}

	// 6. 上传图标（如果有）
	var iconURL string
	if len(parsed.IconData) > 0 {
		iconPath, err := s.storage.UploadIcon(ctx, parsed.PackageJSON.Name, parsed.IconData, parsed.IconExtension)
		if err != nil {
			// 图标上传失败不影响主流程
			fmt.Printf("Warning: failed to upload icon: %v\n", err)
		} else {
			iconURL = s.storage.GetIconURL(iconPath)
		}
	}

	// 7. 获取配置 Schema
	configSchema, err := parsed.GetConfigSchemaJSON()
	if err != nil {
		return nil, fmt.Errorf("failed to get config schema: %w", err)
	}

	// 8. 创建版本记录
	downloadURL, _ := s.storage.GetDownloadURL(ctx, pluginPath)
	version := models.PluginVersion{
		PluginID:         plugin.ID,
		Version:          parsed.PackageJSON.Version,
		ReadmeContent:    parsed.ReadmeContent,
		ConfigSchemaJSON: configSchema,
		DownloadURL:      downloadURL,
		FileSize:         int64(len(fileData)),
		Channel:          "stable",
	}

	if err := s.db.Create(&version).Error; err != nil {
		// 清理已上传的文件
		_ = s.storage.DeleteObject(ctx, pluginPath)
		return nil, fmt.Errorf("failed to create version: %w", err)
	}

	// 9. 更新插件的最新版本和图标
	plugin.LatestVersion = parsed.PackageJSON.Version
	if iconURL != "" {
		plugin.IconURL = iconURL
	}
	if parsed.PackageJSON.BackendInstallDoc != "" {
		plugin.BackendInstallGuide = parsed.PackageJSON.BackendInstallDoc
	}
	if err := s.db.Save(&plugin).Error; err != nil {
		return nil, fmt.Errorf("failed to update plugin: %w", err)
	}

	// 10. 执行版本保留策略
	if err := s.pruneOldVersions(ctx, plugin.ID, plugin.MaxVersionsRetention); err != nil {
		// 版本清理失败不影响主流程，记录日志
		fmt.Printf("Warning: failed to prune old versions: %v\n", err)
	}

	return &plugin, nil
}

// pruneOldVersions 清理旧版本
func (s *PluginService) pruneOldVersions(ctx context.Context, pluginID uint, maxRetention int) error {
	// 查询所有版本
	var versions []models.PluginVersion
	if err := s.db.Where("plugin_id = ?", pluginID).Order("created_at DESC").Find(&versions).Error; err != nil {
		return err
	}

	// 如果版本数不超过限制，无需清理
	if len(versions) <= maxRetention {
		return nil
	}

	// 按语义版本排序
	sort.Slice(versions, func(i, j int) bool {
		v1, _ := semver.NewVersion(versions[i].Version)
		v2, _ := semver.NewVersion(versions[j].Version)
		if v1 == nil || v2 == nil {
			return versions[i].CreatedAt.Before(versions[j].CreatedAt)
		}
		return v1.LessThan(v2)
	})

	// 删除最旧的版本
	toDelete := len(versions) - maxRetention
	for i := 0; i < toDelete; i++ {
		version := versions[i]
		
		// 从S3删除文件
		// 从download_url提取对象名（简化处理）
		if version.DownloadURL != "" {
			// 实际实现中应该存储objectName，这里简化处理
			fmt.Printf("Should delete version %s from S3\n", version.Version)
		}
		
		// 从数据库删除
		if err := s.db.Delete(&version).Error; err != nil {
			return fmt.Errorf("failed to delete version %s: %w", version.Version, err)
		}
	}

	return nil
}

// ListPlugins 列出插件
func (s *PluginService) ListPlugins(ctx context.Context, page, pageSize int, pluginType string) ([]models.Plugin, int64, error) {
	var plugins []models.Plugin
	var total int64

	query := s.db.Model(&models.Plugin{})
	
	if pluginType != "" {
		query = query.Where("type = ?", pluginType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Preload("Publisher").Find(&plugins).Error; err != nil {
		return nil, 0, err
	}

	return plugins, total, nil
}

// GetPlugin 获取插件详情
func (s *PluginService) GetPlugin(ctx context.Context, id uint) (*models.Plugin, error) {
	var plugin models.Plugin
	if err := s.db.Preload("Publisher").Preload("Versions").First(&plugin, id).Error; err != nil {
		return nil, err
	}
	return &plugin, nil
}

// GetPluginByName 根据包名获取插件
func (s *PluginService) GetPluginByName(ctx context.Context, name string) (*models.Plugin, error) {
	var plugin models.Plugin
	if err := s.db.Where("npm_package_name = ?", name).Preload("Publisher").Preload("Versions").First(&plugin).Error; err != nil {
		return nil, err
	}
	return &plugin, nil
}

// SearchPlugins 搜索插件
func (s *PluginService) SearchPlugins(ctx context.Context, keyword string, page, pageSize int) ([]models.Plugin, int64, error) {
	var plugins []models.Plugin
	var total int64

	// 使用 PostgreSQL 全文搜索
	query := s.db.Model(&models.Plugin{}).Where(
		"npm_package_name ILIKE ? OR description ILIKE ? OR keywords ILIKE ?",
		"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%",
	)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Preload("Publisher").Find(&plugins).Error; err != nil {
		return nil, 0, err
	}

	return plugins, total, nil
}
