---
name: teams-case-search
description: "Teams Case Search 脚本参考文档。搜索执行逻辑已迁移到 .claude/agents/teams-search.md，此文件仅保留脚本参数和 schema 参考。"
---

# Teams Case Search — 脚本参考

> **执行逻辑已迁移到 `.claude/agents/teams-search.md`。**
> 本文件保留 `write-teams.ps1` 参数说明和 JSON Schema 作为参考文档。

## 架构

```
Claude subagent (MCP 调用)          write-teams.ps1 (文件写入)
┌─────────────────────────┐         ┌─────────────────────────┐
│ SearchTeamsMessages      │──JSON──▶│ 增量写入 chat .md 文件   │
│ ListChatMessages         │         │ 更新 _chat-index.json   │
│ (直接用 MCP tools)       │         │ 追加 _search-log.md     │
└─────────────────────────┘         └─────────────────────────┘
```

- **MCP 搜索/拉取**：由 Claude subagent 直接使用 MCP 工具（见 `.claude/agents/teams-search.md`）
- **文件写入**：由 `write-teams.ps1` 处理（接收 JSON 输入，写文件/index/log）

## write-teams.ps1 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `-OutputDir` | ✅ | 输出目录（通常为 `cases/active/{id}/teams/`） |
| `-InputJson` | ❌ | JSON 字符串。不传则从 stdin 读取 |
| `-InputFile` | ❌ | JSON 文件路径。替代 InputJson/stdin |

## 输入 JSON Schema

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

## 输出文件

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

## 注意事项

- `SearchTeamsMessages` 耗时通常 ~30-50s（M365 Copilot 后端）
- `ListChatMessages` 耗时通常 ~10s/chat
- 系统消息（`<systemEventMessage/>`）和空消息会被自动过滤

## 迁移说明

- **旧版 `fetch-teams.ps1`**：使用 `mcporter call` 调用 MCP，仅在 Openclaw 环境可用
- **新版**：MCP 调用由 Claude subagent 直接执行，`write-teams.ps1` 只负责文件 I/O
- `fetch-teams.ps1` 保留作为 Openclaw 兼容参考，Claude Code 环境使用 `write-teams.ps1`
