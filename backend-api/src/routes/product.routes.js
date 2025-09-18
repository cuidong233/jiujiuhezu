import express from 'express';
import productService from '../services/productService.js';
import bannerService from '../services/bannerService.js';
import Order from '../models/Order.js';
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import pool from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取轮播图
router.get('/banner', async (req, res) => {
  try {
    const result = await bannerService.getBannerList();

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取轮播图失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取轮播图失败',
      success: false
    });
  }
});

// 获取热门商品
router.get('/goods/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const result = await productService.getHotProducts(limit);

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取热门商品失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取热门商品失败',
      success: false
    });
  }
});

// 获取商品的所有SKU
router.get('/goods/:productId/skus', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await productService.getProductSkus(productId);

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品SKU列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品SKU列表失败',
      success: false
    });
  }
});

// 获取单个SKU详情
router.get('/sku/:skuId', async (req, res) => {
  try {
    const { skuId } = req.params;
    const result = await productService.getSkuDetail(skuId);

    if (!result.success) {
      return res.status(404).json({
        code: 404,
        msg: result.message,
        success: false
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取SKU详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取SKU详情失败',
      success: false
    });
  }
});

// 获取推荐商品  
router.get('/goods/recommend', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const result = await productService.getRecommendProducts(limit);

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取推荐商品失败',
      success: false
    });
  }
});

// 获取商品SKU信息
router.get('/goods/getSkuInfo/:goodsCode', async (req, res) => {
  try {
    const { goodsCode } = req.params;
    const result = await productService.getProductSku(goodsCode);

    if (!result.success) {
      return res.status(404).json({
        code: 404,
        msg: result.message,
        success: false
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品SKU失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品SKU失败',
      success: false
    });
  }
});

// 获取商品库存
router.get('/goods/getSkuResidue/:goodsCode', async (req, res) => {
  try {
    const { goodsCode } = req.params;
    const result = await productService.getProductStock(goodsCode);

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品库存失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品库存失败',
      success: false
    });
  }
});

// 获取商品列表（管理后台使用）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '', categoryId = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        g.id,
        g.category_id as categoryId,
        g.title,
        g.description,
        g.cover_image,
        g.price,
        g.sales,
        g.sort_order,
        g.status,
        g.created_at
      FROM pr_goods g
      WHERE 1=1
    `;
    
    const params = [];
    
    if (keyword) {
      sql += ' AND (g.title LIKE ? OR g.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    if (categoryId) {
      sql += ' AND g.category_id = ?';
      params.push(categoryId);
    }
    
    sql += ' ORDER BY g.sort_order ASC, g.id DESC';
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    const [rows] = await pool.execute(sql, params);
    
    // 获取总数
    let countSql = `
      SELECT COUNT(*) as total 
      FROM pr_goods g
      WHERE 1=1
    `;
    
    if (keyword) {
      countSql += ' AND (g.title LIKE ? OR g.description LIKE ?)';
    }
    
    if (categoryId) {
      countSql += ' AND g.category_id = ?';
    }
    
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品列表失败'
    });
  }
});

// 获取商品列表（前端使用）
router.get('/goods', async (req, res) => {
  try {
    const params = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      category: req.query.category,
      categoryId: req.query.categoryId,
      keyword: req.query.keyword,
      isHot: req.query.isHot === 'true',
      isRecommend: req.query.isRecommend === 'true',
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    // 处理categoryId参数
    if (params.categoryId) {
      params.category = params.categoryId;
    }

    const result = await productService.getProductList(params);

    // 返回符合前端期望的格式
    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品列表失败',
      success: false
    });
  }
});

// 获取商品详情
router.get('/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductDetail(id);

    if (!result.success) {
      return res.status(404).json({
        code: 404,
        msg: result.message,
        success: false
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品详情失败',
      success: false
    });
  }
});

// 获取用户订单列表 - 必须放在 /:id 之前
router.get('/order', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sessionId, userEmail } = req.query;
    const offset = (page - 1) * limit;
    
    const whereCondition = {};
    
    // 必须有用户身份才能查看订单
    if (req.user?.id) {
      // 已登录用户，使用用户ID
      whereCondition.userId = req.user.id;
    } else if (userEmail) {
      // 使用邮箱过滤（需要提供正确的邮箱）
      whereCondition.userEmail = userEmail;
    } else {
      // 未登录用户不能查看订单
      return res.status(401).json({
        code: 401,
        msg: '请先登录后再查看订单',
        success: false
      });
    }
    
    if (status !== undefined) {
      whereCondition.orderStatus = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // 转换数据格式以匹配前端期望
    const formattedOrders = rows.map(order => {
      const orderData = order.toJSON();
      return {
        ...orderData,
        id: orderData.id,
        orderNo: orderData.orderNo,
        goodsName: orderData.productName,
        goodsImage: '/images/xiangqingzhutu1.png', // 默认图片，实际应从商品表获取
        quantity: orderData.quantity,
        totalPrice: orderData.totalAmount,
        payMethod: orderData.paymentMethod,
        status: orderData.paymentStatus === 1 ? 'completed' : 
                orderData.paymentStatus === 0 ? 'pending' : 'cancelled',
        createTime: orderData.createdAt,
        time: orderData.createdAt
      };
    });

    const totalPage = Math.ceil(count / parseInt(limit));

    res.json({
      code: 0,
      msg: 'success',
      data: {
        list: formattedOrders,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pageSize: parseInt(limit),
        totalPage: totalPage
      },
      success: true
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取订单列表失败',
      success: false
    });
  }
});

// 简化的商品详情路由（兼容前端的 /product/:id）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductDetail(id);

    if (!result.success) {
      return res.status(404).json({
        code: 404,
        msg: result.message,
        success: false
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品详情失败',
      success: false
    });
  }
});

// 获取商品分类
router.get('/category', async (req, res) => {
  try {
    const result = await productService.getCategories();

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品分类失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品分类失败',
      success: false
    });
  }
});

// 获取商品SKU信息
router.get('/goods/getSkuInfo/:goodsCode', async (req, res) => {
  try {
    const { goodsCode } = req.params;
    const result = await productService.getProductSku(goodsCode);

    if (!result.success) {
      return res.status(404).json({
        code: 404,
        msg: result.message,
        success: false
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品SKU失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品SKU失败',
      success: false
    });
  }
});

// 获取商品库存
router.get('/goods/getSkuResidue/:goodsCode', async (req, res) => {
  try {
    const { goodsCode } = req.params;
    const result = await productService.getProductStock(goodsCode);

    res.json({
      code: 0,
      msg: 'success',
      data: result.data,
      success: true
    });
  } catch (error) {
    console.error('获取商品库存失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品库存失败',
      success: false
    });
  }
});

// 创建订单（前端购物使用的接口）- 添加认证中间件
router.post('/order/createOrder', authenticate, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      unicode,  // 前端传递的商品编码
      skuId,    // 添加SKU ID参数
      quantity,
      userEmail,
      paymentMethod,
      remark
    } = req.body;

    // 根据商品ID查询商品信息（unicode实际传递的是商品ID）
    const [products] = await pool.execute(
      'SELECT * FROM pr_goods WHERE id = ? AND status = 1',
      [unicode]
    );

    if (!products || products.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        code: 404,
        msg: '商品不存在或已下架',
        success: false
      });
    }

    const product = products[0];
    
    // 检查商品名称是否存在
    if (!product.title) {
      await transaction.rollback();
      return res.status(400).json({
        code: 400,
        msg: '商品信息不完整，请联系管理员',
        success: false
      });
    }

    // 导入折扣模型以应用折扣
    const DiscountActivity = (await import('../models/DiscountActivity.js')).default;
    
    // 如果有SKU ID，查询SKU信息并使用SKU的价格
    let unitPrice = product.price;
    let skuName = '';
    let discountInfo = null;
    
    if (skuId) {
      const [skus] = await pool.execute(
        'SELECT * FROM pr_product_skus WHERE sku_id = ? AND product_id = ? AND status = 1',
        [skuId, product.id]
      );
      
      if (skus && skus.length > 0) {
        const sku = skus[0];
        
        // 检查库存
        if (sku.stock <= 0) {
          await transaction.rollback();
          return res.status(400).json({
            code: 400,
            msg: '该套餐暂时缺货，请选择其他套餐或联系客服',
            success: false
          });
        }
        
        // 检查库存是否足够
        if (sku.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            code: 400,
            msg: `库存不足，当前库存仅剩 ${sku.stock} 件`,
            success: false
          });
        }
        
        unitPrice = sku.price;
        skuName = sku.sku_name;
        console.log(`📦 使用SKU价格: ${skuName} - ¥${unitPrice}`);
        
        // 扣减库存
        await pool.execute(
          'UPDATE pr_product_skus SET stock = stock - ?, sales = sales + ? WHERE sku_id = ? AND stock >= ?',
          [quantity, quantity, skuId, quantity]
        );
      } else {
        console.log(`⚠️ SKU ${skuId} 不存在，使用商品默认价格`);
      }
    }

    // 应用折扣活动
    const now = new Date();
    const activities = await DiscountActivity.findAll({
      where: {
        status: 1,
        start_time: { [Op.lte]: now },
        end_time: { [Op.gte]: now }
      },
      order: [['discount_value', 'DESC']]
    });
    
    let finalPrice = unitPrice;
    let appliedDiscount = null;
    
    // 查找适用的折扣
    for (const activity of activities) {
      // 检查是否适用于所有商品
      if (activity.apply_to_all_products) {
        appliedDiscount = activity;
        break;
      }
      
      // 检查是否适用于特定商品
      if (activity.product_ids && activity.product_ids.includes(product.id)) {
        appliedDiscount = activity;
        break;
      }
      
      // 检查是否适用于特定分类
      if (activity.category_ids && product.category_id && 
          activity.category_ids.includes(product.category_id)) {
        appliedDiscount = activity;
        break;
      }
    }
    
    // 计算折扣后的价格
    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        finalPrice = unitPrice * (appliedDiscount.discount_value / 100);
        discountInfo = `${appliedDiscount.name} (${appliedDiscount.discount_value}折)`;
      } else {
        finalPrice = Math.max(0, unitPrice - appliedDiscount.discount_value);
        discountInfo = `${appliedDiscount.name} (减¥${appliedDiscount.discount_value})`;
      }
      
      // 应用最高优惠限制
      if (appliedDiscount.max_discount_amount) {
        const maxDiscount = parseFloat(appliedDiscount.max_discount_amount);
        const actualDiscount = unitPrice - finalPrice;
        if (actualDiscount > maxDiscount) {
          finalPrice = unitPrice - maxDiscount;
        }
      }
      
      console.log(`🎫 应用折扣: ${discountInfo}, 原价: ¥${unitPrice}, 折后: ¥${finalPrice.toFixed(2)}`);
    }

    // 生成订单号
    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 现在req.user已经通过认证中间件设置好了
    const order = await Order.create({
      orderNo,
      userId: req.user.id,  // 使用认证后的用户ID
      productId: product.id,
      productName: product.title || `商品#${product.id}`,
      sku: skuId ? `${skuId}|${skuName}` : null,  // 保存SKU信息
      quantity: quantity || 1,
      unitPrice: finalPrice,  // 使用折扣后的价格
      totalAmount: (finalPrice * (quantity || 1)).toFixed(2),  // 使用折扣后的价格
      paymentMethod: paymentMethod || null,  // 不设置默认值，等用户支付时再设置
      paymentStatus: 0, // 待支付
      deliveryStatus: 0, // 待发货
      orderStatus: 0, // 待处理
      userEmail: req.user.email || userEmail || '',  // 优先使用登录用户的邮箱
      remark: `${remark ? remark + ' | ' : ''}${skuName ? '套餐: ' + skuName + ' | ' : ''}${discountInfo ? '折扣: ' + discountInfo : ''}`
    }, { transaction });

    await transaction.commit();

    res.json({
      code: 0,
      msg: '订单创建成功',
      data: {
        orderNo: order.orderNo,
        totalAmount: order.totalAmount,
        productName: order.productName
      },
      success: true
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建订单失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '创建订单失败',
      success: false
    });
  }
});


// 获取订单详情
router.get('/order/info/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    const order = await Order.findOne({
      where: { orderNo }
    });
    
    if (!order) {
      return res.status(404).json({
        code: 404,
        msg: '订单不存在',
        success: false
      });
    }

    res.json({
      code: 0,
      msg: 'success',
      data: order,
      success: true
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取订单详情失败',
      success: false
    });
  }
});

// 取消订单
router.post('/order/closeOrder/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    const order = await Order.findOne({
      where: { orderNo }
    });
    
    if (!order) {
      return res.status(404).json({
        code: 404,
        msg: '订单不存在',
        success: false
      });
    }

    // 检查订单状态是否允许取消
    // orderStatus: 0:待处理 1:处理中 2:已完成 3:已取消 4:已退款
    if (order.orderStatus === 3) {
      return res.status(400).json({
        code: 400,
        msg: '订单已经取消',
        success: false
      });
    }

    if (order.orderStatus === 2) {
      return res.status(400).json({
        code: 400,
        msg: '订单已完成，无法取消',
        success: false
      });
    }

    if (order.orderStatus === 4) {
      return res.status(400).json({
        code: 400,
        msg: '订单已退款，无法取消',
        success: false
      });
    }

    // 检查支付状态
    // paymentStatus: 0:待支付 1:已支付 2:支付失败
    if (order.paymentStatus === 1) {
      // 已支付的订单需要特殊处理
      if (order.deliveryStatus === 2) {
        // 已发货的订单不能取消
        return res.status(400).json({
          code: 400,
          msg: '订单已发货，无法取消',
          success: false
        });
      }
      // 已支付但未发货的订单可以取消，但需要后续退款处理
      return res.status(400).json({
        code: 400,
        msg: '订单已支付，请联系客服处理退款',
        success: false
      });
    }

    // 更新订单状态为已取消
    order.orderStatus = 3; // 已取消
    order.remark = (order.remark || '') + ' [用户手动取消订单]';
    await order.save();

    res.json({
      code: 0,
      msg: '订单已取消',
      data: order,
      success: true
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '取消订单失败',
      success: false
    });
  }
});

// 删除商品
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有关联的订单
    const orderCount = await Order.count({
      where: { productId: id }
    });
    
    if (orderCount > 0) {
      return res.status(400).json({
        code: 400,
        msg: `该商品有 ${orderCount} 个关联订单，无法删除`,
        success: false
      });
    }
    
    // 调用服务层删除商品
    const result = await productService.deleteProduct(id);
    
    if (result.success) {
      res.json({
        code: 0,
        msg: '删除成功',
        success: true
      });
    } else {
      res.status(400).json({
        code: 400,
        msg: result.msg || '删除失败',
        success: false
      });
    }
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '删除商品失败',
      success: false
    });
  }
});

export default router;