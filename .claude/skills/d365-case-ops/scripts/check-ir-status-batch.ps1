<#
.SYNOPSIS
    批量检查所有活跃 Case 的 IR/FDR/FWR 状态（单次 API 调用）。
.DESCRIPTION
    通过 FetchXml link-entity 关联 msdfm_caseperfattributes 实体，
    单次 API 调用 ~2s 获取全部活跃 Case 的 Performance Indicators。
    比逐个 Case 用 Playwright UI scraping 快 10-20x。

    状态映射：
      847050000 (Pending)  → In Progress
      847050001 (Met)      → Succeeded
      847050002 (Missed)   → Expired

    注意：API 不提供 "Nearing" 状态（仅 UI timer 有），但返回
    remaining 和 expirationTime 字段供上层判断。
.PARAMETER SaveMeta
    将结果写入各 case 的 casework-meta.json（upsert）。
.PARAMETER MetaDir
    casework-meta.json 所在的 cases 根目录（如 cases/active）。
    默认：$env:D365_CASES_ROOT\active（fallback: 读取 config.json 的 casesRoot）
.PARAMETER TicketNumbers
    可选：仅查询指定的 ticket numbers（逗号分隔或数组）。
    不指定则查当前工程师的所有活跃 Case。
.EXAMPLE
    .\check-ir-status-batch.ps1
    .\check-ir-status-batch.ps1 -SaveMeta
    .\check-ir-status-batch.ps1 -SaveMeta -MetaDir "C:\cases\active"
    .\check-ir-status-batch.ps1 -TicketNumbers "2603090040000814","2603100030005863"
.OUTPUTS
    JSON 数组，每个元素：
    {
      "ticketnumber": "...",
      "is24x7": true/false,
      "irSla": { "status": "Succeeded", "remaining": null, "expirationTime": "...", "completedOn": "..." },
      "fdr":   { "status": "In Progress", "remaining": "...", "expirationTime": "..." },
      "fwr":   { "status": "Expired", "remaining": null }
    }
#>
param(
    [switch]$SaveMeta,
    [string]$MetaDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [string[]]$TicketNumbers = @()
)

. "$PSScriptRoot\_init.ps1"

$sw = [System.Diagnostics.Stopwatch]::StartNew()

# --- Status value mapping ---
function ConvertTo-KpiStatus {
    param([object]$Value)
    switch ($Value) {
        847050001 { return "Succeeded" }
        847050002 { return "Expired" }
        847050000 { return "In Progress" }
        default   { return "unknown" }
    }
}

# --- Build FetchXml ---
$userId = $script:D365CurrentUserId

# Build filter: either specific tickets or all active cases for current user
if ($TicketNumbers.Count -gt 0) {
    # Filter by specific ticket numbers
    $ticketConditions = ($TicketNumbers | ForEach-Object {
        "      <condition attribute=`"ticketnumber`" operator=`"eq`" value=`"$_`"/>"
    }) -join "`n"
    $filterXml = @"
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0"/>
      <filter type="or">
$ticketConditions
      </filter>
    </filter>
"@
} else {
    $filterXml = @"
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="msdfm_assignedto" operator="eq" value="$userId"/>
    </filter>
"@
}

$fetchXml = @"
<fetch top="200">
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <attribute name="title"/>
    <attribute name="msdfm_is24x7"/>
    <attribute name="msdfm_caseperfattributesid"/>
$filterXml
    <order attribute="createdon" descending="true"/>
    <link-entity name="msdfm_caseperfattributes" from="msdfm_caseperfattributesid" to="msdfm_caseperfattributesid" alias="kpi" link-type="outer">
      <attribute name="msdfm_initialresponse"/>
      <attribute name="msdfm_firstdayresolution"/>
      <attribute name="msdfm_firstweekresolution"/>
      <attribute name="msdfm_irslaremainingtime"/>
      <attribute name="msdfm_initialresponseexpirationtime"/>
      <attribute name="msdfm_initialresponsecompletedon"/>
    </link-entity>
  </entity>
</fetch>
"@

Write-Host "🔵 Batch IR/FDR/FWR check via API..."

$result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXml

if (-not $result -or -not $result.value) {
    Write-Host "❌ API query failed or returned no results"
    exit 1
}

$cases = $result.value
Write-Host "✅ Retrieved KPI data for $($cases.Count) case(s)"

# --- Parse results ---
$output = @()
foreach ($c in $cases) {
    $ticket = $c.ticketnumber
    $is24x7 = if ($c.msdfm_is24x7 -eq $true -or $c."msdfm_is24x7@OData.Community.Display.V1.FormattedValue" -eq "Yes") { $true } else { $false }

    # Parse KPI statuses from linked entity
    $irRaw = $c."kpi.msdfm_initialresponse"
    $fdrRaw = $c."kpi.msdfm_firstdayresolution"
    $fwrRaw = $c."kpi.msdfm_firstweekresolution"

    $irStatus = ConvertTo-KpiStatus $irRaw
    $fdrStatus = ConvertTo-KpiStatus $fdrRaw
    $fwrStatus = ConvertTo-KpiStatus $fwrRaw

    # Additional IR fields
    $irRemaining = $c."kpi.msdfm_irslaremainingtime"
    $irExpiration = $c."kpi.msdfm_initialresponseexpirationtime"
    $irCompletedOn = $c."kpi.msdfm_initialresponsecompletedon"

    $entry = @{
        ticketnumber = $ticket
        is24x7       = $is24x7
        irSla        = @{
            status         = $irStatus
            remaining      = $irRemaining
            expirationTime = $irExpiration
            completedOn    = $irCompletedOn
        }
        fdr          = @{
            status    = $fdrStatus
            remaining = $null
        }
        fwr          = @{
            status    = $fwrStatus
            remaining = $null
        }
    }

    $output += $entry

    # Display
    $irIcon = switch ($irStatus) { 'Succeeded' { '✅' }; 'Expired' { '❌' }; 'In Progress' { '⏳' }; default { '❓' } }
    $fdrIcon = switch ($fdrStatus) { 'Succeeded' { '✅' }; 'Expired' { '❌' }; 'In Progress' { '⏳' }; default { '❓' } }
    $fwrIcon = switch ($fwrStatus) { 'Succeeded' { '✅' }; 'Expired' { '❌' }; 'In Progress' { '⏳' }; default { '❓' } }
    Write-Host "  $ticket  IR:$irIcon $irStatus  FDR:$fdrIcon $fdrStatus  FWR:$fwrIcon $fwrStatus$(if($is24x7){' [24x7]'})"
}

# --- Save to casework-meta.json if requested ---
if ($SaveMeta) {
    $savedCount = 0
    foreach ($entry in $output) {
        $ticket = $entry.ticketnumber
        $caseMetaDir = Join-Path $MetaDir $ticket
        if (-not (Test-Path $caseMetaDir)) { New-Item -ItemType Directory -Path $caseMetaDir -Force | Out-Null }
        $metaFile = Join-Path $caseMetaDir "casework-meta.json"

        # Load existing or create new
        $meta = @{}
        if (Test-Path $metaFile) {
            try { $meta = Get-Content $metaFile -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable } catch { $meta = @{} }
        }

        $now = (Get-Date).ToString("o")
        $meta["caseNumber"] = $ticket
        $meta["lastInspected"] = $now
        $meta["irSla"] = @{
            status         = $entry.irSla.status
            remaining      = $entry.irSla.remaining
            expirationTime = $entry.irSla.expirationTime
            completedOn    = $entry.irSla.completedOn
            checkedAt      = $now
            source         = "api"
        }
        $meta["fdr"] = @{
            status    = $entry.fdr.status
            remaining = $entry.fdr.remaining
            checkedAt = $now
            source    = "api"
        }
        $meta["fwr"] = @{
            status    = $entry.fwr.status
            remaining = $entry.fwr.remaining
            checkedAt = $now
            source    = "api"
        }

        $meta | ConvertTo-Json -Depth 5 | Set-Content -Path $metaFile -Encoding UTF8
        $savedCount++
    }
    Write-Host "💾 Meta saved for $savedCount case(s)"
}

$sw.Stop()
Write-Host "🔵 Batch IR check: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s for $($cases.Count) case(s)"

# Return structured result for programmatic use
$output | ConvertTo-Json -Depth 5 -Compress
