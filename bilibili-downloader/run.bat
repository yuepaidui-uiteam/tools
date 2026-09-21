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

set "LOCAL_URL=http://127.0.0.1:5000/"
".venv\Scripts\python.exe" -c "import socket,sys; s=socket.socket(); s.settimeout(1); sys.exit(1 if s.connect_ex(('127.0.0.1',5000))==0 else 0)" >nul 2>nul
if errorlevel 1 goto :open_existing

start "B站视频下载器服务" /min ".venv\Scripts\python.exe" app.py
for /l %%I in (1,1,30) do (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%LOCAL_URL%' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>nul
    if not errorlevel 1 goto :open_local_page
    timeout /t 1 /nobreak >nul
)
goto :server_failed

:open_existing
echo 下载器服务已在运行，正在打开本机页面。
start "" "%LOCAL_URL%"
exit /b 0

:open_local_page
echo 下载器已启动，正在打开本机页面。
start "" "%LOCAL_URL%"
exit /b 0

:python_missing
echo [错误] 未检测到 Python。请重新运行 Windows 一键安装器。
pause
exit /b 1

:ffmpeg_missing
echo [错误] 未检测到 FFmpeg。请重新运行一键安装器。
pause
exit /b 1

:server_failed
echo [错误] 本机下载服务未能启动，请检查端口 5000 是否被其他程序占用。
pause
exit /b 1

:failed
echo.
echo [错误] 启动失败。请阅读上方提示，修复问题后重试。
pause
exit /b 1
