/**
 * 验证代充CDK手动发货邮件功能
 * 
 * 这个脚本将：
 * 1. 检查邮件配置
 * 2. 测试邮件发送功能
 * 3. 验证手动发货流程
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend-api/.env') });

// 直接测试 Brevo 邮件服务
async function testBrevoEmailService() {
  console.log('=== 测试 Brevo 邮件服务 ===\n');
  
  try {
    // 动态导入 brevoService
    const brevoService = require('./backend-api/src/services/brevoService.js').default;
    
    console.log('1. 检查 Brevo 初始化状态...');
    console.log('   初始化:', brevoService.initialized ? '✅ 已初始化' : '❌ 未初始化');
    
    if (!brevoService.initialized) {
      console.log('\n❌ Brevo 服务未初始化！');
      console.log('请检查以下配置:');
      console.log('- BREVO_API_KEY:', process.env.BREVO_API_KEY ? '已设置' : '未设置');
      console.log('- BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL || '未设置');
      return false;
    }
    
    // 测试发送手动发货邮件
    console.log('\n2. 测试发送手动发货邮件...');
    
    const testEmailData = {
      userEmail: process.env.TEST_EMAIL || 'test@example.com',
      orderNo: 'TEST-ORDER-' + Date.now(),
      productName: '测试代充服务',
      productInfo: '这是测试商品的描述信息',
      amount: 99.99,
      cdkKeys: ['CDK-TEST-001', 'CDK-TEST-002']
    };
    
    console.log('   测试邮件数据:');
    console.log('   - 收件人:', testEmailData.userEmail);
    console.log('   - 订单号:', testEmailData.orderNo);
    console.log('   - 商品名:', testEmailData.productName);
    console.log('   - CDK数量:', testEmailData.cdkKeys.length);
    
    const result = await brevoService.sendManualDeliveryCompleteEmail(testEmailData);
    
    if (result.success) {
      console.log('\n✅ 邮件发送成功!');
      console.log('   邮件ID:', result.messageId);
      console.log('   请检查邮箱:', testEmailData.userEmail);
      return true;
    } else {
      console.log('\n❌ 邮件发送失败!');
      console.log('   错误信息:', result.message);
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
    return false;
  }
}

// 分析当前系统状态
function analyzeCurrentSystem() {
  console.log('\n=== 系统分析结果 ===\n');
  
  console.log('📋 当前系统已实现的功能:');
  console.log('1. ✅ 手动发货接口: PUT /api/order/deliver/:orderNo');
  console.log('2. ✅ 状态更新: deliveryStatus=2, orderStatus=2');
  console.log('3. ✅ 发货记录创建: DeliveryRecord');
  console.log('4. ✅ 邮件发送功能: brevoService.sendManualDeliveryCompleteEmail()');
  
  console.log('\n🔍 可能的问题原因:');
  console.log('1. BREVO_API_KEY 未配置或无效');
  console.log('2. 用户邮箱地址无效或为空');
  console.log('3. 邮件被归类为垃圾邮件');
  console.log('4. Brevo 账户额度不足');
  console.log('5. 网络连接问题');
  
  console.log('\n💡 建议的解决方案:');
  console.log('1. 确认 BREVO_API_KEY 有效性');
  console.log('2. 在发货时添加邮件发送状态提示');
  console.log('3. 添加邮件发送重试机制');
  console.log('4. 记录邮件发送日志到数据库');
  console.log('5. 在前端显示邮件发送状态');
}

// 生成修复建议
function generateFixSuggestions() {
  console.log('\n=== 修复建议 ===\n');
  
  console.log('📝 立即可以执行的操作:');
  console.log('1. 检查 backend-api/.env 中的邮件配置');
  console.log('2. 查看 backend-api/server.log 中的错误日志');
  console.log('3. 在 Brevo 控制台检查邮件发送记录');
  console.log('4. 测试使用有效的邮箱地址');
  
  console.log('\n🔧 代码改进建议:');
  console.log('1. 在 order.routes.js 的发货接口添加详细日志');
  console.log('2. 在 brevoService.js 添加错误重试机制');
  console.log('3. 创建邮件发送状态表记录每次发送');
  console.log('4. 在管理后台显示邮件发送状态');
}

// 主函数
async function main() {
  console.log('=====================================');
  console.log('   代充CDK手动发货邮件功能验证');
  console.log('=====================================\n');
  
  // 1. 检查环境配置
  console.log('环境配置检查:');
  console.log('- BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ 已配置' : '❌ 未配置');
  console.log('- BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL ? '✅ 已配置' : '❌ 未配置');
  console.log('- TEST_EMAIL:', process.env.TEST_EMAIL || '未配置（将使用默认）');
  
  if (!process.env.BREVO_API_KEY) {
    console.log('\n❌ 错误: BREVO_API_KEY 未配置!');
    console.log('请在 backend-api/.env 文件中添加:');
    console.log('BREVO_API_KEY=your-api-key-here');
    return;
  }
  
  // 2. 测试邮件服务
  console.log('\n开始测试邮件服务...\n');
  const emailTestSuccess = await testBrevoEmailService();
  
  // 3. 分析系统
  analyzeCurrentSystem();
  
  // 4. 生成修复建议
  generateFixSuggestions();
  
  // 5. 总结
  console.log('\n=====================================');
  console.log('              测试总结');
  console.log('=====================================\n');
  
  if (emailTestSuccess) {
    console.log('✅ 邮件服务正常工作！');
    console.log('\n如果用户仍未收到邮件，请检查:');
    console.log('1. 用户邮箱地址是否正确');
    console.log('2. 邮件是否在垃圾邮件文件夹');
    console.log('3. 订单数据中是否包含有效的 userEmail');
  } else {
    console.log('❌ 邮件服务存在问题！');
    console.log('\n请按照上述建议进行修复。');
  }
  
  console.log('\n测试完成！');
}

// 运行测试
main().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});