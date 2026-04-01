# Mail MCP vs Outlook COM 邮件获取对比测试

**Date:** 2026-04-01
**Status:** Draft
**Author:** Kun Fang + Claude

## Background

当前 Case 邮件获取有两条路径：
- **D365 OData** (`fetch-emails.ps1`) — 从 CRM 数据库拉取，输出 `emails.md`
- **Mail MCP** (`email-search` skill) — 通过 Microsoft Graph API 搜索 Outlook 邮箱，输出 `emails-office.md`

**核心痛点**：D365 OData 只能获取本人 Case 的邮件。做 Case Review 时需要读取团队其他人 Case 的邮件，而 Outlook 客户端因团队抄送机制可以访问这些邮件。

## Goal

技术调研：对比 **Mail MCP (Graph API)** 和 **Outlook COM (本地客户端)** 两种方式获取邮件的差异，为后续 Case Review 场景选型提供数据支持。

## Comparison Dimensions

1. **速度**：搜索耗时 + 内容获取耗时
2. **数据完整性**：Body 截断情况、附件元数据、CC/BCC 字段覆盖
3. **搜索能力**：按 Case 号精确/模糊匹配、日期范围过滤、发件人过滤

## Architecture

```
                    ┌─────────────────────────┐
                    │  compare-email-fetch     │
                    │  (orchestration)         │
                    └────────┬────────────────┘
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
    ┌────────────────────┐  ┌────────────────────────┐
    │ Mail MCP           │  │ Outlook COM             │
    │ (Claude MCP tools) │  │ (PowerShell script)     │
    │                    │  │                         │
    │ SearchMessages     │  │ New-Object -ComObject   │
    │ QueryParameters    │  │ Outlook.Application     │
    │      ↓             │  │      ↓                  │
    │ GetMessage         │  │ Items.Restrict          │
    │ (full HTML body)   │  │ (local search)          │
    └────────┬───────────┘  └────────┬───────────────┘
             │                       │
             ▼                       ▼
    mcp-results.json        com-results.json
             │                       │
             └───────────┬───────────┘
                         ▼
              comparison-report.json
              + console summary
```

## Execution Model

**混合执行**：
- **Mail MCP 部分**：由 Claude 在会话中调用 `mcp__mail__*` MCP 工具执行，结果写入 `mcp-results.json`
- **Outlook COM 部分**：PowerShell 脚本 (`outlook-com-fetch.ps1`) 独立执行，结果写入 `com-results.json`
- **对比分析**：PowerShell 脚本读取两份结果文件，生成 `comparison-report.json`

## Component 1: Outlook COM Fetch Script

**文件**: `skills/email-compare/outlook-com-fetch.ps1`

**参数**:
- `-CaseNumber` (必填): Case 工单号
- `-OutputPath` (必填): 输出 JSON 文件路径
- `-SearchAllFolders` (可选): 是否遍历所有文件夹（默认只搜 Inbox + Sent Items）

**核心逻辑**:
```powershell
$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")

# 搜索 Inbox + Sent Items（可选遍历全部文件夹）
# 用 Items.Restrict 过滤：Subject 或 Body 包含 Case 号
$filter = "@SQL=""urn:schemas:httpmail:subject"" LIKE '%$CaseNumber%'"

# 收集字段:
# Subject, Body (plain text), HTMLBody, SenderEmailAddress,
# To, CC, BCC, SentOn, ReceivedTime, 
# Attachments.Count, Attachments[].FileName, Size
```

**输出格式**: JSON 数组，每封邮件包含标准化字段

**搜索范围**:
1. 默认: Inbox (`olFolderInbox`) + Sent Items (`olFolderSentMail`)
2. 可选 `-SearchAllFolders`: 递归遍历所有文件夹（捕获团队抄送可能落入的子文件夹）
3. 共享邮箱: 如果已映射到 Outlook profile，也会被遍历

## Component 2: Mail MCP Fetch (Claude Session)

复用现有 `email-search` skill 逻辑：
1. `mcp__mail__SearchMessagesQueryParameters` — 按 Case 号搜索
2. `mcp__mail__GetMessage` (preferHtml=true) — 获取每封邮件完整内容
3. 结果标准化后写入 `mcp-results.json`

**搜索 query**: `?$search="$CaseNumber"&$top=50`

## Component 3: Comparison Report Generator

**文件**: `skills/email-compare/generate-report.ps1`

**输入**: `mcp-results.json` + `com-results.json`
**输出**: `comparison-report.json` + console summary

### Report Schema

```json
{
  "caseNumber": "2504010012345678",
  "timestamp": "2026-04-01T14:30:00+08:00",
  "mailMcp": {
    "duration_ms": 12500,
    "emailCount": 15,
    "totalBodyBytes": 45000,
    "searchMethod": "Graph API $search",
    "emails": [{
      "messageId": "...",
      "subject": "RE: Case 2504010012345678 - VM connectivity issue",
      "from": "customer@contoso.com",
      "to": ["engineer@microsoft.com"],
      "cc": ["team-dl@microsoft.com"],
      "sentDate": "2026-03-28T10:30:00Z",
      "bodyLength": 3200,
      "bodyTruncated": false,
      "attachmentCount": 1,
      "attachmentNames": ["network-trace.zip"]
    }]
  },
  "outlookCom": {
    "duration_ms": 3200,
    "emailCount": 22,
    "totalBodyBytes": 68000,
    "searchMethod": "MAPI Items.Restrict",
    "foldersSearched": ["Inbox", "Sent Items", "Team Cases"],
    "emails": [...]
  },
  "comparison": {
    "onlyInMcp": ["<messageId>"],
    "onlyInCom": ["<messageId>", "<messageId>"],
    "inBoth": 14,
    "matchMethod": "Subject + SentDate 匹配",
    "speedComparison": {
      "mcpMs": 12500,
      "comMs": 3200,
      "ratio": "COM 3.9x faster"
    },
    "contentComparison": {
      "mcpAvgBodyLength": 3000,
      "comAvgBodyLength": 3100,
      "truncationDiff": "MCP: 0 truncated, COM: 0 truncated"
    },
    "coverageDiff": "COM found 7 additional team-CC emails not visible via MCP",
    "fieldCoverage": {
      "mcp": ["subject", "body", "from", "to", "cc", "sentDate", "attachments"],
      "com": ["subject", "body", "htmlBody", "from", "to", "cc", "bcc", "sentOn", "receivedTime", "attachments", "size"]
    }
  }
}
```

### Console Summary 示例

```
=== Email Fetch Comparison: Case 2504010012345678 ===

              Mail MCP    Outlook COM    Diff
Speed         12.5s       3.2s           COM 3.9x faster
Emails Found  15          22             +7 (COM)
Body Bytes    45KB        68KB           +23KB (COM)
Truncated     0           0              -

Emails only in Mail MCP:  1
Emails only in Outlook COM: 8 (7 team-CC, 1 shared mailbox)
Emails in both: 14

Field Coverage:
  MCP missing: bcc, htmlBody, receivedTime, size
  COM missing: (none)
```

## Matching Strategy

邮件匹配（判断两边是否是同一封邮件）使用：
- **Primary**: `Subject` + `SentDate` (精确到分钟)
- **Fallback**: `From` + `Subject` 前 50 字符 + `SentDate` (精确到小时)

不使用 `MessageId` 因为两个系统的 ID 格式不同（Graph API 的 ID vs MAPI EntryID）。

## Test Execution

选择 2-3 个不同类型的 Case 测试：
1. **本人 Case**：自己负责的活跃 Case（预期两边结果接近）
2. **他人 Case**：团队成员的 Case（预期 COM 能找到更多抄送邮件，MCP 也应该能搜到）
3. **已关闭 Case**：验证历史邮件的搜索能力

## Constraints

- Outlook COM 需要本地 Outlook 客户端已登录并同步（当前已满足）
- COM 调用会启动 Outlook 实例（如未运行则会自动启动，可能有 2-3s 启动延迟）
- Mail MCP 受 Graph API 配额限制（每次最多 50 条结果）
- COM 搜索大邮箱可能较慢（如果遍历所有文件夹）

## File Structure

```
skills/email-compare/
├── outlook-com-fetch.ps1      # COM 获取脚本
├── generate-report.ps1        # 对比报告生成
└── README.md                  # 使用说明
```

执行结果存放在对应 Case 目录：
```
cases/active/{case-id}/
├── compare/
│   ├── mcp-results.json
│   ├── com-results.json
│   └── comparison-report.json
```

## Success Criteria

- [ ] COM 脚本能成功连接本地 Outlook 并搜索邮件
- [ ] 两种方式的结果能自动对齐和对比
- [ ] 对比报告清晰呈现三个维度的差异（速度、完整性、搜索能力）
- [ ] 在至少 2 个 Case 上完成对比测试
- [ ] 结论：是否值得将 COM 集成到 email-search skill 作为补充路径

## Future Considerations

如果对比结果表明 COM 方式有明显优势（特别是团队邮件覆盖方面），后续可以：
1. 将 COM 集成到 `email-search` skill 作为 fallback 或补充
2. 在 Case Review 流程中优先使用 COM 获取完整邮件链
3. 考虑 COM 方式的缓存策略（避免重复搜索）
