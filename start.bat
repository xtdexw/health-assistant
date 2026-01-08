@echo off
REM 健康咨询助手启动脚本

echo ========================================
echo   AI健康咨询助手 - 启动脚本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python 3.9+
    pause
    exit /b 1
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js 16+
    pause
    exit /b 1
)

echo [1/3] 检查依赖...
echo.

REM 安装后端依赖
if not exist "backend\venv" (
    echo 创建Python虚拟环境...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
) else (
    echo 后端依赖已安装
)

REM 安装前端依赖
if not exist "frontend\node_modules" (
    echo 安装前端依赖...
    cd frontend
    call npm install
    cd ..
) else (
    echo 前端依赖已安装
)

echo.
echo [2/3] 启动后端服务...
start cmd /k "cd backend && venv\Scripts\activate && python -m app.main"

REM 等待后端启动
echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] 启动前端服务...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   服务启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
echo 按任意键退出...
pause >nul
