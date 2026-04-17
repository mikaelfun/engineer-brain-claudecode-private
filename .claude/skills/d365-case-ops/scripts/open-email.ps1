<#
.SYNOPSIS
    从 Timeline 中打开一封邮件。
.DESCRIPTION
    在当前 Case 的 Timeline 中找到指定邮件并通过 Open Record 链接打开。
    打开后进入邮件查看/编辑页面，可以继续用 reply-email.ps1 回复。
    默认打开最新的一封邮件，可通过 -Index 指定，或通过 -Filter 过滤。
.PARAMETER Index
    打开第几封邮件（从 1 开始，按时间倒序）。默认 1（最新的）。
.PARAMETER Filter
    过滤关键词，只匹配包含此文字的邮件（如 "Received"、"Draft"、"support@"、发件人名等）。
.EXAMPLE
    pwsh scripts/open-email.ps1                          # 打开最新的邮件
    pwsh scripts/open-email.ps1 -Index 2                 # 打开第二封
    pwsh scripts/open-email.ps1 -Filter "Received"       # 打开最新的 Received Email
#>
param(
    [int]$Index = 1,
    [string]$Filter = ''
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"
$escapedFilter = $Filter -replace "'", "\'" -replace '"', '\"'

Write-Host "🔵 Opening email$(if ($Filter) { ' (filter: ' + $Filter + ')' } else { '' }) #$Index from Timeline..."
Ensure-CaseFormContext

$js = @"
async page => {
  // Ensure Summary tab (use CSS selector)
  const summaryTab = page.locator('[role=tab][aria-label=Summary]');
  if (await summaryTab.count() > 0) {
    const sel = await summaryTab.getAttribute('aria-selected');
    if (sel !== 'true') {
      await summaryTab.click();
      await page.waitForTimeout(2000);
    }
  }
  
  // Find all Email items in Timeline
  const items = await page.getByRole('listitem').all();
  const emailItems = [];
  for (const item of items) {
    const name = await item.getAttribute('aria-label').catch(() => '') || '';
    const text = (await item.textContent().catch(() => '')).trim();
    if (!name.includes('Email') && !text.includes('Email')) continue;
    
    // Apply filter
    if ('$escapedFilter' && !text.includes('$escapedFilter') && !name.includes('$escapedFilter')) continue;
    
    emailItems.push({ item, name, text: text.substring(0, 80) });
  }
  
  if (emailItems.length === 0) return 'ERR:No email found in Timeline' + ('$escapedFilter' ? ' matching filter: $escapedFilter' : '');
  if ($Index < 1 || $Index > emailItems.length) return 'ERR:Index $Index out of range (found ' + emailItems.length + ' emails)';
  
  const target = emailItems[$Index - 1];
  
  // Hover to reveal Open Record link
  await target.item.hover();
  await page.waitForTimeout(1000);
  
  const openLink = target.item.getByRole('link', { name: 'Open Record' });
  if (await openLink.count() === 0) return 'ERR:Open Record link not found on email item';
  await openLink.click();
  
  // Wait for email page to load (check for Reply or Send button)
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    const reply = page.getByRole('menuitem', { name: /Reply/ });
    const send = page.getByRole('menuitem', { name: 'Send Email' });
    if (await reply.count() > 0 || await send.count() > 0) {
      const subject = await page.getByRole('textbox', { name: 'Subject' }).inputValue().catch(() => '');
      return 'OK:' + subject.substring(0, 120);
    }
  }
  return 'ERR:Email page did not load';
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match 'OK:(.+?)(?:"|\s*###)') {
    $subject = $Matches[1].Trim()
    Write-Host "✅ Email opened: $subject"
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output.Substring(0, [Math]::Min(300, $output.Length))
    exit 1
}
