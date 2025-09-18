# Railway 快速修复指南

## 🚀 立即修复步骤

### 1. 在 Railway Dashboard 添加环境变量
```env
AUTO_SYNC_DB=false
```

这会跳过数据库自动初始化，让服务先启动起来。

### 2. 服务启动后，手动初始化数据库

#### 方法一：使用 Railway CLI
```bash
# 连接到 Railway 数据库
railway connect mysql

# 运行初始化脚本
source backend-api/init-aiven-simple.sql;
```

#### 方法二：使用 Railway Run
```bash
# 在本地运行，但连接到 Railway 数据库
railway run --service=backend npm run db:init
```

### 3. 必需的环境变量清单
```env
# 基础配置
NODE_ENV=production
PORT=3000
AUTO_SYNC_DB=false

# 数据库（Railway MySQL 自动提供）
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_DATABASE=${{MySQL.MYSQL_DATABASE}}

# JWT（必需）
JWT_SECRET=your-secret-key-here-change-this

# 前端 URL
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📝 注意事项

1. **数据库初始化失败是正常的** - 因为表之间有依赖关系
2. **设置 AUTO_SYNC_DB=false** 让服务先启动
3. **手动初始化数据库** 确保表按正确顺序创建

## 🔧 调试命令

```bash
# 查看实时日志
railway logs -f

# 连接到数据库
railway connect mysql

# 查看所有表
SHOW TABLES;

# 删除所有表（如需重新初始化）
DROP DATABASE IF EXISTS defaultdb;
CREATE DATABASE defaultdb;
USE defaultdb;
```

## ✅ 验证部署

服务启动后访问：
- 健康检查: `https://your-app.railway.app/health`
- API 测试: `https://your-app.railway.app/api/products`

---

**如果还有问题，请提供 Railway 日志中的具体错误信息。**