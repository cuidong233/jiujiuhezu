import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db/database.js';

const router = express.Router();

// 获取购物车列表
router.get('/list', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('获取购物车列表 - 用户ID:', userId);
    
    // 查询用户的购物车
    const [cartItems] = await pool.query(
      `SELECT 
        c.id,
        c.product_id as productId,
        c.quantity,
        c.sku_name as skuName,
        c.sku_price as skuPrice,
        c.created_at as addTime,
        c.updated_at as updateTime,
        g.title as name,
        g.cover_image as image,
        g.description,
        g.price as defaultPrice,
        g.sku_info as skus
      FROM pr_cart c
      LEFT JOIN pr_goods g ON c.product_id = g.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC`,
      [userId]
    );
    
    // 格式化购物车数据
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      description: item.description,
      quantity: item.quantity,
      skuName: item.skuName,
      price: item.skuPrice || item.defaultPrice,
      skus: item.skus ? (typeof item.skus === 'string' ? JSON.parse(item.skus) : item.skus) : null,
      addTime: item.addTime,
      updateTime: item.updateTime
    }));
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: formattedItems,
        total: formattedItems.length
      },
      success: true
    });
  } catch (error) {
    console.error('获取购物车失败 - 详细错误:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 500,
      msg: '获取购物车失败: ' + error.message,
      success: false
    });
  }
});

// 添加到购物车
router.post('/add', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, skuName = null, skuPrice = null } = req.body;
    
    // 检查是否已在购物车中
    const [existing] = await pool.query(
      'SELECT id, quantity FROM pr_cart WHERE user_id = ? AND product_id = ? AND (sku_name = ? OR (sku_name IS NULL AND ? IS NULL))',
      [userId, productId, skuName, skuName]
    );
    
    if (existing.length > 0) {
      // 更新数量
      await pool.query(
        'UPDATE pr_cart SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      // 新增商品到购物车
      await pool.query(
        'INSERT INTO pr_cart (user_id, product_id, quantity, sku_name, sku_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, productId, quantity, skuName, skuPrice]
      );
    }
    
    res.json({
      code: 0,
      msg: '添加成功',
      success: true
    });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    res.status(500).json({
      code: 500,
      msg: '添加到购物车失败',
      success: false
    });
  }
});

// 更新购物车商品数量
router.post('/update', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId, quantity } = req.body;
    
    await pool.query(
      'UPDATE pr_cart SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [quantity, cartId, userId]
    );
    
    res.json({
      code: 0,
      msg: '更新成功',
      success: true
    });
  } catch (error) {
    console.error('更新购物车失败:', error);
    res.status(500).json({
      code: 500,
      msg: '更新购物车失败',
      success: false
    });
  }
});

// 从购物车移除商品
router.post('/remove', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId } = req.body;
    
    await pool.query(
      'DELETE FROM pr_cart WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );
    
    res.json({
      code: 0,
      msg: '移除成功',
      success: true
    });
  } catch (error) {
    console.error('移除商品失败:', error);
    res.status(500).json({
      code: 500,
      msg: '移除商品失败',
      success: false
    });
  }
});

// 清空购物车
router.post('/clear', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.query(
      'DELETE FROM pr_cart WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      code: 0,
      msg: '清空成功',
      success: true
    });
  } catch (error) {
    console.error('清空购物车失败:', error);
    res.status(500).json({
      code: 500,
      msg: '清空购物车失败',
      success: false
    });
  }
});

export default router;