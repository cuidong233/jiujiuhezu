/**
 * 修复代充订单的回执单问题
 * 1. 更新订单的deliveryRequiresReceipt字段
 * 2. 为没有回执单的代充订单创建回执单
 */

import { sequelize } from './src/models/index.js';
import Order from './src/models/Order.js';
import Product from './src/models/Product.js';
import CDKReceipt from './src/models/CDKReceipt.js';

async function fixReceiptOrders() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('开始修复代充订单...');
    
    // 1. 查找所有已支付的订单
    const orders = await Order.findAll({
      where: {
        paymentStatus: 1 // 已支付
      },
      include: [{
        model: Product,
        as: 'product'
      }],
      transaction
    });
    
    console.log(`找到 ${orders.length} 个已支付订单`);
    
    let fixedCount = 0;
    let receiptCreatedCount = 0;
    
    for (const order of orders) {
      if (!order.product) {
        console.log(`订单 ${order.orderNo} 没有关联商品，跳过`);
        continue;
      }
      
      // 检查商品是否为代充商品
      if (order.product.deliveryRequiresReceipt) {
        console.log(`处理代充订单: ${order.orderNo}`);
        
        // 更新订单的deliveryRequiresReceipt字段
        if (!order.deliveryRequiresReceipt) {
          await Order.update(
            { deliveryRequiresReceipt: true },
            { 
              where: { id: order.id },
              transaction
            }
          );
          fixedCount++;
          console.log(`  ✅ 更新订单 ${order.orderNo} 的deliveryRequiresReceipt字段`);
        }
        
        // 检查是否已有回执单
        const existingReceipt = await CDKReceipt.findOne({
          where: { orderId: order.id },
          transaction
        });
        
        if (!existingReceipt) {
          // 创建回执单
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
          
          // 创建回执单记录
          for (let i = 0; i < order.quantity; i++) {
            await CDKReceipt.create({
              cdkId: null,
              orderId: order.id,
              userId: order.userId,
              receiptFields: order.product.receiptFields || defaultReceiptFields,
              deliveryStatus: 0 // 待发货
            }, { transaction });
          }
          
          receiptCreatedCount++;
          console.log(`  ✅ 为订单 ${order.orderNo} 创建了 ${order.quantity} 个回执单`);
        } else {
          console.log(`  ⏭️ 订单 ${order.orderNo} 已有回执单，跳过`);
        }
      }
    }
    
    await transaction.commit();
    
    console.log('\n修复完成！');
    console.log(`更新了 ${fixedCount} 个订单的deliveryRequiresReceipt字段`);
    console.log(`为 ${receiptCreatedCount} 个订单创建了回执单`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 运行修复脚本
fixReceiptOrders().catch(console.error);