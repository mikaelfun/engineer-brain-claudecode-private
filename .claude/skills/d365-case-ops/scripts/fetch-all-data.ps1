<#
.SYNOPSIS
    并行拉取 Case 的 snapshot + emails + notes。
.DESCRIPTION
    用 PowerShell Jobs 并行执行 fetch-case-snapshot、fetch-emails、fetch-notes。
    先确保 incident ID 缓存存在（避免三个 job 同时查）。
.PARAMETER TicketNumber
    Case 编号
.PARAMETER OutputDir
    输出父目录（如 cases/active），脚本内部 Join-Path $OutputDir $TicketNumber
.PARAMETER Force
    强制全量刷新（传给 fetch-emails 和 fetch-notes）
.PARAMETER CacheMinutes
    snapshot 缓存有效期（默认 10）
.EXAMPLE
    pwsh -File fetch-all-data.ps1 -TicketNumber 2603090040000814 -OutputDir ./cases/active -Force -CacheMinutes 0
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
    [int]$CacheMinutes = 10,
    [switch]$IncludeIrCheck,
    [string]$MetaDir,
    [string]$MainCaseNumber,

    # Casework v2 Task 5: optional event emission directory
    # ({caseDir}/.casework/events). When set, writes d365.json active/completed/failed
    # events with delta={newEmails,newNotes,snapshotFresh,laborRecords,laborTodayLogged}.
    # Omit for legacy callers — behavior unchanged.
    [string]$EventDir
)

. "$PSScriptRoot\_init.ps1"

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$scriptRoot = $PSScriptRoot

# ── Event helpers (no-op if -EventDir not supplied) ──
$script:D365EventStartTs = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$script:D365EventStartMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

function Write-D365Event {
    param([hashtable]$Payload)
    if (-not $EventDir) { return }
    try {
        if (-not (Test-Path $EventDir)) {
            New-Item -Path $EventDir -ItemType Directory -Force | Out-Null
        }
        $Payload["task"] = "d365"
        $json = $Payload | ConvertTo-Json -Compress -Depth 5
        $final = Join-Path $EventDir "d365.json"
        $tmp = "$final.tmp.$PID.$((Get-Random))"
        Set-Content -Path $tmp -Value $json -Encoding UTF8 -NoNewline
        Move-Item -Path $tmp -Destination $final -Force
    } catch {
        # event emission must never break the real work
    }
}

Write-D365Event @{ status = "active"; startedAt = $script:D365EventStartTs }

# Pre-warm: ensure incident ID is cached before parallel jobs
Write-Host "🔵 Pre-warming incident ID cache..."
$incidentId = Get-IncidentId -TicketNumber $TicketNumber
if (-not $incidentId) {
    Write-Error "❌ Case $TicketNumber not found"
    exit 1
}
Write-Host "🔵 Incident ID: $incidentId (cached)"

# Ensure browser is on D365 BEFORE parallel jobs launch.
# Without this, each Start-Job's Ensure-D365Tab may simultaneously trigger
# Restart-D365Browser (kill-all + open), causing browser state corruption
# that breaks the subsequent IR check.
Ensure-D365Tab

# --- AR Mode: determine which case to fetch main data from ---
$isAR = [bool]$MainCaseNumber
$fetchCaseNumber = if ($isAR) { $MainCaseNumber } else { $TicketNumber }
$arCaseNumber = $TicketNumber  # Always the AR case for AR-specific notes

if ($isAR) {
    Write-Host "🔵 AR Mode: fetching main data from $fetchCaseNumber, AR notes from $arCaseNumber"
    # Pre-warm incident ID for the MAIN case (not the AR case)
    Write-Host "🔵 Pre-warming incident ID for main case $fetchCaseNumber..."
    $mainIncidentId = Get-IncidentId -TicketNumber $fetchCaseNumber
    if (-not $mainIncidentId) {
        Write-Error "❌ Main case $fetchCaseNumber not found"
        exit 1
    }
    Write-Host "🔵 Main case incident ID: $mainIncidentId (cached)"
}

# Launch 4 parallel jobs (snapshot + emails + notes + labor, all D365 OData)
# Labor intentionally uses $TicketNumber (not $fetchCaseNumber) — AR labor is
# tracked against the AR case itself, not the main case (see PRD §2.4 AR Mode note).
#
# Redirection note: PowerShell Write-Host writes to Information stream (6), NOT
# stdout (1). `2>&1 | Out-String` alone captures only Success+Error streams and
# returns an empty string — Write-Host text goes direct to Host. Using `6>&1 2>&1`
# merges Information into the Success stream so Out-String captures everything,
# which is required for the event layer to parse `New: N` / `Labor Records (N)`.

# Task 5.4h — Snapshot previous labor Total BEFORE launching labor job.
# view-labor.ps1 overwrites labor.md in-place, so if we read it after the job
# we'd only see "current total" and can never compute delta. Read here first.
$prevLaborCount = 0
$laborMdFile = Join-Path (Join-Path $OutputDir $TicketNumber) "labor.md"
if (Test-Path $laborMdFile) {
    try {
        $laborMdRaw = Get-Content $laborMdFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($laborMdRaw -match '\*\*Total:\*\*\s*(\d+)\s*record') {
            $prevLaborCount = [int]$Matches[1]
        }
    } catch { }
}

Write-Host "🔵 Launching parallel: snapshot + emails + notes + labor..."

$jobSnapshot = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $cache, $subDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir; CacheMinutes = $cache }
    if ($subDir) { $params.OutputSubDir = $subDir }
    & "$root\fetch-case-snapshot.ps1" @params 6>&1 2>&1 | Out-String
} -ArgumentList $scriptRoot, $fetchCaseNumber, $OutputDir, $CacheMinutes, $(if ($isAR) { $arCaseNumber } else { $null })

$jobEmails = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $force, $subDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir }
    if ($force) { $params.Force = $true }
    if ($subDir) { $params.OutputSubDir = $subDir }
    & "$root\fetch-emails.ps1" @params 6>&1 2>&1 | Out-String
} -ArgumentList $scriptRoot, $fetchCaseNumber, $OutputDir, $Force.IsPresent, $(if ($isAR) { $arCaseNumber } else { $null })

$jobNotes = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $force, $subDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir }
    if ($force) { $params.Force = $true }
    if ($subDir) { $params.OutputSubDir = $subDir }
    & "$root\fetch-notes.ps1" @params 6>&1 2>&1 | Out-String
} -ArgumentList $scriptRoot, $fetchCaseNumber, $OutputDir, $Force.IsPresent, $(if ($isAR) { $arCaseNumber } else { $null })

$jobLabor = Start-Job -ScriptBlock {
    param($root, $tn, $outDir)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    & "$root\view-labor.ps1" -TicketNumber $tn -OutputDir $outDir 6>&1 2>&1 | Out-String
} -ArgumentList $scriptRoot, $TicketNumber, $OutputDir

# Wait for all
$null = Wait-Job $jobSnapshot, $jobEmails, $jobNotes, $jobLabor -Timeout 120

# Collect results
$results = @(
    @{ Name = "snapshot"; Job = $jobSnapshot },
    @{ Name = "emails";   Job = $jobEmails },
    @{ Name = "notes";    Job = $jobNotes },
    @{ Name = "labor";    Job = $jobLabor }
)

$allOk = $true
$jobOutputs = @{}
foreach ($r in $results) {
    $job = $r.Job
    $output = ""
    if ($job.State -eq "Completed") {
        $output = Receive-Job $job
        $status = "OK"
        # Only check the LAST 5 lines for error indicators (avoid false positives from email content)
        $tailLines = ($output -split "`n" | Select-Object -Last 5) -join "`n"
        if ($tailLines -match '❌|ERR:|Failed|exit 1') {
            $status = "FAIL"
            # Labor failure is non-blocking (L3 per PRD §2.2) — don't fail whole d365 bundle
            if ($r.Name -ne "labor") { $allOk = $false }
        }
    } else {
        $status = "TIMEOUT"
        if ($r.Name -ne "labor") { $allOk = $false }
        Stop-Job $job -ErrorAction SilentlyContinue
    }
    $jobOutputs[$r.Name] = @{ output = ($output | Out-String); status = $status }
    Write-Host "$($r.Name): $status ($([math]::Round(($job.PSEndTime - $job.PSBeginTime).TotalSeconds, 1))s)"
}

Remove-Job $jobSnapshot, $jobEmails, $jobNotes, $jobLabor -Force -ErrorAction SilentlyContinue

# --- AR Mode: safety check — remove main case dir if somehow created (shouldn't happen with OutputSubDir) ---
if ($isAR) {
    $mainCaseDir = Join-Path $OutputDir $fetchCaseNumber
    if ((Test-Path $mainCaseDir) -and $fetchCaseNumber -ne $arCaseNumber) {
        Remove-Item $mainCaseDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "⚠️ Cleaned up unexpected main case dir: $mainCaseDir"
    }
}

# --- AR Mode: patch case-info.md with AR case's own title, SAP, statement ---
if ($isAR) {
    $arCaseInfoFile = Join-Path (Join-Path $OutputDir $arCaseNumber) "case-info.md"
    if (Test-Path $arCaseInfoFile) {
        Write-Host "🔵 Patching case-info.md with AR title, SAP, statement..."
        # Fetch AR case's own title + SAP via OData
        $arIncidentId = Get-IncidentId -TicketNumber $arCaseNumber
        if ($arIncidentId) {
            $arInc = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($arIncidentId)?`$select=title,msdfm_supportareapath"
            if ($arInc -and $arInc.title) {
                $arTitle = $arInc.title
                $arSap = $arInc.msdfm_supportareapath
                $content = Get-Content $arCaseInfoFile -Raw -Encoding UTF8
                # Replace header: "# Case {mainCaseNumber}" → "# Case {arCaseNumber} (AR)"
                $content = $content -replace "^# Case $fetchCaseNumber", "# Case $arCaseNumber (AR of $fetchCaseNumber)"
                # Replace Title row: "| Title | ... |" → AR title
                $content = $content -replace "(\| Title \|)[^\r\n]+", "| Title | $arTitle |"
                # Replace Case Number row: "| Case Number | ... |" → AR case number
                $content = $content -replace "(\| Case Number \|)[^\r\n]+", "| Case Number | $arCaseNumber (AR of $fetchCaseNumber) |"
                # Add AR SAP row after existing SAP (keep main case SAP, add AR SAP)
                if ($arSap) {
                    $content = $content -replace "(\| Support Area Path \|[^\r\n]+)", "`$1`n| AR Support Area Path | $arSap |"
                }
                [System.IO.File]::WriteAllText($arCaseInfoFile, $content, [System.Text.UTF8Encoding]::new($false))
                Write-Host "🔵 Patched: title='$arTitle', arSAP='$arSap', case=$arCaseNumber"
            } else {
                Write-Host "⚠️ Could not fetch AR title, keeping main case title"
            }

            # Fetch AR customer statement (restricted attributes)
            $arRestricted = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($arIncidentId)/msdfm_CaseRestrictedAttributesId?`$select=msdfm_customerstatement"
            if ($arRestricted -and $arRestricted.msdfm_customerstatement) {
                $arStmt = $arRestricted.msdfm_customerstatement
                $content2 = Get-Content $arCaseInfoFile -Raw -Encoding UTF8
                # Append AR Customer Statement section before the first "##" or at end
                $arStmtBlock = "`n## AR Customer Statement`n`n$arStmt`n"
                if ($content2 -match '(?m)^## ') {
                    # Insert before first ## heading
                    $content2 = $content2 -replace '(?m)(^## )', "$arStmtBlock`n`$1", 1
                } else {
                    $content2 += $arStmtBlock
                }
                [System.IO.File]::WriteAllText($arCaseInfoFile, $content2, [System.Text.UTF8Encoding]::new($false))
                Write-Host "🔵 Patched: AR statement ($($arStmt.Length) chars)"
            }
        }
    }
}

# --- AR Mode: fetch AR-specific notes into notes-ar.md ---
if ($isAR) {
    Write-Host "🔵 Fetching AR notes from $arCaseNumber..."
    $arSw = [System.Diagnostics.Stopwatch]::StartNew()
    & "$scriptRoot\fetch-notes.ps1" -TicketNumber $arCaseNumber -OutputDir $OutputDir -OutputFileName "notes-ar.md" -OutputSubDir $arCaseNumber
    $arSw.Stop()
    Write-Host "ar-notes: $([math]::Round($arSw.Elapsed.TotalSeconds, 1))s"
}

# --- Optional: IR check in same session (saves ~10s vs separate script) ---
if ($IncludeIrCheck -and -not $isAR) {
    $irMetaDir = if ($MetaDir) { $MetaDir } else { $OutputDir }
    $irMetaFile = Join-Path (Join-Path $irMetaDir $TicketNumber) "casework-meta.json"
    $skipIr = $false

    # Skip if meta already has IR SLA = Succeeded (terminal state, won't change)
    if (Test-Path $irMetaFile) {
        try {
            $existingMeta = Get-Content $irMetaFile -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($existingMeta.irSla.status -eq "Succeeded") {
                Write-Host "⚡ IR SLA already Succeeded (cached) — skipping playwright check"
                $skipIr = $true
            }
        } catch { }
    }

    if (-not $skipIr) {
        Write-Host "🔵 Running IR check (in-session)..."
        $irSw = [System.Diagnostics.Stopwatch]::StartNew()
        & "$scriptRoot\check-ir-status.ps1" -TicketNumber $TicketNumber -SaveMeta -MetaDir $irMetaDir
        $irSw.Stop()
        Write-Host "ir-check: $([math]::Round($irSw.Elapsed.TotalSeconds, 1))s"
    }
}

$sw.Stop()
Write-Host "🔵 Parallel fetch total: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s"

if (-not $allOk) {
    Write-Host "⚠️ Some fetches failed, check output above"
}

# ── Task 5.2: Parse sub-job outputs for delta + emit final d365.json event ──
if ($EventDir) {
    # Emails delta: fetch-emails.ps1 prints "🔵 New: N | Skipped..." line
    # Regex does NOT anchor on emoji — PS Start-Job + Out-String can mangle
    # unicode prefixes; match on the literal "New: N |" text instead.
    $newEmails = 0
    if ($jobOutputs.ContainsKey("emails") -and $jobOutputs["emails"].output -match 'New:\s*(\d+)\s*\|') {
        $newEmails = [int]$Matches[1]
    }

    # Notes delta: fetch-notes.ps1 uses similar "New: N" pattern
    $newNotes = 0
    if ($jobOutputs.ContainsKey("notes")) {
        $notesOut = $jobOutputs["notes"].output
        if ($notesOut -match 'New:\s*(\d+)\s*\|') { $newNotes = [int]$Matches[1] }
        elseif ($notesOut -match 'Added\s+(\d+)\s+new') { $newNotes = [int]$Matches[1] }
    }

    # Snapshot freshness: cache-hit indicators mean no re-fetch happened
    $snapshotFresh = $false
    if ($jobOutputs.ContainsKey("snapshot")) {
        $snapOut = $jobOutputs["snapshot"].output
        if ($snapOut -match 'cache hit|using cached|skipping.*cache|already fresh|cached.*fresh') {
            $snapshotFresh = $true
        }
    }

    # Labor delta: view-labor.ps1 prints "Labor Records (N entries):" from Show-LaborConsole
    $laborRecords = 0
    $laborTodayLogged = $false
    if ($jobOutputs.ContainsKey("labor")) {
        $laborOut = $jobOutputs["labor"].output
        if ($laborOut -match 'Labor Records\s*\((\d+)\s*entries\)') {
            $laborRecords = [int]$Matches[1]
        } elseif ($laborOut -match 'Total:\s*(\d+)\s*record') {
            $laborRecords = [int]$Matches[1]
        } elseif ($laborOut -match 'No labor records') {
            $laborRecords = 0
        }
        # Today check: labor.md entries use M/d/yyyy (view-labor.ps1 line 105)
        $today = (Get-Date).ToString('M/d/yyyy')
        if ($laborOut -match [regex]::Escape($today)) {
            $laborTodayLogged = $true
        }
    }

    $endTs = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $durMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $script:D365EventStartMs

    # Task 5.4h: true labor delta = current Total - snapshot taken before job
    $newLaborRecords = [math]::Max(0, $laborRecords - $prevLaborCount)

    $delta = @{
        newEmails        = $newEmails
        newNotes         = $newNotes
        snapshotFresh    = $snapshotFresh
        laborRecords     = $laborRecords
        laborTodayLogged = $laborTodayLogged
        newLaborRecords  = $newLaborRecords
        prevLaborRecords = $prevLaborCount
    }

    if ($allOk) {
        Write-D365Event @{
            status      = "completed"
            startedAt   = $script:D365EventStartTs
            completedAt = $endTs
            durationMs  = $durMs
            delta       = $delta
        }
    } else {
        $failedNames = ($results | Where-Object { $jobOutputs[$_.Name].status -ne "OK" -and $_.Name -ne "labor" } | ForEach-Object { $_.Name }) -join ","
        Write-D365Event @{
            status     = "failed"
            startedAt  = $script:D365EventStartTs
            durationMs = $durMs
            error      = "subjobs failed: $failedNames"
            delta      = $delta
        }
    }
}
