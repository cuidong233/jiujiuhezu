import express from 'express';
import { sequelize } from '../models/index.js';

const router = express.Router();

// 临时初始化端点 - 部署后删除
router.get('/init-db', async (req, res) => {
  try {
    // 验证密钥，防止误操作
    const key = req.query.key;
    if (key !== 'init2025') {
      return res.status(403).json({ error: 'Invalid key' });
    }

    console.log('开始初始化数据库...');
    
    // 创建表的SQL
    const initSQL = `
      -- 创建用户表
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(100),
        avatar VARCHAR(500),
        phone VARCHAR(20),
        balance DECIMAL(10, 2) DEFAULT 0.00,
        points INT DEFAULT 0,
        role ENUM('user', 'admin', 'vip') DEFAULT 'user',
        status TINYINT DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- 创建分类表  
      CREATE TABLE IF NOT EXISTS categories (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        description TEXT,
        parent_id BIGINT,
        icon VARCHAR(100),
        sort_order INT DEFAULT 0,
        status TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- 创建商品表
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE,
        category_id BIGINT,
        description TEXT,
        content LONGTEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        cost DECIMAL(10, 2),
        stock INT DEFAULT 0,
        sold INT DEFAULT 0,
        views INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        thumbnail VARCHAR(500),
        images JSON,
        video_url VARCHAR(500),
        tags JSON,
        status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_category (category_id)
      );

      -- 创建订单表
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        user_id BIGINT,
        product_id BIGINT,
        product_name VARCHAR(200),
        product_price DECIMAL(10, 2),
        quantity INT DEFAULT 1,
        total_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        payment_time DATETIME,
        transaction_id VARCHAR(100),
        delivery_type VARCHAR(50),
        delivery_content TEXT,
        delivery_status ENUM('pending', 'delivered', 'failed') DEFAULT 'pending',
        delivery_time DATETIME,
        buyer_email VARCHAR(200),
        buyer_phone VARCHAR(20),
        buyer_remark TEXT,
        status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_order_no (order_no),
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status)
      );
    `;

    // 执行SQL
    await sequelize.query(initSQL);

    // 插入测试数据
    const insertSQL = `
      -- 插入默认管理员
      INSERT IGNORE INTO users (username, email, password, nickname, role, balance) 
      VALUES ('admin', 'admin@example.com', '$2b$10$defaultHashedPassword', '管理员', 'admin', 10000.00);

      -- 插入默认分类
      INSERT IGNORE INTO categories (name, slug, description, sort_order) VALUES
      ('数字产品', 'digital', '软件、账号、激活码等数字产品', 1),
      ('实物商品', 'physical', '需要物流配送的实物商品', 2),
      ('虚拟服务', 'service', '在线服务、咨询等虚拟服务', 3);

      -- 插入测试商品
      INSERT IGNORE INTO products (name, slug, category_id, description, price, stock, status) VALUES
      ('测试商品1', 'test-product-1', 1, '这是一个测试商品', 99.99, 100, 'active'),
      ('测试商品2', 'test-product-2', 2, '这是另一个测试商品', 199.99, 50, 'active');
    `;

    await sequelize.query(insertSQL);

    res.json({
      success: true,
      message: '数据库初始化成功！',
      tables: ['users', 'categories', 'products', 'orders'],
      warning: '请立即删除此初始化端点！'
    });

  } catch (error) {
    console.error('初始化失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

export default router;