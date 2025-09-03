@echo off
chcp 65001
echo ========================================
echo     任务管理系统 - 宝塔部署脚本
echo ========================================
echo.

echo [1/3] 正在构建生产版本...
npm run build
if %errorlevel% neq 0 (
    echo 构建失败！请检查错误信息。
    pause
    exit /b 1
)
echo 构建完成！
echo.

echo [2/3] 正在创建部署包...
if exist "deploy-package" rmdir /s /q "deploy-package"
mkdir "deploy-package"

:: 复制构建文件
xcopy "build\*" "deploy-package\" /s /e /y

:: 复制配置文件
copy "baota-nginx.conf" "deploy-package\"
copy "宝塔部署指南.md" "deploy-package\"

echo 部署包创建完成！
echo.

echo [3/3] 正在压缩部署包...
if exist "task-management-deploy.zip" del "task-management-deploy.zip"
powershell -command "Compress-Archive -Path 'deploy-package\*' -DestinationPath 'task-management-deploy.zip'"

if exist "task-management-deploy.zip" (
    echo.
    echo ========================================
    echo           部署准备完成！
    echo ========================================
    echo.
    echo 部署文件已生成：task-management-deploy.zip
    echo.
    echo 接下来请按照以下步骤操作：
    echo 1. 将 task-management-deploy.zip 上传到服务器
    echo 2. 在宝塔面板中解压到网站根目录
    echo 3. 按照 宝塔部署指南.md 配置 Nginx
    echo 4. 访问您的域名测试部署结果
    echo.
    echo 详细步骤请参考：宝塔部署指南.md
    echo ========================================
) else (
    echo 压缩失败！请检查 PowerShell 是否可用。
)

echo.
pause