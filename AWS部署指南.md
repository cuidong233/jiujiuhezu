# AWS EC2 部署指南

## 项目架构说明

本项目包含以下组件：
- **后端API服务** (Node.js + Express) - 端口 3001
- **前端应用** (Nuxt 3) - 端口 3000  
- **管理后台** (Vue 3 + Vite) - 端口 8080
- **MySQL 数据库** - 端口 3306
- **Redis 缓存** - 端口 6379
- **Nginx 反向代理** - 端口 80/443

## 前提条件

1. AWS 账号
2. EC2 实例（推荐 t3.medium 或以上）
3. 安装 Docker 和 Docker Compose
4. 域名（可选，用于 HTTPS）

## 部署步骤

### 1. 创建 EC2 实例

1. 登录 AWS 控制台，进入 EC2 服务
2. 点击 "Launch Instance"
3. 选择配置：
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t3.medium (最低配置)
   - **Storage**: 30GB GP3
   - **Security Group**: 开放以下端口
     - 22 (SSH)
     - 80 (HTTP)
     - 443 (HTTPS)
     - 3000 (前端开发)
     - 3001 (API)
     - 8080 (管理后台)

4. 创建或选择密钥对（.pem 文件）

### 2. 连接到 EC2 实例

```bash
# 设置密钥权限
chmod 400 your-key.pem

# SSH 连接
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 3. 安装必要软件

在 EC2 实例上执行：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录以应用组权限
exit
```

重新 SSH 连接后验证安装：

```bash
docker --version
docker-compose --version
```

### 4. 配置环境变量

1. 复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入实际配置：

```bash
nano .env
```

重要配置项：
- 数据库密码（强密码）
- JWT Secret（随机字符串）
- 邮件服务配置
- 支付配置（如需要）

### 5. 部署项目

#### 方法一：使用自动部署脚本

在本地执行：

```bash
# 修改部署脚本中的配置
nano deploy-aws.sh

# 修改以下变量：
# REMOTE_HOST="your-ec2-public-ip"
# PEM_FILE="path/to/your-key.pem"

# 执行部署
./deploy-aws.sh
```

#### 方法二：手动部署

1. 上传项目文件到服务器：

```bash
# 在本地压缩项目
tar -czf project.tar.gz \
  --exclude="node_modules" \
  --exclude=".git" \
  backend-api \
  nuxt-frontend \
  jiujiu-admin-simple \
  nginx \
  docker-compose.yml \
  .env

# 上传到服务器
scp -i your-key.pem project.tar.gz ubuntu@your-ec2-ip:~/
```

2. 在服务器上解压并部署：

```bash
# SSH 到服务器
ssh -i your-key.pem ubuntu@your-ec2-ip

# 解压
tar -xzf project.tar.gz
cd project

# 构建并启动
docker-compose build
docker-compose up -d

# 查看状态
docker-compose ps
```

### 6. 配置域名（可选）

1. 在 Route 53 或其他 DNS 服务商配置：
   - A 记录：`your-domain.com` → EC2 Public IP
   - A 记录：`www.your-domain.com` → EC2 Public IP
   - A 记录：`admin.your-domain.com` → EC2 Public IP

2. 修改 Nginx 配置文件 `nginx/conf.d/default.conf`，替换域名

3. 配置 SSL 证书（使用 Let's Encrypt）：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d admin.your-domain.com
```

### 7. 数据库初始化

首次部署需要初始化数据库：

```bash
# 进入后端容器
docker exec -it jiujiu-backend bash

# 运行数据库初始化
node src/db/init.js

# 退出容器
exit
```

### 8. 配置自动备份（推荐）

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec jiujiu-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD jiujiu_db > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend-api/public/uploads

# 删除 7 天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete
```

添加到 crontab：

```bash
crontab -e
# 添加：每天凌晨 2 点备份
0 2 * * * /home/ubuntu/backup.sh
```

## 常用运维命令

```bash
# 查看所有容器状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 停止所有服务
docker-compose down

# 启动所有服务
docker-compose up -d

# 进入容器
docker exec -it [container_name] bash

# 查看资源使用
docker stats
```

## 监控和日志

1. **应用日志位置**：
   - 后端日志：`./backend-api/logs/`
   - Nginx 日志：`./nginx/logs/`

2. **推荐监控工具**：
   - AWS CloudWatch（系统监控）
   - PM2（Node.js 进程管理）
   - Grafana + Prometheus（可视化监控）

## 性能优化建议

1. **使用 AWS RDS** 替代容器化 MySQL（生产环境）
2. **使用 ElastiCache** 替代容器化 Redis
3. **配置 CloudFront CDN** 加速静态资源
4. **使用 S3** 存储上传文件
5. **配置 Auto Scaling** 实现自动扩缩容

## 故障排查

### 1. 容器启动失败
```bash
# 查看详细日志
docker-compose logs [service_name]

# 检查端口占用
sudo lsof -i :3000
```

### 2. 数据库连接失败
```bash
# 检查数据库容器
docker exec -it jiujiu-mysql mysql -u root -p

# 检查网络
docker network ls
docker network inspect jiujiu-network
```

### 3. 权限问题
```bash
# 修复文件权限
sudo chown -R $USER:$USER .
chmod -R 755 backend-api/logs
chmod -R 755 backend-api/public/uploads
```

## 安全建议

1. **定期更新系统和依赖**
2. **使用强密码**
3. **限制 SSH 访问 IP**
4. **启用 AWS 安全组规则**
5. **定期备份数据**
6. **使用 HTTPS**
7. **配置防火墙（UFW）**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 成本优化

1. **使用预留实例**节省 30-70% 成本
2. **配置自动停止/启动**（开发环境）
3. **使用 Spot 实例**（非关键业务）
4. **定期清理未使用资源**

## 支持与帮助

如遇到问题，请检查：
1. Docker 容器日志
2. 应用日志文件
3. 系统资源使用情况
4. 网络连接状态

---

部署完成后，您可以通过以下地址访问：
- 前端应用：`http://your-domain.com`
- 管理后台：`http://admin.your-domain.com`
- API 接口：`http://your-domain.com/api`