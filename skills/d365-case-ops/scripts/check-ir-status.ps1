<#
.SYNOPSIS
    检查 Case 的 Performance Indicators（IR SLA / FDR / FWR 状态）。
.DESCRIPTION
    优先通过 OData API 查询 msdfm_caseperfattributes 实体（~2s），
    API 失败时自动降级到 Playwright UI scraping（~15-20s）。

    如果指定 -SaveMeta，将结果 upsert 到 casehealth-meta.json。
.PARAMETER TicketNumber
    Case 编号。如果提供，会先搜索并打开该 Case。
    如果不提供，假设当前已在 Case Form 上（仅 UI 模式可用）。
.PARAMETER SaveMeta
    将 IR/FDR/FWR 结果写入 {MetaDir}/{TicketNumber}/casehealth-meta.json（upsert）。
.PARAMETER MetaDir
    casehealth-meta.json 所在的 cases 根目录。
    默认：$env:D365_CASES_ROOT\active（fallback: 读取 config.json 的 casesRoot）
.PARAMETER UseApi
    是否优先使用 API 查询。默认 $true。设为 $false 强制用 UI scraping。
.EXAMPLE
    .\check-ir-status.ps1 -TicketNumber 2603090040000814
    .\check-ir-status.ps1 -TicketNumber 2603090040000814 -SaveMeta
    .\check-ir-status.ps1 -TicketNumber 2603090040000814 -UseApi:$false
.OUTPUTS
    IR SLA: Succeeded / In Progress (remaining) / Expired / Nearing (remaining)
    FDR: Succeeded / Expired / In Progress (remaining)
    FWR: Succeeded / Expired / In Progress (remaining)
#>
param(
    [string]$TicketNumber = '',
    [switch]$SaveMeta,
    [string]$MetaDir = $(if ($env:D365_CASES_ROOT) { "$env:D365_CASES_ROOT\active" } else {
        $projRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
        $cfg = Get-Content "$projRoot\config.json" -Raw | ConvertFrom-Json
        $cr = if ([IO.Path]::IsPathRooted($cfg.casesRoot)) { $cfg.casesRoot } else { Join-Path $projRoot $cfg.casesRoot }
        "$cr\active"
    }),
    [bool]$UseApi = $true
)

. "$PSScriptRoot\_init.ps1"

# --- Status value mapping (API → display) ---
function ConvertTo-KpiStatus {
    param([object]$Value)
    switch ($Value) {
        847050001 { return "Succeeded" }
        847050002 { return "Expired" }
        847050000 { return "In Progress" }
        default   { return "unknown" }
    }
}

# ============================================================
# API Path: query msdfm_caseperfattributes via OData
# ============================================================
function Get-KpiViaApi {
    param([string]$Ticket)

    $fetchXml = @"
<fetch top="1">
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <attribute name="msdfm_is24x7"/>
    <attribute name="msdfm_caseperfattributesid"/>
    <filter>
      <condition attribute="ticketnumber" operator="eq" value="$Ticket"/>
    </filter>
    <link-entity name="msdfm_caseperfattributes" from="msdfm_caseperfattributesid" to="msdfm_caseperfattributesid" alias="kpi" link-type="outer">
      <attribute name="msdfm_initialresponse"/>
      <attribute name="msdfm_firstdayresolution"/>
      <attribute name="msdfm_firstweekresolution"/>
      <attribute name="msdfm_irslaremainingtime"/>
      <attribute name="msdfm_initialresponseexpirationtime"/>
      <attribute name="msdfm_initialresponsecompletedon"/>
    </link-entity>
  </entity>
</fetch>
"@

    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXml
    if (-not $result -or -not $result.value -or $result.value.Count -eq 0) {
        return $null
    }

    $c = $result.value[0]
    $is24x7 = if ($c.msdfm_is24x7 -eq $true -or $c."msdfm_is24x7@OData.Community.Display.V1.FormattedValue" -eq "Yes") { $true } else { $false }

    $irStatus = ConvertTo-KpiStatus $c."kpi.msdfm_initialresponse"
    $fdrStatus = ConvertTo-KpiStatus $c."kpi.msdfm_firstdayresolution"
    $fwrStatus = ConvertTo-KpiStatus $c."kpi.msdfm_firstweekresolution"

    $irRemaining = $c."kpi.msdfm_irslaremainingtime"
    $irExpiration = $c."kpi.msdfm_initialresponseexpirationtime"
    $irCompletedOn = $c."kpi.msdfm_initialresponsecompletedon"

    return @{
        is24x7 = $is24x7
        irSla  = @{
            status         = $irStatus
            remaining      = $irRemaining
            expirationTime = $irExpiration
            completedOn    = $irCompletedOn
        }
        fdr    = @{
            status    = $fdrStatus
            remaining = $null
        }
        fwr    = @{
            status    = $fwrStatus
            remaining = $null
        }
        _source = "api"
    }
}

# ============================================================
# UI Path: Playwright scraping (original logic)
# ============================================================
function Get-KpiViaUi {
    param([string]$Ticket)

    if ($Ticket) {
        $incidentId = Get-IncidentId -TicketNumber $Ticket
        if ($incidentId) {
            $appId = "101acb62-8d00-eb11-a813-000d3a8b3117"
            $caseUrl = "https://onesupport.crm.dynamics.com/main.aspx?appid=$appId&pagetype=entityrecord&etn=incident&id=$incidentId"

            # Single playwright-cli call: navigate + wait + read KPIs
            $js = @"
async page => {
  // Check if already on target case - skip goto if so (saves ~8s)
  const currentTicket = await page.evaluate(() => {
    const el = document.querySelector('[data-id="ticketnumber"] input');
    return el ? el.value.trim() : '';
  }).catch(() => '');

  if (currentTicket !== '$Ticket') {
    await page.goto('$caseUrl', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for Case Form to render (not just HTTP response)
    await page.waitForSelector('[data-id="ticketnumber"]', { timeout: 20000 }).catch(() => {});
  }

  // Wait for IR SLA KPI to render - retry up to 3 times with increasing delays
  let kpiFound = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const el = await page.waitForSelector('[data-id="IR_SLA_Timer"]', { timeout: 15000 }).catch(() => null);
    if (el) { kpiFound = true; break; }
    // Not found - D365 may still be loading, wait and retry
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
            try {
                $uiResult = Invoke-PlaywrightCode -Code $js
            } catch {
                Write-Host "❌ Invoke-PlaywrightCode threw exception: $($_.Exception.Message)"
                return $null
            }
        } else {
            Write-Host "⚠️ Could not resolve incidentId for $Ticket — Get-IncidentId returned null/empty"
            Write-Host "   Falling back to switch-case search"
            & "$PSScriptRoot\switch-case.ps1" -Keyword $Ticket 2>$null
            return $null
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
        $uiResult = Invoke-PlaywrightCode -Code $js
    }

    if (-not $uiResult) { return $null }

    try {
        $parsed = $uiResult | ConvertFrom-Json
    } catch {
        Write-Host "❌ Failed to parse Playwright result as JSON"
        Write-Host "   Raw result (first 500 chars): $($uiResult.Substring(0, [Math]::Min(500, $uiResult.Length)))"
        return $null
    }

    if ($parsed.error) {
        Write-Host "❌ $($parsed.error)"
        return $null
    }

    # Convert PSObject to hashtable for consistent downstream handling
    return @{
        is24x7 = [bool]$parsed.is24x7
        irSla  = @{ status = $parsed.irSla.status; remaining = $parsed.irSla.remaining }
        fdr    = @{ status = $parsed.fdr.status; remaining = $parsed.fdr.remaining }
        fwr    = @{ status = $parsed.fwr.status; remaining = $parsed.fwr.remaining }
        _source = "ui"
    }
}

# ============================================================
# Main execution: API first, UI fallback
# ============================================================
$obj = $null

if ($UseApi -and $TicketNumber) {
    Write-Host "🔵 Trying API path (msdfm_caseperfattributes)..."
    $obj = Get-KpiViaApi -Ticket $TicketNumber
    if ($obj) {
        Write-Host "✅ API path succeeded"
    } else {
        Write-Host "⚠️ API path failed — falling back to UI scraping"
    }
}

if (-not $obj) {
    Write-Host "🔵 Using UI scraping path..."
    $obj = Get-KpiViaUi -Ticket $TicketNumber
}

if (-not $obj) {
    Write-Host "❌ Failed to read Performance Indicators (both API and UI failed)"
    exit 1
}

# Output
$source = if ($obj._source) { " [source: $($obj._source)]" } else { "" }
Write-Host "📊 Performance Indicators$source"
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

# Return structured result for programmatic use (remove internal _source field)
$outputObj = @{
    is24x7 = $obj.is24x7
    irSla  = $obj.irSla
    fdr    = $obj.fdr
    fwr    = $obj.fwr
}
$outputObj | ConvertTo-Json -Compress

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
        source     = $obj._source
    }
    $meta["fdr"] = @{
        status     = $obj.fdr.status
        remaining  = $obj.fdr.remaining
        checkedAt  = $now
        source     = $obj._source
    }
    $meta["fwr"] = @{
        status     = $obj.fwr.status
        remaining  = $obj.fwr.remaining
        checkedAt  = $now
        source     = $obj._source
    }

    $meta | ConvertTo-Json -Depth 5 | Set-Content -Path $metaFile -Encoding UTF8
    Write-Host "💾 Meta saved: $metaFile (irSla=$($obj.irSla.status), source=$($obj._source))"
}
