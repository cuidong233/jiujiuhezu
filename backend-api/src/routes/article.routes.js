import express from 'express';
import Article from '../models/Article.js';
import { authenticate, adminAuth, optionalAuthenticate } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { Op } from 'sequelize';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/articles/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取文章列表（使用可选认证，支持管理员查看所有状态）
router.get('/', optionalAuthenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status = 'published',
      search,
      featured
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    // 检查用户权限决定显示哪些文章
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isAdmin) {
      // 非管理员只能看已发布的文章
      where.status = 'published';
    } else if (status) {
      // 管理员可以根据查询参数筛选状态
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (featured === 'true') {
      where.is_featured = true;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await Article.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['is_featured', 'DESC'],
        ['sort_order', 'ASC'],
        ['publish_date', 'DESC']
      ],
      attributes: { 
        exclude: ['content'] // 列表不返回完整内容
      }
    });
    
    res.json({
      success: true,
      data: {
        articles: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取文章列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取文章列表失败' 
    });
  }
});

// 获取文章详情（使用可选认证）
router.get('/:id', optionalAuthenticate, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }
    
    // 检查用户权限
    const isAdmin = req.user && req.user.role === 'admin';
    
    // 非管理员只能查看已发布的文章
    if (article.status !== 'published' && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '文章尚未发布' 
      });
    }
    
    // 增加浏览次数
    await article.increment('views');
    
    // 获取相关文章
    let relatedArticles = [];
    if (article.related_articles) {
      const relatedIds = article.related_articles.split(',').map(id => parseInt(id.trim()));
      relatedArticles = await Article.findAll({
        where: {
          id: relatedIds,
          status: 'published'
        },
        attributes: ['id', 'title', 'subtitle', 'description', 'image', 'category', 'author_name', 'author_avatar', 'publish_date']
      });
    }
    
    res.json({
      success: true,
      data: {
        article: article.toJSON(),
        relatedArticles
      }
    });
  } catch (error) {
    console.error('获取文章详情错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取文章详情失败' 
    });
  }
});

// 创建文章（管理员接口）
router.post('/', ...adminAuth, upload.single('image'), async (req, res) => {
  try {
    const articleData = { ...req.body };
    
    // 处理上传的图片
    if (req.file) {
      articleData.image = `/uploads/articles/${req.file.filename}`;
    }
    
    // 如果状态是发布，设置发布日期
    if (articleData.status === 'published' && !articleData.publish_date) {
      articleData.publish_date = new Date();
    }
    
    const article = await Article.create(articleData);
    
    res.status(201).json({
      success: true,
      message: '文章创建成功',
      data: article
    });
  } catch (error) {
    console.error('创建文章错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建文章失败',
      error: error.message 
    });
  }
});

// 更新文章（管理员接口）
router.put('/:id', ...adminAuth, upload.single('image'), async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }
    
    const updateData = { ...req.body };
    
    // 处理上传的图片
    if (req.file) {
      updateData.image = `/uploads/articles/${req.file.filename}`;
    }
    
    // 如果状态从草稿改为发布，设置发布日期
    if (article.status !== 'published' && updateData.status === 'published' && !updateData.publish_date) {
      updateData.publish_date = new Date();
    }
    
    await article.update(updateData);
    
    res.json({
      success: true,
      message: '文章更新成功',
      data: article
    });
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新文章失败',
      error: error.message 
    });
  }
});

// 删除文章（管理员接口）
router.delete('/:id', ...adminAuth, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }
    
    await article.destroy();
    
    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '删除文章失败' 
    });
  }
});

// 批量删除文章（管理员接口）
router.post('/batch-delete', ...adminAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供要删除的文章ID' 
      });
    }
    
    const result = await Article.destroy({
      where: {
        id: ids
      }
    });
    
    res.json({
      success: true,
      message: `成功删除${result}篇文章`
    });
  } catch (error) {
    console.error('批量删除文章错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '批量删除文章失败' 
    });
  }
});

// 更新文章状态（管理员接口）
router.patch('/:id/status', ...adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }
    
    const updateData = { status };
    
    // 如果状态改为发布，设置发布日期
    if (status === 'published' && !article.publish_date) {
      updateData.publish_date = new Date();
    }
    
    await article.update(updateData);
    
    res.json({
      success: true,
      message: '文章状态更新成功',
      data: article
    });
  } catch (error) {
    console.error('更新文章状态错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新文章状态失败' 
    });
  }
});

// 点赞文章（公开接口）
router.post('/:id/like', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: '文章不存在' 
      });
    }
    
    await article.increment('likes');
    
    res.json({
      success: true,
      message: '点赞成功',
      data: {
        likes: article.likes + 1
      }
    });
  } catch (error) {
    console.error('点赞文章错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '点赞失败' 
    });
  }
});

// 获取文章分类列表
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Article.findAll({
      attributes: [
        'category',
        [Article.sequelize.fn('COUNT', Article.sequelize.col('id')), 'count']
      ],
      where: {
        status: 'published'
      },
      group: ['category'],
      order: [[Article.sequelize.fn('COUNT', Article.sequelize.col('id')), 'DESC']]
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取文章分类错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取文章分类失败' 
    });
  }
});

export default router;