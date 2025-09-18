import CDK from '../models/CDK.js';
import CDKUsageRecord from '../models/CDKUsageRecord.js';
import CDKReceipt from '../models/CDKReceipt.js';
import Product from '../models/Product.js';
import ProductSpecification from '../models/ProductSpecification.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import crypto from 'crypto';

class CDKService {
  /**
   * 生成CDK码
   */
  generateCDKCode(prefix = 'CDK', length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix + '-';
    
    for (let i = 0; i < length; i++) {
      if (i > 0 && i % 4 === 0) {
        code += '-';
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * 批量生成CDK
   */
  async batchGenerateCDK(productId, count, options = {}) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      const cdks = [];
      const prefix = options.prefix || product.cdkType?.toUpperCase() || 'CDK';
      
      for (let i = 0; i < count; i++) {
        let cdkCode;
        let isUnique = false;
        
        // 确保生成的CDK码唯一
        while (!isUnique) {
          cdkCode = this.generateCDKCode(prefix);
          const existing = await CDK.findOne({ where: { cdkCode } });
          if (!existing) {
            isUnique = true;
          }
        }
        
        cdks.push({
          productId,
          cdkCode,
          cdkType: options.cdkType || 'normal',
          cdkCategory: options.cdkCategory || 'one_time',
          status: 0,
          expireDate: options.expireDate || null,
          isReusable: options.isReusable || false,
          maxUsageCount: options.maxUsageCount || 1,
          usageExpireDate: options.usageExpireDate || null,
          releaseDays: options.releaseDays || 30,
          productSpecId: options.productSpecId || null,
          isUnlimitedStock: options.isUnlimitedStock || false,
          receiptFields: options.receiptFields || null,
          extraData: options.extraData || null
        });
      }
      
      const createdCDKs = await CDK.bulkCreate(cdks);
      return {
        success: true,
        count: createdCDKs.length,
        data: createdCDKs
      };
    } catch (error) {
      console.error('批量生成CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 批量导入CDK
   */
  async batchImportCDK(productId, cdkList, options = {}) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      const cdks = [];
      const duplicates = [];
      
      for (const cdkCode of cdkList) {
        const existing = await CDK.findOne({ where: { cdkCode } });
        if (existing) {
          duplicates.push(cdkCode);
        } else {
          const cdkData = {
            productId,
            cdkCode,
            cdkType: options.cdkType || (product.productType === 'CDK' ? 'normal' : 'coupon'),
            cdkCategory: options.cdkCategory || 'one_time',
            status: 0
          };

          // 根据CDK分类设置相关参数
          if (options.cdkCategory === 'reusable_stock') {
            cdkData.isReusable = true;
            cdkData.releaseDays = options.releaseDays || 30;
            cdkData.maxUsageCount = options.maxUsageCount || 999999;
          } else if (options.cdkCategory === 'manual_recharge') {
            cdkData.isUnlimitedStock = options.isUnlimitedStock || false;
            cdkData.receiptFields = options.receiptFields || null;
          } else {
            // 一次性CDK的兼容性设置
            cdkData.isReusable = options.isReusable || false;
            cdkData.maxUsageCount = options.maxUsageCount || 1;
          }

          // 其他可选参数
          if (options.expireDate) cdkData.expireDate = options.expireDate;
          if (options.productSpecId) cdkData.productSpecId = options.productSpecId;
          if (options.extraData) cdkData.extraData = options.extraData;

          cdks.push(cdkData);
        }
      }
      
      const createdCDKs = await CDK.bulkCreate(cdks);
      
      return {
        success: true,
        imported: createdCDKs.length,
        duplicates: duplicates.length,
        duplicateList: duplicates
      };
    } catch (error) {
      console.error('批量导入CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 查询CDK列表
   */
  async getCDKList(query = {}) {
    try {
      const {
        page = 1,
        pageSize = 20,
        productId,
        status,
        cdkType,
        cdkCategory,
        keyword
      } = query;

      // 确保页码和页大小是数字
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 20;

      const where = {};
      
      if (productId) where.productId = productId;
      if (status !== undefined && status !== '') where.status = parseInt(status, 10);
      if (cdkType) where.cdkType = cdkType;
      if (cdkCategory) where.cdkCategory = cdkCategory;
      if (keyword) {
        where.cdkCode = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await CDK.findAndCountAll({
        where,
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'cdkType', 'price']
        }],
        limit: pageSizeNum,
        offset: (pageNum - 1) * pageSizeNum,
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        data: {
          list: rows,
          total: count,
          page: pageNum,
          pageSize: pageSizeNum
        }
      };
    } catch (error) {
      console.error('查询CDK列表失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 更新CDK状态
   */
  async updateCDKStatus(cdkId, status) {
    try {
      const cdk = await CDK.findByPk(cdkId);
      if (!cdk) {
        throw new Error('CDK不存在');
      }

      cdk.status = status;
      if (status === 1) {
        cdk.soldDate = new Date();
      } else if (status === 2) {
        cdk.usedDate = new Date();
      }
      
      await cdk.save();
      
      return {
        success: true,
        data: cdk
      };
    } catch (error) {
      console.error('更新CDK状态失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 删除CDK
   */
  async deleteCDK(cdkIds) {
    try {
      const ids = Array.isArray(cdkIds) ? cdkIds : [cdkIds];
      
      // 只能删除未售出的CDK
      const result = await CDK.destroy({
        where: {
          id: ids,
          status: 0
        }
      });
      
      return {
        success: true,
        deleted: result
      };
    } catch (error) {
      console.error('删除CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取商品可用CDK数量
   * @param {Number} productId - 商品ID
   * @returns {Number} 可用数量
   */
  async getAvailableCount(productId) {
    try {
      const count = await CDK.count({
        where: {
          productId,
          status: 0 // 未售
        }
      });
      return count;
    } catch (error) {
      console.error('获取可用CDK数量失败:', error);
      return 0;
    }
  }

  /**
   * 兑换CDK
   */
  async redeemCDK(code, userId, options = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const cdk = await CDK.findOne({
        where: { cdkCode: code },
        include: [{
          model: Product,
          as: 'product'
        }],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!cdk) {
        throw new Error('无效的兑换码');
      }

      // 检查CDK是否过期
      if (cdk.expireDate && new Date(cdk.expireDate) < new Date()) {
        cdk.status = 3;
        await cdk.save({ transaction });
        throw new Error('兑换码已过期');
      }

      // 如果是可重复使用的CDK
      if (cdk.isReusable) {
        // 检查使用次数
        if (cdk.currentUsageCount >= cdk.maxUsageCount) {
          throw new Error('兑换码使用次数已达上限');
        }

        // 检查是否在有效期内（基于最后使用时间）
        if (cdk.usageExpireDate && cdk.lastUsedDate) {
          const expireTime = new Date(cdk.lastUsedDate);
          expireTime.setTime(expireTime.getTime() + (new Date(cdk.usageExpireDate) - new Date(cdk.lastUsedDate)));
          if (new Date() > expireTime) {
            // 自动释放CDK
            await this.releaseCDK(cdk.id, 'expired', transaction);
            throw new Error('兑换码使用期限已过，请重新获取');
          }
        }

        // 更新使用次数和时间
        cdk.currentUsageCount += 1;
        cdk.lastUsedDate = new Date();
        
        // 如果设置了使用有效期，计算过期时间
        let usageExpireAt = null;
        if (cdk.usageExpireDate) {
          usageExpireAt = new Date();
          usageExpireAt.setDate(usageExpireAt.getDate() + parseInt(cdk.usageExpireDate));
        }
        
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
          userId,
          orderId: options.orderId || null,
          usageType: 'redeem',
          usageStatus: 1,
          usedAt: new Date(),
          expireAt: usageExpireAt,
          ipAddress: options.ipAddress || null,
          userAgent: options.userAgent || null,
          deviceInfo: options.deviceInfo || null
        }, { transaction });
        
      } else {
        // 一次性CDK的处理逻辑
        if (cdk.status !== 0) {
          const statusMap = {
            1: '已售出',
            2: '已使用',
            3: '已过期',
            4: '已锁定'
          };
          throw new Error(`兑换码${statusMap[cdk.status] || '不可用'}`);
        }
        
        // 标记CDK为已使用
        cdk.status = 2;
        cdk.userId = userId;
        cdk.usedDate = new Date();
        cdk.currentUsageCount = 1;
        cdk.lastUsedDate = new Date();
        await cdk.save({ transaction });
        
        // 记录使用历史
        await CDKUsageRecord.create({
          cdkId: cdk.id,
          cdkCode: cdk.cdkCode,
          userId,
          orderId: options.orderId || null,
          usageType: 'redeem',
          usageStatus: 1,
          usedAt: new Date(),
          ipAddress: options.ipAddress || null,
          userAgent: options.userAgent || null,
          deviceInfo: options.deviceInfo || null
        }, { transaction });
      }

      // 根据CDK类型处理兑换逻辑
      let rewardData = null;
      
      switch (cdk.cdkType) {
        case 'coupon':
          // 发放优惠券
          rewardData = await this.grantCoupon(userId, cdk.extraData);
          break;
        case 'account':
          // 发放账号
          rewardData = cdk.accountInfo;
          break;
        case 'recharge':
          // 充值余额
          rewardData = await this.rechargeBalance(userId, cdk.product.price);
          break;
        default:
          // 普通CDK，返回商品信息
          rewardData = {
            product: cdk.product,
            cdkInfo: cdk.extraData
          };
      }

      await transaction.commit();
      
      return {
        success: true,
        message: '兑换成功',
        data: rewardData,
        cdkInfo: {
          isReusable: cdk.isReusable,
          currentUsageCount: cdk.currentUsageCount,
          maxUsageCount: cdk.maxUsageCount,
          remainingUsage: cdk.isReusable ? cdk.maxUsageCount - cdk.currentUsageCount : 0
        }
      };
    } catch (error) {
      await transaction.rollback();
      console.error('兑换CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 发放优惠券
   */
  async grantCoupon(userId, couponData) {
    // TODO: 实现优惠券发放逻辑
    return {
      type: 'coupon',
      value: couponData
    };
  }

  /**
   * 充值余额
   */
  async rechargeBalance(userId, amount) {
    // TODO: 实现余额充值逻辑
    return {
      type: 'balance',
      amount: amount
    };
  }

  /**
   * 获取CDK统计信息
   */
  async getCDKStatistics(productId) {
    try {
      const where = productId ? { productId } : {};
      
      const total = await CDK.count({ where });
      const unused = await CDK.count({ where: { ...where, status: 0 } });
      const sold = await CDK.count({ where: { ...where, status: 1 } });
      const used = await CDK.count({ where: { ...where, status: 2 } });
      const expired = await CDK.count({ where: { ...where, status: 3 } });
      
      return {
        success: true,
        data: {
          total,
          unused,
          sold,
          used,
          expired,
          usageRate: total > 0 ? ((used / total) * 100).toFixed(2) + '%' : '0%'
        }
      };
    } catch (error) {
      console.error('获取CDK统计信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 导出CDK
   */
  async exportCDK(query = {}) {
    try {
      const { productId, status, format = 'csv' } = query;
      
      const where = {};
      if (productId) where.productId = productId;
      if (status !== undefined) where.status = status;
      
      const cdks = await CDK.findAll({
        where,
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name']
        }],
        order: [['createdAt', 'DESC']]
      });
      
      if (format === 'csv') {
        const headers = ['CDK码', '商品名称', '状态', '创建时间', '售出时间', '使用时间'];
        const rows = cdks.map(cdk => [
          cdk.cdkCode,
          cdk.product?.name || '',
          this.getStatusText(cdk.status),
          cdk.createdAt,
          cdk.soldDate || '',
          cdk.usedDate || ''
        ]);
        
        return {
          success: true,
          data: {
            headers,
            rows
          }
        };
      } else {
        return {
          success: true,
          data: cdks
        };
      }
    } catch (error) {
      console.error('导出CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getStatusText(status) {
    const statusMap = {
      0: '未售',
      1: '已售',
      2: '已使用',
      3: '已过期',
      4: '已锁定'
    };
    return statusMap[status] || '未知';
  }

  /**
   * 释放CDK（重置可重复使用的CDK）
   */
  async releaseCDK(cdkId, reason = 'manual', transaction = null) {
    try {
      const shouldCommit = !transaction;
      if (!transaction) {
        transaction = await sequelize.transaction();
      }

      const cdk = await CDK.findByPk(cdkId, { transaction });
      if (!cdk) {
        throw new Error('CDK不存在');
      }

      if (!cdk.isReusable) {
        throw new Error('该CDK不支持重复使用');
      }

      // 获取当前正在使用的记录
      const activeUsages = await CDKUsageRecord.findAll({
        where: {
          cdkId,
          usageStatus: 1,
          releaseReason: null
        },
        transaction
      });

      // 标记所有活跃使用记录为已释放
      for (const usage of activeUsages) {
        usage.usageStatus = 2;
        usage.releasedAt = new Date();
        usage.releaseReason = reason;
        await usage.save({ transaction });
      }

      // 重置CDK状态
      cdk.status = 0; // 未售
      cdk.currentUsageCount = 0;
      cdk.lastUsedDate = null;
      cdk.userId = null;
      cdk.orderId = null;
      cdk.soldDate = null;
      cdk.usedDate = null;
      await cdk.save({ transaction });

      if (shouldCommit) {
        await transaction.commit();
      }

      return {
        success: true,
        message: 'CDK释放成功',
        releasedCount: activeUsages.length
      };
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      console.error('释放CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 批量释放过期的可重复使用CDK
   */
  async releaseExpiredCDKs() {
    try {
      // 查找所有需要释放的CDK
      const expiredCDKs = await CDK.findAll({
        where: {
          isReusable: true,
          currentUsageCount: { [Op.gt]: 0 },
          [Op.or]: [
            // 超过使用有效期的
            {
              usageExpireDate: { [Op.not]: null },
              lastUsedDate: { [Op.not]: null },
              [Op.and]: sequelize.literal(
                `DATE_ADD(last_used_date, INTERVAL DATEDIFF(usage_expire_date, last_used_date) DAY) < NOW()`
              )
            },
            // 达到最大使用次数且设置了过期时间的
            {
              currentUsageCount: { [Op.gte]: sequelize.col('max_usage_count') },
              expireDate: { [Op.lt]: new Date() }
            }
          ]
        }
      });

      let successCount = 0;
      let failCount = 0;

      for (const cdk of expiredCDKs) {
        const result = await this.releaseCDK(cdk.id, 'expired');
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      return {
        success: true,
        data: {
          total: expiredCDKs.length,
          successCount,
          failCount
        }
      };
    } catch (error) {
      console.error('批量释放过期CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取CDK使用历史
   */
  async getCDKUsageHistory(cdkId) {
    try {
      const usageRecords = await CDKUsageRecord.findAll({
        where: { cdkId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'orderNo', 'totalAmount']
          }
        ],
        order: [['usedAt', 'DESC']]
      });

      return {
        success: true,
        data: usageRecords
      };
    } catch (error) {
      console.error('获取CDK使用历史失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查CDK可用性
   */
  async checkCDKAvailability(cdkCode) {
    try {
      const cdk = await CDK.findOne({
        where: { cdkCode },
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        }]
      });

      if (!cdk) {
        return {
          success: false,
          available: false,
          reason: '无效的兑换码'
        };
      }

      // 检查过期时间
      if (cdk.expireDate && new Date(cdk.expireDate) < new Date()) {
        return {
          success: true,
          available: false,
          reason: '兑换码已过期'
        };
      }

      // 如果是可重复使用的CDK
      if (cdk.isReusable) {
        // 检查使用次数
        if (cdk.currentUsageCount >= cdk.maxUsageCount) {
          return {
            success: true,
            available: false,
            reason: '使用次数已达上限',
            info: {
              currentUsage: cdk.currentUsageCount,
              maxUsage: cdk.maxUsageCount
            }
          };
        }

        // 检查使用有效期
        if (cdk.usageExpireDate && cdk.lastUsedDate) {
          const expireTime = new Date(cdk.lastUsedDate);
          expireTime.setDate(expireTime.getDate() + parseInt(cdk.usageExpireDate));
          if (new Date() > expireTime) {
            return {
              success: true,
              available: false,
              reason: '使用期限已过，需要重新激活'
            };
          }
        }

        return {
          success: true,
          available: true,
          info: {
            isReusable: true,
            remainingUsage: cdk.maxUsageCount - cdk.currentUsageCount,
            product: cdk.product
          }
        };
      } else {
        // 一次性CDK
        if (cdk.status !== 0) {
          const statusMap = {
            1: '已售出',
            2: '已使用',
            3: '已过期',
            4: '已锁定'
          };
          return {
            success: true,
            available: false,
            reason: statusMap[cdk.status] || '不可用'
          };
        }

        return {
          success: true,
          available: true,
          info: {
            isReusable: false,
            product: cdk.product
          }
        };
      }
    } catch (error) {
      console.error('检查CDK可用性失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建代充CDK（手动发货）
   */
  async createManualRechargeCDK(productId, options = {}) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 设置代充CDK的默认选项
      const cdkOptions = {
        ...options,
        cdkCategory: 'manual_recharge',
        isUnlimitedStock: true,
        deliveryMode: 'manual',
        receiptFields: options.receiptFields || {
          channelName: { label: '频道名称', required: true },
          loginAccount: { label: '登录账号', required: true },
          loginPassword: { label: '登录密码', required: true }
        }
      };

      // 生成CDK
      const result = await this.batchGenerateCDK(productId, options.count || 1, cdkOptions);
      
      return result;
    } catch (error) {
      console.error('创建代充CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 保存代充CDK的回执数据
   */
  async saveCDKReceiptData(cdkId, orderId, receiptData) {
    const transaction = await sequelize.transaction();
    
    try {
      const cdk = await CDK.findByPk(cdkId, { transaction });
      if (!cdk) {
        throw new Error('CDK不存在');
      }

      // 更新CDK的回执数据
      cdk.receiptData = receiptData;
      await cdk.save({ transaction });

      // 创建回执记录
      const receipt = await CDKReceipt.create({
        cdkId,
        orderId,
        userId: cdk.userId,
        receiptFields: cdk.receiptFields,
        receiptData: receiptData,
        deliveryStatus: 1, // 已发货
        deliveredAt: new Date()
      }, { transaction });

      await transaction.commit();
      
      return {
        success: true,
        data: receipt
      };
    } catch (error) {
      await transaction.rollback();
      console.error('保存CDK回执数据失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建可重复使用有库存的CDK
   */
  async createReusableStockCDK(productId, options = {}) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 设置可重复使用CDK的默认选项
      const cdkOptions = {
        ...options,
        cdkCategory: 'reusable_stock',
        isReusable: true,
        maxUsageCount: options.maxUsageCount || 999999, // 默认无限次
        releaseDays: options.releaseDays || 30, // 默认30天后释放
        deliveryMode: 'auto'
      };

      // 生成CDK
      const result = await this.batchGenerateCDK(productId, options.count || 1, cdkOptions);
      
      return result;
    } catch (error) {
      console.error('创建可重复使用CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 释放过期的可重复使用CDK（根据releaseDays）
   */
  async releaseExpiredReusableCDKs() {
    try {
      // 查找需要释放的CDK
      const expiredCDKs = await CDK.findAll({
        where: {
          cdkCategory: 'reusable_stock',
          status: { [Op.in]: [1, 2] }, // 已售或已使用
          lastUsedDate: { [Op.not]: null },
          [Op.and]: sequelize.literal(
            `DATE_ADD(last_used_date, INTERVAL release_days DAY) < NOW()`
          )
        }
      });

      let successCount = 0;
      let failCount = 0;

      for (const cdk of expiredCDKs) {
        const result = await this.releaseCDK(cdk.id, 'auto_release');
        if (result.success) {
          successCount++;
          console.log(`CDK ${cdk.cdkCode} 已自动释放`);
        } else {
          failCount++;
          console.error(`CDK ${cdk.cdkCode} 释放失败:`, result.error);
        }
      }

      return {
        success: true,
        data: {
          total: expiredCDKs.length,
          successCount,
          failCount
        }
      };
    } catch (error) {
      console.error('批量释放过期可重复使用CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 根据商品规格获取CDK
   */
  async getCDKsBySpecification(productSpecId, options = {}) {
    try {
      const { page = 1, pageSize = 20, status } = options;
      
      const where = { productSpecId };
      if (status !== undefined) where.status = status;

      const { count, rows } = await CDK.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'title', 'price']
          },
          {
            model: ProductSpecification,
            as: 'specification',
            attributes: ['id', 'specName', 'specValue', 'price']
          }
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']]
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
      console.error('根据规格获取CDK失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查并处理不同类型的CDK发货
   */
  async processCDKDelivery(order, cdk) {
    try {
      switch (cdk.cdkCategory) {
        case 'manual_recharge':
          // 代充CDK - 手动发货，创建待发货记录
          await CDKReceipt.create({
            cdkId: cdk.id,
            orderId: order.id,
            userId: order.userId,
            receiptFields: cdk.receiptFields,
            deliveryStatus: 0 // 待发货
          });
          
          return {
            success: true,
            deliveryType: 'manual',
            message: '订单已创建，等待手动发货'
          };

        case 'reusable_stock':
          // 可重复使用CDK - 自动发货，设置释放时间
          const releaseDate = new Date();
          releaseDate.setDate(releaseDate.getDate() + (cdk.releaseDays || 30));
          
          cdk.status = 1; // 已售
          cdk.orderId = order.id;
          cdk.userId = order.userId;
          cdk.soldDate = new Date();
          cdk.lastUsedDate = new Date();
          cdk.usageExpireDate = releaseDate;
          await cdk.save();
          
          return {
            success: true,
            deliveryType: 'auto',
            cdkCode: cdk.cdkCode,
            releaseDate: releaseDate
          };

        case 'one_time':
        default:
          // 一次性CDK - 自动发货
          cdk.status = 1; // 已售
          cdk.orderId = order.id;
          cdk.userId = order.userId;
          cdk.soldDate = new Date();
          await cdk.save();
          
          return {
            success: true,
            deliveryType: 'auto',
            cdkCode: cdk.cdkCode
          };
      }
    } catch (error) {
      console.error('处理CDK发货失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new CDKService();