#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n========================================');
console.log('更新微信支付回调URL配置');
console.log('========================================\n');

rl.question('请输入localtunnel提供的URL (例如: https://xxx.loca.lt): ', (tunnelUrl) => {
  if (!tunnelUrl || !tunnelUrl.startsWith('https://')) {
    console.error('❌ 无效的URL，必须以https://开头');
    rl.close();
    return;
  }

  // 构建完整的回调URL
  const callbackUrl = `${tunnelUrl}/api/wechat/pay/callback`;
  
  // 读取.env文件
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('❌ 无法读取.env文件:', error.message);
    rl.close();
    return;
  }

  // 检查是否已存在WX_PAY_NOTIFY_URL
  if (envContent.includes('WX_PAY_NOTIFY_URL=')) {
    // 更新现有的URL
    envContent = envContent.replace(
      /WX_PAY_NOTIFY_URL=.*/,
      `WX_PAY_NOTIFY_URL=${callbackUrl}`
    );
  } else {
    // 添加新的URL
    envContent += `\n# 微信支付回调URL（内网穿透）\nWX_PAY_NOTIFY_URL=${callbackUrl}\n`;
  }

  // 写回文件
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ 配置更新成功！');
    console.log(`📍 回调URL已设置为: ${callbackUrl}`);
    console.log('\n⚠️  注意事项:');
    console.log('1. 请重启后端服务让配置生效');
    console.log('2. 首次使用需要在浏览器中访问该URL进行验证');
    console.log('3. localtunnel需要保持运行状态');
    console.log('4. 生产环境请使用正式的公网域名');
  } catch (error) {
    console.error('❌ 无法写入.env文件:', error.message);
  }

  rl.close();
});