-- 创建SKU规格表
CREATE TABLE IF NOT EXISTS `pr_product_specifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `specifications` JSON COMMENT '规格定义，JSON格式',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表';

-- 创建SKU表
CREATE TABLE IF NOT EXISTS `pr_product_skus` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'SKU ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_id` VARCHAR(100) NOT NULL COMMENT 'SKU编号',
  `sku_name` VARCHAR(200) NOT NULL COMMENT 'SKU名称',
  `attributes` JSON COMMENT 'SKU属性组合，JSON格式',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '销售价',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '库存',
  `expire_days` INT DEFAULT NULL COMMENT '有效天数（用于订阅型产品）',
  `sku_description` TEXT COMMENT 'SKU简介',
  `license_count` INT DEFAULT 1 COMMENT '授权码数量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sku_id` (`sku_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU表';

-- 添加索引以提高查询性能
ALTER TABLE `pr_product_skus` ADD INDEX `idx_product_status` (`product_id`, `status`);