# Contributing to Next Market

首先，感谢您对 Next Market 项目的关注！我们欢迎所有形式的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [测试要求](#测试要求)
- [报告问题](#报告问题)
- [功能请求](#功能请求)

## 🤝 行为准则

参与本项目时，请遵守以下行为准则：

- **尊重他人**：保持友好和专业的态度
- **包容性**：欢迎不同背景和经验水平的贡献者
- **建设性反馈**：提供有建设性的批评和建议
- **协作精神**：与团队成员积极协作

## 🚀 如何贡献

您可以通过以下方式贡献：

1. **报告 Bug**：在 GitHub Issues 中报告问题
2. **提出功能建议**：分享您的想法和改进建议
3. **提交代码**：修复 Bug 或实现新功能
4. **改进文档**：完善项目文档和注释
5. **代码审查**：审查其他人的 Pull Request

## 🛠️ 开发环境设置

### 前置要求

- **Go**: 1.21 或更高版本
- **Node.js**: 18 或更高版本
- **Docker & Docker Compose**: 最新版本
- **Git**: 用于版本控制

### 1. Fork 和克隆仓库

```bash
# Fork 项目到您的 GitHub 账户
# 然后克隆您的 fork
git clone https://github.com/YOUR_USERNAME/next-market.git
cd next-market

# 添加上游仓库
git remote add upstream https://github.com/cvtestorg/next-market.git
```

### 2. 启动基础设施服务

```bash
cd docker
docker compose up -d
```

这将启动以下服务：

- PostgreSQL (端口 5432)
- MinIO (端口 9000, 9001)
- OpenFGA (端口 8080)

### 3. 配置后端环境

```bash
# 在项目根目录

# 配置环境变量（通过环境变量或 .env 文件）
# 所有配置通过环境变量设置，例如：
# export SERVER_PORT=8000
# export DB_HOST=localhost
# export DB_PORT=5432
# export DB_USER=nextmarket
# export DB_PASSWORD=nextmarket_dev_password
# export DB_NAME=nextmarket
# export S3_ENDPOINT=localhost:9000
# export S3_ACCESS_KEY=minioadmin
# export S3_SECRET_KEY=minioadmin

# 下载依赖
go mod download

# 运行数据库迁移（如果需要）
# go run cmd/server/main.go migrate

# 启动后端服务器
go run cmd/server/main.go server start
```

后端将在 `http://localhost:8000` 启动

### 4. 配置前端环境

```bash
cd ui

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev
```

前端将在 `http://localhost:3001` 启动

### 5. 验证安装

访问以下端点验证服务是否正常运行：

- 前端：http://localhost:3001
- 后端健康检查：http://localhost:8000/health
- MinIO 控制台：http://localhost:9001

## 📁 项目结构

```
next-market/
├── cmd/                      # 应用入口点
│   ├── server/               # 服务器入口
│   │   └── main.go           # 主程序入口
│   ├── server.go             # Server 命令实现
│   ├── migrate.go            # Migrate 命令实现
│   └── root.go               # 根命令定义
├── internal/                 # 内部包（不对外暴露）
│   ├── config/               # 配置管理
│   ├── handlers/             # HTTP 处理器
│   ├── models/               # 数据模型
│   └── services/             # 业务逻辑
├── pkg/                      # 公共包（可被外部使用）
│   ├── parser/               # NPM 包解析器
│   └── storage/              # 存储抽象层（S3）
├── ui/                       # Next.js 前端应用
│   ├── app/                  # Next.js App Router
│   │   ├── plugins/          # 插件相关页面
│   │   ├── upload/           # 上传页面
│   │   └── lib/              # 工具函数
│   └── components/           # React 组件
│       └── ui/               # shadcn/ui 组件
├── docker/                   # Docker Compose 配置
├── examples/                 # 示例插件
│   ├── personal-plugin/      # 个人插件示例
│   └── enterprise-plugin/    # 企业插件示例
├── go.mod                    # Go 模块定义
├── go.sum                    # Go 依赖锁定文件
├── Makefile                  # 构建脚本
└── README.md                 # 项目说明
```

## 📝 代码规范

### Go 代码规范

- 遵循 [Effective Go](https://go.dev/doc/effective_go) 和 [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- 使用 `gofmt` 格式化代码
- 运行 `go vet` 和 `golangci-lint` 检查代码
- 使用有意义的变量和函数名
- 添加必要的注释，特别是公共 API

```bash
# 格式化代码
go fmt ./...

# 检查代码
go vet ./...

# 运行 linter（如果配置了）
golangci-lint run
```

### TypeScript/React 代码规范

- 遵循 [Next.js 最佳实践](https://nextjs.org/docs)
- 使用 TypeScript 严格模式
- 使用 ESLint 和 Prettier 格式化代码
- 组件使用函数式组件和 Hooks
- 使用 Tailwind CSS 进行样式设计

```bash
# 检查代码
npm run lint
# 或
pnpm lint

# 自动修复
npm run lint -- --fix
```

### 命名约定

- **Go**: 使用驼峰命名（camelCase）或帕斯卡命名（PascalCase）
- **TypeScript**: 使用驼峰命名（camelCase）或帕斯卡命名（PascalCase）
- **文件**: 使用小写字母和下划线（snake_case）或连字符（kebab-case）
- **数据库**: 使用蛇形命名（snake_case）

### 注释规范

- **Go**: 公共函数和类型必须有注释
- **TypeScript**: 复杂逻辑需要注释说明
- 使用清晰、简洁的语言
- 注释应该解释"为什么"而不是"是什么"

## 📤 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型（Type）

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI 配置变更

### 示例

```bash
# 新功能
git commit -m "feat(backend): add plugin deletion API"

# Bug 修复
git commit -m "fix(frontend): fix config form validation"

# 文档更新
git commit -m "docs: update contributing guide"

# 重构
git commit -m "refactor(parser): improve npm package parsing"
```

## 🔀 Pull Request 流程

### 1. 创建分支

```bash
# 从 main 分支创建新分支
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/bug-description
```

### 2. 进行更改

- 编写清晰的代码
- 添加必要的测试
- 更新相关文档
- 确保代码通过所有检查

### 3. 提交更改

```bash
# 添加更改的文件
git add .

# 提交（遵循提交规范）
git commit -m "feat: add new feature"

# 推送到您的 fork
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写 PR 模板中的所有信息
3. 添加相关标签（如 `enhancement`, `bug`, `documentation`）
4. 等待代码审查

### 5. 代码审查

- 积极回应审查意见
- 及时修复问题
- 保持 PR 的更新（通过 rebase 或 merge）

### PR 检查清单

在提交 PR 之前，请确保：

- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息遵循规范
- [ ] PR 描述清晰完整
- [ ] 没有合并冲突
- [ ] 代码已通过 lint 检查

## 🧪 测试要求

### 后端测试

```bash
# 在项目根目录

# 运行所有测试
go test ./...

# 运行特定包的测试
go test ./internal/services/...

# 运行测试并查看覆盖率
go test -cover ./...
```

### 前端测试

```bash
cd ui

# 运行测试（如果配置了）
npm test

# 类型检查
npm run type-check
```

### 集成测试

- 测试完整的用户流程
- 验证 API 端点
- 测试前后端集成

## 🐛 报告问题

### Bug 报告模板

在创建 Issue 时，请包含以下信息：

```markdown
**描述**
清晰描述问题

**复现步骤**

1. 执行 '...'
2. 点击 '....'
3. 看到错误

**预期行为**
描述您期望的行为

**实际行为**
描述实际发生的行为

**环境信息**

- OS: [e.g. macOS 14.0]
- Go Version: [e.g. 1.21.0]
- Node Version: [e.g. 18.17.0]
- Docker Version: [e.g. 24.0.0]

**附加信息**
截图、日志、错误堆栈等
```

### 安全漏洞

如果您发现安全漏洞，请**不要**在公开 Issue 中报告。请通过以下方式联系维护者：

- 发送邮件到项目维护者
- 或创建私有安全咨询

## 💡 功能请求

### 功能请求模板

```markdown
**功能描述**
清晰描述您想要的功能

**使用场景**
描述这个功能的使用场景

**可能的实现方案**
如果有想法，描述可能的实现方式

**替代方案**
描述您考虑过的替代方案
```

## 📚 文档贡献

文档改进同样重要！您可以：

- 修复拼写错误
- 改进文档结构
- 添加代码示例
- 翻译文档
- 添加教程和指南

## 🎯 开发优先级

当前开发重点：

1. **核心功能稳定性**：确保现有功能稳定可靠
2. **测试覆盖率**：提高测试覆盖率
3. **性能优化**：优化查询和响应时间
4. **用户体验**：改进 UI/UX
5. **文档完善**：补充和完善文档

## ❓ 获取帮助

如果您在贡献过程中遇到问题：

1. 查看 [README.md](./README.md) 和现有文档
2. 搜索已有的 Issues 和 PR
3. 在 Issues 中提问（使用 `question` 标签）
4. 联系项目维护者

## 🙏 致谢

感谢所有贡献者的努力！您的贡献使 Next Market 变得更好。

---

**再次感谢您的贡献！** 🎉
