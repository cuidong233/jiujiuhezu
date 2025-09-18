-- Railway MySQL 数据库初始化脚本
-- 按正确顺序创建所有表

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `email` VARCHAR(200) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(100),
  `avatar` VARCHAR(500),
  `phone` VARCHAR(20),
  `balance` DECIMAL(10, 2) DEFAULT 0.00,
  `points` INT DEFAULT 0,
  `role` ENUM('user', 'admin', 'vip') DEFAULT 'user',
  `status` TINYINT DEFAULT 1,
  `last_login` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) UNIQUE,
  `description` TEXT,
  `parent_id` BIGINT,
  `icon` VARCHAR(100),
  `sort_order` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 商品表
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) UNIQUE,
  `category_id` BIGINT,
  `description` TEXT,
  `content` LONGTEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2),
  `cost` DECIMAL(10, 2),
  `stock` INT DEFAULT 0,
  `sold` INT DEFAULT 0,
  `views` INT DEFAULT 0,
  `rating` DECIMAL(3, 2) DEFAULT 0,
  `thumbnail` VARCHAR(500),
  `images` JSON,
  `video_url` VARCHAR(500),
  `tags` JSON,
  `meta_title` VARCHAR(200),
  `meta_description` TEXT,
  `meta_keywords` VARCHAR(500),
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_digital` BOOLEAN DEFAULT FALSE,
  `is_virtual` BOOLEAN DEFAULT FALSE,
  `download_url` VARCHAR(500),
  `status` ENUM('active', 'inactive', 'draft') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category_id`),
  FULLTEXT (`name`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 商品媒体表
CREATE TABLE IF NOT EXISTS `product_media` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `media_type` ENUM('image', 'video') NOT NULL,
  `media_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500),
  `title` VARCHAR(200),
  `alt` VARCHAR(200),
  `sort_order` INT DEFAULT 0,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `source` ENUM('upload', 'unsplash', 'pexels', 'pixabay', 'external') DEFAULT 'upload',
  `license` VARCHAR(100),
  `attribution` VARCHAR(500),
  `metadata` JSON,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 商品SKU表
CREATE TABLE IF NOT EXISTS `product_skus` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `sku_code` VARCHAR(100) UNIQUE NOT NULL,
  `attributes` JSON,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT DEFAULT 0,
  `sold` INT DEFAULT 0,
  `image` VARCHAR(500),
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product` (`product_id`),
  INDEX `idx_sku_code` (`sku_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 商品规格表
CREATE TABLE IF NOT EXISTS `product_specifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `spec_name` VARCHAR(100) NOT NULL,
  `spec_value` TEXT,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) UNIQUE NOT NULL,
  `user_id` BIGINT,
  `product_id` BIGINT,
  `product_name` VARCHAR(200),
  `product_price` DECIMAL(10, 2),
  `quantity` INT DEFAULT 1,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `discount_amount` DECIMAL(10, 2) DEFAULT 0,
  `paid_amount` DECIMAL(10, 2) DEFAULT 0,
  `payment_method` VARCHAR(50),
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `payment_time` DATETIME,
  `transaction_id` VARCHAR(100),
  `delivery_type` VARCHAR(50),
  `delivery_content` TEXT,
  `delivery_status` ENUM('pending', 'delivered', 'failed') DEFAULT 'pending',
  `delivery_time` DATETIME,
  `buyer_email` VARCHAR(200),
  `buyer_phone` VARCHAR(20),
  `buyer_remark` TEXT,
  `status` ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. CDK表
CREATE TABLE IF NOT EXISTS `cdks` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `product_id` BIGINT,
  `batch_id` VARCHAR(50),
  `type` VARCHAR(50),
  `value` TEXT,
  `status` ENUM('unused', 'used', 'expired', 'disabled') DEFAULT 'unused',
  `used_by` BIGINT,
  `used_at` DATETIME,
  `expires_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`used_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. CDK使用记录表
CREATE TABLE IF NOT EXISTS `cdk_usage_records` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `cdk_id` BIGINT NOT NULL,
  `user_id` BIGINT,
  `order_id` BIGINT,
  `action` VARCHAR(50),
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`cdk_id`) REFERENCES `cdks`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  INDEX `idx_cdk` (`cdk_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. 邮件验证码表
CREATE TABLE IF NOT EXISTS `email_codes` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(200) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `type` VARCHAR(50),
  `used` BOOLEAN DEFAULT FALSE,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email_code` (`email`, `code`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. 横幅表
CREATE TABLE IF NOT EXISTS `banners` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200),
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(500),
  `target` VARCHAR(20) DEFAULT '_blank',
  `position` VARCHAR(50),
  `sort_order` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `start_date` DATETIME,
  `end_date` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_position` (`position`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. 文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) UNIQUE,
  `author_id` BIGINT,
  `category_id` BIGINT,
  `summary` TEXT,
  `content` LONGTEXT,
  `thumbnail` VARCHAR(500),
  `views` INT DEFAULT 0,
  `likes` INT DEFAULT 0,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `published_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_author` (`author_id`),
  FULLTEXT (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. 通知表
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT,
  `type` VARCHAR(50),
  `title` VARCHAR(200),
  `content` TEXT,
  `data` JSON,
  `is_read` BOOLEAN DEFAULT FALSE,
  `read_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. 购物车表
CREATE TABLE IF NOT EXISTS `carts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `sku_id` BIGINT,
  `quantity` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_cart_item` (`user_id`, `product_id`, `sku_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. 收藏表
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_favorite` (`user_id`, `product_id`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. 优惠券表
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `type` ENUM('fixed', 'percent') NOT NULL,
  `value` DECIMAL(10, 2) NOT NULL,
  `min_amount` DECIMAL(10, 2) DEFAULT 0,
  `max_discount` DECIMAL(10, 2),
  `usage_limit` INT,
  `used_count` INT DEFAULT 0,
  `valid_from` DATETIME,
  `valid_to` DATETIME,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. 折扣活动表
CREATE TABLE IF NOT EXISTS `discount_activities` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `type` VARCHAR(50),
  `rules` JSON,
  `start_time` DATETIME,
  `end_time` DATETIME,
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员账号
INSERT INTO `users` (`username`, `email`, `password`, `nickname`, `role`, `balance`) 
VALUES ('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', '管理员', 'admin', 10000.00)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 插入默认分类
INSERT INTO `categories` (`name`, `slug`, `description`, `sort_order`) VALUES
('数字产品', 'digital', '软件、账号、激活码等数字产品', 1),
('实物商品', 'physical', '需要物流配送的实物商品', 2),
('虚拟服务', 'service', '在线服务、咨询等虚拟服务', 3)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 插入测试商品
INSERT INTO `products` (`name`, `slug`, `category_id`, `description`, `price`, `stock`, `status`) VALUES
('测试商品1', 'test-product-1', 1, '这是一个测试商品', 99.99, 100, 'active'),
('测试商品2', 'test-product-2', 2, '这是另一个测试商品', 199.99, 50, 'active')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 插入测试横幅
INSERT INTO `banners` (`title`, `image_url`, `link_url`, `position`, `sort_order`, `status`) VALUES
('欢迎横幅', 'https://via.placeholder.com/1200x300', '/', 'home_top', 1, 1),
('促销横幅', 'https://via.placeholder.com/1200x300', '/products', 'home_middle', 2, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 显示创建的表
SHOW TABLES;

-- 输出成功信息
SELECT '✅ 数据库初始化完成！' as message;