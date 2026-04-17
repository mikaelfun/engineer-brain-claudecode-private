---
name: teams-search
description: "Teams 消息搜索 + 落盘到 teams/"
displayName: Teams 搜索
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 15s
model: sonnet
promptTemplate: |
  Execute teams-search for Case {caseNumber}{forceRefresh}. Read .claude/skills/teams-search/SKILL.md for full instructions, then execute.
---

# Teams Search

搜索与 Case 相关的 Teams 消息，通过 `write-teams.ps1` 落盘。

## 三种执行模式

### 1. INLINE_HTTP 模式（默认，推荐）

**由 `casework-gather.sh` 自动调用，不需要 LLM agent。**

`teams-search-inline.sh` 直接通过 agency.exe HTTP proxy 调 MCP，完全绕过 LLM。
每个 case 独立 proxy 实例，天然跨 case 并行安全。

```bash
bash .claude/skills/teams-search/scripts/teams-search-inline.sh \
  --case-number {caseNumber} \
  --case-dir {caseDir} \
  --contact-email {email}
```

**性能**：10-15s/case（search 3s + parallel fetch ~7s + startup ~5s）

**输出**：`{caseDir}/teams/_mcp-raw.json`（v2 schema）
**后处理**：`casework-gather.sh` 自动调用 `build-input-from-raw.py` + `write-teams.ps1`

**架构**（基于实测数据）：
1. 启动 `agency.exe mcp teams --transport http --port {port}` 本地 HTTP proxy（~5s）
2. curl 搜索（SearchTeamMessagesQueryParameters）（~3s）
3. **并行** curl 拉取所有 chatId 的消息（ThreadPoolExecutor，单 proxy 即可并行）（~6-7s）
4. Python 解析 → dump `_mcp-raw.json`
5. 完成后自动杀掉 proxy

**并行实测结论**：

| 架构 | 8 chat fetch 耗时 | 说明 |
|------|-------------------|------|
| 1 proxy 串行 for 循环 | 22.6s | 旧版，逐个调用 |
| **1 proxy 并行 ThreadPool** | **7.5s** | ✅ 当前版本 |
| 2 proxy 并行 | 7.5s | 无额外收益 |
| 4 proxy 并行 | 7.2s | 无额外收益 |

> 单个 Teams proxy 完全支持并发 ListChatMessages 请求。
> 多 proxy 只增加启动开销，不提速。每 case 1 个 proxy 是最优架构。
>
> ⚠️ 跨 case 共享单 proxy 会丢数据（SearchTeamMessages 并发冲突），
> 所以跨 case 必须独立 proxy。

### 2. DIRECT_MODE（DEPRECATED）

**⚠️ DEPRECATED** — 推荐改用 INLINE_HTTP 模式。

### 3. QUEUE_MODE（DEPRECATED）

**⚠️ DEPRECATED** — `casework-gather.sh` 直接后台调用 `teams-search-inline.sh`，
每个 case 独立 agency proxy 实例，天然并行，不再需要 queue 机制。

---

## Step 3b: 增量拉取新发现的 chatId

对比搜索发现的 chatId 与 **CACHED_HIGH + CACHED_LOW 的并集**：

- **在 CACHED_HIGH 中** → 消息已在 Step 2+3 中并行拉取，无需操作
- **在 CACHED_LOW 中** → 已知不相关，**跳过拉取**（不浪费 API 调用）
- **全新 chatId**（不在 HIGH 也不在 LOW 中）→ 需要拉取

> 关键：CACHED_LOW 的 chatId 即使被搜索重新发现，也**不会被当作"新"chatId**而重复拉取。只有真正从未见过的 chatId 才会触发拉取。

**有全新 chatId 时**（或情况 B 首次搜索），发一条消息拉取：

```
ListChatMessages(chatId="{new_id_1}", top=20)
ListChatMessages(chatId="{new_id_2}", top=20)
// ... 同一条消息
```

**无全新 chatId** → 跳过，直接 Step 4。

**批次规则**（适用于情况 B 和新 chatId 拉取）：
- **1-4 个 chatId** → 1 条消息，全部并行
- **5-8 个 chatId** → 2 条消息，每条 4 个
- **9+ 个 chatId** → 3 条消息，每条 3-4 个

**超时处理**：如果 MCP 调用累计已接近 deadline，跳过剩余 chatId，用已有数据继续到 Step 4。

---

## Step 4: 写入 + 全部日志（1-2 次调用）

### ⚠️ _input.json 精确 Schema（必须严格遵循）

```json
{
  "caseNumber": "260xxx",
  "searchResults": [
    { "keyword": "搜索关键词", "status": "success", "chatIds": ["19:..."] }
  ],
  "chats": [
    {
      "chatId": "19:xxx@thread.v2",
      "displayName": "Chat Display Name",
      "source": "search",
      "messages": [
        {
          "id": "msg-id",
          "createdDateTime": "2026-04-15T11:39:52Z",
          "from": { "displayName": "User Name" },
          "body": { "contentType": "Html", "content": "<p>消息内容</p>" }
        }
      ]
    }
  ],
  "searchMode": "full",
  "fallbackTriggered": false,
  "elapsed": 25.0
}
```

**⚠️ 关键格式要求**（write-teams.ps1 严格校验）：
- `from` **必须是 object** `{ "displayName": "..." }`，**不能是 string**
- `body` **必须是 object** `{ "contentType": "Html"|"Text", "content": "..." }`，**不能只写 content string**
- MCP `ListChatMessages` 返回的 `from` 是 `{ "user": { "displayName": "..." } }`，需要转换为 `{ "displayName": "..." }`
- MCP 返回的 `body` 已经是正确格式 `{ "contentType": "...", "content": "..." }`，直接保留

### ⚠️ 超长消息截断规则（防止 token 爆炸）

构建 `_input.json` 时，对每条消息的 `body.content` 检查长度：

- **≤ 2000 字符** → 保持原样
- **> 2000 字符** → 截断到 2000 字符，末尾追加 `...[truncated, original {N} chars]`
- **纯图片消息**（仅含 `<img>` / `<attachment>` 标签，无文字）→ 替换为 `[image/attachment]`

> 这确保单条消息不超过 ~500 tokens，20 条消息 × 10 个 chat = 最多 ~100k tokens
> 日志、XML、代码截图等超长内容被截断后不影响 write-teams.ps1 的处理（它保留完整 HTML）
> ⚠️ 截断只影响 `_input.json`（LLM context），不影响写入磁盘的 `.md` 文件——那些由 MCP 原始数据直接写入

### ⚠️ JSON 大小决定写入方式

- **≤3 个 chat** → 可用 Bash heredoc 直接写（1 次 Bash）
- **≥4 个 chat** → **必须用 Write 工具**写 `_input.json`（1 次 Write + 1 次 Bash = 2 次）

> 🚫 **禁止**把 4+ 个 chat 的 JSON 放进 Bash heredoc——会超出模型 output token 限制导致截断，整个 Step 4 失败。

### 方式 A（≤3 chat）：Bash heredoc 一步完成

```bash
CASE_DIR="{caseDir}"
LOG="$CASE_DIR/logs/teams-search.log"
cat > "$CASE_DIR/teams/_input.json" << 'JSONEOF'
{json_content}
JSONEOF
RESULT=$(pwsh -NoProfile -File .claude/skills/teams-search/scripts/write-teams.ps1 -OutputDir "$CASE_DIR/teams" -InputFile "$CASE_DIR/teams/_input.json" 2>&1)
cat >> "$LOG" << LOGEOF
[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | Q1={q1}hits, Q2={q2}hits, Q3={q3}chats | {n} unique
[$(date '+%Y-%m-%d %H:%M:%S')] STEP 3 OK | {n} chats, {batches} batches
[$(date '+%Y-%m-%d %H:%M:%S')] STEP 4 OK | $RESULT
LOGEOF
echo "| $(date '+%Y-%m-%d %H:%M') GMT+8 | {caseNumber} | ok | full | - | no | {elapsed}s | {n} | ok | summary |" >> "$CASE_DIR/teams/_search-log.md"
date +%s > "$CASE_DIR/logs/.t_teamsSearch_end"
echo "DONE|chats={n},elapsed={elapsed}s"
```

### 方式 B（≥4 chat）：Write + Bash 分两步

**第一步**：用 Write 工具写 `_input.json`
```
Write(file_path="{caseDir}/teams/_input.json", content="{json_content}")
```

**第二步**：Bash 运行 write-teams.ps1 + 日志 + end marker
```bash
CASE_DIR="{caseDir}"
LOG="$CASE_DIR/logs/teams-search.log"
RESULT=$(pwsh -NoProfile -File .claude/skills/teams-search/scripts/write-teams.ps1 -OutputDir "$CASE_DIR/teams" -InputFile "$CASE_DIR/teams/_input.json" 2>&1)
cat >> "$LOG" << LOGEOF
[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | Q1={q1}hits, Q2={q2}hits, Q3={q3}chats | {n} unique
[$(date '+%Y-%m-%d %H:%M:%S')] STEP 3 OK | {n} chats, {batches} batches
[$(date '+%Y-%m-%d %H:%M:%S')] STEP 4 OK | $RESULT
LOGEOF
echo "| $(date '+%Y-%m-%d %H:%M') GMT+8 | {caseNumber} | ok | full | - | no | {elapsed}s | {n} | ok | summary |" >> "$CASE_DIR/teams/_search-log.md"
date +%s > "$CASE_DIR/logs/.t_teamsSearch_end"
echo "DONE|chats={n},elapsed={elapsed}s"
```

---

## 错误处理

- **Step 2+3 MCP 全部失败** → 构造空 JSON（chats: []），仍执行 Step 4
- **Step 3b 部分 chatId 超时** → 用已拉到的数据继续，跳过失败的 chatId
- **任何异常** → 确保 Step 4 Bash 执行（写 end marker 是最高优先级）

## 超时保护

- Step 0 设 `DEADLINE=$(($(date +%s) + 120))`
- Step 3b 前：如果 `$(date +%s) > DEADLINE`，跳过剩余，直接 Step 4
- MCP 无响应 → 记录 timeout，用空结果继续
- **无论如何 Step 4 必须执行**——end marker 是 casework 等待的信号

---

## Step 5: Relevance Scoring & Digest Generation（1-3 次调用）

> ⚠️ 只在 Step 4 **成功写入至少 1 个 chat 文件**后执行。
> 缓存命中（Step 0 CACHE_VALID）时跳过——digest 已存在。

### 5a. 读取 Case 上下文（1 次 Bash）

```bash
CASE_DIR="{caseDir}"
SUMMARY=""
if [ -f "$CASE_DIR/case-summary.md" ]; then
  SUMMARY=$(head -60 "$CASE_DIR/case-summary.md")
fi
INFO=$(cat "$CASE_DIR/case-info.md" 2>/dev/null | head -30)
echo "===CASE_CONTEXT==="
echo "$SUMMARY"
echo "===CASE_INFO==="
echo "$INFO"
```

### 5b. 评分 + 写入（1-2 次 Bash/Write）

Agent 已在内存中持有 Step 2+3/3b 的所有 chat 内容。结合 case context，对每个**新拉取的** chat 评分：

> ⚠️ 已有 `_relevance.json` 中标记为 `low` 的 chat **不重新评分**——它们在 Step 2+3 中被跳过，保持原评分。
> 仅对 HIGH chatId（可能有新消息）和全新 chatId 进行评分。评分时可参考已有 `_relevance.json` 中的 HIGH 条目保持一致性。

**分类标准**：
- `high`：讨论本 case 技术问题、客户沟通、排查步骤、PG 协作、团队讨论本 case 解决方案
- `low`：偶然提到 case 号、不相关话题、日常闲聊、讨论其他 case

**从 `high` chat 中提取 key facts**：每条 fact 是一个独立的事实陈述（时间+人物+内容），可被 troubleshooter/inspection-writer 直接引用。

**写入两个文件**（用 Bash heredoc 或 Write 工具）：

#### `_relevance.json` 格式

```json
{
  "_scoredAt": "2026-04-11T15:30:00Z",
  "_caseContext": "{一句话概括 case 问题}",
  "chats": {
    "{filename-without-md}": {
      "relevance": "high",
      "chatType": "customer",
      "reason": "{为什么相关的一句话}",
      "keyFacts": ["{fact1}", "{fact2}"]
    },
    "{filename-without-md}": {
      "relevance": "high",
      "chatType": "internal",
      "reason": "{为什么相关的一句话}",
      "keyFacts": ["{fact1}"]
    },
    "{filename-without-md}": {
      "relevance": "low",
      "reason": "{为什么不相关的一句话}"
    }
  }
}
```

> `chatType`：`customer`（与客户/客户同事直接沟通）| `internal`（内部团队讨论）。仅 `high` 需要标注。

#### `teams-digest.md` 格式

```markdown
# Teams 相关对话摘要

> Case: {caseNumber} — {title}
> 评分时间: {timestamp} GMT+8
> 相关对话: {highCount}/{totalCount} | 无关对话: {lowCount}/{totalCount}

## 关键事实（Key Facts）

- {fact1}
- {fact2}

## 相关对话

### {Contact Name} — {reason}
> 来源: teams/{filename}.md

**{date}** {summary of key exchange}

---

<details>
<summary>无关对话（{lowCount} 条，已折叠）</summary>

- **{filename}.md** — {reason}

</details>
```

### 5c. 特殊情况处理

- **无 case-summary.md**（首次运行）→ 仅用 case-info.md（标题+产品+客户名）做评分，准确度降低但仍有效
- **0 个 chat**（Step 4 写入 0 个文件）→ 跳过 Step 5
- **所有 chat 都是 low** → digest 写 "No directly relevant Teams conversations found"，Key Facts 为空
- **Step 5 失败**（任何异常）→ 记录日志警告，不影响已写入的 end marker 和原始 chat 文件
