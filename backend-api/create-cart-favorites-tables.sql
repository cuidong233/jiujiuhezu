-- 创建购物车表
CREATE TABLE IF NOT EXISTS `user_cart` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `goods_id` BIGINT NOT NULL COMMENT '商品ID',
  `quantity` INT DEFAULT 1 COMMENT '数量',
  `spec` VARCHAR(100) DEFAULT '' COMMENT '规格',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`),
  UNIQUE KEY `uk_user_goods_spec` (`user_id`, `goods_id`, `spec`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 创建收藏表
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `goods_id` BIGINT NOT NULL COMMENT '商品ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`),
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 创建商品表（如果不存在）
CREATE TABLE IF NOT EXISTS `pr_goods` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `title` VARCHAR(200) NOT NULL COMMENT '商品标题',
  `description` TEXT COMMENT '商品描述',
  `price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格',
  `original_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '原价',
  `cover_image` VARCHAR(500) COMMENT '封面图片',
  `images` TEXT COMMENT '商品图片列表（JSON）',
  `category_id` BIGINT COMMENT '分类ID',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-上架，0-下架',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 插入测试商品数据
INSERT INTO `pr_goods` (`title`, `description`, `price`, `original_price`, `cover_image`, `status`) VALUES
('Netflix 会员 - 月度订阅', 'Netflix 高级会员，支持4K画质，可同时4台设备观看', 99.00, 199.00, '/images/netflix.png', 1),
('Apple TV+ 年度会员', 'Apple TV+ 年度会员，享受所有原创内容', 599.00, 899.00, '/images/appletv-logo.png', 1),
('测试商品3', '这是测试商品描述3', 299.00, 399.00, '/images/product3.jpg', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 显示创建结果
SHOW TABLES LIKE 'user_%';
SHOW TABLES LIKE 'pr_goods';