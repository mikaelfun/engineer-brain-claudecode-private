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

- `com-results.json` — COM 获取的邮件列表（含完整正文、附件元数据、文件夹路径）
- `mcp-results.json` — MCP 获取的邮件列表（Graph API 完整 HTML body）
- `comparison-report.json` — 量化对比报告（速度、数量、字段覆盖）

## 对比维度

| 维度 | 说明 |
|------|------|
| 速度 | 搜索 + 内容获取的总耗时 |
| 数据完整性 | Body 截断情况、附件元数据、CC/BCC 字段 |
| 搜索能力 | 按 Case 号匹配的覆盖率 |
| 访问范围 | 能否访问团队抄送邮件、共享邮箱 |

## 前置条件

- 本地 Outlook 桌面客户端已登录并同步
- Mail MCP (Graph API) 在 Claude 会话中可用
- PowerShell 5.1+
