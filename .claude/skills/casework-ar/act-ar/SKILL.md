---
description: "AR Step 3 Act — AR 路由表（internal/customer-facing 双模式 spawn）"
name: casework-ar:act-ar
displayName: AR 行动执行
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run AR act for Case {caseNumber}. Read .claude/skills/casework-ar/act-ar/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Agent
---

# /casework-ar:act-ar — AR Step 3 Act

基于 `.casework/execution-plan.json` 执行 AR 行动。与主 act 的区别：spawn prompt 包含 AR scope + communicationMode，收件人根据沟通模式选择 case owner 或客户。

## 输入契约

- `{caseDir}/.casework/execution-plan.json` — Step 2 产物
- `{caseDir}/casework-meta.json` — 含 `ar.scope`, `ar.communicationMode`, `ar.caseOwnerEmail`

## 输出契约

- `{caseDir}/analysis/*.md` — troubleshooter 产出（AR scope 内）
- `{caseDir}/drafts/*.md` — email-drafter 产出
- `{caseDir}/.casework/pipeline-state.json` — 更新

## 执行步骤

### Step 1. 解析 execution-plan.json

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}/.casework/execution-plan.json")
```

ACTION_COUNT == 0 → 直接退出。

### Step 2. 读取 AR context

```bash
AR_SCOPE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('scope','unknown'))")
AR_MODE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('communicationMode','internal'))")
AR_OWNER_EMAIL=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('caseOwnerEmail',''))")
MAIN_CASE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('mainCaseId',''))")
```

### Step 3. 执行 actions（AR spawn 模板）

#### troubleshooter spawn（AR）

```
Agent(
  subagent_type: "troubleshooter",
  description: "troubleshooter AR {caseNumber}",
  run_in_background: false,
  prompt: |
    AR Case {caseNumber}，caseDir={caseDir}。
    AR Scope: {AR_SCOPE}
    沟通模式: {AR_MODE}
    Main Case: {MAIN_CASE}
    请只排查 AR scope 范围内的问题，不要排查 main case 的其他问题。
    读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
)
```

#### email-drafter spawn（AR — 根据 communicationMode 选收件人）

**内部模式** (`AR_MODE = "internal"`)：
```
Agent(
  subagent_type: "email-drafter",
  description: "email AR {caseNumber}",
  run_in_background: false,
  prompt: |
    AR Case {caseNumber}，caseDir={caseDir}。
    AR Scope: {AR_SCOPE}
    沟通模式: internal
    收件人: {AR_OWNER_EMAIL}（case owner）
    recipient=internal
    邮件发给 case owner，总结 AR scope 内的发现和建议。
    读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
)
```

**客户面向模式** (`AR_MODE = "customer-facing"`)：
```
Agent(
  subagent_type: "email-drafter",
  description: "email AR {caseNumber}",
  run_in_background: false,
  prompt: |
    AR Case {caseNumber}，caseDir={caseDir}。
    AR Scope: {AR_SCOPE}
    沟通模式: customer-facing
    收件人: customer（reply-all from main case）
    CC: {AR_OWNER_EMAIL}（case owner）
    recipient=customer
    邮件发给客户，仅回复 AR scope 内的问题。CC case owner。
    读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
)
```

### Step 4. Pipeline state + Completion

```bash
python3 .claude/skills/casework/act/scripts/update-pipeline-state.py \
  --case-dir "{caseDir}" --step "act" --status "completed" \
  --case-number "$CASE_NUMBER"

echo "ACT_AR_OK|actions=$ACTION_COUNT|mode=$AR_MODE|elapsed=${SECONDS}s"
```

## AR 路由参考表

| actualStatus | communicationMode | 典型 actions |
|---|---|---|
| `new` | any | troubleshooter → email-drafter |
| `pending-engineer` | `internal` | troubleshooter → email-drafter(to case owner) |
| `pending-engineer` | `customer-facing` | troubleshooter → email-drafter(to customer, AR scope only) |
| `pending-customer` (days<3) | any | [] |
| `pending-customer` (days≥3) | `internal` | email-drafter(follow-up to case owner) |
| `pending-customer` (days≥3) | `customer-facing` | email-drafter(follow-up to customer) |
| `pending-pg` | any | [] |
| `researching` | any | troubleshooter |
| `ready-to-close` | `internal` | email-drafter(AR 完成总结 to case owner) |
| `ready-to-close` | `customer-facing` | email-drafter(AR scope 结论 to customer, CC owner) |

## Safety Redlines

- ❌ 不直接发邮件
- ❌ patrol mode 不 spawn
- ✅ AR scope 限定：troubleshooter 只排查 scope 内问题
- ✅ 收件人由 communicationMode 决定，不硬编码
