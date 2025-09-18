import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { AlipaySdk } = require('alipay-sdk');
import { alipayConfig, validateAlipayConfig } from '../config/alipay.config.js';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// 配置日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/alipay-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/alipay-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class AlipayService {
  constructor() {
    try {
      // 验证配置
      validateAlipayConfig();
      
      // 初始化支付宝SDK
      this.alipaySdk = new AlipaySdk({
        appId: alipayConfig.appId,
        privateKey: alipayConfig.privateKey,
        alipayPublicKey: alipayConfig.alipayPublicKey,
        gateway: alipayConfig.gateway,
        signType: alipayConfig.signType,
        charset: alipayConfig.charset,
        timeout: 5000, // 添加超时设置
        camelcase: false, // 保持原始字段名
      });
      
      logger.info('支付宝SDK初始化成功');
    } catch (error) {
      logger.error('支付宝SDK初始化失败:', error);
      throw error;
    }
  }

  /**
   * 创建PC网页支付订单（生产版本）
   */
  async createPagePayment(orderData) {
    const startTime = Date.now();
    const traceId = `${orderData.orderNo}_${startTime}`;
    
    try {
      const { orderNo, amount, subject, body, userId } = orderData;
      
      // 参数验证
      if (!orderNo || typeof orderNo !== 'string') {
        throw new Error('订单号无效');
      }
      
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('订单金额无效');
      }
      
      // 防止重复支付 - 应该查询数据库确认订单状态
      // const existingOrder = await this.checkOrderStatus(orderNo);
      // if (existingOrder && existingOrder.paid) {
      //   throw new Error('订单已支付');
      // }
      
      logger.info(`创建支付订单 [${traceId}]`, {
        orderNo,
        amount,
        userId
      });
      
      // 构建请求参数
      const bizContent = {
        out_trade_no: orderNo,
        total_amount: amount.toFixed(2),
        subject: subject || `订单-${orderNo}`,
        body: body || '商品',
        product_code: alipayConfig.productCode,
        timeout_express: alipayConfig.timeoutExpress,
        passback_params: encodeURIComponent(JSON.stringify({ 
          userId,
          timestamp: Date.now(),
          traceId
        })),
        qr_pay_mode: '2',
        qrcode_width: 200,
        // 防钓鱼参数
        extern_token: userId,
        // 商户门店编号
        store_id: process.env.STORE_ID || 'DEFAULT',
      };

      // 生成支付页面URL
      const result = this.alipaySdk.pageExec('alipay.trade.page.pay', {
        method: 'GET',
        bizContent,
        returnUrl: alipayConfig.returnUrl,
        notifyUrl: alipayConfig.notifyUrl,
      });

      const duration = Date.now() - startTime;
      logger.info(`支付链接生成成功 [${traceId}]`, {
        orderNo,
        duration
      });

      return {
        success: true,
        data: {
          payUrl: result,
          orderNo,
          amount,
          traceId
        },
        message: '支付链接生成成功'
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`创建支付失败 [${traceId}]`, {
        error: error.message,
        stack: error.stack,
        orderData,
        duration
      });
      
      return {
        success: false,
        message: error.message || '创建支付失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      };
    }
  }

  /**
   * 验证支付宝异步通知签名（生产版本）
   */
  async verifyNotify(params) {
    try {
      // 使用SDK的验证方法
      const verified = this.alipaySdk.checkNotifySign(params);
      
      if (!verified) {
        logger.warn('签名验证失败', {
          params: {
            trade_no: params.trade_no,
            out_trade_no: params.out_trade_no,
            app_id: params.app_id
          }
        });
      }
      
      return verified;
    } catch (error) {
      logger.error('验证签名异常:', error);
      return false;
    }
  }

  /**
   * 处理支付宝异步通知（生产版本）
   */
  async handleNotify(params) {
    const startTime = Date.now();
    
    try {
      // 1. 验证签名
      const isValid = await this.verifyNotify(params);
      if (!isValid) {
        logger.error('支付宝回调签名验证失败', { params });
        return {
          success: false,
          message: '签名验证失败'
        };
      }

      // 2. 验证app_id
      if (params.app_id !== alipayConfig.appId) {
        logger.error('AppID不匹配', {
          received: params.app_id,
          expected: alipayConfig.appId
        });
        return {
          success: false,
          message: 'AppID验证失败'
        };
      }

      // 3. 验证卖家ID（如果配置了）
      if (process.env.ALIPAY_SELLER_ID && params.seller_id !== process.env.ALIPAY_SELLER_ID) {
        logger.error('卖家ID不匹配', {
          received: params.seller_id,
          expected: process.env.ALIPAY_SELLER_ID
        });
        return {
          success: false,
          message: '卖家ID验证失败'
        };
      }

      // 4. 处理不同的交易状态
      const tradeStatus = params.trade_status;
      const orderNo = params.out_trade_no;
      const tradeNo = params.trade_no;
      const totalAmount = parseFloat(params.total_amount);
      const buyerId = params.buyer_id;
      
      // 解析回传参数
      let passbackParams = {};
      if (params.passback_params) {
        try {
          passbackParams = JSON.parse(decodeURIComponent(params.passback_params));
        } catch (e) {
          logger.warn('解析回传参数失败:', e);
        }
      }

      logger.info(`处理支付通知 [${orderNo}]`, {
        tradeStatus,
        tradeNo,
        totalAmount,
        buyerId,
        duration: Date.now() - startTime
      });

      // 5. 根据状态处理业务逻辑
      const result = {
        success: true,
        data: {
          orderNo,
          tradeNo,
          amount: totalAmount,
          buyerId,
          userId: passbackParams.userId,
          status: tradeStatus,
          traceId: passbackParams.traceId
        }
      };

      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        // 支付成功
        result.data.paid = true;
        result.message = '支付成功';
        
        // TODO: 这里应该调用订单服务更新订单状态
        // await orderService.markAsPaid(orderNo, {
        //   tradeNo,
        //   amount: totalAmount,
        //   buyerId,
        //   paidAt: new Date()
        // });
        
        logger.info(`订单支付成功 [${orderNo}]`, {
          tradeNo,
          amount: totalAmount
        });
        
      } else if (tradeStatus === 'WAIT_BUYER_PAY') {
        result.data.paid = false;
        result.message = '等待支付';
      } else if (tradeStatus === 'TRADE_CLOSED') {
        result.data.paid = false;
        result.message = '交易关闭';
        
        // TODO: 更新订单为关闭状态
        // await orderService.markAsClosed(orderNo);
      }

      return result;
      
    } catch (error) {
      logger.error('处理支付宝通知失败:', {
        error: error.message,
        stack: error.stack,
        params
      });
      
      return {
        success: false,
        message: error.message || '处理通知失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      };
    }
  }

  /**
   * 查询订单状态（生产版本）
   */
  async queryOrder(orderNo) {
    try {
      logger.info(`查询订单状态: ${orderNo}`);
      
      const bizContent = {
        out_trade_no: orderNo,
      };

      const result = await this.alipaySdk.exec('alipay.trade.query', {
        bizContent,
        needEncrypt: true, // 使用加密
      });

      if (result.code === '10000') {
        logger.info(`订单查询成功: ${orderNo}`, {
          status: result.tradeStatus,
          amount: result.totalAmount
        });
        
        return {
          success: true,
          data: {
            tradeNo: result.tradeNo,
            orderNo: result.outTradeNo,
            status: result.tradeStatus,
            amount: result.totalAmount,
            buyerUserId: result.buyerUserId,
            payTime: result.sendPayDate,
          }
        };
      } else {
        logger.warn(`订单查询失败: ${orderNo}`, {
          code: result.code,
          msg: result.msg
        });
        
        return {
          success: false,
          message: result.msg || '查询失败',
          code: result.code
        };
      }
    } catch (error) {
      logger.error('查询订单异常:', error);
      return {
        success: false,
        message: error.message || '查询失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      };
    }
  }

  /**
   * 退款（生产版本）
   */
  async refund(refundData) {
    try {
      const { orderNo, refundAmount, refundReason, refundNo } = refundData;
      
      // 生成退款单号
      const outRequestNo = refundNo || `refund_${orderNo}_${Date.now()}`;
      
      logger.info(`发起退款请求`, {
        orderNo,
        refundAmount,
        outRequestNo
      });
      
      const bizContent = {
        out_trade_no: orderNo,
        refund_amount: refundAmount.toFixed(2),
        refund_reason: refundReason || '正常退款',
        out_request_no: outRequestNo,
        // 退款币种
        refund_currency: 'CNY',
      };

      const result = await this.alipaySdk.exec('alipay.trade.refund', {
        bizContent,
        needEncrypt: true,
      });

      if (result.code === '10000') {
        logger.info(`退款成功`, {
          orderNo,
          refundAmount: result.refundFee,
          outRequestNo
        });
        
        return {
          success: true,
          data: {
            tradeNo: result.tradeNo,
            orderNo: result.outTradeNo,
            refundFee: result.refundFee,
            refundTime: result.gmtRefundPay,
            refundNo: outRequestNo
          },
          message: '退款成功'
        };
      } else {
        logger.error(`退款失败`, {
          orderNo,
          code: result.code,
          msg: result.msg
        });
        
        return {
          success: false,
          message: result.msg || '退款失败',
          code: result.code
        };
      }
    } catch (error) {
      logger.error('退款异常:', error);
      return {
        success: false,
        message: error.message || '退款失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      };
    }
  }
}

// 导出单例
export default new AlipayService();