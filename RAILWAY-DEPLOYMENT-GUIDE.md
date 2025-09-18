# Railway 后端部署指南

## 一、Railway 平台简介

Railway 是一个现代化的云平台，提供简单快速的部署体验。

**优势：**
- 每月 $5 免费额度
- 自动 CI/CD 部署
- 一键配置数据库
- 灵活的资源配置
- 优秀的日志和监控

## 二、准备工作

### 1. 注册 Railway 账号
访问 https://railway.app 注册账号，建议使用 GitHub 账号登录。

### 2. 安装 Railway CLI（可选）
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 -useb | iex
```

## 三、部署步骤

### 方式一：通过 GitHub 部署（推荐）

#### 1. 连接 GitHub 仓库
1. 登录 Railway 后，点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 授权 Railway 访问你的 GitHub
4. 选择你的项目仓库

#### 2. 配置部署设置
Railway 会自动检测到 Node.js 项目，自动配置如下：
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **根目录**: `/backend-api`

### 方式二：通过 CLI 部署

```bash
# 进入后端目录
cd backend-api

# 登录 Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 四、环境变量配置

在 Railway 项目设置中，点击 "Variables" 添加以下环境变量：

```env
# 基础配置
NODE_ENV=production
PORT=3000

# 数据库配置（使用 Railway MySQL）
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_DATABASE=${{MySQL.MYSQL_DATABASE}}

# JWT 密钥
JWT_SECRET=your-jwt-secret-key-here

# 支付配置（支付宝）
ALIPAY_APP_ID=你的支付宝AppID
ALIPAY_PRIVATE_KEY=你的支付宝私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 支付配置（微信）
WECHAT_APP_ID=你的微信AppID
WECHAT_MCH_ID=你的微信商户号
WECHAT_API_KEY=你的微信API密钥
WECHAT_NOTIFY_URL=https://你的域名.railway.app/api/payment/wechat/notify

# 邮件服务（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 前端域名
FRONTEND_URL=https://your-frontend.vercel.app
```

## 五、添加 MySQL 数据库

### 1. 添加 MySQL 服务
1. 在项目页面点击 "New" → "Database" → "Add MySQL"
2. Railway 会自动创建 MySQL 实例
3. 数据库连接信息会自动注入环境变量

### 2. 初始化数据库
使用 Railway CLI 连接数据库：
```bash
# 连接到生产数据库
railway run npm run db:init

# 或手动连接
railway connect mysql
```

然后执行初始化 SQL：
```sql
source init-aiven-simple.sql;
```

## 六、配置文件调整

### 1. 创建 railway.json（项目根目录）
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend-api && npm install"
  },
  "deploy": {
    "startCommand": "cd backend-api && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. 更新 package.json
确保 backend-api/package.json 有正确的启动脚本：
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:init": "node init-aiven-db.js"
  }
}
```

### 3. 创建 .env.example
```env
# 这是环境变量示例文件
# 复制此文件为 .env 并填入实际值
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=jiujiu_admin
```

## 七、性能优化配置

### 1. 资源配置
在 Railway 项目设置中调整：
- **Memory**: 1GB（推荐）
- **CPU**: 1 vCPU
- **Sleep after inactivity**: Never（生产环境）

### 2. 添加健康检查
在 server.js 添加：
```javascript
// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

### 3. 配置自动重启
railway.json 中已配置重启策略。

## 八、部署验证

### 1. 查看部署日志
```bash
railway logs
```

### 2. 测试 API
```bash
# 测试健康检查
curl https://你的项目.railway.app/health

# 测试 API
curl https://你的项目.railway.app/api/products
```

### 3. 监控面板
Railway 提供实时监控：
- 内存使用
- CPU 使用
- 请求数
- 响应时间

## 九、自定义域名（可选）

1. 在 Railway 项目设置中点击 "Domains"
2. 点击 "Add Custom Domain"
3. 输入你的域名（如 api.yourdomain.com）
4. 配置 DNS：
   - 类型：CNAME
   - 主机：api
   - 值：你的项目.railway.app

## 十、常见问题

### 1. 部署失败
检查：
- package.json 中的依赖是否完整
- 启动命令是否正确
- 环境变量是否配置

### 2. 数据库连接失败
- 确认环境变量正确引用
- 检查数据库是否初始化
- 查看连接字符串格式

### 3. 内存超限
- 优化代码，减少内存占用
- 调整 MySQL 连接池大小
- 考虑升级到付费计划

### 4. 定时任务
Railway 支持 cron jobs：
```json
{
  "crons": [
    {
      "schedule": "0 */6 * * *",
      "command": "npm run cleanup"
    }
  ]
}
```

## 十一、费用估算

以 1GB 内存配置为例：
- 内存：$0.000463/GB/小时 ≈ $0.33/月/GB
- CPU：$0.000463/vCPU/小时 ≈ $0.33/月
- 总计：约 $0.66/月

$5 免费额度可以运行约 7-8 个月。

## 十二、备份策略

### 1. 数据库备份
```bash
# 手动备份
railway run mysqldump > backup.sql

# 定期备份（使用 GitHub Actions）
```

### 2. 配置备份
定期导出环境变量配置。

## 十三、安全建议

1. **使用环境变量**：不要硬编码密钥
2. **启用 HTTPS**：Railway 默认提供
3. **配置 CORS**：限制跨域访问
4. **定期更新**：保持依赖最新
5. **监控异常**：设置告警

## 支持资源

- Railway 官方文档：https://docs.railway.app
- 社区论坛：https://discord.gg/railway
- 状态页面：https://status.railway.app

---

部署成功后，你的后端 API 将在 `https://你的项目名.railway.app` 上线！