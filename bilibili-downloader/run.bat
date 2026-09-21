@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 goto :python_missing
where ffmpeg >nul 2>nul
if errorlevel 1 goto :ffmpeg_missing

if not exist ".venv\Scripts\python.exe" (
    python -m venv .venv
    if errorlevel 1 goto :failed
)

".venv\Scripts\python.exe" -c "import flask, yt_dlp" >nul 2>nul
if errorlevel 1 (
    ".venv\Scripts\python.exe" -m pip install -r requirements.txt
    if errorlevel 1 goto :failed
)

echo 本机下载服务已启动。请回到下载页面；如工具未显示，请刷新页面。
echo 保持此窗口打开即可使用；关闭窗口会停止服务。
".venv\Scripts\python.exe" app.py
if errorlevel 1 goto :failed
exit /b 0

:python_missing
echo [错误] 未检测到 Python。请使用下载页面中的一键安装器安装运行环境。
pause
exit /b 1

:ffmpeg_missing
echo [错误] 未检测到 FFmpeg。请重新运行下载页面中的一键安装器。
pause
exit /b 1

:failed
echo.
echo [错误] 启动失败。请阅读上方提示，修复问题后重试。
pause
exit /b 1
