$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot

function RoundedRect($graphics, $brush, [single]$x, [single]$y, [single]$width, [single]$height, [single]$radius) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = 2 * $radius
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $graphics.FillPath($brush, $path)
    $path.Dispose()
}

# Same geometry and palette as icons/icon.svg. Render large, then downsample.
$source = [System.Drawing.Bitmap]::new(512, 512)
$graphics = [System.Drawing.Graphics]::FromImage($source)
$graphics.SmoothingMode = 'AntiAlias'
$graphics.ScaleTransform(4, 4)
$dark = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#153e4a'))
$gold = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f2bf66'))
$light = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#ffda8a'))
RoundedRect $graphics $dark 16 16 96 96 18
RoundedRect $graphics $gold 32 45 64 48 5
RoundedRect $graphics $light 28 36 72 14 4
RoundedRect $graphics $dark 50 59 28 6 3
# Interlocking chain outlines, drawn as capsules.
RoundedRect $graphics $dark 42.5 70.5 30 17 8.5
RoundedRect $graphics $gold 47.5 75.5 20 7 3.5
RoundedRect $graphics $dark 56.5 70.5 30 17 8.5
RoundedRect $graphics $gold 61.5 75.5 20 7 3.5
$graphics.Dispose()

foreach ($size in @(16, 32, 48, 128)) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $canvas = [System.Drawing.Graphics]::FromImage($bitmap)
    $canvas.InterpolationMode = 'HighQualityBicubic'
    $canvas.PixelOffsetMode = 'HighQuality'
    $canvas.DrawImage($source, 0, 0, $size, $size)
    $bitmap.Save((Join-Path $projectRoot "icons/icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
    $bitmap.Dispose()
}

# A promotional illustration, not a fabricated Chrome screenshot.
$promo = [System.Drawing.Bitmap]::new(440, 280)
$canvas = [System.Drawing.Graphics]::FromImage($promo)
$canvas.SmoothingMode = 'AntiAlias'
$canvas.Clear([System.Drawing.ColorTranslator]::FromHtml('#153e4a'))
$line = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#35929c'), 4)
$canvas.DrawLine($line, 65, 140, 375, 140)
$canvas.DrawEllipse($line, 40, 115, 50, 50)
$canvas.DrawEllipse($line, 350, 115, 50, 50)
$canvas.InterpolationMode = 'HighQualityBicubic'
$canvas.DrawImage($source, 110, 30, 220, 220)
$promo.Save((Join-Path $projectRoot 'store/promo-440x280.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$line.Dispose()
$canvas.Dispose()
$promo.Dispose()
$source.Dispose()
$dark.Dispose()
$gold.Dispose()
$light.Dispose()
Write-Output 'Generated original icon PNGs and 440x280 promotional tile.'
