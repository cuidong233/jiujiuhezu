import express from 'express';
import { Question, Category } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// 获取问题列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, status, keyword } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { question: { [Op.like]: `%${keyword}%` } },
        { answer: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Question.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
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

// 获取分类
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['order', 'ASC']]
    });
    
    res.json({
      code: 0,
      message: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个问题
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    
    if (!question) {
      return res.status(404).json({ code: 404, message: '问题不存在' });
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: question
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建问题
router.post('/create', async (req, res) => {
  try {
    const question = await Question.create(req.body);
    
    res.json({
      code: 0,
      message: '问题创建成功',
      data: question
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新问题
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Question.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ code: 404, message: '问题不存在' });
    }
    
    const question = await Question.findByPk(req.params.id);
    
    res.json({
      code: 0,
      message: '问题更新成功',
      data: question
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除问题
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Question.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ code: 404, message: '问题不存在' });
    }
    
    res.json({
      code: 0,
      message: '问题删除成功',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;