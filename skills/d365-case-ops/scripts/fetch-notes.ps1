<#
.SYNOPSIS
    抓取 Case 完整 Note 内容并保存为 notes.md

.DESCRIPTION
    通过 OData API 抓取 Case 关联的所有 Notes（annotations），
    格式化为 Markdown 保存到 cases/{CaseNumber}/notes.md。
    支持增量更新：如果本地已有 notes.md，只追加新 Note（按 annotationid 去重）。

.PARAMETER TicketNumber
    Case 编号（16位数字）

.PARAMETER OutputDir
    输出根目录，默认为 dfmworker workspace 的 cases/ 目录

.PARAMETER Force
    强制全量重新抓取（忽略本地缓存）

.EXAMPLE
    pwsh scripts/fetch-notes.ps1 -TicketNumber 2602130040001034
    pwsh scripts/fetch-notes.ps1 -TicketNumber 2602130040001034 -Force
    pwsh scripts/fetch-notes.ps1 -TicketNumber 2602130040001034 -OutputDir cases/AR
#>
param(
    [Parameter(Mandatory)][string]$TicketNumber,
    [string]$OutputDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [switch]$Force,
    [string]$OutputFileName = "notes.md",
    [string]$OutputSubDir
)

. "$PSScriptRoot\_init.ps1"

$targetDir = if ($OutputSubDir) { Join-Path $OutputDir $OutputSubDir } else { Join-Path $OutputDir $TicketNumber }
if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
$notesFile = Join-Path $targetDir $OutputFileName

# --- 获取 incidentid ---
Write-Host "🔵 Resolving incidentid for $TicketNumber ..."
$incidentId = Get-IncidentId -TicketNumber $TicketNumber
if (-not $incidentId) {
    Write-Host "❌ ERR: Could not resolve incidentid for $TicketNumber"
    exit 1
}

# --- 读取本地已有的 annotationid（增量模式）---
$existingIds = @{}
if (-not $Force -and (Test-Path $notesFile)) {
    $content = Get-Content $notesFile -Raw
    $matches = [regex]::Matches($content, '<!-- id: ([a-f0-9\-]+) -->')
    foreach ($m in $matches) {
        $existingIds[$m.Groups[1].Value] = $true
    }
    Write-Host "🔵 Found $($existingIds.Count) existing notes in local cache"
}

# --- 抓取 Notes ---
Write-Host "🔵 Fetching notes from OData API ..."
$noteFetch = @"
<fetch count="200">
  <entity name="annotation">
    <attribute name="annotationid"/>
    <attribute name="subject"/>
    <attribute name="notetext"/>
    <attribute name="createdon"/>
    <attribute name="modifiedon"/>
    <link-entity name="systemuser" from="systemuserid" to="createdby" alias="creator" link-type="outer">
      <attribute name="fullname"/>
    </link-entity>
    <filter>
      <condition attribute="objectid" operator="eq" value="$incidentId"/>
    </filter>
    <order attribute="createdon" descending="false"/>
  </entity>
</fetch>
"@

$result = Invoke-D365Api -Endpoint "/api/data/v9.0/annotations" -FetchXml $noteFetch
if (-not $result -or $result._status -ne 200) {
    Write-Host "❌ ERR: API request failed (status: $($result._status))"
    exit 1
}

$allNotes = @()
if ($result.value) { $allNotes = $result.value }
Write-Host "🔵 API returned $($allNotes.Count) notes"

# --- 分离新 Note 和已有 Note ---
$newNotes = @()
$skippedExisting = 0

foreach ($n in $allNotes) {
    $id = $n.annotationid
    if ($existingIds.ContainsKey($id)) {
        $skippedExisting++
        continue
    }
    $newNotes += $n
}

Write-Host "🔵 New: $($newNotes.Count) | Skipped (existing): $skippedExisting"

if ($newNotes.Count -eq 0 -and -not $Force) {
    Write-Host "✅ No new notes to archive"
    if (Test-Path $notesFile) {
        Write-Host "📄 $notesFile"
        Get-Content $notesFile -Raw
    }
    exit 0
}

# --- HTML → 纯文本 ---
function Strip-Html {
    param([string]$Html)
    if (-not $Html) { return "" }

    # 移除 style/script 块
    $text = $Html -replace '(?si)<style[^>]*>.*?</style>', ''
    $text = $text -replace '(?si)<script[^>]*>.*?</script>', ''
    # <br> / <p> / <div> → 换行
    $text = $text -replace '(?i)<br\s*/?>', "`n"
    $text = $text -replace '(?i)</(p|div|li|tr)>', "`n"
    # 移除所有其余标签
    $text = $text -replace '<[^>]+>', ''
    # HTML 实体
    $text = $text -replace '&nbsp;', ' '
    $text = $text -replace '&amp;', '&'
    $text = $text -replace '&lt;', '<'
    $text = $text -replace '&gt;', '>'
    $text = $text -replace '&quot;', '"'
    $text = $text -replace '&#39;', "'"
    # 合并多余空行（保留最多两个连续换行）
    $text = $text -replace "(\r?\n){3,}", "`n`n"
    return $text.Trim()
}

# --- 格式化 Note ---
function Format-NoteEntry {
    param($Note)

    $id = $Note.annotationid
    $time = $Note.'createdon@OData.Community.Display.V1.FormattedValue'
    if (-not $time) { $time = $Note.createdon }
    $title = $Note.subject
    if (-not $title) { $title = "(no title)" }
    $author = $Note.'creator.fullname'
    if (-not $author) { $author = "Unknown" }
    $rawBody = $Note.notetext

    # 系统自动分配 note → 折叠为单行摘要
    $isSystem = ($author -match 'CrmGlobal|DFM|VDM|AutoAssign' -or $title -match 'VDM|DFM')
    if ($isSystem) {
        # 提取关键信息：分配给谁、SLA 剩余时间
        $assignee = if ($rawBody -match 'assigned case \w+ to ([\w@\.]+)') { $Matches[1] } else { "?" }
        $sla = if ($rawBody -match 'Time Until SLA Expires:(\d+) Minutes') { "$($Matches[1]) min" } else { "?" }
        $body = "*(系统自动分配 → $assignee | SLA剩余: $sla)*"
    } else {
        $body = Strip-Html -Html $rawBody
        if (-not $body) { $body = "(empty)" }
        # 每行加 > 前缀（blockquote 风格，区分正文）
        $body = ($body -split "`n" | ForEach-Object { if ($_.Trim()) { "- $_" } else { "" } }) -join "`n"
        $body = $body.Trim()
    }

    $entry = @"
<!-- id: $id -->
### 📝 $time | $author
**$title**

$body

---

"@
    return $entry
}

# --- 写入文件 ---
if ($Force -or -not (Test-Path $notesFile)) {
    # 全量写入
    $header = @"
# Notes — Case $TicketNumber

> Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Total: $($newNotes.Count) notes

"@
    $entries = $newNotes | ForEach-Object { Format-NoteEntry -Note $_ }
    $content = $header + ($entries -join "`n")
    Set-Content -Path $notesFile -Value $content -Encoding UTF8
    Write-Host "✅ Saved $($newNotes.Count) notes: $notesFile"
} else {
    # 增量追加
    $entries = $newNotes | ForEach-Object { Format-NoteEntry -Note $_ }
    $appendContent = "`n" + ($entries -join "`n")
    Add-Content -Path $notesFile -Value $appendContent -Encoding UTF8

    # 更新 header 计数
    $totalCount = $existingIds.Count + $newNotes.Count
    $existingContent = Get-Content $notesFile -Raw
    $existingContent = $existingContent -replace 'Total: \d+ notes', "Total: $totalCount notes"
    $existingContent = $existingContent -replace 'Generated: .+? \|', "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') |"
    Set-Content -Path $notesFile -Value $existingContent -Encoding UTF8
    Write-Host "✅ Appended $($newNotes.Count) new notes (total: $totalCount): $notesFile"
}

# 输出内容
Get-Content $notesFile -Raw
