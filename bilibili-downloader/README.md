# Bilibili 本机视频下载工具

这是一个只在本机运行的网页工具：粘贴单个 B 站视频链接，查看下载进度，然后保存视频文件。它使用 yt-dlp 解析和下载，并通过 FFmpeg 合并音视频。

## 使用前准备

1. 安装 Python 3.10 或更新版本，并启用 Windows Python Launcher（`py` 命令）。
2. 安装 FFmpeg，并确认在命令提示符中运行 `ffmpeg -version` 能看到版本信息。
3. 首次运行需要联网安装 Flask 和 yt-dlp（不需要付费 API 或云服务器）。视频下载会使用你的网络流量。

## 启动

双击 `run.bat`。启动后，在浏览器打开：

**http://127.0.0.1:5000**

保持启动窗口打开；关闭窗口或按 `Ctrl+C` 会停止服务。服务仅绑定本机回环地址，不提供给局域网或互联网中的其他设备访问。

如需手动启动，可在此文件夹的终端执行：

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

## 下载流程

1. 复制单个 B 站视频页链接或 `b23.tv` 分享短链。
2. 在网页粘贴链接并点“下载视频”。
3. 任务完成后点击“保存视频”。文件保存在本工具的 `downloads` 文件夹中。

目前不支持合集、播放列表和分 P 选择；只适用于无需登录且你有权保存的公开视频。工具不会读取或保存 Cookie，也不会尝试下载会员、付费或其他受限内容。可用画质、下载成功与否会受 B 站规则、网络状况及 yt-dlp 兼容性影响。

## 清理下载文件

关闭正在进行的下载后，可在 `downloads` 文件夹中手动删除已完成的文件。此工具不会自动清理下载内容。

## 测试

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```
