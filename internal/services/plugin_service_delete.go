package services

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/cvtestorg/next-market/internal/models"
	"gorm.io/gorm"
)

// DeletePlugin 删除插件（硬删除）
func (s *PluginService) DeletePlugin(ctx context.Context, pluginID uint) error {
	// 查找插件
	var plugin models.Plugin
	if err := s.db.Preload("Versions").First(&plugin, pluginID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("plugin not found")
		}
		return fmt.Errorf("failed to query plugin: %w", err)
	}

	// 删除所有版本的 S3 文件
	for _, version := range plugin.Versions {
		// 删除插件包文件
		// S3 路径格式: plugins/{pluginName}/{version}/{pluginName}-{version}.tgz
		pluginObjectName := fmt.Sprintf("plugins/%s/%s/%s-%s.tgz", 
			plugin.NPMPackageName, version.Version, plugin.NPMPackageName, version.Version)
		if err := s.storage.DeleteObject(ctx, pluginObjectName); err != nil {
			// 记录错误但继续删除其他文件
			fmt.Printf("Warning: failed to delete S3 object %s: %v\n", pluginObjectName, err)
		}
	}
	
	// 删除图标（如果有）
	if plugin.IconURL != "" {
		// 图标路径格式: icons/{pluginName}{ext}
		iconExt := s.extractIconExtension(plugin.IconURL)
		iconObjectName := fmt.Sprintf("icons/%s%s", plugin.NPMPackageName, iconExt)
		if err := s.storage.DeleteObject(ctx, iconObjectName); err != nil {
			fmt.Printf("Warning: failed to delete icon %s: %v\n", iconObjectName, err)
		}
	}

	// 硬删除所有版本（使用 Unscoped().Delete）
	if err := s.db.Unscoped().Where("plugin_id = ?", pluginID).Delete(&models.PluginVersion{}).Error; err != nil {
		return fmt.Errorf("failed to delete plugin versions: %w", err)
	}

	// 硬删除插件本身
	if err := s.db.Unscoped().Delete(&plugin).Error; err != nil {
		return fmt.Errorf("failed to delete plugin: %w", err)
	}

	return nil
}

// extractIconExtension 从图标 URL 中提取文件扩展名
func (s *PluginService) extractIconExtension(iconURL string) string {
	// 从 URL 中提取扩展名
	if strings.Contains(iconURL, ".") {
		parts := strings.Split(iconURL, ".")
		if len(parts) > 0 {
			ext := parts[len(parts)-1]
			// 移除查询参数
			if strings.Contains(ext, "?") {
				ext = strings.Split(ext, "?")[0]
			}
			return "." + ext
		}
	}
	return ".svg" // 默认扩展名
}

