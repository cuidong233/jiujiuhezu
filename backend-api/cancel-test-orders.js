import pool from './src/db/database.js';

async function cancelTestOrders() {
  const connection = await pool.getConnection();
  
  try {
    // 获取要取消的订单号列表
    const orderNos = [
      'ORD175786589406712',
      'ORD1757865843612910', 
      'ORD1757865839884554',
      'ORD175786539017663'
    ];
    
    console.log('准备取消以下测试订单:', orderNos);
    
    await connection.beginTransaction();
    
    // 取消这些订单
    const placeholders = orderNos.map(() => '?').join(',');
    const [result] = await connection.execute(
      `UPDATE \`order\` 
       SET order_status = 3,
           remark = CONCAT(IFNULL(remark, ''), ' [手动取消测试订单]')
       WHERE order_no IN (${placeholders})
       AND payment_status = 0`,
      orderNos
    );
    
    console.log(`已取消 ${result.affectedRows} 个订单`);
    
    // 查看商品ID 11的订单状态
    const [orders] = await connection.execute(
      `SELECT order_no, order_status, payment_status 
       FROM \`order\` 
       WHERE product_id = 11`,
      []
    );
    
    console.log('\n商品ID 11的订单状态:');
    orders.forEach(order => {
      const statusText = {
        0: '待处理',
        1: '处理中', 
        2: '已完成',
        3: '已取消',
        4: '已退款'
      };
      console.log(`  ${order.order_no}: ${statusText[order.order_status]}`);
    });
    
    await connection.commit();
    console.log('\n✅ 测试订单已成功取消！');
    
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('取消失败:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

cancelTestOrders();