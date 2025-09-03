// 数据库连接测试组件
// 用于测试Supabase数据库连接和基本CRUD功能

import React, { useState } from 'react'
import { testDatabaseConnection } from '../services/databaseService'
import './DatabaseTest.css'

const DatabaseTest = () => {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 测试数据库连接
   */
  const handleTestConnection = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)

    try {
      const result = await testDatabaseConnection()
      
      if (result.success) {
        setTestResult({
          success: true,
          message: '数据库连接成功！',
          details: result.data
        })
      } else {
        setError('数据库连接失败: ' + result.error)
      }
    } catch (err) {
      setError('测试过程中发生错误: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="database-test">
      <div className="test-header">
        <h2>数据库连接测试</h2>
        <p>点击下方按钮测试Supabase数据库连接状态</p>
      </div>

      <div className="test-actions">
        <button 
          className="test-btn"
          onClick={handleTestConnection}
          disabled={loading}
        >
          {loading ? '测试中...' : '测试数据库连接'}
        </button>
      </div>

      {/* 测试结果显示 */}
      {testResult && (
        <div className="test-result success">
          <h3>✅ {testResult.message}</h3>
          {testResult.details && (
            <div className="result-details">
              <h4>连接详情:</h4>
              <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="test-result error">
          <h3>❌ 连接失败</h3>
          <p>{error}</p>
          <div className="troubleshooting">
            <h4>故障排除建议:</h4>
            <ul>
              <li>检查Supabase URL是否正确</li>
              <li>检查API密钥是否有效</li>
              <li>确认网络连接正常</li>
              <li>检查Supabase项目是否处于活跃状态</li>
            </ul>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="test-instructions">
        <h3>使用说明</h3>
        <div className="instruction-steps">
          <div className="step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>配置数据库</h4>
              <p>确保已在Supabase控制台中执行了 <code>supabase-setup.sql</code> 脚本</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>测试连接</h4>
              <p>点击"测试数据库连接"按钮验证配置是否正确</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>开始使用</h4>
              <p>连接成功后，即可使用用户管理、分类管理和任务管理功能</p>
            </div>
          </div>
        </div>
      </div>

      {/* 配置信息显示 */}
      <div className="config-info">
        <h3>当前配置</h3>
        <div className="config-item">
          <span className="config-label">Supabase URL:</span>
          <span className="config-value">
            {process.env.REACT_APP_SUPABASE_URL || 'https://jmibsrzbrkpnbngnicdq.supabase.co'}
          </span>
        </div>
        <div className="config-item">
          <span className="config-label">API Key:</span>
          <span className="config-value">
            {(process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...').substring(0, 20)}...
          </span>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTest