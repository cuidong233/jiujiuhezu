/**
 * 支付通知服务
 * 用于前台和后台的支付状态实时同步
 */

import EventEmitter from 'events';
import brevoService from './brevoService.js';

class PaymentNotificationService extends EventEmitter {
  constructor() {
    super();
    this.pendingPayments = new Map(); // 存储待支付订单
    this.completedPayments = new Map(); // 存储已支付订单
  }

  /**
   * 记录订单创建
   */
  recordOrderCreated(orderNo, orderData) {
    console.log(`📝 记录新订单: ${orderNo}`);
    this.pendingPayments.set(orderNo, {
      ...orderData,
      createdAt: new Date(),
      status: 'PENDING'
    });
    
    // 触发订单创建事件
    this.emit('orderCreated', {
      orderNo,
      data: orderData
    });
  }

  /**
   * 记录支付成功
   */
  recordPaymentSuccess(orderNo, paymentData) {
    console.log(`✅ 记录支付成功: ${orderNo}`);
    console.log(`  支付数据:`, JSON.stringify(paymentData, null, 2));
    
    // 从待支付移到已支付
    const orderData = this.pendingPayments.get(orderNo);
    console.log(`  订单缓存数据:`, orderData ? '存在' : '不存在');
    
    if (orderData) {
      this.pendingPayments.delete(orderNo);
      this.completedPayments.set(orderNo, {
        ...orderData,
        ...paymentData,
        status: 'SUCCESS',
        paidAt: new Date()
      });
    } else {
      // 即使没有缓存数据，也记录支付成功
      this.completedPayments.set(orderNo, {
        ...paymentData,
        status: 'SUCCESS',
        paidAt: new Date()
      });
    }
    
    // 触发支付成功事件
    this.emit('paymentSuccess', {
      orderNo,
      data: paymentData
    });
    
    // 记录到日志
    this.logPaymentSuccess(orderNo, paymentData);
    
    // 发送商品信息邮件
    console.log(`📮 准备触发邮件发送: ${orderNo}`);
    this.sendProductInfoEmail(orderNo, paymentData, orderData);
  }

  /**
   * 发送商品信息邮件（区分自动/手动发货）
   */
  async sendProductInfoEmail(orderNo, paymentData, orderData) {
    try {
      console.log(`🔍 检查邮件发送条件 - 订单: ${orderNo}`);
      console.log(`  - paymentData.userEmail: ${paymentData.userEmail}`);
      console.log(`  - orderData?.userEmail: ${orderData?.userEmail}`);
      
      // 检查是否有用户邮箱
      if (!paymentData.userEmail && !orderData?.userEmail) {
        console.warn(`⚠️ 订单 ${orderNo} 没有用户邮箱，跳过邮件发送`);
        console.log(`  完整的paymentData:`, JSON.stringify(paymentData, null, 2));
        console.log(`  完整的orderData:`, JSON.stringify(orderData, null, 2));
        return;
      }

      const emailData = {
        userEmail: paymentData.userEmail || orderData.userEmail,
        orderNo: orderNo,
        productName: paymentData.productName || orderData.productName || '未知商品',
        productInfo: paymentData.productInfo || orderData.productInfo,
        amount: paymentData.amount || orderData.amount,
        cdkKeys: paymentData.cdkKeys || orderData.cdkKeys || [],
        deliveryMode: paymentData.deliveryMode || orderData?.deliveryMode || 'auto'
      };

      console.log(`📧 准备发送商品信息邮件: ${orderNo} -> ${emailData.userEmail} (${emailData.deliveryMode}发货)`);
      console.log(`  邮件数据:`, JSON.stringify(emailData, null, 2));
      
      // 异步发送邮件，不影响支付流程
      setTimeout(async () => {
        console.log(`⏰ 开始延迟发送邮件: ${orderNo}`);
        await this.trySendProductEmail(orderNo, emailData);
      }, 2000); // 延迟2秒发送，确保支付流程完成

    } catch (error) {
      console.error(`❌ 处理商品信息邮件发送失败: ${orderNo}`, error);
      console.error(`  错误详情:`, error.stack);
    }
  }

  /**
   * 发送商品邮件（使用Brevo服务，区分自动/手动发货）
   */
  async trySendProductEmail(orderNo, emailData) {
    try {
      let brevoResult;
      
      // 根据发货模式选择不同的邮件模板
      if (emailData.deliveryMode === 'manual') {
        // 手动发货：发送待处理邮件
        brevoResult = await brevoService.sendManualDeliveryPendingEmail(emailData);
        if (brevoResult.success) {
          console.log(`📧 手动发货待处理邮件发送成功: ${orderNo} (${brevoResult.messageId})`);
        }
      } else {
        // 自动发货：如果有CDK则发送商品信息，否则发送待处理邮件
        if (emailData.cdkKeys && emailData.cdkKeys.length > 0) {
          brevoResult = await brevoService.sendProductInfoEmail(emailData);
          if (brevoResult.success) {
            console.log(`📧 自动发货商品信息邮件发送成功: ${orderNo} (${brevoResult.messageId})`);
          }
        } else {
          // 自动发货但没有CDK（可能库存不足），发送待处理邮件
          brevoResult = await brevoService.sendManualDeliveryPendingEmail(emailData);
          if (brevoResult.success) {
            console.log(`📧 自动发货待补充邮件发送成功: ${orderNo} (${brevoResult.messageId})`);
          }
        }
      }
      
      if (brevoResult && brevoResult.success) {
        return;
      } else if (brevoResult) {
        console.log(`⚠️ Brevo发送失败: ${brevoResult.message}`);
      }
    } catch (error) {
      console.error(`Brevo发送异常:`, error.message);
    }

    // 发送失败
    console.error(`❌ 订单 ${orderNo} 商品信息邮件发送失败`);
  }

  /**
   * 获取订单支付状态
   */
  getPaymentStatus(orderNo) {
    if (this.completedPayments.has(orderNo)) {
      return {
        status: 'SUCCESS',
        data: this.completedPayments.get(orderNo)
      };
    }
    
    if (this.pendingPayments.has(orderNo)) {
      return {
        status: 'PENDING',
        data: this.pendingPayments.get(orderNo)
      };
    }
    
    return {
      status: 'NOT_FOUND',
      data: null
    };
  }

  /**
   * 记录支付成功日志（用于后台查看）
   */
  logPaymentSuccess(orderNo, paymentData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      orderNo,
      amount: paymentData.amount,
      payType: paymentData.payType,
      transactionId: paymentData.transactionId,
      userId: paymentData.userId,
      productInfo: paymentData.productInfo
    };
    
    console.log('💰 支付成功日志:', JSON.stringify(logEntry, null, 2));
    
    // 这里可以写入数据库或文件
    // await db.paymentLogs.create(logEntry);
  }

  /**
   * 获取最近的支付记录（用于后台展示）
   */
  getRecentPayments(limit = 10) {
    const recent = Array.from(this.completedPayments.entries())
      .slice(-limit)
      .reverse()
      .map(([orderNo, data]) => ({
        orderNo,
        ...data
      }));
    
    return recent;
  }

  /**
   * 获取待支付订单（用于后台监控）
   */
  getPendingPayments() {
    return Array.from(this.pendingPayments.entries()).map(([orderNo, data]) => ({
      orderNo,
      ...data,
      waitingTime: Math.floor((Date.now() - new Date(data.createdAt)) / 1000) // 等待秒数
    }));
  }

  /**
   * 清理过期订单（超过30分钟未支付）
   */
  cleanupExpiredOrders() {
    const expiryTime = 30 * 60 * 1000; // 30分钟
    const now = Date.now();
    
    for (const [orderNo, data] of this.pendingPayments.entries()) {
      if (now - new Date(data.createdAt) > expiryTime) {
        this.pendingPayments.delete(orderNo);
        console.log(`🗑️ 清理过期订单: ${orderNo}`);
        
        // 触发订单过期事件
        this.emit('orderExpired', {
          orderNo,
          data
        });
      }
    }
  }
}

// 创建单例实例
const paymentNotificationService = new PaymentNotificationService();

// 定期清理过期订单
setInterval(() => {
  paymentNotificationService.cleanupExpiredOrders();
}, 5 * 60 * 1000); // 每5分钟清理一次

export default paymentNotificationService;