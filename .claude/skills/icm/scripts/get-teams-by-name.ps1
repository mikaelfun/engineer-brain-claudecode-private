param(
  [Parameter(Mandatory)][string]$TeamName
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_teams_by_name' -ArgumentsJson (@{ teamName = $TeamName } | ConvertTo-Json -Compress)
