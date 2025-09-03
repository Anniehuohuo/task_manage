import React, { useState, useEffect } from 'react';
import './App.css';
import UserManagement from './components/UserManagement';
import CategoryManagement from './components/CategoryManagement';
import TaskManagement from './components/TaskManagement';
import TaskList from './components/TaskList';
import DatabaseTest from './components/DatabaseTest';
import DataReports from './components/DataReports';
import UserSettings from './components/UserSettings';
import { authenticateUser } from './services/databaseService';

/**
 * 任务管理系统主应用组件
 * 包含用户登录和主界面功能
 */
function App() {
  // 用户登录状态管理
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 当前用户信息
  const [currentUser, setCurrentUser] = useState(null);
  // 当前活动页面
  const [activePage, setActivePage] = useState('dashboard');
  // 显示状态：'homepage' | 'login' | 'main'
  const [showPage, setShowPage] = useState('homepage');
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  // 登录加载状态
  const [loginLoading, setLoginLoading] = useState(false);
  
  // 登录错误信息
  const [loginError, setLoginError] = useState('');

  /**
   * 处理登录表单输入变化
   * @param {Event} e - 输入事件
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 处理用户登录
   * @param {Event} e - 表单提交事件
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 清除之前的错误信息
    setLoginError('');
    
    // 验证输入
    if (!loginForm.username || !loginForm.password) {
      setLoginError('请输入用户名和密码');
      return;
    }
    
    // 开始登录验证
    setLoginLoading(true);
    
    try {
      // 调用数据库验证函数
      const result = await authenticateUser(loginForm.username, loginForm.password);
      
      if (result.success && result.data) {
        // 登录成功，设置用户信息
        setCurrentUser({
          user_id: result.data.user_id,
          username: result.data.username,
          role: result.data.role,
          created_at: result.data.created_at
        });
        setIsLoggedIn(true);
        setShowPage('main');
        
        // 清空登录表单
        setLoginForm({ username: '', password: '' });
        setLoginError('');
      } else {
        // 登录失败，显示错误信息
        setLoginError(result.error || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      setLoginError('登录失败，请稍后重试');
    } finally {
      setLoginLoading(false);
    }
  };

  /**
   * 处理用户登出
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActivePage('dashboard');
    setShowPage('homepage');
  };

  /**
   * 显示登录页面
   */
  const showLoginPage = () => {
    setShowPage('login');
  };

  /**
   * 返回首页
   */
  const showHomePage = () => {
    setShowPage('homepage');
  };

  /**
   * 处理页面导航
   * @param {string} page - 目标页面
   */
  const handleNavigation = (page) => {
    setActivePage(page);
  };

  // 处理打字机动画完成后的效果
  useEffect(() => {
    if (showPage === 'homepage') {
      const timer = setTimeout(() => {
        const titleElement = document.querySelector('.homepage-title');
        if (titleElement) {
          titleElement.classList.add('animation-complete');
        }
      }, 4500); // 动画总时长：1s延迟 + 3s打字机效果 + 0.5s缓冲
      
      return () => clearTimeout(timer);
    }
  }, [showPage]);

  // 根据当前状态显示不同页面
  if (!isLoggedIn) {
    // 显示首页
    if (showPage === 'homepage') {
      return (
        <div className="App">
          <div className="homepage">
            <div className="homepage-header">
              <div className="homepage-logo">TaskFlow</div>
              <button className="login-btn-homepage" onClick={showLoginPage}>
                登录
              </button>
            </div>
            
            <div className="homepage-content">
              <h1 className="homepage-title">任务管理系统</h1>
              <p className="homepage-subtitle">让团队协作更高效，让任务管理更简单</p>
              
              <div className="homepage-description">
                <p>TaskFlow 是一个现代化的任务管理平台，专为团队协作而设计。通过直观的界面和强大的功能，帮助您的团队提高工作效率，轻松管理项目进度。</p>
              </div>
              
              <div className="homepage-features">
                <div className="homepage-feature-card">
                  <div className="homepage-feature-icon">📋</div>
                  <h3 className="homepage-feature-title">智能任务管理</h3>
                  <p className="homepage-feature-desc">创建、分配、跟踪任务，支持优先级设置和状态管理，让每个任务都有条不紊。</p>
                </div>
                
                <div className="homepage-feature-card">
                  <div className="homepage-feature-icon">👥</div>
                  <h3 className="homepage-feature-title">团队协作</h3>
                  <p className="homepage-feature-desc">多用户权限管理，支持任务分配和进度共享，让团队协作更加顺畅。</p>
                </div>
                
                <div className="homepage-feature-card">
                  <div className="homepage-feature-icon">📊</div>
                  <h3 className="homepage-feature-title">数据分析</h3>
                  <p className="homepage-feature-desc">详细的数据报表和统计分析，帮助您了解团队效率和项目进展。</p>
                </div>
                
                <div className="homepage-feature-card">
                  <div className="homepage-feature-icon">🔒</div>
                  <h3 className="homepage-feature-title">安全可靠</h3>
                  <p className="homepage-feature-desc">完善的权限控制和数据安全保护，确保您的信息安全无忧。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 显示登录页面
    if (showPage === 'login') {
      return (
        <div className="App">
          <div className="login-container">
            <div className="login-card">
              <h1 className="system-title">任务管理系统</h1>
              <p className="system-subtitle">高效协作，轻松管理</p>
              
              <form onSubmit={handleLogin} className="login-form">
                {/* 错误信息显示 */}
                {loginError && (
                  <div className="error-message">
                    {loginError}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="username">用户名</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginForm.username}
                    onChange={handleInputChange}
                    placeholder="请输入用户名"
                    disabled={loginLoading}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">密码</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleInputChange}
                    placeholder="请输入密码"
                    disabled={loginLoading}
                    required
                  />
                </div>
                
                <button type="submit" className="login-btn" disabled={loginLoading}>
                  {loginLoading ? '登录中...' : '登录'}
                </button>
              </form>
              

              
              <button 
                type="button" 
                className="login-btn" 
                onClick={showHomePage}
                style={{marginTop: '20px', background: 'transparent', color: '#718096'}}
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 用户已登录，显示主界面
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="header-title">任务管理系统</h1>
          <div className="user-info">
            <span className="welcome-text">
              欢迎，{currentUser.username} 
              <span className="user-role">({currentUser.role === 'admin' ? '管理员' : '普通用户'})</span>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 导航菜单 */}
      <nav className="app-nav">
        <div className="nav-content">
          <button 
            className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard')}
          >
            🏠 首页
          </button>
          
          <button 
             className={`nav-btn ${activePage === 'tasks' ? 'active' : ''}`}
             onClick={() => handleNavigation('tasks')}
           >
             📋 任务管理
           </button>
           
           {currentUser.role === 'admin' && (
             <>
               <button 
                 className={`nav-btn ${activePage === 'users' ? 'active' : ''}`}
                 onClick={() => handleNavigation('users')}
               >
                 👥 用户管理
               </button>
               
               <button 
                 className={`nav-btn ${activePage === 'categories' ? 'active' : ''}`}
                 onClick={() => handleNavigation('categories')}
               >
                 🏷️ 分类管理
               </button>
               
               <button 
                 className={`nav-btn ${activePage === 'database-test' ? 'active' : ''}`}
                 onClick={() => handleNavigation('database-test')}
               >
                 🔧 数据库测试
               </button>
               
               <button 
                 className={`nav-btn ${activePage === 'reports' ? 'active' : ''}`}
                 onClick={() => handleNavigation('reports')}
               >
                 📊 数据报表
               </button>
             </>
           )}
           
           <button 
             className={`nav-btn ${activePage === 'settings' ? 'active' : ''}`}
             onClick={() => handleNavigation('settings')}
           >
             ⚙️ 个人设置
           </button>
        </div>
      </nav>

      <main className="main-content">
        {/* 根据当前页面显示不同内容 */}
        {activePage === 'dashboard' && (
          <div className="dashboard">
            <h2>欢迎使用任务管理系统</h2>
            
            {currentUser.role === 'admin' ? (
              // 管理员界面
              <div className="admin-dashboard">
                <div className="feature-cards">
                  <div className="feature-card">
                    <h3>👥 用户管理</h3>
                    <p>管理系统中的所有用户账号</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('users')}
                    >
                      进入管理
                    </button>
                  </div>
                  
                  <div className="feature-card">
                    <h3>📋 任务管理</h3>
                    <p>创建、编辑和分配任务</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('tasks')}
                    >
                      进入管理
                    </button>
                  </div>
                  
                  <div className="feature-card">
                    <h3>🏷️ 分类管理</h3>
                    <p>管理任务分类和标签</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('categories')}
                    >
                      进入管理
                    </button>
                  </div>
                  
                  <div className="feature-card">
                    <h3>📊 数据统计</h3>
                    <p>查看任务完成情况和统计数据</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('reports')}
                    >
                      查看报表
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // 普通用户界面
              <div className="user-dashboard">
                <div className="feature-cards">
                  <div className="feature-card">
                    <h3>📝 我的任务</h3>
                    <p>查看和管理分配给我的任务</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('tasks')}
                    >
                      查看任务
                    </button>
                  </div>
                  
                  <div className="feature-card">
                    <h3>🎯 任务池</h3>
                    <p>从任务池中领取新任务</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('tasks')}
                    >
                      领取任务
                    </button>
                  </div>
                  
                  <div className="feature-card">
                    <h3>⚙️ 个人设置</h3>
                    <p>修改个人信息和密码</p>
                    <button 
                      className="feature-btn"
                      onClick={() => handleNavigation('settings')}
                    >
                      个人设置
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activePage === 'tasks' && (
          currentUser.role === 'admin' ? (
            <TaskManagement currentUser={currentUser} />
          ) : (
            <TaskList currentUser={currentUser} />
          )
        )}
        
        {activePage === 'users' && currentUser.role === 'admin' && (
          <UserManagement currentUser={currentUser} />
        )}
        
        {activePage === 'categories' && currentUser.role === 'admin' && (
           <CategoryManagement currentUser={currentUser} />
         )}
         
         {activePage === 'database-test' && currentUser.role === 'admin' && (
           <DatabaseTest />
         )}
         
         {activePage === 'reports' && currentUser.role === 'admin' && (
           <DataReports currentUser={currentUser} />
         )}
         
         {activePage === 'settings' && (
           <UserSettings 
             currentUser={currentUser} 
             onUserUpdate={setCurrentUser}
           />
         )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 任务管理系统. 让团队协作更高效.</p>
      </footer>
    </div>
  );
}

export default App;
