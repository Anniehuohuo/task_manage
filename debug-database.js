// 数据库调试脚本
// 用于检查Supabase数据库的实际表结构和数据

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://jmibsrzbrkpnbngnicdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWJzcnpicmtwbmJuZ25pY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjUxNzIsImV4cCI6MjA3MjQ0MTE3Mn0.erxX90iA9nBnUFJBc9YEtoGe5FAlUdoxcXrL-XXccv8';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 检查数据库连接
 */
async function checkConnection() {
  console.log('🔍 检查数据库连接...');
  
  try {
    // 尝试执行一个简单的查询
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      console.error('错误详情:', error);
      return false;
    }
    
    console.log('✅ 数据库连接成功!');
    console.log('查询结果:', data);
    return true;
  } catch (err) {
    console.error('❌ 数据库连接异常:', err.message);
    return false;
  }
}

/**
 * 检查表是否存在
 */
async function checkTablesExist() {
  console.log('\n📋 检查数据库表是否存在...');
  
  const tables = ['users', 'categories', 'tasks'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ 表 '${table}' 不存在或无法访问:`, error.message);
      } else {
        console.log(`✅ 表 '${table}' 存在`);
        if (data && data.length > 0) {
          console.log(`   - 包含 ${data.length} 条记录`);
          console.log(`   - 字段:`, Object.keys(data[0]).join(', '));
        } else {
          console.log(`   - 表为空`);
        }
      }
    } catch (err) {
      console.log(`❌ 检查表 '${table}' 时发生异常:`, err.message);
    }
  }
}

/**
 * 尝试创建测试用户
 */
async function testCreateUser() {
  console.log('\n➕ 测试创建用户...');
  
  const testUser = {
    username: 'debug_test_' + Date.now(),
    email: `debug_${Date.now()}@test.com`,
    password_hash: '$2b$10$test_hash',
    role: 'user'
  };
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (error) {
      console.error('❌ 创建用户失败:', error.message);
      console.error('错误详情:', error);
      return null;
    }
    
    console.log('✅ 成功创建测试用户:', data);
    return data[0];
  } catch (err) {
    console.error('❌ 创建用户异常:', err.message);
    return null;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData(userId) {
  if (!userId) return;
  
  console.log('\n🧹 清理测试数据...');
  
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ 清理测试数据失败:', error.message);
    } else {
      console.log('✅ 测试数据清理完成');
    }
  } catch (err) {
    console.error('❌ 清理测试数据异常:', err.message);
  }
}

/**
 * 检查现有用户数据
 */
async function checkExistingUsers() {
  console.log('\n👥 检查现有用户数据...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ 查询用户失败:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ 找到 ${data.length} 个用户:`);
      data.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('ℹ️ 用户表为空');
    }
  } catch (err) {
    console.error('❌ 查询用户异常:', err.message);
  }
}

/**
 * 运行所有调试检查
 */
async function runDebugChecks() {
  console.log('🚀 开始数据库调试检查\n');
  
  // 检查连接
  const connectionOk = await checkConnection();
  if (!connectionOk) {
    console.log('\n❌ 数据库连接失败，无法继续调试');
    return;
  }
  
  // 检查表结构
  await checkTablesExist();
  
  // 检查现有用户
  await checkExistingUsers();
  
  // 测试创建用户
  const testUser = await testCreateUser();
  
  // 清理测试数据
  if (testUser && testUser.id) {
    await cleanupTestData(testUser.id);
  }
  
  console.log('\n🎉 数据库调试检查完成!');
  console.log('\n💡 如果表不存在，请在Supabase控制台执行以下步骤:');
  console.log('   1. 登录 https://supabase.com');
  console.log('   2. 选择你的项目');
  console.log('   3. 进入 SQL Editor');
  console.log('   4. 执行 supabase-setup.sql 脚本');
  console.log('   5. 执行 test-users.sql 脚本添加测试数据');
}

// 运行调试
if (require.main === module) {
  runDebugChecks().catch(console.error);
}

module.exports = {
  checkConnection,
  checkTablesExist,
  testCreateUser,
  cleanupTestData,
  checkExistingUsers,
  runDebugChecks
};