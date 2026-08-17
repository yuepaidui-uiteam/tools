# SVGA 组帧查看与上传区样式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 SVGA 上传区改成纯深紫色面板，并加入可播放、暂停、前后帧和拖动查看的组帧控制条。

**Architecture:** 继续使用单文件 `svga-preview.html` 和现有 `SVGA.Player` 实例。控制条通过 DOM 控件调用播放器的 `start`、`pause`、`stepToFrame`，并通过播放器进度事件同步界面帧号。

**Tech Stack:** HTML、CSS、原生 JavaScript、SVGA Web UMD 播放器。

## Global Constraints

- 不新增运行时依赖。
- 未加载 SVGA 时逐帧控件全部禁用。
- 加载成功后隐藏上传框，解析失败后重新显示上传框。
- 保留现有背景下拉框、素材信息和内存估算功能。

---

### Task 1: 添加逐帧控制的静态测试

**Files:**
- Create: `tests/svga-preview-frame-controls.test.ps1`

- [ ] **Step 1: Write the failing test**

测试读取 `svga-preview.html`，检查控件 ID、逐帧事件调用、帧号同步和上传面板样式。

```powershell
$ErrorActionPreference = 'Stop'
$page = Get-Content -Raw (Join-Path $PSScriptRoot '..\svga-preview.html')
foreach ($id in @('prevFrameButton','nextFrameButton','frameCounter','timeline')) {
  if ($page -notmatch "id=\"$id\"") { throw "缺少控件：$id" }
}
if ($page -notmatch 'stepToFrame\(Number\(timeline\.value\), false\)') { throw '时间轴没有绑定逐帧跳转' }
if ($page -notmatch 'stepToFrame\(Math\.max\(Number\(timeline\.value\) - 1') { throw '没有上一帧逻辑' }
if ($page -notmatch 'stepToFrame\(Math\.min\(Number\(timeline\.value\) \+ 1') { throw '没有下一帧逻辑' }
if ($page -notmatch 'frameCounter\.textContent') { throw '没有同步当前帧显示' }
if ($page -notmatch '(?s)\.drop-zone\s*\{.*?background:\s*#1e1d43') { throw '上传框不是纯深紫色背景' }
Write-Output 'PASS'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File tests/svga-preview-frame-controls.test.ps1`

Expected: FAIL，原因是当前页面没有前后帧按钮和帧号控件。

### Task 2: 实现上传面板样式和逐帧控制

**Files:**
- Modify: `svga-preview.html`

- [ ] **Step 1: Write minimal implementation**

在预览区下方加入播放、暂停、上一帧、下一帧、帧号和时间轴控件；用 `currentFrame` 统一更新帧号，并在加载成功、播放器进度、拖动及前后帧操作时更新它。上传框增加不透明 `#1e1d43` 背景，并让空状态文字在上传框显示时隐藏。

- [ ] **Step 2: Run test to verify it passes**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File tests/svga-preview-frame-controls.test.ps1`

Expected: PASS。

### Task 3: 静态质量检查

**Files:**
- Verify: `svga-preview.html`
- Verify: `tests/svga-preview-frame-controls.test.ps1`

- [ ] **Step 1: Run whitespace and status checks**

Run: `git -c safe.directory=G:/gpt/tools-github-sync diff --check` and `git -c safe.directory=G:/gpt/tools-github-sync status --short`。

- [ ] **Step 2: Confirm final behavior**

打开 `svga-preview.html`，加载一个 SVGA 文件，确认预览区下方出现控制条，当前帧/总帧数会更新，上一帧、下一帧和时间轴可以改变画面。
