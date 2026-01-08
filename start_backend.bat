@echo off
echo ========================================
echo   健康咨询助手 - 后端启动脚本
echo ========================================
echo.

set PYTHON_PATH=D:\Users\xiaotao\AppData\Local\Programs\Python\Python314
set BACKEND_PATH=D:\vscode-project\xinyun\health-assistant\backend

echo [1/3] Python路径
echo %PYTHON_PATH%
echo.

echo [2/3] 验证Python版本...
"%PYTHON_PATH%\python.exe" --version
if %errorlevel% neq 0 (
    echo [错误] Python不可用
    pause
    exit /b 1
)
echo.

echo [3/3] 安装/检查依赖...
cd /d "%BACKEND_PATH%"
"%PYTHON_PATH%\python.exe" -m pip install --upgrade pip -q
"%PYTHON_PATH%\python.exe" -m pip install fastapi uvicorn openai requests python-dotenv pydantic python-multipart -q
echo 依赖安装完成！
echo.

echo ========================================
echo   启动后端服务...
echo ========================================
echo.
echo 后端地址: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服务
echo.

"%PYTHON_PATH%\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
