// 检查categories表的实际数据库结构
// 验证字段名称和数据

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://jmibsrzbrkpnbngnicdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWJzcnpicmtwbmJuZ25pY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjUxNzIsImV4cCI6MjA3MjQ0MTE3Mn0.erxX90iA9nBnUFJBc9YEtoGe5FAlUdoxcXrL-XXccv8';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 检查数据库连接
 */
async function testConnection() {
  console.log('🔗 测试数据库连接...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    return true;
  } catch (err) {
    console.error('❌ 数据库连接异常:', err.message);
    return false;
  }
}

/**
 * 检查categories表是否存在
 */
async function checkTableExists() {
  console.log('\n📋 检查categories表是否存在...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ categories表不存在或无法访问:', error.message);
      return false;
    }
    
    console.log('✅ categories表存在');
    return true;
  } catch (err) {
    console.error('❌ 检查表存在性异常:', err.message);
    return false;
  }
}

/**
 * 检查categories表的字段结构
 */
async function checkTableStructure() {
  console.log('\n🔍 检查categories表的字段结构...');
  
  try {
    // 尝试获取一条记录来查看字段结构
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 无法获取表结构:', error.message);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log('✅ 表字段结构:');
      const fields = Object.keys(data[0]);
      fields.forEach(field => {
        console.log(`  - ${field}: ${typeof data[0][field]} (示例值: ${data[0][field]})`);
      });
      return fields;
    } else {
      console.log('⚠️ 表为空，尝试创建测试记录来检查字段结构...');
      return await checkEmptyTableStructure();
    }
  } catch (err) {
    console.error('❌ 检查表结构异常:', err.message);
    return null;
  }
}

/**
 * 当表为空时，尝试创建测试记录来检查字段结构
 */
async function checkEmptyTableStructure() {
  console.log('\n🧪 尝试创建测试记录来检查字段结构...');
  
  // 根据SQL文件，尝试不同的字段组合
  const testCases = [
    // 尝试使用category_id (来自supabase-database.sql)
    {
      name: 'test_category_' + Date.now(),
      description: '测试分类',
      color: '#3498db',
      creator_id: 1
    },
    // 尝试使用id (来自现有代码)
    {
      name: 'test_category_' + Date.now(),
      description: '测试分类',
      color: '#3498db',
      created_by: 1
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testData = testCases[i];
    console.log(`\n尝试测试案例 ${i + 1}:`, testData);
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([testData])
        .select()
        .single();
      
      if (error) {
        console.log(`❌ 测试案例 ${i + 1} 失败:`, error.message);
        continue;
      }
      
      console.log(`✅ 测试案例 ${i + 1} 成功! 字段结构:`);
      const fields = Object.keys(data);
      fields.forEach(field => {
        console.log(`  - ${field}: ${typeof data[field]} (值: ${data[field]})`);
      });
      
      // 清理测试数据
      await cleanupTestData(data);
      return fields;
    } catch (err) {
      console.log(`❌ 测试案例 ${i + 1} 异常:`, err.message);
    }
  }
  
  return null;
}

/**
 * 清理测试数据
 */
async function cleanupTestData(data) {
  console.log('\n🧹 清理测试数据...');
  
  try {
    // 尝试使用不同的主键字段删除
    const deleteFields = ['category_id', 'id'];
    
    for (const field of deleteFields) {
      if (data[field]) {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq(field, data[field]);
        
        if (!error) {
          console.log(`✅ 使用 ${field} 字段成功删除测试数据`);
          return;
        }
      }
    }
    
    console.log('⚠️ 无法删除测试数据，请手动清理');
  } catch (err) {
    console.log('⚠️ 清理测试数据时出现异常:', err.message);
  }
}

/**
 * 获取现有的categories数据
 */
async function getExistingCategories() {
  console.log('\n📊 获取现有的categories数据...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取categories数据失败:', error.message);
      return;
    }
    
    console.log(`✅ 找到 ${data.length} 条categories记录:`);
    data.forEach((category, index) => {
      console.log(`\n记录 ${index + 1}:`);
      Object.keys(category).forEach(key => {
        console.log(`  ${key}: ${category[key]}`);
      });
    });
    
    return data;
  } catch (err) {
    console.error('❌ 获取categories数据异常:', err.message);
  }
}

/**
 * 运行所有检查
 */
async function runAllChecks() {
  console.log('🚀 开始检查categories表结构\n');
  
  // 检查数据库连接
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ 数据库连接失败，停止检查');
    return;
  }
  
  // 检查表是否存在
  const tableExists = await checkTableExists();
  if (!tableExists) {
    console.log('\n❌ categories表不存在，停止检查');
    return;
  }
  
  // 检查表结构
  const fields = await checkTableStructure();
  if (!fields) {
    console.log('\n❌ 无法确定表结构');
    return;
  }
  
  // 获取现有数据
  await getExistingCategories();
  
  console.log('\n🎉 categories表结构检查完成!');
  console.log('\n📝 检查总结:');
  console.log('   ✅ 数据库连接正常');
  console.log('   ✅ categories表存在');
  console.log('   ✅ 表字段结构已确认');
  console.log('\n💡 根据检查结果，可以开始实现categories的CRUD功能了!');
}

// 运行检查
if (require.main === module) {
  runAllChecks().catch(console.error);
}

module.exports = {
  testConnection,
  checkTableExists,
  checkTableStructure,
  getExistingCategories,
  runAllChecks
};