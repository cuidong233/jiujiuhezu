-- 创建商品分类表
CREATE TABLE IF NOT EXISTS `product_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `parent_id` bigint(20) DEFAULT 0 COMMENT '父分类ID',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态 0:禁用 1:启用',
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 创建商品表
CREATE TABLE IF NOT EXISTS `product` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `category_id` bigint(20) DEFAULT NULL COMMENT '分类ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` text COMMENT '商品描述',
  `image` varchar(500) DEFAULT NULL COMMENT '商品图片',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `stock` int(11) DEFAULT 999999 COMMENT '库存',
  `sales` int(11) DEFAULT 0 COMMENT '销量',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态 0:下架 1:上架',
  `is_hot` tinyint(1) DEFAULT 0 COMMENT '是否热门',
  `is_recommend` tinyint(1) DEFAULT 0 COMMENT '是否推荐',
  `product_type` varchar(20) DEFAULT 'CDK' COMMENT '商品类型：CDK-虚拟激活码',
  `cdk_type` varchar(50) DEFAULT NULL COMMENT 'CDK类型：netflix, disney, appletv等',
  `duration` varchar(50) DEFAULT NULL COMMENT '时长：1个月、3个月、12个月等',
  `features` text COMMENT '产品特性，JSON格式',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 创建CDK库存表
CREATE TABLE IF NOT EXISTS `product_cdk` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'CDK ID',
  `product_id` bigint(20) NOT NULL COMMENT '商品ID',
  `cdk_code` varchar(100) NOT NULL COMMENT 'CDK激活码',
  `status` tinyint(1) DEFAULT 0 COMMENT '状态 0:未售 1:已售',
  `order_id` bigint(20) DEFAULT NULL COMMENT '订单ID',
  `sold_date` datetime DEFAULT NULL COMMENT '售出时间',
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cdk_code` (`cdk_code`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CDK库存表';

-- 插入商品分类数据
INSERT INTO `product_category` (`name`, `parent_id`, `sort`, `status`) VALUES
('影音娱乐', 0, 1, 1),
('AI服务', 0, 2, 1),
('学习工具', 0, 3, 1),
('增值服务', 0, 4, 1);

-- 插入示例商品数据（虚拟产品CDK）
INSERT INTO `product` (`category_id`, `name`, `description`, `image`, `price`, `original_price`, `stock`, `sales`, `status`, `is_hot`, `is_recommend`, `product_type`, `cdk_type`, `duration`, `features`, `sort`) VALUES
(1, 'Netflix 高级账号 12个月', 'Netflix高级会员账号，支持4K超高清，同时4设备观看', '/images/netflix.png', 162.00, 299.00, 100, 2500, 1, 1, 1, 'CDK', 'netflix', '12个月', '["全球解锁", "4K高清", "支持杜比", "单月起售"]', 1),
(1, 'Disney+ 会员 12个月', 'Disney+会员账号，畅享迪士尼、漫威、星战等精彩内容', '/images/netflix.png', 138.00, 249.00, 100, 1800, 1, 1, 0, 'CDK', 'disney', '12个月', '["全球解锁", "4K高清", "原创内容", "家庭共享"]', 2),
(1, 'Apple TV+ 会员 6个月', 'Apple TV+会员，独家原创剧集，支持4K HDR', '/images/appletv-logo.png', 88.00, 149.00, 100, 900, 1, 0, 1, 'CDK', 'appletv', '6个月', '["原创剧集", "4K HDR", "杜比全景声", "离线下载"]', 3),
(2, 'ChatGPT Plus 账号', 'ChatGPT Plus账号，无限制使用GPT-4', '/images/netflix.png', 199.00, 299.00, 50, 3200, 1, 1, 1, 'CDK', 'chatgpt', '1个月', '["GPT-4模型", "优先响应", "新功能抢先体验", "稳定可靠"]', 4),
(2, 'Midjourney 订阅', 'Midjourney AI绘画工具订阅', '/images/netflix.png', 168.00, 258.00, 50, 1500, 1, 0, 1, 'CDK', 'midjourney', '1个月', '["无限生成", "高速模式", "商用授权", "私密模式"]', 5),
(3, 'Grammarly Premium', 'Grammarly高级版，专业写作助手', '/images/netflix.png', 98.00, 168.00, 80, 650, 1, 0, 0, 'CDK', 'grammarly', '12个月', '["语法检查", "风格建议", "抄袭检测", "词汇增强"]', 6),
(4, 'Spotify Premium 家庭版', 'Spotify音乐高级家庭版，支持6账号', '/images/netflix.png', 128.00, 198.00, 100, 1200, 1, 1, 0, 'CDK', 'spotify', '12个月', '["无广告", "离线下载", "高音质", "家庭共享"]', 7),
(1, 'YouTube Premium', 'YouTube高级会员，无广告观看，支持后台播放', '/images/netflix.png', 108.00, 168.00, 100, 800, 1, 0, 1, 'CDK', 'youtube', '12个月', '["无广告", "后台播放", "离线下载", "YouTube Music"]', 8);

-- 为每个商品插入一些CDK示例数据
INSERT INTO `product_cdk` (`product_id`, `cdk_code`, `status`) VALUES
(1, 'NFLX-2025-A1B2C3D4E5F6', 0),
(1, 'NFLX-2025-G7H8I9J0K1L2', 0),
(1, 'NFLX-2025-M3N4O5P6Q7R8', 0),
(2, 'DSNY-2025-S9T0U1V2W3X4', 0),
(2, 'DSNY-2025-Y5Z6A7B8C9D0', 0),
(2, 'DSNY-2025-E1F2G3H4I5J6', 0),
(3, 'APTV-2025-K7L8M9N0O1P2', 0),
(3, 'APTV-2025-Q3R4S5T6U7V8', 0),
(4, 'CGPT-2025-W9X0Y1Z2A3B4', 0),
(4, 'CGPT-2025-C5D6E7F8G9H0', 0),
(5, 'MIDJ-2025-I1J2K3L4M5N6', 0),
(5, 'MIDJ-2025-O7P8Q9R0S1T2', 0),
(6, 'GRAM-2025-U3V4W5X6Y7Z8', 0),
(6, 'GRAM-2025-A9B0C1D2E3F4', 0),
(7, 'SPOT-2025-G5H6I7J8K9L0', 0),
(7, 'SPOT-2025-M1N2O3P4Q5R6', 0),
(8, 'YTPR-2025-S7T8U9V0W1X2', 0),
(8, 'YTPR-2025-Y3Z4A5B6C7D8', 0);

-- 创建订单表（如果还没有）
CREATE TABLE IF NOT EXISTS `tb_order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `product_id` bigint(20) NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) COMMENT '商品名称',
  `product_image` varchar(500) COMMENT '商品图片',
  `amount` decimal(10,2) NOT NULL COMMENT '订单金额',
  `quantity` int(11) DEFAULT 1 COMMENT '数量',
  `cdk_id` bigint(20) DEFAULT NULL COMMENT 'CDK ID',
  `cdk_code` varchar(100) DEFAULT NULL COMMENT 'CDK激活码',
  `status` tinyint(1) DEFAULT 0 COMMENT '订单状态 0:待付款 1:已付款 2:已完成 3:已取消',
  `pay_type` varchar(20) DEFAULT NULL COMMENT '支付方式',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';