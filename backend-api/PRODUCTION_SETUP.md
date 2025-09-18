# 生产环境部署指南

## 邮件服务配置（面向海外用户）

### 1. Brevo邮件服务（推荐）

系统已集成Brevo专业邮件服务，特别适合海外用户：

**优势：**
- ✅ 全球邮件送达率高
- ✅ 支持多语言邮件模板
- ✅ 提供详细的邮件追踪和分析
- ✅ 免费套餐每天可发送300封邮件
- ✅ 无需担心IP被封或进垃圾邮件

**配置步骤：**

1. 注册Brevo账号：https://www.brevo.com
2. 获取API Key
3. 配置发件人域名（可选但推荐）
4. 在`.env`文件中配置：

```bash
# Brevo邮件服务配置
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Your App Name
```

### 2. 邮件功能说明

系统已实现以下邮件功能：

#### 验证码邮件
- 注册验证码
- 登录验证码  
- 密码重置验证码
- 专业的HTML邮件模板
- 多语言支持（英文）

#### 交易邮件
- 购买成功通知
- CDK密钥发送
- 订单详情

### 3. 生产环境检查清单

#### 环境变量配置
```bash
# 必需配置
NODE_ENV=production
PORT=3002

# 数据库配置
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT配置（生产环境请使用强密码）
JWT_SECRET=your-strong-secret-key-production
JWT_EXPIRES_IN=7d

# Brevo邮件服务（必需）
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Your App Name
```

### 4. 部署前测试

运行测试脚本验证邮件服务：

```bash
# 测试Brevo验证码发送
TEST_EMAIL=your-test-email@gmail.com node test-brevo-verification.js

# 测试Brevo服务状态
node test-brevo.js
```

### 5. 监控和日志

生产环境建议监控以下指标：

- 邮件发送成功率
- 邮件送达率
- 验证码使用率
- API响应时间

### 6. 安全建议

1. **API密钥安全**
   - 不要将API密钥提交到代码仓库
   - 使用环境变量管理敏感信息
   - 定期轮换API密钥

2. **发件人验证**
   - 配置SPF记录
   - 配置DKIM签名
   - 配置DMARC策略

3. **速率限制**
   - 实施验证码请求频率限制
   - 防止邮件轰炸攻击

### 7. 故障处理

系统邮件发送策略：

1. **生产环境**：Brevo API发送（必需配置）
2. **开发环境**：Brevo API发送，未配置时控制台输出

### 8. 常见问题

**Q: 邮件进入垃圾邮件怎么办？**
- 配置发件人域名验证（SPF/DKIM）
- 使用专业的发件人地址
- 避免使用免费邮箱作为发件人

**Q: 如何提高邮件送达率？**
- 使用Brevo等专业邮件服务
- 保持良好的发件人信誉
- 定期清理无效邮箱地址

**Q: 如何处理不同时区的用户？**
- 邮件中使用UTC时间
- 在用户界面显示本地时间

### 9. 性能优化

- 邮件发送采用异步处理
- 验证码有10分钟有效期
- 自动清理过期验证码

### 10. 扩展建议

未来可以考虑：
- 添加邮件模板管理系统
- 支持更多语言
- 集成邮件营销功能
- 添加邮件统计分析

## 联系支持

如有问题，请查看：
- Brevo文档：https://developers.brevo.com
- 系统日志：`logs/combined.log`
- 错误日志：`logs/error.log`