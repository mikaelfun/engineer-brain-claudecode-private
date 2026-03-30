## SCAN Phase — Discover gaps, recycle old issues

**Goal**: Scan project docs/code, compare with manifest.json, find untested features.

**Execution**: Main Agent directly (no spawn).

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"roundJourney":{"SCAN":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --merge
```

### Step 0: Load State (only in SCAN — first phase of each round)

1. Read `tests/state.json` → determine phase and queues
2. Read `tests/safety.yaml` → load safety rules
3. Read `tests/env.yaml` → load environment config (ports, passwords, case pool)
4. Read `tests/learnings.yaml` → load known issues
5. If `round >= maxRounds` → run `bash tests/executors/stats-reporter.sh <round>`, output final report, return (set phase=COMPLETE)
6. **Interrupt recovery**: If `currentTest` non-empty → previous execution was interrupted. Push `currentTest` back to queue head, clear `currentTest`, continue normally.

### Step 0 (SCAN sub-steps): Recycle + Skip Re-evaluate + Live Cases

**0. Recycle old issues** (every SCAN):
```bash
bash tests/executors/queue-recycler.sh
```
Checks regressionQueue / fixQueue(retryCount<3) / verifyQueue, moves recyclable items to testQueue. Record phaseHistory if recycled.

**0.1. Skip re-evaluation** (every SCAN):
Check `state.skipRegistry` for `reviewable: true` entries where `round - entry.round >= 3` → move back to testQueue, remove from skipRegistry. (`reviewable: false` like safety:blocked → never retry.)

**0.5. Refresh Live Case pool** (daily):
```bash
bash tests/executors/refresh-live-cases.sh
```
If `tests/fixtures/live-cases.yaml` `lastRefreshed` > 24h, scan `cases/active/` to update pool.

### SCAN Steps 1-7: Discovery

**1. Scan API endpoints**:
```bash
grep -r "app\.\(get\|post\|put\|patch\|delete\)" dashboard/src/routes/*.ts
```
Extract all HTTP endpoints → compare with `tests/registry/backend-api/`

**2. Scan UI components**:
```bash
ls dashboard/web/src/components/**/*.tsx
```
Extract all components → compare with `tests/registry/ui-interaction/` and `tests/registry/ui-visual/`

**3. Scan Skills/Workflows**:
```bash
ls .claude/skills/*/SKILL.md
```
Each skill → compare with `tests/registry/workflow-e2e/`

**4. Scan Issues** (requirement-driven):
```bash
bash tests/executors/issue-scanner.sh
```
- `tracked`/`implemented` (with trackId + spec) → extract AC, compare registry → output `ISSUE_GAP`
- `done` (with trackId + spec) → check regression coverage → `ISSUE_REGRESSION_GAP` or `ISSUE_COVERED`
- `pending` / no trackId → `ISSUE_SKIP`

Append `ISSUE_GAP` to state.json.gaps (source: `issue-driven`).
Append `ISSUE_REGRESSION_GAP` to state.json.gaps (source: `issue-regression`).

**4b. Auto-implement tracked issues** (optional, controlled by `env.yaml`):
Read `tests/env.yaml` → `automation.autoImplementTracked`.
- **false (default)** → skip, log note directive
- **true** → for tracked issues with plan.md, spawn `conductor:implement {trackId}` (max `max_auto_implement_per_round` per round, default 1). Record phaseHistory.

**5. Scan Observability gaps**:
```bash
bash tests/executors/observability-scanner.sh
```
5 scans: agent config audit, SKILL prompt audit, bash anti-pattern, timing drift, learnings regression. Append gaps.

**5.5. Execute Observability Probes**:
```bash
bash tests/executors/probe-scheduler.sh {round}
```
Run all due probes directly (not via testQueue). Schedule: every `probe_schedule.interval_rounds` (default 5). Failed probes → record phaseHistory warning.

**6. Scan Spec acceptance criteria**:
```bash
bash tests/executors/spec-scanner.sh
```
Scan `conductor/tracks/*/spec.md` AC → compare with registry → output `SPEC_GAP`. Append to gaps (source: `spec-driven`).

**6.5. Run Additional Scanners** (if activated by runner):

Check pre-flight briefing `activeScanners` array (from `tests/scan-strategies.yaml` scheduling).
For each activated scanner, run and collect GAP output lines:

| Scanner | Executor | Frequency | Description |
|---------|----------|-----------|-------------|
| design-fidelity | `design-fidelity-scanner.sh` | every_3_rounds | Compare spec AC with implementation code |
| ux-review | `ux-reviewer.sh` | every_5_rounds | Static UX anti-pattern detection |
| performance | `performance-scanner.sh` | every_3_rounds | API/timing vs baselines |
| architecture | `architecture-scanner.sh` | every_5_rounds | CLAUDE.md compliance + code anti-patterns |

```bash
# Example: run activated scanners
for scanner in "${activeScanners[@]}"; do
  bash "tests/executors/${scanner}"
done
```

**Scheduling logic** (runner decides, SCAN phase executes):
- `every_round` → always run (coverage scanner — this is the default Steps 1-6)
- `every_3_rounds` → run when `round % 3 == 0`
- `every_5_rounds` → run when `round % 5 == 0`
- Runner Strategic Review can override: force a scanner early or skip one

GAP output format from additional scanners:
```
GAP|{type}|{source}|{category}|{description}|{priority}
```
Append all GAP lines to `state.json.gaps` with the scanner's source tag.

**7. Update manifest.json**: Add new features, update tested/untested, coverage stats.

### SCAN Decision

- Has untested features → set phase=GENERATE, write gaps to state.json
- No gap + testQueue non-empty (recycled items) → phase=TEST
- No gap + testQueue empty → record `{ action: "no_work" }`, round++, phase=SCAN
