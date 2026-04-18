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

# ── 3-4. 获取 DTM token ──
# playwright-cli run-code 在 DTM 登录页会挂死进程（@playwright/cli bug）。
# 用 Node.js + playwright-core 直接控制 Edge，稳定可靠。
Write-Host "🔑 Acquiring DTM Bearer Token..."

$profilePath = $script:D365BrowserProfile

$nodeScriptFile = Join-Path $env:TEMP "dtm-token-acquire.js"
$nodeScriptContent = @"
const path = require('path');
const pw = require(path.join(process.env.APPDATA, 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core'));
const PROFILE = path.join(process.env.TEMP || '/tmp', 'pw-dtm-token-profile');
const DTM_URL = '$dtmUrl';
// Clean stale profile locks (this profile is exclusively owned by this script)
function cleanStaleLock() {
  const fs = require('fs');
  for (const f of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
    const p = path.join(PROFILE, f);
    try { if (fs.existsSync(p)) { fs.unlinkSync(p); console.log('  cleaned stale ' + f); } } catch {}
  }
  const defaultLock = path.join(PROFILE, 'Default', 'lock');
  try { if (fs.existsSync(defaultLock)) { fs.unlinkSync(defaultLock); console.log('  cleaned Default/lock'); } } catch {}
}
(async () => {
  cleanStaleLock();
  const ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
  const page = ctx.pages()[0] || await ctx.newPage();
  let token = '';
  page.on('request', req => {
    if (req.url().includes('api.dtmnebula')) {
      const auth = req.headers()['authorization'];
      if (auth && auth.length > 100) token = auth;
    }
  });
  await page.goto(DTM_URL, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => {});
  await page.waitForTimeout(3000);
  if (page.url().includes('login.microsoftonline')) {
    const tiles = await page.locator('[data-test-id]').all();
    for (const t of tiles) {
      const txt = await t.textContent().catch(() => '');
      if (txt && txt.includes('@microsoft.com')) { await t.click(); break; }
    }
    try { await page.waitForURL('**/client.dtmnebula**', { timeout: 20000 }); } catch(e) {}
    for (let i = 0; i < 30 && !token; i++) await page.waitForTimeout(500);
  }
  if (!token) {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    for (let i = 0; i < 20 && !token; i++) await page.waitForTimeout(500);
  }
  await ctx.close();
  console.log(token ? 'DTM_TOKEN:' + token : 'DTM_TOKEN:NO_TOKEN');
})();
"@
Set-Content -Path $nodeScriptFile -Value $nodeScriptContent -Encoding UTF8

$nodeOutput = node $nodeScriptFile 2>&1 | Out-String
$token = $null
if ($nodeOutput -match 'DTM_TOKEN:(Bearer .+)') {
    $candidate = $Matches[1].Trim()
    if ($candidate -ne 'NO_TOKEN' -and $candidate.Length -gt 100) {
        $token = $candidate
    }
}

if (-not $token) {
    Write-Host "❌ Failed to acquire DTM token"
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

# ── 6. Done (Node.js 方案自己管理浏览器，无需导航回 D365) ──

$sw.Stop()
Write-Host "⏱️ warm-dtm-token: $([math]::Round($sw.Elapsed.TotalSeconds, 1))s"
