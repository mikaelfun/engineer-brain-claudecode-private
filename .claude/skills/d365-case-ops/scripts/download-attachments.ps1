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

# ── Unified terminal-event helper (closes every early-exit branch) ──
# Root cause: every `exit 0/1` below used to leave status="active", which the
# data-refresh aggregator (data-refresh.sh:220) maps to TIMEOUT → bogus DEGRADED.
# One problem in, one CATEGORY out: every exit from here on routes through this.
function Exit-WithEvent {
    param(
        [Parameter(Mandatory)][ValidateSet("completed","failed")][string]$Status,
        [int]$ExitCode = 0,
        [hashtable]$Delta = @{},
        [string]$ErrorMsg = ""
    )
    $endTs = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $durMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $script:EventStartMs
    $payload = @{
        status     = $Status
        startedAt  = $script:EventStartTs
        durationMs = $durMs
    }
    if ($Status -eq "completed") { $payload.completedAt = $endTs }
    if ($ErrorMsg)               { $payload.error       = $ErrorMsg }
    if ($Delta.Count -gt 0)      { $payload.delta       = $Delta }
    Write-AttachmentEvent $payload
    exit $ExitCode
}

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
        Exit-WithEvent -Status "failed" -ExitCode 1 -ErrorMsg "Case $TicketNumber not found"
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
        # NOT failed — absence of attachments is a valid outcome, most common case.
        Exit-WithEvent -Status "completed" -ExitCode 0 -Delta @{
            downloaded = 0; skipped = 0; total = 0; hasAttachments = $false
        }
    }
    $attachments = $result.value
}

Write-Host "📎 Found $($attachments.Count) attachment(s)."

# ── 3. 提取 workspace ID ──
$locationUrl = ($attachments | Where-Object { $_.msdfm_dtmlocationurl } | Select-Object -First 1).msdfm_dtmlocationurl
if (-not $locationUrl) {
    Write-Host "❌ No DTM location URL found."
    Exit-WithEvent -Status "failed" -ExitCode 1 -ErrorMsg "No DTM location URL in metadata"
}
if ($locationUrl -match 'workspaceid=([a-f0-9-]+)' -or $locationUrl -match '/workspaces/([a-f0-9-]+)') {
    $workspaceId = $Matches[1]
} else {
    Write-Host "❌ Cannot parse workspace ID from: $locationUrl"
    Exit-WithEvent -Status "failed" -ExitCode 1 -ErrorMsg "Cannot parse workspace ID"
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
        # 优先用 fetchedAt (ISO datetime)，兼容 daemon 和旧 warm-dtm-token.ps1
        if ($globalData.fetchedAt) {
            $globalAge = (Get-Date) - [datetime]$globalData.fetchedAt
        } else {
            $globalAge = (Get-Date) - (Get-Date "1970-01-01").AddSeconds($globalData.timestamp)
        }
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

# ── 4c. 兜底：懒加载调 warm-dtm-token.ps1（跨 case 复用，lock 保护）──
# 设计对齐 ICM getToken 模式：缓存miss → 自愈 warm → 回读全局缓存。
# 原本的 playwright-cli run-code 兜底有已知挂死 bug（见 warm-dtm-token.ps1:119），
# warm 脚本用 Node.js + playwright-core 稳定路径。
# Invoke-WithPlaywrightLock 防止多 case 同时 warm（ProfileKey=dtm 独立于 d365 主锁）。
if (-not $cachedToken) {
    Write-Host "⚠️ No valid cached token (global expired or missing), invoking warm-dtm-token.ps1..."
    $warmScript = Join-Path $PSScriptRoot "warm-dtm-token.ps1"
    Invoke-WithPlaywrightLock -ProfileKey "dtm" {
        & $warmScript -WorkspaceId $workspaceId
    }
    # 回读 warm 写的全局缓存（warm 脚本自己已处理超时/失败）
    if (Test-Path $globalCacheFile) {
        try {
            $g = Get-Content $globalCacheFile -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($g.token -and $g.token.Length -gt 100) {
                $cachedToken = $g.token
                Write-Host "✅ Token acquired via warm-dtm-token (length: $($cachedToken.Length))"
            }
        } catch { }
    }
    if (-not $cachedToken) {
        Write-Host "❌ warm-dtm-token failed to produce a valid token"
        Exit-WithEvent -Status "failed" -ExitCode 1 -ErrorMsg "warm-dtm-token failed to acquire DTM token"
    }
}
$token = $cachedToken
# warm-dtm-token 自己管浏览器生命周期，不需要 D365 导航回跳
$currentUrl = $null
# ── 5. 获取 DTM 文件列表（含下载 URL） ──
Write-Host "🔵 Fetching DTM file list..."
$headers = @{ "Authorization" = $token }
$metadataUrl = "https://api.dtmnebula.microsoft.com/api/v1/workspaces/$workspaceId/files/metadata"
try {
    $filesResp = Invoke-RestMethod -Uri $metadataUrl -Headers $headers -Method GET
} catch {
    Write-Host "❌ DTM API error: $_"
    Exit-WithEvent -Status "failed" -ExitCode 1 -ErrorMsg ("DTM API error: " + $_.Exception.Message)
}

if (-not $filesResp -or $filesResp.Count -eq 0) {
    Write-Host "ℹ️ DTM workspace has no files."
    Exit-WithEvent -Status "completed" -ExitCode 0 -Delta @{
        downloaded = 0; skipped = 0; total = 0; hasAttachments = $false
    }
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
