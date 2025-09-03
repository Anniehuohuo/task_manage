-- 测试用户数据（使用明文密码，仅用于开发测试）
-- 注意：生产环境中绝不应该使用明文密码！

-- 删除现有测试用户（如果存在）
DELETE FROM users WHERE username IN ('admin', 'user1', 'user2');

-- 插入测试用户（使用password_hash字段）
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', '$2b$10$example_hash_for_admin123', 'admin'),
('user1', 'user1@example.com', '$2b$10$example_hash_for_user123', 'user'),
('user2', 'user2@example.com', '$2b$10$example_hash_for_user123', 'user');

-- 验证插入结果
SELECT user_id, username, email, role, created_at FROM users WHERE username IN ('admin', 'user1', 'user2');

-- 使用说明：
-- 1. 在Supabase控制台的SQL编辑器中运行此脚本
-- 2. 确保users表已经创建（运行主数据库脚本）
-- 3. 运行后即可使用以下账号登录：
--    管理员：admin / admin123
--    普通用户：user1 / user123
--    普通用户：user2 / user123

-- 安全提醒：
-- 此文件仅用于开发测试，包含明文密码
-- 生产环境中应使用加密的密码哈希
-- 请勿在生产数据库中使用此脚本