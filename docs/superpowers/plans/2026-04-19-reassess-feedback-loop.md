# Reassess Feedback Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After troubleshooter completes, feed findings back through a reassess step that classifies facts/analysis, persists them to case files, and decides the concrete communication action (email type, escalation, or transfer recommendation).

**Architecture:** Introduce a `reassess` sub-step between troubleshooter and email-drafter. The `execution-plan.json` becomes a `plans[]` list — each phase (assess, reassess) appends an entry. Only cases with troubleshooter defer email-drafter to reassess; pure follow-up/closure flows are unchanged. IR-first path sends IR email immediately, then runs troubleshooter → reassess → second email.

**Tech Stack:** Python scripts, Bash, SKILL.md (Markdown skill definitions)

**Spec:** `docs/superpowers/specs/2026-04-19-reassess-feedback-loop.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `playbooks/schemas/claims-schema.md` | Modify | Add `conclusion` block schema |
| `.claude/agents/troubleshooter.md` | Modify | Add conclusion output between Step 4c and 5a |
| `.claude/skills/casework/assess/scripts/write-execution-plan.py` | Modify | Support `plans[]` list + `deferredActions` + `reassess` routing |
| `.claude/skills/casework/act/scripts/read-plan.sh` | Modify | Read latest plan from `plans[]`, expose `HAS_DEFERRED`, `PLAN_PHASE` |
| `.claude/skills/casework/reassess/SKILL.md` | Create | Reassess sub-skill: read claims.conclusion → fact/analysis classify → LLM decide action → write plan phase 2 |
| `.claude/skills/casework/assess/SKILL.md` | Modify | Add `deferredActions` output when troubleshooter is in actions |
| `.claude/skills/casework/act/SKILL.md` | Modify | Add reassess spawn logic after troubleshooter, change IR-first flow |
| `.claude/skills/casework/SKILL.md` | Modify | Update Step 3 description to reflect reassess |
| `.claude/skills/patrol/SKILL.md` | Modify | Add investigating/reassessing/communicating phases (P3 — deferred until patrol-ui-redesign completes) |

---

### Task 1: claims-schema.md — Add `conclusion` block

**Files:**
- Modify: `.claude/skills/casework/reassess/` (create dir)
- Modify: `playbooks/schemas/claims-schema.md`

- [ ] **Step 1: Create reassess directory**

```bash
mkdir -p .claude/skills/casework/reassess
```

- [ ] **Step 2: Add conclusion schema to claims-schema.md**

After the `## Root Object` table, before `### overallConfidence Calculation`, insert a new section. Open `playbooks/schemas/claims-schema.md` and add after line 24 (`| claims | array | yes | Array of Claim objects |`):

```markdown
| `conclusion` | object | yes | Structured troubleshooter conclusion for reassess consumption |

## Conclusion Object

Structured output from troubleshooter's Step 4c synthesis. Consumed by reassess sub-skill to decide communication action.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | yes | `"found-cause"` / `"need-info"` / `"exhausted"` / `"out-of-scope"` / `"partial"` |
| `summary` | string | yes | 1-3 sentence natural language summary of the conclusion |
| `confidence` | enum | yes | `"high"` / `"medium"` / `"low"` — overall conclusion confidence |
| `suggestedNextAction` | enum | yes | `"email-result"` / `"email-request-info"` / `"escalate-pg"` / `"transfer-pod"` / `"no-action"` |
| `missingInfo` | array[string] | no | Specific information needed from customer (for `need-info` / `partial` types) |
| `scopeAssessment` | enum | yes | `"in-pod"` / `"out-of-scope"` / `"unclear"` |
| `outOfScopeTarget` | string? | no | Target team/POD for transfer (only when `scopeAssessment === "out-of-scope"`) |

### conclusion.type Mapping

| type | Meaning | Typical suggestedNextAction |
|------|---------|----------------------------|
| `found-cause` | Root cause identified | `email-result` |
| `need-info` | Need customer data to verify hypothesis | `email-request-info` |
| `exhausted` | All investigation avenues exhausted, no root cause | `escalate-pg` |
| `out-of-scope` | Problem outside this POD's service scope | `transfer-pod` |
| `partial` | Some findings but investigation incomplete | `email-request-info` |
```

- [ ] **Step 3: Update the Example section**

In the existing example JSON at line 99, add `conclusion` after `retryCount`:

```json
  "retryCount": 0,
  "conclusion": {
    "type": "found-cause",
    "summary": "AKS 集群的 Pod Security Standards enforcement 导致 Pod 被 reject，升级到 1.28 后 PSS 默认行为变化",
    "confidence": "medium",
    "suggestedNextAction": "email-result",
    "missingInfo": [],
    "scopeAssessment": "in-pod",
    "outOfScopeTarget": null
  },
```

- [ ] **Step 4: Update Version**

Change the schema version line from `> Version: 1` to `> Version: 2`. Add reassess to Consumers:

```markdown
> Version: 2
> Location: `{caseDir}/.casework/claims.json`
> Writers: troubleshooter (creates) → challenger (updates status)
> Consumers: challenger, email-drafter, reassess, summarize, Dashboard
```

- [ ] **Step 5: Commit**

```bash
git add playbooks/schemas/claims-schema.md .claude/skills/casework/reassess/
git commit -m "feat: add conclusion block to claims schema for reassess consumption"
```

---

### Task 2: troubleshooter.md — Add conclusion output

**Files:**
- Modify: `.claude/agents/troubleshooter.md:320-374`

- [ ] **Step 1: Add Step 4d — Conclusion Synthesis**

Insert after Step 4c (line 325, after `- 后续步骤建议`) and before Step 5 (line 333, `### 5. 写分析报告`):

```markdown
#### 4d. 结论合成（写 conclusion 块）

基于 4a-4c 的综合判断，产出结构化结论（将写入 claims.json 的 `conclusion` 字段）。

**判断规则**：

| 情况 | conclusion.type | suggestedNextAction |
|------|----------------|---------------------|
| 找到根因，有 ≥2 个独立来源交叉验证 | `found-cause` (high) | `email-result` |
| 找到根因，仅单一来源支持 | `found-cause` (medium) | `email-result` |
| 有线索但需要客户提供信息验证 | `need-info` | `email-request-info` |
| 所有 Kusto/知识库/文档路径穷尽，无法定位 | `exhausted` | `escalate-pg` |
| 问题明确不属于本 POD 服务范围 | `out-of-scope` | `transfer-pod` |
| 部分发现但排查未完成（超时/数据不足） | `partial` | `email-request-info` |

**missingInfo 字段**：当 type 为 `need-info` 或 `partial` 时，列出具体需要客户提供的信息（不是泛泛的"更多信息"，而是如"问题发生时段的 NSG flow logs"、"客户是否手动修改过路由表"等具体问题）。

**scopeAssessment 判断**：
- `in-pod`：问题属于本 POD 服务范围（默认值）
- `out-of-scope`：排查发现问题根源在其他服务（如 VM 问题实际是 Networking NSG，AKS 问题实际是 ACR image pull）
- `unclear`：无法确定是否在本 POD 范围

**outOfScopeTarget**：仅 `out-of-scope` 时填写，指明应该转到的 POD/团队（如 "Networking POD"、"Storage team"）。

**日志**：
```
[timestamp] STEP 4d OK | conclusion: type={type}, confidence={confidence}, suggestedNextAction={action}
```
```

- [ ] **Step 2: Update Step 5a — Add conclusion to claims.json output**

In Step 5a (line 372), after the `triggerChallenge` calculation section and before `Schema 详见`, add:

```markdown
**conclusion 块写入**：

基于 Step 4d 的结论合成，在 claims.json 根对象中写入 `conclusion` 字段：

```json
{
  "version": 2,
  "generatedAt": "...",
  "generatedBy": "troubleshooter",
  "analysisRef": "...",
  "overallConfidence": "...",
  "triggerChallenge": false,
  "retryCount": 0,
  "conclusion": {
    "type": "found-cause",
    "summary": "...",
    "confidence": "high",
    "suggestedNextAction": "email-result",
    "missingInfo": [],
    "scopeAssessment": "in-pod",
    "outOfScopeTarget": null
  },
  "claims": [...]
}
```

Schema 详见 `playbooks/schemas/claims-schema.md` 的 Conclusion Object 部分。
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/troubleshooter.md
git commit -m "feat: add conclusion synthesis step to troubleshooter output"
```

---

### Task 3: write-execution-plan.py — Support plans[] list

**Files:**
- Modify: `.claude/skills/casework/assess/scripts/write-execution-plan.py`

- [ ] **Step 1: Rewrite write-execution-plan.py to support plans[] and phases**

Replace the entire file with:

```python
#!/usr/bin/env python3
"""
Write `.casework/execution-plan.json` from LLM decision JSON.
Supports plans[] list — each phase (assess, reassess) appends an entry.
Top-level fields always reflect the latest plan for backward compatibility.

Usage:
  write-execution-plan.py --decision <decision.json> --case-dir <caseDir>
  write-execution-plan.py --decision <decision.json> --case-dir <caseDir> --phase reassess
"""
import argparse, json, os, sys, time

VALID_STATUSES = {
    'pending-engineer', 'pending-customer', 'pending-pg',
    'researching', 'ready-to-close', 'resolved', 'closed',
}
VALID_ACTION_TYPES = {'troubleshooter', 'email-drafter', 'challenger', 'note-gap', 'labor-estimate'}
VALID_ROUTING = {'llm', 'rule-table', 'manual', 'reassess-llm'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--decision', required=True)
    ap.add_argument('--case-dir', required=True)
    ap.add_argument('--phase', default='assess', choices=['assess', 'reassess'])
    args = ap.parse_args()

    with open(args.decision, encoding='utf-8') as f:
        d = json.load(f)

    # Validate
    if d.get('actualStatus') and d['actualStatus'] not in VALID_STATUSES:
        print(f"ERROR|invalid actualStatus: {d.get('actualStatus')}", file=sys.stderr)
        sys.exit(2)
    routing = d.get('routingSource', 'reassess-llm' if args.phase == 'reassess' else 'llm')
    if routing not in VALID_ROUTING:
        print(f"ERROR|invalid routingSource: {routing}", file=sys.stderr)
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

    # Build plan entry
    plan_entry = {
        'phase': args.phase,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'actions': d.get('actions', []),
        'noActionReason': d.get('noActionReason'),
        'routingSource': routing,
    }

    if args.phase == 'assess':
        plan_entry['actualStatus'] = d['actualStatus']
        plan_entry['daysSinceLastContact'] = d.get('daysSinceLastContact', 0)
        plan_entry['statusReasoning'] = d.get('statusReasoning', '')
        if d.get('deferredActions'):
            plan_entry['deferredActions'] = d['deferredActions']
            plan_entry['deferReason'] = d.get('deferReason', '')

    if args.phase == 'reassess':
        if d.get('conclusion'):
            plan_entry['conclusion'] = d['conclusion']

    # Load existing or create new
    existing = None
    if os.path.exists(out_path):
        try:
            with open(out_path, encoding='utf-8') as f:
                existing = json.load(f)
        except (json.JSONDecodeError, OSError):
            existing = None

    if existing and 'plans' in existing:
        # Append to existing plans list
        existing['plans'].append(plan_entry)
        existing['currentPhase'] = args.phase
        # Update top-level for backward compat
        if d.get('actualStatus'):
            existing['actualStatus'] = d['actualStatus']
        if d.get('daysSinceLastContact') is not None:
            existing['daysSinceLastContact'] = d.get('daysSinceLastContact', 0)
        existing['actions'] = d.get('actions', [])
        existing['noActionReason'] = d.get('noActionReason')
        existing['routingSource'] = routing
        result = existing
    else:
        # First plan (assess) — create new structure
        result = {
            'caseNumber': d.get('caseNumber', existing.get('caseNumber', '') if existing else ''),
            'currentPhase': args.phase,
            'actualStatus': d.get('actualStatus', ''),
            'daysSinceLastContact': d.get('daysSinceLastContact', 0),
            'actions': d.get('actions', []),
            'noActionReason': d.get('noActionReason'),
            'routingSource': routing,
            'plans': [plan_entry],
        }

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    plan_count = len(result['plans'])
    action_count = len(d.get('actions', []))
    print(f"PLAN_WRITTEN|path={out_path}|phase={args.phase}|plan#{plan_count}|actions={action_count}")

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Verify backward compatibility — assess phase works as before**

```bash
cd /c/Users/fangkun/Documents/Projects/EngineerBrain/src
mkdir -p /tmp/test-plan-case/.casework
cat > /tmp/test-plan-dec.json << 'EOF'
{
  "caseNumber": "2601290030000748",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 2,
  "statusReasoning": "test",
  "actions": [{"type": "troubleshooter", "status": "pending"}],
  "deferredActions": ["email-drafter"],
  "deferReason": "email type TBD after troubleshoot reassess",
  "routingSource": "llm"
}
EOF
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision /tmp/test-plan-dec.json --case-dir /tmp/test-plan-case
cat /tmp/test-plan-case/.casework/execution-plan.json
```

Expected: JSON with `plans: [{ phase: "assess", ... }]`, top-level `actualStatus`, `actions`.

- [ ] **Step 3: Verify reassess phase appends to plans[]**

```bash
cat > /tmp/test-plan-reassess.json << 'EOF'
{
  "actions": [{"type": "email-drafter", "emailType": "result-confirm", "status": "pending"}],
  "noActionReason": null,
  "routingSource": "reassess-llm",
  "conclusion": {"type": "found-cause", "summary": "test", "confidence": "high", "suggestedNextAction": "email-result"}
}
EOF
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision /tmp/test-plan-reassess.json --case-dir /tmp/test-plan-case --phase reassess
python3 -c "import json; d=json.load(open('/tmp/test-plan-case/.casework/execution-plan.json')); print(f'plans count: {len(d[\"plans\"])}'); print(f'current phase: {d[\"currentPhase\"]}'); print(f'top-level actions: {d[\"actions\"]}')"
```

Expected: `plans count: 2`, `current phase: reassess`, top-level actions has email-drafter.

- [ ] **Step 4: Clean up test files and commit**

```bash
rm -rf /tmp/test-plan-case /tmp/test-plan-dec.json /tmp/test-plan-reassess.json
git add .claude/skills/casework/assess/scripts/write-execution-plan.py
git commit -m "feat: write-execution-plan.py supports plans[] list and reassess phase"
```

---

### Task 4: read-plan.sh — Read latest plan from plans[]

**Files:**
- Modify: `.claude/skills/casework/act/scripts/read-plan.sh`

- [ ] **Step 1: Rewrite read-plan.sh to support plans[] format**

Replace the entire file with:

```bash
#!/usr/bin/env bash
# read-plan.sh — Parse execution-plan.json → shell variables for act SKILL.md
# Supports both legacy flat format and new plans[] list format.
# Usage: eval $(bash read-plan.sh <execution-plan.json>)
# Outputs: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT,
#          ACTION_{i}_TYPE, ACTION_{i}_PRIORITY, ACTION_{i}_STATUS,
#          ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON, IR_FIRST,
#          NO_ACTION_REASON, HAS_DEFERRED, PLAN_PHASE, PLAN_COUNT
set -euo pipefail
PLAN="${1:?usage: read-plan.sh <execution-plan.json>}"
[ -f "$PLAN" ] || { echo "echo 'ERROR: plan not found: $PLAN'" >&2; exit 2; }

python3 - "$PLAN" <<'PYEOF'
import json, sys

d = json.load(open(sys.argv[1], encoding='utf-8'))

# Support plans[] list: read latest plan's actions
plans = d.get('plans', [])
plan_count = len(plans)

if plans:
    latest = plans[-1]
    actions = latest.get('actions', [])
    no_reason = latest.get('noActionReason') or ''
    plan_phase = latest.get('phase', 'assess')
    has_deferred = 1 if latest.get('deferredActions') else 0
else:
    # Legacy flat format
    actions = d.get('actions', [])
    no_reason = d.get('noActionReason') or ''
    plan_phase = 'assess'
    has_deferred = 0

cn = d.get('caseNumber', '')
status = d.get('actualStatus', 'researching')
days = d.get('daysSinceLastContact', 0)

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
print(f'HAS_DEFERRED={has_deferred}')
print(f'PLAN_PHASE="{plan_phase}"')
print(f'PLAN_COUNT={plan_count}')

for i, a in enumerate(actions):
    print(f'ACTION_{i}_TYPE="{a["type"]}"')
    print(f'ACTION_{i}_PRIORITY={a.get("priority", 99)}')
    print(f'ACTION_{i}_STATUS="{a.get("status", "pending")}"')
    print(f'ACTION_{i}_EMAIL_TYPE="{a.get("emailType", "auto")}"')
    print(f'ACTION_{i}_DEPENDS_ON="{a.get("dependsOn", "")}"')
PYEOF
```

- [ ] **Step 2: Test with plans[] format**

```bash
cd /c/Users/fangkun/Documents/Projects/EngineerBrain/src
mkdir -p /tmp/test-read-plan/.casework
cat > /tmp/test-read-plan/.casework/execution-plan.json << 'EOF'
{
  "caseNumber": "2601290030000748",
  "currentPhase": "assess",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 2,
  "actions": [{"type": "troubleshooter", "status": "pending"}],
  "plans": [
    {
      "phase": "assess",
      "timestamp": "2026-04-19T10:00:00Z",
      "actualStatus": "pending-engineer",
      "actions": [{"type": "troubleshooter", "status": "pending"}],
      "deferredActions": ["email-drafter"],
      "routingSource": "llm"
    }
  ]
}
EOF
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh /tmp/test-read-plan/.casework/execution-plan.json)
echo "CASE=$CASE_NUMBER STATUS=$ACTUAL_STATUS ACTIONS=$ACTION_COUNT DEFERRED=$HAS_DEFERRED PHASE=$PLAN_PHASE PLANS=$PLAN_COUNT"
```

Expected: `CASE=2601290030000748 STATUS=pending-engineer ACTIONS=1 DEFERRED=1 PHASE=assess PLANS=1`

- [ ] **Step 3: Test with legacy flat format**

```bash
cat > /tmp/test-read-plan/.casework/execution-plan.json << 'EOF'
{
  "caseNumber": "2601290030000748",
  "actualStatus": "pending-customer",
  "daysSinceLastContact": 5,
  "actions": [{"type": "email-drafter", "emailType": "follow-up", "status": "pending"}],
  "noActionReason": null,
  "routingSource": "llm"
}
EOF
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh /tmp/test-read-plan/.casework/execution-plan.json)
echo "CASE=$CASE_NUMBER STATUS=$ACTUAL_STATUS ACTIONS=$ACTION_COUNT DEFERRED=$HAS_DEFERRED PHASE=$PLAN_PHASE PLANS=$PLAN_COUNT"
```

Expected: `CASE=2601290030000748 STATUS=pending-customer ACTIONS=1 DEFERRED=0 PHASE=assess PLANS=0`

- [ ] **Step 4: Clean up and commit**

```bash
rm -rf /tmp/test-read-plan
git add .claude/skills/casework/act/scripts/read-plan.sh
git commit -m "feat: read-plan.sh supports plans[] list and deferred actions"
```

---

### Task 5: reassess SKILL.md — Create reassess sub-skill

**Files:**
- Create: `.claude/skills/casework/reassess/SKILL.md`

- [ ] **Step 1: Write the complete reassess SKILL.md**

```bash
cat > .claude/skills/casework/reassess/SKILL.md << 'SKILLEOF'
---
description: "Reassess — 读取 troubleshooter 结论，分类 fact/analysis 落盘，LLM 决策沟通行动，写 execution-plan phase 2"
name: casework:reassess
displayName: 排查后再评估
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run reassess for Case {caseNumber}. Read .claude/skills/casework/reassess/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
---

# /casework:reassess — Reassess After Troubleshooter

基于 troubleshooter 排查结论，将发现分类为 fact/analysis 落盘到 case 文件，然后 LLM 决策具体沟通行动（email 类型 / ICM 升级 / POD 转移），写入 execution-plan.json phase 2。

## 输入契约

- `{caseDir}/.casework/claims.json` — 必须存在且含 `conclusion` 字段（troubleshooter v2 产物）
- `{caseDir}/analysis/*.md` — 分析报告（troubleshooter 产物）
- `{caseDir}/.casework/execution-plan.json` — plans[0] = assess 结果
- `{caseDir}/casework-meta.json` — 累计元数据
- `{caseDir}/emails.md` — 邮件去重检查

## 输出契约

- `{caseDir}/.casework/execution-plan.json` — append plans[1] (reassess phase)
- `{caseDir}/casework-meta.json` — upsert `investigationFindings`
- `{caseDir}/case-summary.md` — 追加「排查发现」section（fact/analysis 分类）
- `{caseDir}/.casework/reassess-decision.json` — 决策审计轨迹（临时，供 act 读取）

## 执行步骤

### Step 1. 读取 troubleshooter 产出

```bash
CLAIMS="{caseDir}/.casework/claims.json"
if [ ! -f "$CLAIMS" ]; then
  echo "ERROR: claims.json not found — troubleshooter did not complete" >&2
  exit 2
fi

# 验证 conclusion 存在
HAS_CONCLUSION=$(python3 -c "
import json
c = json.load(open(r'$CLAIMS', encoding='utf-8'))
print('1' if c.get('conclusion') else '0')
")
if [ "$HAS_CONCLUSION" = "0" ]; then
  echo "ERROR: claims.json missing conclusion block — troubleshooter version too old" >&2
  exit 2
fi
```

读取 claims.json 获取：
- `conclusion.type` / `conclusion.summary` / `conclusion.confidence`
- `conclusion.suggestedNextAction` / `conclusion.missingInfo`
- `conclusion.scopeAssessment` / `conclusion.outOfScopeTarget`
- `claims[]` 中所有 `type: root-cause` 和 `type: observation` 的 claim

读取最新 `analysis/*.md` 分析报告（按修改时间倒序取第一个）。

### Step 2. Fact/Analysis 分类落盘

从 claims 和分析报告中提取事实和推断，分类持久化。

**分类规则**：
| 来源 | 判据 | 分类 |
|------|------|------|
| claim.type = `observation` + confidence ≥ medium | 客观观测数据 | `[fact]` |
| claim.type = `root-cause` + confidence = high | 多源交叉验证的结论 | `[fact]` |
| claim.type = `root-cause` + confidence ≤ medium | 单源或推测结论 | `[analysis]` |
| claim.type = `cause-chain` | 因果推理链 | `[analysis]` |
| claim.type = `recommendation` | 建议方案 | `[analysis]` |
| claim.type = `impact` | 影响判断 | `[analysis]` |

**写入 case-summary.md**：

如果 case-summary.md 已存在「排查发现」section，替换内容；否则在文件末尾追加。

```markdown
## 排查发现（Troubleshooter Findings）
> 最后更新：{ISO timestamp}
> 来源：{analysisRef}

### [fact] 已确认事实
- {observation/root-cause(high) claim 1}（来源：{evidence.source}）
- {observation/root-cause(high) claim 2}（来源：{evidence.source}）

### [analysis] 分析推断
- {root-cause(medium/low) claim}（confidence: {level}）
- {cause-chain claim}（confidence: {level}）
- {recommendation claim}

### 排查结论
- **类型**: {conclusion.type}
- **置信度**: {conclusion.confidence}
- **摘要**: {conclusion.summary}
- **缺失信息**: {conclusion.missingInfo or "无"}
- **范围评估**: {conclusion.scopeAssessment}
```

**写入 casework-meta.json**：

upsert `investigationFindings` 字段：
```json
{
  "investigationFindings": {
    "lastUpdated": "ISO",
    "conclusionType": "found-cause",
    "conclusionConfidence": "high",
    "factCount": 3,
    "analysisCount": 2,
    "scopeAssessment": "in-pod"
  }
}
```

### Step 3. 邮件去重检查

读取 `{caseDir}/emails.md`，检查工程师已发送的邮件类型（复用 assess 的去重规则）：
- 已发过 result-confirm 类邮件 → 不再推荐
- 已发过 request-info 且 < 3 天 → 不再推荐
- `{caseDir}/drafts/` 有未发送草稿且内容仍相关 → 推荐 no-action

### Step 4. LLM 决策

**Prompt**：

```
你是 D365 Case 沟通行动决策助手。基于 troubleshooter 排查结论，决定下一步沟通行动。

## 排查结论
{conclusion JSON}

## 关键发现摘要
### [fact]
{fact claims list}

### [analysis]
{analysis claims list}

## 已发送邮件（去重参考）
{emails summary — 工程师已发的邮件类型和日期}

## 未发送草稿
{drafts/ 目录下的文件列表和简述，如有}

## 决策规则（必须遵守）

1. conclusion.type = found-cause + confidence = high
   → email-drafter(result-confirm)
2. conclusion.type = found-cause + confidence = medium
   → email-drafter(result-confirm)
   → 在 warnings 中标注 "建议用户 /challenge 复核"
3. conclusion.type = found-cause + confidence = low
   → email-drafter(request-info)
   → missingInfo: 需要客户确认的关键假设
4. conclusion.type = need-info
   → email-drafter(request-info)
   → missingInfo 直接传入
5. conclusion.type = exhausted
   → actions=[]
   → noActionReason="exhausted-recommend-icm"
   → warnings: ["排查穷尽，建议开 ICM escalate 到 PG"]
6. conclusion.type = out-of-scope
   → actions=[]
   → noActionReason="out-of-scope-recommend-transfer"
   → warnings: ["非本 POD 范围，建议 AR 到 {outOfScopeTarget}"]
7. conclusion.type = partial
   → email-drafter(request-info)
   → missingInfo: 列出需要的具体信息

## 邮件去重约束
- 已发过同类型邮件 → 不推荐重复发送
- 有未发送相关草稿 → actions=[], noActionReason="unsent draft exists"

## 输出（纯 JSON，无 markdown 包裹）
{
  "actions": [...],
  "noActionReason": "<string or null>",
  "routingSource": "reassess-llm",
  "conclusion": {conclusion object — 透传},
  "warnings": ["..."]
}
```

### Step 5. 写 execution-plan phase 2

将 LLM 决策写入临时文件，调用 `write-execution-plan.py --phase reassess`：

```bash
echo "$LLM_JSON" > "{caseDir}/.casework/reassess-decision.json"
python3 .claude/skills/casework/assess/scripts/write-execution-plan.py \
  --decision "{caseDir}/.casework/reassess-decision.json" \
  --case-dir "{caseDir}" \
  --phase reassess
```

### Step 6. 更新 state + Completion signal

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step reassess --status completed \
  --case-number "{caseNumber}"

echo "REASSESS_OK|conclusion={conclusion_type}|actions={N}|elapsed=${SECONDS}s"
```

## Safety Redlines

- ❌ 不调 D365 写操作
- ❌ 不发邮件
- ❌ 不修改 claims.json（只读消费）
- ✅ 只写 execution-plan、case-summary、casework-meta

## Error Handling

| 场景 | 行为 |
|------|------|
| claims.json 不存在 | exit 2，提示 troubleshooter 未完成 |
| claims.json 无 conclusion | exit 2，提示 troubleshooter 版本过旧 |
| LLM 返回非法 JSON | 写 reassess-decision.json 失败 → exit 2 |
| 邮件去重后 actions 为空 | 正常：noActionReason 说明原因 |
SKILLEOF
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/reassess/SKILL.md
git commit -m "feat: create reassess sub-skill for post-troubleshooter decision making"
```

---

### Task 6: assess SKILL.md — Add deferredActions for troubleshooter cases

**Files:**
- Modify: `.claude/skills/casework/assess/SKILL.md:186-232`

- [ ] **Step 1: Update LLM prompt output schema**

In the Step 4 prompt template (around line 180), update the JSON output schema. Find the `## 输出（纯 JSON，无 markdown 包裹）` section and replace it with:

```markdown
## 输出（纯 JSON，无 markdown 包裹）
{
  "caseNumber": "{caseNumber}",
  "actualStatus": "<one of: pending-engineer|pending-customer|pending-pg|researching|ready-to-close|resolved|closed>",
  "daysSinceLastContact": <int — 距工程师最后发出邮件的天数>,
  "statusReasoning": "<≤200字，关键依据 → {actualStatus}>",
  "actions": [
    // 允许的 type: troubleshooter / email-drafter / challenger / note-gap / labor-estimate
    // 允许的 status: pending
    // ⚠️ 新规则：当 actions 包含 troubleshooter 时，email-drafter 不在此处输出。
    //    改为设置 deferredActions: ["email-drafter"]，email 类型由 reassess 步骤根据排查结论决定。
    //    例外：IR-first 路径（new case + initial-response）仍在此处输出 email-drafter(initial-response)，
    //    因为 IR 先发不需要等排查结论。
    // email-drafter 需额外字段 "emailType"（仅不含 troubleshooter 的场景 + IR-first 场景使用）：
    //   - initial-response: 首次回复客户（IR-first 路径专用）
    //   - 21v-convert-ir: 21V 转 IR
    //   - request-info: 向客户请求更多信息
    //   - result-confirm: 排查完成，向客户确认结果
    //   - follow-up: 跟进邮件
    //   - closure-confirm: 询问客户是否可以关单
    //   - closure: 发送关单总结邮件
  ],
  "deferredActions": ["email-drafter"] | [],
  // ⚠️ 当 actions 包含 troubleshooter 时，必须设 deferredActions: ["email-drafter"]
  //    当不含 troubleshooter 时，设 deferredActions: []
  "deferReason": "<string — 为什么 defer，如 'email type TBD after troubleshoot reassess'> | null",
  "noActionReason": "<string or null>",
  "routingSource": "llm"
}
```

- [ ] **Step 2: Update decision rules comment**

Find the `决策规则（判定优先级）` section (around line 206) and update rule 2 and 6:

```markdown
决策规则（判定优先级）：
1. compliance.entitlementOk === false → actualStatus=ready-to-close, actions=[]
2. 客户最新回复后 < 1 day + 无工程师后续 → pending-engineer + troubleshooter, deferredActions=["email-drafter"]
   （email 类型由 reassess 根据排查结论决定）
3. 工程师发出 follow-up 后 > 3 days 无客户回复 → pending-customer + email-drafter(follow-up)
   （无 troubleshooter → 不 defer）
4. ICM 有 PG 新 entry 且 PG 仍在处理 → pending-pg：
   - daysSinceLastContact < 5 → actions=[]
   - daysSinceLastContact ≥ 5 → actions=[email-drafter(follow-up)]
5. actualStatus=ready-to-close → 分流 closure vs closure-confirm（无 troubleshooter → 不 defer）
6. 其余（数据不足 / 正在排查） → researching + troubleshooter, deferredActions=["email-drafter"]
```

- [ ] **Step 3: Update actions guidance comment**

Find `**actions 推理指导**` section (around line 217) and add:

```markdown
7. 有 troubleshooter action → 必须设 deferredActions=["email-drafter"]
   → 唯一例外：IR-first（new + initial-response）同时输出 troubleshooter + email-drafter(initial-response)
   → IR-first 时 deferredActions=["email-drafter"]（reassess 仍决定第二封邮件）
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/assess/SKILL.md
git commit -m "feat: assess adds deferredActions when troubleshooter present"
```

---

### Task 7: act SKILL.md — Add reassess spawn logic

**Files:**
- Modify: `.claude/skills/casework/act/SKILL.md`

- [ ] **Step 1: Update Step 1 — Parse plan with new variables**

Find Step 1 (line 38) and update:

```markdown
### Step 1. 解析 execution-plan.json

\`\`\`bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}/.casework/execution-plan.json")
# 注入: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT, IR_FIRST,
#       ACTION_{i}_TYPE, ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON,
#       NO_ACTION_REASON, HAS_DEFERRED, PLAN_PHASE, PLAN_COUNT
\`\`\`

如 `ACTION_COUNT == 0`：
- 记日志 `ACT_OK|actions=0|reason=$NO_ACTION_REASON|elapsed=0s`
- 直接退出，不进 Step 2
```

- [ ] **Step 2: Rewrite Step 3a — IR-first path with reassess**

Find Step 3a (line 88) and replace the entire IR-first section:

```markdown
#### 3a. IR-first 路径（`IR_FIRST == 1`）

适用条件：`actualStatus ∈ {new, pending-engineer}` 且 actions 同时含 troubleshooter + email-drafter(initial-response)。

**执行顺序**：
1. **先 spawn email-drafter(initial-response)（前台）** — 尽快产出 IR 草稿
2. email-drafter 完成 → 展示 IR 草稿给用户
3. **spawn troubleshooter（前台）** — 完整排查
4. troubleshooter 完成 → **spawn reassess（前台）** — 基于排查结论决策第二封邮件
5. reassess 完成 → 读取 updated execution-plan.json
6. 如 reassess 产出 email-drafter action → **spawn email-drafter（前台）** — 第二封邮件
7. 如 reassess 无 action（exhausted/out-of-scope）→ 跳过，todo 中标记建议

\`\`\`
# IR-first Step 1: email-drafter(IR) 前台
Agent(
  subagent_type: "email-drafter",
  description: "IR email for {caseNumber}",
  run_in_background: false,
  prompt: |
    Case {caseNumber}，caseDir={caseDir}。
    emailType=initial-response, language=auto, recipient=customer。
    读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
)

# IR-first Step 2: troubleshooter 前台（不再后台，因为要等结果做 reassess）
Agent(
  subagent_type: "troubleshooter",
  description: "troubleshooter {caseNumber}",
  run_in_background: false,
  prompt: |
    Case {caseNumber}，caseDir={caseDir}。
    读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
)

# IR-first Step 3: reassess 前台
Agent(
  subagent_type: "casework",
  description: "reassess {caseNumber}",
  run_in_background: false,
  prompt: |
    仅执行 reassess for Case {caseNumber}。caseDir={caseDir}。
    请读取 .claude/skills/casework/reassess/SKILL.md 获取完整执行步骤。
    只做 reassess（读 claims.json → 分类落盘 → LLM 决策 → 写 plan phase 2），不做其他步骤。
)

# IR-first Step 4: 检查 reassess 结果，按需 spawn 第二封邮件
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}/.casework/execution-plan.json")
# 现在 read-plan 读到的是 reassess 产出的 phase 2 actions
if [ "$ACTION_COUNT" -gt 0 ]; then
  for i in $(seq 0 $((ACTION_COUNT-1))); do
    TYPE_VAR="ACTION_${i}_TYPE"
    EMAIL_TYPE_VAR="ACTION_${i}_EMAIL_TYPE"
    TYPE="${!TYPE_VAR}"
    EMAIL_TYPE="${!EMAIL_TYPE_VAR}"
    if [ "$TYPE" = "email-drafter" ]; then
      Agent(
        subagent_type: "email-drafter",
        description: "post-reassess email {caseNumber}",
        run_in_background: false,
        prompt: |
          Case {caseNumber}，caseDir={caseDir}。
          emailType=${EMAIL_TYPE}, language=auto, recipient=customer。
          读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
      )
    fi
  done
fi
\`\`\`
```

- [ ] **Step 3: Rewrite Step 3b — Standard path with reassess**

Find Step 3b (line 126) and replace:

```markdown
#### 3b. 标准路径（`IR_FIRST == 0`）

按 priority 排序，逐个执行 action。当 `HAS_DEFERRED == 1` 时，troubleshooter 完成后 spawn reassess。

\`\`\`
for i in 0..(ACTION_COUNT-1):
  TYPE = ACTION_{i}_TYPE
  DEPENDS = ACTION_{i}_DEPENDS_ON

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

      # troubleshooter 完成后：如有 deferred actions，spawn reassess
      if HAS_DEFERRED == 1:
        Agent(
          subagent_type: "casework",
          description: "reassess {caseNumber}",
          run_in_background: false,
          prompt: |
            仅执行 reassess for Case {caseNumber}。caseDir={caseDir}。
            请读取 .claude/skills/casework/reassess/SKILL.md 获取完整执行步骤。
            只做 reassess，不做其他步骤。
        )

        # 读取 reassess 结果，执行 phase 2 actions
        eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}/.casework/execution-plan.json")
        for j in 0..(ACTION_COUNT-1):
          RTYPE = ACTION_{j}_TYPE
          REMAIL_TYPE = ACTION_{j}_EMAIL_TYPE
          if RTYPE == "email-drafter":
            Agent(
              subagent_type: "email-drafter",
              description: "post-reassess email {caseNumber}",
              run_in_background: false,
              prompt: |
                Case {caseNumber}，caseDir={caseDir}。
                emailType=${REMAIL_TYPE}, language=auto, recipient=customer。
                读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
            )

    "email-drafter":
      # 仅非 deferred 场景（follow-up / closure 等，无 troubleshooter）
      Agent(
        subagent_type: "email-drafter",
        description: "email {caseNumber}",
        run_in_background: false,
        prompt: |
          Case {caseNumber}，caseDir={caseDir}。
          emailType={ACTION_{i}_EMAIL_TYPE}, language=auto, recipient=customer。
          读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
      )

    "challenger" | "note-gap" | "labor-estimate":
      skip
\`\`\`
```

- [ ] **Step 4: Update Step 3c — Challenge Gate comment**

The challenge gate (line 217) stays the same — it still reads claims.json after troubleshooter. No changes needed.

- [ ] **Step 5: Update the routing reference table**

Find the `## 路由参考表` section (line 245) and update:

```markdown
## 路由参考表（assess LLM 输出 → act spawn）

| actualStatus | assess actions | act 行为 |
|---|---|---|
| `pending-engineer`（新 case） | troubleshooter + email-drafter(IR) | IR-first: email(IR,fg) → ts(fg) → reassess(fg) → email(phase2,fg) |
| `pending-engineer`（已有 IR） | troubleshooter, deferred=[email-drafter] | ts(fg) → reassess(fg) → email(phase2,fg) |
| `pending-customer` (days≥3) | email-drafter(follow-up) | email(fg) — 无 reassess |
| `pending-pg` (days<5) | [] | 无 action，等 PG |
| `pending-pg` (days≥5) | email-drafter(follow-up) | email(fg) — 无 reassess |
| `researching` | troubleshooter, deferred=[email-drafter] | ts(fg) → reassess(fg) → email(phase2,fg) |
| `ready-to-close` | email-drafter(closure/closure-confirm) | email(fg) — 无 reassess |
```

- [ ] **Step 6: Update Safety Redlines**

Replace the existing safety redlines:

```markdown
## Safety Redlines

- ❌ 不直接发邮件（email-drafter 产出只写到 drafts/）
- ❌ 不自动 spawn challenger（改为手动 `/challenge`）
- ❌ patrol mode 不 spawn 任何 agent（depth=1 限制）
- ✅ IR-first troubleshooter 前台 spawn（等待结果做 reassess）
- ✅ reassess 完成后按结论类型 spawn email-drafter 或跳过
```

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/casework/act/SKILL.md
git commit -m "feat: act spawns reassess after troubleshooter, IR-first runs full cycle"
```

---

### Task 8: casework SKILL.md — Update orchestrator description

**Files:**
- Modify: `.claude/skills/casework/SKILL.md:99-109`

- [ ] **Step 1: Update Step 3 description**

Find the Step 3 section (line 93, `### Step 3. Act`) and update the description:

```markdown
### Step 3. Act

\`\`\`bash
ACT_START=$(date -u +%FT%TZ)
ACT_START_NS=$(date +%s%N)

# Pipeline state → dashboard SSE (Step 3 active)
python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --status active
\`\`\`

读取 `.claude/skills/casework/act/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：解析 `output/execution-plan.json` → actions=0 则跳过 → IR-first 规则 → 按需 spawn troubleshooter → **如有 deferred actions 则 spawn reassess（读 claims.json.conclusion → fact/analysis 落盘 → LLM 决策 phase 2 actions）→ 按 reassess 结果 spawn email-drafter** → challenge gate。

**无 troubleshooter 的场景**（follow-up / closure）：assess 直接决定 email 类型，不经 reassess。
```

- [ ] **Step 2: Update Mode comparison table**

Find the mode comparison table (line 151) and update:

```markdown
## Mode 对比

| | mode=full (depth=0) | mode=patrol (depth=1) |
|---|---|---|
| 调用者 | 用户 `/casework` | patrol spawn |
| 执行范围 | Step 1→2→3→4→5 | Step 1→2 only |
| Step 2 enrichment | 可选 spawn subagent 加速 | inline |
| Step 3 act | 自己 spawn agent（含 reassess） | 不执行，patrol 主 agent 做 |
| Step 3 reassess | troubleshooter 后 spawn reassess → phase 2 email | patrol 主 agent 做 |
| Step 4 summarize | 自己 inline 执行 | 不执行，patrol spawn summarize |
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "feat: update casework orchestrator to document reassess flow"
```

---

### Task 9: Spec document — Write design spec

**Files:**
- Create: `docs/superpowers/specs/2026-04-19-reassess-feedback-loop.md`

- [ ] **Step 1: Write the spec**

Create `docs/superpowers/specs/2026-04-19-reassess-feedback-loop.md` with the full design from the conversation, including:

- Problem statement (assess guesses email type before troubleshooter)
- Solution (reassess step after troubleshooter)
- execution-plan.json plans[] schema
- Troubleshooter conclusion block
- Reassess sub-skill overview
- casework full mode flow changes
- IR-first path changes
- Patrol pipeline changes (P3, deferred)
- File change list
- Implementation phases

```markdown
# Reassess Feedback Loop — Post-Troubleshooter Decision Making

**Date:** 2026-04-19
**Status:** Design approved, P0-P2 implementing

## Problem

Current casework flow: `assess → act(troubleshooter + email-drafter) → summarize`

The assess step decides email type BEFORE troubleshooter runs. This is a prediction,
not a data-driven decision. After troubleshooter completes, new findings should feed back
to determine the actual communication action:

| Troubleshooter Conclusion | Should Do |
|---------------------------|-----------|
| Found root cause (high confidence) | email-drafter(result-confirm) |
| Need customer info to verify | email-drafter(request-info) |
| Investigation exhausted | Recommend ICM escalation |
| Out of POD scope | Recommend AR transfer |
| Partial findings | email-drafter(request-info) + continue next cycle |

For standalone `/casework`, the main agent has full context to make this judgment inline.
For patrol, the linear pipeline (gathering → executing → inspecting → done) has no
re-evaluation after troubleshooter — it directly spawns the pre-decided email-drafter.

## Solution

### 1. execution-plan.json becomes plans[] list

Each phase (assess, reassess) appends an entry. Top-level fields reflect latest plan
for backward compatibility.

```json
{
  "caseNumber": "...",
  "currentPhase": "reassess",
  "actualStatus": "pending-engineer",
  "actions": [...],
  "plans": [
    { "phase": "assess", "timestamp": "...", "actions": [...], "deferredActions": ["email-drafter"] },
    { "phase": "reassess", "timestamp": "...", "conclusion": {...}, "actions": [...] }
  ]
}
```

### 2. Troubleshooter outputs `conclusion` block in claims.json

Structured conclusion from Step 4c synthesis: type, summary, confidence,
suggestedNextAction, missingInfo, scopeAssessment, outOfScopeTarget.

### 3. New `reassess` sub-skill

Reads claims.json.conclusion → classifies findings as fact/analysis → persists to
case-summary.md → LLM decides communication action → writes execution-plan phase 2.

### 4. Assess defers email-drafter when troubleshooter present

Only cases with troubleshooter set `deferredActions: ["email-drafter"]`.
Pure follow-up/closure flows are unchanged — assess directly decides email type.

Exception: IR-first (new case + initial-response) still outputs email-drafter(initial-response)
in assess actions, because IR is sent immediately without waiting for troubleshooter.

### 5. IR-first path runs full cycle

1. email-drafter(IR) → IR draft to engineer ASAP
2. troubleshooter → full investigation
3. reassess → decide second email based on findings
4. email-drafter(phase2) → second draft if applicable

### 6. casework full mode flow

```
refresh → assess → act {
  if IR-first: email(IR) → troubleshooter → reassess → email(phase2)
  elif has-troubleshooter + deferred: troubleshooter → reassess → email(phase2)
  else: email(assess-decided-type)
} → summarize
```

### 7. Patrol pipeline changes (P3 — deferred)

New state machine phases: investigating → reassessing → communicating.
Will align with patrol-ui-redesign spec's dynamic agent cards in Act step.
Deferred until patrol-ui-redesign completes.

## Implementation Phases

| Phase | Content | Status |
|-------|---------|--------|
| P0 | claims-schema + troubleshooter conclusion output | Implementing |
| P1 | reassess SKILL.md + write-execution-plan.py plans[] | Implementing |
| P2 | casework act + assess deferredActions | Implementing |
| P3 | patrol pipeline (after patrol-ui-redesign) | Deferred |
| P4 | Dashboard Act agent cards | Deferred |
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-19-reassess-feedback-loop.md
git commit -m "docs: reassess feedback loop design spec"
```

---

## Deferred Work (P3 — Patrol Pipeline)

> Blocked by: patrol-ui-redesign (another session)

When patrol-ui-redesign completes, update `patrol/SKILL.md` with:

- New phases: `ir-drafting`, `investigating`, `reassessing`, `communicating`
- In `executing` → split into sub-phases
- Act agent cards in state.json support `reassess` type + `subtype` field
- Process stage live text shows reassess decisions
- patrol-progress.json `currentAction` includes reassess events
