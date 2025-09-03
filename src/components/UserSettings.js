// 用户个人设置组件 - 用户可以修改个人信息和密码
import React, { useState, useEffect } from 'react'
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserPersonalStats,
  checkUsernameAvailability
} from '../services/databaseService'

/**
 * 用户个人设置组件 - 用户可以查看和修改个人信息、密码等
 * @param {Object} props - 组件属性
 * @param {Object} props.currentUser - 当前登录用户信息
 * @param {Function} props.onUserUpdate - 用户信息更新后的回调函数
 * @returns {JSX.Element} 用户设置界面
 */
const UserSettings = ({ currentUser, onUserUpdate }) => {
  // 状态管理
  const [profile, setProfile] = useState(null) // 用户资料
  const [stats, setStats] = useState(null) // 个人统计
  const [loading, setLoading] = useState(true) // 加载状态
  const [error, setError] = useState('') // 错误信息
  const [success, setSuccess] = useState('') // 成功信息
  const [activeTab, setActiveTab] = useState('profile') // 当前激活的标签页

  // 个人信息表单状态
  const [profileForm, setProfileForm] = useState({
    username: '',
    usernameError: '',
    isCheckingUsername: false
  })

  // 密码修改表单状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPasswords: false
  })

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadUserData()
  }, [])

  /**
   * 加载用户数据
   */
  const loadUserData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // 并行加载用户资料和统计信息
      const [profileResult, statsResult] = await Promise.all([
        getUserProfile(currentUser.user_id),
        getUserPersonalStats(currentUser.user_id)
      ])
      
      if (profileResult.error) {
        setError('获取用户资料失败: ' + profileResult.error.message)
      } else {
        setProfile(profileResult.data)
        setProfileForm(prev => ({
          ...prev,
          username: profileResult.data.username
        }))
      }
      
      if (statsResult.error) {
        console.error('获取用户统计失败:', statsResult.error)
      } else {
        setStats(statsResult.data)
      }
    } catch (err) {
      setError('加载用户数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理个人信息表单输入变化
   */
  const handleProfileInputChange = async (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
      usernameError: name === 'username' ? '' : prev.usernameError
    }))

    // 实时检查用户名可用性
    if (name === 'username' && value !== profile.username && value.trim()) {
      setProfileForm(prev => ({ ...prev, isCheckingUsername: true }))
      
      try {
        const { data, error } = await checkUsernameAvailability(value, currentUser.user_id)
        if (error) {
          setProfileForm(prev => ({
            ...prev,
            usernameError: '检查用户名失败',
            isCheckingUsername: false
          }))
        } else {
          setProfileForm(prev => ({
            ...prev,
            usernameError: data.available ? '' : data.message,
            isCheckingUsername: false
          }))
        }
      } catch (err) {
        setProfileForm(prev => ({
          ...prev,
          usernameError: '检查用户名失败',
          isCheckingUsername: false
        }))
      }
    }
  }

  /**
   * 处理密码表单输入变化
   */
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * 提交个人信息修改
   */
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    if (profileForm.usernameError || profileForm.isCheckingUsername) {
      return
    }
    
    if (profileForm.username === profile.username) {
      setError('用户名没有变化')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const { data, error } = await updateUserProfile(currentUser.user_id, {
        username: profileForm.username
      })
      
      if (error) {
        setError('更新个人信息失败: ' + error.message)
      } else {
        setProfile(data)
        setSuccess('个人信息更新成功！')
        
        // 通知父组件用户信息已更新
        if (onUserUpdate) {
          onUserUpdate({
            ...currentUser,
            username: data.username
          })
        }
      }
    } catch (err) {
      setError('更新个人信息失败: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 提交密码修改
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    // 验证表单
    if (!passwordForm.currentPassword) {
      setError('请输入当前密码')
      return
    }
    
    if (!passwordForm.newPassword) {
      setError('请输入新密码')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError('新密码长度至少6位')
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('新密码不能与当前密码相同')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const { data, error } = await changeUserPassword(
        currentUser.user_id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      )
      
      if (error) {
        setError('修改密码失败: ' + error.message)
      } else {
        setSuccess('密码修改成功！')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showPasswords: false
        })
      }
    } catch (err) {
      setError('修改密码失败: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 切换密码显示/隐藏
   */
  const togglePasswordVisibility = () => {
    setPasswordForm(prev => ({
      ...prev,
      showPasswords: !prev.showPasswords
    }))
  }

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 清除消息
   */
  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  /**
   * 渲染个人资料标签页
   */
  const renderProfileTab = () => {
    if (!profile) return <div>加载中...</div>

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 基本信息卡片 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>基本信息</h4>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>用户ID：</span>
              <span>{profile.user_id}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>当前用户名：</span>
              <span>{profile.username}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>用户角色：</span>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: profile.role === 'admin' ? '#e3f2fd' : '#f3e5f5',
                color: profile.role === 'admin' ? '#1976d2' : '#7b1fa2',
                fontSize: '14px',
                display: 'inline-block'
              }}>
                {profile.role === 'admin' ? '管理员' : '普通用户'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>注册时间：</span>
              <span>{formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 修改用户名表单 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>修改用户名</h4>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                新用户名 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${profileForm.usernameError ? '#dc3545' : '#ced4da'}`,
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="请输入新用户名"
                  required
                />
                {profileForm.isCheckingUsername && (
                  <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    检查中...
                  </div>
                )}
              </div>
              {profileForm.usernameError && (
                <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                  {profileForm.usernameError}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || profileForm.usernameError || profileForm.isCheckingUsername || profileForm.username === profile.username}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || profileForm.usernameError || profileForm.isCheckingUsername || profileForm.username === profile.username ? 0.6 : 1
              }}
            >
              {isSubmitting ? '更新中...' : '更新用户名'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  /**
   * 渲染密码修改标签页
   */
  const renderPasswordTab = () => {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        maxWidth: '500px'
      }}>
        <h4 style={{ margin: '0 0 20px 0' }}>修改密码</h4>
        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              当前密码 *
            </label>
            <input
              type={passwordForm.showPasswords ? 'text' : 'password'}
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="请输入当前密码"
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              新密码 *
            </label>
            <input
              type={passwordForm.showPasswords ? 'text' : 'password'}
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="请输入新密码（至少6位）"
              required
              minLength={6}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              确认新密码 *
            </label>
            <input
              type={passwordForm.showPasswords ? 'text' : 'password'}
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="请再次输入新密码"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={passwordForm.showPasswords}
                onChange={togglePasswordVisibility}
              />
              <span style={{ fontSize: '14px' }}>显示密码</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    )
  }

  /**
   * 渲染个人统计标签页
   */
  const renderStatsTab = () => {
    if (!stats) return <div>加载中...</div>

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 任务统计概览 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats.assigned.total}
            </div>
            <div style={{ color: '#6c757d' }}>分配给我的任务</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats.assigned.completed}
            </div>
            <div style={{ color: '#6c757d' }}>已完成任务</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.assigned.completionRate}%
            </div>
            <div style={{ color: '#6c757d' }}>完成率</div>
          </div>
        </div>

        {/* 详细统计 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>任务详细统计</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>
                {stats.assigned.pending}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>待领取</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                {stats.assigned.inProgress}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>进行中</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                {stats.assigned.overdue}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>已逾期</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fd7e14' }}>
                {stats.assigned.highPriority}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>高优先级</div>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>最近30天活动</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#17a2b8' }}>
                {stats.recentActivity.assignedLast30Days}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>新分配任务</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                {stats.recentActivity.completedLast30Days}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>完成任务</div>
            </div>
          </div>
        </div>

        {/* 如果是管理员，显示创建的任务统计 */}
        {currentUser.role === 'admin' && stats.created.total > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 20px 0' }}>我创建的任务统计</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6f42c1' }}>
                  {stats.created.total}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>总计</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  {stats.created.completed}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>已完成</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                  {stats.created.completionRate}%
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>完成率</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>正在加载个人设置...</div>
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
        <h2>个人设置</h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          当前用户：{currentUser.username} ({currentUser.role === 'admin' ? '管理员' : '普通用户'})
        </div>
      </div>

      {/* 消息提示 */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px 15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={clearMessages}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '10px 15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{success}</span>
          <button
            onClick={clearMessages}
            style={{
              background: 'none',
              border: 'none',
              color: '#155724',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 标签页导航 */}
      <div style={{
        borderBottom: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'profile', label: '个人资料' },
            { key: 'password', label: '修改密码' },
            { key: 'stats', label: '个人统计' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                clearMessages()
              }}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#007bff' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#495057',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 标签页内容 */}
      <div>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'password' && renderPasswordTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </div>
    </div>
  )
}

export default UserSettings