package cmd

import (
	"fmt"
	"log"

	"github.com/cvtestorg/next-market/internal/config"
	"github.com/cvtestorg/next-market/internal/models"
	"github.com/spf13/cobra"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// migrateCmd 代表 migrate 命令
var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Run database migrations",
	Long: `Run database migrations to update the database schema.
This command will automatically migrate all models to match the current schema.`,
	Run: runMigrate,
}

func init() {
	rootCmd.AddCommand(migrateCmd)
}

func runMigrate(cmd *cobra.Command, args []string) {
	// 从环境变量加载配置
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

	// 执行迁移
	log.Println("Starting database migration...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.Plugin{},
		&models.PluginVersion{},
		&models.PluginLicense{},
		&models.PluginAuthorization{},
		&models.AuditLog{},
		&models.CachedRemotePlugin{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully")
}

