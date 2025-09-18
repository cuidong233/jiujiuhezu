# Render 后端部署指南 (使用 Aiven MySQL)

## 部署准备

你的 Aiven MySQL 数据库信息已配置完成：
- **Host:** mysql-33d17299-cuidong111-28e9.e.aivencloud.com
- **Port:** 16966
- **Database:** defaultdb
- **User:** avnadmin
- **Password:** AVNS_SIHyKQvzVeOMLY2Y4R1

## 部署步骤

### 1. 推送代码到 GitHub

```bash
# 初始化 git 仓库（如果还没有）
git init
git add .
git commit -m "准备 Render 部署"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. 在 Render 上部署

1. 访问 [Render Dashboard](https://dashboard.render.com/)
2. 点击 "New +" -> "Web Service"
3. 连接你的 GitHub 仓库
4. 填写以下信息：
   - **Name:** jiujiu-backend
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Root Directory:** backend-api
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3. 环境变量配置

在 Render 的 Environment 选项中，添加以下环境变量：

```
NODE_ENV=production
PORT=10000
JWT_SECRET=[点击 Generate 按钮自动生成]

# 数据库配置
DB_HOST=mysql-33d17299-cuidong111-28e9.e.aivencloud.com
DB_PORT=16966
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_SIHyKQvzVeOMLY2Y4R1

# 兼容配置
MYSQL_DATABASE=defaultdb
MYSQL_USER=avnadmin
MYSQL_PASSWORD=AVNS_SIHyKQvzVeOMLY2Y4R1

# CORS 配置（部署后更新为实际域名）
CORS_ORIGIN=*
```

### 4. 初始化数据库

部署完成后，需要初始化数据库表：

```bash
# 连接到你的 Render 服务 Shell
# 在 Render Dashboard 中点击 "Shell" 标签

# 进入后端目录
cd backend-api

# 运行数据库初始化脚本
node src/db/init.js
```

### 5. 更新 CORS 和 URL 配置

部署成功后，获取你的后端 URL（格式：https://jiujiu-backend.onrender.com）

在 Render 环境变量中更新：
```
API_BASE_URL=https://jiujiu-backend.onrender.com
FRONTEND_URL=你的前端URL
ADMIN_URL=你的管理后台URL
CORS_ORIGIN=你的前端URL,你的管理后台URL
```

## 使用 render.yaml 自动部署（可选）

如果你想使用 Infrastructure as Code 方式部署：

1. 确保项目根目录有 `backend-api/render.yaml` 文件
2. 在 Render Dashboard 中选择 "New" -> "Blueprint"
3. 连接你的 GitHub 仓库
4. Render 会自动读取 render.yaml 并部署服务

## 验证部署

部署完成后，访问以下 URL 验证：

```
https://你的后端域名.onrender.com/api/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 注意事项

1. **免费套餐限制**：
   - Render 免费套餐会在 15 分钟无活动后休眠
   - 首次请求可能需要等待 30 秒左右唤醒服务

2. **数据库 SSL**：
   - Aiven MySQL 强制使用 SSL 连接
   - 代码已自动配置 SSL

3. **日志查看**：
   - 在 Render Dashboard 的 "Logs" 标签查看实时日志
   - 检查是否有错误信息

4. **环境变量安全**：
   - JWT_SECRET 使用 Render 的 Generate 功能生成
   - 不要在代码中硬编码敏感信息

## 故障排查

如果遇到问题：

1. 检查 Render Logs 中的错误信息
2. 确认所有环境变量都已正确设置
3. 验证数据库连接是否成功
4. 确保 package.json 中的 start 脚本正确

## 后续步骤

1. 配置自定义域名（可选）
2. 设置 CI/CD 自动部署
3. 配置监控和告警
4. 优化性能和缓存策略