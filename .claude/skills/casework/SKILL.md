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
  - draft-email
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
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
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

**B2. Teams 预检 + 按需 spawn teams-search + onenote-case-search + 并行预读（同一条消息）**

> 快速路径已确认 Teams 缓存有效时跳过。

Teams 缓存检查逻辑同 `casework-fast-path.sh` 中 Teams 段。过期/无缓存时 spawn：

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

同时 spawn onenote-case-search（与 teams-search 并行后台执行）：

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

> ⚠️ **必须等 data-refresh + teams-search 都完成再执行 judge**（防止 statusJudgedAt < _cache-epoch 导致下次误判）。等待用 `TaskOutput`（timeout 180s），若 compaction 丢失 task ID，回退检查 `.t_*_end` 文件存在性（最多 3×10s）。

等待完成后，status-judge 缓存预检逻辑同 `casework-fast-path.sh` 中 judge 段（额外在开头写 `.t_agentWait_end` + `.t_statusJudge_start`）。
- `JUDGE_CACHE_VALID` → 跳过，用 meta 已有 actualStatus/days
- `JUDGE_CACHE_MISS` → 按 status-judge/SKILL.md 执行

**B5. 按 actualStatus 路由** ⏱ `.t_routing_start/end`

| actualStatus | 执行 |
|---|---|
| `new` / `pending-engineer` | troubleshooter → email-drafter |
| `pending-customer` | email-drafter（仅 days ≥ 3） |
| `pending-pg` | 无额外 agent，仅记录 |
| `researching` | troubleshooter |
| `ready-to-close` | email-drafter (closure) |

spawn 时指定 `subagent_type: "troubleshooter"` / `"email-drafter"`，提示读取 `.claude/agents/{name}.md`。

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

## Bash 调用次数

| 场景 | 调用 | 预计耗时 |
|------|------|----------|
| **快速路径**（全缓存 + summary 存在） | 3 次：changegate + fastpath + todo+timing | ~15-30s |
| **快速路径**（全缓存 + summary 不存在） | 3 次：changegate + fastpath + todo+timing + Write summary | ~30-45s |
| **正常流程**（有变化） | 5-8 次：changegate + B2~B5 + summary+todo+timing | ~120-240s |
