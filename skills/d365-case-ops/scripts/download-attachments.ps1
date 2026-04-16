<#
.SYNOPSIS
    下载 Case 的 DTM 附件到本地。
.DESCRIPTION
    通过 D365 OData API 获取附件元数据和 workspace ID，
    然后通过 DTM API 下载实际文件。
    需要浏览器已打开（open-app）以获取 DTM Bearer Token。
.PARAMETER TicketNumber
    Case 编号
.PARAMETER OutputDir
    输出根目录，默认 $env:D365_CASES_ROOT\active
.PARAMETER Force
    强制重新下载（即使本地已有同名文件）
.EXAMPLE
    .\download-attachments.ps1 -TicketNumber "2603060030001353"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$TicketNumber,

    [string]$OutputDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),

    [switch]$Force,

    # Optional: when set, write atomic events/attachments.json (active/progress/completed/failed)
    # for the casework-v2 Step 1 observability pipeline. Safe to omit.
    [string]$EventDir = ""
)

. "$PSScriptRoot\_init.ps1"

# ── Event helpers (no-op if -EventDir not supplied) ──
$script:EventStartTs = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$script:EventStartMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

function Write-AttachmentEvent {
    param([hashtable]$Payload)
    if (-not $EventDir) { return }
    try {
        if (-not (Test-Path $EventDir)) {
            New-Item -Path $EventDir -ItemType Directory -Force | Out-Null
        }
        $Payload["task"] = "attachments"
        $json = $Payload | ConvertTo-Json -Compress -Depth 5
        $final = Join-Path $EventDir "attachments.json"
        $tmp = "$final.tmp.$PID.$((Get-Random))"
        Set-Content -Path $tmp -Value $json -Encoding UTF8 -NoNewline
        Move-Item -Path $tmp -Destination $final -Force
    } catch {
        # event emission must never break the real work
    }
}

Write-AttachmentEvent @{ status = "active"; startedAt = $script:EventStartTs }

# ── 1-2. 获取附件元数据（优先读 snapshot 缓存，否则走 D365 OData） ──
$metaCacheFile = Join-Path $OutputDir "$TicketNumber\attachments-meta.json"
$attachments = $null

if (Test-Path $metaCacheFile) {
    try {
        $cached = Get-Content $metaCacheFile -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($cached.attachments -and $cached.attachments.Count -gt 0) {
            $attachments = $cached.attachments
            Write-Host "⚡ Using cached metadata from attachments-meta.json ($($attachments.Count) item(s), fetched $($cached.fetchedAt))"
        }
    } catch {
        Write-Host "⚠️ Failed to parse attachments-meta.json, falling back to D365 OData"
    }
}

if (-not $attachments) {
    # Fallback: query D365 directly (original path)
    $incidentId = Get-IncidentId -TicketNumber $TicketNumber
    if (-not $incidentId) {
        Write-Host "❌ Case $TicketNumber not found."
        exit 1
    }

    Write-Host "🔵 Fetching DTM attachment metadata from D365..."
    $fetch = @"
<fetch count="100">
  <entity name="msdfm_dtmattachmentmetadata">
    <attribute name="msdfm_filename"/>
    <attribute name="msdfm_filesize"/>
    <attribute name="msdfm_dtmfilepath"/>
    <attribute name="msdfm_dtmlocationurl"/>
    <attribute name="msdfm_dtmattachmentstatus"/>
    <attribute name="createdon"/>
    <filter>
      <condition attribute="msdfm_caseid" operator="eq" value="$incidentId"/>
    </filter>
    <order attribute="createdon" descending="true"/>
  </entity>
</fetch>
"@
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/msdfm_dtmattachmentmetadatas" -FetchXml $fetch
    if (-not $result -or $result._status -ne 200 -or -not $result.value -or $result.value.Count -eq 0) {
        Write-Host "ℹ️ No DTM attachments found for Case $TicketNumber."
        exit 0
    }
    $attachments = $result.value
}

Write-Host "📎 Found $($attachments.Count) attachment(s)."

# ── 3. 提取 workspace ID ──
$locationUrl = ($attachments | Where-Object { $_.msdfm_dtmlocationurl } | Select-Object -First 1).msdfm_dtmlocationurl
if (-not $locationUrl) {
    Write-Host "❌ No DTM location URL found."
    exit 1
}
if ($locationUrl -match 'workspaceid=([a-f0-9-]+)' -or $locationUrl -match '/workspaces/([a-f0-9-]+)') {
    $workspaceId = $Matches[1]
} else {
    Write-Host "❌ Cannot parse workspace ID from: $locationUrl"
    exit 1
}
Write-Host "?? Workspace ID: $workspaceId"

# 🔐 4. 获取 DTM Bearer Token (缓存有效期50分钟内跳过) 🔐
Write-Host "🔑 Acquiring DTM Bearer Token..."

$tokenCacheDir = Join-Path $env:TEMP "d365-case-ops-runtime"
if (-not (Test-Path $tokenCacheDir)) { New-Item -Path $tokenCacheDir -ItemType Directory -Force | Out-Null }

# ── 4a. 优先读取全局预热 token（warm-dtm-token.ps1 写入，跨 workspace 通用） ──
$cachedToken = $null
$globalCacheFile = Join-Path $tokenCacheDir "dtm-token-global.json"
if (Test-Path $globalCacheFile) {
    try {
        $globalData = Get-Content $globalCacheFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $globalAge = (Get-Date) - [datetime]$globalData.timestamp
        if ($globalAge.TotalMinutes -lt 50 -and $globalData.token.Length -gt 100) {
            $cachedToken = $globalData.token
            Write-Host "⚡ Using global pre-warmed token (age: $([int]$globalAge.TotalMinutes)m)"
        }
    } catch { }
}

# ── 4b. 其次读取 per-workspace 缓存 ──
$tokenCacheFile = Join-Path $tokenCacheDir "dtm-token-$workspaceId.json"
if (-not $cachedToken -and (Test-Path $tokenCacheFile)) {
    try {
        $cacheData = Get-Content $tokenCacheFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $cacheAge = (Get-Date) - [datetime]$cacheData.timestamp
        if ($cacheAge.TotalMinutes -lt 50 -and $cacheData.token.Length -gt 100) {
            $cachedToken = $cacheData.token
            Write-Host "✅ Using cached token (age: $([int]$cacheAge.TotalMinutes)m)"
        }
    } catch { }
}

# ── 4c. 兜底：Playwright 导航截获 token ──
if (-not $cachedToken) {
    $currentUrl = (playwright-cli tab-list 2>&1 | Select-String "\(current\)") -replace '.*\]\(', '' -replace '\).*', ''

    $tokenScript = @"
async (page) => {
    let token = '';
    const handler = req => {
        if (req.url().includes('api.dtmnebula')) {
            const auth = req.headers()['authorization'];
            if (auth && auth.length > 100) token = auth;
        }
    };
    page.on('request', handler);
    await page.goto('https://client.dtmnebula.microsoft.com/?workspaceid=$workspaceId', {waitUntil: 'domcontentloaded', timeout: 30000});
    for (let i = 0; i < 16 && !token; i++) { await page.waitForTimeout(500); }
    page.off('request', handler);
    await page.evaluate(t => document.title = t, token || 'NO_TOKEN');
}
"@
    $tokenResult = playwright-cli run-code ($tokenScript -replace "`r`n", " " -replace "`n", " ") 2>&1
    $tokenLine = ($tokenResult | Select-String "Page Title:" | Select-Object -Last 1).ToString()
    $token = ($tokenLine -replace ".*Page Title:\s*", "").Trim()

    if (-not $token -or $token -eq "NO_TOKEN" -or $token.Length -lt 100) {
        Write-Host "❌ Failed to acquire DTM token."
        exit 1
    }
    Write-Host "✅ Token acquired via Playwright (length: $($token.Length)), caching..."
    @{ token = $token; timestamp = (Get-Date -Format "o") } | ConvertTo-Json | Set-Content $tokenCacheFile -Encoding UTF8
} else {
    $token = $cachedToken
    $currentUrl = $null
}
# ── 5. 获取 DTM 文件列表（含下载 URL） ──
Write-Host "🔵 Fetching DTM file list..."
$headers = @{ "Authorization" = $token }
$metadataUrl = "https://api.dtmnebula.microsoft.com/api/v1/workspaces/$workspaceId/files/metadata"
try {
    $filesResp = Invoke-RestMethod -Uri $metadataUrl -Headers $headers -Method GET
} catch {
    Write-Host "❌ DTM API error: $_"
    exit 1
}

if (-not $filesResp -or $filesResp.Count -eq 0) {
    Write-Host "ℹ️ DTM workspace has no files."
    exit 0
}

# ── 6. 下载文件（并行 + 重试） ──
$attachDir = Join-Path $OutputDir "$TicketNumber\attachments"
if (-not (Test-Path $attachDir)) {
    New-Item -Path $attachDir -ItemType Directory -Force | Out-Null
}

# 分离需要下载的文件 vs 跳过的文件
$toDownload = [System.Collections.Generic.List[object]]::new()
$skipped = 0
foreach ($file in $filesResp) {
    $fileName = $file.friendlyName
    if (-not $fileName) { $fileName = $file.fileName }
    $destPath = Join-Path $attachDir $fileName

    if ((Test-Path $destPath) -and -not $Force) {
        $localSize = (Get-Item $destPath).Length
        if ($localSize -eq $file.fileSizeInBytes) {
            Write-Host "  ⏭️ $fileName (already exists, same size)"
            $skipped++
            continue
        }
    }

    if (-not $file.filePathUri) {
        Write-Host "  ⚠️ $($fileName) — no download URL, skipped"
        $skipped++
        continue
    }

    $toDownload.Add([PSCustomObject]@{
        FileName    = $fileName
        DestPath    = $destPath
        DownloadUrl = $file.filePathUri
        FileSize    = $file.fileSizeInBytes
    })
}

Write-Host "⬇️ Downloading $($toDownload.Count) file(s) in parallel (skip $skipped already cached)..."

# 并行下载，每个文件最多重试 2 次，间隔 10s
$jobs = $toDownload | ForEach-Object {
    $f = $_
    $capturedToken = $token
    Start-Job -ScriptBlock {
        param($f, $capturedToken)
        $headers = @{ "Authorization" = $capturedToken }
        $maxRetry = 2
        $attempt = 0
        $success = $false
        $lastError = ""
        while ($attempt -le $maxRetry -and -not $success) {
            try {
                Invoke-WebRequest -Uri $f.DownloadUrl -Headers $headers -OutFile $f.DestPath -ErrorAction Stop
                $actualSize = (Get-Item $f.DestPath).Length
                $success = $true
                return [PSCustomObject]@{ Status = "ok"; FileName = $f.FileName; Size = $actualSize; Attempts = $attempt + 1 }
            } catch {
                $lastError = $_.Exception.Message
                $attempt++
                if ($attempt -le $maxRetry) { Start-Sleep -Seconds 10 }
            }
        }
        return [PSCustomObject]@{ Status = "fail"; FileName = $f.FileName; Error = $lastError; Attempts = $attempt }
    } -ArgumentList $f, $capturedToken
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job -Force

$totalForProgress = $toDownload.Count
$doneForProgress = 0
$downloaded = 0
$failed = 0
foreach ($r in $results) {
    if ($r.Status -eq "ok") {
        $retryNote = if ($r.Attempts -gt 1) { " (retry $($r.Attempts - 1)x)" } else { "" }
        Write-Host "  ✅ $($r.FileName) — $($r.Size) bytes$retryNote"
        $downloaded++
    } else {
        Write-Host "  ❌ $($r.FileName) — failed after $($r.Attempts) attempt(s): $($r.Error)"
        $failed++
    }
    $doneForProgress++
    Write-AttachmentEvent @{
        status    = "active"
        startedAt = $script:EventStartTs
        progress  = @{ done = $doneForProgress; total = $totalForProgress }
    }
}

# ── 7. 导航回 D365（仅当通过 Playwright 获取 token 时需要） ──
# 使用全局/缓存 token 时无需导航，currentUrl 为 null
if ($currentUrl) {
    Write-Host "🔄 Switching back to D365..."
    if ($currentUrl -match "onesupport") {
        playwright-cli run-code "async page => { await page.goto('$currentUrl', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}); }" 2>&1 | Out-Null
    } else {
        playwright-cli run-code "async page => { await page.goto('https://onesupport.crm.dynamics.com/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}); }" 2>&1 | Out-Null
    }
}
# ── 8. Summary ──
Write-Host ""
Write-Host "📋 Summary: $downloaded downloaded, $skipped skipped, $failed failed (of $($filesResp.Count) total)"
Write-Host "📁 Location: $attachDir"

# ── 9. Final event (casework-v2 Step 1) ──
$endTs = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$durMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $script:EventStartMs
if ($failed -eq 0) {
    Write-AttachmentEvent @{
        status       = "completed"
        startedAt    = $script:EventStartTs
        completedAt  = $endTs
        durationMs   = $durMs
        delta        = @{ downloaded = $downloaded; skipped = $skipped; total = $filesResp.Count }
    }
} else {
    Write-AttachmentEvent @{
        status      = "failed"
        startedAt   = $script:EventStartTs
        durationMs  = $durMs
        error       = "$failed file(s) failed"
        delta       = @{ downloaded = $downloaded; skipped = $skipped; failed = $failed; total = $filesResp.Count }
    }
}
