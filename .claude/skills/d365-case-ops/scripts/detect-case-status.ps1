<#
.SYNOPSIS
    检测本地 cases/active/ 中的 case 是否已在 D365 归档或转移。
.DESCRIPTION
    对比 D365 active case 列表与本地 active/ 目录：
    1. 获取 D365 active cases（list-active-cases.ps1 -OutputJson）
    2. 扫描本地 active/ 目录的 case numbers
    3. 找出不在 active list 中的本地 case
    4. 查询 D365 closed cases 确认状态
    5. 分类：Resolved/Cancelled → archived，找不到 → transferred
    6. （可选）检查 closure 邮件辅证

    输出 JSON 数组，每个元素包含 caseNumber, status, reason, closureEmailEvidence。
.PARAMETER CasesRoot
    Case 数据根路径（如 ./cases）。
.PARAMETER CaseNumbers
    可选：只检测指定的 case numbers（逗号分隔或数组）。不指定则扫描所有 active/ 目录。
.PARAMETER ActiveCasesJson
    可选：直接传入 list-active-cases.ps1 -OutputJson 的 JSON 输出。
    传入后跳过内部调用 list-active-cases.ps1，避免重复 OData 查询（节省 ~8s）。
.PARAMETER SkipClosureCheck
    跳过 closure 邮件辅证检查（加速执行）。
.EXAMPLE
    pwsh scripts/detect-case-status.ps1 -CasesRoot ./cases
    pwsh scripts/detect-case-status.ps1 -CasesRoot ./cases -CaseNumbers "2602250040000327,2603120040001498"
    # 传入已有的 active cases JSON 避免重复查询:
    pwsh scripts/detect-case-status.ps1 -CasesRoot ./cases -ActiveCasesJson '[{"ticketnumber":"123",...}]'
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$CasesRoot,
    [string]$CaseNumbers = '',
    [string]$ActiveCasesJson = '',
    [switch]$SkipClosureCheck
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot

# ── Resolve patrolDir from config.json (must be configured) ──
$_projRoot = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path
$_configPath = Join-Path $_projRoot "config.json"
if (-not (Test-Path $_configPath)) {
    Write-Error "config.json not found at $_configPath"
    exit 1
}
$_cfg = Get-Content $_configPath -Raw | ConvertFrom-Json
if (-not $_cfg.patrolDir) {
    Write-Error "patrolDir not configured in config.json"
    exit 1
}
$_patrolDir = if ([IO.Path]::IsPathRooted($_cfg.patrolDir)) { $_cfg.patrolDir } else { Join-Path $_projRoot $_cfg.patrolDir }

# ── Step 1: Get D365 active case list ──
$activeTickets = @{}
if ($ActiveCasesJson) {
    # Caller already has the data — skip redundant OData call (~8s saved)
    Write-Host "🔵 Step 1: Using pre-fetched active case list..."
    try {
        $parsed = $ActiveCasesJson | ConvertFrom-Json
        foreach ($c in $parsed) {
            if ($c.ticketnumber) { $activeTickets[$c.ticketnumber] = $true }
        }
    } catch {
        Write-Host "⚠️ Failed to parse ActiveCasesJson: $($_.Exception.Message). Falling back to OData query..."
        $ActiveCasesJson = ''  # clear to trigger fallback below
    }
}
if (-not $ActiveCasesJson) {
    Write-Host "🔵 Step 1: Fetching D365 active case list..."
    $activeJson = & pwsh -NoProfile -File "$scriptDir/list-active-cases.ps1" -OutputJson 2>&1
    try {
        $activeCases = $activeJson | Where-Object { $_ -is [string] -and $_.Trim().StartsWith('[') } | Select-Object -Last 1
        if ($activeCases) {
            $parsed = $activeCases | ConvertFrom-Json
            foreach ($c in $parsed) {
                if ($c.ticketnumber) { $activeTickets[$c.ticketnumber] = $true }
            }
        }
    } catch {
        Write-Host "⚠️ Failed to parse active case list: $($_.Exception.Message)"
    }
}
Write-Host "   Active cases in D365: $($activeTickets.Count)"

# ── Step 2: Determine local case numbers to check ──
$localCases = @()
if ($CaseNumbers) {
    $localCases = $CaseNumbers -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
} else {
    $activeDir = Join-Path $CasesRoot "active"
    if (Test-Path $activeDir) {
        $localCases = @(Get-ChildItem -Path $activeDir -Directory | Where-Object { $_.Name -match '^\d{10,}$' } | ForEach-Object { $_.Name })
    }
}

if ($localCases.Count -eq 0) {
    Write-Host "ℹ️ No local cases to check."
    Write-Output "[]"
    exit 0
}

Write-Host "   Local active cases: $($localCases.Count)"

# ── Step 3: Find cases NOT in active list ──
$notActive = @()
foreach ($cn in $localCases) {
    if (-not $activeTickets.ContainsKey($cn)) {
        $notActive += $cn
    }
}

if ($notActive.Count -eq 0) {
    Write-Host "✅ All local cases are still active in D365. Checking AR cascade..."
}

# ── Step 3a: AR cascade — archive AR cases whose main case is being archived ──
$arCascaded = @()
$casesToCheck = if ($CaseNumbers) { $localCases } else {
    # When scanning all: check cases that ARE still in D365 active list
    @($localCases | Where-Object { $activeTickets.ContainsKey($_) })
}

foreach ($cn in $casesToCheck) {
    if ($cn.Length -ge 19) {
        # This is an AR case — extract main case ID (first 16 digits)
        $mainId = $cn.Substring(0, 16)

        # Check 1: main case is being archived in THIS run
        $mainInNotActive = $notActive -contains $mainId

        # Check 2: main case already archived (resolved/closed) previously
        # NOTE: transfer/ does NOT trigger cascade — main case transferred to another engineer
        # does not mean the AR case should be archived (AR may still be owned by us)
        $mainInArchived = $false
        $archivedDir = Join-Path $CasesRoot "archived" $mainId
        if (Test-Path $archivedDir) {
            $mainInArchived = $true
        }

        # Check 3: Only cascade if Check 1 or Check 2 confirmed.
        # Do NOT cascade based on active list alone — main case may be assigned to another engineer
        # and not appear in our active list. Querying D365 API for statecode is too slow for batch operations.
        # The AR case itself will be detected as resolved when it leaves our active list in a future patrol.

        if ($mainInNotActive -or $mainInArchived) {
            if ($notActive -notcontains $cn) {
                $notActive += $cn
                $arCascaded += $cn
                $reason = if ($mainInNotActive) { "main case $mainId being archived in this run" }
                          else { "main case $mainId already in archived/transfer" }
                Write-Host "   🔗 AR $cn → cascaded archive ($reason)"
            }
        }
    }
}

if ($arCascaded.Count -gt 0) {
    Write-Host "   🔗 AR cascade: $($arCascaded.Count) AR case(s) will be archived with their main case"
}

if ($notActive.Count -eq 0) {
    Write-Host "✅ No cases need archiving."
    Write-Output "[]"
    exit 0
}

Write-Host "⚠️ Total $($notActive.Count) case(s) to archive/transfer: $($notActive -join ', ')"

# ── Step 4: Query closed cases to classify ──
Write-Host "🔵 Step 4: Fetching D365 closed case list for classification..."
$closedJson = & pwsh -NoProfile -File "$scriptDir/list-closed-cases.ps1" -OutputJson 2>&1
$closedTickets = @{}
try {
    $closedCases = $closedJson | Where-Object { $_ -is [string] -and $_.Trim().StartsWith('[') } | Select-Object -Last 1
    if ($closedCases) {
        $parsed = $closedCases | ConvertFrom-Json
        foreach ($c in $parsed) {
            if ($c.ticketnumber) {
                $closedTickets[$c.ticketnumber] = @{
                    statuscode = $c.statuscode
                    modifiedon = $c.modifiedon
                }
            }
        }
    }
} catch {
    Write-Host "⚠️ Failed to parse closed case list: $($_.Exception.Message)"
}
Write-Host "   Closed cases in D365: $($closedTickets.Count)"

# ── Step 5: Classify each not-active case ──
$results = @()
foreach ($cn in $notActive) {
    $entry = @{
        caseNumber = $cn
        status = ""
        reason = ""
        closureEmailEvidence = $null
    }

    if ($arCascaded -contains $cn) {
        # AR cascade: main case archived → AR follows
        $mainId = $cn.Substring(0, 16)
        $entry.status = "archived"
        $entry.reason = "AR cascade: main case $mainId resolved/archived"
    } elseif ($closedTickets.ContainsKey($cn)) {
        $entry.status = "archived"
        $entry.reason = "D365 status: $($closedTickets[$cn].statuscode) (closed on $($closedTickets[$cn].modifiedon))"
    } else {
        $entry.status = "transferred"
        $entry.reason = "Not found in active or closed case lists — likely transferred to another engineer"
    }

    # ── Step 5a: Closure email evidence (optional) ──
    if (-not $SkipClosureCheck) {
        $emailsPath = Join-Path $CasesRoot "active" $cn "emails.md"
        if (Test-Path $emailsPath) {
            try {
                $emailContent = Get-Content $emailsPath -Raw -Encoding UTF8
                # Find the last engineer-sent email (look for "From: Kun Fang" or similar patterns)
                $engineerName = $script:D365UserName
                $closureKeywords = @(
                    "Problem Solved", "resolved", "closure", "close this case",
                    "closing this case", "已关闭", "已解决", "关闭此工单",
                    "case will be closed", "proceed to close", "auto-closure"
                )

                # Extract last block that looks like it's from the engineer
                $blocks = $emailContent -split '(?m)^---\s*$'
                $lastEngineerBlock = ""
                for ($i = $blocks.Count - 1; $i -ge 0; $i--) {
                    if ($blocks[$i] -match [regex]::Escape($engineerName)) {
                        $lastEngineerBlock = $blocks[$i]
                        break
                    }
                }

                if ($lastEngineerBlock) {
                    foreach ($kw in $closureKeywords) {
                        if ($lastEngineerBlock -match [regex]::Escape($kw)) {
                            $entry.closureEmailEvidence = "Last engineer email contains closure keyword: '$kw'"
                            break
                        }
                    }
                }
            } catch {
                # Non-fatal — skip email check
            }
        }
    }

    $results += $entry
    $icon = if ($entry.status -eq "archived") { "📦" } else { "🔀" }
    Write-Host "   $icon $cn → $($entry.status): $($entry.reason)"
    if ($entry.closureEmailEvidence) {
        Write-Host "      📧 $($entry.closureEmailEvidence)"
    }
}

# ── Output JSON ──
Write-Output ($results | ConvertTo-Json -Compress -Depth 5)
