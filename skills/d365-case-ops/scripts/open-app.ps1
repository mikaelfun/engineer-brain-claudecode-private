<#
.SYNOPSIS
    启动浏览器并进入 D365 Copilot Service workspace。
.DESCRIPTION
    用 Edge + persistent profile 打开 D365，自动设置 1920x1080 视口，进入 Copilot Service workspace 应用，处理常见弹窗。
    默认无头模式运行，依赖 persistent profile 中的登录态。
    如果 Cookie 过期导致脚本失败，需先用有头模式让用户完成一次登录：
      playwright-cli open https://onesupport.crm.dynamics.com/ --headed --browser=msedge --persistent
    登录完成后关闭浏览器（playwright-cli close），再重新运行本脚本即可。
.EXAMPLE
    pwsh scripts/open-app.ps1
    pwsh scripts/open-app.ps1 -Url "https://onesupport.crm.dynamics.com/"
#>
param(
    [string]$Url = "https://onesupport.crm.dynamics.com/"
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

# --- Pre-check: is browser already on D365? ---
$currentUrl = $null
try {
    $urlRaw = playwright-cli run-code "async page => { return page.url(); }" 2>&1 | Out-String
    if ($urlRaw -match '### Result\s+"([^"]+)"') {
        $currentUrl = $Matches[1]
    }
} catch {}

if ($currentUrl -and $currentUrl -match 'onesupport\.crm\.dynamics\.com') {
    Write-Host "✅ Browser already on D365: $currentUrl"
    # Just ensure viewport
    playwright-cli run-code "async page => { await page.setViewportSize({ width: 1920, height: 1080 }); }" 2>&1 | Out-Null
    exit 0
}

if ($currentUrl -and $currentUrl -ne 'about:blank') {
    Write-Host "🔵 Browser open but not on D365 (at: $currentUrl). Navigating..."
    playwright-cli run-code "async page => { await page.goto('$Url', { waitUntil: 'domcontentloaded', timeout: 30000 }); }" 2>&1 | Out-Null
    Start-Sleep -Seconds 3
} else {
    Write-Host "🔵 Opening D365: $Url"
    playwright-cli open $Url --browser=msedge --persistent 2>&1 | Out-Null
    Start-Sleep -Seconds 5
}

# Ensure viewport is large enough for D365 UCI layout (prevents OneVoice panel overlap)
playwright-cli run-code "async page => { await page.setViewportSize({ width: 1920, height: 1080 }); }" 2>&1 | Out-Null

# Check if we're on the app landing page or already in workspace
$pageCheck = Invoke-PlaywrightCode -Code "async page => { const frame = page.frameLocator('#AppLandingPage'); const count = await frame.locator('text=Copilot Service workspace').count().catch(() => 0); return String(count); }"

if ($pageCheck -and [int]$pageCheck -gt 0) {
    Write-Host "🔵 Entering Copilot Service workspace..."
    playwright-cli run-code "async page => { const frame = page.frameLocator('#AppLandingPage'); await frame.locator('text=Copilot Service workspace').first().click(); }" 2>&1 | Out-Null
    Start-Sleep -Seconds 8
} else {
    Write-Host "🔵 Already in workspace or no landing page detected."
}

# Dismiss known popups (combined into single call)
Write-Host "🔵 Handling popups..."
playwright-cli run-code "async page => { try { await page.getByRole('button', { name: 'Dismiss' }).click({ timeout: 800 }); } catch {} try { await page.locator('button', { hasText: 'Close' }).first().click({ timeout: 800 }); } catch {} }" 2>&1 | Out-Null

Write-Host "✅ D365 Copilot Service workspace ready."
