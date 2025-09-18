import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db/database.js';
import bcrypt from 'bcrypt';
import { verifyEmailCode } from '../services/emailService.js';

const router = express.Router();

// 获取用户信息
router.get('/info', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查询用户信息
    const [users] = await pool.query(
      `SELECT 
        id,
        username,
        email,
        avatar,
        phone,
        created_at as createdAt,
        updated_at as updatedAt,
        status
      FROM users
      WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在',
        success: false
      });
    }
    
    const user = users[0];
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '/default-avatar.png',
        phone: user.phone || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        status: user.status
      },
      success: true
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取用户信息失败',
      success: false
    });
  }
});

// 更新用户信息
router.post('/update', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, phone, avatar } = req.body;
    
    const updates = [];
    const values = [];
    
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        msg: '没有要更新的内容',
        success: false
      });
    }
    
    updates.push('updated_at = NOW()');
    values.push(userId);
    
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({
      code: 0,
      msg: '更新成功',
      success: true
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      code: 500,
      msg: '更新用户信息失败',
      success: false
    });
  }
});

// 修改密码
router.post('/changePassword', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        msg: '旧密码和新密码不能为空',
        success: false
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        msg: '新密码长度至少6位',
        success: false
      });
    }
    
    // 查询用户当前密码
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在',
        success: false
      });
    }
    
    // 验证旧密码
    const user = users[0];
    if (user.password) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(400).json({
          code: 400,
          msg: '原密码错误',
          success: false
        });
      }
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({
      code: 0,
      msg: '密码修改成功',
      success: true
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      code: 500,
      msg: '修改密码失败',
      success: false
    });
  }
});

// 重置密码（通过邮箱验证码）
router.post('/resetPassword', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        code: 400,
        msg: '邮箱、验证码和新密码不能为空',
        success: false
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        msg: '新密码长度至少6位',
        success: false
      });
    }
    
    // 验证邮箱验证码
    const isCodeValid = await verifyEmailCode(email, code, 'reset');
    if (!isCodeValid) {
      return res.status(400).json({
        code: 400,
        msg: '验证码无效或已过期',
        success: false
      });
    }
    
    // 查找用户
    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在',
        success: false
      });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
      [hashedPassword, email]
    );
    
    res.json({
      code: 0,
      msg: '密码重置成功',
      success: true
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      code: 500,
      msg: '重置密码失败',
      success: false
    });
  }
});

// 获取用户统计信息
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取订单统计
    const [orderStats] = await pool.query(
      `SELECT 
        COUNT(*) as totalOrders,
        SUM(total_amount) as totalSpent
      FROM pr_order
      WHERE user_id = ?`,
      [userId]
    );
    
    // 获取购物车数量
    const [cartCount] = await pool.query(
      'SELECT COUNT(*) as count FROM pr_cart WHERE user_id = ?',
      [userId]
    );
    
    // 获取收藏数量
    const [favoriteCount] = await pool.query(
      'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        orders: {
          total: orderStats[0].totalOrders || 0,
          totalSpent: orderStats[0].totalSpent || 0
        },
        cart: cartCount[0].count || 0,
        favorites: favoriteCount[0].count || 0
      },
      success: true
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取用户统计失败',
      success: false
    });
  }
});

export default router;