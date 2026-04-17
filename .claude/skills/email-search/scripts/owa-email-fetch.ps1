# owa-email-fetch.ps1
# OWA email extraction v3: optimized with mega JS architecture (search wait + extract in one eval)
# Ported efficiency patterns from owa-search-and-extract.js version
# Outputs: MD (default) + optional JSON + inline images
#
# Usage:
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md"
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md" -NoImages
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md" -Headed
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md" -JsonOutput
#   pwsh -File owa-email-fetch.ps1 -EnsureBrowser

param(
    [string]$CaseNumber,
    [string]$OutputPath,
    [switch]$PreviewOnly,       # only extract aria-label previews, no full body
    [switch]$NoImages,          # text-only mode, skip image extraction
    [switch]$EnsureBrowser,     # only ensure browser is ready
    [switch]$JsonOutput,        # also output JSON (emails-owa.json)
    [switch]$Headed,            # run browser in headed mode for debugging
    [string]$LogFile,
    [int]$ScrollDelay = 150,    # per-email scroll delay ms (v3: down from 400)
    [int]$SearchTimeout = 15    # search result wait timeout s
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
        # Persistent profile may restore old session with about:blank tab
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
        # Browser alive but might be on about:blank from persistent profile
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

# ── EnsureBrowser mode ──
if ($EnsureBrowser) {
    $ok = Ensure-OwaBrowser
    if ($ok) { Write-Host "STATUS=OK" } else { Write-Host "STATUS=FAILED"; exit 1 }
    exit 0
}

# ── Validate params ──
if (-not $CaseNumber) { Write-Host "ERROR: -CaseNumber required"; exit 1 }
if (-not $OutputPath) { Write-Host "ERROR: -OutputPath required"; exit 1 }

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

    # Step 1: Wait for OWA ready (search box present)
    # Smart nav: don't re-goto if already on OWA
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

    # Step 2: Search — focus + set all JS params in one eval, then type/press
    Write-Log "Searching for case $CaseNumber"
    $mode = if ($PreviewOnly) { "preview" } else { "full" }
    $withImagesJs = if ($NoImages) { "false" } else { "true" }

    # Combined: focus search box + set all JS params (saves process calls)
    playwright-cli -s=owa eval "(function(){var sb=document.querySelector('[role=search] [role=combobox]')||document.getElementById('topSearchInput');if(sb){sb.focus();sb.click()}window.__OWA_CASE_NUMBER='$CaseNumber';window.__OWA_MODE='$mode';window.__OWA_WITH_IMAGES=$withImagesJs;window.__OWA_SCROLL_DELAY=$ScrollDelay;return 'ready'})()" 2>&1 | Out-Null
    playwright-cli -s=owa press Control+a 2>&1 | Out-Null
    playwright-cli -s=owa type $CaseNumber 2>&1 | Out-Null
    playwright-cli -s=owa press Enter 2>&1 | Out-Null

    # Step 3: Run mega JS (search wait + extraction in one eval, no polling loop)
    # Retry JS extraction up to 2 times in-place (don't kill browser for parse failures)
    $jsFile = Join-Path $PSScriptRoot "owa-extract-conversation.js"
    $jsContent = Get-Content $jsFile -Raw
    $metaMatch = $null
    for ($jsRetry = 0; $jsRetry -lt 3; $jsRetry++) {
        if ($jsRetry -gt 0) {
            Write-Log "Retrying JS extraction in-place ($jsRetry/2)..." "WARN"
            Start-Sleep -Seconds 2
        }
        $extractResult = playwright-cli -s=owa eval $jsContent 2>&1 | Out-String
        $t2 = $sw.ElapsedMilliseconds

        # Step 4: Parse metadata (format: OK|labels|convs|bodies|images|mdLen|elapsed)
        $metaMatch = [regex]::Match($extractResult, '(OK|EMPTY)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)')
        if ($metaMatch.Success) { break }
        Write-Log "Bad metadata format (jsRetry $jsRetry, attempt $attempt, len=$($extractResult.Length))" "WARN"
        if ($extractResult.Length -lt 500) { Write-Log "Raw: $extractResult" "DEBUG" }
    }
    if (-not $metaMatch -or -not $metaMatch.Success) {
        Write-Log "JS extraction failed after 3 tries (attempt $attempt)" "ERROR"
        continue
    }
    $status = $metaMatch.Groups[1].Value
    $emailCount = [int]$metaMatch.Groups[2].Value
    $convCount = [int]$metaMatch.Groups[3].Value
    $bodyCount = [int]$metaMatch.Groups[4].Value
    $imageCount = [int]$metaMatch.Groups[5].Value
    $mdLen = [int]$metaMatch.Groups[6].Value
    $jsElapsed = [int]$metaMatch.Groups[7].Value

    if ($status -eq "EMPTY") {
        Write-Log "No search results for $CaseNumber"
        $emptyContent = "# Emails (OWA) — Case $CaseNumber`n`n> No emails found | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
        $outDir = Split-Path -Parent $OutputPath
        if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
        [System.IO.File]::WriteAllText($OutputPath, $emptyContent, [System.Text.UTF8Encoding]::new($false))
        Write-Host "STATUS=EMPTY"
        Write-Host "EMAIL_COUNT=0"
        exit 0
    }

    Write-Log "JS extraction done: $emailCount labels, $convCount convs, $bodyCount bodies, $imageCount images, ${mdLen}B, ${jsElapsed}ms JS + $($t2-$t0)ms total"

    # Step 5: Read MD from textarea
    $mdRaw = playwright-cli -s=owa eval 'document.getElementById("_owa_extract_md").value' 2>&1 | Out-String
    $mdMatch = [regex]::Match($mdRaw, '### Result\s*\n"(.*?)"\s*\n### Ran', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $mdMatch.Success) {
        $mdMatch = [regex]::Match($mdRaw, '### Result\s*\n"(.*)"', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    }
    if (-not $mdMatch.Success) {
        Write-Log "Cannot read MD textarea (attempt $attempt)" "ERROR"
        continue
    }

    $md = $mdMatch.Groups[1].Value
    $md = $md -replace '\\\\', '%%BACKSLASH%%'
    $md = $md -replace '\\n', "`n"
    $md = $md -replace '\\t', "`t"
    $md = $md -replace '\\"', '"'
    $md = $md -replace '%%BACKSLASH%%', '\'

    # Write MD output
    $outDir = Split-Path -Parent $OutputPath
    if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    [System.IO.File]::WriteAllText($OutputPath, $md, [System.Text.UTF8Encoding]::new($false))
    $sizeKB = [math]::Round((Get-Item $OutputPath).Length / 1024, 1)

    # Step 5b: Write JSON output if requested
    if ($JsonOutput) {
        $jsonPath = $OutputPath -replace '\.md$', '.json'
        $lenResult = playwright-cli -s=owa eval 'document.getElementById("_owa_extract_json").value.length' 2>&1 | Out-String
        $lenMatch = [regex]::Match($lenResult, '(\d+)')
        if ($lenMatch.Success) {
            $jsonLen = [int]$lenMatch.Groups[1].Value
            $chunkSize = 60000
            $fullB64 = ""
            for ($offset = 0; $offset -lt $jsonLen; $offset += $chunkSize) {
                $b64Chunk = playwright-cli -s=owa eval "(function(){ var v = document.getElementById('_owa_extract_json').value.substring($offset, $($offset + $chunkSize)); return btoa(unescape(encodeURIComponent(v))); })()" 2>&1 | Out-String
                $b64Match = [regex]::Match($b64Chunk, '"([A-Za-z0-9+/=]+)"')
                if ($b64Match.Success) { $fullB64 += $b64Match.Groups[1].Value }
            }
            if ($fullB64.Length -gt 0) {
                $jsonBytes = [System.Convert]::FromBase64String($fullB64)
                $jsonStr = [System.Text.Encoding]::UTF8.GetString($jsonBytes)
                [System.IO.File]::WriteAllText($jsonPath, $jsonStr, [System.Text.UTF8Encoding]::new($false))
                Write-Log "JSON saved to $jsonPath ($([math]::Round($jsonBytes.Length/1024,1))KB)"
            }
        }
    }

    # Step 6: Save inline images (if not -NoImages and images were extracted)
    $savedImageCount = 0
    if (-not $NoImages -and $imageCount -gt 0) {
        $imagesDir = Join-Path $outDir "images"
        if (-not (Test-Path $imagesDir)) { New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null }
        Write-Log "Saving $imageCount inline image(s)"

        for ($imgIdx = 0; $imgIdx -lt $imageCount; $imgIdx++) {
            $imgNameResult = playwright-cli -s=owa eval "(function(){ return window.__OWA_IMAGES[$imgIdx].name; })()" 2>&1 | Out-String
            $imgNameMatch = [regex]::Match($imgNameResult, '"(owa-img-\d+\.png)"')
            $imgName = if ($imgNameMatch.Success) { $imgNameMatch.Groups[1].Value } else { "owa-img-$imgIdx.png" }

            # Store base64 data in textarea to avoid stdout size limits
            playwright-cli -s=owa eval "(function(){ var ta = document.getElementById('_owa_img_data') || document.createElement('textarea'); ta.id = '_owa_img_data'; ta.style.cssText = 'position:fixed;left:-9999px'; ta.value = window.__OWA_IMAGES[$imgIdx].dataUrl; if (!ta.parentElement) document.body.appendChild(ta); return 'stored'; })()" 2>&1 | Out-Null

            $imgDataResult = playwright-cli -s=owa eval "document.getElementById('_owa_img_data').value" 2>&1 | Out-String
            $imgDataMatch = [regex]::Match($imgDataResult, 'data:image/png;base64,([A-Za-z0-9+/=]+)', [System.Text.RegularExpressions.RegexOptions]::Singleline)

            if ($imgDataMatch.Success) {
                $bytes = [System.Convert]::FromBase64String($imgDataMatch.Groups[1].Value)
                $imgPath = Join-Path $imagesDir $imgName
                [System.IO.File]::WriteAllBytes($imgPath, $bytes)
                $imgSizeKB = [math]::Round($bytes.Length / 1024, 1)
                Write-Log "  Saved $imgName (${imgSizeKB}KB)"
                $savedImageCount++
            } else {
                Write-Log "  SKIP $imgName (no base64 data)"
            }
        }
    }

    $sw.Stop()
    Write-Log "Done: $emailCount emails ($convCount convs, $bodyCount bodies, $savedImageCount images), ${sizeKB}KB, $mode mode, $($sw.ElapsedMilliseconds)ms total"
    Write-Host "STATUS=OK"
    Write-Host "EMAIL_COUNT=$emailCount"
    Write-Host "IMAGE_COUNT=$savedImageCount"
    Write-Host "SIZE_KB=$sizeKB"
    Write-Host "DURATION_MS=$($sw.ElapsedMilliseconds)"
    exit 0
}

Write-Log "All $($maxRetries+1) attempts failed for case $CaseNumber" "ERROR"
Write-Host "STATUS=FAILED"
exit 1
