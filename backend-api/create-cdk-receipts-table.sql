-- 创建CDK回执单表
CREATE TABLE IF NOT EXISTS `pr_cdk_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '回执ID',
  `cdk_id` bigint NOT NULL COMMENT 'CDK ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `receipt_fields` json DEFAULT NULL COMMENT '回执字段配置',
  `receipt_data` json DEFAULT NULL COMMENT '回执数据',
  `delivery_status` tinyint DEFAULT '0' COMMENT '发货状态: 0-待发货, 1-已发货, 2-发货失败',
  `delivered_by` bigint DEFAULT NULL COMMENT '发货人ID',
  `delivered_at` datetime DEFAULT NULL COMMENT '发货时间',
  `notes` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cdk_id` (`cdk_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_delivery_status` (`delivery_status`),
  CONSTRAINT `fk_receipt_cdk` FOREIGN KEY (`cdk_id`) REFERENCES `pr_cdks` (`id`),
  CONSTRAINT `fk_receipt_order` FOREIGN KEY (`order_id`) REFERENCES `pr_orders` (`id`),
  CONSTRAINT `fk_receipt_user` FOREIGN KEY (`user_id`) REFERENCES `pr_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CDK回执单表';

-- 为CDK表添加回执相关字段（如果不存在）
ALTER TABLE `pr_cdks` 
ADD COLUMN IF NOT EXISTS `receipt_fields` json DEFAULT NULL COMMENT '回执字段配置',
ADD COLUMN IF NOT EXISTS `receipt_data` json DEFAULT NULL COMMENT '回执数据';

-- 为订单表添加代充标识字段（如果不存在）
ALTER TABLE `pr_orders`
ADD COLUMN IF NOT EXISTS `is_proxy_recharge` tinyint(1) DEFAULT '0' COMMENT '是否为代充订单';