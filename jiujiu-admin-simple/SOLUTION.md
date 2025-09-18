# 问题解决方案 - 轮播图页面认证错误

## 问题总结
点击轮播图会触发意外的退出登录，原因是：
1. 登录使用了模拟 token 而不是真实的后端 API
2. 后端 API 路径配置错误
3. 登录字段不匹配（需要 email 而不是 username）

## 已完成的修复

### 前端修复
1. **Login.vue** - 使用真实的后端登录 API
2. **auth.js** - 修正 API 路径为 `/api/auth` 
3. **Banner.vue** - 使用 request 实例代替直接使用 axios
4. **request.js** - 优化 token 获取和错误处理
5. **errorHandler.js** - 防止重复登出

### API 路径说明
- 登录：`POST /api/auth/login`
- 获取用户信息：`GET /api/auth/me`
- 登出：`POST /api/auth/logout`

## 使用说明

### 1. 清理缓存
打开浏览器开发者工具，清除 localStorage 中的旧数据

### 2. 登录账号
- **邮箱**: `admin@example.com`
- **密码**: `admin123`

### 3. 测试步骤
1. 访问 http://localhost:5174/
2. 使用上述账号登录
3. 访问轮播图管理页面
4. 点击轮播图预览 - 不应再触发退出登录
5. 测试增删改查功能 - 应正常工作

## 验证修复

运行以下命令测试后端 API：
```bash
# 测试登录
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 应返回类似：
# {"code":0,"msg":"登录成功","data":{...,"tokenValue":"..."}}
```

## 后续优化建议

1. **环境变量配置**
   - 创建 `.env` 文件配置 API 地址
   - 区分开发和生产环境

2. **认证流程优化**
   - 实现 token 自动刷新机制
   - 添加 Remember Me 功能

3. **错误处理改进**
   - 统一错误码规范
   - 提供更友好的错误提示

4. **开发体验优化**
   - 配置 Vite 代理避免 CORS
   - 添加开发环境自动登录选项