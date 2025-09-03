// 用户管理功能测试脚本
// 用于验证用户CRUD操作是否正常工作

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://jmibsrzbrkpnbngnicdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWJzcnpicmtwbmJuZ25pY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjUxNzIsImV4cCI6MjA3MjQ0MTE3Mn0.erxX90iA9nBnUFJBc9YEtoGe5FAlUdoxcXrL-XXccv8';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 测试数据库连接
 */
async function testConnection() {
  console.log('🔍 测试数据库连接...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功!');
    return true;
  } catch (err) {
    console.error('❌ 数据库连接异常:', err.message);
    return false;
  }
}

/**
 * 测试获取所有用户
 */
async function testGetAllUsers() {
  console.log('\n📋 测试获取所有用户...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取用户列表失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功获取 ${data.length} 个用户:`);
    data.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
    });
    return true;
  } catch (err) {
    console.error('❌ 获取用户列表异常:', err.message);
    return false;
  }
}

/**
 * 测试用户登录验证
 */
async function testUserLogin() {
  console.log('\n🔐 测试用户登录验证...');
  
  const testCases = [
    { username: 'admin', password: 'admin123', expected: true },
    { username: 'user1', password: 'user123', expected: true },
    { username: 'admin', password: 'wrongpassword', expected: false },
    { username: 'nonexistent', password: 'password', expected: false }
  ];
  
  for (const testCase of testCases) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, password_hash, role, created_at')
        .eq('username', testCase.username)
        .single();
      
      if (error && testCase.expected) {
        console.log(`❌ ${testCase.username}/${testCase.password} - 用户不存在`);
        continue;
      }
      
      if (!error && user) {
        const expectedHash = `$2b$10$example_hash_for_${testCase.password}`;
        const isValid = user.password_hash === expectedHash;
        
        if (isValid === testCase.expected) {
          console.log(`✅ ${testCase.username}/${testCase.password} - 验证${isValid ? '成功' : '失败'}`);
        } else {
          console.log(`❌ ${testCase.username}/${testCase.password} - 预期${testCase.expected ? '成功' : '失败'}，实际${isValid ? '成功' : '失败'}`);
        }
      } else if (!testCase.expected) {
        console.log(`✅ ${testCase.username}/${testCase.password} - 正确拒绝`);
      }
    } catch (err) {
      console.error(`❌ ${testCase.username}/${testCase.password} - 异常:`, err.message);
    }
  }
}

/**
 * 测试创建用户
 */
async function testCreateUser() {
  console.log('\n➕ 测试创建用户...');
  
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    password_hash: '$2b$10$example_hash_for_testpass',
    role: 'user'
  };
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();
    
    if (error) {
      console.error('❌ 创建用户失败:', error.message);
      return null;
    }
    
    console.log(`✅ 成功创建用户: ${data.username} (ID: ${data.id})`);
    return data;
  } catch (err) {
    console.error('❌ 创建用户异常:', err.message);
    return null;
  }
}

/**
 * 测试更新用户
 */
async function testUpdateUser(userId) {
  if (!userId) return false;
  
  console.log('\n✏️ 测试更新用户...');
  
  const updateData = {
    email: `updated_${Date.now()}@example.com`
  };
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ 更新用户失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功更新用户: ${data.username} - 新邮箱: ${data.email}`);
    return true;
  } catch (err) {
    console.error('❌ 更新用户异常:', err.message);
    return false;
  }
}

/**
 * 测试删除用户
 */
async function testDeleteUser(userId) {
  if (!userId) return false;
  
  console.log('\n🗑️ 测试删除用户...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('❌ 删除用户失败:', error.message);
      return false;
    }
    
    console.log(`✅ 成功删除用户 (ID: ${userId})`);
    return true;
  } catch (err) {
    console.error('❌ 删除用户异常:', err.message);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始用户管理功能测试\n');
  
  // 测试数据库连接
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ 数据库连接失败，停止测试');
    return;
  }
  
  // 测试获取用户列表
  await testGetAllUsers();
  
  // 测试用户登录验证
  await testUserLogin();
  
  // 测试CRUD操作
  const createdUser = await testCreateUser();
  if (createdUser) {
    await testUpdateUser(createdUser.id);
    await testDeleteUser(createdUser.id);
  }
  
  console.log('\n🎉 用户管理功能测试完成!');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testConnection,
  testGetAllUsers,
  testUserLogin,
  testCreateUser,
  testUpdateUser,
  testDeleteUser,
  runAllTests
};