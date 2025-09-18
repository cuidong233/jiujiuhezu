import express from 'express';
import pool from '../db/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置图片上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp）'));
    }
  }
});

// 商品管理接口

// 获取商品列表（分页）
router.get('/product/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '', categoryId = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        g.id,
        g.category_id as categoryId,
        g.title,
        g.keywords,
        g.description,
        g.cover_image as image,
        g.price,
        g.sales,
        g.sort_order as order_num,
        g.goods_code,
        g.status,
        g.sku_info as skus,
        g.tags,
        g.delivery_mode,
        g.auto_delivery_limit,
        g.delivery_requires_receipt,
        g.receipt_fields,
        g.email_enabled,
        g.email_subject,
        g.email_template,
        g.created_at as create_time,
        '' as categoryName
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

// 添加商品
router.post('/product/add', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      categoryId,
      title,
      keywords,
      description,
      image,
      price,
      goodsCode,
      tags,
      orderNum = 0,
      status = 1,
      specifications,
      skus,
      delivery_mode = 'auto',
      auto_delivery_limit = 10,
      email_enabled = true,
      email_subject = '',
      email_template = '',
      receipt_fields = null
    } = req.body;
    
    // 验证必填字段
    if (!title || title.trim() === '') {
      return res.status(400).json({
        code: 400,
        msg: '商品名称不能为空'
      });
    }
    
    if (!price || price <= 0) {
      return res.status(400).json({
        code: 400,
        msg: '商品价格必须大于0'
      });
    }
    
    await connection.beginTransaction();
    
    // 数据验证：如果是代充商品，强制使用手动发货
    let finalDeliveryMode = delivery_mode;
    if (req.body.delivery_requires_receipt || req.body.deliveryRequiresReceipt) {
      finalDeliveryMode = 'manual';
      console.log('代充商品自动设置为手动发货模式');
    }
    
    // 插入商品基本信息
    const sql = `
      INSERT INTO pr_goods (
        category_id, title, description, 
        cover_image, price, 
        sort_order, status, sales, sku_info, goods_code, keywords, tags,
        delivery_mode, auto_delivery_limit, email_enabled, email_subject, email_template,
        delivery_requires_receipt, receipt_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      categoryId || null,
      title,
      description || '',
      image || '/images/netflix.png',
      price,
      orderNum || 0,
      status,
      null, // sku_info 字段暂时不用
      goodsCode || `PROD_${Date.now()}`,
      keywords || title,
      tags || '',
      finalDeliveryMode,
      auto_delivery_limit,
      email_enabled,
      email_subject,
      email_template,
      req.body.delivery_requires_receipt || req.body.deliveryRequiresReceipt || false,
      receipt_fields || null
    ];
    
    const [result] = await connection.execute(sql, params);
    const productId = result.insertId;
    
    // 保存SKU信息
    if (specifications && specifications !== '[]' && specifications !== '') {
      const specsData = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      const skusData = typeof skus === 'string' ? JSON.parse(skus) : skus;
      
      if (specsData && specsData.length > 0) {
        // 保存规格信息
        await connection.execute(
          'INSERT INTO pr_product_specifications (product_id, specifications) VALUES (?, ?)',
          [productId, JSON.stringify(specsData)]
        );
        
        // 保存SKU信息
        if (skusData && skusData.length > 0) {
          for (const sku of skusData) {
            await connection.execute(
              `INSERT INTO pr_product_skus (
                product_id, sku_id, sku_name, attributes, price, stock, 
                expire_days, sku_description, license_count, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                productId,
                sku.skuId || `SKU_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sku.skuName || '',
                JSON.stringify(sku.attributes || {}),
                sku.price || 0,
                sku.stock || 0,
                sku.expireDays || null,
                sku.skuDescription || '',
                sku.licenseCount || 1,
                sku.status !== undefined ? sku.status : 1
              ]
            );
          }
          
          // 更新商品的最低价格
          const minPrice = Math.min(...skusData.map(s => s.price || 0));
          if (minPrice > 0) {
            await connection.execute(
              'UPDATE pr_goods SET price = ? WHERE id = ?',
              [minPrice, productId]
            );
          }
        }
      }
    }
    
    await connection.commit();
    
    res.json({
      code: 0,
      msg: '商品添加成功',
      data: {
        id: productId
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('添加商品失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '添加商品失败'
    });
  } finally {
    connection.release();
  }
});

// 更新商品
router.put('/product/update/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      categoryId,
      title,
      keywords,
      description,
      image,
      price,
      goodsCode,
      tags,
      orderNum,
      status,
      specifications,
      skus,
      delivery_mode = 'auto',
      auto_delivery_limit = 10,
      email_enabled = true,
      email_subject = '',
      email_template = '',
      receipt_fields = null
    } = req.body;
    
    // 验证必填字段
    if (!title || title.trim() === '') {
      return res.status(400).json({
        code: 400,
        msg: '商品名称不能为空'
      });
    }
    
    if (!price || price <= 0) {
      return res.status(400).json({
        code: 400,
        msg: '商品价格必须大于0'
      });
    }
    
    await connection.beginTransaction();
    
    // 数据验证：如果是代充商品，强制使用手动发货
    let finalDeliveryMode = delivery_mode;
    if (req.body.delivery_requires_receipt || req.body.deliveryRequiresReceipt) {
      finalDeliveryMode = 'manual';
      console.log('代充商品自动设置为手动发货模式');
    }
    
    // 更新商品基本信息
    const sql = `
      UPDATE pr_goods SET
        category_id = ?,
        title = ?,
        description = ?,
        cover_image = ?,
        price = ?,
        sort_order = ?,
        status = ?,
        goods_code = ?,
        keywords = ?,
        tags = ?,
        delivery_mode = ?,
        auto_delivery_limit = ?,
        email_enabled = ?,
        email_subject = ?,
        email_template = ?,
        delivery_requires_receipt = ?,
        receipt_fields = ?
      WHERE id = ?
    `;
    
    const params = [
      categoryId || null,
      title,
      description || '',
      image || '/images/netflix.png',
      price,
      orderNum || 0,
      status || 1,
      goodsCode || `PROD_${id}`,
      keywords || title,
      tags || '',
      finalDeliveryMode,
      auto_delivery_limit,
      email_enabled,
      email_subject,
      email_template,
      req.body.delivery_requires_receipt || req.body.deliveryRequiresReceipt || false,
      receipt_fields || null,
      id
    ];
    
    await connection.execute(sql, params);
    
    // 删除旧的SKU数据
    await connection.execute('DELETE FROM pr_product_skus WHERE product_id = ?', [id]);
    await connection.execute('DELETE FROM pr_product_specifications WHERE product_id = ?', [id]);
    
    // 保存新的SKU信息
    if (specifications && specifications !== '[]' && specifications !== '') {
      const specsData = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      const skusData = typeof skus === 'string' ? JSON.parse(skus) : skus;
      
      if (specsData && specsData.length > 0) {
        // 保存规格信息
        await connection.execute(
          'INSERT INTO pr_product_specifications (product_id, specifications) VALUES (?, ?)',
          [id, JSON.stringify(specsData)]
        );
        
        // 保存SKU信息
        if (skusData && skusData.length > 0) {
          for (const sku of skusData) {
            await connection.execute(
              `INSERT INTO pr_product_skus (
                product_id, sku_id, sku_name, attributes, price, stock, 
                expire_days, sku_description, license_count, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                sku.skuId || `SKU_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sku.skuName || '',
                JSON.stringify(sku.attributes || {}),
                sku.price || 0,
                sku.stock || 0,
                sku.expireDays || null,
                sku.skuDescription || '',
                sku.licenseCount || 1,
                sku.status !== undefined ? sku.status : 1
              ]
            );
          }
          
          // 更新商品的最低价格
          const minPrice = Math.min(...skusData.map(s => s.price || 0));
          if (minPrice > 0) {
            await connection.execute(
              'UPDATE pr_goods SET price = ? WHERE id = ?',
              [minPrice, id]
            );
          }
        }
      }
    }
    
    await connection.commit();
    
    res.json({
      code: 0,
      msg: '商品更新成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('更新商品失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '更新商品失败'
    });
  } finally {
    connection.release();
  }
});

// 删除商品
router.delete('/product/delete/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    // 参数验证
    if (!id || isNaN(id)) {
      return res.status(400).json({
        code: 400,
        msg: '无效的商品ID'
      });
    }
    
    console.log(`开始删除商品，ID: ${id}`);
    
    await connection.beginTransaction();
    
    // 1. 查询商品信息，包括更多详细信息用于日志记录
    const [products] = await connection.execute(
      'SELECT id, goods_code, title, price FROM pr_goods WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      console.log(`商品不存在，ID: ${id}`);
      return res.status(404).json({
        code: 404,
        msg: '商品不存在'
      });
    }
    
    const product = products[0];
    const goodsCode = product.goods_code;
    console.log(`准备删除商品: ${product.title} (ID: ${id}, Code: ${goodsCode})`);
    
    // 2. 检查关联的未完成订单（重要：防止删除有效交易的商品）
    // 订单状态：0:待处理 1:处理中 2:已完成 3:已取消 4:已退款
    // 只有状态 0 和 1 才是未完成订单
    const [activeOrders] = await connection.execute(
      `SELECT COUNT(*) as count FROM \`order\` 
       WHERE product_id = ? 
       AND order_status IN (0, 1)`,
      [id]
    );
    
    if (activeOrders[0].count > 0) {
      await connection.rollback();
      console.log(`商品有未完成订单，无法删除。商品ID: ${id}, 订单数: ${activeOrders[0].count}`);
      return res.status(400).json({
        code: 400,
        msg: `该商品有 ${activeOrders[0].count} 个未完成的订单，请先处理这些订单后再删除商品`
      });
    }
    
    // 3. 检查并记录要删除的关联数据数量
    // 检查两个可能的关联字段：goods_code 和 product_id
    const [cdkCountByCode] = await connection.execute(
      'SELECT COUNT(*) as count FROM pr_goods_cdkey WHERE goods_code = ?',
      [goodsCode]
    );
    
    const [cdkCountById] = await connection.execute(
      'SELECT COUNT(*) as count FROM pr_goods_cdkey WHERE product_id = ?',
      [id]
    );
    
    const cdkCount = [{count: cdkCountByCode[0].count + cdkCountById[0].count}];
    
    const [skuCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM pr_product_skus WHERE product_id = ?',
      [id]
    );
    
    const [specCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM pr_product_specifications WHERE product_id = ?',
      [id]
    );
    
    console.log(`关联数据统计 - CDK: ${cdkCount[0].count}, SKU: ${skuCount[0].count}, 规格: ${specCount[0].count}`);
    
    // 4. 按照正确的顺序删除所有关联数据
    
    // 删除CDK数据（两种关联方式都要处理）
    if (cdkCount[0].count > 0) {
      // 先删除通过product_id关联的CDK
      const [cdkResult1] = await connection.execute(
        'DELETE FROM pr_goods_cdkey WHERE product_id = ?',
        [id]
      );
      
      // 再删除通过goods_code关联的CDK
      const [cdkResult2] = await connection.execute(
        'DELETE FROM pr_goods_cdkey WHERE goods_code = ?',
        [goodsCode]
      );
      
      const totalDeleted = cdkResult1.affectedRows + cdkResult2.affectedRows;
      console.log(`已删除 ${totalDeleted} 条CDK记录`);
    }
    
    // 删除SKU数据
    if (skuCount[0].count > 0) {
      const [skuResult] = await connection.execute(
        'DELETE FROM pr_product_skus WHERE product_id = ?',
        [id]
      );
      console.log(`已删除 ${skuResult.affectedRows} 条SKU记录`);
    }
    
    // 删除规格数据
    if (specCount[0].count > 0) {
      const [specResult] = await connection.execute(
        'DELETE FROM pr_product_specifications WHERE product_id = ?',
        [id]
      );
      console.log(`已删除 ${specResult.affectedRows} 条规格记录`);
    }
    
    // 5. 历史订单保留记录，不做修改（用于数据分析和审计）
    // 已完成、已取消、已退款的订单仍保留product_id引用
    
    // 6. 最后删除商品主记录
    const [deleteResult] = await connection.execute(
      'DELETE FROM pr_goods WHERE id = ?',
      [id]
    );
    
    if (deleteResult.affectedRows === 0) {
      throw new Error('删除商品主记录失败');
    }
    
    // 7. 提交事务
    await connection.commit();
    
    console.log(`商品删除成功: ${product.title} (ID: ${id})`);
    
    // 返回详细的删除结果
    res.json({
      code: 0,
      msg: '商品删除成功',
      data: {
        deletedProduct: {
          id: product.id,
          title: product.title,
          goodsCode: product.goods_code
        },
        deletedRelations: {
          cdkeys: cdkCount[0].count,
          skus: skuCount[0].count,
          specifications: specCount[0].count
        }
      }
    });
    
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    
    // 详细的错误日志
    console.error('删除商品失败:', {
      productId: req.params.id,
      error: error.message,
      stack: error.stack,
      sqlMessage: error.sqlMessage || '',
      sqlState: error.sqlState || '',
      errno: error.errno || ''
    });
    
    // 根据不同的错误类型返回更具体的错误信息
    let errorMessage = '删除商品失败';
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      errorMessage = '该商品存在其他关联数据，无法删除';
    } else if (error.code === 'ER_LOCK_DEADLOCK') {
      errorMessage = '数据库操作冲突，请稍后重试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      code: 500,
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        errno: error.errno
      } : undefined
    });
  } finally {
    // 确保连接被释放
    connection.release();
  }
});

// 获取商品详情
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        g.*,
        c.category_name as categoryName
      FROM pr_goods g
      LEFT JOIN pr_category c ON g.category_code = c.id
      WHERE g.id = ?
    `;
    
    const [rows] = await pool.execute(sql, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        msg: '商品不存在'
      });
    }
    
    res.json({
      code: 0,
      msg: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取商品详情失败'
    });
  }
});

// 批量更新商品状态
router.post('/product/status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        msg: '请选择要操作的商品'
      });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `UPDATE pr_goods SET status = ? WHERE id IN (${placeholders})`;
    
    await pool.execute(sql, [status, ...ids]);
    
    res.json({
      code: 0,
      msg: status === 1 ? '商品上架成功' : '商品下架成功'
    });
  } catch (error) {
    console.error('更新商品状态失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '更新商品状态失败'
    });
  }
});

// 获取分类列表
router.get('/category/list', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, category_name as name, sort_order as order_num FROM pr_category ORDER BY sort_order ASC'
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取分类列表失败'
    });
  }
});

// 获取商品SKU信息
router.get('/product/skus/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // 获取商品的规格和SKU信息
    const [specifications] = await pool.execute(
      'SELECT specifications FROM pr_product_specifications WHERE product_id = ?',
      [productId]
    );
    
    const [skus] = await pool.execute(
      'SELECT * FROM pr_product_skus WHERE product_id = ? ORDER BY id',
      [productId]
    );
    
    res.json({
      code: 0,
      msg: 'success',
      data: {
        specifications: specifications[0]?.specifications || '[]',
        skus: skus.map(sku => ({
          skuId: sku.sku_id,
          skuName: sku.sku_name,
          attributes: sku.attributes,
          price: parseFloat(sku.price),
          stock: sku.stock,
          expireDays: sku.expire_days,
          skuDescription: sku.sku_description,
          licenseCount: sku.license_count,
          status: sku.status
        }))
      }
    });
  } catch (error) {
    console.error('获取SKU信息失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '获取SKU信息失败'
    });
  }
});

// 保存商品SKU信息
router.post('/product/skus/:productId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { productId } = req.params;
    const { specifications, skus } = req.body;
    
    await connection.beginTransaction();
    
    // 删除旧的SKU数据
    await connection.execute('DELETE FROM pr_product_skus WHERE product_id = ?', [productId]);
    await connection.execute('DELETE FROM pr_product_specifications WHERE product_id = ?', [productId]);
    
    // 保存规格信息
    if (specifications && specifications.length > 0) {
      await connection.execute(
        'INSERT INTO pr_product_specifications (product_id, specifications) VALUES (?, ?)',
        [productId, JSON.stringify(specifications)]
      );
      
      // 保存SKU信息
      if (skus && skus.length > 0) {
        for (const sku of skus) {
          await connection.execute(
            `INSERT INTO pr_product_skus (
              product_id, sku_id, sku_name, attributes, price, stock, 
              expire_days, sku_description, license_count, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              sku.skuId || `SKU_${productId}_${Date.now()}`,
              sku.skuName || '',
              JSON.stringify(sku.attributes || {}),
              sku.price || 0,
              sku.stock || 0,
              sku.expireDays || null,
              sku.skuDescription || '',
              sku.licenseCount || 1,
              sku.status !== undefined ? sku.status : 1
            ]
          );
        }
        
        // 更新商品的最低价格
        const minPrice = Math.min(...skus.map(s => s.price || 0));
        if (minPrice > 0) {
          await connection.execute(
            'UPDATE pr_goods SET price = ? WHERE id = ?',
            [minPrice, productId]
          );
        }
      }
    }
    
    await connection.commit();
    
    res.json({
      code: 0,
      msg: 'SKU信息保存成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存SKU信息失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '保存SKU信息失败'
    });
  } finally {
    connection.release();
  }
});

// 上传商品图片接口
router.post('/product/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '请选择要上传的文件'
      });
    }
    
    // 返回图片访问URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      code: 0,
      msg: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '上传图片失败'
    });
  }
});

// 回执单管理接口

// 获取订单的回执单信息
router.get('/receipt/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    // 查询订单和回执单信息
    const [orderRows] = await pool.execute(
      `SELECT o.*, g.name as product_name, g.receipt_fields
       FROM \`order\` o
       LEFT JOIN pr_goods g ON o.goods_id = g.id
       WHERE o.order_no = ?`,
      [orderNo]
    );
    
    if (orderRows.length === 0) {
      return res.status(404).json({
        code: 404,
        msg: '订单不存在'
      });
    }
    
    const order = orderRows[0];
    
    // 查询回执单信息
    const [receiptRows] = await pool.execute(
      `SELECT * FROM pr_cdk_receipts WHERE order_no = ?`,
      [orderNo]
    );
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        order: order,
        receipt: receiptRows.length > 0 ? receiptRows[0] : null,
        fields: order.receipt_fields || null
      }
    });
  } catch (error) {
    console.error('获取回执单失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取回执单失败'
    });
  }
});

// 更新回执单信息
router.put('/receipt/:orderNo', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { orderNo } = req.params;
    const { receiptData, adminNote, modifiedBy } = req.body;
    
    await connection.beginTransaction();
    
    // 查询现有回执单
    const [existing] = await connection.execute(
      `SELECT * FROM pr_cdk_receipts WHERE order_no = ?`,
      [orderNo]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        code: 404,
        msg: '回执单不存在'
      });
    }
    
    const currentReceipt = existing[0];
    const now = new Date();
    
    // 构建修改历史记录
    const modificationHistory = currentReceipt.modification_history ? 
      JSON.parse(currentReceipt.modification_history) : [];
    
    modificationHistory.push({
      timestamp: now.toISOString(),
      modifiedBy: modifiedBy || 'admin',
      previousData: currentReceipt.receipt_data,
      newData: receiptData,
      note: adminNote || ''
    });
    
    // 更新回执单
    await connection.execute(
      `UPDATE pr_cdk_receipts 
       SET receipt_data = ?,
           last_modified = ?,
           modified_by = ?,
           modification_history = ?
       WHERE order_no = ?`,
      [
        JSON.stringify(receiptData),
        now,
        modifiedBy || 'admin',
        JSON.stringify(modificationHistory),
        orderNo
      ]
    );
    
    await connection.commit();
    
    res.json({
      code: 0,
      msg: '更新成功',
      data: {
        orderNo,
        receiptData,
        lastModified: now
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('更新回执单失败:', error);
    res.status(500).json({
      code: 500,
      msg: '更新回执单失败'
    });
  } finally {
    connection.release();
  }
});

// 获取回执单修改历史
router.get('/receipt/:orderNo/history', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT modification_history FROM pr_cdk_receipts WHERE order_no = ?`,
      [orderNo]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        msg: '回执单不存在'
      });
    }
    
    const history = rows[0].modification_history ? 
      JSON.parse(rows[0].modification_history) : [];
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: history
    });
  } catch (error) {
    console.error('获取修改历史失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取修改历史失败'
    });
  }
});

// 批量获取有回执单的订单
router.get('/receipts/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', keyword = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        r.*,
        o.order_no,
        o.goods_name,
        o.user_id,
        o.order_status,
        o.create_date as order_date,
        g.name as product_name
      FROM pr_cdk_receipts r
      LEFT JOIN \`order\` o ON r.order_no = o.order_no
      LEFT JOIN pr_goods g ON o.goods_id = g.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    
    if (keyword) {
      sql += ' AND (r.order_no LIKE ? OR o.goods_name LIKE ? OR o.user_id LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    // 获取总数
    let countSql = sql.replace(
      'SELECT r.*, o.order_no, o.goods_name, o.user_id, o.order_status, o.create_date as order_date, g.name as product_name',
      'SELECT COUNT(*) as total'
    );
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;
    
    // 添加排序和分页
    sql += ' ORDER BY r.created_at DESC';
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        list: rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取回执单列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取回执单列表失败'
    });
  }
});

export default router;