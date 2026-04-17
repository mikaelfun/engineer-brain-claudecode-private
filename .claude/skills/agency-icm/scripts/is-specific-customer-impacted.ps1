param(
  [Parameter(Mandatory)][int]$IncidentId,
  [Parameter(Mandatory)][string]$CustomerName
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'is_specific_customer_impacted' -ArgumentsJson (@{ incidentId = $IncidentId; customerName = $CustomerName } | ConvertTo-Json -Compress)
