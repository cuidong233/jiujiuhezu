-- 添加CDK可重复使用相关字段
-- 执行时间: 2024-01

-- 1. 为pr_goods_cdkey表添加新字段
ALTER TABLE `pr_goods_cdkey` 
ADD COLUMN `is_reusable` TINYINT(1) DEFAULT 0 COMMENT '是否可重复使用' AFTER `expire_date`,
ADD COLUMN `max_usage_count` INT DEFAULT 1 COMMENT '最大使用次数（可重复使用CDK）' AFTER `is_reusable`,
ADD COLUMN `current_usage_count` INT DEFAULT 0 COMMENT '当前使用次数' AFTER `max_usage_count`,
ADD COLUMN `usage_expire_date` DATE NULL COMMENT '使用有效期（使用后多久自动释放）' AFTER `current_usage_count`,
ADD COLUMN `last_used_date` DATETIME NULL COMMENT '最后使用时间' AFTER `usage_expire_date`;

-- 2. 创建CDK使用记录表
CREATE TABLE IF NOT EXISTS `cdk_usage_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '使用记录ID',
  `cdk_id` BIGINT NOT NULL COMMENT 'CDK ID',
  `cdk_code` VARCHAR(100) NOT NULL COMMENT 'CDK码',
  `user_id` BIGINT NOT NULL COMMENT '使用者ID',
  `order_id` BIGINT NULL COMMENT '关联订单ID',
  `usage_type` VARCHAR(20) DEFAULT 'normal' COMMENT '使用类型：normal-正常使用, redeem-兑换, activate-激活',
  `usage_status` TINYINT DEFAULT 1 COMMENT '使用状态 0:失败 1:成功 2:已释放',
  `used_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
  `expire_at` DATETIME NULL COMMENT '本次使用的过期时间',
  `released_at` DATETIME NULL COMMENT '释放时间',
  `release_reason` VARCHAR(100) NULL COMMENT '释放原因：expired-过期, manual-手动, system-系统',
  `ip_address` VARCHAR(50) NULL COMMENT '使用时的IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT '使用时的User Agent',
  `device_info` JSON NULL COMMENT '设备信息',
  `remark` VARCHAR(500) NULL COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cdk_id` (`cdk_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_cdk_code` (`cdk_code`),
  KEY `idx_usage_status` (`usage_status`),
  KEY `idx_used_at` (`used_at`),
  KEY `idx_expire_at` (`expire_at`),
  CONSTRAINT `fk_usage_cdk` FOREIGN KEY (`cdk_id`) REFERENCES `pr_goods_cdkey` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_user` FOREIGN KEY (`user_id`) REFERENCES `pr_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_order` FOREIGN KEY (`order_id`) REFERENCES `pr_orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CDK使用记录表';

-- 3. 为pr_goods_cdkey表添加索引
ALTER TABLE `pr_goods_cdkey`
ADD INDEX `idx_is_reusable` (`is_reusable`),
ADD INDEX `idx_current_usage_count` (`current_usage_count`),
ADD INDEX `idx_last_used_date` (`last_used_date`),
ADD INDEX `idx_usage_expire_date` (`usage_expire_date`);

-- 4. 更新现有CDK数据，设置默认值
UPDATE `pr_goods_cdkey` 
SET 
  `is_reusable` = 0,
  `max_usage_count` = 1,
  `current_usage_count` = CASE 
    WHEN `status` = 2 THEN 1  -- 已使用的设置为1
    ELSE 0 
  END
WHERE `is_reusable` IS NULL;

-- 5. 创建触发器，自动更新updated_at
DELIMITER $$
CREATE TRIGGER `cdk_usage_records_updated_at` 
BEFORE UPDATE ON `cdk_usage_records`
FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- 6. 添加示例数据（可选，仅用于测试）
-- INSERT INTO `pr_goods_cdkey` (`product_id`, `cdk_code`, `cdk_type`, `is_reusable`, `max_usage_count`, `usage_expire_date`)
-- VALUES 
-- (1, 'REUSE-TEST-0001', 'normal', 1, 5, DATE_ADD(NOW(), INTERVAL 30 DAY)),
-- (1, 'REUSE-TEST-0002', 'normal', 1, 10, DATE_ADD(NOW(), INTERVAL 7 DAY));

-- 查询验证
-- SELECT 
--   COUNT(*) as total_cdks,
--   SUM(CASE WHEN is_reusable = 1 THEN 1 ELSE 0 END) as reusable_cdks,
--   SUM(CASE WHEN is_reusable = 0 THEN 1 ELSE 0 END) as single_use_cdks
-- FROM pr_goods_cdkey;