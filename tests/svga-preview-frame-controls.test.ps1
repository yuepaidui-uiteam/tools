$ErrorActionPreference = 'Stop'
$page = Get-Content -Raw (Join-Path $PSScriptRoot '..\svga-preview.html')
foreach ($id in @('prevFrameButton','nextFrameButton','frameCounter','timeline')) {
  if (-not $page.Contains(('id="' + $id + '"'))) { throw ('missing control: ' + $id) }
}
if (-not $page.Contains('timeline.addEventListener') -or -not $page.Contains('player.renderer.drawFrame')) { throw 'timeline binding missing' }
if (-not $page.Contains('Math.max(Number(timeline.value) - 1')) { throw 'previous frame logic missing' }
if (-not $page.Contains('Math.min(Number(timeline.value) + 1')) { throw 'next frame logic missing' }
if (-not $page.Contains('frameCounter.textContent')) { throw 'frame counter update missing' }
if (-not $page.Contains('background:#1e1d43')) { throw 'drop zone background missing' }
if (-not $page.Contains('.drop-zone[hidden]') -or -not $page.Contains('display:none')) { throw 'hidden drop zone rule missing' }
if (-not $page.Contains('id="playPauseButton"')) { throw 'single play pause button missing' }
if (-not $page.Contains('let isPlaying = false')) { throw 'playback state variable missing' }
if (-not $page.Contains('iconSvg') -or -not $page.Contains('playPauseButton.innerHTML')) { throw 'play pause svg icon update missing' }
if (-not $page.Contains('title="上一帧"') -or -not $page.Contains('title="下一帧"')) { throw 'frame button titles missing' }
if (-not $page.Contains('class="preview-head"') -or -not $page.Contains('class="background-control"')) { throw 'background control is not in preview header' }
if (-not $page.Contains("iconSvg(playing ? 'pause' : 'play')")) { throw 'play pause icon toggle missing' }
if (-not $page.Contains('.background-control select')) { throw 'background select styling missing' }
if (-not $page.Contains('player.currentFrame = frame')) { throw 'player frame assignment missing' }
Write-Output 'PASS'
