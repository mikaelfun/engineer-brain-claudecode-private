<#
.SYNOPSIS
    在当前 Case 的 Timeline 中添加 Phone Call 记录。
.DESCRIPTION
    通过 "Create a timeline record" → "Phone Call Activity" 打开 Quick Create 对话框，
    填写 Subject 和 Phone Number，然后 Save and Close。
    Direction 固定为 Outbound（Inbound 由系统自动记录，无需手动创建）。
    Call From（当前用户）和 Call To（Case 联系人）由系统自动填充。
    Phone Number 是必填字段，如联系人无预填号码则自动兜底。
.PARAMETER Subject
    通话主题。
.PARAMETER PhoneNumber
    电话号码，可选。如联系人已有预填号码则无需指定。
.PARAMETER Minutes
    通话时长（分钟），可选。不指定则不设置 Duration。
.EXAMPLE
    pwsh scripts/add-phone-call.ps1 -Subject "Discussed migration plan"
    pwsh scripts/add-phone-call.ps1 -Subject "Follow-up call" -Minutes 30
    pwsh scripts/add-phone-call.ps1 -Subject "Called customer" -PhoneNumber "+8613800138000"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Subject,
    [string]$PhoneNumber = '',
    [int]$Minutes = 0
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"
$escapedSubject = $Subject -replace "'", "\'" -replace '"', '\"'
$escapedPhone = $PhoneNumber -replace "'", "\'" -replace '"', '\"'

Write-Host "🔵 Adding Phone Call: $Subject"

# ── API Mode ──
$incidentId = Get-CurrentCaseId
if ($incidentId) {
    # Get contact ID and current user ID from case
    $caseData = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents($incidentId)?`$select=_primarycontactid_value,_ownerid_value"
    if ($caseData -and $caseData._primarycontactid_value) {
        $contactId = $caseData._primarycontactid_value
        $bodyObj = @{
            subject = $Subject
            directioncode = $true  # Outgoing
            statuscode = 1
            statecode = 0
            'regardingobjectid_incident_phonecall@odata.bind' = "/incidents($incidentId)"
            phonecall_activity_parties = @(
                @{ 'partyid_contact@odata.bind' = "/contacts($contactId)"; participationtypemask = 2 }  # To
            )
        }
        if ($PhoneNumber) { $bodyObj.phonenumber = $PhoneNumber }
        if ($Minutes -gt 0) { $bodyObj.actualdurationminutes = $Minutes }
        $bodyJson = $bodyObj | ConvertTo-Json -Compress -Depth 4
        $result = Invoke-D365Api -Method POST -Endpoint "/api/data/v9.0/phonecalls" -Body $bodyJson
        if ($result -and ($result._status -eq 204 -or $result._entityId)) {
            Write-Host "✅ Phone Call added: $Subject"
            Write-Host "   Duration: $(if ($Minutes -gt 0) { "$Minutes min" } else { 'no duration' })"
            return
        }
    }
    Write-Host "   (API failed, falling back to UI...)"
}

# ── UI Fallback ──
Ensure-CaseFormContext

# Step 1: Open Quick Create Phone Call dialog
$jsOpen = @"
async page => {
  // Ensure we're on Summary tab (where Timeline + Create button lives)
  const summaryTab = page.locator('[role=tab][aria-label=Summary]');
  if (await summaryTab.count() > 0) {
    const selected = await summaryTab.getAttribute('aria-selected');
    if (selected !== 'true') {
      await summaryTab.click();
      await page.waitForTimeout(2000);
    }
  }
  
  // Click "Create a timeline record"
  const createBtn = page.getByRole('button', { name: 'Create a timeline record.' });
  if (await createBtn.count() === 0) return 'ERR:Create timeline record button not found';
  await createBtn.click();
  await page.waitForTimeout(2000);
  
  // Click "Phone Call Activity"
  const phoneItem = page.getByRole('menuitem', { name: 'Phone Call Activity' });
  if (await phoneItem.count() === 0) return 'ERR:Phone Call Activity menu item not found';
  await phoneItem.click();
  
  // Wait for dialog
  const dialog = page.getByRole('dialog', { name: 'Quick Create: Phone Call' });
  try {
    await dialog.waitFor({ timeout: 10000 });
  } catch {
    return 'ERR:Phone Call dialog did not appear';
  }
  return 'OK';
}
"@

$output1 = playwright-cli run-code $jsOpen 2>&1 | Out-String
if ($output1 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
}

# Step 2: Fill form and save
$jsForm = @"
async page => {
  const dialog = page.getByRole('dialog', { name: 'Quick Create: Phone Call' });
  
  // Fill Subject
  await dialog.getByRole('textbox', { name: 'Subject' }).fill('$escapedSubject');
  await page.waitForTimeout(500);
  
  // Direction is always Outbound (default), no need to change
  
  // Set Phone Number if specified, or ensure it has a value
  const phoneInput = dialog.getByRole('textbox', { name: 'Phone Number' });
  const currentPhone = await phoneInput.inputValue().catch(() => '');
  if ('$escapedPhone') {
    await phoneInput.fill('$escapedPhone');
    await page.waitForTimeout(300);
  } else if (!currentPhone || currentPhone === '---' || currentPhone.trim() === '') {
    // No phone provided and field is empty — fill placeholder
    await phoneInput.fill('+000000');
    await page.waitForTimeout(300);
  }
  
  // Set Duration if specified
  if ($Minutes > 0) {
    const hours = Math.floor($Minutes / 60);
    const mins = $Minutes % 60;
    for (let i = 0; i < hours; i++) {
      await dialog.getByRole('button', { name: 'Increment Hours' }).click();
      await page.waitForTimeout(300);
    }
    if (mins > 0) {
      await dialog.getByRole('button', { name: 'Increment Minutes' }).click();
      await page.waitForTimeout(300);
      const container = dialog.getByRole('button', { name: 'Increment Minutes' }).locator('..');
      const input = container.locator('input');
      await input.click({ clickCount: 3 });
      await input.pressSequentially('${mins}');
      await page.waitForTimeout(300);
      // Fix hours if auto-set to 01
      if (hours === 0) {
        const hContainer = dialog.getByRole('button', { name: 'Increment Hours' }).locator('..');
        const hInput = hContainer.locator('input');
        const hVal = await hInput.inputValue().catch(() => '');
        if (hVal && hVal !== '' && hVal !== '00' && hVal !== '--') {
          await hInput.click({ clickCount: 3 });
          await hInput.pressSequentially('00');
        }
      }
    }
  }
  
  // Read Call To for confirmation
  const callToList = dialog.getByRole('list', { name: 'Call To' });
  const callTo = (await callToList.textContent().catch(() => '')).trim();
  
  // Save and Close
  await dialog.getByRole('button', { name: 'Save and Close' }).first().click();
  
  // Wait for dialog to close (poll up to 10 seconds)
  let closed = false;
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    if (await dialog.count() === 0 || !(await dialog.isVisible().catch(() => false))) {
      closed = true;
      break;
    }
  }
  
  if (!closed) {
    // Check for validation errors
    const status = await dialog.getByRole('status').all();
    for (const s of status) {
      const t = (await s.textContent().catch(() => '')).trim();
      if (t && t.length > 2) return 'ERR:' + t.substring(0, 200);
    }
    return 'ERR:Dialog still open after save';
  }
  
  return 'OK:' + callTo.substring(0, 100);
}
"@

$mins = $Minutes % 60
$jsForm = $jsForm -replace '\$\{mins\}', $mins

$output2 = playwright-cli run-code $jsForm 2>&1 | Out-String

if ($output2 -match 'OK:(.+?)(?:"|\s*###)') {
    $callTo = $Matches[1].Trim()
    $durStr = if ($Minutes -gt 0) { "$Minutes min" } else { "no duration" }
    Write-Host "✅ Phone Call added: $Subject"
    Write-Host "   Duration: $durStr | Call To: $callTo"
} elseif ($output2 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output2.Substring(0, [Math]::Min(300, $output2.Length))
    exit 1
}
