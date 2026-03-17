<#
.SYNOPSIS
    在 Dashboard 上打开指定 Case。
.DESCRIPTION
    通过关键词匹配在 "My Open Cases" 列表中找到并点击目标 Case。
.PARAMETER Keyword
    Case 编号或标题中的关键词（用于匹配链接文本）。
.EXAMPLE
    pwsh scripts/open-case.ps1 -Keyword "2602280040000729"
    pwsh scripts/open-case.ps1 -Keyword "PostgreSQL"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$Keyword
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

Write-Host "🔵 Searching for Case matching: $Keyword"

$escapedKeyword = $Keyword -replace "'", "\'"
$js = @"
async page => {
  const keyword = '$escapedKeyword';
  const keywordLower = keyword.toLowerCase();
  const dedup = (s) => {
    const t = (s || '').replace(/\s+/g, ' ').trim();
    const half = Math.floor(t.length / 2);
    return (half > 0 && t.substring(0, half) === t.substring(half)) ? t.substring(0, half) : t;
  };
  const encode = (s) => encodeURIComponent((s || '').replace(/\r?\n/g, ' ').trim());

  const candidates = [];
  const treegrids = await page.getByRole('treegrid').all();
  for (const grid of treegrids) {
    const rowgroups = await grid.getByRole('rowgroup').all();
    const dataRows = rowgroups.length > 1
      ? await rowgroups[1].getByRole('row').all()
      : await grid.getByRole('row').all();

    for (const row of dataRows) {
      const cells = await row.getByRole('gridcell').all();
      if (cells.length === 0) continue;

      let caseNumber = '';
      let title = '';
      let link = null;

      for (const cell of cells) {
        const cellText = dedup(await cell.textContent().catch(() => ''));
        if (!caseNumber) {
          const m = cellText.match(/\d{10,}/);
          if (m) caseNumber = m[0];
        }

        if (!link) {
          const links = await cell.getByRole('link').all();
          if (links.length > 0) {
            link = links[0];
            title = dedup(await link.textContent().catch(() => ''));
          }
        }
      }

      if (link && (caseNumber || title)) {
        candidates.push({ caseNumber, title, link });
      }
    }
  }

  let picked = null;
  let matchedBy = '';

  // Priority 1: exact case number
  picked = candidates.find(c => c.caseNumber && c.caseNumber === keyword);
  if (picked) matchedBy = 'exact_case_number';

  // Priority 2: numeric partial case number
  if (!picked && /^\d+$/.test(keyword)) {
    picked = candidates.find(c => c.caseNumber && c.caseNumber.includes(keyword));
    if (picked) matchedBy = 'partial_case_number';
  }

  // Priority 3: title contains keyword
  if (!picked) {
    picked = candidates.find(c => c.title && c.title.toLowerCase().includes(keywordLower));
    if (picked) matchedBy = 'title_contains';
  }

  if (!picked) {
    return 'ACTION=NOT_FOUND\nCANDIDATE_COUNT=' + candidates.length;
  }

  await picked.link.click();
  await page.waitForTimeout(3000);
  return 'ACTION=FOUND\nMATCH=' + matchedBy + '\nCASE=' + encode(picked.caseNumber) + '\nTITLE=' + encode(picked.title);
}
"@

$resultText = Invoke-PlaywrightCode -Code $js
Start-Sleep -Seconds 2

if (-not $resultText) {
    Write-Host "⚠️ Unexpected result. Could not parse open-case output."
    exit 1
}

$action = ''
$matchMode = ''
$caseNumber = ''
$title = ''

foreach ($line in ($resultText -split "`r?`n")) {
    if ($line.StartsWith('ACTION=')) { $action = $line.Substring(7); continue }
    if ($line.StartsWith('MATCH=')) { $matchMode = $line.Substring(6); continue }
    if ($line.StartsWith('CASE=')) {
        try { $caseNumber = [System.Uri]::UnescapeDataString($line.Substring(5)) } catch { $caseNumber = $line.Substring(5) }
        continue
    }
    if ($line.StartsWith('TITLE=')) {
        try { $title = [System.Uri]::UnescapeDataString($line.Substring(6)) } catch { $title = $line.Substring(6) }
        continue
    }
}

if ($action -eq 'FOUND') {
    Write-Host "✅ Case opened: $title"
    if ($caseNumber) { Write-Host "   Case Number: $caseNumber | Match: $matchMode" }
} else {
    Write-Host "❌ No Case found matching '$Keyword' in current view."
    Write-Host "   Match scope: treegrid case rows only (to avoid accidental mis-click)."
    exit 1
}
