<#
.SYNOPSIS
    从 Timeline 中回复一封邮件，保存为草稿。
.DESCRIPTION
    在当前 Case 的 Timeline 中找到指定邮件，点击 Reply All 链接进入回复编辑器。
    用 CKEditor API 注入格式化正文（Calibri 12pt），保存为草稿。
    不需要先 open-email，Reply All 直接在 Timeline 条目上操作。
    默认回复最新的一封邮件，可通过 -Index 指定。
.PARAMETER Body
    回复正文内容。支持多行（换行自动分段）。
.PARAMETER Index
    回复第几封邮件（从 1 开始，按时间倒序）。默认 1（最新的）。
.EXAMPLE
    pwsh scripts/reply-email.ps1 -Body "Hi, thanks for your update."
    pwsh scripts/reply-email.ps1 -Body "Please see attached." -Index 2
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Body,
    [int]$Index = 1
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

# Convert Body to Calibri 12pt HTML + escape for JS embedding (no trailing blank — JS adds it before signature)
$bodyHtml = ConvertTo-EmailHtml -Text $Body -NoTrailingBlank
$escapedHtml = ConvertTo-JsString -Text $bodyHtml

Write-Host "🔵 Replying to email #$Index..."
Ensure-CaseFormContext

# Step 1: Find email in Timeline, hover to reveal Reply All, click it
$jsReply = @"
async page => {
  // Ensure Summary tab
  const summaryTab = page.locator('[role=tab][aria-label=Summary]');
  if (await summaryTab.count() > 0) {
    const sel = await summaryTab.getAttribute('aria-selected');
    if (sel !== 'true') { await summaryTab.click(); await page.waitForTimeout(2000); }
  }
  
  // Find email items in Timeline
  const items = await page.getByRole('listitem').all();
  const emailItems = [];
  for (const item of items) {
    const name = await item.getAttribute('aria-label').catch(() => '') || '';
    const text = (await item.textContent().catch(() => '')).trim();
    if (name.includes('Email') || text.includes('Email')) {
      emailItems.push(item);
    }
  }
  
  if (emailItems.length === 0) return 'ERR:No email found in Timeline';
  if ($Index < 1 || $Index > emailItems.length) return 'ERR:Index $Index out of range (found ' + emailItems.length + ' emails)';
  
  const target = emailItems[$Index - 1];
  
  // Hover to reveal Reply All link
  await target.hover();
  await page.waitForTimeout(1000);
  
  const replyLink = target.getByRole('link', { name: 'Reply All' });
  if (await replyLink.count() === 0) return 'ERR:Reply All link not found on this email. It may be a Draft or system notification.';
  await replyLink.click();
  
  // Wait for reply editor to load (check for Rich Text Editor)
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    const editor = page.getByRole('textbox', { name: /Rich Text Editor/ });
    if (await editor.count() > 0) {
      await page.waitForTimeout(3000);
      return 'OK';
    }
  }
  return 'ERR:Reply editor did not load';
}
"@

$output1 = playwright-cli run-code $jsReply 2>&1 | Out-String
if ($output1 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
}

# Step 2: Close Copilot card, inject body via CKEditor setData, Save
$jsCompose = @"
async page => {
  const editor = page.getByRole('textbox', { name: /Rich Text Editor/ });
  if (await editor.count() === 0) return 'ERR:Rich Text Editor not found';
  
  // Close Draft with Copilot card
  const copilotCloseBtn = editor.locator('[id*=draftWithCopilot] button').first();
  if (await copilotCloseBtn.count() > 0) {
    await copilotCloseBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Inject body before signature using setData (same approach as edit-draft)
  const result = await editor.evaluate((el, html) => {
    try {
      const ck = el.ckeditorInstance;
      const currentData = ck.getData();
      const sigIndex = currentData.indexOf('id="signature"');
      if (sigIndex === -1) {
        // No signature, insert at beginning
        ck.setData(html + currentData);
        return 'OK';
      }
      // Find the <p> or empty area before signature (the body placeholder)
      const beforeSig = currentData.substring(0, sigIndex);
      // Find the last <p before signature (the empty body paragraph)
      const lastPBeforeSig = beforeSig.lastIndexOf('<p ');
      if (lastPBeforeSig === -1) {
        // No body paragraph, insert before signature's parent div
        const parentDivStart = beforeSig.lastIndexOf('<div');
        const outerStart = currentData.substring(0, parentDivStart).lastIndexOf('<div');
        const before = currentData.substring(0, outerStart > 0 ? outerStart : parentDivStart);
        const after = currentData.substring(outerStart > 0 ? outerStart : parentDivStart);
        ck.setData(before + html + '<p style="margin:0in;">&nbsp;</p>' + after);
      } else {
        // Replace the empty body paragraph with our content
        const before = currentData.substring(0, lastPBeforeSig);
        // Find end of this <p> tag
        const pEndIndex = currentData.indexOf('</p>', lastPBeforeSig);
        const after = currentData.substring(pEndIndex + 4);
        ck.setData(before + html + '<p style="margin:0in;">&nbsp;</p>' + after);
      }
      return 'OK';
    } catch (e) {
      return 'ERR:' + e.message;
    }
  }, '$escapedHtml');
  if (result !== 'OK') return result;
  await page.waitForTimeout(500);
  
  // Read To and Subject for confirmation
  const toList = page.getByRole('list', { name: 'To' });
  const toText = (await toList.textContent().catch(() => '')).trim().substring(0, 100);
  const subjectVal = await page.getByRole('textbox', { name: 'Subject' }).inputValue().catch(() => '');
  
  // Save as draft
  const saveBtn = page.getByRole('menuitem', { name: 'Save (CTRL+S)' });
  if (await saveBtn.count() === 0) {
    // Try button version
    const saveBtnAlt = page.getByRole('button', { name: 'Save' });
    if (await saveBtnAlt.count() > 0) {
      await saveBtnAlt.click();
    } else {
      return 'ERR:Save button not found';
    }
  } else {
    await saveBtn.click();
  }
  await page.waitForTimeout(5000);
  
  return 'OK:' + toText + '|||' + subjectVal.substring(0, 120);
}
"@

$output2 = playwright-cli run-code $jsCompose 2>&1 | Out-String

if ($output2 -match 'OK:(.+?)(?:"|\s*###)') {
    $parts = $Matches[1] -split '\|\|\|', 2
    $to = $parts[0].Trim()
    $subj = if ($parts.Length -gt 1) { $parts[1].Trim() } else { '—' }
    Write-Host "✅ Reply draft saved (not sent yet — review and click Send manually)"
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
