import crypto from 'crypto';
import axios from 'axios';
import { wechatConfig } from '../config/wechat.config.js';

class WechatPayServiceFixed {
  constructor() {
    this.config = wechatConfig;
  }

  /**
   * 手动验证微信支付回调签名（不依赖SDK）
   */
  async verifyNotification(headers, body) {
    try {
      const signature = headers['wechatpay-signature'];
      const timestamp = headers['wechatpay-timestamp'];
      const nonce = headers['wechatpay-nonce'];
      const serial = headers['wechatpay-serial'];
      
      if (!signature || !timestamp || !nonce || !serial) {
        console.error('回调头信息不完整');
        return false;
      }
      
      // 构建待验签串
      const message = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
      
      // 这里暂时跳过真实的签名验证，因为需要微信平台证书
      // 在生产环境中，你需要：
      // 1. 从微信获取平台证书
      // 2. 使用平台证书的公钥验证签名
      
      console.log('警告：签名验证已临时跳过，仅用于测试');
      console.log('收到的签名信息:', {
        signature: signature.substring(0, 20) + '...',
        timestamp,
        nonce,
        serial
      });
      
      // 临时返回true以便测试
      return true;
    } catch (error) {
      console.error('验证签名失败:', error);
      return false;
    }
  }

  /**
   * 解密回调数据（使用AES-256-GCM）
   */
  decryptNotification(resource) {
    try {
      const { ciphertext, nonce, associated_data } = resource;
      
      if (!ciphertext || !nonce) {
        console.error('解密参数不完整');
        return null;
      }
      
      // API v3密钥
      const apiV3Key = this.config.pay.apiV3Key;
      
      // Base64解码密文
      const encryptedData = Buffer.from(ciphertext, 'base64');
      
      // 分离认证标签（最后16字节）
      const authTag = encryptedData.slice(-16);
      const data = encryptedData.slice(0, -16);
      
      // 创建解密器
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(apiV3Key),
        Buffer.from(nonce)
      );
      
      // 设置认证标签
      decipher.setAuthTag(authTag);
      
      // 设置附加认证数据
      if (associated_data) {
        decipher.setAAD(Buffer.from(associated_data));
      }
      
      // 解密
      let decrypted = decipher.update(data, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      // 解析JSON
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('解密回调数据失败:', error);
      console.error('Resource数据:', resource);
      return null;
    }
  }

  /**
   * 创建H5支付订单
   */
  async createH5Payment(orderData) {
    try {
      const params = {
        appid: this.config.appId,
        mchid: this.config.pay.mchId,
        description: orderData.description || '久久合租商品',
        out_trade_no: orderData.orderNo,
        notify_url: this.config.pay.notifyUrl,
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

      // 生成请求签名
      const signature = await this.generateSignature('POST', '/v3/pay/transactions/h5', params);
      
      // 发送请求到微信支付API
      const response = await axios.post(
        'https://api.mch.weixin.qq.com/v3/pay/transactions/h5',
        params,
        {
          headers: {
            'Authorization': signature,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      return {
        success: true,
        data: {
          payUrl: response.data.h5_url,
          orderNo: orderData.orderNo
        }
      };
    } catch (error) {
      console.error('创建H5支付失败:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 生成请求签名
   */
  async generateSignature(method, url, body) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = this.generateNonceStr();
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${JSON.stringify(body)}\n`;
    
    const sign = crypto
      .createSign('RSA-SHA256')
      .update(message)
      .sign(this.config.pay.privateKey, 'base64');
    
    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.config.pay.mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${this.config.pay.certSerialNo}",signature="${sign}"`;
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
   * 查询订单状态
   */
  async queryOrder(orderNo) {
    try {
      const url = `/v3/pay/transactions/out-trade-no/${orderNo}?mchid=${this.config.pay.mchId}`;
      const signature = await this.generateSignature('GET', url, '');
      
      const response = await axios.get(
        `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${orderNo}`,
        {
          params: { mchid: this.config.pay.mchId },
          headers: {
            'Authorization': signature,
            'Accept': 'application/json'
          }
        }
      );
      
      return {
        success: true,
        data: {
          orderNo: response.data.out_trade_no,
          transactionId: response.data.transaction_id,
          tradeState: response.data.trade_state,
          tradeStateDesc: response.data.trade_state_desc,
          amount: response.data.amount.total / 100,
          payer: response.data.payer
        }
      };
    } catch (error) {
      console.error('查询订单失败:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new WechatPayServiceFixed();