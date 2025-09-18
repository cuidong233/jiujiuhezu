import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db/database.js';

const router = express.Router();

// 获取用户收藏列表
router.get('/list', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查询用户的收藏列表
    const [favorites] = await pool.query(
      `SELECT 
        f.id,
        f.goods_id as goodsId,
        f.created_at as addTime,
        g.title as name,
        g.cover_image as image,
        g.description as \`desc\`,
        '' as region,
        '' as quality,
        '' as devices,
        '' as download,
        CONCAT('[{"label":"默认","value":"', g.price, '"}]') as prices,
        0 as hot
      FROM user_favorites f
      LEFT JOIN pr_goods g ON f.goods_id = g.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`,
      [userId]
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: favorites.map(item => ({
          ...item,
          prices: item.prices ? JSON.parse(item.prices) : []
        }))
      },
      success: true
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取收藏列表失败',
      success: false
    });
  }
});

// 添加收藏
router.post('/:goodsId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goodsId } = req.params;
    
    // 检查是否已收藏
    const [existing] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND goods_id = ?',
      [userId, goodsId]
    );
    
    if (existing.length > 0) {
      return res.json({
        code: 0,
        msg: '已经收藏过了',
        success: true
      });
    }
    
    // 添加收藏
    await pool.query(
      'INSERT INTO user_favorites (user_id, goods_id, created_at) VALUES (?, ?, NOW())',
      [userId, goodsId]
    );
    
    res.json({
      code: 0,
      msg: '收藏成功',
      success: true
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({
      code: 500,
      msg: '添加收藏失败',
      success: false
    });
  }
});

// 取消收藏
router.delete('/:goodsId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goodsId } = req.params;
    
    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND goods_id = ?',
      [userId, goodsId]
    );
    
    res.json({
      code: 0,
      msg: '取消收藏成功',
      success: true
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({
      code: 500,
      msg: '取消收藏失败',
      success: false
    });
  }
});

// 检查收藏状态
router.get('/check/:goodsId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goodsId } = req.params;
    
    const [existing] = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND goods_id = ?',
      [userId, goodsId]
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: existing.length > 0,
      success: true
    });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({
      code: 500,
      msg: '检查收藏状态失败',
      data: false,
      success: false
    });
  }
});

export default router;