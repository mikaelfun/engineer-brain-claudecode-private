# T2 — Casework Assess Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 `casework/assess/SKILL.md` — 把 Step 2 LLM 判断（compliance gate + actualStatus + teams digest + onenote 分类）从 casework 主 agent 抽成独立 sub-skill，编排 2 个新 subagent（`teams-digest-writer` / `onenote-classifier`），产出 `casework-meta.json` upsert + `.casework/execution-plan.json`。

**Architecture:**
- `data-refresh-output.json`（T1 已交付）→ **assess skill**（本 Plan）→ `execution-plan.json`
- assess 内部：compliance hash gate（命中 = 零 LLM）→ 并行 spawn teams-digest-writer + onenote-classifier（按 delta 门控）→ 主 LLM 一次性吃 meta + delta + digest + classify 产出 actualStatus + actions
- DELTA_EMPTY 快速路径：所有数据源 delta=0 → 复用 meta，不调 LLM，actions=[]，不复用上次 actions 避免重复 spawn

**Tech Stack:** Bash（编排 + hash 计算）、Python3（JSON schema writer）、SKILL.md（文档 + prompt 模板）、claude Agent tool（spawn subagent）

**PRD 对应节**：§3.2（子 skill 内容）、§4.3（execution-plan schema）、§2.5（compliance 定位 + hash 缓存）、§4.1（文件生命周期）

---

## File Structure

| 文件 | 职责 | 行为 |
|------|------|------|
| `.claude/skills/casework/assess/SKILL.md` | 主 skill 文档 + 编排流程 + prompt 模板 | **新建** |
| `.claude/skills/casework/assess/scripts/compliance-hash.sh` | 从 case-info.md 提取 Entitlement/SAP 字段 → sha256 前 8 位 | **新建** |
| `.claude/skills/casework/assess/scripts/gate-subagents.sh` | 读 data-refresh-output → 输出 "SPAWN_TEAMS SPAWN_ONENOTE" 门控信号 | **新建** |
| `.claude/skills/casework/assess/scripts/write-execution-plan.py` | 从 LLM 决策 JSON + meta → 写 `.casework/execution-plan.json`（PRD §4.3 schema） | **新建** |
| `.claude/skills/casework/assess/tests/fixtures/` | canned `data-refresh-output.json` 样本（DELTA_EMPTY / DELTA_OK / compliance-stale） | **新建** |
| `.claude/skills/casework/assess/tests/test_compliance_hash.sh` | hash util 单元测试 | **新建** |
| `.claude/skills/casework/assess/tests/test_gate_subagents.sh` | 门控逻辑单元测试 | **新建** |
| `.claude/skills/casework/assess/tests/test_write_execution_plan.py` | schema writer 单元测试 | **新建** |
| `.claude/skills/casework/SKILL.md` | Step 2 改为引用 `/casework:assess` | 修改 |
| `.claude/agents/casework-light.md` | 移除 Step 4c OneNote 分类章节；Step 3 改为调用 assess | 修改 |
| `.claude/agents/teams-search.md` | 底部加一行注记："LLM relevance/digest 由 teams-digest-writer 处理" | 修改 |

---

## Task 1: scaffold assess skill 目录 + compliance-hash util（TDD）

**Files:**
- Create: `.claude/skills/casework/assess/scripts/compliance-hash.sh`
- Create: `.claude/skills/casework/assess/tests/fixtures/case-info-with-premier.md`
- Create: `.claude/skills/casework/assess/tests/fixtures/case-info-with-ltsc.md`
- Test: `.claude/skills/casework/assess/tests/test_compliance_hash.sh`

- [ ] **Step 1: Write the failing test**

```bash
# .claude/skills/casework/assess/tests/test_compliance_hash.sh
#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/compliance-hash.sh"

# Test 1: same content → same hash
h1=$(bash "$SCRIPT" "$HERE/fixtures/case-info-with-premier.md")
h2=$(bash "$SCRIPT" "$HERE/fixtures/case-info-with-premier.md")
[ "$h1" = "$h2" ] || { echo "FAIL: determinism"; exit 1; }

# Test 2: different Entitlement/SAP → different hash
h3=$(bash "$SCRIPT" "$HERE/fixtures/case-info-with-ltsc.md")
[ "$h1" != "$h3" ] || { echo "FAIL: collision on different fields"; exit 1; }

# Test 3: 8-char hex output
[[ "$h1" =~ ^[0-9a-f]{8}$ ]] || { echo "FAIL: format got '$h1'"; exit 1; }

echo "OK: all 3 compliance-hash tests pass"
```

Also create fixtures:

```bash
# fixtures/case-info-with-premier.md
cat > .claude/skills/casework/assess/tests/fixtures/case-info-with-premier.md <<'EOF'
# Case 1234

| Field | Value |
|-------|-------|
| Entitlement | Premier |
| SAP Code | MSA_PREMIER_P1 |
| Support Plan | 24x7 |
EOF

# fixtures/case-info-with-ltsc.md
cat > .claude/skills/casework/assess/tests/fixtures/case-info-with-ltsc.md <<'EOF'
# Case 5678

| Field | Value |
|-------|-------|
| Entitlement | Professional Direct |
| SAP Code | MSA_PROD_S2 |
| Support Plan | Business Hours |
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bash .claude/skills/casework/assess/tests/test_compliance_hash.sh
```

Expected: `No such file or directory: ../scripts/compliance-hash.sh`

- [ ] **Step 3: Write minimal implementation**

```bash
# .claude/skills/casework/assess/scripts/compliance-hash.sh
#!/usr/bin/env bash
# Extract Entitlement / SAP Code / Support Plan from case-info.md → sha256 first 8 hex chars.
# PRD §2.5: hash 作为 compliance cache key，字段变化即失效。
set -euo pipefail
CASE_INFO="${1:?usage: compliance-hash.sh <case-info.md>}"
[ -f "$CASE_INFO" ] || { echo "ERROR|missing|$CASE_INFO" >&2; exit 2; }

extract() {
  # Match "| Field | value |" rows (markdown table). Output raw value or empty.
  local field="$1"
  grep -iE "^\|\s*$field\s*\|" "$CASE_INFO" | head -1 \
    | sed -E 's/^\|[^|]+\|\s*([^|]*)\|.*$/\1/' | sed -E 's/^\s+|\s+$//g'
}

ENT=$(extract "Entitlement")
SAP=$(extract "SAP Code")
SP=$(extract "Support Plan")

# Emit 8-char prefix of sha256("Entitlement|SAP|SupportPlan")
printf '%s|%s|%s' "$ENT" "$SAP" "$SP" | sha256sum | cut -c1-8
```

- [ ] **Step 4: Run test to verify it passes**

```bash
chmod +x .claude/skills/casework/assess/scripts/compliance-hash.sh
bash .claude/skills/casework/assess/tests/test_compliance_hash.sh
```

Expected: `OK: all 3 compliance-hash tests pass`

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/assess/scripts/compliance-hash.sh \
        .claude/skills/casework/assess/tests/test_compliance_hash.sh \
        .claude/skills/casework/assess/tests/fixtures/
git commit -m "feat(assess): compliance-hash util + tests (T2.1)"
```

---

## Task 2: gate-subagents.sh — 按 delta 门控 subagent spawn（TDD）

**Files:**
- Create: `.claude/skills/casework/assess/scripts/gate-subagents.sh`
- Create: `.claude/skills/casework/assess/tests/fixtures/data-refresh-output-delta-empty.json`
- Create: `.claude/skills/casework/assess/tests/fixtures/data-refresh-output-teams-only.json`
- Create: `.claude/skills/casework/assess/tests/fixtures/data-refresh-output-full.json`
- Test: `.claude/skills/casework/assess/tests/test_gate_subagents.sh`

- [ ] **Step 1: Write fixtures**

```bash
cat > .claude/skills/casework/assess/tests/fixtures/data-refresh-output-delta-empty.json <<'EOF'
{
  "caseNumber": "TEST-EMPTY",
  "deltaStatus": "DELTA_EMPTY",
  "refreshResults": {
    "d365": { "status": "OK", "newEmails": 0, "newNotes": 0 },
    "teams": { "status": "OK", "newChats": 0, "newMessages": 0 },
    "onenote": { "status": "OK", "newPages": 0, "updatedPages": 0 },
    "icm": { "status": "OK", "newEntries": 0 },
    "attachments": { "status": "OK", "downloaded": 0 }
  }
}
EOF

cat > .claude/skills/casework/assess/tests/fixtures/data-refresh-output-teams-only.json <<'EOF'
{
  "caseNumber": "TEST-TEAMS",
  "deltaStatus": "DELTA_OK",
  "refreshResults": {
    "d365": { "status": "OK", "newEmails": 0, "newNotes": 0 },
    "teams": { "status": "OK", "newChats": 1, "newMessages": 8 },
    "onenote": { "status": "OK", "newPages": 0, "updatedPages": 0 },
    "icm": { "status": "OK", "newEntries": 0 },
    "attachments": { "status": "OK", "downloaded": 0 }
  }
}
EOF

cat > .claude/skills/casework/assess/tests/fixtures/data-refresh-output-full.json <<'EOF'
{
  "caseNumber": "TEST-FULL",
  "deltaStatus": "DELTA_OK",
  "refreshResults": {
    "d365": { "status": "OK", "newEmails": 2, "newNotes": 1 },
    "teams": { "status": "OK", "newChats": 1, "newMessages": 8 },
    "onenote": { "status": "OK", "newPages": 0, "updatedPages": 3 },
    "icm": { "status": "OK", "newEntries": 2 },
    "attachments": { "status": "OK", "downloaded": 1 }
  }
}
EOF
```

- [ ] **Step 2: Write the failing test**

```bash
# .claude/skills/casework/assess/tests/test_gate_subagents.sh
#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/gate-subagents.sh"
FX="$HERE/fixtures"

# Case 1: DELTA_EMPTY → spawn neither
out=$(bash "$SCRIPT" "$FX/data-refresh-output-delta-empty.json")
[ "$out" = "SPAWN_TEAMS=0 SPAWN_ONENOTE=0" ] || { echo "FAIL empty: got '$out'"; exit 1; }

# Case 2: Teams only → spawn teams
out=$(bash "$SCRIPT" "$FX/data-refresh-output-teams-only.json")
[ "$out" = "SPAWN_TEAMS=1 SPAWN_ONENOTE=0" ] || { echo "FAIL teams: got '$out'"; exit 1; }

# Case 3: Full delta incl onenote.updatedPages → spawn both
out=$(bash "$SCRIPT" "$FX/data-refresh-output-full.json")
[ "$out" = "SPAWN_TEAMS=1 SPAWN_ONENOTE=1" ] || { echo "FAIL full: got '$out'"; exit 1; }

echo "OK: all 3 gate-subagents tests pass"
```

- [ ] **Step 3: Run test to verify it fails**

```bash
bash .claude/skills/casework/assess/tests/test_gate_subagents.sh
```

Expected: `No such file` for `gate-subagents.sh`

- [ ] **Step 4: Write minimal implementation**

```bash
# .claude/skills/casework/assess/scripts/gate-subagents.sh
#!/usr/bin/env bash
# Read data-refresh-output.json → emit gate flags for parent assess skill.
# Gates per T2 plan:
#   SPAWN_TEAMS=1   iff refreshResults.teams.newMessages > 0
#   SPAWN_ONENOTE=1 iff refreshResults.onenote.newPages + updatedPages > 0
set -euo pipefail
INPUT="${1:?usage: gate-subagents.sh <data-refresh-output.json>}"
[ -f "$INPUT" ] || { echo "SPAWN_TEAMS=0 SPAWN_ONENOTE=0"; exit 0; }

python3 - "$INPUT" <<'PYEOF'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
r = d.get('refreshResults', {})
t = r.get('teams', {}) or {}
o = r.get('onenote', {}) or {}
spawn_t = 1 if int(t.get('newMessages', 0)) > 0 else 0
spawn_o = 1 if int(o.get('newPages', 0)) + int(o.get('updatedPages', 0)) > 0 else 0
print(f"SPAWN_TEAMS={spawn_t} SPAWN_ONENOTE={spawn_o}")
PYEOF
```

- [ ] **Step 5: Run test to verify it passes**

```bash
chmod +x .claude/skills/casework/assess/scripts/gate-subagents.sh
bash .claude/skills/casework/assess/tests/test_gate_subagents.sh
```

Expected: `OK: all 3 gate-subagents tests pass`

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/casework/assess/scripts/gate-subagents.sh \
        .claude/skills/casework/assess/tests/test_gate_subagents.sh \
        .claude/skills/casework/assess/tests/fixtures/data-refresh-output-*.json
git commit -m "feat(assess): gate-subagents util + tests (T2.2)"
```

---

## Task 3: write-execution-plan.py — schema-validated writer（TDD）

**Files:**
- Create: `.claude/skills/casework/assess/scripts/write-execution-plan.py`
- Test: `.claude/skills/casework/assess/tests/test_write_execution_plan.py`

- [ ] **Step 1: Write the failing test**

```python
# .claude/skills/casework/assess/tests/test_write_execution_plan.py
#!/usr/bin/env python3
"""Tests write-execution-plan.py — verifies PRD §4.3 schema."""
import json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'scripts', 'write-execution-plan.py')

def run(decision, case_dir):
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump(decision, f)
        dec_path = f.name
    subprocess.check_call([sys.executable, SCRIPT,
                           '--decision', dec_path,
                           '--case-dir', case_dir])
    with open(os.path.join(case_dir, '.casework', 'execution-plan.json')) as f:
        return json.load(f)

def test_full_schema():
    with tempfile.TemporaryDirectory() as cd:
        plan = run({
            'caseNumber': 'T1',
            'actualStatus': 'pending-engineer',
            'daysSinceLastContact': 3,
            'actions': [
                {'type': 'troubleshooter', 'priority': 1, 'status': 'pending'},
            ],
            'noActionReason': None,
            'routingSource': 'llm',
        }, cd)
        assert plan['caseNumber'] == 'T1'
        assert plan['actualStatus'] == 'pending-engineer'
        assert plan['daysSinceLastContact'] == 3
        assert plan['actions'][0]['type'] == 'troubleshooter'
        assert plan['noActionReason'] is None
        assert plan['routingSource'] == 'llm'

def test_delta_empty_path():
    with tempfile.TemporaryDirectory() as cd:
        plan = run({
            'caseNumber': 'T2',
            'actualStatus': 'pending-customer',
            'daysSinceLastContact': 1,
            'actions': [],
            'noActionReason': 'DELTA_EMPTY — no new data, reusing meta',
            'routingSource': 'rule-table',
        }, cd)
        assert plan['actions'] == []
        assert 'DELTA_EMPTY' in plan['noActionReason']

def test_rejects_invalid_status():
    with tempfile.TemporaryDirectory() as cd:
        try:
            run({'caseNumber':'T3','actualStatus':'bogus','daysSinceLastContact':0,
                 'actions':[],'noActionReason':None,'routingSource':'llm'}, cd)
            print('FAIL: should reject bogus status'); sys.exit(1)
        except subprocess.CalledProcessError:
            pass  # expected

if __name__ == '__main__':
    test_full_schema()
    test_delta_empty_path()
    test_rejects_invalid_status()
    print('OK: all 3 write-execution-plan tests pass')
```

- [ ] **Step 2: Run test to verify it fails**

```bash
python3 .claude/skills/casework/assess/tests/test_write_execution_plan.py
```

Expected: `No such file or directory: write-execution-plan.py`

- [ ] **Step 3: Write minimal implementation**

```python
# .claude/skills/casework/assess/scripts/write-execution-plan.py
#!/usr/bin/env python3
"""
Write `.casework/execution-plan.json` from LLM decision JSON. Validates PRD §4.3 schema.

Usage:
  write-execution-plan.py --decision <decision.json> --case-dir <caseDir>

Schema (PRD §4.3):
  { caseNumber, actualStatus, daysSinceLastContact, actions[], noActionReason, routingSource }
"""
import argparse, json, os, sys

VALID_STATUSES = {
    'pending-engineer', 'pending-customer', 'pending-pg',
    'researching', 'ready-to-close', 'resolved', 'closed',
}
VALID_ACTION_TYPES = {'troubleshooter', 'email-drafter', 'challenger', 'note-gap', 'labor-estimate'}
VALID_ROUTING = {'llm', 'rule-table', 'manual'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--decision', required=True)
    ap.add_argument('--case-dir', required=True)
    args = ap.parse_args()

    with open(args.decision, encoding='utf-8') as f:
        d = json.load(f)

    # Validate
    if d.get('actualStatus') not in VALID_STATUSES:
        print(f"ERROR|invalid actualStatus: {d.get('actualStatus')}", file=sys.stderr)
        sys.exit(2)
    if d.get('routingSource') not in VALID_ROUTING:
        print(f"ERROR|invalid routingSource: {d.get('routingSource')}", file=sys.stderr)
        sys.exit(2)
    for a in d.get('actions', []):
        if a.get('type') not in VALID_ACTION_TYPES:
            print(f"ERROR|invalid action type: {a.get('type')}", file=sys.stderr)
            sys.exit(2)
        if a.get('status') not in (None, 'pending', 'running', 'completed', 'failed'):
            print(f"ERROR|invalid action status: {a.get('status')}", file=sys.stderr)
            sys.exit(2)

    out_dir = os.path.join(args.case_dir, '.casework')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'execution-plan.json')

    plan = {
        'caseNumber': d['caseNumber'],
        'actualStatus': d['actualStatus'],
        'daysSinceLastContact': d.get('daysSinceLastContact', 0),
        'actions': d.get('actions', []),
        'noActionReason': d.get('noActionReason'),
        'routingSource': d['routingSource'],
    }
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)
    print(f"PLAN_WRITTEN|path={out_path}|actions={len(plan['actions'])}")

if __name__ == '__main__':
    main()
```

- [ ] **Step 4: Run test to verify it passes**

```bash
python3 .claude/skills/casework/assess/tests/test_write_execution_plan.py
```

Expected: `OK: all 3 write-execution-plan tests pass`

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/assess/scripts/write-execution-plan.py \
        .claude/skills/casework/assess/tests/test_write_execution_plan.py
git commit -m "feat(assess): execution-plan schema writer + tests (T2.3)"
```

---

## Task 4: assess SKILL.md 骨架 — 编排流程 + subagent spawn + LLM prompt 模板

**Files:**
- Create: `.claude/skills/casework/assess/SKILL.md`

本 task 无单元测试（SKILL.md 是 LLM 可读文档）。验证通过 grep 完整性检查 + 后续 Task 9 端到端冒烟。

- [ ] **Step 1: 写 SKILL.md**

```markdown
---
description: "Step 2 Assess — compliance gate + subagent enrichment + actualStatus/actions 决策，读 .casework/data-refresh-output.json 写 .casework/execution-plan.json"
name: casework:assess
displayName: Case 状态评估
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run Step 2 (assess) for Case {caseNumber}. Read .claude/skills/casework/assess/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Agent
---

# /casework:assess — Step 2 Assess

基于 `.casework/data-refresh-output.json`（Step 1 `/casework:data-refresh` 产出）做状态判断 + 行动规划，产出 `.casework/execution-plan.json`。

## 输入契约

- `{caseDir}/.casework/data-refresh-output.json` — 必须存在（Step 1 成功产物）
- `{caseDir}/casework-meta.json` — 累计元数据（首次运行可不存在）
- `{caseDir}/case-info.md` — D365 snapshot（用于 compliance hash）

## 输出契约

- `{caseDir}/casework-meta.json` — upsert（compliance、actualStatus、lastInspected 等字段）
- `{caseDir}/.casework/execution-plan.json` — PRD §4.3 schema

## 执行步骤

### Step 1. DELTA_EMPTY 快速路径

读 `.casework/data-refresh-output.json`，如 `deltaStatus == "DELTA_EMPTY"`：
- 从 `casework-meta.json` 复用 `actualStatus` + `daysSinceLastContact`
- 调 `write-execution-plan.py`，传：
  - `actualStatus = meta.actualStatus`
  - `actions = []`
  - `noActionReason = "DELTA_EMPTY — no new data, reusing meta"`
  - `routingSource = "rule-table"`
- **零 LLM 调用**，直接退出（输出 `ASSESS_OK|delta=empty|elapsed=Ns`）

```bash
DELTA=$(python3 -c "import json; print(json.load(open(r'{caseDir}/.casework/data-refresh-output.json'))['deltaStatus'])")
if [ "$DELTA" = "DELTA_EMPTY" ]; then
  META=$(cat "{caseDir}/casework-meta.json" 2>/dev/null || echo '{}')
  STATUS=$(echo "$META" | python3 -c "import json,sys; print(json.load(sys.stdin).get('actualStatus','researching'))")
  DAYS=$(echo "$META"  | python3 -c "import json,sys; print(json.load(sys.stdin).get('daysSinceLastContact',0))")
  cat > /tmp/assess-dec-$$.json <<EOF
{"caseNumber":"{caseNumber}","actualStatus":"$STATUS","daysSinceLastContact":$DAYS,
 "actions":[],"noActionReason":"DELTA_EMPTY — no new data, reusing meta","routingSource":"rule-table"}
EOF
  python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
    --decision /tmp/assess-dec-$$.json --case-dir "{caseDir}"
  rm -f /tmp/assess-dec-$$.json
  echo "ASSESS_OK|delta=empty|elapsed=${SECONDS}s"
  exit 0
fi
```

### Step 2. Compliance gate（hash cache）

PRD §2.5：字段 hash 匹配则复用缓存，否则 re-infer via LLM。

```bash
CURRENT_HASH=$(bash .claude/skills/casework/assess/scripts/compliance-hash.sh "{caseDir}/case-info.md")
CACHED_HASH=$(python3 -c "
import json
try: print(json.load(open(r'{caseDir}/casework-meta.json'))['compliance']['sourceHash'])
except: print('')
")

if [ "$CURRENT_HASH" = "$CACHED_HASH" ] && [ -n "$CURRENT_HASH" ]; then
  COMPLIANCE_PATH="cache-hit"
else
  COMPLIANCE_PATH="re-infer"
fi
```

**re-infer 路径**：spawn 一个**内联 LLM 判定**（不 spawn subagent，直接在本 skill 内一次 haiku 调用处理——compliance 规则简单，不值得独立 agent）：
- Prompt: "读 `{caseDir}/case-info.md` 的 Entitlement / SAP Code / Support Plan 字段，判断是否可支持（Premier/ProDirect/Unified 为 entitlementOk=true；Business Hours + 非核心产品为 false）。输出 JSON: {entitlementOk: bool, sapPath: str, details: str}"
- 结果写 `casework-meta.json.compliance = { entitlementOk, sapPath, details, sourceHash: $CURRENT_HASH, checkedAt: ISO }`

**entitlementOk === false 时直接阻断**：写 execution-plan.json 带 `actualStatus=ready-to-close`、`noActionReason="compliance: not supported"`，跳过 Step 3/4。

### Step 3. 并行 spawn enrichment subagents（门控）

```bash
eval $(bash .claude/skills/casework/assess/scripts/gate-subagents.sh "{caseDir}/.casework/data-refresh-output.json")
# 上行注入 SPAWN_TEAMS / SPAWN_ONENOTE
```

**并行 spawn 策略**（本 skill 在一次 Main Agent response 里用 Agent tool 两次，claude harness 自动并行）：

```
if SPAWN_TEAMS == 1:
  Agent(subagent_type="teams-digest-writer",
        description="Teams digest for {caseNumber}",
        prompt="caseNumber={caseNumber}\ncaseDir={caseDir}\ncaseContextHead={head60 of case-info.md}\ndeltaHint={refreshResults.teams}")

if SPAWN_ONENOTE == 1:
  Agent(subagent_type="onenote-classifier",
        description="OneNote classify for {caseNumber}",
        prompt="caseNumber={caseNumber}\ncaseDir={caseDir}\ncaseContextHead={head60 of case-info.md}")
```

两 Agent 调用放在**同一 response**中一次发出以并行。等两者返回后进入 Step 4。

**失败隔离**：subagent 失败 → 对应 digest/classify 文件不存在 → Step 4 LLM 不引用，仍能决策。

### Step 4. 主 LLM：actualStatus + actions 决策

读 context：
- `{caseDir}/.casework/data-refresh-output.json` → delta + context（含 `deltaContent` md）
- `{caseDir}/casework-meta.json` → 历史 actualStatus / compliance
- `{caseDir}/teams/teams-digest.md`（若 spawn 了 teams-digest-writer）
- `{caseDir}/onenote/personal-notes.md`（若 spawn 了 onenote-classifier，已含 [fact]/[analysis] 标注）

**Prompt 模板**：

```
你是 D365 Case 状态判定助手。基于以下 context 产出 JSON 决策。

## Context
### meta (casework-meta.json)
{meta_json}

### delta (data-refresh-output.refreshResults + deltaContent)
{delta_md}

### teams digest (if exists)
{teams_digest_md_or_"(none)"}

### onenote notes (if exists, already classified)
{onenote_md_or_"(none)"}

## 输出（纯 JSON，无 markdown 包裹）
{
  "caseNumber": "{caseNumber}",
  "actualStatus": "<one of: pending-engineer|pending-customer|pending-pg|researching|ready-to-close|resolved|closed>",
  "daysSinceLastContact": <int from context>,
  "actions": [
    // 允许的 type: troubleshooter / email-drafter / challenger / note-gap / labor-estimate
    // 允许的 status: pending
    // email-drafter 需额外字段 "emailType"
    // 可引用 "dependsOn": "<previous action type>"
  ],
  "noActionReason": "<string or null>",
  "routingSource": "llm"
}
```

决策规则（判定优先级）：
1. compliance.entitlementOk === false → actualStatus=ready-to-close, actions=[]
2. 客户最新回复后 < 1 day + 无工程师后续 → pending-engineer + troubleshooter 或 email-drafter
3. 工程师发出 follow-up 后 > 3 days 无客户回复 → pending-customer + email-drafter(follow-up)
4. ICM 有 PG 新 entry → pending-pg（等 PG 回应，actions=[]）
5. 其余（数据不足 / 正在排查） → researching + troubleshooter

LLM 返回 JSON 后写 decision 文件，调 `write-execution-plan.py`：

```bash
echo "$LLM_JSON" > /tmp/assess-dec-$$.json
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision /tmp/assess-dec-$$.json --case-dir "{caseDir}"
rm -f /tmp/assess-dec-$$.json
```

### Step 5. 更新 casework-meta.json

upsert 字段：
- `actualStatus` ← LLM 决策
- `daysSinceLastContact` ← LLM 决策（或从 data-refresh-output 透传）
- `lastAssessedAt` ← ISO now
- `compliance.sourceHash` / `.entitlementOk` / `.checkedAt` ← Step 2 产物（若 re-infer）

```bash
python3 - <<PYEOF
import json, time
p = r'{caseDir}/casework-meta.json'
try: m = json.load(open(p, encoding='utf-8'))
except: m = {}
m['actualStatus'] = '$STATUS'
m['daysSinceLastContact'] = int('$DAYS')
m['lastAssessedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
# compliance merge (如 Step 2 re-infer)
if '$COMPLIANCE_PATH' == 're-infer':
    m['compliance'] = json.loads('''$COMPLIANCE_JSON''')
json.dump(m, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
PYEOF
```

### Step 6. Emit completion signal

```
ASSESS_OK|delta=ok|status={actualStatus}|actions={N}|compliance={cache-hit|re-infer}|elapsed={S}s
```

## Safety Redlines

- ❌ 不调 D365 写操作（add-note / record-labor）
- ❌ 不发邮件（email-drafter 产出只写到 drafts/）
- ❌ 不修改 `teams/*.md` chat 原始文件（subagent 职责）
- ✅ compliance.entitlementOk === false 直接阻断 Step 3/4，避免浪费 LLM

## 错误处理

| 场景 | 行为 |
|------|------|
| `data-refresh-output.json` 不存在 | exit 2，提示先跑 `/casework:data-refresh` |
| compliance hash util 失败 | 视为 "re-infer"（保守，不用错误缓存） |
| teams-digest-writer 失败 | teams-digest.md 不生成，assess 主 LLM 不引用，继续 |
| onenote-classifier 失败 | personal-notes.md 保持 search-inline 产出（无标注），assess 主 LLM 仍可读 |
| LLM 返回非法 JSON | write-execution-plan.py 校验失败 → exit 2 → 调用方（/casework）retry 一次 |
```

- [ ] **Step 2: 验证文件落地 + 结构完整**

```bash
test -f .claude/skills/casework/assess/SKILL.md && echo OK
grep -c "^###" .claude/skills/casework/assess/SKILL.md  # 至少 6（Step 1-6）
grep -q "write-execution-plan.py" .claude/skills/casework/assess/SKILL.md && echo "writer referenced"
grep -q "teams-digest-writer" .claude/skills/casework/assess/SKILL.md && echo "subagent referenced"
grep -q "onenote-classifier" .claude/skills/casework/assess/SKILL.md && echo "subagent referenced"
```

Expected: 4 行 OK 输出 + "6"

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/assess/SKILL.md
git commit -m "feat(assess): SKILL.md skeleton — compliance gate + subagent enrichment + LLM decision (T2.4)"
```

---

## Task 5: 主 casework/SKILL.md — Step 2 改接 assess

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`（Step 2 章节）

- [ ] **Step 1: 定位当前 Step 2 章节**

```bash
grep -n "^### Step 2\|^## Step 2\|compliance-check\|status-judge" .claude/skills/casework/SKILL.md | head -10
```

- [ ] **Step 2: 用 Edit 替换 Step 2 整段**

把原来内联的 compliance-check + status-judge 调用替换为：

```markdown
### Step 2. Assess（compliance + actualStatus + 行动规划）

调用 `/casework:assess`（见 `.claude/skills/casework/assess/SKILL.md`），读 `.casework/data-refresh-output.json` 产出 `.casework/execution-plan.json`。

```bash
bash .claude/skills/casework/assess/scripts/run-assess.sh \
  --case-number {caseNumber} --case-dir "$CASE_DIR"
```

（若 run-assess.sh 未落地，可直接调用 assess SKILL.md 的步骤；T2.7 冒烟时决定是否抽脚本。）

**产出验收**：
- `$CASE_DIR/.casework/execution-plan.json` 存在且通过 `write-execution-plan.py` schema 校验
- `$CASE_DIR/casework-meta.json` 的 `actualStatus` / `lastAssessedAt` 已更新

失败重试一次，仍失败 → `ASSESS_FAILED` → 跳过 Step 3/4（仅做 Step 5 inspection 兜底）。
```

- [ ] **Step 3: 验证 diff**

```bash
git diff .claude/skills/casework/SKILL.md | head -60
# 确认没删掉别的章节，只改了 Step 2
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "refactor(casework): Step 2 delegates to /casework:assess sub-skill (T2.5)"
```

---

## Task 6: casework-light agent — 迁走 OneNote 分类 + 接 assess

**Files:**
- Modify: `.claude/agents/casework-light.md`

当前 agent §4c 做 OneNote 分类（内联 LLM）。assess skill 下放到 onenote-classifier subagent → agent 本体只需触发 assess，不再内联分类。

- [ ] **Step 1: 确认当前 4c 章节位置**

```bash
grep -n "OneNote 分类\|Step 4c\|4c\|personal-notes.md" .claude/agents/casework-light.md | head -10
```

- [ ] **Step 2: Edit — 删除 §4c "OneNote 分类" 整段 + 在 Step 3（status-judge）前插入 assess 调用注记**

替换目标是把 "Step 3 status-judge（内联 LLM）" 改为 "Step 3 `/casework:assess`（sub-skill，内部处理 compliance + teams digest + onenote classify + actualStatus）"。

具体 edit：找到 `## OneNote 分类（4c）` 整段（从 heading 到下一个 `## ` 之前），用下述内容替换：

```markdown
## OneNote 分类

**已迁移**：OneNote 的 [fact]/[analysis] 分类现在由 `onenote-classifier` subagent（见 `.claude/agents/onenote-classifier.md`）处理，由 `/casework:assess` 按 `refreshResults.onenote.newPages + updatedPages > 0` 门控 spawn。

本 agent 不再内联做 OneNote 分类。Step 3 改为调用 `/casework:assess`。
```

同时把原 `completedSteps` 数组里的 `'status-judge'` 保留（assess 包含 status-judge 职责，但对外仍用老名字兼容 patrol 消费方）。

- [ ] **Step 3: 验证**

```bash
grep -c "OneNote 分类\|fact.*analysis\|onenote-classifier" .claude/agents/casework-light.md
# 应出现 onenote-classifier，不再出现内联分类 prompt
grep -q "casework:assess\|onenote-classifier" .claude/agents/casework-light.md && echo "migration OK"
```

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/casework-light.md
git commit -m "refactor(casework-light): OneNote classify migrated to onenote-classifier subagent (T2.6)"
```

---

## Task 7: teams-search agent — 加 digest 职责移交注记

**Files:**
- Modify: `.claude/agents/teams-search.md`

- [ ] **Step 1: Edit — 文件末尾追加注记**

```markdown
## Step 2 增值（已下放）

**Relevance scoring + digest 生成** 由 `teams-digest-writer` subagent（见 `.claude/agents/teams-digest-writer.md`）处理，由 `/casework:assess` 按 `refreshResults.teams.newMessages > 0` 门控 spawn。

本 agent 仅负责 Step 1 落盘：raw → input → 每 chat .md + `_chat-index.json`。
```

- [ ] **Step 2: 验证**

```bash
grep -q "teams-digest-writer\|Step 2 增值" .claude/agents/teams-search.md && echo OK
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/teams-search.md
git commit -m "docs(teams-search): note digest responsibility handed to teams-digest-writer (T2.7)"
```

---

## Task 8: 端到端冒烟 — 真实 case

**Files:**
- 无新建；消费 Task 1–7 产物

- [ ] **Step 1: 选一个 DELTA_EMPTY 的 case**

```bash
# 从 active 目录选一个最近 assess 过的 case（meta 里有 actualStatus）
CASE=$(ls cases/active/ | head -1)
echo "smoke target: $CASE"
CD="cases/active/$CASE"
cat "$CD/casework-meta.json" | python3 -c "import json,sys; m=json.load(sys.stdin); print('actualStatus=',m.get('actualStatus'),'days=',m.get('daysSinceLastContact'))"
```

- [ ] **Step 2: 跑 data-refresh 产出 Step 1 output**

```bash
bash skills/casework/scripts/data-refresh.sh \
  --case-number "$CASE" --case-dir "$CD" --project-root .
cat "$CD/.casework/data-refresh-output.json" | python3 -c "import json,sys; d=json.load(sys.stdin); print('deltaStatus=',d['deltaStatus'],'overall=',d['overallStatus'])"
```

期望：产出 `data-refresh-output.json`

- [ ] **Step 3: 构造 DELTA_EMPTY fixture 手动验证快速路径**

```bash
# 强制改成 DELTA_EMPTY 测快速路径
python3 -c "
import json
p = '$CD/.casework/data-refresh-output.json'
d = json.load(open(p))
d['deltaStatus'] = 'DELTA_EMPTY'
for k in d['refreshResults']:
    d['refreshResults'][k] = {kk: 0 if isinstance(vv,int) else vv for kk,vv in d['refreshResults'][k].items()}
    d['refreshResults'][k]['status'] = 'OK'
json.dump(d, open(p,'w'), indent=2, ensure_ascii=False)
"

# 手动走 assess SKILL.md Step 1（DELTA_EMPTY 快速路径的 Bash 片段）
# ... 从 SKILL.md 复制 Step 1 的 bash 到这里直接跑
```

验证：
```bash
test -f "$CD/.casework/execution-plan.json" && cat "$CD/.casework/execution-plan.json" | python3 -m json.tool
# 期望 actions=[], noActionReason 含 DELTA_EMPTY
```

- [ ] **Step 4: 跑 DELTA_OK 路径（需要 Main Agent 手工驱动 SKILL.md）**

这一步需要在 Claude session 里用 `/casework:assess {CASE}` 触发。确认：
- teams-digest-writer 和 onenote-classifier 被 spawn（看 transcript）
- 主 LLM 返回合法 JSON
- `.casework/execution-plan.json` 通过 schema 校验

本 step 不能纯 bash 自动化 — 记录人工验证清单，后续实施时 owner 逐项打勾。

- [ ] **Step 5: 记录冒烟结果**

```bash
cat >> conductor/specs/casework-v2/plans/T2-assess-skill.md.smoke.log <<EOF
## Smoke $(date -u +%FT%TZ) — case $CASE

- Step 1 data-refresh: OK / FAIL
- Step 2 DELTA_EMPTY 快速路径: OK / FAIL
- Step 3 DELTA_OK 路径 subagent spawn: OK / FAIL
- Step 4 execution-plan.json schema: OK / FAIL
EOF
git add conductor/specs/casework-v2/plans/T2-assess-skill.md.smoke.log
git commit -m "test(assess): smoke log $CASE (T2.8)"
```

---

## Self-Review Checklist（plan 作者自检，非 agent 执行项）

1. **Spec 覆盖**
   - PRD §3.2 assess 子 skill → Task 4 ✅
   - PRD §2.5 compliance hash + cache → Task 1 + Task 4 Step 2 ✅
   - PRD §4.3 execution-plan schema → Task 3 ✅
   - PRD §3.2 "仅当 Teams 数据有更新时" → Task 2 门控 ✅
   - OneNote updatedPages delta bug（T2 前已修）→ Task 2 门控使用 newPages+updatedPages ✅

2. **Placeholder 扫描**：grep "TBD\|TODO\|fill in\|implement later" 本 plan → 无命中

3. **类型一致性**：
   - `VALID_STATUSES` （Task 3）匹配 CLAUDE.md 中 actualStatus 枚举 ✅
   - `SPAWN_TEAMS=1` / `SPAWN_ONENOTE=1` 格式在 Task 2 测试和 Task 4 `eval` 消费处一致 ✅
   - subagent name `teams-digest-writer` / `onenote-classifier` 与已落盘 spec 文件名一致 ✅

4. **Gap**：
   - 未覆盖：`/casework:assess` 的 slash-command 注册（需要 `allowed-tools` 在主 SKILL.md 继承？）—— 标记为**已知后续**，不阻塞 T2 主体。若冒烟阶段发现 slash-command 不可用，插入 T2.9 补注册。

---

## 执行交付规范

- **每 Task 必须 commit**（小 commit 原则，T2.1 -> T2.8 共 8 commits）
- **失败即 STOP**：单元测试 FAIL 不得进入下一 Task；冒烟 Step 4 FAIL 阻塞 T2 收尾
- **owner 验证 Step 4**：DELTA_OK 路径的 LLM 调用需 owner 在 session 里人工驱动，不能纯 bash 自动化——这是 assess 的 LLM 调用本质
