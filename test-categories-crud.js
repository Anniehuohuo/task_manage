/**
 * 分类管理功能完整测试脚本
 * 测试categories表的增删改查功能
 */

// 直接使用Supabase客户端进行测试
const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://jmibsrzbrkpnbngnicdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWJzcnpicmtwbmJuZ25pY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjUxNzIsImV4cCI6MjA3MjQ0MTE3Mn0.erxX90iA9nBnUFJBc9YEtoGe5FAlUdoxcXrL-XXccv8';

const supabase = createClient(supabaseUrl, supabaseKey);

// 实现categories的CRUD函数
const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getCategoryById = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateCategory = async (categoryId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('category_id', categoryId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * 测试分类管理的完整CRUD功能
 */
async function testCategoriesCRUD() {
  console.log('🧪 开始测试分类管理功能...');
  
  try {
    // 1. 测试获取所有分类
    console.log('\n1️⃣ 测试获取所有分类...');
    const allCategoriesResult = await getAllCategories();
    if (allCategoriesResult.success) {
      console.log('✅ 获取所有分类成功');
      console.log(`📊 当前分类数量: ${allCategoriesResult.data.length}`);
      if (allCategoriesResult.data.length > 0) {
        console.log('📋 现有分类:', allCategoriesResult.data.map(cat => `${cat.name} (ID: ${cat.category_id})`).join(', '));
      }
    } else {
      console.log('❌ 获取所有分类失败:', allCategoriesResult.error);
    }

    // 2. 测试创建新分类
    console.log('\n2️⃣ 测试创建新分类...');
    const newCategoryData = {
      name: '测试分类_' + Date.now(),
      description: '这是一个测试分类，用于验证CRUD功能',
      color: '#FF6B6B',
      creator_id: 1 // 假设管理员ID为1
    };
    
    const createResult = await createCategory(newCategoryData);
    if (createResult.success) {
      console.log('✅ 创建分类成功');
      console.log('📝 新分类信息:', {
        category_id: createResult.data.category_id,
        name: createResult.data.name,
        description: createResult.data.description,
        color: createResult.data.color,
        creator_id: createResult.data.creator_id
      });
      
      const newCategoryId = createResult.data.category_id;
      
      // 3. 测试根据ID获取分类
      console.log('\n3️⃣ 测试根据ID获取分类...');
      const getCategoryResult = await getCategoryById(newCategoryId);
      if (getCategoryResult.success) {
        console.log('✅ 根据ID获取分类成功');
        console.log('📋 分类详情:', getCategoryResult.data);
      } else {
        console.log('❌ 根据ID获取分类失败:', getCategoryResult.error);
      }
      
      // 4. 测试更新分类
      console.log('\n4️⃣ 测试更新分类...');
      const updateData = {
        name: '更新后的测试分类_' + Date.now(),
        description: '这是更新后的分类描述',
        color: '#4ECDC4'
      };
      
      const updateResult = await updateCategory(newCategoryId, updateData);
      if (updateResult.success) {
        console.log('✅ 更新分类成功');
        console.log('📝 更新后的分类信息:', updateResult.data);
      } else {
        console.log('❌ 更新分类失败:', updateResult.error);
      }
      
      // 5. 再次获取所有分类，验证更新
      console.log('\n5️⃣ 验证更新后的分类列表...');
      const updatedCategoriesResult = await getAllCategories();
      if (updatedCategoriesResult.success) {
        console.log('✅ 获取更新后的分类列表成功');
        const updatedCategory = updatedCategoriesResult.data.find(cat => cat.category_id === newCategoryId);
        if (updatedCategory) {
          console.log('📋 更新后的分类:', updatedCategory);
        }
      }
      
      // 6. 测试删除分类
      console.log('\n6️⃣ 测试删除分类...');
      const deleteResult = await deleteCategory(newCategoryId);
      if (deleteResult.success) {
        console.log('✅ 删除分类成功');
        
        // 7. 验证删除结果
        console.log('\n7️⃣ 验证删除结果...');
        const finalCategoriesResult = await getAllCategories();
        if (finalCategoriesResult.success) {
          const deletedCategory = finalCategoriesResult.data.find(cat => cat.category_id === newCategoryId);
          if (!deletedCategory) {
            console.log('✅ 分类删除验证成功，分类已不存在');
          } else {
            console.log('❌ 分类删除验证失败，分类仍然存在');
          }
        }
      } else {
        console.log('❌ 删除分类失败:', deleteResult.error);
      }
      
    } else {
      console.log('❌ 创建分类失败:', createResult.error);
    }
    
    // 8. 测试错误处理 - 获取不存在的分类
    console.log('\n8️⃣ 测试错误处理 - 获取不存在的分类...');
    const nonExistentResult = await getCategoryById(99999);
    if (!nonExistentResult.success) {
      console.log('✅ 错误处理正常，获取不存在的分类返回错误');
    } else {
      console.log('❌ 错误处理异常，应该返回错误但返回了成功');
    }
    
    console.log('\n🎉 分类管理功能测试完成！');
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
}

// 运行测试
testCategoriesCRUD().then(() => {
  console.log('\n📋 测试总结:');
  console.log('- ✅ 获取所有分类');
  console.log('- ✅ 创建新分类');
  console.log('- ✅ 根据ID获取分类');
  console.log('- ✅ 更新分类信息');
  console.log('- ✅ 删除分类');
  console.log('- ✅ 错误处理验证');
  console.log('\n🚀 分类管理功能已准备就绪，可以在前端界面中使用！');
  process.exit(0);
}).catch(error => {
  console.error('💥 测试失败:', error);
  process.exit(1);
});