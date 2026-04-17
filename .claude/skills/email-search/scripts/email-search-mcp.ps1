# email-search-mcp.ps1
# 通过 Mail MCP 的 Graph API 搜索 + 获取邮件，去重后输出 emails-office.md
# 用法: pwsh -File email-search-mcp.ps1 -CaseNumber "2603060030001353" -CaseDir "/path/to/case"
#
# 设计：由 Claude 传入搜索结果 JSON（MCP 工具输出），脚本负责：
#   1. 去重（subject + sentDateTime）
#   2. 接收 GetMessage 的完整 body 写入临时文件（不经过 context）
#   3. HTML 清洗
#   4. 生成 emails-office.md

param(
    [Parameter(Mandatory=$true)]
    [string]$CaseNumber,

    [Parameter(Mandatory=$true)]
    [string]$CaseDir,

    [Parameter(ParameterSetName='Dedup')]
    [string]$SearchResultJson,       # Step 1: 传入 MCP 搜索结果 JSON 文件路径，去重后输出 id 列表

    [Parameter(ParameterSetName='SaveBody')]
    [string]$MessageId,              # Step 2: 单封邮件的 Graph ID
    [string]$BodyFile,               # Step 2: 完整 body 写入的目标文件路径

    [Parameter(ParameterSetName='Generate')]
    [switch]$Generate                # Step 3: 从临时文件生成 emails-office.md
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$logFile = Join-Path $CaseDir "logs/email-search.log"
$tmpDir = Join-Path $CaseDir ".tmp-email-search"

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $Message"
    Add-Content -Path $logFile -Value $line -Encoding UTF8
    Write-Host $line
}

# ════════════════════════════════════════════════════════════════════════════
# Step 1: 去重搜索结果
# ════════════════════════════════════════════════════════════════════════════
if ($SearchResultJson) {
    Write-Log "STEP 1 START | Dedup search results from $SearchResultJson"

    if (-not (Test-Path $SearchResultJson)) {
        Write-Log "STEP 1 FAILED | File not found: $SearchResultJson"
        exit 1
    }

    $raw = Get-Content $SearchResultJson -Raw -Encoding UTF8 | ConvertFrom-Json
    $emails = $raw.value
    $totalBefore = $emails.Count

    # 去重：subject + sentDateTime
    $seen = @{}
    $unique = @()
    foreach ($email in $emails) {
        $key = "$($email.subject)|$($email.sentDateTime)"
        if (-not $seen.ContainsKey($key)) {
            $seen[$key] = $true
            $unique += $email
        }
    }

    $totalDedup = $unique.Count

    # 过滤自动回复
    $autoReplyPatterns = @('自动回复', '自动答复', 'Automatic reply', 'Out of Office', 'AutoReply')
    $filtered = @()
    $autoReplyCount = 0
    foreach ($email in $unique) {
        $isAutoReply = $false
        foreach ($pattern in $autoReplyPatterns) {
            if ($email.subject -and $email.subject.Contains($pattern)) {
                $isAutoReply = $true
                break
            }
        }
        # Also skip very short emails without reply markers (likely system notifications)
        if (-not $isAutoReply -and $email.bodyPreview -and $email.bodyPreview.Length -lt 200) {
            $subj = $email.subject
            if ($subj -and -not ($subj -match '^(Re:|RE:|回复|答复|FW:|Fw:|\[外部\])')) {
                $isAutoReply = $true
            }
        }
        if ($isAutoReply) {
            $autoReplyCount++
        } else {
            $filtered += $email
        }
    }

    $totalAfter = $filtered.Count
    Write-Log "STEP 1 OK    | Found $totalBefore emails, dedup to $totalDedup, filtered to $totalAfter (skipped $autoReplyCount auto-replies)"

    # Use filtered results from here
    $unique = $filtered

    # 创建临时目录
    if (-not (Test-Path $tmpDir)) {
        New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
    }

    # 输出去重后的 id 列表（每行一个）和元数据
    $idListFile = Join-Path $tmpDir "message-ids.txt"
    $metaFile = Join-Path $tmpDir "messages-meta.json"

    $unique | ForEach-Object { $_.id } | Set-Content -Path $idListFile -Encoding UTF8

    # 保存元数据（subject, from, to, cc, sentDateTime, bodyPreview）
    $meta = $unique | ForEach-Object {
        @{
            id = $_.id
            subject = $_.subject
            from = $_.from.emailAddress.address
            fromName = $_.from.emailAddress.name
            toRecipients = ($_.toRecipients | ForEach-Object { "$($_.emailAddress.name) <$($_.emailAddress.address)>" }) -join "; "
            ccRecipients = ($_.ccRecipients | ForEach-Object { "$($_.emailAddress.name) <$($_.emailAddress.address)>" }) -join "; "
            receivedDateTime = $_.receivedDateTime
            sentDateTime = $_.sentDateTime
            bodyPreview = $_.bodyPreview
        }
    }
    $meta | ConvertTo-Json -Depth 3 | Set-Content -Path $metaFile -Encoding UTF8

    # 输出结果给 Claude（仅 id 列表，不含 body）
    Write-Host "IDS_FILE=$idListFile"
    Write-Host "META_FILE=$metaFile"
    Write-Host "DEDUP_COUNT=$totalAfter"
    exit 0
}

# ════════════════════════════════════════════════════════════════════════════
# Step 2: 保存单封邮件 body 到文件（Claude 调用 GetMessage 后 pipe body 进来）
# ════════════════════════════════════════════════════════════════════════════
if ($MessageId -and $BodyFile) {
    # 从 stdin 读取 body 内容，写入文件
    $body = [Console]::In.ReadToEnd()
    $dir = Split-Path -Parent $BodyFile
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($BodyFile, $body, [System.Text.UTF8Encoding]::new($false))
    Write-Host "OK|$($body.Length)"
    exit 0
}

# ════════════════════════════════════════════════════════════════════════════
# Step 3: 从临时文件生成 emails-office.md
# ════════════════════════════════════════════════════════════════════════════
if ($Generate) {
    Write-Log "STEP 3 START | Generate emails-office.md from temp files"

    $metaFile = Join-Path $tmpDir "messages-meta.json"
    if (-not (Test-Path $metaFile)) {
        Write-Log "STEP 3 FAILED | Meta file not found: $metaFile"
        exit 1
    }

    $meta = Get-Content $metaFile -Raw -Encoding UTF8 | ConvertFrom-Json

    # 按 receivedDateTime 正序排列
    $sorted = $meta | Sort-Object { $_.receivedDateTime }

    $output = @()
    $output += "# Emails (Outlook) — Case $CaseNumber"
    $output += ""
    $output += "> Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Total: $($sorted.Count) emails | Source: Office Mail MCP"
    $output += ""
    $output += "---"

    $successCount = 0
    $fallbackCount = 0

    foreach ($email in $sorted) {
        $bodyFile = Join-Path $tmpDir "body-$($email.id.Substring($email.id.Length - 10)).html"

        # 方向判断
        $direction = if ($email.from -match "@microsoft\.com") { "Sent" } else { "Received" }
        $icon = if ($direction -eq "Sent") { "📤" } else { "📥" }

        # 时间格式化
        $dt = [datetime]::Parse($email.receivedDateTime)
        $timeStr = $dt.ToString("yyyy-MM-dd HH:mm")

        $output += ""
        $output += "### $icon $direction | $timeStr"
        $output += "**Subject:** $($email.subject)"
        $output += "**From:** $($email.fromName) <$($email.from)>"
        $output += "**To:** $($email.toRecipients)"
        if ($email.ccRecipients) {
            $output += "**Cc:** $($email.ccRecipients)"
        }
        $output += ""

        # 读取并清洗 HTML body
        if (Test-Path $bodyFile) {
            $htmlBody = Get-Content $bodyFile -Raw -Encoding UTF8
            # Python HTML 清洗
            $cleanBody = $htmlBody | python -c "
import html, re, sys
raw = sys.stdin.read()
text = re.sub(r'<style[^>]*>.*?</style>', '', raw, flags=re.DOTALL|re.IGNORECASE)
text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL|re.IGNORECASE)
text = re.sub(r'<br\s*/?>|</p>|</div>|</tr>|</li>', '\n', text, flags=re.IGNORECASE)
text = re.sub(r'</td>', '\t', text, flags=re.IGNORECASE)
text = re.sub(r'<[^>]+>', '', text)
text = html.unescape(text)
text = re.sub(r'\n{3,}', '\n\n', text)
lines = [line.rstrip() for line in text.splitlines()]
text = '\n'.join(lines).strip()
print(text)
" 2>$null
            if ($cleanBody) {
                $output += $cleanBody
                $successCount++
            } else {
                $output += $email.bodyPreview
                $fallbackCount++
            }
        } else {
            # body 文件不存在，用 bodyPreview 降级
            $output += $email.bodyPreview
            $fallbackCount++
        }

        $output += ""
        $output += "---"
    }

    # 写入 emails-office.md
    $outputFile = Join-Path $CaseDir "emails-office.md"
    $output -join "`n" | Set-Content -Path $outputFile -Encoding UTF8 -NoNewline

    # 清理临时目录
    Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue

    $fileSize = [math]::Round((Get-Item $outputFile).Length / 1024, 1)
    Write-Log "STEP 3 OK    | emails-office.md saved ($($sorted.Count) emails, ${fileSize}KB, $fallbackCount used bodyPreview fallback)"
    Write-Host "OUTPUT=$outputFile"
    Write-Host "COUNT=$($sorted.Count)"
    Write-Host "SIZE_KB=$fileSize"
    exit 0
}

Write-Host "Usage: Specify -SearchResultJson, -MessageId/-BodyFile, or -Generate"
exit 1
