// 任务管理组件
import React, { useState, useEffect } from 'react'
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getAllCategories,
  getAllUsers
} from '../services/databaseService'

/**
 * 任务管理组件 - 管理员可以对任务进行增删改查操作
 * @param {Object} props - 组件属性
 * @param {Object} props.currentUser - 当前登录用户信息
 * @returns {JSX.Element} 任务管理界面
 */
const TaskManagement = ({ currentUser }) => {
  // 状态管理
  const [tasks, setTasks] = useState([]) // 任务列表
  const [categories, setCategories] = useState([]) // 分类列表
  const [users, setUsers] = useState([]) // 用户列表
  const [loading, setLoading] = useState(true) // 加载状态
  const [error, setError] = useState('') // 错误信息
  const [showCreateForm, setShowCreateForm] = useState(false) // 是否显示创建表单
  const [editingTask, setEditingTask] = useState(null) // 正在编辑的任务
  const [filters, setFilters] = useState({ // 过滤条件
    status: '',
    priority: '',
    category_id: '',
    search: '' // 搜索关键字
  })

  // 新任务表单数据
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: '待领取',
    priority: 'medium',
    due_date: '',
    category_id: '',
    assignee_id: null
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
        loadCategories(),
        loadUsers()
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
        setTasks(data || [])
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
   * 加载用户列表
   */
  const loadUsers = async () => {
    try {
      const { data, error } = await getAllUsers()
      if (error) {
        console.error('获取用户列表失败:', error)
      } else {
        setUsers(data || [])
      }
    } catch (err) {
      console.error('获取用户列表失败:', err)
    }
  }

  /**
   * 处理创建新任务
   */
  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    if (!newTask.title.trim()) {
      setError('任务标题不能为空')
      return
    }
    
    if (!newTask.category_id) {
      setError('请选择任务分类')
      return
    }

    try {
      const taskData = {
        ...newTask,
        creator_id: currentUser.user_id,
        assignee_id: newTask.assignee_id || null
      }
      
      const { data, error } = await createTask(taskData)
      if (error) {
        setError('创建任务失败: ' + error.message)
      } else {
        setTasks([data, ...tasks])
        setNewTask({
          title: '',
          description: '',
          status: '待领取',
          priority: 'medium',
          due_date: '',
          category_id: '',
          assignee_id: null
        })
        setShowCreateForm(false)
        setError('')
      }
    } catch (err) {
      setError('创建任务失败')
    }
  }

  /**
   * 处理更新任务
   */
  const handleUpdateTask = async (taskId, updateData) => {
    try {
      const { data, error } = await updateTask(taskId, updateData)
      if (error) {
        setError('更新任务失败: ' + error.message)
      } else {
        setTasks(tasks.map(task => 
          task.task_id === taskId ? data : task
        ))
        setEditingTask(null)
        setError('')
      }
    } catch (err) {
      setError('更新任务失败')
    }
  }

  /**
   * 处理删除任务
   */
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('确定要删除这个任务吗？')) {
      return
    }

    try {
      const { error } = await deleteTask(taskId)
      if (error) {
        setError('删除任务失败: ' + error.message)
      } else {
        setTasks(tasks.filter(task => task.task_id !== taskId))
        setError('')
      }
    } catch (err) {
      setError('删除任务失败')
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
        <h2>任务管理</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          创建新任务
        </button>
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
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label>搜索任务：</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="输入任务标题或描述关键字"
            style={{ 
              marginLeft: '5px', 
              padding: '5px 10px', 
              width: '100%',
              maxWidth: '300px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
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
        <h3>任务列表 ({tasks.length} 个任务)</h3>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>
            暂无任务数据
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
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {task.title}
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setEditingTask(task)}
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
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.task_id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 创建任务表单 */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>创建新任务</h3>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>任务标题 *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>任务描述</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>任务分类 *</label>
                <select
                  value={newTask.category_id}
                  onChange={(e) => setNewTask({...newTask, category_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>状态</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="待领取">待领取</option>
                    <option value="进行中">进行中</option>
                    <option value="已完成">已完成</option>
                    <option value="已逾期">已逾期</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>优先级</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>截止日期</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>分配给用户</label>
                <select
                  value={newTask.assignee_id || ''}
                  onChange={(e) => setNewTask({...newTask, assignee_id: e.target.value || null})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">暂不分配</option>
                  {users.filter(user => user.role === 'user').map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  创建任务
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑任务表单 */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>编辑任务</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const updateData = {
                title: formData.get('title'),
                description: formData.get('description'),
                status: formData.get('status'),
                priority: formData.get('priority'),
                due_date: formData.get('due_date') || null,
                category_id: formData.get('category_id'),
                assignee_id: formData.get('assignee_id') || null
              }
              handleUpdateTask(editingTask.task_id, updateData)
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>任务标题 *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingTask.title}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>任务描述</label>
                <textarea
                  name="description"
                  defaultValue={editingTask.description}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>任务分类 *</label>
                <select
                  name="category_id"
                  defaultValue={editingTask.category_id}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  required
                >
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>状态</label>
                  <select
                    name="status"
                    defaultValue={editingTask.status}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="待领取">待领取</option>
                    <option value="进行中">进行中</option>
                    <option value="已完成">已完成</option>
                    <option value="已逾期">已逾期</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>优先级</label>
                  <select
                    name="priority"
                    defaultValue={editingTask.priority}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>截止日期</label>
                <input
                  type="date"
                  name="due_date"
                  defaultValue={editingTask.due_date}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>分配给用户</label>
                <select
                  name="assignee_id"
                  defaultValue={editingTask.assignee_id || ''}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">暂不分配</option>
                  {users.filter(user => user.role === 'user').map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskManagement