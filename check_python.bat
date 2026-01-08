@echo off
echo ========================================
echo   Python环境检测脚本
echo ========================================
echo.

echo [1] 检查Python安装...
echo.

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo 找到Python:
    where python
    python --version
    echo.
    goto :check_pip
) else (
    echo 未找到 'python' 命令
)

where py >nul 2>&1
if %errorlevel% equ 0 (
    echo 找到Python启动器:
    where py
    py --version
    echo.
    goto :check_pip
) else (
    echo 未找到 'py' 命令
)

echo.
echo [2] 检查常见安装位置...
echo.

if exist "C:\Python311\python.exe" (
    echo 找到: C:\Python311\python.exe
    "C:\Python311\python.exe" --version
    set PYTHON_PATH=C:\Python311
    goto :found
)

if exist "C:\Python310\python.exe" (
    echo 找到: C:\Python310\python.exe
    "C:\Python310\python.exe" --version
    set PYTHON_PATH=C:\Python310
    goto :found
)

if exist "C:\Program Files\Python311\python.exe" (
    echo 找到: C:\Program Files\Python311\python.exe
    "C:\Program Files\Python311\python.exe" --version
    set PYTHON_PATH=C:\Program Files\Python311
    goto :found
)

if exist "C:\Program Files\Python310\python.exe" (
    echo 找到: C:\Program Files\Python310\python.exe
    "C:\Program Files\Python310\python.exe" --version
    set PYTHON_PATH=C:\Program Files\Python310
    goto :found
)

echo.
echo [!] 未找到Python安装
echo.
echo 请确认:
echo 1. Python是否已安装?
echo 2. 安装时是否勾选了 "Add Python to PATH"?
echo 3. 安装在哪个目录?
echo.
echo 如果刚安装完成，请关闭当前命令行窗口，重新打开后再试。
echo.
pause
exit /b 1

:check_pip
echo [3] 检查pip...
python -m pip --version
if %errorlevel% neq 0 (
    echo pip不可用
)
echo.

:found
echo.
echo ========================================
echo   Python已找到!
echo ========================================
echo.
echo 请按任意键继续安装后端依赖...
pause >nul

echo.
echo [4] 安装后端依赖...
echo.
cd /d "%~dp0backend"
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn openai requests python-dotenv pydantic python-multipart

echo.
echo [5] 依赖安装完成!
echo.
echo 启动后端服务...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
