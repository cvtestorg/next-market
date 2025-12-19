# Next Market

Enterprise plugin distribution platform built with Next.js and Go.

## Overview

Next Market is a comprehensive plugin marketplace that allows developers to publish and distribute plugins in NPM package format. The platform supports both free and enterprise plugins with fine-grained authorization using OpenFGA.

## Features

- 🚀 **NPM Package Parsing** - Automatic extraction of metadata, README, and icons from .tgz packages
- 🔐 **Enterprise Authorization** - Fine-grained access control with OpenFGA
- 📦 **Version Management** - Automatic version lifecycle with retention policies
- 🔍 **Search & Discovery** - Full-text search across plugins
- ☁️ **Hybrid Cloud** - Support for private deployment with public market federation
- 🛡️ **Security Scanning** - Automatic vulnerability detection (planned)
- 📊 **Analytics** - Developer dashboard with download metrics (planned)

## Tech Stack

- **Backend**: Go (Gin Framework), GORM, PostgreSQL
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Storage**: S3-compatible (MinIO)
- **Authorization**: OpenFGA
- **Infrastructure**: Docker Compose

## Quick Start

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

```bash
# Start infrastructure
cd docker && docker-compose up -d

# Start backend
cd apps/backend && go run cmd/server/main.go

# Start frontend
cd apps/web && npm install && npm run dev
```

## Project Structure

```
├── apps/
│   ├── backend/      # Go backend API
│   └── web/          # Next.js frontend
├── docker/           # Docker Compose configs
└── packages/         # Shared packages (future)
```

## License

MIT
