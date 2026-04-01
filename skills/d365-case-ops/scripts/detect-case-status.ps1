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
.PARAMETER SkipClosureCheck
    跳过 closure 邮件辅证检查（加速执行）。
.EXAMPLE
    pwsh scripts/detect-case-status.ps1 -CasesRoot ./cases
    pwsh scripts/detect-case-status.ps1 -CasesRoot ./cases -CaseNumbers "2602250040000327,2603120040001498"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$CasesRoot,
    [string]$CaseNumbers = '',
    [switch]$SkipClosureCheck
)

. "$PSScriptRoot\_init.ps1"
$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot

# ── Step 1: Get D365 active case list ──
Write-Host "🔵 Step 1: Fetching D365 active case list..."
$activeJson = & pwsh -NoProfile -File "$scriptDir/list-active-cases.ps1" -OutputJson 2>&1
$activeTickets = @{}
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
    Write-Host "✅ All local cases are still active in D365."
    Write-Output "[]"
    exit 0
}

Write-Host "⚠️ Found $($notActive.Count) case(s) NOT in D365 active list: $($notActive -join ', ')"

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

    if ($closedTickets.ContainsKey($cn)) {
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
