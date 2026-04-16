# owa-email-batch.ps1
# Batch OWA email extraction: reads case list from file, one ID per line
# Usage:
#   pwsh -File owa-email-batch.ps1 -CaseListFile "./cases.txt" -OutputDir "./output"
#   pwsh -File owa-email-batch.ps1 -CaseListFile "./cases.txt" -OutputDir "./output" -Headed

param(
    [Parameter(Mandatory=$true)]
    [string]$CaseListFile,
    [Parameter(Mandatory=$true)]
    [string]$OutputDir,
    [string]$LogFile,
    [switch]$Headed
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Resolve paths
$CaseListFile = Resolve-Path $CaseListFile -ErrorAction Stop
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }
$OutputDir = Resolve-Path $OutputDir

# Log file: daily in output dir
if (-not $LogFile) {
    $LogFile = Join-Path $OutputDir ("owa-batch-" + (Get-Date -Format "yyyy-MM-dd") + ".log")
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

# Read case list (skip empty lines and comments)
$cases = Get-Content $CaseListFile -Encoding UTF8 | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }

if ($cases.Count -eq 0) {
    Write-Log "No cases found in $CaseListFile" "ERROR"
    exit 1
}

Write-Log "Batch start: $($cases.Count) cases from $CaseListFile"

$scriptPath = Join-Path $PSScriptRoot "owa-email-fetch.ps1"
$totalSw = [System.Diagnostics.Stopwatch]::StartNew()
$okCount = 0
$emptyCount = 0
$failCount = 0
$totalEmails = 0
$results = @()

foreach ($case in $cases) {
    $outFile = Join-Path $OutputDir "$case.json"
    Write-Log "[$case] Starting..."

    $args = @('-File', $scriptPath, '-CaseNumber', $case, '-OutputPath', $outFile, '-LogFile', $LogFile)
    if ($Headed) { $args += '-Headed' }

    $out = & pwsh @args 2>&1 | Out-String
    $status = if ($out -match 'STATUS=(\w+)') { $Matches[1] } else { 'UNKNOWN' }
    $emails = if ($out -match 'EMAIL_COUNT=(\d+)') { [int]$Matches[1] } else { 0 }
    $dur = if ($out -match 'DURATION_MS=(\d+)') { [int]$Matches[1] } else { 0 }

    switch ($status) {
        'OK'    { $okCount++; $totalEmails += $emails }
        'EMPTY' { $emptyCount++ }
        default { $failCount++ }
    }

    $durSec = [math]::Round($dur / 1000, 1)
    Write-Log "[$case] $status | $emails emails | ${durSec}s"
    $results += [PSCustomObject]@{ Case=$case; Status=$status; Emails=$emails; Duration="${durSec}s" }
}

$totalSw.Stop()
$totalSec = [math]::Round($totalSw.ElapsedMilliseconds / 1000)

# Summary
Write-Log "========================================="
Write-Log "Batch done: $($cases.Count) cases in ${totalSec}s"
Write-Log "  OK=$okCount ($totalEmails emails) | EMPTY=$emptyCount | FAILED=$failCount"

Write-Host ""
$results | Format-Table -AutoSize

Write-Host "BATCH_TOTAL=$($cases.Count)"
Write-Host "BATCH_OK=$okCount"
Write-Host "BATCH_EMPTY=$emptyCount"
Write-Host "BATCH_FAILED=$failCount"
Write-Host "BATCH_EMAILS=$totalEmails"
Write-Host "BATCH_DURATION_S=$totalSec"
