---
description: "Case 全流程处理：data-refresh → act → summarize。v4: patrol 模式简单路径自闭环，排查路径标记 waiting-troubleshooter 退出。"
name: casework
displayName: Case 全流程处理
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
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

v4 三步编排器。Step 1 纯脚本并行数据收集，Step 2 Act 内含执行链（assess → 按需 troubleshoot → reassess → email），Step 3 总结 + todo。

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

### Step 2. Act

```bash
# Pipeline state → dashboard SSE (Step 2 active)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --status active
```

读取 `.claude/skills/casework/act/SKILL.md` 获取完整执行步骤，然后执行。

**mode=patrol 分路（v4 新逻辑）**：

assess 完成产出 `execution-plan.json` 后，patrol 模式按以下路径分流：

读取 execution-plan.json：
```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "$CASE_DIR")
```

**路径 A/B: actions=0（无 action 需要执行）**
```bash
# 标记 act completed
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status completed --case-number "$CASE_NUMBER"
```
跳过 act 执行，直接进入 Step 3 Summarize（inline 执行）。完成后退出。
```
echo "CASEWORK_PATROL_OK|path=self-closed|actions=0|elapsed=${SECONDS}s"
```

**路径 C: actions=[email-drafter only]（无 troubleshooter）**
```bash
# Inline email-drafter
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --action email-drafter --status active --case-number "$CASE_NUMBER"
```
读取 `.claude/agents/email-drafter.md`，inline 执行 email-drafter。emailType 从 execution-plan 获取。
完成后标记 act completed，然后 inline 执行 Step 3 Summarize。
```
echo "CASEWORK_PATROL_OK|path=self-closed|actions=email|elapsed=${SECONDS}s"
```

**路径 D/E/F: actions 含 troubleshooter**
```bash
# IR-first 检查：如果同时含 email-drafter(initial-response)，先 inline 写 IR
if [ "$IR_FIRST" = "1" ]; then
  python3 .claude/skills/casework/scripts/update-state.py \
    --case-dir "$CASE_DIR" --step act --action email-drafter --status active --case-number "$CASE_NUMBER"
  # 读取 .claude/agents/email-drafter.md，inline 执行 IR email
  python3 .claude/skills/casework/scripts/update-state.py \
    --case-dir "$CASE_DIR" --step act --action email-drafter --status completed --case-number "$CASE_NUMBER"
fi

# 标记等待 troubleshooter（patrol 将 spawn 独立 troubleshooter agent）
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status waiting-troubleshooter --case-number "$CASE_NUMBER"
echo "CASEWORK_PATROL_WAITING|path=needs-troubleshooter|ir_first=$IR_FIRST|elapsed=${SECONDS}s"
```
退出 casework agent，控制权回到 patrol。

核心流程：act 内部先执行 assess（作为第一个 action），产出 `execution-plan.json` → actions=0 则跳过 → IR-first 规则 → 按需 spawn troubleshooter → **如有 deferred actions 则 spawn reassess（读 claims.json.conclusion → fact/analysis 落盘 → LLM 决策 phase 2 actions）→ 按 reassess 结果 spawn email-drafter** → challenge gate。

**无 troubleshooter 的场景**（follow-up / closure）：assess 直接决定 email 类型，不经 reassess。

**Step 2 完成后**更新 state：
```bash
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --status completed
```

### Step 3. Summarize

```bash
# Pipeline state → dashboard SSE (Step 3 active)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status active
```

读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：changePath 推导 → case-summary.md 增量更新 → SAP 准确性检查 → generate-todo.sh → meta.lastInspected 更新。

**Step 3 完成后**更新 state：
```bash
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status completed
```

### Step 4. 展示结果

```bash
# Pipeline state → dashboard SSE (all steps completed)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status completed
```

读取最新 `{caseDir}/todo/` 文件，🔴🟡✅ 格式展示 Todo 汇总。

## AR 分路

| 步骤 | 普通 Case | AR Case |
|------|----------|---------|
| Step 1 data-refresh | 标准模式 | `--main-case` 参数，从 main case 拉主要数据 |
| Step 2 act (assess) | 标准 compliance + status judge | AR scope 提取 + 沟通模式检测 + AR status judge |
| Step 2 act (execute) | 标准路由表 | AR 路由表（按 communicationMode 选收件人） |
| Step 3 summarize | 标准 summary | AR 视角 summary（含 AR 信息 section，无 SLA 风险） |

AR 检测逻辑：`[ ${#CASE_NUM} -ge 19 ] && IS_AR=true`。Main case ID = case number 前 16 位。

## Mode 对比

| | mode=full (depth=0) | mode=patrol (depth=1) |
|---|---|---|
| 调用者 | 用户 `/casework` | patrol spawn |
| 简单路径（无 troubleshooter） | Step 1→2→3→4 inline | Step 1→2→3→4 inline（自闭环，不返回 patrol） |
| 排查路径（有 troubleshooter） | Step 1→2(assess)→2(act: all inline)→3→4 | Step 1→2(assess)→[IR email inline]→退出(waiting-troubleshooter) |
| IR-first | act 内 inline: IR email→ts→reassess→email→summarize | assess 后 inline IR email → 退出等 troubleshooter |
| Phase 2（排查后） | act 内 inline 完成 | patrol spawn casework-phase2 agent |

## 安全红线

- ❌ 不直接发邮件给客户
- ❌ 禁止在自动流程中调用 D365 邮件脚本
- ⚠️ D365 写操作需用户确认
- ✅ 读操作、分析、草稿生成可自动执行
- ✅ patrol 模式简单路径（A/B/C）在 agent 内自闭环，包含 inline email + summarize
- ✅ patrol 模式排查路径（D/E/F）inline IR email 后退出，标记 waiting-troubleshooter
