package services

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"

	"github.com/cvtestorg/next-market/internal/models"
)

// SavePluginConfig 保存插件配置
func (s *PluginService) SavePluginConfig(ctx context.Context, pluginID uint, versionID uint, configValues map[string]interface{}) error {
	// 查找版本
	var version models.PluginVersion
	if err := s.db.Where("plugin_id = ? AND id = ?", pluginID, versionID).First(&version).Error; err != nil {
		return fmt.Errorf("plugin version not found: %w", err)
	}

	// 获取配置 schema 进行验证
	version.ParseConfigSchema()
	if version.ConfigSchema == nil {
		return fmt.Errorf("config schema not found")
	}

	schemaMap, ok := version.ConfigSchema.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid config schema format")
	}

	// 验证必填字段
	if required, ok := schemaMap["required"].([]interface{}); ok {
		for _, reqField := range required {
			fieldName := reqField.(string)
			if value, exists := configValues[fieldName]; !exists || value == nil || value == "" {
				return fmt.Errorf("required field '%s' is missing or empty", fieldName)
			}
		}
	}

	// 验证字段类型和格式
	if properties, ok := schemaMap["properties"].(map[string]interface{}); ok {
		for key, value := range configValues {
			if prop, exists := properties[key].(map[string]interface{}); exists {
				// 验证类型
				if propType, ok := prop["type"].(string); ok {
					if err := validateFieldType(key, value, propType, prop); err != nil {
						return err
					}
				}
			}
		}
	}

	// 序列化配置值
	configBytes, err := json.Marshal(configValues)
	if err != nil {
		return fmt.Errorf("failed to marshal config values: %w", err)
	}

	// 保存到数据库
	version.ConfigValuesJSON = configBytes
	if err := s.db.Save(&version).Error; err != nil {
		return fmt.Errorf("failed to save config: %w", err)
	}

	return nil
}

// validateFieldType 验证字段类型和格式
func validateFieldType(fieldName string, value interface{}, fieldType string, prop map[string]interface{}) error {
	switch fieldType {
	case "string":
		if strValue, ok := value.(string); ok {
			// 验证 minLength
			if minLen, ok := prop["minLength"].(float64); ok {
				if len(strValue) < int(minLen) {
					return fmt.Errorf("field '%s' must be at least %d characters", fieldName, int(minLen))
				}
			}
			// 验证 pattern
			if pattern, ok := prop["pattern"].(string); ok {
				matched, _ := regexp.MatchString(pattern, strValue)
				if !matched {
					return fmt.Errorf("field '%s' does not match required pattern", fieldName)
				}
			}
		} else {
			return fmt.Errorf("field '%s' must be a string", fieldName)
		}
	case "integer", "number":
		if numValue, ok := value.(float64); ok {
			// 验证 minimum
			if min, ok := prop["minimum"].(float64); ok {
				if numValue < min {
					return fmt.Errorf("field '%s' must be at least %v", fieldName, min)
				}
			}
			// 验证 maximum
			if max, ok := prop["maximum"].(float64); ok {
				if numValue > max {
					return fmt.Errorf("field '%s' must be at most %v", fieldName, max)
				}
			}
		} else {
			return fmt.Errorf("field '%s' must be a number", fieldName)
		}
	case "boolean":
		if _, ok := value.(bool); !ok {
			return fmt.Errorf("field '%s' must be a boolean", fieldName)
		}
	}
	return nil
}

