---
description: "Case 全流程处理：data-refresh → assess → act → summarize。用于处理单个 D365 Case。"
name: casework
displayName: Case 全流程处理
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
  - assess
  - act
  - summarize
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

v2 四步编排器。Step 1 纯脚本并行数据收集，Step 2 LLM inline 状态判断，Step 3 按需 spawn agent，Step 4 总结 + todo。

## 参数

- `$ARGUMENTS` — Case 编号
- 可选 `mode=patrol`：只执行 Step 1+2，产出 execution-plan.json 后退出

## 规范

- **日志**统一在 `{caseDir}/.casework/runs/{runId}/` 目录，每次执行隔离
  - `scripts/` — 脚本 stdout/stderr（d365.log、teams.log 等）
  - `output/` — 结构化输出（data-refresh.json、subtasks/*.json）
  - `agents/` — sub-agent output（troubleshooter.log 等）
  - `session.jsonl` — SDK 全量消息
  - `execution-plan.json` — assess 产物（同时保留副本在 `.casework/execution-plan.json`）
- **Bash 健壮性**：变量赋值必须独占一行，命令间用 `;` 分隔（非 `&&`）防短路
- **路径格式**：Git Bash 必须用 POSIX `/c/Users/...`，python3 内部用相对路径或 `C:/` 格式
- **调用计数**：累计 `bashCalls`、`toolCalls`、`agentSpawns`，最后传给 timing

## 执行步骤

### Step 1. 初始化 + Data Refresh

```bash
CD="{projectRoot}"
CASE_DIR="$CD/cases/active/{caseNumber}"
mkdir -p "$CASE_DIR/.casework"

# Initialize state.json + mark start step (SDK cold-start timing)
# --init resets all steps to pending (clears previous run's state)
# --run-type creates runs/{YYMMDD-HHmm_casework}/ directory (ISS-231)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --init --run-type casework --step start --status active --case-number "{caseNumber}"

# Pipeline state → dashboard SSE (Step 1 active)
# data-refresh.sh will write start=completed + data-refresh=active at its top
```

**AR 检测**：case number ≥ 19 位 → `IS_AR=true`，`MAIN_CASE_ID` = 前 16 位。upsert `casework-meta.json` 的 `isAR` + `mainCaseId`。

**执行 data-refresh**：

```bash
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number {caseNumber} --case-dir "$CASE_DIR"
# AR 模式额外传 --is-ar --main-case-number {MAIN_CASE_ID}
```

完整参数说明见 `.claude/skills/casework/data-refresh/SKILL.md`。产出：`.casework/output/data-refresh.json`。

### Step 2. Assess

```bash
# Mark assess step active in state.json (mandatory — DO NOT SKIP)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step assess --status active
```

读取 `.claude/skills/casework/assess/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：DELTA_EMPTY 快速路径（零 LLM）→ compliance hash gate → Teams/OneNote enrichment（inline 或 spawn）→ 主 LLM 决策 actualStatus + actions → 写 `.casework/output/execution-plan.json`。

**Step 2 完成后**更新 state：
```bash
# Resolve execution-plan.json path via state.json runId
EP_PATH=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "$CASE_DIR" execution-plan.json)
# Mark assess step completed in state.json (mandatory — DO NOT SKIP, auto-computes durationMs)
ASSESS_RESULT=$(python3 -c "import json; print(json.load(open('$EP_PATH')).get('actualStatus','unknown'))" 2>/dev/null || echo "unknown")
ASSESS_REASONING=$(python3 -c "import json; ep=json.load(open('$EP_PATH')); print((ep.get('reasoning') or ep.get('statusReasoning') or '')[:200])" 2>/dev/null || echo "")
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step assess --status completed --result "$ASSESS_RESULT" --reasoning "$ASSESS_REASONING"
```

**mode=patrol 时**：Step 2 完成后退出，不执行 Step 3/4。输出 `output/execution-plan.json` 供 patrol 主 agent 读取。

### Step 3. Act

```bash
# Pipeline state → dashboard SSE (Step 3 active)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --status active
```

读取 `.claude/skills/casework/act/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：解析 `output/execution-plan.json` → actions=0 则跳过 → IR-first 规则 → 按需 spawn troubleshooter → **如有 deferred actions 则 spawn reassess（读 claims.json.conclusion → fact/analysis 落盘 → LLM 决策 phase 2 actions）→ 按 reassess 结果 spawn email-drafter** → challenge gate。

**无 troubleshooter 的场景**（follow-up / closure）：assess 直接决定 email 类型，不经 reassess。

**Step 3 完成后**更新 state：
```bash
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --status completed
```

### Step 4. Summarize

```bash
# Pipeline state → dashboard SSE (Step 4 active)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status active
```

读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：changePath 推导 → case-summary.md 增量更新 → SAP 准确性检查 → generate-todo.sh → meta.lastInspected 更新。

**Step 4 完成后**更新 state：
```bash
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status completed
```

### Step 5. 展示结果

```bash
# Pipeline state → dashboard SSE (all steps completed)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status completed
```

读取最新 `{caseDir}/todo/` 文件，🔴🟡✅ 格式展示 Todo 汇总。

## AR 分路

| 步骤 | 普通 Case | AR Case |
|------|----------|---------|
| Step 1 data-refresh | 标准模式 | `--main-case` 参数，从 main case 拉主要数据 |
| Step 2 assess | 标准 compliance + status judge | AR scope 提取 + 沟通模式检测 + AR status judge |
| Step 3 act | 标准路由表 | AR 路由表（按 communicationMode 选收件人） |
| Step 4 summarize | 标准 summary | AR 视角 summary（含 AR 信息 section，无 SLA 风险） |

AR 检测逻辑：`[ ${#CASE_NUM} -ge 19 ] && IS_AR=true`。Main case ID = case number 前 16 位。

## Mode 对比

| | mode=full (depth=0) | mode=patrol (depth=1) |
|---|---|---|
| 调用者 | 用户 `/casework` | patrol spawn |
| 执行范围 | Step 1→2→3→4→5 | Step 1→2 only |
| Step 2 enrichment | 可选 spawn subagent 加速 | inline（不 spawn，PRD §2.1 LLM inline 设计） |
| Step 3 act | 自己 spawn agent（含 reassess） | 不执行，patrol 主 agent 做 |
| Step 3 reassess | troubleshooter 后 spawn reassess → phase 2 email | patrol 主 agent 做 |
| Step 4 summarize | 自己 inline 执行 | 不执行，patrol spawn summarize |

## 安全红线

- ❌ 不直接发邮件给客户
- ❌ 禁止在自动流程中调用 D365 邮件脚本
- ⚠️ D365 写操作需用户确认
- ✅ 读操作、分析、草稿生成可自动执行
