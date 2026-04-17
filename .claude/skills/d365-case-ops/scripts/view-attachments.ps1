<#
.SYNOPSIS
    查看当前 Case 的附件数量。
.DESCRIPTION
    从 Attachments Tab 名称中读取附件数量。
    注意：Attachments Tab 使用 DTM (Data Transfer and Management) 系统，
    打开后可能弹出 "Create workspace" 对话框。本脚本仅读取附件计数，不打开 Tab。
    如需查看/管理附件内容，请手动点击 Attachments Tab。
.EXAMPLE
    pwsh scripts/view-attachments.ps1
#>
param()

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Checking attachments..."

# ── API Mode ──
$incidentId = Get-CurrentCaseId
if ($incidentId) {
    $fetchXml = "<fetch aggregate=`"true`"><entity name=`"msdfm_dtmattachmentmetadata`"><attribute name=`"msdfm_dtmattachmentmetadataid`" aggregate=`"count`" alias=`"count`"/><filter><condition attribute=`"msdfm_caseid`" operator=`"eq`" value=`"$incidentId`"/></filter></entity></fetch>"
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/msdfm_dtmattachmentmetadatas" -FetchXml $fetchXml
    if ($result -and $result.value) {
        $count = $result.value[0].count
        if ($count -eq 0) {
            Write-Host "📎 No attachments on this Case."
        } else {
            Write-Host "📎 Attachments: $count file(s)"
            Write-Host "   (Open Attachments tab manually to view/download files via DTM)"
        }
        return
    }
}

# ── UI Fallback ──
Write-Host "   (API unavailable, falling back to UI...)"
Ensure-CaseFormContext

$js = @"
async page => {
  // Read attachment count from tab name (e.g. "Attachments (3)")
  const tabs = await page.locator('[role=tab]').all();
  for (const tab of tabs) {
    let name = (await tab.textContent().catch(() => '')).trim();
    // Deduplicate D365 double text
    const half = Math.floor(name.length / 2);
    if (half > 0 && name.substring(0, half) === name.substring(half)) name = name.substring(0, half);
    
    const match = name.match(/Attachments\s*\((\d+)\)/);
    if (match) {
      return 'OK:' + match[1];
    }
  }
  return 'ERR:Attachments tab not found';
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

if ($output -match 'OK:(\d+)') {
    $count = $Matches[1]
    if ($count -eq '0') {
        Write-Host "📎 No attachments on this Case."
    } else {
        Write-Host "📎 Attachments: $count file(s)"
        Write-Host "   (Open Attachments tab manually to view/download files via DTM)"
    }
} elseif ($output -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    exit 1
}
