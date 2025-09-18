/**
 * 修复历史代充订单的delivery_requires_receipt字段
 * 并为缺失回执单的已支付代充订单创建回执单
 */

import { sequelize } from './src/models/index.js';

async function fixHistoricalOrders() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('开始修复历史代充订单...\n');
    
    // 1. 首先更新所有代充商品订单的delivery_requires_receipt字段
    console.log('步骤1: 更新订单的delivery_requires_receipt字段');
    const [updateCount] = await sequelize.query(
      `UPDATE \`order\` o 
       INNER JOIN pr_goods g ON o.product_id = g.id 
       SET o.delivery_requires_receipt = g.delivery_requires_receipt 
       WHERE g.delivery_requires_receipt = 1 
       AND o.delivery_requires_receipt = 0`,
      { transaction }
    );
    
    console.log(`✅ 更新了 ${updateCount.affectedRows} 个订单的delivery_requires_receipt字段\n`);
    
    // 2. 查找所有需要创建回执单的订单（已支付的代充订单但没有回执单）
    console.log('步骤2: 查找需要创建回执单的订单');
    const [ordersNeedingReceipts] = await sequelize.query(
      `SELECT o.id, o.order_no, o.product_id, o.product_name, o.user_id, o.quantity,
              g.receipt_fields
       FROM \`order\` o 
       INNER JOIN pr_goods g ON o.product_id = g.id 
       LEFT JOIN pr_cdk_receipts r ON r.order_id = o.id 
       WHERE g.delivery_requires_receipt = 1 
       AND o.payment_status = 1 
       AND r.id IS NULL`,
      { transaction }
    );
    
    console.log(`找到 ${ordersNeedingReceipts.length} 个需要创建回执单的订单\n`);
    
    // 3. 为每个订单创建回执单
    if (ordersNeedingReceipts.length > 0) {
      console.log('步骤3: 创建缺失的回执单');
      
      // 默认回执字段配置
      const defaultReceiptFields = JSON.stringify([
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
      ]);
      
      let totalReceiptsCreated = 0;
      
      for (const order of ordersNeedingReceipts) {
        console.log(`  处理订单: ${order.order_no} (${order.product_name})`);
        
        // 根据订单数量创建相应数量的回执单
        for (let i = 0; i < order.quantity; i++) {
          // 处理user_id为0或无效的情况
          const validUserId = order.user_id && order.user_id > 0 ? order.user_id : null;
          
          await sequelize.query(
            `INSERT INTO pr_cdk_receipts 
             (cdk_id, order_id, user_id, receipt_fields, delivery_status, created_at, updated_at) 
             VALUES (NULL, :orderId, :userId, :receiptFields, 0, NOW(), NOW())`,
            {
              replacements: {
                orderId: order.id,
                userId: validUserId,
                receiptFields: order.receipt_fields || defaultReceiptFields
              },
              transaction
            }
          );
          totalReceiptsCreated++;
        }
        console.log(`    ✅ 创建了 ${order.quantity} 个回执单`);
      }
      
      console.log(`\n✅ 总共创建了 ${totalReceiptsCreated} 个回执单\n`);
    }
    
    // 4. 显示修复后的统计信息
    console.log('步骤4: 统计修复结果');
    const [[stats]] = await sequelize.query(
      `SELECT 
        COUNT(DISTINCT o.id) as total_proxy_orders,
        COUNT(DISTINCT CASE WHEN o.payment_status = 1 THEN o.id END) as paid_proxy_orders,
        COUNT(DISTINCT r.order_id) as orders_with_receipts
       FROM \`order\` o 
       INNER JOIN pr_goods g ON o.product_id = g.id 
       LEFT JOIN pr_cdk_receipts r ON r.order_id = o.id 
       WHERE g.delivery_requires_receipt = 1`,
      { transaction }
    );
    
    console.log('📊 修复后的统计:');
    console.log(`   总代充订单数: ${stats.total_proxy_orders}`);
    console.log(`   已支付代充订单: ${stats.paid_proxy_orders}`);
    console.log(`   有回执单的订单: ${stats.orders_with_receipts}`);
    
    if (stats.paid_proxy_orders === stats.orders_with_receipts) {
      console.log('\n✅ 所有已支付的代充订单都有回执单了！');
    } else {
      console.log(`\n⚠️ 还有 ${stats.paid_proxy_orders - stats.orders_with_receipts} 个已支付订单缺少回执单`);
    }
    
    await transaction.commit();
    console.log('\n✅ 修复完成！');
    
    // 5. 特别检查之前有问题的订单
    console.log('\n特别检查订单 ORD1757893744768983:');
    const [[checkOrder]] = await sequelize.query(
      `SELECT o.order_no, o.delivery_requires_receipt, 
              COUNT(r.id) as receipt_count
       FROM \`order\` o 
       LEFT JOIN pr_cdk_receipts r ON r.order_id = o.id 
       WHERE o.order_no = 'ORD1757893744768983'
       GROUP BY o.id`
    );
    
    console.log(`   delivery_requires_receipt: ${checkOrder.delivery_requires_receipt}`);
    console.log(`   回执单数量: ${checkOrder.receipt_count}`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixHistoricalOrders().catch(console.error);