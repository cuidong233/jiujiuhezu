import pool from './src/db/database.js';

async function fixOrders() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. 将已支付且已发货的订单更新为已完成
    console.log('\n1. 更新已支付且已发货的订单为已完成状态...');
    const [result1] = await connection.execute(
      `UPDATE \`order\` 
       SET order_status = 2, 
           completed_at = NOW(),
           remark = CONCAT(IFNULL(remark, ''), ' [系统自动完成]')
       WHERE payment_status = 1 
       AND delivery_status = 2 
       AND order_status IN (0, 1)`,
      []
    );
    console.log(`  已更新 ${result1.affectedRows} 个订单为已完成状态`);
    
    // 2. 取消超过24小时未支付的订单
    console.log('\n2. 取消超过24小时未支付的订单...');
    const [result2] = await connection.execute(
      `UPDATE \`order\` 
       SET order_status = 3,
           remark = CONCAT(IFNULL(remark, ''), ' [超时自动取消]')
       WHERE payment_status = 0 
       AND order_status = 0
       AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      []
    );
    console.log(`  已取消 ${result2.affectedRows} 个超时未支付的订单`);
    
    // 3. 查看剩余的未完成订单
    console.log('\n3. 查询剩余的未完成订单...');
    const [unfinishedOrders] = await connection.execute(
      `SELECT 
        o.id,
        o.order_no,
        o.product_id,
        o.product_name,
        o.order_status,
        o.payment_status,
        o.delivery_status,
        o.created_at,
        p.title as current_product_name
      FROM \`order\` o
      LEFT JOIN pr_goods p ON o.product_id = p.id
      WHERE o.order_status IN (0, 1)
      ORDER BY o.created_at DESC`,
      []
    );
    
    if (unfinishedOrders.length > 0) {
      console.log(`\n仍有 ${unfinishedOrders.length} 个未完成的订单:`);
      console.log('\n订单号\t\t\t商品ID\t订单状态\t支付状态\t发货状态\t创建时间');
      console.log('-'.repeat(100));
      
      unfinishedOrders.forEach(order => {
        const statusText = {
          0: '待处理',
          1: '处理中'
        };
        console.log(`${order.order_no}\t${order.product_id}\t${statusText[order.order_status]}\t\t${order.payment_status}\t\t${order.delivery_status}\t\t${new Date(order.created_at).toLocaleString()}`);
      });
      
      console.log('\n建议处理方案:');
      console.log('  - 对于近期的订单，请在管理后台手动处理');
      console.log('  - 对于测试订单，可以手动取消或标记为完成');
    } else {
      console.log('  没有未完成的订单了！');
    }
    
    // 4. 统计各商品的订单情况
    console.log('\n4. 商品订单统计:');
    const [stats] = await connection.execute(
      `SELECT 
        p.id,
        p.title,
        COUNT(o.id) as total_orders,
        SUM(CASE WHEN o.order_status = 0 THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN o.order_status = 1 THEN 1 ELSE 0 END) as processing_orders,
        SUM(CASE WHEN o.order_status = 2 THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN o.order_status = 3 THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN o.order_status = 4 THEN 1 ELSE 0 END) as refunded_orders
      FROM pr_goods p
      LEFT JOIN \`order\` o ON p.id = o.product_id
      GROUP BY p.id
      HAVING total_orders > 0
      ORDER BY (pending_orders + processing_orders) DESC, p.id DESC`,
      []
    );
    
    console.log('\nID\t商品名称\t\t\t待处理\t处理中\t已完成\t已取消\t已退款');
    console.log('-'.repeat(80));
    stats.forEach(stat => {
      const title = stat.title.length > 20 ? stat.title.substring(0, 17) + '...' : stat.title;
      console.log(`${stat.id}\t${title.padEnd(25)}\t${stat.pending_orders}\t${stat.processing_orders}\t${stat.completed_orders}\t${stat.cancelled_orders}\t${stat.refunded_orders}`);
    });
    
    // 询问是否提交更改
    console.log('\n是否提交这些更改？(输入 yes 确认，其他任意键取消)');
    
    // 如果传入参数 --auto-confirm 则自动确认
    if (process.argv.includes('--auto-confirm')) {
      await connection.commit();
      console.log('✅ 更改已自动提交！');
    } else {
      // 等待用户输入
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          await connection.commit();
          console.log('✅ 更改已提交！');
        } else {
          await connection.rollback();
          console.log('❌ 更改已回滚！');
        }
        rl.close();
        process.exit(0);
      });
    }
    
  } catch (error) {
    await connection.rollback();
    console.error('处理失败:', error);
    process.exit(1);
  } finally {
    if (process.argv.includes('--auto-confirm')) {
      connection.release();
      process.exit(0);
    }
  }
}

fixOrders();