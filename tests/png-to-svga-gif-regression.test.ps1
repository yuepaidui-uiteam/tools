$ErrorActionPreference = 'Stop'
$page = Get-Content -Raw (Join-Path $PSScriptRoot '..\png-to-svga-gif.html')

if (-not $page.Contains('frameImages[idx] = img')) { throw 'frames must retain sorted indexes' }
if (-not $page.Contains('finishFileLoad')) { throw 'file loading completion helper missing' }
if (-not $page.Contains('loadGeneration')) { throw 'stale upload generation guard missing' }
if (-not $page.Contains('URL.revokeObjectURL')) { throw 'object URL cleanup missing' }
if (-not $page.Contains('accept="image/png"')) { throw 'png input missing' }
if (-not $page.Contains('MAX_FRAME_COUNT')) { throw 'upload limits missing' }
if (-not $page.Contains('processingLock')) { throw 'processing lock/status missing' }
if (-not $page.Contains('gifWorkerReady')) { throw 'gif worker readiness guard missing' }
if (-not $page.Contains('await gifWorkerReady')) { throw 'gif export must await worker readiness' }
if (-not $page.Contains('renderCache')) { throw 'preview frame cache missing' }
if (-not $page.Contains('dimensionMismatchCount')) { throw 'dimension mismatch check missing' }
if (-not $page.Contains("transparent: 0x00FF01")) { throw 'GIF export must enable transparency' }
if (-not $page.Contains("background: '#00ff01'")) { throw 'GIF export transparent key color missing' }
if (-not $page.Contains('WEBP_PLAYBACK_PAGE')) { throw 'webp output label should be honest' }
if (-not $page.Contains('cleanupCurrentExport();')) { throw 'clear action must clean export preview' }
$playBody = [regex]::Match($page, 'function playAnimation\(\)\s*\{(?<body>[\s\S]*?)\n\s*\}\s*\n\s*function loop').Groups['body'].Value
if ($playBody.Contains('currentIndex = 0')) { throw 'play should resume from current frame' }
if (-not $page.Contains('pako.deflate(movieBytes)')) { throw 'SVGA must use zlib deflate stream' }
if ($page.Contains('pako.gzip(movieBytes)') -or $page.Contains('pako.deflateRaw(movieBytes)')) { throw 'SVGA must not use gzip or raw deflate stream' }
if (-not $page.Contains('function canvasToBytes')) { throw 'SVGA canvas encoding helper missing' }
if (-not $page.Contains('await canvasToBytes(canvas')) { throw 'SVGA frames must encode sequentially' }
if ($page.Contains('const tasks = frameImages.map')) { throw 'SVGA must not encode frames concurrently on one canvas' }
if (-not $page.Contains('Array.from(data)')) { throw 'protobuf byte fields must flatten typed arrays' }
if (-not $page.Contains('function _encLayout')) { throw 'SVGA frames must declare layout dimensions' }
if (-not $page.Contains('_wMsgField(2, layoutBytes)')) { throw 'SVGA frame layout must use FrameEntity field 2' }
if (-not $page.Contains('new Blob([compressedMovie]')) { throw 'SVGA 2.x must export raw movie.binary' }
if ($page.Contains('zip.file(''movie.binary''')) { throw 'SVGA 2.x must not wrap movie.binary in ZIP' }
if (-not $page.Contains('exportEstimate')) { throw 'export size and memory estimate UI missing' }
if (-not $page.Contains('formatBytes')) { throw 'export estimate formatter missing' }
if (-not $page.Contains('previewBackground')) { throw 'preview background selector missing' }
if (-not $page.Contains('setPreviewBackground')) { throw 'preview background switching logic missing' }
if (-not $page.Contains('alphaErrors')) { throw 'GIF alpha diffusion dithering missing' }
if (-not $page.Contains('const useAlphaDither = true')) { throw 'GIF alpha diffusion dithering must be enabled by default' }
if (-not $page.Contains('assets/tools/vendor/svga-web.umd.js')) { throw 'local SVGA player missing' }
if (-not $page.Contains('function loadSvgaPreview')) { throw 'SVGA player API compatibility loader missing' }
if (-not $page.Contains('player.animator.isRunning')) { throw 'SVGA play/pause must read the player running state' }
if (-not $page.Contains('function drawExportGifFrame')) { throw 'GIF preview frame renderer missing' }
if (-not $page.Contains('startGifLoop')) { throw 'GIF preview playback loop missing' }
if (-not $page.Contains('assets/tools/vendor/gifuct-web.umd.js')) { throw 'local GIF decoder dependency missing' }
if (-not $page.Contains('function decodeGeneratedGif')) { throw 'generated GIF decoder missing' }
if (-not $page.Contains('typeof gifuct')) { throw 'GIF decoder namespace fallback missing' }
if (-not $page.Contains('ImageDecoder')) { throw 'native GIF decoder path missing' }
if (-not $page.Contains('patchCtx.putImageData')) { throw 'GIF patch compositing canvas missing' }
if (-not $page.Contains('pointer-events: none')) { throw 'transport icons must not intercept button clicks' }
Write-Output 'PASS'
