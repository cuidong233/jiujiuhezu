/**
 * 诊断代充CDK手动发货问题
 * 问题：手动发货后前台显示已发货，但后台仍是待处理，且没有邮件
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend-api/.env') });

async function diagnoseDeliveryIssue() {
  console.log('=== 诊断手动发货问题 ===\n');
  
  const mysql = require('mysql2/promise');
  
  // 创建数据库连接
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jiujiu'
  });
  
  try {
    // 1. 检查最近的订单状态
    console.log('1. 检查最近的订单（特别是手动发货的）：');
    const [recentOrders] = await connection.execute(`
      SELECT 
        order_no,
        user_id,
        user_email,
        product_name,
        payment_status,
        delivery_status,
        order_status,
        delivery_mode,
        delivered_at,
        updated_at
      FROM pr_orders
      WHERE delivery_mode = 'manual' OR delivery_mode IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('最近的手动发货订单：');
    for (const order of recentOrders) {
      console.log(`\n订单号: ${order.order_no}`);
      console.log(`  商品: ${order.product_name}`);
      console.log(`  用户邮箱: ${order.user_email || '❌ 未设置'}`);
      console.log(`  支付状态: ${order.payment_status} (${order.payment_status === 1 ? '已支付' : '未支付'})`);
      console.log(`  发货状态: ${order.delivery_status} (${getDeliveryStatusText(order.delivery_status)})`);
      console.log(`  订单状态: ${order.order_status} (${getOrderStatusText(order.order_status)})`);
      console.log(`  发货方式: ${order.delivery_mode || '未设置'}`);
      console.log(`  发货时间: ${order.delivered_at || '未发货'}`);
      console.log(`  更新时间: ${order.updated_at}`);
      
      // 检查发货记录
      const [deliveryRecords] = await connection.execute(`
        SELECT COUNT(*) as count FROM pr_delivery_records 
        WHERE order_id = (SELECT id FROM pr_orders WHERE order_no = ?)
      `, [order.order_no]);
      console.log(`  发货记录: ${deliveryRecords[0].count} 条`);
    }
    
    // 2. 检查数据库字段映射
    console.log('\n2. 检查数据库表结构：');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pr_orders'
      AND COLUMN_NAME IN ('delivery_status', 'order_status', 'user_email', 'delivered_at')
    `, [process.env.DB_NAME || 'jiujiu']);
    
    console.log('订单表关键字段：');
    for (const col of columns) {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? '可空' : '非空'}) 默认值: ${col.COLUMN_DEFAULT || '无'}`);
    }
    
    // 3. 测试更新语句
    console.log('\n3. 测试更新语句（使用测试订单）：');
    
    // 找一个待发货的订单做测试
    const [testOrders] = await connection.execute(`
      SELECT order_no FROM pr_orders 
      WHERE payment_status = 1 AND delivery_status = 0 
      LIMIT 1
    `);
    
    if (testOrders.length > 0) {
      const testOrderNo = testOrders[0].order_no;
      console.log(`找到测试订单: ${testOrderNo}`);
      
      // 开始事务
      await connection.beginTransaction();
      
      try {
        // 尝试更新
        const [updateResult] = await connection.execute(`
          UPDATE pr_orders 
          SET 
            delivery_status = 2,
            order_status = 2,
            delivered_at = NOW(),
            updated_at = NOW()
          WHERE order_no = ?
        `, [testOrderNo]);
        
        console.log(`更新结果: 影响行数 = ${updateResult.affectedRows}`);
        
        // 验证更新
        const [verifyResult] = await connection.execute(`
          SELECT delivery_status, order_status, delivered_at 
          FROM pr_orders 
          WHERE order_no = ?
        `, [testOrderNo]);
        
        if (verifyResult.length > 0) {
          console.log('更新后的值：');
          console.log(`  delivery_status: ${verifyResult[0].delivery_status}`);
          console.log(`  order_status: ${verifyResult[0].order_status}`);
          console.log(`  delivered_at: ${verifyResult[0].delivered_at}`);
        }
        
        // 回滚事务（不真正更新）
        await connection.rollback();
        console.log('✅ 测试事务已回滚（不影响真实数据）');
        
      } catch (error) {
        await connection.rollback();
        console.error('❌ 更新失败:', error.message);
      }
    } else {
      console.log('没有找到待发货的订单用于测试');
    }
    
    // 4. 检查 Sequelize 模型与数据库的匹配
    console.log('\n4. 分析可能的问题：');
    console.log('📋 可能的原因：');
    console.log('1. Sequelize 事务提交失败但返回了成功');
    console.log('2. 更新语句没有找到匹配的记录（WHERE 条件问题）');
    console.log('3. 数据库连接池问题导致事务没有正确提交');
    console.log('4. 前端缓存了旧数据，显示的是缓存而非真实状态');
    
    // 5. 建议的修复方案
    console.log('\n5. 建议的修复方案：');
    console.log('✅ 在 order.routes.js 的手动发货接口添加验证：');
    console.log('```javascript');
    console.log('// 在事务提交后，验证更新是否成功');
    console.log('await transaction.commit();');
    console.log('');
    console.log('// 重新查询订单验证状态');
    console.log('const updatedOrder = await Order.findOne({');
    console.log('  where: { orderNo }');
    console.log('});');
    console.log('');
    console.log('if (updatedOrder.deliveryStatus !== 2) {');
    console.log('  console.error(`❌ 订单 ${orderNo} 状态更新失败！`);');
    console.log('  throw new Error("订单状态更新失败");');
    console.log('}');
    console.log('```');
    
  } catch (error) {
    console.error('诊断过程出错:', error);
  } finally {
    await connection.end();
  }
}

function getDeliveryStatusText(status) {
  const map = {
    0: '待发货',
    1: '部分发货',
    2: '已发货',
    3: '已送达'
  };
  return map[status] || '未知';
}

function getOrderStatusText(status) {
  const map = {
    0: '待处理',
    1: '处理中',
    2: '已完成',
    3: '已取消',
    4: '已退款'
  };
  return map[status] || '未知';
}

// 运行诊断
diagnoseDeliveryIssue().catch(console.error);