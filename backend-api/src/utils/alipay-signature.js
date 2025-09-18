import crypto from 'crypto';

/**
 * 支付宝签名验证工具
 * 符合支付宝官方签名规范
 */
export class AlipaySignatureUtil {
  
  /**
   * 验证支付宝异步通知签名
   * @param {Object} params 支付宝回调的所有参数
   * @param {String} alipayPublicKey 支付宝公钥
   * @returns {Boolean} 验证结果
   */
  static verifySignature(params, alipayPublicKey) {
    try {
      // 1. 提取签名
      const sign = params.sign;
      const signType = params.sign_type || 'RSA2';
      
      if (!sign) {
        console.error('签名为空');
        return false;
      }
      
      // 2. 准备验签参数（排除sign和sign_type）
      const signParams = {};
      for (const key in params) {
        if (key !== 'sign' && key !== 'sign_type' && params[key]) {
          signParams[key] = params[key];
        }
      }
      
      // 3. 按字母顺序排序参数
      const sortedKeys = Object.keys(signParams).sort();
      
      // 4. 拼接成字符串
      const signStr = sortedKeys
        .map(key => `${key}=${signParams[key]}`)
        .join('&');
      
      console.log('待验签字符串:', signStr.substring(0, 100) + '...');
      
      // 5. 格式化公钥
      const publicKey = this.formatPublicKey(alipayPublicKey);
      
      // 6. 创建验证器
      const algorithm = signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1';
      const verifier = crypto.createVerify(algorithm);
      verifier.update(signStr, 'utf-8');
      
      // 7. 验证签名
      const result = verifier.verify(publicKey, sign, 'base64');
      
      if (!result) {
        console.error('签名验证失败', {
          signType,
          signLength: sign.length,
          paramsCount: sortedKeys.length
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('验证签名异常:', error);
      return false;
    }
  }
  
  /**
   * 格式化公钥
   * @param {String} key 公钥内容
   * @returns {String} 格式化后的公钥
   */
  static formatPublicKey(key) {
    // 移除所有空白字符
    let publicKey = key.replace(/\s+/g, '');
    
    // 如果已经包含头尾标记，直接返回
    if (publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
      return key;
    }
    
    // 添加PEM格式的头尾
    const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    
    // 每64个字符换行（PEM标准）
    const formatted = pemKey.replace(/(.{64})/g, '$1\n');
    
    return formatted;
  }
  
  /**
   * 生成签名（用于测试或请求支付宝接口）
   * @param {Object} params 请求参数
   * @param {String} privateKey 商户私钥
   * @param {String} signType 签名类型
   * @returns {String} 签名结果
   */
  static generateSignature(params, privateKey, signType = 'RSA2') {
    try {
      // 1. 排序参数
      const sortedKeys = Object.keys(params).sort();
      
      // 2. 拼接字符串
      const signStr = sortedKeys
        .filter(key => params[key] !== undefined && params[key] !== '')
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      // 3. 格式化私钥
      const formattedKey = this.formatPrivateKey(privateKey);
      
      // 4. 创建签名器
      const algorithm = signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1';
      const signer = crypto.createSign(algorithm);
      signer.update(signStr, 'utf-8');
      
      // 5. 生成签名
      const signature = signer.sign(formattedKey, 'base64');
      
      return signature;
      
    } catch (error) {
      console.error('生成签名失败:', error);
      throw error;
    }
  }
  
  /**
   * 格式化私钥
   * @param {String} key 私钥内容
   * @returns {String} 格式化后的私钥
   */
  static formatPrivateKey(key) {
    // 移除所有空白字符
    let privateKey = key.replace(/\s+/g, '');
    
    // 如果已经包含头尾标记，直接返回
    if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----') || 
        privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return key;
    }
    
    // 添加PEM格式的头尾（RSA私钥）
    const pemKey = `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;
    
    // 每64个字符换行（PEM标准）
    const formatted = pemKey.replace(/(.{64})/g, '$1\n');
    
    return formatted;
  }
  
  /**
   * 验证金额是否被篡改
   * @param {String} orderNo 订单号
   * @param {Number} receivedAmount 收到的金额
   * @param {Number} expectedAmount 期望的金额
   * @returns {Boolean} 验证结果
   */
  static verifyAmount(orderNo, receivedAmount, expectedAmount) {
    const received = parseFloat(receivedAmount);
    const expected = parseFloat(expectedAmount);
    
    // 允许0.01的误差（浮点数精度问题）
    const diff = Math.abs(received - expected);
    
    if (diff > 0.01) {
      console.error(`金额不匹配！订单${orderNo}: 期望${expected}, 收到${received}`);
      return false;
    }
    
    return true;
  }
}

export default AlipaySignatureUtil;