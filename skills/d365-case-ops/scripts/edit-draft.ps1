<#
.SYNOPSIS
    编辑当前打开的邮件草稿正文。
.DESCRIPTION
    在已打开的 Draft Email Tab 中修改正文内容。
    支持两种模式：追加（默认）或替换。
    通过 CKEditor API 注入带格式的 HTML（Calibri 12pt），确保与签名格式一致。
    修改后自动保存（Save），不发送。
    注意：必须在邮件编辑器 Tab 打开的状态下使用（通常在 new-email.ps1 之后）。
.PARAMETER Body
    要追加或替换的正文文字。支持多行（换行自动分段）。
.PARAMETER Replace
    如果指定，替换整个正文（签名保留）。不指定则追加到正文末尾。
.EXAMPLE
    pwsh scripts/edit-draft.ps1 -Body "Additional info: the issue was caused by network timeout."
    pwsh scripts/edit-draft.ps1 -Body "Completely new content here." -Replace
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Body,
    [switch]$Replace
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"
$mode = if ($Replace) { 'replace' } else { 'append' }

# Convert Body to Calibri 12pt HTML + escape for JS embedding (no trailing blank — JS adds it before signature)
$bodyHtml = ConvertTo-EmailHtml -Text $Body -NoTrailingBlank
$escapedHtml = ConvertTo-JsString -Text $bodyHtml

Write-Host "🔵 Editing draft ($mode): $(if ($Body.Length -gt 60) { $Body.Substring(0,60) + '...' } else { $Body })"

$js = @"
async page => {
  const editor = page.getByRole('textbox', { name: /Rich Text Editor/ });
  if (await editor.count() === 0) return 'ERR:Rich Text Editor not found - make sure the Draft Email tab is open';
  
  if ('$mode' === 'replace') {
    const result = await editor.evaluate((el, html) => {
      try {
        const ck = el.ckeditorInstance;
        const currentData = ck.getData();
        // Find signature by id="signature" and its parent div
        const sigIndex = currentData.indexOf('id="signature"');
        if (sigIndex === -1) {
          // No signature, just set new body
          ck.setData(html);
          return 'OK';
        }
        // Find the parent <div style="direction:ltr;"> that wraps the signature
        const beforeSig = currentData.substring(0, sigIndex);
        const parentDivStart = beforeSig.lastIndexOf('<div');
        // Go one more level up to get the outer wrapper div
        const outerStart = currentData.substring(0, parentDivStart).lastIndexOf('<div');
        const signature = currentData.substring(outerStart);
        ck.setData(html + '<p style="margin:0in;">&nbsp;</p>' + signature);
        return 'OK';
      } catch (e) {
        return 'ERR:' + e.message;
      }
    }, '$escapedHtml');
    if (!result.startsWith('OK')) return result;
    
  } else {
    const result = await editor.evaluate((el, html) => {
      try {
        const ck = el.ckeditorInstance;
        const currentData = ck.getData();
        const sigIndex = currentData.indexOf('id="signature"');
        if (sigIndex === -1) {
          // No signature, just append
          ck.setData(currentData + html);
          return 'OK';
        }
        const beforeSig = currentData.substring(0, sigIndex);
        const parentDivStart = beforeSig.lastIndexOf('<div');
        const outerStart = currentData.substring(0, parentDivStart).lastIndexOf('<div');
        const bodyPart = currentData.substring(0, outerStart);
        const sigPart = currentData.substring(outerStart);
        ck.setData(bodyPart + html + '<p style="margin:0in;">&nbsp;</p>' + sigPart);
        return 'OK';
      } catch (e) {
        return 'ERR:' + e.message;
      }
    }, '$escapedHtml');
    if (!result.startsWith('OK')) return result;
  }
  
  await page.waitForTimeout(500);
  
  // Save
  const saveBtn = page.getByRole('menuitem', { name: 'Save (CTRL+S)' });
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }
  
  // Read final body for confirmation
  const finalText = (await editor.innerText().catch(() => '')).split('Best Regards')[0].trim();
  return 'OK:' + finalText.substring(0, 200);
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match 'OK:(.+?)(?:"|\s*###)') {
    $preview = $Matches[1].Trim()
    Write-Host "✅ Draft updated and saved"
    Write-Host "   Body preview: $preview"
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output.Substring(0, [Math]::Min(500, $output.Length))
    exit 1
}
