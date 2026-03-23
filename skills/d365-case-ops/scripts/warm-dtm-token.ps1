<#
.SYNOPSIS
    DTM Bearer Token 预热 — 单次 Playwright 导航获取跨 workspace 通用 token。
.DESCRIPTION
    通过 Playwright 导航到 DTM 网站截获 Authorization header，
    将 token 写入全局缓存文件供后续 download-attachments.ps1 直接使用，
    避免每个 case 独立获取 token 导致的 Playwright 串行瓶颈。

    DTM token 是 AAD token（aud=4e76891d），跨 workspace 通用，有效期 ~65 分钟。
    预热完成后导航回 D365 页面。

    模式参考: check-ir-status-batch.ps1（批量预热 → 缓存 → 后续自动跳过）

.PARAMETER WorkspaceId
    可选，DTM workspace ID。如不提供，自动扫描 casesRoot 下的 attachments-meta.json 获取。
.PARAMETER CasesRoot
    可选，case 数据根目录。默认从环境变量或 config.json 读取。
.EXAMPLE
    .\warm-dtm-token.ps1
    .\warm-dtm-token.ps1 -WorkspaceId "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
.OUTPUTS
    写入 $env:TEMP/d365-case-ops-runtime/dtm-token-global.json
    {
      "token": "Bearer eyJ...",
      "timestamp": "ISO8601"
    }
#>
param(
    [string]$WorkspaceId,

    [string]$CasesRoot = $(if ($env:D365_CASES_ROOT) { $env:D365_CASES_ROOT } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
    })
)

. "$PSScriptRoot\_init.ps1"

$sw = [System.Diagnostics.Stopwatch]::StartNew()

# ── 1. 确定 workspace ID ──
if (-not $WorkspaceId) {
    Write-Host "🔍 Scanning for DTM workspace ID in active cases..."
    $activeDir = Join-Path $CasesRoot "active"
    if (Test-Path $activeDir) {
        $metaFiles = Get-ChildItem -Path $activeDir -Recurse -Filter "attachments-meta.json" -ErrorAction SilentlyContinue
        foreach ($mf in $metaFiles) {
            try {
                $meta = Get-Content $mf.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
                if ($meta.attachments) {
                    $locUrl = ($meta.attachments | Where-Object { $_.msdfm_dtmlocationurl } | Select-Object -First 1).msdfm_dtmlocationurl
                    if ($locUrl -and ($locUrl -match 'workspaceid=([a-f0-9-]+)' -or $locUrl -match '/workspaces/([a-f0-9-]+)')) {
                        $WorkspaceId = $Matches[1]
                        Write-Host "  Found workspace ID from $($mf.Directory.Name): $WorkspaceId"
                        break
                    }
                }
            } catch { }
        }
    }
}

if (-not $WorkspaceId) {
    # Fallback: 从 D365 API 查询一个 DTM location URL 获取 workspace ID
    Write-Host "🔍 Querying D365 for a DTM workspace ID..."
    $fetch = @"
<fetch top="1">
  <entity name="msdfm_dtmattachmentmetadata">
    <attribute name="msdfm_dtmlocationurl"/>
    <filter>
      <condition attribute="msdfm_dtmlocationurl" operator="not-null"/>
    </filter>
    <order attribute="createdon" descending="true"/>
  </entity>
</fetch>
"@
    try {
        $r = Invoke-D365Api -Endpoint "/api/data/v9.0/msdfm_dtmattachmentmetadatas" -FetchXml $fetch
        if ($r.value -and $r.value[0].msdfm_dtmlocationurl) {
            $locUrl = $r.value[0].msdfm_dtmlocationurl
            if ($locUrl -match 'workspaceid=([a-f0-9-]+)' -or $locUrl -match '/workspaces/([a-f0-9-]+)') {
                $WorkspaceId = $Matches[1]
                Write-Host "  Found workspace ID from D365 API: $WorkspaceId"
            }
        }
    } catch {
        Write-Host "  ⚠️ D365 API query failed: $_"
    }
}

if (-not $WorkspaceId) {
    Write-Host "❌ No workspace ID found from local files or D365 API, cannot acquire DTM token"
    $sw.Stop()
    Write-Host "⏱️ warm-dtm-token: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s (FAILED)"
    exit 1
}
$dtmUrl = "https://client.dtmnebula.microsoft.com/?workspaceid=$WorkspaceId"

# ── 2. 检查现有全局缓存是否仍有效 ──
$tokenCacheDir = Join-Path $env:TEMP "d365-case-ops-runtime"
if (-not (Test-Path $tokenCacheDir)) { New-Item -Path $tokenCacheDir -ItemType Directory -Force | Out-Null }
$globalCacheFile = Join-Path $tokenCacheDir "dtm-token-global.json"

if (Test-Path $globalCacheFile) {
    try {
        $existing = Get-Content $globalCacheFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $cacheAge = (Get-Date) - [datetime]$existing.timestamp
        if ($cacheAge.TotalMinutes -lt 50 -and $existing.token.Length -gt 100) {
            Write-Host "✅ Global DTM token still valid (age: $([int]$cacheAge.TotalMinutes)m), skipping warm-up"
            $sw.Stop()
            Write-Host "⏱️ warm-dtm-token: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s (cached)"
            exit 0
        }
    } catch { }
}

# ── 3. 确保浏览器在 D365 页面（不在 DTM），记录当前 URL ──
Write-Host "🔑 Acquiring DTM Bearer Token via Playwright..."
$tabOutput = playwright-cli tab-list 2>&1
$currentLine = $tabOutput | Select-String "\(current\)" | Select-Object -First 1
$currentUrl = if ($currentLine) { ($currentLine.ToString() -replace '.*\]\(', '' -replace '\).*', '') } else { $null }

# 如果浏览器已经在 DTM 上，先导航回 D365（否则 goto DTM 不会触发新请求）
if ($currentUrl -and $currentUrl -match "dtmnebula") {
    Write-Host "  Browser already on DTM, navigating to D365 first..."
    playwright-cli run-code "async page => { await page.goto('https://onesupport.crm.dynamics.com/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}); }" 2>&1 | Out-Null
    Start-Sleep -Seconds 1
}

# ── 4. Playwright 导航 DTM + 截获 Authorization header ──
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
    await page.goto('$dtmUrl', {waitUntil: 'domcontentloaded', timeout: 30000});
    for (let i = 0; i < 16 && !token; i++) { await page.waitForTimeout(500); }
    page.off('request', handler);
    await page.evaluate(t => document.title = t, token || 'NO_TOKEN');
}
"@
$tokenResult = playwright-cli run-code ($tokenScript -replace "`r`n", " " -replace "`n", " ") 2>&1

# Token 提取：优先从 run-code 输出的 "Page Title:" 读取，fallback 到 tab-list
$token = $null

# 方法 1: Page Title: 行
$titleLine = $tokenResult | Select-String "Page Title:" | Select-Object -Last 1
if ($titleLine) {
    $candidate = ($titleLine.ToString() -replace ".*Page Title:\s*", "").Trim()
    if ($candidate -and $candidate -ne "NO_TOKEN" -and $candidate.Length -gt 100) {
        $token = $candidate
    }
}

# 方法 2: tab-list 中 [Bearer eyJ...](url) 格式
if (-not $token) {
    $tabOutput2 = playwright-cli tab-list 2>&1
    $tokenTab = $tabOutput2 | Select-String "Bearer eyJ" | Select-Object -First 1
    if ($tokenTab) {
        $line = $tokenTab.ToString()
        if ($line -match "\[([^\]]+)\]\(") {
            $candidate = $Matches[1]
            if ($candidate.Length -gt 100) {
                $token = $candidate
            }
        }
    }
}

if (-not $token) {
    Write-Host "❌ Failed to acquire DTM token via Playwright"
    $sw.Stop()
    Write-Host "⏱️ warm-dtm-token: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s (FAILED)"
    exit 1
}

# ── 5. 写入全局缓存 ──
$cacheData = @{
    token     = $token
    timestamp = (Get-Date -Format "o")
}
$cacheData | ConvertTo-Json | Set-Content $globalCacheFile -Encoding UTF8
Write-Host "✅ Global DTM token cached (length: $($token.Length))"
Write-Host "📁 Cache: $globalCacheFile"

# ── 6. 导航回 D365 ──
Write-Host "🔄 Switching back to D365..."
if ($currentUrl -and $currentUrl -match "onesupport") {
    playwright-cli run-code "async page => { await page.goto('$currentUrl', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}); }" 2>&1 | Out-Null
} else {
    playwright-cli run-code "async page => { await page.goto('https://onesupport.crm.dynamics.com/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}); }" 2>&1 | Out-Null
}

$sw.Stop()
Write-Host "⏱️ warm-dtm-token: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s"
