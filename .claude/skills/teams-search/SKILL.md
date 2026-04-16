---
name: teams-search
description: "Teams 消息搜索（KQL 并行）+ 落盘到 teams/"
displayName: Teams 搜索
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 25s
model: sonnet
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
- `icmNumber`（可选，调用方传入或从 case-info.md 解析）
- 可选 `--force-refresh`：忽略缓存 TTL，强制执行搜索（跳过 Step 0 缓存检查）

## ⚠️ Tool Call 预算：最多 18 次

整个流程严格控制在 **18 次 tool call 以内**（含 Read SKILL.md）。
禁止为 debug、路径检查、中间日志发起额外调用。

| 步骤 | 预算 | 说明 |
|------|------|------|
| Read SKILL.md | 1 | 必须 |
| Step 0 Bash | 1 | 缓存+时间戳+chatId 分类 |
| Step 0.5 MCP + Bash | 2 | 健康检查 + 日志（casework 存活信号） |
| Step 2+3 MCP ×(3-4+H) | 3-4+H | Q1+Q2+Q3+(Q4 if ICM) + HIGH chatId 增量拉取，**同一条消息** |
| Step 3b MCP ×M | 0-M | 仅全新 chatId（排除 LOW），一条消息 |
| Step 4 Write（≥4 chat） | 0-1 | _input.json（≤3 chat 用 heredoc 省掉） |
| Step 4 Bash | 1 | write-teams.ps1 + 全部日志 + end marker |
| Step 5 Bash(es) | 1-3 | 读 context + 写 digest + 写 relevance |
| **合计** | **10-16** | 比原流程减少 1-2 轮消息往返 |

**禁止的多余调用**：
- ❌ Read case-info.md（caller 已传 contactName/contactEmail）
- ❌ Step 2/3 之间的 Bash 日志（延迟到 Step 4）
- ❌ ls/cat 检查文件是否存在
- ❌ Python 脚本调试路径问题
- ❌ Read _input.json（直接 Write/heredoc，不需要先 Read）

---

## QUEUE_MODE 路径（patrol 队列模式）

当 prompt 中包含 `QUEUE_MODE` 时，MCP 搜索由 patrol 的 teams-queue agent 负责，本 agent 只做后处理。

**流程**（4-6 次 tool call）：

1. **等待 `_mcp-raw.json`**（1 次 Bash）：
   ```bash
   CASE_DIR="{caseDir}"
   mkdir -p "$CASE_DIR/logs" "$CASE_DIR/teams"
   date +%s > "$CASE_DIR/logs/.t_teamsSearch_start"
   MAX_WAIT=180
   WAITED=0
   while [ $WAITED -lt $MAX_WAIT ]; do
     if [ -f "$CASE_DIR/teams/_mcp-raw.json" ]; then
       echo "RAW_READY|waited=${WAITED}s"
       break
     fi
     sleep 10
     WAITED=$((WAITED + 10))
   done
   if [ $WAITED -ge $MAX_WAIT ]; then
     echo "RAW_TIMEOUT|waited=${MAX_WAIT}s"
   fi
   ```

   - `RAW_READY` → 继续 Step 2
   - `RAW_TIMEOUT` → 构造空结果，跳到 cleanup

2. **build-input + write-teams.ps1**（1 次 Bash）：
   ```bash
   CASE_DIR="{caseDir}"
   LOG="$CASE_DIR/logs/teams-search.log"
   # build _input.json from raw MCP data
   BUILD=$(python3 .claude/skills/teams-search/scripts/build-input-from-raw.py "$CASE_DIR" 2>&1)
   echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE_MODE STEP 4 | build: $BUILD" >> "$LOG"
   # run write-teams.ps1
   RESULT=$(pwsh -NoProfile -File .claude/skills/teams-search/scripts/write-teams.ps1 -OutputDir "$CASE_DIR/teams" -InputFile "$CASE_DIR/teams/_input.json" 2>&1)
   echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE_MODE STEP 4 | write-teams: $RESULT" >> "$LOG"
   echo "WRITE_DONE|$BUILD"
   ```

3. **Step 5（relevance + digest）**：同 DIRECT_MODE 的 Step 5（见下方），使用 `_input.json` 中的 chat 数据做评分。

4. **Cleanup**（1 次 Bash）：
   ```bash
   CASE_DIR="{caseDir}"
   date +%s > "$CASE_DIR/logs/.t_teamsSearch_end"
   echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE_MODE DONE" >> "$CASE_DIR/logs/teams-search.log"
   echo "TEAMS_SEARCH_DONE|QUEUE_MODE"
   ```

> QUEUE_MODE 下**不做 MCP 调用**，不做 Step 0 缓存检查，不做 Step 0.5 MCP 健康检查。

---

## DIRECT_MODE 路径（单 case 模式，默认）

以下是 DIRECT_MODE 的完整流程（自行做 MCP 搜索 + 后处理）。

## Step 0: 缓存检查 + 初始化（1 次 Bash）

**`--force-refresh` 时**：跳过缓存检查，但仍需写时间戳：

```bash
CASE_DIR="{caseDir}"
LOG="$CASE_DIR/logs/teams-search.log"
mkdir -p "$CASE_DIR/logs" "$CASE_DIR/teams"
date +%s > "$CASE_DIR/logs/.t_teamsSearch_start"
DEADLINE=$(($(date +%s) + 120))
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 SKIP | --force-refresh | DEADLINE=$(date -d @$DEADLINE '+%H:%M:%S' 2>/dev/null || date -r $DEADLINE '+%H:%M:%S' 2>/dev/null || echo $DEADLINE)" >> "$LOG"
# 输出缓存 chatId 分类（高相关/低相关）+ 增量时间戳
python3 -c "
import json, sys, os
idx_path = '$CASE_DIR/teams/_chat-index.json'
rel_path = '$CASE_DIR/teams/_relevance.json'
if not os.path.exists(idx_path):
    print('CACHED_HIGH='); print('CACHED_LOW='); print('CACHED_TIMESTAMPS='); sys.exit()
idx = json.load(open(idx_path))
chat_ids = [k for k in idx if not k.startswith('_')]
rel = {}
if os.path.exists(rel_path):
    rj = json.load(open(rel_path))
    for fname, info in rj.get('chats', {}).items():
        rel[fname] = info.get('relevance', 'high')
high_ids, low_ids, timestamps = [], [], []
for cid in chat_ids:
    meta = idx[cid] if isinstance(idx[cid], dict) else {}
    fname = meta.get('fileName', '').replace('.md', '')
    lmt = meta.get('lastMessageTime', '')
    if rel.get(fname) == 'low':
        low_ids.append(cid)
    else:
        high_ids.append(cid)
        timestamps.append(f'{cid}={lmt}' if lmt else cid)
print('CACHED_HIGH=' + '|'.join(high_ids))
print('CACHED_LOW=' + '|'.join(low_ids))
print('CACHED_TIMESTAMPS=' + '|'.join(timestamps))
" 2>/dev/null || { echo "CACHED_HIGH="; echo "CACHED_LOW="; echo "CACHED_TIMESTAMPS="; }
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
# 缓存过期或首次：输出 chatId 分类（高相关/低相关）
if [ ! -f "$CACHE_FILE" ] || [ $AGE_SECS -ge $THRESHOLD ] 2>/dev/null; then
  python3 -c "
import json, sys, os
idx_path = '$CASE_DIR/teams/_chat-index.json'
rel_path = '$CASE_DIR/teams/_relevance.json'
if not os.path.exists(idx_path):
    print('CACHED_HIGH='); print('CACHED_LOW='); print('CACHED_TIMESTAMPS='); sys.exit()
idx = json.load(open(idx_path))
chat_ids = [k for k in idx if not k.startswith('_')]
rel = {}
if os.path.exists(rel_path):
    rj = json.load(open(rel_path))
    for fname, info in rj.get('chats', {}).items():
        rel[fname] = info.get('relevance', 'high')
high_ids, low_ids, timestamps = [], [], []
for cid in chat_ids:
    meta = idx[cid] if isinstance(idx[cid], dict) else {}
    fname = meta.get('fileName', '').replace('.md', '')
    lmt = meta.get('lastMessageTime', '')
    if rel.get(fname) == 'low':
        low_ids.append(cid)
    else:
        high_ids.append(cid)
        timestamps.append(f'{cid}={lmt}' if lmt else cid)
print('CACHED_HIGH=' + '|'.join(high_ids))
print('CACHED_LOW=' + '|'.join(low_ids))
print('CACHED_TIMESTAMPS=' + '|'.join(timestamps))
" 2>/dev/null || { echo "CACHED_HIGH="; echo "CACHED_LOW="; echo "CACHED_TIMESTAMPS="; }
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

## Step 2+3: 并行搜索 + 缓存拉取（合并步骤）

**跳过 Step 1**——联系人信息由 caller 传入，不需要额外 Read。

解析 Step 0 输出的 `CACHED_HIGH`、`CACHED_LOW` 和 `CACHED_TIMESTAMPS`，按 `|` 分割为列表。
`CACHED_TIMESTAMPS` 格式为 `chatId=2026-04-10T03:15:22Z|chatId2=...`，用于增量拉取。

### 情况 A：有缓存 HIGH chatId（patrol 常态）

**在一条 assistant 消息中同时发出 所有搜索 + HIGH chatId 增量拉取**：

```
# 搜索查询（发现新 chatId）
SearchTeamMessagesQueryParameters(queryString="{caseNumber}", size=25)           # Q1
SearchTeamMessagesQueryParameters(queryString="from:{contactEmail}", size=5)     # Q2
ListChats(userUpns=["fangkun@microsoft.com"], topic="{caseNumber}", top=50)     # Q3
# Q4: ICM 号搜索（仅当 icmNumber 非空时发出）
SearchTeamMessagesQueryParameters(queryString="{icmNumber}", size=10)            # Q4（可选）

# 增量拉取 HIGH chatId — 不限条数，拉完整历史
# ⚠️ 超长消息（日志/XML/代码）在 Step 4 构建 _input.json 时会被截断，不会撑爆 token
ListChatMessages(chatId="{high_id_1}", top=20)
ListChatMessages(chatId="{high_id_2}", top=20)
# ... 对每个 CACHED_HIGH 中的 chatId
```

> ⚠️ 不限制消息条数（保持 top=20），但对**超长消息体**做截断（见 Step 4 截断规则）
> write-teams.ps1 的 `lastMessageTime` 对比机制会自动跳过已缓存的旧消息，只 append 新增的
> ⚠️ 不拉取 CACHED_LOW 中的 chatId——已知不相关，节省 API 调用。
> Q2 备注：`size=5` 足够发现私聊 chatId。如果无 contactEmail 则用 `{caseNumber} OR {firstName}`。

### 情况 B：无缓存（CACHED_HIGH 和 CACHED_LOW 都为空）

回退到仅搜索模式——**一条消息发出 Q1+Q2+Q3**：

```
SearchTeamMessagesQueryParameters(queryString="{caseNumber}", size=25)
SearchTeamMessagesQueryParameters(queryString="from:{contactEmail}", size=5)
ListChats(userUpns=["fangkun@microsoft.com"], topic="{caseNumber}", top=50)
```

等搜索结果返回后，提取所有唯一 chatId，再发 ListChatMessages（见 Step 3b）。

### 结果处理

从 Q1+Q2+Q3+Q4 中提取所有唯一 chatId，记住来源（Q1→`case-number`，Q2→`contact-name`，Q3→`meeting-topic`，Q4→`icm-number`）。

> Q4 备注：ICM 号搜索能发现与 PG 讨论 incident 的 channel/chat，这些对话通常包含 root cause 分析和修复进展。如果 `icmNumber` 为空，跳过 Q4。

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
