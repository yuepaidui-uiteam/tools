# B 站视频下载器

下载器只在你的 Windows 电脑上运行：本机网页负责操作，本机服务负责解析、下载及合并视频。无需付费 API 或云服务器；下载会使用你的网络流量。

## 普通用户安装

1. 从 [GitHub 下载 Windows 一键安装器](https://raw.githubusercontent.com/yuepaidui-uiteam/tools/main/bilibili-downloader/install.bat)，下载后运行 `install.bat`。如果浏览器或 Windows 询问是否保留/运行，请确认。
2. 安装器通过 winget 安装 Python 3.12 和 FFmpeg，再创建独立 Python 环境、获取本机服务文件并创建“B站视频下载器”开始菜单入口。按提示确认即可，不需要手工配置 PATH。
3. 安装结束会启动本机服务；回到下载器网页并刷新，即可在页面内使用。
4. 之后从开始菜单打开“B站视频下载器”，可直接打开本机下载页面 `http://127.0.0.1:5000`。

安装器只获取 `app.py`、`requirements.txt` 和 `templates/index.html` 三个服务文件，不下载仓库里的其他工具或页面。程序及视频保存在 `%LOCALAPPDATA%\BilibiliDownloader`；重复运行安装器不会清理 `downloads` 中已有的视频。

安装器需要 Windows 10/11、winget 和网络连接。若没有 winget，请先从 [Microsoft 官方页面安装“应用安装程序”](https://aka.ms/getwinget)。如果安装步骤失败，按错误提示修复后重新运行安装器。winget/Windows 的确认由用户自行操作。

## 开发者运行

在此文件夹打开终端，确保 Python 3.12 和 FFmpeg 已安装，然后运行 `run.bat`。它会在项目内创建 `.venv`、安装依赖、启动服务并自动打开 `http://127.0.0.1:5000`。服务只监听本机回环地址，不是可供他人访问的公网服务；使用时请保持服务窗口运行。

也可以手动运行：

```powershell
py -V:3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

## 下载说明

1. 粘贴单个 B 站视频页面链接或 `b23.tv` 分享短链。
2. 点击“下载视频”，完成后点击“保存视频”。视频保存在下载器数据目录中。

目前不支持合集、播放列表和分 P；不读取或保存 Cookie，也不尝试获取会员、付费或其他受限内容。只保存你有权保存的内容，并遵守平台规则与版权要求。画质和可下载性会受到 B 站、网络及 yt-dlp 兼容性的影响。

## 测试

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```
