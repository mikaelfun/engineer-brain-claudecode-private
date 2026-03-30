<#
.SYNOPSIS
    轻量预检：单次 batch API 检测 Case 数据是否有变化。
.DESCRIPTION
    通过 1 次 D365 batch API call 拉取 email/note/phone count + ICM + status，
    与本地 case-info.md 对比。如无变化则输出 NO_CHANGE，data-refresh 可跳过。

    副作用：
    - 预热 Playwright 浏览器（Ensure-D365Tab）
    - 缓存 incidentId 到 d365-case-context.json
    以上两项可被后续 data-refresh 直接复用。

.PARAMETER TicketNumber
    Case 编号（16位数字）

.PARAMETER OutputDir
    输出根目录（默认读 config.json 的 casesRoot）

.PARAMETER MetaDir
    casehealth-meta.json 所在目录（默认 = OutputDir）

.EXAMPLE
    pwsh -NoProfile -File check-case-changes.ps1 -TicketNumber 2603260030005229 -OutputDir ./cases/active
    # Output: NO_CHANGE|emails=5,notes=2,icm=,status=Waiting for customer confirmation
    # Output: CHANGED|emails=5→6,notes=2,icm=→12345,status=Waiting for customer confirmation→Troubleshooting
#>
param(
    [Parameter(Mandatory)][string]$TicketNumber,
    [string]$OutputDir = $(
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    ),
    [string]$MetaDir = ''
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

. "$PSScriptRoot\_init.ps1"

$caseDir = Join-Path $OutputDir $TicketNumber
$snapshotFile = Join-Path $caseDir "case-info.md"
if (-not $MetaDir) { $MetaDir = $OutputDir }
$metaFile = Join-Path (Join-Path $MetaDir $TicketNumber) "casehealth-meta.json"

# --- 1. Read local baseline from case-info.md ---
$localEmailCount = -1
$localNoteCount = -1
$localPhoneCount = -1
$localIcmId = ''
$localStatus = ''

if (Test-Path $snapshotFile) {
    $content = Get-Content $snapshotFile -Raw -Encoding UTF8
    if ($content -match '## Emails \((\d+)\)') { $localEmailCount = [int]$Matches[1] }
    if ($content -match '## Notes \((\d+)\)') { $localNoteCount = [int]$Matches[1] }
    if ($content -match '## Phone Calls \((\d+)\)') { $localPhoneCount = [int]$Matches[1] }
    if ($content -match '\| ICM Number \|\s*(\d+)') { $localIcmId = $Matches[1] }
    if ($content -match '\| Status \|\s*([^|\r\n]+)') { $localStatus = $Matches[1].Trim() }
}

# --- 2. Get incidentId (cached or API) ---
$incidentId = Get-IncidentId -TicketNumber $TicketNumber
if (-not $incidentId) {
    Write-Host "CHANGED|reason=case_not_found_in_api"
    exit 0
}

# --- 3. Single batch API: counts + ICM + status ---
$emailCountFetch = @"
<fetch aggregate="true"><entity name="email"><attribute name="activityid" aggregate="count" alias="count"/><filter><condition attribute="regardingobjectid" operator="eq" value="$incidentId"/><condition attribute="subject" operator="not-begin-with" value="Ownership accepted"/><condition attribute="subject" operator="not-begin-with" value="File Uploaded"/><condition attribute="subject" operator="not-begin-with" value="Case created"/></filter></entity></fetch>
"@
$noteCountFetch = @"
<fetch aggregate="true"><entity name="annotation"><attribute name="annotationid" aggregate="count" alias="count"/><filter><condition attribute="objectid" operator="eq" value="$incidentId"/></filter></entity></fetch>
"@
$phoneCountFetch = @"
<fetch aggregate="true"><entity name="phonecall"><attribute name="activityid" aggregate="count" alias="count"/><filter><condition attribute="regardingobjectid" operator="eq" value="$incidentId"/></filter></entity></fetch>
"@
$icmFetch = @"
<fetch count="5"><entity name="msdfm_icmdetail"><attribute name="msdfm_icmid"/><attribute name="msdfm_status"/><link-entity name="incident" from="incidentid" to="msdfm_caseid" alias="case"><filter><condition attribute="incidentid" operator="eq" value="$incidentId"/></filter></link-entity></entity></fetch>
"@

$batchRequests = @(
    @{ Endpoint = "/api/data/v9.0/incidents($incidentId)?`$select=statuscode"; },  # 0: status
    @{ Endpoint = "/api/data/v9.0/emails"; FetchXml = $emailCountFetch },           # 1: email count
    @{ Endpoint = "/api/data/v9.0/annotations"; FetchXml = $noteCountFetch },       # 2: note count
    @{ Endpoint = "/api/data/v9.0/phonecalls"; FetchXml = $phoneCountFetch },       # 3: phone count
    @{ Endpoint = "/api/data/v9.0/msdfm_icmdetails"; FetchXml = $icmFetch }        # 4: ICM
)

$results = Invoke-D365ApiBatch -Requests $batchRequests
if (-not $results -or $results.Count -lt 5) {
    Write-Host "CHANGED|reason=api_batch_failed"
    exit 0
}

# --- 4. Parse API results ---
$apiStatus = ''
if ($results[0] -and $results[0]._status -eq 200) {
    $apiStatus = $results[0].'statuscode@OData.Community.Display.V1.FormattedValue'
}

$apiEmailCount = 0
if ($results[1] -and $results[1].value -and $results[1].value.Count -gt 0) {
    $apiEmailCount = [int]$results[1].value[0].count
}

$apiNoteCount = 0
if ($results[2] -and $results[2].value -and $results[2].value.Count -gt 0) {
    $apiNoteCount = [int]$results[2].value[0].count
}

$apiPhoneCount = 0
if ($results[3] -and $results[3].value -and $results[3].value.Count -gt 0) {
    $apiPhoneCount = [int]$results[3].value[0].count
}

$apiIcmId = ''
if ($results[4] -and $results[4].value -and $results[4].value.Count -gt 0) {
    $icm = $results[4].value[0]
    $apiIcmId = if ($icm.msdfm_icmid) { $icm.msdfm_icmid } else { '' }
}

# --- 5. Compare ---
$changes = @()

if ($localEmailCount -eq -1) {
    $changes += "no_local_cache"
} else {
    if ($apiEmailCount -ne $localEmailCount) { $changes += "emails=${localEmailCount}->${apiEmailCount}" }
    if ($apiNoteCount -ne $localNoteCount) { $changes += "notes=${localNoteCount}->${apiNoteCount}" }
    if ($apiPhoneCount -ne $localPhoneCount) { $changes += "phones=${localPhoneCount}->${apiPhoneCount}" }
    if ($apiIcmId -ne $localIcmId) { $changes += "icm=${localIcmId}->${apiIcmId}" }
    if ($apiStatus -and $localStatus -and $apiStatus -ne $localStatus) { $changes += "status=${localStatus}->${apiStatus}" }
}

# --- 6. Output ---
if ($changes.Count -eq 0) {
    Write-Host "NO_CHANGE|emails=$apiEmailCount,notes=$apiNoteCount,icm=$apiIcmId,status=$apiStatus"
} else {
    Write-Host "CHANGED|$($changes -join ',')"
}
