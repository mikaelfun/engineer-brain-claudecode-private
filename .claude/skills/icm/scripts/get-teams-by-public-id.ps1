param(
  [Parameter(Mandatory)][string]$PublicId
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$invokePath = Join-Path $scriptDir 'invoke-icm-tool.ps1'
& $invokePath -ToolName 'get_teams_by_public_id' -ArgumentsJson (@{ publicId = $PublicId } | ConvertTo-Json -Compress)
