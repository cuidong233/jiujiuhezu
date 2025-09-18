import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// MySQL连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jiujiu_admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 管理端查询common_order表订单列表
 */
router.get('/admin/list', async (req, res) => {
  try {
    const {
      orderNo,
      userId,
      status,
      payType,
      startDate,
      endDate,
      page = 1,
      pageSize = 10
    } = req.query;

    let sql = 'SELECT * FROM `order` WHERE 1=1';
    const params = [];

    // 构建查询条件
    if (orderNo) {
      sql += ' AND order_no LIKE ?';
      params.push(`%${orderNo}%`);
    }
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (payType !== undefined) {
      sql += ' AND pay_type = ?';
      params.push(payType);
    }
    if (startDate && endDate) {
      sql += ' AND create_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // 计算总数
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    // 添加排序和分页
    sql += ' ORDER BY create_date DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize));
    params.push((parseInt(page) - 1) * parseInt(pageSize));

    // 查询数据
    const [rows] = await pool.execute(sql, params);

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: rows,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('查询common_order列表失败:', error);
    res.status(500).json({
      code: -1,
      msg: '查询失败',
      error: error.message
    });
  }
});

/**
 * 获取订单详情
 */
router.get('/detail/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;

    const [rows] = await pool.execute(
      'SELECT * FROM `order` WHERE order_no = ? LIMIT 1',
      [orderNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        code: -1,
        msg: '订单不存在'
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('查询订单详情失败:', error);
    res.status(500).json({
      code: -1,
      msg: '查询失败',
      error: error.message
    });
  }
});

/**
 * 获取订单统计数据
 */
router.get('/admin/stats', async (req, res) => {
  try {
    // 统计各状态订单数量
    const [statusStats] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(price) as total_amount
      FROM `order` 
      GROUP BY status
    `);

    // 统计各支付方式订单
    const [payTypeStats] = await pool.execute(`
      SELECT 
        pay_type,
        COUNT(*) as count,
        SUM(price) as total_amount
      FROM `order` 
      WHERE status = 2
      GROUP BY pay_type
    `);

    // 今日订单统计
    const [todayStats] = await pool.execute(`
      SELECT 
        COUNT(*) as order_count,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 2 THEN price ELSE 0 END) as paid_amount
      FROM `order` 
      WHERE DATE(create_date) = CURDATE()
    `);

    res.json({
      code: 0,
      msg: 'success',
      data: {
        statusStats,
        payTypeStats,
        today: todayStats[0]
      }
    });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({
      code: -1,
      msg: '查询失败',
      error: error.message
    });
  }
});

/**
 * 手动更新订单状态（管理员操作）
 */
router.put('/admin/status/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { status, remark } = req.body;

    const [result] = await pool.execute(
      `UPDATE \`order\` 
       SET status = ?, 
           remark = CONCAT(IFNULL(remark, ''), '\n', ?),
           update_date = NOW()
       WHERE order_no = ?`,
      [status, `[管理员更新状态] ${remark || ''}`, orderNo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: -1,
        msg: '订单不存在'
      });
    }

    res.json({
      code: 0,
      msg: '更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({
      code: -1,
      msg: '更新失败',
      error: error.message
    });
  }
});

export default router;