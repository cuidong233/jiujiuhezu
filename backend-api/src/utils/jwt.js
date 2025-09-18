import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * 生成访问令牌
 * @param {Object} payload - 令牌载荷
 * @returns {string} JWT令牌
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'jiujiu-system'
  });
};

/**
 * 生成刷新令牌
 * @param {Object} payload - 令牌载荷
 * @returns {string} JWT刷新令牌
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'jiujiu-system'
  });
};

/**
 * 验证令牌
 * @param {string} token - JWT令牌
 * @returns {Object|null} 解码后的载荷或null
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT验证失败:', error.message);
    return null;
  }
};

/**
 * 解码令牌（不验证签名）
 * @param {string} token - JWT令牌
 * @returns {Object|null} 解码后的载荷或null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT解码失败:', error.message);
    return null;
  }
};

/**
 * 从请求头中提取令牌
 * @param {Object} req - Express请求对象
 * @returns {string|null} JWT令牌或null
 */
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.token;
  
  if (!authHeader) {
    return null;
  }

  // 支持 Bearer token 格式
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader
};