<#
.SYNOPSIS
    请求 Case 的 Support data access。
.DESCRIPTION
    在当前打开的 Case 上点击 "Request case access"，在弹出的对话框中选择 Request Reason 并提交。
    Case Number、Requestor、Access Duration 由系统自动填充。
.PARAMETER Reason
    访问原因。可选值：
      Swarming          — Swarming - collaboration
      Backup            — Acting as backup
      TechRouter        — Tech router case handling
      Escalation        — Working on an escalation
      CaseReview        — Case review（默认值）
      RootCause         — Root cause analysis
      IcM               — IcM Stakeholder
      Other             — Other
.EXAMPLE
    pwsh scripts/request-access.ps1
    pwsh scripts/request-access.ps1 -Reason CaseReview
    pwsh scripts/request-access.ps1 -Reason Swarming
#>
param(
    [ValidateSet('Swarming','Backup','TechRouter','Escalation','CaseReview','RootCause','IcM','Other')]
    [string]$Reason = 'CaseReview'
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

# Map short names to actual dropdown text
$reasonMap = @{
    'Swarming'    = 'Swarming - collaboration'
    'Backup'      = 'Acting as backup'
    'TechRouter'  = 'Tech router case handling'
    'Escalation'  = 'Working on an escalation'
    'CaseReview'  = 'Case review'
    'RootCause'   = 'Root cause analysis'
    'IcM'         = 'IcM Stakeholder'
    'Other'       = 'Other'
}
$reasonText = $reasonMap[$Reason]
$escapedReason = $reasonText -replace "'", "\'"

Write-Host "🔵 Requesting case access (Reason: $reasonText)..."
Ensure-CaseFormContext

$js = @"
async page => {
  // Step 1: Click "Request case access" in command bar
  const menuItem = page.getByRole('menuitem', { name: 'Request case access' });
  if (await menuItem.count() === 0) return 'ERR:Request case access button not found';
  await menuItem.click();
  
  // Step 2: Wait for dialog
  const dialog = page.getByRole('dialog', { name: 'Support data access request' });
  try {
    await dialog.waitFor({ timeout: 10000 });
  } catch {
    return 'ERR:Dialog did not appear';
  }
  
  // Step 3: Read pre-filled info
  const caseNum = await dialog.getByRole('textbox', { name: 'Case Number' }).inputValue().catch(() => '?');
  const duration = await dialog.getByRole('textbox', { name: 'Access Duration' }).inputValue().catch(() => '?');
  
  // Step 4: Select Request Reason
  const reasonCombo = dialog.getByRole('combobox', { name: 'Request Reason' });
  await reasonCombo.click();
  await page.waitForTimeout(500);
  const option = page.getByRole('option', { name: '$escapedReason' });
  if (await option.count() === 0) {
    await page.keyboard.press('Escape');
    return 'ERR:Reason option not found: $escapedReason';
  }
  await option.click();
  await page.waitForTimeout(500);
  
  // Step 5: Submit
  await dialog.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(3000);
  
  // Step 6: Check if dialog closed (success) or still open (error)
  if (await dialog.count() > 0) {
    // Check for error messages
    const alerts = await dialog.getByRole('alert').all();
    for (const a of alerts) {
      const t = (await a.textContent().catch(() => '')).trim();
      if (t) return 'ERR:Submit failed - ' + t.substring(0, 200);
    }
    return 'ERR:Dialog still open after submit';
  }
  
  return 'OK:' + caseNum + '|||' + duration + '|||$escapedReason';
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match 'OK:(.+?)(?:"|\s*###)') {
    $parts = $Matches[1] -split '\|\|\|'
    $num = $parts[0]
    $dur = if ($parts.Length -gt 1) { $parts[1] } else { '?' }
    $rsn = if ($parts.Length -gt 2) { $parts[2] } else { '?' }
    Write-Host "✅ Access requested for Case $num"
    Write-Host "   Duration: $dur | Reason: $rsn"
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output.Substring(0, [Math]::Min(300, $output.Length))
    exit 1
}
