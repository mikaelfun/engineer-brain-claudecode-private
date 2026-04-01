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
    $result = playwright-cli eval '({url: location.href, title: document.title})' 2>&1 | Out-String
    return ($result -match "outlook\.office\.com" -or $result -match "Mail -")
}

function Start-OwaBrowser {
    Write-Log "OWA BROWSER | Starting persistent Edge session..."
    $out = playwright-cli open --persistent --profile $OWA_PROFILE --browser msedge $OWA_URL 2>&1 | Out-String
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
        Write-Log "OWA BROWSER | Already running"
        return $true
    }
    return Start-OwaBrowser
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
playwright-cli goto $OWA_URL 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Focus search box + type + enter
playwright-cli eval "(document.querySelector(`"[role=search] [role=combobox]`")?.focus(), document.querySelector(`"[role=search] [role=combobox]`")?.click(), `"ok`")" 2>&1 | Out-Null
Start-Sleep -Milliseconds 500
playwright-cli press "Control+a" 2>&1 | Out-Null
playwright-cli type $CaseNumber 2>&1 | Out-Null
Start-Sleep -Milliseconds 500
playwright-cli press Enter 2>&1 | Out-Null

# Poll for search results instead of fixed sleep
$found = $false
for ($attempt = 0; $attempt -lt $SearchTimeout; $attempt++) {
    Start-Sleep -Seconds 1
    $check = playwright-cli eval "
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
# Step 2: Click first matching result
# ══════════════════════════════════════════════════════════════════════
$clickResult = playwright-cli eval "
(function(){
    var options = document.querySelectorAll(`"[role=option]`");
    for (var i = 0; i < options.length; i++) {
        if ((options[i].getAttribute(`"aria-label`") || `"`").indexOf(`"$CaseNumber`") > -1) {
            options[i].click();
            return `"clicked`";
        }
    }
    return `"not_found`";
})()
" 2>&1 | Out-String
Start-Sleep -Seconds 2

# Wait for conversation to load (poll for listitem or message body)
for ($w = 0; $w -lt 5; $w++) {
    $loaded = playwright-cli eval "
    (function(){
        var li = document.querySelectorAll(`"[role=listitem]`").length;
        var mb = document.querySelectorAll(`"[aria-label=\`"Message body\`"]`").length;
        return (li > 0 || mb > 0) ? `"loaded`" : `"waiting`";
    })()
    " 2>&1 | Out-String
    if ($loaded -match "loaded") { break }
    Start-Sleep -Seconds 1
}
$t2 = $sw.ElapsedMilliseconds
Write-Log "OWA STEP2 OK | Conversation opened ($($t2-$t1)ms)"

# ══════════════════════════════════════════════════════════════════════
# Step 3: Expand conversation (if button exists)
# ══════════════════════════════════════════════════════════════════════
$expandResult = playwright-cli eval "
(function(){
    var btns = document.querySelectorAll(`"button`");
    for (var i = 0; i < btns.length; i++) {
        if ((btns[i].getAttribute(`"aria-label`") || `"`") === `"Expand conversation`") {
            btns[i].click();
            return `"expanded`";
        }
    }
    return `"no_button`";
})()
" 2>&1 | Out-String
if ($expandResult -match "expanded") {
    Start-Sleep -Seconds 2
    Write-Log "OWA STEP3 OK | Conversation expanded"
} else {
    Write-Log "OWA STEP3 SKIP | No expand button (single email or already expanded)"
}
$t3 = $sw.ElapsedMilliseconds

# ══════════════════════════════════════════════════════════════════════
# Step 4: Extract conversation
# ══════════════════════════════════════════════════════════════════════
if ($PreviewOnly) {
    # ── Preview mode: just grab aria-label ──
    Write-Log "OWA STEP4 | Preview mode — extracting aria-labels"
    $extractResult = playwright-cli eval "
    (function(){
        var items = document.querySelectorAll(`"[role=listitem]`");
        var emails = [];
        for (var i = 0; i < items.length; i++) {
            var label = (items[i].getAttribute(`"aria-label`") || `"`");
            if (label.length > 30) emails.push(label);
        }
        // Build markdown
        var md = `"# Emails (OWA) — Case $CaseNumber\n\n`";
        md += `"> Generated: `" + new Date().toISOString() + `" | Total: `" + emails.length + `" emails | Source: OWA Preview\n\n---\n`";
        for (var j = 0; j < emails.length; j++) {
            var isExt = emails[j].indexOf(`"External sender`") > -1;
            var clean = emails[j].replace(`"External sender `", `"`").replace(`"Flagged `", `"`").replace(`"Unread Expanded `", `"`").replace(`"Unread `", `"`");
            var parts = clean.split(/\s{2,}/);
            var sender = parts[0] || `"?`";
            var icon = isExt ? `"📥 Received`" : `"📤 Sent`";
            var body = parts.slice(1).join(`" `");
            md += `"\n### `" + icon + `"\n**From:** `" + sender + `"\n\n`" + body + `"\n\n---\n`";
        }
        return JSON.stringify({count: emails.length, chars: md.length, md: md});
    })()
    " 2>&1 | Out-String

} else {
    # ── Full body mode: scrollIntoView + extract ──
    Write-Log "OWA STEP4 | Full body mode — loading all email bodies"
    $extractResult = playwright-cli eval "
    (async function(){
        var items = document.querySelectorAll(`"[role=listitem]`");
        var emailItems = [];
        for (var i = 0; i < items.length; i++) {
            var label = (items[i].getAttribute(`"aria-label`") || `"`");
            if (label.length > 30) emailItems.push({el: items[i], label: label});
        }

        function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

        // Trigger all body loading via scrollIntoView + click
        for (var j = 0; j < emailItems.length; j++) {
            emailItems[j].el.scrollIntoView({behavior: `"instant`", block: `"center`"});
            emailItems[j].el.click();
            await sleep($ScrollDelay);
        }
        await sleep(800);

        // Collect bodies — filter out nested quotes
        var bodies = document.querySelectorAll(`"[aria-label=\`"Message body\`"]`");
        var bodyTexts = [];
        for (var k = 0; k < bodies.length; k++) {
            var t = bodies[k].innerText || `"`";
            if (t.length > 5 && t.substring(0, 3) !== `"发件人`" && t.substring(0, 5) !== `"From:`") {
                bodyTexts.push(t);
            }
        }

        // Build markdown — pair emails with bodies (best effort: same order)
        var md = `"# Emails (OWA) — Case $CaseNumber\n\n`";
        md += `"> Generated: `" + new Date().toISOString() + `" | Total: `" + emailItems.length + `" emails | Source: OWA Full Body\n\n---\n`";

        for (var m = 0; m < emailItems.length; m++) {
            var isExt = emailItems[m].label.indexOf(`"External sender`") > -1;
            var clean = emailItems[m].label.replace(`"External sender `", `"`").replace(`"Flagged `", `"`").replace(`"Unread Expanded `", `"`").replace(`"Unread `", `"`");
            var parts = clean.split(/\s{2,}/);
            var sender = parts[0] || `"?`";
            var timeStr = (parts[1] || `"`").split(`" `").slice(0, 3).join(`" `");
            var icon = isExt ? `"📥 Received`" : `"📤 Sent`";

            var body = (m < bodyTexts.length) ? bodyTexts[m] : `"(body not loaded)`";
            md += `"\n### `" + icon + `" | `" + timeStr + `"\n**From:** `" + sender + `"\n\n`" + body + `"\n\n---\n`";
        }

        return JSON.stringify({count: emailItems.length, bodyCount: bodyTexts.length, chars: md.length, md: md});
    })()
    " 2>&1 | Out-String
}

$t4 = $sw.ElapsedMilliseconds

# ══════════════════════════════════════════════════════════════════════
# Step 5: Parse result and write output
# ══════════════════════════════════════════════════════════════════════

# Extract JSON from playwright output — handle escape issues
# playwright eval wraps result in quotes with \n etc
$jsonMatch = [regex]::Match($extractResult, '"(\{.*\})"', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($jsonMatch.Success) {
    $jsonStr = $jsonMatch.Groups[1].Value
    # Fix escapes: \" → ", \n → newline, \\ → \
    $jsonStr = $jsonStr -replace '\\\\', '%%BACKSLASH%%'
    $jsonStr = $jsonStr -replace '\\n', "`n"
    $jsonStr = $jsonStr -replace '\\t', "`t"
    $jsonStr = $jsonStr -replace '\\"', '"'
    $jsonStr = $jsonStr -replace '%%BACKSLASH%%', '\'
    try {
        $data = $jsonStr | ConvertFrom-Json
        $emailCount = $data.count
        $md = $data.md

        # Ensure output dir exists
        $outDir = Split-Path -Parent $OutputPath
        if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

        [System.IO.File]::WriteAllText($OutputPath, $md, [System.Text.UTF8Encoding]::new($false))
        $sizeKB = [math]::Round((Get-Item $OutputPath).Length / 1024, 1)

        $sw.Stop()
        $mode = if ($PreviewOnly) { "preview" } else { "full" }
        Write-Log "OWA DONE | $emailCount emails, ${sizeKB}KB, ${mode} mode, $($sw.ElapsedMilliseconds)ms total"
        Write-Host "STATUS=OK"
        Write-Host "EMAIL_COUNT=$emailCount"
        Write-Host "SIZE_KB=$sizeKB"
        Write-Host "DURATION_MS=$($sw.ElapsedMilliseconds)"
    } catch {
        Write-Log "OWA ERROR | JSON parse failed: $($_.Exception.Message)"
        # Fallback: write raw extract result
        [System.IO.File]::WriteAllText($OutputPath, $extractResult, [System.Text.UTF8Encoding]::new($false))
        Write-Host "STATUS=PARSE_ERROR"
        exit 1
    }
} else {
    Write-Log "OWA ERROR | No JSON in extract result"
    Write-Host "STATUS=EXTRACT_ERROR"
    Write-Host "RAW_LENGTH=$($extractResult.Length)"
    exit 1
}
