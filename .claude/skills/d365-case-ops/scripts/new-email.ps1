<#
.SYNOPSIS
    在当前 Case 中创建一封邮件草稿。
.DESCRIPTION
    通过 "Create a timeline record" → "Email Activity" 打开邮件编辑器。
    To（客户）、Cc（CSAM等）、Subject（Case标题+TrackingID）由系统自动填充。
    填写邮件正文后保存为草稿（不直接发送），方便 review 后再手动点 Send。
    正文插入到签名之前。
.PARAMETER Body
    邮件正文内容。
.PARAMETER Subject
    可选，覆盖默认 Subject（默认为系统自动填充的 Case 标题 + TrackingID）。
.EXAMPLE
    pwsh scripts/new-email.ps1 -Body "Hi, please check the migration guide attached."
    pwsh scripts/new-email.ps1 -Body "Update: issue resolved." -Subject "Resolution - Case 123"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Body,
    [string]$Subject = ''
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"
$escapedSubject = $Subject -replace "'", "\'" -replace '"', '\"'

# Convert Body to Calibri 12pt HTML + escape for JS embedding
$bodyHtml = ConvertTo-EmailHtml -Text $Body
$escapedHtml = ConvertTo-JsString -Text $bodyHtml

Write-Host "🔵 Composing email draft..."
Ensure-CaseFormContext

# Step 1: Open Email Activity from Timeline
$jsOpen = @"
async page => {
  // Ensure Summary tab (use CSS selector — getByRole fails in D365 UCI)
  const summaryTab = page.locator('[role=tab][aria-label=Summary]');
  if (await summaryTab.count() > 0) {
    const sel = await summaryTab.getAttribute('aria-selected');
    if (sel !== 'true') { await summaryTab.click(); await page.waitForTimeout(2000); }
  }
  
  const createBtn = page.getByRole('button', { name: 'Create a timeline record.' });
  if (await createBtn.count() === 0) return 'ERR:Create timeline record button not found';
  await createBtn.click();
  await page.waitForTimeout(2000);
  
  const emailItem = page.getByRole('menuitem', { name: 'Email Activity' });
  if (await emailItem.count() === 0) return 'ERR:Email Activity menu item not found';
  await emailItem.click();
  
  // Wait for email form to load
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    const subjectBox = page.getByRole('textbox', { name: 'Subject' });
    if (await subjectBox.count() > 0) {
      await page.waitForTimeout(3000);
      return 'OK';
    }
  }
  return 'ERR:Email form did not load';
}
"@

$output1 = playwright-cli run-code $jsOpen 2>&1 | Out-String
if ($output1 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
}

# Step 2: Close Copilot card, inject HTML body via CKEditor API, override subject if needed, then Save
$jsCompose = @"
async page => {
  const editor = page.getByRole('textbox', { name: /Rich Text Editor/ });
  if (await editor.count() === 0) return 'ERR:Rich Text Editor not found';
  
  // Close "Draft with Copilot" card via its X button inside the editor
  const copilotCloseBtn = editor.locator('[id*=draftWithCopilot] button').first();
  if (await copilotCloseBtn.count() > 0) {
    await copilotCloseBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Override Subject if specified
  if ('$escapedSubject') {
    const subjectBox = page.getByRole('textbox', { name: 'Subject' });
    await subjectBox.click({ clickCount: 3 });
    await subjectBox.fill('$escapedSubject');
    await page.waitForTimeout(500);
  }
  
  // Click the body area (first div before signature) to position cursor
  const firstDiv = editor.locator('> div').first();
  await firstDiv.click();
  await page.waitForTimeout(500);
  
  // Inject formatted HTML via CKEditor API
  const result = await editor.evaluate((el, html) => {
    try {
      const ck = el.ckeditorInstance;
      const viewFragment = ck.data.processor.toView(html);
      const modelFragment = ck.data.toModel(viewFragment);
      ck.model.insertContent(modelFragment);
      return 'OK';
    } catch (e) {
      return 'ERR:CKEditor inject failed - ' + e.message;
    }
  }, '$escapedHtml');
  if (result !== 'OK') return result;
  await page.waitForTimeout(500);
  
  // Read To and Subject for confirmation
  const toList = page.getByRole('list', { name: 'To' });
  const toText = (await toList.textContent().catch(() => '')).trim().substring(0, 100);
  const subjectVal = await page.getByRole('textbox', { name: 'Subject' }).inputValue().catch(() => '');
  
  // Save as draft (not Send)
  const saveBtn = page.getByRole('menuitem', { name: 'Save (CTRL+S)' });
  if (await saveBtn.count() === 0) return 'ERR:Save button not found';
  await saveBtn.click();
  await page.waitForTimeout(5000);
  
  return 'OK:' + toText + '|||' + subjectVal.substring(0, 120);
}
"@

$output2 = playwright-cli run-code $jsCompose 2>&1 | Out-String

if ($output2 -match 'OK:(.+?)(?:"|\s*###)') {
    $parts = $Matches[1] -split '\|\|\|', 2
    $to = $parts[0].Trim()
    $subj = if ($parts.Length -gt 1) { $parts[1].Trim() } else { '—' }
    Write-Host "✅ Email draft saved (not sent yet — review and click Send manually)"
    Write-Host "   To: $to"
    Write-Host "   Subject: $subj"
} elseif ($output2 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output2.Substring(0, [Math]::Min(500, $output2.Length))
    exit 1
}
