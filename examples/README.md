# 示例插件

这个目录包含了用于测试 Next Market 平台的示例插件。

## example-plugin (personal-plugin)

一个完整的个人插件示例，展示了如何创建一个符合 Next Market 规范的 NPM 包。

### 使用方法

1. 进入插件目录：
```bash
cd example-plugin
```

2. 打包插件：
```bash
npm pack
# 或使用脚本
./pack.sh
```

这会在当前目录生成 `personal-plugin-1.0.0.tgz` 文件。

3. 上传到 Next Market：

**方式一：通过 Web UI**
- 访问 http://localhost:3001/upload
- 选择生成的 `.tgz` 文件并上传

**方式二：通过 API**
```bash
curl -X POST http://localhost:8000/api/v1/plugins/upload \
  -F "file=@personal-plugin-1.0.0.tgz"
```

### 插件特性

- ✅ 完整的 package.json 配置
- ✅ README.md 文档
- ✅ 图标文件（assets/logo.svg）
- ✅ 配置项定义（nextMarketConfig）
- ✅ 示例代码文件

### 文件结构

```
example-plugin/
├── package.json          # 插件元数据和配置
├── README.md            # 插件文档
├── index.js             # 插件主文件
├── pack.sh             # 打包脚本
├── .npmignore          # NPM 打包忽略文件
└── assets/
    └── logo.svg        # 插件图标
```

### 注意事项

- 确保 `package.json` 中包含 `type` 字段（"free" 或 "enterprise"）
- `icon` 字段指向的图标文件必须存在
- `nextMarketConfig` 定义了插件的配置项，会在上传时被解析
- 使用 `npm pack` 打包时，`.npmignore` 中列出的文件不会被包含

---

## enterprise-plugin (enterprise-analytics-plugin)

一个完整的企业级插件示例，展示了如何创建包含复杂配置和后端安装文档的企业插件。

### 使用方法

1. 进入插件目录：
```bash
cd enterprise-plugin
```

2. 打包插件：
```bash
npm pack
# 或使用脚本
./pack.sh
```

这会在当前目录生成 `enterprise-analytics-plugin-1.0.0.tgz` 文件。

3. 上传到 Next Market：

**方式一：通过 Web UI**
- 访问 http://localhost:3001/upload
- 选择生成的 `.tgz` 文件并上传

**方式二：通过 API**
```bash
curl -X POST http://localhost:8000/api/v1/plugins/upload \
  -F "file=@enterprise-analytics-plugin-1.0.0.tgz"
```

### 企业级插件特性

- ✅ **企业类型标识** - `"type": "enterprise"` 在 package.json 中
- ✅ **后端安装文档** - `backendInstallDoc` 字段包含详细的安装指南
- ✅ **复杂配置项** - `nextMarketConfig` 包含嵌套对象、数组、验证规则等
- ✅ **必需字段验证** - 定义了必需配置项（apiKey, organizationId, databaseUrl）
- ✅ **多级配置结构** - 包含报表调度、安全设置、性能设置等子配置
- ✅ **完整的 README** - 详细的使用文档和 API 说明
- ✅ **企业级图标** - 专业的企业风格图标

### 配置项说明

企业级插件的 `nextMarketConfig` 包含以下主要配置：

1. **基础配置**（必需）
   - `apiKey`: API 密钥
   - `organizationId`: 组织 ID
   - `databaseUrl`: 数据库连接 URL

2. **功能配置**（可选）
   - `enableRealTimeMonitoring`: 启用实时监控
   - `enableAdvancedReporting`: 启用高级报表
   - `dataRetentionDays`: 数据保留天数
   - `maxConcurrentQueries`: 最大并发查询数

3. **报表调度配置**（嵌套对象）
   - `enabled`: 是否启用自动报表
   - `frequency`: 报表频率（daily/weekly/monthly）
   - `recipients`: 接收人邮箱列表
   - `format`: 报表格式（pdf/excel/csv）

4. **安全设置**（嵌套对象）
   - `enableEncryption`: 启用数据加密
   - `allowedIPs`: IP 白名单
   - `sessionTimeout`: 会话超时时间

5. **性能设置**（嵌套对象）
   - `cacheEnabled`: 启用缓存
   - `cacheTTL`: 缓存过期时间
   - `queryTimeout`: 查询超时时间

### 后端安装文档

企业级插件包含 `backendInstallDoc` 字段，提供：
- 系统要求说明
- 数据库配置步骤（PostgreSQL/MySQL）
- 环境变量配置
- 安装和启动步骤
- 验证安装方法
- 安全配置建议
- 故障排查指南

### 文件结构

```
enterprise-plugin/
├── package.json          # 企业级插件元数据和配置
├── README.md            # 详细的使用文档
├── index.js             # 插件主文件（包含完整实现）
├── .npmignore          # NPM 打包忽略文件
├── pack.sh             # 打包脚本
└── assets/
    └── logo.svg        # 企业级插件图标
```

### 企业级插件注意事项

- **类型标识**: 必须设置 `"type": "enterprise"`
- **后端安装**: 企业插件通常需要后端组件，需提供 `backendInstallDoc`
- **配置复杂度**: 企业插件通常有更复杂的配置项，使用嵌套对象和数组
- **必需字段**: 明确定义必需配置项，确保用户正确配置
- **验证规则**: 使用 JSON Schema 验证规则（minLength, pattern, format 等）
- **许可证**: 企业插件通常使用专有许可证（PROPRIETARY）

### 后台配置插件

上传企业级插件后，在 Next Market 后台可以：

1. **查看配置项**: 系统会根据 `nextMarketConfig` 自动生成配置表单
2. **配置插件**: 管理员可以填写和保存插件配置
3. **查看安装指南**: 在插件详情页查看 `backendInstallDoc` 内容
4. **权限管理**: 企业插件支持基于 OpenFGA 的细粒度权限控制

### 与免费插件的区别

| 特性 | 免费插件 | 企业级插件 |
|------|---------|-----------|
| 类型标识 | `"type": "free"` | `"type": "enterprise"` |
| 后端安装文档 | 通常不需要 | 必需（backendInstallDoc） |
| 配置复杂度 | 简单配置项 | 复杂嵌套配置 |
| 权限控制 | 公开访问 | 需要购买和授权 |
| 许可证 | MIT/开源 | PROPRIETARY/专有 |
| 技术支持 | 社区支持 | 企业级技术支持 |

