// 分类管理组件
// 提供分类的增删改查功能界面

import React, { useState, useEffect } from 'react'
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/databaseService'
import './CategoryManagement.css'

const CategoryManagement = ({ currentUser }) => {
  // 状态管理
  const [categories, setCategories] = useState([]) // 分类列表
  const [filteredCategories, setFilteredCategories] = useState([]) // 过滤后的分类列表
  const [searchTerm, setSearchTerm] = useState('') // 搜索关键字
  const [loading, setLoading] = useState(false) // 加载状态
  const [error, setError] = useState(null) // 错误信息
  const [showModal, setShowModal] = useState(false) // 显示模态框
  const [editingCategory, setEditingCategory] = useState(null) // 正在编辑的分类
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff'
  })

  // 预定义的颜色选项
  const colorOptions = [
    { value: '#007bff', label: '蓝色' },
    { value: '#28a745', label: '绿色' },
    { value: '#ffc107', label: '黄色' },
    { value: '#dc3545', label: '红色' },
    { value: '#6f42c1', label: '紫色' },
    { value: '#fd7e14', label: '橙色' },
    { value: '#20c997', label: '青色' },
    { value: '#e83e8c', label: '粉色' }
  ]

  // 组件加载时获取分类列表
  useEffect(() => {
    loadCategories()
  }, [])

  // 搜索过滤逻辑
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredCategories(filtered)
    }
  }, [categories, searchTerm])

  /**
   * 加载分类列表
   */
  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await getAllCategories()
      
      if (error) {
        setError('获取分类列表失败: ' + error.message)
      } else {
        const categoriesData = data || []
        setCategories(categoriesData)
        setFilteredCategories(categoriesData)
      }
    } catch (err) {
      setError('获取分类列表失败: ' + err.message)
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
   * 打开新增分类模态框
   */
  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      color: '#007bff'
    })
    setShowModal(true)
  }

  /**
   * 打开编辑分类模态框
   * @param {Object} category - 要编辑的分类
   */
  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#007bff'
    })
    setShowModal(true)
  }

  /**
   * 提交表单（新增或编辑分类）
   * @param {Event} e - 表单提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (editingCategory) {
        // 编辑分类
        const updateData = {
          name: formData.name,
          description: formData.description,
          color: formData.color
        }
        
        const { data, error } = await updateCategory(editingCategory.category_id, updateData)
        
        if (error) {
          setError('更新分类失败: ' + error.message)
        } else {
          setShowModal(false)
          loadCategories() // 重新加载分类列表
        }
      } else {
        // 新增分类
        const categoryData = {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          creator_id: currentUser?.user_id || 1 // 使用当前用户ID，默认为管理员ID
        }
        
        const { data, error } = await createCategory(categoryData)
        
        if (error) {
          setError('创建分类失败: ' + error.message)
        } else {
          setShowModal(false)
          loadCategories() // 重新加载分类列表
        }
      }
    } catch (err) {
      setError('操作失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除分类
   * @param {Object} category - 要删除的分类
   */
  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`确定要删除分类 "${category.name}" 吗？此操作不可撤销，相关任务的分类将被清空。`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await deleteCategory(category.category_id)
      
      if (error) {
        setError('删除分类失败: ' + error.message)
      } else {
        loadCategories() // 重新加载分类列表
      }
    } catch (err) {
      setError('删除分类失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 关闭模态框
   */
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      color: '#007bff'
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
   * 获取颜色标签
   * @param {string} color - 颜色值
   * @returns {string} 颜色标签
   */
  const getColorLabel = (color) => {
    const option = colorOptions.find(opt => opt.value === color)
    return option ? option.label : '自定义'
  }

  return (
    <div className="category-management">
      <div className="category-management-header">
        <h2>分类管理</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleAddCategory}
          disabled={loading}
        >
          新增分类
        </button>
      </div>

      {/* 搜索框 */}
      <div className="search-container">
        <input
          type="text"
          placeholder="搜索分类名称或描述..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <span className="search-results-count">
            找到 {filteredCategories.length} 个分类
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

      <div className="categories-grid">
        {filteredCategories.map(category => (
          <div key={category.category_id} className="category-card">
            <div className="category-header">
              <div className="category-color" style={{ backgroundColor: category.color }}></div>
              <h3 className="category-name">{category.name}</h3>
            </div>
            
            <div className="category-content">
              <p className="category-description">
                {category.description || '暂无描述'}
              </p>
              
              <div className="category-meta">
                <div className="meta-item">
                  <span className="meta-label">颜色:</span>
                  <span className="meta-value">{getColorLabel(category.color)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">创建者:</span>
                  <span className="meta-value">
                    {category.users?.username || '未知'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">创建时间:</span>
                  <span className="meta-value">{formatDate(category.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="category-actions">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => handleEditCategory(category)}
                disabled={loading}
              >
                编辑
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteCategory(category)}
                disabled={loading}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="empty-message">
          暂无分类数据，点击"新增分类"创建第一个分类
        </div>
      )}

      {/* 分类表单模态框 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingCategory ? '编辑分类' : '新增分类'}</h3>
              <button 
                className="close-button"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">分类名称 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="请输入分类名称"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">分类描述</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="请输入分类描述（可选）"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">分类颜色 *</label>
                <div className="color-selector">
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div 
                    className="color-preview" 
                    style={{ backgroundColor: formData.color }}
                  ></div>
                </div>
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
                  {loading ? '处理中...' : (editingCategory ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagement