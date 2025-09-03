# 任务管理系统 📋

一个基于 React 和 Supabase 的现代化任务管理系统，采用黑白极简设计风格，支持任务管理、分类管理、用户管理等功能。

## ✨ 功能特色

### 🎯 核心功能
- **任务管理**：创建、编辑、删除、完成任务
- **分类管理**：任务分类组织和管理
- **用户管理**：用户信息管理和权限控制
- **个人设置**：个性化配置选项

### 🔍 搜索功能
- **任务搜索**：按标题、描述、状态搜索任务
- **分类搜索**：快速查找特定分类
- **用户搜索**：按用户名、邮箱搜索用户
- **实时搜索**：输入即时显示搜索结果

### 🎨 界面特色
- **黑白极简风格**：简洁优雅的视觉设计
- **手写字体标题**：独特的视觉效果
- **响应式设计**：适配各种设备屏幕
- **直观操作**：用户友好的交互体验

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- Supabase 账号（用于数据库）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/task-management-system.git
cd task-management-system
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
创建 `.env` 文件并添加以下配置：
```env
REACT_APP_SUPABASE_URL=你的Supabase项目URL
REACT_APP_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

4. **启动开发服务器**
```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 可用脚本

### `npm start`
启动开发服务器，支持热重载和错误提示。

### `npm run build`
构建生产版本到 `build` 文件夹，优化性能并压缩文件。

### `npm test`
运行测试套件（如果配置了测试）。

## 🌐 部署指南

### GitHub 部署

#### 快速部署
运行自动化部署脚本：
```bash
# Windows
github-deploy.bat

# 或手动执行
git add .
git commit -m "部署到GitHub"
git push origin main
```

#### GitHub Pages 自动部署
1. 推送代码到 GitHub
2. 在仓库 Settings → Secrets 中添加环境变量：
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. GitHub Actions 将自动构建并部署到 GitHub Pages

### 其他部署平台

#### Vercel（推荐）
1. 连接 GitHub 仓库到 [Vercel](https://vercel.com)
2. 配置环境变量
3. 自动部署完成

#### Netlify
1. 连接 GitHub 仓库到 [Netlify](https://netlify.com)
2. 构建设置：`npm run build`，发布目录：`build`
3. 配置环境变量

#### 宝塔面板
运行宝塔部署脚本：
```bash
deploy.bat
```
详细说明请查看 `宝塔部署指南.md`

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── TaskManagement/  # 任务管理组件
│   ├── CategoryManagement/ # 分类管理组件
│   ├── UserManagement/  # 用户管理组件
│   └── Settings/        # 设置组件
├── services/           # 服务层
│   └── supabaseService.js # 数据库服务
├── App.js             # 主应用组件
├── App.css            # 主样式文件
└── supabaseClient.js  # 数据库连接配置
```

## 🔧 技术栈

- **前端框架**：React 18
- **数据库**：Supabase (PostgreSQL)
- **样式**：CSS3 + 响应式设计
- **状态管理**：React Hooks
- **构建工具**：Create React App
- **部署**：GitHub Pages / Vercel / Netlify

## 📋 数据库配置

### Supabase 设置
1. 创建 Supabase 项目
2. 运行 `supabase-setup.sql` 初始化数据库
3. 获取项目 URL 和 API 密钥
4. 配置环境变量

### 数据表结构
- `tasks` - 任务表
- `categories` - 分类表
- `users` - 用户表

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 [Issue](https://github.com/你的用户名/task-management-system/issues)
- 发送邮件到：your-email@example.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
