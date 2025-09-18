import express from 'express';
import pool from '../db/database.js';
import brevoService from '../services/brevoService.js';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置文件路径
const CONFIG_FILE_PATH = path.join(__dirname, '../../config/email.config.json');

// 简单的管理员权限检查中间件
const isAdmin = (req, res, next) => {
  // 这里可以根据实际的用户角色系统进行检查
  // 暂时简单检查用户是否登录
  if (!req.user) {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    });
  }
  next();
};

// 获取邮件配置
router.get('/email/config', authenticate, isAdmin, async (req, res) => {
  try {
    // 尝试从文件读取配置
    let config = {
      enabled: false,
      brevoApiKey: process.env.BREVO_API_KEY || '',
      fromEmail: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com',
      fromName: process.env.APP_NAME || 'Digital Store',
      autoDeliveryEmail: true,
      manualPendingEmail: true,
      manualCompleteEmail: true
    };
    
    try {
      const fileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
      const fileConfig = JSON.parse(fileContent);
      config = { ...config, ...fileConfig };
    } catch (error) {
      // 配置文件不存在或解析失败，使用默认配置
    }
    
    // 不返回完整的API Key
    if (config.brevoApiKey) {
      config.brevoApiKey = config.brevoApiKey.substring(0, 10) + '...' + config.brevoApiKey.substring(config.brevoApiKey.length - 4);
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: config
    });
  } catch (error) {
    console.error('获取邮件配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置失败',
      error: error.message
    });
  }
});

// 保存邮件配置
router.post('/email/config', authenticate, isAdmin, async (req, res) => {
  try {
    const config = req.body;
    
    // 如果API Key没有改变（包含...），则从现有配置读取
    if (config.brevoApiKey && config.brevoApiKey.includes('...')) {
      try {
        const fileContent = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
        const existingConfig = JSON.parse(fileContent);
        config.brevoApiKey = existingConfig.brevoApiKey || process.env.BREVO_API_KEY;
      } catch (error) {
        config.brevoApiKey = process.env.BREVO_API_KEY || '';
      }
    }
    
    // 保存配置到文件
    const configDir = path.dirname(CONFIG_FILE_PATH);
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    
    // 如果配置了Brevo API Key，更新环境变量并重新初始化服务
    if (config.brevoApiKey && !config.brevoApiKey.includes('...')) {
      process.env.BREVO_API_KEY = config.brevoApiKey;
      process.env.BREVO_FROM_EMAIL = config.fromEmail;
      process.env.APP_NAME = config.fromName;
      
      // 重新初始化Brevo服务
      brevoService.init();
    }
    
    res.json({
      code: 0,
      message: '配置保存成功'
    });
  } catch (error) {
    console.error('保存邮件配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存配置失败',
      error: error.message
    });
  }
});

// 发送测试邮件
router.post('/email/test', authenticate, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        code: 400,
        message: '请提供测试邮箱'
      });
    }
    
    // 发送测试邮件
    const result = await brevoService.sendEmail({
      to: email,
      subject: `Test Email from ${process.env.APP_NAME || 'Digital Store'}`,
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your Digital Store email configuration.</p>
        <p>If you can see this message, your email service is configured correctly!</p>
        <hr>
        <p>Configuration Details:</p>
        <ul>
          <li>Service: Brevo</li>
          <li>From: ${process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com'}</li>
          <li>App Name: ${process.env.APP_NAME || 'Digital Store'}</li>
        </ul>
      `,
      text: 'This is a test email from your Digital Store email configuration.'
    });
    
    if (result.success) {
      res.json({
        code: 0,
        message: '测试邮件发送成功',
        data: { messageId: result.messageId }
      });
    } else {
      res.status(500).json({
        code: 500,
        message: result.message || '测试邮件发送失败'
      });
    }
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    res.status(500).json({
      code: 500,
      message: '发送测试邮件失败',
      error: error.message
    });
  }
});

// 获取邮件模板列表
router.get('/email/templates', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM email_templates 
      ORDER BY type, created_at DESC
    `);
    
    res.json({
      code: 0,
      message: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取邮件模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取模板失败',
      error: error.message
    });
  }
});

// 创建邮件模板
router.post('/email/templates', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, type, subject, content, contentType, enabled } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO email_templates (name, type, subject, content, content_type, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, type, subject, content, contentType || 'html', enabled ? 1 : 0]
    );
    
    res.json({
      code: 0,
      message: '模板创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建邮件模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建模板失败',
      error: error.message
    });
  }
});

// 更新邮件模板
router.put('/email/templates/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, subject, content, contentType, enabled } = req.body;
    
    await pool.execute(
      `UPDATE email_templates 
       SET name = ?, type = ?, subject = ?, content = ?, content_type = ?, enabled = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, type, subject, content, contentType || 'html', enabled ? 1 : 0, id]
    );
    
    res.json({
      code: 0,
      message: '模板更新成功'
    });
  } catch (error) {
    console.error('更新邮件模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新模板失败',
      error: error.message
    });
  }
});

// 删除邮件模板
router.delete('/email/templates/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM email_templates WHERE id = ?', [id]);
    
    res.json({
      code: 0,
      message: '模板删除成功'
    });
  } catch (error) {
    console.error('删除邮件模板失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除模板失败',
      error: error.message
    });
  }
});

// 切换模板状态
router.put('/email/templates/:id/toggle', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE email_templates SET enabled = !enabled, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({
      code: 0,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('切换模板状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '状态更新失败',
      error: error.message
    });
  }
});

// 获取邮件日志
router.get('/email/logs', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, email, orderNo, status } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let params = [];
    
    if (email) {
      whereClauses.push('recipient LIKE ?');
      params.push(`%${email}%`);
    }
    
    if (orderNo) {
      whereClauses.push('order_no = ?');
      params.push(orderNo);
    }
    
    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }
    
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // 获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM email_logs ${whereClause}`,
      params
    );
    
    // 获取列表
    const [rows] = await pool.execute(
      `SELECT * FROM email_logs ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows.map(row => ({
          ...row,
          sentAt: row.sent_at || row.created_at
        })),
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取邮件日志失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取日志失败',
      error: error.message
    });
  }
});

// 重发邮件
router.post('/email/resend/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取原邮件信息
    const [rows] = await pool.execute(
      'SELECT * FROM email_logs WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '邮件记录不存在'
      });
    }
    
    const emailLog = rows[0];
    
    // 重新发送邮件
    const result = await brevoService.sendEmail({
      to: emailLog.recipient,
      subject: emailLog.subject,
      html: emailLog.content,
      text: emailLog.content
    });
    
    if (result.success) {
      // 更新邮件状态
      await pool.execute(
        `UPDATE email_logs 
         SET status = 'success', sent_at = NOW(), message_id = ?, error_message = NULL 
         WHERE id = ?`,
        [result.messageId, id]
      );
      
      res.json({
        code: 0,
        message: '邮件重发成功'
      });
    } else {
      // 记录失败信息
      await pool.execute(
        `UPDATE email_logs 
         SET status = 'failed', error_message = ?, sent_at = NOW() 
         WHERE id = ?`,
        [result.message, id]
      );
      
      res.status(500).json({
        code: 500,
        message: result.message || '邮件重发失败'
      });
    }
  } catch (error) {
    console.error('重发邮件失败:', error);
    res.status(500).json({
      code: 500,
      message: '重发邮件失败',
      error: error.message
    });
  }
});

// 给订单发送邮件
router.post('/order/:orderNo/email', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { type = 'custom', subject, content } = req.body;
    
    // 获取订单信息
    const [orderRows] = await pool.execute(
      `SELECT o.*, p.name as product_name, p.description as product_info
       FROM \`order\` o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.order_no = ?`,
      [orderNo]
    );
    
    if (orderRows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }
    
    const order = orderRows[0];
    
    if (!order.user_email) {
      return res.status(400).json({
        code: 400,
        message: '订单没有用户邮箱'
      });
    }
    
    let emailContent = {
      to: order.user_email,
      subject: subject || `Order ${orderNo} Update`,
      html: content || `<p>Your order ${orderNo} has been updated.</p>`,
      text: content || `Your order ${orderNo} has been updated.`
    };
    
    // 根据类型选择邮件模板
    if (type === 'delivery_complete') {
      const result = await brevoService.sendManualDeliveryCompleteEmail({
        userEmail: order.user_email,
        orderNo: orderNo,
        productName: order.product_name,
        productInfo: order.product_info,
        amount: order.total_amount,
        cdkKeys: [] // 需要从发货记录获取
      });
      
      if (result.success) {
        await logEmailSend({
          recipient: order.user_email,
          subject: `Order Delivered - ${order.product_name}`,
          content: 'Manual delivery complete email',
          type: 'manual_complete',
          orderNo: orderNo,
          status: 'success',
          messageId: result.messageId
        });
        
        res.json({
          code: 0,
          message: '邮件发送成功'
        });
      } else {
        res.status(500).json({
          code: 500,
          message: result.message || '邮件发送失败'
        });
      }
    } else {
      // 发送自定义邮件
      const result = await brevoService.sendEmail(emailContent);
      
      if (result.success) {
        await logEmailSend({
          recipient: order.user_email,
          subject: emailContent.subject,
          content: emailContent.html,
          type: 'custom',
          orderNo: orderNo,
          status: 'success',
          messageId: result.messageId
        });
        
        res.json({
          code: 0,
          message: '邮件发送成功'
        });
      } else {
        res.status(500).json({
          code: 500,
          message: result.message || '邮件发送失败'
        });
      }
    }
  } catch (error) {
    console.error('发送订单邮件失败:', error);
    res.status(500).json({
      code: 500,
      message: '发送邮件失败',
      error: error.message
    });
  }
});

// 记录邮件发送日志
export const logEmailSend = async (emailData) => {
  try {
    await pool.execute(
      `INSERT INTO email_logs (recipient, subject, content, type, order_no, status, message_id, error_message, sent_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        emailData.recipient,
        emailData.subject,
        emailData.content,
        emailData.type || 'custom',
        emailData.orderNo || null,
        emailData.status || 'pending',
        emailData.messageId || null,
        emailData.errorMessage || null,
        emailData.sentAt || null
      ]
    );
  } catch (error) {
    console.error('记录邮件日志失败:', error);
  }
};

export default router;