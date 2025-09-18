# 邮件服务配置指南

邮件服务用于发送验证码、订单通知、CDK密钥等重要信息。

## 支持的邮件服务商

### 1. QQ邮箱（推荐）
```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=你的授权码（不是密码）
```

**获取授权码步骤：**
1. 登录QQ邮箱网页版
2. 进入"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"SMTP服务"
5. 生成授权码并保存

### 2. 网易163邮箱
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=你的邮箱@163.com
SMTP_PASS=你的授权码
```

### 3. Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=你的邮箱@gmail.com
SMTP_PASS=应用专用密码
```

**获取应用专用密码：**
1. 开启两步验证
2. 访问 https://myaccount.google.com/apppasswords
3. 生成应用专用密码

### 4. 企业邮箱（腾讯）
```env
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=你的企业邮箱
SMTP_PASS=邮箱密码或授权码
```

## 配置步骤

1. **编辑 .env 文件**
   ```bash
   cd /Users/apple/Desktop/project/backend-api
   nano .env
   ```

2. **填入邮箱配置**
   将上述配置中的对应值填入 .env 文件

3. **重启服务器**
   ```bash
   npm run dev
   ```

## 测试邮件服务

配置完成后，可以通过以下API测试邮件发送：

```bash
# 发送测试邮件
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "接收邮箱@qq.com",
    "subject": "测试邮件",
    "content": "这是一封测试邮件"
  }'
```

## 常见问题

### 1. 连接超时
- 检查防火墙设置
- 确认SMTP端口是否正确
- 部分网络环境可能需要使用587端口

### 2. 认证失败
- 确认使用的是授权码而非密码
- 检查邮箱是否开启了SMTP服务
- 确认邮箱地址正确

### 3. 发送失败
- 检查收件人邮箱是否正确
- 某些邮箱服务商有发送频率限制
- 检查邮件内容是否触发垃圾邮件过滤

## 邮件模板

系统支持以下邮件模板：
- 验证码邮件
- 订单确认邮件
- CDK发货邮件
- 密码重置邮件
- 账户通知邮件

## 安全建议

1. **不要在代码中硬编码邮箱密码**
2. **使用授权码而非真实密码**
3. **定期更换授权码**
4. **限制邮件发送频率防止滥用**
5. **记录邮件发送日志便于追踪**