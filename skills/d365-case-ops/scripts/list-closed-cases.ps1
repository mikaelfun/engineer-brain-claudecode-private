<#
.SYNOPSIS
    通过 OData API 获取当前工程师名下的已关闭 Case（Resolved + Cancelled）。
.DESCRIPTION
    使用 FetchXML 查询 statecode ne 0（非 Active），按 msdfm_assignedto 或 ownerid 过滤。
    用于 detect-case-status.ps1 判断本地 active/ 目录中的 case 是否已在 D365 关闭。
.PARAMETER OutputJson
    如果指定，将结果输出为 JSON 字符串（便于 caller 解析）。
.PARAMETER DaysBack
    查询最近 N 天内关闭的 case（默认 90 天），避免返回过多历史数据。
.EXAMPLE
    pwsh scripts/list-closed-cases.ps1
    pwsh scripts/list-closed-cases.ps1 -OutputJson
    pwsh scripts/list-closed-cases.ps1 -OutputJson -DaysBack 30
#>
param(
    [switch]$OutputJson,
    [int]$DaysBack = 90
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

$userId = $script:D365CurrentUserId
$cutoffDate = (Get-Date).AddDays(-$DaysBack).ToString("yyyy-MM-ddTHH:mm:ssZ")

Write-Host "🔵 Querying closed cases via OData (assignedto=$userId, last $DaysBack days)..."

# Query 1: by msdfm_assignedto (primary — covers queue-owned cases)
$fetchXml = @"
<fetch top="200">
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <attribute name="title"/>
    <attribute name="statecode"/>
    <attribute name="statuscode"/>
    <attribute name="severitycode"/>
    <attribute name="createdon"/>
    <attribute name="modifiedon"/>
    <attribute name="msdfm_assignedto"/>
    <filter type="and">
      <condition attribute="statecode" operator="ne" value="0"/>
      <condition attribute="msdfm_assignedto" operator="eq" value="$userId"/>
      <condition attribute="modifiedon" operator="ge" value="$cutoffDate"/>
    </filter>
    <order attribute="modifiedon" descending="true"/>
    <link-entity name="account" from="accountid" to="customerid" alias="cust" link-type="outer">
      <attribute name="name"/>
    </link-entity>
  </entity>
</fetch>
"@

$result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXml

$cases = @()

if ($result -and $result.value) {
    $cases += $result.value
}

# Query 2: fallback by ownerid (catches directly-owned cases)
$fetchXmlFallback = @"
<fetch top="200">
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <attribute name="title"/>
    <attribute name="statecode"/>
    <attribute name="statuscode"/>
    <attribute name="severitycode"/>
    <attribute name="createdon"/>
    <attribute name="modifiedon"/>
    <filter type="and">
      <condition attribute="statecode" operator="ne" value="0"/>
      <condition attribute="ownerid" operator="eq" value="$userId"/>
      <condition attribute="modifiedon" operator="ge" value="$cutoffDate"/>
    </filter>
    <order attribute="modifiedon" descending="true"/>
    <link-entity name="account" from="accountid" to="customerid" alias="cust" link-type="outer">
      <attribute name="name"/>
    </link-entity>
  </entity>
</fetch>
"@

$resultFallback = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXmlFallback

if ($resultFallback -and $resultFallback.value) {
    # Merge, dedup by ticketnumber
    $existingTickets = @{}
    foreach ($c in $cases) { $existingTickets[$c.ticketnumber] = $true }
    foreach ($c in $resultFallback.value) {
        if (-not $existingTickets.ContainsKey($c.ticketnumber)) {
            $cases += $c
        }
    }
}

if ($cases.Count -eq 0) {
    Write-Host "ℹ️ No closed cases found in the last $DaysBack days."
    if ($OutputJson) { Write-Output "[]" }
    exit 0
}

Write-Host "✅ Found $($cases.Count) closed case(s)"

if ($OutputJson) {
    $output = $cases | ForEach-Object {
        @{
            ticketnumber = $_.ticketnumber
            title        = $_.title
            statecode    = $_.statecode
            statuscode   = $_."statuscode@OData.Community.Display.V1.FormattedValue"
            severitycode = $_."severitycode@OData.Community.Display.V1.FormattedValue"
            createdon    = $_.createdon
            modifiedon   = $_.modifiedon
            customer     = $_."cust.name"
        }
    }
    Write-Output ($output | ConvertTo-Json -Compress)
} else {
    Write-Host ""
    Write-Host "=== Closed Cases (last $DaysBack days) ==="
    foreach ($c in $cases) {
        $status = $c."statuscode@OData.Community.Display.V1.FormattedValue"
        $stateLabel = switch ([int]$c.statecode) { 1 { "Resolved" } 2 { "Cancelled" } default { "Unknown" } }
        Write-Host "  $($c.ticketnumber)  [$stateLabel/$status]  $($c.title)"
    }
    Write-Host "===================="
}
