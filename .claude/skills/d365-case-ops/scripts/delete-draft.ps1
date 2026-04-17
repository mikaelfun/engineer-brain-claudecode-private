<#
.SYNOPSIS
    删除当前打开的邮件草稿。
.DESCRIPTION
    在已打开的 Draft Email Tab 中删除当前邮件。
    严格验证当前页面必须是 Email 编辑器（检查 "Send Email" 按钮和 Draft 状态）。
    删除后自动回到 Case 页面。
    注意：必须在邮件编辑器 Tab 打开的状态下使用。
.EXAMPLE
    pwsh scripts/delete-draft.ps1
#>
param()

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Deleting current email draft..."

$js = @"
async page => {
  // Safety check 1: Must have Send Email button (proves we're on email editor, not Dashboard/Case)
  const sendBtn = page.getByRole('menuitem', { name: 'Send Email' });
  if (await sendBtn.count() === 0) return 'ERR:Not on an Email editor. Send Email button not found.';
  
  // Safety check 2: Must have Draft status (don't delete sent emails)
  const heading = page.getByRole('heading', { level: 1 }).first();
  const headingText = await heading.textContent().catch(() => '');
  const isDraft = headingText.includes('Draft') || headingText.includes('Unsaved');
  
  // Also check status text on the page
  const pageText = await page.locator('text=Draft').count();
  if (!isDraft && pageText === 0) return 'ERR:This email does not appear to be a Draft. Aborting.';
  
  // Read subject for confirmation
  const subjectBox = page.getByRole('textbox', { name: 'Subject' });
  const subject = await subjectBox.inputValue().catch(() => '(unknown)');
  
  // Click Delete
  const deleteBtn = page.getByRole('menuitem', { name: 'Delete' });
  if (await deleteBtn.count() === 0) return 'ERR:Delete button not found.';
  await deleteBtn.click();
  await page.waitForTimeout(2000);
  
  // Confirm deletion dialog
  const confirmBtn = page.getByRole('button', { name: 'Delete', exact: true });
  if (await confirmBtn.count() === 0) return 'ERR:Delete confirmation dialog did not appear.';
  await confirmBtn.click();
  
  // Wait for email tab to close
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    // After delete, should go back to Case (Send Email button gone)
    if (await sendBtn.count() === 0) {
      return 'OK:' + subject.substring(0, 100);
    }
  }
  return 'ERR:Email tab still open after delete.';
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match 'OK:(.+?)(?:"|\s*###)') {
    $subject = $Matches[1].Trim()
    Write-Host "✅ Draft deleted: $subject"
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output.Substring(0, [Math]::Min(300, $output.Length))
    exit 1
}
