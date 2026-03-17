<#
.SYNOPSIS
    在 D365 中搜索 Case。
.DESCRIPTION
    使用 D365 全局搜索框按关键词搜索 Case，返回匹配结果（Customer title、Case number、Severity、Status、Assigned To）。
    默认打开搜索结果页解析完整结果表格，搜索完成后自动关闭搜索 Tab。
    使用 -Open 开关可直接打开第一个匹配的 Case。
.PARAMETER Keyword
    搜索关键词（Case 编号、客户名称、标题关键词等）。
.PARAMETER Open
    如果指定，直接打开第一个匹配的 Case 而不是列出结果。
.EXAMPLE
    pwsh scripts/search-case.ps1 -Keyword "2602280040000729"
    pwsh scripts/search-case.ps1 -Keyword "PostgreSQL"
    pwsh scripts/search-case.ps1 -Keyword "2602280040000729" -Open
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Keyword,
    [switch]$Open
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"
$escapedKeyword = $Keyword -replace "'", "\'" -replace '"', '\"'

if ($Open) {
    # ── Mode: Open first matching case via suggestion dropdown ──
    Write-Host "🔵 Searching and opening Case matching: $Keyword"

    $js = @"
async page => {
  const encode = (s) => encodeURIComponent((s || '').replace(/\r?\n/g, ' ').trim());
  const searchbox = page.getByRole('searchbox', { name: 'Search' });
  await searchbox.click();
  await searchbox.fill('$escapedKeyword');
  
  // Wait for suggestion grid to appear (up to 10 seconds)
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    const grids = await page.getByRole('grid').all();
    for (const grid of grids) {
      const rows = await grid.getByRole('row').all();
      for (const row of rows) {
        const btns = await row.getByRole('button').all();
        for (const btn of btns) {
          const text = await btn.textContent().catch(() => '');
          if (text && text.includes('$escapedKeyword')) {
            // Extract title: remove 'Case number: xxx' suffix and leading initial
            let title = text.replace(/Case number:\s*\S+/g, '').trim();
            if (title.length > 2 && title[1] === '<') title = title.substring(2);
            const caseMatch = text.match(/Case number:\s*(\d{10,})/i);
            const caseNumber = caseMatch ? caseMatch[1] : '';
            await btn.click();

            // Verify we are now on Case Form context
            let context = 'unknown';
            for (let j = 0; j < 15; j++) {
              await page.waitForTimeout(1000);
              const summaryTab = page.locator('[role=tab][aria-label="Summary"]');
              if (await summaryTab.count() > 0) {
                context = 'case_form';
                break;
              }
              const searchHeading = page.getByRole('heading', { name: 'Search results' });
              if (await searchHeading.count() > 0) {
                context = 'search_results';
              }
            }

            if (context !== 'case_form') {
              return 'ACTION=ERR\nMSG=' + encode('Case did not open to Case Form context') + '\nCTX=' + context;
            }

            return 'ACTION=OPENED\nCASE=' + encode(caseNumber) + '\nTITLE=' + encode(title.substring(0, 200));
          }
        }
      }
    }
  }
  
  // Clear search box if not found
  const clearBtn = page.getByRole('button', { name: 'Clear text' });
  if (await clearBtn.count() > 0) await clearBtn.click();
  return 'ACTION=NOT_FOUND';
}
"@

    $resultText = Invoke-PlaywrightCode -Code $js
    if (-not $resultText) {
        Write-Host "⚠️ Unexpected result."
        exit 1
    }

    $action = ''
    $msg = ''
    $ctx = ''
    $title = ''
    $caseNumber = ''
    foreach ($line in ($resultText -split "`r?`n")) {
        if ($line.StartsWith('ACTION=')) { $action = $line.Substring(7); continue }
        if ($line.StartsWith('MSG=')) {
            try { $msg = [System.Uri]::UnescapeDataString($line.Substring(4)) } catch { $msg = $line.Substring(4) }
            continue
        }
        if ($line.StartsWith('CTX=')) { $ctx = $line.Substring(4); continue }
        if ($line.StartsWith('CASE=')) {
            try { $caseNumber = [System.Uri]::UnescapeDataString($line.Substring(5)) } catch { $caseNumber = $line.Substring(5) }
            continue
        }
        if ($line.StartsWith('TITLE=')) {
            try { $title = [System.Uri]::UnescapeDataString($line.Substring(6)) } catch { $title = $line.Substring(6) }
            continue
        }
    }

    if ($action -eq 'OPENED') {
        Write-Host "✅ Case opened: $title"
        if ($caseNumber) { Write-Host "   Case Number: $caseNumber" }
    } elseif ($action -eq 'NOT_FOUND') {
        Write-Host "❌ No Case found matching '$Keyword'"
        exit 1
    } elseif ($action -eq 'ERR') {
        Write-Host "❌ $msg"
        if ($ctx) { Write-Host "   Context: $ctx" }
        exit 1
    } else {
        Write-Host "⚠️ Unexpected result."
        exit 1
    }

} else {
    # ── Mode: Search and list results ──
    Write-Host "🔵 Searching for: $Keyword"

    # Step 1: Fill search and press Enter to open search results page
    $jsSearch = @"
async page => {
  const searchbox = page.getByRole('searchbox', { name: 'Search' });
  await searchbox.click();
  await page.waitForTimeout(500);
  await searchbox.fill('$escapedKeyword');
  await page.waitForTimeout(2000);
  await searchbox.press('Enter');
  
  // Wait for search results page to load
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    const heading = page.getByRole('heading', { name: 'Search results' });
    if (await heading.count() > 0) {
      // Wait a bit more for results to populate
      await page.waitForTimeout(3000);
      break;
    }
  }
  return 'search_page_ready';
}
"@

    $result1 = Invoke-PlaywrightCode -Code $jsSearch
    if ($result1 -ne 'search_page_ready') {
        Write-Host "⚠️ Search results page did not load."
        exit 1
    }

    # Step 2: Parse Cases treegrid + close Search tab, return line-based text
    $jsParse = @"
async page => {
  const lines = [];
  
  // Get summary text
  const summaryEl = page.locator('text=/Showing \\d+ of \\d+ results/');
  if (await summaryEl.count() > 0) {
    const s = (await summaryEl.first().textContent().catch(() => '')).trim();
    lines.push('SUMMARY:' + s);
  }
  
  // Find treegrids with Case-related columns
  const treegrids = await page.getByRole('treegrid').all();
  
  for (const grid of treegrids) {
    const headerRow = grid.getByRole('row').first();
    const headerText = await headerRow.textContent().catch(() => '');
    if (!headerText.includes('Customer title') && !headerText.includes('Case number')) continue;
    
    // Get column headers with dedup
    const headers = await headerRow.getByRole('columnheader').all();
    const colNames = [];
    for (const h of headers) {
      let t = (await h.textContent().catch(() => '')).trim();
      const half = Math.floor(t.length / 2);
      if (half > 0 && t.substring(0, half) === t.substring(half)) t = t.substring(0, half);
      colNames.push(t);
    }
    
    // Get data rows
    const rowgroups = await grid.getByRole('rowgroup').all();
    if (rowgroups.length < 2) continue;
    
    const dataRows = await rowgroups[1].getByRole('row').all();
    for (const row of dataRows) {
      const cells = await row.getByRole('gridcell').all();
      const vals = {};
      for (let i = 0; i < cells.length && i < colNames.length; i++) {
        let t = (await cells[i].textContent().catch(() => '')).trim();
        const half = Math.floor(t.length / 2);
        if (half > 0 && t.substring(0, half) === t.substring(half)) t = t.substring(0, half);
        if (colNames[i]) vals[colNames[i]] = t;
      }
      if (vals['Customer title'] || vals['Case number']) {
        // CASE:number|||title|||severity|||status|||assignee
        lines.push('CASE:' + (vals['Case number']||'') + '|||' + (vals['Customer title']||'') + '|||' + (vals['Severity']||'') + '|||' + (vals['Status reason']||'') + '|||' + (vals['Assigned To']||''));
      }
    }
    break;
  }
  
  // Close the Search tab
  const closeBtn = page.getByRole('button', { name: 'Press Enter to close the tab Search' });
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }
  
  return lines.join('\\n');
}
"@

    $resultText = Invoke-PlaywrightCode -Code $jsParse

    # Step 3: Parse line-based results
    if (-not $resultText) {
        Write-Host "⚠️ Could not parse search results."
        exit 1
    }

    $summary = ''
    $caseLines = @()
    foreach ($line in ($resultText -split "`r?`n")) {
        if ($line.StartsWith('SUMMARY:')) { $summary = $line.Substring(8).Trim(); continue }
        if ($line.StartsWith('CASE:')) { $caseLines += $line.Substring(5) }
    }

    if ($summary) {
        Write-Host ""
        Write-Host "📊 $summary"
    }

    if ($caseLines.Count -eq 0) {
        Write-Host "❌ No Cases found matching '$Keyword'"
        exit 1
    }

    Write-Host ""
    Write-Host "📋 Search Results ($($caseLines.Count) cases):"
    Write-Host "─────────────────────────────────────────────────"
    foreach ($line in $caseLines) {
        $parts = $line -split '\|\|\|', 5
        $num = if ($parts[0]) { $parts[0] } else { '—' }
        $title = if ($parts.Length -gt 1 -and $parts[1]) { $parts[1] } else { '—' }
        $sev = if ($parts.Length -gt 2 -and $parts[2]) { "Sev$($parts[2])" } else { '—' }
        $status = if ($parts.Length -gt 3 -and $parts[3]) { $parts[3] } else { '—' }
        $assignee = if ($parts.Length -gt 4 -and $parts[4]) { $parts[4] } else { '—' }
        Write-Host "  $num  [$sev] $title"
        Write-Host "    Status: $status | Assigned: $assignee"
    }
    Write-Host ""
}
