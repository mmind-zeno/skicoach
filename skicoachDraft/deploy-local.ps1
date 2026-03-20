# VERALTET — verwende deploy-local.ps1 im REPO-ROOT (kopiert webapp/ + Compose).
# deploy-local.ps1 — Projekt nach Hetzner kopieren (Windows)
#
# Ziel: 49.13.139.206, /opt/skicoach/

param(
  [string]$RemoteHost = "root@49.13.139.206",
  [string]$IdentityFile = "$env:USERPROFILE\.ssh\ssh-kimai-zeno",
  [string]$RemotePath = "/opt/skicoach"
)

$ErrorActionPreference = "Stop"
$Staging = "skicoach-deploy-staging"

if (-not (Test-Path $IdentityFile)) {
  Write-Warning "IdentityFile nicht gefunden: $IdentityFile — Parameter -IdentityFile setzen oder Key ablegen."
}

Write-Host "skicoach — Ziel: ${RemoteHost}:${RemotePath}"
Write-Host "Staging: $Staging"

if (Test-Path $Staging) { Remove-Item -Recurse -Force $Staging }
New-Item -ItemType Directory -Path $Staging | Out-Null

$excludeDirs = @("node_modules", ".next", ".git", "backups", $Staging)
robocopy . $Staging /E /XD @excludeDirs /NFL /NDL /NJH /NJS | Out-Null

if ($LASTEXITCODE -ge 8) {
  Write-Error "robocopy fehlgeschlagen (Exit $LASTEXITCODE)"
}

$sshBase = @("-o", "IdentitiesOnly=yes", "-i", $IdentityFile)
Write-Host "ssh/scp -> $RemoteHost ..."
ssh @sshBase $RemoteHost "mkdir -p $RemotePath"
scp @sshBase -r "$Staging\*" "${RemoteHost}:$RemotePath/"

Remove-Item -Recurse -Force $Staging
Write-Host "Fertig. Auf dem Server: cd $RemotePath && docker compose build --no-cache && docker compose up -d"
Write-Host "Danach Caddy-Block aus caddy-skicoach.caddyfile einbinden (Port = HOST_APP_PORT). Siehe DEPLOY.md."
