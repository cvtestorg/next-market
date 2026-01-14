# Tauri 桌面端适配设计

## 文档版本
- 版本：1.0
- 更新日期：2026-01-12

---

## 1. 概述

本文档分析将插件市场打包为 Tauri 桌面应用时的架构影响和适配方案。

---

## 2. Tauri 打包模式

### 2.1 两种打包模式对比

| 模式 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| 静态导出 | Next.js 构建为纯静态文件 | 打包简单、体积小 | 无法使用 SSR、Server Actions |
| 本地服务器 | Tauri 内嵌运行 Next.js 服务 | 功能完整 | 复杂、体积大、启动慢 |

### 2.2 推荐方案

**推荐使用"静态导出 + 独立后端"模式**

```
┌─────────────────────────────────────────────────────────────────┐
│                       Tauri 桌面应用                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              WebView (静态 HTML/JS/CSS)                     ││
│  │                                                             ││
│  │  • Next.js 静态导出的前端代码                               ││
│  │  • 使用客户端数据获取                                       ││
│  │  • 使用 Token-based 认证                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              │ HTTP 请求                        │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Tauri Rust Core (可选)                         ││
│  │                                                             ││
│  │  • 可作为代理转发请求                                       ││
│  │  • 可处理本地文件操作                                       ││
│  │  • 可存储本地配置/Token                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
└──────────────────────────────│──────────────────────────────────┘
                               │
                               │ HTTP 请求
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       远程后端服务                               │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Go API 服务    │    │   PostgreSQL    │                    │
│  │   (端口 8000)    │    │     数据库      │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 当前设计的兼容性问题

### 3.1 问题清单

| 问题 | 当前设计 | Tauri 影响 | 严重程度 |
|------|----------|-----------|----------|
| Server Components | 大量使用 | 静态导出不支持 | 🔴 高 |
| Server Actions | 所有数据操作使用 | 静态导出不支持 | 🔴 高 |
| API Routes | 认证使用 /api/auth/* | 静态导出不支持 | 🔴 高 |
| Cookie 认证 | Better Auth Cookie | 跨域/桌面端问题 | 🟡 中 |
| headers() 调用 | 服务端获取请求头 | 客户端不可用 | 🔴 高 |
| revalidatePath | 数据更新后刷新缓存 | 静态导出不支持 | 🟡 中 |

### 3.2 受影响的设计文档

| 文档 | 主要问题 |
|------|----------|
| 01-认证与鉴权 | Server Component 验证、Cookie 认证、API Routes |
| 02-插件市场首页 | Server Component 数据获取 |
| 03-插件详情 | Server Component 数据获取 |
| 04-插件操作 | Server Actions |
| 05-插件搜索筛选 | URL 状态同步依赖服务端 |
| 06-插件配置 | Server Actions 保存配置 |
| 07-我的插件 | Server Component 数据获取 |
| 08-权限申请 | Server Actions |
| 09-收费插件与购买 | Server Actions |
| 10-开发者中心 | Server Actions |
| 11-企业管理 | Server Actions |

---

## 4. 架构适配方案

### 4.1 双模式架构设计

**设计一套代码，支持两种运行模式**：

| 模式 | 使用场景 | 数据获取 | 认证方式 |
|------|----------|----------|----------|
| Web 模式 | 浏览器访问 | Server Components | Cookie/Session |
| Desktop 模式 | Tauri 桌面应用 | 客户端 Hooks | Token-based |

### 4.2 组件分层设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        页面组件层                                │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │   Web Page          │    │   Desktop Page      │           │
│  │   (Server Component)│    │   (Client Component)│           │
│  └──────────┬──────────┘    └──────────┬──────────┘           │
│             │                          │                       │
│             └────────────┬─────────────┘                       │
│                          │                                     │
│                          ▼                                     │
│             ┌─────────────────────────┐                       │
│             │      展示组件层          │                       │
│             │   (纯 UI，无数据获取)    │                       │
│             └─────────────────────────┘                       │
│                          │                                     │
│             ┌────────────┴────────────┐                       │
│             │                         │                       │
│             ▼                         ▼                       │
│  ┌─────────────────────┐   ┌─────────────────────┐           │
│  │   Server Actions    │   │   API Client Hooks  │           │
│  │   (Web 模式)        │   │   (Desktop 模式)    │           │
│  └─────────────────────┘   └─────────────────────┘           │
│             │                         │                       │
│             └────────────┬────────────┘                       │
│                          │                                     │
│                          ▼                                     │
│             ┌─────────────────────────┐                       │
│             │      Go Backend API     │                       │
│             └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 认证适配设计

### 5.1 Web 模式认证（保持现有设计）

```
用户登录
    │
    ▼
调用 Better Auth signIn
    │
    ▼
服务端设置 httpOnly Cookie
    │
    ▼
后续请求自动携带 Cookie
    │
    ▼
Server Component 通过 headers() 验证
```

### 5.2 Desktop 模式认证

```
用户登录
    │
    ▼
调用后端登录 API
    │
    ▼
后端返回 Access Token + Refresh Token
    │
    ▼
Token 存储到 Tauri 安全存储 / localStorage
    │
    ▼
后续请求在 Header 中携带 Authorization: Bearer {token}
    │
    ▼
客户端 Hook 管理 Token 状态
```

### 5.3 认证抽象层设计

**创建统一的认证接口**：

| 方法 | Web 实现 | Desktop 实现 |
|------|----------|--------------|
| getSession() | auth.api.getSession({ headers }) | 从本地存储获取 Token 并验证 |
| signIn(credentials) | authClient.signIn.email() | 调用 /api/auth/login API |
| signOut() | authClient.signOut() | 清除本地 Token |
| isAuthenticated() | 检查 Session | 检查 Token 有效性 |

**运行模式检测**：

```
是否在 Tauri 环境中运行？
    │
    ├── 是（window.__TAURI__ 存在）────→ 使用 Desktop 认证实现
    │
    └── 否 ────→ 使用 Web 认证实现
```

---

## 6. 数据获取适配设计

### 6.1 数据获取抽象

**统一数据获取接口**：

| 操作 | Web 实现 | Desktop 实现 |
|------|----------|--------------|
| 获取插件列表 | Server Component 直接查询 | useSWR / React Query |
| 获取插件详情 | Server Component 直接查询 | useSWR / React Query |
| 安装插件 | Server Action | API Client + mutate |
| 保存配置 | Server Action | API Client + mutate |

### 6.2 Desktop 模式数据流

```
页面组件挂载
    │
    ▼
调用数据获取 Hook
（如 usePlugins、usePluginDetail）
    │
    ▼
Hook 内部：
  1. 从本地存储获取 Token
  2. 构建请求 Header
  3. 调用后端 API
  4. 缓存响应数据
    │
    ▼
返回 { data, isLoading, error, mutate }
    │
    ▼
渲染 UI
```

### 6.3 数据操作流程（Desktop 模式）

```
用户执行操作（如安装插件）
    │
    ▼
显示加载状态
    │
    ▼
调用操作 Hook
（如 useInstallPlugin）
    │
    ▼
Hook 内部：
  1. 发送 POST 请求到后端 API
  2. 等待响应
    │
    ├── 成功
    │       │
    │       ▼
    │   调用 mutate 更新相关缓存
    │   显示成功提示
    │
    └── 失败
            │
            ▼
        显示错误提示
```

---

## 7. Next.js 配置适配

### 7.1 条件导出配置

**next.config.js 修改**：

| 配置项 | Web 模式 | Desktop 模式 |
|--------|----------|--------------|
| output | 默认（undefined） | 'export' |
| trailingSlash | false | true |
| images.unoptimized | false | true |
| rewrites | 启用 | 不支持 |

### 7.2 构建命令

| 命令 | 用途 |
|------|------|
| `npm run build` | Web 模式构建 |
| `npm run build:desktop` | Desktop 模式构建（静态导出）|
| `npm run tauri build` | Tauri 打包 |

---

## 8. API 端点设计

### 8.1 认证相关 API

由于 Desktop 模式不能使用 Better Auth 的 API Routes，需要在 Go 后端实现认证 API：

| 端点 | 方法 | 说明 |
|------|------|------|
| /api/auth/login | POST | 登录，返回 Token |
| /api/auth/logout | POST | 登出，使 Token 失效 |
| /api/auth/refresh | POST | 刷新 Token |
| /api/auth/me | GET | 获取当前用户信息 |

### 8.2 Token 格式

| 字段 | 说明 |
|------|------|
| accessToken | 访问令牌，短有效期（如 1 小时）|
| refreshToken | 刷新令牌，长有效期（如 7 天）|
| expiresIn | 访问令牌过期时间（秒）|
| tokenType | "Bearer" |

---

## 9. 本地存储设计

### 9.1 Tauri 安全存储

使用 Tauri 的安全存储 API 存储敏感数据：

| 数据 | 存储位置 | 说明 |
|------|----------|------|
| Access Token | Tauri Store | 加密存储 |
| Refresh Token | Tauri Store | 加密存储 |
| 用户信息缓存 | Tauri Store | 可选 |

### 9.2 降级方案

如果 Tauri API 不可用（如开发环境），降级到 localStorage：

```
尝试使用 Tauri Store
    │
    ├── 成功 ────→ 使用 Tauri Store
    │
    └── 失败（Tauri API 不可用）────→ 降级到 localStorage
```

---

## 10. 开发与调试

### 10.1 开发模式

| 场景 | 命令 | 说明 |
|------|------|------|
| Web 开发 | `npm run dev` | 正常 Next.js 开发 |
| Desktop 开发 | `npm run tauri dev` | Tauri 开发模式 |
| Desktop 预览 | `npm run preview:desktop` | 预览静态导出效果 |

### 10.2 环境变量

| 变量 | Web 模式 | Desktop 模式 |
|------|----------|--------------|
| NEXT_PUBLIC_APP_MODE | "web" | "desktop" |
| NEXT_PUBLIC_API_URL | "" (使用 rewrites) | "https://api.example.com" |

---

## 11. 设计建议总结

### 11.1 短期建议（保持现有设计）

如果当前不需要 Tauri 打包：
- 保持现有 Server Components + Server Actions 设计
- 待需要 Desktop 版本时再进行适配

### 11.2 长期建议（双模式兼容设计）

如果计划支持 Desktop 版本：

| 优先级 | 改动 |
|--------|------|
| P0 | 将展示组件与数据获取逻辑分离 |
| P0 | Go 后端实现完整的认证 API |
| P1 | 创建数据获取抽象层（支持 SSR 和客户端 Hook）|
| P1 | 创建认证抽象层（支持 Cookie 和 Token）|
| P2 | 添加 Desktop 模式构建配置 |
| P2 | 实现 Tauri 本地存储集成 |

### 11.3 架构设计修改建议

| 文档 | 建议 |
|------|------|
| 00-架构总览 | 增加"双模式架构"章节 |
| 01-认证与鉴权 | 增加"Token 认证"备选方案 |
| 其他文档 | 数据获取部分增加"客户端获取"备选方案 |

---

## 12. 兼容性检查清单

在进行 Tauri 打包前，确保：

| 检查项 | 说明 |
|--------|------|
| ☐ | 所有展示组件为纯 Client Components |
| ☐ | 数据获取有客户端 Hook 备选方案 |
| ☐ | 认证支持 Token 模式 |
| ☐ | API URL 可配置（不依赖 rewrites）|
| ☐ | 无 Node.js 特定 API 调用（如 fs、path）|
| ☐ | 图片使用 unoptimized 配置 |
| ☐ | 动态路由有 generateStaticParams |
