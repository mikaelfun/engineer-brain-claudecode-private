# T3 — Casework Act Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 `casework/act/SKILL.md` — Step 3 读取 `.casework/execution-plan.json`（Step 2 产物），按 actions[] 路由 spawn troubleshooter / email-drafter / challenger agent，处理 IR-first 规则、challenge gate、依赖链，支持 full mode（自己 spawn）和 patrol mode（只写 pipeline-state，patrol 主 session spawn）。

**Architecture:**
- `execution-plan.json`（T2 已交付）→ **act skill**（本 Plan）→ spawn agents → 产出 analysis/ + drafts/ + claims.json
- 核心是一个**路由器**：读 plan → 按 priority 排序 actions → 遇 IR-first 拦截（email-drafter 前台 → troubleshooter 后台）→ challenge gate（claims.json → challenger → retry loop）→ 依赖链调度（dependsOn）
- patrol mode 不 spawn（depth=1 限制），只标记 pipeline-state.json 供 patrol 主 session 读取

**Tech Stack:** SKILL.md（文档 + 编排指令）、Bash（read-plan.sh 脚本解析 execution-plan）、Python3（pipeline-state writer）

**PRD 对应节**：§3.2（act/SKILL.md 规格）、§4.3（execution-plan schema）、§4.4（pipeline-state）、§2.6（patrol 集成 — mode 差异）

---

## File Structure

| 文件 | 职责 | 行为 |
|------|------|------|
| `.claude/skills/casework/act/SKILL.md` | 主 skill 文档：读 plan → 路由 → spawn agent → challenge gate | **新建** |
| `.claude/skills/casework/act/scripts/read-plan.sh` | 解析 execution-plan.json → 输出 shell vars（ACTION_COUNT, ACTION_0_TYPE, ...） | **新建** |
| `.claude/skills/casework/act/scripts/update-pipeline-state.py` | 原子 upsert pipeline-state.json（step + status） | **新建** |
| `.claude/skills/casework/act/tests/test_read_plan.sh` | read-plan 单元测试（empty actions / IR-first / dependsOn） | **新建** |
| `.claude/skills/casework/act/tests/test_update_pipeline_state.py` | pipeline-state writer 单元测试 | **新建** |
| `.claude/skills/casework/act/tests/fixtures/` | canned execution-plan.json 样本 | **新建** |
| `.claude/skills/casework/SKILL.md` | Step 3 改为引用 `/casework:act` | **修改** |

---

## Task 1: scaffold act skill 目录 + read-plan.sh（TDD）

**Files:**
- Create: `.claude/skills/casework/act/scripts/read-plan.sh`
- Create: `.claude/skills/casework/act/tests/fixtures/plan-no-actions.json`
- Create: `.claude/skills/casework/act/tests/fixtures/plan-troubleshooter-only.json`
- Create: `.claude/skills/casework/act/tests/fixtures/plan-ir-first.json`
- Create: `.claude/skills/casework/act/tests/fixtures/plan-with-dependency.json`
- Test: `.claude/skills/casework/act/tests/test_read_plan.sh`

- [ ] **Step 1: Create test fixtures**

```json
// fixtures/plan-no-actions.json
{
  "caseNumber": "2604140040001804",
  "actualStatus": "pending-pg",
  "daysSinceLastContact": 1,
  "actions": [],
  "noActionReason": "DELTA_EMPTY — no new data",
  "routingSource": "rule-table"
}

// fixtures/plan-troubleshooter-only.json
{
  "caseNumber": "2604140040001804",
  "actualStatus": "researching",
  "daysSinceLastContact": 2,
  "actions": [
    { "type": "troubleshooter", "priority": 1, "status": "pending" }
  ],
  "noActionReason": null,
  "routingSource": "llm"
}

// fixtures/plan-ir-first.json
{
  "caseNumber": "2604140040001804",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 0,
  "actions": [
    { "type": "troubleshooter", "priority": 1, "status": "pending" },
    { "type": "email-drafter", "priority": 2, "status": "pending", "emailType": "initial-response", "dependsOn": "troubleshooter" }
  ],
  "noActionReason": null,
  "routingSource": "llm"
}

// fixtures/plan-with-dependency.json
{
  "caseNumber": "2604140040001804",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 3,
  "actions": [
    { "type": "troubleshooter", "priority": 1, "status": "pending" },
    { "type": "email-drafter", "priority": 2, "status": "pending", "emailType": "follow-up", "dependsOn": "troubleshooter" }
  ],
  "noActionReason": null,
  "routingSource": "llm"
}
```

- [ ] **Step 2: Write the failing test**

```bash
#!/usr/bin/env bash
# .claude/skills/casework/act/tests/test_read_plan.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/read-plan.sh"
PASS=0; FAIL=0

run_test() {
  local name="$1" fixture="$2" expected_var="$3" expected_val="$4"
  local output
  output=$(bash "$SCRIPT" "$HERE/fixtures/$fixture")
  eval "$output"
  local actual="${!expected_var}"
  if [ "$actual" = "$expected_val" ]; then
    echo "  ✓ $name"; PASS=$((PASS+1))
  else
    echo "  ✗ $name: expected $expected_var='$expected_val', got '$actual'"; FAIL=$((FAIL+1))
  fi
}

echo "=== read-plan.sh tests ==="

# T1: no actions → ACTION_COUNT=0
run_test "no-actions count" "plan-no-actions.json" "ACTION_COUNT" "0"

# T2: troubleshooter only → ACTION_COUNT=1, ACTION_0_TYPE=troubleshooter
run_test "ts-only count" "plan-troubleshooter-only.json" "ACTION_COUNT" "1"
output=$(bash "$SCRIPT" "$HERE/fixtures/plan-troubleshooter-only.json")
eval "$output"
[ "$ACTION_0_TYPE" = "troubleshooter" ] && { echo "  ✓ ts-only type"; PASS=$((PASS+1)); } || { echo "  ✗ ts-only type"; FAIL=$((FAIL+1)); }

# T3: IR-first detection
run_test "ir-first status" "plan-ir-first.json" "ACTUAL_STATUS" "pending-engineer"
output=$(bash "$SCRIPT" "$HERE/fixtures/plan-ir-first.json")
eval "$output"
[ "$IR_FIRST" = "1" ] && { echo "  ✓ ir-first flag"; PASS=$((PASS+1)); } || { echo "  ✗ ir-first flag: got '$IR_FIRST'"; FAIL=$((FAIL+1)); }

# T4: dependency chain
output=$(bash "$SCRIPT" "$HERE/fixtures/plan-with-dependency.json")
eval "$output"
[ "$ACTION_1_DEPENDS_ON" = "troubleshooter" ] && { echo "  ✓ dependency"; PASS=$((PASS+1)); } || { echo "  ✗ dependency"; FAIL=$((FAIL+1)); }

echo "=== $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ]
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bash .claude/skills/casework/act/tests/test_read_plan.sh`
Expected: FAIL (script not found)

- [ ] **Step 4: Implement read-plan.sh**

```bash
#!/usr/bin/env bash
# read-plan.sh — Parse execution-plan.json → shell variables for act SKILL.md
# Usage: eval $(bash read-plan.sh <execution-plan.json>)
# Outputs: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT,
#          ACTION_{i}_TYPE, ACTION_{i}_PRIORITY, ACTION_{i}_STATUS,
#          ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON, IR_FIRST, NO_ACTION_REASON
set -euo pipefail
PLAN="${1:?usage: read-plan.sh <execution-plan.json>}"
[ -f "$PLAN" ] || { echo "echo 'ERROR: plan not found: $PLAN'" >&2; exit 2; }

python3 - "$PLAN" <<'PYEOF'
import json, sys

d = json.load(open(sys.argv[1], encoding='utf-8'))
cn = d.get('caseNumber', '')
status = d.get('actualStatus', 'researching')
days = d.get('daysSinceLastContact', 0)
actions = d.get('actions', [])
no_reason = d.get('noActionReason') or ''

# Sort by priority
actions.sort(key=lambda a: a.get('priority', 99))

# IR-first detection: pending-engineer + has both troubleshooter and email-drafter(initial-response)
types = {a['type'] for a in actions}
email_types = {a.get('emailType', '') for a in actions if a['type'] == 'email-drafter'}
ir_first = 1 if (status in ('new', 'pending-engineer')
                 and 'troubleshooter' in types
                 and 'email-drafter' in types
                 and 'initial-response' in email_types) else 0

print(f'CASE_NUMBER="{cn}"')
print(f'ACTUAL_STATUS="{status}"')
print(f'DAYS_SINCE={days}')
print(f'ACTION_COUNT={len(actions)}')
print(f'IR_FIRST={ir_first}')
print(f'NO_ACTION_REASON="{no_reason}"')

for i, a in enumerate(actions):
    print(f'ACTION_{i}_TYPE="{a["type"]}"')
    print(f'ACTION_{i}_PRIORITY={a.get("priority", 99)}')
    print(f'ACTION_{i}_STATUS="{a.get("status", "pending")}"')
    print(f'ACTION_{i}_EMAIL_TYPE="{a.get("emailType", "auto")}"')
    print(f'ACTION_{i}_DEPENDS_ON="{a.get("dependsOn", "")}"')
PYEOF
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bash .claude/skills/casework/act/tests/test_read_plan.sh`
Expected: all 6 pass

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/casework/act/
git commit -m "feat(act): scaffold + read-plan.sh with TDD (T3.1)"
```

---

## Task 2: update-pipeline-state.py（TDD）

**Files:**
- Create: `.claude/skills/casework/act/scripts/update-pipeline-state.py`
- Test: `.claude/skills/casework/act/tests/test_update_pipeline_state.py`

- [ ] **Step 1: Write the failing test**

```python
#!/usr/bin/env python3
# .claude/skills/casework/act/tests/test_update_pipeline_state.py
import json, os, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'scripts', 'update-pipeline-state.py')

def run(case_dir, step, status, extra_args=None):
    import subprocess
    cmd = [sys.executable, SCRIPT, '--case-dir', case_dir, '--step', step, '--status', status]
    if extra_args:
        cmd.extend(extra_args)
    r = subprocess.run(cmd, capture_output=True, text=True)
    assert r.returncode == 0, f"FAIL: {r.stderr}"
    return json.load(open(os.path.join(case_dir, '.casework', 'pipeline-state.json'), encoding='utf-8'))

def test_create_new():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        s = run(td, 'troubleshooter', 'running')
        assert s['steps']['troubleshooter']['status'] == 'running'
        assert s['currentStep'] == 'troubleshooter'
    print('  ✓ create_new')

def test_update_existing():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        run(td, 'troubleshooter', 'running')
        s = run(td, 'troubleshooter', 'completed')
        assert s['steps']['troubleshooter']['status'] == 'completed'
        assert 'completedAt' in s['steps']['troubleshooter']
    print('  ✓ update_existing')

def test_current_step_tracks_running():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        run(td, 'troubleshooter', 'running')
        s = run(td, 'email-drafter', 'running')
        assert s['currentStep'] == 'email-drafter'
    print('  ✓ current_step_tracks_running')

def test_completed_does_not_change_current():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        run(td, 'troubleshooter', 'running')
        run(td, 'email-drafter', 'running')
        s = run(td, 'troubleshooter', 'completed')
        assert s['currentStep'] == 'email-drafter'
    print('  ✓ completed_preserves_current')

if __name__ == '__main__':
    print('=== update-pipeline-state tests ===')
    test_create_new()
    test_update_existing()
    test_current_step_tracks_running()
    test_completed_does_not_change_current()
    print('=== all passed ===')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 .claude/skills/casework/act/tests/test_update_pipeline_state.py`
Expected: FAIL (script not found)

- [ ] **Step 3: Implement update-pipeline-state.py**

```python
#!/usr/bin/env python3
"""
Atomic upsert of .casework/pipeline-state.json.
Usage: update-pipeline-state.py --case-dir <dir> --step <name> --status <running|completed|failed>
       [--case-number <cn>] [--mode <full|patrol>] [--actions <json-array>]
"""
import argparse, json, os, time

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--case-dir', required=True)
    ap.add_argument('--step', required=True)
    ap.add_argument('--status', required=True, choices=['pending', 'running', 'completed', 'failed'])
    ap.add_argument('--case-number', default='')
    ap.add_argument('--mode', default='full')
    ap.add_argument('--actions', default='[]')
    args = ap.parse_args()

    path = os.path.join(args.case_dir, '.casework', 'pipeline-state.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)

    try:
        state = json.load(open(path, encoding='utf-8'))
    except (FileNotFoundError, json.JSONDecodeError):
        state = {
            'caseNumber': args.case_number,
            'mode': args.mode,
            'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'currentStep': '',
            'steps': {},
        }

    now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    step_state = state.get('steps', {}).get(args.step, {})

    if args.status == 'running':
        step_state['status'] = 'running'
        step_state['startedAt'] = now
        state['currentStep'] = args.step
    elif args.status == 'completed':
        step_state['status'] = 'completed'
        step_state['completedAt'] = now
        # currentStep stays as-is (don't reset on completion)
    elif args.status == 'failed':
        step_state['status'] = 'failed'
        step_state['completedAt'] = now
        step_state['error'] = True

    state.setdefault('steps', {})[args.step] = step_state

    # Atomic write
    tmp = path + f'.tmp.{os.getpid()}'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)
    print(f'PIPELINE_STATE|step={args.step}|status={args.status}')

if __name__ == '__main__':
    main()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 .claude/skills/casework/act/tests/test_update_pipeline_state.py`
Expected: all 4 pass

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/act/scripts/update-pipeline-state.py \
       .claude/skills/casework/act/tests/test_update_pipeline_state.py
git commit -m "feat(act): update-pipeline-state.py with TDD (T3.2)"
```

---

## Task 3: act/SKILL.md — 主 Skill 文档

**Files:**
- Create: `.claude/skills/casework/act/SKILL.md`

这是 act 的核心——**纯文档 + prompt 模板**，不含脚本逻辑。Main Agent 读到这个 SKILL.md 后，按步骤执行 Bash 和 Agent tool call。

- [ ] **Step 1: Write SKILL.md**

```markdown
---
description: "Step 3 Act — 读取 execution-plan.json，路由 spawn troubleshooter/email-drafter/challenger"
name: casework:act
displayName: Case 行动执行
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run Step 3 (act) for Case {caseNumber}. Read .claude/skills/casework/act/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Agent
---

# /casework:act — Step 3 Act

基于 `.casework/execution-plan.json`（Step 2 `/casework:assess` 产出）执行行动：spawn troubleshooter / email-drafter / challenger。

## 输入契约

- `{caseDir}/.casework/execution-plan.json` — 必须存在（Step 2 成功产物）
- `{caseDir}/case-info.md` — D365 snapshot（agent 前置条件）
- `{caseDir}/emails.md` — 邮件（agent 前置条件）

## 输出契约

- `{caseDir}/analysis/*.md` — troubleshooter 产出
- `{caseDir}/claims.json` — troubleshooter 证据链
- `{caseDir}/drafts/*.md` — email-drafter 产出
- `{caseDir}/.casework/pipeline-state.json` — 更新 Step 3 各 action 状态

## 执行步骤

### Step 1. 解析 execution-plan.json

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}/.casework/execution-plan.json")
# 注入: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT, IR_FIRST,
#       ACTION_{i}_TYPE, ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON, NO_ACTION_REASON
```

如 `ACTION_COUNT == 0`：
- 记日志 `ACT_OK|actions=0|reason=$NO_ACTION_REASON|elapsed=0s`
- 直接退出，不进 Step 2

### Step 2. 模式检测

```bash
# patrol mode = subagent (depth=1)，不能再 spawn agent
# full mode = 主 session (depth=0)，可以 spawn
MODE="full"
# 如果 casework 主 SKILL.md 传入了 mode=patrol，设 MODE="patrol"
```

**patrol mode 行为**：
- 不 spawn 任何 agent（depth=1 限制）
- 把 actions 写入 pipeline-state.json（`actions` 字段），patrol 主 session 读取后自行 spawn
- 输出 `ACT_DELEGATED|actions={N}|mode=patrol`，退出

```bash
if [ "$MODE" = "patrol" ]; then
  python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
    --case-dir "{caseDir}" --step "act" --status "completed" \
    --case-number "$CASE_NUMBER" --mode "patrol"
  echo "ACT_DELEGATED|actions=$ACTION_COUNT|mode=patrol"
  exit 0
fi
```

### Step 3. 执行 actions（full mode）

按 priority 排序的 actions 逐个执行。**IR-first 拦截优先于 priority 排序。**

#### 3a. IR-first 路径（`IR_FIRST == 1`）

适用条件：`actualStatus ∈ {new, pending-engineer}` 且 actions 同时含 troubleshooter + email-drafter(initial-response)。

**执行顺序**：
1. **先 spawn email-drafter（前台）** — emailType = `initial-response`
2. email-drafter 完成 → 展示 IR 草稿给用户
3. **再 spawn troubleshooter（后台 `run_in_background: true`）** — 独立排查
4. **不等待 troubleshooter** → 直接进 Step 4（completion signal）
5. troubleshooter 后台完成后的 challenge gate 延迟到下次 casework/patrol 处理

```
# IR-first: email-drafter 前台
Agent(
  subagent_type: "email-drafter",
  description: "IR email for {caseNumber}",
  run_in_background: false,
  prompt: |
    Case {caseNumber}，caseDir={caseDir}。
    emailType=initial-response, language=auto, recipient=customer。
    读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
)

# IR-first: troubleshooter 后台
Agent(
  subagent_type: "troubleshooter",
  description: "troubleshooter {caseNumber}",
  run_in_background: true,
  prompt: |
    Case {caseNumber}，caseDir={caseDir}。
    读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
)
```

#### 3b. 标准路径（`IR_FIRST == 0`）

按 priority 排序，逐个执行 action：

```
for i in 0..(ACTION_COUNT-1):
  TYPE = ACTION_{i}_TYPE
  DEPENDS = ACTION_{i}_DEPENDS_ON

  # 检查依赖：如果有 dependsOn，检查被依赖的 action 是否已完成
  # （通过检查对应产物文件是否存在来判断）
  if DEPENDS == "troubleshooter" && ! -f "{caseDir}/claims.json":
    # 依赖未完成，跳过本 action（下次 casework 处理）
    continue

  match TYPE:
    "troubleshooter":
      Agent(
        subagent_type: "troubleshooter",
        description: "troubleshooter {caseNumber}",
        run_in_background: false,
        prompt: |
          Case {caseNumber}，caseDir={caseDir}。
          读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
      )
      # troubleshooter 完成后 → challenge gate（Step 3c）

    "email-drafter":
      Agent(
        subagent_type: "email-drafter",
        description: "email {caseNumber}",
        run_in_background: false,
        prompt: |
          Case {caseNumber}，caseDir={caseDir}。
          emailType={ACTION_{i}_EMAIL_TYPE}, language=auto, recipient=customer。
          读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
      )

    "challenger":
      # challenger 已改为手动触发（/challenge {caseNumber}），act 自动流程不 spawn
      skip

    "note-gap" | "labor-estimate":
      # 纯脚本行为，由 Step 4 (summarize) 处理，act 跳过
      skip
```

#### 3c. Challenge Gate（troubleshooter 完成后触发）

```bash
if [ -f "{caseDir}/claims.json" ]; then
  TRIGGER=$(python3 -c "
import json
c = json.load(open(r'{caseDir}/claims.json', encoding='utf-8'))
print('1' if c.get('triggerChallenge') else '0')
  ")

  if [ "$TRIGGER" = "1" ]; then
    # PRD: challenger 改为手动触发。自动流程不 spawn challenger。
    # 在 pipeline-state 标记 "challenge-pending"，todo 会提示用户手动 /challenge
    echo "  ⚠ claims.json triggerChallenge=true — 标记待 challenge，需用户手动 /challenge {caseNumber}" >&2
  fi

  # 如果 actions 中有 email-drafter dependsOn troubleshooter，现在可以执行
  # （标准路径循环会在下次迭代处理）
fi
```

### Step 4. Pipeline state 更新 + Completion signal

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "act" --status "completed" \
  --case-number "$CASE_NUMBER"

echo "ACT_OK|actions=$ACTION_COUNT|ir_first=$IR_FIRST|elapsed=${SECONDS}s"
```

## 路由参考表（assess LLM 输出 → act spawn）

| actualStatus | 典型 actions | act 行为 |
|---|---|---|
| `pending-engineer`（新 case） | troubleshooter + email-drafter(IR) | IR-first: email(fg) → ts(bg) |
| `pending-engineer`（已有 IR） | troubleshooter | 仅 troubleshooter(fg) |
| `pending-customer` (days≥3) | email-drafter(follow-up) | email(fg) |
| `pending-pg` | [] | 无 action |
| `researching` | troubleshooter | troubleshooter(fg) |
| `ready-to-close` | email-drafter(closure) | email(fg) |

## Safety Redlines

- ❌ 不直接发邮件（email-drafter 产出只写到 drafts/）
- ❌ 不自动 spawn challenger（改为手动 `/challenge`）
- ❌ patrol mode 不 spawn 任何 agent（depth=1 限制）
- ✅ IR-first troubleshooter 后台 spawn（不阻塞用户审阅 IR 草稿）

## Pitfalls (known)

- **Agent prompt 路径格式**：prompt 中的 `caseDir` 必须用相对路径（`./cases/active/{caseNumber}`），禁止 Windows 绝对路径（反斜杠被 Bash 转义）
- **depth=1 限制**：patrol spawn 的 casework subagent 不能再 spawn subagent → patrol mode 必须委托回 patrol 主 session
- **IR-first 后台 troubleshooter 生命周期**：后台 agent 完成后不在本次 act 处理，下次 casework/patrol 才做 challenge gate

## 错误处理

| 场景 | 行为 |
|------|------|
| `execution-plan.json` 不存在 | exit 2，提示先跑 `/casework:assess` |
| troubleshooter spawn 失败 | pipeline-state 标 failed，不阻塞后续 email-drafter |
| email-drafter spawn 失败 | pipeline-state 标 failed，记日志 |
| IR-first 后台 troubleshooter 超时 | 不影响本次 act（后台），下次 patrol 检测到 |
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/act/SKILL.md
git commit -m "docs(act): SKILL.md — Step 3 routing + IR-first + challenge gate (T3.3)"
```

---

## Task 4: casework SKILL.md — 接入 Step 3 引用

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`

- [ ] **Step 1: 在 casework SKILL.md 的 v2 说明块追加 T3 状态**

在 SKILL.md 头部 v2 说明块中，把 `T3, 未交付` 改为 `T3 已交付`，更新路径：

```
> - 完整 v2 路径：`data-refresh` (T1) → `assess` (T2) → `act` (T3) → `summarize` (T4, 未交付)
> - act 内部：读 execution-plan.json → IR-first 拦截 → 逐 action spawn agent → challenge gate 标记 → pipeline-state 更新
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "docs(casework): update v2 status — T3 act delivered (T3.4)"
```

---

## Task 5: 真实 case smoke test

**Files:** 无新文件（验证性任务）

- [ ] **Step 1: 准备 — 用 assess 产出的 execution-plan.json**

```bash
# 确认 assess 已产出 plan
cat ../data/cases/active/2604140040001804/.casework/execution-plan.json | python3 -m json.tool
# 如果不存在，先跑 /casework:assess 2604140040001804
```

- [ ] **Step 2: 解析 plan**

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh \
  ../data/cases/active/2604140040001804/.casework/execution-plan.json)
echo "ACTION_COUNT=$ACTION_COUNT IR_FIRST=$IR_FIRST ACTUAL_STATUS=$ACTUAL_STATUS"
```

Expected: 能正确解析出 actions 数量和 IR_FIRST 标志

- [ ] **Step 3: 验证 pipeline-state 写入**

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir ../data/cases/active/2604140040001804 \
  --step "act-smoke" --status "running" --case-number "2604140040001804"
cat ../data/cases/active/2604140040001804/.casework/pipeline-state.json | python3 -m json.tool
```

Expected: pipeline-state.json 正确写入 `act-smoke: running`

- [ ] **Step 4: 清理 smoke 痕迹**

```bash
# 删除 smoke 写入的 pipeline-state
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir ../data/cases/active/2604140040001804 \
  --step "act-smoke" --status "completed"
```

- [ ] **Step 5: Commit smoke log**

```bash
# 追加到 T3 smoke log
echo "$(date -u +%FT%TZ) T3 SMOKE PASS — read-plan + pipeline-state verified on 2604140040001804" \
  >> conductor/specs/casework-v2/plans/T3-act-skill.md.smoke.log
git add conductor/specs/casework-v2/plans/T3-act-skill.md.smoke.log
git commit -m "test(act): T3 smoke test pass on real case (T3.5)"
```

---

## Verification Checklist

| 验证项 | 命令 | 期望 |
|--------|------|------|
| read-plan 单元测试 | `bash .claude/skills/casework/act/tests/test_read_plan.sh` | 6 passed, 0 failed |
| pipeline-state 单元测试 | `python3 .claude/skills/casework/act/tests/test_update_pipeline_state.py` | 4 passed |
| Bash 语法检查 | `bash -n .claude/skills/casework/act/scripts/read-plan.sh` | SYNTAX_OK |
| SKILL.md 存在 | `ls -la .claude/skills/casework/act/SKILL.md` | file exists |
| 真实 case plan 解析 | `eval $(bash ... read-plan.sh) && echo $ACTION_COUNT` | 数字输出 |
| Pipeline state 原子写 | `python3 ... update-pipeline-state.py && cat ... pipeline-state.json` | valid JSON |
