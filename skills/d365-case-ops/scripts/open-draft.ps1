<#
.SYNOPSIS
    从 Timeline 中打开一封 Draft Email。
.DESCRIPTION
    在当前 Case 的 Timeline 中找到 Draft Email 并通过 Open Record 链接打开它。
    打开后进入 Email 编辑器 Tab，可以继续用 edit-draft.ps1 编辑或 delete-draft.ps1 删除。
    如果有多封 Draft，默认打开最新的一封，也可通过 -Index 指定。
.PARAMETER Index
    打开第几封 Draft（从 1 开始，按时间倒序）。默认 1（最新的）。
.EXAMPLE
    pwsh scripts/open-draft.ps1             # 打开最新的 Draft
    pwsh scripts/open-draft.ps1 -Index 2    # 打开第二封 Draft
#>
param(
    [int]$Index = 1
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Opening Draft Email #$Index from Timeline..."
Ensure-CaseFormContext

$js = @"
async page => {
  // Ensure Summary tab for Timeline access (use CSS selector)
  const summaryTab = page.locator('[role=tab][aria-label=Summary]');
  if (await summaryTab.count() > 0) {
    const sel = await summaryTab.getAttribute('aria-selected');
    if (sel !== 'true') {
      await summaryTab.click();
      await page.waitForTimeout(2000);
    }
  }
  
  // Find all Draft Email items in Timeline
  const items = await page.getByRole('listitem').all();
  const draftItems = [];
  for (const item of items) {
    const text = (await item.textContent().catch(() => '')).trim();
    if (text.includes('Draft Email') || (text.includes('Draft') && text.includes('Email'))) {
      draftItems.push(item);
    }
  }
  
  if (draftItems.length === 0) return 'ERR:No Draft Email found in Timeline';
  if ($Index < 1 || $Index > draftItems.length) return 'ERR:Index $Index out of range (found ' + draftItems.length + ' drafts)';
  
  const target = draftItems[$Index - 1];
  
  // Hover to reveal Open Record link
  await target.hover();
  await page.waitForTimeout(1000);
  
  const openLink = target.getByRole('link', { name: 'Open Record' });
  if (await openLink.count() === 0) return 'ERR:Open Record link not found on Draft item';
  await openLink.click();
  
  // Wait for Email editor to load (check for Send Email button)
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    const sendBtn = page.getByRole('menuitem', { name: 'Send Email' });
    if (await sendBtn.count() > 0) {
      // Read subject for confirmation
      const subjectBox = page.getByRole('textbox', { name: 'Subject' });
      const subject = await subjectBox.inputValue().catch(() => '(loading...)');
      return 'OK:' + subject.substring(0, 120);
    }
  }
  return 'ERR:Email editor did not load after opening Draft';
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match 'OK:(.+?)(?:"|\s*###)') {
    $subject = $Matches[1].Trim()
    Write-Host "✅ Draft Email opened: $subject"
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output.Substring(0, [Math]::Min(300, $output.Length))
    exit 1
}
