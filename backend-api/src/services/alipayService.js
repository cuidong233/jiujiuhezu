import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { AlipaySdk } = require('alipay-sdk');
import { alipayConfig, validateAlipayConfig } from '../config/alipay.config.js';
import crypto from 'crypto';

class AlipayService {
  constructor() {
    // 验证配置
    const isConfigValid = validateAlipayConfig();
    
    if (!isConfigValid) {
      console.error('❌ 支付宝配置验证失败！');
      console.error('当前配置:', {
        appId: alipayConfig.appId ? '已设置' : '❌ 未设置',
        privateKey: alipayConfig.privateKey ? '已设置' : '❌ 未设置',
        alipayPublicKey: alipayConfig.alipayPublicKey ? '已设置' : '❌ 未设置',
        gateway: alipayConfig.gateway,
        notifyUrl: alipayConfig.notifyUrl,
        returnUrl: alipayConfig.returnUrl
      });
      throw new Error('支付宝配置不完整，请检查 ALIPAY_APP_ID 等环境变量');
    }
    
    console.log('✅ 支付宝配置验证通过');
    console.log('📝 当前环境:', {
      gateway: alipayConfig.gateway,
      appId: alipayConfig.appId ? alipayConfig.appId.substr(0, 8) + '...' : 'undefined'
    });
    
    // 初始化支付宝SDK
    this.alipaySdk = new AlipaySdk({
      appId: alipayConfig.appId,
      privateKey: alipayConfig.privateKey,
      alipayPublicKey: alipayConfig.alipayPublicKey,
      gateway: alipayConfig.gateway,
      signType: alipayConfig.signType,
      charset: alipayConfig.charset,
    });
  }

  /**
   * 创建PC网页支付订单
   * @param {Object} orderData 订单数据
   * @returns {Promise<Object>} 返回支付链接等信息
   */
  async createPagePayment(orderData) {
    try {
      const { orderNo, amount, subject, body, userId } = orderData;
      
      // 构建请求参数
      const bizContent = {
        out_trade_no: orderNo, // 商户订单号
        total_amount: amount.toFixed(2), // 订单金额，保留2位小数
        subject: subject || `久久合租订单-${orderNo}`, // 订单标题
        body: body || '久久合租商品', // 订单描述
        product_code: alipayConfig.productCode, // 产品码
        timeout_express: alipayConfig.timeoutExpress, // 超时时间
        passback_params: encodeURIComponent(JSON.stringify({ userId })), // 公用回传参数
        qr_pay_mode: '2', // 跳转模式
        qrcode_width: 200, // 二维码宽度
      };

      // 调用SDK生成支付页面
      const result = this.alipaySdk.pageExec('alipay.trade.page.pay', {
        method: 'GET',
        bizContent,
        returnUrl: alipayConfig.returnUrl,
        notifyUrl: alipayConfig.notifyUrl,
      });

      return {
        success: true,
        data: {
          payUrl: result, // 支付链接
          orderNo,
          amount,
        },
        message: '支付链接生成成功'
      };
    } catch (error) {
      console.error('创建支付宝支付失败:', error);
      return {
        success: false,
        message: error.message || '创建支付失败',
        error: error
      };
    }
  }

  /**
   * 创建扫码支付订单
   * @param {Object} orderData 订单数据
   * @returns {Promise<Object>} 返回二维码内容等信息
   */
  async createQRPayment(orderData) {
    try {
      const { orderNo, amount, subject, body, userId } = orderData;
      
      console.log('📋 开始创建支付宝二维码支付:', {
        orderNo,
        amount,
        subject
      });
      
      // 构建请求参数
      const bizContent = {
        out_trade_no: orderNo, // 商户订单号
        total_amount: amount.toFixed(2), // 订单金额，保留2位小数
        subject: subject || `久久合租订单-${orderNo}`, // 订单标题
        body: body || '久久合租商品', // 订单描述
        timeout_express: alipayConfig.timeoutExpress, // 超时时间
      };

      console.log('📤 调用alipay.trade.precreate，参数:', bizContent);
      
      // 调用SDK生成预创建订单，返回二维码内容
      const result = await this.alipaySdk.exec('alipay.trade.precreate', {
        bizContent,
        notifyUrl: alipayConfig.notifyUrl,
      });

      console.log('📥 支付宝预创建订单响应:', JSON.stringify(result, null, 2));

      // 检查响应
      if (result.code === '10000') {
        if (result.qrCode) {
          console.log('✅ 成功获取二维码内容:', result.qrCode);
          return {
            success: true,
            data: {
              qrCode: result.qrCode, // 二维码内容
              orderNo,
              amount,
            },
            message: '二维码生成成功'
          };
        } else {
          console.warn('⚠️ 响应成功但没有qrCode字段');
        }
      } else {
        console.error('❌ 预创建订单失败:', {
          code: result.code,
          msg: result.msg,
          subCode: result.subCode,
          subMsg: result.subMsg
        });
      }
      
      // 如果预创建失败，回退到网页支付
      console.log('📝 回退到网页支付模式');
      return this.createPagePayment(orderData);
      
    } catch (error) {
      console.error('❌ 创建扫码支付异常:', error.message);
      console.error('错误详情:', error);
      
      // 出错时回退到网页支付
      console.log('📝 因异常回退到网页支付模式');
      return this.createPagePayment(orderData);
    }
  }

  /**
   * 查询订单状态
   * @param {String} orderNo 商户订单号
   * @returns {Promise<Object>} 订单状态信息
   */
  async queryOrder(orderNo) {
    try {
      const bizContent = {
        out_trade_no: orderNo,
      };

      const result = await this.alipaySdk.exec('alipay.trade.query', {
        bizContent,
      });

      if (result.code === '10000') {
        return {
          success: true,
          data: {
            tradeNo: result.tradeNo, // 支付宝交易号
            orderNo: result.outTradeNo, // 商户订单号
            status: result.tradeStatus, // 交易状态
            amount: result.totalAmount, // 订单金额
            buyerUserId: result.buyerUserId, // 买家支付宝用户号
            payTime: result.sendPayDate, // 支付时间
          }
        };
      } else {
        return {
          success: false,
          message: result.msg || '查询失败',
          code: result.code
        };
      }
    } catch (error) {
      console.error('查询订单失败:', error);
      return {
        success: false,
        message: error.message || '查询失败',
        error: error
      };
    }
  }

  /**
   * 退款
   * @param {Object} refundData 退款数据
   * @returns {Promise<Object>} 退款结果
   */
  async refund(refundData) {
    try {
      const { orderNo, refundAmount, refundReason, refundNo } = refundData;
      
      const bizContent = {
        out_trade_no: orderNo,
        refund_amount: refundAmount.toFixed(2),
        refund_reason: refundReason || '正常退款',
        out_request_no: refundNo || `refund_${orderNo}_${Date.now()}`,
      };

      const result = await this.alipaySdk.exec('alipay.trade.refund', {
        bizContent,
      });

      if (result.code === '10000') {
        return {
          success: true,
          data: {
            tradeNo: result.tradeNo,
            orderNo: result.outTradeNo,
            refundFee: result.refundFee,
            refundTime: result.gmtRefundPay,
          },
          message: '退款成功'
        };
      } else {
        return {
          success: false,
          message: result.msg || '退款失败',
          code: result.code
        };
      }
    } catch (error) {
      console.error('退款失败:', error);
      return {
        success: false,
        message: error.message || '退款失败',
        error: error
      };
    }
  }

  /**
   * 关闭订单
   * @param {String} orderNo 商户订单号
   * @returns {Promise<Object>} 关闭结果
   */
  async closeOrder(orderNo) {
    try {
      const bizContent = {
        out_trade_no: orderNo,
      };

      const result = await this.alipaySdk.exec('alipay.trade.close', {
        bizContent,
      });

      if (result.code === '10000') {
        return {
          success: true,
          message: '订单关闭成功'
        };
      } else {
        return {
          success: false,
          message: result.msg || '关闭订单失败',
          code: result.code
        };
      }
    } catch (error) {
      console.error('关闭订单失败:', error);
      return {
        success: false,
        message: error.message || '关闭订单失败',
        error: error
      };
    }
  }

  /**
   * 验证支付宝异步通知签名
   * @param {Object} params 支付宝回调参数
   * @returns {Boolean} 验证结果
   */
  verifyNotify(params) {
    try {
      // 使用SDK内置的验签方法（推荐）
      const result = this.alipaySdk.checkNotifySign(params);
      
      if (!result) {
        console.error('支付宝签名验证失败', {
          orderNo: params.out_trade_no,
          tradeNo: params.trade_no
        });
      }
      
      return result;
    } catch (error) {
      console.error('验证签名异常:', error);
      return false;
    }
  }

  /**
   * 处理支付宝异步通知
   * @param {Object} params 支付宝回调参数
   * @returns {Object} 处理结果
   */
  async handleNotify(params) {
    try {
      // 验证签名
      if (!this.verifyNotify(params)) {
        return {
          success: false,
          message: '签名验证失败'
        };
      }

      // 获取交易状态
      const tradeStatus = params.trade_status;
      const orderNo = params.out_trade_no;
      const tradeNo = params.trade_no;
      const totalAmount = params.total_amount;
      const buyerId = params.buyer_id;
      
      // 解析公用回传参数
      let passbackParams = {};
      if (params.passback_params) {
        try {
          passbackParams = JSON.parse(decodeURIComponent(params.passback_params));
        } catch (e) {
          console.error('解析回传参数失败:', e);
        }
      }

      // 根据交易状态处理
      const result = {
        success: true,
        data: {
          orderNo,
          tradeNo,
          amount: totalAmount,
          buyerId,
          userId: passbackParams.userId,
          status: tradeStatus,
        }
      };

      // 交易成功状态
      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        result.data.paid = true;
        result.message = '支付成功';
      } else if (tradeStatus === 'WAIT_BUYER_PAY') {
        result.data.paid = false;
        result.message = '等待支付';
      } else if (tradeStatus === 'TRADE_CLOSED') {
        result.data.paid = false;
        result.message = '交易关闭';
      }

      return result;
    } catch (error) {
      console.error('处理支付宝通知失败:', error);
      return {
        success: false,
        message: error.message || '处理通知失败',
        error: error
      };
    }
  }
}

// 导出单例 - 延迟初始化以避免启动错误
let alipayServiceInstance = null;

export default {
  getInstance() {
    if (!alipayServiceInstance) {
      try {
        alipayServiceInstance = new AlipayService();
      } catch (error) {
        console.warn('支付宝服务初始化失败，部分功能将不可用:', error.message);
        alipayServiceInstance = null;
      }
    }
    return alipayServiceInstance;
  }
};