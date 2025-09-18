# 🔥 Render 部署指南（超简单！）

## 第一步：注册 Render 账号

1. 打开 https://render.com
2. 点击 "Get Started for Free"
3. **用 GitHub 账号登录**（最快）

## 第二步：部署后端

### 方法 A：通过网页部署（推荐）

1. 登录 Render 后，点击 **"New +"** → **"Web Service"**

2. 连接 GitHub：
   - 选择 "Connect a GitHub repository"
   - 授权 Render 访问你的 GitHub
   - 选择你的项目仓库

3. 配置服务：
   - **Name**: `jiujiu-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**

4. 添加环境变量：
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `jiujiu-admin-secret-key-2024`
   - `PORT` = `3002`

5. 点击 **"Create Web Service"**

### 方法 B：命令行部署

```bash
# 如果你的代码还没上传到 GitHub
cd backend-api
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/jiujiu-backend.git
git push -u origin main
```

然后回到 Render 网页操作。

## 第三步：等待部署完成

- 部署需要 3-5 分钟
- 完成后会得到一个 URL：`https://jiujiu-backend.onrender.com`

## 第四步：更新前端 API 地址

```bash
cd nuxt-frontend

# 设置后端 API 地址
npx vercel env add NUXT_PUBLIC_API_BASE production
# 输入: https://jiujiu-backend.onrender.com

# 重新部署前端
npx vercel --prod --yes
```

## 🎉 完成！

你的应用现在：
- **前端**: https://nuxt-frontend.vercel.app
- **后端**: https://jiujiu-backend.onrender.com

## 注意事项

1. **免费套餐限制**：
   - 15分钟无访问会休眠（首次访问需要等待 30 秒启动）
   - 每月 750 小时运行时间
   - 适合个人项目和测试

2. **数据持久化**：
   - Render 免费套餐支持 SQLite
   - 数据会保存在磁盘上
   - 重新部署不会丢失数据

3. **如果需要唤醒服务**：
   - 可以设置定时任务每 10 分钟访问一次
   - 或者使用 UptimeRobot 免费监控服务

## 故障排除

如果部署失败：
1. 检查 `package.json` 是否存在
2. 确保 `server.js` 在根目录
3. 查看 Render 的部署日志

需要帮助？告诉我错误信息！