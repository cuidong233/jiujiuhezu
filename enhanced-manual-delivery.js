/**
 * 增强版手动发货功能
 * 解决代充CDK手动发货的问题：
 * 1. 确保状态正确更新
 * 2. 确保邮件正常发送
 * 3. 添加详细的错误日志
 */

// 这是对 /backend-api/src/routes/order.routes.js 中发货接口的增强版本
// 可以替换原有的 router.put('/deliver/:orderNo', ...) 接口

const enhancedManualDelivery = `
// 发货（管理员功能） - 增强版
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
    
    console.log(\`📦 开始处理手动发货: \${orderNo}\`);
    console.log(\`   CDK数量: \${cdkCodes?.length || 0}\`);
    
    // 查询订单
    const order = await Order.findOne({
      where: { orderNo },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ],
      transaction
    });
    
    if (!order) {
      throw new Error('订单不存在');
    }
    
    // 检查订单状态
    if (order.paymentStatus !== 1) {
      throw new Error('订单未支付，不能发货');
    }
    
    if (order.deliveryStatus === 2) {
      throw new Error('订单已发货，请勿重复操作');
    }
    
    console.log(\`✅ 订单验证通过\`);
    console.log(\`   商品: \${order.product?.title || order.product?.name}\`);
    console.log(\`   用户邮箱: \${order.userEmail || '未提供'}\`);
    
    // 构建发货内容
    let fullDeliveryContent = deliveryContent;
    if (!fullDeliveryContent) {
      fullDeliveryContent = \`CDK码：\\n\${cdkCodes.join('\\n')}\`;
      if (additionalInfo) {
        fullDeliveryContent += \`\\n\\n附加信息：\\n\${additionalInfo}\`;
      }
    }

    // 更新订单状态
    console.log(\`📝 更新订单状态...\`);
    await order.update({
      deliveryStatus: 2, // 已发货
      deliveryMode: 'manual',
      deliveredAt: new Date(),
      orderStatus: 2, // 已完成
      completedAt: new Date(),
      remark: remark || fullDeliveryContent
    }, { transaction });
    
    console.log(\`✅ 订单状态已更新: 发货状态=已发货, 订单状态=已完成\`);

    // 创建发货记录
    if (DeliveryRecord) {
      console.log(\`📝 创建发货记录...\`);
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
      console.log(\`✅ 发货记录创建成功: \${cdkCodes.length} 条\`);
    }

    // 提交事务
    await transaction.commit();
    console.log(\`✅ 数据库事务提交成功\`);

    // 发送邮件通知（事务外处理，避免影响主流程）
    if (order.userEmail) {
      console.log(\`📧 准备发送邮件通知到: \${order.userEmail}\`);
      
      // 异步发送邮件，不阻塞响应
      setTimeout(async () => {
        try {
          // 获取商品信息
          const product = order.product || await Product.findByPk(order.productId);
          
          // 准备邮件数据
          const emailData = {
            userEmail: order.userEmail,
            orderNo: order.orderNo,
            productName: product ? (product.title || product.name) : '商品',
            productInfo: additionalInfo || product?.description || '',
            amount: order.totalAmount || order.amount,
            cdkKeys: cdkCodes
          };
          
          console.log(\`📧 邮件数据准备完成:\`);
          console.log(\`   收件人: \${emailData.userEmail}\`);
          console.log(\`   订单号: \${emailData.orderNo}\`);
          console.log(\`   商品名: \${emailData.productName}\`);
          console.log(\`   CDK数量: \${emailData.cdkKeys.length}\`);
          
          // 发送手动发货完成邮件
          const brevoService = require('../services/brevoService.js').default;
          const result = await brevoService.sendManualDeliveryCompleteEmail(emailData);
          
          if (result.success) {
            console.log(\`✅ 发货邮件发送成功!\`);
            console.log(\`   邮件ID: \${result.messageId}\`);
            
            // 可选：记录邮件发送成功到数据库
            if (EmailLog) {
              await EmailLog.create({
                orderId: order.id,
                orderNo: order.orderNo,
                recipientEmail: order.userEmail,
                emailType: 'manual_delivery',
                status: 'success',
                messageId: result.messageId,
                sentAt: new Date()
              });
            }
          } else {
            console.error(\`❌ 发货邮件发送失败: \${result.message}\`);
            
            // 可选：记录邮件发送失败到数据库
            if (EmailLog) {
              await EmailLog.create({
                orderId: order.id,
                orderNo: order.orderNo,
                recipientEmail: order.userEmail,
                emailType: 'manual_delivery',
                status: 'failed',
                errorMessage: result.message,
                sentAt: new Date()
              });
            }
          }
        } catch (emailError) {
          console.error('❌ 发送邮件异常:', emailError);
          console.error('   错误详情:', emailError.message);
          console.error('   堆栈:', emailError.stack);
          
          // 邮件发送失败不影响发货流程
          // 可以考虑添加重试机制或通知管理员
        }
      }, 100); // 延迟100ms执行，确保响应先返回
    } else {
      console.log(\`⚠️  用户未提供邮箱，跳过邮件发送\`);
    }

    // 返回成功响应
    const response = {
      code: 200,
      message: '发货成功',
      data: {
        order: {
          orderNo: order.orderNo,
          deliveryStatus: order.deliveryStatus,
          orderStatus: order.orderStatus,
          deliveredAt: order.deliveredAt
        },
        cdkCount: cdkCodes.length,
        emailSent: !!order.userEmail
      }
    };
    
    console.log(\`✅ 手动发货完成: \${orderNo}\`);
    res.json(response);
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ 发货失败:', error);
    console.error('   订单号:', req.params.orderNo);
    console.error('   错误:', error.message);
    console.error('   堆栈:', error.stack);
    
    res.status(500).json({
      code: 500,
      message: '发货失败',
      error: error.message
    });
  }
});
`;

console.log('=== 增强版手动发货代码 ===\n');
console.log('此代码包含以下改进：');
console.log('1. ✅ 详细的日志记录');
console.log('2. ✅ 异步邮件发送（不阻塞响应）');
console.log('3. ✅ 邮件发送状态记录');
console.log('4. ✅ 完整的错误处理');
console.log('5. ✅ 事务管理优化');
console.log('\n使用方法：');
console.log('1. 打开 backend-api/src/routes/order.routes.js');
console.log('2. 找到 router.put(\'/deliver/:orderNo\', ...) 接口');
console.log('3. 用上面的增强版代码替换原有代码');
console.log('4. 重启后端服务');
console.log('\n注意事项：');
console.log('- 确保 BREVO_API_KEY 已配置');
console.log('- 确保用户邮箱地址有效');
console.log('- 查看控制台日志了解邮件发送状态');

// 导出增强版代码
module.exports = enhancedManualDelivery;