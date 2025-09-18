# 快速部署方案

## 最简单方案：使用 PlanetScale MySQL + Vercel

### 1. 注册 PlanetScale（免费 MySQL）
1. 访问 https://planetscale.com
2. 注册账号
3. 创建数据库（选择免费计划）
4. 获取连接字符串

### 2. 部署后端到 Vercel
```bash
cd backend-api

# 部署
npx vercel

# 设置环境变量（使用 PlanetScale 提供的信息）
npx vercel env add DB_HOST production
# 输入: aws.connect.psdb.cloud

npx vercel env add DB_USER production  
# 输入: 你的用户名

npx vercel env add DB_PASSWORD production
# 输入: 你的密码

npx vercel env add DB_NAME production
# 输入: 你的数据库名

npx vercel env add JWT_SECRET production
# 输入: jiujiu-admin-secret-key-2024

# 重新部署
npx vercel --prod
```

### 3. 更新前端 API 地址
```bash
cd ../nuxt-frontend

npx vercel env add NUXT_PUBLIC_API_BASE production
# 输入: https://你的后端.vercel.app

# 重新部署前端
npx vercel --prod
```

## 完成！

前端和后端都部署在 Vercel 了！