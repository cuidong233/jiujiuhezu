# 后端API服务 Dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p logs public/uploads/articles public/uploads

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "src/server.js"]