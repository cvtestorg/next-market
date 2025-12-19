# Next Market Project - PRD & SPEC

## 1. Product Requirements Document (PRD)

### 1.1 项目概述 (Project Overview)
Next Market 是一个面向企业和开发者的插件分发平台。它允许开发者以标准 NPM 包的形式发布插件，平台自动解析包内容生成展示和配置页面。
**注意**: 本平台仅使用 NPM 包 (`.tgz`) 作为插件的打包和上传格式，**并非** 标准的 NPM Registry (如 Verdaccio)。它不提供 `npm install` 协议支持，而是提供自定义 REST API 供客户端直接下载插件包。
市场区分“免费”和“企业”两种插件类型，并针对企业插件提供基于 OpenFGA 的细粒度授权管理功能。
平台支持 **SaaS 公有云** 和 **私有化部署** 两种模式，私有化部署时支持与公有云市场联邦，实现“私有插件+公有插件”的统一管理。

### 1.2 用户角色 (User Roles)
1.  **终端用户 (End User)**: 通过客户端应用（如 Tauri 桌面端）调用 API 浏览、下载插件。
    *   *注：终端用户使用的客户端应用不在本项目开发范围内，本项目仅提供 API 支持。*
2.  **企业管理员 (Enterprise Admin)**: 购买企业插件，管理企业组织架构，为组织内的用户分配插件使用权限。
3.  **插件开发者 (Plugin Publisher)**: 开发并上传插件（NPM 包），维护插件版本。

### 1.3 项目范围界定 (Scope Boundary)
*   **In Scope**: 插件市场后端 API、Web 管理后台（管理员/开发者使用）、插件解析引擎、OpenFGA 权限系统。
*   **Out of Scope**: 终端用户使用的桌面客户端 (Tauri App) 开发。市场仅需提供标准的 RESTful API 供客户端调用即可。

### 1.4 功能需求 (Functional Requirements)

#### 1.4.1 插件发布与解析 (Plugin Publishing & Parsing)
*   **上传格式**: 插件必须打包为标准 NPM 格式 (`.tgz` 或文件夹结构)。
*   **自动解析**:
    *   **基础信息**: 从 `package.json` 解析插件名称、版本、作者、依赖。
    *   **配置页面**: 解析 `package.json` 中的特定配置字段（如 `configurationSchema`），自动生成插件的后台配置 UI。
    *   **介绍页面**: 自动读取包根目录下的 `README.md` 文件，渲染为插件详情页的介绍内容。
    *   **图标提取**: 读取包内的图标文件（路径在 `package.json` 中定义），作为插件在市场的展示图标。
*   **版本生命周期管理 (Version Lifecycle Management)**:
    *   **版本保留策略**: 支持配置插件的版本保留数量（例如：仅保留最近 10 个版本）。
    *   **自动清理**: 当上传新版本触发总数超过阈值时，系统自动删除最旧的版本（包括数据库记录和存储文件）。

#### 1.4.2 插件类型与获取 (Plugin Types & Acquisition)
*   **免费插件 (Free Plugins)**:
    *   所有用户可见。
    *   支持直接下载安装到本地环境。
*   **企业插件 (Enterprise Plugins)**:
    *   **购买流程**: 企业管理员需在市场进行购买/订阅操作。
    *   **部署指导**: 对于包含后端组件的插件，购买后需向管理员展示详细的后端安装与配置指南。
    *   **权限控制**: 购买不代表全员可用，需经过二次授权。

#### 1.4.3 企业级授权管理 (Enterprise Authorization)
*   **组织管理**: 支持企业创建组织，添加成员。
*   **授权分配**:
    *   企业购买插件后，获得该插件的“分发权”。
    *   管理员可在后台将特定插件的使用权分配给指定的内部用户或部门。
*   **鉴权机制**: 必须使用 OpenFGA 实现权限模型，确保权限检查的高性能和灵活性。

#### 1.4.4 高级市场特性 (Advanced Market Features)
*   **搜索与发现 (Discovery)**:
    *   **语义搜索**: 支持按功能描述搜索插件，不仅限于名称匹配。
    *   **兼容性过滤**: 根据用户环境自动隐藏不兼容插件。
*   **信任与安全 (Trust & Security)**:
    *   **自动扫描**: 插件上传时自动进行静态代码分析 (SAST) 和依赖漏洞扫描 (CVE)。
    *   **开发者认证**: 引入 "Verified Publisher" 机制，验证发布者身份（域名/组织验证）。
*   **开发者生态 (Developer Ecosystem)**:
    *   **版本通道**: 支持 `Beta`/`Stable` 多通道发布，允许灰度测试。
    *   **数据分析**: 为开发者提供下载量、活跃用户数、卸载率等仪表盘。
*   **企业治理 (Enterprise Governance)**:
    *   **审计日志**: 记录企业内所有插件的购买、分配、安装操作，满足合规审计。
    *   **私有仓库**: 允许企业上传仅内部可见的私有插件，不公开到公共市场。

#### 1.4.5 混合云/私有化部署 (Hybrid/Private Deployment)
*   **统一视图 (Unified View)**:
    *   企业内网部署的 Next Market 实例，默认应能展示公有市场的插件列表。
    *   用户在搜索时，结果应包含“本地私有插件”和“远程公有插件”。
*   **代理与缓存 (Proxy & Cache)**:
    *   对于公有插件的下载，私有实例应作为代理，并支持缓存以加速内网分发。
*   **隔离性 (Isolation)**:
    *   企业上传的私有插件，严格限制在本地实例，绝不上传到公有市场。

---

## 2. Technical Specifications (SPEC)

### 2.1 技术栈选型 (Tech Stack)
*   **Architecture**: Monorepo (统一管理前后端代码)。
*   **Backend**: Golang (Gin Framework) - 高性能 API 服务。
    *   **ORM**: GORM - 数据库交互。
    *   **Database**: PostgreSQL - 关系型数据存储。
*   **Frontend**: Next.js 16 (React Framework)。
    *   **Auth**: BetterAuth - 用户认证。
    *   **UI Components**: Shadcn UI + Tailwind CSS - 现代化界面构建。
*   **Package Handling**: Go `archive/tar`, `compress/gzip` - 用于后端解析 NPM 包。
*   **Authorization**: OpenFGA - 细粒度权限控制 (ReBAC)。
*   **Storage**: S3 Compatible Storage (MinIO/AWS S3) - 存储插件 `.tgz` 包及提取的静态资源。

### 2.2 核心功能实现 (Core Implementation)

#### 2.2.1 NPM 包解析引擎 (NPM Parsing Engine - Golang)
*   **流程**:
    1.  **上传**: 用户上传 `.tgz` 文件，后端 Gin Handler 接收 `multipart/form-data`。
    2.  **流式处理**: 使用 `gzip.NewReader` 和 `tar.NewReader` 在内存中流式遍历包内容，无需完全解压到磁盘。
    3.  **提取元数据**:
        *   **package.json**: 解析 JSON 到 Go Struct，提取 `name`, `version`, `description`, `nextMarketConfig` (Schema), `icon` (path)。
        *   **README.md**: 读取文件内容为 `[]byte` 转 String。
        *   **Icon**: 匹配 `package.json` 中定义的 icon 路径，读取文件流。
    4.  **存储**:
        *   **文件**: 将原始 `.tgz` 和提取的 Icon 图片上传至 S3 存储桶。
        *   **数据**: 使用 GORM 将插件元数据写入 Postgres `plugins` 和 `plugin_versions` 表。
    5.  **版本保留策略执行 (Retention Policy Execution)**:
        *   **Check**: 查询该插件当前版本总数。
        *   **Prune**: 若超过 `max_versions_retention` (默认或配置值)，按语义版本排序，删除最旧的版本。
        *   **Delete**: 级联删除数据库记录，并调用 S3 API 删除对应的 `.tgz` 文件。

    *示例 `package.json` 片段*:
    ```json
    {
      "name": "my-plugin",
      "nextMarketConfig": {
        "type": "object",
        "properties": {
          "apiKey": { "type": "string", "title": "API Key" }
        }
      },
      "icon": "assets/logo.png"
    }
    ```

#### 2.2.2 动态配置页面生成 (Dynamic Configuration UI)
*   **前端实现**: Next.js 16 + Shadcn UI。
*   **逻辑**:
    *   使用支持 JSON Schema 的表单库 (如 `react-jsonschema-form` 的 Shadcn 主题适配版或基于 `react-hook-form` 自研生成器)。
    *   后端返回 `nextMarketConfig` JSON Schema。
    *   前端根据 Schema 动态渲染 Input, Select, Switch 等 Shadcn 组件。

#### 2.2.3 认证与授权 (Auth & Authorization)
*   **Authentication (BetterAuth)**:
    *   处理用户注册、登录、Session 管理。
    *   集成 GitHub/Google OAuth (可选)。
*   **Authorization (OpenFGA)**:
    *   **Store**: Next-Market-Store
    *   **Model DSL**:
    ```openfga
    model
      schema 1.1

    type user

    type organization
      relations
        define admin: [user]
        define member: [user]

    type plugin
      relations
        # 插件的发布者
        define publisher: [organization]
        
        # 购买了该插件的组织
        define licensee: [organization]
        
        # 组织内被特别授权使用该插件的用户
        define authorized_user: [user]
        
        # 最终判断用户是否有权安装/使用
        define can_install: authorized_user
    ```

*   **业务流程映射**:
    1.  **企业购买插件**:
        *   写入 Tuple: `user="organization:org_id"`, `relation="licensee"`, `object="plugin:plugin_id"`
    2.  **管理员授权给用户**:
        *   检查: 当前操作者是否是 `organization:org_id` 的 `admin`。
        *   检查: `organization:org_id` 是否是 `plugin:plugin_id` 的 `licensee`。
        *   写入 Tuple: `user="user:user_id"`, `relation="authorized_user"`, `object="plugin:plugin_id"`
    3.  **用户安装插件**:
        *   Check: `user="user:user_id"`, `relation="can_install"`, `object="plugin:plugin_id"` -> 返回 Allowed/Denied。

#### 2.2.4 高级特性实现 (Advanced Features Implementation)
*   **搜索 (Search)**:
    *   利用 PostgreSQL 的 `tsvector` 和 `tsquery` 实现全文检索。
    *   对 `name`, `description`, `keywords` (from package.json) 建立 GIN 索引。
*   **安全扫描 (Security Scanning)**:
    *   集成 `Trivy` (作为 Go Library 或 CLI) 在上传 Pipeline 中。
    *   **SCA**: 扫描 `package.json` 依赖树，匹配已知 CVE 数据库。
    *   **SAST**: 简单的正则匹配扫描敏感信息 (如 AWS Keys, Private Keys)。
*   **审计日志 (Audit Logs)**:
    *   **Middleware**: 在 Gin 中实现 Audit Middleware，记录关键操作 (Purchase, Assign, Install)。
    *   **Storage**: 结构化日志存入 Postgres `audit_logs` 表 (JSONB 存储详情)，或异步写入 Elasticsearch。
*   **私有仓库 (Private Registry)**:
    *   在 `plugins` 表增加 `visibility` 字段 (`public` | `private`)。
    *   在 OpenFGA 中增加 `viewer` 关系，私有插件仅对所属 `organization` 的成员赋予 `viewer` 权限。

#### 2.2.5 混合源架构 (Hybrid Registry Architecture)
*   **Upstream Configuration**:
    *   私有实例配置文件中指定 `UPSTREAM_REGISTRY_URL` (指向公有市场 API)。
*   **API Aggregation**:
    *   **Search/List API**: 后端同时查询本地数据库和 Upstream API。
        *   本地结果优先展示。
        *   结果合并去重 (以 Package Name 为准)。
    *   **Detail API**: 先查本地，若无则查 Upstream，并将 Upstream 元数据缓存到本地 `cached_remote_plugins` 表。
*   **Download Proxy**:
    *   用户请求下载 -> 检查本地 S3 -> 若无，从 Upstream 下载 -> 存入本地 S3 (Cache) -> 返回流给用户。

#### 2.2.6 数据库设计摘要 (Database Schema)
*   **Plugins Table**:
    *   `id`, `npm_package_name`, `type` (enum: 'free', 'enterprise'), `latest_version`, `icon_url`, `backend_install_guide` (Text).
    *   `source` (enum: 'local', 'remote_proxy'), `upstream_url` (nullable).
    *   `max_versions_retention` (int, default: 10).
*   **PluginVersions Table**:
    *   `id`, `plugin_id`, `version`, `readme_content`, `config_schema_json`, `download_url`.
*   **Organizations Table**:
    *   `id`, `name`, `openfga_id`.

### 2.3 部署与运维 (Deployment)
*   **OpenFGA**: 部署 OpenFGA Server，配置 PostgreSQL 作为存储后端。
*   **Storage**: 必须配置 S3 兼容的对象存储 (如 MinIO, AWS S3) 用于存放插件包文件。
*   **No NPM Registry Dependency**: 私有化部署不依赖任何外部或内部 NPM Registry，所有插件包均存储在本地 S3 或通过 API 代理从公有市场获取。

---

## 3. Development Guidelines & AI Agent Instructions

### 3.1 开发原则 (Development Principles)
*   **Research First**: 在编写代码前，必须先搜索互联网或官方文档，确认所选库（BetterAuth, OpenFGA, GORM, Next.js 16）的最佳实践和最新 API。
*   **Step-by-Step**: 将复杂任务拆解为小步骤执行。例如：先搭建 Monorepo 骨架，再实现后端基础 API，最后实现前端页面。
*   **No Over-engineering**: 避免过度设计。代码应简洁、实用，直接解决 PRD 中的需求。
*   **Comments**: 关键逻辑和复杂算法必须添加**中文注释**，解释“为什么这样做”而非“做了什么”。

### 3.2 目录结构规范 (Directory Structure)
采用标准的 Monorepo 结构：
```
/
├── apps/
│   ├── web/          # Next.js 16 Frontend
│   └── backend/      # Golang Gin Backend
├── packages/         # Shared libraries (if any)
├── docker/           # Docker compose & deployment configs
└── README.md
```

### 3.3 编码规范 (Coding Standards)
*   **Golang**:
    *   遵循 Standard Go Project Layout。
    *   错误处理：使用 `errors.Is`, `errors.As`，避免简单的 `panic`。
    *   API 响应：统一封装 JSON 响应结构 `{ code, message, data }`。
*   **Next.js**:
    *   充分利用 App Router 和 Server Components。
    *   使用 Shadcn UI 组件库，保持 UI 风格一致。
    *   状态管理：优先使用 React Server Actions 和 URL State，必要时使用 Zustand。

### 3.4 任务执行清单 (Execution Checklist)
1.  **初始化**: 创建 Monorepo，配置 Docker Compose (Postgres, MinIO, OpenFGA)。
2.  **后端核心**: 实现 Golang 后端，集成 GORM, S3 SDK, OpenFGA SDK。
3.  **插件引擎**: 实现 `.tgz` 解析、元数据提取、版本管理逻辑。
4.  **前端基础**: 搭建 Next.js + BetterAuth + Shadcn UI。
5.  **业务联调**: 实现插件列表、详情、上传、配置页面。
6.  **高级特性**: 实现混合云代理、审计日志、安全扫描。

