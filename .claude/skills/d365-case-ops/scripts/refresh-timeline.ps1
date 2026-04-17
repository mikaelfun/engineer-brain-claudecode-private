<#
.SYNOPSIS
    刷新当前 Case 的 Timeline。
.DESCRIPTION
    点击 Timeline 区域的 "Refresh timeline" 按钮，等待刷新完成。
    适合在执行操作后（如发邮件、删 Draft）刷新 Timeline 以查看最新状态。
.EXAMPLE
    pwsh scripts/refresh-timeline.ps1
#>
param()

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Refreshing timeline..."
Ensure-CaseFormContext -Tab Summary

$js = @"
async page => {
  const btn = page.getByRole('button', { name: 'Refresh timeline' });
  if (await btn.count() === 0) return 'ERR:Refresh timeline button not found';
  await btn.click();
  await page.waitForTimeout(3000);
  return 'OK';
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match '"OK"') {
    Write-Host "✅ Timeline refreshed."
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    exit 1
}
