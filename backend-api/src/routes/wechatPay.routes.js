import express from 'express';
import wechatPayService from '../services/wechatPayService.js';
import orderService from '../services/orderService.js';
import paymentNotificationService from '../services/paymentNotificationService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * 创建支付订单
 */
router.post('/create',
  [
    body('orderNo').notEmpty().withMessage('订单号不能为空'),
    body('amount').isNumeric().withMessage('金额必须是数字'),
    body('payType').isIn(['h5', 'jsapi', 'native']).withMessage('支付类型无效')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { orderNo, amount, description, payType, openId, clientIp } = req.body;
      
      const orderData = {
        orderNo,
        amount,
        description: description || `久久合租订单-${orderNo}`,
        openId,
        clientIp: clientIp || req.ip
      };

      let result;
      
      switch (payType) {
        case 'h5':
          result = await wechatPayService.createH5Payment(orderData);
          break;
        case 'jsapi':
          if (!openId) {
            return res.status(400).json({
              success: false,
              error: 'JSAPI支付需要提供openId'
            });
          }
          result = await wechatPayService.createJSAPIPayment(orderData);
          break;
        case 'native':
          result = await wechatPayService.createNativePayment(orderData);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: '不支持的支付类型'
          });
      }

      if (result.success) {
        // 记录订单创建
        paymentNotificationService.recordOrderCreated(orderNo, {
          amount,
          description,
          payType,
          createdAt: new Date()
        });
        
        res.json({
          code: 0,
          message: 'success',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '创建支付订单失败'
        });
      }
    } catch (error) {
      console.error('创建支付订单异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 支付回调通知
 */
router.post('/callback', async (req, res) => {
  try {
    console.log('====== 收到微信支付回调 ======');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('================================');

    // 验证签名
    const isValid = await wechatPayService.verifyNotification(req.headers, req.body);
    
    if (!isValid) {
      console.error('回调签名验证失败，请检查：');
      console.error('1. 微信支付证书是否正确配置');
      console.error('2. API v3密钥是否正确');
      console.error('3. 证书序列号是否匹配');
      
      // 临时措施：在开发环境下跳过签名验证
      if (process.env.NODE_ENV === 'development' || process.env.SKIP_WECHAT_VERIFY === 'true') {
        console.warn('⚠️ 警告：开发环境下跳过签名验证，生产环境请勿使用此配置！');
      } else {
        return res.status(401).json({
          code: 'FAIL',
          message: '签名验证失败'
        });
      }
    }

    console.log('签名验证成功');

    const { resource } = req.body;
    if (!resource) {
      console.error('回调数据中没有resource字段');
      return res.status(400).json({
        code: 'FAIL',
        message: '回调数据格式错误'
      });
    }

    const decryptedData = wechatPayService.decryptNotification(resource);
    
    if (!decryptedData) {
      console.error('解密回调数据失败，resource内容:', resource);
      return res.status(400).json({
        code: 'FAIL',
        message: '数据解密失败'
      });
    }

    console.log('解密成功，支付结果:', JSON.stringify(decryptedData, null, 2));

    const { out_trade_no, trade_state, transaction_id } = decryptedData;
    
    if (trade_state === 'SUCCESS') {
      console.log(`====== 订单 ${out_trade_no} 支付成功 ======`);
      console.log(`微信交易号: ${transaction_id}`);
      
      // 更新订单状态到数据库
      try {
        // 获取支付金额（微信支付金额单位是分）
        const paidAmount = decryptedData.amount?.total ? decryptedData.amount.total / 100 : 0;
        console.log(`支付金额: ${paidAmount}元`);
        
        // 获取订单和商品信息用于发送邮件
        let productInfo = {};
        try {
          const order = await Order.findOne({ where: { orderNo: out_trade_no } });
          console.log(`📋 获取订单信息: ${out_trade_no}`, {
            hasOrder: !!order,
            userEmail: order?.userEmail,
            userId: order?.userId,
            productId: order?.productId
          });
          
          if (order) {
            // 确保获取用户邮箱
            if (!order.userEmail) {
              console.warn(`⚠️ 订单 ${out_trade_no} 缺少用户邮箱信息`);
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
            console.error(`❌ 未找到订单: ${out_trade_no}`);
          }
        } catch (err) {
          console.error('获取订单商品信息失败:', err);
        }
        
        // 记录支付成功到通知服务（会触发邮件发送）
        paymentNotificationService.recordPaymentSuccess(out_trade_no, {
          amount: paidAmount,
          payType: 'wechat',
          transactionId: transaction_id,
          successTime: decryptedData.success_time,
          bankType: decryptedData.bank_type,
          tradeType: decryptedData.trade_type,
          ...productInfo
        });
        
        // 更新订单状态为已支付（支付类型：2=微信支付）
        await orderService.updateOrderPayStatus(out_trade_no, transaction_id, paidAmount, 2);
        
        console.log(`订单 ${out_trade_no} 状态已成功更新为已支付`);
      } catch (updateError) {
        console.error('更新订单状态失败，错误详情:', updateError);
        console.error('错误堆栈:', updateError.stack);
        // 即使更新失败也要返回成功，避免微信重复回调
      }
    } else {
      console.log(`订单 ${out_trade_no} 支付状态: ${trade_state}`);
    }

    // 返回成功响应给微信
    res.json({
      code: 'SUCCESS',
      message: '成功'
    });
  } catch (error) {
    console.error('处理支付回调异常:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 'FAIL',
      message: '处理失败'
    });
  }
});

/**
 * 退款回调通知
 */
router.post('/callback/refund', async (req, res) => {
  try {
    console.log('收到微信退款回调:', req.body);

    const isValid = await wechatPayService.verifyNotification(req.headers, req.body);
    
    if (!isValid) {
      return res.status(401).json({
        code: 'FAIL',
        message: '签名验证失败'
      });
    }

    const { resource } = req.body;
    const decryptedData = wechatPayService.decryptNotification(resource);
    
    if (!decryptedData) {
      return res.status(400).json({
        code: 'FAIL',
        message: '数据解密失败'
      });
    }

    console.log('解密后的退款结果:', decryptedData);

    const { out_refund_no, refund_status } = decryptedData;
    
    if (refund_status === 'SUCCESS') {
      console.log(`退款单 ${out_refund_no} 退款成功`);
      
      // TODO: 更新退款状态到数据库
      // await refundService.updateRefundStatus(out_refund_no, 'success');
    }

    res.json({
      code: 'SUCCESS',
      message: '成功'
    });
  } catch (error) {
    console.error('处理退款回调异常:', error);
    res.status(500).json({
      code: 'FAIL',
      message: '处理失败'
    });
  }
});

/**
 * 查询订单状态
 */
router.get('/query/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    const result = await wechatPayService.queryOrder(orderNo);
    
    if (result.success) {
      // 如果查询到支付成功，记录到通知服务
      if (result.data && result.data.data && result.data.data.trade_state === 'SUCCESS') {
        const paymentData = result.data.data;
        
        // 获取订单和商品信息
        let productInfo = {};
        try {
          const order = await Order.findOne({ where: { orderNo } });
          console.log(`📋 获取订单信息: ${orderNo}`, {
            hasOrder: !!order,
            userEmail: order?.userEmail,
            userId: order?.userId,
            productId: order?.productId
          });
          
          if (order) {
            // 确保获取用户邮箱
            if (!order.userEmail) {
              console.warn(`⚠️ 订单 ${orderNo} 缺少用户邮箱信息`);
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
            console.error(`❌ 未找到订单: ${orderNo}`);
          }
        } catch (err) {
          console.error('获取订单商品信息失败:', err);
        }
        
        paymentNotificationService.recordPaymentSuccess(orderNo, {
          amount: paymentData.amount?.total / 100,
          payType: 'wechat',
          transactionId: paymentData.transaction_id,
          successTime: paymentData.success_time,
          bankType: paymentData.bank_type,
          tradeType: paymentData.trade_type,
          ...productInfo
        });
        
        // 同时更新数据库订单状态
        try {
          const paidAmount = paymentData.amount?.total ? paymentData.amount.total / 100 : 0;
          await orderService.updateOrderPayStatus(orderNo, paymentData.transaction_id, paidAmount, 2);
          console.log(`✅ 通过查询接口更新订单 ${orderNo} 为已支付状态`);
        } catch (updateError) {
          console.error('更新订单状态失败:', updateError);
        }
      }
      
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(404).json({
        code: -1,
        message: result.error || '订单不存在'
      });
    }
  } catch (error) {
    console.error('查询订单异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 申请退款
 */
router.post('/refund',
  [
    body('orderNo').notEmpty().withMessage('订单号不能为空'),
    body('refundNo').notEmpty().withMessage('退款单号不能为空'),
    body('refundAmount').isNumeric().withMessage('退款金额必须是数字'),
    body('totalAmount').isNumeric().withMessage('订单总金额必须是数字')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const refundData = req.body;
      
      const result = await wechatPayService.refund(refundData);
      
      if (result.success) {
        res.json({
          code: 0,
          message: 'success',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '退款失败'
        });
      }
    } catch (error) {
      console.error('申请退款异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 查询退款状态
 */
router.get('/refund/query/:refundNo', async (req, res) => {
  try {
    const { refundNo } = req.params;
    
    const result = await wechatPayService.queryRefund(refundNo);
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(404).json({
        code: -1,
        message: result.error || '退款单不存在'
      });
    }
  } catch (error) {
    console.error('查询退款异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 关闭订单
 */
router.post('/close/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    const result = await wechatPayService.closeOrder(orderNo);
    
    if (result.success) {
      res.json({
        code: 0,
        message: result.message
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '关闭订单失败'
      });
    }
  } catch (error) {
    console.error('关闭订单异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取用户OpenID（OAuth2.0）
 */
router.get('/oauth/openid', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        code: -1,
        message: '缺少授权码'
      });
    }
    
    const result = await wechatPayService.getOpenId(code);
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        code: -1,
        message: result.error || '获取OpenID失败'
      });
    }
  } catch (error) {
    console.error('获取OpenID异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

export default router;