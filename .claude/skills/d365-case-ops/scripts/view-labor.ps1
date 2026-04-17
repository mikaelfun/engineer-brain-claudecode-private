<#
.SYNOPSIS
    查看当前 Case 的 Labor 记录列表。
.DESCRIPTION
    导航到 Labor 标签页，读取 Labor 表格数据并输出。
    支持通过 -TicketNumber 直接指定 Case 编号（跳过浏览器上下文检测）。
    支持通过 -OutputDir 将结果写入 Markdown 文件（{OutputDir}/{TicketNumber}/labor.md）。
.PARAMETER TicketNumber
    Case 编号。提供时直接用该值查询 D365 API，跳过 Get-CurrentCaseId。
.PARAMETER OutputDir
    输出目录（父目录，不含 case number）。提供时将 labor 记录写入 {OutputDir}/{TicketNumber}/labor.md。
.PARAMETER Count
    返回的最大条目数，默认 10。
.EXAMPLE
    pwsh scripts/view-labor.ps1
    pwsh scripts/view-labor.ps1 -Count 5
    pwsh scripts/view-labor.ps1 -TicketNumber 2603230010001900001 -OutputDir cases/active
#>
param(
    [string]$TicketNumber,
    [string]$OutputDir,
    [int]$Count = 10
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Reading Labor records (max $Count)..."

# ── Resolve incident ID ──
$incidentId = $null
if ($TicketNumber) {
    $incidentId = Get-IncidentId -TicketNumber $TicketNumber
} else {
    $incidentId = Get-CurrentCaseId
}

# ── Helper: Format entries to Markdown ──
function Format-LaborMarkdown {
    param([array]$Entries, [string]$CaseNum)
    $lines = @()
    $lines += "# Labor Records"
    $lines += ""
    if ($CaseNum) { $lines += "**Case:** $CaseNum" ; $lines += "" }
    $lines += "**Retrieved:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $lines += ""
    if (-not $Entries -or $Entries.Count -eq 0) {
        $lines += "No labor records found."
        return ($lines -join "`n")
    }
    $lines += "| Date | Duration (min) | Classification | Description |"
    $lines += "|------|---------------|----------------|-------------|"
    foreach ($entry in $Entries) {
        $date = $entry.Date
        $dur = $entry.Duration
        $cls = $entry.Classification
        $desc = $entry.Description -replace '\|', '/'  # escape pipe in markdown table
        $lines += "| $date | $dur | $cls | $desc |"
    }
    $lines += ""
    $lines += "**Total:** $($Entries.Count) record(s)"
    return ($lines -join "`n")
}

# ── Helper: Display entries to console ──
function Show-LaborConsole {
    param([array]$Entries)
    if (-not $Entries -or $Entries.Count -eq 0) {
        Write-Host "📋 No labor records found."
        return
    }
    Write-Host ""
    Write-Host "📋 Labor Records ($($Entries.Count) entries):"
    Write-Host "─────────────────────────────────────"
    foreach ($entry in $Entries) {
        $dur = $entry.Duration
        $durText = if ($dur -ge 60) { "$([math]::Floor($dur/60)) hour(s) $($dur % 60) min" } else { "$dur minute(s)" }
        Write-Host "⏱️  $durText  |  $($entry.Date)  |  $($entry.Classification)"
        if ($entry.Description) { Write-Host "   $($entry.Description)" }
        Write-Host ""
    }
}

# ── Helper: Write to file if OutputDir specified ──
function Save-LaborFile {
    param([array]$Entries, [string]$CaseNum)
    if (-not $OutputDir -or -not $CaseNum) { return }
    $caseDir = Join-Path $OutputDir $CaseNum
    if (-not (Test-Path $caseDir)) { New-Item -ItemType Directory -Path $caseDir -Force | Out-Null }
    $filePath = Join-Path $caseDir "labor.md"
    $md = Format-LaborMarkdown -Entries $Entries -CaseNum $CaseNum
    $md | Out-File -FilePath $filePath -Encoding utf8 -Force
    Write-Host "✅ Labor records saved to $filePath"
}

# ── API Mode ──
if ($incidentId) {
    $fetchXml = "<fetch count=`"$Count`"><entity name=`"msdfm_labor`"><attribute name=`"msdfm_laborid`"/><attribute name=`"msdfm_classification`"/><attribute name=`"msdfm_date`"/><attribute name=`"msdfm_duration`"/><attribute name=`"msdfm_description`"/><attribute name=`"createdon`"/><order attribute=`"createdon`" descending=`"true`"/><filter><condition attribute=`"msdfm_caseid`" operator=`"eq`" value=`"$incidentId`"/></filter></entity></fetch>"
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/msdfm_labors" -FetchXml $fetchXml
    if ($result) {
        $entries = @()
        if ($result.value -and $result.value.Count -gt 0) {
            foreach ($entry in $result.value) {
                $dur = $entry.msdfm_duration
                $dateText = if ($entry.msdfm_date) { ([datetime]$entry.msdfm_date).ToString('M/d/yyyy') } else { '' }
                $classText = $entry.'msdfm_classification@OData.Community.Display.V1.FormattedValue'
                if (-not $classText) { $classText = 'Troubleshooting' }
                $desc = if ($entry.msdfm_description) { $entry.msdfm_description } else { '' }
                $entries += @{
                    Date = $dateText
                    Duration = $dur
                    Classification = $classText
                    Description = $desc
                }
            }
        }
        $caseNum = if ($TicketNumber) { $TicketNumber } else { '' }
        Show-LaborConsole -Entries $entries
        Save-LaborFile -Entries $entries -CaseNum $caseNum
        return
    }
}

# ── UI Fallback (only when no TicketNumber — needs browser context) ──
if ($TicketNumber) {
    Write-Host "⚠️ API unavailable and -TicketNumber specified — cannot fallback to UI without browser context."
    # Still write empty file if OutputDir specified
    Save-LaborFile -Entries @() -CaseNum $TicketNumber
    return
}

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
        $entries = @()
        if ($jsonStr -ne '[]') {
            $parsed = $jsonStr | ConvertFrom-Json
            foreach ($p in $parsed) {
                $entries += @{
                    Date = $p.date
                    Duration = $p.duration
                    Classification = $p.classification
                    Description = $p.description
                }
            }
        }
        Show-LaborConsole -Entries $entries
        # Note: UI fallback doesn't have TicketNumber, can't save to file
    } else {
        Write-Host "⚠️ Could not parse labor data."
    }
} catch {
    Write-Host "⚠️ Error: $_"
}
