-- 创建邮件模板表
CREATE TABLE IF NOT EXISTS `email_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '模板名称',
  `type` varchar(50) NOT NULL COMMENT '模板类型：auto_delivery, manual_pending, manual_complete, custom',
  `subject` varchar(255) NOT NULL COMMENT '邮件主题',
  `content` text NOT NULL COMMENT '邮件内容',
  `content_type` varchar(20) DEFAULT 'html' COMMENT '内容类型：html, text',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件模板表';

-- 创建邮件日志表
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) NOT NULL COMMENT '收件人邮箱',
  `subject` varchar(255) DEFAULT NULL COMMENT '邮件主题',
  `content` text COMMENT '邮件内容',
  `type` varchar(50) DEFAULT 'custom' COMMENT '邮件类型',
  `order_no` varchar(100) DEFAULT NULL COMMENT '关联订单号',
  `status` varchar(20) DEFAULT 'pending' COMMENT '发送状态：pending, success, failed',
  `message_id` varchar(255) DEFAULT NULL COMMENT '邮件服务商返回的消息ID',
  `error_message` text COMMENT '错误信息',
  `sent_at` datetime DEFAULT NULL COMMENT '发送时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件发送日志表';

-- 在products表添加邮件相关字段（如果字段不存在）
-- Note: MySQL 5.7 doesn't support IF NOT EXISTS with ADD COLUMN, need to check manually
-- You can run these individually if needed:
-- ALTER TABLE `products` ADD COLUMN `email_enabled` tinyint(1) DEFAULT '1' COMMENT '是否发送购买邮件';
-- ALTER TABLE `products` ADD COLUMN `email_subject` varchar(255) DEFAULT NULL COMMENT '自定义邮件主题';
-- ALTER TABLE `products` ADD COLUMN `email_template` text COMMENT '自定义邮件模板';

-- 插入默认邮件模板
INSERT INTO `email_templates` (`name`, `type`, `subject`, `content`, `content_type`, `enabled`) VALUES
('自动发货通知', 'auto_delivery', '🎉 Purchase Successful - {{productName}}', 
'<h2>Thank you for your purchase!</h2>
<p>Order Number: {{orderNo}}</p>
<p>Product: {{productName}}</p>
<p>Amount: ${{amount}}</p>
<h3>Your Access Keys:</h3>
<p>{{cdkKeys}}</p>
<p>Please save these keys in a secure location.</p>', 
'html', 1),

('待发货通知', 'manual_pending', '📦 Order Received - {{productName}}', 
'<h2>Order Received!</h2>
<p>Thank you for your purchase. Your order is being processed.</p>
<p>Order Number: {{orderNo}}</p>
<p>Product: {{productName}}</p>
<p>Amount: ${{amount}}</p>
<p>We will send you another email once your order is ready for delivery.</p>
<p>Estimated processing time: Within 24 hours</p>', 
'html', 1),

('发货完成通知', 'manual_complete', '✅ Order Delivered - {{productName}}', 
'<h2>Order Delivered!</h2>
<p>Your order has been delivered successfully.</p>
<p>Order Number: {{orderNo}}</p>
<p>Product: {{productName}}</p>
<h3>Your Access Information:</h3>
<p>{{cdkKeys}}</p>
<p>{{productInfo}}</p>
<p>Thank you for choosing us!</p>', 
'html', 1);

-- 创建邮件配置表（可选，用于存储全局邮件设置）
CREATE TABLE IF NOT EXISTS `email_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件配置表';

-- 插入默认配置
INSERT INTO `email_config` (`config_key`, `config_value`, `description`) VALUES
('enabled', 'true', '是否启用邮件服务'),
('auto_delivery_email', 'true', '是否发送自动发货邮件'),
('manual_pending_email', 'true', '是否发送手动发货待处理邮件'),
('manual_complete_email', 'true', '是否发送手动发货完成邮件')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);