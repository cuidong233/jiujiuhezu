/**
 * 统一认证中间件
 */

import jwt from 'jsonwebtoken';
import { ResponseHandler } from './response.js';
import { logger } from './errorHandler.js';

// JWT配置
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'jiujiu-admin-secret-key-2024',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

/**
 * 生成访问令牌
 * @param {Object} payload - 令牌载荷
 * @returns {string} JWT令牌
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    issuer: 'admin-system',
    audience: 'admin-user'
  });
};

/**
 * 生成刷新令牌
 * @param {Object} payload - 令牌载荷
 * @returns {string} JWT刷新令牌
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.refreshExpiresIn,
    issuer: 'admin-system',
    audience: 'admin-user'
  });
};

/**
 * 验证令牌
 * @param {string} token - JWT令牌
 * @returns {Object} 解码后的载荷
 */
const verifyToken = (token) => {
  try {
    // 先尝试带有 issuer 和 audience 的验证
    return jwt.verify(token, JWT_CONFIG.secret, {
      issuer: 'admin-system',
      audience: 'admin-user'
    });
  } catch (error) {
    // 如果失败，则使用简单验证（兼容简单登录路由）
    return jwt.verify(token, JWT_CONFIG.secret);
  }
};

/**
 * 从请求中提取令牌
 * @param {Object} req - Express请求对象
 * @returns {string|null} JWT令牌
 */
const extractToken = (req) => {
  let token = null;

  // 优先从Authorization头获取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // 兼容旧的token头
  if (!token && req.headers.token) {
    token = req.headers.token;
  }

  // 从cookie中获取（如果有）
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  return token;
};

/**
 * 基础认证中间件
 */
const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      logger.warn('Authentication failed - No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      return ResponseHandler.unauthorized(res, '请提供访问令牌');
    }

    const decoded = verifyToken(token);
    
    // 将用户信息附加到请求对象
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || [],
      tokenType: decoded.type || 'access'
    };

    // 记录成功认证
    logger.info('Authentication successful', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      url: req.url
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed - Invalid token', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });

    if (error.name === 'TokenExpiredError') {
      return ResponseHandler.unauthorized(res, '访问令牌已过期，请重新登录');
    }
    
    if (error.name === 'JsonWebTokenError') {
      return ResponseHandler.unauthorized(res, '无效的访问令牌');
    }

    return ResponseHandler.unauthorized(res, '令牌验证失败');
  }
};

/**
 * 可选认证中间件（不强制要求token）
 */
const optionalAuthenticate = (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };
  } catch (error) {
    req.user = null;
    logger.warn('Optional authentication failed', {
      error: error.message,
      ip: req.ip
    });
  }

  next();
};

/**
 * 角色验证中间件
 * @param {...string} allowedRoles - 允许的角色列表
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, '请先登录');
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed - Insufficient privileges', {
        userId: req.user.id,
        userRole,
        requiredRoles: allowedRoles,
        url: req.url,
        ip: req.ip
      });
      
      return ResponseHandler.forbidden(res, '权限不足，无法访问此资源');
    }

    next();
  };
};

/**
 * 权限验证中间件
 * @param {string} permission - 需要的权限
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, '请先登录');
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission) && req.user.role !== 'admin') {
      logger.warn('Permission denied', {
        userId: req.user.id,
        requiredPermission: permission,
        userPermissions,
        url: req.url,
        ip: req.ip
      });
      
      return ResponseHandler.forbidden(res, `缺少权限：${permission}`);
    }

    next();
  };
};

/**
 * 刷新令牌中间件
 */
const refreshToken = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return ResponseHandler.unauthorized(res, '请提供刷新令牌');
    }

    const decoded = verifyToken(token);
    
    // 确保这是一个刷新令牌
    if (decoded.type !== 'refresh') {
      return ResponseHandler.unauthorized(res, '无效的刷新令牌');
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Refresh token validation failed', {
      error: error.message,
      ip: req.ip
    });

    return ResponseHandler.unauthorized(res, '刷新令牌无效或已过期');
  }
};

/**
 * 管理员认证中间件（组合使用）
 */
const adminAuth = [
  authenticate,
  authorize('admin', 'super_admin')
];

/**
 * 用户认证中间件（组合使用）
 */
const userAuth = [
  authenticate,
  authorize('user', 'admin', 'super_admin')
];

export {
  // 令牌工具函数
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractToken,
  
  // 中间件函数
  authenticate,
  optionalAuthenticate,
  authorize,
  requirePermission,
  refreshToken,
  
  // 组合中间件
  adminAuth,
  userAuth,
  
  // 配置
  JWT_CONFIG
};