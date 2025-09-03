-- 任务管理平台数据库初始化脚本 (Supabase/PostgreSQL版本)
-- 创建时间: 2024年
-- 说明: 根据需求文档创建的数据库表结构和初始数据
-- 适用于: Supabase (PostgreSQL)

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 创建用户角色枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- 创建任务状态枚举类型
CREATE TYPE task_status AS ENUM ('待领取', '进行中', '已完成', '已逾期');

-- 1. 创建用户表 (Users)
-- 用于存储所有用户的基本信息
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY, -- 用户唯一标识
    username VARCHAR(50) NOT NULL UNIQUE, -- 用户名，用于登录
    password VARCHAR(255) NOT NULL, -- 加密后的密码
    role user_role NOT NULL DEFAULT 'user', -- 用户角色：admin-管理员，user-普通用户
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- 账号创建时间
);

-- 为用户表添加注释
COMMENT ON TABLE users IS '用户信息表';
COMMENT ON COLUMN users.user_id IS '用户唯一标识';
COMMENT ON COLUMN users.username IS '用户名，用于登录';
COMMENT ON COLUMN users.password IS '加密后的密码';
COMMENT ON COLUMN users.role IS '用户角色：admin-管理员，user-普通用户';
COMMENT ON COLUMN users.created_at IS '账号创建时间';

-- 2. 创建分类表 (Categories)
-- 用于存储任务的分类信息
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY, -- 分类唯一标识
    name VARCHAR(100) NOT NULL UNIQUE, -- 分类名称
    description TEXT, -- 分类描述
    color VARCHAR(7) DEFAULT '#3498db', -- 分类颜色（十六进制）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 分类创建时间
    creator_id INTEGER NOT NULL, -- 创建该分类的管理员ID
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 为分类表添加注释
COMMENT ON TABLE categories IS '任务分类表';
COMMENT ON COLUMN categories.category_id IS '分类唯一标识';
COMMENT ON COLUMN categories.name IS '分类名称';
COMMENT ON COLUMN categories.description IS '分类描述';
COMMENT ON COLUMN categories.color IS '分类颜色（十六进制）';
COMMENT ON COLUMN categories.created_at IS '分类创建时间';
COMMENT ON COLUMN categories.creator_id IS '创建该分类的管理员ID';

-- 3. 创建任务表 (Tasks)
-- 用于存储所有任务的详细信息
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY, -- 任务唯一标识
    title VARCHAR(200) NOT NULL, -- 任务标题
    description TEXT, -- 任务详细描述
    category_id INTEGER NOT NULL, -- 任务所属分类
    status task_status NOT NULL DEFAULT '待领取', -- 任务状态
    priority VARCHAR(10) DEFAULT 'medium', -- 任务优先级：low, medium, high
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 任务创建时间
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 任务更新时间
    due_date DATE, -- 任务截止日期
    creator_id INTEGER NOT NULL, -- 创建该任务的管理员ID
    assignee_id INTEGER, -- 负责该任务的用户ID，可以为空表示未分配
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 为任务表添加注释
COMMENT ON TABLE tasks IS '任务信息表';
COMMENT ON COLUMN tasks.task_id IS '任务唯一标识';
COMMENT ON COLUMN tasks.title IS '任务标题';
COMMENT ON COLUMN tasks.description IS '任务详细描述';
COMMENT ON COLUMN tasks.category_id IS '任务所属分类';
COMMENT ON COLUMN tasks.status IS '任务状态';
COMMENT ON COLUMN tasks.priority IS '任务优先级：low, medium, high';
COMMENT ON COLUMN tasks.created_at IS '任务创建时间';
COMMENT ON COLUMN tasks.updated_at IS '任务更新时间';
COMMENT ON COLUMN tasks.due_date IS '任务截止日期';
COMMENT ON COLUMN tasks.creator_id IS '创建该任务的管理员ID';
COMMENT ON COLUMN tasks.assignee_id IS '负责该任务的用户ID，可以为空表示未分配';

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为任务表创建更新时间触发器
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- 启用行级安全策略（RLS）- Supabase推荐
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略（可根据需要调整）
-- 用户表：用户只能查看自己的信息，管理员可以查看所有用户
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id::text OR 
                     EXISTS (SELECT 1 FROM users WHERE user_id::text = auth.uid()::text AND role = 'admin'));

-- 分类表：所有用户都可以查看分类，只有管理员可以修改
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE user_id::text = auth.uid()::text AND role = 'admin'));

-- 任务表：用户可以查看所有任务，但只能修改分配给自己的任务
CREATE POLICY "Everyone can view tasks" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Users can update assigned tasks" ON tasks
    FOR UPDATE USING (assignee_id::text = auth.uid()::text OR 
                     EXISTS (SELECT 1 FROM users WHERE user_id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Only admins can create tasks" ON tasks
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE user_id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Only admins can delete tasks" ON tasks
    FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE user_id::text = auth.uid()::text AND role = 'admin'));

-- 显示创建结果的查询
SELECT '数据库初始化完成！' AS message;
SELECT '用户表记录数:' AS info, COUNT(*) AS count FROM users;
SELECT '分类表记录数:' AS info, COUNT(*) AS count FROM categories;
SELECT '任务表记录数:' AS info, COUNT(*) AS count FROM tasks;

-- 显示表结构信息
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'categories', 'tasks')
ORDER BY table_name, ordinal_position;