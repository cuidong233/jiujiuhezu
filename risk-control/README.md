# 风控系统（Risk Control System）

一个完整的Node.js风控系统，提供防作弊、防刷单、防爬虫等功能，保护您的应用免受恶意攻击。

## 功能特性

### 🛡️ 核心功能

- **日志系统** - 完整的审计日志和系统日志记录
- **异常行为监控** - 实时监控用户异常行为模式
- **频率限制** - 多维度的请求频率控制
- **IP黑白名单** - IP地址风险评估和管理
- **设备指纹识别** - 设备一致性检测和追踪
- **反爬虫策略** - 多层次爬虫检测和防护
- **风控规则引擎** - 灵活可配置的风控规则
- **实时告警** - 多渠道告警通知系统
- **管理API** - 完整的RESTful管理接口

### 📊 监控维度

- 快速点击检测
- 频繁下单监控
- 异常金额检测
- 批量购买识别
- 可疑登录尝试
- 支付欺诈风险
- 账户接管检测
- 优惠券滥用防护

## 快速开始

### 安装

```bash
npm install
```

### 配置

1. 复制环境变量配置文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置Redis和告警通知等参数

### 基础使用

```javascript
const express = require('express');
const { quickStart } = require('./risk-control');

const app = express();

// 快速集成风控系统
const riskControl = quickStart(app, {
    redis: {
        host: 'localhost',
        port: 6379
    },
    riskThreshold: 70
});

// 使用登录保护
app.post('/login', 
    riskControl.loginProtection(), 
    (req, res) => {
        // 登录逻辑
    }
);

// 使用订单验证
app.post('/order', 
    riskControl.orderValidation(), 
    (req, res) => {
        // 订单处理逻辑
    }
);

app.listen(3000);
```

### 运行示例

```bash
npm run example
```

## 详细配置

### 中间件配置

```javascript
const RiskMiddleware = require('./risk-control/middleware/risk-middleware');

const middleware = new RiskMiddleware({
    enabled: true,                    // 启用风控
    blockOnHighRisk: true,            // 高风险自动拦截
    riskThreshold: 70,                // 风险阈值
    crawlerDetection: true,           // 爬虫检测
    rateLimit: true,                  // 频率限制
    deviceTracking: true,             // 设备追踪
    behaviorTracking: true,           // 行为追踪
    skipPaths: ['/health'],          // 跳过的路径
    whitelist: ['192.168.1.1']      // IP白名单
});
```

### 自定义风控规则

```javascript
const riskEngine = require('./risk-control/engine/risk-engine');

riskEngine.addRule('custom_rule', {
    description: '自定义规则',
    priority: 1,
    conditions: [
        { type: 'order_amount', operator: '>', value: 10000 },
        { type: 'account_age', operator: '<', value: 86400000 }
    ],
    actions: ['manual_review', 'alert_admin'],
    riskScore: 80
});
```

### 告警配置

```javascript
const AlertSystem = require('./risk-control/alert/alert-system');

const alertSystem = new AlertSystem({
    email: {
        enabled: true,
        smtp: { /* SMTP配置 */ },
        recipients: ['admin@example.com']
    },
    webhook: {
        enabled: true,
        urls: ['https://hooks.slack.com/xxx']
    },
    thresholds: {
        riskScore: 70,
        failedLogins: 5
    }
});
```

## API接口

### 风险评估
```
POST /api/risk-control/evaluate
```

### 频率限制检查
```
POST /api/risk-control/check-rate-limit
```

### 爬虫检测
```
POST /api/risk-control/check-crawler
```

### 设备指纹
```
POST /api/risk-control/device-fingerprint
```

### 用户风险档案
```
GET /api/risk-control/user-profile/:userId
```

### 系统统计
```
GET /api/risk-control/statistics
```

### 规则管理
```
GET /api/risk-control/rules
POST /api/risk-control/rules
PUT /api/risk-control/rules/:name
DELETE /api/risk-control/rules/:name
```

### 黑白名单管理
```
POST /api/risk-control/blacklist/ip
POST /api/risk-control/whitelist/ip
```

## 监控指标

系统提供以下关键监控指标：

- **风险评分** - 0-100分的综合风险评分
- **请求频率** - 各维度的请求频率统计
- **爬虫检测率** - 识别的爬虫请求比例
- **拦截率** - 被拦截的高风险请求比例
- **告警数量** - 各类型告警的数量统计

## 性能优化

- 使用Redis进行分布式缓存和限流
- 异步处理告警通知
- 定期清理过期数据
- 支持水平扩展

## 安全建议

1. 定期更新IP黑名单库
2. 根据业务特点调整风控规则
3. 监控告警频率，避免误报
4. 定期审查风控日志
5. 保护敏感配置信息

## 故障排查

### Redis连接失败
- 检查Redis服务是否运行
- 验证连接配置是否正确
- 检查网络连接

### 告警发送失败
- 验证SMTP/Webhook配置
- 检查网络连接
- 查看错误日志

### 误拦截问题
- 调整风险阈值
- 添加白名单
- 优化风控规则

## 许可证

MIT