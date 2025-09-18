import express from 'express';
import pool from '../db/database.js';
import bcrypt from 'bcrypt';
import { sendVerificationCode, verifyEmailCode } from '../services/emailService.js';
import { generateAccessToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * 发送验证码
 * GET /api/product/common/code
 */
router.get('/common/code', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.json({
        code: 400,
        msg: '邮箱不能为空'
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
    
    // 发送验证码
    const result = await sendVerificationCode(email, 'register');
    
    if (result.success) {
      res.json({
        code: 0,
        msg: result.message,
        data: null
      });
    } else {
      res.json({
        code: 500,
        msg: result.message
      });
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.json({
      code: 500,
      msg: '发送验证码失败'
    });
  }
});

/**
 * 邮箱验证码注册
 * POST /api/product/common/mail/code
 */
router.post('/common/mail/code', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, code, password, inviteId } = req.body;
    
    // 参数验证
    if (!email || !code || !password) {
      return res.json({
        code: 400,
        msg: '邮箱、验证码和密码不能为空'
      });
    }
    
    // 验证邮箱验证码
    const codeValid = await verifyEmailCode(email, code, 'register');
    if (!codeValid) {
      return res.json({
        code: 400,
        msg: '验证码无效或已过期'
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
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const username = email.split('@')[0];
    const nickname = username;
    
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, nickname, role, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, email, hashedPassword, nickname]
    );
    
    const userId = result.insertId;
    
    // 记录注册日志
    await connection.execute(
      `INSERT INTO user_login_logs (user_id, email, login_type, login_ip, user_agent, status) 
       VALUES (?, ?, 'register', ?, ?, 1)`,
      [userId, email, req.ip, req.headers['user-agent']]
    );
    
    // 提交事务
    await connection.commit();
    
    // 生成token
    const token = generateAccessToken({
      userId: userId,
      email: email,
      role: 'user'
    });
    
    // 返回用户信息和token
    res.json({
      code: 0,
      msg: '注册成功',
      data: {
        id: userId,
        username: username,
        email: email,
        nickname: nickname,
        avatar: null,
        role: 'user',
        tokenValue: token
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('注册失败:', error);
    console.error('错误堆栈:', error.stack);
    res.json({
      code: 500,
      msg: '注册失败：' + error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * 密码登录
 * POST /api/product/common/mail/login
 */
router.post('/common/mail/login', async (req, res) => {
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
      // 记录失败日志（暂时禁用，表不存在）
      // await pool.execute(
      //   `INSERT INTO user_login_logs (email, login_type, login_ip, user_agent, status, failure_reason) 
      //    VALUES (?, 'password', ?, ?, 0, '用户不存在或已禁用')`,
      //   [email, req.ip, req.headers['user-agent']]
      // );
      
      return res.json({
        code: 401,
        msg: '邮箱或密码错误'
      });
    }
    
    const user = users[0];
    
    // 验证密码
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      // 记录失败日志（暂时禁用，表不存在）
      // await pool.execute(
      //   `INSERT INTO user_login_logs (user_id, email, login_type, login_ip, user_agent, status, failure_reason) 
      //    VALUES (?, ?, 'password', ?, ?, 0, '密码错误')`,
      //   [user.id, email, req.ip, req.headers['user-agent']]
      // );
      
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
    
    // 记录成功日志（暂时禁用，表不存在）
    // await pool.execute(
    //   `INSERT INTO user_login_logs (user_id, email, login_type, login_ip, user_agent, status) 
    //    VALUES (?, ?, 'password', ?, ?, 1)`,
    //   [user.id, email, req.ip, req.headers['user-agent']]
    // );
    
    // 生成token
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
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
 * 统一登录/注册接口
 * POST /api/product/common/unified-auth
 * 支持密码和验证码两种方式，自动判断是登录还是注册
 */
router.post('/common/unified-auth', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password, code } = req.body;
    
    // 参数验证
    if (!email) {
      return res.json({
        code: 400,
        msg: '邮箱不能为空'
      });
    }
    
    if (!password && !code) {
      return res.json({
        code: 400,
        msg: '请提供密码或验证码'
      });
    }
    
    // 查询用户是否存在
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND status = 1',
      [email]
    );
    
    let user = existingUsers.length > 0 ? existingUsers[0] : null;
    
    // 如果提供了验证码
    if (code) {
      // 验证验证码（login类型和register类型都尝试）
      let codeValid = await verifyEmailCode(email, code, 'login');
      if (!codeValid) {
        codeValid = await verifyEmailCode(email, code, 'register');
      }
      
      if (!codeValid) {
        return res.json({
          code: 400,
          msg: '验证码无效或已过期'
        });
      }
      
      // 如果用户不存在，自动注册
      if (!user) {
        await connection.beginTransaction();
        
        const username = email.split('@')[0] + '_' + Date.now();
        const nickname = email.split('@')[0];
        
        // 如果同时提供了密码，加密保存
        let hashedPassword = null;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }
        
        const [result] = await connection.execute(
          `INSERT INTO users (username, email, password, nickname, role, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())`,
          [username, email, hashedPassword, nickname]
        );
        
        const userId = result.insertId;
        
        await connection.commit();
        
        user = {
          id: userId,
          username: username,
          email: email,
          nickname: nickname,
          avatar: null,
          role: 'user'
        };
      }
    } 
    // 如果只提供了密码
    else if (password) {
      // 用户存在，验证密码
      if (user) {
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
          return res.json({
            code: 401,
            msg: '密码错误'
          });
        }
      } 
      // 用户不存在，自动注册
      else {
        await connection.beginTransaction();
        
        const username = email.split('@')[0] + '_' + Date.now();
        const nickname = email.split('@')[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await connection.execute(
          `INSERT INTO users (username, email, password, nickname, role, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 'user', 1, NOW(), NOW())`,
          [username, email, hashedPassword, nickname]
        );
        
        const userId = result.insertId;
        
        await connection.commit();
        
        user = {
          id: userId,
          username: username,
          email: email,
          nickname: nickname,
          avatar: null,
          role: 'user'
        };
      }
    }
    
    // 更新最后登录时间
    await connection.execute(
      'UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
      [req.ip, user.id]
    );
    
    // 生成token
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // 返回用户信息和token
    res.json({
      code: 0,
      msg: user.password ? '登录成功' : '注册并登录成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        tokenValue: token,
        isNewUser: !existingUsers.length
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('统一认证失败:', error);
    res.json({
      code: 500,
      msg: '操作失败，请稍后重试'
    });
  } finally {
    connection.release();
  }
});

/**
 * 验证码登录
 * POST /api/product/common/mail/codeLogin
 */
router.post('/common/mail/codeLogin', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.json({
        code: 400,
        msg: '邮箱和验证码不能为空'
      });
    }
    
    // 验证邮箱验证码
    const codeValid = await verifyEmailCode(email, code, 'login');
    if (!codeValid) {
      // 记录失败日志
      await connection.execute(
        `INSERT INTO user_login_logs (email, login_type, login_ip, user_agent, status, failure_reason) 
         VALUES (?, 'code', ?, ?, 0, '验证码无效或已过期')`,
        [email, req.ip, req.headers['user-agent']]
      );
      
      return res.json({
        code: 400,
        msg: '验证码无效或已过期'
      });
    }
    
    // 查询用户
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    let user;
    
    if (users.length === 0) {
      // 用户不存在，自动注册
      await connection.beginTransaction();
      
      const username = email.split('@')[0];
      const nickname = username;
      
      const [result] = await connection.execute(
        `INSERT INTO users (username, email, nickname, role, status, created_at, updated_at) 
         VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
        [username, email, nickname]
      );
      
      const userId = result.insertId;
      
      // 记录注册日志
      await connection.execute(
        `INSERT INTO user_login_logs (user_id, email, login_type, login_ip, user_agent, status) 
         VALUES (?, ?, 'code', ?, ?, 1)`,
        [userId, email, req.ip, req.headers['user-agent']]
      );
      
      await connection.commit();
      
      user = {
        id: userId,
        username: username,
        email: email,
        nickname: nickname,
        avatar: null,
        role: 'user'
      };
    } else {
      user = users[0];
      
      // 检查用户状态
      if (user.status !== 1) {
        // 记录失败日志
        await connection.execute(
          `INSERT INTO user_login_logs (user_id, email, login_type, login_ip, user_agent, status, failure_reason) 
           VALUES (?, ?, 'code', ?, ?, 0, '用户已被禁用')`,
          [user.id, email, req.ip, req.headers['user-agent']]
        );
        
        return res.json({
          code: 403,
          msg: '用户已被禁用'
        });
      }
      
      // 更新最后登录时间
      await connection.execute(
        'UPDATE users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
        [req.ip, user.id]
      );
      
      // 记录成功日志
      await connection.execute(
        `INSERT INTO user_login_logs (user_id, email, login_type, login_ip, user_agent, status) 
         VALUES (?, ?, 'code', ?, ?, 1)`,
        [user.id, email, req.ip, req.headers['user-agent']]
      );
    }
    
    // 生成token
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
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
    await connection.rollback();
    console.error('验证码登录失败:', error);
    res.json({
      code: 500,
      msg: '登录失败，请稍后重试'
    });
  } finally {
    connection.release();
  }
});

export default router;