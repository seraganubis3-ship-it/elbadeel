Add-Type -AssemblyName System.Drawing
$src = "C:\Users\serag\Downloads\logo.jpg"
$img = [System.Drawing.Image]::FromFile($src)

function Resize-Image($image, $width, $height, $path) {
    $new = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($new)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($image, 0, 0, $width, $height)
    $new.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $new.Dispose()
}

Resize-Image $img 192 192 "C:\Users\serag\Downloads\icon-192.png"
Resize-Image $img 512 512 "C:\Users\serag\Downloads\icon-512.png"

$img.Dispose()
Write-Host "Icons converted successfully"
