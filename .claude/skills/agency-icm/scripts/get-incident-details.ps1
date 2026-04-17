param(
  [Parameter(Mandatory)][long]$IncidentId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_incident_details_by_id' -ArgumentsJson (@{ incidentId = $IncidentId } | ConvertTo-Json -Compress)
