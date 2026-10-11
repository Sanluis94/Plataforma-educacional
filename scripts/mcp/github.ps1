[CmdletBinding()]
param(
    [string]$BinaryPath = (Join-Path $env:USERPROFILE '.codex\tools\github-mcp-server\v2.0.2\github-mcp-server.exe')
)

$ErrorActionPreference = 'Stop'
# Some MCP clients pass only a minimal environment. Windows PowerShell needs
# PATHEXT even when resolving gh.exe by its full path.
if ($env:PATHEXT -notmatch '(?i)(^|;)\.EXE(;|$)') {
    $env:PATHEXT = '.COM;.EXE;.BAT;.CMD;' + $env:PATHEXT
}
$githubExitCode = 1
$githubToken = $null
$githubPreviousEnvironment = @{}
$githubPreviousOutputEncoding = $OutputEncoding
$githubPreviousConsoleEncoding = [Console]::OutputEncoding

# Keep the selected tools and github.com authentication independent of inherited
# server settings. Values are saved only in memory and restored before exit.
$githubManagedEnvironment = @(
    'GITHUB_PERSONAL_ACCESS_TOKEN',
    'GITHUB_TOOLSETS',
    'GITHUB_TOOLS',
    'GITHUB_DYNAMIC_TOOLSETS',
    'GITHUB_EXCLUDE_TOOLS',
    'GITHUB_FEATURES',
    'GITHUB_READ_ONLY',
    'GITHUB_LOCKDOWN_MODE',
    'GITHUB_INSIDERS',
    'GITHUB_HOST',
    'GITHUB_LOG_FILE',
    'GITHUB_ENABLE_COMMAND_LOGGING',
    'GITHUB_EXPORT_TRANSLATIONS',
    'GITHUB_APP_ID',
    'GITHUB_APP_INSTALLATION_ID',
    'GITHUB_APP_PRIVATE_KEY_PATH',
    'GITHUB_APP_PRIVATE_KEY',
    'GITHUB_OAUTH_CLIENT_ID',
    'GITHUB_OAUTH_CLIENT_SECRET',
    'GITHUB_OAUTH_SCOPES',
    'GITHUB_OAUTH_CALLBACK_PORT'
)

try {
    if (-not (Test-Path -LiteralPath $BinaryPath -PathType Leaf)) {
        [Console]::Error.WriteLine('GitHub MCP: official v2.0.2 executable was not found.')
        exit 1
    }

    $githubCli = Get-Command 'gh.exe' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $githubCli) {
        [Console]::Error.WriteLine('GitHub MCP: GitHub CLI is not available in PATH.')
        exit 1
    }

    # Capture the existing CLI credential without printing or persisting it.
    $githubTokenOutput = & $githubCli.Source auth token --hostname github.com 2>$null
    if ($LASTEXITCODE -ne 0) {
        [Console]::Error.WriteLine('GitHub MCP: sign in with gh auth login --hostname github.com first.')
        exit 1
    }

    $githubToken = ($githubTokenOutput -join '').Trim()
    $githubTokenOutput = $null
    if ([string]::IsNullOrWhiteSpace($githubToken)) {
        [Console]::Error.WriteLine('GitHub MCP: GitHub CLI did not provide an authentication token.')
        exit 1
    }

    foreach ($githubEnvironmentName in $githubManagedEnvironment) {
        $githubPreviousEnvironment[$githubEnvironmentName] = [Environment]::GetEnvironmentVariable($githubEnvironmentName, 'Process')
        [Environment]::SetEnvironmentVariable($githubEnvironmentName, $null, 'Process')
    }

    [Environment]::SetEnvironmentVariable('GITHUB_PERSONAL_ACCESS_TOKEN', $githubToken, 'Process')
    $githubToken = $null

    # stdout belongs exclusively to the MCP JSON-RPC transport; logs stay on stderr.
    $OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    [Console]::OutputEncoding = $OutputEncoding
    & $BinaryPath stdio '--toolsets=context,repos,issues,pull_requests,actions' --lockdown-mode
    $githubExitCode = $LASTEXITCODE
}
catch {
    # Do not include exception details, which may contain credential-bearing data.
    [Console]::Error.WriteLine('GitHub MCP: the server could not start. Check the CLI login and executable path.')
    $githubExitCode = 1
}
finally {
    $githubToken = $null
    $githubTokenOutput = $null
    foreach ($githubEnvironmentName in $githubPreviousEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($githubEnvironmentName, $githubPreviousEnvironment[$githubEnvironmentName], 'Process')
    }
    $githubPreviousEnvironment.Clear()
    $OutputEncoding = $githubPreviousOutputEncoding
    [Console]::OutputEncoding = $githubPreviousConsoleEncoding
}

exit $githubExitCode
