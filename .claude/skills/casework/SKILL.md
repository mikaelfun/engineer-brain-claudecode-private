---
description: "Case 全流程处理：数据刷新 → 合规检查 → 状态判断 → 技术排查/邮件 → Inspection。用于处理单个 D365 Case。"
name: casework
displayName: Case 全流程处理
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
  - compliance-check
  - status-judge
  - teams-search
  - troubleshoot
  - challenge
  - draft-email
  - note-gap
  - inspection-writer
promptTemplate: |
  Process Case {caseNumber}. Read .claude/skills/casework/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
---

# /casework — Case 全流程处理

混合编排器。重型步骤 spawn Agent（context 隔离 + 并行），轻型步骤内联执行（省 spawn 开销）。

## 参数
- `$ARGUMENTS` — Case 编号
- 可选 `--skip-data-refresh`：跳过 data-refresh（patrol 已预先拉取）

## 规范
- **日志** append 到 `{caseDir}/logs/casework.log`，格式 `[YYYY-MM-DD HH:MM:SS] STEP {n} {START|OK|FAIL|SKIP} | {描述}`
- **时间戳** `date +%s > "{caseDir}/logs/.t_{stepName}"`，**禁止**为日志或时间戳单独发 Bash
- **Bash 健壮性**：变量赋值**必须用换行独占一行**（`\n`），❌ 不能用 `;` 和后续命令放同一行（Git Bash 中 `;` 赋值会被 `|` pipe 静默吞掉）。命令间用 `;` 分隔（非 `&&`）防短路。变量不跨 Bash 调用保留。示例：
  ```bash
  CD="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain"
  CASE_DIR="$CD/cases/active/2603260030005229"
  date +%s > "$CASE_DIR/logs/.t_xxx" ; pwsh ... 2>&1 | tail -1
  ```
- **路径格式**：本机 Bash 为 Git Bash，路径**必须**用 POSIX 格式 `/c/Users/...`。❌ `C:\Users\...` ❌ `C:/Users/...` — 这两种格式在 `>` 重定向中会失败。`config.json` 的 `casesRoot` 为相对路径时，先 `cd` 到项目根再拼接，或用 `$(cd /c/...; pwd)` 解析为绝对路径
- **调用计数**：Main Agent 在整个 casework 流程中累计 `bashCalls`（Bash 工具调用次数）、`toolCalls`（所有工具调用次数，含 Read/Glob/Grep/Edit/Agent/Bash/MCP）、`agentSpawns`（Agent 工具 spawn 次数），最后传给 timing 脚本

## 执行步骤

### Step 1. Changegate + 分路

`caseDir` 直接从项目根拼接：`{projectRoot}/cases/active/{caseNumber}`（`casesRoot` 基本不变，无需每次读 `config.json`）。首次 Bash 一并完成 mkdir + `.t_start` + changegate，省去独立 init 步骤。

```bash
CD="{projectRoot}"
CASE_DIR="$CD/cases/active/{caseNumber}"
mkdir -p "$CASE_DIR/logs"
# 清理上轮残留的 timing markers（防止旧 markers 干扰 patrol-monitor）
rm -f "$CASE_DIR/logs/.t_"*
date +%s > "$CASE_DIR/logs/.t_start"
date +%s > "$CASE_DIR/logs/.t_changegate_start"
pwsh -NoProfile -File "$CD/skills/d365-case-ops/scripts/check-case-changes.ps1" \
  -TicketNumber {caseNumber} -OutputDir "$CD/cases/active" 2>&1 | tail -1
date +%s > "$CASE_DIR/logs/.t_changegate_end"
```

**Agent tool 诊断（Step 1 之后，B2 之前）**：

> casework 必须在首次需要 spawn 之前探测 Agent tool 可用性并记录。
> 这帮助诊断 patrol → casework → sub-agent 嵌套 spawn 的稳定性问题。

尝试 spawn 一个最小的诊断 agent（`subagent_type` 留空，用 general-purpose，只输出一行）。记录成功/失败到日志：

```
# 诊断 spawn：尝试 Agent tool
Agent({
  description: "agent-probe {caseNumber}",
  prompt: "Reply with exactly: AGENT_PROBE_OK"
})
```

- **成功**（收到 `AGENT_PROBE_OK`）→ 记日志：
  ```bash
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] DIAG | Agent tool AVAILABLE (probe OK)" >> "{caseDir}/logs/casework.log"
  ```
- **失败**（tool 不存在 / 报错 / 超时）→ 记日志 + 设标志：
  ```bash
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] DIAG | Agent tool UNAVAILABLE (probe failed)" >> "{caseDir}/logs/casework.log"
  echo "NO_AGENT" > "{caseDir}/logs/.agent-probe"
  ```

后续 B2 spawn 前先检查 `.agent-probe`：
```bash
[ -f "{caseDir}/logs/.agent-probe" ] && echo "AGENT_DISABLED" || echo "AGENT_OK"
```
`AGENT_DISABLED` → 跳过所有 spawn，直接降级（inline 执行或跳过）。避免每次 spawn 都失败浪费 turn。

`--skip-data-refresh` 时跳过 changegate，记日志 `STEP 1 SKIP | --skip-data-refresh`。

**AR 检测**：检查 case number 是否有 3+ 位后缀（AR case）。

```bash
# AR detection: case number with 3+ digit suffix
CASE_NUM="{caseNumber}"
# Main case is 16 digits. AR suffix adds 3+ more digits.
if [ ${#CASE_NUM} -ge 19 ]; then
  IS_AR="true"
  MAIN_CASE_ID="${CASE_NUM:0:16}"
else
  IS_AR="false"
  MAIN_CASE_ID=""
fi
```

如果 `IS_AR=true`：
1. 读取/创建 `casehealth-meta.json`，upsert `isAR: true` 和 `mainCaseId`
2. **首次 AR 检测**（meta 中之前无 `isAR` 字段）→ 强制覆盖 changegate 为 `CHANGED`（旧数据可能来自 AR case 自身，需要从 main case 重新拉取）
3. 后续步骤走 **AR PATH**（见下文 "AR PATH" 章节）

如果 `IS_AR=false`：走现有路径（不变）。

---

#### 路径 A：NO_CHANGE → 快速路径

单次 Bash 完成 DR-skip + Teams/compliance/judge/routing 全部缓存检查（⏱ 包裹 `.t_fastpath_start/end`）：

```bash
date +%s > "{caseDir}/logs/.t_fastpath_start" ; bash skills/d365-case-ops/scripts/casework-fast-path.sh "{caseDir}" "{changegateDetail}" ; date +%s > "{caseDir}/logs/.t_fastpath_end"
```

- `FAST_PATH_OK|status=...,days=...` → **跳到 Step 4**。仅预读 `casehealth-meta.json` + `case-summary.md`（如存在）
- `FAST_PATH_BREAK|teams=...,judge=...` → 回退路径 B，从 BREAK 的步骤开始
- `AR_MAIN_ARCHIVED|mainCase=...`（仅 AR case）→ **main case 已归档，AR 跟随归档**：
  1. 确保 `{casesRoot}/archived/` 目录存在
  2. 移动目录：`mv "{casesRoot}/active/{caseNumber}" "{casesRoot}/archived/{caseNumber}"`
  3. 记录日志到 `{casesRoot}/archive-log.jsonl`：`{"status":"archived","reason":"AR cascade: main case {mainCaseId} archived"}`
  4. **提前终止 casework**，输出：`⚠️ AR Case {caseNumber} 的 main case {mainCaseId} 已归档，AR 跟随归档`

---

#### 路径 B：CHANGED 或 FAST_PATH_BREAK → 正常流程

**B0. 归档/转移检测（仅 CHANGED 时，FAST_PATH_BREAK 跳过）**

检测当前 case 是否已在 D365 中归档或转移（不再在 active list 中）。**必须在 spawn 任何后台 agent 之前执行**，避免对已归档 case 做无用功。

```bash
RESULT=$(pwsh -NoProfile -File skills/d365-case-ops/scripts/detect-case-status.ps1 -CasesRoot {casesRoot} -CaseNumbers {caseNumber} -SkipClosureCheck 2>&1 | tail -1)
```

解析 `$RESULT`（JSON 数组）：
- 空数组 `[]` → case 仍 active，继续正常流程
- 包含条目且 `status` 为 `archived` 或 `transferred` → **提前终止 casework**：
  1. 确保目标目录存在：`mkdir -p "{casesRoot}/archived"` 或 `mkdir -p "{casesRoot}/transfer"`
  2. 移动目录：`mv "{casesRoot}/active/{caseNumber}" "{casesRoot}/{archived|transfer}/{caseNumber}"`
  3. 记录日志到 `{casesRoot}/archive-log.jsonl`（append 一行 JSON）
  4. 输出提示：`⚠️ Case {caseNumber} 已{归档/转移}，casework 提前终止`
  5. **不再执行 B1~B5/Step 4 及后续步骤**

**B1. spawn data-refresh（仅 CHANGED 时）**

```
subagent_type: "data-refresh"
description: "data-refresh {caseNumber}"
run_in_background: true
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径），casesRoot={casesRoot}。
  请先读取 .claude/skills/data-refresh/SKILL.md 获取完整执行步骤，然后执行。
  ⚠️ casework changegate 已预热浏览器并缓存 incidentId，跳过 Step 0a 和 0b。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_dataRefresh_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_dataRefresh_end"
  完成后汇报各步骤成功/失败状态。
```

**B2. 搜索 Agent 预检 + 条件 spawn + 并行预读（同一条消息）**

**预检脚本**（1 次 Bash，~0.5s）：在 spawn 任何搜索 agent 前，先运行缓存检查脚本判断是否需要 spawn：

```bash
CACHE_HOURS=$(python3 -c "import json; print(json.load(open('config.json')).get('teamsSearchCacheHours', 8))" 2>/dev/null || echo 8)
RESULT=$(bash skills/d365-case-ops/scripts/agent-cache-check.sh "{caseDir}" "$CACHE_HOURS" "{projectRoot}")
echo "$RESULT"
```

输出示例：`{"teams":{"spawn":false,"reason":"CACHED(1h15m)"},"onenote":{"spawn":true,"reason":"SOURCE_NEWER"}}`

**根据预检结果条件 spawn**：

先检查 Agent tool 可用性（Step 1 诊断结果）：
```bash
AGENT_OK=$( [ -f "{caseDir}/logs/.agent-probe" ] && echo "false" || echo "true" )
echo "AGENT_AVAILABLE=$AGENT_OK"
```

| 预检结果 | AGENT_OK=true | AGENT_OK=false |
|---------|---------------|----------------|
| `teams.spawn=false` | 跳过，记 `STEP B2 SKIP teams-search \| {reason}` | 同左 |
| `teams.spawn=true` | spawn teams-search（后台） | **降级**：只写 request.json（QUEUE_MODE）或跳过（DIRECT_MODE），记 `STEP B2 DEGRADE teams-search \| Agent unavailable` |
| `onenote.spawn=false` | 跳过，记 `STEP B2 SKIP onenote \| {reason}` | 同左 |
| `onenote.spawn=true` | spawn onenote-case-search（后台） | **降级**：跳过，记 `STEP B2 DEGRADE onenote \| Agent unavailable, using cached data` |

**teams-search**（仅 `teams.spawn=true` 时）：

**检测 patrol 队列模式**：
```bash
[ -f "{casesRoot}/.patrol/teams-queue-active" ] && echo "QUEUE_MODE" || echo "DIRECT_MODE"
```

- **QUEUE_MODE**（patrol 已启动队列 agent）→ 写 request.json + spawn teams-search agent（QUEUE_MODE）：
  ```bash
  mkdir -p "{caseDir}/teams"
  cat > "{caseDir}/teams/request.json" << 'REQEOF'
  {
    "_version": 1,
    "_requestedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "caseNumber": "{caseNumber}",
    "caseDir": "{caseDir}",
    "contactName": "{contactName}",
    "contactEmail": "{contactEmail}",
    "forceRefresh": false
  }
  REQEOF
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP B2 OK | teams-search queued (request.json written)" >> "{caseDir}/logs/casework.log"
  ```

  然后 spawn teams-search agent（后台），它会等 queue 写好 `_mcp-raw.json` 后自行做后处理：
  ```
  subagent_type: "teams-search"
  description: "teams-search {caseNumber}"
  run_in_background: true
  prompt: |
    Case {caseNumber}，caseDir={caseDir}（绝对路径）。
    contactName={contactName}，contactEmail={contactEmail}。
    ⚠️ QUEUE_MODE：MCP 搜索由 patrol teams-queue agent 负责，你不做 MCP 调用。
    请读取 .claude/skills/teams-search/SKILL.md，执行 QUEUE_MODE 路径：
    1. 等待 {caseDir}/teams/_mcp-raw.json 出现（每 10s 检查，最多等 180s）
    2. 运行 python3 .claude/skills/teams-search/scripts/build-input-from-raw.py "{caseDir}" 生成 _input.json
    3. 运行 write-teams.ps1 -InputFile _input.json
    4. 执行 Step 5（relevance + digest）
    ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_start"
    ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_end"
  ```

  > 冷启动时间（30-60s）与 queue MCP 搜索时间重叠，不增加总耗时。

- **DIRECT_MODE**（单 case 模式）→ spawn teams-search agent（现有行为）：
  ```
  subagent_type: "teams-search"
  description: "teams-search {caseNumber}"
  run_in_background: true
  prompt: |
    Case {caseNumber}，caseDir={caseDir}（绝对路径）。
    contactName={contactName}，contactEmail={contactEmail}。
    请先读取 .claude/skills/teams-search/SKILL.md 获取完整执行步骤，然后执行。
    ⚠️ 缓存预检已通过（{reason}），直接从 Step 0.5 开始，跳过 Step 0 缓存检查。
    ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_start"
    ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_end"
  ```

**onenote-case-search**（仅 `onenote.spawn=true` 时）：

```
subagent_type: "onenote-case-search"
description: "onenote-case-search {caseNumber}"
run_in_background: true
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  请先读取 .claude/agents/onenote-case-search.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_onenoteSearch_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_onenoteSearch_end"
```

同一消息并行预读：`compliance-check/SKILL.md`、`status-judge/SKILL.md`、`casehealth-meta.json`、`case-summary.md`（如存在）、`playbooks/rules/case-lifecycle.md`。后续不再重复 Read。

**B3. compliance-check**：按 compliance-check/SKILL.md 执行。⏱ `.t_compliance_start/end` 合并到工作命令。

**B3a. Entitlement 阻断检测**

compliance-check 完成后，读取 `casehealth-meta.json` 中 `compliance.entitlementOk`：

- `entitlementOk === true` → 继续正常流程
- `entitlementOk === false` → **⚠️ 阻断 casework**：
  1. 生成 **紧急 Todo**（写入 `{caseDir}/todo/` 目录）：
     ```markdown
     ## 🔴 需立即处理
     - [ ] ⚠️ **Entitlement 不合规 — 请联系 TA 确认**
       - Service Name: {compliance.serviceName}
       - Schedule: {compliance.schedule}
       - Contract Country: {compliance.contractCountry}
       - Warnings: {compliance.warnings}
       - 此 Case 的 Entitlement 不满足 China Cloud 要求，不可继续处理。请联系 TA (Technical Advisor) 确认是否需要转移或关闭。
     ```
  2. 记录日志：`STEP B3a BLOCK | Entitlement failed: {warnings}`
  3. **不再执行 B4/B5/Step 4 及后续步骤**
  4. 输出提示：`🚫 Case {caseNumber} Entitlement 不合规，casework 已阻断。请在 Todo 中查看详情并联系 TA。`

**B4. 等待后台 agent → status-judge**

> ⚠️ **必须等 data-refresh 和 onenote 完成再执行 judge**（防止 statusJudgedAt < _cache-epoch 导致下次误判）。
> - `data-refresh`（仅 CHANGED 时 spawn）
> - `onenote-case-search`（SOURCE_NEWER 时 spawn）
> - `teams-search`：**QUEUE_MODE 和 DIRECT_MODE 统一处理** — 都是等 teams-search agent 完成（B2 已 spawn）。QUEUE_MODE 下 agent 内部等 `_mcp-raw.json`，对 casework 透明。

**等待策略（QUEUE_MODE 和 DIRECT_MODE 统一）**：

等待 teams-search agent 完成（已在 B2 spawn）。使用与 DIRECT_MODE 相同的分级超时逻辑：

1. **先等 60s**，检查 teams-search 日志中是否有 `STEP 0.5 OK`（MCP 健康检查通过）：
   ```bash
   # 60s 后检查 teams-search MCP 健康状态
   LOG="{caseDir}/logs/teams-search.log"
   if grep -q "STEP 0.5 OK" "$LOG" 2>/dev/null; then
     echo "TEAMS_MCP_HEALTHY"
   elif grep -q "STEP 0.5 FAIL" "$LOG" 2>/dev/null; then
     echo "TEAMS_MCP_FAILED"
   else
     echo "TEAMS_MCP_NO_SIGNAL"
   fi
   ```

2. **根据结果决定等待时间**：
   - `TEAMS_MCP_HEALTHY` → 继续等，总共最多 **180s**（MCP 正常，搜索需要时间）
   - `TEAMS_MCP_FAILED` → **立即停止等待 teams-search**，记日志 `STEP B4 WARN | teams-search MCP unavailable, skipping`，继续下一步
   - `TEAMS_MCP_NO_SIGNAL` → **立即 kill teams-search agent**（TaskStop），记日志 `STEP B4 WARN | teams-search no MCP signal in 60s, killed`，写 `.t_teamsSearch_end`，继续下一步

3. **kill 后的补偿**：teams-search 被 kill 不影响 casework 流程。status-judge 和路由都不依赖 Teams 数据。下次 patrol 会重新尝试。

> 等待 data-refresh 和 onenote-case-search 仍用 `TaskOutput`（timeout 180s）。
> 若 compaction 丢失 task ID，回退检查 `.t_*_end` 文件存在性（最多 3×10s）。

等待完成后，status-judge 缓存预检逻辑同 `casework-fast-path.sh` 中 judge 段（额外在开头写 `.t_agentWait_end` + `.t_statusJudge_start`）。
- `JUDGE_CACHE_VALID` → 跳过，用 meta 已有 actualStatus/days
- `JUDGE_CACHE_MISS` → 按 status-judge/SKILL.md 执行

**B5. 智能路由** ⏱ `.t_routing_start/end`

**优先读取 LLM 推荐行动**：

1. 读取 `meta.recommendedActions`（由 status-judge Step 4b 写入）
2. 如果 `recommendedActions` 存在且非空：
   - `no-agent` → 跳过 agent spawn，记日志 `STEP B5 OK | LLM: no-agent — {reason}`
   - `troubleshooter` → 仅 spawn troubleshooter
   - `email-drafter` → 仅 spawn email-drafter
   - `troubleshooter+email-drafter` → 按 **IR-first 规则**执行（见下方）
3. 如果 `recommendedActions` 不存在、为空、或为 null → **Fallback 到路由表**：

| actualStatus | Fallback 执行 |
|---|---|
| `new` / `pending-engineer` | **email-drafter (IR, 前台)** → troubleshooter (后台) |
| `pending-customer` | email-drafter（仅 days ≥ 3） |
| `pending-pg` | 无额外 agent，仅记录 |
| `researching` | troubleshooter |
| `ready-to-close` | email-drafter (closure) |

**IR-first 规则**（适用于 `new` / `pending-engineer` 且需同时执行 troubleshooter + email-drafter）：

1. **先 spawn email-drafter（前台等待）**：emailType = `initial-response`，告知客户「已收到，将根据提供的信息做初步排查，有进展会及时更新」
2. email-drafter 完成 → 展示 IR 草稿给用户
3. **再 spawn troubleshooter（后台 `run_in_background: true`）**：troubleshooter 独立完成排查，产出 analysis + claims.json
4. casework **不等待** troubleshooter 完成，直接进入 B6 inspection
5. troubleshooter 后台完成后的 challenge gate 和后续邮件，延迟到下次 casework/patrol 运行时处理

> 原因：新 case 的首要任务是让客户知道我们已接手在看，技术排查可以并行进行，下次巡检时再根据排查结果跟进。

记日志 `STEP B5 OK | Fallback: {actualStatus} → {agents}`（IR-first 时记 `IR-first: email-drafter(fg) + troubleshooter(bg)`）

spawn 时指定 `subagent_type: "troubleshooter"` / `"email-drafter"`，提示读取 `.claude/agents/{name}.md`。

**B5a. Challenge Gate（troubleshooter 完成后，条件触发）**

> **IR-first 模式说明**：若 troubleshooter 是后台 spawn（`run_in_background: true`），本次 casework 不等待其完成，B5a/B5b 跳过。下次 casework/patrol 运行时，检测到 `{caseDir}/claims.json` 已存在，再执行 challenge gate 和后续邮件。

troubleshooter 完成后，Main Agent 读取 `{caseDir}/claims.json`：
- `claims.json` 不存在 → 跳过（向后兼容，旧版 troubleshooter 不产出 claims.json）
- `triggerChallenge === false` → 跳过，继续到 email-drafter
- `triggerChallenge === true` → spawn Challenger agent（前台等待）

```
subagent_type: "challenger"
description: "challenge {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  产品域：{product}（从 case-info.md serviceTree 推断）。
  请先读取 .claude/agents/challenger.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_challenge_end"
```

**B5b. Auto-loop（Challenger 完成后）**

Challenger 返回后，Main Agent 读取更新后的 `{caseDir}/claims.json` 和 Challenger 返回文本中的 `ACTION:` 标记：

| ACTION | 执行 |
|--------|------|
| `ACTION:pass` 或无 ACTION | → email-drafter（正常邮件类型，按 B5 路由表） |
| `ACTION:request-info` | → email-drafter（emailType: `request-info`，prompt 附带 `{caseDir}/challenge-report.md` 中「需要的额外信息」section 内容） |
| `ACTION:retry` | → 用 Edit 更新 `claims.json` 的 `retryCount` 为 1 → spawn troubleshooter retry（见下方 prompt）→ troubleshooter 完成后回到 B5a |
| `ACTION:escalate` | → email-drafter（emailType: `request-info`，prompt 附带 challenge-report 中信息）+ 写 Todo 🔴：`⚠️ **分析证据不足** — Challenger 打回后重试仍无法确认根因，请审阅 challenge-report.md 并手动介入` |

**Troubleshooter Retry Prompt**（仅 ACTION:retry 时使用）：

```
subagent_type: "troubleshooter"
description: "troubleshooter-retry {caseNumber}"
run_in_background: false
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  ⚠️ 这是 Challenger 打回后的重新排查（retry #1）。
  请先读取 {caseDir}/challenge-report.md 了解被打回的原因。
  被 reject 的 claims:
  {从 claims.json 中 status=rejected 的 claims 列表，每个一行: id + claim 文本}

  要求：
  1. 不要沿用之前被 reject 的分析方向
  2. 参考 challenge-report.md 的「建议替代方向」
  3. 对新结论必须提供明确的证据引用（Step 5a）
  4. 如果确实无法找到证据，诚实标注 confidence: none

  请先读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_troubleshooterRetry_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_troubleshooterRetry_end"
```

> Retry 后的 troubleshooter 产出新的 analysis.md（新时间戳文件名）和更新 claims.json（retryCount 已递增），再次进入 B5a。

### Step 4. case-summary + todo + timing.json

按 inspection-writer/SKILL.md 执行。分三种路径：

**快速路径（NO_CHANGE + case-summary.md 已存在）**：
- 只调 `bash generate-todo.sh "{caseDir}"` 生成 todo（~1s）
- 跳过 case-summary（无变化）
- 调 `bash casework-timing.sh` 生成 timing.json
- 不需要预读 inspection-writer/SKILL.md
- Edit 更新 meta `lastInspected`

**快速路径（NO_CHANGE + case-summary.md 不存在）**：
- 按 inspection-writer/SKILL.md Step 2a 首次生成 case-summary.md
- 调 `bash generate-todo.sh "{caseDir}"` 生成 todo
- 调 `bash casework-timing.sh` 生成 timing.json
- Edit 更新 meta `lastInspected`

**正常流程（CHANGED）**：
- 按 inspection-writer/SKILL.md Step 2a/2b 生成或增量更新 case-summary.md
- 调 `bash generate-todo.sh "{caseDir}"` 生成 todo
- 调 `bash casework-timing.sh` 生成 timing.json
- Edit 更新 meta `lastInspected`

⏱ Bash 开头 `date +%s > "{caseDir}/logs/.t_inspection_start"`。timing 调用：

```bash
# generate-todo + timing 合并为单次 Bash：
date +%s > "{caseDir}/logs/.t_inspection_start"
bash skills/d365-case-ops/scripts/generate-todo.sh "{caseDir}"
bash skills/d365-case-ops/scripts/casework-timing.sh "{caseDir}" "{skippedStepsJson}" "{errorsJson}" '{"bash":N,"tools":N,"agents":N}'
```

> `N` 由 Main Agent 在整个流程中累计替换。`bash` = Bash 工具调用次数，`tools` = 所有工具调用次数（Bash+Read+Glob+Grep+Edit+Agent+MCP），`agents` = Agent spawn 次数。

### Step 6. 展示结果
读取最新 `{caseDir}/todo/` 文件，🔴🟡✅ 格式展示 Todo 汇总 + timing 统计。

---

---

## AR PATH（isAR = true 时的执行流程）

当 Step 1 检测到 `IS_AR=true` 后，casework 切换到 AR PATH。复用大部分基础设施，但定制数据收集、状态判断、路由。

### AR 路径 A：NO_CHANGE → AR 快速路径

changegate 对 AR case 的检测方式：比较 main case + AR case 的 D365 状态变化。

fast-path 脚本输出含 `isAR=true` 时，AR 快速路径行为与普通快速路径相同（生成 todo + timing），但 generate-todo.sh 会自动应用 AR 规则（跳过 SLA 等）。

### AR 路径 B：CHANGED → AR 正常流程

**AR-B0. 归档检测（含 main case 级联）**

同普通路径 B0，但 `detect-case-status.ps1` 会自动检测 main case 是否已归档（Step 3a AR 级联逻辑）。当 main case 不在 D365 active case 列表中（已 resolved/cancelled）时，AR case 会被标记为 archived（reason: "AR cascade: main case {mainCaseId} not in D365 active list"）。注意：AR 级联归档基于 D365 API 数据判断，不依赖本地 `cases/active/` 目录——main case 可能从未被 pull 到本地。

**AR-B1. spawn data-refresh（AR 模式）**

```
subagent_type: "data-refresh"
description: "data-refresh AR {caseNumber}"
run_in_background: true
prompt: |
  AR Case {caseNumber}，mainCaseId={mainCaseId}，caseDir={caseDir}（绝对路径），casesRoot={casesRoot}。
  这是一个 AR Case，需要从 main case 拉取主要数据。
  请先读取 .claude/skills/data-refresh/SKILL.md 获取完整执行步骤（关注 AR Mode 部分），然后执行。
  ⚠️ casework changegate 已预热浏览器并缓存 incidentId，跳过 Step 0a 和 0b。
  ⚠️ AR Mode: 使用 `-MainCaseNumber {mainCaseId}` 参数。不执行 IR check。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_dataRefresh_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_dataRefresh_end"
  完成后汇报各步骤成功/失败状态。
```

**AR-B2. Teams 预检 + spawn teams-search / onenote-case-search**

Teams 搜索关键词根据沟通模式调整（由 casework 在 prompt 中传入）：
- 沟通模式尚未确定时（首次处理），默认搜 case owner 名 + AR case number
- `communicationMode = "internal"` → 搜 case owner 名 + AR ID
- `communicationMode = "customer-facing"` → 搜客户名 + main case number

OneNote 搜索：始终搜 AR case number（个人笔记）。

**AR-B3. compliance-check（带缓存）**

读取 `meta.compliance.entitlementOk`：
- 有值（true 或 false）→ **跳过**，沿用缓存
- 无值 → 执行 compliance-check（基于 main case 数据的 case-info.md）
- `entitlementOk === false` → 🔴 阻断（同普通路径 B3a）

**AR-B4. 等待后台 agent → AR Scope 提取 + 沟通模式检测 + status-judge**

等待 data-refresh + teams-search + onenote-case-search 完成后：

**AR-B4a. AR Scope 提取**（首次 or `ar.scopeConfirmed !== true`）

```
读取 {caseDir}/notes-ar.md + case-info.md（AR case title/description）
LLM 提取 AR scope 一句话摘要
Upsert meta: ar.scope = "{extracted_scope}", ar.scopeConfirmed = false
```

如果 `ar.scopeConfirmed === true`，跳过提取。

**AR-B4b. 沟通模式检测**

```
读取 {caseDir}/emails.md 最近几封邮件的 To/CC 字段
检查用户邮箱（fangkun@microsoft.com）是否在参与者中
是 → communicationMode = "customer-facing"
否 → communicationMode = "internal"
提取 case owner 邮箱/名字（从 case-info.md 的 Owner 字段）
Upsert meta: ar.communicationMode, ar.caseOwnerEmail, ar.caseOwnerName
```

**AR-B4c. AR Status Judge**

按 status-judge/SKILL.md 的 AR Mode 部分执行。传入 `isAR=true` 上下文。

**AR-B5. 智能路由（AR）** ⏱ `.t_routing_start/end`

**优先读取 LLM 推荐行动**（同 B5 逻辑）：

1. 读取 `meta.recommendedActions`
2. 如果存在且非空 → 按 action 执行（spawn 时 prompt 中包含 AR scope + communicationMode）
3. 如果不存在/为空 → **Fallback 到 AR 路由表**：

| actualStatus | communicationMode | Fallback 执行 |
|---|---|---|
| `new` | any | troubleshooter（AR scope 内诊断）→ email-drafter |
| `pending-engineer` | `internal` | troubleshooter → email-drafter（收件人: case owner） |
| `pending-engineer` | `customer-facing` | troubleshooter → email-drafter（收件人: 客户，仅 AR scope） |
| `pending-customer` (days<3) | any | 无 agent |
| `pending-customer` (days≥3) | `internal` | email-drafter（follow-up to case owner） |
| `pending-customer` (days≥3) | `customer-facing` | email-drafter（follow-up to customer, AR scope only） |
| `pending-pg` | any | 无 agent |
| `researching` | any | troubleshooter（继续 AR scope 内诊断） |
| `ready-to-close` | `internal` | email-drafter（AR 完成总结 to case owner） |
| `ready-to-close` | `customer-facing` | email-drafter（AR scope 结论 to customer, CC case owner） |

spawn troubleshooter 时，prompt 中明确 AR scope：
```
prompt: |
  AR Case {caseNumber}，AR Scope: {ar.scope}
  沟通模式: {communicationMode}
  请只排查 AR scope 范围内的问题，不要排查 main case 的其他问题。
  ...
```

spawn email-drafter 时，prompt 中明确收件人和 scope：
```
prompt: |
  AR Case {caseNumber}，AR Scope: {ar.scope}
  沟通模式: {communicationMode}
  收件人: {根据模式选择 case owner email 或 客户 email}
  [内部模式] 邮件发给 case owner，总结 AR scope 内的发现和建议
  [客户面向模式] 邮件发给客户（reply-all from main case），仅回复 AR scope 内的问题
  ...
```

### AR Step 4. case-summary + todo + timing.json

按 inspection-writer/SKILL.md 的 AR 规则执行。case-summary.md 使用 AR 视角。generate-todo.sh 自动应用 AR 规则。

---

## Bash 调用次数

| 场景 | 调用 | 预计耗时 |
|------|------|----------|
| **快速路径**（全缓存 + summary 存在） | 3 次：changegate + fastpath + todo+timing | ~15-30s |
| **快速路径**（全缓存 + summary 不存在） | 3 次：changegate + fastpath + todo+timing + Write summary | ~30-45s |
| **正常流程**（有变化） | 5-8 次：changegate + B2~B5 + summary+todo+timing | ~120-240s |
| **AR 快速路径**（全缓存 + summary 存在） | 3 次 | ~15-30s |
| **AR 正常流程**（有变化） | 5-8 次：changegate + AR-B1~B5 + summary+todo+timing | ~120-240s |
