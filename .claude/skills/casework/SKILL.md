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
date +%s > "$CASE_DIR/logs/.t_start"
date +%s > "$CASE_DIR/logs/.t_changegate_start"
pwsh -NoProfile -File "$CD/skills/d365-case-ops/scripts/check-case-changes.ps1" \
  -TicketNumber {caseNumber} -OutputDir "$CD/cases/active" 2>&1 | tail -1
date +%s > "$CASE_DIR/logs/.t_changegate_end"
```

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

**B2. Teams 预检 + spawn teams-search / onenote-case-search + 并行预读（同一条消息）**

两个搜索 agent 的缓存策略**不同**：

| Agent | 缓存机制 | 执行条件 |
|-------|---------|---------|
| teams-search | 有缓存（`teamsSearchCacheHours`） | 缓存过期或无缓存时 spawn |
| onenote-case-search | **无缓存** | **每次 casework 都 spawn** |

**teams-search**：缓存检查逻辑同 `casework-fast-path.sh` 中 Teams 段。快速路径已确认缓存有效时跳过。过期/无缓存时 spawn：

```
subagent_type: "teams-search"
description: "teams-search {caseNumber}"
run_in_background: true
prompt: |
  Case {caseNumber}，caseDir={caseDir}（绝对路径）。
  contactName={contactName}，contactEmail={contactEmail}。
  请先读取 .claude/skills/teams-search/SKILL.md 获取完整执行步骤，然后执行。
  ⏱ 第一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_start"
  ⏱ 最后一个 Bash 调用中写 date +%s > "{caseDir}/logs/.t_teamsSearch_end"
```

**onenote-case-search**（⚠️ 无缓存，每次都执行）：

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

> ⚠️ **必须等所有后台 agent 完成再执行 judge**（防止 statusJudgedAt < _cache-epoch 导致下次误判）。需等待的 agent：
> - `data-refresh`（仅 CHANGED 时 spawn）
> - `teams-search`（缓存过期时 spawn）
> - `onenote-case-search`（每次都 spawn）
>
> 等待用 `TaskOutput`（timeout 180s），若 compaction 丢失 task ID，回退检查 `.t_*_end` 文件存在性（最多 3×10s）。

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
   - `troubleshooter+email-drafter` → spawn 两者
3. 如果 `recommendedActions` 不存在、为空、或为 null → **Fallback 到路由表**：

| actualStatus | Fallback 执行 |
|---|---|
| `new` / `pending-engineer` | troubleshooter → email-drafter |
| `pending-customer` | email-drafter（仅 days ≥ 3） |
| `pending-pg` | 无额外 agent，仅记录 |
| `researching` | troubleshooter |
| `ready-to-close` | email-drafter (closure) |

记日志 `STEP B5 OK | Fallback: {actualStatus} → {agents}`

spawn 时指定 `subagent_type: "troubleshooter"` / `"email-drafter"`，提示读取 `.claude/agents/{name}.md`。

**B5a. Challenge Gate（troubleshooter 完成后，条件触发）**

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

**AR-B0. 归档检测**

同普通路径 B0，检测 main case 是否已归档。

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
