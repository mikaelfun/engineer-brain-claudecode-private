param(
  [Parameter(Mandatory)][int]$IncidentId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_support_requests_crisit' -ArgumentsJson (@{ incidentId = $IncidentId } | ConvertTo-Json -Compress)
