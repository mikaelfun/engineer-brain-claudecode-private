<#
.SYNOPSIS
    在当前打开的 Case 的 Timeline 中添加 Note。
.DESCRIPTION
    自动切换到 Summary 标签页，打开 Note 编辑器，填写标题和正文，保存。
    正文通过 keyboard.type() 输入（Rich Text Editor 不支持 fill/innerHTML）。
    保存后自动处理可能出现的 AI "Change status" 弹窗。
.PARAMETER Title
    笔记标题。
.PARAMETER Body
    笔记正文。换行会自动生成新段落。
.EXAMPLE
    pwsh scripts/add-note.ps1 -Title "Progress Update" -Body "Status: waiting for customer"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    [Parameter(Mandatory=$true)]
    [string]$Body,
    [Parameter(Mandatory=$false)]
    [string]$TicketNumber,
    [Parameter(Mandatory=$false)]
    [string]$OutputDir
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Adding Note: $Title"

# ── API Mode ──
$incidentId = Get-CurrentCaseId
if ($incidentId) {
    $bodyJson = @{
        subject = $Title
        notetext = $Body
        'objectid_incident@odata.bind' = "/incidents($incidentId)"
    } | ConvertTo-Json -Compress
    $result = Invoke-D365Api -Method POST -Endpoint "/api/data/v9.0/annotations" -Body $bodyJson
    if ($result -and ($result._status -eq 204 -or $result._entityId)) {
        Write-Host "✅ Note added: $Title"
        return
    }
    Write-Host "   (API failed, falling back to UI...)"
}

# ── UI Fallback ──
Write-Host "   → Switching to Summary tab..."
Ensure-CaseFormContext -Tab Summary

# Step 2: Click "Enter a note..."
Write-Host "   → Opening note editor..."
playwright-cli run-code "async page => { await page.getByRole('button', { name: 'Enter a note...' }).click(); }" 2>&1 | Out-Null
Start-Sleep -Seconds 3

# Step 3: Fill title
Write-Host "   → Filling title..."
$escapedTitle = $Title -replace "'", "\'" -replace '"', '\"'
playwright-cli run-code "async page => { await page.getByRole('textbox', { name: 'Create a Note title' }).fill('$escapedTitle'); }" 2>&1 | Out-Null
Start-Sleep -Seconds 1

# Step 4: Click into Rich Text Editor and type body
Write-Host "   → Typing note body..."
playwright-cli run-code "async page => { await page.getByRole('textbox', { name: 'Rich Text Editor Control' }).click(); }" 2>&1 | Out-Null
Start-Sleep -Seconds 1

# Type body content using keyboard (Rich Text Editor doesn't support fill/innerHTML)
# Normalize literal \n in body to real newlines (dfmworker sometimes passes \n as text)
$Body = $Body -replace '\\n', "`n"
$escapedBody = $Body -replace "'", "\'" -replace '"', '\"' -replace "`n", "\n" -replace "`r", ""
playwright-cli run-code "async page => { await page.keyboard.type('$escapedBody'); }" 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Step 5: Save
Write-Host "   → Saving note..."
playwright-cli run-code "async page => { await page.getByRole('button', { name: 'Add note and close' }).click(); }" 2>&1 | Out-Null
Start-Sleep -Seconds 3

# Step 6: Handle AI "Change status" popup if it appears
Write-Host "   → Checking for popups..."
playwright-cli run-code "async page => { try { const d = page.getByRole('dialog', { name: 'Change status for this case' }); await d.waitFor({ timeout: 5000 }); await d.getByRole('button', { name: 'Cancel' }).click(); return 'Popup dismissed'; } catch { return 'No popup'; } }" 2>&1 | Out-Null

Write-Host "✅ Note added: $Title"
