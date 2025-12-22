#!/bin/bash

# 打包脚本 - 用于创建企业级插件 NPM 包
# 使用方法: ./pack.sh

echo "📦 开始打包 enterprise-analytics-plugin..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到 package.json，请确保在插件目录中运行此脚本"
    exit 1
fi

# 检查插件类型（只匹配顶层的 type 字段，排除 nextMarketConfig 中的 type）
# 优先使用 jq（如果可用），否则使用 grep + sed 提取第一个匹配的 type 字段
if command -v jq >/dev/null 2>&1; then
    # 如果系统有 jq，使用 jq 提取（最可靠）
    PLUGIN_TYPE=$(jq -r '.type // "free"' package.json)
else
    # 使用 grep 只匹配第一个出现的 "type":（应该是顶层的），然后用 sed 提取值
    PLUGIN_TYPE=$(grep -m 1 '"type":' package.json | sed -E 's/^[^"]*"type"[^"]*"([^"]+)".*/\1/')
fi

if [ "$PLUGIN_TYPE" != "enterprise" ]; then
    echo "⚠️  警告: 插件类型不是 'enterprise'，当前类型: ${PLUGIN_TYPE:-未找到}"
fi

# 运行 npm pack
npm pack

if [ $? -eq 0 ]; then
    echo "✅ 打包成功！"
    echo ""
    echo "📤 上传方式："
    echo "1. Web UI: http://localhost:3001/upload"
    echo "2. API: curl -X POST http://localhost:8000/api/v1/plugins/upload -F \"file=@enterprise-analytics-plugin-1.0.0.tgz\""
    echo ""
    echo "💡 提示: 企业级插件需要："
    echo "   - 有效的企业许可证"
    echo "   - 后端组件安装（参考 backendInstallDoc）"
    echo "   - 在后台配置插件参数（nextMarketConfig）"
else
    echo "❌ 打包失败"
    exit 1
fi

