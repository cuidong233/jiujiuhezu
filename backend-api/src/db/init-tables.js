import pool from './database.js';

export async function initializeTables() {
  console.log('🔄 初始化数据库表...');
  
  const tables = [
    // 用户表
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
    
    // 产品表
    `CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(500),
      category VARCHAR(100),
      stock INT DEFAULT 0,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 订单表
    `CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_no VARCHAR(50) UNIQUE NOT NULL,
      user_id INT,
      product_id INT,
      quantity INT DEFAULT 1,
      total_amount DECIMAL(10, 2),
      payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_product_id (product_id)
    )`
  ];

  try {
    for (const sql of tables) {
      await pool.query(sql);
    }
    
    // 检查是否有管理员账号
    const [admins] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    if (admins[0].count === 0) {
      // 创建默认管理员账号（密码: admin123）
      await pool.query(
        `INSERT INTO users (username, password, email, role, nickname)
         VALUES ('admin', '$2b$10$ZhSD3BPgY.3nYL4yQX.7Fu7FVLt5fOyQHQKzKJURdqXLqT32UTKDW', 'admin@jiujiu.com', 'admin', '管理员')`
      );
      console.log('✅ 创建默认管理员账号 admin/admin123');
    }
    
    console.log('✅ 数据库表初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 初始化数据库表失败:', error.message);
    return false;
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeTables().then(() => process.exit(0));
}