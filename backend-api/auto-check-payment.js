#!/usr/bin/env node

import fetch from 'node-fetch';

// 从命令行参数获取订单号
const orderNo = process.argv[2];

if (!orderNo) {
  console.log('用法: node auto-check-payment.js 订单号');
  console.log('例如: node auto-check-payment.js ORD175731981639059');
  process.exit(1);
}

console.log(`开始监控订单 ${orderNo} 的支付状态...`);
console.log('每3秒检查一次，支付成功后自动停止\n');

let checkCount = 0;
const maxChecks = 100; // 最多检查5分钟

const checkPayment = async () => {
  try {
    const response = await fetch(`http://localhost:3002/api/wechat/pay/query/${orderNo}`);
    const result = await response.json();
    
    if (result.code === 0 && result.data) {
      const status = result.data.trade_state;
      
      if (status === 'SUCCESS') {
        console.log('\n🎉 支付成功！');
        console.log(`订单号: ${orderNo}`);
        console.log(`金额: ${result.data.amount?.payer_total / 100}元`);
        console.log(`微信交易号: ${result.data.transaction_id}`);
        process.exit(0);
      } else if (status === 'CLOSED') {
        console.log('\n❌ 订单已关闭');
        process.exit(1);
      } else {
        process.stdout.write(`\r⏳ 等待支付中... (${++checkCount}/${maxChecks})`);
      }
    }
  } catch (error) {
    process.stdout.write(`\r⚠️ 查询失败，继续尝试... (${++checkCount}/${maxChecks})`);
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n⏰ 超时，请手动查询');
    process.exit(1);
  }
};

// 每3秒查询一次
setInterval(checkPayment, 3000);
checkPayment(); // 立即查询一次