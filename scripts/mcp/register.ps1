[CmdletBinding()]
param([string]$CodexPath)

$ErrorActionPreference = 'Stop'
# The desktop may launch this Windows PowerShell script from PowerShell 7.
# Load the matching built-in module rather than an inherited module path.
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Utility\Microsoft.PowerShell.Utility.psd1')
$projectDirectory = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$githubVersion = 'v2.0.2'
$githubZipHash = '4ae64087501650752f21c9d5af5378107a5116d94ee1cf37786b22b8c4bd99df'
$githubBinaryHash = '1bbf1cd5be216d5c622ccb0da4529d747c983fcf6bbf76f9c3e6c3b32877c1df'
$githubInstallDirectory = Join-Path $env:USERPROFILE ".codex\tools\github-mcp-server\$githubVersion"
$githubBinaryPath = Join-Path $githubInstallDirectory 'github-mcp-server.exe'

if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64') {
    throw 'Este instalador foi validado para Windows x64.'
}
if (-not (Test-Path -LiteralPath (Join-Path $projectDirectory 'node_modules\firebase-tools\lib\bin\firebase.js'))) {
    throw 'Execute npm.cmd ci antes de registrar os servidores.'
}
$nodePath = (Get-Command node.exe -CommandType Application | Select-Object -First 1).Source
$powershellPath = (Get-Command powershell.exe -CommandType Application | Select-Object -First 1).Source
$null = Get-Command gh.exe -CommandType Application
if ([string]::IsNullOrWhiteSpace($CodexPath)) {
    $CodexPath = $env:CODEX_CLI_PATH
}
if ([string]::IsNullOrWhiteSpace($CodexPath) -or -not (Test-Path -LiteralPath $CodexPath)) {
    $codexCommand = Get-Command codex.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $codexCommand) {
        $CodexPath = $codexCommand.Source
    }
    else {
        $codexBinDirectory = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
        $codexCandidate = Get-ChildItem -LiteralPath $codexBinDirectory -Filter codex.exe -Recurse -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($null -eq $codexCandidate) { throw 'Codex CLI nao encontrado. Informe -CodexPath.' }
        $CodexPath = $codexCandidate.FullName
    }
}

if (-not (Test-Path -LiteralPath $githubBinaryPath -PathType Leaf)) {
    $null = New-Item -ItemType Directory -Path $githubInstallDirectory -Force
    $githubZipPath = Join-Path $githubInstallDirectory 'github-mcp-server_Windows_x86_64.zip'
    $githubDownloadUrl = "https://github.com/github/github-mcp-server/releases/download/$githubVersion/github-mcp-server_Windows_x86_64.zip"
    Invoke-WebRequest -UseBasicParsing -Uri $githubDownloadUrl -OutFile $githubZipPath
    if ((Get-FileHash -LiteralPath $githubZipPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $githubZipHash) {
        throw 'Checksum do download GitHub MCP divergente. Instalacao interrompida.'
    }
    Expand-Archive -LiteralPath $githubZipPath -DestinationPath $githubInstallDirectory -Force
}
if ((Get-FileHash -LiteralPath $githubBinaryPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $githubBinaryHash) {
    throw 'Checksum do executavel GitHub MCP divergente. Registro interrompido.'
}

# Preserve the existing user configuration, including plugin-managed servers.
$codexConfigurationDirectory = if ([string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
    Join-Path $env:USERPROFILE '.codex'
} else { $env:CODEX_HOME }
$codexConfigurationPath = Join-Path $codexConfigurationDirectory 'config.toml'
if (Test-Path -LiteralPath $codexConfigurationPath) {
    $configurationBackupPath = Join-Path $codexConfigurationDirectory ("config.before-project-mcp.{0}.{1}.toml" -f (Get-Date -Format 'yyyyMMddHHmmss'), [Guid]::NewGuid().ToString('N').Substring(0, 6))
    Copy-Item -LiteralPath $codexConfigurationPath -Destination $configurationBackupPath
    Write-Host "Backup da configuracao salvo em $configurationBackupPath"
}

& $CodexPath mcp add github -- $powershellPath -NoLogo -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'github.ps1')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao registrar GitHub MCP.' }
& $CodexPath mcp add firebase -- $nodePath (Join-Path $PSScriptRoot 'firebase.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao registrar Firebase MCP.' }
# Cold CLI startup can exceed Codex's default 10-second timeout. Only adjust
# the two tables managed here; all other user/plugin settings stay intact.
$configurationText = [System.IO.File]::ReadAllText($codexConfigurationPath)
foreach ($mcpServerName in @('github', 'firebase')) {
    $mcpTablePattern = '(?ms)(^\[mcp_servers\.' + $mcpServerName + '\]\r?\n)(.*?)(?=^\[|\z)'
    if (-not [regex]::IsMatch($configurationText, $mcpTablePattern)) {
        throw "Tabela MCP nao encontrada: $mcpServerName"
    }
    $configurationText = [regex]::Replace($configurationText, $mcpTablePattern, {
        param($mcpTableMatch)
        $mcpTableBody = [regex]::Replace($mcpTableMatch.Groups[2].Value, '(?m)^startup_timeout_sec\s*=.*\r?\n?', '').TrimEnd()
        $mcpTableMatch.Groups[1].Value + $mcpTableBody + "`nstartup_timeout_sec = 120`n`n"
    })
}
[System.IO.File]::WriteAllText($codexConfigurationPath, $configurationText, (New-Object System.Text.UTF8Encoding($false)))
& $CodexPath mcp list
if ($LASTEXITCODE -ne 0) { throw 'Falha ao conferir os servidores registrados.' }
Write-Host 'Registro concluido. Execute npm.cmd run mcp:check e reconecte os servidores no Codex.'
