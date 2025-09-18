/**
 * 手动为指定订单创建回执单
 */

import { sequelize } from './src/models/index.js';
import Order from './src/models/Order.js';
import Product from './src/models/Product.js';
import CDKReceipt from './src/models/CDKReceipt.js';

async function createReceiptForOrder(orderNo) {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`处理订单: ${orderNo}`);
    
    // 查找订单
    const order = await Order.findOne({
      where: { orderNo },
      include: [{
        model: Product,
        as: 'product'
      }],
      transaction
    });
    
    if (!order) {
      throw new Error('订单不存在');
    }
    
    console.log(`订单信息:`, {
      id: order.id,
      orderNo: order.orderNo,
      productName: order.productName,
      paymentStatus: order.paymentStatus,
      userId: order.userId
    });
    
    // 检查是否已有回执单
    const existingReceipt = await CDKReceipt.findOne({
      where: { orderId: order.id },
      transaction
    });
    
    if (existingReceipt) {
      console.log('该订单已有回执单，ID:', existingReceipt.id);
      await transaction.rollback();
      return;
    }
    
    // 默认回执字段配置
    const defaultReceiptFields = [
      {
        key: 'gameAccount',
        label: '游戏账号',
        type: 'text',
        placeholder: '请输入游戏账号',
        required: true
      },
      {
        key: 'gamePassword',
        label: '游戏密码',
        type: 'password',
        placeholder: '请输入游戏密码',
        required: true
      },
      {
        key: 'contact',
        label: '联系方式',
        type: 'text',
        placeholder: '请输入手机号或邮箱',
        required: true
      },
      {
        key: 'remark',
        label: '备注信息',
        type: 'textarea',
        placeholder: '请输入备注信息（选填）',
        required: false
      }
    ];
    
    // 直接执行SQL插入，使用NULL作为cdk_id（表示没有关联的CDK）
    await sequelize.query(
      `INSERT INTO pr_cdk_receipts (cdk_id, order_id, user_id, receipt_fields, delivery_status, created_at, updated_at) 
       VALUES (NULL, :orderId, :userId, :receiptFields, :deliveryStatus, NOW(), NOW())`,
      {
        replacements: {
          orderId: order.id,
          userId: order.userId,
          receiptFields: JSON.stringify(order.product?.receiptFields || defaultReceiptFields),
          deliveryStatus: 0
        },
        transaction
      }
    );
    
    // 更新订单的deliveryRequiresReceipt字段
    await Order.update(
      { deliveryRequiresReceipt: true },
      { 
        where: { id: order.id },
        transaction
      }
    );
    
    await transaction.commit();
    console.log(`✅ 成功为订单 ${orderNo} 创建回执单`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('创建回执单失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 执行
const orderNo = process.argv[2] || 'ORD1757895227402922';
createReceiptForOrder(orderNo).catch(console.error);