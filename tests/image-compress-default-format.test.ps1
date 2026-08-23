$pagePath = Join-Path $PSScriptRoot '..\image-compress.html'
$page = Get-Content -Raw -LiteralPath $pagePath

if (-not $page.Contains('<select id="outputFormat">')) {
  throw 'output format select is missing'
}

if (-not $page.Contains('<option value="png" selected>PNG</option>')) {
  throw 'PNG is not the selected default output format'
}

if ($page.Contains('<option value="jpg" selected>')) {
  throw 'JPG must not remain the selected default output format'
}

Write-Output 'PASS'
