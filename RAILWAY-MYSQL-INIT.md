# Railway MySQL 数据库初始化指南

## 📋 前置条件
确保你已经：
1. ✅ Railway 后端已部署成功
2. ✅ 设置了环境变量 `AUTO_SYNC_DB=false`
3. ✅ Railway MySQL 服务已添加

## 🔧 初始化方法

### 方法1：使用 Railway Dashboard（最简单）

1. **进入 Railway Dashboard**
   - 访问 https://railway.app
   - 进入你的项目

2. **打开 MySQL 服务**
   - 点击 MySQL 服务
   - 点击 "Connect" 标签
   - 点击 "Connect with mysql CLI"

3. **复制连接命令**
   ```bash
   mysql -h[host] -u[user] -p[password] [database]
   ```

4. **在终端执行 SQL 脚本**
   ```bash
   # 连接到数据库后
   mysql> source backend-api/init-railway-mysql.sql;
   ```

### 方法2：使用 Railway CLI

1. **安装 Railway CLI**（如果还没安装）
   ```bash
   # macOS/Linux
   curl -fsSL https://railway.app/install.sh | sh
   
   # Windows
   iwr https://railway.app/install.ps1 -useb | iex
   ```

2. **登录 Railway**
   ```bash
   railway login
   ```

3. **连接到你的项目**
   ```bash
   railway link
   ```

4. **连接 MySQL 并初始化**
   ```bash
   # 连接到 MySQL
   railway connect mysql
   
   # 执行初始化脚本
   mysql> source backend-api/init-railway-mysql.sql;
   ```

### 方法3：使用 MySQL 客户端工具

1. **从 Railway Dashboard 获取连接信息**
   - Host: `xxx.railway.app`
   - Port: `xxxx`
   - User: `root`
   - Password: `xxx`
   - Database: `railway`

2. **使用 MySQL Workbench/TablePlus/DBeaver 等工具**
   - 创建新连接
   - 输入上述信息
   - 连接成功后，执行 `init-railway-mysql.sql`

### 方法4：使用本地脚本远程连接

1. **创建环境变量文件** `.env.railway`
   ```env
   MYSQL_HOST=your-host.railway.app
   MYSQL_PORT=5432
   MYSQL_USER=root
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=railway
   ```

2. **运行初始化脚本**
   ```bash
   cd backend-api
   mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < init-railway-mysql.sql
   ```

## ✅ 验证初始化

1. **检查表是否创建成功**
   ```sql
   SHOW TABLES;
   ```
   应该看到 17 个表

2. **检查测试数据**
   ```sql
   SELECT * FROM users WHERE username='admin';
   SELECT * FROM products;
   SELECT * FROM categories;
   ```

3. **测试 API**
   ```bash
   # 健康检查
   curl https://your-app.railway.app/health
   
   # 获取商品列表
   curl https://your-app.railway.app/api/products
   ```

## 🔄 重置数据库（如需要）

```sql
-- 危险操作！会删除所有数据
DROP DATABASE IF EXISTS railway;
CREATE DATABASE railway;
USE railway;
-- 然后重新运行 init-railway-mysql.sql
```

## ⚠️ 注意事项

1. **默认管理员密码**
   - 用户名: `admin`
   - 需要更新密码 hash（当前是占位符）

2. **生产环境安全**
   - 修改默认密码
   - 限制数据库访问 IP
   - 定期备份数据

3. **环境变量检查**
   确保 Railway 中设置了：
   ```
   AUTO_SYNC_DB=false
   JWT_SECRET=your-secret-key
   ```

## 🆘 常见问题

### 1. 连接被拒绝
- 检查 Railway 服务是否正在运行
- 确认连接信息正确
- 检查网络连接

### 2. 表已存在错误
- 使用 `IF NOT EXISTS` 语句（脚本已包含）
- 或先删除旧表再创建

### 3. 外键约束错误
- 确保按正确顺序创建表（脚本已处理）
- 检查相关表是否存在

## 📝 初始化成功后

1. **移除 AUTO_SYNC_DB=false**（可选）
   - 如果想启用自动同步
   - 在 Railway Dashboard 中删除或设为 true

2. **配置前端连接**
   - 更新前端 API 地址
   - 测试前后端连接

3. **设置备份策略**
   - Railway 提供自动备份（付费功能）
   - 或设置定期导出脚本

---

**需要帮助？** 查看 Railway 日志或提供具体错误信息。