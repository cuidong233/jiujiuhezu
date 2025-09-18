#!/bin/bash

echo "================================"
echo "Vercel 部署脚本"
echo "================================"

# 检查是否安装了 Vercel CLI
if ! npx vercel --version &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 已安装"

# 切换到前端目录
cd nuxt-frontend

echo ""
echo "开始部署到 Vercel..."
echo ""
echo "请按照提示操作："
echo "1. 登录你的 Vercel 账号"
echo "2. 选择部署范围 (推荐选择你的个人账号)"
echo "3. 链接到现有项目或创建新项目"
echo "4. 使用默认设置即可"
echo ""

# 执行部署
vercel --prod

echo ""
echo "================================"
echo "部署完成！"
echo "================================"
echo ""
echo "下一步："
echo "1. 访问 https://vercel.com/dashboard 查看部署状态"
echo "2. 在项目设置中配置环境变量："
echo "   - NUXT_PUBLIC_API_BASE: 你的后端API地址"
echo "   - NUXT_PUBLIC_SITE_URL: 你的前端网站地址"
echo "   - API_SECRET: API密钥"
echo "3. 配置自定义域名（可选）"
echo ""