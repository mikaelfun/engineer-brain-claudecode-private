<#
.SYNOPSIS
    抓取 Case 完整快照并保存为 Markdown 文件

.DESCRIPTION
    通过 OData API 抓取 Case 核心信息、联系人、Entitlement、Timeline、Labor、ICM、Attachments，
    保存到指定 workspace 的 cases/{CaseNumber}/ 目录下。

    缓存策略：
    - IncrementalIfCached（默认）：有本地 case-info.md 时只拉取基本信息 + counts + labor + ICM，
      跳过联系人、Customer Statement、Entitlement（变化少）。
    - CacheMinutes > 0：文件在 N 分钟内则完全跳过，直接返回本地文件。
    - CacheMinutes 0 + 不带 IncrementalIfCached：强制全量刷新。

.PARAMETER TicketNumber
    Case 编号（16位数字）

.PARAMETER OutputDir
    输出根目录，默认为 dfmworker workspace 的 cases/ 目录

.PARAMETER CacheMinutes
    全量缓存有效期（分钟），默认 10。设为 0 强制刷新。

.PARAMETER IncrementalIfCached
    有本地缓存时使用增量模式（只拉基本信息 + counts + labor + ICM）。

.EXAMPLE
    pwsh scripts/fetch-case-snapshot.ps1 -TicketNumber 2603100030005863
    pwsh scripts/fetch-case-snapshot.ps1 -TicketNumber 2603100030005863 -CacheMinutes 0
    pwsh scripts/fetch-case-snapshot.ps1 -TicketNumber 2603100030005863 -IncrementalIfCached
#>
param(
    [Parameter(Mandatory)][string]$TicketNumber,
    [string]$OutputDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [int]$CacheMinutes = 10,
    [switch]$IncrementalIfCached,
    [string]$OutputSubDir,  # Override output subdirectory name (default: TicketNumber). Used by AR mode to write directly to AR case dir.
    [string]$MainCaseNumber  # If set, this is an AR case; MainCaseNumber is the parent case
)

. "$PSScriptRoot\_init.ps1"

$caseDir = Join-Path $OutputDir $(if ($OutputSubDir) { $OutputSubDir } else { $TicketNumber })
$snapshotFile = Join-Path $caseDir "case-info.md"
$timelineFile = Join-Path $caseDir "timeline.md"
$hasLocalCache = (Test-Path $snapshotFile)

# --- Cache check: short-circuit if file is fresh ---
if ($CacheMinutes -gt 0 -and $hasLocalCache) {
    $age = (Get-Date) - (Get-Item $snapshotFile).LastWriteTime
    if ($age.TotalMinutes -lt $CacheMinutes) {
        Write-Host "✅ Cache hit ($([math]::Round($age.TotalMinutes,1)) min ago). Use -CacheMinutes 0 to force refresh."
        Write-Host "📄 $snapshotFile"
        $notesFile = Join-Path $caseDir "notes.md"
        if (Test-Path $notesFile) { Write-Host "📄 $notesFile" }
        Get-Content $snapshotFile -Raw
        return
    }
}

# --- Incremental mode: only refresh mutable fields when cache exists ---
$incrementalMode = $IncrementalIfCached -and $hasLocalCache

Write-Host "🔵 Fetching case snapshot for $TicketNumber $(if ($incrementalMode) { '(incremental)' } else { '(full)' })..."

# --- 1. Get incident ID ---
# AR mode: fetch main case data for the snapshot, AR-specific data is patched later
$fetchTicket = if ($MainCaseNumber) { $MainCaseNumber } else { $TicketNumber }
$incidentId = Get-IncidentId -TicketNumber $fetchTicket
if (-not $incidentId) {
    Write-Error "❌ Case $TicketNumber not found"
    exit 1
}

# --- 2. Incident core fields (required first — provides contactId, redemptionId for dependent queries) ---
Write-Host "🔵 Reading incident fields..."
$inc = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($incidentId)"
if (-not $inc -or $inc._status -ne 200) {
    Write-Error "❌ Failed to read incident"
    exit 1
}

$title = $inc.title
$severity = $inc.'severitycode@OData.Community.Display.V1.FormattedValue'
$status = $inc.'statuscode@OData.Community.Display.V1.FormattedValue'
$sap = $inc.msdfm_supportareapath
$contactName = $inc.'_primarycontactid_value@OData.Community.Display.V1.FormattedValue'
$contactId = $inc._primarycontactid_value
$customerName = $inc.'_customerid_value@OData.Community.Display.V1.FormattedValue'
$assignedTo = $inc.'_msdfm_assignedto_value@OData.Community.Display.V1.FormattedValue'
$createdOn = $inc.'createdon@OData.Community.Display.V1.FormattedValue'
$caseAge = $inc.'msdfm_caseage@OData.Community.Display.V1.FormattedValue'
$activeHours = $inc.'msdfm_activehours@OData.Community.Display.V1.FormattedValue'
$origin = $inc.'caseorigincode@OData.Community.Display.V1.FormattedValue'
$timezone = $inc.'_msdfm_timezoneid_value@OData.Community.Display.V1.FormattedValue'
$country = $inc.'_msdfm_countryid_value@OData.Community.Display.V1.FormattedValue'
$is24x7 = $inc.'msdfm_is24x7@OData.Community.Display.V1.FormattedValue'
$redemptionId = $inc._msdfm_entitlementredemptionid_value

# --- 3. Batch parallel: all remaining queries in one playwright-cli call ---
# Incremental mode skips contact/statement/entitlement (low-change fields)
if ($incrementalMode) {
    Write-Host "🔵 Incremental: fetching counts, labor, ICM only..."
} else {
    Write-Host "🔵 Batch fetching contact, statement, entitlement, labor, ICM, attachments, counts..."
}

# Build FetchXml queries
$emailCountFetch = @"
<fetch aggregate="true"><entity name="email"><attribute name="activityid" aggregate="count" alias="count"/><filter><condition attribute="regardingobjectid" operator="eq" value="$incidentId"/><condition attribute="subject" operator="not-begin-with" value="Ownership accepted"/><condition attribute="subject" operator="not-begin-with" value="File Uploaded"/><condition attribute="subject" operator="not-begin-with" value="Case created"/></filter></entity></fetch>
"@
$noteCountFetch = @"
<fetch aggregate="true"><entity name="annotation"><attribute name="annotationid" aggregate="count" alias="count"/><filter><condition attribute="objectid" operator="eq" value="$incidentId"/></filter></entity></fetch>
"@
$phoneCountFetch = @"
<fetch aggregate="true"><entity name="phonecall"><attribute name="activityid" aggregate="count" alias="count"/><filter><condition attribute="regardingobjectid" operator="eq" value="$incidentId"/></filter></entity></fetch>
"@
$laborFetch = @"
<fetch count="50"><entity name="msdfm_labor"><attribute name="msdfm_classification"/><attribute name="msdfm_duration"/><attribute name="msdfm_description"/><attribute name="msdfm_date"/><attribute name="createdon"/><order attribute="createdon" descending="true"/><filter><condition attribute="msdfm_caseid" operator="eq" value="$incidentId"/></filter></entity></fetch>
"@
$icmFetch = @"
<fetch count="50"><entity name="msdfm_icmdetail"><attribute name="msdfm_status"/><attribute name="msdfm_severity"/><attribute name="msdfm_title"/><attribute name="msdfm_icmid"/><attribute name="msdfm_url"/><attribute name="msdfm_createdate"/><link-entity name="incident" from="incidentid" to="msdfm_caseid" alias="case"><filter><condition attribute="incidentid" operator="eq" value="$incidentId"/></filter></link-entity></entity></fetch>
"@
$attFetch = @"
<fetch count="100"><entity name="msdfm_dtmattachmentmetadata"><attribute name="msdfm_filename"/><attribute name="msdfm_filesize"/><attribute name="msdfm_dtmfilepath"/><attribute name="msdfm_dtmlocationurl"/><attribute name="msdfm_dtmattachmentstatus"/><attribute name="createdon"/><filter><condition attribute="msdfm_caseid" operator="eq" value="$incidentId"/></filter><order attribute="createdon" descending="true"/></entity></fetch>
"@

# Build batch request list — indices: 0=contact, 1=statement, 2=entitlement, 3=labor, 4=icm, 5=attachments, 6=emailCount, 7=noteCount, 8=phoneCount
$batchRequests = @()

if ($incrementalMode) {
    # Incremental: only mutable data (3 placeholders + 6 real queries)
    $placeholder = @{ Endpoint = "/api/data/v9.0/incidents($incidentId)?`$select=incidentid" }
    $batchRequests += $placeholder  # 0: contact placeholder
    $batchRequests += $placeholder  # 1: statement placeholder
    $batchRequests += $placeholder  # 2: entitlement placeholder
} else {
    # Full mode: contact, statement, entitlement
    # 0: Contact
    if ($contactId) {
        $batchRequests += @{ Endpoint = "/api/data/v9.0/contacts($contactId)?`$select=emailaddress1,msdfm_internationalphonenumber,preferredcontactmethodcode,fullname" }
    } else {
        $batchRequests += @{ Endpoint = "/api/data/v9.0/incidents($incidentId)?`$select=incidentid" }
    }
    # 1: Customer Statement
    $batchRequests += @{ Endpoint = "/api/data/v9.0/incidents($incidentId)/msdfm_CaseRestrictedAttributesId?`$select=msdfm_customerstatement" }
    # 2: Entitlement
    if ($redemptionId) {
        $batchRequests += @{ Endpoint = "/api/data/v9.0/msdfm_entitlementredemptions($redemptionId)?`$select=msdfm_servicelevel,msdfm_servicename,msdfm_schedule,_msdfm_contractcountry_value" }
    } else {
        $batchRequests += @{ Endpoint = "/api/data/v9.0/incidents($incidentId)?`$select=incidentid" }
    }
}

# 3-8: FetchXml queries
$batchRequests += @{ Endpoint = "/api/data/v9.0/msdfm_labors"; FetchXml = $laborFetch }
$batchRequests += @{ Endpoint = "/api/data/v9.0/msdfm_icmdetails"; FetchXml = $icmFetch }
$batchRequests += @{ Endpoint = "/api/data/v9.0/msdfm_dtmattachmentmetadatas"; FetchXml = $attFetch }
$batchRequests += @{ Endpoint = "/api/data/v9.0/emails"; FetchXml = $emailCountFetch }
$batchRequests += @{ Endpoint = "/api/data/v9.0/annotations"; FetchXml = $noteCountFetch }
$batchRequests += @{ Endpoint = "/api/data/v9.0/phonecalls"; FetchXml = $phoneCountFetch }

$batchResults = Invoke-D365ApiBatch -Requests $batchRequests

if (-not $batchResults -or $batchResults.Count -lt 9) {
    Write-Error "❌ Batch API call failed (got $($batchResults.Count) results, expected 9)"
    exit 1
}

# --- Parse batch results ---

# Contact (index 0)
$contactEmail = ""
$intlPhone = ""
$preferredMethod = ""
if ($incrementalMode) {
    # Read from existing cache
    $existingContent = Get-Content $snapshotFile -Raw
    if ($existingContent -match '\| Email \| (.+)') { $contactEmail = $Matches[1].Trim() }
    if ($existingContent -match '\| Intl Phone Number \| (.+)') { $intlPhone = $Matches[1].Trim() }
    if ($existingContent -match '\| Preferred Method of Contact \| (.+)') { $preferredMethod = $Matches[1].Trim() }
    # Also re-read customer statement and entitlement from cache
    if ($existingContent -match '## Customer Statement\r?\n\r?\n([\s\S]+?)\r?\n## ') { $customerStatement = $Matches[1].Trim() }
    if ($existingContent -match '\| Service Level \| (.+)') { $serviceLevel = $Matches[1].Trim() }
    if ($existingContent -match '\| Service Name \| (.+)') { $serviceName = $Matches[1].Trim() }
    if ($existingContent -match '\| Schedule \| (.+)') { $schedule = $Matches[1].Trim() }
    if ($existingContent -match '\| Contract Country \| (.+)') { $contractCountry = $Matches[1].Trim() }
} elseif ($contactId -and $batchResults[0] -and $batchResults[0]._status -eq 200) {
    $contact = $batchResults[0]
    $contactEmail = $contact.emailaddress1
    $intlPhone = $contact.msdfm_internationalphonenumber
    $preferredMethod = $contact.'preferredcontactmethodcode@OData.Community.Display.V1.FormattedValue'
}

# Customer Statement (index 1)
$customerStatement = ""
if (-not $incrementalMode -and $batchResults[1] -and $batchResults[1]._status -eq 200) {
    $customerStatement = $batchResults[1].msdfm_customerstatement
}

# Entitlement (index 2)
$serviceLevel = ""; $serviceName = ""; $schedule = ""; $contractCountry = ""
if (-not $incrementalMode -and $redemptionId -and $batchResults[2] -and $batchResults[2]._status -eq 200) {
    $ent = $batchResults[2]
    $serviceLevel = $ent.'msdfm_servicelevel@OData.Community.Display.V1.FormattedValue'
    $serviceName = $ent.msdfm_servicename
    $schedule = $ent.msdfm_schedule
    $contractCountry = $ent.'_msdfm_contractcountry_value@OData.Community.Display.V1.FormattedValue'
}

# Labor (index 3)
$labors = $batchResults[3]
$laborList = @()
if ($labors -and $labors._status -eq 200 -and $labors.value) {
    foreach ($l in $labors.value) {
        $cls = $l.'msdfm_classification@OData.Community.Display.V1.FormattedValue'
        $dur = $l.msdfm_duration
        $date = $l.'msdfm_date@OData.Community.Display.V1.FormattedValue'
        $desc = $l.msdfm_description
        $laborList += "- ⏱️ $date | ${dur}min | $cls | $desc"
    }
}

# ICM (index 4)
$icms = $batchResults[4]
$icmList = @()
$primaryIcmId = ''
$primaryIcmTitle = ''
$primaryIcmStatus = ''
$primaryIcmSeverity = ''
if ($icms -and $icms._status -eq 200 -and $icms.value) {
    $idx = 0
    foreach ($i in $icms.value) {
        $icmId = if ($i.msdfm_id) { $i.msdfm_id } elseif ($i.msdfm_name) { $i.msdfm_name } elseif ($i.'_msdfm_icmid_value@OData.Community.Display.V1.FormattedValue') { $i.'_msdfm_icmid_value@OData.Community.Display.V1.FormattedValue' } else { $i.msdfm_icmid }
        $icmTitle = $i.msdfm_title
        $icmStatus = $i.msdfm_status
        $icmSev = if ($i.'msdfm_severity@OData.Community.Display.V1.FormattedValue') { $i.'msdfm_severity@OData.Community.Display.V1.FormattedValue' } else { $i.msdfm_severity }
        if ($idx -eq 0) {
            $primaryIcmId = $icmId
            $primaryIcmTitle = $icmTitle
            $primaryIcmStatus = $icmStatus
            $primaryIcmSeverity = $icmSev
        }
        $icmList += "- 🔥 ICM $icmId | Sev $icmSev | $icmStatus | $icmTitle"
        $idx++
    }
}

# Attachments (index 5) — full metadata, saved to attachments-meta.json for download-attachments.ps1
$att = $batchResults[5]
$attCount = 0
$attMeta = @()
if ($att -and $att._status -eq 200 -and $att.value) {
    $attCount = $att.value.Count
    $attMeta = $att.value
}
if ($attMeta.Count -gt 0) {
    $attMetaFile = Join-Path $caseDir "attachments-meta.json"
    @{ fetchedAt = (Get-Date -Format "o"); attachments = $attMeta } | ConvertTo-Json -Depth 5 | Set-Content $attMetaFile -Encoding UTF8
    Write-Host "📎 Saved $attCount attachment metadata → attachments-meta.json"
}

# Counts (index 6=email, 7=note, 8=phone)
$emailCount = 0
$noteCount = 0
$phoneCount = 0
if ($batchResults[6] -and $batchResults[6].value -and $batchResults[6].value.Count -gt 0) {
    $emailCount = [int]$batchResults[6].value[0].count
}
if ($batchResults[7] -and $batchResults[7].value -and $batchResults[7].value.Count -gt 0) {
    $noteCount = [int]$batchResults[7].value[0].count
}
if ($batchResults[8] -and $batchResults[8].value -and $batchResults[8].value.Count -gt 0) {
    $phoneCount = [int]$batchResults[8].value[0].count
}

# --- Build Markdown ---
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$md = @"
# Case $TicketNumber

> Snapshot: $now | Cache valid for ${CacheMinutes}min

## 基本信息

| 字段 | 值 |
|------|-----|
| Case Number | $TicketNumber |
| Title | $title |
| Severity | $severity |
| Status | $status |
| SAP | $sap |
| 24x7 | $is24x7 |
| Assigned To | $assignedTo |
| Created On | $createdOn |
| Case Age | $caseAge days |
| Active Hours | $activeHours |
| Origin | $origin |
| Timezone | $timezone |
| Country | $country |

## 联系人 (Primary Contact)

| 字段 | 值 |
|------|-----|
| Name | $contactName |
| Email | $contactEmail |
| Intl Phone Number | $intlPhone |
| Preferred Method of Contact | $preferredMethod |

## 客户 (Customer)

| 字段 | 值 |
|------|-----|
| Customer | $customerName |

## Customer Statement

$customerStatement

## Entitlement

| 字段 | 值 |
|------|-----|
| Service Level | $serviceLevel |
| Service Name | $serviceName |
| Schedule | $schedule |
| Contract Country | $contractCountry |

## Emails ($emailCount)

> 邮件正文见 emails.md（通过 fetch-emails.ps1 抓取）

## Notes ($noteCount)

> Notes 详情见 notes.md（通过 fetch-notes.ps1 抓取）

## Phone Calls ($phoneCount)

> Phone Call 详情见 phones.md（通过 fetch-phone-calls.ps1 抓取）

## Labor ($($laborList.Count))

$($laborList -join "`n")

## ICM ($($icmList.Count))

| 字段 | 值 |
|------|-----|
| ICM Number | $primaryIcmId |
| ICM Title | $primaryIcmTitle |
| ICM Status | $primaryIcmStatus |
| ICM Severity | $primaryIcmSeverity |

$($icmList -join "`n")

## Attachments

DTM Attachments: $attCount
"@

# --- Save ---
if (-not (Test-Path $caseDir)) { New-Item -Path $caseDir -ItemType Directory -Force | Out-Null }
$md | Set-Content -Path $snapshotFile -Encoding UTF8

Write-Host "✅ Snapshot saved: $snapshotFile"
Write-Host ""

# --- AR Mode: patch case-info.md with AR case's own title, SAP, statement ---
$isAR = [bool]$MainCaseNumber
if ($isAR) {
    Write-Host "🔵 AR Mode: patching case-info.md with AR title, SAP, statement..."
    $arCaseNumber = $TicketNumber
    $arIncidentId = $null
    # Resolve AR incident ID
    $arIdFetch = @"
<fetch top="1"><entity name="incident"><attribute name="incidentid"/><filter><condition attribute="ticketnumber" operator="eq" value="$arCaseNumber"/></filter></entity></fetch>
"@
    $arIdResult = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $arIdFetch
    if ($arIdResult -and $arIdResult.value -and $arIdResult.value.Count -gt 0) {
        $arIncidentId = $arIdResult.value[0].incidentid
    }

    if ($arIncidentId) {
        $arInc = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($arIncidentId)?`$select=title,msdfm_supportareapath"
        if ($arInc -and $arInc.title) {
            $arTitle = $arInc.title
            $arSap = $arInc.msdfm_supportareapath
            $content = Get-Content $snapshotFile -Raw -Encoding UTF8
            # Add AR SAP row after SAP row
            if ($arSap -and $content -notmatch "AR Support Area Path") {
                $content = $content -replace "(\| SAP \|[^\r\n]+)", "`$1`n| AR Support Area Path | $arSap |"
            }
            # Add Is AR marker
            if ($content -notmatch "\| Is AR \|") {
                $content = $content -replace "(\| SAP \|[^\r\n]+(?:\n\| AR Support Area Path \|[^\r\n]+)?)", "`$1`n| Is AR | Yes (AR of $MainCaseNumber) |"
            }
            [System.IO.File]::WriteAllText($snapshotFile, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "  ✅ AR SAP: $arSap"
        }

        # Fetch AR customer statement
        $arRestricted = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($arIncidentId)/msdfm_CaseRestrictedAttributesId?`$select=msdfm_customerstatement"
        if ($arRestricted -and $arRestricted.msdfm_customerstatement) {
            $arStmt = $arRestricted.msdfm_customerstatement
            $content2 = Get-Content $snapshotFile -Raw -Encoding UTF8
            if ($content2 -notmatch "## AR Customer Statement") {
                $arStmtBlock = "`n## AR Customer Statement`n`n$arStmt`n"
                # Insert before "## Entitlement" or append
                if ($content2 -match '## Entitlement') {
                    $content2 = $content2 -replace '(## Entitlement)', "$arStmtBlock`n`$1"
                } else {
                    $content2 += $arStmtBlock
                }
                [System.IO.File]::WriteAllText($snapshotFile, $content2, [System.Text.UTF8Encoding]::new($false))
                Write-Host "  ✅ AR Customer Statement added ($($arStmt.Length) chars)"
            }
        }
    } else {
        Write-Host "  ⚠️ Could not resolve AR incident ID for $arCaseNumber"
    }
}

Write-Host $md
