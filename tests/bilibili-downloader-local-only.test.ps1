$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$homePage = Get-Content -Raw (Join-Path $root 'index.html')
$publicPage = Join-Path $root 'bilibili-downloader.html'
$publicHtml = if (Test-Path -LiteralPath $publicPage) { Get-Content -Raw $publicPage } else { '' }
$localTemplate = Get-Content -Raw (Join-Path $root 'bilibili-downloader\templates\index.html')
$installer = Get-Content -Raw (Join-Path $root 'bilibili-downloader\install.bat')
$launcher = Get-Content -Raw (Join-Path $root 'bilibili-downloader\run.bat')
$readme = Get-Content -Raw (Join-Path $root 'bilibili-downloader\README.md')

if ($homePage.Contains('bilibili-downloader.html')) { throw 'The tools homepage must not show the Bilibili downloader entry.' }
if (-not (Test-Path -LiteralPath $publicPage)) { throw 'The shareable downloader page must exist.' }
foreach ($content in @(
    '<h1>B站视频下载工具</h1>',
    '<iframe class="tool-frame" src="http://127.0.0.1:5000/"',
    'href="bilibili-downloader/install.bat" download',
    '安装结束后，刷新页面即可。'
)) {
    if (-not $publicHtml.Contains($content)) { throw "Shareable downloader page omitted expected content: $content" }
}
if ($localTemplate.Contains('https://yuepaidui-uiteam.github.io/tools/bilibili-downloader.html')) { throw 'Local UI must not send users to hosted setup help.' }
if (-not $localTemplate.Contains('<h1 class="page-title">哔哩哔哩视频下载</h1>')) { throw 'Local UI must show its centered downloader heading.' }
if (-not $installer.Contains('--background')) { throw 'The installer must start the service without navigating away from the shareable page.' }
if (-not $launcher.Contains('http://127.0.0.1:5000')) { throw 'The Start menu launcher must still open the local page directly.' }
if (-not $readme.Contains('回到下载器网页并刷新')) { throw 'Installation instructions must return users to the shareable page.' }

Write-Output 'PASS: the homepage has no downloader entry; the direct share page and installer remain available.'
