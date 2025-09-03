-- 任务管理平台数据库初始化脚本 (MySQL版本)
-- 创建时间: 2024年
-- 说明: 根据需求文档创建的数据库表结构和初始数据
-- 适用于: MySQL数据库
-- 注意: 如果使用Supabase，请使用 supabase-database.sql 文件

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. 创建用户表 (Users)
-- 用于存储所有用户的基本信息
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户唯一标识',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名，用于登录',
    password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user' COMMENT '用户角色：admin-管理员，user-普通用户',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '账号创建时间'
) COMMENT='用户信息表';

-- 2. 创建分类表 (Categories)
-- 用于存储任务的分类信息
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类唯一标识',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    color VARCHAR(7) DEFAULT '#3498db' COMMENT '分类颜色（十六进制）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分类创建时间',
    creator_id INT NOT NULL COMMENT '创建该分类的管理员ID',
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT='任务分类表';

-- 3. 创建任务表 (Tasks)
-- 用于存储所有任务的详细信息
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '任务唯一标识',
    title VARCHAR(200) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务详细描述',
    category_id INT NOT NULL COMMENT '任务所属分类',
    status ENUM('待领取', '进行中', '已完成', '已逾期') NOT NULL DEFAULT '待领取' COMMENT '任务状态',
    priority VARCHAR(10) DEFAULT 'medium' COMMENT '任务优先级：low, medium, high',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '任务创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '任务更新时间',
    due_date DATE COMMENT '任务截止日期',
    creator_id INT NOT NULL COMMENT '创建该任务的管理员ID',
    assignee_id INT NULL COMMENT '负责该任务的用户ID，可以为空表示未分配',
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(user_id) ON DELETE SET NULL
) COMMENT='任务信息表';

-- 插入初始数据
-- 注意：这里的密码应该是加密后的，为了演示使用简单密码
-- 在实际项目中，密码必须经过哈希加密处理

-- 插入默认管理员账号
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('manager', 'manager123', 'admin');

-- 插入一些普通用户
INSERT INTO users (username, password, role) VALUES 
('zhangsan', 'user123', 'user'),
('lisi', 'user123', 'user'),
('wangwu', 'user123', 'user');

-- 插入一些默认的任务分类
INSERT INTO categories (name, description, color, creator_id) VALUES 
('开发任务', '与软件开发相关的任务', '#e74c3c', 1),
('测试任务', '软件测试和质量保证相关的任务', '#f39c12', 1),
('设计任务', '界面设计和用户体验相关的任务', '#9b59b6', 1),
('文档任务', '文档编写和维护相关的任务', '#3498db', 1),
('运维任务', '系统运维和部署相关的任务', '#2ecc71', 1);

-- 插入一些示例任务
INSERT INTO tasks (title, description, category_id, status, priority, due_date, creator_id, assignee_id) VALUES 
('完成用户登录功能', '实现用户登录页面和后端验证逻辑', 1, '进行中', 'high', '2024-02-15', 1, 3),
('设计任务管理界面', '设计任务列表和任务详情页面的UI界面', 3, '待领取', 'medium', '2024-02-20', 1, NULL),
('编写API文档', '为任务管理系统编写完整的API接口文档', 4, '待领取', 'low', '2024-02-25', 1, NULL),
('数据库性能优化', '优化数据库查询性能，添加必要的索引', 5, '待领取', 'medium', '2024-03-01', 1, NULL),
('用户注册功能测试', '对用户注册功能进行全面的功能测试', 2, '已完成', 'high', '2024-02-10', 1, 4);

-- 创建索引以提高查询性能
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_categories_name ON categories(name);

-- 显示创建结果
SELECT '数据库初始化完成！' AS message;
SELECT '用户表记录数:' AS info, COUNT(*) AS count FROM users;
SELECT '分类表记录数:' AS info, COUNT(*) AS count FROM categories;
SELECT '任务表记录数:' AS info, COUNT(*) AS count FROM tasks;