import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import CDKReceipt from '../models/CDKReceipt.js';
import { sequelize } from '../models/index.js';

const router = express.Router();

// 为已支付的代充订单创建回执单
router.post('/fix-receipts/:orderNo', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    
    // 查找订单
    const order = await Order.findOne({
      where: { orderNo },
      include: [{
        model: Product,
        as: 'product'
      }],
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }
    
    // 检查是否已支付
    if (order.paymentStatus !== 1) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '订单未支付'
      });
    }
    
    // 检查是否为代充商品
    if (!order.product || !order.product.deliveryRequiresReceipt) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '该订单商品不是代充商品'
      });
    }
    
    // 检查是否已有回执单
    const existingReceipt = await CDKReceipt.findOne({
      where: { orderId: order.id },
      transaction
    });
    
    if (existingReceipt) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '该订单已有回执单'
      });
    }
    
    // 更新订单的deliveryRequiresReceipt字段
    await Order.update(
      { deliveryRequiresReceipt: true },
      { 
        where: { id: order.id },
        transaction
      }
    );
    
    // 默认回执字段配置
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
    
    // 创建回执单
    // 使用0作为cdkId的默认值（代表没有关联的CDK）
    const receipts = [];
    for (let i = 0; i < order.quantity; i++) {
      const receipt = await CDKReceipt.create({
        cdkId: null, // 使用null表示没有关联的CDK
        orderId: order.id,
        userId: order.userId,
        receiptFields: order.product.receiptFields || defaultReceiptFields,
        deliveryStatus: 0 // 待发货
      }, { transaction });
      receipts.push(receipt);
    }
    
    await transaction.commit();
    
    res.json({
      code: 0,
      success: true,
      message: `成功为订单 ${orderNo} 创建了 ${receipts.length} 个回执单`,
      data: {
        orderNo: order.orderNo,
        receiptsCreated: receipts.length
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('创建回执单失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建回执单失败',
      error: error.message
    });
  }
});

export default router;