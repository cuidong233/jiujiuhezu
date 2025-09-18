/**
 * 测试手动发货邮件修复
 * 需要先重启后端服务: cd backend-api && npm run dev
 */

import axios from 'axios';

const API_URL = 'http://localhost:5174/api';

console.log('=== 测试手动发货邮件修复 ===\n');
console.log('⚠️  请确保后端服务已重启以应用修复\n');

async function testManualDelivery() {
  try {
    // 模拟手动发货请求
    const testOrderNo = 'TEST-' + Date.now();
    const testData = {
      cdkCodes: ['TEST-CDK-001'],
      additionalInfo: '测试附加信息',
      remark: '测试备注',
      deliveryContent: 'TEST-CDK-001\n\n测试附加信息'
    };
    
    console.log('📋 测试数据:');
    console.log('   订单号:', testOrderNo);
    console.log('   CDK码:', testData.cdkCodes);
    console.log('\n💡 说明:');
    console.log('   1. 如果后端正确修复，应该能看到"准备发送手动发货邮件"的日志');
    console.log('   2. 不会再出现"require is not defined"错误');
    console.log('   3. 邮件应该正常发送\n');
    
    console.log('📝 查看后端日志:');
    console.log('   tail -f backend-api/server.log | grep -E "邮件|email|发货"\n');
    
    console.log('✅ 修复内容:');
    console.log('   1. 在order.routes.js顶部添加了: import brevoService from \'../services/brevoService.js\'');
    console.log('   2. 删除了第661行的require语句');
    console.log('   3. 现在使用ES6模块导入方式，避免了require错误\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testManualDelivery();

console.log('\n📋 后续步骤:');
console.log('1. 重启后端服务: cd backend-api && npm run dev');
console.log('2. 在管理后台找一个待发货的手动发货订单');
console.log('3. 点击"发货"按钮');
console.log('4. 输入CDK码并确认发货');
console.log('5. 检查邮箱是否收到邮件');
console.log('6. 查看server.log确认没有错误');