---
description: "Pipeline Step 2 Act — 动态链编排器：assess → [troubleshooter → reassess → challenger ↺] → email-drafter"
name: casework:act
displayName: Act 动态链
category: casework-sub-skill
stability: beta
requiredInput: caseNumber, caseDir
promptTemplate: |
  Run Pipeline Step 2 (act) for Case {caseNumber}. Read .claude/skills/casework/act/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Agent
---

# /casework:act — Pipeline Step 2

Full Mode 动态链编排器。先执行 assess 产出 execution-plan，然后按 plan 路由执行后续 actions。

**编排规则**：
- 所有 subagent 使用 general-purpose（不指定 subagent_type），model=opus
- 本编排器负责所有 action-level 状态写入（`--step act --action X --status Y`）
- L3 SKILL.md 不写状态，不感知 state.json 的存在
- 不写 step-level 状态（`--step act --status active/completed` 由 L1 SKILL.md 负责）

## 输入 / 输出契约

**输入**：data-refresh 产出（通过 `resolve-run-path.sh` 解析）、`case-info.md`、`emails.md`、`casework-meta.json`
**输出**：`execution-plan.json`（assess）、`analysis/*.md` + `claims.json`（troubleshooter）、`drafts/*.md`（email-drafter）

## 执行步骤

### Act.0 Assess (inline)

```bash
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action assess --status active
```
读取 `act/assess/SKILL.md` 获取完整执行步骤，inline 执行。完成后提取结果：
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

### Act.1 解析 execution-plan

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}")
```
`ACTION_COUNT == 0` → `echo "ACT_OK|actions=0|reason=$NO_ACTION_REASON|elapsed=0s"` → exit

### Act.2 AR Context 读取（isAR=true 时）
```bash
IS_AR=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print('true' if m.get('isAR') else 'false')")

if [ "$IS_AR" = "true" ]; then
  AR_SCOPE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('scope','unknown'))")
  AR_MODE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('communicationMode','internal'))")
  AR_OWNER_EMAIL=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('caseOwnerEmail',''))")
  MAIN_CASE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('mainCaseId',''))")
fi
```

### Act.3 路由执行

#### IR-first 路径 (IR_FIRST == 1)

1. **email-drafter IR (subagent)**
   ```
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action email-drafter --status active
   Agent(description="IR email {caseNumber}", model="opus",
     prompt="Case {caseNumber}, caseDir={caseDir}. emailType=initial-response, language=auto, recipient=customer. 读取 .claude/skills/casework/act/draft-email/SKILL.md 执行。")
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action email-drafter --status completed
   ```

2. **进入动态链（Act.4）**

#### 标准路径 (IR_FIRST == 0)

- actions 包含 troubleshooter → 进入动态链（Act.4）
- actions 只有 email-drafter → 直接执行 email-drafter（Act.5）

### Act.4 动态链（可回环）

`LOOP=true; CHALLENGE_RESULT=""; LOOP_COUNT=0`

**while $LOOP:**

1. **troubleshooter (subagent)**
   ```
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action troubleshooter --status active
   Agent(description="troubleshooter {caseNumber}", model="opus",
     prompt="Case {caseNumber}, caseDir={caseDir}. {CHALLENGE_RESULT context if retry}. {AR context if isAR}. 读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。")
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action troubleshooter --status completed
   ```
   > subagent output 由 orchestrator 层统一保存（patrol-orchestrator.ts / case-session-manager.ts），不在 act 层处理。

2. **reassess (inline)**
   ```
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action reassess --status active
   ```
   读取 `.claude/skills/casework/act/reassess/SKILL.md` inline 执行。
   ```
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action reassess --status completed
   ```

3. **challenger gate**
   读取 `{caseDir}/.casework/claims.json` → 检查 `triggerChallenge`。

   如 `triggerChallenge == true`：
   ```
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action challenger --status active
   Agent(description="challenger {caseNumber}", model="opus",
     prompt="Case {caseNumber}, caseDir={caseDir}. 读取 .claude/skills/casework/act/challenge/SKILL.md 执行。")
   python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action challenger --status completed
   ```
   读取 `{caseDir}/.casework/challenge-report.md` → 提取 result。
   如 result == "retry"：
   - `CHALLENGE_RESULT` = challenge-report 内容摘要
   - `LOOP_COUNT++`
   - **continue**（回环到 troubleshooter）

   `LOOP=false`

4. **phase 2 email 检查**
   ```bash
   eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}")
   ```
   如 reassess 产出的 phase 2 plan 包含 email action → 执行 Act.5。

### Act.5 Email (inline 优先，过长则 subagent)

```
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action email-drafter --status active
```
读取 `act/draft-email/SKILL.md` inline 执行。如上下文过长则 spawn general-purpose subagent（model=opus）。AR 时按 communicationMode 选择 recipient/prompt context。
```
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action email-drafter --status completed
```

### Act.6 Completion signal

```bash
echo "ACT_OK|actions=$ACTION_COUNT|ir_first=$IR_FIRST|loops=$LOOP_COUNT|elapsed=${SECONDS}s"
```

## 路由参考表 v5（assess LLM 输出 → act 执行）

| actualStatus | assess actions | act 行为 |
|---|---|---|
| `pending-engineer`（新 case） | troubleshooter + email-drafter(IR) | IR-first: email(IR) → ts → reassess → challenger gate → email(phase2) |
| `pending-engineer`（已有 IR） | troubleshooter, deferred=[email-drafter] | ts → reassess → challenger gate → email |
| `pending-customer` (days≥3) | email-drafter(follow-up) | email |
| `pending-pg` (days<5) | [] | 无 action |
| `pending-pg` (days≥5) | email-drafter(follow-up) | email |
| `researching` | troubleshooter, deferred=[email-drafter] | ts → reassess → challenger gate → email |
| `ready-to-close` | email-drafter(closure/closure-confirm) | email |

### AR 路由参考表（isAR=true 时使用）

| actualStatus | communicationMode | 典型 actions |
|---|---|---|
| `new` | any | troubleshooter(AR scope) → email-drafter |
| `pending-engineer` | `internal` | troubleshooter(AR scope) → email-drafter(to case owner) |
| `pending-engineer` | `customer-facing` | troubleshooter(AR scope) → email-drafter(to customer, AR scope only) |
| `pending-customer` (days<3) | any | [] |
| `pending-customer` (days≥3) | `internal` | email-drafter(follow-up to case owner) |
| `pending-customer` (days≥3) | `customer-facing` | email-drafter(follow-up to customer) |
| `pending-pg` (days<5) | any | [] |
| `pending-pg` (days≥5) | `internal` | email-drafter(follow-up to case owner，告知 PG 进展) |
| `pending-pg` (days≥5) | `customer-facing` | email-drafter(follow-up to customer，告知 PG 仍在调查) |
| `researching` | any | troubleshooter(AR scope) |
| `ready-to-close` | `internal` | email-drafter(AR 完成总结 to case owner) |
| `ready-to-close` | `customer-facing` | email-drafter(AR scope 结论 to customer, CC owner) |

## Safety / Pitfalls / 错误处理

**Safety Redlines**：❌ 不直接发邮件 ❌ 不写 step-level 状态（L1 责任）✅ All troubleshooter → reassess + challenger gate ✅ challenger retry 回环带 context ✅ general-purpose subagents only ✅ All action-level state in this orchestrator

**Pitfalls**：caseDir 必须用相对路径 | update-state.py 支持同类 action 多次 append | isAR=true 时 Agent prompt 需含 AR context

| 错误场景 | 行为 |
|------|------|
| `execution-plan.json` 不存在 | exit 2，提示先跑 assess |
| troubleshooter spawn 失败 | state.json action 标 failed，不阻塞后续 |
| email-drafter spawn 失败 | state.json action 标 failed，记日志 |
| challenger spawn 失败 | 跳过 challenge，继续后续流程 |
