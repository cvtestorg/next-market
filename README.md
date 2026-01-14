# Next Market

Enterprise plugin distribution platform built with Next.js 16 and Go.

## 🎯 Overview

Next Market is a comprehensive plugin marketplace that allows developers to publish and distribute plugins in NPM package format. The platform supports both free and enterprise plugins with fine-grained authorization using OpenFGA.

**Status**: ✅ Core features implemented and tested

## ✨ Features

### Implemented ✓
- 🚀 **NPM Package Parsing** - Automatic extraction of metadata, README, and icons from .tgz packages
- 📦 **Version Management** - Automatic version lifecycle with configurable retention policies  
- 🔍 **Search & Discovery** - Full-text search across plugins with keyword matching
- 💾 **S3 Storage** - MinIO integration for plugin package storage
- 🎨 **Modern UI** - Responsive design with Next.js 16 and Tailwind CSS
- 🔌 **RESTful API** - Complete CRUD operations for plugin management
- 🏗️ **Infrastructure** - Docker Compose setup with PostgreSQL, MinIO, OpenFGA, and Keycloak
- 🔐 **Authentication** - BetterAuth integration with Keycloak OIDC for user management

### Planned 🚧
- 👥 **Enterprise Authorization** - Fine-grained access control with OpenFGA
- 🛡️ **Security Scanning** - Automatic vulnerability detection with Trivy
- 📊 **Analytics** - Developer dashboard with download metrics
- ☁️ **Hybrid Cloud** - Support for private deployment with public market federation

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose

### 1. Start Infrastructure Services
```bash
cd docker
docker compose up -d
```

This starts:
- PostgreSQL (database)
- MinIO (S3-compatible storage)
- OpenFGA (authorization engine)
- Keycloak (authentication server on http://localhost:8180)

### 2. Configure Authentication (Optional)

To enable Keycloak OIDC authentication, follow the [Authentication Setup Guide](./AUTHENTICATION.md).

For quick start without authentication, skip this step and proceed to step 3.

### 3. Start Backend
```bash
go mod download
go run cmd/server/main.go server start
```

Backend will start on http://localhost:8000

### 4. Start Frontend
```bash
cd ui
npm install
npm run dev
```

Frontend will start on http://localhost:3001

## 📸 Screenshots

| Home Page | Plugin Marketplace |
|-----------|-------------------|
| ![Home](https://github.com/user-attachments/assets/e7650bc5-891d-4214-8b0b-4c4eb9664569) | ![Marketplace](https://github.com/user-attachments/assets/712e07fc-5a96-4eb1-862c-b811da8ef762) |

| Plugin Upload | Plugin Detail |
|--------------|---------------|
| ![Upload](https://github.com/user-attachments/assets/b88e07e3-2b51-4384-adc8-aa4a938f7da0) | ![Detail](https://github.com/user-attachments/assets/146ec2ea-03ea-4ba1-8173-d5d2f4eb7f7e) |

## 🏗️ Tech Stack

- **Backend**: Go 1.21, Gin Framework, GORM, PostgreSQL
- **Frontend**: Next.js 16, React 18, Tailwind CSS, TypeScript
- **Authentication**: BetterAuth with Keycloak OIDC
- **Storage**: S3-compatible (MinIO)
- **Authorization**: OpenFGA (ready for integration)
- **Infrastructure**: Docker Compose

## 📁 Project Structure

```
├── cmd/              # Application entrypoints
│   ├── server/       # Server command entrypoint
│   ├── server.go     # Server command implementation
│   ├── migrate.go    # Migrate command
│   └── root.go       # Root command
├── internal/         # Internal packages (handlers, services, models, config)
│   ├── config/       # Configuration management
│   ├── handlers/     # HTTP handlers
│   ├── models/       # Data models
│   └── services/     # Business logic services
├── pkg/              # Public packages (parser, storage)
│   ├── parser/       # NPM package parser
│   └── storage/      # Storage abstraction (S3)
├── ui/               # Next.js frontend
│   ├── app/          # Next.js 16 App Router
│   └── components/   # React components
├── docker/           # Docker Compose configs
├── examples/         # Example plugins
├── go.mod            # Go module definition
└── README.md         # Project documentation
```

## 🎮 Usage

### Upload a Plugin

1. Create your plugin as an NPM package:
```bash
npm pack
```

2. Upload via UI at http://localhost:3001/upload or via API:
```bash
curl -X POST http://localhost:8000/api/v1/plugins/upload \
  -F "file=@your-plugin-1.0.0.tgz"
```

3. Your plugin will be:
   - ✅ Parsed and validated
   - ✅ Stored in S3
   - ✅ Listed in the marketplace
   - ✅ Searchable by name and keywords

### Example Plugin package.json
```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin",
  "type": "free",
  "keywords": ["awesome", "plugin"],
  "icon": "assets/logo.png",
  "nextMarketConfig": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key"
      }
    }
  }
}
```

## 🔌 API Endpoints

```
GET    /api/v1/plugins              # List all plugins
GET    /api/v1/plugins/search?q=    # Search plugins
GET    /api/v1/plugins/:id          # Get plugin details
GET    /api/v1/plugins/by-name/:name # Get by package name
POST   /api/v1/plugins/upload       # Upload plugin
GET    /health                      # Health check
```

## 🧪 Testing

A sample plugin (`awesome-markdown-editor`) has been tested end-to-end:
- ✅ Upload via API
- ✅ List in marketplace
- ✅ View details with README
- ✅ Search functionality
- ✅ Version management

## 📚 Documentation

### Setup & Configuration
- [AUTHENTICATION.md](./AUTHENTICATION.md) - BetterAuth + Keycloak setup guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup and development guide

### Implementation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details
- [.github/copilot-instruction.md](./.github/copilot-instruction.md) - PRD & Specifications

### Feature Design Documents
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) - 功能实现规划
- [User Authentication Integration](./docs/DESIGN_AUTH_INTEGRATION.md) - 用户认证集成设计
- [OpenFGA Authorization](./docs/DESIGN_OPENFGA_AUTHORIZATION.md) - 企业授权系统设计
- [Plugin Purchase & Authorization](./docs/DESIGN_PLUGIN_PURCHASE.md) - 插件购买与授权流程设计
- [Audit Logs](./docs/DESIGN_AUDIT_LOGS.md) - 审计日志设计
- [Security Scanning](./docs/DESIGN_SECURITY_SCANNING.md) - 安全扫描设计
- [Analytics & Dashboard](./docs/DESIGN_ANALYTICS.md) - 数据分析与仪表盘设计
- [Hybrid Cloud Deployment](./docs/DESIGN_HYBRID_CLOUD.md) - 混合云/私有化部署设计

## 🤝 Contributing

This project follows the architectural design specified in the PRD. See `.github/copilot-instruction.md` for the complete specification.

## 📄 License

MIT

## 🙏 Acknowledgments

Built according to the comprehensive PRD specifications for an enterprise plugin marketplace platform.

---

**Note**: This is a working implementation of the core features. Advanced features like authentication, authorization, security scanning, and hybrid cloud federation are ready for implementation based on the provided architecture.
