import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 支付宝配置
export const alipayConfig = {
  // 支付宝应用ID
  appId: process.env.ALIPAY_APP_ID || '2021005151651668',
  
  // 支付宝网关
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  
  // 应用私钥（请将实际私钥内容存储在环境变量或密钥文件中）
  privateKey: process.env.ALIPAY_PRIVATE_KEY || (() => {
    try {
      return fs.readFileSync(
        path.join(__dirname, '../certs/alipay/privateKey.txt'), 
        'utf8'
      ).trim();
    } catch (error) {
      console.log('支付宝私钥文件未找到于:', path.join(__dirname, '../certs/alipay/privateKey.txt'));
      return '';
    }
  })(),
  
  // 支付宝公钥（用于验签）
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || (() => {
    try {
      return fs.readFileSync(
        path.join(__dirname, '../certs/alipay/alipayPublicKey.txt'), 
        'utf8'
      ).trim();
    } catch (error) {
      console.log('支付宝公钥文件未找到于:', path.join(__dirname, '../certs/alipay/alipayPublicKey.txt'));
      return '';
    }
  })(),
  
  // 签名类型
  signType: 'RSA2',
  
  // 字符编码
  charset: 'utf-8',
  
  // 支付成功后的回调地址
  notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'https://en.jjhezu.com/api/payment/alipay/callback',
  
  // 支付成功后的跳转地址
  returnUrl: process.env.ALIPAY_RETURN_URL || 'https://www.jjhezu.com/user/order',
  
  // 订单超时时间（分钟）
  timeoutExpress: '30m',
  
  // 产品码，PC网页支付为FAST_INSTANT_TRADE_PAY
  productCode: 'FAST_INSTANT_TRADE_PAY'
};

// 验证配置是否完整
export function validateAlipayConfig() {
  const required = ['appId', 'privateKey', 'alipayPublicKey'];
  const missing = [];
  
  for (const field of required) {
    if (!alipayConfig[field]) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    // 返回 false 而不是抛出错误
    return false;
  }
  
  return true;
}