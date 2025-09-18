import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db/database.js';

const router = express.Router();

// 获取钱包信息
router.get('/info', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查询用户钱包信息
    const [wallets] = await pool.query(
      `SELECT 
        id,
        user_id,
        balance,
        frozen_balance,
        total_income,
        total_expense,
        created_at as createdAt,
        updated_at as updatedAt
      FROM user_wallet
      WHERE user_id = ?`,
      [userId]
    );
    
    let wallet;
    if (wallets.length === 0) {
      // 如果钱包不存在，创建一个新钱包
      await pool.query(
        `INSERT INTO user_wallet (user_id, balance, frozen_balance, total_income, total_expense, created_at, updated_at) 
         VALUES (?, 0, 0, 0, 0, NOW(), NOW())`,
        [userId]
      );
      
      wallet = {
        userId: userId,
        balance: 0,
        frozenBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      wallet = {
        userId: wallets[0].user_id,
        balance: parseFloat(wallets[0].balance) || 0,
        frozenBalance: parseFloat(wallets[0].frozen_balance) || 0,
        totalIncome: parseFloat(wallets[0].total_income) || 0,
        totalExpense: parseFloat(wallets[0].total_expense) || 0,
        createdAt: wallets[0].createdAt,
        updatedAt: wallets[0].updatedAt
      };
    }
    
    res.json({
      code: 0,
      msg: 'success',
      data: wallet,
      success: true
    });
  } catch (error) {
    console.error('获取钱包信息失败:', error);
    
    // 如果是因为表不存在，先创建表
    if (error.code === 'ER_NO_SUCH_TABLE') {
      try {
        await createWalletTable();
        // 重新尝试获取钱包信息
        return router.handle(req, res);
      } catch (createError) {
        console.error('创建钱包表失败:', createError);
      }
    }
    
    res.status(500).json({
      code: 500,
      msg: '获取钱包信息失败',
      success: false
    });
  }
});

// 获取钱包交易记录
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];
    
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    
    // 查询交易记录
    const [transactions] = await pool.query(
      `SELECT 
        id,
        type,
        amount,
        balance_after,
        description,
        order_id,
        created_at as createdAt
      FROM wallet_transactions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    // 查询总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM wallet_transactions ${whereClause}`,
      params
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: transactions,
        total: countResult[0].total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      },
      success: true
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    
    // 如果表不存在，返回空数据
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({
        code: 0,
        msg: 'success',
        data: {
          list: [],
          total: 0,
          page: 1,
          limit: 10
        },
        success: true
      });
    }
    
    res.status(500).json({
      code: 500,
      msg: '获取交易记录失败',
      success: false
    });
  }
});

// 充值
router.post('/recharge', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        code: 400,
        msg: '充值金额无效',
        success: false
      });
    }
    
    // 这里应该接入实际的支付流程
    // 现在只是模拟充值成功
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 更新钱包余额
      await connection.query(
        `UPDATE user_wallet 
         SET balance = balance + ?, 
             total_income = total_income + ?,
             updated_at = NOW()
         WHERE user_id = ?`,
        [amount, amount, userId]
      );
      
      // 记录交易
      await connection.query(
        `INSERT INTO wallet_transactions (
          user_id, type, amount, balance_after, 
          description, created_at
        ) VALUES (?, 'recharge', ?, 
          (SELECT balance FROM user_wallet WHERE user_id = ?),
          ?, NOW())`,
        [userId, amount, userId, `充值 ${amount} 元`]
      );
      
      await connection.commit();
      
      res.json({
        code: 0,
        msg: '充值成功',
        success: true
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('充值失败:', error);
    res.status(500).json({
      code: 500,
      msg: '充值失败',
      success: false
    });
  }
});

// 创建钱包相关表
async function createWalletTable() {
  // 创建钱包表
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_wallet (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      balance DECIMAL(10, 2) DEFAULT 0.00,
      frozen_balance DECIMAL(10, 2) DEFAULT 0.00,
      total_income DECIMAL(10, 2) DEFAULT 0.00,
      total_expense DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户钱包表'
  `);
  
  // 创建交易记录表
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type ENUM('recharge', 'withdraw', 'purchase', 'refund', 'income') NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      balance_after DECIMAL(10, 2) NOT NULL,
      description VARCHAR(255),
      order_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包交易记录表'
  `);
}

export default router;