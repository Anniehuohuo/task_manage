// 数据报表组件 - 管理员查看系统统计数据
import React, { useState, useEffect } from 'react'
import {
  getSystemOverview,
  getTaskTrends,
  getUserWorkloadStatistics,
  getCategoryStatistics
} from '../services/databaseService'

/**
 * 数据报表组件 - 管理员可以查看系统的各种统计数据和报表
 * @param {Object} props - 组件属性
 * @param {Object} props.currentUser - 当前登录用户信息
 * @returns {JSX.Element} 数据报表界面
 */
const DataReports = ({ currentUser }) => {
  // 状态管理
  const [overview, setOverview] = useState(null) // 系统概览数据
  const [trends, setTrends] = useState(null) // 任务趋势数据
  const [workload, setWorkload] = useState(null) // 用户工作量数据
  const [categories, setCategories] = useState(null) // 分类统计数据
  const [loading, setLoading] = useState(true) // 加载状态
  const [error, setError] = useState('') // 错误信息
  const [activeTab, setActiveTab] = useState('overview') // 当前激活的标签页
  const [trendDays, setTrendDays] = useState(30) // 趋势分析天数

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadAllData()
  }, [])

  /**
   * 当趋势分析天数改变时重新加载趋势数据
   */
  useEffect(() => {
    if (activeTab === 'trends') {
      loadTrends()
    }
  }, [trendDays, activeTab])

  /**
   * 加载所有报表数据
   */
  const loadAllData = async () => {
    setLoading(true)
    setError('')
    
    try {
      await Promise.all([
        loadOverview(),
        loadTrends(),
        loadWorkload(),
        loadCategories()
      ])
    } catch (err) {
      setError('加载报表数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载系统概览数据
   */
  const loadOverview = async () => {
    try {
      const { data, error } = await getSystemOverview()
      if (error) {
        console.error('获取系统概览失败:', error)
      } else {
        setOverview(data)
      }
    } catch (err) {
      console.error('获取系统概览失败:', err)
    }
  }

  /**
   * 加载任务趋势数据
   */
  const loadTrends = async () => {
    try {
      const { data, error } = await getTaskTrends(trendDays)
      if (error) {
        console.error('获取任务趋势失败:', error)
      } else {
        setTrends(data)
      }
    } catch (err) {
      console.error('获取任务趋势失败:', err)
    }
  }

  /**
   * 加载用户工作量数据
   */
  const loadWorkload = async () => {
    try {
      const { data, error } = await getUserWorkloadStatistics()
      if (error) {
        console.error('获取用户工作量统计失败:', error)
      } else {
        setWorkload(data)
      }
    } catch (err) {
      console.error('获取用户工作量统计失败:', err)
    }
  }

  /**
   * 加载分类统计数据
   */
  const loadCategories = async () => {
    try {
      const { data, error } = await getCategoryStatistics()
      if (error) {
        console.error('获取分类统计失败:', error)
      } else {
        setCategories(data)
      }
    } catch (err) {
      console.error('获取分类统计失败:', err)
    }
  }

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    loadAllData()
  }

  /**
   * 格式化日期显示
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  /**
   * 获取状态对应的颜色
   */
  const getStatusColor = (status) => {
    const colors = {
      '待领取': '#6c757d',
      '进行中': '#007bff',
      '已完成': '#28a745',
      '已逾期': '#dc3545'
    }
    return colors[status] || '#6c757d'
  }

  /**
   * 获取优先级对应的颜色
   */
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#dc3545'
    }
    return colors[priority] || '#6c757d'
  }

  /**
   * 渲染系统概览标签页
   */
  const renderOverviewTab = () => {
    if (!overview) return <div>暂无数据</div>

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 总体统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {/* 用户统计 */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>用户统计</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
              {overview.users.total}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              管理员: {overview.users.byRole.admin} | 普通用户: {overview.users.byRole.user}
            </div>
          </div>

          {/* 任务统计 */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>任务统计</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
              {overview.tasks.total}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              已完成: {overview.tasks.byStatus['已完成']} | 进行中: {overview.tasks.byStatus['进行中']}
            </div>
          </div>

          {/* 分类统计 */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>分类统计</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1', marginBottom: '10px' }}>
              {overview.categories.total}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              最常用: {overview.categories.mostUsedCategory?.name || '无'}
            </div>
          </div>
        </div>

        {/* 任务状态分布 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>任务状态分布</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {Object.entries(overview.tasks.byStatus).map(([status, count]) => (
              <div key={status} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(status),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 auto 10px'
                }}>
                  {count}
                </div>
                <div style={{ fontSize: '14px', color: '#495057' }}>{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 优先级分布 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>任务优先级分布</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {Object.entries(overview.tasks.byPriority).map(([priority, count]) => (
              <div key={priority} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: getPriorityColor(priority),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 auto 10px'
                }}>
                  {count}
                </div>
                <div style={{ fontSize: '14px', color: '#495057' }}>
                  {priority === 'low' ? '低' : priority === 'medium' ? '中' : '高'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /**
   * 渲染任务趋势标签页
   */
  const renderTrendsTab = () => {
    if (!trends) return <div>暂无数据</div>

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 趋势控制 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <label>统计周期：</label>
          <select
            value={trendDays}
            onChange={(e) => setTrendDays(Number(e.target.value))}
            style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ced4da' }}
          >
            <option value={7}>最近7天</option>
            <option value={30}>最近30天</option>
            <option value={90}>最近90天</option>
          </select>
        </div>

        {/* 趋势摘要 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {trends.summary.totalCreated}
            </div>
            <div style={{ color: '#6c757d' }}>新建任务</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {trends.summary.totalCompleted}
            </div>
            <div style={{ color: '#6c757d' }}>完成任务</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {trends.summary.completionRate}%
            </div>
            <div style={{ color: '#6c757d' }}>完成率</div>
          </div>
        </div>

        {/* 每日趋势表格 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>每日任务趋势</h4>
          {trends.dailyTrends.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>日期</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>新建任务</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>完成任务</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>完成率</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.dailyTrends.slice(-10).map((day, index) => {
                    const completionRate = day.created > 0 ? Math.round((day.completed / day.created) * 100) : 0
                    return (
                      <tr key={index}>
                        <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                          {formatDate(day.date)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                          {day.created}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                          {day.completed}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                          <span style={{ color: completionRate >= 80 ? '#28a745' : completionRate >= 50 ? '#ffc107' : '#dc3545' }}>
                            {completionRate}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
              该时间段内暂无任务数据
            </div>
          )}
        </div>
      </div>
    )
  }

  /**
   * 渲染用户工作量标签页
   */
  const renderWorkloadTab = () => {
    if (!workload) return <div>暂无数据</div>

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 工作量摘要 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {workload.summary.totalAssignedTasks}
            </div>
            <div style={{ color: '#6c757d' }}>已分配任务</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {workload.summary.unassignedTasks}
            </div>
            <div style={{ color: '#6c757d' }}>未分配任务</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {workload.summary.averageTasksPerUser}
            </div>
            <div style={{ color: '#6c757d' }}>人均任务数</div>
          </div>
        </div>

        {/* 用户工作量详情 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>用户工作量详情</h4>
          {workload.userWorkloads.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>用户名</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>总任务</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>已完成</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>进行中</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>待领取</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>已逾期</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>高优先级</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>完成率</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.userWorkloads.map((user, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                        {user.username}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        {user.total}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span style={{ color: '#28a745' }}>{user.completed}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span style={{ color: '#007bff' }}>{user.inProgress}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span style={{ color: '#6c757d' }}>{user.pending}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span style={{ color: '#dc3545' }}>{user.overdue}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span style={{ color: '#ffc107' }}>{user.highPriority}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                        <span style={{ 
                          color: user.completionRate >= 80 ? '#28a745' : 
                                 user.completionRate >= 50 ? '#ffc107' : '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          {user.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
              暂无用户工作量数据
            </div>
          )}
        </div>
      </div>
    )
  }

  /**
   * 渲染分类统计标签页
   */
  const renderCategoriesTab = () => {
    if (!categories) return <div>暂无数据</div>

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 分类摘要 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>分类总数</h4>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#6f42c1' }}>
            {categories.total}
          </div>
          {categories.mostUsedCategory && (
            <div style={{ marginTop: '10px', color: '#6c757d' }}>
              最常用分类：{categories.mostUsedCategory.name} ({categories.mostUsedCategory.taskCount} 个任务)
            </div>
          )}
        </div>

        {/* 分类分布 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 20px 0' }}>分类任务分布</h4>
          {categories.categoryDistribution.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {categories.categoryDistribution.map((category, index) => {
                const percentage = categories.categoryDistribution.reduce((sum, cat) => sum + cat.taskCount, 0) > 0 ?
                  Math.round((category.taskCount / categories.categoryDistribution.reduce((sum, cat) => sum + cat.taskCount, 0)) * 100) : 0
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: category.color || '#6c757d'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {category.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        {category.taskCount} 个任务 ({percentage}%)
                      </div>
                    </div>
                    <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: category.color || '#6c757d',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <div style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>
                      {category.taskCount}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
              暂无分类数据
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>正在加载报表数据...</div>
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
        <h2>数据报表</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            当前用户：{currentUser.username} (管理员)
          </div>
          <button
            onClick={handleRefresh}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            刷新数据
          </button>
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

      {/* 标签页导航 */}
      <div style={{
        borderBottom: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'overview', label: '系统概览' },
            { key: 'trends', label: '任务趋势' },
            { key: 'workload', label: '用户工作量' },
            { key: 'categories', label: '分类统计' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'workload' && renderWorkloadTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
      </div>

      {/* 最后更新时间 */}
      {overview && (
        <div style={{
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '12px',
          marginTop: '30px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          最后更新时间：{formatDate(overview.lastUpdated)}
        </div>
      )}
    </div>
  )
}

export default DataReports