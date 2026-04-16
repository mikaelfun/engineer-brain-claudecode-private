# owa-email-fetch.ps1
# OWA email extraction v2: optimized with mega JS (search + wait + extract in one eval)
# Usage:
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./out.json"
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./out.json" -Headed

param(
    [string]$CaseNumber,
    [string]$OutputPath,
    [string]$LogFile,
    [int]$ScrollDelay = 400,       # per-email scroll delay ms
    [int]$SearchTimeout = 15,      # search result wait timeout s
    [switch]$Headed                # run browser in headed mode for debugging
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$OWA_URL = "https://outlook.cloud.microsoft/mail/0/"
$OWA_PROFILE = Join-Path $env:TEMP "playwright-owa-profile"

if (-not $LogFile -and $OutputPath) {
    $outDir = Split-Path -Parent $OutputPath
    if ($outDir) { $LogFile = Join-Path $outDir ("owa-extract-" + (Get-Date -Format "yyyy-MM-dd") + ".log") }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    if ($LogFile) {
        $logDir = Split-Path -Parent $LogFile
        if ($logDir -and -not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
        Add-Content -Path $LogFile -Value $line -Encoding UTF8
    }
}

function Test-BrowserAlive {
    try {
        $result = playwright-cli -s=owa eval '1+1' 2>&1 | Out-String
        return ($result -match "2")
    } catch {
        return $false
    }
}

function Start-OwaBrowser {
    Write-Log "Starting persistent Edge session$(if ($Headed) { ' (headed)' } else { '' })..."
    $openArgs = @('-s=owa', 'open', '--persistent', '--profile', $OWA_PROFILE, '--browser', 'msedge')
    if ($Headed) { $openArgs += '--headed' }
    $openArgs += $OWA_URL
    $out = & playwright-cli @openArgs 2>&1 | Out-String
    if ($out -match "opened with pid") {
        Start-Sleep -Seconds 3
        # Persistent profile may restore old session → dual tab (about:blank + OWA)
        # Check if current tab is about:blank and navigate to OWA
        $curUrl = playwright-cli -s=owa eval 'location.href' 2>&1 | Out-String
        if ($curUrl -match "about:blank" -or -not ($curUrl -match "outlook")) {
            Write-Log "Current tab not on OWA, navigating..."
            playwright-cli -s=owa goto $OWA_URL 2>&1 | Out-Null
        }
        # Wait for OWA to fully load (search box present)
        for ($w = 0; $w -lt 12; $w++) {
            Start-Sleep -Seconds 2
            $check = playwright-cli -s=owa eval '(function(){var h=location.href;if(!/outlook/i.test(h))return "NOT_OWA|"+h;var sb=document.querySelector("[role=search] [role=combobox]")||document.getElementById("topSearchInput");if(!sb)return "NO_SEARCHBOX|"+h;return "READY|"+h})()' 2>&1 | Out-String
            if ($check -match "READY\|") {
                Write-Log "Browser ready"
                return $true
            }
            if ($check -match "NOT_OWA") {
                playwright-cli -s=owa goto $OWA_URL 2>&1 | Out-Null
            }
        }
    }
    Write-Log "Browser start failed" "ERROR"
    return $false
}

function Ensure-OwaBrowser {
    if (Test-BrowserAlive) {
        # Browser alive but might be on wrong tab (about:blank from persistent profile)
        $urlCheck = playwright-cli -s=owa eval 'location.href' 2>&1 | Out-String
        if ($urlCheck -match "about:blank") {
            Write-Log "Browser on about:blank, navigating to OWA..."
            playwright-cli -s=owa goto $OWA_URL 2>&1 | Out-Null
            Start-Sleep -Seconds 3
        }
        return $true
    }
    playwright-cli -s=owa close 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    for ($retry = 0; $retry -lt 2; $retry++) {
        if (Start-OwaBrowser) { return $true }
        Write-Log "Retry $($retry+1) - killing stale processes..." "WARN"
        playwright-cli -s=owa close 2>&1 | Out-Null
        $procs = Get-Process msedge -ErrorAction SilentlyContinue | Where-Object {
            try { $_.CommandLine -match "playwright-owa-profile" } catch { $false }
        }
        foreach ($p in $procs) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 3
    }
    return $false
}

# == Validate params ==
if (-not $CaseNumber) { Write-Host "ERROR: -CaseNumber required"; exit 1 }
if (-not $OutputPath) { Write-Host "ERROR: -OutputPath required"; exit 1 }

# == Incremental mode: load existing ==
$existingEmails = @()
$existingFingerprints = @{}
$newestExistingDate = ""
$prevOptionsHash = ""
if (Test-Path $OutputPath) {
    try {
        $existingJson = Get-Content $OutputPath -Raw | ConvertFrom-Json
        $existingEmails = @($existingJson.emails)
        foreach ($e in $existingEmails) {
            $bodyStr = if ($e.body) { $e.body } else { "" }
            $normalized = $bodyStr -replace '\s+', ' '
            $fpLen = [Math]::Min(120, $normalized.Length)
            if ($fpLen -gt 0) {
                $fp = $normalized.Substring(0, $fpLen)
                $existingFingerprints[$fp] = $true
            }
        }
        foreach ($e in $existingEmails) {
            if ($e.date -and $e.date.Length -gt 5) {
                $newestExistingDate = $e.date
                break
            }
        }
        if ($existingJson._optionsHash) { $prevOptionsHash = $existingJson._optionsHash }
        Write-Log "Incremental mode: $($existingEmails.Count) existing emails, newest=$newestExistingDate"
    } catch {
        Write-Log "Cannot parse existing file ($_), will overwrite" "WARN"
        $existingEmails = @()
        $existingFingerprints = @{}
        $newestExistingDate = ""
        $prevOptionsHash = ""
    }
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$maxRetries = 2

for ($attempt = 0; $attempt -le $maxRetries; $attempt++) {
    if ($attempt -gt 0) {
        Write-Log "Restarting browser, retry $attempt..." "WARN"
        playwright-cli -s=owa close 2>&1 | Out-Null
        Start-Sleep -Seconds 3
    }

    # Step 0: Ensure browser
    if (-not (Ensure-OwaBrowser)) {
        Write-Log "Browser not available (attempt $attempt)" "ERROR"
        continue
    }
    $t0 = $sw.ElapsedMilliseconds

    # Step 1: Wait for OWA to be ready (search box present)
    # Ensure-OwaBrowser already navigated to OWA, just wait for DOM ready
    Write-Log "Waiting for OWA ready..."
    $owaReady = $false
    for ($w = 0; $w -lt 10; $w++) {
        $prepResult = playwright-cli -s=owa eval '(function(){if(!/outlook/i.test(location.href))return "NEED_NAV";var sb=document.querySelector("[role=search] [role=combobox]")||document.getElementById("topSearchInput");if(!sb)return "NO_SEARCH_BOX";return "ready|"+sb.value})()' 2>&1 | Out-String
        if ($prepResult -match "ready\|") { $owaReady = $true; break }
        if ($prepResult -match "NEED_NAV") {
            Write-Log "Not on OWA, navigating..."
            playwright-cli -s=owa goto $OWA_URL 2>&1 | Out-Null
        }
        Start-Sleep -Seconds 2
    }
    if (-not $owaReady) {
        Write-Log "OWA not ready after 20s (attempt $attempt)" "ERROR"
        continue
    }
    $t1 = $sw.ElapsedMilliseconds
    Write-Log "OWA ready ($($t1-$t0)ms)"

    # Step 2: Search — focus + set params in one eval, then type/press
    Write-Log "Searching for case $CaseNumber"
    $cutoffDateEscaped = $newestExistingDate -replace '"', '\"'
    $prevHashEscaped = $prevOptionsHash -replace '"', '\"'

    # Combined: focus search box + set all JS params (saves one process call)
    playwright-cli -s=owa eval "(function(){var sb=document.querySelector('[role=search] [role=combobox]')||document.getElementById('topSearchInput');if(sb){sb.focus();sb.click()}window.__OWA_CASE_NUMBER='$CaseNumber';window.__OWA_MODE='full';window.__OWA_SCROLL_DELAY=$ScrollDelay;window.__OWA_CUTOFF_DATE='$cutoffDateEscaped';window.__OWA_PREV_HASH='$prevHashEscaped';window.__OWA_DO_SEARCH=false;return 'ready'})()" 2>&1 | Out-Null
    # Ctrl+A to select all existing text, then type replaces it
    playwright-cli -s=owa press Control+a 2>&1 | Out-Null
    playwright-cli -s=owa type $CaseNumber 2>&1 | Out-Null
    playwright-cli -s=owa press Enter 2>&1 | Out-Null

    # Run mega JS: wait for results + extract (single eval, no polling loop)
    $jsFile = Join-Path $PSScriptRoot "owa-search-and-extract.js"
    $jsContent = Get-Content $jsFile -Raw
    $extractResult = playwright-cli -s=owa eval $jsContent 2>&1 | Out-String
    $t2 = $sw.ElapsedMilliseconds

    # Step 3: Parse metadata (format: status|labels|convs|bodies|jsonLen|elapsed|skipped)
    $metaMatch = [regex]::Match($extractResult, '(OK|EMPTY|ERROR)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d*)')
    if (-not $metaMatch.Success) {
        Write-Log "Bad metadata format (attempt $attempt, len=$($extractResult.Length))" "ERROR"
        if ($extractResult.Length -lt 500) { Write-Log "Raw: $extractResult" "DEBUG" }
        continue
    }
    $status = $metaMatch.Groups[1].Value
    $emailCount = [int]$metaMatch.Groups[2].Value
    $convCount = [int]$metaMatch.Groups[3].Value
    $bodyCount = [int]$metaMatch.Groups[4].Value
    $jsonLen = [int]$metaMatch.Groups[5].Value
    $jsElapsed = [int]$metaMatch.Groups[6].Value
    $skippedCount = if ($metaMatch.Groups[7].Value) { [int]$metaMatch.Groups[7].Value } else { 0 }

    if ($status -eq "EMPTY") {
        Write-Log "No search results for $CaseNumber"
        $emptyJson = @{
            caseNumber = $CaseNumber
            timestamp = (Get-Date -Format "o")
            conversationCount = 0
            emailCount = 0
            emails = @()
        } | ConvertTo-Json -Depth 5
        $outDir = Split-Path -Parent $OutputPath
        if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
        [System.IO.File]::WriteAllText($OutputPath, $emptyJson, [System.Text.UTF8Encoding]::new($false))
        Write-Host "STATUS=EMPTY"
        Write-Host "EMAIL_COUNT=0"
        exit 0
    }

    $skippedInfo = if ($skippedCount -gt 0) { ", $skippedCount skipped by cutoff" } else { "" }
    Write-Log "JS extraction done: $emailCount labels, $convCount convs, $bodyCount bodies, ${jsonLen}B, ${jsElapsed}ms JS + $($t2-$t0)ms total${skippedInfo}"

    # Step 4: Read JSON from textarea (1 call)
    $jsonRaw = playwright-cli -s=owa eval 'document.getElementById("_owa_extract_json").value' 2>&1 | Out-String
    $jsonMatch = [regex]::Match($jsonRaw, '### Result\s*\n"(.*?)"\s*\n### Ran', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $jsonMatch.Success) {
        $jsonMatch = [regex]::Match($jsonRaw, '### Result\s*\n"(.*)"', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    }
    if (-not $jsonMatch.Success) {
        Write-Log "Cannot read JSON textarea (attempt $attempt)" "ERROR"
        continue
    }

    $jsonStr = $jsonMatch.Groups[1].Value
    $jsonStr = $jsonStr -replace '\\\\', '%%BACKSLASH%%'
    $jsonStr = $jsonStr -replace '\\n', "`n"
    $jsonStr = $jsonStr -replace '\\t', "`t"
    $jsonStr = $jsonStr -replace '\\"', '"'
    $jsonStr = $jsonStr -replace '%%BACKSLASH%%', '\'

    try {
        $parsed = $jsonStr | ConvertFrom-Json
        $actualCount = $parsed.emailCount
    } catch {
        Write-Log "Invalid JSON (attempt $attempt): $_" "ERROR"
        continue
    }

    # Quick exit: no change
    if ($parsed._noChange -eq $true -and $existingEmails.Count -gt 0) {
        $sw.Stop()
        Write-Log "No change detected (options hash match), keeping existing file"
        Write-Host "STATUS=OK"
        Write-Host "EMAIL_COUNT=$($existingEmails.Count)"
        Write-Host "NEW_COUNT=0"
        Write-Host "SIZE_KB=$([math]::Round((Get-Item $OutputPath).Length / 1024, 1))"
        Write-Host "DURATION_MS=$($sw.ElapsedMilliseconds)"
        exit 0
    }

    # Step 5: Incremental merge
    $newEmails = @()
    if ($existingFingerprints.Count -gt 0) {
        foreach ($e in $parsed.emails) {
            $bodyStr = if ($e.body) { $e.body } else { "" }
            $normalized = $bodyStr -replace '\s+', ' '
            $fpLen = [Math]::Min(120, $normalized.Length)
            $fp = if ($fpLen -gt 0) { $normalized.Substring(0, $fpLen) } else { "" }
            if ($fp -and -not $existingFingerprints.ContainsKey($fp)) {
                $newEmails += $e
            }
        }
        if ($newEmails.Count -gt 0) {
            $mergedEmails = @($newEmails) + @($existingEmails)
            Write-Log "Incremental: $($newEmails.Count) new emails, merging with $($existingEmails.Count) existing"
        } else {
            $mergedEmails = @($existingEmails)
            Write-Log "Incremental: no new emails found"
        }
        $merged = @{
            caseNumber = $parsed.caseNumber
            timestamp = $parsed.timestamp
            conversationCount = $parsed.conversationCount
            emailCount = $mergedEmails.Count
            emails = $mergedEmails
            _optionsHash = if ($parsed._optionsHash) { $parsed._optionsHash } else { "" }
        }
        $jsonStr = $merged | ConvertTo-Json -Depth 10 -EscapeHandling EscapeNonAscii
        $parsed = $jsonStr | ConvertFrom-Json
        $actualCount = $parsed.emailCount
    } else {
        $actualCount = $parsed.emailCount
    }

    # Step 6: Write JSON
    $outDir = Split-Path -Parent $OutputPath
    if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    [System.IO.File]::WriteAllText($OutputPath, $jsonStr, [System.Text.UTF8Encoding]::new($false))
    $sizeKB = [math]::Round((Get-Item $OutputPath).Length / 1024, 1)

    $sentCount = ($parsed.emails | Where-Object { $_.direction -eq "Sent" }).Count
    $recvCount = ($parsed.emails | Where-Object { $_.direction -eq "Received" }).Count
    $unkCount = ($parsed.emails | Where-Object { $_.direction -eq "Unknown" }).Count

    $sw.Stop()
    Write-Log "Saved $OutputPath (${sizeKB}KB)"
    $newTag = if ($newEmails.Count -gt 0) { " (+$($newEmails.Count) new)" } else { "" }
    Write-Log "Result: $actualCount emails${newTag} (S=$sentCount R=$recvCount U=$unkCount), $convCount convs, $($sw.ElapsedMilliseconds)ms total"
    Write-Host "STATUS=OK"
    Write-Host "EMAIL_COUNT=$actualCount"
    Write-Host "NEW_COUNT=$($newEmails.Count)"
    Write-Host "SIZE_KB=$sizeKB"
    Write-Host "DURATION_MS=$($sw.ElapsedMilliseconds)"
    exit 0
}

Write-Log "All $($maxRetries+1) attempts failed for case $CaseNumber" "ERROR"
Write-Host "STATUS=FAILED"
exit 1
