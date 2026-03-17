---
name: teams-case-search
description: "Search and fetch Teams chat messages related to a support case. Uses MCP tools (SearchTeamsMessages + ListChatMessages) for search/fetch, then write-teams.ps1 for file I/O. Use when: caseworker needs Teams context, user asks for Teams history on a case, or any workflow needs case-related Teams conversations."
---

# Teams Case Search Skill

搜索并拉取与支持 Case 相关的 Teams 聊天完整消息。

## 架构（Claude Code 适配）

```
Claude subagent (MCP 调用)          write-teams.ps1 (文件写入)
┌─────────────────────────┐         ┌─────────────────────────┐
│ SearchTeamsMessages      │──JSON──▶│ 增量写入 chat .md 文件   │
│ ListChatMessages         │         │ 更新 _chat-index.json   │
│ (直接用 MCP tools)       │         │ 追加 _search-log.md     │
└─────────────────────────┘         └─────────────────────────┘
```

- **MCP 搜索/拉取**：由 Claude subagent 直接使用 `mcp__teams__SearchTeamsMessages` 和 `mcp__teams__ListChatMessages` 工具
- **文件写入**：由 `write-teams.ps1` 处理（接收 JSON 输入，写文件/index/log）
- **不再依赖 `mcporter`**（那是 Openclaw 的工具）

## Subagent 执行步骤

### 1. 搜索 Teams 消息

使用 MCP 工具搜索（并行发送两个查询）：

```
搜索 A: mcp__teams__SearchTeamsMessages("messages about case {caseNumber}")
搜索 B: mcp__teams__SearchTeamsMessages("messages from {contactName}")  # 必选，从 case-info.md 读取联系人姓名
```

增量搜索：如果 `_search-log.md` 有最近成功记录，追加时间窗后缀：
```
"messages about case 2603090040000814 in the last 3 days"
```

### 2. 拉取消息详情

对搜索返回的每个 chatId，调用：
```
mcp__teams__ListChatMessages(chatId="{chatId}")
```

### 3. 写入文件

构造 JSON 传给 `write-teams.ps1`：

```powershell
$json = @{
  caseNumber = "2603090040000814"
  searchResults = @(
    @{ keyword = "messages about case 2603090040000814"; status = "success"; chatIds = @("19:...") }
  )
  chats = @(
    @{ chatId = "19:..."; messages = $messagesFromMCP }
  )
  searchMode = "full"
  fallbackTriggered = $false
  elapsed = 45.2
} | ConvertTo-Json -Depth 10

$json | pwsh skills/teams-case-search/scripts/write-teams.ps1 -OutputDir "{caseDir}/teams"
```

### 4. 回退策略

- 增量搜索超时 / 无结果且无本地缓存 → 回退全量搜索
- 增量 0 命中但本地已存在 Teams 缓存 → 视为"没有新消息"，不回退

## 输出文件

### 目录结构

```text
teams/
  _search-log.md        # 搜索历史记录
  _chat-index.json      # chatId → 文件名/时间 映射
  {sanitized-name}.md   # 每个聊天一个文件
```

### 会话文件格式

```markdown
# Teams Chat — Chandrasekar, Sushanth (S.)

> 最后更新：2026-03-16 00:10 GMT+8
> chatId: 19:64eacf1a-...@unq.gbl.spaces

## 2026-03-12

**Kun Fang** (15:55): May I know if you have chance to test the updated script?
**Chandrasekar, Sushanth (S.)** (15:56): Hi Fang
```

## 参数

### write-teams.ps1

| 参数 | 必填 | 说明 |
|------|------|------|
| `-OutputDir` | ✅ | 输出目录（通常为 `cases/active/{id}/teams/`） |
| `-InputJson` | ❌ | JSON 字符串。不传则从 stdin 读取 |
| `-InputFile` | ❌ | JSON 文件路径。替代 InputJson/stdin |

### 输入 JSON Schema

```json
{
  "caseNumber": "string (必填)",
  "searchResults": [
    {
      "keyword": "string — 搜索关键词",
      "status": "success|timeout|parse_error",
      "chatIds": ["string — chatId 数组"]
    }
  ],
  "chats": [
    {
      "chatId": "string (必填)",
      "messages": [
        {
          "id": "string",
          "createdDateTime": "ISO 8601 UTC",
          "from": { "displayName": "string" },
          "body": { "contentType": "Html|Text", "content": "string" }
        }
      ]
    }
  ],
  "searchMode": "full|incremental|full-fallback",
  "fallbackTriggered": false,
  "windowDays": null,
  "elapsed": 45.2
}
```

## 注意事项

- `SearchTeamsMessages` 耗时通常 ~30-50s（M365 Copilot 后端）
- `ListChatMessages` 耗时通常 ~10s/chat
- Teams 显示名和 D365 Contact Name 经常不一致
- 搜索返回的是 M365 Copilot 摘要——必须用 `ListChatMessages` 拉完整内容
- 系统消息（`<systemEventMessage/>`）和空消息会被自动过滤

## 迁移说明

- **旧版 `fetch-teams.ps1`**：使用 `mcporter call` 调用 MCP，仅在 Openclaw 环境可用
- **新版**：MCP 调用由 Claude subagent 直接执行，`write-teams.ps1` 只负责文件 I/O
- `fetch-teams.ps1` 保留作为 Openclaw 兼容参考，Claude Code 环境使用 `write-teams.ps1`
