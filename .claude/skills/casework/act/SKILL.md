---
description: "Step 2 Act v4 — 内含执行链：assess → troubleshooter → challenger(inline) → reassess(inline) → email-drafter(inline)"
name: casework:act
displayName: Case 行动执行
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run Step 2 (act) for Case {caseNumber}. Read .claude/skills/casework/act/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Agent
---

# /casework:act — Step 2 Act

v4 执行链编排器。先执行 assess（作为第一个 action），产出 `execution-plan.json`，然后按 plan 执行后续 actions。所有 troubleshooter case 完成后必经 challenger gate(inline) → reassess(inline) → email-drafter(inline)。

## 输入契约

- `{caseDir}/.casework/execution-plan.json` — 必须存在（Step 2 成功产物）
- `{caseDir}/case-info.md` — D365 snapshot（agent 前置条件）
- `{caseDir}/emails.md` — 邮件（agent 前置条件）
- `{caseDir}/casework-meta.json` — AR case 时需含 `ar.scope`、`ar.communicationMode`、`ar.caseOwnerEmail`、`mainCaseId`

## 输出契约

- `{caseDir}/analysis/*.md` — troubleshooter 产出
- `{caseDir}/.casework/claims.json` — troubleshooter 证据链
- `{caseDir}/drafts/*.md` — email-drafter 产出
- `{caseDir}/.casework/pipeline-state.json` — 更新 Step 3 各 action 状态

## 执行步骤

### Phase 0. Assess（执行链第一环）

assess 现在是 act 的内部 action，用 action 级别状态汇报。

```bash
# Mark assess action active in state.json
python3 .claude/skills/casework/scripts/update-state.py --case-dir "{caseDir}" --step act --action assess --status active
```

读取 `.claude/skills/casework/assess/SKILL.md` 获取完整执行步骤，然后执行。

核心流程：DELTA_EMPTY 快速路径（零 LLM）→ compliance hash gate → Teams/OneNote enrichment → 主 LLM 决策 actualStatus + actions → 写 `.casework/execution-plan.json`。

**Phase 0 完成后**更新 state：
```bash
# Resolve execution-plan.json path via state.json runId
EP_PATH=$(bash .claude/skills/casework/act/scripts/resolve-run-path.sh "{caseDir}" execution-plan.json 2>/dev/null || echo "{caseDir}/.casework/execution-plan.json")
# Mark assess action completed (auto-computes durationMs)
ASSESS_RESULT=$(python3 -c "import json; print(json.load(open('$EP_PATH')).get('actualStatus','unknown'))" 2>/dev/null || echo "unknown")
ASSESS_REASONING=$(python3 -c "import json; ep=json.load(open('$EP_PATH')); print((ep.get('reasoning') or ep.get('statusReasoning') or '')[:200])" 2>/dev/null || echo "")
python3 .claude/skills/casework/scripts/update-state.py --case-dir "{caseDir}" --step act --action assess --status completed --result "$ASSESS_RESULT" --detail "$ASSESS_REASONING"
```

### Step 1. 解析 execution-plan.json

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}")
# 注入: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT, IR_FIRST,
#       ACTION_{i}_TYPE, ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON,
#       NO_ACTION_REASON, HAS_DEFERRED, PLAN_PHASE, PLAN_COUNT
```

如 `ACTION_COUNT == 0`：
- 记日志 `ACT_OK|actions=0|reason=$NO_ACTION_REASON|elapsed=0s`
- 直接退出，不进 Step 2

### Step 2.5. AR Context 读取（isAR=true 时）

```bash
IS_AR=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print('true' if m.get('isAR') else 'false')")

if [ "$IS_AR" = "true" ]; then
  AR_SCOPE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('scope','unknown'))")
  AR_MODE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('communicationMode','internal'))")
  AR_OWNER_EMAIL=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('ar',{}).get('caseOwnerEmail',''))")
  MAIN_CASE=$(python3 -c "import json; m=json.load(open(r'{caseDir}/casework-meta.json')); print(m.get('mainCaseId',''))")
fi
```

### Step 3. 执行 actions

按 priority 排序的 actions 逐个执行。**IR-first 拦截优先于 priority 排序。**

#### 3a. IR-first 路径（`IR_FIRST == 1`）

适用条件：`actualStatus ∈ {new, pending-engineer}` 且 actions 同时含 troubleshooter + email-drafter(initial-response)。

**执行顺序**：
1. **先 spawn email-drafter(initial-response)（前台）** — 尽快产出 IR 草稿
2. email-drafter 完成 → 展示 IR 草稿给用户
3. **spawn troubleshooter（前台）** — 完整排查
4. troubleshooter 完成 → **inline challenger gate**（Step 3c）— 检查 claims.json triggerChallenge
5. **inline reassess** — 读取 reassess/SKILL.md 执行，基于排查结论决策第二封邮件
6. reassess 完成 → 读取 updated execution-plan.json
7. 如 reassess 产出 email-drafter action → **inline email-drafter** — 第二封邮件
8. 如 reassess 无 action（exhausted/out-of-scope）→ 跳过，todo 中标记建议

```
# IR-first: email-drafter 前台
Agent(
  # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
  description: "IR email for {caseNumber}",
  run_in_background: false,
  prompt: |
    Case {caseNumber}，caseDir={caseDir}。
    emailType=initial-response, language=auto, recipient=customer。
    读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
)

# IR-first Step 2: troubleshooter 前台（不再后台，因为要等结果做 reassess）
Agent(
  # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
  description: "troubleshooter {caseNumber}",
  run_in_background: false,
  prompt: |
    Case {caseNumber}，caseDir={caseDir}。
    读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
)

# IR-first Step 2.5: challenger gate (inline) — 见 Step 3c
# 读取 claims.json → 检查 triggerChallenge → 如 true 则标记 challenge-pending

# IR-first Step 3: reassess (inline)
Agent(
  # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
  description: "reassess {caseNumber}",
  run_in_background: false,
  prompt: |
    仅执行 reassess for Case {caseNumber}。caseDir={caseDir}。
    请读取 .claude/skills/casework/reassess/SKILL.md 获取完整执行步骤。
    只做 reassess（读 claims.json → 分类落盘 → LLM 决策 → 写 plan phase 2），不做其他步骤。
)

# IR-first Step 4: 检查 reassess 结果，按需 spawn 第二封邮件
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}")
# 现在 read-plan 读到的是 reassess 产出的 phase 2 actions
if [ "$ACTION_COUNT" -gt 0 ]; then
  for i in $(seq 0 $((ACTION_COUNT-1))); do
    TYPE_VAR="ACTION_${i}_TYPE"
    EMAIL_TYPE_VAR="ACTION_${i}_EMAIL_TYPE"
    TYPE="${!TYPE_VAR}"
    EMAIL_TYPE="${!EMAIL_TYPE_VAR}"
    if [ "$TYPE" = "email-drafter" ]; then
      Agent(
        # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
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
```

#### 3b. 标准路径（`IR_FIRST == 0`）

按 priority 排序，逐个执行 action。**所有 troubleshooter case 完成后必经 challenger gate(inline) → reassess(inline) → email-drafter(inline)**。

```
for i in 0..(ACTION_COUNT-1):
  TYPE = ACTION_{i}_TYPE
  DEPENDS = ACTION_{i}_DEPENDS_ON

  # 检查依赖：如果有 dependsOn，检查被依赖的 action 是否已完成
  # （通过检查对应产物文件是否存在来判断）
  if DEPENDS == "troubleshooter" && ! -f "{caseDir}/.casework/claims.json":
    # 依赖未完成，跳过本 action（下次 casework 处理）
    continue

  match TYPE:
    "troubleshooter":
      Agent(
        # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
        description: "troubleshooter {caseNumber}",
        run_in_background: false,
        prompt: |
          Case {caseNumber}，caseDir={caseDir}。
          读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
      )
      # AR 分支：isAR=true 时使用以下 prompt 替代上方普通版
      # Agent(
      #   # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
      #   description: "troubleshooter AR {caseNumber}",
      #   run_in_background: false,
      #   prompt: |
      #     AR Case {caseNumber}，caseDir={caseDir}。
      #     AR Scope: {AR_SCOPE}
      #     沟通模式: {AR_MODE}
      #     Main Case: {MAIN_CASE}
      #     请只排查 AR scope 范围内的问题，不要排查 main case 的其他问题。
      #     读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。
      # )

      # troubleshooter 完成后：ALWAYS challenger gate → reassess → email
      # Step 1: challenger gate (inline) — 见 Step 3c
      # 读取 claims.json → 检查 triggerChallenge → 如 true 则标记 challenge-pending

      # Step 2: reassess (inline)
      # 读取 .claude/skills/casework/reassess/SKILL.md 获取完整执行步骤，然后执行
      Agent(
        # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
        description: "reassess {caseNumber}",
        run_in_background: false,
        prompt: |
          仅执行 reassess for Case {caseNumber}。caseDir={caseDir}。
          请读取 .claude/skills/casework/reassess/SKILL.md 获取完整执行步骤。
          只做 reassess，不做其他步骤。
      )

      # Step 3: 读取 reassess 结果，执行 phase 2 actions
      eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}")
      for j in 0..(ACTION_COUNT-1):
        RTYPE = ACTION_{j}_TYPE
        REMAIL_TYPE = ACTION_{j}_EMAIL_TYPE
        if RTYPE == "email-drafter":
          Agent(
            # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
            description: "post-reassess email {caseNumber}",
            run_in_background: false,
            prompt: |
              Case {caseNumber}，caseDir={caseDir}。
              emailType=${REMAIL_TYPE}, language=auto, recipient=customer。
              读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
          )

    "email-drafter":
      Agent(
        # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
        description: "email {caseNumber}",
        run_in_background: false,
        prompt: |
          Case {caseNumber}，caseDir={caseDir}。
          emailType={ACTION_{i}_EMAIL_TYPE}, language=auto, recipient=customer。
          读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
      )
      # AR 分支：isAR=true 时根据 communicationMode 选择 prompt
      #
      # AR internal 模式 (AR_MODE = "internal"):
      # Agent(
      #   # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
      #   description: "email AR {caseNumber}",
      #   run_in_background: false,
      #   prompt: |
      #     AR Case {caseNumber}，caseDir={caseDir}。
      #     AR Scope: {AR_SCOPE}
      #     沟通模式: internal
      #     收件人: {AR_OWNER_EMAIL}（case owner）
      #     recipient=internal
      #     邮件发给 case owner，总结 AR scope 内的发现和建议。
      #     读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
      # )
      #
      # AR customer-facing 模式 (AR_MODE = "customer-facing"):
      # Agent(
      #   # Note: SDK doesn't support custom subagent_type, use general-purpose (default)
      #   description: "email AR {caseNumber}",
      #   run_in_background: false,
      #   prompt: |
      #     AR Case {caseNumber}，caseDir={caseDir}。
      #     AR Scope: {AR_SCOPE}
      #     沟通模式: customer-facing
      #     收件人: customer（reply-all from main case）
      #     CC: {AR_OWNER_EMAIL}（case owner）
      #     recipient=customer
      #     邮件发给客户，仅回复 AR scope 内的问题。CC case owner。
      #     读取 .claude/agents/email-drafter.md 获取完整执行步骤，然后执行。
      # )

    "challenger":
      # challenger 已改为手动触发（/challenge {caseNumber}），act 自动流程不 spawn
      skip

    "note-gap" | "labor-estimate":
      # 纯脚本行为，由 Step 4 (summarize) 处理，act 跳过
      skip
```

#### 3c. Challenge Gate（troubleshooter 完成后触发）

```bash
if [ -f "{caseDir}/.casework/claims.json" ]; then
  TRIGGER=$(python3 -c "
import json
c = json.load(open(r'{caseDir}/.casework/claims.json', encoding='utf-8'))
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
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --status completed \
  --case-number "$CASE_NUMBER"

echo "ACT_OK|actions=$ACTION_COUNT|ir_first=$IR_FIRST|elapsed=${SECONDS}s"
```

## 路由参考表 v4（assess LLM 输出 → act 执行）

| actualStatus | assess actions | act 行为 |
|---|---|---|
| `pending-engineer`（新 case） | troubleshooter + email-drafter(IR) | IR-first: email(IR,inline) → ts(fg) → challenger(inline) → reassess(inline) → email(phase2,inline) |
| `pending-engineer`（已有 IR） | troubleshooter, deferred=[email-drafter] | ts(fg) → challenger(inline) → reassess(inline) → email(inline) |
| `pending-customer` (days≥3) | email-drafter(follow-up) | email(inline) |
| `pending-pg` (days<5) | [] | 无 action |
| `pending-pg` (days≥5) | email-drafter(follow-up) | email(inline) |
| `researching` | troubleshooter, deferred=[email-drafter] | ts(fg) → challenger(inline) → reassess(inline) → email(inline) |
| `ready-to-close` | email-drafter(closure/closure-confirm) | email(inline) |

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

## Safety Redlines

- ❌ 不直接发邮件（email-drafter 产出只写到 drafts/）
- ❌ 不自动 spawn challenger（改为手动 `/challenge`）
- ✅ All troubleshooter cases go through reassess — no HAS_DEFERRED branching
- ✅ IR-first troubleshooter 前台 spawn（等待结果做 reassess）
- ✅ reassess 完成后按结论类型 spawn email-drafter 或跳过

## Pitfalls (known)

- **Agent prompt 路径格式**：prompt 中的 `caseDir` 必须用相对路径（`./cases/active/{caseNumber}`），禁止 Windows 绝对路径（反斜杠被 Bash 转义）
- **IR-first troubleshooter + reassess 流程**：troubleshooter 前台完成后立即执行 challenger gate(inline) → reassess(inline)，reassess 决定第二封邮件类型，同一 cycle 内完成

## 错误处理

| 场景 | 行为 |
|------|------|
| `execution-plan.json` 不存在 | exit 2，提示先跑 `/casework:assess` |
| troubleshooter spawn 失败 | pipeline-state 标 failed，不阻塞后续 email-drafter |
| email-drafter spawn 失败 | pipeline-state 标 failed，记日志 |
