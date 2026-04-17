param(
  [Parameter(Mandatory)][int]$TeamId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_team_by_id' -ArgumentsJson (@{ teamId = $TeamId } | ConvertTo-Json -Compress)
