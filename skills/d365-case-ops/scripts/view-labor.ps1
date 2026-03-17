<#
.SYNOPSIS
    查看当前 Case 的 Labor 记录列表。
.DESCRIPTION
    导航到 Labor 标签页，读取 Labor 表格数据并输出。
.PARAMETER Count
    返回的最大条目数，默认 10。
.EXAMPLE
    pwsh scripts/view-labor.ps1
    pwsh scripts/view-labor.ps1 -Count 5
#>
param(
    [int]$Count = 10
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Reading Labor records (max $Count)..."

# ── API Mode ──
$incidentId = Get-CurrentCaseId
if ($incidentId) {
    $fetchXml = "<fetch count=`"$Count`"><entity name=`"msdfm_labor`"><attribute name=`"msdfm_laborid`"/><attribute name=`"msdfm_classification`"/><attribute name=`"msdfm_date`"/><attribute name=`"msdfm_duration`"/><attribute name=`"msdfm_description`"/><attribute name=`"createdon`"/><order attribute=`"createdon`" descending=`"true`"/><filter><condition attribute=`"msdfm_caseid`" operator=`"eq`" value=`"$incidentId`"/></filter></entity></fetch>"
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/msdfm_labors" -FetchXml $fetchXml
    if ($result) {
        if (-not $result.value -or $result.value.Count -eq 0) {
            Write-Host "📋 No labor records found."
            return
        }
        Write-Host ""
        Write-Host "📋 Labor Records ($($result.value.Count) entries):"
        Write-Host "─────────────────────────────────────"
        foreach ($entry in $result.value) {
            $dur = $entry.msdfm_duration
            $durText = if ($dur -ge 60) { "$([math]::Floor($dur/60)) hour(s) $($dur % 60) min" } else { "$dur minute(s)" }
            $dateText = if ($entry.msdfm_date) { ([datetime]$entry.msdfm_date).ToString('M/d/yyyy') } else { '' }
            $classText = $entry.'msdfm_classification@OData.Community.Display.V1.FormattedValue'
            if (-not $classText) { $classText = 'Troubleshooting' }
            Write-Host "⏱️  $durText  |  $dateText  |  $classText"
            if ($entry.msdfm_description) { Write-Host "   $($entry.msdfm_description)" }
            Write-Host ""
        }
        return
    }
}

# ── UI Fallback ──
Write-Host "   (API unavailable, falling back to UI...)"
Ensure-CaseFormContext
$jsOpenLabor = @"
async page => {
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
$r = Invoke-PlaywrightCode -Code $jsOpenLabor
if ($r -ne 'OK') { Write-Host "❌ $r"; exit 1 }

# Step 2: Extract labor table data
$js = @"
async page => {
  await page.waitForTimeout(2000);
  const rows = await page.getByRole('row').all();
  const results = [];
  let count = 0;
  
  for (const row of rows) {
    if (count >= $Count) break;
    const cells = await row.getByRole('gridcell').all();
    if (cells.length < 4) continue;
    
    // Skip header-like rows (check if first cell has checkbox)
    const hasCheckbox = await cells[0].getByRole('checkbox').count().catch(() => 0);
    if (!hasCheckbox) continue;
    
    const classification = (await cells[1].textContent().catch(() => '')).trim();
    const description = (await cells[2].textContent().catch(() => '')).trim();
    const date = (await cells[3].textContent().catch(() => '')).trim();
    const duration = (await cells[4].textContent().catch(() => '')).trim();
    
    if (!classification && !duration) continue;
    
    // D365 gridcells have nested elements that duplicate text, take first half
    const dedup = (s) => { const half = Math.floor(s.length / 2); return s.substring(0, half) === s.substring(half) ? s.substring(0, half) : s; };
    
    results.push({
      classification: dedup(classification),
      description: dedup(description),
      date: dedup(date),
      duration: dedup(duration)
    });
    count++;
  }
  
  return JSON.stringify(results);
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

# Parse and display
try {
    if ($output -match '### Result\s+"(\[.*?\])"') {
        $jsonStr = $Matches[1] -replace '\\n', "`n" -replace '\\"', '"'
        if ($jsonStr -eq '[]') {
            Write-Host "📋 No labor records found."
            return
        }
        $entries = $jsonStr | ConvertFrom-Json
        Write-Host ""
        Write-Host "📋 Labor Records ($($entries.Count) entries):"
        Write-Host "─────────────────────────────────────"
        foreach ($entry in $entries) {
            Write-Host "⏱️  $($entry.duration)  |  $($entry.date)  |  $($entry.classification)"
            if ($entry.description) { Write-Host "   $($entry.description)" }
            Write-Host ""
        }
    } else {
        Write-Host "⚠️ Could not parse labor data."
    }
} catch {
    Write-Host "⚠️ Error: $_"
}
