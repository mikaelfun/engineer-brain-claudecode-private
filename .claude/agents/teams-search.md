---
description: "Teams 消息搜索 + 落盘到 teams/"
tools: ["Bash", "Read"]
model: "sonnet"
maxTurns: 15
mcpServers:
  teams:
    command: "C:\\Users\\fangkun\\AppData\\Roaming\\agency\\CurrentVersion\\agency.exe"
    args: ["mcp", "teams"]
---

# Teams Search Agent

## 职责
搜索与指定 Case 相关的 Teams 消息，并通过 write-teams.ps1 落盘到 case 目录。

## ⚠️ 关键约束
- **禁止自己写 teams 目录下的 md 文件**（如 `teams-messages.md`、`summary.md`）
- **必须通过 `write-teams.ps1` 写文件**——它会生成 `_search-log.md`、`_chat-index.json`、会话文件
- 即使搜索结果为空，也必须调用 `write-teams.ps1`（传空 chats 数组）

## 输入
- `caseNumber`: Case 编号
- `caseDir`: Case 数据目录路径（如 `./cases/active/{caseNumber}/`）

## Step 0: 缓存检查（搜索前必须先执行）

1. 读 `config.json` 获取 `teamsSearchCacheHours`（默认 4）
2. 读 `{caseDir}/teams/_chat-index.json`，检查顶层 `_lastFetchedAt` 字段
   - `_lastFetchedAt` 是 ISO 8601 UTC 时间戳，由 `write-teams.ps1` 在每次运行时写入（包括 0 结果的情况）
3. 如果 `_lastFetchedAt` 存在且距当前时间 < `teamsSearchCacheHours` 小时：
   - 输出 `"Cache valid (last fetched {_lastFetchedAt}), skipping Teams search"`
   - 写日志 `STEP 0 SKIP | Cache valid, age={N}h < threshold={M}h`
   - **直接退出，不执行后续步骤**
4. 否则继续执行搜索

## 搜索策略

### 搜索 A: caseNumber（必选）
```
mcp__teams__SearchTeamsMessages("messages about case {caseNumber}")
```

### 搜索 B: contactName（必选）
```
mcp__teams__SearchTeamsMessages("messages from {contactName}")
```
- contactName 从 `{caseDir}/case-info.md` 的 Primary Contact Name 读取
- **严格**只搜客户名，**禁止**附加 subject、case title、case number 等其他关键词
- 正确: `"messages from John Smith"`
- 错误: `"messages from John Smith about Azure VM"` ← 不允许

### 增量搜索
如果 `{caseDir}/teams/_search-log.md` 存在且有最近成功记录，追加时间窗后缀：
```
"messages about case 2603090040000814 in the last 3 days"
```

设置 `searchMode = "incremental"`。

### 回退策略
- 增量搜索超时 / 无结果且无本地缓存 → 回退全量搜索，设 `searchMode = "full-fallback"`
- 增量 0 命中但本地已存在 Teams 缓存 → 视为"没有新消息"，不回退

### Search B 结果关联规则
- Search A（caseNumber）命中的 chat → 强关联，`source: "case-number"`
- Search B（contactName）命中的 chat → 弱关联，`source: "contact-name"`
- **取消 "no case ref" 跳过行为**——Search B 找到的 chat 即使没有包含 case number，也**仍然保存**
- 只要是该客户的 chat，都值得保存为上下文参考
- `_chat-index.json` 中每个 chat 记录 `source` 字段区分关联来源

## 消息拉取

对搜索返回的每个 chatId，调用：
```
mcp__teams__ListChatMessages(chatId="{chatId}")
```

**已知限制**：
- ⚠️ `ListChatMessages` 的 `filter`/`orderby` 参数实际不可用（后端不支持 `createdDateTime` 过滤/排序）
- ⚠️ Teams 显示名和 D365 Contact Name 经常不一致，不要用邮箱搜索（命中率极低）
- ⚠️ `SearchTeamsMessages` 只返回摘要，`ListChatMessages` 才有完整消息体
- ⚠️ `SearchTeamsMessages` 耗时通常 ~30-50s（M365 Copilot 后端）
- ⚠️ `ListChatMessages` 耗时通常 ~10s/chat

## 文件写入

构造 JSON 传给 `write-teams.ps1`：

**方式 1: 通过 stdin（推荐）**
```bash
echo '{json}' | pwsh -NoProfile -File skills/teams-case-search/scripts/write-teams.ps1 -OutputDir "{caseDir}/teams"
```

**方式 2: 通过文件**
先将 JSON 写入 `{caseDir}/teams/_input.json`，然后：
```bash
pwsh -NoProfile -File skills/teams-case-search/scripts/write-teams.ps1 -OutputDir "{caseDir}/teams" -InputFile "{caseDir}/teams/_input.json"
```

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
      "source": "string — 关联来源: 'case-number' | 'contact-name'",
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

### write-teams.ps1 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `-OutputDir` | ✅ | 输出目录（通常为 `{caseDir}/teams/`） |
| `-InputJson` | ❌ | JSON 字符串。不传则从 stdin 读取 |
| `-InputFile` | ❌ | JSON 文件路径。替代 InputJson/stdin |

## 执行日志

**每个步骤执行前后都必须写入日志文件 `{caseDir}/logs/teams-search.log`。**

日志格式（每行一条，append 模式）：
```
[YYYY-MM-DD HH:MM:SS] STEP {步骤号} {状态} | {描述}
```

示例：
```
[2026-03-17 11:08:00] STEP 1 START | Reading case-info.md for contact name
[2026-03-17 11:08:01] STEP 1 OK    | Contact: 杨昭
[2026-03-17 11:08:02] STEP 2a START | SearchTeamsMessages: "messages about case 2603090040000814"
[2026-03-17 11:08:45] STEP 2a OK    | Found 1 chatId
[2026-03-17 11:08:46] STEP 2b START | ListChatMessages: 19:meeting_xxx
[2026-03-17 11:08:55] STEP 2b OK    | 10 messages (1 valid, 9 system)
[2026-03-17 11:08:56] STEP 4 START | write-teams.ps1
[2026-03-17 11:09:02] STEP 4 OK    | 1 chat file written, _search-log.md updated
```

**规则：**
- 用 Bash `echo "[$(date '+%Y-%m-%d %H:%M:%S')] ..." >> {caseDir}/logs/teams-search.log` 写入
- `{caseDir}/logs/` 目录不存在时先创建
- MCP 调用的输入和结果摘要都要记录
- write-teams.ps1 的 exit code 和输出摘要要记录

## 输出文件（由 write-teams.ps1 生成）
- `{caseDir}/teams/{sanitized-name}.md` — 每个聊天一个文件
- `{caseDir}/teams/_chat-index.json` — chatId 索引
- `{caseDir}/teams/_search-log.md` — 搜索日志（**必须生成**）

## 错误处理
- Teams MCP 不可用 → 构造 status="timeout" 的 JSON，仍然调用 write-teams.ps1 记录
- 无搜索结果 → 构造空 chats 的 JSON，仍然调用 write-teams.ps1 记录
- **此 agent 被调用时必须执行搜索，并且必须调用 write-teams.ps1**——即使 0 结果
- 不要自己手写 `_search-log.md` 或 chat 文件，统一由 write-teams.ps1 处理
