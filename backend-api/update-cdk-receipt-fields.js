/**
 * 更新CDK回执字段默认配置
 * 运行: node update-cdk-receipt-fields.js
 */

import sequelize from './src/db/sequelize.js';
import CDK from './src/models/CDK.js';

const defaultReceiptFields = [
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
];

async function updateCDKReceiptFields() {
  try {
    console.log('开始更新CDK回执字段配置...');
    
    // 查找所有代充类型的CDK
    const cdks = await CDK.findAll({
      where: {
        cdkCategory: 'manual_recharge'
      }
    });
    
    console.log(`找到 ${cdks.length} 个代充CDK`);
    
    let updatedCount = 0;
    
    for (const cdk of cdks) {
      // 如果没有配置回执字段，使用默认配置
      if (!cdk.receiptFields || Object.keys(cdk.receiptFields).length === 0) {
        cdk.receiptFields = defaultReceiptFields;
        await cdk.save();
        updatedCount++;
      }
    }
    
    console.log(`成功更新 ${updatedCount} 个CDK的回执字段配置`);
    
    // 同时更新CDKReceipt表中的默认字段
    const CDKReceipt = sequelize.models.CDKReceipt;
    if (CDKReceipt) {
      const receipts = await CDKReceipt.findAll({
        where: {
          receiptFields: null
        }
      });
      
      console.log(`找到 ${receipts.length} 个需要更新的回执记录`);
      
      for (const receipt of receipts) {
        receipt.receiptFields = defaultReceiptFields;
        await receipt.save();
      }
      
      console.log('回执记录更新完成');
    }
    
    console.log('✅ 所有更新完成');
    process.exit(0);
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
}

// 执行更新
updateCDKReceiptFields();