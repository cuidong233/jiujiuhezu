# PlanetScale MySQL 数据库配置指南

## 步骤 1：注册 PlanetScale 账号

1. 打开浏览器访问：https://planetscale.com
2. 点击 "Get Started" 或 "Sign Up"
3. 使用 GitHub 账号登录（推荐）或邮箱注册

## 步骤 2：创建数据库

1. 登录后，点击 "Create Database"
2. 输入数据库名称：`jiujiu-admin`
3. 选择区域：
   - **推荐：** `AWS us-west-2` （美西）
   - **备选：** `AWS ap-northeast-1` （日本）
4. 选择计划：**Hobby（免费）**
5. 点击 "Create Database"

## 步骤 3：获取连接信息

1. 等待数据库创建完成（约1分钟）
2. 点击 "Connect" 按钮
3. 选择 "Connect with: Node.js"
4. 点击 "Create Password"
5. **重要：保存显示的连接信息**

你会看到类似这样的信息：
```
DATABASE_URL='mysql://用户名:密码@主机地址/数据库名?ssl={"rejectUnauthorized":true}'
```

## 步骤 4：配置环境变量

从连接字符串中提取信息：
- **DB_HOST**: `aws.connect.psdb.cloud` （或显示的主机地址）
- **DB_USER**: 显示的用户名
- **DB_PASSWORD**: 显示的密码（pscale_pw_开头的）
- **DB_NAME**: `jiujiu-admin`
- **DB_PORT**: `3306`（默认）

## 步骤 5：启用 SSL 连接

PlanetScale 要求 SSL 连接，需要更新数据库配置。

---

## 现在就开始

1. **打开浏览器：** https://planetscale.com/signup
2. **用 GitHub 登录**（最快）
3. **创建数据库**
4. **告诉我连接信息**

我会帮你配置剩余的步骤！