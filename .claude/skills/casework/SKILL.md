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

- **日志** append 到 `{caseDir}/.casework/logs/casework.log`，格式 `[YYYY-MM-DD HH:MM:SS] STEP {n} {START|OK|FAIL|SKIP} | {描述}`
- **日志目录**：所有日志统一在 `{caseDir}/.casework/logs/`（含 casework.log、.t_* timing markers、d365.log、teams.log 等）
- **Bash 健壮性**：变量赋值必须独占一行，命令间用 `;` 分隔（非 `&&`）防短路
- **路径格式**：Git Bash 必须用 POSIX `/c/Users/...`，python3 内部用相对路径或 `C:/` 格式
- **调用计数**：累计 `bashCalls`、`toolCalls`、`agentSpawns`，最后传给 timing

## 执行步骤

### Step 1. 初始化 + Data Refresh

```bash
CD="{projectRoot}"
CASE_DIR="$CD/cases/active/{caseNumber}"
mkdir -p "$CASE_DIR/.casework/logs"
date +%s > "$CASE_DIR/.casework/logs/.t_start"

# Pipeline state → dashboard SSE (Step 1 active)
bash .claude/skills/casework/scripts/write-pipeline-state.sh "$CASE_DIR" data-refresh
```

**AR 检测**：case number ≥ 19 位 → `IS_AR=true`，`MAIN_CASE_ID` = 前 16 位。upsert `casework-meta.json` 的 `isAR` + `mainCaseId`。

**执行 data-refresh**：

```bash
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number {caseNumber} --case-dir "$CASE_DIR"
# AR 模式额外传 --is-ar --main-case-number {MAIN_CASE_ID}
```

完整参数说明见 `.claude/skills/casework/data-refresh/SKILL.md`。产出：`.casework/data-refresh-output.json`。

### Step 2. Assess

```bash
# Pipeline state → dashboard SSE (Step 2 active, Step 1 completed)
bash .claude/skills/casework/scripts/write-pipeline-state.sh "$CASE_DIR" assess data-refresh
```

读取 `.claude/skills/casework/assess/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：DELTA_EMPTY 快速路径（零 LLM）→ compliance hash gate → Teams/OneNote enrichment（inline 或 spawn）→ 主 LLM 决策 actualStatus + actions → 写 `.casework/execution-plan.json`。

**mode=patrol 时**：Step 2 完成后退出，不执行 Step 3/4。输出 `execution-plan.json` 供 patrol 主 agent 读取。

### Step 3. Act

```bash
# Pipeline state → dashboard SSE (Step 3 active, Steps 1-2 completed)
bash .claude/skills/casework/scripts/write-pipeline-state.sh "$CASE_DIR" act data-refresh assess
```

读取 `.claude/skills/casework/act/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：解析 `execution-plan.json` → actions=0 则跳过 → IR-first 规则 → 按需 spawn troubleshooter/email-drafter → challenge gate。

### Step 4. Summarize

```bash
# Pipeline state → dashboard SSE (Step 4 active, Steps 1-3 completed)
bash .claude/skills/casework/scripts/write-pipeline-state.sh "$CASE_DIR" summarize data-refresh assess act
```

读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：changePath 推导 → case-summary.md 增量更新 → SAP 准确性检查 → generate-todo.sh → meta.lastInspected 更新。

### Step 5. 展示结果

```bash
# Pipeline state → dashboard SSE (all steps completed)
bash .claude/skills/casework/scripts/write-pipeline-state.sh "$CASE_DIR" done data-refresh assess act summarize
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
| Step 3 act | 自己 spawn agent | 不执行，patrol 主 agent 做 |
| Step 4 summarize | 自己 inline 执行 | 不执行，patrol spawn summarize |

## 安全红线

- ❌ 不直接发邮件给客户
- ❌ 禁止在自动流程中调用 D365 邮件脚本
- ⚠️ D365 写操作需用户确认
- ✅ 读操作、分析、草稿生成可自动执行
