package config

import (
	"os"
)

// Config 应用配置
type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	S3        S3Config
	OpenFGA   OpenFGAConfig
	Upstream  UpstreamConfig
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port string
	Mode string // debug, release
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// S3Config S3存储配置
type S3Config struct {
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	Region          string
	UseSSL          bool
}

// OpenFGAConfig OpenFGA配置
type OpenFGAConfig struct {
	Host     string
	StoreID  string
	AuthZModelID string
}

// UpstreamConfig 上游市场配置（私有化部署时使用）
type UpstreamConfig struct {
	Enabled bool
	URL     string
}

// Load 加载配置
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8000"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "nextmarket"),
			Password: getEnv("DB_PASSWORD", "nextmarket_dev_password"),
			DBName:   getEnv("DB_NAME", "nextmarket"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		S3: S3Config{
			Endpoint:        getEnv("S3_ENDPOINT", "localhost:9000"),
			AccessKeyID:     getEnv("S3_ACCESS_KEY", "minioadmin"),
			SecretAccessKey: getEnv("S3_SECRET_KEY", "minioadmin"),
			BucketName:      getEnv("S3_BUCKET", "next-market-plugins"),
			Region:          getEnv("S3_REGION", "us-east-1"),
			UseSSL:          getEnv("S3_USE_SSL", "false") == "true",
		},
		OpenFGA: OpenFGAConfig{
			Host:     getEnv("OPENFGA_HOST", "localhost:8080"),
			StoreID:  getEnv("OPENFGA_STORE_ID", ""),
			AuthZModelID: getEnv("OPENFGA_MODEL_ID", ""),
		},
		Upstream: UpstreamConfig{
			Enabled: getEnv("UPSTREAM_ENABLED", "false") == "true",
			URL:     getEnv("UPSTREAM_REGISTRY_URL", ""),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
