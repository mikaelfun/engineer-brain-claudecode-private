param(
  [Parameter(Mandatory)][string[]]$Names
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_services_by_names' -ArgumentsJson (@{ names = $Names } | ConvertTo-Json -Compress)
