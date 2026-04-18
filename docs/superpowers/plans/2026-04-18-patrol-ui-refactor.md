# Patrol UI Full-Stack Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fragmented patrol progress tracking system (6 SSE event types, 3 separate writer scripts, 330-line patrolStore) with a unified `state.json` data model, 2 SSE events, and a new independent `/patrol` page with Pipeline Flow visualization.

**Architecture:** Bottom-up: build the new unified `update-state.py` writer first (Task 1-2), migrate all existing scripts to use it (Task 3-5), update the backend SSE/watcher layer (Task 6-7), then rebuild the frontend from store through page (Task 8-11). Delete old code last (Task 12).

**Tech Stack:** Python 3 (update-state.py), Bash (event-wrapper.sh), TypeScript + React + Zustand + TanStack Query (frontend), Hono (backend API), chokidar (file watcher), SSE (real-time events).

**Spec:** `docs/superpowers/specs/2026-04-18-patrol-ui-refactor-design.md`

**Design system:** All UI must follow `playbooks/guides/dashboard-design-system.md` — Sentry Light theme, CSS variables, Rubik + JetBrains Mono fonts.

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `.claude/skills/casework/scripts/update-state.py` | Unified atomic writer for `.casework/state.json` — replaces 3 scripts |
| `.claude/skills/casework/scripts/tests/test_update_state.py` | Tests for update-state.py |
| `dashboard/web/src/stores/patrolStore.ts` | Complete rewrite — 2 event handlers, clean types |
| `dashboard/web/src/pages/PatrolPage.tsx` | Independent `/patrol` route page |
| `dashboard/web/src/components/patrol/PatrolHeader.tsx` | Start/Cancel + elapsed timer + stat chips |
| `dashboard/web/src/components/patrol/PatrolGlobalPipeline.tsx` | 5-stage horizontal pipeline |
| `dashboard/web/src/components/patrol/PatrolCaseList.tsx` | Case list container |
| `dashboard/web/src/components/patrol/PatrolCaseRow.tsx` | Compact/expanded per-case row |

### Modified files

| File | What changes |
|------|-------------|
| `.claude/skills/casework/scripts/data-refresh.sh` | Replace `WRITE_EVENT` calls → `update-state.py --subtask`; output path `output/data-refresh.json` |
| `.claude/skills/casework/scripts/event-wrapper.sh` | Rewrite internals to call `update-state.py` instead of `write-event.sh` |
| `.claude/skills/casework/SKILL.md` | Replace `write-pipeline-state.sh` and `write-event.sh` calls → `update-state.py` |
| `.claude/skills/casework/act/SKILL.md` | Replace `update-pipeline-state.py` → `update-state.py` |
| `.claude/skills/casework/summarize/SKILL.md` | Replace `update-pipeline-state.py` → `update-state.py` |
| `.claude/skills/casework/teams-search/scripts/teams-search-inline.sh` | Replace `WRITE_EVENT` → `update-state.py` |
| `.claude/skills/patrol/SKILL.md` | Add `patrol-progress.json` writes alongside `patrol-phase` |
| `dashboard/src/watcher/file-watcher.ts` | Watch `state.json` instead of `events/` + `pipeline-state.json`; emit 2 event types |
| `dashboard/src/types/index.ts` | Add `patrol-state` and `patrol-case` SSE event types |
| `dashboard/src/config.ts` | Add `patrolProgressFile` getter |
| `dashboard/src/agent/patrol-orchestrator.ts` | Remove `scanPatrolProgress()`, simplify `getSdkPatrolLiveProgress()` |
| `dashboard/src/routes/case-routes.ts` | Simplify `GET /patrol/status` |
| `dashboard/src/routes/agents.ts` | Remove `/patrol-state` route |
| `dashboard/src/services/meta-reader.ts` | Remove `readPatrolState()` and `computeSecondsFromEvents()` |
| `dashboard/web/src/hooks/useSSE.ts` | Replace 6 patrol listeners → 2 |
| `dashboard/web/src/api/hooks.ts` | Remove `usePatrolState()` |
| `dashboard/web/src/pages/AgentMonitor.tsx` | Remove all patrol UI code (~350 lines), add link card |
| `dashboard/web/src/App.tsx` | Add `/patrol` route |
| `dashboard/web/src/components/Layout.tsx` | Add Patrol nav item |

### Deleted files

| File | Why |
|------|-----|
| `.claude/skills/casework/scripts/write-event.sh` | Merged into `update-state.py` |
| `.claude/skills/casework/scripts/write-pipeline-state.sh` | Merged into `update-state.py` |
| `.claude/skills/casework/act/scripts/update-pipeline-state.py` | Merged into `update-state.py` |
| `.claude/skills/casework/act/tests/test_update_pipeline_state.py` | Replaced by `test_update_state.py` |

---

## Task 1: `update-state.py` — Failing Tests

**Files:**
- Create: `.claude/skills/casework/scripts/tests/test_update_state.py`

- [ ] **Step 1: Create test file with all test cases**

```python
#!/usr/bin/env python3
"""Tests for update-state.py — unified .casework/state.json writer."""
import json, os, sys, tempfile, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'update-state.py')

def run(case_dir, args: list[str]) -> dict:
    """Run update-state.py and return the resulting state.json."""
    cmd = [sys.executable, SCRIPT, '--case-dir', case_dir] + args
    r = subprocess.run(cmd, capture_output=True, text=True)
    assert r.returncode == 0, f"FAIL (exit {r.returncode}): {r.stderr}"
    state_path = os.path.join(case_dir, '.casework', 'state.json')
    assert os.path.exists(state_path), f"state.json not created at {state_path}"
    return json.load(open(state_path, encoding='utf-8'))


def test_main_step_active():
    """--step data-refresh --status active creates state.json with step active."""
    with tempfile.TemporaryDirectory() as td:
        s = run(td, ['--step', 'data-refresh', '--status', 'active'])
        assert s['currentStep'] == 'data-refresh'
        assert s['steps']['data-refresh']['status'] == 'active'
        assert 'startedAt' in s['steps']['data-refresh']
        # Other steps should be pending
        assert s['steps']['assess']['status'] == 'pending'
        assert s['steps']['act']['status'] == 'pending'
        assert s['steps']['summarize']['status'] == 'pending'
        assert 'updatedAt' in s
    print('  ✓ main_step_active')


def test_main_step_completed():
    """Transitioning a step from active to completed sets completedAt and durationMs."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        s = run(td, ['--step', 'data-refresh', '--status', 'completed', '--duration-ms', '128701'])
        assert s['steps']['data-refresh']['status'] == 'completed'
        assert s['steps']['data-refresh']['durationMs'] == 128701
        assert 'completedAt' in s['steps']['data-refresh']
    print('  ✓ main_step_completed')


def test_step_transition_updates_current():
    """When assess becomes active, currentStep changes to assess."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'completed', '--duration-ms', '1000'])
        s = run(td, ['--step', 'assess', '--status', 'active'])
        assert s['currentStep'] == 'assess'
        assert s['steps']['data-refresh']['status'] == 'completed'
        assert s['steps']['assess']['status'] == 'active'
    print('  ✓ step_transition_updates_current')


def test_subtask_update():
    """--subtask d365 updates nested subtasks within data-refresh."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        s = run(td, ['--step', 'data-refresh', '--subtask', 'd365', '--status', 'completed', '--duration-ms', '50598'])
        subtasks = s['steps']['data-refresh']['subtasks']
        assert subtasks['d365']['status'] == 'completed'
        assert subtasks['d365']['durationMs'] == 50598
    print('  ✓ subtask_update')


def test_multiple_subtasks():
    """Multiple subtask updates accumulate."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        run(td, ['--step', 'data-refresh', '--subtask', 'd365', '--status', 'completed', '--duration-ms', '50000'])
        s = run(td, ['--step', 'data-refresh', '--subtask', 'teams', '--status', 'completed', '--duration-ms', '22000'])
        subtasks = s['steps']['data-refresh']['subtasks']
        assert subtasks['d365']['status'] == 'completed'
        assert subtasks['teams']['status'] == 'completed'
        assert subtasks['d365']['durationMs'] == 50000
        assert subtasks['teams']['durationMs'] == 22000
    print('  ✓ multiple_subtasks')


def test_action_update():
    """--action troubleshooter updates act step actions array."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'act', '--status', 'active'])
        s = run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'active'])
        actions = s['steps']['act']['actions']
        assert len(actions) == 1
        assert actions[0]['type'] == 'troubleshooter'
        assert actions[0]['status'] == 'active'
    print('  ✓ action_update')


def test_action_upsert():
    """Second call for same action type upserts, not appends."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'act', '--status', 'active'])
        run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'active'])
        s = run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'completed', '--duration-ms', '45000'])
        actions = s['steps']['act']['actions']
        assert len(actions) == 1
        assert actions[0]['status'] == 'completed'
        assert actions[0]['durationMs'] == 45000
    print('  ✓ action_upsert')


def test_multiple_actions():
    """Multiple different actions in act step."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'act', '--status', 'active'])
        run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'completed', '--duration-ms', '45000'])
        s = run(td, ['--step', 'act', '--action', 'email-drafter', '--status', 'active'])
        actions = s['steps']['act']['actions']
        assert len(actions) == 2
        assert actions[0]['type'] == 'troubleshooter'
        assert actions[0]['status'] == 'completed'
        assert actions[1]['type'] == 'email-drafter'
        assert actions[1]['status'] == 'active'
    print('  ✓ multiple_actions')


def test_result_annotation():
    """--result sets the result field on a step."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'assess', '--status', 'completed', '--result', 'pending-engineer'])
        s = run(td, [])  # read-only: just verify
        # Re-read to confirm persistence
        state_path = os.path.join(td, '.casework', 'state.json')
        s = json.load(open(state_path, encoding='utf-8'))
        assert s['steps']['assess']['result'] == 'pending-engineer'
    print('  ✓ result_annotation')


def test_case_number():
    """--case-number is persisted."""
    with tempfile.TemporaryDirectory() as td:
        s = run(td, ['--step', 'data-refresh', '--status', 'active', '--case-number', '2601290030000748'])
        assert s['caseNumber'] == '2601290030000748'
    print('  ✓ case_number')


def test_atomic_write():
    """state.json is written atomically (no .tmp file left behind)."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        casework_dir = os.path.join(td, '.casework')
        files = os.listdir(casework_dir)
        tmp_files = [f for f in files if '.tmp' in f]
        assert len(tmp_files) == 0, f"Temp files left behind: {tmp_files}"
    print('  ✓ atomic_write')


def test_init_creates_all_steps():
    """First call creates all 4 main steps in state.json."""
    with tempfile.TemporaryDirectory() as td:
        s = run(td, ['--step', 'data-refresh', '--status', 'active'])
        assert set(s['steps'].keys()) == {'data-refresh', 'assess', 'act', 'summarize'}
    print('  ✓ init_creates_all_steps')


if __name__ == '__main__':
    print('=== update-state.py tests ===')
    test_main_step_active()
    test_main_step_completed()
    test_step_transition_updates_current()
    test_subtask_update()
    test_multiple_subtasks()
    test_action_update()
    test_action_upsert()
    test_multiple_actions()
    test_result_annotation()
    test_case_number()
    test_atomic_write()
    test_init_creates_all_steps()
    print('=== all 12 tests passed ===')
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /c/Users/fangkun/Documents/Projects/EngineerBrain/src && python3 .claude/skills/casework/scripts/tests/test_update_state.py`
Expected: FAIL with `No such file or directory` (script doesn't exist yet)

- [ ] **Step 3: Commit test file**

```bash
git add .claude/skills/casework/scripts/tests/test_update_state.py
git commit -m "test: add update-state.py test suite (12 tests, all red)"
```

---

## Task 2: `update-state.py` — Implementation

**Files:**
- Create: `.claude/skills/casework/scripts/update-state.py`

- [ ] **Step 1: Implement update-state.py**

```python
#!/usr/bin/env python3
"""
Unified atomic writer for .casework/state.json.
Replaces: write-pipeline-state.sh, write-event.sh, update-pipeline-state.py.

Usage:
  # Main step transition
  update-state.py --case-dir <dir> --step data-refresh --status active
  update-state.py --case-dir <dir> --step data-refresh --status completed --duration-ms 128701

  # Substep (data-refresh subtasks, parallel)
  update-state.py --case-dir <dir> --step data-refresh --subtask d365 --status completed --duration-ms 50598

  # Action (act step actions, serial)
  update-state.py --case-dir <dir> --step act --action troubleshooter --status active
  update-state.py --case-dir <dir> --step act --action troubleshooter --status completed --duration-ms 45000

  # Result annotation
  update-state.py --case-dir <dir> --step assess --status completed --result pending-engineer

  # With case number
  update-state.py --case-dir <dir> --step data-refresh --status active --case-number 2601290030000748
"""
import argparse
import json
import os
import time

ALL_STEPS = ['data-refresh', 'assess', 'act', 'summarize']


def now_iso():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def load_state(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def init_state(case_number=''):
    return {
        'caseNumber': case_number,
        'updatedAt': now_iso(),
        'currentStep': '',
        'steps': {s: {'status': 'pending'} for s in ALL_STEPS},
    }


def atomic_write(path, data):
    data['updatedAt'] = now_iso()
    tmp = f'{path}.tmp.{os.getpid()}'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser(description='Unified .casework/state.json writer')
    ap.add_argument('--case-dir', required=True, help='Case directory path')
    ap.add_argument('--step', default='', help='Main step name (data-refresh, assess, act, summarize)')
    ap.add_argument('--status', default='', help='Status: pending|active|completed|failed|skipped')
    ap.add_argument('--subtask', default='', help='Subtask name within step (e.g. d365, teams)')
    ap.add_argument('--action', default='', help='Action type within act step (e.g. troubleshooter)')
    ap.add_argument('--duration-ms', type=int, default=0, help='Duration in milliseconds')
    ap.add_argument('--result', default='', help='Result annotation (e.g. pending-engineer)')
    ap.add_argument('--case-number', default='', help='Case number')
    args = ap.parse_args()

    casework_dir = os.path.join(args.case_dir, '.casework')
    os.makedirs(casework_dir, exist_ok=True)
    state_path = os.path.join(casework_dir, 'state.json')

    state = load_state(state_path)
    if state is None:
        state = init_state(args.case_number)
    elif args.case_number:
        state['caseNumber'] = args.case_number

    # Ensure all steps exist (idempotent)
    for s in ALL_STEPS:
        if s not in state.get('steps', {}):
            state.setdefault('steps', {})[s] = {'status': 'pending'}

    # No step specified = read-only (just re-write to update timestamp)
    if not args.step:
        atomic_write(state_path, state)
        return

    step_key = args.step
    step_state = state['steps'].get(step_key, {})

    # Subtask update (within a step, e.g. data-refresh → d365)
    if args.subtask:
        subtasks = step_state.get('subtasks', {})
        sub = subtasks.get(args.subtask, {})
        if args.status:
            sub['status'] = args.status
        if args.duration_ms:
            sub['durationMs'] = args.duration_ms
        subtasks[args.subtask] = sub
        step_state['subtasks'] = subtasks
        state['steps'][step_key] = step_state
        atomic_write(state_path, state)
        print(f'STATE|step={step_key}|subtask={args.subtask}|status={args.status}')
        return

    # Action update (within act step, e.g. troubleshooter)
    if args.action:
        actions = step_state.get('actions', [])
        # Find existing action or create new
        found = False
        for a in actions:
            if a.get('type') == args.action:
                if args.status:
                    a['status'] = args.status
                if args.duration_ms:
                    a['durationMs'] = args.duration_ms
                found = True
                break
        if not found:
            new_action = {'type': args.action}
            if args.status:
                new_action['status'] = args.status
            if args.duration_ms:
                new_action['durationMs'] = args.duration_ms
            actions.append(new_action)
        step_state['actions'] = actions
        state['steps'][step_key] = step_state
        atomic_write(state_path, state)
        print(f'STATE|step={step_key}|action={args.action}|status={args.status}')
        return

    # Main step status update
    if args.status:
        step_state['status'] = args.status
        if args.status == 'active':
            step_state['startedAt'] = now_iso()
            state['currentStep'] = step_key
        elif args.status in ('completed', 'failed'):
            step_state['completedAt'] = now_iso()
            if args.duration_ms:
                step_state['durationMs'] = args.duration_ms

    if args.result:
        step_state['result'] = args.result

    state['steps'][step_key] = step_state
    atomic_write(state_path, state)
    print(f'STATE|step={step_key}|status={args.status}')


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd /c/Users/fangkun/Documents/Projects/EngineerBrain/src && python3 .claude/skills/casework/scripts/tests/test_update_state.py`
Expected: `=== all 12 tests passed ===`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/scripts/update-state.py
git commit -m "feat: add unified update-state.py writer for .casework/state.json"
```

---

## Task 3: Migrate `data-refresh.sh` to `update-state.py`

**Files:**
- Modify: `.claude/skills/casework/scripts/data-refresh.sh`

This is the most complex migration — `data-refresh.sh` uses `write-event.sh` directly and via `event-wrapper.sh` for 6 subtasks (d365, teams, onenote, icm, attachments, data-refresh overall).

- [ ] **Step 1: Read current data-refresh.sh completely to map all write-event.sh and event-wrapper.sh call sites**

Run: `grep -n 'WRITE_EVENT\|write-event\|event-wrapper\|EVT_DIR\|\.casework/events' .claude/skills/casework/scripts/data-refresh.sh`

Identify each call site and its purpose (active start / completed / failed).

- [ ] **Step 2: Replace event directory setup**

In `data-refresh.sh`, replace the event directory setup block:

Old (around line 50-61):
```bash
EVT_DIR="$CASE_DIR_ABS/.casework/events"
OUT_DIR="$CASE_DIR_ABS/.casework"
WRAPPER="$HERE/event-wrapper.sh"
WRITE_EVENT="$HERE/write-event.sh"

# ── Reset .casework (preserve logs/) ──
rm -rf "$EVT_DIR"
rm -f "$OUT_DIR/data-refresh-output.json" "$OUT_DIR/delta-content.md" \
      "$OUT_DIR/.aggregate-status" "$OUT_DIR/.aggregate-stderr"
mkdir -p "$EVT_DIR"
```

New:
```bash
OUT_DIR="$CASE_DIR_ABS/.casework"
OUTPUT_DIR="$CASE_DIR_ABS/.casework/output"
UPDATE_STATE="$HERE/update-state.py"

# ── Reset .casework (preserve logs/) ──
rm -f "$OUTPUT_DIR/data-refresh.json" "$OUTPUT_DIR/delta-content.md" \
      "$OUT_DIR/state.json"
mkdir -p "$OUTPUT_DIR"
```

- [ ] **Step 3: Replace initial event emission**

Old (around line 66-67):
```bash
bash "$WRITE_EVENT" "$EVT_DIR/data-refresh.json" \
  "{\"task\":\"data-refresh\",\"status\":\"active\",\"startedAt\":\"$TOP_START_TS\",\"caseNumber\":\"$CASE_NUMBER\"}"
```

New:
```bash
python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh --status active --case-number "$CASE_NUMBER"
```

- [ ] **Step 4: Replace all event-wrapper.sh calls for subtasks (d365, icm, onenote, attachments) with update-state.py calls**

Each `event-wrapper.sh` call wrapping a subtask command needs to be replaced with:
1. Pre-command: `python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh --subtask <name> --status active`
2. Run the actual command
3. Post-command (on success): `python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh --subtask <name> --status completed --duration-ms $DUR`
4. Post-command (on failure): `python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh --subtask <name> --status failed`

The exact substitution depends on how each subtask is currently wrapped. Read the current file to identify exact patterns.

- [ ] **Step 5: Replace teams WRITE_EVENT call in teams-search-inline.sh**

In `teams-search-inline.sh` (line ~37), replace the `WRITE_EVENT` usage with `update-state.py`:
```bash
# Old
WRITE_EVENT="$PROJECT_ROOT/.claude/skills/casework/scripts/write-event.sh"
# New
UPDATE_STATE="$PROJECT_ROOT/.claude/skills/casework/scripts/update-state.py"
```

And replace all `bash "$WRITE_EVENT" "$EVT_DIR/teams.json" ...` calls with:
```bash
python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status active
# ... command ...
python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask teams --status completed --duration-ms $DUR
```

- [ ] **Step 6: Replace final data-refresh completion event and output path**

Old:
```bash
bash "$WRITE_EVENT" "$EVT_DIR/data-refresh.json" \
  "{\"task\":\"data-refresh\",\"status\":\"completed\",...}"
```

New:
```bash
python3 "$UPDATE_STATE" --case-dir "$CASE_DIR_ABS" --step data-refresh --status completed --duration-ms $DUR
```

Also change the output file path from `data-refresh-output.json` to `output/data-refresh.json`.

- [ ] **Step 7: Update aggregate output paths**

Replace `.aggregate-status` and `.aggregate-stderr` writes with `logs/aggregate.log`:
```bash
# Old
echo '...' > "$OUT_DIR/.aggregate-status"
# New
echo '...' >> "$OUT_DIR/logs/aggregate.log"
```

- [ ] **Step 8: Test manually by running data-refresh on a real case**

Run: `cd /c/Users/fangkun/Documents/Projects/EngineerBrain/src && bash .claude/skills/casework/scripts/data-refresh.sh --case-number <test-case-number> --case-dir ./cases/active/<test-case-number>`

Verify: `.casework/state.json` is created with subtask progress. No `events/` directory created. `output/data-refresh.json` exists.

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/casework/scripts/data-refresh.sh \
  .claude/skills/casework/teams-search/scripts/teams-search-inline.sh
git commit -m "refactor: migrate data-refresh.sh to update-state.py writer"
```

---

## Task 4: Rewrite `event-wrapper.sh`

**Files:**
- Modify: `.claude/skills/casework/scripts/event-wrapper.sh`

- [ ] **Step 1: Rewrite event-wrapper.sh to use update-state.py**

The wrapper still serves the same purpose (wrap a command with active/completed/failed progress), but now writes to `state.json` via `update-state.py` instead of `events/*.json` via `write-event.sh`.

```bash
#!/usr/bin/env bash
# event-wrapper.sh — wrap a command with state.json progress tracking
#
# Usage: event-wrapper.sh <task-name> <case-dir> -- <command> [args...]
#
# Note: Interface changed from v1. Second arg is now case-dir (was event-dir).
# The --step is always 'data-refresh' and --subtask is the task-name.
set -uo pipefail

TASK="${1:?task required}"; shift
CASE_DIR="${1:?case-dir required}"; shift
if [ "${1:-}" = "--" ]; then shift; fi

if [ $# -eq 0 ]; then
  echo "event-wrapper: no command supplied" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPDATE_STATE="$SCRIPT_DIR/update-state.py"

if [ ! -f "$UPDATE_STATE" ]; then
  echo "event-wrapper: update-state.py not found at $UPDATE_STATE" >&2
  exit 2
fi

START_NS=$(date +%s%N)

python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask "$TASK" --status active

set +e
"$@"
EXIT=$?
set -e

DUR_MS=$(( ($(date +%s%N) - START_NS) / 1000000 ))

if [ $EXIT -eq 0 ]; then
  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask "$TASK" --status completed --duration-ms "$DUR_MS"
else
  python3 "$UPDATE_STATE" --case-dir "$CASE_DIR" --step data-refresh --subtask "$TASK" --status failed
fi
exit $EXIT
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/casework/scripts/event-wrapper.sh
git commit -m "refactor: rewrite event-wrapper.sh to use update-state.py"
```

---

## Task 5: Update SKILL.md Files

**Files:**
- Modify: `.claude/skills/casework/SKILL.md`
- Modify: `.claude/skills/casework/act/SKILL.md`
- Modify: `.claude/skills/casework/summarize/SKILL.md`
- Modify: `.claude/skills/patrol/SKILL.md`

- [ ] **Step 1: Update casework/SKILL.md**

Replace all occurrences of:
- `bash .claude/skills/casework/scripts/write-pipeline-state.sh "$CASE_DIR" <step> [completed...]` → `python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step <step> --status active`
- `bash .claude/skills/casework/scripts/write-event.sh "$EVT_DIR/assess.json" ...` → `python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step assess --status active`
- Final `write-pipeline-state.sh "$CASE_DIR" done ...` → `python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step summarize --status completed`
- Remove `EVT_DIR` variable setup
- Update output path references: `data-refresh-output.json` → `output/data-refresh.json`

Each of the 5 pipeline-state calls (data-refresh, assess, act, summarize, done) and 6 event calls (assess start/end, act start/end, summarize start/end) needs individual replacement. See spec §1 "Scripts affected" table.

- [ ] **Step 2: Update act/SKILL.md**

Replace all `python3 .claude/skills/casework/act/scripts/update-pipeline-state.py` calls with `python3 .claude/skills/casework/scripts/update-state.py`:

Old: `python3 .claude/skills/casework/act/scripts/update-pipeline-state.py --case-dir "$CASE_DIR" --step troubleshooter --status running`
New: `python3 .claude/skills/casework/scripts/update-state.py --case-dir "$CASE_DIR" --step act --action troubleshooter --status active`

Note the semantic change: old script treated troubleshooter as a "step"; new script treats it as an "action" within the "act" step.

- [ ] **Step 3: Update summarize/SKILL.md**

Same pattern as act/SKILL.md. Replace `update-pipeline-state.py` calls with `update-state.py` calls.

- [ ] **Step 4: Update patrol/SKILL.md**

Add `patrol-progress.json` writes alongside existing `patrol-phase` writes. At each phase transition:

```bash
# Existing (keep for CLI backward compat)
echo "discovering" > "{patrolDir}/patrol-phase"

# New: structured JSON for WebUI
python3 -c "
import json, os, time
p = '{patrolDir}/patrol-progress.json'
d = {'phase':'discovering','startedAt':'$(date -u +%FT%TZ)','source':'$SOURCE','updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
tmp = p + '.tmp.' + str(os.getpid())
json.dump(d, open(tmp,'w'), indent=2)
os.replace(tmp, p)
"
```

Repeat for each phase: `discovering`, `filtering`, `warming-up`, `processing`, `aggregating`, `completed`, `failed`. The `processing` phase should include `totalCases`, `changedCases`, `caseList`.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/SKILL.md \
  .claude/skills/casework/act/SKILL.md \
  .claude/skills/casework/summarize/SKILL.md \
  .claude/skills/patrol/SKILL.md
git commit -m "refactor: update all SKILL.md files to use update-state.py"
```

---

## Task 6: Backend — SSE Types & Config

**Files:**
- Modify: `dashboard/src/types/index.ts`
- Modify: `dashboard/src/config.ts`

- [ ] **Step 1: Add new SSE event types**

In `dashboard/src/types/index.ts`, add to the `SSEEventType` union:

```typescript
  | 'patrol-state'          // New: replaces patrol-updated + patrol-progress
  | 'patrol-case'           // New: replaces patrol-case-completed + patrol-pipeline-update + case-subtask-progress
```

Keep the old types for now (they'll be removed when file-watcher is updated in Task 7). This avoids breaking the build during transition.

- [ ] **Step 2: Add `patrolProgressFile` to config**

In `dashboard/src/config.ts`, add after `patrolStateFile`:

```typescript
  get patrolProgressFile() {
    return join(this.patrolDir, 'patrol-progress.json')
  },
```

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/types/index.ts dashboard/src/config.ts
git commit -m "feat: add patrol-state and patrol-case SSE types, patrolProgressFile config"
```

---

## Task 7: Backend — File Watcher Refactor

**Files:**
- Modify: `dashboard/src/watcher/file-watcher.ts`

- [ ] **Step 1: Replace patrol-related `classifyChange()` branches**

In `classifyChange()`, replace the following blocks:

1. **Remove** the `casework-meta.json` patrol completion detection block (lines ~63-92 in the current file — the block that checks patrol.lock and emits `patrol-case-completed` + `patrol-progress`).

2. **Remove** the `events/*.json` handler (lines ~99-107 — the `case-subtask-progress` block).

3. **Remove** the `pipeline-state.json` handler (lines ~109-129 — the `patrol-pipeline-update` block).

4. **Remove** the `execution-plan.json` handler (lines ~131-142 — the second `patrol-pipeline-update` block).

5. **Add** new `state.json` handler in the case files section:

```typescript
    // Per-case state (unified progress tracking)
    if (normalized.endsWith('/.casework/state.json')) {
      try {
        const caseState = JSON.parse(readFileSync(filePath, 'utf-8'))
        return { type: 'patrol-case' as SSEEventType, data: caseState }
      } catch { return null }
    }
```

6. **Replace** the `patrol-state.json` handler (line ~153) to watch `patrol-progress.json`:

```typescript
    // Patrol progress (structured JSON)
    if (normalized.includes('patrol-progress.json')) {
      try {
        const progress = JSON.parse(readFileSync(filePath, 'utf-8'))
        return { type: 'patrol-state' as SSEEventType, data: progress }
      } catch { return null }
    }
```

7. **Keep** the `patrol.lock` handler but change event type to `patrol-state`:

```typescript
    if (normalized.endsWith('patrol.lock')) {
      try {
        if (existsSync(filePath)) {
          const lock = JSON.parse(readFileSync(filePath, 'utf-8'))
          return { type: 'patrol-state' as SSEEventType, data: { phase: 'starting', source: lock.source } }
        } else {
          return { type: 'patrol-state' as SSEEventType, data: { phase: 'idle' } }
        }
      } catch { return null }
    }
```

8. **Keep** the `patrol-phase` handler as-is (backward compat for CLI).

- [ ] **Step 2: Update watchPaths**

In `startFileWatcher()`, update the watch paths:

```typescript
  const watchPaths = [
    config.activeCasesDir,
    config.todoDir,
    config.patrolProgressFile,   // New: replaces patrolStateFile
    config.patrolStateFile,      // Keep: still written by patrol skill on completion
    join(config.patrolDir, 'patrol.lock'),
    join(config.patrolDir, 'patrol-phase'),
    config.cronJobsFile,
    // ... test paths unchanged ...
  ]
```

- [ ] **Step 3: Remove `patrolCompletedCases` tracking variable**

Delete `let patrolCompletedCases = new Set<string>()` and its reset in the patrol.lock handler. The new `state.json` carries completion status directly.

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/watcher/file-watcher.ts
git commit -m "refactor: file-watcher watches state.json, emits patrol-state + patrol-case"
```

---

## Task 8: Backend — Patrol Orchestrator & Routes Simplification

**Files:**
- Modify: `dashboard/src/agent/patrol-orchestrator.ts`
- Modify: `dashboard/src/routes/case-routes.ts`
- Modify: `dashboard/src/routes/agents.ts`
- Modify: `dashboard/src/services/meta-reader.ts`

- [ ] **Step 1: Simplify patrol-orchestrator.ts**

1. **Delete** `scanPatrolProgress()` function (~105 lines, lines 174-278).
2. **Delete** the `progressInterval = setInterval(scanPatrolProgress, 8_000)` setup and its cleanup.
3. **Delete** all tracking variables: `lastBroadcastPhase`, `lastBroadcastProcessed`, `lastBroadcastTotal`, `caseListSent`.
4. **Simplify** `getSdkPatrolLiveProgress()` to just read `patrol-progress.json`:

```typescript
export function getSdkPatrolLiveProgress(): Record<string, unknown> | null {
  const lock = readLock()
  if (!lock) return null

  const result: Record<string, unknown> = {
    source: lock.source,
    startedAt: lock.startedAt,
    force: lock.force,
    sessionId: lock.sessionId || null,
  }

  // Read patrol-progress.json (written by patrol skill)
  try {
    const progressFile = config.patrolProgressFile
    if (existsSync(progressFile)) {
      const progress = JSON.parse(readFileSync(progressFile, 'utf-8'))
      Object.assign(result, progress)
    }
  } catch { /* ignore */ }

  return result
}
```

- [ ] **Step 2: Simplify GET /patrol/status route**

In `case-routes.ts`, simplify the `/patrol/status` handler:

```typescript
caseRoutes.get('/patrol/status', (c) => {
  const running = isSdkPatrolRunning()
  return c.json({
    running,
    liveProgress: running ? getSdkPatrolLiveProgress() : null,
    lastRun: loadPatrolLastRun(),
  })
})
```

- [ ] **Step 3: Remove /patrol-state route from agents.ts**

In `agents.ts`, delete the `/patrol-state` GET handler and remove the `readPatrolState` import.

- [ ] **Step 4: Clean up meta-reader.ts**

In `meta-reader.ts`, remove `readPatrolState()` and `computeSecondsFromEvents()` functions. Keep `readCaseMeta()` — it's still used elsewhere.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/agent/patrol-orchestrator.ts \
  dashboard/src/routes/case-routes.ts \
  dashboard/src/routes/agents.ts \
  dashboard/src/services/meta-reader.ts
git commit -m "refactor: simplify patrol-orchestrator, remove dual-track polling"
```

---

## Task 9: Frontend — PatrolStore Rewrite

**Files:**
- Rewrite: `dashboard/web/src/stores/patrolStore.ts`

- [ ] **Step 1: Write new patrolStore.ts from scratch**

```typescript
/**
 * patrolStore.ts — Zustand store for patrol progress (v3 rewrite)
 *
 * Consumes 2 SSE events: patrol-state, patrol-case.
 * Replaces v2 store (12 actions → 2 handlers).
 */
import { create } from 'zustand'

// ─── Types ───

export type PatrolPhase =
  | 'idle' | 'starting' | 'discovering' | 'filtering'
  | 'warming-up' | 'processing' | 'aggregating'
  | 'completed' | 'failed'

export type StepStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped'

export interface SubtaskState {
  status: StepStatus
  durationMs?: number
}

export interface ActionState {
  type: string
  status: StepStatus
  durationMs?: number
}

export interface StepState {
  status: StepStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  result?: string
  subtasks?: Record<string, SubtaskState>
  actions?: ActionState[]
}

export interface CaseState {
  caseNumber: string
  currentStep?: string
  steps: Record<string, StepState>
  updatedAt?: string
}

// ─── Store ───

interface PatrolStore {
  // Global
  phase: PatrolPhase
  totalCases: number
  changedCases: number
  processedCases: number
  startedAt?: string
  completedAt?: string
  error?: string
  caseList: string[]

  // Per-case
  cases: Record<string, CaseState>

  // SSE handlers
  onPatrolState: (data: Record<string, unknown>) => void
  onCaseUpdate: (data: Record<string, unknown>) => void

  // User actions
  start: () => void
  reset: () => void
}

function deriveProcessedCount(cases: Record<string, CaseState>): number {
  return Object.values(cases).filter(c => {
    const sum = c.steps?.summarize
    const act = c.steps?.act
    return sum?.status === 'completed' || sum?.status === 'skipped'
      || (act?.status === 'completed' && sum?.status !== 'active')
  }).length
}

export const usePatrolStore = create<PatrolStore>()((set, get) => ({
  phase: 'idle',
  totalCases: 0,
  changedCases: 0,
  processedCases: 0,
  startedAt: undefined,
  completedAt: undefined,
  error: undefined,
  caseList: [],
  cases: {},

  onPatrolState: (data) => set(() => {
    const phase = (data.phase as PatrolPhase) || 'idle'
    const update: Partial<PatrolStore> = { phase }

    if (data.totalCases !== undefined) update.totalCases = data.totalCases as number
    if (data.changedCases !== undefined) update.changedCases = data.changedCases as number
    if (data.processedCases !== undefined) update.processedCases = data.processedCases as number
    if (data.startedAt) update.startedAt = data.startedAt as string
    if (data.error) update.error = data.error as string
    if (data.caseList && Array.isArray(data.caseList)) update.caseList = data.caseList as string[]
    if (phase === 'completed') update.completedAt = new Date().toISOString()
    if (phase === 'starting') {
      update.cases = {}
      update.processedCases = 0
      update.error = undefined
      update.completedAt = undefined
    }

    return update
  }),

  onCaseUpdate: (data) => set((state) => {
    const caseNumber = data.caseNumber as string
    if (!caseNumber) return state

    const caseState: CaseState = {
      caseNumber,
      currentStep: data.currentStep as string | undefined,
      steps: (data.steps as Record<string, StepState>) || {},
      updatedAt: data.updatedAt as string | undefined,
    }

    const newCases = { ...state.cases, [caseNumber]: caseState }
    const processedCases = deriveProcessedCount(newCases)

    return { cases: newCases, processedCases }
  }),

  start: () => set({
    phase: 'starting',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    cases: {},
    error: undefined,
    completedAt: undefined,
    startedAt: new Date().toISOString(),
  }),

  reset: () => set({
    phase: 'idle',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    cases: {},
    caseList: [],
    error: undefined,
    startedAt: undefined,
    completedAt: undefined,
  }),
}))
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/stores/patrolStore.ts
git commit -m "feat: rewrite patrolStore — 2 handlers, clean types"
```

---

## Task 10: Frontend — Patrol Page Components

**Files:**
- Create: `dashboard/web/src/pages/PatrolPage.tsx`
- Create: `dashboard/web/src/components/patrol/PatrolHeader.tsx`
- Create: `dashboard/web/src/components/patrol/PatrolGlobalPipeline.tsx`
- Create: `dashboard/web/src/components/patrol/PatrolCaseList.tsx`
- Create: `dashboard/web/src/components/patrol/PatrolCaseRow.tsx`
- Modify: `dashboard/web/src/App.tsx`
- Modify: `dashboard/web/src/components/Layout.tsx`

This is the largest task. The engineer should read `playbooks/guides/dashboard-design-system.md` before starting and follow the existing component patterns (CSS variables, lucide-react icons, Tailwind classes).

- [ ] **Step 1: Create PatrolHeader.tsx**

Start/Cancel button, stat chips (total/completed/active/queued), elapsed timer. Use `useStartPatrol()` and `useCancelPatrol()` from `api/hooks.ts`. Read patrol store for phase/counts.

- [ ] **Step 2: Create PatrolGlobalPipeline.tsx**

5-stage horizontal pipeline: Discover → Filter → Warmup → Process → Aggregate. Each stage is a circle node with status color + connector line. Map patrol `phase` to which stages are completed/active/pending.

- [ ] **Step 3: Create PatrolCaseRow.tsx**

Hybrid component: compact mode (nested dots) and expanded mode (inline chips). Auto-expand when case has `currentStep` that isn't completed. Implementation reference: mockup ★ from brainstorming session.

Key layout rules:
- Data-refresh subtasks: side-by-side chips, no arrows (parallel)
- Act actions: chips connected with `→` arrows (serial)
- Skipped actions: 40% opacity + "skip" label
- Status colors: use CSS variables `--accent-green`, `--accent-blue`, `--accent-red`, `--text-tertiary`

- [ ] **Step 4: Create PatrolCaseList.tsx**

Container that maps `usePatrolStore` cases to `PatrolCaseRow` components. Sort: processing first, then queued, then completed.

- [ ] **Step 5: Create PatrolPage.tsx**

Compose: PatrolHeader + progress bar + PatrolGlobalPipeline + PatrolCaseList. Add SSE reconnect hydration: on mount, fetch `/patrol/status` to seed the store.

```typescript
import { usePatrolStore } from '../stores/patrolStore'
import PatrolHeader from '../components/patrol/PatrolHeader'
import PatrolGlobalPipeline from '../components/patrol/PatrolGlobalPipeline'
import PatrolCaseList from '../components/patrol/PatrolCaseList'

export default function PatrolPage() {
  const phase = usePatrolStore((s) => s.phase)

  // Hydrate store from backend on mount
  useEffect(() => {
    fetch('/api/patrol/status')
      .then(r => r.json())
      .then(status => {
        if (status.running && status.liveProgress) {
          usePatrolStore.getState().onPatrolState(status.liveProgress)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <PatrolHeader />
      <PatrolGlobalPipeline />
      <PatrolCaseList />
    </div>
  )
}
```

- [ ] **Step 6: Add route and nav item**

In `App.tsx`, add:
```typescript
import PatrolPage from './pages/PatrolPage'
// In Routes:
<Route path="/patrol" element={<PatrolPage />} />
```

In `Layout.tsx`, add nav item after Agents:
```typescript
{ path: '/patrol', label: 'Patrol', icon: '🔄' },
```

- [ ] **Step 7: Commit**

```bash
git add dashboard/web/src/pages/PatrolPage.tsx \
  dashboard/web/src/components/patrol/ \
  dashboard/web/src/App.tsx \
  dashboard/web/src/components/Layout.tsx
git commit -m "feat: add independent Patrol page with Pipeline Flow UI"
```

---

## Task 11: Frontend — useSSE & AgentMonitor Cleanup

**Files:**
- Modify: `dashboard/web/src/hooks/useSSE.ts`
- Modify: `dashboard/web/src/api/hooks.ts`
- Modify: `dashboard/web/src/pages/AgentMonitor.tsx`

- [ ] **Step 1: Replace patrol SSE listeners in useSSE.ts**

Remove all 6 patrol-related event listeners and their handler imports. Add 2 new listeners:

```typescript
import { usePatrolStore } from '../stores/patrolStore'

// In the SSE setup:
const patrolOnState = usePatrolStore((s) => s.onPatrolState)
const patrolOnCase = usePatrolStore((s) => s.onCaseUpdate)

// Replace all patrol-* listeners with:
es.addEventListener('patrol-state', (e) => {
  const data = JSON.parse(e.data)
  patrolOnState(data.data || data)
})

es.addEventListener('patrol-case', (e) => {
  const data = JSON.parse(e.data)
  patrolOnCase(data.data || data)
})
```

Remove:
- `es.addEventListener('patrol-updated', ...)`
- `es.addEventListener('patrol-progress', ...)`
- `es.addEventListener('patrol-case-completed', ...)`
- `es.addEventListener('patrol-pipeline-update', ...)`
- All `patrolOnProgress`, `patrolOnCaseCompleted`, `patrolOnCaseStepUpdate`, `patrolOnSubtaskUpdate` variables
- The SSE reconnect patrol reconciliation block (~lines 934-960)

- [ ] **Step 2: Remove usePatrolState() from hooks.ts**

Delete the `usePatrolState()` function. Keep `useStartPatrol()` and `useCancelPatrol()`.

- [ ] **Step 3: Clean AgentMonitor.tsx**

Remove:
- All `usePatrolStore` imports and selectors (~15 lines starting at line 717)
- The `patrolCollapsed` state and `useEffect` (~10 lines starting at line 730)
- The patrol polling `useEffect` (~30 lines starting at line 747)
- All patrol UI JSX (~300 lines starting at line 1023 through ~1350)
- The `usePatrolState`, `useCancelPatrol` imports
- Auto-refresh interval that references `isRunning`

Add a simple link card where the patrol section was:

```tsx
{/* Patrol — link to dedicated page */}
<Card>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span>🔄</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Patrol</span>
    </div>
    <a
      href="/patrol"
      className="text-sm px-3 py-1.5 rounded-lg transition-colors"
      style={{ color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)' }}
    >
      Open Patrol →
    </a>
  </div>
</Card>
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/hooks/useSSE.ts \
  dashboard/web/src/api/hooks.ts \
  dashboard/web/src/pages/AgentMonitor.tsx
git commit -m "refactor: clean patrol code from useSSE, hooks, AgentMonitor"
```

---

## Task 12: Delete Old Scripts & Clean SSE Types

**Files:**
- Delete: `.claude/skills/casework/scripts/write-event.sh`
- Delete: `.claude/skills/casework/scripts/write-pipeline-state.sh`
- Delete: `.claude/skills/casework/act/scripts/update-pipeline-state.py`
- Delete: `.claude/skills/casework/act/tests/test_update_pipeline_state.py`
- Modify: `dashboard/src/types/index.ts`

- [ ] **Step 1: Delete old scripts**

```bash
git rm .claude/skills/casework/scripts/write-event.sh
git rm .claude/skills/casework/scripts/write-pipeline-state.sh
git rm .claude/skills/casework/act/scripts/update-pipeline-state.py
git rm .claude/skills/casework/act/tests/test_update_pipeline_state.py
```

- [ ] **Step 2: Remove old SSE event types**

In `dashboard/src/types/index.ts`, remove from the `SSEEventType` union:
- `'patrol-updated'`
- `'patrol-progress'`
- `'patrol-case-completed'`
- `'case-subtask-progress'`
- `'patrol-pipeline-update'`

Keep `'patrol-state'` and `'patrol-case'` (added in Task 6).

- [ ] **Step 3: Build check**

Run: `cd dashboard && npx tsc --noEmit`
Expected: No type errors (all references to removed types have been cleaned up in prior tasks).

- [ ] **Step 4: Run update-state.py tests**

Run: `cd /c/Users/fangkun/Documents/Projects/EngineerBrain/src && python3 .claude/skills/casework/scripts/tests/test_update_state.py`
Expected: `=== all 12 tests passed ===`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: delete old patrol scripts, clean SSE types"
```

---

## Verification Checklist

After all tasks complete:

- [ ] `python3 .claude/skills/casework/scripts/tests/test_update_state.py` → all 12 pass
- [ ] `cd dashboard && npx tsc --noEmit` → no type errors
- [ ] `cd dashboard/web && npx tsc --noEmit` → no type errors
- [ ] Dashboard loads at `http://localhost:5173`
- [ ] `/patrol` page renders with Start button
- [ ] `/agents` page renders without patrol section (only link card)
- [ ] No references to `write-event.sh`, `write-pipeline-state.sh`, or `update-pipeline-state.py` remain in any SKILL.md
- [ ] No references to deleted SSE types (`patrol-updated`, `patrol-progress`, etc.) remain in frontend code
