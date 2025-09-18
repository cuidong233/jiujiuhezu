import express from 'express';
import { WithdrawRecord } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../db/sequelize.js';

const router = express.Router();

// 获取提现记录列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, userId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    
    const { count, rows } = await WithdrawRecord.findAndCountAll({
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

// 创建提现申请
router.post('/create', async (req, res) => {
  try {
    const orderId = `WD${Date.now()}`;
    const withdrawRecord = await WithdrawRecord.create({
      ...req.body,
      orderId,
      status: 'pending'
    });
    
    res.json({
      code: 0,
      message: '提现申请创建成功',
      data: withdrawRecord
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 审核提现申请
router.put('/review/:id', async (req, res) => {
  try {
    const { status, rejectReason, operatorId, operatorName } = req.body;
    
    const updateData = {
      status,
      rejectReason: rejectReason || '',
      operatorId,
      operatorName,
      processedTime: new Date()
    };
    
    if (status === 'completed') {
      updateData.completedTime = new Date();
    }
    
    const [updated] = await WithdrawRecord.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ code: 404, message: '提现记录不存在' });
    }
    
    const withdrawRecord = await WithdrawRecord.findByPk(req.params.id);
    
    res.json({
      code: 0,
      message: '提现审核成功',
      data: withdrawRecord
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取提现统计
router.get('/statistics', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecords = await WithdrawRecord.findAll({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    
    const allRecords = await WithdrawRecord.findAll();
    
    const statistics = {
      todayAmount: todayRecords.reduce((sum, w) => sum + Number(w.actualAmount || 0), 0),
      todayCount: todayRecords.length,
      totalAmount: allRecords.reduce((sum, w) => sum + Number(w.actualAmount || 0), 0),
      totalCount: allRecords.length,
      pendingAmount: allRecords.filter(w => w.status === 'pending').reduce((sum, w) => sum + Number(w.actualAmount), 0),
      pendingCount: allRecords.filter(w => w.status === 'pending').length,
      completedAmount: allRecords.filter(w => w.status === 'completed').reduce((sum, w) => sum + Number(w.actualAmount), 0),
      completedCount: allRecords.filter(w => w.status === 'completed').length,
      rejectedCount: allRecords.filter(w => w.status === 'rejected').length
    };
    
    res.json({
      code: 0,
      message: 'success',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;