#!/bin/bash
set -e

# 1. 拉取最新代码
git pull

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 关闭旧进程
pkill -f '.output/server/index.mjs' || true

# 5. 启动新进程
nohup npm run start > frontend.log 2>&1 &

echo "前端已部署并在后台运行" 