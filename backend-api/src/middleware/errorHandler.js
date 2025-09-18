/**
 * 全局错误处理中间件
 */

import winston from 'winston';
import { ResponseHandler } from './response.js';

// 配置日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'admin-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * 异步错误包装器
 * 用于包装异步路由处理器，自动捕获未处理的Promise异常
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 数据库错误处理
 */
const handleDatabaseError = (error) => {
  let message = '数据库操作失败';
  let code = 1002;

  // Sequelize 错误
  if (error.name === 'SequelizeValidationError') {
    message = '数据验证失败';
    code = 1001;
    return { message, code, details: error.errors };
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    message = '数据重复，违反唯一约束';
    code = 1003;
    return { message, code, details: error.fields };
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    message = '外键约束错误';
    code = 1004;
    return { message, code };
  }

  // MySQL 错误
  if (error.code === 'ER_DUP_ENTRY') {
    message = '数据重复';
    code = 1003;
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    message = '引用的数据不存在';
    code = 1004;
  } else if (error.code === 'ECONNREFUSED') {
    message = '数据库连接失败';
    code = 1005;
  }

  return { message, code };
};

/**
 * JWT错误处理
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return { message: 'Token无效', code: 401 };
  }
  if (error.name === 'TokenExpiredError') {
    return { message: 'Token已过期', code: 401 };
  }
  return { message: '认证失败', code: 401 };
};

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });

  // 如果响应已经发送，则交给Express默认错误处理器
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = '服务器内部错误';
  let code = 500;
  let details = null;

  // 处理不同类型的错误
  if (err.name && (err.name.includes('Sequelize') || err.code)) {
    // 数据库错误
    const dbError = handleDatabaseError(err);
    message = dbError.message;
    code = dbError.code;
    details = dbError.details;
    statusCode = 400;
  } else if (err.name && err.name.includes('JsonWebToken')) {
    // JWT错误
    const jwtError = handleJWTError(err);
    message = jwtError.message;
    code = jwtError.code;
    statusCode = 401;
  } else if (err.status || err.statusCode) {
    // HTTP错误
    statusCode = err.status || err.statusCode;
    message = err.message || message;
    code = statusCode;
  } else if (err.message) {
    // 自定义错误
    message = err.message;
    code = err.code || 1;
    statusCode = err.statusCode || 400;
  }

  // 发送错误响应
  return ResponseHandler.error(res, message, code, statusCode, details);
};

/**
 * 404错误处理中间件
 */
const notFoundHandler = (req, res) => {
  logger.warn('404 Not Found:', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  return ResponseHandler.notFound(res, `路由 ${req.method} ${req.url} 不存在`);
};

/**
 * 验证错误处理
 */
const handleValidationErrors = (req, res, next) => {
  import('express-validator').then(({ validationResult }) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, errors.array());
    }
    
    next();
  }).catch(next);
};

export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleValidationErrors,
  logger
};