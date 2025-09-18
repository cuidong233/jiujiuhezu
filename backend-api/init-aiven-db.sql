-- Aiven MySQL 数据库初始化脚本
-- 在 Aiven Query Editor 中运行此脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS jiujiu_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jiujiu_admin;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 产品表
CREATE TABLE IF NOT EXISTS products (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
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
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    parent_id INT,
    sort_order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255),
    content TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 购物车表
CREATE TABLE IF NOT EXISTS cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始数据
-- 管理员账号（密码: admin123）
INSERT IGNORE INTO users (username, password, email, role, nickname, balance)
VALUES ('admin', '$2b$10$ZhSD3BPgY.3nYL4yQX.7Fu7FVLt5fOyQHQKzKJURdqXLqT32UTKDW', 'admin@example.com', 'admin', '管理员', 0);

-- 测试用户（密码: user123）
INSERT IGNORE INTO users (username, password, email, role, nickname, balance)
VALUES ('testuser', '$2b$10$YourHashedPasswordHere', 'user@example.com', 'user', '测试用户', 100.00);

-- 示例产品
INSERT IGNORE INTO products (name, description, price, original_price, category, stock, status)
VALUES 
    ('Netflix Premium 会员', 'Netflix 高级会员账号，支持4K超高清', 99.00, 129.00, 'streaming', 100, 'active'),
    ('Disney+ 年费会员', 'Disney+ 一年期会员，海量迪士尼内容', 299.00, 399.00, 'streaming', 50, 'active'),
    ('Apple TV+ 月费', 'Apple TV+ 月度订阅，原创精品内容', 39.00, 49.00, 'streaming', 200, 'active'),
    ('YouTube Premium', 'YouTube 无广告会员，支持后台播放', 79.00, 99.00, 'streaming', 150, 'active'),
    ('Spotify Premium', 'Spotify 音乐会员，无限畅听', 59.00, 79.00, 'music', 100, 'active');

-- 示例分类
INSERT IGNORE INTO categories (name, slug, description, sort_order, status)
VALUES 
    ('流媒体服务', 'streaming', '各类视频流媒体订阅服务', 1, 'active'),
    ('音乐服务', 'music', '音乐流媒体订阅服务', 2, 'active'),
    ('软件工具', 'software', '各类软件和工具订阅', 3, 'active'),
    ('游戏服务', 'gaming', '游戏平台和服务订阅', 4, 'active');

-- 显示创建结果
SELECT '✅ 数据库初始化完成！' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as category_count FROM categories;