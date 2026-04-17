<#
.SYNOPSIS
    列出当前 Dashboard 上显示的所有 Case。
.DESCRIPTION
    自动检测当前页面上的所有 Case 表格（treegrid），提取 Case Number、标题等信息。
    不绑定特定 Dashboard，适用于任何包含 Case 列表的视图。
.PARAMETER View
    可选，指定要读取的表格名称（如 "My Open Cases"）。不指定则读取所有表格。
.EXAMPLE
    pwsh scripts/list-cases.ps1
    pwsh scripts/list-cases.ps1 -View "My Open Cases"
#>
param(
    [string]$View = ""
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Listing Cases from Dashboard..."

$escapedView = $View -replace "'", "\'"
$js = @"
async page => {
  await page.waitForTimeout(2000);
  
  // Find all treegrid elements (case tables)
  const grids = await page.getByRole('treegrid').all();
  const allResults = [];
  
  for (const grid of grids) {
    const gridName = await grid.getAttribute('aria-label').catch(() => '') || 'Unknown View';
    
    // If user specified a view, skip non-matching grids
    if ('$escapedView' && !gridName.includes('$escapedView')) continue;
    
    const rows = await grid.getByRole('row').all();
    const cases = [];
    
    for (const row of rows) {
      const cells = await row.getByRole('gridcell').all();
      if (cells.length < 3) continue;
      
      // Look for a cell with a link (case title) and a cell with case number pattern
      let caseNumber = '';
      let title = '';
      
      for (const cell of cells) {
        const text = (await cell.textContent().catch(() => '')).trim();
        // Deduplicate D365's double-text issue
        const half = Math.floor(text.length / 2);
        const clean = (text.substring(0, half) === text.substring(half)) ? text.substring(0, half) : text;
        
        if (/^\d{10,}$/.test(clean)) {
          caseNumber = clean;
        }
        
        const link = cell.getByRole('link');
        if (await link.count() > 0) {
          title = (await link.first().textContent().catch(() => '')).trim();
          // Deduplicate
          const th = Math.floor(title.length / 2);
          if (title.substring(0, th) === title.substring(th)) title = title.substring(0, th);
        }
      }
      
      if (caseNumber || title) {
        cases.push({ caseNumber, title: title.substring(0, 120) });
      }
    }
    
    if (cases.length > 0) {
      allResults.push({ view: gridName, cases });
    }
  }
  
  return JSON.stringify(allResults);
}
"@

$output = playwright-cli run-code $js 2>&1 | Out-String

try {
    if ($output -match '### Result\s+"(\[[\s\S]*?\])"') {
        $jsonStr = $Matches[1] -replace '\\n', "`n" -replace '\\"', '"'
        if ($jsonStr -eq '[]') {
            Write-Host "⚠️ No Case tables found on current page. Make sure you're on a Dashboard."
            return
        }
        $views = $jsonStr | ConvertFrom-Json
        foreach ($v in $views) {
            Write-Host ""
            Write-Host "📋 $($v.view) ($($v.cases.Count) cases):"
            Write-Host "─────────────────────────────────────"
            foreach ($c in $v.cases) {
                Write-Host "  $($c.caseNumber)  $($c.title)"
            }
        }
        Write-Host ""
    } else {
        Write-Host "⚠️ Could not parse case list."
    }
} catch {
    Write-Host "⚠️ Error: $_"
}
