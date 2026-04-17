param(
  [Parameter(Mandatory)][int[]]$TeamIds
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_on_call_schedule_by_team_id' -ArgumentsJson (@{ teamIds = $TeamIds } | ConvertTo-Json -Compress)
