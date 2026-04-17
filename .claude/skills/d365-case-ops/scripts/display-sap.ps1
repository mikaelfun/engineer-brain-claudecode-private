<#
.SYNOPSIS
    显示所有 Open Case 的 SAP 信息及层级深度。
.DESCRIPTION
    通过 OData API 查询 D365 实例中 "我的" Open Case，
    列出每个 Case 的 SAP 路径和层级深度，并标记不足 4 层的 Case。

    默认同时查询两个实例（onesupport + eudfm），自动依次打开/切换浏览器。
    指定 -Url 时只查询该实例。
.PARAMETER Url
    D365 实例 URL。不指定时默认检查两个实例。
.PARAMETER MinDepth
    最低要求深度，默认 4。低于此值的 Case 会被标记。
.EXAMPLE
    pwsh scripts/display-sap.ps1                              # 查询两个实例
    pwsh scripts/display-sap.ps1 -Url "https://eudfm.crm4.dynamics.com/"  # 只查询一个
    pwsh scripts/display-sap.ps1 -MinDepth 3
#>
param(
    [string]$Url = '',
    [int]$MinDepth = 4
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

# ── 默认两个实例 ──
$DefaultInstances = @(
    "https://onesupport.crm.dynamics.com/",
    "https://eudfm.crm4.dynamics.com/"
)

$instancesToCheck = if ($Url) { @($Url) } else { $DefaultInstances }

# ── 单实例查询函数 ──
function Get-SapReport {
    param([string]$InstanceUrl)

    $instanceHost = ([uri]$InstanceUrl).Host

    # Ensure browser is on the right instance
    $currentUrl = Invoke-PlaywrightCode -Code 'async page => page.url()'
    if (-not $currentUrl -or $currentUrl -eq 'about:blank') {
        Write-Host "🔵 Opening D365: $InstanceUrl"
        playwright-cli open $InstanceUrl --browser=msedge --persistent 2>&1 | Out-Null
        Start-Sleep 8
    } elseif ($currentUrl -notmatch [regex]::Escape($instanceHost)) {
        Write-Host "🔵 Switching to $InstanceUrl ..."
        # Navigate in current page instead of close/reopen (preserves session, faster)
        $escapedUrl = ConvertTo-JsString -Text $InstanceUrl
        $navJs = "async page => { await page.goto('$escapedUrl', { waitUntil: 'domcontentloaded', timeout: 30000 }); }"
        playwright-cli run-code $navJs 2>&1 | Out-Null
        Start-Sleep 5
    }

    Write-Host "🔵 Checking SAP depth on $instanceHost ..."

    # 查询我的 Open Cases + SAP GUID
    $fetchCases = @'
<fetch>
  <entity name="incident">
    <attribute name="ticketnumber"/>
    <attribute name="title"/>
    <attribute name="msdfm_supportareapathid"/>
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="msdfm_assignedto" operator="eq-userid"/>
    </filter>
    <order attribute="ticketnumber" descending="true"/>
  </entity>
</fetch>
'@

    $cases = Invoke-D365Api -Endpoint "/api/data/v9.0/incidents" -FetchXml $fetchCases
    if (-not $cases -or -not $cases.value) {
        Write-Host "   ⚠️ No open cases found on $instanceHost."
        return @()
    }

    Write-Host "   Found $($cases.value.Count) open case(s) on $instanceHost."

    # 逐个查询 SAP entity 获取深度信息
    $results = @()
    $sapCache = @{}

    foreach ($c in $cases.value) {
        $tn = $c.ticketnumber
        $title = if ([string]::IsNullOrEmpty($c.title)) { '(no title)' } elseif ($c.title.Length -gt 50) { $c.title.Substring(0, 50) + '...' } else { $c.title }
        $sapGuid = $c._msdfm_supportareapathid_value
        $sapLeaf = $c.'_msdfm_supportareapathid_value@OData.Community.Display.V1.FormattedValue'

        if (-not $sapGuid) {
            $results += [PSCustomObject]@{ Instance = $instanceHost; Case = $tn; Title = $title; SAP = '(none)'; Depth = 0; Status = '❌ NO SAP' }
            continue
        }

        if ($sapCache.ContainsKey($sapGuid)) {
            $sapInfo = $sapCache[$sapGuid]
        } else {
            $sapFetch = @"
<fetch top="1">
  <entity name="msdfm_supportareapath">
    <attribute name="msdfm_name"/>
    <attribute name="msdfm_type"/>
    <attribute name="msdfm_productfamily"/>
    <attribute name="msdfm_productname"/>
    <attribute name="msdfm_productversion"/>
    <attribute name="msdfm_category"/>
    <filter>
      <condition attribute="msdfm_supportareapathid" operator="eq" value="$sapGuid"/>
    </filter>
  </entity>
</fetch>
"@
            $sapResult = Invoke-D365Api -Endpoint "/api/data/v9.0/msdfm_supportareapaths" -FetchXml $sapFetch
            if ($sapResult -and $sapResult.value -and $sapResult.value.Count -gt 0) {
                $s = $sapResult.value[0]
                $fam  = $s.'_msdfm_productfamily_value@OData.Community.Display.V1.FormattedValue'
                $prod = $s.'_msdfm_productname_value@OData.Community.Display.V1.FormattedValue'
                $ver  = $s.'_msdfm_productversion_value@OData.Community.Display.V1.FormattedValue'
                $cat  = $s.'_msdfm_category_value@OData.Community.Display.V1.FormattedValue'
                $name = $s.msdfm_name
                $typeCode = $s.msdfm_type

                # Depth from msdfm_type: ProductFamily=1, ProductName=2, ProductVersion=3, Category=4
                $typeDepthMap = @{ '847050000' = 1; '847050001' = 2; '847050002' = 3; '847050003' = 4 }
                $depth = if ($typeDepthMap.ContainsKey("$typeCode")) { $typeDepthMap["$typeCode"] } else { 1 }

                # Build display path based on type depth
                switch ($depth) {
                    1 { $pathParts = @($name) }
                    2 { $pathParts = @($fam, $name) }
                    3 { $pathParts = @($fam, $prod, $name) }
                    4 {
                        $pathParts = @($fam, $prod)
                        if ($ver) { $pathParts += $ver } elseif ($cat -and $cat -ne $name) { $pathParts += $cat }
                        $pathParts += $name
                    }
                }
                $fullPath = ($pathParts | Where-Object { $_ }) -join '/'

                $sapInfo = @{ Path = $fullPath; Depth = $depth }
            } else {
                $sapInfo = @{ Path = $sapLeaf; Depth = 1 }
            }
            $sapCache[$sapGuid] = $sapInfo
        }

        $status = if ($sapInfo.Depth -ge $MinDepth) { '✅' } else { '⚠️' }
        $results += [PSCustomObject]@{ Instance = $instanceHost; Case = $tn; Title = $title; SAP = $sapInfo.Path; Depth = $sapInfo.Depth; Status = $status }
    }

    return $results
}

# ── 依次查询所有实例 ──
$allResults = @()
foreach ($inst in $instancesToCheck) {
    $instResults = @(Get-SapReport -InstanceUrl $inst)
    $allResults += $instResults
}

# ── 输出合并报告 ──
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════════"
Write-Host "📋 SAP Report"
Write-Host "   $($allResults.Count) case(s) across $($instancesToCheck.Count) instance(s)"
Write-Host "══════════════════════════════════════════════════════════════════════"

# 按实例分组，表格式输出（全量列表）
$grouped = $allResults | Group-Object Instance
foreach ($g in $grouped) {
    Write-Host ""
    Write-Host "── $($g.Name) ($($g.Count) cases) ──"
    Write-Host ("  {0,-3} {1,-20} {2,-7} {3}" -f "", "Case #", "Depth", "SAP Path")
    Write-Host ("  {0,-3} {1,-20} {2,-7} {3}" -f "───", "────────────────────", "───────", "──────────────────────────────────────")
    foreach ($r in $g.Group) {
        Write-Host ("  {0,-3} {1,-20} {2,-7} {3}" -f $r.Status, $r.Case, "$($r.Depth)L", $r.SAP)
    }
}

# 汇总
$notOk = @($allResults | Where-Object { $_.Depth -lt $MinDepth })
Write-Host ""
Write-Host "──────────────────────────────────────────────────────────────────────"
if ($notOk.Count -eq 0) {
    Write-Host "  ✅ All $($allResults.Count) case(s) have SAP depth >= $MinDepth. No action needed."
} else {
    Write-Host ""
    Write-Host "  ⚠️ $($notOk.Count) case(s) not yet $MinDepth levels — please update SAP:"
    foreach ($f in $notOk) {
        Write-Host "     $($f.Case)  [$($f.Instance)]  depth $($f.Depth)  SAP: $($f.SAP)"
    }
}
Write-Host ""
