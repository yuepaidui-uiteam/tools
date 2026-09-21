$ErrorActionPreference = 'Stop'

$packageFiles = @(
    'app.py',
    'requirements.txt',
    'run.bat',
    'README.md',
    'templates\index.html'
)
$sourcePaths = foreach ($relativePath in $packageFiles) {
    $fullPath = Join-Path $PSScriptRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        throw "Required package file is missing: $relativePath"
    }
    $fullPath
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$packagePath = Join-Path $repositoryRoot 'bilibili-downloader-package.zip'
if (Test-Path -LiteralPath $packagePath) {
    Remove-Item -LiteralPath $packagePath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open(
    $packagePath,
    [System.IO.Compression.ZipArchiveMode]::Create
)
try {
    foreach ($relativePath in $packageFiles) {
        $fullPath = Join-Path $PSScriptRoot $relativePath
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $fullPath,
            $relativePath.Replace('\', '/'),
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
}
finally {
    $archive.Dispose()
}
Write-Host "Created $packagePath"
