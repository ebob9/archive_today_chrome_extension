$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'manifest.json') -Raw | ConvertFrom-Json
$files = @('manifest.json', 'background.js', 'settings.js', 'options.html', 'options.js', 'options.css', 'LICENSE')
$files += @($manifest.icons.PSObject.Properties.Value | Sort-Object -Unique)
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $file) -PathType Leaf)) {
        throw "Missing package file: $file"
    }
}
$outputDirectory = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$outputPath = Join-Path $outputDirectory "archive-today-helper-$($manifest.version).zip"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
# Overwrite only this explicitly named generated artifact; no temporary tree deletion.
$stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $files) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive, (Join-Path $projectRoot $file), $file.Replace('\', '/'),
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally {
    $archive.Dispose()
    $stream.Dispose()
}
Write-Output "Created $outputPath with $($files.Count) allowlisted files."
