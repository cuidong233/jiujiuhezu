# Brevo 邮件服务配置指南

Brevo（原Sendinblue）是一个专业的邮件服务商，特别适合海外应用。本指南将帮助您完成配置。

## 🌟 Brevo 服务优势

### 免费套餐
- **每日300封邮件** - 永久免费
- **无月度限制** - 只要不超过日限制
- **专业服务** - 比个人邮箱更可信
- **海外友好** - 欧洲服务商，全球送达率高

### 付费套餐
- **起步价**: €25/月（约$27）
- **邮件数量**: 20,000封/月
- **无日限制** - 更灵活的发送计划

## 📋 配置步骤

### 1. 注册 Brevo 账户

1. 访问 [https://www.brevo.com/](https://www.brevo.com/)
2. 点击 "Sign up free" 注册免费账户
3. 验证邮箱并完成注册流程
4. 登录到 Brevo 控制台

### 2. 获取 API 密钥

1. 登录 Brevo 控制台
2. 进入 **SMTP & API** → **API Keys**
3. 点击 **Generate a new API key**
4. 输入密钥名称（如：MyApp Production）
5. 复制生成的 API 密钥（以 `xkeysib-` 开头）

### 3. 配置环境变量

在项目的 `.env` 文件中添加以下配置：

```env
# 应用配置
APP_NAME=Your Digital Store
BREVO_FROM_EMAIL=noreply@yourdomain.com

# Brevo API 配置
BREVO_API_KEY=xkeysib-your-api-key-here

# 测试邮箱
TEST_EMAIL=your-email@example.com
```

### 配置说明：
- `BREVO_API_KEY`: 从 Brevo 控制台获取的 API 密钥
- `BREVO_FROM_EMAIL`: 发送邮件的地址（建议使用您的域名）
- `APP_NAME`: 邮件中显示的应用名称
- `TEST_EMAIL`: 测试邮件的接收地址

## 🔧 域名配置（推荐）

### 为什么要配置域名？
- **提升送达率** - 避免进入垃圾邮件箱
- **增强信任** - 用户更信任来自您域名的邮件
- **专业形象** - 统一的品牌邮件体验

### 配置步骤：

1. **在 Brevo 中添加域名**
   - 进入 **Senders & IP** → **Domains**
   - 点击 **Add a domain**
   - 输入您的域名（如：yourdomain.com）

2. **配置 DNS 记录**
   
   在您的域名 DNS 管理中添加以下记录：

   ```
   # DKIM 记录（提升送达率）
   mail._domainkey.yourdomain.com CNAME mail._domainkey.brevo.com
   
   # SPF 记录（防止伪造）
   yourdomain.com TXT "v=spf1 include:spf.brevo.com ~all"
   
   # DMARC 记录（可选，增强安全）
   _dmarc.yourdomain.com TXT "v=DMARC1; p=none; ruf=mailto:dmarc@yourdomain.com"
   ```

3. **验证域名**
   - 回到 Brevo 控制台
   - 点击 **Verify** 验证域名
   - 等待 DNS 传播（通常几分钟到几小时）

## 🧪 测试配置

### 运行测试脚本

```bash
cd /Users/apple/Desktop/project/backend-api
node test-brevo.js
```

### 测试内容
1. **配置检查** - 验证 API 密钥是否正确
2. **连接测试** - 测试与 Brevo 服务的连接
3. **商品邮件** - 发送完整的购买成功邮件
4. **简单邮件** - 发送基础测试邮件

### 预期结果
```
🧪 开始测试 Brevo 邮件服务...

1. 检查配置状态:
   BREVO_API_KEY: 已配置
   APP_NAME: Your Digital Store(默认)

2. 测试账号连接:
   ✅ Brevo 连接成功
   账号邮箱: your-email@example.com
   今日剩余: 300 封邮件

3. 测试发送商品信息邮件:
   ✅ 商品信息邮件发送成功！

4. 测试发送简单邮件:
   ✅ 简单邮件发送成功！

🏁 测试完成！
```

## 📊 监控和统计

### Brevo 控制台功能
1. **实时统计** - 查看发送、送达、打开率
2. **发送日志** - 详细的邮件发送记录
3. **黑名单管理** - 管理被退信的邮箱
4. **模板管理** - 创建可复用的邮件模板

### 查看发送记录
1. 登录 Brevo 控制台
2. 进入 **Statistics** → **Email**
3. 查看详细的发送统计和状态

## 🚀 生产环境使用

### 启动应用
```bash
npm run start
# 或开发模式
npm run dev
```

### 验证功能
1. 完成一笔测试订单
2. 检查邮箱是否收到商品信息邮件
3. 验证邮件内容和格式

## 🔍 故障排除

### 常见问题

**问题**: API 密钥无效
- **解决**: 检查 API 密钥是否完整，是否以 `xkeysib-` 开头

**问题**: 邮件进入垃圾箱
- **解决**: 配置发送域名和 DNS 记录

**问题**: 达到发送限制
- **解决**: 免费版每日300封，可考虑升级套餐

**问题**: 发送失败
- **解决**: 检查收件人邮箱是否有效，查看 Brevo 控制台错误信息

### 调试模式

设置环境变量启用详细日志：
```env
NODE_ENV=development
```

## 💰 费用说明

### 免费套餐
- **每日限制**: 300封邮件
- **适用场景**: 小型项目、测试环境
- **功能限制**: 基础功能完整，无高级特性

### 付费套餐
| 套餐 | 价格/月 | 邮件数量 | 特色功能 |
|------|---------|----------|----------|
| Lite | €25 | 20,000封 | 高级统计 |
| Premium | €65 | 20,000封 | A/B测试 |
| Enterprise | 定制 | 定制 | 专属IP |

## 🎯 最佳实践

### 1. 邮件内容优化
- **清晰主题** - 避免垃圾邮件关键词
- **个性化** - 使用用户名和订单信息
- **移动友好** - 响应式邮件设计
- **行动按钮** - 明确的下一步操作

### 2. 发送策略
- **适量发送** - 避免短时间大量发送
- **定期清理** - 移除无效邮箱地址
- **监控指标** - 关注送达率和打开率
- **遵守法规** - 提供退订链接

### 3. 安全考虑
- **保护密钥** - 不在代码中硬编码 API 密钥
- **访问控制** - 限制 API 密钥权限
- **定期更换** - 定期更新 API 密钥
- **监控使用** - 关注异常发送活动

## 📞 获取支持

- **Brevo 官方文档**: https://developers.brevo.com/
- **API 参考**: https://developers.brevo.com/reference/
- **社区支持**: https://community.brevo.com/
- **技术支持**: 通过 Brevo 控制台提交工单

---

**配置完成后，您的海外用户将收到专业、可信的商品信息邮件！** 🎉