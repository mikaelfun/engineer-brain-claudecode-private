<#
.SYNOPSIS
    通过 OData API 获取所有分配给当前工程师的活跃 Case（全量，不依赖 Dashboard 视图）。
.DESCRIPTION
    使用 _msdfm_assignedto_value 过滤条件（自定义 Assigned To 字段），确保不漏掉
    Owner 是 Queue 但 Assigned To 是工程师的 Case。
    statecode eq 0 = Active Case。
.PARAMETER OutputJson
    如果指定，将结果输出为 JSON 字符串（便于 caller 解析）。
.EXAMPLE
    pwsh scripts/list-active-cases.ps1
    pwsh scripts/list-active-cases.ps1 -OutputJson
#>
param(
    [switch]$OutputJson
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

$userId = $script:D365CurrentUserId

Write-Host "🔵 Querying active cases via OData (assignedto=$userId)..."

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
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="msdfm_assignedto" operator="eq" value="$userId"/>
    </filter>
    <order attribute="createdon" descending="true"/>
    <link-entity name="account" from="accountid" to="customerid" alias="cust" link-type="outer">
      <attribute name="name"/>
    </link-entity>
  </entity>
</fetch>
"@

$result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXml

if (-not $result -or -not $result.value) {
    Write-Host "⚠️ No results or API error. Falling back to ownerid query..."
    
    # Fallback: also try ownerid-based query (some cases may be directly owned)
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
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="ownerid" operator="eq" value="$userId"/>
    </filter>
    <order attribute="createdon" descending="true"/>
    <link-entity name="account" from="accountid" to="customerid" alias="cust" link-type="outer">
      <attribute name="name"/>
    </link-entity>
  </entity>
</fetch>
"@
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXmlFallback
    if (-not $result -or -not $result.value) {
        Write-Host "❌ Both queries failed. Cannot get active case list."
        exit 1
    }
    Write-Host "⚠️ Using ownerid fallback — may miss cases where owner is a queue."
}

$cases = $result.value

Write-Host "✅ Found $($cases.Count) active case(s)"

if ($OutputJson) {
    $output = $cases | ForEach-Object {
        @{
            ticketnumber = $_.ticketnumber
            title        = $_.title
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
    Write-Host "=== Active Cases ==="
    foreach ($c in $cases) {
        $age = [Math]::Floor(([DateTime]::UtcNow - [DateTime]::Parse($c.createdon)).TotalDays)
        $customer = if ($_."cust.name") { $_."cust.name" } else { "N/A" }
        $status = $c."statuscode@OData.Community.Display.V1.FormattedValue"
        Write-Host "  $($c.ticketnumber)  [$status]  Age:${age}d  $($c.title)"
    }
    Write-Host "===================="
}
