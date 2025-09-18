import express from 'express';
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DeliveryRecord from '../models/DeliveryRecord.js';
import CDKReceipt from '../models/CDKReceipt.js';
import CDK from '../models/CDK.js';
import { sequelize } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import deliveryService from '../services/deliveryService.js';
import brevoService from '../services/brevoService.js';

const router = express.Router();

// 获取单个订单详情
router.get('/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    // 验证订单号格式
    if (!orderNo || orderNo.length < 5) {
      return res.status(400).json({
        code: 400,
        message: '无效的订单号',
        success: false
      });
    }
    
    const order = await Order.findOne({
      where: { orderNo }
    });
    
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        success: false
      });
    }
    
    // 转换支付状态
    const orderData = order.toJSON();
    if (orderData.paymentStatus === 1) {
      orderData.payment_status = 'paid';
      orderData.status = 'paid';
    } else {
      orderData.payment_status = 'pending';
      orderData.status = 'pending';
    }
    
    res.json({
      code: 0,  // 修改为0，与前端期望一致
      message: '获取订单成功',
      data: orderData,
      success: true
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    // 记录更详细的错误信息
    console.error('错误栈:', error.stack);
    
    // 检查是否是数据库连接错误
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({
        code: 503,
        message: '数据库连接失败',
        success: false
      });
    }
    
    res.status(500).json({
      code: 500,
      message: '获取订单失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      success: false
    });
  }
});

// 创建订单 - 添加认证中间件
router.post('/create', authenticate, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // 从认证中间件获取用户ID
    const userId = req.user.id;
    const {
      productId,
      productName,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod,
      userEmail,
      remark
    } = req.body;

    // 获取商品信息以获取deliveryRequiresReceipt字段
    const product = await Product.findByPk(productId, { transaction });
    
    // 生成订单号
    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNo,
      userId,
      productId,
      productName,
      quantity: quantity || 1,
      unitPrice,
      totalAmount,
      paymentMethod: paymentMethod || null,  // 不设置默认值，等用户支付时再设置
      paymentStatus: 0, // 待支付
      deliveryStatus: 0, // 待发货
      orderStatus: 0, // 待处理
      userEmail,
      remark,
      deliveryRequiresReceipt: product ? product.deliveryRequiresReceipt : false
    }, { transaction });

    await transaction.commit();

    res.json({
      code: 200,
      message: '订单创建成功',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建订单失败',
      error: error.message
    });
  }
});

// 用户端查询订单列表 - 添加认证中间件
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    // 验证用户只能查询自己的订单
    const { userId } = req.params;
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        code: 403,
        message: '无权查看其他用户的订单'
      });
    }
    const { status, page = 1, pageSize = 10, paymentStatus } = req.query;

    const where = { userId };
    
    // 如果前端传入paymentStatus，则使用
    if (paymentStatus !== undefined) {
      where.paymentStatus = parseInt(paymentStatus);
    }
    
    // 根据状态筛选
    if (status !== undefined) {
      where.orderStatus = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 200,
      message: '查询成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('查询用户订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      error: error.message
    });
  }
});

// 管理端查询所有订单
router.get('/admin/list', async (req, res) => {
  try {
    const {
      orderNo,
      userId,
      paymentStatus,
      orderStatus,
      deliveryStatus,
      startDate,
      endDate,
      page = 1,
      pageSize = 10
    } = req.query;

    const where = {};

    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }
    if (userId) {
      where.userId = userId;
    }
    if (paymentStatus !== undefined && paymentStatus !== '') {
      where.paymentStatus = paymentStatus;
    }
    if (orderStatus !== undefined && orderStatus !== '') {
      where.orderStatus = orderStatus;
    }
    if (deliveryStatus !== undefined && deliveryStatus !== '') {
      where.deliveryStatus = deliveryStatus;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'cdkType', 'deliveryMode', 'deliveryRequiresReceipt']
        }
      ]
    });

    // 处理订单数据，添加代充标记
    const processedRows = rows.map(order => {
      const orderData = order.toJSON();
      // 检查是否为代充订单（优先使用deliveryRequiresReceipt字段）
      orderData.isProxyRecharge = order.product && 
        (order.product.deliveryRequiresReceipt === true ||
         order.product.cdkType === 'manual_recharge' || 
         order.product.cdkType === '代充' ||
         (order.product.deliveryMode === 'manual' && order.product.cdkType === 'recharge'));
      // 同时传递deliveryRequiresReceipt标记
      orderData.deliveryRequiresReceipt = order.product?.deliveryRequiresReceipt || false;
      return orderData;
    });

    res.json({
      code: 200,
      message: '查询成功',
      data: {
        list: processedRows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('查询订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      error: error.message
    });
  }
});

// 获取订单详情
router.get('/detail/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;

    const order = await Order.findOne({
      where: { orderNo }
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    res.json({
      code: 200,
      message: '查询成功',
      data: order
    });
  } catch (error) {
    console.error('查询订单详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '查询失败',
      error: error.message
    });
  }
});

// 更新订单支付状态
router.put('/payment-status/:orderNo', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    const { paymentStatus, paymentMethod, tradeNo } = req.body;

    const order = await Order.findOne({
      where: { orderNo },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 更新支付状态
    const updateData = {
      paymentStatus
    };

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    // 如果支付成功，记录支付时间并尝试自动发货
    if (paymentStatus === 1) {
      updateData.paidAt = new Date();
      updateData.orderStatus = 1; // 更新为处理中
    }

    await order.update(updateData, { transaction });

    await transaction.commit();

    // 支付成功后，检查是否需要自动发货并发送邮件
    if (paymentStatus === 1) {
      // 获取商品信息以确定发货模式
      const product = await Product.findByPk(order.productId);
      
      if (product) {
        // 记录支付成功到通知服务（包含发货模式）
        const paymentNotificationService = (await import('../services/paymentNotificationService.js')).default;
        paymentNotificationService.recordPaymentSuccess(orderNo, {
          amount: order.totalAmount,
          payType: order.paymentMethod,
          userId: order.userId,
          userEmail: order.userEmail,
          productName: product.name,
          productInfo: product.description,
          deliveryMode: product.deliveryMode
        });
        
        if (product.deliveryMode === 'auto') {
          // 异步处理自动发货，不影响支付响应
          setTimeout(async () => {
            try {
              const deliveryResult = await deliveryService.autoDeliver(order);
              if (deliveryResult.success) {
                console.log(`订单 ${orderNo} 自动发货成功:`, deliveryResult.data);
              } else {
                console.error(`订单 ${orderNo} 自动发货失败:`, deliveryResult.error);
              }
            } catch (error) {
              console.error(`订单 ${orderNo} 自动发货异常:`, error);
            }
          }, 1000); // 延迟1秒执行，确保支付事务完成
        }
      }
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('更新支付状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新失败',
      error: error.message
    });
  }
});

// 更新订单状态
router.put('/status/:orderNo', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    const { orderStatus, remark } = req.body;

    const order = await Order.findOne({
      where: { orderNo },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    const updateData = {
      orderStatus
    };

    if (remark) {
      updateData.remark = remark;
    }

    await order.update(updateData, { transaction });

    await transaction.commit();

    res.json({
      code: 200,
      message: '更新成功',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('更新订单状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新失败',
      error: error.message
    });
  }
});

// 取消订单
router.put('/cancel/:orderNo', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      where: { orderNo },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 只有未支付的订单才能取消
    if (order.paymentStatus === 1) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '已支付订单不能取消'
      });
    }

    await order.update({
      orderStatus: 3, // 已取消
      remark: reason || '用户取消订单'
    }, { transaction });

    await transaction.commit();

    res.json({
      code: 200,
      message: '订单已取消',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('取消订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '取消失败',
      error: error.message
    });
  }
});

// 发货（管理员功能）
router.put('/deliver/:orderNo', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    const { 
      cdkCodes,
      additionalInfo,
      deliveryContent,
      remark 
    } = req.body;

    const order = await Order.findOne({
      where: { orderNo },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 只有已支付的订单才能发货
    if (order.paymentStatus !== 1) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '订单未支付，不能发货'
      });
    }

    // 检查是否已经发货
    if (order.deliveryStatus === 2) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '订单已发货，无需重复操作'
      });
    }

    // 验证CDK码
    if (!cdkCodes || cdkCodes.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '请提供CDK码'
      });
    }

    // 构建发货内容
    let fullDeliveryContent = deliveryContent;
    if (!fullDeliveryContent) {
      fullDeliveryContent = `CDK码：\n${cdkCodes.join('\n')}`;
      if (additionalInfo) {
        fullDeliveryContent += `\n\n附加信息：\n${additionalInfo}`;
      }
    }

    // 更新订单状态（使用静态方法确保更新）
    const updateResult = await Order.update({
      deliveryStatus: 2, // 已发货
      deliveryMode: 'manual',
      deliveredAt: new Date(),
      orderStatus: 2, // 已完成
      completedAt: new Date(),
      remark: remark || fullDeliveryContent,
      updatedAt: new Date() // 确保更新时间也更新
    }, {
      where: { orderNo: orderNo },
      transaction
    });

    console.log(`📝 更新订单 ${orderNo} 结果: 影响行数 = ${updateResult[0]}`);

    if (updateResult[0] === 0) {
      throw new Error('订单状态更新失败，未找到订单或更新失败');
    }

    // 更新本地对象的值（用于返回给前端）
    order.deliveryStatus = 2;
    order.orderStatus = 2;
    order.deliveredAt = new Date();
    order.completedAt = new Date();

    // 创建发货记录
    if (DeliveryRecord) {
      for (const cdkCode of cdkCodes) {
        await DeliveryRecord.create({
          orderId: order.id,
          productId: order.productId,
          cdkCode: cdkCode,
          deliveryType: 'manual',
          deliveryStatus: 1, // 成功
          deliveryMethod: 'admin',
          deliveryContent: fullDeliveryContent,
          recipientEmail: order.userEmail,
          operatorName: 'Admin',
          deliveredAt: new Date()
        }, { transaction });
      }
    }

    await transaction.commit();
    console.log(`✅ 事务提交成功: ${orderNo}`);

    // 验证更新是否真的成功
    const verifyOrder = await Order.findOne({
      where: { orderNo: orderNo }
    });

    if (!verifyOrder) {
      console.error(`❌ 验证失败：找不到订单 ${orderNo}`);
      throw new Error('订单更新验证失败');
    }

    if (verifyOrder.deliveryStatus !== 2 || verifyOrder.orderStatus !== 2) {
      console.error(`❌ 订单 ${orderNo} 状态验证失败！`);
      console.error(`   发货状态: ${verifyOrder.deliveryStatus} (期望: 2)`);
      console.error(`   订单状态: ${verifyOrder.orderStatus} (期望: 2)`);
      throw new Error('订单状态更新失败，请重试');
    }

    console.log(`✅ 订单 ${orderNo} 状态验证成功`);
    console.log(`   发货状态: ${verifyOrder.deliveryStatus}`);
    console.log(`   订单状态: ${verifyOrder.orderStatus}`);
    console.log(`   用户邮箱: ${verifyOrder.userEmail || '未设置'}`);

    // 使用验证后的订单数据
    const finalOrder = verifyOrder;

    // 发送邮件通知（使用验证后的订单数据）
    if (finalOrder.userEmail) {
      console.log(`📧 准备发送手动发货邮件到: ${finalOrder.userEmail}`);
      
      try {
        // 获取商品信息
        const product = await Product.findByPk(finalOrder.productId);
        
        // 准备邮件数据
        const emailData = {
          userEmail: finalOrder.userEmail,
          orderNo: finalOrder.orderNo,
          productName: product ? (product.title || product.name) : '商品',
          productInfo: additionalInfo || product?.description || '',
          amount: finalOrder.totalAmount || finalOrder.amount,
          cdkKeys: cdkCodes
        };
        
        console.log(`📧 邮件数据:`, {
          收件人: emailData.userEmail,
          订单号: emailData.orderNo,
          商品: emailData.productName,
          CDK数量: emailData.cdkKeys.length
        });
        
        // 发送手动发货完成邮件
        const result = await brevoService.sendManualDeliveryCompleteEmail(emailData);
        
        if (result.success) {
          console.log(`✅ 发货邮件发送成功: ${finalOrder.userEmail}`);
        } else {
          console.error(`❌ 发货邮件发送失败: ${result.message}`);
        }
      } catch (emailError) {
        console.error('发送邮件失败:', emailError);
        // 邮件发送失败不影响发货流程
      }
    } else {
      console.log(`⚠️ 订单 ${finalOrder.orderNo} 没有用户邮箱`);
      
      // 尝试从用户表获取邮箱
      try {
        const User = require('../models/User.js').default;
        const user = await User.findByPk(finalOrder.userId);
        if (user && user.email) {
          console.log(`📧 从用户表获取邮箱: ${user.email}`);
          // 更新订单邮箱
          await Order.update(
            { userEmail: user.email },
            { where: { id: finalOrder.id } }
          );
          // TODO: 发送邮件
        }
      } catch (error) {
        console.error('获取用户邮箱失败:', error);
      }
    }

    res.json({
      code: 200,
      message: '发货成功',
      data: {
        order: {
          orderNo: finalOrder.orderNo,
          deliveryStatus: finalOrder.deliveryStatus,
          orderStatus: finalOrder.orderStatus,
          deliveredAt: finalOrder.deliveredAt,
          userEmail: finalOrder.userEmail,
          productName: finalOrder.productName
        },
        cdkCount: cdkCodes.length,
        updateVerified: true // 标记已验证
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('发货失败:', error);
    res.status(500).json({
      code: 500,
      message: '发货失败',
      error: error.message
    });
  }
});

// 重试自动发货
router.post('/retry-auto-deliver/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    // 获取订单信息
    const order = await Order.findOne({ where: { orderNo } });
    
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }
    
    // 检查订单状态
    if (order.paymentStatus !== 1) {
      return res.status(400).json({
        code: 400,
        message: '订单未支付，不能发货'
      });
    }
    
    if (order.deliveryStatus === 2) {
      return res.status(400).json({
        code: 400,
        message: '订单已发货，无需重试'
      });
    }
    
    // 获取商品信息
    const product = await Product.findByPk(order.productId);
    
    if (!product || product.deliveryMode !== 'auto') {
      return res.status(400).json({
        code: 400,
        message: '该商品不支持自动发货'
      });
    }
    
    // 调用自动发货服务
    const deliveryResult = await deliveryService.autoDeliver(order);
    
    if (deliveryResult.success) {
      res.json({
        code: 200,
        message: '自动发货成功',
        data: deliveryResult.data
      });
    } else {
      res.status(500).json({
        code: 500,
        message: deliveryResult.error || '自动发货失败'
      });
    }
  } catch (error) {
    console.error('重试自动发货失败:', error);
    res.status(500).json({
      code: 500,
      message: '重试自动发货失败',
      error: error.message
    });
  }
});

// 获取订单发货信息
router.get('/delivery-info/:orderNo', authenticate, async (req, res) => {
  try {
    const { orderNo } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { orderNo }
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 验证订单属于当前用户
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权查看此订单'
      });
    }

    // 获取发货记录
    let deliveryRecords = [];
    try {
      const result = await deliveryService.getDeliveryRecords(order.id);
      if (result.success) {
        deliveryRecords = result.data || [];
      }
    } catch (err) {
      console.log('获取发货记录失败:', err);
      // 继续执行，返回空数组
    }

    res.json({
      code: 200,
      success: true,
      message: '获取成功',
      data: {
        order: {
          orderNo: order.orderNo,
          productName: order.productName,
          deliveryStatus: order.deliveryStatus,
          deliveryMode: order.deliveryMode,
          deliveredAt: order.deliveredAt
        },
        deliveryRecords: deliveryRecords
      }
    });
  } catch (error) {
    console.error('获取订单发货信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message
    });
  }
});

// 管理端获取订单回执单信息（无需认证）
router.get('/admin/receipts/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;

    // 获取订单信息
    const order = await Order.findOne({
      where: { orderNo }
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 获取回执单信息
    const receipts = await CDKReceipt.findAll({
      where: { orderId: order.id },
      include: [
        {
          model: CDK,
          as: 'cdk',
          attributes: ['cdkCode', 'cdkType', 'receiptFields']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // 格式化回执单数据
    const formattedReceipts = receipts.map(receipt => ({
      id: receipt.id,
      cdkCode: receipt.cdk?.cdkCode,
      receiptFields: receipt.receiptFields || receipt.cdk?.receiptFields,
      receiptData: receipt.receiptData,
      deliveryStatus: receipt.deliveryStatus,
      deliveredAt: receipt.deliveredAt,
      createdAt: receipt.createdAt,
      notes: receipt.notes  // 添加notes字段以包含修改申请信息
    }));

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        order: {
          orderNo: order.orderNo,
          productName: order.productName,
          quantity: order.quantity,
          orderStatus: order.orderStatus,
          deliveryStatus: order.deliveryStatus,
          paymentStatus: order.paymentStatus
        },
        receipts: formattedReceipts
      }
    });
  } catch (error) {
    console.error('获取回执单信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取回执单信息失败',
      error: error.message
    });
  }
});

// 获取订单回执单信息
router.get('/receipts/:orderNo', authenticate, async (req, res) => {
  try {
    const { orderNo } = req.params;
    const userId = req.user.id;

    // 获取订单信息
    const order = await Order.findOne({
      where: { orderNo }
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 验证订单属于当前用户
    if (order.userId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权查看此订单'
      });
    }

    // 获取回执单信息
    const receipts = await CDKReceipt.findAll({
      where: { orderId: order.id },
      include: [
        {
          model: CDK,
          as: 'cdk',
          attributes: ['cdkCode', 'cdkType', 'receiptFields']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 格式化回执单数据
    const formattedReceipts = receipts.map(receipt => ({
      id: receipt.id,
      cdkCode: receipt.cdk?.cdkCode,
      receiptFields: receipt.receiptFields || receipt.cdk?.receiptFields,
      receiptData: receipt.receiptData,
      deliveryStatus: receipt.deliveryStatus,
      deliveredAt: receipt.deliveredAt,
      createdAt: receipt.createdAt,
      notes: receipt.notes  // 添加notes字段以包含修改申请信息
    }));

    res.json({
      code: 200,
      success: true,
      message: '获取成功',
      data: {
        order: {
          orderNo: order.orderNo,
          productName: order.productName,
          deliveryStatus: order.deliveryStatus,
          paymentStatus: order.paymentStatus
        },
        receipts: formattedReceipts
      }
    });
  } catch (error) {
    console.error('获取订单回执单失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message
    });
  }
});

// 用户提交回执单信息
router.post('/receipts/:orderNo/submit', authenticate, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    const { receiptData } = req.body;
    const userId = req.user.id;

    // 获取订单信息
    const order = await Order.findOne({
      where: { orderNo }
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 验证订单属于当前用户
    if (order.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        code: 403,
        message: '无权操作此订单'
      });
    }

    // 查找该订单的回执单 - 优先查找未填写的回执单
    const receipt = await CDKReceipt.findOne({
      where: { 
        orderId: order.id,
        [Op.or]: [
          { receiptData: null },
          { receiptData: {} }
        ]
      },
      transaction
    });

    if (!receipt) {
      // 如果没有未填写的回执单，检查是否有已填写的
      const filledReceipt = await CDKReceipt.findOne({
        where: { orderId: order.id },
        transaction
      });
      
      if (filledReceipt) {
        await transaction.rollback();
        return res.status(400).json({
          code: 400,
          message: '回执单已填写，无需重复提交'
        });
      }
      
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '未找到回执单'
      });
    }

    // 更新回执单数据
    receipt.receiptData = receiptData;
    receipt.updatedAt = new Date();
    await receipt.save({ transaction });

    await transaction.commit();

    res.json({
      code: 200,
      success: true,
      message: '回执单提交成功',
      data: {
        receiptId: receipt.id,
        receiptData: receipt.receiptData
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('提交回执单失败:', error);
    res.status(500).json({
      code: 500,
      message: '提交失败',
      error: error.message
    });
  }
});

// 用户申请修改回执单
router.post('/receipts/:orderNo/modify', authenticate, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderNo } = req.params;
    const { receiptData, reason } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!reason) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '请说明修改原因'
      });
    }

    // 获取订单信息
    const order = await Order.findOne({
      where: { orderNo }
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 验证订单属于当前用户
    if (order.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        code: 403,
        message: '无权操作此订单'
      });
    }

    // 查找该订单已填写的回执单
    const receipt = await CDKReceipt.findOne({
      where: { 
        orderId: order.id,
        receiptData: { [Op.ne]: null }
      },
      transaction
    });

    if (!receipt) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '未找到已填写的回执单，请先填写回执单'
      });
    }

    // 保存修改申请记录（可以在notes字段记录）
    const modificationRequest = {
      reason: reason,
      newData: receiptData,
      requestedAt: new Date(),
      status: 'pending'
    };

    // 更新回执单备注字段，记录修改申请
    const existingNotes = receipt.notes ? JSON.parse(receipt.notes) : {};
    existingNotes.modificationRequest = modificationRequest;
    
    receipt.notes = JSON.stringify(existingNotes);
    receipt.updatedAt = new Date();
    await receipt.save({ transaction });

    await transaction.commit();

    res.json({
      code: 200,
      success: true,
      message: '修改申请已提交，请等待客服审核',
      data: {
        receiptId: receipt.id,
        modificationRequest: modificationRequest
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('提交修改申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '提交失败',
      error: error.message
    });
  }
});

// 删除订单（管理员功能）
router.delete('/admin/delete/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // 查找订单
    const order = await Order.findByPk(id, { transaction });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }
    
    // 检查订单状态，已支付且已发货的订单不允许删除
    if (order.paymentStatus === 1 && order.deliveryStatus === 2) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '已支付且已发货的订单不允许删除'
      });
    }
    
    // 删除相关的发货记录
    if (DeliveryRecord) {
      await DeliveryRecord.destroy({
        where: { orderId: id },
        transaction
      });
    }
    
    // 删除相关的CDK回执单
    if (CDKReceipt) {
      await CDKReceipt.destroy({
        where: { orderId: id },
        transaction
      });
    }
    
    // 删除订单
    await order.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({
      code: 0,
      message: '订单删除成功',
      success: true
    });
  } catch (error) {
    await transaction.rollback();
    console.error('删除订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除订单失败',
      error: error.message
    });
  }
});

// 订单统计 - 新接口（前端使用）
router.get('/admin/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // 获取按状态分组的统计数据
    const statusStats = await sequelize.query(`
      SELECT 
        payment_status as status,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM \`order\`
      ${startDate && endDate ? 
        `WHERE created_at BETWEEN '${startDate}' AND '${endDate}'` : ''}
      GROUP BY payment_status
    `, { type: sequelize.QueryTypes.SELECT });

    // 获取今日数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await sequelize.query(`
      SELECT 
        COUNT(*) as order_count,
        COUNT(CASE WHEN payment_status = 1 THEN 1 END) as paid_count,
        SUM(CASE WHEN payment_status = 1 THEN total_amount ELSE 0 END) as paid_amount
      FROM \`order\`
      WHERE created_at >= '${today.toISOString()}' 
        AND created_at < '${tomorrow.toISOString()}'
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({
      code: 0,
      message: '统计成功',
      data: {
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: stat.count.toString(),
          total_amount: stat.total_amount || 0
        })),
        today: todayStats[0] || {
          order_count: 0,
          paid_count: 0,
          paid_amount: 0
        }
      }
    });
  } catch (error) {
    console.error('订单统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '统计失败',
      error: error.message
    });
  }
});

// 订单统计 - 旧接口（保留兼容）
router.get('/admin/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // 统计各状态订单数量
    const [
      totalOrders,
      pendingPayment,
      paidOrders,
      completedOrders,
      cancelledOrders
    ] = await Promise.all([
      Order.count({ where }),
      Order.count({ where: { ...where, paymentStatus: 0 } }),
      Order.count({ where: { ...where, paymentStatus: 1 } }),
      Order.count({ where: { ...where, orderStatus: 2 } }),
      Order.count({ where: { ...where, orderStatus: 3 } })
    ]);

    // 统计总销售额
    const totalRevenue = await Order.sum('totalAmount', {
      where: {
        ...where,
        paymentStatus: 1 // 只统计已支付的
      }
    }) || 0;

    res.json({
      code: 200,
      message: '统计成功',
      data: {
        totalOrders,
        pendingPayment,
        paidOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('订单统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '统计失败',
      error: error.message
    });
  }
});

// 管理员通过修改申请
router.post('/admin/receipts/:receiptId/approve', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { receiptId } = req.params;
    const { newData } = req.body;
    
    // 获取回执单信息
    const receipt = await CDKReceipt.findByPk(receiptId, { transaction });
    
    if (!receipt) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '回执单不存在'
      });
    }
    
    // 解析notes字段获取修改申请信息
    let notes = {};
    if (receipt.notes) {
      try {
        notes = JSON.parse(receipt.notes);
      } catch (e) {
        notes = {};
      }
    }
    
    if (!notes.modificationRequest || notes.modificationRequest.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '没有待审核的修改申请'
      });
    }
    
    // 更新回执单数据
    receipt.receiptData = newData || notes.modificationRequest.newData;
    
    // 更新修改申请状态
    notes.modificationRequest.status = 'approved';
    notes.modificationRequest.approvedAt = new Date();
    receipt.notes = JSON.stringify(notes);
    
    await receipt.save({ transaction });
    
    // 获取订单信息
    const order = await Order.findByPk(receipt.orderId, { transaction });
    
    // 创建通知
    const { Notification } = await import('../models/index.js');
    await Notification.createReceiptModificationNotification(
      order.userId,
      order.orderNo,
      'approved'
    );
    
    await transaction.commit();
    
    res.json({
      code: 200,
      success: true,
      message: '修改申请已通过',
      data: {
        receiptId: receipt.id,
        receiptData: receipt.receiptData
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('通过修改申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '操作失败',
      error: error.message
    });
  }
});

// 管理员拒绝修改申请
router.post('/admin/receipts/:receiptId/reject', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { receiptId } = req.params;
    const { reason } = req.body;
    
    // 获取回执单信息
    const receipt = await CDKReceipt.findByPk(receiptId, { transaction });
    
    if (!receipt) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        message: '回执单不存在'
      });
    }
    
    // 解析notes字段获取修改申请信息
    let notes = {};
    if (receipt.notes) {
      try {
        notes = JSON.parse(receipt.notes);
      } catch (e) {
        notes = {};
      }
    }
    
    if (!notes.modificationRequest || notes.modificationRequest.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        message: '没有待审核的修改申请'
      });
    }
    
    // 更新修改申请状态
    notes.modificationRequest.status = 'rejected';
    notes.modificationRequest.rejectedAt = new Date();
    notes.modificationRequest.rejectReason = reason;
    receipt.notes = JSON.stringify(notes);
    
    await receipt.save({ transaction });
    
    // 获取订单信息
    const order = await Order.findByPk(receipt.orderId, { transaction });
    
    // 创建通知
    const { Notification } = await import('../models/index.js');
    await Notification.createReceiptModificationNotification(
      order.userId,
      order.orderNo,
      'rejected',
      reason
    );
    
    await transaction.commit();
    
    res.json({
      code: 200,
      success: true,
      message: '修改申请已拒绝',
      data: {
        receiptId: receipt.id
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('拒绝修改申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '操作失败',
      error: error.message
    });
  }
});

export default router;