# Patrol/Casework Inline Execution v4 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce patrol subagent overhead by moving email-drafter, challenger, reassess, and summarize inline into casework agents, cutting spawn count from 4-6 per case to 1-3.

**Architecture:** casework(patrol) agent self-closes simple cases (A/B/C). For troubleshooter cases, patrol spawns troubleshooter then casework-phase2 which does challenger→reassess→email→summarize inline. IR-first is now patrol-supported. Each agent owns its own state.json updates.

**Tech Stack:** Bash scripts, Python (update-state.py), SKILL.md prompt specs

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `.claude/skills/casework/SKILL.md` | **Rewrite** | v4 casework orchestrator: mode=patrol now self-closes simple paths |
| `.claude/skills/casework/act/SKILL.md` | **Rewrite** | Remove patrol-mode delegation; inline email/challenger/reassess for all modes |
| `.claude/skills/patrol/SKILL.md` | **Rewrite** | Simplify to 3-phase: gathering→troubleshooting→done |
| `.claude/skills/casework/phase2/SKILL.md` | **Create** | New sub-skill: challenger→reassess→[email]→summarize after troubleshooter |
| `.claude/skills/casework/scripts/update-state.py` | **Modify** | Add `waiting-troubleshooter` status value; add `needs-retroubleshoot` exit code |

## Scope Note

This plan covers **only SKILL.md prompt spec rewrites** — no code scripts to create or modify beyond the `update-state.py` status enum. The SKILLs are prompt documents that guide LLM agents. Testing is done via dry-run patrol with real cases.

---

### Task 1: Add `waiting-troubleshooter` status to update-state.py

**Files:**
- Modify: `.claude/skills/casework/scripts/update-state.py` (line ~36, `ALL_STEPS` area)

- [ ] **Step 1: Read current valid statuses**

```bash
grep -n "status\|VALID\|active\|completed\|pending\|skipped" .claude/skills/casework/scripts/update-state.py | head -20
```

Identify where status validation happens (if any).

- [ ] **Step 2: Add `waiting-troubleshooter` as valid act status**

In `update-state.py`, the `status` field is free-form (no validation enum). Verify this:

```bash
grep -n "status" .claude/skills/casework/scripts/update-state.py | grep -i "valid\|assert\|raise\|check"
```

If no validation exists, this step is a no-op — `waiting-troubleshooter` will work as-is since `update-state.py` accepts arbitrary status strings.

If validation exists, add `waiting-troubleshooter` to the allowed list.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/scripts/update-state.py
git commit -m "feat: add waiting-troubleshooter status to update-state.py"
```

---

### Task 2: Create casework/phase2/SKILL.md

**Files:**
- Create: `.claude/skills/casework/phase2/SKILL.md`

This is the new sub-skill that runs after troubleshooter completes. It does challenger→reassess→[email]→summarize inline, all within a single agent. State.json updates happen at each step boundary.

- [ ] **Step 1: Create directory**

```bash
mkdir -p .claude/skills/casework/phase2
```

- [ ] **Step 2: Write SKILL.md**

```markdown
---
description: "Phase 2 — 排查后闭环：challenger gate → reassess → [email] → summarize。在 troubleshooter 完成后由 patrol spawn，单 agent 内 inline 执行全部后续步骤。"
name: casework:phase2
displayName: 排查后闭环（Phase 2）
category: casework-sub-skill
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Run phase2 for Case {caseNumber}. Read .claude/skills/casework/phase2/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# /casework:phase2 — 排查后闭环

troubleshooter 完成后的全部后续步骤，在单个 agent 内 inline 执行。

**调用方**：patrol 主 agent（troubleshooter 完成后 spawn）或 full-mode casework act。
**输入**：troubleshooter 已产出 `claims.json` + `analysis/*.md`。

## 输入契约

- `{caseDir}/.casework/claims.json` — 必须存在（troubleshooter 产物）
- `{caseDir}/analysis/*.md` — 分析报告
- `{caseDir}/.casework/execution-plan.json` — assess 阶段产物
- `{caseDir}/case-info.md` — D365 snapshot
- `{caseDir}/emails.md` — 邮件历史

## 输出契约

- `{caseDir}/.casework/execution-plan.json` — append reassess phase
- `{caseDir}/drafts/*.md` — 邮件草稿（如需）
- `{caseDir}/case-summary.md` — 增量更新
- `{caseDir}/todo/*.md` — todo 生成
- `{caseDir}/casework-meta.json` — upsert lastInspected

## 执行步骤

### Step 1. Challenger Gate（inline）

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action challenger --status active \
  --case-number "{caseNumber}"
```

读取 `{caseDir}/.casework/claims.json`：

```bash
TRIGGER=$(python3 -c "
import json
c = json.load(open(r'{caseDir}/.casework/claims.json', encoding='utf-8'))
print('1' if c.get('triggerChallenge') else '0')
")
```

**triggerChallenge=true 时**：

1. 读取 `.claude/agents/challenger.md` 获取完整执行步骤
2. **在当前 agent 内 inline 执行** challenger 的全部逻辑（读 claims → 逐条审查 → 写 challenge-report.md → 更新 claims.json 状态）
3. 读取 challenger 结果：
   - `ACTION:retry-troubleshoot` → 更新 state，标记 `needs-retroubleshoot`，**退出返回 patrol**
   - 其他（`ACTION:proceed` / `ACTION:request-info`）→ 继续 Step 2

```bash
# challenger 完成
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action challenger --status completed \
  --case-number "{caseNumber}"
```

**triggerChallenge=false 时**：跳过 challenger，直接 Step 2。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action challenger --status skipped \
  --case-number "{caseNumber}"
```

### Step 2. Reassess（inline）

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action reassess --status active \
  --case-number "{caseNumber}"
```

读取 `.claude/skills/casework/reassess/SKILL.md` 获取完整执行步骤，在当前 agent 内 inline 执行：
- 读 claims.json → fact/analysis 分类落盘 → LLM 决策 → 写 execution-plan phase 2

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action reassess --status completed \
  --case-number "{caseNumber}"
```

### Step 3. Email（inline，按需）

读取 reassess 产出的 execution-plan phase 2 actions：

```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh \
  "{caseDir}/.casework/execution-plan.json")
```

如果有 email-drafter action：

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action email-drafter --status active \
  --case-number "{caseNumber}"
```

读取 `.claude/agents/email-drafter.md` 获取完整执行步骤，在当前 agent 内 inline 执行。
emailType 从 reassess decision 中获取。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --action email-drafter --status completed \
  --case-number "{caseNumber}"
```

如果无 email action（exhausted / out-of-scope）：跳过。

```bash
# Act step 整体完成
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step act --status completed \
  --case-number "{caseNumber}"
```

### Step 4. Summarize（inline）

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step summarize --status active \
  --case-number "{caseNumber}"
```

读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，在当前 agent 内 inline 执行。

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{caseDir}" --step summarize --status completed \
  --case-number "{caseNumber}"
```

### Step 5. Exit signal

如果 Step 1 产出 `needs-retroubleshoot`：
```
PHASE2_EXIT|result=needs-retroubleshoot|elapsed={S}s
```

正常完成：
```
PHASE2_OK|conclusion={type}|email={emailType or none}|elapsed={S}s
```

## Safety Redlines

- ❌ 不直接发邮件
- ❌ 不修改 D365
- ✅ challenger/reassess/email-drafter/summarize 全部 inline，不再 spawn subagent
- ⚠️ 唯一返回 patrol 的情况：challenger 判定 needs-retroubleshoot

## Error Handling

| 场景 | 行为 |
|------|------|
| claims.json 不存在 | exit 2，提示 troubleshooter 未完成 |
| reassess LLM 返回非法 JSON | exit 2 |
| email-drafter 失败 | 标记 act.action.email=failed，不阻塞 summarize |
| summarize 失败 | 标记 summarize=failed，退出 |
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/phase2/SKILL.md
git commit -m "feat: create casework phase2 sub-skill for inline post-troubleshooter flow"
```

---

### Task 3: Rewrite casework/SKILL.md — v4 mode=patrol self-closes simple paths

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`

Key changes:
- mode=patrol now executes **full pipeline** for simple cases (no troubleshooter needed)
- mode=patrol with troubleshooter → inline IR email if IR-first → exit with `waiting-troubleshooter`
- Remove old "only Step 1+2, exit after execution-plan.json" behavior

- [ ] **Step 1: Read current SKILL.md**

```bash
cat .claude/skills/casework/SKILL.md
```

- [ ] **Step 2: Rewrite the Mode comparison table and Step 2 section**

Replace the "Mode 对比" table with:

```markdown
## Mode 对比

| | mode=full (depth=0) | mode=patrol (depth=1) |
|---|---|---|
| 调用者 | 用户 `/casework` | patrol spawn |
| 简单路径（无 troubleshooter） | Step 1→2→3→4 inline | Step 1→2→3→4 inline（自闭环，不返回 patrol） |
| 排查路径（有 troubleshooter） | Step 1→2(assess)→2(act: all inline)→3→4 | Step 1→2(assess)→[IR email inline]→退出(waiting-troubleshooter) |
| IR-first | act 内 inline: IR email→ts→reassess→email→summarize | assess 后 inline IR email → 退出等 troubleshooter |
| Phase 2（排查后） | act 内 inline 完成 | patrol spawn casework-phase2 agent |
```

- [ ] **Step 3: Rewrite Step 2 to add patrol self-close logic**

After Phase 0 (assess) completes and `execution-plan.json` is produced:

```markdown
**mode=patrol 分路（v4 新逻辑）**：

读取 execution-plan.json：
```bash
eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "{caseDir}")
```

**路径 A/B: actions=0（无 action 需要执行）**
```bash
# 标记 act completed
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status completed --case-number "$CASE_NUMBER"

# Inline summarize
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status active --case-number "$CASE_NUMBER"
```
读取 `.claude/skills/casework/summarize/SKILL.md` 获取完整执行步骤，inline 执行。
```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status completed --case-number "$CASE_NUMBER"
echo "CASEWORK_PATROL_OK|path=self-closed|actions=0|elapsed=${SECONDS}s"
exit 0
```

**路径 C: actions=[email-drafter only]（无 troubleshooter）**
```bash
# Inline email-drafter
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --action email-drafter --status active --case-number "$CASE_NUMBER"
```
读取 `.claude/agents/email-drafter.md`，inline 执行 email-drafter。emailType 从 execution-plan 获取。
```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --action email-drafter --status completed --case-number "$CASE_NUMBER"
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status completed --case-number "$CASE_NUMBER"

# Inline summarize
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status active --case-number "$CASE_NUMBER"
```
读取 `.claude/skills/casework/summarize/SKILL.md`，inline 执行。
```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step summarize --status completed --case-number "$CASE_NUMBER"
echo "CASEWORK_PATROL_OK|path=self-closed|actions=email|elapsed=${SECONDS}s"
exit 0
```

**路径 D/E: actions 含 troubleshooter**
```bash
# IR-first 检查：如果同时含 email-drafter(initial-response)，先 inline 写 IR
if IR_FIRST == 1:
  python3 .claude/skills/casework/scripts/update-state.py \
    --case-dir "$CASE_DIR" --step act --action email-drafter --status active --case-number "$CASE_NUMBER"
  # 读取 .claude/agents/email-drafter.md，inline 执行 IR email
  python3 .claude/skills/casework/scripts/update-state.py \
    --case-dir "$CASE_DIR" --step act --action email-drafter --status completed --case-number "$CASE_NUMBER"

# 标记等待 troubleshooter（patrol 将 spawn 独立 troubleshooter agent）
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step act --status waiting-troubleshooter --case-number "$CASE_NUMBER"
echo "CASEWORK_PATROL_WAITING|path=needs-troubleshooter|ir_first=$IR_FIRST|elapsed=${SECONDS}s"
exit 0
```
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/SKILL.md
git commit -m "feat: casework v4 — patrol mode self-closes simple paths, IR-first support"
```

---

### Task 4: Rewrite casework/act/SKILL.md — remove patrol delegation, align with v4

**Files:**
- Modify: `.claude/skills/casework/act/SKILL.md`

Key changes:
- Remove "patrol mode = subagent, doesn't spawn agents" logic
- Remove scene D (HAS_DEFERRED=false direct email) — all troubleshooter cases go through reassess
- full-mode act now inline executes: troubleshooter(fg) → challenger(inline) → reassess(inline) → email(inline)
- patrol mode handled entirely by casework/SKILL.md (Task 3), act/SKILL.md no longer needs mode detection

- [ ] **Step 1: Remove mode=patrol delegation block**

Remove the Step 2 "模式检测" section that delegates to patrol. The act SKILL is now always full-mode when invoked.

- [ ] **Step 2: Merge HAS_DEFERRED path — all troubleshooter cases get reassess**

In Step 3b (standard path), after troubleshooter completes:

```markdown
# After troubleshooter completes — ALWAYS reassess (v4: no more HAS_DEFERRED branch)
# Read .claude/skills/casework/reassess/SKILL.md, inline execute
# Then read reassess result, inline email-drafter if needed
```

Remove the old `if HAS_DEFERRED == 1` / `else` branching. The "no deferred" path no longer exists.

- [ ] **Step 3: Update route table**

Replace the old route table with:

```markdown
## 路由参考表（v4）

| actualStatus | assess actions | act 行为 |
|---|---|---|
| `pending-engineer`（新 case） | troubleshooter + email-drafter(IR) | IR-first: email(IR,inline) → ts(fg) → challenger(inline) → reassess(inline) → email(phase2,inline) |
| `pending-engineer`（已有 IR） | troubleshooter, deferred=[email-drafter] | ts(fg) → challenger(inline) → reassess(inline) → email(inline) |
| `pending-customer` (days≥3) | email-drafter(follow-up) | email(inline) |
| `pending-pg` (days<5) | [] | 无 action |
| `pending-pg` (days≥5) | email-drafter(follow-up) | email(inline) |
| `researching` | troubleshooter, deferred=[email-drafter] | ts(fg) → challenger(inline) → reassess(inline) → email(inline) |
| `ready-to-close` | email-drafter(closure/closure-confirm) | email(inline) |
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/act/SKILL.md
git commit -m "feat: act v4 — remove patrol delegation, all ts cases get reassess, inline execution"
```

---

### Task 5: Rewrite patrol/SKILL.md — simplified 3-phase architecture

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`

This is the biggest change. The current ~350-line state machine with 7 phases becomes a simple 3-phase loop.

- [ ] **Step 1: Rewrite core principles and state machine**

Replace the state machine diagram with:

```markdown
## 核心原则

**每个 case 的分析/email/summarize 步骤在 casework agent 内 inline 完成，不返回 patrol。**
**patrol 主 agent 仅负责：spawn casework → 等待 → spawn troubleshooter → 等待 → spawn phase2 → 等待 → 进度展示。**

**State Machine**（3 phase）：
```
gathering ─┬─ casework 自闭环（no troubleshooter）→ done
           └─ waiting-troubleshooter → troubleshooting ─┬─ phase2 自闭环 → done
                                                        └─ needs-retroubleshoot → troubleshooting（重试）
```
```

- [ ] **Step 2: Rewrite Step 2 — Streaming Pipeline**

Replace the entire 200-line polling loop with:

```markdown
### 2b. 轮询循环（CLI + WebUI 统一）

每个 case 维护 3 个 phase：`gathering` | `troubleshooting` | `done`

```
while (有未到达 done 的 case) {
  sleep 12s
  
  for each case:
    # 读 state.json 判断 phase
    STATE=$(python3 -c "
    import json
    s = json.load(open('{casesRoot}/active/{caseNumber}/.casework/state.json', encoding='utf-8'))
    act = s.get('steps',{}).get('act',{})
    summ = s.get('steps',{}).get('summarize',{})
    print(act.get('status',''), summ.get('status',''))
    ")
    
    switch (case.phase):
    
      case "gathering":
        if summarize.status == "completed":
          # casework 自闭环完成（路径 A/B/C）
          → case.phase = "done"
        
        elif act.status == "waiting-troubleshooter":
          # casework 退出，需要 troubleshooter
          → case.phase = "troubleshooting"
          → spawn troubleshooter [后台]
      
      case "troubleshooting":
        # 检查 troubleshooter 是否完成
        if claims.json 存在 && troubleshooter task 已返回:
          → spawn casework-phase2 [后台]
          → case.sub_phase = "phase2-running"
        
        if phase2 已完成:
          # 检查是否需要重新排查
          PHASE2_EXIT = 读 phase2 agent output 的最后一行
          if "needs-retroubleshoot":
            → 重新 spawn troubleshooter [后台]
          else:
            → case.phase = "done"
  
  # 更新 patrol 级进度
  python3 .claude/skills/patrol/scripts/patrol-progress.py ...
  python3 .claude/skills/patrol/scripts/update-phase.py \
    --patrol-dir "{patrolDir}" --phase processing \
    --processed-cases $DONE_COUNT --current-action "$CURRENT_ACTION"
}
```

**Spawn 规则**（v4 简化）：
- casework(patrol): 第一轮全量并行，后台
- troubleshooter: 按需，后台
- casework-phase2: troubleshooter 完成后，后台
- 同一轮多个 case 就绪 → 一条消息并行 spawn
- **不再 spawn**：email-drafter、summarize、challenger、reassess（全部由 casework/phase2 inline 处理）
```

- [ ] **Step 3: Update Spawn templates**

Replace all spawn templates with just 3:

```markdown
**casework(patrol) spawn 模板**：
```
Agent({
  prompt: "Patrol mode casework for Case {caseNumber}。
    caseDir: {casesRoot}/active/{caseNumber}/
    projectRoot: .
    casesRoot: {casesRoot}
    mode: patrol
    
    读取 .claude/skills/casework/SKILL.md，按 mode=patrol 流程执行。
    简单路径（无 troubleshooter）在 agent 内完成全部步骤后退出。
    排查路径（有 troubleshooter）在 IR email（如有）后标记 waiting-troubleshooter 退出。",
  run_in_background: true,
  model: "opus"
})
```

**troubleshooter spawn 模板**：
```
Agent({
  prompt: "Case {caseNumber}，caseDir={casesRoot}/active/{caseNumber}/。
    读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。",
  run_in_background: true,
  model: "opus"
})
```

**casework-phase2 spawn 模板**：
```
Agent({
  prompt: "执行 phase2 for Case {caseNumber}。
    caseDir: {casesRoot}/active/{caseNumber}/
    projectRoot: .
    
    读取 .claude/skills/casework/phase2/SKILL.md 获取完整执行步骤。
    Inline 执行 challenger→reassess→[email]→summarize 全部步骤。",
  run_in_background: true,
  model: "opus"
})
```
```

- [ ] **Step 4: Remove old phase definitions**

Remove references to old phases: `plan-ready`, `executing`, `investigating`, `reassessing`, `communicating`, `inspecting`. Replace Phase 文件协议 to reflect new 3-phase model.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/patrol/SKILL.md
git commit -m "feat: patrol v4 — 3-phase architecture, casework self-closes simple paths"
```

---

### Task 6: Update casework/assess SKILL.md — remove HAS_DEFERRED=false path

**Files:**
- Modify: `.claude/skills/casework/assess/SKILL.md` (Step 4 LLM prompt section)

- [ ] **Step 1: Simplify deferredActions rule**

In the LLM prompt template, change:

```
Old: "当 actions 包含 troubleshooter 时，必须设 deferredActions: ["email-drafter"]"
     "当不含 troubleshooter 时，设 deferredActions: []"
```

To:

```
"当 actions 包含 troubleshooter 时，email 类型统一由 reassess 步骤决定。
 deferredActions 字段保留但不再影响路由——所有含 troubleshooter 的场景都会走 reassess。
 IR-first 例外不变：new case 同时输出 troubleshooter + email-drafter(initial-response)。"
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/assess/SKILL.md
git commit -m "refactor: assess v4 — simplify deferred actions, all ts cases get reassess"
```

---

### Task 7: Dry-run validation with real cases

**Files:** None (validation only)

- [ ] **Step 1: Identify test cases for each path**

```bash
# Find cases with different actualStatus for testing
python3 -c "
import json, os, glob
cases_root = json.load(open('config.json'))['casesRoot']
for d in sorted(glob.glob(f'{cases_root}/active/*/casework-meta.json')):
    m = json.load(open(d, encoding='utf-8'))
    case = os.path.basename(os.path.dirname(d))
    status = m.get('actualStatus', '?')
    print(f'{case}: {status}')
" | head -20
```

- [ ] **Step 2: Test path A/B — run single casework with DELTA_EMPTY case**

Pick a stable case (pending-pg, no recent changes):

```bash
# Dry-run: mode=patrol single case
# Verify: casework agent self-closes, summarize.status=completed in state.json
```

- [ ] **Step 3: Test path C — run casework with follow-up email case**

Pick a pending-customer case with days≥3.

- [ ] **Step 4: Test path D/E — run full patrol with troubleshooter case**

Pick a pending-engineer case. Verify:
1. casework exits with `waiting-troubleshooter`
2. patrol spawns troubleshooter
3. patrol spawns phase2 after troubleshooter completes
4. phase2 does challenger→reassess→email→summarize inline

- [ ] **Step 5: Verify state.json updates at each boundary**

```bash
# For each test case, check state.json shows proper step transitions
python3 -c "
import json
s = json.load(open('{caseDir}/.casework/state.json', encoding='utf-8'))
for step, info in s.get('steps', {}).items():
    print(f'{step}: {info.get(\"status\",\"?\")}')
    for action, ainfo in info.get('actions', {}).items():
        print(f'  └─ {action}: {ainfo.get(\"status\",\"?\")}')
"
```

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: patrol v4 dry-run fixes"
```

---

## Migration Notes

- **Backward compatibility**: `execution-plan.json` schema unchanged. `HAS_DEFERRED` field still produced by assess but no longer drives routing.
- **Dashboard impact**: state.json now has `waiting-troubleshooter` as a valid act status. Dashboard patrol-orchestrator.ts may need to recognize this for sidebar display. (Separate task, not in this plan.)
- **full mode `/casework`**: Benefits from same simplification — act now always does reassess after troubleshooter, no conditional branching.
- **Rollback**: Revert the 6 commits to restore v3 behavior.
