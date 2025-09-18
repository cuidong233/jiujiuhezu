import express from 'express';
import { WorkOrder } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// 获取工单列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, type, priority } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    
    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建工单
router.post('/create', async (req, res) => {
  try {
    const orderNo = `WO${Date.now()}`;
    const workOrder = await WorkOrder.create({
      ...req.body,
      orderNo,
      status: 'pending'
    });
    
    res.json({
      code: 0,
      message: '工单创建成功',
      data: workOrder
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新工单
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await WorkOrder.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    const workOrder = await WorkOrder.findByPk(req.params.id);
    
    res.json({
      code: 0,
      message: '工单更新成功',
      data: workOrder
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 工单回复
router.post('/reply', async (req, res) => {
  try {
    const { workId, content, operator, operatorId } = req.body;
    
    const workOrder = await WorkOrder.findByPk(workId);
    if (!workOrder) {
      return res.status(404).json({ code: 404, message: '工单不存在' });
    }
    
    await workOrder.update({
      reply: content,
      status: 'processing'
    });
    
    res.json({
      code: 0,
      message: '回复成功',
      data: {
        id: workId,
        content,
        operator,
        operatorId,
        time: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;