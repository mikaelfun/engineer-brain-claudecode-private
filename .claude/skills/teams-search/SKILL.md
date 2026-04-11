---
name: teams-search
description: "Teams 消息搜索（KQL 并行）+ 落盘到 teams/"
displayName: Teams 搜索
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 25s
model: haiku
promptTemplate: |
  Execute teams-search for Case {caseNumber}{forceRefresh}. Read .claude/skills/teams-search/SKILL.md for full instructions, then execute.
---

# Teams Search — KQL Parallel Search

搜索与 Case 相关的 Teams 消息，通过 `write-teams.ps1` 落盘。

## 关键约束
- **禁止自己写 teams/ 下的 md 文件**，必须通过 `write-teams.ps1`
- 搜索结果为空也必须调用 write-teams.ps1（传空 chats）
- write-teams.ps1 会自动过滤 bot/self chat（displayName="unknown-chat"），无需手动处理

## 输入
- `caseNumber`, `caseDir`（绝对路径）
- `contactName`, `contactEmail`（调用方传入，省去读 case-info.md）
- 可选 `--force-refresh`：忽略缓存 TTL，强制执行搜索（跳过 Step 0 缓存检查）

## ⚠️ Tool Call 预算：最多 20 次

整个流程严格控制在 **20 次 tool call 以内**（含 Read SKILL.md）。
禁止为 debug、路径检查、中间日志发起额外调用。

| 步骤 | 预算 | 说明 |
|------|------|------|
| Read SKILL.md | 1 | 必须 |
| Step 0 Bash | 1 | 缓存+时间戳+deadline |
| Step 0.5 MCP + Bash | 2 | 健康检查 + 日志（casework 存活信号） |
| Step 2 MCP ×3 | 3 | Q1+Q2+Q3 **同一条消息** |
| Step 3 MCP ×N | 4-8 | ListChatMessages 分 1-2 批 |
| Step 4 Write（≥4 chat） | 0-1 | _input.json（≤3 chat 用 heredoc 省掉） |
| Step 4 Bash | 1 | write-teams.ps1 + 全部日志 + end marker |
| Step 5 Bash(es) | 1-3 | 读 context + 写 digest + 写 relevance |
| **合计** | **14-20** | |

**禁止的多余调用**：
- ❌ Read case-info.md（caller 已传 contactName/contactEmail）
- ❌ Step 2/3 之间的 Bash 日志（延迟到 Step 4）
- ❌ ls/cat 检查文件是否存在
- ❌ Python 脚本调试路径问题
- ❌ Read _input.json（直接 Write/heredoc，不需要先 Read）

---

## Step 0: 缓存检查 + 初始化（1 次 Bash）

**`--force-refresh` 时**：跳过缓存检查，但仍需写时间戳：

```bash
CASE_DIR="{caseDir}"
LOG="$CASE_DIR/logs/teams-search.log"
mkdir -p "$CASE_DIR/logs" "$CASE_DIR/teams"
date +%s > "$CASE_DIR/logs/.t_teamsSearch_start"
DEADLINE=$(($(date +%s) + 120))
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 SKIP | --force-refresh | DEADLINE=$(date -d @$DEADLINE '+%H:%M:%S' 2>/dev/null || date -r $DEADLINE '+%H:%M:%S' 2>/dev/null || echo $DEADLINE)" >> "$LOG"
echo "CACHE_EXPIRED|force"
```

**正常流程**：

```bash
CASE_DIR="{caseDir}"
LOG="$CASE_DIR/logs/teams-search.log"
mkdir -p "$CASE_DIR/logs" "$CASE_DIR/teams"
date +%s > "$CASE_DIR/logs/.t_teamsSearch_start"
CACHE_FILE="$CASE_DIR/teams/_cache-epoch"
CACHE_HOURS=$(python3 -c "import json; print(json.load(open('config.json')).get('teamsSearchCacheHours', 8))" 2>/dev/null || echo 8)
if [ -f "$CACHE_FILE" ]; then
  CACHE_EPOCH=$(cat "$CACHE_FILE")
  NOW=$(date +%s)
  AGE_SECS=$((NOW - CACHE_EPOCH))
  AGE_H=$((AGE_SECS / 3600))
  AGE_M=$(( (AGE_SECS % 3600) / 60 ))
  THRESHOLD=$((CACHE_HOURS * 3600))
  if [ $AGE_SECS -lt $THRESHOLD ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 SKIP | Cache valid, age=${AGE_H}h${AGE_M}m < ${CACHE_HOURS}h" >> "$LOG"
    date +%s > "$CASE_DIR/logs/.t_teamsSearch_end"
    echo "CACHE_VALID|${AGE_H}h${AGE_M}m"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 OK | Cache expired, age=${AGE_H}h${AGE_M}m" >> "$LOG"
    echo "CACHE_EXPIRED|${AGE_H}h${AGE_M}m"
  fi
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 OK | No cache file" >> "$LOG"
  echo "NO_CACHE"
fi
```

- `CACHE_VALID` → **直接结束**（end marker 已在脚本中写入）
- `CACHE_EXPIRED` 或 `NO_CACHE` → 继续 Step 2

> ⚠️ `CACHE_VALID` 时 Step 0 Bash 已写 `.t_teamsSearch_end`，agent 直接退出即可。

---

## Step 0.5: Teams MCP 自检（1 次 MCP + 1 次 Bash）

缓存过期后，**必须先验证 Teams MCP 可用**。这是 casework 判断 agent 存活的关键信号。

**MCP 调用**：
```
SearchTeamMessagesQueryParameters(queryString="test", size=1)
```

**成功** → Bash 写日志 + 输出 CONTINUE 信号（⚠️ 不要输出 "OK" 或 "done"，避免模型误判任务完成）：
```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0.5 OK | Teams MCP healthy" >> "{caseDir}/logs/teams-search.log"
echo "MCP_READY|proceed to Step 2 KQL search"
```

**失败** → Bash 写日志 + end marker，然后退出：
```bash
LOG="{caseDir}/logs/teams-search.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0.5 FAIL | Teams MCP unavailable: {error}" >> "$LOG"
date +%s > "{caseDir}/logs/.t_teamsSearch_end"
```

---

## Step 2: KQL 并行搜索（3 次 MCP，同一条消息）

**跳过 Step 1**——联系人信息由 caller 传入，不需要额外 Read。

**在一条 assistant 消息中同时发出 3 个 tool_use**：

**Q1** — caseNumber：
```
SearchTeamMessagesQueryParameters(queryString="{caseNumber}", size=25)
```

**Q2** — 联系人（发现私聊用）：
```
SearchTeamMessagesQueryParameters(queryString="from:{contactEmail}", size=5)
```

**Q3** — Meeting chat：
```
ListChats(userUpns=["fangkun@microsoft.com"], topic="{caseNumber}", top=50)
```

**Q2 备注**：`size=5` 足够发现私聊 chatId。如果无 contactEmail 则用 `{caseNumber} OR {firstName}`。

从结果中提取所有唯一 chatId，记住每个 chatId 的来源（Q1→`case-number`，Q2→`contact-name`，Q3→`meeting-topic`）。

---

## Step 3: 并行拉取消息（N 次 MCP，分批）

对所有唯一 chatId 拉取消息，**一条消息中发出多个 ListChatMessages**：

- **1-4 个 chatId** → 1 条消息，全部并行
- **5-8 个 chatId** → 2 条消息，每条 4 个
- **9+ 个 chatId** → 3 条消息，每条 3-4 个

```
ListChatMessages(chatId="{chatId1}", top=20)
ListChatMessages(chatId="{chatId2}", top=20)
// ... 同一条消息
```

**超时处理**：如果 Step 2+3 的 MCP 调用累计已接近 deadline（在 Step 3 第二批之前检查），跳过剩余 chatId，用已有数据继续到 Step 4。

---

## Step 4: 写入 + 全部日志（1-2 次调用）

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

- **Step 2 MCP 全部失败** → 构造空 JSON（chats: []），仍执行 Step 4
- **Step 3 部分 chatId 超时** → 用已拉到的数据继续，跳过失败的 chatId
- **任何异常** → 确保 Step 4 Bash 执行（写 end marker 是最高优先级）

## 超时保护

- Step 0 设 `DEADLINE=$(($(date +%s) + 120))`
- Step 3 第二批前：如果 `$(date +%s) > DEADLINE`，跳过剩余，直接 Step 4
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

Agent 已在内存中持有 Step 3-4 的所有 chat 内容。结合 case context，对每个 chat 评分：

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
      "reason": "{为什么相关的一句话}",
      "keyFacts": ["{fact1}", "{fact2}"]
    },
    "{filename-without-md}": {
      "relevance": "low",
      "reason": "{为什么不相关的一句话}"
    }
  }
}
```

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
