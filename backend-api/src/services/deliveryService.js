import { Op } from 'sequelize';
import CDK from '../models/CDK.js';
import CDKUsageRecord from '../models/CDKUsageRecord.js';
import CDKReceipt from '../models/CDKReceipt.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import DeliveryRecord from '../models/DeliveryRecord.js';
import { sequelize } from '../models/index.js';
import brevoService from './brevoService.js';
import cdkService from './cdkService.js';

class DeliveryService {
  /**
   * 自动发货
   * @param {Object} order - 订单信息
   * @returns {Object} 发货结果
   */
  async autoDeliver(order) {
    const transaction = await sequelize.transaction();
    
    try {
      // 获取商品信息
      const product = await Product.findByPk(order.productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 检查是否支持自动发货
      if (product.deliveryMode !== 'auto') {
        throw new Error('该商品不支持自动发货');
      }

      // 确定发货数量（不超过自动发货限制）
      const deliveryQuantity = Math.min(
        order.quantity, 
        product.autoDeliveryLimit || 1
      );

      // 获取可用的CDK，根据CDK分类处理
      // 排除手动发货的代充CDK
      const availableCDKs = await CDK.findAll({
        where: {
          productId: order.productId,
          cdkCategory: { [Op.ne]: 'manual_recharge' }, // 排除代充CDK
          [Op.or]: [
            { 
              cdkCategory: 'one_time',
              status: 0 
            }, // 一次性CDK
            { 
              cdkCategory: 'reusable_stock',
              status: { [Op.in]: [0] } // 可重复使用CDK，未售状态
            },
            // 兼容旧数据
            { 
              cdkCategory: null,
              status: 0,
              isReusable: false 
            },
            { 
              cdkCategory: null,
              isReusable: true,
              currentUsageCount: { [Op.lt]: sequelize.col('max_usage_count') }
            }
          ]
        },
        order: [
          ['cdkCategory', 'ASC'], // 优先处理有分类的CDK
          ['isReusable', 'ASC'], // 优先一次性CDK
          ['currentUsageCount', 'ASC'] // 然后是使用次数最少的
        ],
        limit: deliveryQuantity,
        transaction
      });

      if (availableCDKs.length === 0) {
        throw new Error('CDK库存不足，无法自动发货');
      }

      const deliveredCDKs = [];
      const deliveryRecords = [];

      // 处理每个CDK
      for (const cdk of availableCDKs) {
        // 根据CDK分类处理
        if (cdk.cdkCategory === 'reusable_stock') {
          // 可重复使用有库存的CDK
          const releaseDate = new Date();
          releaseDate.setDate(releaseDate.getDate() + (cdk.releaseDays || 30));
          
          cdk.status = 1; // 已售
          cdk.orderId = order.id;
          cdk.userId = order.userId;
          cdk.soldDate = new Date();
          cdk.lastUsedDate = new Date();
          cdk.currentUsageCount = 1;
          cdk.usageExpireDate = releaseDate;
          
          await cdk.save({ transaction });
          
          // 记录使用历史
          await CDKUsageRecord.create({
            cdkId: cdk.id,
            cdkCode: cdk.cdkCode,
            userId: order.userId,
            orderId: order.id,
            usageType: 'activate',
            usageStatus: 1,
            usedAt: new Date(),
            expireAt: releaseDate
          }, { transaction });
        } else if (cdk.cdkCategory === 'one_time' || !cdk.cdkCategory) {
          // 一次性CDK或兼容旧数据
          if (cdk.isReusable && !cdk.cdkCategory) {
            // 兼容旧的可重复使用CDK
            cdk.currentUsageCount += 1;
            cdk.lastUsedDate = new Date();
            
            // 如果达到最大使用次数，标记为已使用
            if (cdk.currentUsageCount >= cdk.maxUsageCount) {
              cdk.status = 2;
              cdk.usedDate = new Date();
            }
            
            await cdk.save({ transaction });
            
            // 记录使用历史
            await CDKUsageRecord.create({
              cdkId: cdk.id,
              cdkCode: cdk.cdkCode,
              userId: order.userId,
              orderId: order.id,
              usageType: 'activate',
              usageStatus: 1,
              usedAt: new Date(),
              expireAt: cdk.usageExpireDate ? new Date(Date.now() + cdk.usageExpireDate * 24 * 60 * 60 * 1000) : null
            }, { transaction });
          } else {
            // 一次性CDK
            await cdk.update({
              status: 1, // 已售
              orderId: order.id,
              userId: order.userId,
              soldDate: new Date()
            }, { transaction });
          }
        }

        deliveredCDKs.push({
          id: cdk.id,
          code: cdk.cdkCode,
          type: cdk.cdkType,
          expireDate: cdk.expireDate,
          isReusable: cdk.isReusable,
          maxUsageCount: cdk.maxUsageCount,
          currentUsageCount: cdk.currentUsageCount
        });

        // 创建发货记录
        deliveryRecords.push({
          orderId: order.id,
          productId: order.productId,
          cdkId: cdk.id,
          cdkCode: cdk.cdkCode,
          deliveryType: 'auto',
          deliveryStatus: 1,
          deliveryMethod: 'system',
          deliveryContent: JSON.stringify({
            cdkCode: cdk.cdkCode,
            cdkType: cdk.cdkType,
            expireDate: cdk.expireDate,
            accountInfo: cdk.accountInfo
          }),
          recipientEmail: order.userEmail,
          deliveredAt: new Date()
        });
      }

      // 批量创建发货记录
      await DeliveryRecord.bulkCreate(deliveryRecords, { transaction });

      // 更新订单发货状态
      const deliveryStatus = deliveredCDKs.length >= order.quantity ? 2 : 1; // 全部发货或部分发货
      const updateData = {
        deliveryStatus,
        deliveredAt: new Date()
      };
      
      // 如果全部发货，自动将订单标记为已完成
      if (deliveryStatus === 2) {
        updateData.orderStatus = 2; // 已完成
        updateData.completedAt = new Date();
      }
      
      await Order.update(updateData, {
        where: { id: order.id },
        transaction
      });

      await transaction.commit();

      // 如果需要发送邮件通知
      if (order.userEmail) {
        this.sendDeliveryEmail(order.userEmail, deliveredCDKs, product, order);
      }

      return {
        success: true,
        data: {
          orderId: order.id,
          deliveredCount: deliveredCDKs.length,
          totalCount: order.quantity,
          deliveryStatus: deliveryStatus === 2 ? 'complete' : 'partial',
          cdks: deliveredCDKs
        }
      };
    } catch (error) {
      await transaction.rollback();
      console.error('自动发货失败:', error);
      
      // 记录失败的发货记录
      await DeliveryRecord.create({
        orderId: order.id,
        productId: order.productId,
        deliveryType: 'auto',
        deliveryStatus: 0,
        failureReason: error.message,
        deliveredAt: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 手动发货
   * @param {Number} orderId - 订单ID
   * @param {Array} cdkIds - CDK ID列表
   * @param {Object} operator - 操作员信息
   * @returns {Object} 发货结果
   */
  async manualDeliver(orderId, cdkIds, operator) {
    const transaction = await sequelize.transaction();
    
    try {
      // 获取订单信息
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 检查订单状态
      if (order.paymentStatus !== 1) {
        throw new Error('订单未支付，无法发货');
      }

      // 获取指定的CDK
      const cdks = await CDK.findAll({
        where: {
          id: cdkIds,
          status: 0 // 未售状态
        },
        transaction
      });

      if (cdks.length !== cdkIds.length) {
        throw new Error('部分CDK不可用');
      }

      const deliveredCDKs = [];
      const deliveryRecords = [];

      // 处理每个CDK
      for (const cdk of cdks) {
        // 更新CDK状态
        await cdk.update({
          status: 1, // 已售
          orderId: orderId,
          userId: order.userId,
          soldDate: new Date()
        }, { transaction });

        deliveredCDKs.push({
          id: cdk.id,
          code: cdk.cdkCode,
          type: cdk.cdkType,
          expireDate: cdk.expireDate
        });

        // 创建发货记录
        deliveryRecords.push({
          orderId: orderId,
          productId: cdk.productId,
          cdkId: cdk.id,
          cdkCode: cdk.cdkCode,
          deliveryType: 'manual',
          deliveryStatus: 1,
          deliveryMethod: 'system',
          deliveryContent: JSON.stringify({
            cdkCode: cdk.cdkCode,
            cdkType: cdk.cdkType,
            expireDate: cdk.expireDate
          }),
          recipientEmail: order.userEmail,
          operatorId: operator.id,
          operatorName: operator.name,
          deliveredAt: new Date()
        });
      }

      // 批量创建发货记录
      await DeliveryRecord.bulkCreate(deliveryRecords, { transaction });

      // 检查是否已全部发货
      const totalDelivered = await DeliveryRecord.count({
        where: {
          orderId: orderId,
          deliveryStatus: 1
        },
        transaction
      });

      // 更新订单发货状态
      const deliveryStatus = totalDelivered >= order.quantity ? 2 : 1; // 全部发货或部分发货
      const updateData = {
        deliveryStatus,
        deliveredAt: deliveryStatus === 2 ? new Date() : order.deliveredAt
      };
      
      // 如果全部发货，自动将订单标记为已完成
      if (deliveryStatus === 2) {
        updateData.orderStatus = 2; // 已完成
        updateData.completedAt = new Date();
      }
      
      await Order.update(updateData, {
        where: { id: orderId },
        transaction
      });

      await transaction.commit();

      // 发送邮件通知（手动发货完成）
      if (order.userEmail) {
        const product = await Product.findByPk(order.productId);
        
        // 发送手动发货完成邮件
        const emailData = {
          userEmail: order.userEmail,
          orderNo: order.orderNo,
          productName: product.name,
          productInfo: product.description || '',
          amount: order.totalAmount || product.price,
          cdkKeys: deliveredCDKs.map(cdk => cdk.code || cdk.cdkCode)
        };
        
        const result = await brevoService.sendManualDeliveryCompleteEmail(emailData);
        
        if (result.success) {
          console.log(`✅ 手动发货完成邮件发送成功: ${order.userEmail}`);
        } else {
          console.error(`❌ 手动发货完成邮件发送失败: ${result.message}`);
        }
      }

      return {
        success: true,
        data: {
          orderId: orderId,
          deliveredCount: deliveredCDKs.length,
          totalDelivered: totalDelivered,
          totalCount: order.quantity,
          deliveryStatus: deliveryStatus === 2 ? 'complete' : 'partial',
          cdks: deliveredCDKs
        }
      };
    } catch (error) {
      await transaction.rollback();
      console.error('手动发货失败:', error);
      
      // 记录失败的发货记录
      await DeliveryRecord.create({
        orderId: orderId,
        productId: order.productId,
        deliveryType: 'manual',
        deliveryStatus: 0,
        failureReason: error.message,
        operatorId: operator.id,
        operatorName: operator.name,
        deliveredAt: new Date()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取订单发货记录
   * @param {Number} orderId - 订单ID
   * @returns {Object} 发货记录列表
   */
  async getDeliveryRecords(orderId) {
    try {
      const records = await DeliveryRecord.findAll({
        where: { orderId },
        order: [['delivered_at', 'DESC']]
      });

      return {
        success: true,
        data: records
      };
    } catch (error) {
      console.error('获取发货记录失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取待发货订单列表
   * @param {Object} query - 查询参数
   * @returns {Object} 订单列表
   */
  async getPendingDeliveryOrders(query = {}) {
    try {
      const {
        page = 1,
        pageSize = 20,
        deliveryMode
      } = query;

      const where = {
        paymentStatus: 1, // 已支付
        deliveryStatus: [0, 1] // 待发货或部分发货
      };

      if (deliveryMode) {
        where.deliveryMode = deliveryMode;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'deliveryMode', 'cdkType']
        }],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['paid_at', 'DESC']]
      });

      return {
        success: true,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    } catch (error) {
      console.error('获取待发货订单失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 发送发货邮件通知
   * @param {String} email - 收件邮箱
   * @param {Array} cdks - CDK列表
   * @param {Object} product - 商品信息
   * @param {Object} order - 订单信息（可选）
   */
  async sendDeliveryEmail(email, cdks, product, order = null) {
    try {
      // 准备邮件数据
      const emailData = {
        userEmail: email,
        orderNo: order?.orderNo || 'N/A',
        productName: product.name,
        productInfo: product.description || '',
        amount: order?.totalAmount || product.price,
        cdkKeys: cdks.map(cdk => cdk.code || cdk.cdkCode)
      };

      // 发送商品信息邮件（包含CDK）
      const result = await brevoService.sendProductInfoEmail(emailData);
      
      if (result.success) {
        console.log(`✅ 自动发货邮件发送成功: ${email}`);
      } else {
        console.error(`❌ 自动发货邮件发送失败: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('发送发货邮件异常:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 重新发货
   * @param {Number} orderId - 订单ID
   * @param {Object} operator - 操作员信息
   * @returns {Object} 发货结果
   */
  async retryDelivery(orderId, operator) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      const product = await Product.findByPk(order.productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 根据商品发货模式决定重新发货方式
      if (product.deliveryMode === 'auto') {
        return await this.autoDeliver(order);
      } else {
        // 手动发货需要指定CDK
        throw new Error('手动发货订单请使用手动发货功能');
      }
    } catch (error) {
      console.error('重新发货失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 处理代充CDK订单（手动发货）
   */
  async processManualRechargeCDK(order) {
    const transaction = await sequelize.transaction();
    
    try {
      // 获取商品信息
      const product = await Product.findByPk(order.productId, { transaction });
      if (!product) {
        throw new Error('商品不存在');
      }

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

      const receipts = [];
      
      // 为代充订单创建回执单（不依赖CDK）
      for (let i = 0; i < order.quantity; i++) {
        // 创建待发货回执记录
        const receipt = await CDKReceipt.create({
          cdkId: null, // 代充订单可能没有关联的CDK
          orderId: order.id,
          userId: order.userId,
          receiptFields: product.receiptFields || defaultReceiptFields,
          deliveryStatus: 0 // 待发货
        }, { transaction });

        receipts.push(receipt);
      }

      // 更新订单状态为待发货
      await Order.update({
        deliveryStatus: 0, // 待发货
        orderStatus: 1 // 处理中
      }, {
        where: { id: order.id },
        transaction
      });

      await transaction.commit();

      console.log(`✅ 为订单 ${order.orderNo} 创建了 ${receipts.length} 个回执单`);

      return {
        success: true,
        message: '代充订单已创建，等待手动发货',
        receipts
      };
    } catch (error) {
      await transaction.rollback();
      console.error('处理代充订单失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 完成代充CDK发货
   */
  async completeManualRechargeDelivery(receiptId, receiptData, operator) {
    const transaction = await sequelize.transaction();
    
    try {
      const receipt = await CDKReceipt.findByPk(receiptId, {
        include: [
          { model: CDK, as: 'cdk' },
          { model: Order, as: 'order' }
        ],
        transaction
      });

      if (!receipt) {
        throw new Error('回执记录不存在');
      }

      if (receipt.deliveryStatus === 1) {
        throw new Error('该订单已发货');
      }

      // 更新回执记录
      receipt.receiptData = receiptData;
      receipt.deliveryStatus = 1; // 已发货
      receipt.deliveredBy = operator.id;
      receipt.deliveredAt = new Date();
      await receipt.save({ transaction });

      // 更新CDK状态
      const cdk = receipt.cdk;
      cdk.receiptData = receiptData;
      cdk.status = 2; // 已使用
      cdk.usedDate = new Date();
      await cdk.save({ transaction });

      // 创建发货记录
      await DeliveryRecord.create({
        orderId: receipt.orderId,
        productId: cdk.productId,
        cdkId: cdk.id,
        cdkCode: cdk.cdkCode,
        deliveryType: 'manual',
        deliveryStatus: 1,
        deliveryMethod: 'manual',
        deliveryContent: JSON.stringify(receiptData),
        recipientEmail: receipt.order.userEmail,
        operatorId: operator.id,
        operatorName: operator.name,
        deliveredAt: new Date()
      }, { transaction });

      // 检查订单是否全部发货
      const pendingReceipts = await CDKReceipt.count({
        where: {
          orderId: receipt.orderId,
          deliveryStatus: 0
        },
        transaction
      });

      if (pendingReceipts === 0) {
        // 全部发货完成，更新订单状态
        await Order.update({
          deliveryStatus: 2, // 已发货
          orderStatus: 2, // 已完成
          deliveredAt: new Date(),
          completedAt: new Date()
        }, {
          where: { id: receipt.orderId },
          transaction
        });
      }

      await transaction.commit();

      // 发送邮件通知
      if (receipt.order.userEmail) {
        const product = await Product.findByPk(cdk.productId);
        
        // 准备邮件数据
        const emailData = {
          userEmail: receipt.order.userEmail,
          orderNo: receipt.order.orderNo,
          productName: product.title || product.name,
          productInfo: product.description || '',
          amount: receipt.order.totalAmount || product.price,
          cdkKeys: [cdk.cdkCode]
        };
        
        // 如果有回执数据，添加到邮件内容
        if (receiptData) {
          const additionalInfo = Object.entries(receiptData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          emailData.productInfo = emailData.productInfo + '\n\n回执信息：\n' + additionalInfo;
        }
        
        const result = await brevoService.sendManualDeliveryCompleteEmail(emailData);
        
        if (result.success) {
          console.log(`✅ 代充CDK发货邮件发送成功: ${receipt.order.userEmail}`);
        } else {
          console.error(`❌ 代充CDK发货邮件发送失败: ${result.message}`);
        }
      }

      return {
        success: true,
        message: '发货成功',
        data: receipt
      };
    } catch (error) {
      await transaction.rollback();
      console.error('完成代充发货失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取待发货的代充订单
   */
  async getPendingManualRechargeOrders(options = {}) {
    try {
      const { page = 1, pageSize = 20 } = options;
      
      const { count, rows } = await CDKReceipt.findAndCountAll({
        where: {
          deliveryStatus: 0 // 待发货
        },
        include: [
          {
            model: CDK,
            as: 'cdk',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'title', 'cdkType']
              }
            ]
          },
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'orderNo', 'userEmail', 'totalAmount']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          }
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'ASC']]
      });

      return {
        success: true,
        data: {
          list: rows,
          total: count,
          page,
          pageSize
        }
      };
    } catch (error) {
      console.error('获取待发货代充订单失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new DeliveryService();