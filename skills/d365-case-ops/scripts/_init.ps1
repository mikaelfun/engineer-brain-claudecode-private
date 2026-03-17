<#
.SYNOPSIS
    D365 Case Operations 公共初始化模块。
.DESCRIPTION
    所有脚本在开头 dot-source 此文件来设置公共环境。
    - UTF-8 编码（修复中文和 Emoji 乱码）
    - 公共辅助函数
.USAGE
    在脚本开头添加：. "$PSScriptRoot\_init.ps1"
#>

# ── UTF-8 编码设置 ──
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# ── 运行时产物隔离 ──
# playwright-cli 的日志/快照等运行产物统一输出到 runtime 目录，不污染 skill 目录。
# 若外部已设置 PLAYWRIGHT_MCP_OUTPUT_DIR（例如由客户端/平台注入），这里不覆盖。

# ── 当前工程师 D365 用户 ID ──
# Kun Fang 在 D365 中有两个 systemuser ID，活跃 case 在第二个 ID 下。
$script:D365CurrentUserId = "3841aa66-e0af-f011-bbd2-0022482589a6"
$script:D365UserName = "Kun Fang"

# ── Playwright 浏览器 profile 路径 ──
# --persistent --profile 使用绝对路径，避免在 cwd 创建浏览器数据
$script:D365BrowserProfile = Join-Path $env:TEMP "playwright-d365-profile"
$script:D365AppUrl = "https://onesupport.crm.dynamics.com/main.aspx?forceUCI=1&appid=101acb62-8d00-eb11-a813-000d3a8b3117"

if ([string]::IsNullOrWhiteSpace($env:PLAYWRIGHT_MCP_OUTPUT_DIR)) {
    $script:D365RuntimeDir = Join-Path $env:TEMP "d365-case-ops-runtime"
    $script:D365OutputDir = Join-Path $script:D365RuntimeDir ".playwright-cli"
    $env:PLAYWRIGHT_MCP_OUTPUT_DIR = $script:D365OutputDir
} else {
    $script:D365OutputDir = $env:PLAYWRIGHT_MCP_OUTPUT_DIR
    $script:D365RuntimeDir = Split-Path -Parent $script:D365OutputDir
}

if ($script:D365RuntimeDir -and -not (Test-Path $script:D365RuntimeDir)) {
    New-Item $script:D365RuntimeDir -ItemType Directory -Force | Out-Null
}
if ($script:D365OutputDir -and -not (Test-Path $script:D365OutputDir)) {
    New-Item $script:D365OutputDir -ItemType Directory -Force | Out-Null
}

<#
.SYNOPSIS
    清理运行时目录中的 Playwright 产物。
.DESCRIPTION
    对 `$TEMP\d365-case-ops-runtime\.playwright-cli` 目录执行轻量轮转：
    - 每类文件只保留最近 N 个（默认 10）
    - 删除超过 M 天的历史文件（默认 7 天）
    通过环境变量控制：
    - D365_WORKSPACE_HYGIENE_DISABLE=1 关闭清理
    - D365_PLAYWRIGHT_LOG_KEEP=<int> 调整保留数量
    - D365_PLAYWRIGHT_LOG_MAX_AGE_DAYS=<int> 调整过期天数
#>
function Invoke-WorkspaceHygiene {
    param(
        [int]$KeepPerPattern = 10,
        [int]$MaxAgeDays = 7
    )

    $runtimeDir = $env:PLAYWRIGHT_MCP_OUTPUT_DIR
    if (-not $runtimeDir -or -not (Test-Path $runtimeDir)) { return }

    $cutoff = (Get-Date).AddDays(-[Math]::Abs($MaxAgeDays))
    $patterns = @(
        "console-*.log",
        "page-*.yml"
    )

    $toDelete = @{}

    foreach ($pattern in $patterns) {
        $files = @(Get-ChildItem -Path $runtimeDir -File -Filter $pattern | Sort-Object LastWriteTime -Descending)
        if ($files.Count -eq 0) { continue }

        $overflow = if ($files.Count -gt $KeepPerPattern) { @($files | Select-Object -Skip $KeepPerPattern) } else { @() }
        foreach ($f in $overflow) { $toDelete[$f.FullName] = $true }

        foreach ($f in $files) {
            if ($f.LastWriteTime -lt $cutoff) {
                $toDelete[$f.FullName] = $true
            }
        }
    }

    $deleted = 0
    foreach ($path in $toDelete.Keys) {
        if (-not (Test-Path $path)) { continue }
        try {
            Remove-Item -Path $path -Force -ErrorAction Stop
            $deleted++
        } catch {
            Write-Host "⚠️ Workspace hygiene remove failed: $path | $($_.Exception.Message)"
        }
    }

    if ($deleted -gt 0) {
        Write-Host "🧹 Workspace hygiene: removed $deleted file(s) from runtime .playwright-cli"
    }
}

$disableHygiene = $env:D365_WORKSPACE_HYGIENE_DISABLE
if ($disableHygiene -ne '1') {
    $keep = 10
    $days = 7
    if ($env:D365_PLAYWRIGHT_LOG_KEEP -match '^\d+$') { $keep = [int]$env:D365_PLAYWRIGHT_LOG_KEEP }
    if ($env:D365_PLAYWRIGHT_LOG_MAX_AGE_DAYS -match '^\d+$') { $days = [int]$env:D365_PLAYWRIGHT_LOG_MAX_AGE_DAYS }
    Invoke-WorkspaceHygiene -KeepPerPattern $keep -MaxAgeDays $days
}

# ── 公共辅助函数 ──

<#
.SYNOPSIS
    执行 playwright-cli run-code 并返回 Result 字符串。
.DESCRIPTION
    封装 playwright-cli run-code 调用，自动提取 ### Result 内容。
    返回 $null 表示执行失败或无结果。
#>
function Invoke-PlaywrightCode {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Code
    )
    $raw = playwright-cli run-code $Code 2>&1 | Out-String
    if ($raw -match '### Result\s+"([\s\S]*?)"\s*(?:###|$)') {
        return $Matches[1] -replace '\\n', "`n" -replace '\\"', '"'
    }
    if ($raw -match '### Error\s*([\s\S]*?)(?:###|$)') {
        Write-Host "⚠️ Playwright error: $($Matches[1].Trim().Substring(0, [Math]::Min(200, $Matches[1].Trim().Length)))"
    }
    return $null
}

<#
.SYNOPSIS
    将纯文本转换为 Calibri 12pt HTML 段落。
.DESCRIPTION
    每行变成一个 <p>，空行变成 <p>&nbsp;</p>。末尾自动加一个空行。
    用于 CKEditor API 注入。
#>
function ConvertTo-EmailHtml {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Text,
        [switch]$NoTrailingBlank
    )
    $style = 'style="margin:0in;"'
    $spanOpen = '<span style="color:rgb(0,0,0);font-family:Calibri;font-size:12pt;">'
    $spanClose = '</span>'
    
    $lines = $Text -split "`r?`n"
    $parts = @()
    foreach ($line in $lines) {
        $escaped = $line -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;'
        if ([string]::IsNullOrWhiteSpace($escaped)) {
            $parts += "<p $style>${spanOpen}&nbsp;${spanClose}</p>"
        } else {
            $parts += "<p $style>${spanOpen}${escaped}${spanClose}</p>"
        }
    }
    if (-not $NoTrailingBlank) {
        $parts += "<p $style>${spanOpen}&nbsp;${spanClose}</p>"
    }
    return ($parts -join '')
}

<#
.SYNOPSIS
    转义字符串用于嵌入 JavaScript 单引号字符串。
#>
function ConvertTo-JsString {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Text
    )
    return $Text -replace '\\', '\\' -replace "'", "\'" -replace '"', '\"' -replace "`r`n", '\n' -replace "`n", '\n'
}

<#
.SYNOPSIS
    验证当前页面在 Case Form 上下文中，并可选切换到指定 tab。
.DESCRIPTION
    检查 Case Form 的标志性 tab（Summary/Timeline/Details）是否存在。
    如果不在 Case Form 上，输出错误信息并 exit 1。
    如果指定了 -Tab，自动点击切换到该 tab。
.PARAMETER Tab
    要切换到的 tab 名称（如 Summary、Timeline、Details）。不指定则只验证不切换。
#>
function Ensure-CaseFormContext {
    param(
        [string]$Tab = ''
    )
    $tabArg = if ($Tab) { "'" + $Tab + "'" } else { "''" }
    $js = @"
async page => {
  const summaryTab = page.locator('[role=tab][aria-label=Summary]');
  if (await summaryTab.count() === 0) return 'ERR:Not on Case Form. Use switch-case to navigate to the Case first.';
  
  const targetTab = $tabArg;
  if (targetTab) {
    const tab = page.locator('[role=tab][aria-label="' + targetTab + '"]');
    if (await tab.count() === 0) return 'ERR:Tab ' + targetTab + ' not found';
    const selected = await tab.getAttribute('aria-selected');
    if (selected !== 'true') {
      await tab.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }
  return 'OK';
}
"@
    $result = Invoke-PlaywrightCode -Code $js
    if ($result -eq 'OK') { return }
    if ($result -and $result.StartsWith('ERR:')) {
        Write-Host "❌ $($result.Substring(4))"
    } else {
        Write-Host "❌ Failed to verify Case Form context"
    }
    exit 1
}

<#
.SYNOPSIS
    通过浏览器上下文调用 D365 OData API。
.DESCRIPTION
    使用 page.evaluate + fetch() 在已登录的 D365 页面中发起 API 请求。
    浏览器自动携带 Cookie（包括 HttpOnly 的 CrmOwinAuth），无需额外认证。
    返回 PSObject（解析后的 JSON）或 $null（失败时）。
.PARAMETER Method
    HTTP 方法：GET、POST、PATCH、DELETE。默认 GET。
.PARAMETER Endpoint
    OData 端点路径（如 /api/data/v9.0/incidents?$top=1）。
.PARAMETER Body
    POST/PATCH 请求的 JSON body 字符串。
.PARAMETER FetchXml
    如果提供，自动附加到 Endpoint 作为 ?fetchXml= 参数（自动 URL encode）。
#>

# --- D365 Tab Guard ---
# playwright-cli executes JS on the *current* tab. If that tab is about:blank
# or a non-D365 page, relative API URLs (/api/data/v9.0/...) silently fail.
# This function ensures we're on a dynamics.com tab before any API call.
$script:_d365TabVerified = $false

<#
.SYNOPSIS
    强制用 persistent profile 重启浏览器并打开 D365。
.DESCRIPTION
    先 kill 所有 playwright 进程，再用 --persistent --profile 启动。
    这是解决浏览器/页面问题的最快路径。
#>
function Restart-D365Browser {
    Write-Host "🔄 Restarting D365 browser with persistent profile..."
    playwright-cli kill-all 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    $profilePath = $script:D365BrowserProfile
    playwright-cli open --persistent --profile $profilePath --browser msedge $script:D365AppUrl 2>&1 | Out-Null
    Start-Sleep -Seconds 8
    # Verify
    $tabCheck = playwright-cli tab-list 2>&1 | Out-String
    if ($tabCheck -match 'dynamics\.com' -and $tabCheck -notmatch 'login\.microsoftonline') {
        $script:_d365TabVerified = $true
        Write-Host "✅ D365 browser ready"
        return $true
    }
    Write-Host "⚠️ D365 browser may not be fully loaded (login page or timeout)"
    $script:_d365TabVerified = $false
    return $false
}

function Ensure-D365Tab {
    if ($script:_d365TabVerified) { return }
    $tabRaw = playwright-cli tab-list 2>&1 | Out-String

    # Case 1: already on D365
    if ($tabRaw -match '\(current\).*dynamics\.com') {
        $script:_d365TabVerified = $true
        return
    }
    # Case 2: D365 tab exists but not current — switch
    if ($tabRaw -match '(\d+):.*dynamics\.com') {
        $idx = $Matches[1]
        Write-Host "🔄 Switching to D365 tab (index $idx)..."
        playwright-cli tab-select $idx 2>&1 | Out-Null
        $script:_d365TabVerified = $true
        return
    }
    # Case 3: no D365 tab / no browser / login page — restart with persistent profile
    Restart-D365Browser | Out-Null
}

function Invoke-D365Api {
    param(
        [string]$Method = 'GET',
        [Parameter(Mandatory=$true)]
        [string]$Endpoint,
        [string]$Body = '',
        [string]$FetchXml = ''
    )

    # Inner function that does the actual API call
    function _DoApiCall {
        $escapedMethod = $Method
        $escapedBody = if ($Body) { $Body } else { '' }

        # --- Tab pre-check: ensure playwright-cli is on a D365 page ---
        Ensure-D365Tab

        # Build the actual fetch URL
        if ($FetchXml) {
            $fetchUrl = $Endpoint + $(if ($Endpoint.Contains('?')) { '&' } else { '?' }) + 'fetchXml=' + [System.Uri]::EscapeDataString($FetchXml)
        } else {
            $fetchUrl = $Endpoint
        }

        # Escape all values for safe JS string embedding (single-quote context)
        $jsMethod = $escapedMethod -replace '\\', '\\\\' -replace "'", "\'"
        $jsBody = $escapedBody -replace '\\', '\\\\' -replace "'", "\'" -replace "`r`n", '\n' -replace "`n", '\n'
        $jsFetchUrl = $fetchUrl -replace '\\', '\\\\' -replace "'", "\'"

        $jsTpl = @'
async page => {
  const result = await page.evaluate(async (args) => {
    const toMarker = (obj) => {
      const json = JSON.stringify(obj);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      return '__D365API__' + b64 + '__END__';
    };
    try {
      const headers = {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'odata.include-annotations="*"'
      };
      const opts = { method: args.method, headers };
      if (args.method !== 'GET' && args.body) {
        headers['Content-Type'] = 'application/json';
        opts.body = args.body;
      }
      const resp = await fetch(args.url, opts);
      const status = resp.status;
      if (status === 204) return toMarker({ _status: status, _entityId: resp.headers.get('OData-EntityId') || '' });
      if (status >= 400) {
        const errText = await resp.text().catch(() => '');
        return toMarker({ _status: status, _error: errText.substring(0, 1000) });
      }
      const data = await resp.json();
      data._status = status;
      return toMarker(data);
    } catch (e) {
      return toMarker({ _status: 0, _error: e.message || String(e) });
    }
  }, { method: '%%METHOD%%', url: '%%URL%%', body: '%%BODY%%' });
  return result;
}
'@
        $js = $jsTpl -replace '%%METHOD%%', $jsMethod -replace '%%URL%%', $jsFetchUrl -replace '%%BODY%%', $jsBody

        $raw = playwright-cli run-code $js 2>&1 | Out-String

        # Primary parser: robust marker-based base64 payload
        if ($raw -match '__D365API__([A-Za-z0-9+/=]+)__END__') {
            $b64 = $Matches[1]
            try {
                $jsonStr = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
                $obj = $jsonStr | ConvertFrom-Json
                if (($obj.PSObject.Properties.Name -contains '_status') -and ($obj._status -ge 400 -or $obj._status -eq 0)) {
                    Write-Host "⚠️ API error (HTTP $($obj._status)): $($obj._error)"
                    return $null
                }
                return $obj
            } catch {
                Write-Host "⚠️ API JSON parse error: $($_.Exception.Message)"
                return $null
            }
        }

        # Compatibility parser: support legacy raw JSON string result format
        if ($raw -match '### Result\s+"([\s\S]*?)"\s*(?:###|$)') {
            $legacyJson = $Matches[1] -replace '\\n', "`n" -replace '\\"', '"' -replace '\\\\', '\'
            try {
                $legacyObj = $legacyJson | ConvertFrom-Json
                if (($legacyObj.PSObject.Properties.Name -contains '_status') -and ($legacyObj._status -ge 400 -or $legacyObj._status -eq 0)) {
                    Write-Host "⚠️ API error (HTTP $($legacyObj._status)): $($legacyObj._error)"
                    return $null
                }
                return $legacyObj
            } catch {
                Write-Host "⚠️ API JSON parse error (legacy format): $($_.Exception.Message)"
                return $null
            }
        }

        if ($raw -match '### Error') {
            Write-Host "⚠️ API call failed (playwright error)"
            return $null
        }

        Write-Host "⚠️ API call failed (no result marker)"
        return $null
    }

    # --- First attempt ---
    $result = _DoApiCall
    if ($null -ne $result) { return $result }

    # --- First attempt failed: invalidate tab cache and retry with browser restart ---
    Write-Host "🔄 First API attempt failed. Restarting browser and retrying..."
    $script:_d365TabVerified = $false
    $restarted = Restart-D365Browser
    if (-not $restarted) {
        Write-Host "❌ Browser restart failed. Giving up."
        return $null
    }

    # --- Second attempt ---
    $result2 = _DoApiCall
    if ($null -ne $result2) { return $result2 }

    Write-Host "❌ API call failed after browser restart retry"
    return $null
}

<#
.SYNOPSIS
    获取或缓存 incidentid（Case GUID），通过 ticketnumber 查询。
.DESCRIPTION
    从临时文件缓存读取 ticketnumber → incidentid 映射。
    如果缓存未命中，通过 OData API 查询并缓存。
    返回 incidentid 字符串或 $null。
.PARAMETER TicketNumber
    Case 编号（如 2603040040000895）。
#>
function Get-IncidentId {
    param(
        [Parameter(Mandatory=$true)]
        [string]$TicketNumber
    )
    $cacheFile = Join-Path $env:TEMP "d365-case-context.json"

    # Try cache
    if (Test-Path $cacheFile) {
        try {
            $cache = Get-Content $cacheFile -Raw | ConvertFrom-Json
            if ($cache.ticketnumber -eq $TicketNumber -and $cache.incidentid) {
                return $cache.incidentid
            }
        } catch {}
    }

    # Query API
    $fetchXml = @"
<fetch top="1">
  <entity name="incident">
    <attribute name="incidentid"/>
    <attribute name="ticketnumber"/>
    <attribute name="title"/>
    <filter>
      <condition attribute="ticketnumber" operator="eq" value="$TicketNumber"/>
    </filter>
  </entity>
</fetch>
"@
    $result = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchXml
    if ($result -and $result.value -and $result.value.Count -gt 0) {
        $id = $result.value[0].incidentid
        # Save to cache
        @{ ticketnumber = $TicketNumber; incidentid = $id; title = $result.value[0].title } | ConvertTo-Json | Set-Content $cacheFile -Encoding UTF8
        return $id
    }
    return $null
}

<#
.SYNOPSIS
    获取当前打开 Case 的 incidentid。
.DESCRIPTION
    优先读缓存。缓存未命中则从页面 URL 或 Case Form 提取 ticketnumber，再通过 API 查询。
    返回 incidentid 字符串或 $null。
#>
<#
.SYNOPSIS
    批量并行执行多个 D365 OData API 调用（单次 playwright-cli 调用 + Promise.all）。
.DESCRIPTION
    接收一个请求数组，每个请求包含 Method/Endpoint/Body/FetchXml。
    在浏览器内用 Promise.all 并行执行所有 fetch，单次 playwright-cli 往返。
    返回结果数组（与输入顺序一致），每个元素是解析后的 PSObject 或 $null。
.PARAMETER Requests
    请求数组。每个元素是 hashtable: @{ Endpoint=...; Method=...; Body=...; FetchXml=... }
    Method 默认 GET，Body/FetchXml 可选。
.EXAMPLE
    $results = Invoke-D365ApiBatch @(
        @{ Endpoint = "/api/data/v9.0/incidents($id)" },
        @{ Endpoint = "/api/data/v9.0/contacts($cid)?`$select=emailaddress1" },
        @{ Endpoint = "/api/data/v9.0/emails"; FetchXml = $fetchXml }
    )
#>
function Invoke-D365ApiBatch {
    param(
        [Parameter(Mandatory=$true)]
        [array]$Requests
    )

    # Build requests JSON array for injection into JS
    $reqList = @()
    foreach ($r in $Requests) {
        $method = if ($r.Method) { $r.Method } else { 'GET' }
        $endpoint = $r.Endpoint
        $body = if ($r.Body) { $r.Body } else { '' }
        if ($r.FetchXml) {
            $endpoint = $endpoint + $(if ($endpoint.Contains('?')) { '&' } else { '?' }) + 'fetchXml=' + [System.Uri]::EscapeDataString($r.FetchXml)
        }
        $reqList += @{ method = $method; url = $endpoint; body = $body }
    }
    $reqJson = ($reqList | ConvertTo-Json -Compress -Depth 5)
    # Escape for JS single-quote string
    $reqJsonEscaped = $reqJson -replace '\\', '\\\\' -replace "'", "\'"

    $js = @"
async page => {
  const requests = JSON.parse('$reqJsonEscaped');
  const results = await page.evaluate(async (reqs) => {
    const toB64 = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    const doFetch = async (r) => {
      try {
        const headers = {
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Prefer': 'odata.include-annotations="*"'
        };
        const opts = { method: r.method, headers };
        if (r.method !== 'GET' && r.body) {
          headers['Content-Type'] = 'application/json';
          opts.body = r.body;
        }
        const resp = await fetch(r.url, opts);
        if (resp.status === 204) return { _status: 204 };
        if (resp.status >= 400) {
          const t = await resp.text().catch(() => '');
          return { _status: resp.status, _error: t.substring(0, 500) };
        }
        const data = await resp.json();
        data._status = resp.status;
        return data;
      } catch (e) {
        return { _status: 0, _error: e.message || String(e) };
      }
    };
    const all = await Promise.all(reqs.map(r => doFetch(r)));
    return '__D365BATCH__' + toB64(all) + '__END__';
  }, requests);
  return results;
}
"@

    $raw = playwright-cli run-code $js 2>&1 | Out-String

    if ($raw -match '__D365BATCH__([A-Za-z0-9+/=]+)__END__') {
        $b64 = $Matches[1]
        try {
            $jsonStr = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
            $arr = $jsonStr | ConvertFrom-Json
            $results = @()
            foreach ($item in $arr) {
                if ($item._status -ge 400 -or $item._status -eq 0) {
                    Write-Host "⚠️ Batch API error (HTTP $($item._status)): $($item._error)"
                    $results += $null
                } else {
                    $results += $item
                }
            }
            return $results
        } catch {
            Write-Host "⚠️ Batch API JSON parse error: $($_.Exception.Message)"
            return $null
        }
    }

    Write-Host "⚠️ Batch API call failed (no result marker)"
    return $null
}

function Get-CurrentCaseId {
    $cacheFile = Join-Path $env:TEMP "d365-case-context.json"

    # Try cache first
    if (Test-Path $cacheFile) {
        try {
            $cache = Get-Content $cacheFile -Raw | ConvertFrom-Json
            if ($cache.incidentid) { return $cache.incidentid }
        } catch {}
    }

    # Extract ticketnumber from the page (Case tab or header)
    $ticketNumber = Invoke-PlaywrightCode -Code @'
async page => {
  // Try: get from tab list (tab name is the case number)
  const tabs = await page.locator('[role=tab]').all();
  for (const tab of tabs) {
    const label = await tab.getAttribute('aria-label').catch(() => '') || '';
    if (/^\d{10,}$/.test(label.trim())) return label.trim();
  }
  // Try: get from header text
  const headerText = await page.locator('text=/Case number/').first().locator('../..').textContent().catch(() => '');
  const m = headerText.match(/(\d{13,})/);
  if (m) return m[1];
  return '';
}
'@
    if (-not $ticketNumber) { return $null }
    return Get-IncidentId -TicketNumber $ticketNumber
}
