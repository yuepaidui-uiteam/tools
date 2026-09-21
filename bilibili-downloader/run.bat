@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
    echo [Error] Python was not found. Install it from https://www.python.org/downloads/windows/ or use the setup command in the guide.
    echo Setup guide: https://yuepaidui-uiteam.github.io/tools/bilibili-downloader.html
    pause
    exit /b 1
)

python --version
if errorlevel 1 (
    echo [Error] Python could not start. Finish its installation, then reopen this window.
    echo Setup guide: https://yuepaidui-uiteam.github.io/tools/bilibili-downloader.html
    pause
    exit /b 1
)

where ffmpeg >nul 2>nul
if errorlevel 1 (
    echo [Error] FFmpeg was not found. Install FFmpeg, add its bin folder to PATH, then reopen this window.
    echo Windows download: https://www.gyan.dev/ffmpeg/builds/
    echo Setup guide: https://yuepaidui-uiteam.github.io/tools/bilibili-downloader.html
    pause
    exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
    python -m venv .venv
    if errorlevel 1 goto :failed
)

".venv\Scripts\python.exe" -c "import flask, yt_dlp" >nul 2>nul
if errorlevel 1 (
    ".venv\Scripts\python.exe" -m pip install -r requirements.txt
    if errorlevel 1 goto :failed
)

echo Starting the local downloader at http://127.0.0.1:5000
echo Keep this window open while using the page. Press Ctrl+C to stop.
".venv\Scripts\python.exe" app.py
if errorlevel 1 goto :failed
exit /b 0

:failed
echo.
echo [Error] Startup failed. Read the message above, fix the missing requirement, and try again.
pause
exit /b 1
