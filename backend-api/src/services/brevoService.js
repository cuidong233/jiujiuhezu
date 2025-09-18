import dotenv from 'dotenv';
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail, AccountApi } from '@getbrevo/brevo';

dotenv.config();

/**
 * Brevo 邮件服务 - 专业海外邮件解决方案
 */
class BrevoService {
  constructor() {
    this.apiInstance = null;
    this.accountApi = null;
    this.initialized = false;
    this.from = {
      email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com',
      name: process.env.APP_NAME || 'Digital Store'
    };
    this.init();
  }

  /**
   * 初始化 Brevo API
   */
  init() {
    try {
      const apiKey = process.env.BREVO_API_KEY;
      
      if (!apiKey) {
        console.log('📧 Brevo未配置，请在.env文件中设置BREVO_API_KEY');
        return;
      }

      this.apiInstance = new TransactionalEmailsApi();
      this.apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
      
      this.accountApi = new AccountApi();
      this.accountApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

      this.initialized = true;
      console.log('✅ Brevo服务初始化成功');
    } catch (error) {
      console.error('❌ Brevo初始化失败:', error.message);
    }
  }

  /**
   * 发送商品信息邮件（自动发货成功后）
   */
  async sendProductInfoEmail(orderData) {
    if (!this.initialized) {
      console.log('Brevo未初始化，跳过邮件发送');
      return { success: false, message: 'Brevo未配置' };
    }

    try {
      const { userEmail, orderNo, productName, productInfo, amount, cdkKeys } = orderData;

      // 构建邮件内容
      const emailContent = this.buildProductEmailContent({
        orderNo,
        productName,
        productInfo,
        amount,
        cdkKeys
      });

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = this.from;
      sendSmtpEmail.to = [{ email: userEmail }];
      sendSmtpEmail.subject = `🎉 Purchase Successful - ${productName}`;
      sendSmtpEmail.htmlContent = emailContent.html;
      sendSmtpEmail.textContent = emailContent.text;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Brevo API 返回的响应结构: response.body.messageId
      const messageId = response?.body?.messageId || response?.messageId || 'unknown';
      
      console.log(`✅ 商品信息邮件发送成功: ${orderNo} (${messageId})`);
      
      return { 
        success: true, 
        message: '邮件发送成功',
        messageId: messageId 
      };
    } catch (error) {
      console.error('❌ 发送商品信息邮件失败:', error);
      return { 
        success: false, 
        message: error.message || '邮件发送失败' 
      };
    }
  }

  /**
   * 发送手动发货待处理邮件
   */
  async sendManualDeliveryPendingEmail(orderData) {
    if (!this.initialized) {
      console.log('Brevo未初始化，跳过邮件发送');
      return { success: false, message: 'Brevo未配置' };
    }

    try {
      const { userEmail, orderNo, productName, amount } = orderData;
      const appName = this.from.name;
      const currentTime = new Date().toLocaleString('en-US', { 
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Processing</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ffa500 0%, #ff6b6b 100%); padding: 40px 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 36px; font-weight: bold;">📦 Order Received!</h1>
            <p style="margin: 15px 0 0; font-size: 18px; opacity: 0.9;">Your order is being processed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Order Details -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 25px; border: 1px solid #e9ecef;">
              <h2 style="color: #495057; margin: 0 0 20px 0; font-size: 24px; border-bottom: 2px solid #dee2e6; padding-bottom: 15px;">📋 Order Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057; width: 40%;">Order Number:</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; color: #007bff; font-weight: 600;">${orderNo}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057;">Product Name:</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600;">${productName}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057;">Amount Paid:</td>
                  <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; color: #28a745; font-weight: 700; font-size: 18px;">$${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; font-weight: 600; color: #495057;">Order Time:</td>
                  <td style="padding: 15px 0; color: #6c757d;">${currentTime} UTC</td>
                </tr>
              </table>
            </div>

            <!-- Processing Notice -->
            <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 20px;">⏳ Order Processing</h3>
              <p style="color: #856404; line-height: 1.6; margin: 0; font-size: 16px;">
                Thank you for your purchase! Your order has been received and is currently being processed by our team. 
                We will send you another email with your product details once the order is ready for delivery.
              </p>
              <p style="color: #856404; line-height: 1.6; margin: 15px 0 0; font-size: 16px;">
                <strong>Estimated processing time:</strong> Within 24 hours
              </p>
            </div>

            <!-- Support Section -->
            <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
              <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 22px;">Need Help? 🤝</h3>
              <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                If you have any questions about your order, our support team is here to help.
              </p>
              
              <div style="margin: 25px 0; padding: 20px 0; border-top: 2px solid #dee2e6;">
                <p style="color: #adb5bd; font-size: 14px; margin: 0; font-style: italic;">
                  This email was automatically generated by ${appName}.<br>
                  Please do not reply directly to this email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>`;

      const text = `📦 ORDER RECEIVED!

Your order is being processed

📋 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${orderNo}
Product Name: ${productName}
Amount Paid: $${amount}
Order Time: ${currentTime} UTC

⏳ ORDER PROCESSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your purchase! Your order has been received and is currently being processed by our team.
We will send you another email with your product details once the order is ready for delivery.

Estimated processing time: Within 24 hours

NEED HELP? 🤝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have any questions about your order, our support team is here to help.

This email was automatically generated by ${appName}.
Please do not reply directly to this email address.`;

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = this.from;
      sendSmtpEmail.to = [{ email: userEmail }];
      sendSmtpEmail.subject = `📦 Order Received - ${productName}`;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Brevo API 返回的响应结构: response.body.messageId
      const messageId = response?.body?.messageId || response?.messageId || 'unknown';
      
      console.log(`✅ 手动发货待处理邮件发送成功: ${orderNo} (${messageId})`);
      return { 
        success: true, 
        message: '邮件发送成功',
        messageId: messageId 
      };
    } catch (error) {
      console.error('❌ 发送手动发货待处理邮件失败:', error);
      return { 
        success: false, 
        message: error.message || '邮件发送失败' 
      };
    }
  }

  /**
   * 发送手动发货完成邮件
   */
  async sendManualDeliveryCompleteEmail(orderData) {
    if (!this.initialized) {
      console.log('Brevo未初始化，跳过邮件发送');
      return { success: false, message: 'Brevo未配置' };
    }

    try {
      const { userEmail, orderNo, productName, productInfo, amount, cdkKeys } = orderData;

      // 使用与自动发货相同的模板，但标题稍有不同
      const emailContent = this.buildProductEmailContent({
        orderNo,
        productName,
        productInfo,
        amount,
        cdkKeys
      });

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = this.from;
      sendSmtpEmail.to = [{ email: userEmail }];
      sendSmtpEmail.subject = `✅ Order Delivered - ${productName}`;
      sendSmtpEmail.htmlContent = emailContent.html;
      sendSmtpEmail.textContent = emailContent.text;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Brevo API 返回的响应结构: response.body.messageId
      const messageId = response?.body?.messageId || response?.messageId || 'unknown';
      
      console.log(`✅ 手动发货完成邮件发送成功: ${orderNo} (${messageId})`);
      return { 
        success: true, 
        message: '邮件发送成功',
        messageId: messageId 
      };
    } catch (error) {
      console.error('❌ 发送手动发货完成邮件失败:', error);
      return { 
        success: false, 
        message: error.message || '邮件发送失败' 
      };
    }
  }

  /**
   * 构建商品信息邮件内容
   */
  buildProductEmailContent({ orderNo, productName, productInfo, amount, cdkKeys }) {
    const appName = this.from.name;
    const currentTime = new Date().toLocaleString('en-US', { 
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Successful</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">🎉 Purchase Successful!</h1>
          <p style="margin: 15px 0 0; font-size: 18px; opacity: 0.9;">Thank you for choosing ${appName}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Order Details -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 25px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin: 0 0 20px 0; font-size: 24px; border-bottom: 2px solid #dee2e6; padding-bottom: 15px;">📋 Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057; width: 40%;">Order Number:</td>
                <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; color: #007bff; font-weight: 600;">${orderNo}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057;">Product Name:</td>
                <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600;">${productName}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #495057;">Amount Paid:</td>
                <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; color: #28a745; font-weight: 700; font-size: 18px;">$${amount}</td>
              </tr>
              <tr>
                <td style="padding: 15px 0; font-weight: 600; color: #495057;">Purchase Time:</td>
                <td style="padding: 15px 0; color: #6c757d;">${currentTime} UTC</td>
              </tr>
            </table>
          </div>
    `;

    let text = `🎉 PURCHASE SUCCESSFUL!

Thank you for choosing ${appName}

📋 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${orderNo}
Product Name: ${productName}
Amount Paid: $${amount}
Purchase Time: ${currentTime} UTC
`;

    // 添加CDK密钥部分
    if (cdkKeys && cdkKeys.length > 0) {
      html += `
          <!-- Access Keys -->
          <div style="background: #e8f4fd; border-radius: 12px; padding: 30px; margin-bottom: 25px; border-left: 5px solid #007bff;">
            <h2 style="color: #004085; margin: 0 0 20px 0; font-size: 24px;">🔑 Your Access Keys</h2>
            <div style="background: #d1ecf1; border-radius: 8px; padding: 20px; margin: 15px 0;">
              <p style="margin: 0 0 15px; font-weight: 700; color: #0c5460; font-size: 16px;">🚨 IMPORTANT: Please save these keys immediately!</p>
      `;

      text += `
🔑 YOUR ACCESS KEYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 IMPORTANT: Please save these keys immediately!

`;

      cdkKeys.forEach((key, index) => {
        html += `
              <div style="background: #ffffff; padding: 20px; margin: 12px 0; border-radius: 8px; border: 2px solid #b3d7ff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="color: #495057; font-weight: 600; margin-bottom: 8px;">Access Key ${index + 1}:</div>
                <div style="font-family: 'Courier New', 'Monaco', monospace; font-size: 16px; color: #dc3545; font-weight: bold; background: #f8f9fa; padding: 12px; border-radius: 4px; letter-spacing: 1px; word-break: break-all;">${key}</div>
              </div>
        `;
        text += `Access Key ${index + 1}: ${key}\n`;
      });

      html += `
            </div>
            <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <p style="margin: 0; color: #856404; font-weight: 600; font-size: 15px;">
                ⚠️ <strong>Security Notice:</strong> Store these keys in a secure location. Lost keys cannot be recovered or replaced.
              </p>
            </div>
          </div>
      `;

      text += `
⚠️ Security Notice: Store these keys in a secure location. Lost keys cannot be recovered or replaced.
`;
    }

    // 添加产品信息
    if (productInfo) {
      html += `
          <!-- Product Information -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 25px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin: 0 0 20px 0; font-size: 24px; border-bottom: 2px solid #dee2e6; padding-bottom: 15px;">📝 Product Information & Instructions</h2>
            <div style="line-height: 1.8; color: #495057; font-size: 16px;">
              ${productInfo.replace(/\n/g, '<br>')}
            </div>
          </div>
      `;

      text += `
📝 PRODUCT INFORMATION & INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${productInfo}
`;
    }

    // 结尾部分
    html += `
          <!-- Support Section -->
          <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 22px;">Need Help? 🤝</h3>
            <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            
            <div style="margin: 25px 0; padding: 20px 0; border-top: 2px solid #dee2e6;">
              <p style="color: #adb5bd; font-size: 14px; margin: 0; font-style: italic;">
                This email was automatically generated by ${appName}.<br>
                Please do not reply directly to this email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    text += `
NEED HELP? 🤝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Our support team is available 24/7 to assist you with any questions or concerns.

This email was automatically generated by ${appName}.
Please do not reply directly to this email address.`;

    return { html, text };
  }

  /**
   * 发送通用邮件
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.initialized) {
      console.log('Brevo未初始化，跳过邮件发送');
      return { success: false, message: 'Brevo未配置' };
    }

    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = this.from;
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      console.log(`✅ 邮件发送成功:`, response.messageId);
      return { 
        success: true, 
        message: '邮件发送成功',
        messageId: response.messageId 
      };
    } catch (error) {
      console.error('❌ 邮件发送失败:', error);
      return { 
        success: false, 
        message: error.message || '邮件发送失败' 
      };
    }
  }

  /**
   * 获取账号信息
   */
  async getAccountInfo() {
    if (!this.initialized || !this.accountApi) {
      return { success: false, message: 'Brevo未配置' };
    }

    try {
      const response = await this.accountApi.getAccount();
      return { success: true, data: response };
    } catch (error) {
      console.error('获取账号信息失败:', error);
      return { success: false, message: error.message };
    }
  }
}

// 导出单例
export default new BrevoService();