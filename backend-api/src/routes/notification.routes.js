import express from 'express';
import { Notification } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取用户通知列表
router.get('/list', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20, isRead } = req.query;
    
    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });
    
    res.json({
      code: 0,
      success: true,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: limit
      }
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取通知列表失败',
      error: error.message
    });
  }
});

// 获取未读通知数量
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);
    
    res.json({
      code: 0,
      success: true,
      message: '获取成功',
      data: { count }
    });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取未读通知数量失败',
      error: error.message
    });
  }
});

// 标记通知为已读
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const success = await Notification.markAsRead(id, userId);
    
    if (success) {
      res.json({
        code: 0,
        success: true,
        message: '标记成功'
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '通知不存在或无权操作'
      });
    }
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记失败',
      error: error.message
    });
  }
});

// 标记所有通知为已读
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.markAllAsRead(userId);
    
    res.json({
      code: 0,
      success: true,
      message: '标记成功',
      data: { count }
    });
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记失败',
      error: error.message
    });
  }
});

// 删除通知
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await Notification.destroy({
      where: {
        id,
        userId
      }
    });
    
    if (result > 0) {
      res.json({
        code: 0,
        success: true,
        message: '删除成功'
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '通知不存在或无权操作'
      });
    }
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: error.message
    });
  }
});

// 批量删除通知
router.post('/batch-delete', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的通知ID列表'
      });
    }
    
    const result = await Notification.destroy({
      where: {
        id: ids,
        userId
      }
    });
    
    res.json({
      code: 0,
      success: true,
      message: '删除成功',
      data: { count: result }
    });
  } catch (error) {
    console.error('批量删除通知失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: error.message
    });
  }
});

export default router;