import express from 'express';
import { authenticate, adminAuth, optionalAuthenticate } from '../middleware/auth.js';
import DiscountActivity from '../models/DiscountActivity.js';
import { Op } from 'sequelize';

const router = express.Router();

// 获取所有折扣活动（管理端）
// 使用可选认证，允许用户访问
router.get('/admin/list', optionalAuthenticate, async (req, res) => {
  try {
    const { page = 1, size = 10, status, keyword } = req.query;
    const offset = (page - 1) * size;
    
    const where = {};
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    
    console.log('查询条件:', where);
    console.log('分页参数:', { limit: parseInt(size), offset: parseInt(offset) });
    
    const { count, rows } = await DiscountActivity.findAndCountAll({
      where,
      limit: parseInt(size),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    console.log('查询结果:', { count, rowsLength: rows.length });
    
    res.json({
      code: 200,
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        size: parseInt(size)
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取折扣活动列表失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '获取折扣活动列表失败'
    });
  }
});

// 创建折扣活动
router.post('/admin/create', authenticate, async (req, res) => {
  try {
    const activity = await DiscountActivity.create(req.body);
    res.json({
      code: 200,
      success: true,
      data: activity,
      message: '创建成功'
    });
  } catch (error) {
    console.error('创建折扣活动失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '创建折扣活动失败'
    });
  }
});

// 更新折扣活动
router.put('/admin/update/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await DiscountActivity.findByPk(id);
    
    if (!activity) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '活动不存在'
      });
    }
    
    await activity.update(req.body);
    res.json({
      code: 200,
      success: true,
      data: activity,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新折扣活动失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '更新折扣活动失败'
    });
  }
});

// 删除折扣活动
router.delete('/admin/delete/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await DiscountActivity.findByPk(id);
    
    if (!activity) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '活动不存在'
      });
    }
    
    await activity.destroy();
    res.json({
      code: 200,
      success: true,
      data: null,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除折扣活动失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '删除折扣活动失败'
    });
  }
});

// 切换活动状态
router.put('/admin/toggle-status/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await DiscountActivity.findByPk(id);
    
    if (!activity) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '活动不存在'
      });
    }
    
    activity.status = activity.status === 1 ? 0 : 1;
    await activity.save();
    
    res.json({
      code: 200,
      success: true,
      data: activity,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新活动状态失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '更新活动状态失败'
    });
  }
});

// 获取当前有效的折扣活动（前端使用）
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const activities = await DiscountActivity.findAll({
      where: {
        status: 1,
        start_time: { [Op.lte]: now },
        end_time: { [Op.gte]: now }
      },
      order: [['discount_value', 'DESC']]
    });
    
    // 返回最优惠的活动
    const bestActivity = activities.length > 0 ? activities[0] : null;
    res.json({
      code: 200,
      success: true,
      data: bestActivity,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取有效折扣活动失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '获取有效折扣活动失败'
    });
  }
});

// 获取商品适用的折扣
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { categoryId, price } = req.query;
    
    const activities = await DiscountActivity.getActiveDiscounts();
    
    // 找出适用于该商品的活动
    const applicableActivities = activities.filter(activity => {
      // 检查最低消费金额
      if (price && activity.min_purchase_amount > price) {
        return false;
      }
      return activity.isApplicableToProduct(parseInt(productId), parseInt(categoryId));
    });
    
    if (applicableActivities.length === 0) {
      return res.json({
        code: 200,
        success: true,
        data: null,
        message: '暂无适用的折扣活动'
      });
    }
    
    // 返回最优惠的活动
    const bestActivity = applicableActivities[0];
    const discountedPrice = price ? bestActivity.calculateDiscountedPrice(parseFloat(price)) : null;
    
    res.json({
      code: 200,
      success: true,
      data: {
        activity: bestActivity,
        original_price: price ? parseFloat(price) : null,
        discounted_price: discountedPrice,
        saved_amount: price ? parseFloat(price) - discountedPrice : null
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取商品折扣失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '获取商品折扣失败'
    });
  }
});

export default router;