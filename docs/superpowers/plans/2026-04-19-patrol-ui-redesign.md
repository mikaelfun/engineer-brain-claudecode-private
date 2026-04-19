# Patrol UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the patrol page with a left sidebar vertical pipeline + right case list layout, 5-step case pipeline with rich detail, and collapsible done rows. Phase 2 adds backend data enrichment so all UI elements have real data.

**Architecture:** Replace the current top-down layout (PatrolHeader → PatrolGlobalPipeline → PatrolCaseList) with a sidebar+content layout. The PatrolPage becomes a flex container. Left sidebar contains a sticky vertical pipeline card. Right side contains the header bar + case list. PatrolCaseRow is rewritten with 5 horizontal steps. Store gets new fields (`currentAction`, `totalFound`, `skippedCount`, `warmupStatus`).

**Tech Stack:** React + TypeScript, Tailwind CSS, Zustand (patrolStore), lucide-react icons, CSS variables from dashboard design system.

**Spec:** `docs/superpowers/specs/2026-04-19-patrol-ui-redesign.md`
**Mockup:** `.superpowers/brainstorm/543180-1776581717/content/patrol-v7-sidebar.html`

---

## Phase 1: Frontend Components ✅ COMPLETED

All Phase 1 tasks (Task 1–7) are implemented. Key commits:
- Store + StateManager extended with `currentAction`/`totalFound`/`skippedCount`/`warmupStatus`
- PatrolSidebar: 422 lines, vertical pipeline with LiveTimer, detail text, progress bar
- PatrolCaseRow: 831 lines, 5-step horizontal pipeline, collapsible done rows, auto-collapse via useEffect
- PatrolCaseList: 153 lines, Card-wrapped, styled queued cards, gradient progress bar
- PatrolPage: 193 lines, sidebar+content flex layout, stat chips, hydration
- PatrolHeader: 146 lines, slimmed to title+badge+timer
- PatrolGlobalPipeline: deleted (replaced by PatrolSidebar)

**Polish commits** (post-initial implementation):
- `ac010da` — auto-collapse done cases, align Cases header, style queued cards
- `0357976` — wrap Cases in Card for visual parity with Pipeline sidebar
- `32c9ddc` — gradient progress bars, card overflow + hover shadow
- `6879616` — align step connector lines with icon centers
- `8b6f52f` — blue case ID/border, label height parity, flex connectors
- `ebb3212` — remove step connector lines (cleaner look), pending icon bg fill

**Deviations from original plan:**
- Task 4: Plan said "Remove Card wrapper" → actual: **added** Card (matches sidebar visual level)
- Task 3: Auto-collapse uses `useEffect` sync on `isComplete` (more robust than defaultExpanded alone)
- Queued cases: card+border style instead of pure 30% opacity (richer visual)
- Sidebar progress bar: always gradient (removed completed→solid-green branch)

### Remaining: Task 7 integration test (manual verification)

- [ ] Verify with dashboard running + real patrol data: sidebar renders with timings, done cases auto-collapse, active cases expand, queued faded, no console errors

---

## Phase 2: Backend Data Enrichment + Timing Accuracy

Phase 2 fills the data gaps identified during spec review. Without these changes, the UI from Phase 1 renders but shows empty/fallback for: sidebar detail text, case Refresh delta counts, Assess reasoning, Act agent detail/result, and the Start step.

### Design Principle: Script-first, Agent-minimal

**Problem**: Agent (LLM) 写入不确定——可能忘记调用、变量取错、格式意外。
**方案**: 所有数据写入尽量由**确定性脚本**完成（bash/python3），不依赖 agent 记得执行某行命令。

| 写入层 | 可靠性 | 适用 |
|--------|--------|------|
| **脚本内嵌** — 已有脚本末尾自动调用 | ✅ 100% 确定性 | Task 8/9/10/11/14/15 |
| **脚本 + agent 触发** — agent 只调一个确定性脚本 | 🟡 高（失败=缺失，不会格式错误） | Task 12/13 |

**Agent 依赖最小化**：只剩 2 处需要 agent 配合——
1. patrol agent 在 spawn 前调 `update-state.py --step start`（1 行命令）
2. patrol agent 在轮询循环中写 `currentAction` 到 patrol-progress.json（已有的 python3 模板）

**性能影响**：每个 case 额外 ~500ms（5 次 python3 调用），10 cases 共 +5s，占总 patrol 时间 ~1%。

### Information Gap → Task 映射

| # | Gap | 写入者 | Task |
|---|-----|--------|------|
| 1 | `start` step 不在 schema | 脚本 + agent 触发 | 8 + 13 |
| 2 | subtask 无 delta 数据 | 脚本（event-wrapper.sh） | 8 + 9 |
| 3 | assess 无 reasoning | 脚本（write-execution-plan.py） | 8 + 11 |
| 4 | act 无 detail/result | 脚本（finalize-state.sh） | 8 + 15 |
| 5 | Teams subtask 无追踪 | 脚本（data-refresh.sh） | 10 |
| 6 | patrol 全局字段缺失 | agent 写 patrol-progress.json | 12 |
| 7 | 计时不准（sum ≠ total） | 脚本（StateManager 用 updatedAt） | 14 |

---

### Task 8: Extend update-state.py schema

**Files:**
- Modify: `.claude/skills/casework/scripts/update-state.py`

- [ ] **Step 1: Add `start` to ALL_STEPS**

```python
ALL_STEPS = ['start', 'data-refresh', 'assess', 'act', 'summarize']
```

- [ ] **Step 2: Add `--delta`, `--reasoning`, `--detail` params**

```python
ap.add_argument('--delta', default='', help='JSON delta data for subtask (e.g. \'{"emails":3,"notes":1}\')')
ap.add_argument('--reasoning', default='', help='Reasoning text for step result')
ap.add_argument('--detail', default='', help='Live detail text for action')
```

Note: `--result` already exists as a step-level param. Extend it to also work for actions.

In the subtask update section, after setting status/durationMs:
```python
if args.delta:
    sub['delta'] = json.loads(args.delta)
```

In the action update section, after setting status/durationMs:
```python
if args.detail:
    a['detail'] = args.detail
if args.result:
    a['result'] = args.result
```

In the main step update section, after setting result:
```python
if args.reasoning:
    step_state['reasoning'] = args.reasoning
```

- [ ] **Step 3: Verify script runs**

```bash
python3 .claude/skills/casework/scripts/update-state.py --help
# Verify new params appear
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/scripts/update-state.py
git commit -m "feat(state): extend update-state.py with start step, delta, reasoning, detail params"
```

---

### Task 9: Enrich event-wrapper.sh with delta data (script-only)

**Files:**
- Modify: `.claude/skills/casework/scripts/event-wrapper.sh`

**Writer**: event-wrapper.sh（纯脚本，每个 subtask 完成后自动执行）
**Agent 依赖**: 无

- [ ] **Step 1: Read subtask delta after command success**

Replace the success branch of event-wrapper.sh with:

```bash
if [ $EXIT -eq 0 ]; then
  # Read delta from subtask output file (deterministic — file written by source script)
  SUBTASK_FILE="$CASE_DIR/.casework/output/subtasks/${TASK}.json"
  DELTA_ARGS=()
  if [ -f "$SUBTASK_FILE" ]; then
    DELTA_JSON=$(python3 -c "
import json
try:
    d = json.load(open(r'$SUBTASK_FILE', encoding='utf-8'))
    delta = d.get('delta', {})
    if delta: print(json.dumps(delta))
except: pass
" 2>/dev/null || true)
    [ -n "$DELTA_JSON" ] && DELTA_ARGS=(--delta "$DELTA_JSON")
  fi

  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh \
    --subtask "$TASK" --status completed --duration-ms "$DUR_MS" "${DELTA_ARGS[@]}"
else
  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh \
    --subtask "$TASK" --status failed
fi
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/scripts/event-wrapper.sh
git commit -m "feat(state): event-wrapper writes subtask delta to state.json"
```

---

### Task 10: Add Teams subtask tracking in data-refresh.sh (script-only)

**Files:**
- Modify: `.claude/skills/casework/scripts/data-refresh.sh`

**Writer**: data-refresh.sh（纯脚本）
**Agent 依赖**: 无

- [ ] **Step 1: Add Teams state tracking**

Teams is the only data source not wrapped by event-wrapper.sh (because it has chained post-processing inside the bg subshell). Add direct update-state calls:

Before the Teams bg subshell (line ~104):
```bash
python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh --subtask teams --status active
TEAMS_START_NS=$(date +%s%N)
```

After `wait $PID_TEAMS` completes, calculate duration and read delta:
```bash
TEAMS_DUR_MS=$(( ($(date +%s%N) - TEAMS_START_NS) / 1000000 ))
TEAMS_DELTA_JSON=$(python3 -c "
import json
try:
    d = json.load(open(r'$SUBTASK_DIR/teams.json', encoding='utf-8'))
    delta = d.get('delta', {})
    if delta: print(json.dumps(delta))
except: pass
" 2>/dev/null || true)
TEAMS_DELTA_ARGS=()
[ -n "$TEAMS_DELTA_JSON" ] && TEAMS_DELTA_ARGS=(--delta "$TEAMS_DELTA_JSON")
python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh \
  --subtask teams --status completed --duration-ms "$TEAMS_DUR_MS" "${TEAMS_DELTA_ARGS[@]}"
```

Note: The `TEAMS_START_NS` variable is set in the main shell (not the bg subshell), so it captures wall-clock time including the Teams post-processing chain. This is the correct metric (total Teams path time).

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/scripts/data-refresh.sh
git commit -m "feat(state): track Teams subtask status and delta in state.json"
```

---

### Task 11: Write assess reasoning via write-execution-plan.py (script-only)

**Files:**
- Modify: `.claude/skills/casework/assess/scripts/write-execution-plan.py`

**Writer**: write-execution-plan.py（纯脚本，assess 流程必然调用）
**Agent 依赖**: 无——不需要 agent "记得" 写 reasoning，脚本内嵌自动完成

**设计**: `statusReasoning` 在 LLM 输出的 decision JSON 中。`write-execution-plan.py` 已经读取这个 JSON 来写 execution-plan.json。在同一脚本中追加调用 update-state.py 写 reasoning 到 state.json。

- [ ] **Step 1: Extend write-execution-plan.py**

在 `write-execution-plan.py` 的 `main()` 末尾（写完 execution-plan.json 后），追加：

```python
# Write reasoning + result to state.json for UI display (deterministic — no agent needed)
reasoning = d.get('statusReasoning', '')
if reasoning or plan['actualStatus']:
    import subprocess, sys
    cmd = [
        sys.executable,
        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scripts', 'update-state.py'),
        '--case-dir', args.case_dir,
        '--step', 'assess',
        '--status', 'completed',
        '--result', plan['actualStatus'],
    ]
    if reasoning:
        cmd.extend(['--reasoning', reasoning[:200]])
    subprocess.run(cmd, check=False)
```

Also preserve `statusReasoning` in execution-plan.json for downstream consumers:

```python
plan = {
    ...
    'statusReasoning': d.get('statusReasoning', ''),  # NEW: preserve for UI
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/assess/scripts/write-execution-plan.py
git commit -m "feat(state): write-execution-plan.py auto-writes reasoning to state.json"
```

---

### Task 12: Enrich patrol-progress.json with sidebar detail fields

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`

**Writer**: patrol agent 按 SKILL.md 模板执行 python3 -c
**Agent 依赖**: 🟡 中等——agent 必须在正确的位置写 python3 模板，但：
- 模板是固定的（patrol SKILL.md 已有类似 python3 -c 写 progress 的模式）
- 字段全是简单数字/文本（`totalFound` = `len(case_list)`, `skippedCount` = int）
- 失败模式 = 字段缺失 → UI 显示 fallback 文本（如 "Querying D365…"），不致命

- [ ] **Step 1: Add `totalFound` to discovering phase write**

In patrol SKILL.md Step 3 (获取活跃 Case 列表), after D365 query returns, add `totalFound` to the progress JSON:

```python
d = {'phase':'discovering', ..., 'totalFound': $TOTAL_FOUND, ...}
```

- [ ] **Step 2: Add `skippedCount` to filtering phase**

```bash
SKIPPED_COUNT=$((TOTAL_FOUND - CHANGED_CASES))
```

Include in the processing phase progress write:

```python
d = {'phase':'processing', ..., 'totalFound':$TOTAL_FOUND, 'skippedCount':$SKIPPED_COUNT, ...}
```

- [ ] **Step 3: Add `warmupStatus` after warmup**

Capture token-daemon.js output:

```bash
WARMUP_OUT=$(node .claude/skills/browser-profiles/scripts/token-daemon.js warmup 2>/dev/null || echo "daemon offline")
WARMUP_STATUS=$(echo "$WARMUP_OUT" | head -1 | cut -c1-60)
```

Write to progress json.

- [ ] **Step 4: Add `currentAction` in polling loop**

In Step 6c polling loop, after each state transition decision, update `currentAction` in the progress write:

```python
# Existing progress write already has this pattern:
d = {'phase':'processing', 'totalCases':..., 'changedCases':...,
     'processedCases':..., 'caseList':...,
     'currentAction': '$CURRENT_ACTION',  # NEW
     'updatedAt':...}
```

`CURRENT_ACTION` is a shell variable patrol agent sets after each decision:
```bash
CURRENT_ACTION="0748 assess done → launching troubleshooter"
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/patrol/SKILL.md
git commit -m "feat(patrol): write totalFound, skippedCount, warmupStatus, currentAction to progress"
```

---

### Task 13: Write `start` step from casework/patrol

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`
- Modify: `.claude/skills/patrol/SKILL.md`

**Writer**: patrol agent 写 `active`（1 行命令），casework agent 写 `completed`（1 行命令）
**Agent 依赖**: 🟡 低——两个 agent 各调一次 update-state.py。失败模式 = start 步骤无数据，UI 显示 pending，不致命。

- [ ] **Step 1: Patrol main agent writes `start=active` before spawn**

In patrol SKILL.md Step 6a, before spawning each casework agent:

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "{casesRoot}/active/{caseNumber}" --step start --status active \
  --case-number "{caseNumber}"
```

- [ ] **Step 2: Casework agent writes `start=completed` at first line**

In casework SKILL.md Step 1 (初始化), at the very first line before data-refresh:

```bash
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir "$CASE_DIR" --step start --status completed \
  --case-number "{caseNumber}"
```

Duration = `completedAt - startedAt` = SDK cold-start time (~3-8s).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/SKILL.md .claude/skills/patrol/SKILL.md
git commit -m "feat(state): track SDK start step for cold-start timing visibility"
```

---

### Task 14: Fix phase timing accuracy (script-only, zero prompt change)

**Files:**
- Modify: `dashboard/src/services/patrol-state-manager.ts`

**Writer**: StateManager（纯 TypeScript 代码）
**Agent 依赖**: 无——不改 patrol SKILL.md，不让 agent 维护计时变量

**Problem**: Phase timings don't sum to total patrol time because chokidar's 300ms `awaitWriteFinish` swallows fast phases (filtering ~100ms → backfilled with 0ms). Current approach uses `Date.now()` at file-change detection time — inaccurate.

**Solution**: patrol-progress.json 已经包含 `updatedAt` 字段（patrol skill 用 `time.strftime` 写的精确时间戳）。StateManager 用连续两个 phase 的 `updatedAt` 差值替代 `Date.now()` 差值——完全消除 chokidar 延迟误差。

- [ ] **Step 1: Use skill-provided `updatedAt` for phase duration**

In `patrol-state-manager.ts` `update()` method, replace the phase transition duration calculation:

```typescript
// In phase transition block, replace:
//   const durationMs = Date.now() - new Date(this.state.phaseStartedAt).getTime()
// With:
if (partial.phase && partial.phase !== this.state.phase) {
  const prevPhase = this.state.phase
  if (!this.state.phaseTimings) this.state.phaseTimings = {}

  // Use updatedAt from patrol-progress.json if available (skill-side timestamp, no chokidar delay)
  // Otherwise fall back to Date.now()
  const transitionTime = (partial.updatedAt)
    ? new Date(partial.updatedAt as string).getTime()
    : Date.now()

  if (prevPhase !== 'idle' && this.state.phaseStartedAt) {
    const startTime = new Date(this.state.phaseStartedAt).getTime()
    this.state.phaseTimings[prevPhase] = transitionTime - startTime
  }

  // Use skill-provided timestamp as new phase start
  this.state.phaseStartedAt = (partial.updatedAt as string) || new Date().toISOString()

  // ... rest of phase transition logic (skip backfill, persist) unchanged
}
```

**Why this works**:
- patrol skill writes `'updatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())` in every patrol-progress.json update — this is the actual timestamp of the bash process, not the chokidar detection time
- Fast phases (filtering) that get swallowed: when StateManager receives `warming-up` directly (skipping `filtering`), it backfills `filtering` with 0ms as before — but the `discovering` → `warming-up` gap is now correct (using `updatedAt`), so the total is still accurate
- No patrol SKILL.md changes needed

- [ ] **Step 2: Verify timing sum after a patrol run**

```bash
python3 -c "
import json, datetime
t = json.load(open('.patrol/patrol-timings.json'))['phaseTimings']
s = json.load(open('.patrol/patrol-state.json'))
start = datetime.datetime.fromisoformat(s['startedAt'].replace('Z','+00:00'))
end = datetime.datetime.fromisoformat(s['completedAt'].replace('Z','+00:00'))
total_ms = int((end - start).total_seconds() * 1000)
phases_sum = sum(t.values())
drift_pct = abs(total_ms - phases_sum) / max(total_ms, 1) * 100
print(f'Total: {total_ms}ms, Phases sum: {phases_sum}ms, Drift: {drift_pct:.1f}%')
print(f'Phases: {t}')
"
```

Expected: drift < 5%.

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/services/patrol-state-manager.ts
git commit -m "fix(patrol): use skill-provided updatedAt for accurate phase timing"
```

---

### Task 15: Create finalize-state.sh for act agent results (script-only)

**Files:**
- Create: `.claude/skills/casework/scripts/finalize-state.sh`
- Modify: `.claude/skills/casework/scripts/data-refresh.sh` (add call at end)

**Writer**: finalize-state.sh（纯脚本）
**Agent 依赖**: 无——脚本从已有产出文件（claims.json、drafts/）提取摘要，不依赖 agent 变量

**设计**: 与其让 patrol agent 在轮询循环中读 claims.json 提取 result（agent 可能忘记/格式错误），不如创建一个 `finalize-state.sh` 脚本，在每个关键步骤完成后自动调用，从已有文件回填 state.json 缺失字段。

- [ ] **Step 1: Create finalize-state.sh**

```bash
#!/usr/bin/env bash
# finalize-state.sh — Backfill state.json from completed step output files
# Called by scripts at deterministic points, NOT by agent prompts.
#
# Usage: finalize-state.sh <case-dir> <step>
#   step: data-refresh | assess | act
set -uo pipefail

CASE_DIR="${1:?case-dir required}"
STEP="${2:?step required}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPDATE_STATE="$SCRIPT_DIR/update-state.py"

case "$STEP" in
  data-refresh)
    # Backfill subtask deltas from data-refresh-output.json
    python3 -c "
import json, subprocess, sys
try:
    dr = json.load(open(r'$CASE_DIR/.casework/data-refresh-output.json', encoding='utf-8'))
except: exit(0)
rr = dr.get('refreshResults', {})
mapping = {
    'd365':        {'emails': rr.get('d365',{}).get('newEmails',0), 'notes': rr.get('d365',{}).get('newNotes',0)},
    'teams':       {'chats': rr.get('teams',{}).get('newChats',0), 'messages': rr.get('teams',{}).get('newMessages',0)},
    'icm':         {'discussions': rr.get('icm',{}).get('newEntries',0)},
    'onenote':     {'pages': rr.get('onenote',{}).get('newPages',0) + rr.get('onenote',{}).get('updatedPages',0)},
    'attachments': {'files': rr.get('attachments',{}).get('downloaded',0)},
}
for task, delta in mapping.items():
    if any(v > 0 for v in delta.values()):
        subprocess.run([sys.executable, r'$UPDATE_STATE',
          '--case-dir', r'$CASE_DIR', '--step', 'data-refresh',
          '--subtask', task, '--delta', json.dumps(delta)], check=False)
" 2>/dev/null || true
    ;;

  act)
    # Backfill troubleshooter result from claims.json
    python3 -c "
import json, subprocess, sys, glob, os
claims = r'$CASE_DIR/.casework/claims.json'
if os.path.exists(claims):
    try:
        c = json.load(open(claims, encoding='utf-8'))
        result = (c.get('summary') or c.get('rootCause') or 'Analysis complete')[:100]
        subprocess.run([sys.executable, r'$UPDATE_STATE',
          '--case-dir', r'$CASE_DIR', '--step', 'act',
          '--action', 'troubleshooter', '--result', result], check=False)
    except: pass
# Backfill email-drafter result from latest draft
drafts = sorted(glob.glob(r'$CASE_DIR/drafts/*.md'), key=os.path.getmtime, reverse=True)
if drafts:
    try:
        with open(drafts[0], encoding='utf-8') as f:
            subj = f.readline().strip().replace('#','').strip()
        subprocess.run([sys.executable, r'$UPDATE_STATE',
          '--case-dir', r'$CASE_DIR', '--step', 'act',
          '--action', 'email-drafter', '--result', f'Draft: {subj[:80]}'], check=False)
    except: pass
" 2>/dev/null || true
    ;;
esac
```

- [ ] **Step 2: Call finalize-state.sh from data-refresh.sh**

In `data-refresh.sh`, before the final exit 0 (line ~566):

```bash
# Backfill state.json with delta data from output files
bash "$HERE/finalize-state.sh" "$CASE_DIR_ABS" data-refresh
```

- [ ] **Step 3: Document call from patrol SKILL.md**

In patrol SKILL.md, after each act agent completes (in the polling loop, "executing" → "inspecting" transition):

```bash
# Backfill act results (deterministic script, reads claims.json/drafts/)
bash .claude/skills/casework/scripts/finalize-state.sh "{casesRoot}/active/{caseNumber}" act
```

This is still in patrol agent context, but the agent only calls one command (no variable management, no JSON construction). Even if patrol agent skips this line, the only effect is empty result text in act cards — UI shows "completed" status correctly because update-state.py for action status is already called separately.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/scripts/finalize-state.sh .claude/skills/casework/scripts/data-refresh.sh
git commit -m "feat(state): finalize-state.sh backfills delta + act results from output files"
```

---

## Phase 3: Polish ✅ COMPLETED

### Task 16: Visual polish + responsive

- [x] **Step 1: Smooth transitions** — CSS transitions on case row expand/collapse (max-height + opacity)
- [x] **Step 2: Mobile breakpoint** — sidebar collapses to full-width stacked layout on narrow screens (<768px)
- [x] **Step 3: Loading skeletons** — shimmer placeholders while waiting for first SSE

Commit: `c6da0a5` — transitions, responsive, skeletons

---

## Phase 4: Reassess Integration ✅ COMPLETED

> Depends on: Phase 2 complete + reassess-feedback-loop P0-P2 (done)
> Spec: `docs/superpowers/specs/2026-04-19-reassess-feedback-loop.md`

### Task 17: finalize-state.sh — Add reassess action backfill

**Files:**
- Modify: `.claude/skills/casework/scripts/finalize-state.sh`

The `act` case in finalize-state.sh currently handles troubleshooter (from claims.json) and email-drafter (from drafts/). Add reassess action result backfill:

- [x] **Step 1: Add reassess result backfill to act case**

After the troubleshooter backfill block, add:

```python
# Backfill reassess result from execution-plan.json plans[1]
ep = r'$CASE_DIR/.casework/execution-plan.json'
if os.path.exists(ep):
    try:
        plan = json.load(open(ep, encoding='utf-8'))
        plans = plan.get('plans', [])
        reassess_plan = next((p for p in plans if p.get('phase') == 'reassess'), None)
        if reassess_plan:
            conclusion = reassess_plan.get('conclusion', {})
            result = f"{conclusion.get('type', '?')} → {conclusion.get('suggestedNextAction', '?')}"
            subprocess.run([sys.executable, r'$UPDATE_STATE',
              '--case-dir', r'$CASE_DIR', '--step', 'act',
              '--action', 'reassess', '--result', result], check=False)
    except: pass
```

- [x] **Step 2: Commit**

Commit: `2eec75f`

### Task 18: Patrol pipeline — Add reassess phases to streaming loop

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`

Add `investigating`, `reassessing`, `communicating` phases to patrol's streaming pipeline state machine. See `docs/superpowers/specs/2026-04-19-reassess-feedback-loop.md` § "Patrol pipeline changes" for full design.

- [x] **Step 1: Update state machine in patrol SKILL.md**

New phases in Step 6c polling loop:
```
case "investigating":  # troubleshooter completed, spawn reassess
case "reassessing":    # reassess completed, check for email action  
case "communicating":  # post-reassess email-drafter running
```

- [x] **Step 2: Update currentAction examples for reassess**

```bash
CURRENT_ACTION="0748 troubleshooter done → launching reassess"
CURRENT_ACTION="0748 reassess: found-cause → launching email(result-confirm)"
CURRENT_ACTION="0748 reassess: exhausted → no email, recommend ICM → summarizing"
```

- [x] **Step 3: Commit**

Commit: `efe0bad`

### Task 19: Frontend — Support reassess action card type

**Files:**
- Modify: `dashboard/src/components/patrol/PatrolCaseRow.tsx`

- [x] **Step 1: Add reassess to action type rendering**

In the Act step agent cards rendering, handle `type: "reassess"` with appropriate icon and result display format (`"found-cause → result-confirm"`).

- [x] **Step 2: Add subtype display for email-drafter**

When email-drafter has `subtype` field (set by reassess), show it in the card: `"Email: result-confirm"` instead of just `"Email"`.

- [x] **Step 3: Commit**

Commit: `d993511`

---

## Dependency Graph

```
Phase 1 (frontend):
  Task 1 (store) → Task 2 (sidebar) → Task 5 (layout)
  Task 1 (store) → Task 3 (case row) → Task 4 (case list) → Task 5 (layout)
  Task 5 → Task 6 (animations) → Task 7 (integration test)

Phase 2 (backend, after Phase 1):
  Task 8 (update-state.py schema) → Task 9 (event-wrapper delta)     ← script-only
                                  → Task 10 (teams tracking)         ← script-only
                                  → Task 11 (assess reasoning)       ← script-only
                                  → Task 13 (start step)             ← agent: 1-line cmd
                                  → Task 15 (finalize-state.sh)      ← script-only
  Task 12 (patrol progress fields) — independent                     ← agent: python3 template
  Task 14 (timing accuracy) — independent                            ← script-only (StateManager)

Phase 3: after Phase 1+2
```

### Agent Dependency Summary

| Task | Agent 需要做什么 | 失败后果 |
|------|-----------------|---------|
| **12** | 在 patrol-progress.json 写入 totalFound/skippedCount/warmupStatus/currentAction | Sidebar 显示 fallback 文本（"Querying…"） |
| **13** | Spawn 前调 `update-state.py --step start --status active` | Start 列显示 pending（无冷启动时间） |
| 其余 | 无 agent 依赖（纯脚本） | — |
