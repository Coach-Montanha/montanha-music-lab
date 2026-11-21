# scripts/setup_desktop_shortcut.ps1
# Configura o novo atalho oficial "Montanha Music" no Desktop e remove atalhos obsoletos

$edgeAppDir = "C:\Users\Administrator\AppData\Local\Microsoft\Edge\User Data\Default\Web Applications\_crx__mmggmcecpeibhahbpleidckdmilpneom"
$oldIcon = Join-Path $edgeAppDir "Montanha Music Lab.ico"
$newIcon = Join-Path $edgeAppDir "Montanha Music.ico"

# 1. Garante o ícone atualizado
if (Test-Path $oldIcon) {
    Copy-Item -Path $oldIcon -Destination $newIcon -Force
    Write-Host "Ícone copiado para: $newIcon"
}

# 2. Caminhos dos atalhos a remover
$toRemove = @(
    "C:\Users\Administrator\Desktop\Montanha Music Lab.lnk",
    "C:\Users\Administrator\Desktop\[5] Musica & Audio\Montanha Music Lab.lnk",
    "C:\Users\Administrator\Desktop\[5] Musica & Audio\Spotube Desktop.lnk"
)

foreach ($item in $toRemove) {
    if (Test-Path -LiteralPath $item) {
        Remove-Item -LiteralPath $item -Force
        Write-Host "Removido atalho antigo: $item"
    }
}

# 3. Criação do novo atalho oficial "Montanha Music" no Desktop
$w = New-Object -ComObject WScript.Shell

$destinations = @(
    "C:\Users\Administrator\Desktop\Montanha Music.lnk",
    "C:\Users\Administrator\Desktop\[5] Musica & Audio\Montanha Music.lnk"
)

foreach ($dest in $destinations) {
    $parentDir = Split-Path -Parent $dest
    if (-not (Test-Path -LiteralPath $parentDir)) {
        New-Item -ItemType Directory -LiteralPath $parentDir -Force | Out-Null
    }

    $sc = $w.CreateShortcut($dest)
    $sc.TargetPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge_proxy.exe"
    $sc.Arguments = "--profile-directory=Default --app-id=mmggmcecpeibhahbpleidckdmilpneom --app-url=https://montanha-bento.vercel.app/ --app-run-on-os-login-mode=windowed --app-launch-source=19 --source-shortcut-location=taskbar"
    $sc.Description = "Montanha Music • Streaming & Playlists sem limites, integrado ao Ecossistema Montanha"
    $sc.WorkingDirectory = "C:\Program Files (x86)\Microsoft\Edge\Application"
    if (Test-Path $newIcon) {
        $sc.IconLocation = "$newIcon,0"
    }
    $sc.Save()
    Write-Host "Criado novo atalho oficial: $dest"
}

Write-Host "Concluído com sucesso!"
