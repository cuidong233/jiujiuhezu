# 海外邮件服务快速配置

## 1. Resend（最简单，推荐）

### 注册和配置
1. 访问 https://resend.com
2. 注册账号（GitHub登录）
3. 获取API Key
4. 安装：`npm install resend`

### 代码示例
```javascript
import { Resend } from 'resend';
const resend = new Resend('re_xxxxxxxxxxxx');

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: user.email,
  subject: '验证码',
  html: `您的验证码是：${code}`
});
```

**优势**：
- 免费3000封/月
- 5分钟完成配置
- 自带邮件模板

## 2. Brevo (SendinBlue)

### 快速开始
1. 访问 https://www.brevo.com
2. 注册免费账号
3. 获取SMTP凭据

### 配置
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-smtp-key
```

**优势**：
- 免费300封/天
- 支持SMTP和API
- 有中文界面

## 3. Mailgun

### 配置步骤
1. 访问 https://www.mailgun.com
2. 注册账号
3. 验证域名（可选）
4. 获取API凭据

### 使用
```javascript
import mailgun from 'mailgun-js';
const mg = mailgun({
  apiKey: 'key-xxxxx',
  domain: 'sandbox.mailgun.org'
});

mg.messages().send({
  from: 'noreply@yourdomain.com',
  to: user.email,
  subject: '验证码',
  text: `验证码：${code}`
});
```

**优势**：
- 前3个月免费5000封
- 高送达率
- 详细的分析报告