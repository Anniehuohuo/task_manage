// 任务列表组件 - 普通用户查看任务
import React, { useState, useEffect } from 'react'
import {
  getAllTasks,
  getAllCategories,
  updateTask
} from '../services/databaseService'

/**
 * 任务列表组件 - 普通用户可以查看任务列表并更新分配给自己的任务状态
 * @param {Object} props - 组件属性
 * @param {Object} props.currentUser - 当前登录用户信息
 * @returns {JSX.Element} 任务列表界面
 */
const TaskList = ({ currentUser }) => {
  // 状态管理
  const [tasks, setTasks] = useState([]) // 任务列表
  const [categories, setCategories] = useState([]) // 分类列表
  const [loading, setLoading] = useState(true) // 加载状态
  const [error, setError] = useState('') // 错误信息
  const [filters, setFilters] = useState({ // 过滤条件
    status: '',
    priority: '',
    category_id: '',
    showMyTasks: false // 是否只显示分配给我的任务
  })

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadData()
  }, [])

  /**
   * 当过滤条件改变时重新加载任务
   */
  useEffect(() => {
    loadTasks()
  }, [filters])

  /**
   * 加载所有必要的数据
   */
  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadTasks(),
        loadCategories()
      ])
    } catch (err) {
      setError('加载数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载任务列表
   */
  const loadTasks = async () => {
    try {
      const { data, error } = await getAllTasks(filters)
      if (error) {
        setError('获取任务列表失败: ' + error.message)
      } else {
        let filteredTasks = data || []
        
        // 如果选择只显示我的任务，则过滤出分配给当前用户的任务
        if (filters.showMyTasks) {
          filteredTasks = filteredTasks.filter(task => 
            task.assignee_id === currentUser.user_id
          )
        }
        
        setTasks(filteredTasks)
      }
    } catch (err) {
      setError('获取任务列表失败')
    }
  }

  /**
   * 加载分类列表
   */
  const loadCategories = async () => {
    try {
      const { data, error } = await getAllCategories()
      if (error) {
        console.error('获取分类列表失败:', error)
      } else {
        setCategories(data || [])
      }
    } catch (err) {
      console.error('获取分类列表失败:', err)
    }
  }

  /**
   * 处理任务状态更新（仅限分配给当前用户的任务）
   */
  const handleStatusUpdate = async (taskId, newStatus) => {
    const task = tasks.find(t => t.task_id === taskId)
    
    // 检查权限：只能更新分配给自己的任务
    if (task.assignee_id !== currentUser.user_id) {
      setError('您只能更新分配给自己的任务状态')
      return
    }

    try {
      const { data, error } = await updateTask(taskId, { status: newStatus })
      if (error) {
        setError('更新任务状态失败: ' + error.message)
      } else {
        setTasks(tasks.map(task => 
          task.task_id === taskId ? { ...task, status: newStatus } : task
        ))
        setError('')
      }
    } catch (err) {
      setError('更新任务状态失败')
    }
  }

  /**
   * 处理领取任务（将未分配的任务分配给当前用户）
   */
  const handleClaimTask = async (taskId) => {
    const task = tasks.find(t => t.task_id === taskId)
    
    // 检查任务是否已被分配
    if (task.assignee_id) {
      setError('该任务已被分配给其他用户')
      return
    }

    try {
      const { data, error } = await updateTask(taskId, { 
        assignee_id: currentUser.user_id,
        status: '进行中'
      })
      if (error) {
        setError('领取任务失败: ' + error.message)
      } else {
        setTasks(tasks.map(task => 
          task.task_id === taskId ? { 
            ...task, 
            assignee_id: currentUser.user_id,
            status: '进行中',
            assigned_user: { username: currentUser.username }
          } : task
        ))
        setError('')
      }
    } catch (err) {
      setError('领取任务失败')
    }
  }

  /**
   * 处理过滤条件变化
   */
  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    })
  }

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString) => {
    if (!dateString) return '未设置'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  /**
   * 获取状态对应的颜色 - 黑白风格
   */
  const getStatusColor = (status) => {
    const colors = {
      '待领取': '#666666',
      '进行中': '#000000',
      '已完成': '#333333',
      '已逾期': '#000000'
    }
    return colors[status] || '#666666'
  }

  /**
   * 获取优先级对应的颜色 - 黑白风格
   */
  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#666666',
      'medium': '#333333',
      'high': '#000000'
    }
    return colors[priority] || '#666666'
  }

  /**
   * 检查用户是否可以更新任务状态
   */
  const canUpdateStatus = (task) => {
    return task.assignee_id === currentUser.user_id
  }

  /**
   * 检查用户是否可以领取任务
   */
  const canClaimTask = (task) => {
    return !task.assignee_id && task.status === '待领取'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>正在加载任务数据...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>任务列表</h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          当前用户：{currentUser.username} (普通用户)
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* 过滤器 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.showMyTasks}
              onChange={(e) => handleFilterChange('showMyTasks', e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            只显示我的任务
          </label>
        </div>
        
        <div>
          <label>状态筛选：</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="">全部状态</option>
            <option value="待领取">待领取</option>
            <option value="进行中">进行中</option>
            <option value="已完成">已完成</option>
            <option value="已逾期">已逾期</option>
          </select>
        </div>
        
        <div>
          <label>优先级筛选：</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="">全部优先级</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
        
        <div>
          <label>分类筛选：</label>
          <select
            value={filters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="">全部分类</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 任务列表 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>
          {filters.showMyTasks ? '我的任务' : '所有任务'} ({tasks.length} 个任务)
        </h3>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>
            {filters.showMyTasks ? '暂无分配给您的任务' : '暂无任务数据'}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {tasks.map(task => (
              <div
                key={task.task_id}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: canUpdateStatus(task) ? '0 2px 4px rgba(0,123,255,0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {task.title}
                      {canUpdateStatus(task) && (
                        <span style={{
                          marginLeft: '10px',
                          fontSize: '12px',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          padding: '2px 6px',
                          borderRadius: '3px'
                        }}>
                          我的任务
                        </span>
                      )}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      {task.description || '无描述'}
                    </p>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px' }}>
                      <span>
                        状态: 
                        <span style={{ 
                          color: getStatusColor(task.status),
                          fontWeight: 'bold'
                        }}>
                          {task.status}
                        </span>
                      </span>
                      <span>
                        优先级: 
                        <span style={{ 
                          color: getPriorityColor(task.priority),
                          fontWeight: 'bold'
                        }}>
                          {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : '高'}
                        </span>
                      </span>
                      <span>分类: {task.categories?.name || '未分类'}</span>
                      <span>截止日期: {formatDate(task.due_date)}</span>
                      <span>负责人: {task.assigned_user?.username || '未分配'}</span>
                      <span>创建者: {task.creator?.username || '未知'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    {/* 领取任务按钮 */}
                    {canClaimTask(task) && (
                      <button
                        onClick={() => handleClaimTask(task.task_id)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        领取任务
                      </button>
                    )}
                    
                    {/* 状态更新按钮 */}
                    {canUpdateStatus(task) && (
                      <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                        {task.status === '进行中' && (
                          <button
                            onClick={() => handleStatusUpdate(task.task_id, '已完成')}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            标记完成
                          </button>
                        )}
                        {task.status === '已完成' && (
                          <button
                            onClick={() => handleStatusUpdate(task.task_id, '进行中')}
                            style={{
                              backgroundColor: '#ffc107',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            重新开始
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '5px',
        padding: '15px',
        marginTop: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>使用说明：</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
          <li>您可以查看所有任务，或者只查看分配给您的任务</li>
          <li>对于未分配的任务，您可以点击"领取任务"按钮来领取</li>
          <li>对于分配给您的任务，您可以更新任务状态（进行中 ↔ 已完成）</li>
          <li>使用过滤器可以快速找到特定状态、优先级或分类的任务</li>
        </ul>
      </div>
    </div>
  )
}

export default TaskList