<#
.SYNOPSIS
    在已打开的 Case Tab 之间切换。
.DESCRIPTION
    列出当前所有已打开的 Case Tab，或切换到指定的 Case。
.PARAMETER Keyword
    Case 编号或标题关键词，匹配则切换。不指定则列出所有打开的 Tab。
.EXAMPLE
    pwsh scripts/switch-case.ps1                         # 列出所有打开的 Tab
    pwsh scripts/switch-case.ps1 -Keyword "2602280040000729"  # 切换到指定 Case
#>
param(
    [string]$Keyword = ""
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

# --- Fast path: if keyword is a case number, navigate directly via URL ---
if ($Keyword -match '^\d{10,}$') {
    $incidentId = Get-IncidentId -TicketNumber $Keyword
    if ($incidentId) {
        $appId = "101acb62-8d00-eb11-a813-000d3a8b3117"
        $caseUrl = "https://onesupport.crm.dynamics.com/main.aspx?appid=$appId&pagetype=entityrecord&etn=incident&id=$incidentId"

        $navJs = @"
async page => {
  // 1. Click Home tab first to get to a stable state
  const homeTab = page.locator('[role=tab][aria-label*="Home"], [role=tab][aria-label="Home"]').first();
  if (await homeTab.count() > 0) {
    await homeTab.click({ force: true });
    await page.waitForTimeout(800);
  }
  // 2. Navigate directly to target case URL
  await page.goto('$caseUrl', { waitUntil: 'domcontentloaded' });
  // 3. Wait for case form to load (ticket number field appears)
  await page.waitForSelector('[data-id="ticketnumber"]', { timeout: 15000 }).catch(() => {});
  return await page.evaluate(() => {
    const el = document.querySelector('[data-id="ticketnumber"] input') ||
               document.querySelector('[data-id="ticketnumber"]');
    return el ? (el.value || el.textContent || '').trim() : 'navigated';
  });
}
"@
        $result = Invoke-PlaywrightCode -Code $navJs
        if ($result -and ($result.Trim() -eq $Keyword -or $result.Trim() -eq 'navigated')) {
            Write-Host "✅ Switched to: $Keyword"
            exit 0
        } else {
            Write-Host "⚠️ Navigation result: $result — falling back to tab search"
        }
    }
}

$escapedKeyword = $Keyword -replace "'", "\'"
$js = @"
async page => {
  const normalize = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const dedup = (s) => {
    const t = normalize(s);
    const half = Math.floor(t.length / 2);
    return (half > 0 && t.substring(0, half) === t.substring(half)) ? t.substring(0, half) : t;
  };
  const encode = (s) => encodeURIComponent((s || '').replace(/\r?\n/g, ' ').trim());

  const collectTabs = async () => {
    const out = [];
    const seen = new Set();
    let sourceType = 'unknown';
    const sources = [
      { locator: page.locator('[role=tablist][aria-label="Tab list"] [role=tab]'), type: 'tab_list' },
      { locator: page.locator('[role=tablist][aria-label="Session list"] [role=tab]'), type: 'session_list' },
      { locator: page.locator('[role=tab][aria-label]'), type: 'fallback' }
    ];

    for (const source of sources) {
      const locator = source.locator;
      const tabs = await locator.all();
      if (tabs.length > 0) sourceType = source.type;
      for (const tab of tabs) {
        let name = await tab.getAttribute('aria-label').catch(() => '');
        if (!name) name = await tab.textContent().catch(() => '');
        name = dedup(name);
        if (!name || name.length < 3) continue;

        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const selected = (await tab.getAttribute('aria-selected').catch(() => 'false')) === 'true';
        out.push({ name, selected, tab });
      }
      if (out.length > 0) break;
    }
    return { tabs: out, sourceType };
  };

  const getCurrentCaseNumber = async () => {
    const headerArea = page.locator('text=/Case number/i').first().locator('../..');
    const headerText = await headerArea.textContent().catch(() => '');
    const headerMatch = headerText.match(/(\d{10,})/);
    if (headerMatch) return headerMatch[1];

    const h1Text = await page.getByRole('heading', { level: 1 }).first().textContent().catch(() => '');
    const h1Match = h1Text.match(/(\d{10,})/);
    if (h1Match) return h1Match[1];

    return '';
  };

  const keyword = '$escapedKeyword';
  let collect = await collectTabs();
  let tabs = collect.tabs;
  let sourceType = collect.sourceType;
  let action = 'list';
  let target = '';

  if (keyword) {
    const keywordLower = keyword.toLowerCase();
    const isNumericKeyword = /^\d{10,}$/.test(keyword);

    // Priority 1: exact case number match in tab/session name
    let candidate = tabs.find(t => {
      const m = t.name.match(/\d{10,}/);
      return m && m[0] === keyword;
    });

    // Priority 2: contains keyword in tab/session name
    if (!candidate) candidate = tabs.find(t => t.name.toLowerCase().includes(keywordLower));

    // Priority 3: if in Session list and keyword is case number, probe each session item
    // to find the session whose Case Form header contains the target ticket number.
    if (!candidate && isNumericKeyword && sourceType === 'session_list') {
      const skipNames = new Set(['home', 'hub', 'copilot hub', 'd365 connector']);
      for (const t of tabs) {
        if (skipNames.has(t.name.toLowerCase())) continue;
        await t.tab.click({ force: true });
        await page.waitForTimeout(1200);
        const caseNumber = await getCurrentCaseNumber();
        if (caseNumber === keyword) {
          candidate = t;
          break;
        }
      }
    }

    if (candidate) {
      await candidate.tab.click({ force: true });
      await page.waitForTimeout(1200);
      action = 'switched';
      target = candidate.name;
      collect = await collectTabs();
      tabs = collect.tabs;
    } else {
      // If currently already on this case number, treat as switched success
      if (isNumericKeyword) {
        const currentCase = await getCurrentCaseNumber();
        if (currentCase === keyword) {
          action = 'switched';
          target = keyword;
        } else {
          action = 'not_found';
          target = keyword;
        }
      } else {
      action = 'not_found';
      target = keyword;
      }
    }
  }

  const lines = [];
  lines.push('ACTION=' + action);
  lines.push('TARGET=' + encode(target));
  for (const t of tabs) {
    lines.push('TAB=' + (t.selected ? '1' : '0') + '|||' + encode(t.name));
  }
  return lines.join('\n');
}
"@

$resultText = Invoke-PlaywrightCode -Code $js
if (-not $resultText) {
    Write-Host "⚠️ Could not read tabs."
    exit 1
}

function Decode-TabText {
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) { return '' }
    try { return [System.Uri]::UnescapeDataString($Value) } catch { return $Value }
}

$action = ''
$targetEncoded = ''
$tabs = @()

foreach ($line in ($resultText -split "`r?`n")) {
    if (-not $line) { continue }
    if ($line.StartsWith('ACTION=')) {
        $action = $line.Substring(7)
        continue
    }
    if ($line.StartsWith('TARGET=')) {
        $targetEncoded = $line.Substring(7)
        continue
    }
    if ($line.StartsWith('TAB=')) {
        $payload = $line.Substring(4)
        $parts = $payload -split '\|\|\|', 2
        if ($parts.Count -eq 2) {
            $tabs += [PSCustomObject]@{
                selected = ($parts[0] -eq '1')
                name = Decode-TabText -Value $parts[1]
            }
        }
    }
}

$target = Decode-TabText -Value $targetEncoded

if ($action -eq 'switched') {
    Write-Host "✅ Switched to: $target"
} elseif ($action -eq 'not_found') {
    Write-Host "❌ No tab matching '$Keyword'"
}

Write-Host ""
Write-Host "📑 Open Tabs:"
if ($tabs.Count -eq 0) {
    Write-Host "  (none detected)"
} else {
    foreach ($tab in $tabs) {
        $marker = if ($action -eq 'switched' -and $tab.name -eq $target) { '→' }
                  elseif ($tab.selected) { '→' }
                  else { ' ' }
        Write-Host "  $marker $($tab.name)"
    }
}

if ($action -eq 'not_found' -and $Keyword) {
    exit 1
}
