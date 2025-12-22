#!/bin/bash

# 打包脚本 - 用于创建 NPM 包
# 使用方法: ./pack.sh

echo "📦 开始打包 personal-plugin..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 未找到 package.json，请确保在插件目录中运行此脚本"
    exit 1
fi

# 运行 npm pack
npm pack

if [ $? -eq 0 ]; then
    echo "✅ 打包成功！"
    echo ""
echo "📤 上传方式："
echo "1. Web UI: http://localhost:3001/upload"
echo "2. API: curl -X POST http://localhost:8000/api/v1/plugins/upload -F \"file=@personal-plugin-1.0.0.tgz\""
else
    echo "❌ 打包失败"
    exit 1
fi

