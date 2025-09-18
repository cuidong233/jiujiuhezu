// PlanetScale 数据库初始化脚本
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initDatabase() {
  console.log('🚀 开始初始化 PlanetScale 数据库...\n');

  // 创建连接
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });

  try {
    // 读取所有 SQL 文件
    const sqlFiles = [
      'create-cart-table.sql',
      'create-banner-table.sql',
      'create-cdk-receipts-table.sql',
      'create-discount-activity-table.sql',
      'create-email-tables.sql',
      'create-sku-tables-fixed.sql',
      'migrations/create_articles_table.sql',
      'migrations/create_favorites_cart_tables.sql'
    ];

    console.log('📁 找到以下 SQL 文件：');
    sqlFiles.forEach(file => console.log(`  - ${file}`));
    console.log();

    for (const sqlFile of sqlFiles) {
      const filePath = path.join(process.cwd(), sqlFile.includes('migrations/') ? sqlFile : sqlFile);
      
      if (fs.existsSync(filePath)) {
        console.log(`执行: ${sqlFile}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        try {
          await connection.query(sql);
          console.log(`✅ 成功: ${sqlFile}`);
        } catch (err) {
          if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⏭️  跳过: ${sqlFile} (表已存在)`);
          } else {
            console.log(`⚠️  警告: ${sqlFile} - ${err.message}`);
          }
        }
      } else {
        console.log(`❌ 文件不存在: ${filePath}`);
      }
    }

    // 创建基础表
    console.log('\n📊 创建基础表结构...\n');

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        avatar VARCHAR(500),
        nickname VARCHAR(50),
        balance DECIMAL(10, 2) DEFAULT 0.00,
        phone VARCHAR(20),
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        long_description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        image VARCHAR(500),
        images JSON,
        category VARCHAR(100),
        tags JSON,
        stock INT DEFAULT 0,
        sales INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0.00,
        review_count INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        user_id INT,
        product_id INT,
        product_name VARCHAR(255),
        product_image VARCHAR(500),
        quantity INT DEFAULT 1,
        price DECIMAL(10, 2),
        total_amount DECIMAL(10, 2),
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        delivery_status ENUM('pending', 'delivered', 'failed') DEFAULT 'pending',
        delivery_content TEXT,
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        description TEXT,
        icon VARCHAR(255),
        parent_id INT,
        sort_order INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        title VARCHAR(255),
        content TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      try {
        await connection.query(table);
        const tableName = table.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
        console.log(`✅ 表创建成功: ${tableName}`);
      } catch (err) {
        console.error(`❌ 表创建失败:`, err.message);
      }
    }

    // 插入测试数据
    console.log('\n🌱 插入初始数据...\n');

    // 创建管理员账号
    await connection.query(`
      INSERT IGNORE INTO users (username, password, email, role, nickname)
      VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin@example.com', 'admin', '管理员')
    `);
    console.log('✅ 管理员账号创建成功');

    // 插入示例产品
    await connection.query(`
      INSERT IGNORE INTO products (name, description, price, category, stock)
      VALUES 
        ('Netflix Premium', 'Netflix 高级会员账号', 99.00, 'streaming', 100),
        ('Disney+ 年费会员', 'Disney+ 一年期会员', 299.00, 'streaming', 50),
        ('Apple TV+ 月费', 'Apple TV+ 月度订阅', 39.00, 'streaming', 200)
    `);
    console.log('✅ 示例产品添加成功');

    console.log('\n✨ 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 运行初始化
initDatabase().catch(console.error);