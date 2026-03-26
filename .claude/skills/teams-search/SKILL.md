---
name: teams-search
description: "Teams 消息搜索（KQL 并行）+ 落盘到 teams/"
---

# Teams Search Skill — KQL Parallel Search

## 概述
搜索与指定 Case 相关的 Teams 消息，通过 `write-teams.ps1` 落盘到 case 目录。
使用 **KQL 并行搜索**（`SearchTeamMessagesQueryParameters`）替代 M365 Copilot 搜索，速度提升 ~3x。

## 架构

```
Main Agent (内联执行)                    write-teams.ps1 (文件写入)
┌──────────────────────────────┐        ┌─────────────────────────┐
│ SearchTeamMessagesQueryParams │──JSON─▶│ 增量写入 chat .md 文件   │
│ ListChatMessages              │        │ 更新 _chat-index.json   │
│ (KQL 并行，~5-10s/query)     │        │ 追加 _search-log.md     │
└──────────────────────────────┘        └─────────────────────────┘
```

## 关键约束
- **禁止自己写 teams 目录下的 md 文件**
- **必须通过 `write-teams.ps1` 写文件**——它负责 `_search-log.md`、`_chat-index.json`、会话文件
- 即使搜索结果为空，也必须调用 `write-teams.ps1`（传空 chats 数组）

## 输入
- `caseNumber`: Case 编号
- `caseDir`: Case 数据目录路径（如 `{casesRoot}/active/{caseNumber}/`）

---

## Step 0: 缓存检查（搜索前必须先执行）

1. 读 `config.json` 获取 `teamsSearchCacheHours`（默认 4）
2. 读 `{caseDir}/teams/_chat-index.json`，检查顶层 `_lastFetchedAt` 字段
   - `_lastFetchedAt` 是 ISO 8601 UTC 时间戳，由 `write-teams.ps1` 在每次运行时写入
3. 如果 `_lastFetchedAt` 存在且距当前时间 < `teamsSearchCacheHours` 小时：
   - 输出 `"Cache valid (last fetched {_lastFetchedAt}), skipping Teams search"`
   - 写日志 `STEP 0 SKIP | Cache valid, age={N}h < threshold={M}h`
   - **直接退出，不执行后续步骤**
4. 否则继续执行搜索

---

## Step 1: 读取 Case 信息

从 `{caseDir}/case-info.md` 读取：
- **Primary Contact Name**（客户联系人姓名）
- **Primary Contact Email**（客户联系人邮箱，如果有）

## Step 2: KQL 并行搜索

### 搜索策略：模型驱动 Query 扩展

根据 caseNumber 和 contactName/email，生成 2 个 KQL 查询并行执行：

#### Q1: caseNumber 精确搜索（必选）
```
mcp__teams__SearchTeamMessagesQueryParameters(queryString="{caseNumber}")
```
命中精确包含 case 编号的消息。

#### Q2: 联系人搜索（必选，根据可用信息选择策略）

**优先策略 — 有邮箱时用 `from:` 操作符：**
```
mcp__teams__SearchTeamMessagesQueryParameters(queryString="from:{contactEmail}")
```
精确匹配发件人邮箱，高精度。

**回退策略 — 无邮箱时用姓名首 token + OR：**
```
mcp__teams__SearchTeamMessagesQueryParameters(queryString="{caseNumber} OR {contactFirstName}")
```
> **注意**：只用名字的**第一个 token**（如 "Sushanth"），不要用完整全名的精确短语匹配（如 `"Sushanth C"` 会 0 命中）。

### KQL 语法要点
- Graph Search 默认 AND 逻辑——多个单词都必须同时出现
- 用 `OR` 显式组合不同关键词：`{caseNumber} OR {name}`
- 用 `from:` 按发件人过滤：`from:user@example.com`
- 避免精确短语匹配（`"multi word"`），命中率极低
- 避免过多 AND 关键词（`container registry {caseNumber}`），太严格导致 0 命中

### 并行执行
两个查询**同时发送**（在同一个消息中调用两个 MCP tool），等待所有结果返回。

### 增量搜索
如果 `{caseDir}/teams/_search-log.md` 存在且有最近成功记录，在 queryString 末尾追加时间过滤：
```
queryString="{caseNumber} sent>=2026-03-23"
```
设置 `searchMode = "incremental"`。

### 回退策略
- 增量搜索超时/0 结果且无本地缓存 → 回退全量搜索，设 `searchMode = "full-fallback"`
- 增量 0 命中但本地已存在 Teams 缓存 → 视为"没有新消息"，不回退

---

## Step 3: 合并搜索结果 + 拉取消息

1. **合并 chatIds**：从 Q1/Q2 的返回结果中提取所有唯一 chatId
   - `SearchTeamMessagesQueryParameters` 返回 `hitContainers`，每个包含 `resource.channelIdentity.channelId` 或消息的 chatId
   - 提取所有不重复的 chatId

2. **记录关联来源**：
   - Q1 命中的 chatId → `source: "case-number"`
   - Q2 命中的 chatId → `source: "contact-name"`
   - 两者都命中的 → `source: "case-number"`（优先）

3. **拉取完整消息**：对每个 chatId 调用：
```
mcp__teams__ListChatMessages(chatId="{chatId}")
```

> **已知限制**：
> - `ListChatMessages` 的 `filter`/`orderby` 参数实际不可用（后端不支持）
> - `ListChatMessages` 耗时 ~10s/chat
> - `SearchTeamMessagesQueryParameters` 耗时 ~5-10s/query

---

## Step 4: 文件写入

构造 JSON 传给 `write-teams.ps1`：

**方式 1: 通过 stdin（推荐）**
```bash
echo '{json}' | pwsh -NoProfile -File skills/teams-case-search/scripts/write-teams.ps1 -OutputDir "{caseDir}/teams"
```

**方式 2: 通过文件（JSON 过大时）**
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
      "keyword": "string — KQL queryString",
      "status": "success|timeout|parse_error",
      "chatIds": ["string — chatId 数组"]
    }
  ],
  "chats": [
    {
      "chatId": "string (必填)",
      "source": "string — 'case-number' | 'contact-name'",
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
  "elapsed": 16.5
}
```

### write-teams.ps1 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `-OutputDir` | Yes | 输出目录（通常为 `{caseDir}/teams/`） |
| `-InputJson` | No | JSON 字符串。不传则从 stdin 读取 |
| `-InputFile` | No | JSON 文件路径。替代 InputJson/stdin |

---

## 输出文件（由 write-teams.ps1 生成）

```text
teams/
  _search-log.md        # 搜索历史记录
  _chat-index.json      # chatId -> 文件名/时间 映射
  {sanitized-name}.md   # 每个聊天一个文件
```

---

## 执行日志

每个步骤执行前后都必须写入日志文件 `{caseDir}/logs/teams-search.log`。

日志格式（每行一条，append 模式）：
```
[YYYY-MM-DD HH:MM:SS] STEP {步骤号} {状态} | {描述}
```

示例：
```
[2026-03-26 11:08:00] STEP 1 START | Reading case-info.md for contact name/email
[2026-03-26 11:08:01] STEP 1 OK    | Contact: Sushanth C, Email: schan124@ford.com
[2026-03-26 11:08:02] STEP 2 START | KQL parallel search: Q1="2602130040001034", Q2="from:schan124@ford.com"
[2026-03-26 11:08:12] STEP 2 OK    | Q1: 5 hits, Q2: 72 hits, merged 3 unique chatIds
[2026-03-26 11:08:13] STEP 3 START | ListChatMessages: 19:meeting_xxx
[2026-03-26 11:08:23] STEP 3 OK    | 10 messages (8 valid, 2 system)
[2026-03-26 11:08:24] STEP 4 START | write-teams.ps1
[2026-03-26 11:08:28] STEP 4 OK    | 3 chat files written, _search-log.md updated
```

规则：
- 用 Bash `echo "[$(date '+%Y-%m-%d %H:%M:%S')] ..." >> {caseDir}/logs/teams-search.log` 写入
- `{caseDir}/logs/` 目录不存在时先创建
- MCP 调用的输入和结果摘要都要记录
- write-teams.ps1 的 exit code 和输出摘要要记录

---

## 错误处理
- Teams MCP 不可用 → 构造 status="timeout" 的 JSON，仍然调用 write-teams.ps1 记录
- 无搜索结果 → 构造空 chats 的 JSON，仍然调用 write-teams.ps1 记录
- 不要自己手写 `_search-log.md` 或 chat 文件，统一由 write-teams.ps1 处理

---

## 性能对比

| 方法 | 工具 | 耗时 | 备注 |
|------|------|------|------|
| 旧方案 | `SearchTeamsMessages` (Copilot) | ~30-50s/query | M365 Copilot 后端，语义搜索 |
| 新方案 | `SearchTeamMessagesQueryParameters` (KQL) | ~5-10s/query | Graph Search API，关键词搜索 |
| 旧方案总计 | 2x Copilot + messages | ~60-100s | 需后台 agent |
| **新方案总计** | **2x KQL 并行 + messages** | **~15-25s** | **内联执行即可** |
