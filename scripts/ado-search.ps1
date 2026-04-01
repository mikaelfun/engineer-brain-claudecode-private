<#
.SYNOPSIS
  ADO Search wrapper — 替代 ADO MCP 的轻量搜索脚本。
  供 troubleshooter agent 通过 Bash 一行调用。

.PARAMETER Type
  搜索类型：wiki | code | workitem

.PARAMETER Query
  搜索关键词

.PARAMETER Org
  ADO 组织名（默认 msazure）。常用：msazure, contentidea, supportability

.PARAMETER Top
  返回结果数（默认 5）

.PARAMETER Profile
  az CLI profile 名（默认 microsoft-fangkun）

.EXAMPLE
  pwsh scripts/ado-search.ps1 -Type wiki -Query "Intune compliance" -Org msazure
  pwsh scripts/ado-search.ps1 -Type code -Query "CompliancePolicy" -Org contentidea -Top 10
  pwsh scripts/ado-search.ps1 -Type workitem -Query "enrollment failure" -Org supportability
#>
param(
    [Parameter(Mandatory)][ValidateSet('wiki','code','workitem')][string]$Type,
    [Parameter(Mandatory)][string]$Query,
    [string]$Org = 'msazure',
    [int]$Top = 5,
    [string]$Profile = 'microsoft-fangkun'
)

$env:AZURE_CONFIG_DIR = "$env:USERPROFILE\.azure-profiles\$Profile"

# Map type to ADO Search API resource
$resourceMap = @{
    'wiki'     = 'wikisearchresults'
    'code'     = 'codesearchresults'
    'workitem' = 'workitemsearchresults'
}
$resource = $resourceMap[$Type]

# Build search body
$body = @{ searchText = $Query; '`$skip' = 0; '`$top' = $Top } | ConvertTo-Json
# Fix PowerShell escaping — $skip/$top need literal $ in JSON
$body = $body -replace '`\$', '$'

$tmpFile = "$env:TEMP\ado-search-$Type.json"
$body | Set-Content -Path $tmpFile -Encoding utf8

# Execute search
$raw = az devops invoke `
    --area search `
    --resource $resource `
    --http-method POST `
    --in-file $tmpFile `
    --org "https://dev.azure.com/$Org" `
    --api-version "7.0" `
    --detect false 2>$null

$rawStr = $raw -join "`n"

if ($rawStr -match '"count"') {
    $obj = $rawStr | ConvertFrom-Json
    Write-Host "[$Type search] org=$Org query=`"$Query`" results=$($obj.count)"
    Write-Host ""

    switch ($Type) {
        'wiki' {
            foreach ($r in $obj.results) {
                Write-Host "--- Wiki: $($r.wiki.name) | Project: $($r.project.name)"
                Write-Host "    Path: $($r.path)"
                if ($r.hits) {
                    foreach ($h in $r.hits) {
                        # Show snippet highlights
                        $snippet = ($h.highlights -join ' ... ') -replace '<[^>]+>', ''
                        if ($snippet.Length -gt 200) { $snippet = $snippet.Substring(0, 200) + '...' }
                        Write-Host "    > $snippet"
                    }
                }
                Write-Host ""
            }
        }
        'code' {
            foreach ($r in $obj.results) {
                Write-Host "--- $($r.repository.name)/$($r.path)"
                Write-Host "    Project: $($r.project.name)"
                if ($r.matches -and $r.matches.content) {
                    foreach ($m in $r.matches.content) {
                        $snippet = ($m.highlights -join ' ... ') -replace '<[^>]+>', ''
                        if ($snippet.Length -gt 200) { $snippet = $snippet.Substring(0, 200) + '...' }
                        Write-Host "    > $snippet"
                    }
                }
                Write-Host ""
            }
        }
        'workitem' {
            foreach ($r in $obj.results) {
                $f = $r.fields
                $title = $f.'system.title'
                $state = $f.'system.state'
                $wiType = $f.'system.workitemtype'
                $id = $f.'system.id'
                Write-Host "--- [$wiType #$id] $title (State: $state)"
                Write-Host "    Project: $($r.project.name)"
                Write-Host ""
            }
        }
    }
} else {
    Write-Host "[ERROR] Search failed:"
    Write-Host $rawStr
    exit 1
}
