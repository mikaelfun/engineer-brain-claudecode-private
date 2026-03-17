<#
.SYNOPSIS
    检查 Case 的 Performance Indicators（IR SLA / FDR / FWR 状态）。
.DESCRIPTION
    从 Case Summary 页面的 Performance Indicators 区域读取 KPI 状态。
    需要浏览器已打开且在 Case Form 上。
    如果指定 -SaveMeta，将结果 upsert 到 casehealth-meta.json。
.PARAMETER TicketNumber
    Case 编号。如果提供，会先搜索并打开该 Case。
    如果不提供，假设当前已在 Case Form 上。
.PARAMETER SaveMeta
    将 IR/FDR/FWR 结果写入 {MetaDir}/{TicketNumber}/casehealth-meta.json（upsert）。
.PARAMETER MetaDir
    casehealth-meta.json 所在的 cases 根目录。
    默认：$env:D365_CASES_ROOT\active（fallback: $env:USERPROFILE\.openclaw\workspace\cases\active）
.EXAMPLE
    .\check-ir-status.ps1 -TicketNumber 2603090040000814
    .\check-ir-status.ps1 -TicketNumber 2603090040000814 -SaveMeta
    .\check-ir-status.ps1 -TicketNumber 2603090040000814 -SaveMeta -MetaDir "$env:D365_CASES_ROOT\active"
.OUTPUTS
    IR SLA: Succeeded / In Progress (remaining) / Expired / Nearing (remaining)
    FDR: Succeeded / Expired / In Progress (remaining)
    FWR: Succeeded / Expired / In Progress (remaining)
#>
param(
    [string]$TicketNumber = '',
    [switch]$SaveMeta,
    [string]$MetaDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else { "$env:USERPROFILE\.openclaw\workspace\cases\active" })
)

. "$PSScriptRoot\_init.ps1"

# If ticket number provided, try switch-case first (faster than search-case)
if ($TicketNumber) {
    $incidentId = Get-IncidentId -TicketNumber $TicketNumber
    if ($incidentId) {
        $appId = "101acb62-8d00-eb11-a813-000d3a8b3117"
        $caseUrl = "https://onesupport.crm.dynamics.com/main.aspx?appid=$appId&pagetype=entityrecord&etn=incident&id=$incidentId"

        # Single playwright-cli call: navigate + wait + read KPIs
        $js = @"
async page => {
  // Check if already on target case — skip goto if so (saves ~8s)
  const currentTicket = await page.evaluate(() => {
    const el = document.querySelector('[data-id="ticketnumber"] input');
    return el ? el.value.trim() : '';
  }).catch(() => '');

  if (currentTicket !== '$TicketNumber') {
    await page.goto('$caseUrl', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for Case Form to render (not just HTTP response)
    await page.waitForSelector('[data-id="ticketnumber"]', { timeout: 20000 }).catch(() => {});
  }

  // Wait for IR SLA KPI to render — retry up to 3 times with increasing delays
  let kpiFound = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const el = await page.waitForSelector('[data-id="IR_SLA_Timer"]', { timeout: 15000 }).catch(() => null);
    if (el) { kpiFound = true; break; }
    // Not found — D365 may still be loading, wait and retry
    await page.waitForTimeout(3000);
  }

  if (!kpiFound) {
    // Last resort: check if we're on the right page at all
    const url = page.url();
    if (!url.includes('dynamics.com') || url.includes('login.microsoftonline')) {
      return JSON.stringify({ error: 'Not on D365 page (url: ' + url.substring(0, 80) + ')' });
    }
    return JSON.stringify({ error: 'KPI timer not found after 3 attempts' });
  }

  // Extra wait for all KPI timers to fully render
  await page.waitForTimeout(1000);

  // Read KPIs
  return await page.evaluate(() => {
    const parseKpi = (prefix) => {
      const succeeded = document.querySelector('[data-id="' + prefix + '.fieldControl-SucceededLabelId"]');
      if (succeeded) return { status: 'Succeeded', remaining: null };
      const ticking = document.querySelector('[data-id="' + prefix + '.fieldControl-TickingTimerLabelID"]');
      if (ticking && ticking.textContent.trim()) {
        const nearing = document.querySelector('[data-id="' + prefix + '.fieldControl-ViolatingTimerLabelID"]');
        return { status: nearing ? 'Nearing' : 'In Progress', remaining: ticking.textContent.trim() };
      }
      const violated = document.querySelector('[data-id="' + prefix + '.fieldControl-ViolatedTimerLabelID"]');
      if (violated) return { status: 'Expired', remaining: null };
      const unsucceeded = document.querySelector('[data-id="' + prefix + '.fieldControl-UnsucceededLabelId"]');
      if (unsucceeded) return { status: 'Expired', remaining: null };
      return { status: 'unknown', remaining: null };
    };
    const is24x7El = document.querySelector('[data-id*="msdfm_is24x7"]');
    const is24x7 = is24x7El ? is24x7El.textContent.includes('Yes') : false;
    return JSON.stringify({ is24x7, irSla: parseKpi('IR_SLA_Timer'), fdr: parseKpi('FDR_Timer'), fwr: parseKpi('FWR_Timer') });
  });
}
"@
        $result = Invoke-PlaywrightCode -Code $js
    } else {
        Write-Host "⚠️ Could not resolve incidentId for $TicketNumber, falling back"
        & "$PSScriptRoot\switch-case.ps1" -Keyword $TicketNumber 2>$null
        $result = $null
    }
} else {
    # No ticket number — assume already on Case Form, just read KPIs
    $js = @'
async page => {
  // Wait for KPI with retry
  let kpiFound = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const el = await page.waitForSelector('[data-id="IR_SLA_Timer"]', { timeout: 10000 }).catch(() => null);
    if (el) { kpiFound = true; break; }
    await page.waitForTimeout(2000);
  }
  if (!kpiFound) {
    return JSON.stringify({ error: 'KPI timer not found after 3 attempts (no-ticket mode)' });
  }
  await page.waitForTimeout(1000);
  return await page.evaluate(() => {
    const parseKpi = (prefix) => {
      const succeeded = document.querySelector(`[data-id="${prefix}.fieldControl-SucceededLabelId"]`);
      if (succeeded) return { status: 'Succeeded', remaining: null };
      const ticking = document.querySelector(`[data-id="${prefix}.fieldControl-TickingTimerLabelID"]`);
      if (ticking && ticking.textContent.trim()) {
        const nearing = document.querySelector(`[data-id="${prefix}.fieldControl-ViolatingTimerLabelID"]`);
        return { status: nearing ? 'Nearing' : 'In Progress', remaining: ticking.textContent.trim() };
      }
      const violated = document.querySelector(`[data-id="${prefix}.fieldControl-ViolatedTimerLabelID"]`);
      if (violated) return { status: 'Expired', remaining: null };
      const unsucceeded = document.querySelector(`[data-id="${prefix}.fieldControl-UnsucceededLabelId"]`);
      if (unsucceeded) return { status: 'Expired', remaining: null };
      return { status: 'unknown', remaining: null };
    };
    const is24x7El = document.querySelector('[data-id*="msdfm_is24x7"]');
    const is24x7 = is24x7El ? is24x7El.textContent.includes('Yes') : false;
    return JSON.stringify({ is24x7, irSla: parseKpi('IR_SLA_Timer'), fdr: parseKpi('FDR_Timer'), fwr: parseKpi('FWR_Timer') });
  });
}
'@
    $result = Invoke-PlaywrightCode -Code $js
}
if (-not $result) {
    Write-Host "❌ Failed to read Performance Indicators from page"
    exit 1
}

$obj = $result | ConvertFrom-Json

if ($obj.error) {
    Write-Host "❌ $($obj.error)"
    exit 1
}

# Output
Write-Host "📊 Performance Indicators"
Write-Host "  24x7:   $(if($obj.is24x7){'Yes ⚠️'}else{'No'})"

function Format-KPI($name, $kpi) {
    $icon = switch ($kpi.status) {
        'Succeeded'   { '✅' }
        'Expired'     { '❌' }
        'Nearing'     { '⚠️' }
        'In Progress' { '⏳' }
        default       { '❓' }
    }
    $remaining = if ($kpi.remaining) { " | Remaining: $($kpi.remaining)" } else { '' }
    Write-Host "  ${name}: $icon $($kpi.status)$remaining"
}

Format-KPI "IR SLA" $obj.irSla
Format-KPI "FDR   " $obj.fdr
Format-KPI "FWR   " $obj.fwr

# Return structured result for programmatic use
$obj | ConvertTo-Json -Compress

# --- Save to casehealth-meta.json if requested ---
if ($SaveMeta -and $TicketNumber) {
    # MetaDir should normally be the parent cases root (e.g. ...\cases\active).
    # Harden against callers accidentally passing the case directory itself.
    $leafName = Split-Path $MetaDir -Leaf
    $caseMetaDir = if ($leafName -eq $TicketNumber) { $MetaDir } else { Join-Path $MetaDir $TicketNumber }
    if (-not (Test-Path $caseMetaDir)) { New-Item -ItemType Directory -Path $caseMetaDir -Force | Out-Null }
    $metaFile = Join-Path $caseMetaDir "casehealth-meta.json"

    # Load existing or create new
    $meta = @{}
    if (Test-Path $metaFile) {
        try { $meta = Get-Content $metaFile -Raw | ConvertFrom-Json -AsHashtable } catch { $meta = @{} }
    }

    $now = (Get-Date).ToString("o")
    $meta["caseNumber"] = $TicketNumber
    $meta["lastInspected"] = $now
    $meta["irSla"] = @{
        status     = $obj.irSla.status
        remaining  = $obj.irSla.remaining
        checkedAt  = $now
    }
    $meta["fdr"] = @{
        status     = $obj.fdr.status
        remaining  = $obj.fdr.remaining
        checkedAt  = $now
    }
    $meta["fwr"] = @{
        status     = $obj.fwr.status
        remaining  = $obj.fwr.remaining
        checkedAt  = $now
    }

    $meta | ConvertTo-Json -Depth 5 | Set-Content -Path $metaFile -Encoding UTF8
    Write-Host "💾 Meta saved: $metaFile (irSla=$($obj.irSla.status))"
}
