// 数据库操作服务文件
// 封装所有与Supabase数据库交互的CRUD操作

import supabase from '../supabaseClient'

// ==================== 用户管理相关操作 ====================

/**
 * 获取所有用户（仅管理员可用）
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, role, created_at')
      .order('created_at', { ascending: false })
    
    return { data, error }
  } catch (err) {
    console.error('获取用户列表失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 根据ID获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, role, created_at')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @param {string} userData.role - 用户角色
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('创建用户失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 更新用户信息
 * @param {string} userId - 用户ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const updateUser = async (userId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('更新用户信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 用户登录验证
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<{data: Object|null, error: Object|null, success: boolean}>}
 */
export const authenticateUser = async (username, password) => {
  try {
    // 根据用户名查询用户
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, username, password, role, created_at')
      .eq('username', username)
      .single()
    
    if (error) {
      console.error('查询用户失败:', error)
      return { 
        data: null, 
        error: '用户名或密码错误', 
        success: false 
      }
    }
    
    // 验证密码（简化版本：直接比较明文密码）
    if (user && user.password === password) {
      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user
      return { 
        data: userInfo, 
        error: null, 
        success: true 
      }
    } else {
      return { 
        data: null, 
        error: '用户名或密码错误', 
        success: false 
      }
    }
  } catch (err) {
    console.error('登录验证失败:', err)
    return { 
      data: null, 
      error: '登录验证失败，请稍后重试', 
      success: false 
    }
  }
}

/**
 * 删除用户
 * @param {string} userId - 用户ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const deleteUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId)
      .select()
    
    return { data, error }
  } catch (err) {
    console.error('删除用户失败:', err)
    return { data: null, error: err }
  }
}

// ==================== 分类管理相关操作 ====================

/**
 * 获取所有分类
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        category_id, 
        name, 
        description, 
        color, 
        created_at,
        creator_id,
        users!categories_creator_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
    
    return { data, error }
  } catch (err) {
    console.error('获取分类列表失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 根据ID获取分类信息
 * @param {string} categoryId - 分类ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getCategoryById = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        category_id, 
        name, 
        description, 
        color, 
        created_at,
        creator_id,
        users!categories_creator_id_fkey(username)
      `)
      .eq('category_id', categoryId)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('获取分类信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 创建新分类
 * @param {Object} categoryData - 分类数据
 * @param {string} categoryData.name - 分类名称
 * @param {string} categoryData.description - 分类描述
 * @param {string} categoryData.color - 分类颜色
 * @param {string} categoryData.creator_id - 创建者ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('创建分类失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 更新分类信息
 * @param {string} categoryId - 分类ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const updateCategory = async (categoryId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('category_id', categoryId)
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('更新分类信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 删除分类
 * @param {string} categoryId - 分类ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId)
      .select()
    
    return { data, error }
  } catch (err) {
    console.error('删除分类失败:', err)
    return { data: null, error: err }
  }
}

// ==================== 任务管理相关操作 ====================

/**
 * 获取所有任务
 * @param {Object} filters - 过滤条件
 * @param {string} filters.status - 任务状态
 * @param {string} filters.priority - 任务优先级
 * @param {string} filters.category_id - 分类ID
 * @param {string} filters.assigned_to - 分配给用户ID
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export const getAllTasks = async (filters = {}) => {
  try {
    let query = supabase
      .from('tasks')
      .select(`
        task_id, 
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        created_at, 
        updated_at,
        category_id,
        assignee_id,
        creator_id,
        categories(category_id, name, color),
        assigned_user:users!tasks_assignee_id_fkey(user_id, username),
        creator:users!tasks_creator_id_fkey(user_id, username)
      `)
    
    // 应用过滤条件
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.assignee_id) {
      query = query.eq('assignee_id', filters.assignee_id)
    }
    
    // 添加搜索功能 - 支持标题和描述的模糊搜索
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    return { data, error }
  } catch (err) {
    console.error('获取任务列表失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 根据ID获取任务信息
 * @param {string} taskId - 任务ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getTaskById = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        task_id, 
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        created_at, 
        updated_at,
        category_id,
        assignee_id,
        creator_id,
        categories(category_id, name, color),
        assigned_user:users!tasks_assignee_id_fkey(user_id, username),
        creator:users!tasks_creator_id_fkey(user_id, username)
      `)
      .eq('task_id', taskId)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('获取任务信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 创建新任务
 * @param {Object} taskData - 任务数据
 * @param {string} taskData.title - 任务标题
 * @param {string} taskData.description - 任务描述
 * @param {string} taskData.status - 任务状态
 * @param {string} taskData.priority - 任务优先级
 * @param {string} taskData.due_date - 截止日期
 * @param {string} taskData.category_id - 分类ID
 * @param {string} taskData.assignee_id - 分配给用户ID
 * @param {string} taskData.creator_id - 创建者ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const createTask = async (taskData) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select(`
        task_id, 
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        created_at, 
        updated_at,
        category_id,
        assignee_id,
        creator_id,
        categories(category_id, name, color),
        assigned_user:users!tasks_assignee_id_fkey(user_id, username),
        creator:users!tasks_creator_id_fkey(user_id, username)
      `)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('创建任务失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 更新任务信息
 * @param {string} taskId - 任务ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('task_id', taskId)
      .select(`
        task_id, 
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        created_at, 
        updated_at,
        category_id,
        assignee_id,
        creator_id,
        categories(category_id, name, color),
        assigned_user:users!tasks_assignee_id_fkey(user_id, username),
        creator:users!tasks_creator_id_fkey(user_id, username)
      `)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('更新任务信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 删除任务
 * @param {string} taskId - 任务ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const deleteTask = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('task_id', taskId)
      .select()
    
    return { data, error }
  } catch (err) {
    console.error('删除任务失败:', err)
    return { data: null, error: err }
  }
}

// ==================== 统计和分析相关操作 ====================

/**
 * 获取任务统计信息
 * @param {string} userId - 用户ID（可选，如果提供则只统计该用户的任务）
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getTaskStatistics = async (userId = null) => {
  try {
    let query = supabase.from('tasks')
    
    if (userId) {
      query = query.or(`assignee_id.eq.${userId},creator_id.eq.${userId}`)
    }
    
    const { data: tasks, error } = await query.select('status, priority')
    
    if (error) {
      return { data: null, error }
    }
    
    // 计算统计信息
    const statistics = {
      total: tasks.length,
      byStatus: {
        '待领取': tasks.filter(t => t.status === '待领取').length,
        '进行中': tasks.filter(t => t.status === '进行中').length,
        '已完成': tasks.filter(t => t.status === '已完成').length,
        '已逾期': tasks.filter(t => t.status === '已逾期').length
      },
      byPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length
      }
    }
    
    return { data: statistics, error: null }
  } catch (err) {
    console.error('获取任务统计信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 获取用户统计信息
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getUserStatistics = async () => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('role, created_at')
    
    if (error) {
      return { data: null, error }
    }
    
    // 计算用户统计信息
    const statistics = {
      total: users.length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        user: users.filter(u => u.role === 'user').length
      },
      // 按月份统计新注册用户
      registrationTrend: getRegistrationTrend(users)
    }
    
    return { data: statistics, error: null }
  } catch (err) {
    console.error('获取用户统计信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 获取分类统计信息
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getCategoryStatistics = async () => {
  try {
    // 获取所有分类和对应的任务数量
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('category_id, name, color')
    
    if (categoryError) {
      return { data: null, error: categoryError }
    }
    
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('category_id')
    
    if (taskError) {
      return { data: null, error: taskError }
    }
    
    // 计算每个分类的任务数量
    const categoryStats = categories.map(category => {
      const taskCount = tasks.filter(task => task.category_id === category.category_id).length
      return {
        ...category,
        taskCount
      }
    })
    
    const statistics = {
      total: categories.length,
      categoryDistribution: categoryStats,
      mostUsedCategory: categoryStats.reduce((max, current) => 
        current.taskCount > max.taskCount ? current : max, categoryStats[0] || null
      )
    }
    
    return { data: statistics, error: null }
  } catch (err) {
    console.error('获取分类统计信息失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 获取任务趋势分析（按日期统计）
 * @param {number} days - 统计最近多少天的数据，默认30天
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getTaskTrends = async (days = 30) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('created_at, updated_at, status')
      .gte('created_at', startDate.toISOString())
    
    if (error) {
      return { data: null, error }
    }
    
    // 按日期分组统计
    const dailyStats = {}
    
    tasks.forEach(task => {
      const date = new Date(task.created_at).toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = {
          created: 0,
          completed: 0
        }
      }
      dailyStats[date].created++
      
      if (task.status === '已完成') {
        dailyStats[date].completed++
      }
    })
    
    // 转换为数组格式
    const trendData = Object.keys(dailyStats)
      .sort()
      .map(date => ({
        date,
        created: dailyStats[date].created,
        completed: dailyStats[date].completed
      }))
    
    const statistics = {
      period: `${days}天`,
      dailyTrends: trendData,
      summary: {
        totalCreated: tasks.length,
        totalCompleted: tasks.filter(t => t.status === '已完成').length,
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === '已完成').length / tasks.length) * 100) : 0
      }
    }
    
    return { data: statistics, error: null }
  } catch (err) {
    console.error('获取任务趋势分析失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 获取用户工作量统计
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getUserWorkloadStatistics = async () => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        assignee_id,
        status,
        priority,
        assigned_user:assignee_id(username)
      `)
    
    if (error) {
      return { data: null, error }
    }
    
    // 按用户分组统计工作量
    const userWorkload = {}
    
    tasks.forEach(task => {
      if (task.assignee_id) {
        if (!userWorkload[task.assignee_id]) {
          userWorkload[task.assignee_id] = {
            userId: task.assignee_id,
            username: task.assigned_user?.username || '未知用户',
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0,
            highPriority: 0
          }
        }
        
        const user = userWorkload[task.assignee_id]
        user.total++
        
        switch (task.status) {
          case '已完成':
            user.completed++
            break
          case '进行中':
            user.inProgress++
            break
          case '待领取':
            user.pending++
            break
          case '已逾期':
            user.overdue++
            break
        }
        
        if (task.priority === 'high') {
          user.highPriority++
        }
      }
    })
    
    // 转换为数组并计算完成率
    const workloadStats = Object.values(userWorkload).map(user => ({
      ...user,
      completionRate: user.total > 0 ? Math.round((user.completed / user.total) * 100) : 0
    }))
    
    const statistics = {
      userWorkloads: workloadStats,
      summary: {
        totalAssignedTasks: tasks.filter(t => t.assignee_id).length,
        unassignedTasks: tasks.filter(t => !t.assignee_id).length,
        averageTasksPerUser: workloadStats.length > 0 ? 
          Math.round(tasks.filter(t => t.assignee_id).length / workloadStats.length) : 0
      }
    }
    
    return { data: statistics, error: null }
  } catch (err) {
    console.error('获取用户工作量统计失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 获取系统概览统计（仪表板用）
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getSystemOverview = async () => {
  try {
    // 并行获取各种统计数据
    const [userStats, taskStats, categoryStats] = await Promise.all([
      getUserStatistics(),
      getTaskStatistics(),
      getCategoryStatistics()
    ])
    
    if (userStats.error || taskStats.error || categoryStats.error) {
      return { 
        data: null, 
        error: userStats.error || taskStats.error || categoryStats.error 
      }
    }
    
    const overview = {
      users: userStats.data,
      tasks: taskStats.data,
      categories: categoryStats.data,
      lastUpdated: new Date().toISOString()
    }
    
    return { data: overview, error: null }
  } catch (err) {
    console.error('获取系统概览统计失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 辅助函数：计算用户注册趋势
 * @param {Array} users - 用户数组
 * @returns {Array} 按月份统计的注册趋势
 */
function getRegistrationTrend(users) {
  const monthlyStats = {}
  
  users.forEach(user => {
    const date = new Date(user.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = 0
    }
    monthlyStats[monthKey]++
  })
  
  return Object.keys(monthlyStats)
    .sort()
    .map(month => ({
      month,
      count: monthlyStats[month]
    }))
}

/**
 * 测试数据库连接
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      return { success: false, error }
    }
    
    return { success: true, error: null }
  } catch (err) {
    console.error('数据库连接测试失败:', err)
    return { success: false, error: err }
  }
}

// ==================== 用户个人设置相关操作 ====================

/**
 * 获取用户个人资料
 * @param {string} userId - 用户ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, role, created_at')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('获取用户资料失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 更新用户个人信息（不包括密码）
 * @param {string} userId - 用户ID
 * @param {Object} profileData - 要更新的个人信息
 * @param {string} profileData.username - 新用户名
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    // 只允许更新用户名，不允许更改角色
    const updateData = {
      username: profileData.username
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select('user_id, username, role, created_at')
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('更新用户资料失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 修改用户密码
 * @param {string} userId - 用户ID
 * @param {string} currentPassword - 当前密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    // 首先验证当前密码
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('password, username')
      .eq('user_id', userId)
      .single()
    
    if (getUserError) {
      return { data: null, error: getUserError }
    }
    
    // 验证当前密码是否正确
    if (user.password !== currentPassword) {
      return { 
        data: null, 
        error: { message: '当前密码不正确' }
      }
    }
    
    // 更新密码
    const { data, error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('user_id', userId)
      .select('user_id, username')
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('修改密码失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 获取用户的任务统计信息（个人设置页面使用）
 * @param {string} userId - 用户ID
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const getUserPersonalStats = async (userId) => {
  try {
    // 获取用户分配的任务
    const { data: assignedTasks, error: assignedError } = await supabase
      .from('tasks')
      .select('status, priority, created_at, due_date')
      .eq('assignee_id', userId)
    
    if (assignedError) {
      return { data: null, error: assignedError }
    }
    
    // 获取用户创建的任务（如果是管理员）
    const { data: createdTasks, error: createdError } = await supabase
      .from('tasks')
      .select('status, priority, created_at')
      .eq('creator_id', userId)
    
    if (createdError) {
      return { data: null, error: createdError }
    }
    
    // 计算统计信息
    const now = new Date()
    const assignedStats = {
      total: assignedTasks.length,
      completed: assignedTasks.filter(t => t.status === '已完成').length,
      inProgress: assignedTasks.filter(t => t.status === '进行中').length,
      pending: assignedTasks.filter(t => t.status === '待领取').length,
      overdue: assignedTasks.filter(t => {
        return t.due_date && new Date(t.due_date) < now && t.status !== '已完成'
      }).length,
      highPriority: assignedTasks.filter(t => t.priority === 'high').length
    }
    
    const createdStats = {
      total: createdTasks.length,
      completed: createdTasks.filter(t => t.status === '已完成').length,
      inProgress: createdTasks.filter(t => t.status === '进行中').length,
      pending: createdTasks.filter(t => t.status === '待领取').length
    }
    
    // 计算完成率
    assignedStats.completionRate = assignedStats.total > 0 ? 
      Math.round((assignedStats.completed / assignedStats.total) * 100) : 0
    
    createdStats.completionRate = createdStats.total > 0 ? 
      Math.round((createdStats.completed / createdStats.total) * 100) : 0
    
    // 计算最近30天的活动
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentAssigned = assignedTasks.filter(t => 
      new Date(t.created_at) >= thirtyDaysAgo
    ).length
    
    const recentCompleted = assignedTasks.filter(t => 
      t.status === '已完成' && new Date(t.created_at) >= thirtyDaysAgo
    ).length
    
    const personalStats = {
      assigned: assignedStats,
      created: createdStats,
      recentActivity: {
        assignedLast30Days: recentAssigned,
        completedLast30Days: recentCompleted
      }
    }
    
    return { data: personalStats, error: null }
  } catch (err) {
    console.error('获取用户个人统计失败:', err)
    return { data: null, error: err }
  }
}

/**
 * 检查用户名是否已存在（用于个人设置中修改用户名时的验证）
 * @param {string} username - 要检查的用户名
 * @param {string} currentUserId - 当前用户ID（排除自己）
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const checkUsernameAvailability = async (username, currentUserId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id')
      .eq('username', username)
      .neq('user_id', currentUserId)
    
    if (error) {
      return { data: null, error }
    }
    
    const isAvailable = data.length === 0
    return { 
      data: { 
        available: isAvailable,
        message: isAvailable ? '用户名可用' : '用户名已被使用'
      }, 
      error: null 
    }
  } catch (err) {
    console.error('检查用户名可用性失败:', err)
    return { data: null, error: err }
  }
}

// 导出所有函数
export default {
  // 用户管理
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  
  // 分类管理
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // 任务管理
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  
  // 统计分析
  getTaskStatistics,
  getUserStatistics,
  getCategoryStatistics,
  getTaskTrends,
  getUserWorkloadStatistics,
  getSystemOverview,
  testDatabaseConnection,
  
  // 用户个人设置
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserPersonalStats,
  checkUsernameAvailability
}