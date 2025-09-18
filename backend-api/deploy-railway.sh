#!/bin/bash

# Railway 部署脚本
# 使用前请确保已安装 Railway CLI 并登录

echo "🚂 开始 Railway 部署..."

# 检查是否安装了 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安装"
    echo "请访问 https://docs.railway.app/develop/cli 安装"
    exit 1
fi

# 检查是否登录
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 请先登录 Railway"
    railway login
fi

# 选择部署方式
echo "请选择部署方式："
echo "1) 创建新项目"
echo "2) 部署到现有项目"
read -p "请输入选项 (1 或 2): " choice

case $choice in
    1)
        echo "📦 创建新的 Railway 项目..."
        railway init
        
        echo "🗄️ 添加 MySQL 数据库..."
        railway add mysql
        
        echo "🔧 配置环境变量..."
        echo "请在 Railway 仪表板中配置环境变量"
        echo "参考 .env.railway.example 文件"
        read -p "配置完成后按 Enter 继续..."
        ;;
    2)
        echo "🔗 连接到现有项目..."
        railway link
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

# 部署代码
echo "🚀 开始部署代码..."
railway up

# 检查部署状态
if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    
    # 获取部署 URL
    echo "🌐 获取部署 URL..."
    railway domain
    
    # 查看日志
    echo "📋 查看最近日志..."
    railway logs --lines 20
    
    echo ""
    echo "==================================="
    echo "🎉 Railway 部署完成！"
    echo "==================================="
    echo ""
    echo "下一步操作："
    echo "1. 在 Railway 仪表板配置环境变量"
    echo "2. 初始化数据库: railway run npm run db:init"
    echo "3. 配置自定义域名（可选）"
    echo "4. 查看实时日志: railway logs -f"
    echo ""
    echo "有用的命令："
    echo "- 查看项目状态: railway status"
    echo "- 查看环境变量: railway variables"
    echo "- 连接数据库: railway connect mysql"
    echo "- 重新部署: railway up"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi