<#
.SYNOPSIS
    在当前打开的 Case 上记录 Labor 工时。
.DESCRIPTION
    自动导航到 Labor 标签页，创建新 Labor 记录，填写时长和分类。
    Duration 控件使用 Increment/Decrement 按钮（不能直接输入）。
    如果使用 -UseSessionTime，则使用 D365 Connector 自动计时的值。
.PARAMETER Minutes
    工时分钟数。与 -UseSessionTime 互斥。
.PARAMETER UseSessionTime
    使用 D365 session 自动计时的值，不手动设置 Duration。
.PARAMETER Classification
    分类，默认 Troubleshooting。
.PARAMETER Description
    描述，默认 "See case notes"。
.EXAMPLE
    pwsh scripts/record-labor.ps1 -Minutes 30
    pwsh scripts/record-labor.ps1 -UseSessionTime
    pwsh scripts/record-labor.ps1 -Minutes 90 -Description "Migration support"
#>
param(
    [int]$Minutes = 0,
    [switch]$UseSessionTime,
    [string]$Classification = "Troubleshooting",
    [string]$Description = "See case notes"
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

if (-not $UseSessionTime -and $Minutes -eq 0) {
    Write-Host "❌ Please specify -Minutes <N> or -UseSessionTime"
    exit 1
}

$hours = [math]::Floor($Minutes / 60)
$mins = $Minutes % 60

if ($UseSessionTime) {
    Write-Host "🔵 Recording Labor: using session time ($Classification)"
} else {
    Write-Host "🔵 Recording Labor: ${hours}h ${mins}m ($Classification)"
}

# ── API Mode (only for manual minutes, not session time) ──
if (-not $UseSessionTime) {
    $incidentId = Get-CurrentCaseId
    if ($incidentId) {
        $classValue = 337818  # Troubleshooting (default)
        $dateStr = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddT00:00:00.000Z')
        $bodyJson = @{
            msdfm_classification = $classValue
            msdfm_date = $dateStr
            msdfm_description = $Description
            msdfm_duration = $Minutes
            msdfm_durationpicker = $Minutes
            statuscode = 1
            statecode = 0
            'msdfm_CaseId@odata.bind' = "/incidents($incidentId)"
        } | ConvertTo-Json -Compress
        $result = Invoke-D365Api -Method POST -Endpoint "/api/data/v9.0/msdfm_labors" -Body $bodyJson
        if ($result -and ($result._status -eq 204 -or $result._entityId)) {
            Write-Host "✅ Labor recorded: $Minutes minutes ($Classification) - $Description"
            return
        }
        Write-Host "   (API failed, falling back to UI...)"
    }
}

# ── UI Fallback ──
Write-Host "   → Opening Labor tab..."
Ensure-CaseFormContext
$jsOpenLabor = @"
async page => {
  // Click Related tab (was "More Tabs" in older D365 layouts)
  const relatedTab = page.locator('[role=tab][aria-label="Related"]');
  const moreTab = page.locator('[role=tab][aria-label="More Tabs"]');
  if (await relatedTab.count() > 0) {
    await relatedTab.click();
  } else if (await moreTab.count() > 0) {
    await moreTab.click();
  } else {
    return 'ERR:Neither Related nor More Tabs found';
  }
  await page.waitForTimeout(1500);
  
  const laborItem = page.locator('[role=menuitem][aria-label=Labor]');
  if (await laborItem.count() === 0) return 'ERR:Labor menu item not found';
  await laborItem.click();
  await page.waitForTimeout(3000);
  return 'OK';
}
"@
$r1 = Invoke-PlaywrightCode -Code $jsOpenLabor
if ($r1 -ne 'OK') { Write-Host "❌ $r1"; exit 1 }

# Step 2: Click New Labor and verify form loaded
Write-Host "   → Creating new Labor record..."
$jsNewLabor = @"
async page => {
  const btn = page.getByRole('menuitem', { name: /New Labor/ });
  if (await btn.count() === 0) return 'ERR:New Labor button not found';
  await btn.click();
  
  // Wait for Labor form to load (look for Increment Hours button as indicator)
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    const incHrs = page.getByRole('button', { name: 'Increment Hours' });
    if (await incHrs.count() > 0) return 'OK';
  }
  return 'ERR:Labor form did not load (Increment Hours not found)';
}
"@
$r2 = Invoke-PlaywrightCode -Code $jsNewLabor
if ($r2 -ne 'OK') { Write-Host "❌ $r2"; exit 1 }

# Step 3: Set Duration (skip if using session time - D365 auto-fills from session timer)
if (-not $UseSessionTime) {
    Write-Host "   → Setting duration: ${hours}h ${mins}m..."
    $minsStr = $mins.ToString()
    $hoursStr = $hours.ToString().PadLeft(2, '0')

    $jsDuration = @"
async page => {
  const incHrs = page.getByRole('button', { name: 'Increment Hours' });
  const incMin = page.getByRole('button', { name: 'Increment Minutes' });
  
  // Set minutes first (clicking Increment Minutes may auto-set Hours to 01)
  if ($mins > 0) {
    await incMin.click();
    await page.waitForTimeout(500);
    const minInput = incMin.locator('..').locator('input');
    await minInput.click({clickCount: 3});
    await minInput.pressSequentially('$minsStr');
    await page.waitForTimeout(500);
  }
  
  // Set hours
  const hrsInput = incHrs.locator('..').locator('input');
  if ($hours === 0) {
    // Increment once to activate, then set to 00
    await incHrs.click();
    await page.waitForTimeout(300);
    await hrsInput.click({clickCount: 3});
    await hrsInput.pressSequentially('00');
  } else {
    await incHrs.click();
    await page.waitForTimeout(300);
    await hrsInput.click({clickCount: 3});
    await hrsInput.pressSequentially('$hoursStr');
  }
  await page.waitForTimeout(500);
  return 'OK';
}
"@
    $r3 = Invoke-PlaywrightCode -Code $jsDuration
    if ($r3 -ne 'OK') { Write-Host "❌ Duration setting failed: $r3"; exit 1 }
} else {
    Write-Host "   → Using session time (D365 auto-filled duration)..."
}

# Step 3b: Set Classification (if not default Troubleshooting)
if ($Classification -ne "Troubleshooting") {
    Write-Host "   → Setting classification: $Classification..."
    $escapedClass = $Classification -replace "'", "\'" -replace '"', '\"'
    $jsClass = "async page => { const combo = page.getByRole('combobox', { name: 'Classification' }); await combo.click(); await page.waitForTimeout(500); await page.getByRole('option', { name: '$escapedClass' }).click(); return 'OK'; }"
    $r3b = Invoke-PlaywrightCode -Code $jsClass
    if ($r3b -ne 'OK') { Write-Host "⚠️ Classification setting may have failed" }
}

# Step 3c: Fill Description
Write-Host "   → Setting description..."
$escapedDesc = $Description -replace "'", "\'" -replace '"', '\"'
$jsDesc = "async page => { const tb = page.getByRole('textbox', { name: 'Description' }); if (await tb.count() === 0) return 'ERR:Description field not found'; await tb.fill('$escapedDesc'); return 'OK'; }"
$r3c = Invoke-PlaywrightCode -Code $jsDesc
if ($r3c -ne 'OK') { Write-Host "⚠️ Description setting may have failed: $r3c" }

# Step 4: Click Save & Close and verify
Write-Host "   → Saving..."
$jsSave = @"
async page => {
  const saveBtn = page.getByRole('menuitem', { name: 'Save & Close' });
  if (await saveBtn.count() === 0) return 'ERR:Save & Close button not found';
  await saveBtn.click();
  
  // Verify: wait for Labor form to close (Increment Hours disappears)
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    const incHrs = page.getByRole('button', { name: 'Increment Hours' });
    if (await incHrs.count() === 0) return 'OK';
  }
  return 'ERR:Labor form still open after save';
}
"@
$r4 = Invoke-PlaywrightCode -Code $jsSave
if ($r4 -ne 'OK') { Write-Host "❌ Save failed: $r4"; exit 1 }

if ($UseSessionTime) {
    Write-Host "✅ Labor recorded: session time ($Classification) - $Description"
} else {
    Write-Host "✅ Labor recorded: $Minutes minutes ($Classification) - $Description"
}
