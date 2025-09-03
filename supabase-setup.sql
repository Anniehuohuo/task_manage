-- Supabase数据库表结构创建脚本
-- 请在Supabase控制台的SQL编辑器中执行此脚本

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff', -- 十六进制颜色代码
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- 5. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 为每个表创建更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 插入初始数据
-- 插入管理员用户（密码：admin123，实际使用时应该加密）
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', '$2b$10$example_hash_for_admin123', 'admin'),
('user1', 'user1@example.com', '$2b$10$example_hash_for_user123', 'user'),
('user2', 'user2@example.com', '$2b$10$example_hash_for_user123', 'user')
ON CONFLICT (username) DO NOTHING;

-- 插入默认分类
INSERT INTO categories (name, description, color, created_by) VALUES 
('工作', '与工作相关的任务', '#007bff', (SELECT id FROM users WHERE username = 'admin')),
('个人', '个人生活相关的任务', '#28a745', (SELECT id FROM users WHERE username = 'admin')),
('学习', '学习和培训相关的任务', '#ffc107', (SELECT id FROM users WHERE username = 'admin')),
('紧急', '需要紧急处理的任务', '#dc3545', (SELECT id FROM users WHERE username = 'admin'))
ON CONFLICT DO NOTHING;

-- 插入示例任务
INSERT INTO tasks (title, description, status, priority, category_id, assigned_to, created_by) VALUES 
('完成项目报告', '准备季度项目总结报告', 'pending', 'high', 
 (SELECT id FROM categories WHERE name = '工作'), 
 (SELECT id FROM users WHERE username = 'user1'),
 (SELECT id FROM users WHERE username = 'admin')),
('学习React', '学习React框架基础知识', 'in_progress', 'medium',
 (SELECT id FROM categories WHERE name = '学习'),
 (SELECT id FROM users WHERE username = 'user1'),
 (SELECT id FROM users WHERE username = 'user1')),
('购买生活用品', '去超市购买日常生活用品', 'pending', 'low',
 (SELECT id FROM categories WHERE name = '个人'),
 (SELECT id FROM users WHERE username = 'user2'),
 (SELECT id FROM users WHERE username = 'user2'))
ON CONFLICT DO NOTHING;

-- 8. 启用行级安全策略（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 9. 创建安全策略
-- 用户只能查看和修改自己的信息
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 所有用户都可以查看分类
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

-- 只有管理员可以创建、更新、删除分类
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 用户可以查看分配给自己的任务或自己创建的任务
CREATE POLICY "Users can view relevant tasks" ON tasks
    FOR SELECT USING (
        auth.uid() = assigned_to OR 
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 用户可以创建任务
CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 用户可以更新分配给自己的任务或自己创建的任务
CREATE POLICY "Users can update relevant tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = assigned_to OR 
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 只有任务创建者或管理员可以删除任务
CREATE POLICY "Creators and admins can delete tasks" ON tasks
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

COMMIT;