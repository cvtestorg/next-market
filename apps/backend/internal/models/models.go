package models

import (
	"time"

	"gorm.io/gorm"
)

// PluginType 插件类型
type PluginType string

const (
	PluginTypeFree       PluginType = "free"
	PluginTypeEnterprise PluginType = "enterprise"
)

// PluginVisibility 插件可见性
type PluginVisibility string

const (
	VisibilityPublic  PluginVisibility = "public"
	VisibilityPrivate PluginVisibility = "private"
)

// PluginSource 插件来源
type PluginSource string

const (
	SourceLocal       PluginSource = "local"
	SourceRemoteProxy PluginSource = "remote_proxy"
)

// Plugin 插件模型
type Plugin struct {
	ID                    uint             `gorm:"primarykey" json:"id"`
	CreatedAt             time.Time        `json:"created_at"`
	UpdatedAt             time.Time        `json:"updated_at"`
	DeletedAt             gorm.DeletedAt   `gorm:"index" json:"-"`
	NPMPackageName        string           `gorm:"uniqueIndex;not null" json:"npm_package_name"`
	DisplayName           string           `json:"display_name"`
	Description           string           `json:"description"`
	Type                  PluginType       `gorm:"type:varchar(20);default:'free'" json:"type"`
	Visibility            PluginVisibility `gorm:"type:varchar(20);default:'public'" json:"visibility"`
	Source                PluginSource     `gorm:"type:varchar(20);default:'local'" json:"source"`
	LatestVersion         string           `json:"latest_version"`
	IconURL               string           `json:"icon_url"`
	BackendInstallGuide   string           `gorm:"type:text" json:"backend_install_guide"`
	UpstreamURL           string           `json:"upstream_url,omitempty"`
	MaxVersionsRetention  int              `gorm:"default:10" json:"max_versions_retention"`
	PublisherID           uint             `json:"publisher_id"`
	Publisher             *Organization    `gorm:"foreignKey:PublisherID" json:"publisher,omitempty"`
	Versions              []PluginVersion  `gorm:"foreignKey:PluginID" json:"versions,omitempty"`
	Keywords              string           `json:"keywords"` // 逗号分隔的关键词，用于搜索
	DownloadCount         int64            `gorm:"default:0" json:"download_count"`
	VerifiedPublisher     bool             `gorm:"default:false" json:"verified_publisher"`
}

// PluginVersion 插件版本模型
type PluginVersion struct {
	ID               uint           `gorm:"primarykey" json:"id"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	PluginID         uint           `gorm:"not null;index" json:"plugin_id"`
	Plugin           *Plugin        `gorm:"foreignKey:PluginID" json:"plugin,omitempty"`
	Version          string         `gorm:"not null" json:"version"`
	ReadmeContent    string         `gorm:"type:text" json:"readme_content"`
	ConfigSchemaJSON string         `gorm:"type:jsonb" json:"config_schema_json"`
	DownloadURL      string         `json:"download_url"`
	FileSize         int64          `json:"file_size"`
	Channel          string         `gorm:"default:'stable'" json:"channel"` // stable, beta
	DownloadCount    int64          `gorm:"default:0" json:"download_count"`
	SecurityScanResult string       `gorm:"type:jsonb" json:"security_scan_result,omitempty"`
}

// Organization 组织模型
type Organization struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	Name       string         `gorm:"uniqueIndex;not null" json:"name"`
	OpenFGAID  string         `gorm:"uniqueIndex" json:"openfga_id"`
	Members    []User         `gorm:"many2many:organization_members;" json:"members,omitempty"`
}

// User 用户模型
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Name      string         `json:"name"`
	Avatar    string         `json:"avatar"`
	OpenFGAID string         `gorm:"uniqueIndex" json:"openfga_id"`
	Verified  bool           `gorm:"default:false" json:"verified"`
}

// PluginLicense 插件授权记录（企业购买插件）
type PluginLicense struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	PluginID       uint           `gorm:"not null;index" json:"plugin_id"`
	Plugin         *Plugin        `gorm:"foreignKey:PluginID" json:"plugin,omitempty"`
	OrganizationID uint           `gorm:"not null;index" json:"organization_id"`
	Organization   *Organization  `gorm:"foreignKey:OrganizationID" json:"organization,omitempty"`
	ExpiresAt      *time.Time     `json:"expires_at,omitempty"`
	Active         bool           `gorm:"default:true" json:"active"`
}

// PluginAuthorization 插件授权给用户
type PluginAuthorization struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	PluginID       uint           `gorm:"not null;index" json:"plugin_id"`
	Plugin         *Plugin        `gorm:"foreignKey:PluginID" json:"plugin,omitempty"`
	UserID         uint           `gorm:"not null;index" json:"user_id"`
	User           *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	OrganizationID uint           `gorm:"not null;index" json:"organization_id"`
	Organization   *Organization  `gorm:"foreignKey:OrganizationID" json:"organization,omitempty"`
	GrantedBy      uint           `json:"granted_by"` // 授权操作者ID
}

// AuditLog 审计日志
type AuditLog struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UserID    uint      `gorm:"index" json:"user_id"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Action    string    `gorm:"index" json:"action"` // purchase, assign, install, upload
	Resource  string    `json:"resource"`            // plugin:123, organization:456
	Details   string    `gorm:"type:jsonb" json:"details"`
	IPAddress string    `json:"ip_address"`
}

// CachedRemotePlugin 缓存的远程插件元数据
type CachedRemotePlugin struct {
	ID             uint      `gorm:"primarykey" json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	NPMPackageName string    `gorm:"uniqueIndex;not null" json:"npm_package_name"`
	Metadata       string    `gorm:"type:jsonb" json:"metadata"`
	LastSyncAt     time.Time `json:"last_sync_at"`
}
