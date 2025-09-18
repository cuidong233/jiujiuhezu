import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';

// 限流配置
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.RATE_LIMIT_MAX || 10, // 限制10次请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
});

// 支付接口的严格限流
export const strictPaymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 3, // 每分钟最多3次
  message: '支付请求过于频繁，请稍后再试',
  skipSuccessfulRequests: true, // 成功的请求不计入限制
});

// IP白名单检查（用于回调接口）
export const ipWhitelist = (req, res, next) => {
  const alipayIPs = [
    '110.75.225.0/24',
    '110.75.226.0/24',
    '110.75.227.0/24',
    '110.75.228.0/24',
    // 添加更多支付宝的IP段
  ];
  
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // 在开发环境跳过IP检查
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // TODO: 实现IP段匹配逻辑
  // if (!isIPInWhitelist(clientIP, alipayIPs)) {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Forbidden'
  //   });
  // }
  
  next();
};

// 请求签名验证（防止请求篡改）
export const verifyRequestSignature = (req, res, next) => {
  // 跳过GET请求
  if (req.method === 'GET') {
    return next();
  }
  
  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];
  
  // 检查时间戳（防止重放攻击）
  if (timestamp) {
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - requestTime);
    
    // 请求时间超过5分钟视为无效
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        message: '请求已过期'
      });
    }
  }
  
  // 在生产环境强制要求签名
  if (process.env.NODE_ENV === 'production' && !signature) {
    return res.status(401).json({
      success: false,
      message: '缺少签名'
    });
  }
  
  next();
};

// 防止金额篡改
export const validateAmount = (req, res, next) => {
  if (req.body.amount) {
    const amount = parseFloat(req.body.amount);
    
    // 检查金额范围
    if (amount < 0.01 || amount > 100000) {
      return res.status(400).json({
        success: false,
        message: '金额超出允许范围'
      });
    }
    
    // 检查小数位数
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return res.status(400).json({
        success: false,
        message: '金额格式错误'
      });
    }
  }
  
  next();
};

// 防止订单号注入
export const sanitizeOrderNo = (req, res, next) => {
  const orderNo = req.body.orderNo || req.params.orderNo;
  
  if (orderNo) {
    // 只允许字母、数字、下划线和短横线
    const sanitized = orderNo.replace(/[^a-zA-Z0-9_-]/g, '');
    
    if (sanitized !== orderNo) {
      return res.status(400).json({
        success: false,
        message: '订单号格式错误'
      });
    }
    
    // 限制长度
    if (orderNo.length > 64) {
      return res.status(400).json({
        success: false,
        message: '订单号过长'
      });
    }
  }
  
  next();
};

// 生成请求ID（用于追踪）
export const generateRequestId = (req, res, next) => {
  req.requestId = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

// 安全响应头
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});