# Next Market - Development Setup Guide

## Project Structure

This is a monorepo containing:
- `apps/backend` - Go (Gin) backend API
- `apps/web` - Next.js 14 frontend
- `docker` - Docker Compose configuration

## Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose

## Quick Start

### 1. Start Infrastructure Services

Start PostgreSQL, MinIO, and OpenFGA:

```bash
cd docker
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

### 2. Setup Backend

```bash
cd apps/backend

# Copy environment file
cp .env.example .env

# Install dependencies
go mod download

# Run the backend
go run cmd/server/main.go
```

Backend will start on http://localhost:8000

### 3. Setup Frontend

```bash
cd apps/web

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will start on http://localhost:3001

## Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **PostgreSQL**: localhost:5432
- **OpenFGA**: http://localhost:8080

## API Endpoints

### Plugins
- `GET /api/v1/plugins` - List all plugins
- `GET /api/v1/plugins/:id` - Get plugin details
- `GET /api/v1/plugins/by-name/:name` - Get plugin by package name
- `GET /api/v1/plugins/search?q=keyword` - Search plugins
- `POST /api/v1/plugins/upload` - Upload a new plugin

## Features Implemented

### Phase 1: Core Infrastructure ✓
- [x] Monorepo structure
- [x] Docker Compose setup (PostgreSQL, MinIO, OpenFGA)
- [x] Backend with Go/Gin
- [x] Frontend with Next.js 14

### Phase 2: Plugin Management ✓
- [x] NPM package parsing (.tgz extraction)
- [x] Plugin upload API
- [x] Version lifecycle management (retention policy)
- [x] S3 storage integration
- [x] Database models

### Phase 3: Frontend Pages ✓
- [x] Home page
- [x] Plugin marketplace listing
- [x] Plugin detail page
- [x] Plugin upload page
- [x] Search functionality

### Phase 4: Advanced Features (Partial)
- [ ] BetterAuth integration
- [ ] OpenFGA authorization model
- [ ] Enterprise plugin purchasing
- [ ] Organization management
- [ ] Audit logs
- [ ] Security scanning
- [ ] Hybrid cloud federation

## Testing Plugin Upload

### Create a Test Plugin

```bash
# Create a test plugin directory
mkdir test-plugin
cd test-plugin

# Create package.json
cat > package.json << 'EOF'
{
  "name": "test-plugin",
  "version": "1.0.0",
  "description": "A test plugin for Next Market",
  "type": "free",
  "keywords": ["test", "sample"],
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
EOF

# Create README
cat > README.md << 'EOF'
# Test Plugin

This is a test plugin for Next Market.

## Features
- Feature 1
- Feature 2
EOF

# Package it
npm pack

# This creates test-plugin-1.0.0.tgz
```

### Upload via Frontend
1. Go to http://localhost:3001/upload
2. Select the .tgz file
3. Click Upload

### Upload via API
```bash
curl -X POST http://localhost:8000/api/v1/plugins/upload \
  -F "file=@test-plugin-1.0.0.tgz"
```

## Development Notes

- The backend automatically migrates the database on startup
- MinIO bucket is created automatically
- Version retention is set to 10 by default (configurable per plugin)
- CORS is enabled for localhost:3000 and localhost:3001

## Next Steps

To complete the full specification:

1. **Authentication**: Integrate BetterAuth
2. **Authorization**: Implement OpenFGA model and APIs
3. **Enterprise Features**: Purchase workflow, authorization management
4. **Security**: Integrate Trivy for scanning
5. **Federation**: Implement upstream registry proxy
6. **Analytics**: Developer dashboard with metrics
