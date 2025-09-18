/**
 * 调试手动发货邮件问题
 * 运行方式: cd backend-api && node ../test-manual-delivery-email-debug.js
 */

const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'backend-api', '.env') });

console.log('=== 手动发货邮件调试 ===\n');

// 1. 检查环境变量
console.log('1. 检查环境变量:');
console.log(`   BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '已设置 (' + process.env.BREVO_API_KEY.substring(0, 10) + '...)' : '未设置'}`);
console.log(`   BREVO_SENDER_EMAIL: ${process.env.BREVO_SENDER_EMAIL || '未设置'}`);
console.log(`   BREVO_SENDER_NAME: ${process.env.BREVO_SENDER_NAME || '未设置'}\n`);

// 2. 测试Brevo服务初始化
console.log('2. 测试Brevo服务初始化:');
try {
  const brevoService = require('./backend-api/src/services/brevoService.js').default;
  console.log('   ✅ Brevo服务加载成功');
  
  // 检查服务状态
  if (!process.env.BREVO_API_KEY) {
    console.log('   ❌ BREVO_API_KEY未设置，邮件服务不会初始化');
  } else {
    console.log('   ✅ BREVO_API_KEY已设置，邮件服务应该可以正常工作');
  }
} catch (error) {
  console.error('   ❌ Brevo服务加载失败:', error.message);
}

// 3. 模拟手动发货邮件发送
console.log('\n3. 测试手动发货邮件发送:');

async function testManualDeliveryEmail() {
  try {
    const brevoService = require('./backend-api/src/services/brevoService.js').default;
    
    // 准备测试数据
    const testData = {
      userEmail: 'cuidong111@gmail.com', // 测试邮箱
      orderNo: 'TEST-' + Date.now(),
      productName: '测试商品 - Netflix会员',
      productInfo: '这是一个测试商品的描述信息',
      amount: 99.99,
      cdkKeys: ['TEST-CDK-001', 'TEST-CDK-002']
    };
    
    console.log('   发送测试邮件到:', testData.userEmail);
    console.log('   订单号:', testData.orderNo);
    console.log('   商品:', testData.productName);
    console.log('   CDK数量:', testData.cdkKeys.length);
    
    // 调用发送邮件方法
    const result = await brevoService.sendManualDeliveryCompleteEmail(testData);
    
    if (result.success) {
      console.log('\n   ✅ 邮件发送成功!');
      console.log('   邮件ID:', result.messageId);
      console.log('   请检查邮箱是否收到邮件');
    } else {
      console.log('\n   ❌ 邮件发送失败!');
      console.log('   错误信息:', result.message);
      
      if (result.message.includes('未初始化')) {
        console.log('\n   💡 解决方案:');
        console.log('   1. 确保 backend-api/.env 文件中设置了 BREVO_API_KEY');
        console.log('   2. 重启后端服务: npm run dev');
      }
    }
  } catch (error) {
    console.error('\n   ❌ 测试失败:', error.message);
    console.error('   详细错误:', error);
  }
}

// 4. 检查数据库订单邮箱
console.log('\n4. 检查最近订单的邮箱设置:');
async function checkOrderEmails() {
  try {
    const mysql = require('mysql2/promise');
    
    // 尝试多个可能的数据库名
    const dbNames = ['jiujiu', 'pr_card', 'jiujiu_card'];
    let connection = null;
    
    for (const dbName of dbNames) {
      try {
        connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: dbName
        });
        console.log(`   ✅ 连接到数据库: ${dbName}`);
        break;
      } catch (err) {
        // 继续尝试下一个
      }
    }
    
    if (!connection) {
      console.log('   ❌ 无法连接到数据库');
      return;
    }
    
    // 查询最近的订单
    const [rows] = await connection.execute(
      'SELECT order_no, user_id, user_email, payment_status, delivery_status FROM `order` WHERE payment_status = 1 ORDER BY id DESC LIMIT 5'
    );
    
    console.log('\n   最近的已支付订单:');
    rows.forEach(row => {
      console.log(`   订单号: ${row.order_no}`);
      console.log(`   用户ID: ${row.user_id}`);
      console.log(`   邮箱: ${row.user_email || '❌ 未设置'}`);
      console.log(`   发货状态: ${row.delivery_status === 0 ? '待发货' : row.delivery_status === 2 ? '已发货' : '其他'}`);
      console.log('   ---');
    });
    
    const noEmailCount = rows.filter(r => !r.user_email).length;
    if (noEmailCount > 0) {
      console.log(`\n   ⚠️ 警告: ${noEmailCount}/${rows.length} 个订单没有邮箱地址`);
      console.log('   这就是为什么用户收不到邮件的原因！');
      
      console.log('\n   💡 解决方案:');
      console.log('   1. 确保用户注册/登录时提供了邮箱');
      console.log('   2. 订单创建时将用户邮箱保存到order表的user_email字段');
      console.log('   3. 可以通过后台管理手动补充订单邮箱');
    }
    
    await connection.end();
  } catch (error) {
    console.error('   ❌ 数据库检查失败:', error.message);
  }
}

// 执行测试
async function main() {
  await testManualDeliveryEmail();
  await checkOrderEmails();
  
  console.log('\n=== 调试完成 ===');
  console.log('\n📋 检查清单:');
  console.log('1. [ ] BREVO_API_KEY 是否已设置？');
  console.log('2. [ ] 订单表中 user_email 字段是否有值？');
  console.log('3. [ ] 邮件服务是否正常初始化？');
  console.log('4. [ ] 测试邮件是否发送成功？');
  console.log('5. [ ] 检查垃圾邮件文件夹？');
  
  process.exit(0);
}

main();