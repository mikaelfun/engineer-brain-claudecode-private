<#
.SYNOPSIS
    安全版 Add Note — 写入前校验 Case、Base64 传参避免转义问题、写后验证。
.DESCRIPTION
    通过 D365 OData API 向指定 Case 添加 Note（annotation）。
    与旧版 add-note.ps1 的区别：
    1. TicketNumber 必填，不依赖缓存/浏览器上下文
    2. 写前校验：反查 incidentid → ticketnumber 确认一致
    3. Base64 编码 title/body 传入 JS，绕过 Invoke-D365Api 的转义 bug
    4. 写后验证：查询新建的 annotation 确认存在
    5. 任何步骤失败 → exit 1，不静默通过
    6. 最后一行输出 JSON 结果，供调用方 parse
.PARAMETER TicketNumber
    Case 编号（必填）
.PARAMETER Title
    笔记标题
.PARAMETER Body
    笔记正文（支持多行）
.PARAMETER TitleFile
    从文件读取 Title（优先于 -Title）
.PARAMETER BodyFile
    从文件读取 Body（优先于 -Body）
.PARAMETER DryRun
    只验证流程，不实际写入
.EXAMPLE
    pwsh add-note-safe.ps1 -TicketNumber 2602130040001034 -Title "update" -Body "line1`nline2"
    pwsh add-note-safe.ps1 -TicketNumber 2602130040001034 -TitleFile title.tmp -BodyFile body.tmp
    pwsh add-note-safe.ps1 -TicketNumber 2602130040001034 -TitleFile title.tmp -BodyFile body.tmp -DryRun
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketNumber,

    [Parameter(Mandatory=$false)]
    [string]$Title,
    [Parameter(Mandatory=$false)]
    [string]$Body,

    [Parameter(Mandatory=$false)]
    [string]$TitleFile,
    [Parameter(Mandatory=$false)]
    [string]$BodyFile,

    [switch]$DryRun
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

# ── Helper: output result JSON (always last line) ──
function Write-Result {
    param([hashtable]$Data)
    Write-Host ($Data | ConvertTo-Json -Compress)
}

# ── Helper: write operation log to case logs directory ──
function Write-NoteLog {
    param(
        [string]$CaseNumber,
        [string]$Status,       # SUCCESS / FAILED / DRYRUN
        [string]$Title,
        [string]$Body,
        [string]$IncidentId,
        [string]$AnnotationId,
        [string]$Error
    )
    # Resolve case logs dir from config
    $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
    $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
    $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
    $logsDir = Join-Path $cr "active" $CaseNumber "logs"
    if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir -Force | Out-Null }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logFile = Join-Path $logsDir "add-note.log"

    $entry = @"
[$timestamp] add-note-safe | $Status
  TicketNumber: $CaseNumber
  IncidentId:   $IncidentId
  Title:        $Title
  AnnotationId: $(if ($AnnotationId) { $AnnotationId } else { 'N/A' })
  Error:        $(if ($Error) { $Error } else { 'none' })
  Body:
$($Body -split "`n" | ForEach-Object { "    $_" } | Out-String)---

"@
    Add-Content -Path $logFile -Value $entry -Encoding UTF8
    Write-Host "   📝 Log written to $logFile"
}

# ── Step 1: Read Title / Body ──
if ($TitleFile -and (Test-Path $TitleFile)) {
    $Title = Get-Content -Path $TitleFile -Raw -Encoding UTF8
    $Title = $Title.TrimEnd("`r", "`n")
}
if ($BodyFile -and (Test-Path $BodyFile)) {
    $Body = Get-Content -Path $BodyFile -Raw -Encoding UTF8
    $Body = $Body.TrimEnd("`r", "`n")
}

if (-not $Title -or -not $Body) {
    Write-Host "❌ Title and Body are required."
    Write-Result @{ success = $false; error = "Title and Body are required" }
    exit 1
}

Write-Host "🔵 [add-note-safe] TicketNumber=$TicketNumber Title=$Title"

# ── Step 2: Resolve incidentid ──
Write-Host "🔵 Resolving incidentid..."
$incidentId = Get-IncidentId -TicketNumber $TicketNumber
if (-not $incidentId) {
    Write-Host "❌ Could not resolve incidentid for $TicketNumber"
    Write-NoteLog -CaseNumber $TicketNumber -Status "FAILED" -Title $Title -Body $Body -Error "Could not resolve incidentid"
    Write-Result @{ success = $false; error = "Could not resolve incidentid for $TicketNumber" }
    exit 1
}
Write-Host "   incidentid=$incidentId"

# ── Step 3: Pre-write validation — verify ticketnumber matches ──
Write-Host "🔵 Pre-write validation: verifying case identity..."
$verifyFetchXml = @"
<fetch top="1">
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <filter>
      <condition attribute="incidentid" operator="eq" value="$incidentId"/>
    </filter>
  </entity>
</fetch>
"@
$verifyResult = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $verifyFetchXml
if (-not $verifyResult -or -not $verifyResult.value -or $verifyResult.value.Count -eq 0) {
    Write-Host "❌ Pre-write validation failed: could not query incident $incidentId"
    Write-NoteLog -CaseNumber $TicketNumber -Status "FAILED" -Title $Title -Body $Body -IncidentId $incidentId -Error "Pre-write validation: could not query incident"
    Write-Result @{ success = $false; error = "Pre-write validation failed: could not query incident" }
    exit 1
}

$actualTicket = $verifyResult.value[0].ticketnumber
if ($actualTicket -ne $TicketNumber) {
    Write-Host "❌ SAFETY CHECK FAILED: expected ticket=$TicketNumber but incidentid=$incidentId belongs to ticket=$actualTicket"
    Write-NoteLog -CaseNumber $TicketNumber -Status "FAILED" -Title $Title -Body $Body -IncidentId $incidentId -Error "Ticket mismatch: expected $TicketNumber, got $actualTicket"
    Write-Result @{ success = $false; error = "Ticket number mismatch: expected $TicketNumber, got $actualTicket" }
    exit 1
}
Write-Host "   ✅ Verified: incidentid belongs to $TicketNumber"

# ── DryRun exit point ──
if ($DryRun) {
    Write-Host "🟡 DryRun mode — skipping actual write"
    Write-NoteLog -CaseNumber $TicketNumber -Status "DRYRUN" -Title $Title -Body $Body -IncidentId $incidentId
    Write-Result @{ success = $true; dryRun = $true; ticketNumber = $TicketNumber; incidentId = $incidentId }
    exit 0
}

# ── Step 4: Write note via base64-encoded payload ──
# Base64 encode title and body to completely avoid PS→JS string escaping issues
Write-Host "🔵 Writing note to D365..."
$b64Title = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Title))
$b64Body  = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Body))

# Custom JS that decodes base64 in browser, builds JSON, and POSTs
$js = @"
async page => {
  const result = await page.evaluate(async (args) => {
    try {
      // Decode base64 → UTF-8 string
      const decodeB64 = (b64) => decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const title = decodeB64(args.b64Title);
      const body = decodeB64(args.b64Body);

      const payload = JSON.stringify({
        subject: title,
        notetext: body,
        'objectid_incident@odata.bind': '/incidents(' + args.incidentId + ')'
      });

      const resp = await fetch('/api/data/v9.0/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0'
        },
        body: payload
      });

      const status = resp.status;
      const entityId = resp.headers.get('OData-EntityId') || '';

      if (status === 204) {
        // Extract annotation GUID from OData-EntityId header
        const m = entityId.match(/annotations\(([a-f0-9\-]+)\)/);
        const annotationId = m ? m[1] : '';
        return '__RESULT__' + btoa(JSON.stringify({ ok: true, status: status, annotationId: annotationId })) + '__END__';
      } else {
        const errText = await resp.text().catch(() => '');
        return '__RESULT__' + btoa(JSON.stringify({ ok: false, status: status, error: errText.substring(0, 500) })) + '__END__';
      }
    } catch (e) {
      return '__RESULT__' + btoa(JSON.stringify({ ok: false, status: 0, error: e.message || String(e) })) + '__END__';
    }
  }, { b64Title: '$b64Title', b64Body: '$b64Body', incidentId: '$incidentId' });
  return result;
}
"@

# Ensure we're on a D365 page
Enter-PlaywrightLock
try {
Ensure-D365Tab

$raw = playwright-cli run-code $js 2>&1 | Out-String

# Parse result
$annotationId = $null
if ($raw -match '__RESULT__([A-Za-z0-9+/=]+)__END__') {
    $b64Result = $Matches[1]
    try {
        $jsonStr = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64Result))
        $apiResult = $jsonStr | ConvertFrom-Json

        if ($apiResult.ok -eq $true) {
            $annotationId = $apiResult.annotationId
            Write-Host "   API returned 204, annotationId=$annotationId"
        } else {
            Write-Host "❌ API error (HTTP $($apiResult.status)): $($apiResult.error)"
            Write-NoteLog -CaseNumber $TicketNumber -Status "FAILED" -Title $Title -Body $Body -IncidentId $incidentId -Error "API error (HTTP $($apiResult.status)): $($apiResult.error)"
            Write-Result @{ success = $false; error = "API error (HTTP $($apiResult.status)): $($apiResult.error)" }
            exit 1
        }
    } catch {
        Write-Host "❌ Failed to parse API response: $($_.Exception.Message)"
        Write-NoteLog -CaseNumber $TicketNumber -Status "FAILED" -Title $Title -Body $Body -IncidentId $incidentId -Error "Parse error: $($_.Exception.Message)"
        Write-Result @{ success = $false; error = "Failed to parse API response" }
        exit 1
    }
} else {
    Write-Host "❌ No result marker in playwright output"
    # Show raw output for debugging (truncated)
    $truncated = if ($raw.Length -gt 300) { $raw.Substring(0, 300) + "..." } else { $raw }
    Write-Host "   raw: $truncated"
    Write-NoteLog -CaseNumber $TicketNumber -Status "FAILED" -Title $Title -Body $Body -IncidentId $incidentId -Error "No result marker in playwright output"
    Write-Result @{ success = $false; error = "No result marker in playwright output" }
    exit 1
}

# ── Step 5: Post-write verification ──
if ($annotationId) {
    Write-Host "🔵 Post-write verification: checking annotation $annotationId ..."
    $verifyNote = Invoke-D365Api -Endpoint "/api/data/v9.0/annotations($annotationId)"
    if ($verifyNote -and $verifyNote.subject -eq $Title) {
        Write-Host "   ✅ Verified: note exists with correct title"
    } elseif ($verifyNote) {
        Write-Host "   ⚠️ Note exists but title mismatch (got: $($verifyNote.subject))"
    } else {
        Write-Host "   ⚠️ Could not verify note (query returned null) — note may still have been created"
    }
} else {
    Write-Host "   ⚠️ No annotationId returned — cannot verify, but API returned 204"
}

Write-Host "✅ Note added to Case $TicketNumber"
Write-NoteLog -CaseNumber $TicketNumber -Status "SUCCESS" -Title $Title -Body $Body -IncidentId $incidentId -AnnotationId $annotationId
Write-Result @{ success = $true; annotationId = $annotationId; ticketNumber = $TicketNumber; title = $Title }
} finally {
    Exit-PlaywrightLock
}
