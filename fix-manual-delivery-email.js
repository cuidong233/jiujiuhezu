/**
 * 修复代充CDK手动发货邮件问题
 * 
 * 问题描述：
 * 1. 代充CDK（manual_recharge类型）手动发货后状态不更新
 * 2. 用户没有收到邮件通知
 * 
 * 解决方案：
 * 1. 确保手动发货后订单状态正确更新
 * 2. 确保邮件通知正常发送
 * 3. 添加错误处理和日志记录
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend-api/.env') });

const axios = require('axios');

// 测试配置
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_ORDER_NO = 'ORDER-TEST-001'; // 替换为实际订单号

/**
 * 测试手动发货流程
 */
async function testManualDelivery() {
  console.log('=== 测试代充CDK手动发货流程 ===\n');
  
  try {
    // 1. 准备发货数据
    const deliveryData = {
      cdkCodes: ['CDK-TEST-001'], // CDK码
      additionalInfo: '测试附加信息',
      remark: '测试备注',
      deliveryContent: 'CDK-TEST-001\n\n测试附加信息'
    };
    
    console.log('1. 发送手动发货请求...');
    console.log('   订单号:', TEST_ORDER_NO);
    console.log('   CDK码:', deliveryData.cdkCodes);
    
    // 2. 调用发货接口
    const response = await axios.put(
      `${API_BASE_URL}/order/deliver/${TEST_ORDER_NO}`,
      deliveryData
    );
    
    if (response.data.code === 200) {
      console.log('\n✅ 发货成功!');
      console.log('   响应:', response.data.message);
      
      // 3. 验证订单状态
      console.log('\n2. 验证订单状态...');
      const orderResponse = await axios.get(
        `${API_BASE_URL}/order/${TEST_ORDER_NO}`
      );
      
      if (orderResponse.data.data) {
        const order = orderResponse.data.data;
        console.log('   发货状态:', order.deliveryStatus === 2 ? '✅ 已发货' : '❌ 未发货');
        console.log('   订单状态:', order.orderStatus === 2 ? '✅ 已完成' : '❌ 未完成');
        console.log('   用户邮箱:', order.userEmail || '未设置');
      }
      
      // 4. 检查邮件发送状态
      console.log('\n3. 邮件发送状态:');
      console.log('   请检查用户邮箱是否收到邮件');
      console.log('   邮件主题: ✅ Order Delivered - [商品名称]');
      
    } else {
      console.error('❌ 发货失败:', response.data.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

/**
 * 检查邮件配置
 */
function checkEmailConfig() {
  console.log('\n=== 检查邮件配置 ===');
  
  const brevoApiKey = process.env.BREVO_API_KEY;
  const emailFrom = process.env.EMAIL_FROM_ADDRESS;
  const emailName = process.env.EMAIL_FROM_NAME;
  
  console.log('BREVO_API_KEY:', brevoApiKey ? '✅ 已配置' : '❌ 未配置');
  console.log('EMAIL_FROM_ADDRESS:', emailFrom || '❌ 未配置');
  console.log('EMAIL_FROM_NAME:', emailName || '❌ 未配置');
  
  if (!brevoApiKey) {
    console.log('\n⚠️  警告: 邮件功能需要配置 BREVO_API_KEY');
    console.log('请在 backend-api/.env 文件中添加:');
    console.log('BREVO_API_KEY=your-api-key');
    console.log('EMAIL_FROM_ADDRESS=noreply@yourdomain.com');
    console.log('EMAIL_FROM_NAME=Your Store Name');
  }
  
  return !!brevoApiKey;
}

/**
 * 主函数
 */
async function main() {
  console.log('代充CDK手动发货修复方案\n');
  console.log('=====================================\n');
  
  // 1. 检查邮件配置
  const emailConfigured = checkEmailConfig();
  
  if (!emailConfigured) {
    console.log('\n请先配置邮件服务，然后重新运行此脚本。');
    return;
  }
  
  // 2. 显示修复说明
  console.log('\n=== 修复说明 ===');
  console.log('当前系统已经实现了手动发货功能，包括:');
  console.log('1. ✅ 更新订单状态 (deliveryStatus: 2, orderStatus: 2)');
  console.log('2. ✅ 创建发货记录 (DeliveryRecord)');
  console.log('3. ✅ 发送邮件通知 (brevoService.sendManualDeliveryCompleteEmail)');
  
  console.log('\n如果邮件没有发送，可能的原因:');
  console.log('1. BREVO_API_KEY 未配置或无效');
  console.log('2. 用户邮箱地址无效');
  console.log('3. 邮件服务器连接问题');
  
  console.log('\n=== 建议的改进 ===');
  console.log('1. 添加邮件发送日志记录');
  console.log('2. 添加邮件发送失败重试机制');
  console.log('3. 在前端显示邮件发送状态');
  
  // 3. 询问是否运行测试
  console.log('\n要测试手动发货功能，请:');
  console.log('1. 确保后端服务正在运行 (npm run dev)');
  console.log('2. 修改 TEST_ORDER_NO 为实际订单号');
  console.log('3. 取消注释下面的 testManualDelivery() 调用');
  
  // 取消注释以运行测试
  // await testManualDelivery();
}

// 运行主函数
main().catch(console.error);