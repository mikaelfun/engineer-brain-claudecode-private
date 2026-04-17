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
- `{caseDir}/casework-meta.json` — AR case 时需含 `ar.scope`、`ar.communicationMode`、`ar.caseOwnerEmail`、`mainCaseId`

## 输出契约

- `{caseDir}/analysis/*.md` — troubleshooter 产出
- `{caseDir}/.casework/claims.json` — troubleshooter 证据链
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
  if DEPENDS == "troubleshooter" && ! -f "{caseDir}/.casework/claims.json":
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
      # AR 分支：isAR=true 时使用以下 prompt 替代上方普通版
      # Agent(
      #   subagent_type: "troubleshooter",
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
      # AR 分支：isAR=true 时根据 communicationMode 选择 prompt
      #
      # AR internal 模式 (AR_MODE = "internal"):
      # Agent(
      #   subagent_type: "email-drafter",
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
      #   subagent_type: "email-drafter",
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
| `pending-pg` (days<5) | [] | 无 action，等 PG |
| `pending-pg` (days≥5) | email-drafter(follow-up) | 向客户更新状态（PG 仍在调查） |
| `researching` | troubleshooter | troubleshooter(fg) |
| `ready-to-close` | email-drafter(closure) | email(fg) |

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
