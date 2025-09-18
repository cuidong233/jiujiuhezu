# Vercel 部署指南

## 前端部署 (Nuxt.js)

### 1. 准备工作

确保你已经：
- 注册了 Vercel 账号 (https://vercel.com)
- 安装了 Vercel CLI (可选): `npm i -g vercel`

### 2. 部署步骤

#### 方法 A: 通过 GitHub 自动部署（推荐）

1. 将代码推送到 GitHub
2. 登录 Vercel 控制台
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 选择 `nuxt-frontend` 目录作为根目录
6. Vercel 会自动检测到 Nuxt.js 框架

#### 方法 B: 通过 Vercel CLI 部署

```bash
cd nuxt-frontend
vercel
```

按照提示操作即可。

### 3. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NUXT_PUBLIC_API_BASE` | 后端 API 地址 | `https://api.yourdomain.com` |
| `NUXT_PUBLIC_SITE_URL` | 前端网站地址 | `https://your-app.vercel.app` |
| `API_SECRET` | API 密钥 | `your-secret-key` |
| `NODE_ENV` | 运行环境 | `production` |

### 4. 域名配置

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 5. 部署优化

#### 区域选择
项目已配置为部署到香港区域 (hkg1)，适合中国大陆用户访问。

#### 构建缓存
Vercel 会自动缓存 `node_modules`，加快后续部署速度。

## 后端 API 部署选项

### 选项 1: 使用 Vercel Functions (Serverless)

需要将 Express API 改造为 Vercel Functions。在 `nuxt-frontend` 目录下创建 `api` 文件夹，将后端路由改造为独立的函数。

### 选项 2: 部署到其他平台

推荐将后端部署到：
- **Railway** (https://railway.app) - 支持 Node.js，有免费套餐
- **Render** (https://render.com) - 支持 Docker，有免费套餐
- **AWS EC2** - 更适合生产环境
- **阿里云 ECS** - 国内访问速度快

## 常见问题

### 1. 构建失败
- 检查环境变量是否正确配置
- 确保 `package.json` 中的依赖版本正确

### 2. API 连接失败
- 检查 CORS 配置
- 确保 API 地址可以公网访问

### 3. 图片加载问题
- 静态资源应放在 `public` 目录
- 使用 Nuxt Image 模块优化图片加载

## 部署后检查清单

- [ ] 网站可以正常访问
- [ ] API 接口连接正常
- [ ] 图片和静态资源加载正常
- [ ] SEO 元标签正确
- [ ] SSL 证书正常工作

## 监控和分析

Vercel 提供以下功能：
- 实时日志查看
- 性能分析
- Web Analytics（需要开启）
- 错误追踪

访问 Vercel Dashboard 查看详细信息。