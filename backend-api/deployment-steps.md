# 🚀 部署步骤文档

## 当前进度
- ✅ 导出本地MySQL数据库
- ✅ 注册Aiven账号
- ✅ 创建Aiven MySQL数据库
- ✅ 配置后端连接Aiven
- ⏳ 初始化Aiven数据库表
- ⏳ 部署后端到Render
- ⏳ 部署前端到Vercel

## 📝 需要你手动完成的步骤

### 1. 解决网络连接问题
由于本地无法连接Aiven MySQL（可能是梯子/防火墙问题），有两个选择：

#### 选项A：关闭梯子后重试
```bash
# 关闭梯子后，在终端执行：
cd /Users/apple/Desktop/project-1500/backend-api
npm start
```
如果连接成功，数据库表会自动创建。

#### 选项B：直接在Render上初始化（推荐）
跳过本地测试，直接部署到Render，让服务器初始化数据库。

### 2. 部署后端到Render

#### 2.1 推送代码到GitHub
```bash
# 配置Git（如果还没配置）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 推送代码
cd /Users/apple/Desktop/project-1500/backend-api
git add .
git commit -m "Deploy to Render with Aiven MySQL"
git push origin main
```

如果提示输入GitHub用户名密码，需要使用Personal Access Token：
1. 访问 https://github.com/settings/tokens
2. 生成新token（勾选repo权限）
3. 使用token作为密码

#### 2.2 在Render配置环境变量
登录 https://dashboard.render.com

找到你的后端服务，添加以下环境变量：
```
DB_HOST=your-database-host
DB_PORT=your-database-port
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# 微信支付配置（从.env复制）
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_V3_KEY=your-api-key
WECHAT_SERIAL_NO=your-serial-no
WECHAT_NOTIFY_URL=https://你的render域名/api/wechat/notify

# 支付宝配置（从.env复制）
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_NOTIFY_URL=https://你的render域名/api/payment/alipay/notify

# JWT密钥
JWT_SECRET=your-secret-key-here

# 邮件服务（Brevo）
BREVO_API_KEY=你的Brevo API密钥
BREVO_SENDER_EMAIL=noreply@jiujiu.com
BREVO_SENDER_NAME=久久系统

# 管理员配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com
```

#### 2.3 触发部署
在Render控制台点击 "Manual Deploy" → "Deploy latest commit"

### 3. 验证后端部署

部署完成后，访问：
```
https://你的render域名/api/health
```

应该返回：
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 4. 部署前端到Vercel

#### 4.1 更新前端API地址
```bash
cd /Users/apple/Desktop/project-1500/user-frontend

# 编辑 .env.production
echo "VITE_API_URL=https://你的render域名" > .env.production
```

#### 4.2 推送前端代码
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

#### 4.3 在Vercel部署
1. 访问 https://vercel.com/dashboard
2. 导入GitHub项目
3. 选择 user-frontend 目录
4. 添加环境变量：
   ```
   VITE_API_URL=https://你的render域名
   ```
5. 点击Deploy

### 5. 测试完整流程

1. 访问前端：`https://你的vercel域名`
2. 尝试注册/登录
3. 测试支付功能
4. 检查订单创建

## 🔧 故障排查

### 如果Render部署失败
检查日志：
- Build logs：查看构建错误
- Service logs：查看运行时错误

常见问题：
- 数据库连接失败：检查环境变量
- 端口错误：确保使用 `process.env.PORT`
- 依赖问题：检查package.json

### 如果Vercel部署失败
- 检查build命令：`npm run build`
- 检查输出目录：`dist`
- 确保环境变量正确

## 📞 需要帮助？

如果遇到问题，提供以下信息：
1. 错误截图或日志
2. 在哪一步卡住了
3. 尝试过什么解决方法

## 快速命令汇总

```bash
# 本地测试后端
cd /Users/apple/Desktop/project-1500/backend-api
npm start

# 推送代码
git add .
git commit -m "update"
git push origin main

# 本地测试前端
cd /Users/apple/Desktop/project-1500/user-frontend
npm run dev

# 构建前端
npm run build
```

---
文档生成时间：2025-09-17