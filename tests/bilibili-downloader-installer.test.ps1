$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$installer = Join-Path $root 'bilibili-downloader\install.bat'
$sandbox = Join-Path ([IO.Path]::GetTempPath()) ("bili-installer-plan-" + [guid]::NewGuid().ToString('N'))
$installTarget = Join-Path $sandbox 'BilibiliDownloader'

New-Item -ItemType Directory -Path $sandbox | Out-Null
try {
    $previousLocalAppData = $env:LOCALAPPDATA
    $env:LOCALAPPDATA = $sandbox
    try {
        $output = @(& $env:ComSpec /d /c ('call "' + $installer + '" --plan') 2>&1 | ForEach-Object { "$_" })
        $exitCode = $LASTEXITCODE
    }
    finally {
        $env:LOCALAPPDATA = $previousLocalAppData
    }

    if ($exitCode -ne 0) { throw "Installer plan mode exited with code $exitCode. Output: $($output -join ' ')" }
    $joined = $output -join "`n"
    $required = @(
        '9NQ7512CXL7T',
        'Gyan.FFmpeg.Essentials',
        'https://raw.githubusercontent.com/yuepaidui-uiteam/tools/main/bilibili-downloader/app.py',
        'https://raw.githubusercontent.com/yuepaidui-uiteam/tools/main/bilibili-downloader/requirements.txt',
        'https://raw.githubusercontent.com/yuepaidui-uiteam/tools/main/bilibili-downloader/templates/index.html',
        $installTarget,
        '.lnk',
        '--run'
    )
    foreach ($value in $required) {
        if (-not $joined.Contains($value)) { throw "Installer plan omitted expected action: $value" }
    }
    if ($joined.Contains('archive/refs/heads/main.zip')) { throw 'Installer plan must not include the complete repository ZIP' }
    if (Test-Path -LiteralPath $installTarget) { throw 'Plan mode must not create the install target' }
    Write-Output 'PASS: installer plan reports only approved actions and makes no install changes.'
}
finally {
    if (Test-Path -LiteralPath $sandbox) {
        [IO.Directory]::Delete($sandbox, $true)
    }
}
