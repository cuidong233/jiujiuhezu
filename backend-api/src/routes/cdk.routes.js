import express from 'express';
import cdkService from '../services/cdkService.js';
import deliveryService from '../services/deliveryService.js';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 批量生成CDK
 */
router.post('/generate',
  [
    body('productId').notEmpty().withMessage('商品ID不能为空'),
    body('count').isInt({ min: 1, max: 1000 }).withMessage('生成数量必须在1-1000之间')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { 
        productId, count, prefix, cdkType, expireDate, extraData,
        isReusable, maxUsageCount, usageExpireDate,
        cdkCategory, releaseDays, productSpecId, isUnlimitedStock, receiptFields 
      } = req.body;
      
      const result = await cdkService.batchGenerateCDK(productId, count, {
        prefix,
        cdkType,
        cdkCategory,
        expireDate,
        extraData,
        isReusable,
        maxUsageCount,
        usageExpireDate,
        releaseDays,
        productSpecId,
        isUnlimitedStock,
        receiptFields
      });
      
      if (result.success) {
        res.json({
          code: 0,
          message: `成功生成${result.count}个CDK`,
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '生成CDK失败'
        });
      }
    } catch (error) {
      console.error('生成CDK异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 批量导入CDK
 */
router.post('/import',
  upload.single('file'),
  async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({
          code: -1,
          message: '商品ID不能为空'
        });
      }
      
      let cdkList = [];
      
      if (req.file) {
        // 从文件导入
        const content = req.file.buffer.toString('utf-8');
        cdkList = content.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      } else if (req.body.cdks) {
        // 从文本导入
        cdkList = req.body.cdks.split(/[\n,;]/)
          .map(cdk => cdk.trim())
          .filter(cdk => cdk.length > 0);
      } else {
        return res.status(400).json({
          code: -1,
          message: '请提供CDK列表或上传文件'
        });
      }
      
      // 构建导入选项
      const options = {
        cdkCategory: req.body.cdkCategory || 'one_time',
        cdkType: req.body.cdkType || 'normal'
      };

      // 根据CDK分类添加相关参数
      if (options.cdkCategory === 'reusable_stock') {
        options.releaseDays = parseInt(req.body.releaseDays) || 30;
        options.isReusable = true;
      } else if (options.cdkCategory === 'manual_recharge') {
        options.isUnlimitedStock = req.body.isUnlimitedStock === 'true';
        if (req.body.receiptFields) {
          try {
            options.receiptFields = JSON.parse(req.body.receiptFields);
          } catch (e) {
            console.warn('回执字段JSON解析失败:', e);
          }
        }
      } else {
        // 一次性CDK兼容性参数
        options.isReusable = req.body.isReusable === 'true';
        options.maxUsageCount = parseInt(req.body.maxUsageCount) || 1;
      }

      // 其他可选参数
      if (req.body.expireDate) options.expireDate = req.body.expireDate;
      if (req.body.productSpecId) options.productSpecId = parseInt(req.body.productSpecId);

      const result = await cdkService.batchImportCDK(productId, cdkList, options);
      
      if (result.success) {
        res.json({
          code: 0,
          message: `成功导入${result.imported}个CDK${result.duplicates > 0 ? `，${result.duplicates}个重复` : ''}`,
          data: result
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '导入CDK失败'
        });
      }
    } catch (error) {
      console.error('导入CDK异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 查询CDK列表
 */
router.get('/list',
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const result = await cdkService.getCDKList(req.query);
      
      if (result.success) {
        res.json({
          code: 0,
          message: 'success',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '查询失败'
        });
      }
    } catch (error) {
      console.error('查询CDK列表异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 更新CDK状态
 */
router.put('/:id/status',
  [
    body('status').isIn([0, 1, 2, 3, 4]).withMessage('状态值无效')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await cdkService.updateCDKStatus(id, status);
      
      if (result.success) {
        res.json({
          code: 0,
          message: '状态更新成功',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '更新失败'
        });
      }
    } catch (error) {
      console.error('更新CDK状态异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 删除CDK
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await cdkService.deleteCDK(id);
    
    if (result.success) {
      res.json({
        code: 0,
        message: '删除成功',
        data: result
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '删除失败'
      });
    }
  } catch (error) {
    console.error('删除CDK异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 批量删除CDK
 */
router.post('/batch-delete',
  [
    body('ids').isArray().withMessage('IDs必须是数组')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { ids } = req.body;
      
      const result = await cdkService.deleteCDK(ids);
      
      if (result.success) {
        res.json({
          code: 0,
          message: `成功删除${result.deleted}个CDK`,
          data: result
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '删除失败'
        });
      }
    } catch (error) {
      console.error('批量删除CDK异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 兑换CDK
 */
router.post('/redeem',
  [
    body('code').notEmpty().withMessage('兑换码不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { code } = req.body;
      const userId = req.userId || 1; // TODO: 从认证中获取用户ID
      
      const options = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      };
      
      const result = await cdkService.redeemCDK(code, userId, options);
      
      if (result.success) {
        res.json({
          code: 0,
          message: result.message,
          data: result.data
        });
      } else {
        res.status(400).json({
          code: -1,
          message: result.error || '兑换失败'
        });
      }
    } catch (error) {
      console.error('兑换CDK异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 获取CDK统计信息
 */
router.get('/statistics', async (req, res) => {
  try {
    const { productId } = req.query;
    
    const result = await cdkService.getCDKStatistics(productId);
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '获取统计信息失败'
      });
    }
  } catch (error) {
    console.error('获取CDK统计异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 检查CDK可用性
 */
router.post('/check-availability',
  [
    body('code').notEmpty().withMessage('兑换码不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { code } = req.body;
      
      const result = await cdkService.checkCDKAvailability(code);
      
      if (result.success) {
        res.json({
          code: 0,
          message: 'success',
          data: {
            available: result.available,
            reason: result.reason,
            info: result.info
          }
        });
      } else {
        res.status(400).json({
          code: -1,
          message: result.error || '检查失败'
        });
      }
    } catch (error) {
      console.error('检查CDK可用性异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 获取CDK使用历史
 */
router.get('/:id/usage-history', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await cdkService.getCDKUsageHistory(id);
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '获取使用历史失败'
      });
    }
  } catch (error) {
    console.error('获取CDK使用历史异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 手动释放CDK
 */
router.post('/:id/release', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'manual' } = req.body;
    
    const result = await cdkService.releaseCDK(id, reason);
    
    if (result.success) {
      res.json({
        code: 0,
        message: result.message,
        data: {
          releasedCount: result.releasedCount
        }
      });
    } else {
      res.status(400).json({
        code: -1,
        message: result.error || '释放失败'
      });
    }
  } catch (error) {
    console.error('释放CDK异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 批量释放过期的CDK
 */
router.post('/release-expired', async (req, res) => {
  try {
    const result = await cdkService.releaseExpiredCDKs();
    
    if (result.success) {
      res.json({
        code: 0,
        message: '批量释放完成',
        data: result.data
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '批量释放失败'
      });
    }
  } catch (error) {
    console.error('批量释放过期CDK异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 导出CDK
 */
router.get('/export', async (req, res) => {
  try {
    const result = await cdkService.exportCDK(req.query);
    
    if (result.success) {
      if (req.query.format === 'csv') {
        // 生成CSV内容
        const csvContent = [
          result.data.headers.join(','),
          ...result.data.rows.map(row => row.join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=cdk-export.csv');
        res.send('\ufeff' + csvContent); // 添加BOM以支持中文
      } else {
        res.json({
          code: 0,
          message: 'success',
          data: result.data
        });
      }
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '导出失败'
      });
    }
  } catch (error) {
    console.error('导出CDK异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 创建代充CDK（手动发货）
 */
router.post('/create-manual-recharge',
  [
    body('productId').notEmpty().withMessage('商品ID不能为空'),
    body('count').isInt({ min: 1 }).withMessage('数量必须大于0')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { productId, count, receiptFields } = req.body;
      
      const result = await cdkService.createManualRechargeCDK(productId, {
        count,
        receiptFields
      });
      
      if (result.success) {
        res.json({
          code: 0,
          message: '创建代充CDK成功',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '创建失败'
        });
      }
    } catch (error) {
      console.error('创建代充CDK异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 创建可重复使用有库存的CDK
 */
router.post('/create-reusable-stock',
  [
    body('productId').notEmpty().withMessage('商品ID不能为空'),
    body('count').isInt({ min: 1 }).withMessage('数量必须大于0')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { productId, count, releaseDays, maxUsageCount } = req.body;
      
      const result = await cdkService.createReusableStockCDK(productId, {
        count,
        releaseDays,
        maxUsageCount
      });
      
      if (result.success) {
        res.json({
          code: 0,
          message: '创建可重复使用CDK成功',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '创建失败'
        });
      }
    } catch (error) {
      console.error('创建可重复使用CDK异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 保存CDK回执数据
 */
router.post('/:id/save-receipt',
  [
    body('orderId').notEmpty().withMessage('订单ID不能为空'),
    body('receiptData').notEmpty().withMessage('回执数据不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { id } = req.params;
      const { orderId, receiptData } = req.body;
      
      const result = await cdkService.saveCDKReceiptData(id, orderId, receiptData);
      
      if (result.success) {
        res.json({
          code: 0,
          message: '保存回执数据成功',
          data: result.data
        });
      } else {
        res.status(500).json({
          code: -1,
          message: result.error || '保存失败'
        });
      }
    } catch (error) {
      console.error('保存CDK回执数据异常:', error);
      res.status(500).json({
        code: -1,
        message: '服务器错误'
      });
    }
  }
);

/**
 * 完成回执单发货
 */
router.post('/receipt/:receiptId/complete', async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { receiptData, notes } = req.body;
    
    // 模拟操作员信息（实际应该从认证中获取）
    const operator = {
      id: 1,
      name: 'Admin'
    };
    
    const result = await deliveryService.completeManualRechargeDelivery(
      receiptId,
      receiptData,
      operator
    );
    
    if (result.success) {
      res.json({
        code: 0,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({
        code: -1,
        message: result.error || '发货失败'
      });
    }
  } catch (error) {
    console.error('完成回执单发货异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 根据商品规格获取CDK
 */
router.get('/by-specification/:specId', async (req, res) => {
  try {
    const { specId } = req.params;
    const { page, pageSize, status } = req.query;
    
    const result = await cdkService.getCDKsBySpecification(specId, {
      page,
      pageSize,
      status
    });
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '查询失败'
      });
    }
  } catch (error) {
    console.error('根据规格获取CDK异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 批量释放过期的可重复使用CDK（新版本）
 */
router.post('/release-expired-reusable', async (req, res) => {
  try {
    const result = await cdkService.releaseExpiredReusableCDKs();
    
    if (result.success) {
      res.json({
        code: 0,
        message: '批量释放完成',
        data: result.data
      });
    } else {
      res.status(500).json({
        code: -1,
        message: result.error || '批量释放失败'
      });
    }
  } catch (error) {
    console.error('批量释放过期可重复使用CDK异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

export default router;