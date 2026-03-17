param(
  [Parameter(Mandatory)][string]$IncidentId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_incident_location' -ArgumentsJson (@{ incidentId = $IncidentId } | ConvertTo-Json -Compress)
