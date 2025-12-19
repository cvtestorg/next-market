package parser

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"
)

// PackageJSON NPM package.json 结构
type PackageJSON struct {
	Name              string                 `json:"name"`
	Version           string                 `json:"version"`
	Description       string                 `json:"description"`
	Author            string                 `json:"author"`
	Keywords          []string               `json:"keywords"`
	Icon              string                 `json:"icon"`
	NextMarketConfig  map[string]interface{} `json:"nextMarketConfig"`
	BackendInstallDoc string                 `json:"backendInstallDoc"`
	Type              string                 `json:"type"` // free, enterprise
}

// ParsedPackage 解析后的包内容
type ParsedPackage struct {
	PackageJSON PackageJSON
	ReadmeContent string
	IconData    []byte
	IconExtension string
}

// Parser NPM包解析器
type Parser struct{}

// NewParser 创建解析器实例
func NewParser() *Parser {
	return &Parser{}
}

// ParseTgz 解析 .tgz 文件
// reader: .tgz 文件的 io.Reader
// 返回: 解析后的包内容
func (p *Parser) ParseTgz(reader io.Reader) (*ParsedPackage, error) {
	gzipReader, err := gzip.NewReader(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to create gzip reader: %w", err)
	}
	defer gzipReader.Close()

	tarReader := tar.NewReader(gzipReader)
	
	result := &ParsedPackage{}
	var foundPackageJSON bool

	// 遍历 tar 文件中的所有文件
	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read tar: %w", err)
		}

		// NPM 包的文件通常在 package/ 目录下
		filename := strings.TrimPrefix(header.Name, "package/")
		
		switch {
		case filename == "package.json":
			// 读取 package.json
			data, err := io.ReadAll(tarReader)
			if err != nil {
				return nil, fmt.Errorf("failed to read package.json: %w", err)
			}
			
			if err := json.Unmarshal(data, &result.PackageJSON); err != nil {
				return nil, fmt.Errorf("failed to parse package.json: %w", err)
			}
			foundPackageJSON = true
			
		case filename == "README.md" || filename == "readme.md":
			// 读取 README
			data, err := io.ReadAll(tarReader)
			if err != nil {
				return nil, fmt.Errorf("failed to read README: %w", err)
			}
			result.ReadmeContent = string(data)
			
		case result.PackageJSON.Icon != "" && filename == result.PackageJSON.Icon:
			// 读取图标文件
			data, err := io.ReadAll(tarReader)
			if err != nil {
				return nil, fmt.Errorf("failed to read icon: %w", err)
			}
			result.IconData = data
			result.IconExtension = filepath.Ext(filename)
		}
	}

	if !foundPackageJSON {
		return nil, errors.New("package.json not found in archive")
	}

	return result, nil
}

// GetConfigSchemaJSON 获取配置 Schema 的 JSON 字符串
func (p *ParsedPackage) GetConfigSchemaJSON() (string, error) {
	if p.PackageJSON.NextMarketConfig == nil {
		return "{}", nil
	}
	
	data, err := json.Marshal(p.PackageJSON.NextMarketConfig)
	if err != nil {
		return "", fmt.Errorf("failed to marshal config schema: %w", err)
	}
	
	return string(data), nil
}

// GetKeywords 获取关键词字符串（逗号分隔）
func (p *ParsedPackage) GetKeywords() string {
	return strings.Join(p.PackageJSON.Keywords, ",")
}

// GetPluginType 获取插件类型，默认为 free
func (p *ParsedPackage) GetPluginType() string {
	if p.PackageJSON.Type == "enterprise" {
		return "enterprise"
	}
	return "free"
}
