#!/bin/bash
# 修复 codebuddy 全局安装时的 ENOTEMPTY 错误
# 原因：npm 安装中断后残留的临时目录导致重命名失败

set -e

# 获取当前 node 版本的全局模块路径
NODE_MODULES_PATH="$(npm root -g)"
TENCENT_AI_PATH="$NODE_MODULES_PATH/@tencent-ai"

echo "🔍 检查目录: $TENCENT_AI_PATH"

if [ ! -d "$TENCENT_AI_PATH" ]; then
    echo "✅ @tencent-ai 目录不存在，无需清理"
    exit 0
fi

# 查找并删除残留的临时目录（以 . 开头的隐藏目录）
TEMP_DIRS=$(find "$TENCENT_AI_PATH" -maxdepth 1 -type d -name ".*" ! -name "." ! -name ".." 2>/dev/null || true)

if [ -z "$TEMP_DIRS" ]; then
    echo "✅ 未发现残留的临时目录"
else
    echo "🗑️  发现以下残留临时目录："
    echo "$TEMP_DIRS"
    echo ""
    read -p "是否删除这些目录？[y/N] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$TEMP_DIRS" | xargs rm -rf
        echo "✅ 清理完成"
    else
        echo "⏭️  跳过清理"
        exit 0
    fi
fi

# 询问是否重新安装
echo ""
read -p "是否重新安装 @tencent-ai/codebuddy-code？[y/N] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 正在安装..."
    npm install -g @tencent-ai/codebuddy-code --force
    echo "✅ 安装完成"
else
    echo "⏭️  跳过安装"
fi
