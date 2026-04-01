---
name: teams-search
description: "Teams 消息搜索（KQL 并行）+ 落盘到 teams/"
displayName: Teams 搜索
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 25s
promptTemplate: |
  Execute teams-search for Case {caseNumber}{forceRefresh}{fullSearch}. Read .claude/skills/teams-search/SKILL.md for full instructions, then execute.
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
- 可选 `--full-search`：强制全量搜索，忽略增量逻辑（不追加 `sent>=` 过滤）

---

## Step 0: 缓存检查（Bash 计算，禁止 LLM 做时间差）

**`--force-refresh` 时跳过此步骤**，直接进入 Step 1，日志记录：
```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 SKIP | --force-refresh, bypassing cache check" >> "$LOG"
```

**正常流程必须用以下 Bash 命令检查缓存，不要自己读 JSON 算时间差**：

```bash
LOG="{caseDir}/logs/teams-search.log" && mkdir -p "{caseDir}/logs" && \
CACHE_FILE="{caseDir}/teams/_cache-epoch" && \
if [ -f "$CACHE_FILE" ]; then \
  CACHE_EPOCH=$(cat "$CACHE_FILE") && NOW=$(date +%s) && \
  AGE_SECS=$((NOW - CACHE_EPOCH)) && AGE_H=$((AGE_SECS / 3600)) && AGE_M=$(( (AGE_SECS % 3600) / 60 )) && \
  THRESHOLD=$((4 * 3600)) && \
  if [ $AGE_SECS -lt $THRESHOLD ]; then \
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 SKIP | Cache valid, age=${AGE_H}h${AGE_M}m < 4h" >> "$LOG" && \
    echo "CACHE_VALID|${AGE_H}h${AGE_M}m"; \
  else \
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 OK | Cache expired, age=${AGE_H}h${AGE_M}m > 4h" >> "$LOG" && \
    echo "CACHE_EXPIRED|${AGE_H}h${AGE_M}m"; \
  fi; \
else \
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 0 OK | No cache file, proceeding with search" >> "$LOG" && \
  echo "NO_CACHE"; \
fi
```

输出 `CACHE_VALID` → **直接退出，不执行后续步骤**。输出 `CACHE_EXPIRED` 或 `NO_CACHE` → 继续。

## Step 1: 联系人信息

使用调用方传入的 `contactName` 和 `contactEmail`。
仅当未传入时才从 `{caseDir}/case-info.md` 读取（独立调用场景）。

## Step 2: KQL 并行搜索

**始终 Q1 + Q2 + Q3 三路并行**（单条消息 3 个 MCP 调用）。

**Q1** — caseNumber 搜索：
```
SearchTeamMessagesQueryParameters(queryString="{caseNumber}")
```

**Q2** — 联系人搜索（有邮箱用 `from:{email}`，无邮箱用 `{caseNumber} OR {firstName}`）：
```
SearchTeamMessagesQueryParameters(queryString="from:{contactEmail}")
```
> 姓名只用第一个 token，不用精确短语匹配。

**Q3** — ListChats topic 过滤（捕获 meeting chat，KQL 搜不到这类）：
```
ListChats(userUpns=["fangkun@microsoft.com"], topic="{caseNumber}", top=50)
```

### KQL 要点
- 默认 AND 逻辑，用 `OR` 组合关键词
- 用 `from:` 按发件人，避免精确短语和过多 AND

### 增量搜索
有 `_search-log.md` 且有最近成功记录 → Q1/Q2 追加 `sent>=YYYY-MM-DD`，设 `searchMode="incremental"`。
Q3 始终全量（ListChats 不支持时间过滤），但 Step 3 中用本地 `_chat-index.json` 做 chatId diff，**仅对新发现的 chatId 拉取消息**，已知 chatId 跳过（write-teams.ps1 会增量 append）。
增量 Q1+Q2 均 0 命中且无本地缓存 → 回退全量，设 `searchMode="full-fallback"`。

**`--full-search` 时**：跳过增量逻辑，不追加 `sent>=`，强制 `searchMode="full"`。所有 chatId 均重新拉取消息。

---

## Step 3: 合并结果 + 拉取消息

1. 合并 Q1/Q2/Q3 的唯一 chatId
2. 记录来源：Q1→`case-number`，Q2→`contact-name`，Q3→`meeting-topic`（多来源取优先）
3. **增量 diff**：读取 `{caseDir}/teams/_chat-index.json` 中已有 chatId 列表
   - **新 chatId**（不在 index 中）→ `ListChatMessages` 拉取完整消息
   - **已知 chatId**（在 index 中）→ 也 `ListChatMessages` 拉取（write-teams.ps1 会增量 append 新消息）
   - 如果合并后 0 个 chatId → 跳过拉取

---

## Step 4: 文件写入

用固定模板填入搜索结果，传给 write-teams.ps1（**不要自行设计 JSON 结构**，直接用下方模板替换占位符）：

```bash
LOG="{caseDir}/logs/teams-search.log" && \
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 4 START | write-teams.ps1" >> "$LOG" && \
echo '{json}' | pwsh -NoProfile -File .claude/skills/teams-search/scripts/write-teams.ps1 -OutputDir "{caseDir}/teams" 2>&1 && \
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 4 OK | files written" >> "$LOG" || \
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 4 FAIL | see output" >> "$LOG"
```

JSON 过大时先写 `{caseDir}/teams/_input.json`，用 `-InputFile` 参数。

### 固定 JSON 模板（直接填入，不要自行构造结构）
```json
{
  "caseNumber": "{caseNumber}",
  "searchResults": [
    { "keyword": "{caseNumber}", "status": "{q1Status}", "chatIds": ["{q1ChatIds}"] },
    { "keyword": "from:{contactEmail}", "status": "{q2Status}", "chatIds": ["{q2ChatIds}"] },
    { "keyword": "topic:{caseNumber}", "status": "{q3Status}", "chatIds": ["{q3ChatIds}"] }
  ],
  "chats": [
    {
      "chatId": "{chatId}",
      "source": "{source}",
      "messages": [{messages}]
    }
  ],
  "searchMode": "{full|incremental|full-fallback}",
  "elapsed": {elapsedSeconds}
}
```

---

## 日志规范

日志 append 到 `{caseDir}/logs/teams-search.log`。
**禁止**为单个 echo 单独发起 Bash 调用——必须合并到工作命令中。
Step 0 的日志已在缓存检查脚本中合并。其余步骤的日志合并到 Step 4 的 Bash 调用中。
MCP 调用无法写日志，在前后最近的 Bash 命令中记录。

## 错误处理
- Teams MCP 不可用 → 构造 status="timeout" 的 JSON，仍调用 write-teams.ps1
- 无结果 → 空 chats JSON，仍调用 write-teams.ps1
