import dotenv from 'dotenv';
import pool from '../db/database.js';
import brevoService from './brevoService.js';

dotenv.config();

/**
 * 验证码邮件服务 - 使用Brevo专业邮件服务
 * 适合海外用户，全球送达率高
 */

/**
 * 生成随机验证码
 * @param {number} length - 验证码长度
 * @returns {string} 验证码
 */
const generateCode = (length = 6) => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 保存验证码到数据库
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @param {string} type - 类型
 * @returns {Promise<boolean>} 是否保存成功
 */
const saveCodeToDatabase = async (email, code, type) => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期
    
    // 先将该邮箱之前的未使用验证码标记为已使用
    await pool.execute(
      'UPDATE email_codes SET used = 1 WHERE email = ? AND type = ? AND used = 0',
      [email, type]
    );
    
    // 插入新验证码（添加created_at字段）
    await pool.execute(
      'INSERT INTO email_codes (email, code, type, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())',
      [email, code, type, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('保存验证码失败:', error);
    return false;
  }
};

/**
 * 验证邮箱验证码
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @param {string} type - 类型
 * @returns {Promise<boolean>} 验证是否成功
 */
export const verifyEmailCode = async (email, code, type) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM email_codes 
       WHERE email = ? AND code = ? AND type = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code, type]
    );
    
    if (rows.length === 0) {
      return false;
    }
    
    // 标记验证码为已使用
    await pool.execute(
      'UPDATE email_codes SET used = 1 WHERE id = ?',
      [rows[0].id]
    );
    
    return true;
  } catch (error) {
    console.error('验证邮箱验证码失败:', error);
    return false;
  }
};

/**
 * 发送邮箱验证码
 * @param {string} email - 收件人邮箱
 * @param {string} type - 验证码类型：login-登录，register-注册，reset-重置密码
 * @returns {Promise<Object>} 发送结果
 */
export const sendVerificationCode = async (email, type = 'login') => {
  try {
    // 生成验证码
    const code = generateCode();
    
    // 保存验证码到数据库
    const saved = await saveCodeToDatabase(email, code, type);
    if (!saved) {
      return {
        success: false,
        message: '保存验证码失败'
      };
    }
    
    // 使用Brevo服务发送邮件
    if (brevoService.initialized) {
      const appName = process.env.APP_NAME || 'Digital Store';
      let subject = `${appName} - `;
      let html = '';
      
      switch (type) {
        case 'register':
          subject += 'Registration Verification Code';
          html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">Welcome to ${appName}!</h1>
              </div>
              <div style="padding: 40px; background: #f9f9f9;">
                <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                  Please use the verification code below to complete your registration:
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #667eea;">
                  <h1 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: bold;">${code}</h1>
                </div>
                <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
                  This code will expire in 10 minutes. If you did not request this code, please ignore this email.
                </p>
              </div>
            </div>
          `;
          break;
        case 'reset':
          subject += 'Password Reset Code';
          html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
              </div>
              <div style="padding: 40px; background: #f9f9f9;">
                <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                  We received a request to reset your password. Use the code below:
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #f5576c;">
                  <h1 style="color: #f5576c; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: bold;">${code}</h1>
                </div>
                <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
                  This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.
                </p>
              </div>
            </div>
          `;
          break;
        case 'login':
        default:
          subject += 'Login Verification Code';
          html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">Secure Login</h1>
              </div>
              <div style="padding: 40px; background: #f9f9f9;">
                <h2 style="color: #333; margin-bottom: 20px;">Verification Required</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                  Your login verification code is:
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #43e97b;">
                  <h1 style="color: #43e97b; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: bold;">${code}</h1>
                </div>
                <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
                  This code will expire in 10 minutes. If this wasn't you, please secure your account immediately.
                </p>
              </div>
            </div>
          `;
      }
      
      const text = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
      
      // 使用Brevo发送邮件
      const result = await brevoService.sendEmail({
        to: email,
        subject: subject,
        html: html,
        text: text
      });
      
      if (result.success) {
        console.log(`✅ 验证码已通过Brevo发送到: ${email}`);
        return {
          success: true,
          message: '验证码已发送到您的邮箱'
        };
      } else {
        // Brevo发送失败，但验证码已保存，用户仍可从控制台获取（仅开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log('\n========================================');
          console.log(`📧 Brevo发送失败，验证码显示在控制台`);
          console.log(`邮箱：${email}`);
          console.log(`验证码：${code}`);
          console.log(`类型：${type}`);
          console.log(`有效期：10分钟`);
          console.log('========================================\n');
        }
        return {
          success: false,
          message: 'Brevo邮件发送失败，请检查配置'
        };
      }
    } else {
      // Brevo未初始化（未配置API密钥）
      if (process.env.NODE_ENV === 'development') {
        console.log('\n========================================');
        console.log(`📧 Brevo未配置，验证码显示在控制台`);
        console.log(`邮箱：${email}`);
        console.log(`验证码：${code}`);
        console.log(`类型：${type}`);
        console.log(`有效期：10分钟`);
        console.log('========================================\n');
        return {
          success: true,
          message: '验证码已生成（开发模式）'
        };
      } else {
        return {
          success: false,
          message: '邮件服务未配置，请联系管理员'
        };
      }
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    return {
      success: false,
      message: '发送验证码失败，请稍后重试'
    };
  }
};

/**
 * 发送通用邮件（使用Brevo）
 * @param {Object} options - 邮件选项
 * @returns {Promise<Object>} 发送结果
 */
export const sendEmail = async (options) => {
  try {
    if (brevoService.initialized) {
      return await brevoService.sendEmail(options);
    } else {
      console.warn('Brevo服务未初始化');
      return {
        success: false,
        message: '邮件服务未配置'
      };
    }
  } catch (error) {
    console.error('发送邮件失败:', error);
    return {
      success: false,
      message: '邮件发送失败'
    };
  }
};

export default {
  sendVerificationCode,
  verifyEmailCode,
  sendEmail
};