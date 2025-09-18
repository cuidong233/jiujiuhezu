import express from 'express';
import pool from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'jiujiu-admin-secret-key-2024';

/**
 * 用户注册（简化版）
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password, nickname } = req.body;
    
    // 参数验证
    if (!email || !password) {
      return res.json({
        code: 400,
        msg: '邮箱和密码不能为空'
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({
        code: 400,
        msg: '邮箱格式不正确'
      });
    }
    
    // 验证密码长度
    if (password.length < 6) {
      return res.json({
        code: 400,
        msg: '密码长度至少6位'
      });
    }
    
    // 检查邮箱是否已注册
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.json({
        code: 400,
        msg: '该邮箱已被注册'
      });
    }
    
    // 开始事务
    await connection.beginTransaction();
    
    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 创建用户
      const username = email.split('@')[0];
      const userNickname = nickname || username;
      
      const [result] = await connection.execute(
        `INSERT INTO users (username, email, password, nickname, role, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())`,
        [username, email, hashedPassword, userNickname]
      );
      
      const userId = result.insertId;
      
      // 提交事务
      await connection.commit();
      
      // 生成token
      const token = jwt.sign(
        {
          userId: userId,
          email: email,
          role: 'user'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // 返回成功响应
      res.json({
        code: 0,
        msg: '注册成功',
        data: {
          id: userId,
          username: username,
          email: email,
          nickname: userNickname,
          role: 'user',
          tokenValue: token
        }
      });
      
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('注册失败:', error);
    res.json({
      code: 500,
      msg: '注册失败，请稍后重试'
    });
  } finally {
    connection.release();
  }
});

/**
 * 用户登录（简化版）
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.json({
        code: 400,
        msg: '邮箱和密码不能为空'
      });
    }
    
    // 查询用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND status = 1',
      [email]
    );
    
    if (users.length === 0) {
      return res.json({
        code: 401,
        msg: '邮箱或密码错误'
      });
    }
    
    const user = users[0];
    
    // 验证密码
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.json({
        code: 401,
        msg: '邮箱或密码错误'
      });
    }
    
    // 更新最后登录时间
    await pool.execute(
      'UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
      [req.ip, user.id]
    );
    
    // 生成token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 返回用户信息和token
    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        tokenValue: token
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.json({
      code: 500,
      msg: '登录失败，请稍后重试'
    });
  }
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    // 获取token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers.token;
    
    if (!token) {
      return res.json({
        code: 401,
        msg: '请先登录'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 查询用户信息
    const [users] = await pool.execute(
      'SELECT id, username, email, nickname, avatar, role FROM users WHERE id = ? AND status = 1',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.json({
        code: 401,
        msg: '用户不存在或已禁用'
      });
    }
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: users[0]
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.json({
        code: 401,
        msg: 'Token无效'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.json({
        code: 401,
        msg: 'Token已过期'
      });
    }
    
    console.error('获取用户信息失败:', error);
    res.json({
      code: 500,
      msg: '获取用户信息失败'
    });
  }
});

/**
 * 退出登录
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  // 前端清除token即可
  res.json({
    code: 0,
    msg: '退出成功'
  });
});

export default router;