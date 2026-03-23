<#
.SYNOPSIS
    从 PowerBI "Mooncake CC Finder" 抓取所有 Account 的 CC 邮件列表，缓存到本地。
.PARAMETER Force
    强制重新抓取（忽略缓存）。
.PARAMETER OutputDir
    输出目录，默认 workspace/data/
.EXAMPLE
    pwsh scripts/fetch-powerbi-cc.ps1
    pwsh scripts/fetch-powerbi-cc.ps1 -Force
#>
param(
    [switch]$Force,
    [string]$OutputDir = "$PSScriptRoot\..\data"
)

$ErrorActionPreference = "Stop"
$url = "https://msit.powerbi.com/groups/me/reports/d9f581ef-f263-4808-96af-bfa16856ca8b/ReportSection?experience=power-bi"
$outputFile = Join-Path $OutputDir "mooncake-cc.json"

# ── 检查缓存 ──
if (-not $Force -and (Test-Path $outputFile)) {
    $cache = Get-Content $outputFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $age = (Get-Date) - [datetime]$cache.fetchedAt
    Write-Host "✅ Cache exists (age: $([int]$age.TotalDays)d, $($cache.accounts.Count) accounts). Use -Force to refresh."
    Get-Content $outputFile -Raw
    exit 0
}

if (-not (Test-Path $OutputDir)) {
    New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null
}

Write-Host "🔵 Opening PowerBI CC Finder..."
Write-Host "   (This will take 2-3 minutes to iterate all accounts)"

# 读取 JS 文件，去掉注释和 module.exports，直接作为 run-code 内容
$js = Get-Content "$PSScriptRoot\fetch-powerbi-cc.js" -Raw -Encoding UTF8
$js = $js -replace '(?s)/\*.*?\*/', ''
$js = ($js -replace 'module\.exports\s*=\s*', '').Trim().TrimEnd(';').Trim()

$resultRaw = playwright-cli run-code $js 2>&1

# 读取结果 title
$titleLine = ($resultRaw | Select-String "RESULT:") | Select-Object -Last 1
if (-not $titleLine) {
    Write-Host "❌ No RESULT in output. Last lines:"
    $resultRaw | Select-Object -Last 15 | ForEach-Object { Write-Host "  $_" }
    exit 1
}
$encoded = ($titleLine -replace ".*RESULT:", "").Trim()

# 导航回 D365
playwright-cli run-code "async page => { await page.goto('https://onesupport.crm.dynamics.com/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}); }" 2>&1 | Out-Null

# Base64 decode
try {
    $jsonBytes = [System.Convert]::FromBase64String($encoded)
    $jsonStr = [System.Text.Encoding]::UTF8.GetString($jsonBytes)
    $accounts = $jsonStr | ConvertFrom-Json
} catch {
    Write-Host "❌ Failed to decode result: $_"
    Write-Host "Raw encoded (first 200): $($encoded.Substring(0, [Math]::Min(200, $encoded.Length)))"
    exit 1
}

Write-Host "✅ Got $($accounts.Count) accounts"
foreach ($a in $accounts) {
    $status = if ($a.cc) { "✅" } else { "⚠️  $($a.error)" }
    Write-Host "  $status $($a.account)"
}

# ── 保存缓存 ──
$output = [PSCustomObject]@{
    fetchedAt = (Get-Date -Format "o")
    reportUrl = $url
    accounts  = $accounts
}

$output | ConvertTo-Json -Depth 5 | Set-Content $outputFile -Encoding UTF8
Write-Host ""
Write-Host "✅ Saved → $outputFile"
Write-Host "   Success: $(($accounts | Where-Object { $_.cc }).Count) | No CC: $(($accounts | Where-Object { -not $_.cc }).Count)"
Get-Content $outputFile -Raw
