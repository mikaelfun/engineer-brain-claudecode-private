# owa-email-fetch.ps1
# OWA 邮件提取：通过 Playwright + OWA 搜索 Case 邮件，提取完整 conversation
# 用法:
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md"
#   pwsh -File owa-email-fetch.ps1 -CaseNumber "2603060030001353" -OutputPath "./emails-owa.md" -PreviewOnly
#   pwsh -File owa-email-fetch.ps1 -EnsureBrowser   # 仅启动/检查浏览器

param(
    [string]$CaseNumber,
    [string]$OutputPath,
    [switch]$PreviewOnly,       # 只提取 aria-label preview，不加载完整 body
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
    $result = playwright-cli -s=owa eval '({url: location.href, title: document.title})' 2>&1 | Out-String
    return ($result -match "outlook\.office\.com" -or $result -match "Mail -")
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
# Step 0: Ensure browser
# ══════════════════════════════════════════════════════════════════════
if (-not (Ensure-OwaBrowser)) {
    Write-Log "OWA FAILED | Browser not available"
    Write-Host "STATUS=BROWSER_FAILED"
    exit 1
}
$t0 = $sw.ElapsedMilliseconds

# ══════════════════════════════════════════════════════════════════════
# Step 1: Navigate to inbox + Search
# ══════════════════════════════════════════════════════════════════════
Write-Log "OWA STEP1 | Searching for case $CaseNumber"

# Navigate to inbox (in case we're on a different page)
playwright-cli -s=owa goto $OWA_URL 2>&1 | Out-Null

# Poll until inbox loaded (search box available)
for ($nav = 0; $nav -lt 10; $nav++) {
    Start-Sleep -Seconds 1
    $navCheck = playwright-cli -s=owa eval '(document.querySelector("[role=search] [role=combobox]") ? "ready" : "waiting")' 2>&1 | Out-String
    if ($navCheck -match "ready") { break }
}

# Focus search box + type + enter
playwright-cli -s=owa eval "(document.querySelector(`"[role=search] [role=combobox]`")?.focus(), document.querySelector(`"[role=search] [role=combobox]`")?.click(), `"ok`")" 2>&1 | Out-Null
Start-Sleep -Milliseconds 800
playwright-cli -s=owa press "Control+a" 2>&1 | Out-Null
Start-Sleep -Milliseconds 300
playwright-cli -s=owa type $CaseNumber 2>&1 | Out-Null
Start-Sleep -Milliseconds 500
playwright-cli -s=owa press Enter 2>&1 | Out-Null

# Poll for search results instead of fixed sleep
$found = $false
for ($attempt = 0; $attempt -lt $SearchTimeout; $attempt++) {
    Start-Sleep -Seconds 1
    $check = playwright-cli -s=owa eval "
    (function(){
        var options = document.querySelectorAll(`"[role=option]`");
        for (var i = 0; i < options.length; i++) {
            if ((options[i].getAttribute(`"aria-label`") || `"`").indexOf(`"$CaseNumber`") > -1) return `"found`";
        }
        return `"waiting`";
    })()
    " 2>&1 | Out-String
    if ($check -match "found") { $found = $true; break }
}

if (-not $found) {
    Write-Log "OWA STEP1 EMPTY | No results for $CaseNumber after ${SearchTimeout}s"
    # Write empty output
    $emptyContent = "# Emails (OWA) — Case $CaseNumber`n`n> No emails found | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
    [System.IO.File]::WriteAllText($OutputPath, $emptyContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "STATUS=EMPTY"
    Write-Host "EMAIL_COUNT=0"
    exit 0
}
$t1 = $sw.ElapsedMilliseconds
Write-Log "OWA STEP1 OK | Search results found ($($t1-$t0)ms)"

# ══════════════════════════════════════════════════════════════════════
# Step 2-4: Open all conversations, expand, load bodies, extract
# Uses external JS file to avoid PowerShell escape hell
# ══════════════════════════════════════════════════════════════════════
$mode = if ($PreviewOnly) { "preview" } else { "full" }
Write-Log "OWA STEP2 | Extracting ($mode mode, scrollDelay=${ScrollDelay}ms)"

# Inject parameters into browser window
playwright-cli -s=owa eval "(window.__OWA_CASE_NUMBER=`"$CaseNumber`", window.__OWA_MODE=`"$mode`", window.__OWA_SCROLL_DELAY=$ScrollDelay, `"params set`")" 2>&1 | Out-Null

# Execute extraction JS file (read content, pass as eval argument)
$jsFile = Join-Path $PSScriptRoot "owa-extract-conversation.js"
$jsContent = Get-Content $jsFile -Raw
$extractResult = playwright-cli -s=owa eval $jsContent 2>&1 | Out-String

$t4 = $sw.ElapsedMilliseconds
Write-Log "OWA STEP2 OK | Extraction complete ($($t4-$t1)ms)"

# ══════════════════════════════════════════════════════════════════════
# Step 5: Read md from browser textarea + write output
# JS stored md in textarea#_owa_extract_md, returns "count|convs|bodies|chars"
# ══════════════════════════════════════════════════════════════════════

# Parse metadata from eval result (format: "count|convs|bodies|chars")
$metaMatch = [regex]::Match($extractResult, '(\d+)\|(\d+)\|(\d+)\|(\d+)')
if (-not $metaMatch.Success) {
    Write-Log "OWA ERROR | Unexpected extract result format (len=$($extractResult.Length))"
    Write-Log "OWA ERROR | First 200 chars: $($extractResult.Substring(0, [Math]::Min(200, $extractResult.Length)))"
    Write-Host "STATUS=EXTRACT_ERROR"
    exit 1
}
$emailCount = [int]$metaMatch.Groups[1].Value
$convCount = [int]$metaMatch.Groups[2].Value
$bodyCount = [int]$metaMatch.Groups[3].Value
$mdChars = [int]$metaMatch.Groups[4].Value

# Read md content from browser textarea
$mdContent = playwright-cli -s=owa eval 'document.getElementById("_owa_extract_md").value' 2>&1 | Out-String

# Extract the value (between first and last quote in ### Result section)
$mdMatch = [regex]::Match($mdContent, '### Result\s*\n"(.*)"', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($mdMatch.Success) {
    $md = $mdMatch.Groups[1].Value
    # Unescape
    $md = $md -replace '\\\\', '%%BACKSLASH%%'
    $md = $md -replace '\\n', "`n"
    $md = $md -replace '\\t', "`t"
    $md = $md -replace '\\"', '"'
    $md = $md -replace '%%BACKSLASH%%', '\'
} else {
    Write-Log "OWA ERROR | Cannot read md from textarea"
    Write-Host "STATUS=EXTRACT_ERROR"
    exit 1
}

# Ensure output dir exists
$outDir = Split-Path -Parent $OutputPath
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

[System.IO.File]::WriteAllText($OutputPath, $md, [System.Text.UTF8Encoding]::new($false))
$sizeKB = [math]::Round((Get-Item $OutputPath).Length / 1024, 1)

$sw.Stop()
$mode = if ($PreviewOnly) { "preview" } else { "full" }
Write-Log "OWA DONE | $emailCount emails ($convCount convs, $bodyCount bodies), ${sizeKB}KB, ${mode} mode, $($sw.ElapsedMilliseconds)ms total"
Write-Host "STATUS=OK"
Write-Host "EMAIL_COUNT=$emailCount"
Write-Host "SIZE_KB=$sizeKB"
Write-Host "DURATION_MS=$($sw.ElapsedMilliseconds)"
