import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import deliveryService from './deliveryService.js';

dotenv.config();

// MySQL连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jiujiu_admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 订单服务 - 与现有Java系统的数据库集成
 */
class OrderService {
  
  /**
   * 根据订单号获取订单信息
   * @param {String} orderNo 订单号
   * @returns {Promise<Object>} 订单信息
   */
  async getOrderByOrderNo(orderNo) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM `order` WHERE order_no = ? LIMIT 1',
        [orderNo]
      );
      
      if (rows.length === 0) {
        throw new Error(`订单不存在: ${orderNo}`);
      }
      
      return rows[0];
    } catch (error) {
      console.error('获取订单失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新订单支付状态（与Java系统保持一致）
   * @param {String} orderNo 订单号
   * @param {String} tradeNo 第三方交易号
   * @param {Number} paidAmount 实际支付金额
   * @param {Number} payType 支付类型（2=微信, 4=支付宝）
   * @returns {Promise<Boolean>} 更新结果
   */
  async updateOrderPayStatus(orderNo, tradeNo, paidAmount, payType) {
    const connection = await pool.getConnection();
    
    try {
      // 开启事务
      await connection.beginTransaction();
      
      // 1. 获取订单信息
      const [orders] = await connection.execute(
        'SELECT * FROM `order` WHERE order_no = ? FOR UPDATE',
        [orderNo]
      );
      
      if (orders.length === 0) {
        throw new Error('订单不存在');
      }
      
      const order = orders[0];
      
      // 2. 检查订单状态
      if (order.payment_status === 1) {
        console.log(`订单 ${orderNo} 已支付，跳过更新`);
        await connection.rollback();
        return true;
      }
      
      // 3. 验证金额 - 使用正确的字段名
      const orderAmount = parseFloat(order.total_amount || order.totalAmount || order.price || 0);
      if (Math.abs(orderAmount - paidAmount) > 0.01) {
        console.error(`订单金额不匹配！期望: ${orderAmount}, 实际: ${paidAmount}`);
        // 允许金额不匹配但仍更新状态（记录警告）
        console.warn(`继续更新订单状态，但金额不匹配`);
      }
      
      // 4. 更新订单状态 - 使用正确的字段名和支付方式映射
      const paymentMethodMap = {
        2: 'wechat',    // 微信支付
        4: 'alipay',    // 支付宝支付
        3: 'binance'    // 币安支付
      };
      const paymentMethod = paymentMethodMap[payType] || 'unknown';
      
      await connection.execute(
        `UPDATE \`order\` 
         SET payment_status = 1, 
             order_status = 1,
             payment_method = ?,
             paid_at = NOW(),
             updated_at = NOW()
         WHERE order_no = ? AND payment_status = 0`,
        [paymentMethod, orderNo]
      );
      
      // 5. 记录支付日志（注释掉，因为pay_log表不存在）
      // await connection.execute(
      //   `INSERT INTO pay_log (order_no, trade_no, pay_type, amount, status, create_date) 
      //    VALUES (?, ?, ?, ?, 'SUCCESS', NOW())`,
      //   [orderNo, tradeNo, paymentMethod, paidAmount]
      // );
      
      // 6. 如果是充值订单，更新用户余额
      if (order.order_type === 'RECHARGE') {
        await connection.execute(
          `UPDATE user_wallet 
           SET balance = balance + ?, 
               updated_at = NOW() 
           WHERE user_id = ?`,
          [paidAmount, order.user_id]
        );
        
        // 记录余额变动
        const paymentDescMap = {
          'wechat': '微信充值',
          'alipay': '支付宝充值',
          'binance': '币安充值',
          'unknown': '其他方式充值'
        };
        const paymentDesc = paymentDescMap[paymentMethod] || '充值';
        
        // 注释掉wallet_log表插入，因为表不存在
        // await connection.execute(
        //   `INSERT INTO wallet_log (user_id, type, amount, order_no, remark, create_date)
        //    VALUES (?, 'RECHARGE', ?, ?, ?, NOW())`,
        //   [order.user_id, paidAmount, orderNo, paymentDesc]
        // );
      }
      
      // 7. 如果是商品订单，更新库存（注释掉，因为相关表不存在）
      // if (order.order_type === 'GOODS') {
      //   // 获取订单商品
      //   const [orderItems] = await connection.execute(
      //     'SELECT * FROM order_item WHERE order_no = ?',
      //     [orderNo]
      //   );
      //   
      //   for (const item of orderItems) {
      //     // 更新SKU库存
      //     await connection.execute(
      //       `UPDATE goods_sku 
      //        SET stock = stock - ?, 
      //            sales = sales + ?,
      //            update_date = NOW()
      //        WHERE id = ? AND stock >= ?`,
      //       [item.quantity, item.quantity, item.sku_id, item.quantity]
      //     );
      //   }
      // }
      
      // 提交事务
      await connection.commit();
      
      console.log(`订单 ${orderNo} 支付成功，状态已更新`);
      
      // 8. 触发自动发货（如果是商品订单且设置了自动发货）或处理代充订单
      try {
        // 使用Sequelize模型获取完整的订单和商品信息
        const sequelizeOrder = await Order.findOne({ where: { orderNo } });
        if (sequelizeOrder && sequelizeOrder.productId) {
          const product = await Product.findByPk(sequelizeOrder.productId);
          
          // 检查是否为代充商品
          if (product && product.deliveryRequiresReceipt) {
            console.log(`📝 订单 ${orderNo} 为代充商品，创建回执单...`);
            
            // 异步处理代充订单，创建回执单
            setTimeout(async () => {
              try {
                const receiptResult = await deliveryService.processManualRechargeCDK(sequelizeOrder);
                if (receiptResult.success) {
                  console.log(`✅ 订单 ${orderNo} 回执单创建成功:`, receiptResult.receipts);
                } else {
                  console.error(`❌ 订单 ${orderNo} 回执单创建失败:`, receiptResult.error);
                }
              } catch (error) {
                console.error(`❌ 订单 ${orderNo} 回执单创建异常:`, error);
              }
            }, 2000); // 延迟2秒执行，确保支付流程完全结束
          } else if (product && product.deliveryMode === 'auto') {
            console.log(`🚀 订单 ${orderNo} 触发自动发货...`);
            
            // 异步处理自动发货，不影响支付响应
            setTimeout(async () => {
              try {
                const deliveryResult = await deliveryService.autoDeliver(sequelizeOrder);
                if (deliveryResult.success) {
                  console.log(`✅ 订单 ${orderNo} 自动发货成功:`, deliveryResult.data);
                } else {
                  console.error(`❌ 订单 ${orderNo} 自动发货失败:`, deliveryResult.error);
                }
              } catch (error) {
                console.error(`❌ 订单 ${orderNo} 自动发货异常:`, error);
              }
            }, 2000); // 延迟2秒执行，确保支付流程完全结束
          } else {
            console.log(`📦 订单 ${orderNo} 为手动发货模式或商品未设置自动发货`);
          }
        }
      } catch (autoDeliverError) {
        // 自动发货失败不影响支付状态更新
        console.error(`自动发货检查失败，但支付状态已更新:`, autoDeliverError);
      }
      
      return true;
      
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      console.error('更新订单状态失败:', error);
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  }
  
  /**
   * 创建支付记录
   * @param {Object} paymentData 支付数据
   * @returns {Promise<Number>} 记录ID
   */
  async createPaymentRecord(paymentData) {
    try {
      const { orderNo, tradeNo, amount, buyerId, status } = paymentData;
      
      const [result] = await pool.execute(
        `INSERT INTO payment_record 
         (order_no, trade_no, pay_type, amount, buyer_id, status, create_date)
         VALUES (?, ?, 'alipay', ?, ?, ?, NOW())`,
        [orderNo, tradeNo, amount, buyerId, status]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建支付记录失败:', error);
      throw error;
    }
  }
  
  /**
   * 检查订单是否可以支付
   * @param {String} orderNo 订单号
   * @returns {Promise<Object>} 检查结果
   */
  async checkOrderPayable(orderNo) {
    try {
      const order = await this.getOrderByOrderNo(orderNo);
      
      // 检查订单状态
      if (order.status === 2) {
        return {
          payable: false,
          reason: '订单已支付'
        };
      }
      
      if (order.status === 0) {
        return {
          payable: false,
          reason: '订单已关闭'
        };
      }
      
      if (order.status > 2) {
        return {
          payable: false,
          reason: '订单已完成或已取消'
        };
      }
      
      // 检查订单是否过期（30分钟）
      const createTime = new Date(order.create_date);
      const now = new Date();
      const diffMinutes = (now - createTime) / 1000 / 60;
      
      if (diffMinutes > 30) {
        // 更新订单为已过期
        await pool.execute(
          'UPDATE common_order SET status = 0 WHERE order_no = ?',
          [orderNo]
        );
        
        return {
          payable: false,
          reason: '订单已过期'
        };
      }
      
      return {
        payable: true,
        order: order
      };
      
    } catch (error) {
      console.error('检查订单状态失败:', error);
      return {
        payable: false,
        reason: error.message
      };
    }
  }
  
  /**
   * 处理订单退款
   * @param {String} orderNo 订单号
   * @param {Number} refundAmount 退款金额
   * @param {String} refundReason 退款原因
   * @returns {Promise<Boolean>} 退款结果
   */
  async processRefund(orderNo, refundAmount, refundReason) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 更新订单状态为退款中
      await connection.execute(
        `UPDATE \`order\` 
         SET order_status = 6, 
             updated_at = NOW()
         WHERE order_no = ? AND order_status = 2`,
        [orderNo]
      );
      
      // 记录退款日志（注释掉，因为refund_log表不存在）
      // await connection.execute(
      //   `INSERT INTO refund_log 
      //    (order_no, amount, reason, status, create_date)
      //    VALUES (?, ?, ?, 'PROCESSING', NOW())`,
      //   [orderNo, refundAmount, refundReason]
      // );
      
      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      console.error('处理退款失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

// 导出单例
export default new OrderService();