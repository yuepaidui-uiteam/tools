@echo off
setlocal EnableExtensions
set "BASE_URL=https://raw.githubusercontent.com/yuepaidui-uiteam/tools/main/bilibili-downloader"
set "INSTALL_DIR=%LOCALAPPDATA%\BilibiliDownloader"
set "STAGE_DIR=%INSTALL_DIR%\.payload-staging"
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\B站视频下载器.lnk"

if /i "%~1"=="--plan" goto :plan
if /i "%~1"=="--run" goto :run

echo [1/6] 正在检查 Windows 和 winget...
ver | findstr /i "Windows" >nul
if errorlevel 1 goto :unsupported
where winget >nul 2>nul
if errorlevel 1 goto :missing_winget

echo [2/6] 正在安装或检查 Python 和 FFmpeg。请按提示确认...
winget install --id 9NQ7512CXL7T --exact --source msstore --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto :python_install_failed
winget install --id Gyan.FFmpeg.Essentials --exact --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto :ffmpeg_install_failed

set "PATH=%PATH%;%LOCALAPPDATA%\Microsoft\WindowsApps;%LOCALAPPDATA%\Microsoft\WinGet\Links"
where py >nul 2>nul
if errorlevel 1 goto :missing_py
where ffmpeg >nul 2>nul
if errorlevel 1 goto :missing_ffmpeg

echo [3/6] 正在准备 Python 3.12...
py install 3.12
if errorlevel 1 goto :runtime_failed
py -V:3.12 --version >nul 2>nul
if errorlevel 1 goto :runtime_failed
ffmpeg -version >nul 2>nul
if errorlevel 1 goto :missing_ffmpeg

echo [4/6] 正在下载下载器所需文件...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if errorlevel 1 goto :folder_failed
if not exist "%STAGE_DIR%" mkdir "%STAGE_DIR%"
if not exist "%STAGE_DIR%\templates" mkdir "%STAGE_DIR%\templates"
if exist "%STAGE_DIR%\app.py.part" del /q "%STAGE_DIR%\app.py.part"
if exist "%STAGE_DIR%\requirements.txt.part" del /q "%STAGE_DIR%\requirements.txt.part"
if exist "%STAGE_DIR%\templates\index.html.part" del /q "%STAGE_DIR%\templates\index.html.part"
if errorlevel 1 goto :folder_failed
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '%BASE_URL%/app.py' -OutFile '%STAGE_DIR%\app.py.part'"
if errorlevel 1 goto :payload_failed
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '%BASE_URL%/requirements.txt' -OutFile '%STAGE_DIR%\requirements.txt.part'"
if errorlevel 1 goto :payload_failed
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing -Uri '%BASE_URL%/templates/index.html' -OutFile '%STAGE_DIR%\templates\index.html.part'"
if errorlevel 1 goto :payload_failed
for %%F in ("%STAGE_DIR%\app.py.part" "%STAGE_DIR%\requirements.txt.part" "%STAGE_DIR%\templates\index.html.part") do if not exist "%%~fF" goto :payload_failed
for %%F in ("%STAGE_DIR%\app.py.part" "%STAGE_DIR%\requirements.txt.part" "%STAGE_DIR%\templates\index.html.part") do if %%~zF LEQ 0 goto :payload_failed

move /y "%STAGE_DIR%\app.py.part" "%INSTALL_DIR%\app.py" >nul
if errorlevel 1 goto :payload_failed
move /y "%STAGE_DIR%\requirements.txt.part" "%INSTALL_DIR%\requirements.txt" >nul
if errorlevel 1 goto :payload_failed
if not exist "%INSTALL_DIR%\templates" mkdir "%INSTALL_DIR%\templates"
move /y "%STAGE_DIR%\templates\index.html.part" "%INSTALL_DIR%\templates\index.html" >nul
if errorlevel 1 goto :payload_failed
rmdir "%STAGE_DIR%\templates" 2>nul
rmdir "%STAGE_DIR%" 2>nul

echo [5/6] 正在准备本机运行环境和开始菜单入口...
cd /d "%INSTALL_DIR%"
if errorlevel 1 goto :folder_failed
if not exist ".venv\Scripts\python.exe" py -V:3.12 -m venv .venv
if errorlevel 1 goto :venv_failed
".venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r requirements.txt
if errorlevel 1 goto :dependencies_failed
copy /y "%~f0" "%INSTALL_DIR%\run.bat" >nul
if errorlevel 1 goto :launcher_failed
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $s=(New-Object -ComObject WScript.Shell).CreateShortcut('%SHORTCUT%'); $s.TargetPath='%INSTALL_DIR%\run.bat'; $s.Arguments='--run'; $s.WorkingDirectory='%INSTALL_DIR%'; $s.WindowStyle=1; $s.Save()"
if errorlevel 1 goto :shortcut_failed

echo [6/6] 安装完成，正在启动本机服务...
start "B站视频下载器" "%INSTALL_DIR%\run.bat" --run
echo 请回到刚才的 GitHub 页面；如工具没有显示，请刷新页面。
exit /b 0

:plan
echo 安装目录: %INSTALL_DIR%
echo Python Install Manager: 9NQ7512CXL7T
echo FFmpeg: Gyan.FFmpeg.Essentials
echo 文件: %BASE_URL%/app.py
echo 文件: %BASE_URL%/requirements.txt
echo 文件: %BASE_URL%/templates/index.html
echo 启动方式: --run
echo 开始菜单: %SHORTCUT%
exit /b 0

:run
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo 未找到 Python 运行环境，请重新运行安装器。
  pause
  exit /b 1
)
".venv\Scripts\python.exe" -c "import socket,sys; s=socket.socket(); s.settimeout(1); sys.exit(1 if s.connect_ex(('127.0.0.1',5000))==0 else 0)" >nul 2>nul
if errorlevel 1 (
  echo 下载器已经在运行。请切回 GitHub 页面；如工具没有显示，请刷新页面。
  pause
  exit /b 0
)
echo 下载器正在运行。请切回 GitHub 页面；如工具没有显示，请刷新页面。
".venv\Scripts\python.exe" app.py
if errorlevel 1 goto :run_failed
exit /b 0

:unsupported
echo 错误：此安装器仅支持 Windows 10/11。
goto :failed
:missing_winget
echo 错误：未找到 winget。请从 Microsoft Store 安装“应用安装程序”，再重试。
goto :failed
:python_install_failed
echo 错误：Python 安装未完成。请关闭安装器，在 winget 确认提示中选择继续后重试。
goto :failed
:ffmpeg_install_failed
echo 错误：FFmpeg 安装未完成。请按 winget 提示确认后重新运行安装器。
goto :failed
:missing_py
echo 错误：未检测到 Python 安装管理器。请重新打开终端或重启电脑后再试。
goto :failed
:missing_ffmpeg
echo 错误：未检测到 FFmpeg。请重新打开终端或重启电脑后再试。
goto :failed
:runtime_failed
echo 错误：Python 3.12 运行环境安装失败。请检查网络后重新运行安装器。
goto :failed
:folder_failed
echo 错误：无法创建或访问下载器文件夹。
goto :failed
:payload_failed
echo 错误：下载器文件获取失败。请检查网络和 GitHub 文件是否已发布，再重试。
if exist "%STAGE_DIR%\app.py.part" del /q "%STAGE_DIR%\app.py.part"
if exist "%STAGE_DIR%\requirements.txt.part" del /q "%STAGE_DIR%\requirements.txt.part"
if exist "%STAGE_DIR%\templates\index.html.part" del /q "%STAGE_DIR%\templates\index.html.part"
goto :failed
:venv_failed
echo 错误：Python 虚拟环境创建失败。
goto :failed
:dependencies_failed
echo 错误：下载器依赖安装失败。请检查网络后重新运行安装器。
goto :failed
:launcher_failed
echo 错误：无法创建启动入口。
goto :failed
:shortcut_failed
echo 错误：无法创建开始菜单快捷方式。
goto :failed
:run_failed
echo 错误：本机下载器启动失败。请阅读上方错误信息。
pause
exit /b 1
:failed
echo.
echo 安装没有完成；修复上方问题后可以重新运行本安装器。
pause
exit /b 1
