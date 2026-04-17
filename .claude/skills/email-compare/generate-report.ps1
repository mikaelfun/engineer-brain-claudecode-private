param(
    [Parameter(Mandatory=$true)]
    [string]$McpResultsPath,

    [Parameter(Mandatory=$true)]
    [string]$ComResultsPath,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "🔵 Loading results..."

if (-not (Test-Path $McpResultsPath)) {
    Write-Host "❌ ERR: MCP results not found: $McpResultsPath"
    exit 1
}
if (-not (Test-Path $ComResultsPath)) {
    Write-Host "❌ ERR: COM results not found: $ComResultsPath"
    exit 1
}

$mcpData = Get-Content $McpResultsPath -Raw | ConvertFrom-Json
$comData = Get-Content $ComResultsPath -Raw | ConvertFrom-Json

Write-Host "  MCP: $($mcpData.emailCount) emails, $($mcpData.duration_ms)ms"
Write-Host "  COM: $($comData.emailCount) emails, $($comData.duration_ms)ms"

# ── Step 2: 邮件匹配逻辑 ──────────────────────────────────────────────────────

Write-Host "🔵 Matching emails..."

function Get-MatchKey {
    param([object]$Email)
    $subj = if ($Email.subject.Length -gt 50) { $Email.subject.Substring(0, 50) } else { $Email.subject }
    $subj = $subj.Trim().ToLower()
    $date = ""
    try {
        $dt = [datetime]::Parse($Email.sentDate)
        $date = $dt.ToString("yyyy-MM-dd HH:mm")
    } catch {
        $date = $Email.sentDate
    }
    return "$subj|$date"
}

$mcpIndex = @{}
foreach ($email in $mcpData.emails) {
    $key = Get-MatchKey -Email $email
    if (-not $mcpIndex.ContainsKey($key)) {
        $mcpIndex[$key] = $email
    }
}

$comIndex = @{}
foreach ($email in $comData.emails) {
    $key = Get-MatchKey -Email $email
    if (-not $comIndex.ContainsKey($key)) {
        $comIndex[$key] = $email
    }
}

$inBoth    = @()
$onlyInMcp = @()
$onlyInCom = @()

foreach ($key in $mcpIndex.Keys) {
    if ($comIndex.ContainsKey($key)) {
        $inBoth += @{ mcp = $mcpIndex[$key]; com = $comIndex[$key]; key = $key }
    } else {
        $onlyInMcp += $mcpIndex[$key]
    }
}

foreach ($key in $comIndex.Keys) {
    if (-not $mcpIndex.ContainsKey($key)) {
        $onlyInCom += $comIndex[$key]
    }
}

Write-Host "  Matched: $($inBoth.Count) | Only MCP: $($onlyInMcp.Count) | Only COM: $($onlyInCom.Count)"

# ── Step 3: 内容对比分析 ──────────────────────────────────────────────────────

Write-Host "🔵 Analyzing differences..."

$mcpMs = $mcpData.duration_ms
$comMs = $comData.duration_ms
$speedRatio = if ($comMs -gt 0 -and $mcpMs -gt 0) {
    if ($mcpMs -gt $comMs) {
        "COM {0:F1}x faster" -f ($mcpMs / $comMs)
    } else {
        "MCP {0:F1}x faster" -f ($comMs / $mcpMs)
    }
} else { "N/A" }

$mcpAvgBody = if ($mcpData.emails.Count -gt 0) {
    [int](($mcpData.emails | Measure-Object -Property bodyLength -Average).Average)
} else { 0 }
$comAvgBody = if ($comData.emails.Count -gt 0) {
    [int](($comData.emails | Measure-Object -Property bodyLength -Average).Average)
} else { 0 }

$mcpFields = @("subject", "from", "to", "cc", "sentDate", "bodyLength", "attachmentCount", "attachmentNames")
$comFields = @("subject", "from", "fromName", "to", "cc", "bcc", "sentDate", "receivedDate", "bodyLength", "htmlBodyLength", "attachmentCount", "attachmentNames", "size", "folder")
$mcpMissing = $comFields | Where-Object { $_ -notin $mcpFields }
$comMissing  = $mcpFields | Where-Object { $_ -notin $comFields }

# ── Step 4: 构建报告 JSON + console summary 输出 ──────────────────────────────

$report = @{
    caseNumber = $mcpData.caseNumber
    timestamp  = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
    mailMcp    = @{
        duration_ms    = $mcpData.duration_ms
        emailCount     = $mcpData.emailCount
        totalBodyBytes = $mcpData.totalBodyBytes
        searchMethod   = $mcpData.searchMethod
    }
    outlookCom = @{
        duration_ms     = $comData.duration_ms
        emailCount      = $comData.emailCount
        totalBodyBytes  = $comData.totalBodyBytes
        searchMethod    = $comData.searchMethod
        foldersSearched = $comData.foldersSearched
    }
    comparison = @{
        matchMethod       = "Subject(前50字符) + SentDate(精确到分钟)"
        inBothCount       = $inBoth.Count
        onlyInMcpCount    = $onlyInMcp.Count
        onlyInComCount    = $onlyInCom.Count
        onlyInMcpSubjects = @($onlyInMcp | ForEach-Object { $_.subject })
        onlyInComSubjects = @($onlyInCom | ForEach-Object { $_.subject })
        speedComparison   = @{
            mcpMs = $mcpMs
            comMs = $comMs
            ratio = $speedRatio
        }
        contentComparison = @{
            mcpAvgBodyLength = $mcpAvgBody
            comAvgBodyLength = $comAvgBody
        }
        fieldCoverage = @{
            mcpFields  = $mcpFields
            comFields  = $comFields
            mcpMissing = @($mcpMissing)
            comMissing = @($comMissing)
        }
    }
}

$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}
$json = $report | ConvertTo-Json -Depth 5 -Compress:$false
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

$totalMcpKB = [math]::Round($mcpData.totalBodyBytes / 1024, 1)
$totalComKB = [math]::Round($comData.totalBodyBytes / 1024, 1)

Write-Host ""
Write-Host "=========================================="
Write-Host "  Email Fetch Comparison: Case $($mcpData.caseNumber)"
Write-Host "=========================================="
Write-Host ""
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "", "Mail MCP", "Outlook COM", "Diff")
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "Speed", "${mcpMs}ms", "${comMs}ms", $speedRatio)
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "Emails Found", $mcpData.emailCount, $comData.emailCount, $(
    if ($comData.emailCount -gt $mcpData.emailCount) {
        "+$($comData.emailCount - $mcpData.emailCount) (COM)"
    } elseif ($mcpData.emailCount -gt $comData.emailCount) {
        "+$($mcpData.emailCount - $comData.emailCount) (MCP)"
    } else { "=" }
))
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "Body Size", "${totalMcpKB}KB", "${totalComKB}KB", "")
Write-Host ""
Write-Host "Matched:          $($inBoth.Count)"
Write-Host "Only in MCP:      $($onlyInMcp.Count)"
Write-Host "Only in COM:      $($onlyInCom.Count)"
Write-Host ""
Write-Host "Field Coverage:"
Write-Host "  MCP missing:  $($mcpMissing -join ', ')"
Write-Host "  COM missing:  $($comMissing -join ', ')"
Write-Host ""
Write-Host "Report saved:     $OutputPath"
Write-Host "✅ Done"
