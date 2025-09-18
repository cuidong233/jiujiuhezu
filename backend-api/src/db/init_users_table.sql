-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) UNIQUE COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  `password` VARCHAR(255) COMMENT '密码（加密后）',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色：admin-管理员，user-普通用户',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建用户登录日志表
CREATE TABLE IF NOT EXISTS `user_login_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT COMMENT '用户ID',
  `email` VARCHAR(100) COMMENT '邮箱',
  `login_type` VARCHAR(20) COMMENT '登录类型：password-密码登录，code-验证码登录',
  `login_ip` VARCHAR(50) COMMENT '登录IP',
  `user_agent` VARCHAR(500) COMMENT '用户代理',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-成功，0-失败',
  `failure_reason` VARCHAR(100) COMMENT '失败原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户登录日志表';

-- 创建邮件验证码表
CREATE TABLE IF NOT EXISTS `email_codes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `code` VARCHAR(10) NOT NULL COMMENT '验证码',
  `type` VARCHAR(20) COMMENT '类型：register-注册，login-登录，reset-重置密码',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-未使用，1-已使用',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_email_code` (`email`, `code`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件验证码表';

-- 创建app_users表作为users表的别名视图（兼容旧代码）
CREATE OR REPLACE VIEW `app_users` AS SELECT * FROM `users`;

-- 插入一个测试管理员账号（密码是: admin123）
INSERT INTO `users` (`username`, `email`, `password`, `nickname`, `role`, `status`) 
VALUES ('admin', 'admin@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '管理员', 'admin', 1)
ON DUPLICATE KEY UPDATE `id`=`id`;