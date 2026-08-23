$ErrorActionPreference = 'Stop'
$page = Get-Content -Raw (Join-Path $PSScriptRoot '..\image-compress.html')
$module = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\tools\image-compress.mjs')

if (-not $page.Contains('id="folderInput"')) { throw 'folder input missing' }
if (-not $page.Contains('webkitdirectory')) { throw 'folder picker attribute missing' }
if (-not $page.Contains('data-i18n="choose_folder"')) { throw 'folder picker label missing' }
if (-not $module.Contains('webkitRelativePath')) { throw 'relative path handling missing' }
if (-not $module.Contains('item.relativePath')) { throw 'relative path is not rendered or stored' }
if (-not $module.Contains('zip.file(item.plan.zipPath || item.plan.fileName, item.result)')) { throw 'zip export path handling missing' }
if (-not $module.Contains('item.plan.zipPath')) { throw 'zip export does not use preserved folder path' }

Write-Output 'PASS'
