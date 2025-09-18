import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

/**
 * 发送测试邮件
 * POST /api/email/test
 */
router.post('/test', async (req, res) => {
  try {
    const { to, subject = '测试邮件', content = '这是一封测试邮件' } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: '请提供收件人邮箱'
      });
    }
    
    const result = await emailService.sendEmail({
      to: to,
      subject: subject,
      text: content,
      html: `<h1>${subject}</h1><p>${content}</p>`
    });
    
    if (result.success) {
      res.json({
        success: true,
        message: '邮件发送成功',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || '邮件发送失败'
      });
    }
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 发送验证码
 * POST /api/email/code
 */
router.post('/code', async (req, res) => {
  try {
    const { email, type = 'login' } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱地址'
      });
    }
    
    const result = await emailService.sendVerificationCode(email, type);
    
    if (result.success) {
      res.json({
        success: true,
        message: '验证码已发送',
        expiresIn: 300 // 5分钟
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || '验证码发送失败'
      });
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 验证验证码
 * POST /api/email/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, code, type = 'login' } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和验证码'
      });
    }
    
    const isValid = await emailService.verifyEmailCode(email, code, type);
    
    if (isValid) {
      res.json({
        success: true,
        message: '验证成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }
  } catch (error) {
    console.error('验证失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

export default router;