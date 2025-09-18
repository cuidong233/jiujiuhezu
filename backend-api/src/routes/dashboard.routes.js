import express from 'express';
import pool from '../db/database.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取仪表板统计数据 - 暂时不需要认证，方便测试
router.get('/stats', async (req, res) => {
  try {
    // 获取今日日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 获取昨日日期范围
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 1. 今日收入
    const [todayRevenueResult] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue 
       FROM \`order\` 
       WHERE payment_status = 1 
       AND DATE(created_at) = CURDATE()`
    );
    const todayRevenue = todayRevenueResult[0].revenue;
    
    // 昨日收入（用于计算趋势）
    const [yesterdayRevenueResult] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue 
       FROM \`order\` 
       WHERE payment_status = 1 
       AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    );
    const yesterdayRevenue = yesterdayRevenueResult[0].revenue;
    const revenueTrend = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : 0;
    
    // 2. 新增用户
    const [todayUsersResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE DATE(created_at) = CURDATE()`
    );
    const todayNewUsers = todayUsersResult[0].count;
    
    // 昨日新增用户
    const [yesterdayUsersResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    );
    const yesterdayNewUsers = yesterdayUsersResult[0].count;
    const usersTrend = yesterdayNewUsers > 0
      ? ((todayNewUsers - yesterdayNewUsers) / yesterdayNewUsers * 100).toFixed(1)
      : 0;
    
    // 3. 今日订单数
    const [todayOrdersResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM \`order\` 
       WHERE DATE(created_at) = CURDATE()`
    );
    const todayOrders = todayOrdersResult[0].count;
    
    // 昨日订单数
    const [yesterdayOrdersResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM \`order\` 
       WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    );
    const yesterdayOrders = yesterdayOrdersResult[0].count;
    const ordersTrend = yesterdayOrders > 0
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1)
      : 0;
    
    // 4. 活跃用户（今日有过任何操作的用户）
    const [activeUsersResult] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM \`order\` 
       WHERE DATE(created_at) = CURDATE()`
    );
    const activeUsers = activeUsersResult[0].count;
    
    // 昨日活跃用户
    const [yesterdayActiveResult] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM \`order\` 
       WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    );
    const yesterdayActive = yesterdayActiveResult[0].count;
    const activeTrend = yesterdayActive > 0
      ? ((activeUsers - yesterdayActive) / yesterdayActive * 100).toFixed(1)
      : 0;
    
    // 5. 总收入统计
    const [totalRevenueResult] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue 
       FROM \`order\` 
       WHERE payment_status = 1`
    );
    const totalRevenue = totalRevenueResult[0].revenue;
    
    // 上月总收入（用于计算趋势）
    const [lastMonthRevenueResult] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue 
       FROM \`order\` 
       WHERE payment_status = 1 
       AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
       AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`
    );
    const lastMonthRevenue = lastMonthRevenueResult[0].revenue;
    
    // 本月总收入
    const [thisMonthRevenueResult] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue 
       FROM \`order\` 
       WHERE payment_status = 1 
       AND MONTH(created_at) = MONTH(CURDATE())
       AND YEAR(created_at) = YEAR(CURDATE())`
    );
    const thisMonthRevenue = thisMonthRevenueResult[0].revenue;
    const monthRevenueTrend = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        todayRevenue: {
          value: todayRevenue,
          trend: parseFloat(revenueTrend)
        },
        newUsers: {
          value: todayNewUsers,
          trend: parseFloat(usersTrend)
        },
        todayOrders: {
          value: todayOrders,
          trend: parseFloat(ordersTrend)
        },
        activeUsers: {
          value: activeUsers,
          trend: parseFloat(activeTrend)
        },
        totalRevenue: {
          value: totalRevenue,
          trend: parseFloat(monthRevenueTrend)
        },
        thisMonthRevenue: {
          value: thisMonthRevenue,
          trend: parseFloat(monthRevenueTrend)
        }
      }
    });
  } catch (error) {
    console.error('获取仪表板统计数据失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取统计数据失败'
    });
  }
});

// 获取收入趋势数据
router.get('/revenue-trend', async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    let days = 7;
    let groupBy = 'DATE(created_at)';
    let dateFormat = '%m-%d';
    
    if (range === 'month') {
      days = 30;
    } else if (range === 'year') {
      days = 365;
      groupBy = 'MONTH(created_at)';
      dateFormat = '%Y-%m';
    }
    
    const query = `SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
       FROM \`order\` 
       WHERE payment_status = 1 
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
       GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
       ORDER BY MIN(created_at) ASC`;
    
    const [revenueData] = await pool.execute(query);
    
    // 为没有数据的日期填充0值
    const filledData = [];
    const today = new Date();
    
    if (range === 'week' || range === 'month') {
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        const existingData = revenueData.find(d => d.date === dateStr);
        if (existingData) {
          filledData.push(existingData);
        } else {
          filledData.push({
            date: dateStr,
            revenue: 0,
            orders: 0
          });
        }
      }
    } else {
      // 年度数据直接使用原始数据
      filledData.push(...revenueData);
    }
    
    res.json({
      code: 0,
      msg: 'success',
      data: filledData
    });
  } catch (error) {
    console.error('获取收入趋势失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取收入趋势失败'
    });
  }
});

// 获取用户分布数据（保留旧接口，避免其他地方调用出错）
router.get('/user-distribution', async (req, res) => {
  try {
    // 获取用户VIP等级分布
    const [distribution] = await pool.execute(
      `SELECT 
        CASE 
          WHEN vip_level = 0 THEN '普通用户'
          WHEN vip_level = 1 THEN 'VIP1'
          WHEN vip_level = 2 THEN 'VIP2'
          WHEN vip_level = 3 THEN 'VIP3'
          WHEN vip_level = 5 THEN 'VIP5'
          ELSE CONCAT('VIP', vip_level)
        END as level,
        COUNT(*) as count
       FROM users
       GROUP BY vip_level
       ORDER BY vip_level ASC`
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: distribution
    });
  } catch (error) {
    console.error('获取用户分布失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取用户分布失败'
    });
  }
});

// 获取待处理订单统计
router.get('/pending-orders', async (req, res) => {
  try {
    // 查询未发货的订单（已支付但未发货，只统计待发货状态0，不包括部分发货状态1）
    const [unshippedOrders] = await pool.execute(
      `SELECT COUNT(*) as count
       FROM \`order\`
       WHERE payment_status = 1 
       AND delivery_status = 0`
    );

    // 尝试查询需要用户申请修改回执单的订单
    let pendingModification = 0;
    try {
      const [needReceiptModification] = await pool.execute(
        `SELECT COUNT(DISTINCT o.id) as count
         FROM \`order\` o
         LEFT JOIN cdk_receipt cr ON o.id = cr.order_id
         WHERE o.payment_status = 1 
         AND o.delivery_status = 0
         AND cr.notes IS NOT NULL 
         AND cr.notes LIKE '%modificationRequest%'`
      );
      pendingModification = needReceiptModification[0].count || 0;
    } catch (err) {
      console.log('回执单表查询失败，可能表不存在:', err.message);
    }

    // 尝试查询需要填写回执单但未填写的订单
    let pendingReceipt = 0;
    try {
      const [needReceiptFill] = await pool.execute(
        `SELECT COUNT(DISTINCT o.id) as count
         FROM \`order\` o
         INNER JOIN product p ON o.product_id = p.id
         LEFT JOIN cdk_receipt cr ON o.id = cr.order_id
         WHERE o.payment_status = 1 
         AND p.delivery_requires_receipt = 1
         AND (cr.receipt_data IS NULL OR cr.receipt_data = '')`
      );
      pendingReceipt = needReceiptFill[0].count || 0;
    } catch (err) {
      console.log('产品或回执单表查询失败:', err.message);
    }

    const unshipped = unshippedOrders[0].count || 0;
    const total = pendingModification + unshipped;

    res.json({
      code: 0,
      msg: 'success',
      data: {
        total: total,
        pendingModification: pendingModification,
        unshipped: unshipped,
        pendingReceipt: pendingReceipt,
        breakdown: [
          { name: '待修改回执单', value: pendingModification },
          { name: '待发货', value: unshipped },
          { name: '待填写回执单', value: pendingReceipt }
        ]
      }
    });
  } catch (error) {
    console.error('获取待处理订单统计失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取待处理订单统计失败'
    });
  }
});

// 获取支付方式统计
router.get('/payment-methods', async (req, res) => {
  try {
    const [methods] = await pool.execute(
      `SELECT 
        payment_method as method,
        COUNT(*) as count
       FROM \`order\`
       WHERE payment_status = 1
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY payment_method
       ORDER BY count DESC`
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: methods
    });
  } catch (error) {
    console.error('获取支付方式统计失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取支付方式统计失败'
    });
  }
});

// 获取最新交易
router.get('/recent-transactions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [transactions] = await pool.query(
      `SELECT 
        o.order_no as orderNo,
        u.username,
        o.total_amount as amount,
        'consume' as type,
        o.payment_method as method,
        CASE 
          WHEN o.payment_status = 1 THEN 'completed'
          WHEN o.payment_status = 2 THEN 'failed'
          ELSE 'pending'
        END as status,
        o.created_at as time
       FROM \`order\` o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    // Map username to user field for frontend compatibility
    const formattedTransactions = transactions.map(t => ({
      ...t,
      user: t.username,
      username: undefined
    }));
    
    res.json({
      code: 0,
      msg: 'success',
      data: formattedTransactions
    });
  } catch (error) {
    console.error('获取最新交易失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取最新交易失败'
    });
  }
});

// 获取实时订单完成率
router.get('/order-completion-rate', async (req, res) => {
  try {
    const [totalResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM \`order\` WHERE DATE(created_at) = CURDATE()`
    );
    const total = totalResult[0].total;
    
    const [completedResult] = await pool.execute(
      `SELECT COUNT(*) as completed FROM \`order\` 
       WHERE DATE(created_at) = CURDATE() AND status = 'completed'`
    );
    const completed = completedResult[0].completed;
    
    const rate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        rate: parseFloat(rate),
        completed,
        total
      }
    });
  } catch (error) {
    console.error('获取订单完成率失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取订单完成率失败'
    });
  }
});

export default router;