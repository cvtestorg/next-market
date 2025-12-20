package main

import (
	"fmt"
	"log"

	"github.com/cvtestorg/next-market/backend/internal/config"
	"github.com/cvtestorg/next-market/backend/internal/handlers"
	"github.com/cvtestorg/next-market/backend/internal/models"
	"github.com/cvtestorg/next-market/backend/internal/services"
	"github.com/cvtestorg/next-market/backend/pkg/storage"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 连接数据库
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 自动迁移数据库
	if err := db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.Plugin{},
		&models.PluginVersion{},
		&models.PluginLicense{},
		&models.PluginAuthorization{},
		&models.AuditLog{},
		&models.CachedRemotePlugin{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed")

	// 创建默认组织（如果不存在）
	var defaultOrg models.Organization
	if err := db.Where("name = ?", "Default Organization").First(&defaultOrg).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			defaultOrg = models.Organization{
				Name:      "Default Organization",
				OpenFGAID: "org_default_001",
			}
			if err := db.Create(&defaultOrg).Error; err != nil {
				log.Printf("Warning: Failed to create default organization: %v", err)
			} else {
				log.Println("Default organization created")
			}
		}
	}

	// 初始化S3存储
	s3Storage, err := storage.NewS3Storage(&cfg.S3)
	if err != nil {
		log.Fatalf("Failed to initialize S3 storage: %v", err)
	}

	// 初始化服务
	pluginService := services.NewPluginService(db, s3Storage)

	// 初始化处理器
	pluginHandler := handlers.NewPluginHandler(pluginService)

	// 设置Gin
	gin.SetMode(cfg.Server.Mode)
	r := gin.Default()

	// CORS配置
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API路由
	v1 := r.Group("/api/v1")
	{
		// 插件相关
		plugins := v1.Group("/plugins")
		{
			plugins.GET("", pluginHandler.ListPlugins)
			plugins.GET("/search", pluginHandler.SearchPlugins)
			plugins.GET("/:id", pluginHandler.GetPlugin)
			plugins.GET("/by-name/:name", pluginHandler.GetPluginByName)
			plugins.POST("/upload", pluginHandler.UploadPlugin)
		}
	}

	// 启动服务器
	addr := ":" + cfg.Server.Port
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
