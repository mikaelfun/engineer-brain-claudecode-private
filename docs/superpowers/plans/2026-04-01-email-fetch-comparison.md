# Mail MCP vs Outlook COM 邮件获取对比测试 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Outlook COM 邮件获取脚本，与现有 Mail MCP 对比，输出量化报告，为 Case Review 场景选型提供数据。

**Architecture:** 三个独立组件 — (1) Outlook COM 获取脚本 (PowerShell)、(2) Mail MCP 获取+标准化脚本 (Claude 会话中执行 MCP 工具 → 结果写 JSON)、(3) 对比报告生成器 (PowerShell)。混合执行：COM 和报告由 Bash 调 PowerShell，MCP 由 Claude 工具调用。

**Tech Stack:** PowerShell 5.1+ (COM Interop)、Outlook MAPI COM、Mail MCP (Graph API)、JSON

---

## File Structure

```
skills/email-compare/
├── outlook-com-fetch.ps1      # COM 获取：连接本地 Outlook，按 Case 号搜索，输出标准化 JSON
├── generate-report.ps1        # 对比分析：读取两份 JSON，匹配邮件，生成 comparison-report.json + console summary
└── README.md                  # 使用说明：参数、运行方式、示例输出
```

输出位置（运行时动态创建）：
```
cases/active/{case-id}/compare/
├── mcp-results.json           # Mail MCP 获取结果（由 Claude 会话写入）
├── com-results.json           # Outlook COM 获取结果
└── comparison-report.json     # 对比报告
```

---

### Task 1: Outlook COM 获取脚本

**Files:**
- Create: `skills/email-compare/outlook-com-fetch.ps1`

- [ ] **Step 1: 创建脚本骨架 — 参数定义 + COM 连接**

```powershell
# skills/email-compare/outlook-com-fetch.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$CaseNumber,

    [Parameter(Mandatory=$true)]
    [string]$OutputPath,

    [switch]$SearchAllFolders
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$startTime = Get-Date

Write-Host "🔵 Connecting to Outlook COM..."
try {
    $outlook = New-Object -ComObject Outlook.Application
    $namespace = $outlook.GetNamespace("MAPI")
    Write-Host "✅ Connected to Outlook (Profile: $($namespace.CurrentProfileName))"
} catch {
    Write-Host "❌ ERR: Failed to connect to Outlook COM: $($_.Exception.Message)"
    exit 1
}
```

- [ ] **Step 2: 实现文件夹搜索函数**

在脚本中 COM 连接代码之后追加：

```powershell
function Search-OutlookFolder {
    param(
        [object]$Folder,
        [string]$SearchTerm,
        [System.Collections.Generic.List[object]]$Results
    )

    Write-Host "  📂 Searching: $($Folder.Name) ($($Folder.Items.Count) items)..."

    try {
        $filter = "@SQL=""urn:schemas:httpmail:subject"" LIKE '%$SearchTerm%' OR ""urn:schemas:httpmail:textdescription"" LIKE '%$SearchTerm%'"
        $items = $Folder.Items.Restrict($filter)

        foreach ($item in $items) {
            if ($item.Class -ne 43) { continue }  # 43 = olMail

            $attachmentNames = @()
            for ($i = 1; $i -le $item.Attachments.Count; $i++) {
                $att = $item.Attachments.Item($i)
                # 跳过 inline images（ContentID 非空且文件名像图片）
                if ($att.FileName -match '\.(png|jpg|jpeg|gif|bmp)$' -and $item.HTMLBody -match "cid:") {
                    continue
                }
                $attachmentNames += $att.FileName
            }

            $emailObj = [PSCustomObject]@{
                subject         = $item.Subject
                from            = $item.SenderEmailAddress
                fromName        = $item.SenderName
                to              = $item.To
                cc              = $item.CC
                bcc             = $item.BCC
                sentDate        = $item.SentOn.ToString("yyyy-MM-ddTHH:mm:ssZ")
                receivedDate    = $item.ReceivedTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
                bodyLength      = $item.Body.Length
                htmlBodyLength  = $item.HTMLBody.Length
                bodyPreview     = $item.Body.Substring(0, [Math]::Min(500, $item.Body.Length))
                bodyFull        = $item.Body
                attachmentCount = $attachmentNames.Count
                attachmentNames = $attachmentNames
                size            = $item.Size
                folder          = $Folder.FolderPath
            }
            $Results.Add($emailObj)
        }
    } catch {
        Write-Host "  ⚠️ Error searching $($Folder.Name): $($_.Exception.Message)"
    }
}
```

- [ ] **Step 3: 实现主搜索逻辑（默认模式 + 全文件夹模式）**

在搜索函数之后追加：

```powershell
$results = [System.Collections.Generic.List[object]]::new()

if ($SearchAllFolders) {
    Write-Host "🔵 Searching ALL folders recursively..."

    function Search-Recursive {
        param([object]$ParentFolder, [string]$Term, [System.Collections.Generic.List[object]]$Res)
        Search-OutlookFolder -Folder $ParentFolder -SearchTerm $Term -Results $Res
        foreach ($sub in $ParentFolder.Folders) {
            Search-Recursive -ParentFolder $sub -Term $Term -Res $Res
        }
    }

    # 遍历所有 Store（含共享邮箱）
    foreach ($store in $namespace.Stores) {
        Write-Host "📦 Store: $($store.DisplayName)"
        try {
            $root = $store.GetRootFolder()
            Search-Recursive -ParentFolder $root -Term $CaseNumber -Res $results
        } catch {
            Write-Host "  ⚠️ Cannot access store $($store.DisplayName): $($_.Exception.Message)"
        }
    }
} else {
    Write-Host "🔵 Searching Inbox + Sent Items..."
    $inbox = $namespace.GetDefaultFolder(6)      # olFolderInbox = 6
    $sentItems = $namespace.GetDefaultFolder(5)  # olFolderSentMail = 5

    Search-OutlookFolder -Folder $inbox -SearchTerm $CaseNumber -Results $results
    Search-OutlookFolder -Folder $sentItems -SearchTerm $CaseNumber -Results $results
}

$endTime = Get-Date
$durationMs = [int]($endTime - $startTime).TotalMilliseconds
```

- [ ] **Step 4: 实现结果输出（JSON + console summary）**

在主搜索逻辑之后追加：

```powershell
# 按 sentDate 排序（最旧在前）
$sortedResults = $results | Sort-Object { [datetime]$_.sentDate }

# 构建输出对象
$output = @{
    caseNumber     = $CaseNumber
    timestamp      = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
    duration_ms    = $durationMs
    searchMethod   = if ($SearchAllFolders) { "MAPI Recursive All Folders" } else { "MAPI Inbox+SentItems" }
    foldersSearched = ($results | Select-Object -ExpandProperty folder -Unique)
    emailCount     = $sortedResults.Count
    totalBodyBytes = ($sortedResults | Measure-Object -Property bodyLength -Sum).Sum
    emails         = @($sortedResults | ForEach-Object {
        @{
            subject         = $_.subject
            from            = $_.from
            fromName        = $_.fromName
            to              = $_.to
            cc              = $_.cc
            bcc             = $_.bcc
            sentDate        = $_.sentDate
            receivedDate    = $_.receivedDate
            bodyLength      = $_.bodyLength
            htmlBodyLength  = $_.htmlBodyLength
            bodyPreview     = $_.bodyPreview
            bodyFull        = $_.bodyFull
            attachmentCount = $_.attachmentCount
            attachmentNames = $_.attachmentNames
            size            = $_.size
            folder          = $_.folder
        }
    })
}

# 确保输出目录存在
$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 写入 JSON（UTF-8 无 BOM）
$json = $output | ConvertTo-Json -Depth 5 -Compress:$false
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

# Console summary
Write-Host ""
Write-Host "=== Outlook COM Results ==="
Write-Host "Case:       $CaseNumber"
Write-Host "Duration:   ${durationMs}ms"
Write-Host "Emails:     $($sortedResults.Count)"
Write-Host "Body Bytes: $($output.totalBodyBytes)"
Write-Host "Folders:    $($output.foldersSearched -join ', ')"
Write-Host "Output:     $OutputPath"
Write-Host "✅ Done"
```

- [ ] **Step 5: 运行测试 — 用一个真实 Case 号验证 COM 脚本**

```bash
CASE_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active"
# 找一个活跃 case 的 case number
ls "$CASE_DIR" | head -3
```

然后用其中一个 Case 号运行：

```bash
pwsh -File "skills/email-compare/outlook-com-fetch.ps1" -CaseNumber "<CASE_NUMBER>" -OutputPath "/tmp/com-test.json" 2>&1
```

Expected: 脚本成功连接 Outlook，搜索到邮件，输出 JSON 文件。

- [ ] **Step 6: Commit**

```bash
git add skills/email-compare/outlook-com-fetch.ps1
git commit -m "feat(email-compare): add Outlook COM fetch script

Connects to local Outlook via COM, searches by case number in
Inbox + Sent Items (or all folders with -SearchAllFolders),
outputs standardized JSON for comparison."
```

---

### Task 2: 对比报告生成器

**Files:**
- Create: `skills/email-compare/generate-report.ps1`

- [ ] **Step 1: 创建报告生成器 — 参数 + 数据加载**

```powershell
# skills/email-compare/generate-report.ps1
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
```

- [ ] **Step 2: 实现邮件匹配逻辑**

在数据加载之后追加：

```powershell
Write-Host "🔵 Matching emails..."

# 生成匹配 key：Subject (前50字符) + SentDate (精确到分钟)
function Get-MatchKey {
    param([object]$Email)
    $subj = if ($Email.subject.Length -gt 50) { $Email.subject.Substring(0, 50) } else { $Email.subject }
    $subj = $subj.Trim().ToLower()
    # 精确到分钟
    $date = ""
    try {
        $dt = [datetime]::Parse($Email.sentDate)
        $date = $dt.ToString("yyyy-MM-dd HH:mm")
    } catch {
        $date = $Email.sentDate
    }
    return "$subj|$date"
}

# 建立 MCP 索引
$mcpIndex = @{}
foreach ($email in $mcpData.emails) {
    $key = Get-MatchKey -Email $email
    if (-not $mcpIndex.ContainsKey($key)) {
        $mcpIndex[$key] = $email
    }
}

# 建立 COM 索引
$comIndex = @{}
foreach ($email in $comData.emails) {
    $key = Get-MatchKey -Email $email
    if (-not $comIndex.ContainsKey($key)) {
        $comIndex[$key] = $email
    }
}

# 匹配
$inBoth = @()
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
```

- [ ] **Step 3: 实现内容对比分析**

在匹配逻辑之后追加：

```powershell
Write-Host "🔵 Analyzing differences..."

# 速度对比
$mcpMs = $mcpData.duration_ms
$comMs = $comData.duration_ms
$speedRatio = if ($comMs -gt 0 -and $mcpMs -gt 0) {
    if ($mcpMs -gt $comMs) {
        "COM {0:F1}x faster" -f ($mcpMs / $comMs)
    } else {
        "MCP {0:F1}x faster" -f ($comMs / $mcpMs)
    }
} else { "N/A" }

# 内容完整性对比（仅对匹配邮件）
$mcpAvgBody = if ($mcpData.emails.Count -gt 0) {
    [int](($mcpData.emails | Measure-Object -Property bodyLength -Average).Average)
} else { 0 }
$comAvgBody = if ($comData.emails.Count -gt 0) {
    [int](($comData.emails | Measure-Object -Property bodyLength -Average).Average)
} else { 0 }

# 字段覆盖对比
$mcpFields = @("subject", "from", "to", "cc", "sentDate", "bodyLength", "attachmentCount", "attachmentNames")
$comFields = @("subject", "from", "fromName", "to", "cc", "bcc", "sentDate", "receivedDate", "bodyLength", "htmlBodyLength", "attachmentCount", "attachmentNames", "size", "folder")
$mcpMissing = $comFields | Where-Object { $_ -notin $mcpFields }
$comMissing = $mcpFields | Where-Object { $_ -notin $comFields }
```

- [ ] **Step 4: 构建报告 JSON + console summary 输出**

在分析逻辑之后追加：

```powershell
# 构建报告
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
            mcpFields   = $mcpFields
            comFields   = $comFields
            mcpMissing  = @($mcpMissing)
            comMissing  = @($comMissing)
        }
    }
}

# 写入 JSON
$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}
$json = $report | ConvertTo-Json -Depth 5 -Compress:$false
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

# Console summary
$totalMcpKB = [math]::Round($mcpData.totalBodyBytes / 1024, 1)
$totalComKB = [math]::Round($comData.totalBodyBytes / 1024, 1)

Write-Host ""
Write-Host "=========================================="
Write-Host "  Email Fetch Comparison: Case $($mcpData.caseNumber)"
Write-Host "=========================================="
Write-Host ""
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "", "Mail MCP", "Outlook COM", "Diff")
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "Speed", "${mcpMs}ms", "${comMs}ms", $speedRatio)
Write-Host ("{0,-16} {1,-14} {2,-14} {3}" -f "Emails Found", $mcpData.emailCount, $comData.emailCount, $(if ($comData.emailCount -gt $mcpData.emailCount) { "+$($comData.emailCount - $mcpData.emailCount) (COM)" } elseif ($mcpData.emailCount -gt $comData.emailCount) { "+$($mcpData.emailCount - $comData.emailCount) (MCP)" } else { "=" }))
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
```

- [ ] **Step 5: Commit**

```bash
git add skills/email-compare/generate-report.ps1
git commit -m "feat(email-compare): add comparison report generator

Matches emails between MCP and COM results using Subject+SentDate,
calculates speed/coverage/field differences, outputs JSON report
and console summary."
```

---

### Task 3: README 使用说明

**Files:**
- Create: `skills/email-compare/README.md`

- [ ] **Step 1: 编写 README**

```markdown
# Email Fetch Comparison: Mail MCP vs Outlook COM

技术调研工具：对比 Graph API (Mail MCP) 和本地 Outlook COM 获取邮件的速度、数据完整性和搜索能力差异。

## 使用方式

### 1. 运行 Outlook COM 获取

```powershell
# 默认搜索 Inbox + Sent Items
pwsh -File skills/email-compare/outlook-com-fetch.ps1 `
  -CaseNumber "2504010012345678" `
  -OutputPath "cases/active/2504010012345678/compare/com-results.json"

# 搜索所有文件夹（含共享邮箱）
pwsh -File skills/email-compare/outlook-com-fetch.ps1 `
  -CaseNumber "2504010012345678" `
  -OutputPath "cases/active/2504010012345678/compare/com-results.json" `
  -SearchAllFolders
```

### 2. 运行 Mail MCP 获取（在 Claude 会话中执行）

Claude 会话中调用 `mcp__mail__SearchMessagesQueryParameters` 和 `mcp__mail__GetMessage`，
结果标准化后写入 `cases/active/{case-id}/compare/mcp-results.json`。

### 3. 生成对比报告

```powershell
pwsh -File skills/email-compare/generate-report.ps1 `
  -McpResultsPath "cases/active/2504010012345678/compare/mcp-results.json" `
  -ComResultsPath "cases/active/2504010012345678/compare/com-results.json" `
  -OutputPath "cases/active/2504010012345678/compare/comparison-report.json"
```

## 输出

- `com-results.json` — COM 获取的邮件列表
- `mcp-results.json` — MCP 获取的邮件列表
- `comparison-report.json` — 量化对比报告

## 前置条件

- 本地 Outlook 桌面客户端已登录并同步
- Mail MCP (Graph API) 可用
- PowerShell 5.1+
```

- [ ] **Step 2: Commit**

```bash
git add skills/email-compare/README.md
git commit -m "docs(email-compare): add usage README"
```

---

### Task 4: 端到端对比测试（混合执行）

这是实际的测试执行任务，需要 Claude 会话 + PowerShell 混合操作。

- [ ] **Step 1: 选择测试用 Case**

找一个自己负责的活跃 Case（邮件数量适中，10-30 封）：

```bash
ls "/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/" | head -5
```

选定一个 Case 号后，创建 compare 目录：

```bash
CASE_NUM="<选定的Case号>"
CASE_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/$CASE_NUM"
mkdir -p "$CASE_DIR/compare"
```

- [ ] **Step 2: 执行 Outlook COM 获取**

```bash
CASE_NUM="<选定的Case号>"
CASE_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/$CASE_NUM"
pwsh -File "skills/email-compare/outlook-com-fetch.ps1" -CaseNumber "$CASE_NUM" -OutputPath "$CASE_DIR/compare/com-results.json" 2>&1
```

Expected: 脚本输出搜索到的邮件数量，生成 `com-results.json`。

- [ ] **Step 3: 执行 Mail MCP 获取**

在 Claude 会话中依次调用：

1. `mcp__mail__SearchMessagesQueryParameters` — queryParameters: `?$search="{CASE_NUM}"&$top=50&$select=id,subject,from,toRecipients,ccRecipients,sentDateTime,receivedDateTime,bodyPreview,hasAttachments`
2. 对搜索到的每封邮件，调用 `mcp__mail__GetMessage` — `id: {messageId}`, `preferHtml: true`
3. 计时并标准化结果，写入 `mcp-results.json`：

```json
{
  "caseNumber": "<CASE_NUM>",
  "timestamp": "2026-04-01T...",
  "duration_ms": <计算得到>,
  "searchMethod": "Graph API $search",
  "emailCount": <N>,
  "totalBodyBytes": <sum>,
  "emails": [
    {
      "subject": "...",
      "from": "user@domain.com",
      "to": "...",
      "cc": "...",
      "sentDate": "2026-...",
      "bodyLength": 3200,
      "bodyPreview": "前500字符...",
      "bodyFull": "完整正文...",
      "attachmentCount": 1,
      "attachmentNames": ["file.zip"]
    }
  ]
}
```

- [ ] **Step 4: 生成对比报告**

```bash
CASE_NUM="<选定的Case号>"
CASE_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/$CASE_NUM"
pwsh -File "skills/email-compare/generate-report.ps1" -McpResultsPath "$CASE_DIR/compare/mcp-results.json" -ComResultsPath "$CASE_DIR/compare/com-results.json" -OutputPath "$CASE_DIR/compare/comparison-report.json" 2>&1
```

Expected: 输出对比表格，显示速度、邮件数量、字段覆盖的差异。

- [ ] **Step 5: 分析结果并记录结论**

读取 `comparison-report.json`，回答以下问题：
1. COM 是否比 MCP 更快？快多少？
2. COM 能否找到 MCP 找不到的团队抄送邮件？
3. 数据完整性哪边更好？
4. 结论：是否值得将 COM 集成到 email-search skill？

将分析结论追加到 `comparison-report.json` 的 `conclusion` 字段。

- [ ] **Step 6: Commit 测试结果（不含 case 数据）**

```bash
# 只提交脚本和 README，不提交 case 目录下的测试数据
git add skills/email-compare/
git commit -m "feat(email-compare): complete comparison tooling

Tested on case <CASE_NUM>. Results in case directory (not committed)."
```
