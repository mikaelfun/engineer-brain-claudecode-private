---
name: teams-search-queue
description: "Patrol 专用串行 Teams MCP 搜索队列 — 只做 MCP 调用 + dump 原始结果"
displayName: Teams 搜索队列
category: inline
stability: stable
requiredInput: casesRoot
model: haiku
---

# Teams Search Queue — MCP-Only Serial Processor

Patrol 启动的**单 agent**，串行处理所有 case 的 Teams 搜索请求。
**只负责 MCP 调用 + dump 原始结果**，不做 write-teams.ps1 / relevance / digest（这些由 casework 内联处理）。

## 设计原则

MCP 调用必须串行（Teams API 互斥），但 LLM 思考/JSON 构建/write-teams.ps1 不需要串行。
Queue 只做必须串行的部分（MCP 调用），剩余工作交回 casework 并行处理。

## 关键约束
- **禁止调用 write-teams.ps1**（casework 负责）
- **禁止做 relevance scoring / digest generation**（casework 负责）
- **禁止构建 `_input.json`**（`build-input-from-raw.py` 脚本负责）
- 每个 case 处理完（无论成败）**必须**删 `request.json`
- MCP 健康检查只做一次（Step 0），不每个 case 重复
- 单个 case 超时 60s → 跳过

## 输入
- `casesRoot`：Case 数据根目录（**必须是相对路径**如 `./cases`，绝对禁止 Windows 绝对路径 `C:\...`）
- `teamsSearchCacheHours`：缓存 TTL（小时，默认 8）

**⚠️ 禁止在 `{casesRoot}/active/` 下创建任何目录或文件（如 `__teams-queue__`）。active/ 下只有 case 编号目录。**

## ⚠️ Tool Call 预算：最多 150 次（maxTurns）
每个 case 约 8-10 次 tool call（cache check + MCP calls + dump），6 case ≈ 55 次 + 开销。
空等期间使用 bash 级轮询（Step 1a+1b），不消耗 tool call 预算。

---

## Step 0: MCP 健康检查（1 次 MCP + 1 次 Bash）

```
SearchTeamMessagesQueryParameters(queryString="test", size=1)
```

**成功**（返回 JSON 结果）→ Bash 写日志 + 激活信号：
```bash
CASES_ROOT="{casesRoot}"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE START | Teams MCP healthy" >> "$CASES_ROOT/.patrol/teams-queue.log"
date +%s > "$CASES_ROOT/.patrol/teams-queue-active"
echo "MCP_READY|proceed to queue loop"
```

**失败**（`Connection closed` / `MCP error` / 任何非 JSON 响应）→ 清理所有 pending request + 写状态文件 + 退出：
```bash
CASES_ROOT="{casesRoot}"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE FAIL | Teams MCP unavailable — 请运行 /mcp 重启 Teams MCP" >> "$CASES_ROOT/.patrol/teams-queue.log"
echo "TEAMS_MCP_UNAVAILABLE" > "$CASES_ROOT/.patrol/teams-mcp-status"
for req in "$CASES_ROOT"/active/*/teams/request.json; do
  [ -f "$req" ] || continue
  rm -f "$req"
done
echo "MCP_FAIL|cleaned all request.json|请用户运行 /mcp 重启 Teams MCP server"
```
写完后 **立即退出**（不进入主循环）。patrol 主 agent 会在汇总阶段看到 `teams-mcp-status` 文件并报告。

> ⚠️ **已知问题**：MCP 调用可能永远不返回（server 进程挂死），此时 agent 会无限等待。
> 这是 Claude Code 平台限制（MCP 调用无 timeout）。patrol 主 agent 的预检机制是第一道防线。
> 如果预检通过但 queue agent 仍卡死，patrol drain 超时后会清理 orphan request.json。

---

## Step 1: 主循环

### 1a+1b. 扫描请求（Bash 级轮询，不消耗 agent tool call）

> **关键设计**：空等期间用 bash `while` 循环 `sleep 15` + `find`，不回到 agent。
> 这避免 haiku 模型在每次空扫描时生成大段解释文字，耗尽 150 次 tool call 预算。
> 只有**找到请求**或**收到 stop 信号**时，才跳出 bash 返回给 agent。

```bash
CASES_ROOT="{casesRoot}"
MAX_WAIT=600   # 最长等 10 分钟
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  REQUESTS=$(find "$CASES_ROOT/active" -maxdepth 3 -path "*/[0-9]*/teams/request.json" -type f 2>/dev/null | sort)
  COUNT=$(echo "$REQUESTS" | grep -c "request.json" 2>/dev/null || echo 0)
  STOP_EXISTS=$([ -f "$CASES_ROOT/.patrol/teams-queue-stop" ] && echo "yes" || echo "no")

  if [ "$COUNT" -gt 0 ]; then
    echo "FOUND|count=$COUNT"
    echo "$REQUESTS"
    break
  fi
  if [ "$STOP_EXISTS" = "yes" ]; then
    echo "STOP_SIGNAL|waited=${WAITED}s"
    break
  fi

  # 空转不回 agent，bash 里直接 sleep
  sleep 15
  WAITED=$((WAITED + 15))
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "WAIT_TIMEOUT|${MAX_WAIT}s|checking stop"
  [ -f "$CASES_ROOT/.patrol/teams-queue-stop" ] && echo "STOP_SIGNAL" || echo "TIMEOUT_NO_STOP"
fi
```

解析输出：
- `FOUND|count=N` + 文件列表 → 进入 1c 逐个处理
- `STOP_SIGNAL` → 退出到 Step 2
- `WAIT_TIMEOUT` → 如有 stop 信号则退出，否则回到 1a 重新开始 bash 轮询
- **处理完一批请求后**，回到此 bash 轮询等待下一批（或 stop 信号）

> Queue 的生命周期完全由 patrol 管理：patrol 阶段 1.5 发 `.patrol/teams-queue-stop` 信号后 queue 才退出。

### 1c. 处理每个 request（串行）

对每个 `request.json`，按文件修改时间排序（FIFO），逐个处理：

**读取请求**：
```
Read(file_path="{request_json_path}")
```
解析出 `caseNumber`, `caseDir`, `contactName`, `contactEmail`。

> **设计原则**：Queue 不做 cache 判断。cache 有效性已由 casework-light runner（`agent-cache-check.sh`）在生成 `request.json` 前判断。`request.json` 存在 = 需要搜索，无条件执行。

**执行 MCP 搜索**：

1. 写日志：
   ```bash
   echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE PROCESSING | {caseNumber}" >> "{casesRoot}/.patrol/teams-queue.log"
   ```

2. 缓存分类（读 `_chat-index.json` + `_relevance.json`）：
   ```bash
   python3 -c "
   import json, os
   idx_path = '{caseDir}/teams/_chat-index.json'
   rel_path = '{caseDir}/teams/_relevance.json'
   if not os.path.exists(idx_path):
       print('CACHED_HIGH='); print('CACHED_LOW='); print('CACHED_TIMESTAMPS='); exit()
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
   ```

3. **MCP 调用**（在一条消息中全部并行发出）：

   ```
   # 搜索查询
   SearchTeamMessagesQueryParameters(queryString="{caseNumber}", size=25)           # Q1
   SearchTeamMessagesQueryParameters(queryString="from:{contactEmail}", size=5)     # Q2
   ListChats(userUpns=["fangkun@microsoft.com"], topic="{caseNumber}", top=50)     # Q3
   # Q4: ICM 号搜索（仅当 request.json 中有 icmNumber 时发出）
   SearchTeamMessagesQueryParameters(queryString="{icmNumber}", size=10)            # Q4（可选）

   # 拉取 HIGH chatId — 不限条数，超长消息在 casework 侧由 build-input-from-raw.py 截断
   ListChatMessages(chatId="{high_id_1}", top=20)
   ListChatMessages(chatId="{high_id_2}", top=20)
   # ... 对每个 CACHED_HIGH，如果无 lastMessageTime（首次）也用 top=20
   ```

   > ⚠️ 不限条数，保持 top=20。超长消息体由下游截断（build-input-from-raw.py / agent 构建 _input.json 时截断 >2000 字符的 body.content）

4. **从搜索结果中提取新 chatId**（不在 HIGH + LOW 中的），再发一轮 ListChatMessages：
   ```
   ListChatMessages(chatId="{new_id_1}", top=20)
   # ...
   ```
   无新 chatId 则跳过。

5. **Dump 原始结果 + Cleanup**（与下一个 case 的 cache check 合并为同一次 Bash）：

   > ⚠️ 关键优化：dump + cleanup + 下一个 case 的 cache check 放在**同一个 Bash 调用**中，
   > 这样 MCP 连轴转，不在 dump 上浪费一个 LLM 往返。

   ```bash
   CASE_DIR="{caseDir}"
   CASES_ROOT="{casesRoot}"
   START_TIME={start_epoch}

   # ── 当前 case: dump + cleanup ──
   python3 -c "
   import json, time
   raw = {
       '_version': 2,
       '_fetchedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
       'caseNumber': '{caseNumber}',
       'searchResults': {search_results_json},
       'chatMessages': {chat_messages_json},
       'searchMode': 'full',
       'fallbackTriggered': False,
       'elapsed': round(time.time() - $START_TIME, 1)
   }
   with open('$CASE_DIR/teams/_mcp-raw.json', 'w') as f:
       json.dump(raw, f, indent=2, ensure_ascii=False)
   print(f'DUMP_OK|chats={len(raw[\"chatMessages\"])}')
   "
   ELAPSED=$(($(date +%s) - $START_TIME))
   rm -f "$CASE_DIR/teams/request.json"
   echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE DONE | {caseNumber} | ok | ${ELAPSED}s" >> "$CASES_ROOT/.patrol/teams-queue.log"

   # ── 下一个 case: 预扫描（无 cache check，直接看有没有 request）──
   NEXT_REQ=$(find "$CASES_ROOT/active" -maxdepth 3 -path "*/[0-9]*/teams/request.json" -type f 2>/dev/null | head -1)
   if [ -n "$NEXT_REQ" ]; then
     NEXT_DIR=$(dirname $(dirname "$NEXT_REQ"))
     NEXT_CASE=$(basename "$NEXT_DIR")
     echo "NEXT_READY|$NEXT_CASE|$NEXT_DIR"
   else
     echo "NEXT_NONE|no more requests"
   fi
   ```

   解析输出：
   - `NEXT_READY|{case}|{dir}` → 直接进入该 case 的 MCP 搜索（跳过独立的扫描）
   - `NEXT_NONE` → 回到 1a 重新扫描（可能有新请求进来）

### 1d. 所有请求处理完 → 回到 1a 重新扫描

---

## Step 2: 退出

```bash
CASES_ROOT="{casesRoot}"
rm -f "$CASES_ROOT/.patrol/teams-queue-active"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] QUEUE EXIT | all done" >> "$CASES_ROOT/.patrol/teams-queue.log"
echo "QUEUE_EXIT|done"
```

> ⚠️ 不删除 `.patrol/teams-queue-stop`（由 patrol 主进程管理）。

---

## 错误处理

- **MCP 超时** → 构造空 `_mcp-raw.json`（`chatMessages: {}`），cleanup，继续
- **MCP 健康检查失败** → 清理所有 pending request.json，退出
- **request.json 格式错误** → 删 request，记 warning，继续
- **任何异常** → finally 删 request（最高优先级）

## 超时保护

- 单个 case 设 deadline：`DEADLINE=$(($(date +%s) + 60))`
- MCP 调用前检查 `$(date +%s) > DEADLINE` → 跳过剩余调用
- 超过 deadline → 用已有数据 dump，继续下一个 case

## `_mcp-raw.json` Schema

```json
{
  "_version": 2,
  "_fetchedAt": "2026-04-12T15:30:00Z",
  "caseNumber": "2602130040001034",
  "searchResults": [
    { "keyword": "2602130040001034", "status": "success", "chatIds": ["19:xxx"] },
    { "keyword": "from:user@company.com", "status": "success", "chatIds": [] }
  ],
  "chatMessages": {
    "19:chatId1@unq.gbl.spaces": [
      {
        "id": "1775619158059",
        "createdDateTime": "2026-04-08T03:32:38Z",
        "from": { "user": { "displayName": "Kun Fang", "id": "guid" } },
        "body": { "contentType": "Text", "content": "消息内容" }
      }
    ],
    "19:chatId2@unq.gbl.spaces": [ ... ]
  },
  "searchMode": "full",
  "fallbackTriggered": false,
  "elapsed": 6.2
}
```

**关键**：`chatMessages` 中的 message 对象直接来自 MCP `ListChatMessages` 返回值，**不做任何格式转换**。
`from` 字段保持 MCP 原始格式（`from.user.displayName`），由 `build-input-from-raw.py` 在 casework 侧转换。
