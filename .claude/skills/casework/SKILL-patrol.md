---
description: "Case 处理 Patrol Mode：data-refresh → assess → 路由分流（自闭环/退出）"
name: casework:patrol
displayName: Case 处理（Patrol）
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
  - assess
  - route
promptTemplate: |
  Process Case {caseNumber} in patrol mode. Read .claude/skills/casework/SKILL-patrol.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
---

# /casework:patrol — Patrol Mode

Patrol 模式编排器。data-refresh → assess → 路由分流。简单路径自闭环（含 email + summarize），排查路径标记 waiting-troubleshooter 退出。

## 参数

- `$ARGUMENTS` — Case 编号

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

### Pipeline Step 1. 初始化 + Data Refresh

```bash
CD="{projectRoot}"
CASES_ROOT=$(python3 -c "import json; print(json.load(open('config.json',encoding='utf-8')).get('casesRoot','./cases'))")
CASE_DIR="$CD/$CASES_ROOT/active/{caseNumber}"
mkdir -p "$CASE_DIR/.casework"

# In patrol mode: skip --init (patrol already wrote it with correct spawnedAt timestamp)
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

### Pipeline Step 2. Assess

```bash
# Pipeline state → dashboard SSE (Step 2 active)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --status active
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action assess --status active
```

读取 `act/assess/SKILL.md` 获取完整执行步骤，然后 inline 执行。

完成后提取结果：
```bash
EP_PATH=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "{caseDir}" execution-plan.json 2>/dev/null || echo "{caseDir}/.casework/execution-plan.json")
ASSESS_RESULT=$(python3 -c "import json; print(json.load(open('$EP_PATH')).get('actualStatus','unknown'))" 2>/dev/null || echo "unknown")
ASSESS_REASONING=$(python3 -c "
import json, os
ep_path = '$EP_PATH'
case_dir = '{caseDir}'
reasoning = ''
try:
    ep = json.load(open(ep_path, encoding='utf-8'))
    reasoning = ep.get('reasoning') or ep.get('statusReasoning') or ''
except: pass
if not reasoning:
    try:
        meta = json.load(open(os.path.join(case_dir, 'casework-meta.json'), encoding='utf-8'))
        reasoning = meta.get('statusReasoning', '')
    except: pass
print(reasoning[:200])
" 2>/dev/null || echo "")
python3 .claude/skills/casework/scripts/update-state.py --case-dir "{caseDir}" --step act --action assess --status completed --result "$ASSESS_RESULT" --detail "$ASSESS_REASONING"
```

解析 execution-plan：
```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "$CASE_DIR")
```

### Pipeline Step 3. 路由分流

#### 路径 A/B: actions=0（无 action 需要执行）

```bash
# 标记 act completed
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status completed --case-number "$CASE_NUMBER"
```

跳过 act 执行，直接进入 Summarize（inline 执行）：

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status active --case-number "$CASE_NUMBER"
```
读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，然后执行。
```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status completed --case-number "$CASE_NUMBER"
```

读取最新 `{caseDir}/todo/` 文件，🔴🟡✅ 格式展示 Todo 汇总。

```
echo "CASEWORK_PATROL_OK|path=self-closed|actions=0|elapsed=${SECONDS}s"
```

#### 路径 C: actions=[email-drafter only]（无 troubleshooter）

```bash
# Inline email-drafter
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --action email-drafter --status active --case-number "$CASE_NUMBER"
```

读取 `.claude/skills/casework/act/draft-email/SKILL.md`，inline 执行 email-drafter。emailType 从 execution-plan 获取。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --action email-drafter --status completed --case-number "$CASE_NUMBER"
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status completed --case-number "$CASE_NUMBER"
```

Inline 执行 Summarize：

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status active --case-number "$CASE_NUMBER"
```
读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，然后执行。
```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status completed --case-number "$CASE_NUMBER"
```

读取最新 `{caseDir}/todo/` 文件，🔴🟡✅ 格式展示 Todo 汇总。

```
echo "CASEWORK_PATROL_OK|path=self-closed|actions=email|elapsed=${SECONDS}s"
```

#### 路径 D/E/F: actions 含 troubleshooter

```bash
# IR-first 检查：如果同时含 email-drafter(initial-response)，先 inline 写 IR
if [ "$IR_FIRST" = "1" ]; then
  python3 .claude/skills/casework/scripts/update-state.py \
    --case-dir "$CASE_DIR" --step act --action email-drafter --status active --case-number "$CASE_NUMBER"
  # 读取 .claude/skills/casework/act/draft-email/SKILL.md，inline 执行 IR email
  python3 .claude/skills/casework/scripts/update-state.py \
    --case-dir "$CASE_DIR" --step act --action email-drafter --status completed --case-number "$CASE_NUMBER"
fi

# 标记等待 troubleshooter（patrol 将 spawn 独立 troubleshooter agent）
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status waiting-troubleshooter --case-number "$CASE_NUMBER"
echo "CASEWORK_PATROL_WAITING|path=needs-troubleshooter|ir_first=$IR_FIRST|elapsed=${SECONDS}s"
```

退出 casework agent，控制权回到 patrol。

## AR 分路

| 步骤 | 普通 Case | AR Case |
|------|----------|---------|
| Step 1 data-refresh | 标准模式 | `--main-case` 参数，从 main case 拉主要数据 |
| Step 2 assess | 标准 compliance + status judge | AR scope 提取 + 沟通模式检测 + AR status judge |
| Step 3 route (email) | 标准路由表 | AR 路由表（按 communicationMode 选收件人） |

AR 检测逻辑：`[ ${#CASE_NUM} -ge 19 ] && IS_AR=true`。Main case ID = case number 前 16 位。

## 安全红线

- ❌ 不直接发邮件给客户
- ❌ 禁止在自动流程中调用 D365 邮件脚本
- ⚠️ D365 写操作需用户确认
- ✅ 读操作、分析、草稿生成可自动执行
- ✅ 简单路径（A/B/C）在 agent 内自闭环，包含 inline email + summarize
- ✅ 排查路径（D/E/F）inline IR email 后退出，标记 waiting-troubleshooter
