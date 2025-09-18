# 前端服务 Dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 Nuxt 应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", ".output/server/index.mjs"]