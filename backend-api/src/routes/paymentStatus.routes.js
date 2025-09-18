import express from 'express';
import paymentNotificationService from '../services/paymentNotificationService.js';

const router = express.Router();

/**
 * 获取最近的支付成功记录（用于后台展示）
 */
router.get('/recent-payments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentPayments = paymentNotificationService.getRecentPayments(limit);
    
    res.json({
      code: 0,
      message: 'success',
      data: recentPayments
    });
  } catch (error) {
    console.error('获取最近支付记录失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取待支付订单（用于后台监控）
 */
router.get('/pending-payments', async (req, res) => {
  try {
    const pendingPayments = paymentNotificationService.getPendingPayments();
    
    res.json({
      code: 0,
      message: 'success',
      data: pendingPayments
    });
  } catch (error) {
    console.error('获取待支付订单失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取订单支付状态（前台轮询使用）
 */
router.get('/status/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    const status = paymentNotificationService.getPaymentStatus(orderNo);
    
    res.json({
      code: 0,
      message: 'success',
      data: status
    });
  } catch (error) {
    console.error('获取支付状态失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * SSE (Server-Sent Events) 实时推送支付状态
 * 前台和后台可以通过这个接口实时接收支付通知
 */
router.get('/stream', (req, res) => {
  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 发送初始连接成功消息
  res.write('data: {"type":"connected","message":"实时支付通知已连接"}\n\n');

  // 监听支付成功事件
  const onPaymentSuccess = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'paymentSuccess',
      ...data
    })}\n\n`);
  };

  // 监听订单创建事件
  const onOrderCreated = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'orderCreated',
      ...data
    })}\n\n`);
  };

  // 监听订单过期事件
  const onOrderExpired = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'orderExpired',
      ...data
    })}\n\n`);
  };

  // 注册事件监听器
  paymentNotificationService.on('paymentSuccess', onPaymentSuccess);
  paymentNotificationService.on('orderCreated', onOrderCreated);
  paymentNotificationService.on('orderExpired', onOrderExpired);

  // 定期发送心跳包保持连接
  const heartbeat = setInterval(() => {
    res.write('data: {"type":"heartbeat"}\n\n');
  }, 30000);

  // 客户端断开连接时清理
  req.on('close', () => {
    paymentNotificationService.off('paymentSuccess', onPaymentSuccess);
    paymentNotificationService.off('orderCreated', onOrderCreated);
    paymentNotificationService.off('orderExpired', onOrderExpired);
    clearInterval(heartbeat);
    console.log('SSE连接已断开');
  });
});

/**
 * 获取支付统计信息（用于后台仪表板）
 */
router.get('/statistics', async (req, res) => {
  try {
    const recentPayments = paymentNotificationService.getRecentPayments(100);
    const pendingPayments = paymentNotificationService.getPendingPayments();
    
    // 计算统计数据
    const totalAmount = recentPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const avgAmount = recentPayments.length > 0 ? totalAmount / recentPayments.length : 0;
    
    const statistics = {
      todayPayments: recentPayments.filter(p => {
        const today = new Date().toDateString();
        return new Date(p.paidAt).toDateString() === today;
      }).length,
      totalPayments: recentPayments.length,
      pendingPayments: pendingPayments.length,
      totalAmount: totalAmount.toFixed(2),
      avgAmount: avgAmount.toFixed(2),
      recentPayments: recentPayments.slice(0, 5) // 最近5笔
    };
    
    res.json({
      code: 0,
      message: 'success',
      data: statistics
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

export default router;