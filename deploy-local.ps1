# Deploy nach 49.13.139.206 — staged: webapp (ohne node_modules/.next) + Compose + Infra-Dateien

param(
  [string]$RemoteHost = "root@49.13.139.206",
  [string]$IdentityFile = "$env:USERPROFILE\.ssh\ssh-kimai-zeno",
  [string]$RemotePath = "/opt/skicoach",
  [switch]$RemoteUp
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$Staging = Join-Path $Root "skicoach-deploy-staging"
if (Test-Path $Staging) { Remove-Item -Recurse -Force $Staging }
New-Item -ItemType Directory -Path $Staging | Out-Null

# webapp ohne schwere / generierte Ordner
robocopy (Join-Path $Root "webapp") (Join-Path $Staging "webapp") /E /XD node_modules .next .git /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { Write-Error "robocopy webapp fehlgeschlagen ($LASTEXITCODE)" }

foreach ($f in @("docker-compose.yml", ".env.example", "caddy-skicoach.caddyfile")) {
  Copy-Item (Join-Path $Root $f) -Destination $Staging
}

$sshBase = @("-o", "IdentitiesOnly=yes", "-i", $IdentityFile)
Write-Host "Deploy -> ${RemoteHost}:${RemotePath}"
ssh @sshBase $RemoteHost "mkdir -p $RemotePath"
# Hinweis: `scp ... *` lässt Punktdateien (z. B. .env.example) oft weg — explizit mitgeben.
scp @sshBase -r "$Staging\*" "${RemoteHost}:$RemotePath/"
if ($LASTEXITCODE -ne 0) {
  Remove-Item -Recurse -Force $Staging -ErrorAction SilentlyContinue
  throw "scp (Staging -> Server) fehlgeschlagen (Exit $LASTEXITCODE)."
}
$dotEnvExample = Join-Path $Staging ".env.example"
if (Test-Path $dotEnvExample) {
  scp @sshBase $dotEnvExample "${RemoteHost}:$RemotePath/.env.example"
  if ($LASTEXITCODE -ne 0) {
    Remove-Item -Recurse -Force $Staging -ErrorAction SilentlyContinue
    throw "scp .env.example fehlgeschlagen (Exit $LASTEXITCODE)."
  }
}

Remove-Item -Recurse -Force $Staging

if ($RemoteUp) {
  Write-Host "Remote: build, up, db:migrate:apply (Journal-SQL) ..."
  $remoteOneLiner =
    "cd $RemotePath && docker compose build app && docker compose up -d && " +
    "docker compose exec -T app sh -lc 'cd /app && npm run db:migrate:apply'"
  ssh @sshBase $RemoteHost $remoteOneLiner
}

Write-Host "Fertig. Ohne -RemoteUp: auf dem Server dieselbe Zeile wie oben (build app, up -d, migrate im Container)."
