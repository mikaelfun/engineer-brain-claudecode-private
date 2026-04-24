# Patrol RunId + Run Directory Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add patrol-level runId with per-run script output logging, restructure case-level run directories (`output/` → `data-refresh/`, `scripts/` → `data-refresh/logs/`), and add per-run snapshots of claims.json and decision files.

**Architecture:** Two-layer runId model — patrol generates a patrol-level runId stored in `.patrol/runs/{runId}/`, each case gets its own per-case runId (existing) linked by a `parentRunId` field. Run directories restructured to group data-refresh artifacts together. Claims.json and decision files get per-run snapshots while maintaining `.casework/` current-state copies for consumers.

**Tech Stack:** Bash, Python3, existing `update-state.py` / `update-phase.py`

---

## File Structure

### New files
- `.claude/skills/patrol/scripts/patrol-init.sh` — modify (add runId generation + log redirection)
- `.claude/skills/patrol/scripts/patrol-finalize.sh` — modify (add runId reading + output logging)

### Modified files
- `.claude/skills/casework/scripts/update-state.py` — add `--parent-run-id` param, rename `create_run_dir` subdirs
- `.claude/skills/casework/scripts/data-refresh.sh` — update path vars (`LOGD`, `OUTPUT_DIR`, `SUBTASK_DIR`) to new structure
- `.claude/skills/patrol/SKILL.md` — add runId extraction + pass parentRunId to casework spawn
- `dashboard/src/agent/patrol-orchestrator.ts` — move SDK session log to run dir
- `playbooks/schemas/case-directory.md` — update documentation

### Run directory structure changes

**Before (case-level):**
```
.casework/runs/{runId}/
├── scripts/           ← data-refresh script logs
├── output/            ← data-refresh structured output
│   ├── data-refresh.json
│   ├── delta-content.md
│   └── subtasks/
├── agents/            ← subagent output logs
└── execution-plan.json
```

**After (case-level):**
```
.casework/runs/{runId}/
├── data-refresh/              ← Step 1 all artifacts grouped
│   ├── data-refresh.json
│   ├── delta-content.md
│   ├── subtasks/
│   │   ├── d365.json
│   │   ├── teams.json
│   │   └── icm.json
│   └── logs/                  ← script execution logs (was scripts/)
│       ├── d365.log
│       ├── teams.log
│       └── aggregate.log
├── agents/                    ← subagent output logs (unchanged)
├── execution-plan.json        ← Step 2 assess output
├── claims.json                ← NEW: per-run snapshot from troubleshooter
├── assess-decision.json       ← NEW: moved from .casework/ root
└── reassess-decision.json     ← NEW: moved from .casework/ root
```

**New (patrol-level):**
```
.patrol/runs/{runId}/
├── run-info.json              ← {runId, startedAt, source, cases:[...]}
├── scripts/
│   ├── patrol-init.json       ← init stdout JSON
│   ├── list-active-cases.log
│   ├── detect-case-status.log
│   ├── ir-check.log
│   ├── warmup.log
│   └── patrol-finalize.json   ← finalize stdout JSON
└── sdk-session.jsonl          ← moved from .patrol/logs/
```

---

### Task 1: Update `update-state.py` — new subdirs + parentRunId

**Files:**
- Modify: `.claude/skills/casework/scripts/update-state.py:52-76`

- [ ] **Step 1: Change `create_run_dir` subdirectory names**

In `.claude/skills/casework/scripts/update-state.py`, find line 60:
```python
    for subdir in ['scripts', 'output', 'output/subtasks', 'agents']:
```

Replace with:
```python
    for subdir in ['data-refresh', 'data-refresh/subtasks', 'data-refresh/logs', 'agents']:
```

- [ ] **Step 2: Add `--parent-run-id` argument**

In the `main()` function, after line 143 (`ap.add_argument('--case-number'...`), add:
```python
    ap.add_argument('--parent-run-id', default='', help='Parent patrol runId (for linking case runs to patrol runs)')
```

- [ ] **Step 3: Store parentRunId in state.json during init**

In the `init_state` function (line 65), add the parameter and field:

Change the function signature from:
```python
def init_state(case_number='', run_id='', run_type=''):
```
to:
```python
def init_state(case_number='', run_id='', run_type='', parent_run_id=''):
```

Inside the function, after `state['runType'] = run_type` (line 75), add:
```python
    if parent_run_id:
        state['parentRunId'] = parent_run_id
```

And in `main()`, where `init_state` is called (line 168), change:
```python
            state = init_state(case_num, run_id, run_type)
```
to:
```python
            state = init_state(case_num, run_id, run_type, args.parent_run_id)
```

- [ ] **Step 4: Verify syntax**

Run: `python3 -m py_compile .claude/skills/casework/scripts/update-state.py`
Expected: no output (syntax OK)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/casework/scripts/update-state.py
git commit -m "refactor: update-state.py — rename run subdirs + add parentRunId

- scripts/ → data-refresh/logs/, output/ → data-refresh/
- Add --parent-run-id arg for linking case runs to patrol runs"
```

---

### Task 2: Update `data-refresh.sh` — use new directory structure

**Files:**
- Modify: `.claude/skills/casework/scripts/data-refresh.sh:76-96`

- [ ] **Step 1: Update path variables for new structure**

In `data-refresh.sh`, find lines 77-80:
```bash
  RUN_DIR="$OUT_DIR/runs/$RUN_ID"
  OUTPUT_DIR="$RUN_DIR/output"
  SUBTASK_DIR="$RUN_DIR/output/subtasks"
  LOGD="$RUN_DIR/scripts"
```

Replace with:
```bash
  RUN_DIR="$OUT_DIR/runs/$RUN_ID"
  OUTPUT_DIR="$RUN_DIR/data-refresh"
  SUBTASK_DIR="$RUN_DIR/data-refresh/subtasks"
  LOGD="$RUN_DIR/data-refresh/logs"
```

- [ ] **Step 2: Update fallback path variables**

Find lines 84-87 (fallback block):
```bash
  OUTPUT_DIR="$RUN_DIR/output"
  SUBTASK_DIR="$RUN_DIR/output/subtasks"
  LOGD="$RUN_DIR/scripts"
```

Replace with:
```bash
  OUTPUT_DIR="$RUN_DIR/data-refresh"
  SUBTASK_DIR="$RUN_DIR/data-refresh/subtasks"
  LOGD="$RUN_DIR/data-refresh/logs"
```

- [ ] **Step 3: Verify syntax**

Run: `bash -n .claude/skills/casework/scripts/data-refresh.sh`
Expected: no output (syntax OK)

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/casework/scripts/data-refresh.sh
git commit -m "refactor: data-refresh.sh — use data-refresh/ dir structure

output/ → data-refresh/, scripts/ → data-refresh/logs/"
```

---

### Task 3: Update `resolve-run-path.sh` — handle legacy `output/` fallback

**Files:**
- Modify: `.claude/skills/casework/scripts/resolve-run-path.sh`

Consumers may call `resolve-run-path.sh $CASE_DIR output/data-refresh.json`. After the rename, the canonical path is `data-refresh/data-refresh.json`. Add a mapping layer so old callers still work.

- [ ] **Step 1: Add path mapping for backward compatibility**

Replace the final output section of `resolve-run-path.sh` (after the `RUN_ID` extraction) with:

```bash
# ── Path mapping: old → new (backward compat) ──
map_path() {
  local p="$1"
  case "$p" in
    output/*)          echo "data-refresh/${p#output/}" ;;
    scripts/*)         echo "data-refresh/logs/${p#scripts/}" ;;
    output)            echo "data-refresh" ;;
    scripts)           echo "data-refresh/logs" ;;
    *)                 echo "$p" ;;
  esac
}

MAPPED_PATH=$(map_path "$REL_PATH")

if [ -n "$RUN_ID" ]; then
  RESOLVED="$CASE_DIR/.casework/runs/$RUN_ID/$MAPPED_PATH"
  # Fallback: if mapped path doesn't exist but old path does, use old path
  if [ ! -e "$RESOLVED" ]; then
    OLD_RESOLVED="$CASE_DIR/.casework/runs/$RUN_ID/$REL_PATH"
    [ -e "$OLD_RESOLVED" ] && RESOLVED="$OLD_RESOLVED"
  fi
  echo "$RESOLVED"
else
  echo "$CASE_DIR/.casework/$REL_PATH"
fi
```

- [ ] **Step 2: Verify syntax**

Run: `bash -n .claude/skills/casework/scripts/resolve-run-path.sh`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/casework/scripts/resolve-run-path.sh
git commit -m "feat: resolve-run-path.sh — add path mapping for data-refresh/ rename

Maps output/* → data-refresh/*, scripts/* → data-refresh/logs/*
with fallback to old paths for runs created before this change"
```

---

### Task 4: Add patrol runId to `patrol-init.sh`

**Files:**
- Modify: `.claude/skills/patrol/scripts/patrol-init.sh:100-110,420-427`

- [ ] **Step 1: Generate runId and create run directory**

In `patrol-init.sh`, after line 106 (`rm -f "$PATROL_DIR/patrol-progress.json"`), add:

```bash
# ── Generate patrol runId + create run directory ──
RUN_ID=$(date +%y%m%d-%H%M)
RUN_DIR="$PATROL_DIR/runs/$RUN_ID"
SCRIPTS_DIR="$RUN_DIR/scripts"
mkdir -p "$SCRIPTS_DIR"
log "📁 Run directory: $RUN_DIR"
```

- [ ] **Step 2: Add runId to lock file**

Change line 105 from:
```bash
echo "{\"source\":\"$SOURCE\",\"pid\":$$,\"startedAt\":\"$NOW_ISO\",\"force\":$FORCE_JSON}" > "$PATROL_DIR/patrol.lock"
```
to:
```bash
echo "{\"source\":\"$SOURCE\",\"pid\":$$,\"startedAt\":\"$NOW_ISO\",\"force\":$FORCE_JSON,\"runId\":\"$RUN_ID\"}" > "$PATROL_DIR/patrol.lock"
```

- [ ] **Step 3: Redirect sub-step outputs to run scripts/ directory**

Find the D365 active cases query (line ~115):
```bash
pwsh -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/list-active-cases.ps1" -OutputJson > "$ACTIVE_JSON_TMP" 2>&2
```
After this line, add:
```bash
# Persist raw output to run log
cp "$ACTIVE_JSON_TMP" "$SCRIPTS_DIR/list-active-cases.log" 2>/dev/null || true
```

Find the detect-case-status call and after it, add:
```bash
cp "$DETECT_JSON_TMP" "$SCRIPTS_DIR/detect-case-status.log" 2>/dev/null || true
```

For the warmup (line ~395), change:
```bash
WARMUP_OUT=$(node "$PROJECT_ROOT/.claude/skills/browser-profiles/scripts/token-daemon.js" warmup 2>/dev/null || echo "daemon offline")
```
to:
```bash
WARMUP_OUT=$(node "$PROJECT_ROOT/.claude/skills/browser-profiles/scripts/token-daemon.js" warmup 2>"$SCRIPTS_DIR/warmup.log" || echo "daemon offline")
echo "$WARMUP_OUT" >> "$SCRIPTS_DIR/warmup.log"
```

For the IR check (line ~390), change:
```bash
pwsh -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/check-ir-status-batch.ps1" \
  -SaveMeta -MetaDir "$CASES_ROOT/active" >&2 &
```
to:
```bash
pwsh -NoProfile -File "$PROJECT_ROOT/.claude/skills/d365-case-ops/scripts/check-ir-status-batch.ps1" \
  -SaveMeta -MetaDir "$CASES_ROOT/active" > "$SCRIPTS_DIR/ir-check.log" 2>&1 &
```

- [ ] **Step 4: Write run-info.json**

After the runId generation block (after mkdir), add:
```bash
echo "{\"runId\":\"$RUN_ID\",\"startedAt\":\"$NOW_ISO\",\"source\":\"$SOURCE\",\"force\":$FORCE_JSON}" > "$RUN_DIR/run-info.json"
```

- [ ] **Step 5: Tee final JSON output to run scripts/**

Change the final output section (line ~423) from:
```bash
echo "{\"status\":\"ok\",\"cases\":$CASES_JSON_ARRAY,..."
```
to (using a variable + tee):
```bash
FINAL_JSON="{\"status\":\"ok\",\"runId\":\"$RUN_ID\",\"cases\":$CASES_JSON_ARRAY,\"totalFound\":$TOTAL_FOUND,\"changedCases\":$CHANGED_COUNT,\"skippedCount\":$SKIPPED_COUNT,\"archivedCount\":$ARCHIVED_COUNT,\"transferredCount\":$TRANSFERRED_COUNT,\"warmupStatus\":$WARMUP_ESCAPED,\"source\":\"$SOURCE\",\"force\":$FORCE_JSON}"
echo "$FINAL_JSON" | tee "$SCRIPTS_DIR/patrol-init.json"
```

- [ ] **Step 6: Update early-exit path to also write run-info**

In the early-exit block (around line 370-380), ensure the early-exit JSON also includes `runId` and is tee'd:
```bash
EARLY_JSON="{\"status\":\"early-exit\",\"runId\":\"$RUN_ID\",\"cases\":[],\"totalFound\":$TOTAL_FOUND,...}"
echo "$EARLY_JSON" | tee "$SCRIPTS_DIR/patrol-init.json"
```

- [ ] **Step 7: Verify syntax**

Run: `bash -n .claude/skills/patrol/scripts/patrol-init.sh`
Expected: no output

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/patrol/scripts/patrol-init.sh
git commit -m "feat: patrol-init.sh — add runId + script output logging

- Generate patrol runId (YYMMDD-HHMM format)
- Create .patrol/runs/{runId}/scripts/ directory
- Persist all sub-step outputs to run scripts/
- Add runId to lock file and output JSON
- Write run-info.json"
```

---

### Task 5: Add runId to `patrol-finalize.sh`

**Files:**
- Modify: `.claude/skills/patrol/scripts/patrol-finalize.sh`

- [ ] **Step 1: Read runId from patrol.lock**

After the argument parsing section (line 38), add:
```bash
# ── Read runId from patrol.lock ──
RUN_ID=""
if [[ -f "$PATROL_DIR/patrol.lock" ]]; then
  RUN_ID=$(python3 -c "
import json
try: print(json.load(open('$PATROL_DIR/patrol.lock', encoding='utf-8')).get('runId', ''))
except: print('')
" 2>/dev/null)
fi

SCRIPTS_DIR=""
if [[ -n "$RUN_ID" ]]; then
  SCRIPTS_DIR="$PATROL_DIR/runs/$RUN_ID/scripts"
  mkdir -p "$SCRIPTS_DIR"
fi
```

- [ ] **Step 2: Tee final JSON output to run scripts/**

Change line 180 from:
```bash
echo "{\"status\":\"ok\",\"processedCases\":${PROCESSED},\"caseResults\":${CASE_RESULTS_JSON}}"
```
to:
```bash
FINAL_JSON="{\"status\":\"ok\",\"processedCases\":${PROCESSED},\"caseResults\":${CASE_RESULTS_JSON}}"
if [[ -n "$SCRIPTS_DIR" ]]; then
  echo "$FINAL_JSON" | tee "$SCRIPTS_DIR/patrol-finalize.json"
else
  echo "$FINAL_JSON"
fi
```

- [ ] **Step 3: Update run-info.json with case list**

Before the lock release (line 177), add:
```bash
# Update run-info.json with completion data
if [[ -n "$RUN_ID" ]]; then
  python3 -c "
import json, os
p = os.path.join('$PATROL_DIR', 'runs', '$RUN_ID', 'run-info.json')
try:
    d = json.load(open(p, encoding='utf-8'))
except: d = {}
d['completedAt'] = '$COMPLETED_AT'
d['processedCases'] = $PROCESSED
d['cases'] = [c.strip() for c in '$CASES_CSV'.split(',') if c.strip()]
with open(p, 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
" 2>/dev/null || true
fi
```

- [ ] **Step 4: Verify syntax**

Run: `bash -n .claude/skills/patrol/scripts/patrol-finalize.sh`
Expected: no output

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/patrol/scripts/patrol-finalize.sh
git commit -m "feat: patrol-finalize.sh — add runId reading + output logging

- Read runId from patrol.lock
- Tee finalize JSON to runs/{runId}/scripts/
- Update run-info.json with completion data"
```

---

### Task 6: Update `patrol/SKILL.md` — extract runId + pass parentRunId

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md:64-91`

- [ ] **Step 1: Add runId extraction after init JSON parsing**

In SKILL.md, after the existing `PATROL_START_ISO` line (line 72), add:
```markdown
     RUN_ID=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('runId',''))")
```

- [ ] **Step 2: Pass parentRunId in casework spawn**

In the `update-state.py --init` call (line 89-91), change:
```markdown
   python3 .claude/skills/casework/scripts/update-state.py \
     --case-dir "{casesRoot}/active/{caseNumber}" --init --run-type patrol --step start --status active \
     --case-number "{caseNumber}"
```
to:
```markdown
   python3 .claude/skills/casework/scripts/update-state.py \
     --case-dir "{casesRoot}/active/{caseNumber}" --init --run-type patrol --step start --status active \
     --case-number "{caseNumber}" --parent-run-id "$RUN_ID"
```

- [ ] **Step 3: Pass runId to patrol-finalize.sh**

In the finalize call section (around line 348), add `--run-id` is not needed because finalize reads from patrol.lock. But verify the SKILL.md finalize call is correct — no changes needed here.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/patrol/SKILL.md
git commit -m "feat: SKILL.md — extract patrol runId + pass parentRunId to casework"
```

---

### Task 7: Claims.json + decision files per-run snapshots

**Files:**
- Modify: `.claude/agents/troubleshooter.md` (documentation only — add "copy to run dir" instruction)
- Modify: `.claude/skills/casework/assess/SKILL.md` (move decision to run dir)
- Modify: `.claude/skills/casework/reassess/SKILL.md` (move decision to run dir)

This task is documentation/instruction changes in SKILL.md files. The actual file operations are done by the LLM agents at runtime.

- [ ] **Step 1: Update troubleshooter.md — claims.json dual-write**

In `.claude/agents/troubleshooter.md`, find the section about writing claims.json (around line 410):
```
生成 `{caseDir}/.casework/claims.json`。
```

After this line, add:
```markdown
**Per-run snapshot**: 写完 `.casework/claims.json` 后，复制一份到当前 run 目录：
```bash
RUN_DIR=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "{caseDir}" ".")
cp "{caseDir}/.casework/claims.json" "$RUN_DIR/claims.json" 2>/dev/null || true
```
```

- [ ] **Step 2: Update assess SKILL.md — decision file to run dir**

In `.claude/skills/casework/assess/SKILL.md`, find where `assess-decision.json` is written (around line 271-275). Change the write path from:
```
{caseDir}/.casework/assess-decision.json
```
to dual-write:
```markdown
写 decision 文件到两处：
```bash
# Run-scoped (per-run audit trail)
EP_DIR=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "{caseDir}" ".")
echo "$LLM_JSON" > "$EP_DIR/assess-decision.json"
# Current state (backward compat for consumers)
echo "$LLM_JSON" > "{caseDir}/.casework/assess-decision.json"
```
```

- [ ] **Step 3: Update reassess SKILL.md — decision file to run dir**

In `.claude/skills/casework/reassess/SKILL.md`, find line 196:
```
echo "$LLM_JSON" > "{caseDir}/.casework/reassess-decision.json"
```

Change to dual-write:
```markdown
```bash
# Run-scoped (per-run audit trail)
EP_DIR=$(bash .claude/skills/casework/scripts/resolve-run-path.sh "{caseDir}" ".")
echo "$LLM_JSON" > "$EP_DIR/reassess-decision.json"
# Current state (backward compat)
echo "$LLM_JSON" > "{caseDir}/.casework/reassess-decision.json"
```
```

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/troubleshooter.md .claude/skills/casework/assess/SKILL.md .claude/skills/casework/reassess/SKILL.md
git commit -m "feat: claims.json + decision files — per-run snapshots

- troubleshooter: dual-write claims.json to .casework/ + runs/{runId}/
- assess: dual-write assess-decision.json
- reassess: dual-write reassess-decision.json
All consumers still read from .casework/ (current state)"
```

---

### Task 8: Update `patrol-orchestrator.ts` — SDK session log to run dir

**Files:**
- Modify: `dashboard/src/agent/patrol-orchestrator.ts:207-212`

- [ ] **Step 1: Move SDK session log path to run directory**

Find lines 208-211:
```typescript
    const logTimestamp = new Date().toISOString().replace(\[:.]/g, '-').slice(0, 19)
    const logsDir = join(config.patrolDir, 'logs')
    if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true })
    const sdkLogPath = join(logsDir, `patrol-sdk-${logTimestamp}.jsonl`)
```

Replace with:
```typescript
    const logTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    // Try to read runId from patrol.lock (written by patrol-init.sh)
    let sdkLogPath: string
    try {
      const lockPath = join(config.patrolDir, 'patrol.lock')
      if (existsSync(lockPath)) {
        const lock = JSON.parse(readFileSync(lockPath, 'utf-8'))
        if (lock.runId) {
          const runDir = join(config.patrolDir, 'runs', lock.runId)
          if (!existsSync(runDir)) mkdirSync(runDir, { recursive: true })
          sdkLogPath = join(runDir, 'sdk-session.jsonl')
        } else {
          throw new Error('no runId in lock')
        }
      } else {
        throw new Error('no lock file')
      }
    } catch {
      // Fallback: use legacy logs/ directory
      const logsDir = join(config.patrolDir, 'logs')
      if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true })
      sdkLogPath = join(logsDir, `patrol-sdk-${logTimestamp}.jsonl`)
    }
```

Note: The `sdkLogPath` is used later in the file to append JSONL lines. The variable name stays the same so no other changes needed.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd dashboard && npx tsc --noEmit src/agent/patrol-orchestrator.ts 2>&1 | head -20`
Expected: no errors (or only pre-existing unrelated warnings)

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/agent/patrol-orchestrator.ts
git commit -m "feat: patrol-orchestrator — SDK session log to run directory

Move patrol-sdk-*.jsonl from .patrol/logs/ to .patrol/runs/{runId}/
Falls back to legacy logs/ dir if patrol.lock has no runId"
```

---

### Task 9: Update case-directory schema docs

**Files:**
- Modify: `playbooks/schemas/case-directory.md`

- [ ] **Step 1: Update run directory structure documentation**

Find the `.casework/runs/` section in `playbooks/schemas/case-directory.md` and update to reflect the new structure:

```markdown
### `.casework/runs/{runId}/`

Per-run artifacts (audit trail). Each casework/patrol execution creates a new run.

| Path | Producer | Description |
|------|----------|-------------|
| `data-refresh/data-refresh.json` | data-refresh.sh | Aggregated refresh result |
| `data-refresh/delta-content.md` | data-refresh.sh | Incremental content for assess/troubleshooter |
| `data-refresh/subtasks/*.json` | data-refresh.sh | Per-source structured output (d365, teams, icm) |
| `data-refresh/logs/*.log` | data-refresh.sh | Per-source execution logs |
| `execution-plan.json` | assess | Action plan from LLM decision |
| `claims.json` | troubleshooter | Per-run snapshot of evidence chain |
| `assess-decision.json` | assess | LLM decision audit trail |
| `reassess-decision.json` | reassess | Reassess LLM decision audit trail |
| `agents/*.log` | patrol-orchestrator | Subagent output logs |

**state.json fields:**
- `runId`: `YYMMDD-HHMM_{type}` (e.g., `260420-1906_patrol`)
- `runType`: `patrol | casework | step-*`
- `parentRunId` (optional): patrol-level runId linking this case run to a patrol run
```

- [ ] **Step 2: Commit**

```bash
git add playbooks/schemas/case-directory.md
git commit -m "docs: update case-directory schema for run dir restructure"
```

---

### Task 10: Smoke test

**Files:** (verification only)

- [ ] **Step 1: Verify patrol-init.sh creates run directory**

```bash
# Create a temporary lock to bypass mutex, then test
bash -n .claude/skills/patrol/scripts/patrol-init.sh && echo "init syntax OK"
bash -n .claude/skills/patrol/scripts/patrol-finalize.sh && echo "finalize syntax OK"
python3 -m py_compile .claude/skills/casework/scripts/update-state.py && echo "update-state OK"
bash -n .claude/skills/casework/scripts/data-refresh.sh && echo "data-refresh OK"
bash -n .claude/skills/casework/scripts/resolve-run-path.sh && echo "resolve-run-path OK"
```

Expected: all print OK

- [ ] **Step 2: Test resolve-run-path.sh path mapping**

```bash
# Create a mock run directory
MOCK_DIR=$(mktemp -d)
mkdir -p "$MOCK_DIR/.casework/runs/260420-test/data-refresh/logs"
echo '{"runId":"260420-test"}' > "$MOCK_DIR/.casework/state.json"

# Test new path
bash .claude/skills/casework/scripts/resolve-run-path.sh "$MOCK_DIR" "data-refresh/data-refresh.json"
# Expected: $MOCK_DIR/.casework/runs/260420-test/data-refresh/data-refresh.json

# Test old path mapping
bash .claude/skills/casework/scripts/resolve-run-path.sh "$MOCK_DIR" "output/data-refresh.json"
# Expected: maps to data-refresh/data-refresh.json (but falls back to output/ if exists)

# Test scripts → data-refresh/logs mapping
bash .claude/skills/casework/scripts/resolve-run-path.sh "$MOCK_DIR" "scripts/d365.log"
# Expected: maps to data-refresh/logs/d365.log

rm -rf "$MOCK_DIR"
```

- [ ] **Step 3: Test finalize reads runId from lock**

```bash
mkdir -p ../data/.patrol
echo '{"source":"test","pid":99999,"runId":"260420-test"}' > ../data/.patrol/patrol.lock
mkdir -p ../data/.patrol/runs/260420-test/scripts
RESULT=$(bash .claude/skills/patrol/scripts/patrol-finalize.sh --cases-root ../data/cases --patrol-dir ../data/.patrol --cases "" --source cli 2>/dev/null)
echo "$RESULT"
ls ../data/.patrol/runs/260420-test/scripts/patrol-finalize.json 2>/dev/null && echo "finalize.json exists"
# Cleanup
rm -f ../data/.patrol/patrol.lock
```

Expected: JSON output with `"status":"ok"`, and `patrol-finalize.json` exists in run dir.

## Verification

After all tasks are complete:
1. Run a full patrol (`/patrol --force`) and verify:
   - `.patrol/runs/{runId}/` directory created with `run-info.json`, `scripts/patrol-init.json`, `scripts/warmup.log`
   - Each case's `.casework/state.json` has `parentRunId` matching patrol's runId
   - Each case's `.casework/runs/{runId}/` uses `data-refresh/` structure (not `output/` + `scripts/`)
   - `claims.json` exists in both `.casework/` and `.casework/runs/{runId}/`
   - SDK session log is in `.patrol/runs/{runId}/sdk-session.jsonl`
2. Run a standalone casework (`/casework {case}`) and verify:
   - No `parentRunId` in state.json
   - `data-refresh/` structure used (not old `output/`)
