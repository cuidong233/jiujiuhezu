import WxPay from 'wechatpay-node-v3';
import { wechatConfig } from '../config/wechat.config.js';
import crypto from 'crypto';
import axios from 'axios';

class WechatPayService {
  constructor() {
    this.wxpay = null;
    this.initPay();
  }

  initPay() {
    console.log('初始化微信支付SDK...');
    console.log('配置信息:', {
      hasPrivateKey: !!wechatConfig.pay.privateKey,
      hasCertificate: !!wechatConfig.pay.certificate,
      appId: wechatConfig.appId,
      mchId: wechatConfig.pay.mchId,
      apiV3Key: wechatConfig.pay.apiV3Key,
      certSerialNo: wechatConfig.pay.certSerialNo
    });
    
    if (!wechatConfig.pay.privateKey || !wechatConfig.pay.certificate) {
      console.error('微信支付证书未配置');
      return;
    }

    try {
      this.wxpay = new WxPay({
        appid: wechatConfig.appId,
        mchid: wechatConfig.pay.mchId,
        publicKey: wechatConfig.pay.certificate,
        privateKey: wechatConfig.pay.privateKey,
        key: wechatConfig.pay.apiV3Key,
        serial_no: wechatConfig.pay.certSerialNo
      });
      console.log('微信支付SDK初始化成功');
    } catch (error) {
      console.error('微信支付SDK初始化失败:', error);
      this.wxpay = null;
    }
  }

  /**
   * 创建H5支付订单
   */
  async createH5Payment(orderData) {
    try {
      if (!this.wxpay) {
        console.error('微信支付SDK未初始化');
        throw new Error('支付服务暂时不可用');
      }
      
      console.log('创建H5支付订单:', orderData);
      const params = {
        appid: wechatConfig.appId,
        mchid: wechatConfig.pay.mchId,
        description: orderData.description || '久久合租商品',
        out_trade_no: orderData.orderNo,
        notify_url: wechatConfig.pay.notifyUrl,
        amount: {
          total: Math.round(orderData.amount * 100),
          currency: 'CNY'
        },
        scene_info: {
          payer_client_ip: orderData.clientIp || '127.0.0.1',
          h5_info: {
            type: 'Wap',
            app_name: '久久合租',
            app_url: orderData.appUrl || 'https://jjhezu.com'
          }
        }
      };

      const result = await this.wxpay.transactions_h5(params);
      console.log('H5支付结果:', result);
      
      return {
        success: true,
        data: {
          payUrl: result.h5_url,
          orderNo: orderData.orderNo
        }
      };
    } catch (error) {
      console.error('创建H5支付失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建JSAPI支付订单（公众号/小程序支付）
   */
  async createJSAPIPayment(orderData) {
    try {
      if (!orderData.openId) {
        throw new Error('JSAPI支付需要用户OpenID');
      }

      const params = {
        appid: wechatConfig.appId,
        mchid: wechatConfig.pay.mchId,
        description: orderData.description || '久久合租商品',
        out_trade_no: orderData.orderNo,
        notify_url: wechatConfig.pay.notifyUrl,
        amount: {
          total: Math.round(orderData.amount * 100),
          currency: 'CNY'
        },
        payer: {
          openid: orderData.openId
        }
      };

      const result = await this.wxpay.transactions_jsapi(params);
      
      const timeStamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = this.generateNonceStr();
      const packageStr = `prepay_id=${result.prepay_id}`;
      
      const paySign = this.generatePaySign({
        appId: wechatConfig.appId,
        timeStamp,
        nonceStr,
        package: packageStr
      });

      return {
        success: true,
        data: {
          appId: wechatConfig.appId,
          timeStamp,
          nonceStr,
          package: packageStr,
          signType: 'RSA',
          paySign,
          prepayId: result.prepay_id
        }
      };
    } catch (error) {
      console.error('创建JSAPI支付失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建Native支付（扫码支付）
   */
  async createNativePayment(orderData) {
    try {
      console.log('创建Native支付订单:', orderData);
      
      if (!this.wxpay) {
        console.error('微信支付SDK未初始化');
        
        // 检查是否因为证书问题
        if (!wechatConfig.pay.privateKey || !wechatConfig.pay.certificate) {
          console.error('微信支付证书未配置，返回测试二维码');
          // 返回测试二维码用于展示
          return {
            success: true,
            data: {
              codeUrl: `weixin://wxpay/bizpayurl?pr=DEMO${Date.now()}`,
              orderNo: orderData.orderNo,
              message: '支付证书未配置，暂时使用测试二维码'
            }
          };
        }
        
        throw new Error('支付服务暂时不可用');
      }
      
      const params = {
        appid: wechatConfig.appId,
        mchid: wechatConfig.pay.mchId,
        description: orderData.description || '久久合租商品',
        out_trade_no: orderData.orderNo,
        notify_url: wechatConfig.pay.notifyUrl,
        amount: {
          total: Math.round(orderData.amount * 100),
          currency: 'CNY'
        }
      };

      console.log('调用微信Native支付API，参数:', params);
      const result = await this.wxpay.transactions_native(params);
      console.log('Native支付API响应:', result);
      
      // 处理可能的响应格式
      if (result && result.code_url) {
        return {
          success: true,
          data: {
            codeUrl: result.code_url,
            orderNo: orderData.orderNo
          }
        };
      } else if (result && result.data && result.data.code_url) {
        return {
          success: true,
          data: {
            codeUrl: result.data.code_url,
            orderNo: orderData.orderNo
          }
        };
      } else {
        console.error('微信支付响应格式异常:', result);
        throw new Error('支付响应格式错误');
      }
    } catch (error) {
      console.error('创建Native支付失败，详细错误:', error);
      console.error('错误堆栈:', error.stack);
      
      // 如果是认证相关错误，返回提示
      if (error.message && (error.message.includes('证书') || error.message.includes('认证') || error.message.includes('401'))) {
        return {
          success: false,
          error: '微信支付商户认证失败，请检查配置',
          data: null
        };
      }
      
      // 其他错误
      return {
        success: false,
        error: error.message || '创建支付订单失败',
        data: null
      };
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrder(orderNo) {
    try {
      console.log(`查询订单状态: ${orderNo}`);
      
      // 使用 wechatpay-node-v3 SDK 的 query 方法
      const result = await this.wxpay.query({
        out_trade_no: orderNo,
        mchid: wechatConfig.pay.mchId
      });
      
      console.log('查询结果:', JSON.stringify(result, null, 2));

      // 处理返回的数据结构
      if (!result) {
        return {
          success: false,
          error: '订单不存在'
        };
      }

      return {
        success: true,
        data: result  // 直接返回全部数据，让前端处理
      };
    } catch (error) {
      console.error('查询订单失败:', error);
      console.error('错误详情:', error.response?.data || error.message);
      
      // 如果是404错误或订单不存在
      if (error.response?.status === 404 || error.message?.includes('ORDERNOTEXIST') || error.message?.includes('ORDER_NOT_EXIST')) {
        return {
          success: false,
          error: '订单不存在或未支付'
        };
      }
      
      return {
        success: false,
        error: error.message || '查询失败'
      };
    }
  }

  /**
   * 关闭订单
   */
  async closeOrder(orderNo) {
    try {
      await this.wxpay.close(orderNo);

      return {
        success: true,
        message: '订单已关闭'
      };
    } catch (error) {
      console.error('关闭订单失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 申请退款
   */
  async refund(refundData) {
    try {
      const params = {
        out_trade_no: refundData.orderNo,
        out_refund_no: refundData.refundNo,
        reason: refundData.reason || '用户申请退款',
        notify_url: `${wechatConfig.pay.notifyUrl}/refund`,
        amount: {
          refund: Math.round(refundData.refundAmount * 100),
          total: Math.round(refundData.totalAmount * 100),
          currency: 'CNY'
        }
      };

      if (refundData.transactionId) {
        params.transaction_id = refundData.transactionId;
      }

      const result = await this.wxpay.refunds(params);

      return {
        success: true,
        data: {
          refundId: result.refund_id,
          outRefundNo: result.out_refund_no,
          transactionId: result.transaction_id,
          outTradeNo: result.out_trade_no,
          status: result.status,
          amount: result.amount
        }
      };
    } catch (error) {
      console.error('退款失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 查询退款
   */
  async queryRefund(refundNo) {
    try {
      const result = await this.wxpay.find_refunds({
        out_refund_no: refundNo
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('查询退款失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 验证支付回调签名
   */
  async verifyNotification(headers, body) {
    try {
      if (!this.wxpay) {
        console.error('微信支付SDK未初始化，无法验证签名');
        return false;
      }
      
      const signature = headers['wechatpay-signature'];
      const timestamp = headers['wechatpay-timestamp'];
      const nonce = headers['wechatpay-nonce'];
      const serial = headers['wechatpay-serial'];
      
      // 构建待验签串
      const message = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
      
      // 使用SDK验证签名
      const result = this.wxpay.verifySign({
        timestamp,
        nonce,
        body: JSON.stringify(body),
        signature,
        serial
      });

      console.log('验签结果:', result);
      return result;
    } catch (error) {
      console.error('验证签名失败:', error);
      return false;
    }
  }

  /**
   * 解密回调数据
   */
  decryptNotification(resource) {
    try {
      if (!this.wxpay) {
        console.error('微信支付SDK未初始化，无法解密数据');
        return null;
      }
      
      const { ciphertext, nonce, associated_data } = resource;
      
      // 使用SDK的解密方法
      const result = this.wxpay.decipher_gcm(
        ciphertext,
        associated_data,
        nonce,
        wechatConfig.pay.apiV3Key
      );
      
      // 解析解密后的JSON数据
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
      
      return result;
    } catch (error) {
      console.error('解密回调数据失败:', error);
      console.error('Resource数据:', resource);
      return null;
    }
  }

  /**
   * 生成随机字符串
   */
  generateNonceStr(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成支付签名
   */
  generatePaySign(params) {
    const message = `${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`;
    
    const sign = crypto
      .createSign('RSA-SHA256')
      .update(message)
      .sign(wechatConfig.pay.privateKey, 'base64');
    
    return sign;
  }

  /**
   * 获取用户OpenID
   */
  async getOpenId(code) {
    try {
      const url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
      const params = {
        appid: wechatConfig.appId,
        secret: wechatConfig.appSecret,
        code: code,
        grant_type: 'authorization_code'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      return {
        success: true,
        data: {
          openId: response.data.openid,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in
        }
      };
    } catch (error) {
      console.error('获取OpenID失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new WechatPayService();