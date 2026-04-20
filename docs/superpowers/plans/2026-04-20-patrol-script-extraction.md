# Patrol Script Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract patrol's deterministic pre-processing (Steps 1-5) and finalization (Steps 7-8) from SKILL.md into bash scripts, reducing ~22 LLM inference turns to 2 script calls.

**Architecture:** Two new bash scripts (`patrol-init.sh`, `patrol-finalize.sh`) handle all deterministic logic. Patrol LLM agent calls these scripts and focuses solely on Step 6 (Agent spawning + state machine polling). Follows the same pattern as casework's `data-refresh.sh`.

**Tech Stack:** Bash, Python3 (inline), PowerShell (existing scripts called via `pwsh`)

---

### Task 1: Create `patrol-init.sh`

**Files:**
- Create: `.claude/skills/patrol/scripts/patrol-init.sh`

This script replaces SKILL.md Steps 1-5. It handles config reading, mutex, case listing, filtering, archiving, warmup, and outputs a single JSON to stdout for the LLM agent to consume.

- [ ] **Step 1: Create the script with arg parsing and config reading**

```bash
cat > .claude/skills/patrol/scripts/patrol-init.sh << 'SCRIPT_EOF'
#!/usr/bin/env bash
# patrol-init.sh — Patrol pre-processing orchestrator (Steps 1-5).
#
# Deterministic logic extracted from SKILL.md. No LLM reasoning here.
# Called by patrol agent as a single command, replacing ~15-22 LLM turns.
#
# Usage:
#   bash .claude/skills/patrol/scripts/patrol-init.sh \
#     --cases-root ./cases --patrol-dir ../data/.patrol \
#     --source cli [--force]
#
# Output (stdout): JSON with status, case list, warmup status
# Stderr: progress/debug logs (safe to ignore)
# Exit: 0 = ok/early-exit, 1 = error (lock conflict etc.)
set -uo pipefail

# ── Helpers ──
log() { echo "[patrol-init] $*" >&2; }
json_exit() {
  echo "$1"
  exit "${2:-0}"
}

# ── Args ──
CASES_ROOT="" PATROL_DIR="" SOURCE="cli" FORCE="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cases-root)  CASES_ROOT="$2"; shift 2 ;;
    --patrol-dir)  PATROL_DIR="$2"; shift 2 ;;
    --source)      SOURCE="$2"; shift 2 ;;
    --force)       FORCE="true"; shift ;;
    *) shift ;;
  esac
done

# Fallback: read from config.json if not provided
if [ -z "$CASES_ROOT" ] || [ -z "$PATROL_DIR" ]; then
  CONFIG=$(python3 -c "
import json
c = json.load(open('config.json', encoding='utf-8'))
print(c.get('casesRoot', '../data/cases'))
print(c.get('patrolDir', '../data/.patrol'))
" 2>/dev/null || echo "")
  if [ -n "$CONFIG" ]; then
    CASES_ROOT="${CASES_ROOT:-$(echo "$CONFIG" | head -1)}"
    PATROL_DIR="${PATROL_DIR:-$(echo "$CONFIG" | tail -1)}"
  fi
fi

[ -z "$CASES_ROOT" ] || [ -z "$PATROL_DIR" ] && {
  json_exit '{"status":"error","error":"missing --cases-root or --patrol-dir and config.json unreadable"}' 1
}

SKIP_HOURS=$(python3 -c "
import json
try:
  c = json.load(open('config.json', encoding='utf-8'))
  print(c.get('patrolSkipHours', 3))
except: print(3)
" 2>/dev/null || echo 3)

HERE="$(cd "$(dirname "$0")" && pwd)"

# ═══════════════════════════════════════
# Step 1: Mutex check
# ═══════════════════════════════════════
mkdir -p "$PATROL_DIR"

if [ -f "$PATROL_DIR/patrol.lock" ]; then
  LOCK_SOURCE=$(python3 -c "import json; print(json.load(open('$PATROL_DIR/patrol.lock'))['source'])" 2>/dev/null || echo "unknown")
  json_exit "{\"status\":\"error\",\"error\":\"Patrol already running (source=$LOCK_SOURCE)\"}" 1
fi

# Write lock + clear previous progress
rm -f "$PATROL_DIR/patrol-progress.json"
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase starting --source "$SOURCE" >/dev/null
FORCE_JSON="false"
[ "$FORCE" = "true" ] && FORCE_JSON="true"
echo "{\"source\":\"$SOURCE\",\"pid\":$$,\"startedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"force\":$FORCE_JSON}" > "$PATROL_DIR/patrol.lock"
log "Lock acquired (source=$SOURCE, force=$FORCE)"

# ═══════════════════════════════════════
# Step 2: Discovering — list active cases
# ═══════════════════════════════════════
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase discovering --source "$SOURCE" >/dev/null
log "Phase: discovering"

ACTIVE_CASES_JSON=$(pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/list-active-cases.ps1 -OutputJson 2>/dev/null || echo "[]")
TOTAL_FOUND=$(echo "$ACTIVE_CASES_JSON" | python3 -c "
import json, sys
try:
  cases = json.load(sys.stdin)
  if isinstance(cases, list): print(len(cases))
  elif isinstance(cases, dict) and 'cases' in cases: print(len(cases['cases']))
  else: print(0)
except: print(0)
")
log "Total active cases from D365: $TOTAL_FOUND"

# ═══════════════════════════════════════
# Step 3: Filtering — skip recently inspected
# ═══════════════════════════════════════
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase filtering --total-found "$TOTAL_FOUND" >/dev/null
log "Phase: filtering (skipHours=$SKIP_HOURS, force=$FORCE)"

# Extract case numbers from D365 output, then filter by lastInspected
FILTER_RESULT=$(python3 -c "
import json, sys, os, time

cases_json = '''$ACTIVE_CASES_JSON'''
try:
    cases = json.loads(cases_json)
    if isinstance(cases, dict) and 'cases' in cases:
        cases = cases['cases']
except:
    cases = []

# Extract case numbers
case_numbers = []
for c in cases:
    cn = str(c.get('ticketNumber', c.get('caseNumber', c.get('title', ''))))
    if cn and cn.strip():
        case_numbers.append(cn.strip())

force = '$FORCE' == 'true'
skip_hours = float('$SKIP_HOURS')
cases_root = '$CASES_ROOT'

changed = []
skipped = []
now = time.time()

for cn in case_numbers:
    if force:
        changed.append(cn)
        continue
    meta_path = os.path.join(cases_root, 'active', cn, 'casework-meta.json')
    try:
        meta = json.load(open(meta_path, encoding='utf-8'))
        last = meta.get('lastInspected', '')
        if not last:
            changed.append(cn)
            continue
        # Parse ISO timestamp (handles +08:00 and Z)
        from datetime import datetime, timezone
        last = last.replace('+08:00', '+0800').replace('+00:00', '+0000')
        if last.endswith('Z'):
            last = last[:-1] + '+0000'
        try:
            dt = datetime.strptime(last[:19], '%Y-%m-%dT%H:%M:%S')
            # Assume +08:00 if no timezone info parsed
            age_hours = (now - dt.timestamp() + 8*3600) / 3600
        except:
            age_hours = skip_hours + 1  # fallback: include
        if age_hours >= skip_hours:
            changed.append(cn)
        else:
            skipped.append(cn)
    except:
        changed.append(cn)  # no meta = new case

print(json.dumps({'changed': changed, 'skipped': skipped}))
" 2>/dev/null || echo '{"changed":[],"skipped":[]}')

CHANGED_CASES=$(echo "$FILTER_RESULT" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['changed']))")
SKIPPED_COUNT=$(echo "$FILTER_RESULT" | python3 -c "import json,sys; print(len(json.load(sys.stdin)['skipped']))")
CASE_LIST=$(echo "$FILTER_RESULT" | python3 -c "import json,sys; print(','.join(json.load(sys.stdin)['changed']))")
log "Filter result: changed=$CHANGED_CASES, skipped=$SKIPPED_COUNT"

# ═══════════════════════════════════════
# Step 2.5: Archive/transfer detection
# ═══════════════════════════════════════
ARCHIVED_COUNT=0
TRANSFERRED_COUNT=0

ARCHIVE_RESULT=$(pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/detect-case-status.ps1 \
  -CasesRoot "$CASES_ROOT" -ActiveCasesJson "$ACTIVE_CASES_JSON" 2>/dev/null || echo "[]")

# Process archive/transfer moves
python3 -c "
import json, os, shutil, sys

cases_root = '$CASES_ROOT'
patrol_dir = '$PATROL_DIR'
result_json = '''$ARCHIVE_RESULT'''

try:
    results = json.loads(result_json)
except:
    results = []

archived = 0
transferred = 0
import time

for r in results:
    cn = r.get('caseNumber', '')
    status = r.get('status', '')
    reason = r.get('reason', '')
    evidence = r.get('closureEmailEvidence', '')
    src = os.path.join(cases_root, 'active', cn)
    if not os.path.isdir(src):
        continue

    if status == 'archived':
        dest = os.path.join(cases_root, 'archived', cn)
        archived += 1
    elif status == 'transferred':
        dest = os.path.join(cases_root, 'transfer', cn)
        transferred += 1
    else:
        continue

    os.makedirs(os.path.dirname(dest), exist_ok=True)
    # cp + rm (not mv — Windows/NTFS Permission Denied on cross-dir mv)
    shutil.copytree(src, dest, dirs_exist_ok=True)
    shutil.rmtree(src, ignore_errors=True)

    # Append to archive log
    log_path = os.path.join(patrol_dir, 'archive-log.jsonl')
    entry = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'caseNumber': cn, 'status': status, 'reason': reason,
        'closureEmailEvidence': evidence,
        'from': 'active/', 'to': ('archived/' if status == 'archived' else 'transfer/')
    }
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    print(f'Moved {cn} → {status}', file=sys.stderr)

print(f'{archived},{transferred}')
" 2>/dev/null
ARCHIVE_COUNTS=$(python3 -c "
import json, os, shutil, sys

cases_root = '$CASES_ROOT'
patrol_dir = '$PATROL_DIR'
result_json = '''$ARCHIVE_RESULT'''

try:
    results = json.loads(result_json)
except:
    results = []

archived = sum(1 for r in results if r.get('status') == 'archived')
transferred = sum(1 for r in results if r.get('status') == 'transferred')
print(f'{archived},{transferred}')
" 2>/dev/null || echo "0,0")
ARCHIVED_COUNT=$(echo "$ARCHIVE_COUNTS" | cut -d, -f1)
TRANSFERRED_COUNT=$(echo "$ARCHIVE_COUNTS" | cut -d, -f2)

# Remove archived/transferred cases from CASE_LIST
if [ "$ARCHIVED_COUNT" -gt 0 ] || [ "$TRANSFERRED_COUNT" -gt 0 ]; then
  ARCHIVED_CNS=$(echo "$ARCHIVE_RESULT" | python3 -c "
import json, sys
try:
    results = json.loads(sys.stdin.read())
    print(','.join(r['caseNumber'] for r in results))
except: print('')
" 2>/dev/null || echo "")
  if [ -n "$ARCHIVED_CNS" ]; then
    CASE_LIST=$(python3 -c "
excluded = set('$ARCHIVED_CNS'.split(','))
remaining = [c for c in '$CASE_LIST'.split(',') if c and c not in excluded]
print(','.join(remaining))
" 2>/dev/null || echo "$CASE_LIST")
    CHANGED_CASES=$(echo "$CASE_LIST" | tr ',' '\n' | grep -c . || echo 0)
  fi
fi

# Update phase with archive counts
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase filtering \
  --total-found "$TOTAL_FOUND" --changed-cases "$CHANGED_CASES" \
  --skipped-count "$SKIPPED_COUNT" \
  --archived-count "$ARCHIVED_COUNT" --transferred-count "$TRANSFERRED_COUNT" >/dev/null
log "Archive: archived=$ARCHIVED_COUNT, transferred=$TRANSFERRED_COUNT"

# ═══════════════════════════════════════
# Step 3.5: Early-exit check
# ═══════════════════════════════════════
if [ "$CHANGED_CASES" -eq 0 ] 2>/dev/null || [ -z "$CASE_LIST" ]; then
  log "Early exit: 0 cases to process"
  # Write patrol-state.json
  python3 -c "
import json, time
state = {
    'startedAt': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'completedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'source': '$SOURCE',
    'totalCases': $TOTAL_FOUND,
    'changedCases': 0,
    'processedCases': 0,
    'phase': 'completed',
    'caseResults': []
}
json.dump(state, open('$PATROL_DIR/patrol-state.json', 'w', encoding='utf-8'), indent=2)
"
  python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase completed --processed-cases 0 >/dev/null
  rm -f "$PATROL_DIR/patrol.lock"
  json_exit "{\"status\":\"early-exit\",\"cases\":[],\"totalFound\":$TOTAL_FOUND,\"changedCases\":0,\"skippedCount\":$SKIPPED_COUNT,\"archivedCount\":$ARCHIVED_COUNT,\"transferredCount\":$TRANSFERRED_COUNT,\"message\":\"All cases within skipHours\"}"
fi

# ═══════════════════════════════════════
# Step 4: Warmup (parallel)
# ═══════════════════════════════════════
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase warming-up --warmup-status "warming up tokens" >/dev/null
log "Phase: warming-up"

# IR check + token daemon warmup in parallel
pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/check-ir-status-batch.ps1 \
  -SaveMeta -MetaDir "$CASES_ROOT/active" 2>/dev/null &
IR_PID=$!

WARMUP_OUT=$(node .claude/skills/browser-profiles/scripts/token-daemon.js warmup 2>/dev/null || echo "daemon offline")
WARMUP_STATUS=$(echo "$WARMUP_OUT" | head -1 | cut -c1-60)

wait $IR_PID 2>/dev/null || true
log "Warmup done: $WARMUP_STATUS"

python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase warming-up --warmup-status "$WARMUP_STATUS" >/dev/null

# ═══════════════════════════════════════
# Step 5: Write processing phase
# ═══════════════════════════════════════
SKIPPED_COUNT=$((TOTAL_FOUND - CHANGED_CASES))
CASE_LIST_CSV="$CASE_LIST"

python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase processing \
  --total-cases "$CHANGED_CASES" --changed-cases "$CHANGED_CASES" \
  --total-found "$TOTAL_FOUND" --skipped-count "$SKIPPED_COUNT" \
  --warmup-status "$WARMUP_STATUS" --case-list "$CASE_LIST_CSV" >/dev/null
log "Phase: processing ($CHANGED_CASES cases)"

# ═══════════════════════════════════════
# Output JSON for LLM agent
# ═══════════════════════════════════════
CASES_JSON=$(python3 -c "
import json
cases = [c.strip() for c in '$CASE_LIST_CSV'.split(',') if c.strip()]
print(json.dumps(cases))
")

cat << ENDJSON
{"status":"ok","cases":$CASES_JSON,"totalFound":$TOTAL_FOUND,"changedCases":$CHANGED_CASES,"skippedCount":$SKIPPED_COUNT,"archivedCount":$ARCHIVED_COUNT,"transferredCount":$TRANSFERRED_COUNT,"warmupStatus":"$WARMUP_STATUS","source":"$SOURCE","force":$FORCE_JSON}
ENDJSON
SCRIPT_EOF
chmod +x .claude/skills/patrol/scripts/patrol-init.sh
```

- [ ] **Step 2: Verify the script is syntactically valid**

Run: `bash -n .claude/skills/patrol/scripts/patrol-init.sh`
Expected: no output (syntax OK)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/patrol/scripts/patrol-init.sh
git commit -m "feat: add patrol-init.sh — extract Steps 1-5 from SKILL.md

Deterministic pre-processing (config, mutex, list, filter, archive,
warmup) moved into a single bash script. Reduces ~15-22 LLM inference
turns to 1 script call, saving ~60-90s of LLM overhead per patrol run."
```

---

### Task 2: Create `patrol-finalize.sh`

**Files:**
- Create: `.claude/skills/patrol/scripts/patrol-finalize.sh`

This script replaces SKILL.md Steps 7-8. It handles orphan process cleanup, todo aggregation, patrol-state.json writing, and lock release.

- [ ] **Step 1: Create the script**

```bash
cat > .claude/skills/patrol/scripts/patrol-finalize.sh << 'SCRIPT_EOF'
#!/usr/bin/env bash
# patrol-finalize.sh — Patrol finalization (Steps 7-8).
#
# Handles cleanup, todo aggregation, patrol-state.json, lock release.
# Called by patrol agent after Step 6 (polling loop) completes.
#
# Usage:
#   bash .claude/skills/patrol/scripts/patrol-finalize.sh \
#     --cases-root ./cases --patrol-dir ../data/.patrol \
#     --cases "case1,case2" --source cli
#
# Output (stdout): JSON with status and caseResults
# Exit: 0 always (best-effort cleanup)
set -uo pipefail

log() { echo "[patrol-finalize] $*" >&2; }

# ── Args ──
CASES_ROOT="" PATROL_DIR="" CASES_CSV="" SOURCE="cli" STARTED_AT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cases-root)  CASES_ROOT="$2"; shift 2 ;;
    --patrol-dir)  PATROL_DIR="$2"; shift 2 ;;
    --cases)       CASES_CSV="$2"; shift 2 ;;
    --source)      SOURCE="$2"; shift 2 ;;
    --started-at)  STARTED_AT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

[ -z "$CASES_ROOT" ] || [ -z "$PATROL_DIR" ] && {
  echo '{"status":"error","error":"missing --cases-root or --patrol-dir"}'
  exit 1
}

HERE="$(cd "$(dirname "$0")" && pwd)"
STARTED_AT="${STARTED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"

# ═══════════════════════════════════════
# Step 7: Cleanup orphan agency processes
# ═══════════════════════════════════════
AGENCY_COUNT=$(tasklist 2>/dev/null | grep -c -i agency.exe || echo 0)
if [ "$AGENCY_COUNT" -gt 0 ]; then
  log "Killing $AGENCY_COUNT orphan agency process(es)"
  taskkill /IM agency.exe /F 2>/dev/null || true
fi

# ═══════════════════════════════════════
# Step 8: Aggregate results + write patrol-state.json
# ═══════════════════════════════════════
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase aggregating >/dev/null

RESULT_JSON=$(python3 -c "
import json, os, sys, time, glob

cases_root = '$CASES_ROOT'
cases_csv = '$CASES_CSV'
source = '$SOURCE'
started_at = '$STARTED_AT'
patrol_dir = '$PATROL_DIR'

cases = [c.strip() for c in cases_csv.split(',') if c.strip()]

case_results = []
for cn in cases:
    case_dir = os.path.join(cases_root, 'active', cn)
    state_path = os.path.join(case_dir, '.casework', 'state.json')
    status = 'incomplete'
    try:
        state = json.load(open(state_path, encoding='utf-8'))
        steps = state.get('steps', {})
        statuses = [s.get('status', '') for s in steps.values()]
        if all(s in ('completed', 'skipped') for s in statuses):
            status = 'completed'
        elif any(s == 'failed' for s in statuses):
            status = 'failed'
    except:
        pass
    case_results.append({'caseNumber': cn, 'status': status})

processed = len(cases)

# Write patrol-state.json
patrol_state = {
    'startedAt': started_at,
    'completedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'source': source,
    'totalCases': len(cases),
    'changedCases': len(cases),
    'processedCases': processed,
    'phase': 'completed',
    'caseResults': case_results
}
state_path = os.path.join(patrol_dir, 'patrol-state.json')
with open(state_path, 'w', encoding='utf-8') as f:
    json.dump(patrol_state, f, indent=2, ensure_ascii=False)

# Output for caller
output = {
    'status': 'ok',
    'processedCases': processed,
    'caseResults': case_results
}
print(json.dumps(output, ensure_ascii=False))
" 2>/dev/null || echo '{"status":"error","error":"aggregation failed"}')

# Write completed phase
PROCESSED=$(echo "$RESULT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('processedCases',0))" 2>/dev/null || echo 0)
python3 "$HERE/update-phase.py" --patrol-dir "$PATROL_DIR" --phase completed \
  --processed-cases "$PROCESSED" >/dev/null

# Release lock
rm -f "$PATROL_DIR/patrol.lock"
log "Done. Processed=$PROCESSED, lock released."

echo "$RESULT_JSON"
SCRIPT_EOF
chmod +x .claude/skills/patrol/scripts/patrol-finalize.sh
```

- [ ] **Step 2: Verify syntax**

Run: `bash -n .claude/skills/patrol/scripts/patrol-finalize.sh`
Expected: no output (syntax OK)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/patrol/scripts/patrol-finalize.sh
git commit -m "feat: add patrol-finalize.sh — extract Steps 7-8 from SKILL.md

Cleanup, todo aggregation, patrol-state.json, and lock release
moved into a single bash script. Reduces ~4-5 LLM turns to 1 call."
```

---

### Task 3: Update `patrol/SKILL.md`

**Files:**
- Modify: `.claude/skills/patrol/SKILL.md`

Replace Steps 1-5 and Steps 7-8 with script calls. Keep Step 6 (Streaming Pipeline) unchanged.

- [ ] **Step 1: Replace Steps 1-5 with patrol-init.sh call**

In `.claude/skills/patrol/SKILL.md`, replace everything from line 37 (`1. **读取配置 + 互斥检查**`) through line 199 (end of Step 5) with:

```markdown
1. **初始化（patrol-init.sh）**

   一个脚本完成所有预处理：配置读取、互斥检查、Case 列表获取、筛选、归档检测、预热。

   检测 prompt 中是否包含 `source=webui`，如果包含则 SOURCE 为 `webui`，否则为 `cli`。
   检测 prompt 中是否包含 `--force`，如果包含则加 `--force` 参数。

   ```bash
   INIT_JSON=$(bash .claude/skills/patrol/scripts/patrol-init.sh \
     --cases-root {casesRoot} --patrol-dir {patrolDir} \
     --source "$SOURCE" [--force])
   ```

   解析输出 JSON：
   - `status=error` → 输出 `.error` 字段，终止
   - `status=early-exit` → 输出 `📊 Patrol: 0 cases to process. Done.`，终止
   - `status=ok` → 提取字段继续：
     ```bash
     CASES=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(','.join(json.load(sys.stdin)['cases']))")
     TOTAL_FOUND=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['totalFound'])")
     CHANGED_CASES=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['changedCases'])")
     WARMUP_STATUS=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['warmupStatus'])")
     ```

   **🚨 路径硬规则（反复出问题，必须严格遵守）**：
   - `casesRoot` 和 `patrolDir` 直接使用 config.json 原始值（相对路径）
   - **所有 Bash 命令、Agent spawn prompt、python3 -c 内部**都用这些相对路径
   - **绝对禁止**：`C:\Users\...`、`C:/Users/...`、`/c/Users/...` 任何形式的绝对路径
```

- [ ] **Step 2: Replace Steps 7-8 with patrol-finalize.sh call**

In `.claude/skills/patrol/SKILL.md`, replace everything from line 464 (`7. **阶段 2.5：清理**`) through line 523 (end of lock release) with:

```markdown
7. **收尾（patrol-finalize.sh）**

   一个脚本完成所有收尾：orphan 进程清理、todo 聚合、patrol-state.json 写入、lock 释放。

   ```bash
   FINAL_JSON=$(bash .claude/skills/patrol/scripts/patrol-finalize.sh \
     --cases-root {casesRoot} --patrol-dir {patrolDir} \
     --cases "$CASE_LIST_CSV" --source "$SOURCE" \
     --started-at "$PATROL_START_ISO")
   ```

   解析输出后，展示汇总：
   - 从各 case 的 `todo/` 目录提取最新 Todo 文件，按 🔴🟡✅ 分级汇总展示
   - 此处展示逻辑需要 LLM 读取文件并格式化输出（保留在 agent 端）
```

- [ ] **Step 3: Update warmup comment in Step 6 area**

Find and update the outdated `~37s` comment. In the SKILL.md file where Step 6 references warmup timing, ensure no stale `~37s` references remain. The warmup comment was in the old Steps 1-5 which is now removed, so this is just a verification step.

Run: `grep -n "37s\|~37" .claude/skills/patrol/SKILL.md`
Expected: no matches (the old lines are gone)

- [ ] **Step 4: Verify SKILL.md is well-formed**

Run: `wc -l .claude/skills/patrol/SKILL.md`
Expected: ~330-370 lines (down from 529)

Run: `head -20 .claude/skills/patrol/SKILL.md` to confirm frontmatter intact.

Run: `grep -c "patrol-init.sh\|patrol-finalize.sh" .claude/skills/patrol/SKILL.md`
Expected: at least 2 matches (one for each script call)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/patrol/SKILL.md
git commit -m "refactor: replace patrol Steps 1-5 and 7-8 with script calls

Steps 1-5 (config, mutex, list, filter, archive, warmup) → patrol-init.sh
Steps 7-8 (cleanup, aggregation, lock release) → patrol-finalize.sh
Step 6 (agent spawn + polling state machine) unchanged.

Reduces ~22 LLM inference turns to 2 script calls, saving ~60-90s
of LLM overhead per patrol run. SKILL.md: 529 → ~350 lines."
```

---

### Task 4: Smoke test

**Files:** (none — verification only)

- [ ] **Step 1: Dry-run patrol-init.sh argument parsing**

Run the script with `--help`-like invalid state to verify it starts and parses args correctly (won't actually call D365 if no config):

```bash
bash -n .claude/skills/patrol/scripts/patrol-init.sh && echo "syntax OK"
bash -n .claude/skills/patrol/scripts/patrol-finalize.sh && echo "syntax OK"
```

Expected: both print "syntax OK"

- [ ] **Step 2: Verify lock mutex works**

```bash
# Create a fake lock
mkdir -p ../data/.patrol
echo '{"source":"test","pid":99999}' > ../data/.patrol/patrol.lock
RESULT=$(bash .claude/skills/patrol/scripts/patrol-init.sh --cases-root ../data/cases --patrol-dir ../data/.patrol --source cli 2>/dev/null || true)
echo "$RESULT"
rm -f ../data/.patrol/patrol.lock
```

Expected: JSON with `"status":"error"` and `"Patrol already running"`

- [ ] **Step 3: Verify finalize-sh runs cleanly with empty case list**

```bash
bash .claude/skills/patrol/scripts/patrol-finalize.sh \
  --cases-root ../data/cases --patrol-dir ../data/.patrol \
  --cases "" --source cli 2>/dev/null
```

Expected: JSON with `"status":"ok","processedCases":0`

- [ ] **Step 4: Commit test verification (if any fixes were needed)**

If no fixes needed, skip this step.
