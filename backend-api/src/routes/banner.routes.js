import express from 'express';
import pool from '../db/database.js';
import { authenticate as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取轮播图列表（前台，无需认证）
router.get('/banner', async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        img,
        link,
        title,
        order_num,
        is_visible
      FROM pr_banner 
      WHERE is_visible = 1
      ORDER BY order_num ASC, id DESC
    `;
    
    const [rows] = await pool.execute(sql);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取轮播图列表失败'
    });
  }
});

// 获取轮播图列表（管理端）
router.get('/admin/banner', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '', status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const params = [];
    
    if (keyword) {
      whereClause += ' AND title LIKE ?';
      params.push(`%${keyword}%`);
    }
    
    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND is_visible = ?';
      params.push(parseInt(status));
    }
    
    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM pr_banner WHERE ${whereClause}`;
    const countQuery = params.length > 0 ? await pool.execute(countSql, params) : await pool.query(countSql);
    const [countResult] = countQuery;
    const total = countResult[0].total;
    
    // 获取列表
    let listSql = `
      SELECT 
        id,
        img,
        link,
        title,
        order_num,
        is_visible,
        created_at,
        updated_at
      FROM pr_banner 
      WHERE ${whereClause}
      ORDER BY order_num ASC, id DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    
    const listQuery = params.length > 0 ? await pool.execute(listSql, params) : await pool.query(listSql);
    const [rows] = listQuery;
    
    res.json({
      success: true,
      data: {
        list: rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: '获取轮播图列表失败',
      debug: error.message
    });
  }
});

// 添加轮播图
router.post('/admin/banner', authenticateToken, async (req, res) => {
  try {
    const { title, img, link = '', order_num = 0, is_visible = 1 } = req.body;
    
    if (!title || !img) {
      return res.status(400).json({
        success: false,
        message: '标题和图片不能为空'
      });
    }
    
    const sql = `
      INSERT INTO pr_banner (title, img, link, order_num, is_visible)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [title, img, link, order_num, is_visible]);
    
    res.json({
      success: true,
      message: '添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('添加轮播图失败:', error);
    res.status(500).json({
      success: false,
      message: '添加轮播图失败'
    });
  }
});

// 更新轮播图
router.put('/admin/banner/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, img, link = '', order_num = 0, is_visible = 1 } = req.body;
    
    if (!title || !img) {
      return res.status(400).json({
        success: false,
        message: '标题和图片不能为空'
      });
    }
    
    const sql = `
      UPDATE pr_banner 
      SET title = ?, img = ?, link = ?, order_num = ?, is_visible = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(sql, [title, img, link, order_num, is_visible, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    res.status(500).json({
      success: false,
      message: '更新轮播图失败'
    });
  }
});

// 删除轮播图
router.delete('/admin/banner/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM pr_banner WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    res.status(500).json({
      success: false,
      message: '删除轮播图失败'
    });
  }
});

// 更新轮播图状态
router.put('/admin/banner/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;
    
    const sql = `
      UPDATE pr_banner 
      SET is_visible = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(sql, [is_visible, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '轮播图不存在'
      });
    }
    
    res.json({
      success: true,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新轮播图状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新轮播图状态失败'
    });
  }
});

export default router;