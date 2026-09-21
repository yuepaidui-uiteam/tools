# B 站 GitHub Pages 一键安装器实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 GitHub Pages 提供 B 站下载页面和独立 Windows 安装器；安装器安装 Python、FFmpeg 并自动准备本机服务，用户无需下载整站 ZIP。

**Architecture:** 静态页面保留嵌入的 loopback Flask 工具，并提供独立安装器下载入口。安装器只从本仓库 HTTPS 原始文件地址获取后端白名单文件，准备当前用户目录中的虚拟环境和启动入口；服务始终只监听 `127.0.0.1`。

**Tech Stack:** HTML/CSS/vanilla JavaScript, Windows CMD/PowerShell, winget, Python Install Manager + Python 3.12, Flask, yt-dlp, FFmpeg, Python `unittest`, repository PowerShell smoke tests, Edge + Playwright.

**Spec:** `docs/superpowers/specs/2026-09-21-bilibili-github-pages-installer-design.md`

## Global Constraints

- “仅面向 Windows 10/11；检查 winget 是否可用，并用当前既定的 winget 包标识安装 Python 与 FFmpeg。”
- “所需文件安装到当前用户可写目录；Python 项目依赖放在独立虚拟环境，不污染系统 Python。”
- “安装器只取下载器白名单文件，不执行远端任意命令或整个仓库中的其他页面。”
- “不绕过 UAC、winget 确认、浏览器下载提示或 PowerShell/Windows 安全策略。任何系统确认都由用户操作。”
- “Flask 保持关闭 debug 模式、只绑定 loopback；不添加通配 CORS，不将下载服务暴露到网络接口。”
- “安装结束后启动本机服务并提示用户回到 GitHub 页面；若浏览器页面没有自动恢复，用户刷新当前页。”
- “自动推送/发布到 GitHub，除非用户另行明确要求。”

## Review Focus

- winget 缺失或用户取消系统确认时，安装必须停止并告知恢复办法，不能显示安装成功；由 Task 1 的缺失 winget 分支和人工取消流程检查验证。
- 任一 HTTPS 文件请求失败或内容不完整时，不得覆盖有效安装文件或启动半成品服务；由 Task 1 的下载失败分支检查验证。
- 首次安装、重复安装和更新安装都必须保留用户下载的视频；由 Task 1 的用户数据路径和无清理行为检查验证。
- Python 管理器已安装但 3.12 运行时未安装，以及 winget 刚更新 PATH 的情况，都必须明确处理，不能要求用户手动修改 PATH；由 Task 1 的运行时配置与命令解析检查验证。
- GitHub Pages 的 HTTPS 页面嵌入 `http://127.0.0.1:5000/` 时，Edge 必须显示本机工具且可提交有效请求；由 Task 3 的真实来源浏览器检查验证。

---

## File Structure

- Create `bilibili-downloader/install.bat` — 用户唯一从网页下载并运行的安装器；安装依赖、获取白名单服务文件、准备虚拟环境和 Start Menu 启动入口。
- Modify `bilibili-downloader/run.bat` — 仓库内手动开发/本机启动 helper；使用项目虚拟环境，保留已有输出文件，不泄露 localhost 导航地址。
- Modify `bilibili-downloader/README.md` — 记录安装器流程、再次启动、更新和故障排除。
- Modify `bilibili-downloader.html` — 将整站 ZIP 与命令复制 UI 替换为独立安装器下载和简短操作说明，保留同页嵌入工具。
- Create `tests/bilibili-downloader-installer.test.ps1` — 按仓库现有轻量 PowerShell 测试风格检查安装器文件清单、包标识和安全边界。
- Create `tests/bilibili-downloader-page.test.ps1` — 验证页面指向独立安装器、不再显示整站 ZIP/手工命令，并保留嵌入工具。
- Existing `bilibili-downloader/app.py` and `bilibili-downloader/templates/index.html` — 安装器取用的后端文件；仅当真实浏览器检查发现嵌入问题时才修改，并保持 loopback-only 限制。

## Task 1: Implement the repeatable Windows installer

**Files:**
- Create: `bilibili-downloader/install.bat`
- Modify: `bilibili-downloader/run.bat`
- Create: `tests/bilibili-downloader-installer.test.ps1`
- Test: `bilibili-downloader/tests/test_app.py`

**Interfaces:**
- Install target: `%LOCALAPPDATA%\BilibiliDownloader`.
- Payload allowlist: `app.py`, `requirements.txt`, `templates/index.html` from `https://raw.githubusercontent.com/yuepaidui-uiteam/tools/main/bilibili-downloader/`.
- Python Install Manager package ID: `9NQ7512CXL7T`; install the runtime with `py install 3.12`; use `py -V:3.12` during environment setup.
- FFmpeg package ID: `Gyan.FFmpeg.Essentials`.
- Installation copies its `install.bat` to `%LOCALAPPDATA%\BilibiliDownloader\run.bat`; its `--run` mode starts the local app without reinstalling packages.
- Start Menu shortcut: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\B站视频下载器.lnk`, targeting the installed `run.bat` with argument `--run`.
- The installed service uses `.venv\Scripts\python.exe app.py` and remains bound to `127.0.0.1:5000`.

- [ ] **Step 1: Write failing installer contract tests**

Create a PowerShell test script using the repository convention (`Get-Content -Raw`, explicit `throw` on failed assertion). Assert that `install.bat` contains the exact package IDs, the three exact payload paths, the `%LOCALAPPDATA%` root, `.venv`, `--run`, and the Start Menu shortcut. Assert it does not contain a full-repository ZIP URL, `0.0.0.0`, or recursive deletion of the install root/download folder. Also assert the checked-in `run.bat` starts `.venv\Scripts\python.exe` and reports failures in Chinese.

```powershell
$root = Split-Path -Parent $PSScriptRoot
$installer = Get-Content -Raw -LiteralPath (Join-Path $root 'bilibili-downloader\install.bat')
$required = @('9NQ7512CXL7T', 'Gyan.FFmpeg.Essentials', 'app.py', 'requirements.txt', 'templates/index.html', '%LOCALAPPDATA%', '.venv', '--run', 'BilibiliDownloader.lnk')
foreach ($value in $required) {
  if (-not $installer.Contains($value)) { throw "Installer contract missing: $value" }
}
if ($installer.Contains('archive/refs/heads/main.zip')) { throw 'Installer must not download the complete repository ZIP' }
if ($installer -match '(?i)remove-item\s+.*(-recurse|-force)') { throw 'Installer must not recursively delete user files' }
Write-Output 'PASS'
```

- [ ] **Step 2: Run the installer contract test and verify the expected failure**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File tests/bilibili-downloader-installer.test.ps1`
Expected: FAIL because `install.bat` does not exist yet.

- [ ] **Step 3: Implement installer stages and service launcher**

Implement `install.bat` with ordered, fail-fast stages: confirm Windows and `winget`; install the Python Install Manager and FFmpeg using the IDs above with package/source agreement switches but no noninteractive or confirmation bypass; ensure the Python 3.12 runtime using `py install 3.12`; refresh PATH from user/machine environment values; verify `py -V:3.12` and `ffmpeg -version`; download the three allowlisted HTTPS files to `.part` names and promote them only after successful completion; create/reuse `.venv`; install `requirements.txt` into that venv; copy the installer to `run.bat`; create the Start Menu shortcut; then start the installed `run.bat --run`. Print Chinese progress and exact failure stage, pause on failure, and never clear the install folder or `downloads`.

Implement the `--run` branch at the top of both installer and installed copy. It changes to its own directory, verifies `.venv\Scripts\python.exe`, checks port 5000 without terminating any process, and starts `app.py` visibly. Update the repository's manual `run.bat` to use its local venv and give equivalent errors, preserving developer workflow. Do not show a localhost URL as a place the user should navigate to.

- [ ] **Step 4: Run focused tests and inspect failure/rerun safety**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File tests/bilibili-downloader-installer.test.ps1`
Expected: PASS, with only the three payload paths and no destructive cleanup. Run `python -m unittest discover -s bilibili-downloader/tests -v`; expected: all existing service tests PASS. Manually review quoted paths with spaces, installer cancellation codes, `.part` cleanup limited to the current named file, and repeated install/update preserving every file under `downloads`.

- [ ] **Step 5: Commit Task 1**

```bash
git add bilibili-downloader/install.bat bilibili-downloader/run.bat tests/bilibili-downloader-installer.test.ps1
git commit -m "feat: add one-click local downloader installer"
```

## Task 2: Replace full-repository setup instructions

**Files:**
- Modify: `bilibili-downloader.html`
- Modify: `bilibili-downloader/README.md`
- Create: `tests/bilibili-downloader-page.test.ps1`

**Interfaces:**
- Relative installer link: `bilibili-downloader/install.bat`.
- Retain `iframe.tool-frame` with source `http://127.0.0.1:5000/`.
- Recovery instruction: run “B站视频下载器” from Start Menu, return to this page, then refresh.

- [ ] **Step 1: Add failing page copy/link tests**

Create a PowerShell test script in the existing test style. Read `bilibili-downloader.html` and assert it contains an anchor with `href="bilibili-downloader/install.bat"`, the visible labels “下载并安装” and “回到本页刷新”, and the existing iframe source/title. Assert the page excludes `archive/refs/heads/main.zip`, `winget install`, “复制安装命令”, manual PATH setup wording, and “单独打开本机下载器”.

- [ ] **Step 2: Run the page test and confirm it fails**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File tests/bilibili-downloader-page.test.ps1`
Expected: FAIL because the page currently offers the whole-repository ZIP and manual installation command.

- [ ] **Step 3: Implement concise page and README instructions**

Replace the ZIP/manual-command section with one main action “下载并安装（Windows）” linking to `bilibili-downloader/install.bat`, then three short steps: run it and confirm winget prompts; return to this tab and refresh; future sessions start “B站视频下载器” from Start Menu before using this same page. Retain the embedded iframe and its internal URL. Never print the address as a user navigation instruction. Add a compact fallback for missing winget and explain that Windows prompts are expected. Update README to match and remove any claim that users must configure PATH manually.

- [ ] **Step 4: Verify text and responsive browser behavior**

Run `tests/bilibili-downloader-page.test.ps1`. Open `http://127.0.0.1:8765/bilibili-downloader.html` in Edge through Playwright at 1280×900 and 390×844. Assert the intended title, installer link, no horizontal overflow, no visible local address or ZIP/manual-command text, iframe presence, and recovery copy. Capture screenshots outside the repository.

- [ ] **Step 5: Commit Task 2**

```bash
git add bilibili-downloader.html bilibili-downloader/README.md tests/bilibili-downloader-page.test.ps1
git commit -m "docs: simplify Bilibili downloader setup page"
```

## Task 3: Verify HTTPS GitHub Pages embedding and installer delivery

**Files:**
- Modify only if required: `bilibili-downloader.html`, `bilibili-downloader/app.py`, `bilibili-downloader/templates/index.html`, `bilibili-downloader/install.bat`.
- Test: `tests/bilibili-downloader-page.test.ps1`, `tests/bilibili-downloader-installer.test.ps1`, `bilibili-downloader/tests/test_app.py`.

**Interfaces:**
- Public page origin: `https://yuepaidui-uiteam.github.io/tools/bilibili-downloader.html`.
- Local service origin: `http://127.0.0.1:5000/`.
- Existing security contract: only loopback Host/Origin accepted; Flask binds `127.0.0.1`.

- [ ] **Step 1: Run backend and both static regression tests**

Run:
```powershell
python -m unittest discover -s bilibili-downloader/tests -v
powershell -NoProfile -ExecutionPolicy Bypass -File tests/bilibili-downloader-installer.test.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests/bilibili-downloader-page.test.ps1
```
Expected: all existing and new tests pass. None fetches a real video or installs software.

- [ ] **Step 2: Verify embedded interaction in the local preview**

With the existing local Flask and static preview servers running, open the edited page in Playwright, wait for its iframe, fill and clear the embedded URL field, and confirm the form remains inside the iframe and guide/recovery text remains visible. Do not submit a real video download. Capture the page title, page errors, console errors, and desktop/mobile screenshots outside the repository.

- [ ] **Step 3: Probe the actual GitHub Pages origin before publishing**

Navigate Edge to `https://yuepaidui-uiteam.github.io/tools/bilibili-downloader.html` while the local service runs. Record whether the secure page can embed the loopback iframe and whether an embedded valid-format URL reaches the local service; use an invalid URL to verify the local API returns its normal validation message without starting a download. The remote page is not yet expected to contain unpushed local changes. If the browser blocks localhost as mixed content/private network access, stop and revise the design with the user before adding CORS, weakening loopback checks, or exposing another interface.

- [ ] **Step 4: Verify currently published installer payload URLs**

Request each exact HTTPS raw URL and check HTTP status plus content identity against the local `app.py`, `requirements.txt`, and `templates/index.html`. The local edits are not published yet, so if a payload is missing or differs, record that as the expected publish gate; do not launch the installer or install packages in this check.

- [ ] **Step 5: Commit only a safe compatibility fix if required**

If Step 3 reveals a browser issue and a loopback-safe fix is clear, write a failing test first, implement the smallest fix, run all tests again, and commit only the affected files with message `fix: support GitHub Pages local downloader embedding`. If the fix requires weakening a security boundary or enabling network access, stop and ask the user.

## Task 4: Final review and handoff

**Files:**
- Review only the files changed for Tasks 1–3; leave unrelated pre-existing workspace changes unstaged.

- [ ] **Step 1: Run the full targeted regression set**

Run the Python unittest suite and both PowerShell tests. Expected: all pass; no live download or system install occurs during tests.

- [ ] **Step 2: Review exact diff and repository state**

Run `git diff --check` and review the staged task files. Confirm there is no whole-repository ZIP link, pasted winget command, visible localhost navigation address, broad delete operation, `0.0.0.0` listener, wildcard CORS, or unrelated page edit. Keep unrelated existing workspace changes unstaged.

- [ ] **Step 3: Report the publication boundary**

Report the local preview URL and screenshots, the test results, and whether actual HTTPS embedding was verified. Do not say the tool is deployed or that the installer works from GitHub Pages until the related files have been published; if publishing is not authorized, state that the GitHub remote has not been changed.

## Self-review

- Spec coverage: independent one-click setup and required prompts (Task 1); no full-repository ZIP and same-page operation (Task 2); retry/rerun safety and data preservation (Task 1); local-only server and browser isolation probe (Task 3); clean review and publication boundary (Task 4).
- Placeholder scan: no TODO/TBD or unspecified test steps remain.
- Interface consistency: page link points to `bilibili-downloader/install.bat`; that installer fetches exactly the three named runtime files into `%LOCALAPPDATA%\BilibiliDownloader`, copies its `--run` mode as the local `run.bat`, and creates a Start Menu shortcut that starts the loopback service.
- Review Focus: all five input/failure classes above are assigned to a concrete static check, installer branch inspection, or browser probe.
