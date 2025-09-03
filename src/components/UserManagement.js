// 用户管理组件
// 提供用户的增删改查功能界面

import React, { useState, useEffect } from 'react'
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/databaseService'
import './UserManagement.css'

const UserManagement = () => {
  // 状态管理
  const [users, setUsers] = useState([]) // 用户列表
  const [filteredUsers, setFilteredUsers] = useState([]) // 过滤后的用户列表
  const [searchTerm, setSearchTerm] = useState('') // 搜索关键字
  const [loading, setLoading] = useState(false) // 加载状态
  const [error, setError] = useState(null) // 错误信息
  const [showModal, setShowModal] = useState(false) // 显示模态框
  const [editingUser, setEditingUser] = useState(null) // 正在编辑的用户
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  })

  // 组件加载时获取用户列表
  useEffect(() => {
    loadUsers()
  }, [])

  // 搜索过滤逻辑
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchTerm])

  /**
   * 加载用户列表
   */
  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await getAllUsers()
      
      if (error) {
        setError('获取用户列表失败: ' + error.message)
      } else {
        const usersData = data || []
        setUsers(usersData)
        setFilteredUsers(usersData)
      }
    } catch (err) {
      setError('获取用户列表失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理表单输入变化
   * @param {Event} e - 输入事件
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * 打开新增用户模态框
   */
  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      role: 'user'
    })
    setShowModal(true)
  }

  /**
   * 打开编辑用户模态框
   * @param {Object} user - 要编辑的用户
   */
  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '', // 编辑时不显示密码
      role: user.role
    })
    setShowModal(true)
  }

  /**
   * 提交表单（新增或编辑用户）
   * @param {Event} e - 表单提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingUser) {
        // 编辑用户
        const updateData = {
          username: formData.username,
          role: formData.role
        }
        
        // 如果提供了新密码，则更新密码
        if (formData.password.trim()) {
          updateData.password = formData.password
        }
        
        const { data, error } = await updateUser(editingUser.user_id, updateData)
        
        if (error) {
          setError('更新用户失败: ' + error.message)
        } else {
          setShowModal(false)
          loadUsers() // 重新加载用户列表
        }
      } else {
        // 新增用户
        const userData = {
          username: formData.username,
          password: formData.password,
          role: formData.role
        }
        
        const { data, error } = await createUser(userData)
        
        if (error) {
          setError('创建用户失败: ' + error.message)
        } else {
          setShowModal(false)
          loadUsers() // 重新加载用户列表
        }
      }
    } catch (err) {
      setError('操作失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除用户
   * @param {Object} user - 要删除的用户
   */
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`确定要删除用户 "${user.username}" 吗？此操作不可撤销。`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await deleteUser(user.user_id)
      
      if (error) {
        setError('删除用户失败: ' + error.message)
      } else {
        loadUsers() // 重新加载用户列表
      }
    } catch (err) {
      setError('删除用户失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 关闭模态框
   */
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      role: 'user'
    })
  }

  /**
   * 格式化日期显示
   * @param {string} dateString - 日期字符串
   * @returns {string} 格式化后的日期
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  /**
   * 获取角色显示文本
   * @param {string} role - 角色
   * @returns {string} 角色显示文本
   */
  const getRoleText = (role) => {
    return role === 'admin' ? '管理员' : '普通用户'
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>用户管理</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleAddUser}
          disabled={loading}
        >
          新增用户
        </button>
      </div>

      {/* 搜索框 */}
      <div className="search-container">
        <input
          type="text"
          placeholder="搜索用户名或角色..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <span className="search-results-count">
            找到 {filteredUsers.length} 个用户
          </span>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          加载中...
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.user_id}>
                <td>{user.username}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditUser(user)}
                      disabled={loading}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user)}
                      disabled={loading}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && !loading && (
          <div className="empty-message">
            {searchTerm ? '未找到匹配的用户' : '暂无用户数据'}
          </div>
        )}
      </div>

      {/* 用户表单模态框 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? '编辑用户' : '新增用户'}</h3>
              <button 
                className="close-button"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="username">用户名 *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="请输入用户名"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  密码 {editingUser ? '(留空则不修改)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder={editingUser ? "留空则不修改密码" : "请输入密码"}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">角色 *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '处理中...' : (editingUser ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement