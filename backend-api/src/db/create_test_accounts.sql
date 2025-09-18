-- 清理已存在的测试数据（可选）
DELETE FROM users WHERE email IN ('test1@example.com', 'test2@example.com', 'admin@test.com');

-- 创建测试账号
-- 密码都是: test123 (已加密)
INSERT INTO users (username, email, password, nickname, role, status, created_at, updated_at) VALUES
-- 普通用户测试账号1
('testuser1', 'test1@example.com', '$2b$10$YXJSDfKmQr5iqFQzBABLCOKrSQ5FhtSZLdRrFqQ5FhtCd9QxzJF9O', '测试用户1', 'user', 1, NOW(), NOW()),
-- 普通用户测试账号2  
('testuser2', 'test2@example.com', '$2b$10$YXJSDfKmQr5iqFQzBABLCOKrSQ5FhtSZLdRrFqQ5FhtCd9QxzJF9O', '测试用户2', 'user', 1, NOW(), NOW()),
-- 管理员测试账号
('admin', 'admin@test.com', '$2b$10$YXJSDfKmQr5iqFQzBABLCOKrSQ5FhtSZLdRrFqQ5FhtCd9QxzJF9O', '管理员', 'admin', 1, NOW(), NOW());

-- 显示创建的账号
SELECT id, username, email, nickname, role FROM users WHERE email IN ('test1@example.com', 'test2@example.com', 'admin@test.com');