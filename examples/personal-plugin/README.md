# Personal Plugin

个人插件，提供个性化的功能和配置选项。

## 功能特性

- ✅ 个性化配置
- ✅ 灵活的配置选项
- ✅ 简单易用

## 安装

```bash
npm install personal-plugin
```

## 使用方法

```javascript
const PersonalPlugin = require('personal-plugin');

const plugin = new PersonalPlugin({
  apiKey: 'your-api-key',
  enableFeature: true,
  maxRequests: 2000
});

plugin.init();
```

## 配置说明

### apiKey (必需)
用于访问插件功能的 API 密钥。

### enableFeature (可选)
是否启用高级功能，默认为 `false`。

### maxRequests (可选)
每小时允许的最大请求数，默认为 `1000`。

## 许可证

MIT

## 作者

Next Market Team

