import express from 'express';
import { VipUser } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// 获取VIP用户列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, level, status } = req.query;
    
    const where = {};
    if (level) where.level = Number(level);
    if (status) where.status = status;
    
    const { count, rows } = await VipUser.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['level', 'DESC'], ['createdAt', 'DESC']]
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

// 创建VIP用户
router.post('/create', async (req, res) => {
  try {
    const vipUser = await VipUser.create(req.body);
    
    res.json({
      code: 0,
      message: 'VIP用户创建成功',
      data: vipUser
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新VIP用户
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await VipUser.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ code: 404, message: 'VIP用户不存在' });
    }
    
    const vipUser = await VipUser.findByPk(req.params.id);
    
    res.json({
      code: 0,
      message: 'VIP用户更新成功',
      data: vipUser
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除VIP用户
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await VipUser.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ code: 404, message: 'VIP用户不存在' });
    }
    
    res.json({
      code: 0,
      message: 'VIP用户删除成功',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;