$page = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot '..\color-unmult.html')

if (-not $page.Contains('id="edgeUnmultRange"')) {
  throw 'edge unmult range control is missing'
}

if (-not $page.Contains('按图片短边百分比换算，仅处理边缘')) {
  throw 'edge unmult range hint is missing'
}

if (-not $page.Contains('function applyEdgeUnmult')) {
  throw 'edge unmult processing function is missing'
}

if (-not $page.Contains('applyEdgeUnmult(out')) {
  throw 'edge unmult processing is not connected to normal rendering'
}

if (-not $page.Contains('createUnmultLayer')) {
  throw 'unmult layer helper is missing'
}

if (-not $page.Contains('edgeLayer=createUnmultLayer().data')) {
  throw 'normal and unmult layers are not composited separately'
}

if (-not $page.Contains('outsideDistance')) {
  throw 'original unmult edge halo is not considered outside the normal cutout'
}

if (-not $page.Contains('max="100" value="12"')) {
  throw 'feather control is not percentage-based'
}

if (-not $page.Contains('Math.min(width,height)*rangePercent/100')) {
  throw 'edge range is not scaled to the uploaded image size'
}

if (-not $page.Contains('edgeMix')) {
  throw 'edge layer transition is missing'
}

if (-not $page.Contains('id="connectedOnly"')) {
  throw 'connected edge checkbox is missing'
}

if (-not $page.Contains('function findConnectedBackground')) {
  throw 'connected background flood fill helper is missing'
}

if (-not $page.Contains('connectedOnly.checked?findConnectedBackground')) {
  throw 'connected edge processing is not connected to normal rendering'
}

Write-Output 'PASS'
