#!/bin/bash

# AWS EC2 部署脚本
# 使用方法: ./deploy-aws.sh

set -e

echo "========================================="
echo "开始部署到 AWS EC2"
echo "========================================="

# 配置变量
REMOTE_USER="ubuntu"
REMOTE_HOST="your-ec2-public-ip"
REMOTE_PATH="/home/ubuntu/jiujiu-project"
PEM_FILE="path/to/your-key.pem"

# 检查必要文件
if [ ! -f "$PEM_FILE" ]; then
    echo "错误: 找不到 PEM 文件: $PEM_FILE"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "错误: 找不到 .env 文件"
    echo "请先创建 .env 文件并配置环境变量"
    exit 1
fi

# 1. 压缩项目文件
echo "1. 压缩项目文件..."
tar -czf deploy.tar.gz \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="logs" \
    --exclude="*.log" \
    --exclude="deploy.tar.gz" \
    backend-api \
    nuxt-frontend \
    jiujiu-admin-simple \
    nginx \
    docker-compose.yml \
    .env

# 2. 上传到服务器
echo "2. 上传文件到服务器..."
scp -i "$PEM_FILE" deploy.tar.gz "$REMOTE_USER@$REMOTE_HOST:~/"

# 3. 在服务器上执行部署
echo "3. 在服务器上执行部署..."
ssh -i "$PEM_FILE" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
    set -e
    
    # 创建项目目录
    mkdir -p ~/jiujiu-project
    cd ~/jiujiu-project
    
    # 解压文件
    echo "解压项目文件..."
    tar -xzf ~/deploy.tar.gz
    rm ~/deploy.tar.gz
    
    # 停止现有容器
    echo "停止现有容器..."
    docker-compose down || true
    
    # 构建并启动容器
    echo "构建并启动容器..."
    docker-compose build --no-cache
    docker-compose up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    echo "检查服务状态..."
    docker-compose ps
    
    # 查看日志
    echo "查看最近的日志..."
    docker-compose logs --tail=50
    
    echo "部署完成！"
ENDSSH

# 4. 清理本地文件
echo "4. 清理本地临时文件..."
rm -f deploy.tar.gz

echo "========================================="
echo "部署成功完成！"
echo "前端地址: http://$REMOTE_HOST"
echo "管理后台: http://$REMOTE_HOST:8080"
echo "API地址: http://$REMOTE_HOST:3001"
echo "========================================="