param(
  [Parameter(Mandatory)][int]$IncidentId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_impacted_services_regions_clouds' -ArgumentsJson (@{ incidentId = $IncidentId } | ConvertTo-Json -Compress)
