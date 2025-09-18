# Vercel 后端部署指南

## ⚠️ 重要提示

Vercel 更适合部署**无状态的 Serverless 函数**，对于需要数据库的后端有以下限制：

1. **不支持 SQLite** - 需要使用云数据库
2. **文件存储受限** - 上传的文件不能持久保存
3. **函数执行时间限制** - 免费版最多 10 秒

## 推荐方案

### 方案 A：前端在 Vercel，后端在其他平台（推荐）

**后端部署选择：**
- **Railway** (https://railway.app) - 支持 Node.js + SQLite，有免费额度
- **Render** (https://render.com) - 支持 Docker，有免费套餐
- **Fly.io** (https://fly.io) - 支持持久化存储
- **阿里云/腾讯云** - 国内访问速度快

### 方案 B：全栈都在 Vercel（需要改造）

需要进行以下改造：

1. **数据库迁移**
   - 从 SQLite 迁移到 PostgreSQL (Vercel Postgres)
   - 或使用 Supabase / PlanetScale

2. **文件存储**
   - 使用对象存储服务（如 AWS S3、阿里云 OSS）

## 如果坚持部署后端到 Vercel

### 1. 部署步骤

```bash
cd backend-api

# 部署到 Vercel
npx vercel --prod
```

### 2. 配置环境变量

在 Vercel Dashboard 中添加：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | 云数据库连接字符串 |
| `JWT_SECRET` | JWT 密钥 |
| `WECHAT_MCHID` | 微信商户号（可选） |
| `ALIPAY_APP_ID` | 支付宝应用ID（可选） |
| `EMAIL_USER` | 邮箱账号（可选） |
| `BREVO_API_KEY` | Brevo API密钥（可选） |

### 3. 数据库选择

**免费选项：**
- **Vercel Postgres** - Vercel 官方提供，免费额度有限
- **Supabase** - 开源 PostgreSQL，免费额度较大
- **PlanetScale** - MySQL 兼容，免费额度充足
- **Neon** - PostgreSQL，免费额度不错

### 4. 修改数据库连接

需要修改 `backend-api/src/db/database.js` 支持 PostgreSQL：

```javascript
// 使用 PostgreSQL 而不是 SQLite
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

## 更简单的方案：使用 Railway 部署后端

Railway 支持 SQLite，无需修改代码：

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 在 backend-api 目录部署
cd backend-api
railway up
```

Railway 会自动：
- 检测 Node.js 应用
- 安装依赖
- 运行你的应用
- 提供 HTTPS 域名

## 总结

- **前端：** 继续部署在 Vercel ✅
- **后端：** 建议部署到 Railway 或 Render（支持 SQLite）
- **原因：** Vercel 不适合有状态的传统后端应用

需要我帮你部署到 Railway 吗？或者你想尝试将后端改造为完全 Serverless？