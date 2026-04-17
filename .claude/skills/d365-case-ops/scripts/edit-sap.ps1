<#
.SYNOPSIS
    修改当前 Case 的 Support Area Path (SAP)。
.DESCRIPTION
    点击 Command Bar 的 "Edit SAP" 打开 SAP 对话框，清除现有值，
    依次设置 Product Family、Product Name、Product Version（可选），然后 Submit。
    每个层级通过 Lookup 搜索按钮 + 键入关键词 + 从结果中选择来设置。
.PARAMETER Family
    Product Family，如 "Azure"、"Windows"、"Dynamics" 等。
.PARAMETER Name
    Product Name，如 "21Vianet Mooncake"、"PSS Other" 等。
.PARAMETER Version
    Product Version，可选。如 "21Vianet China Azure Cosmos DB" 等。
.EXAMPLE
    pwsh scripts/edit-sap.ps1 -Family "Windows" -Name "PSS Other"
    pwsh scripts/edit-sap.ps1 -Family "Azure" -Name "21Vianet Mooncake" -Version "21Vianet China Azure Cosmos DB"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Family,
    [Parameter(Mandatory=$true)]
    [string]$Name,
    [string]$Version = ''
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Editing SAP: $Family / $Name$(if ($Version) { ' / ' + $Version } else { '' })"
Ensure-CaseFormContext

# Step 1: Open Edit SAP dialog
$jsOpen = @"
async page => {
  const btn = page.getByRole('menuitem', { name: /Edit SAP/ });
  if (await btn.count() === 0) return 'ERR:Edit SAP button not found';
  await btn.click();
  const dialog = page.getByRole('dialog', { name: 'Support Area Path' });
  try { await dialog.waitFor({ timeout: 10000 }); } catch { return 'ERR:SAP dialog did not appear'; }
  return 'OK';
}
"@

$output1 = playwright-cli run-code $jsOpen 2>&1 | Out-String
if ($output1 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
}

# Step 2: Clear existing values (bottom-up) + set new values (top-down)
$escapedFamily = $Family -replace "'", "\'" -replace '"', '\"'
$escapedName = $Name -replace "'", "\'" -replace '"', '\"'
$escapedVersion = $Version -replace "'", "\'" -replace '"', '\"'

$jsEdit = @"
async page => {
  const dialog = page.getByRole('dialog', { name: 'Support Area Path' });
  
  // Helper: clear a lookup field by clicking all Delete buttons in its list
  async function clearField(listName) {
    const list = dialog.getByRole('list', { name: listName });
    const delBtns = await list.locator('..').getByRole('button', { name: /^Delete / }).all();
    for (const btn of delBtns) {
      await btn.click();
      await page.waitForTimeout(800);
    }
  }
  
  // Helper: set a lookup field by searching and selecting
  async function setField(fieldName, value) {
    const searchBtn = dialog.getByRole('button', { name: 'Search records for ' + fieldName + ', Lookup field' });
    await searchBtn.click();
    await page.waitForTimeout(1000);
    await page.keyboard.type(value);
    await page.waitForTimeout(2000);
    
    // Try 1: Find matching link in dropdown (D365 renders filtered results as links)
    const link = page.getByRole('link', { name: value, exact: true });
    if (await link.count() > 0) {
      await link.first().click();
      await page.waitForTimeout(2000);
      return 'OK';
    }
    
    // Try 2: Fall back to tree lookup results
    const tree = page.getByRole('tree', { name: 'Lookup results' });
    if (await tree.count() > 0) {
      const items = await tree.getByRole('treeitem').all();
      for (const item of items) {
        const text = (await item.textContent().catch(() => '')).trim();
        if (text.startsWith(value) || text === value) {
          await item.click();
          await page.waitForTimeout(2000);
          return 'OK';
        }
      }
      const found = [];
      for (const item of items) {
        found.push((await item.textContent().catch(() => '')).trim().substring(0, 50));
      }
      return 'NOT_FOUND:[' + found.slice(0, 5).join(', ') + ']';
    }
    return 'NO_RESULTS';
  }
  
  // Clear existing (bottom-up: Version → Name → Family)
  await clearField('Product Version');
  await clearField('Product Name');
  await clearField('Product Family');
  
  // Set new values (top-down)
  let result = await setField('Product Family', '$escapedFamily');
  if (result !== 'OK') return 'ERR:Product Family ' + result;
  
  result = await setField('Product Name', '$escapedName');
  if (result !== 'OK') return 'ERR:Product Name ' + result;
  
  if ('$escapedVersion') {
    result = await setField('Product Version', '$escapedVersion');
    if (result !== 'OK') return 'ERR:Product Version ' + result;
  }
  
  // Submit
  const submitBtn = dialog.getByRole('button', { name: 'Submit' });
  const disabled = await submitBtn.isDisabled().catch(() => true);
  if (disabled) return 'ERR:Submit button is disabled';
  await submitBtn.click();
  
  // Wait for dialog to close
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    if (await dialog.count() === 0 || !(await dialog.isVisible().catch(() => false))) {
      return 'OK';
    }
  }
  return 'ERR:Dialog still open after submit';
}
"@

$output2 = playwright-cli run-code $jsEdit 2>&1 | Out-String

if ($output2 -match '### Result\s+"OK"') {
    $sapPath = "$Family / $Name$(if ($Version) { ' / ' + $Version } else { '' })"
    Write-Host "✅ SAP changed to: $sapPath"
} elseif ($output2 -match 'ERR:(.+?)(?:"|\s*###)') {
    Write-Host "❌ $($Matches[1])"
    exit 1
} else {
    Write-Host "⚠️ Unexpected result."
    Write-Host $output2.Substring(0, [Math]::Min(500, $output2.Length))
    exit 1
}
