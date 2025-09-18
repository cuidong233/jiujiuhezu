import express from 'express';
import alipayServiceWrapper from '../services/alipayService.js';
import paymentNotificationService from '../services/paymentNotificationService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * 创建支付宝支付订单
 * POST /api/payment/alipay/create
 */
router.post('/create', async (req, res) => {
  try {
    const alipayService = alipayServiceWrapper.getInstance();
    if (!alipayService) {
      return res.status(503).json({
        success: false,
        message: '支付宝服务暂不可用'
      });
    }
    
    const { orderNo, amount, subject, body, userId } = req.body;
    
    // 参数验证
    if (!orderNo || !amount) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: orderNo 或 amount'
      });
    }

    // 验证金额格式
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: '无效的金额'
      });
    }

    // 创建扫码支付（优先使用扫码支付）
    const result = await alipayService.createQRPayment({
      orderNo,
      amount: parsedAmount,
      subject,
      body,
      userId: userId || req.user?.id
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('创建支付宝支付失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 查询订单状态
 * GET /api/payment/alipay/query/:orderNo
 */
router.get('/query/:orderNo', async (req, res) => {
  try {
    const alipayService = alipayServiceWrapper.getInstance();
    if (!alipayService) {
      return res.status(503).json({
        success: false,
        message: '支付宝服务暂不可用'
      });
    }
    
    const { orderNo } = req.params;
    
    if (!orderNo) {
      return res.status(400).json({
        success: false,
        message: '缺少订单号'
      });
    }

    const result = await alipayService.queryOrder(orderNo);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('查询订单失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 支付宝异步通知回调
 * POST /api/payment/alipay/callback
 */
router.post('/callback', async (req, res) => {
  try {
    const alipayService = alipayServiceWrapper.getInstance();
    if (!alipayService) {
      return res.send('failure');
    }
    
    console.log('收到支付宝回调:', req.body);
    
    // 处理支付宝通知
    const result = await alipayService.handleNotify(req.body);
    
    if (result.success) {
      // 处理业务逻辑
      if (result.data.paid) {
        console.log(`订单 ${result.data.orderNo} 支付成功`);
        
        // 获取订单和商品信息用于发送邮件
        let productInfo = {};
        try {
          const order = await Order.findOne({ where: { orderNo: result.data.orderNo } });
          console.log(`📋 获取订单信息: ${result.data.orderNo}`, {
            hasOrder: !!order,
            userEmail: order?.userEmail,
            userId: order?.userId,
            productId: order?.productId
          });
          
          if (order) {
            // 确保获取用户邮箱
            if (!order.userEmail) {
              console.warn(`⚠️ 订单 ${result.data.orderNo} 缺少用户邮箱信息`);
            }
            
            productInfo = {
              userEmail: order.userEmail,
              userId: order.userId,
              productName: order.productName || '未知商品'
            };
            
            // 如果有产品ID，获取更多产品信息
            if (order.productId) {
              const product = await Product.findByPk(order.productId);
              if (product) {
                productInfo = {
                  ...productInfo,
                  productName: product.name || order.productName,
                  productInfo: product.description,
                  deliveryMode: product.deliveryMode
                };
              }
            }
            
            console.log(`📧 准备发送邮件信息:`, productInfo);
          } else {
            console.error(`❌ 未找到订单: ${result.data.orderNo}`);
          }
        } catch (err) {
          console.error('获取订单商品信息失败:', err);
        }
        
        // 记录支付成功到通知服务（会触发邮件发送）
        paymentNotificationService.recordPaymentSuccess(result.data.orderNo, {
          amount: result.data.amount,
          payType: 'alipay',
          transactionId: result.data.tradeNo,
          ...productInfo
        });
        
        // 更新订单状态（集成现有MySQL数据库）
        try {
          const orderService = (await import('../services/orderService.js')).default;
          await orderService.updateOrderPayStatus(
            result.data.orderNo,
            result.data.tradeNo,
            result.data.amount,
            4  // 支付类型：4=支付宝
          );
          console.log(`订单 ${result.data.orderNo} 状态更新成功`);
        } catch (updateError) {
          console.error('更新订单状态失败:', updateError);
          // 记录错误但仍返回success，避免支付宝重复通知
        }
      }
      
      // 返回success告知支付宝已收到通知
      res.send('success');
    } else {
      console.error('处理支付宝通知失败:', result.message);
      res.send('fail');
    }
  } catch (error) {
    console.error('处理支付宝回调异常:', error);
    res.send('fail');
  }
});

/**
 * 支付宝同步返回（用户支付后跳转）
 * GET /api/payment/alipay/return
 */
router.get('/return', async (req, res) => {
  try {
    console.log('支付宝同步返回:', req.query);
    
    // 验证签名
    const isValid = alipayService.verifyNotify(req.query);
    
    if (isValid) {
      // 重定向到订单页面
      const returnUrl = process.env.ALIPAY_RETURN_URL || 'https://www.jjhezu.com/user/order';
      res.redirect(`${returnUrl}?orderNo=${req.query.out_trade_no}&status=success`);
    } else {
      res.redirect(`${returnUrl}?status=error&message=签名验证失败`);
    }
  } catch (error) {
    console.error('处理支付宝返回异常:', error);
    res.status(500).send('处理支付返回失败');
  }
});

/**
 * 申请退款
 * POST /api/payment/alipay/refund
 */
router.post('/refund', async (req, res) => {
  try {
    const { orderNo, refundAmount, refundReason, refundNo } = req.body;
    
    // 参数验证
    if (!orderNo || !refundAmount) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: orderNo 或 refundAmount'
      });
    }

    // 验证金额格式
    const parsedAmount = parseFloat(refundAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: '无效的退款金额'
      });
    }

    // 申请退款
    const result = await alipayService.refund({
      orderNo,
      refundAmount: parsedAmount,
      refundReason,
      refundNo
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('申请退款失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 关闭订单
 * POST /api/payment/alipay/close
 */
router.post('/close', async (req, res) => {
  try {
    const { orderNo } = req.body;
    
    if (!orderNo) {
      return res.status(400).json({
        success: false,
        message: '缺少订单号'
      });
    }

    const result = await alipayService.closeOrder(orderNo);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('关闭订单失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

export default router;