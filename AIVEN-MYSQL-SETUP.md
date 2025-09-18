# Aiven MySQL 配置指南

## 第一步：注册 Aiven 账号

1. **访问：** https://console.aiven.io/signup
2. **填写信息：**
   - 邮箱地址
   - 设置密码
   - 或使用 Google/GitHub 登录（更快）
3. **验证邮箱**

## 第二步：创建 MySQL 服务

1. **登录后，点击 "Create service"**

2. **选择服务类型：**
   - 选择 **"MySQL"**

3. **选择云服务商和区域：**
   - Cloud: **Google Cloud** 或 **AWS**
   - Region: 
     - 推荐：**us-west1** (美西) 
     - 或：**asia-northeast1** (日本)

4. **选择计划：**
   - 选择 **"Free Trial"**（30天免费）
   - 不需要信用卡！

5. **服务配置：**
   - Service name: `jiujiu-mysql`
   - MySQL version: 8.0（默认）

6. **点击 "Create Service"**

## 第三步：等待服务启动

- 需要等待 3-5 分钟
- 状态变为 **"Running"** 后继续

## 第四步：获取连接信息

1. **点击你的服务名称** `jiujiu-mysql`

2. **在 Overview 页面找到连接信息：**
   - **Service URI**（完整连接字符串）
   - 或查看详细信息：
     - Host
     - Port
     - User (avnadmin)
     - Password
     - Database (defaultdb)

3. **复制这些信息**（稍后使用）

连接信息示例：
```
Host: mysql-xxxxx.aivencloud.com
Port: 26098
User: avnadmin
Password: AVNS_xxxxxxxxxxxxx
Database: defaultdb
```

## 第五步：初始化数据库

创建数据库和表：

1. 在 Aiven 控制台，点击 **"Query editor"**
2. 运行以下 SQL：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS jiujiu_admin;
USE jiujiu_admin;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(500),
    nickname VARCHAR(50),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    category VARCHAR(100),
    stock INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    total_amount DECIMAL(10, 2),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 插入管理员账号
INSERT INTO users (username, password, email, role, nickname)
VALUES ('admin', '$2b$10$ZhSD3BPgY.3nYL4yQX.7Fu7FVLt5fOyQHQKzKJURdqXLqT32UTKDW', 'admin@example.com', 'admin', '管理员');
-- 密码是: admin123
```

## 第六步：告诉我连接信息

把获取到的信息告诉我：
- Host: xxx
- Port: xxx  
- User: xxx
- Password: xxx
- Database: defaultdb 或 jiujiu_admin

我会帮你配置到 Render！

---

**现在去注册吧！** → https://console.aiven.io/signup

记住：
- ✅ 30天免费试用
- ✅ 不需要信用卡
- ✅ 专业的 MySQL 8.0
- ✅ 自动备份