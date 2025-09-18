import pool from '../db/database.js';

export const productService = {
  // 获取商品列表
  async getProductList(params = {}) {
    const {
      page = 1,
      limit = 10,
      category = null,
      keyword = null,
      isHot = false,
      isRecommend = false,
      sortBy = 'order_num',
      sortOrder = 'ASC'
    } = params;

    try {
      let sql = `
        SELECT 
          g.id,
          g.category_id as categoryId,
          g.title,
          g.title as name,
          g.keywords,
          g.description,
          g.cover_image as image,
          g.price,
          g.sales,
          g.goods_code,
          g.status,
          g.tags,
          g.spec as add_unit,
          c.category_name as categoryName,
          (SELECT MIN(s.price) 
           FROM pr_product_skus s 
           WHERE s.product_id = g.id 
           AND s.status = 1 
           AND s.stock > 0) as min_sku_price
        FROM pr_goods g
        LEFT JOIN pr_category c ON g.category_id = c.id
        WHERE g.status = 1
      `;

      const conditions = [];
      const values = [];

      if (category) {
        conditions.push('g.category_id = ?');
        values.push(category);
      }

      if (keyword) {
        conditions.push('(g.title LIKE ? OR g.keywords LIKE ? OR g.description LIKE ?)');
        values.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      }

      if (isHot) {
        conditions.push("g.tags LIKE '%热卖%'");
      }

      if (isRecommend) {
        conditions.push("g.tags LIKE '%推荐%'");
      }

      if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
      }

      // 排序
      const allowedSortFields = ['price', 'sales', 'created_at', 'sort_order'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'sort_order';
      const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
      
      sql += ` ORDER BY g.${safeSortBy} ${safeSortOrder}`;

      // 分页
      const offset = (page - 1) * limit;
      sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

      // 执行查询
      const [rows] = await pool.execute(sql, values);

      // 获取总数
      let countSql = `
        SELECT COUNT(*) as total
        FROM pr_goods g
        WHERE g.status = 1
      `;

      if (conditions.length > 0) {
        countSql += ' AND ' + conditions.join(' AND ');
      }

      const countValues = values; // 不需要移除值，因为没有添加到values中
      const [countResult] = await pool.execute(countSql, countValues);
      const total = countResult[0].total;

      return {
        success: true,
        data: rows,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('获取商品列表失败:', error);
      throw error;
    }
  },

  // 获取商品详情
  async getProductDetail(id) {
    try {
      const sql = `
        SELECT 
          g.id,
          g.category_id as categoryId,
          g.title,
          g.title as name,
          g.keywords,
          g.description,
          g.cover_image as image,
          g.price,
          g.sales,
          g.goods_code,
          g.status,
          g.tags,
          g.tags as coupon_state,
          g.spec as add_state,
          g.spec as add_unit,
          g.delivery_requires_receipt as deliveryRequiresReceipt,
          c.category_name as categoryName,
          (SELECT MIN(s.price) 
           FROM pr_product_skus s 
           WHERE s.product_id = g.id 
           AND s.status = 1 
           AND s.stock > 0) as min_sku_price
        FROM pr_goods g
        LEFT JOIN pr_category c ON g.category_id = c.id
        WHERE g.id = ? AND g.status = 1
      `;

      const [rows] = await pool.execute(sql, [id]);

      if (rows.length === 0) {
        return {
          success: false,
          message: '商品不存在'
        };
      }

      // 获取商品的CDK库存信息
      const cdkSql = `
        SELECT COUNT(*) as available_stock
        FROM pr_goods_cdkey
        WHERE goods_code = ? AND cdkey_status = 0
      `;
      const [cdkRows] = await pool.execute(cdkSql, [rows[0].goods_code]);
      
      rows[0].stock = cdkRows[0].available_stock;

      return {
        success: true,
        data: rows[0]
      };
    } catch (error) {
      console.error('获取商品详情失败:', error);
      throw error;
    }
  },

  // 获取热门商品
  async getHotProducts(limit = 8) {
    try {
      const sql = `
        SELECT 
          g.id,
          g.category_id as categoryId,
          g.title,
          g.title as name,
          g.keywords,
          g.description,
          g.cover_image as image,
          g.price,
          g.sales,
          g.goods_code,
          g.status,
          g.tags,
          g.spec as add_unit,
          c.category_name as categoryName,
          (SELECT MIN(s.price) 
           FROM pr_product_skus s 
           WHERE s.product_id = g.id 
           AND s.status = 1 
           AND s.stock > 0) as min_sku_price
        FROM pr_goods g
        LEFT JOIN pr_category c ON g.category_id = c.id
        WHERE g.status = 1 AND g.tags LIKE '%热卖%'
        ORDER BY g.sales DESC
        LIMIT ?
      `;

      const [rows] = await pool.execute(sql, [limit]);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('获取热门商品失败:', error);
      throw error;
    }
  },

  // 获取推荐商品
  async getRecommendProducts(limit = 8) {
    try {
      const sql = `
        SELECT 
          g.id,
          g.category_id as categoryId,
          g.title,
          g.title as name,
          g.keywords,
          g.description,
          g.cover_image as image,
          g.price,
          g.sales,
          g.goods_code,
          g.status,
          g.tags,
          g.spec as add_unit,
          c.category_name as categoryName
        FROM pr_goods g
        LEFT JOIN pr_category c ON g.category_id = c.id
        WHERE g.status = 1
        ORDER BY g.sort_order ASC, g.sales DESC
        LIMIT ?
      `;

      const [rows] = await pool.execute(sql, [limit]);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('获取推荐商品失败:', error);
      throw error;
    }
  },

  // 获取商品分类
  async getCategories() {
    try {
      const sql = `
        SELECT 
          id,
          category_name as name,
          order_num
        FROM pr_category
        ORDER BY order_num ASC
      `;

      const [rows] = await pool.execute(sql);

      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('获取商品分类失败:', error);
      throw error;
    }
  },

  // 获取商品SKU信息（新版本）
  async getProductSkus(productId) {
    try {
      console.log(`🔍 获取商品 ${productId} 的SKU信息`);
      
      const sql = `
        SELECT 
          s.id,
          s.sku_id,
          s.sku_name,
          s.attributes,
          s.price,
          s.stock,
          s.expire_days,
          s.sku_description,
          s.license_count,
          s.status,
          s.sales
        FROM pr_product_skus s
        WHERE s.product_id = ? AND s.status = 1
        ORDER BY s.price ASC
      `;

      const [skus] = await pool.execute(sql, [productId]);
      console.log(`📦 从数据库获取到 ${skus.length} 个SKU`);

      // 获取商品规格定义
      const specSql = `
        SELECT specifications
        FROM pr_product_specifications
        WHERE product_id = ?
      `;
      const [specRows] = await pool.execute(specSql, [productId]);

      return {
        success: true,
        data: {
          specifications: specRows.length > 0 ? specRows[0].specifications : null,
          skus: skus
        }
      };
    } catch (error) {
      console.error('获取商品SKU失败:', error);
      throw error;
    }
  },

  // 获取单个SKU详情
  async getSkuDetail(skuId) {
    try {
      const sql = `
        SELECT 
          s.*,
          p.title as product_name,
          p.cover_image as product_image
        FROM pr_product_skus s
        LEFT JOIN pr_goods p ON s.product_id = p.id
        WHERE s.sku_id = ? AND s.status = 1
      `;

      const [rows] = await pool.execute(sql, [skuId]);

      if (rows.length === 0) {
        return {
          success: false,
          message: 'SKU不存在或已下架'
        };
      }

      return {
        success: true,
        data: rows[0]
      };
    } catch (error) {
      console.error('获取SKU详情失败:', error);
      throw error;
    }
  },

  // 更新SKU库存
  async updateSkuStock(skuId, quantity, operation = 'decrease') {
    try {
      let sql;
      if (operation === 'decrease') {
        sql = `
          UPDATE pr_product_skus 
          SET stock = stock - ?, sales = sales + ?
          WHERE sku_id = ? AND stock >= ?
        `;
        const [result] = await pool.execute(sql, [quantity, quantity, skuId, quantity]);
        
        if (result.affectedRows === 0) {
          return {
            success: false,
            message: '库存不足'
          };
        }
      } else {
        sql = `
          UPDATE pr_product_skus 
          SET stock = stock + ?
          WHERE sku_id = ?
        `;
        await pool.execute(sql, [quantity, skuId]);
      }

      return {
        success: true,
        message: '库存更新成功'
      };
    } catch (error) {
      console.error('更新SKU库存失败:', error);
      throw error;
    }
  },

  // 获取商品SKU信息（兼容旧版本）
  async getProductSku(goodsCode) {
    try {
      const sql = `
        SELECT 
          id,
          goods_code,
          cdkey,
          inventory,
          auto_delivery,
          attr
        FROM pr_goods_cdkey
        WHERE goods_code = ? AND cdkey_status = 0 AND is_show = 1
        LIMIT 1
      `;

      const [rows] = await pool.execute(sql, [goodsCode]);

      if (rows.length === 0) {
        return {
          success: false,
          message: '商品暂无库存'
        };
      }

      return {
        success: true,
        data: rows[0]
      };
    } catch (error) {
      console.error('获取商品SKU失败:', error);
      throw error;
    }
  },

  // 获取商品库存
  async getProductStock(goodsCode) {
    try {
      const sql = `
        SELECT COUNT(*) as stock
        FROM pr_goods_cdkey
        WHERE goods_code = ? AND cdkey_status = 0
      `;

      const [rows] = await pool.execute(sql, [goodsCode]);

      return {
        success: true,
        data: rows[0].stock
      };
    } catch (error) {
      console.error('获取商品库存失败:', error);
      throw error;
    }
  },

  // 删除商品
  async deleteProduct(productId) {
    try {
      // 先查询商品的goods_code
      const selectSql = `SELECT goods_code FROM pr_goods WHERE id = ?`;
      const [rows] = await pool.execute(selectSql, [productId]);
      
      if (rows.length === 0) {
        return {
          success: false,
          msg: '商品不存在'
        };
      }
      
      const goodsCode = rows[0].goods_code;
      
      // 删除相关的CDK记录（如果有）
      if (goodsCode) {
        const cdkSql = `DELETE FROM pr_goods_cdkey WHERE goods_code = ?`;
        await pool.execute(cdkSql, [goodsCode]);
      }
      
      // 从pr_goods表删除商品
      const sql = `DELETE FROM pr_goods WHERE id = ?`;
      const [result] = await pool.execute(sql, [productId]);

      if (result.affectedRows > 0) {
        return {
          success: true,
          msg: '商品删除成功'
        };
      } else {
        return {
          success: false,
          msg: '删除商品失败'
        };
      }
    } catch (error) {
      console.error('删除商品失败:', error);
      return {
        success: false,
        msg: error.message || '删除商品失败'
      };
    }
  }
};

export default productService;