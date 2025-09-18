# 免费 MySQL 数据库选择

## 1. Aiven MySQL（推荐）
- **免费试用 30 天**（不需要信用卡）
- 访问：https://aiven.io/mysql
- 步骤：
  1. 注册账号
  2. 创建 MySQL 服务
  3. 选择免费试用
  4. 获取连接信息

## 2. FreeSQLDatabase
- **永久免费** 5MB
- 访问：https://www.freesqldatabase.com
- 限制：空间较小

## 3. Railway MySQL
- **每月 $5 免费额度**
- 访问：https://railway.app
- 一键部署 MySQL

## 4. CleverCloud
- **免费套餐** 256MB
- 访问：https://www.clever-cloud.com
- 欧洲服务器

## 5. 使用 Render PostgreSQL（需要改代码）
- Render 提供免费 PostgreSQL
- 但需要把 MySQL 代码改成 PostgreSQL

---

## 最简单的方案

直接用 **Railway** 部署整个后端：

```bash
cd backend-api
railway login
railway up
```

Railway 会自动：
- 检测到需要 MySQL
- 自动创建 MySQL 数据库
- 配置好所有连接
- 提供 HTTPS URL

这样前后端和数据库都解决了！