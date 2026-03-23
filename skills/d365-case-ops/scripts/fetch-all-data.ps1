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
    [string]$MetaDir
)

. "$PSScriptRoot\_init.ps1"

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$scriptRoot = $PSScriptRoot

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

# Launch 3 parallel jobs
Write-Host "🔵 Launching parallel: snapshot + emails + notes..."

$jobSnapshot = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $cache)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    & "$root\fetch-case-snapshot.ps1" -TicketNumber $tn -OutputDir $outDir -CacheMinutes $cache 2>&1 | Out-String
} -ArgumentList $scriptRoot, $TicketNumber, $OutputDir, $CacheMinutes

$jobEmails = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $force)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir }
    if ($force) { $params.Force = $true }
    & "$root\fetch-emails.ps1" @params 2>&1 | Out-String
} -ArgumentList $scriptRoot, $TicketNumber, $OutputDir, $Force.IsPresent

$jobNotes = Start-Job -ScriptBlock {
    param($root, $tn, $outDir, $force)
    $env:D365_CASES_ROOT = Split-Path (Split-Path $outDir)
    $params = @{ TicketNumber = $tn; OutputDir = $outDir }
    if ($force) { $params.Force = $true }
    & "$root\fetch-notes.ps1" @params 2>&1 | Out-String
} -ArgumentList $scriptRoot, $TicketNumber, $OutputDir, $Force.IsPresent

# Wait for all
$null = Wait-Job $jobSnapshot, $jobEmails, $jobNotes -Timeout 120

# Collect results
$results = @(
    @{ Name = "snapshot"; Job = $jobSnapshot },
    @{ Name = "emails";   Job = $jobEmails },
    @{ Name = "notes";    Job = $jobNotes }
)

$allOk = $true
foreach ($r in $results) {
    $job = $r.Job
    $output = ""
    if ($job.State -eq "Completed") {
        $output = Receive-Job $job
        $status = "OK"
        # Check for error indicators in output
        if ($output -match '❌|ERR:|Failed|exit 1') {
            $status = "FAIL"
            $allOk = $false
        }
    } else {
        $status = "TIMEOUT"
        $allOk = $false
        Stop-Job $job -ErrorAction SilentlyContinue
    }
    Write-Host "$($r.Name): $status ($([math]::Round(($job.PSEndTime - $job.PSBeginTime).TotalSeconds, 1))s)"
}

Remove-Job $jobSnapshot, $jobEmails, $jobNotes -Force -ErrorAction SilentlyContinue

# --- Optional: IR check in same session (saves ~10s vs separate script) ---
if ($IncludeIrCheck) {
    $irMetaDir = if ($MetaDir) { $MetaDir } else { $OutputDir }
    $irMetaFile = Join-Path (Join-Path $irMetaDir $TicketNumber) "casehealth-meta.json"
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
