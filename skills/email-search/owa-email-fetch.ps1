# owa-email-fetch.ps1
# OWA 邮件提取：通过 Playwright + OWA 搜索 Case 邮件，提取完整 conversation
# 支持内联图片提取（默认开启）和纯文本模式（-NoImages）
# 用法:
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md"
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md" -NoImages
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md" -PreviewOnly
#   pwsh -File owa-email-fetch.ps1 -EnsureBrowser   # 仅启动/检查浏览器

param(
    [string]$CaseNumber,
    [string]$OutputPath,
    [switch]$PreviewOnly,       # 只提取 aria-label preview，不加载完整 body
    [switch]$NoImages,          # 纯文本模式，不提取内联图片
    [switch]$EnsureBrowser,     # 仅确保浏览器就绪
    [string]$LogFile,
    [int]$ScrollDelay = 400,    # 每封邮件 scrollIntoView 后等待 ms
    [int]$SearchTimeout = 15    # 搜索结果等待超时 s
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$OWA_URL = "https://outlook.office.com/mail/0/"
$OWA_PROFILE = Join-Path $env:TEMP "playwright-owa-profile"

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $Message"
    Write-Host $line
    if ($LogFile) {
        $logDir = Split-Path -Parent $LogFile
        if ($logDir -and -not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
        Add-Content -Path $LogFile -Value $line -Encoding UTF8
    }
}

function Test-BrowserAlive {
    try {
        $result = playwright-cli -s=owa eval '({url: location.href, title: document.title})' 2>&1 | Out-String
        return ($result -match "outlook\.office\.com" -or $result -match "Mail -")
    } catch {
        return $false
    }
}

function Start-OwaBrowser {
    Write-Log "OWA BROWSER | Starting persistent Edge session..."
    $out = playwright-cli -s=owa open --persistent --profile $OWA_PROFILE --browser msedge $OWA_URL 2>&1 | Out-String
    if ($out -match "opened with pid") {
        Start-Sleep -Seconds 3
        if (Test-BrowserAlive) {
            Write-Log "OWA BROWSER | Ready"
            return $true
        }
    }
    Write-Log "OWA BROWSER | Failed to start: $($out.Substring(0, [Math]::Min(200, $out.Length)))"
    return $false
}

function Ensure-OwaBrowser {
    if (Test-BrowserAlive) {
        return $true
    }
    # Close stale session + kill any lingering edge processes from OWA profile
    playwright-cli -s=owa close 2>&1 | Out-Null
    Start-Sleep -Seconds 2

    # Retry up to 2 times
    for ($retry = 0; $retry -lt 2; $retry++) {
        if (Start-OwaBrowser) { return $true }
        Write-Log "OWA BROWSER | Retry $($retry+1) — killing stale processes..."
        playwright-cli -s=owa close 2>&1 | Out-Null
        # Kill any msedge using our profile
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

# ══════════════════════════════════════════════════════════════════════
# Main extraction with retry (covers EXTRACT_ERROR + BROWSER_FAILED)
# ══════════════════════════════════════════════════════════════════════
$maxRetries = 2
$success = $false

for ($attempt = 0; $attempt -le $maxRetries; $attempt++) {
    if ($attempt -gt 0) {
        Write-Log "OWA RETRY $attempt | Restarting browser and retrying..."
        playwright-cli -s=owa close 2>&1 | Out-Null
        Start-Sleep -Seconds 3
    }

    # Step 0: Ensure browser
    if (-not (Ensure-OwaBrowser)) {
        Write-Log "OWA FAILED | Browser not available (attempt $attempt)"
        continue
    }
    $t0 = $sw.ElapsedMilliseconds

    # Step 1: Navigate + Search
    Write-Log "OWA STEP1 | Searching for case $CaseNumber"
    playwright-cli -s=owa goto $OWA_URL 2>&1 | Out-Null
    for ($nav = 0; $nav -lt 10; $nav++) {
        Start-Sleep -Seconds 1
        $navCheck = playwright-cli -s=owa eval '(document.querySelector("[role=search] [role=combobox]") ? "ready" : "waiting")' 2>&1 | Out-String
        if ($navCheck -match "ready") { break }
    }

    playwright-cli -s=owa eval "(document.querySelector(`"[role=search] [role=combobox]`")?.focus(), document.querySelector(`"[role=search] [role=combobox]`")?.click(), `"ok`")" 2>&1 | Out-Null
    Start-Sleep -Milliseconds 800
    playwright-cli -s=owa press "Control+a" 2>&1 | Out-Null
    Start-Sleep -Milliseconds 300
    playwright-cli -s=owa type $CaseNumber 2>&1 | Out-Null
    Start-Sleep -Milliseconds 500
    playwright-cli -s=owa press Enter 2>&1 | Out-Null

    $found = $false
    for ($s = 0; $s -lt $SearchTimeout; $s++) {
        Start-Sleep -Seconds 1
        $check = playwright-cli -s=owa eval "
        (function(){
            var options = document.querySelectorAll(`"[role=option]`");
            for (var i = 0; i < options.length; i++) {
                if ((options[i].getAttribute(`"aria-label`") || `"`").length > 40) return `"found`";
            }
            return `"waiting`";
        })()
        " 2>&1 | Out-String
        if ($check -match "found") { $found = $true; break }
    }

    if (-not $found) {
        Write-Log "OWA STEP1 EMPTY | No results for $CaseNumber"
        $emptyContent = "# Emails (OWA) — Case $CaseNumber`n`n> No emails found | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
        $outDir = Split-Path -Parent $OutputPath
        if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
        [System.IO.File]::WriteAllText($OutputPath, $emptyContent, [System.Text.UTF8Encoding]::new($false))
        Write-Host "STATUS=EMPTY"
        Write-Host "EMAIL_COUNT=0"
        exit 0
    }
    $t1 = $sw.ElapsedMilliseconds
    Write-Log "OWA STEP1 OK | Search results found ($($t1-$t0)ms)"

    # Step 2-4: Extract
    $mode = if ($PreviewOnly) { "preview" } else { "full" }
    $withImagesJs = if ($NoImages) { "false" } else { "true" }
    Write-Log "OWA STEP2 | Extracting ($mode mode, images=$withImagesJs)"
    playwright-cli -s=owa eval "(window.__OWA_CASE_NUMBER=`"$CaseNumber`", window.__OWA_MODE=`"$mode`", window.__OWA_WITH_IMAGES=$withImagesJs, window.__OWA_SCROLL_DELAY=$ScrollDelay, `"params set`")" 2>&1 | Out-Null

    $jsFile = Join-Path $PSScriptRoot "owa-extract-conversation.js"
    $jsContent = Get-Content $jsFile -Raw
    $extractResult = playwright-cli -s=owa eval $jsContent 2>&1 | Out-String
    $t4 = $sw.ElapsedMilliseconds

    # Step 5: Parse metadata (format: labels|convs|bodies|images|mdLen|elapsed)
    $metaMatch = [regex]::Match($extractResult, '(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)')
    if (-not $metaMatch.Success) {
        # Fallback: try old 4-field format
        $metaMatch = [regex]::Match($extractResult, '(\d+)\|(\d+)\|(\d+)\|(\d+)')
    }
    if (-not $metaMatch.Success) {
        Write-Log "OWA EXTRACT_ERROR | Bad metadata format (attempt $attempt, len=$($extractResult.Length))"
        continue  # retry
    }
    $emailCount = [int]$metaMatch.Groups[1].Value
    $convCount = [int]$metaMatch.Groups[2].Value
    $bodyCount = [int]$metaMatch.Groups[3].Value
    $imageCount = if ($metaMatch.Groups.Count -ge 5) { [int]$metaMatch.Groups[4].Value } else { 0 }

    # Read md from textarea
    $mdContent = playwright-cli -s=owa eval 'document.getElementById("_owa_extract_md").value' 2>&1 | Out-String
    # Read md from textarea — stop before "### Ran Playwright" footer
    $mdMatch = [regex]::Match($mdContent, '### Result\s*\n"(.*?)"\s*\n### Ran', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if (-not $mdMatch.Success) {
        # Fallback: try without ### Ran anchor
        $mdMatch = [regex]::Match($mdContent, '### Result\s*\n"(.*)"', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    }
    if (-not $mdMatch.Success) {
        Write-Log "OWA EXTRACT_ERROR | Cannot read textarea (attempt $attempt)"
        continue  # retry
    }

    $md = $mdMatch.Groups[1].Value
    $md = $md -replace '\\\\', '%%BACKSLASH%%'
    $md = $md -replace '\\n', "`n"
    $md = $md -replace '\\t', "`t"
    $md = $md -replace '\\"', '"'
    $md = $md -replace '%%BACKSLASH%%', '\'

    # Write output
    $outDir = Split-Path -Parent $OutputPath
    if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    [System.IO.File]::WriteAllText($OutputPath, $md, [System.Text.UTF8Encoding]::new($false))
    $sizeKB = [math]::Round((Get-Item $OutputPath).Length / 1024, 1)

    # Step 6: Save inline images (if not -NoImages and images were extracted)
    $savedImageCount = 0
    if (-not $NoImages -and $imageCount -gt 0) {
        $imagesDir = Join-Path $outDir "images"
        if (-not (Test-Path $imagesDir)) { New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null }
        Write-Log "OWA STEP6 | Saving $imageCount inline image(s)"

        for ($imgIdx = 0; $imgIdx -lt $imageCount; $imgIdx++) {
            # Get image filename
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
    Write-Log "OWA DONE | $emailCount emails ($convCount convs, $bodyCount bodies, $savedImageCount images), ${sizeKB}KB, ${mode} mode, $($sw.ElapsedMilliseconds)ms total"
    Write-Host "STATUS=OK"
    Write-Host "EMAIL_COUNT=$emailCount"
    Write-Host "IMAGE_COUNT=$savedImageCount"
    Write-Host "SIZE_KB=$sizeKB"
    Write-Host "DURATION_MS=$($sw.ElapsedMilliseconds)"
    $success = $true
    break
}

if (-not $success) {
    Write-Log "OWA FAILED | All $($maxRetries+1) attempts failed for case $CaseNumber"
    Write-Host "STATUS=FAILED"
    exit 1
}
