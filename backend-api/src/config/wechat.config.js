import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export const wechatConfig = {
  appId: process.env.WX_APP_ID || '',
  appSecret: process.env.WX_APP_SECRET || '',
  
  pay: {
    mchId: process.env.WX_MCH_ID || '',
    mchKey: process.env.WX_MCH_KEY || '',
    apiV3Key: process.env.WX_API_V3_KEY || '',
    certSerialNo: process.env.WX_CERT_SERIAL_NO || '',
    
    privateKey: process.env.WX_PRIVATE_KEY || (() => {
      try {
        return readFileSync(join(__dirname, '../certs/apiclient_key.pem'), 'utf8');
      } catch (error) {
        console.warn('微信支付私钥文件未找到，请配置私钥路径');
        return '';
      }
    })(),
    
    certificate: process.env.WX_CERTIFICATE || (() => {
      try {
        return readFileSync(join(__dirname, '../certs/apiclient_cert.pem'), 'utf8');
      } catch (error) {
        console.warn('微信支付证书文件未找到，请配置证书路径');
        return '';
      }
    })(),
    
    notifyUrl: process.env.WX_PAY_NOTIFY_URL || 'https://en.api.jjhezu.com/api/wechat/pay/callback',
    
    useSandbox: process.env.WX_USE_SANDBOX === 'true' || false
  }
};

export const validateWechatConfig = () => {
  const required = [
    'appId',
    'appSecret',
    'pay.mchId',
    'pay.mchKey',
    'pay.apiV3Key',
    'pay.certSerialNo'
  ];
  
  const missing = [];
  
  for (const field of required) {
    const keys = field.split('.');
    let value = wechatConfig;
    for (const key of keys) {
      value = value[key];
    }
    if (!value) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    console.error('微信支付配置缺失：', missing.join(', '));
    return false;
  }
  
  return true;
};