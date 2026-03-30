# Specification: Runner Upgrade — Strategic Review + Meta-analysis

**Track ID:** runner-brain_20260329
**Issue:** ISS-145
**Type:** Feature
**Created:** 2026-03-29
**Status:** Draft

## Summary

Upgrade the test-supervisor-runner from a thin gate ("health-check → spawn → post-flight") to a reasoning supervisor ("analyze trends → decide strategy → spawn → evaluate performance → evolve"). Three additions: Strategic Review (before test-loop), Meta-analysis (after test-loop), and an Immutable Core + Reasoning Shell architecture for safe self-healing.

## Context

### Current runner flow (5 steps)
```
Step 1: Health check (bash)
Step 2: Gate decision (if/else)
Step 3: Spawn test-loop (Agent)
Step 4: Post-flight (bash health-check + file cleanup)
Step 5: Summary output
```

Runner is a **gatekeeper** — it checks if the system is healthy and spawns test-loop. It doesn't make strategic decisions or evaluate test-loop's effectiveness.

### Why runner is the right layer for reasoning

- **Context isolation**: Runner's context is discarded after each `/loop` tick, preventing main session blowup
- **Supervision authority**: Runner spawns test-loop, so it can inject directives before and analyze results after
- **Self-repair path**: Runner can detect framework issues and inject fixQueue items that test-loop's FIX phase will execute
- **Cross-round perspective**: Runner reads round summaries spanning multiple rounds, while test-loop only sees current round

### User's vision
> Runner 扮演控制和监督 test-loop 的角色。当 runner 发现自身的逻辑问题，也可以通过 test-loop 注入 fixQueue 来实现自我修复。整个 test-loop 能够在自动发现、测试、修复、验证全链路闭环并且靠推理演进。

## Motivation

Transform the test-loop from a "test coverage tool" into a "project quality assurance system" with reasoning-driven evolution.

## Success Criteria

- [ ] Runner has a Strategic Review step that reads last 3 round summaries and analyzes trends
- [ ] Runner can inject directives based on trend analysis (prioritize tests, note observations)
- [ ] `trend-analyzer.sh` outputs structured trend JSON from round summaries
- [ ] Runner has a Meta-analysis step that evaluates test-loop's performance after it returns
- [ ] Meta-analysis can inject fixQueue items for framework issues (category: "framework", priority: 1)
- [ ] Meta-analysis records findings to learnings.yaml via learnings-writer.sh
- [ ] Runner's summary includes strategic observations (not just stats)
- [ ] `scan-strategies.yaml` exists and runner can select scan strategies per round
- [ ] Immutable Core files protected in safety.yaml (`immutable_core` section)
- [ ] Runner Step 1 includes reasoning self-check that verifies its own 4 capabilities
- [ ] Runner can detect self-damage via `git diff` on immutable core files and auto-rollback
- [ ] safety.yaml restructured with `immutable_core` vs `auto_fixable` distinction

## Technical Design

### New runner flow (7 steps)

```
Step 1: Pre-flight + Reasoning Self-check ⭐ NEW  ← verify own capabilities intact
Step 2: Strategic Review ⭐ NEW                   ← reasoning about trends
Step 3: Inject directives + Spawn test-loop       ← enhanced
Step 4: Post-flight + Meta-analysis ⭐ ENHANCED   ← evaluate test-loop
Step 5: Summary                                   ← enhanced with observations
```

### Step 2: Strategic Review

Runner reads pre-flight.sh output (from Track 2) which includes trend data, then reasons about:

**Questions the runner asks itself** (ordered by priority):

1. **Coverage plateau?**
   - If coverage unchanged for 3+ rounds → note directive: "coverage plateau at {N}%"
   - If coverage < 50% → suggest focusing SCAN on untested categories

2. **Regression hotspots?**
   - If regressions > 50% of total discoveries → warn: "regression rate concerning"
   - Identify categories with most regressions → prioritize those in SCAN

3. **Fix quality?**
   - Calculate fix success rate: `fixed / (fixed + failed_after_fix)` from last 3 rounds
   - If declining → note: "fix quality declining, consider framework review"

4. **SCAN precision?**
   - If SCAN consistently produces gaps that GENERATE filters as false positives → note
   - If last SCAN had >50% false positive rate → inject skip directive for low-value scanners

5. **Efficiency?**
   - If average round duration increasing → note: "round duration trending up"
   - If any phase consistently takes >10 min → suggest investigation

6. **Scan strategy selection** (from `scan-strategies.yaml`):
   - Default: `coverage` every round
   - Every 3 rounds: add `design-fidelity` and `performance`
   - Every 5 rounds: add `ux-review` and `architecture`
   - Override: if specific category has high regression → force that scanner this round

**Output**: Array of directives to inject before spawning test-loop.

### New file: `tests/executors/trend-analyzer.sh`

Helper script that reads round summaries and outputs structured trend data.

**Input**: `bash tests/executors/trend-analyzer.sh [num_rounds]` (default 3)

**Output JSON**:
```json
{
  "rounds": [23, 24, 25],
  "passed": [148, 156, 162],
  "failed": [34, 34, 34],
  "fixed": [18, 18, 18],
  "coverage": ["0%", "0%", "95.2%"],
  "trends": {
    "passed": "increasing",
    "failed": "flat",
    "fixed": "flat",
    "coverage": "increasing"
  },
  "alerts": [
    {"type": "flat_metric", "metric": "failed", "duration": 3, "value": 34},
    {"type": "flat_metric", "metric": "fixed", "duration": 3, "value": 18}
  ],
  "roundDurations": [null, null, null],
  "discoveryStats": {
    "total": 44,
    "verified": 13,
    "regression": 26,
    "regressionRate": 0.59
  }
}
```

### New file: `tests/scan-strategies.yaml`

```yaml
# Scan strategy definitions for runner Strategic Review
strategies:
  coverage:
    frequency: every_round
    description: "Standard test coverage gap scan (existing SCAN logic)"

  design-fidelity:
    frequency: every_3_rounds
    description: "Compare spec AC with actual implementation behavior"
    executor: design-fidelity-scanner.sh
    # Created in Track 4 (ISS-146), referenced here for scheduling

  ux-review:
    frequency: every_5_rounds
    description: "Playwright-driven UX workflow evaluation"
    executor: ux-reviewer.sh
    # Created in Track 4 (ISS-146)

  performance:
    frequency: every_3_rounds
    description: "API response times and casework timing vs baselines"
    executor: performance-scanner.sh
    # Created in Track 4 (ISS-146)

  architecture:
    frequency: every_5_rounds
    description: "CLAUDE.md compliance and code anti-pattern scan"
    executor: architecture-scanner.sh
    # Created in Track 4 (ISS-146)

# Override rules (runner Strategic Review applies these)
overrides:
  high_regression_category: "Force scan for category with >5 regressions"
  coverage_plateau: "Add design-fidelity scan if coverage flat 3+ rounds"
```

**Note**: The scanner executors themselves are created in Track 4. This track only creates the strategy configuration and the runner logic that reads it.

### Step 4 Enhancement: Meta-analysis

After test-loop returns its summary, runner evaluates:

**Questions**:
1. **Did test-loop complete the expected phases?** If SCAN→GENERATE expected but only SCAN done → efficiency issue
2. **How many tool calls did test-loop use?** (Estimate from round duration and items processed)
3. **Did any phase produce anomalous results?** (0 gaps from SCAN, 100% fail from TEST, etc.)
4. **Are there framework code issues suggested by patterns?** (Same executor failing across different tests)

**Actions if issues found**:
```bash
# Record to learnings
bash tests/executors/learnings-writer.sh \
  "meta-{round}" "framework" \
  "{problem description}" \
  "{diagnosis}"

# Inject framework fix (test-loop FIX phase will execute it next round)
# Read current fixQueue, prepend new item, write back
echo '{"fixQueue": [{new_item}, ...existing]}' | bash tests/executors/state-writer.sh --merge

# Record self-heal action
bash tests/executors/self-heal-recorder.sh \
  "meta-{round}" "meta_analysis" \
  "{pattern}" "N/A" "{diagnosis}" \
  "Injected framework fix from meta-analysis"
```

### Modified: `.claude/agents/test-supervisor-runner.md`

Full updated agent definition with all 5 steps. Key additions are Step 1 (Reasoning Self-check), Step 2 (Strategic Review) and the meta-analysis portion of Step 4.

### Immutable Core + Reasoning Shell Architecture

**Problem**: When runner injects fixQueue items that modify framework files (executors, agent definitions, phase instructions), the next loop's runner might lose capabilities — e.g., can no longer read state, can no longer spawn test-loop, can no longer reason about anomalies.

**Failed approach (rejected)**: Rule-based smoke tests (check specific fields, validate specific scripts). This is the same pattern-matching trap as pattern-detector — brittle, incomplete, always one step behind.

**Chosen approach**: Protect only the reasoning capability itself. If runner can still **think**, it can investigate and recover from anything.

#### Core Insight

Runner's self-healing power comes from 4 capabilities:

| Capability | What it means | Protected by |
|------------|--------------|--------------|
| **Start** | Runner can be spawned and begin execution | `test-supervisor-runner.md` |
| **Observe** | Runner can read state, files, git history | `test-loop.md` (spawning test-loop) |
| **Act** | Runner can inject fixQueue, write directives, spawn agents | `state-writer.sh` (atomic state writes) |
| **Remember** | Runner can record learnings and evolution | `safety.yaml` (prevents unsafe actions) |

If these 4 files are intact, runner can always:
1. Read what happened (`git log`, `git diff`, state.json)
2. Reason about what went wrong
3. Fix it (rollback via `git checkout`, inject new fixQueue)
4. Record the lesson

Everything else — executors, phase instructions, scanners, config files — is **recoverable** through reasoning + git.

#### Immutable Core (4 protected files)

```yaml
# These files CANNOT be modified by any automated process (test-loop FIX, meta-analysis fixQueue, etc.)
# Only human edits (direct user action) can change them.
immutable_core:
  - .claude/agents/test-supervisor-runner.md    # Runner's own definition
  - .claude/agents/test-loop.md                 # Test-loop agent definition
  - tests/safety.yaml                           # Safety rules (including this protection)
  - tests/executors/state-writer.sh             # Atomic state write mechanism
```

**Why these 4?**
- `runner.md` — If this is corrupted, runner loses its instructions (can't start/reason)
- `test-loop.md` — If this is corrupted, runner can't spawn test-loop (can't observe/act)
- `safety.yaml` — If this is corrupted, protections can be bypassed (loses safety boundary)
- `state-writer.sh` — If this is corrupted, state.json becomes unreliable (loses data integrity)

#### Reasoning Shell (everything else)

All other framework files are `auto_fixable` — protected by reasoning, not by rules:

```yaml
auto_fixable:
  - tests/executors/*.sh           # Scanner/executor scripts
  - .claude/skills/test-loop/phases/*.md  # Phase instruction files
  - tests/scan-strategies.yaml     # Scan configuration
  - tests/baselines.yaml           # Performance baselines
  - .claude/skills/test-supervisor/modes/*.md  # Supervisor mode files
```

When these files are modified by test-loop's FIX phase:
1. Git tracks the change (normal commit)
2. Next round, runner's Step 1 self-check **reasons** about whether things are working
3. If anomalies detected → runner investigates via `git log`/`git diff` → decides to rollback or keep

#### Step 1: Reasoning Self-check (Runner's first action)

After running `pre-flight.sh`, runner performs a **reasoning-based** (not rule-based) self-check:

```markdown
## Step 1: Pre-flight + Reasoning Self-check

1. Run `bash tests/executors/pre-flight.sh` → get gate + state JSON
2. If gate != "pass" → exit with gate reason

3. **Reasoning self-check** (ask yourself these questions):

   a. "Did pre-flight.sh run successfully and produce valid JSON?"
      - If not → something broke the pre-flight script → investigate
      - Run: `git log --oneline -5 -- tests/executors/pre-flight.sh`
      - If recent changes → `git diff HEAD~1 -- tests/executors/pre-flight.sh` to see what changed
      - Decide: rollback or adapt

   b. "Does the pre-flight data look reasonable?"
      - Round number should be > 0 and ≤ maxRounds
      - Phase should be one of: SCAN, GENERATE, TEST, FIX, VERIFY, COMPLETE
      - Queue sizes should be non-negative integers
      - If any value looks anomalous → investigate state.json directly

   c. "Did last round's test-loop modify any framework files?"
      - Run: `git log --oneline -3 --name-only -- tests/executors/ .claude/skills/test-loop/phases/`
      - If framework files were changed in recent commits:
        - Read the diff: `git diff HEAD~1 -- {changed_file}`
        - Reason: "Does this change make sense? Is it a legitimate fix or damage?"
        - If damage detected → `git checkout HEAD~1 -- {file}` to rollback
        - Record to self-heal-recorder.sh

   d. "Am I (runner) still functioning correctly?"
      - Can I parse the pre-flight JSON? (already verified in step a)
      - Can I reason about the data? (you're doing it right now)
      - Can I formulate directives? (attempt to form a test directive)
      - If any capability feels broken → STOP and output error to main session

4. If self-check passes → proceed to Step 2 (Strategic Review)
   If self-check fails → output diagnostic summary and exit
```

**Key design principle**: No hardcoded checks like "verify field X exists in file Y". Instead, runner **reads, reasons, and decides**. This means:
- New framework files added later are automatically covered
- Changed file formats don't break the self-check
- Runner can handle novel failure modes it's never seen before

#### Updated safety.yaml Schema

```yaml
# tests/safety.yaml — restructured with Immutable Core

# === Immutable Core ===
# These files are NEVER modified by automated processes.
# Only direct human edits can change them.
# Test-loop FIX phase must skip these even if they appear in fixQueue.
immutable_core:
  - path: ".claude/agents/test-supervisor-runner.md"
    reason: "Runner's own reasoning definition — self-modification would be self-lobotomy"
  - path: ".claude/agents/test-loop.md"
    reason: "Test-loop agent definition — runner's primary tool for observation and action"
  - path: "tests/safety.yaml"
    reason: "Safety rules — modifying protections defeats the purpose"
  - path: "tests/executors/state-writer.sh"
    reason: "Atomic state mechanism — corruption here corrupts all state"

# === Auto-fixable (Reasoning Shell) ===
# These files CAN be modified by test-loop FIX phase.
# Runner's reasoning self-check (Step 1) monitors changes and can rollback if needed.
auto_fixable:
  - pattern: "tests/executors/*.sh"
    exclude: ["state-writer.sh"]  # already in immutable_core
    reason: "Executor scripts — runner monitors via git diff"
  - pattern: ".claude/skills/test-loop/phases/*.md"
    reason: "Phase instructions — runner verifies behavior after changes"
  - pattern: "tests/scan-strategies.yaml"
    reason: "Scan config — safe to evolve"

# === Blocked (no automated access) ===
# These are outside the test framework's domain entirely.
blocked_paths:
  - action: "dashboard/**"
    reason: "Project production code — test framework observes, never modifies"
  - action: "cases/**"
    reason: "Case data — completely separate domain"
  - action: "skills/**"
    reason: "Domain skills (casework, etc.) — not test framework's responsibility"
  - action: ".claude/skills/test-supervisor/**"
    reason: "Supervisor skill — only human-modified"

# === Safety Red Lines ===
# Behaviors that are NEVER acceptable regardless of reasoning
safety_red_lines:
  - "Never execute commands that modify production data (cases/, dashboard/ DB)"
  - "Never send emails or messages to external systems"
  - "Never modify .claude/agents/ files (immutable core)"
  - "Never delete test results or round summaries"
  - "Never bypass state-writer.sh for state.json modifications"
  - "Never run commands with network access beyond localhost (curl to external APIs)"
```

## Dependencies

- **Track 2 (ISS-144)**: Pre-flight.sh provides the structured input for Strategic Review
- `tests/executors/common.sh`
- `tests/executors/learnings-writer.sh` (for meta-analysis findings)
- `tests/executors/self-heal-recorder.sh` (for self-heal recording)
- `tests/executors/state-writer.sh` (for fixQueue injection — also an immutable core file)
- `git` CLI available in bash (for reasoning self-check `git log`/`git diff`/`git checkout`)

## Out of Scope

- Scanner executor scripts (Track 4 / ISS-146)
- WebUI runner controls (Track 5 / ISS-147)
- Changes to test-loop execution logic (only runner changes)
- Immutable core enforcement in test-loop FIX phase (test-loop already respects safety.yaml `blocked_paths`; renaming to `immutable_core` is a schema change only)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `.claude/agents/test-supervisor-runner.md` | MODIFY | Add Reasoning Self-check (Step 1), Strategic Review (Step 2), Meta-analysis (Step 4) |
| `tests/executors/trend-analyzer.sh` | CREATE | Round summary trend analysis |
| `tests/scan-strategies.yaml` | CREATE | Scan strategy configuration |
| `tests/safety.yaml` | MODIFY | Restructure: `blocked_paths` → `immutable_core` + `auto_fixable` + `blocked_paths` + `safety_red_lines` |

## Testing

- Run `bash tests/executors/trend-analyzer.sh` → verify JSON output with actual round data
- Run `/test-supervisor run` → verify runner performs Strategic Review before spawning
- Verify Strategic Review outputs sensible observations given current trends (failed flat at 34)
- Verify Meta-analysis detects when test-loop had anomalous results
- Test fixQueue injection → verify framework fix item appears in state.json
- Test with all-healthy state → verify no unnecessary directives injected
- **Immutable Core tests**:
  - Manually modify an `auto_fixable` file → verify runner Step 1 detects via `git diff` and reasons about it
  - Inject a fixQueue item targeting an `immutable_core` file → verify test-loop FIX phase skips it
  - Corrupt pre-flight.sh output → verify runner Step 1 detects and investigates via `git log`
  - Test reasoning self-check with clean state → verify it passes quickly without unnecessary investigation

## Risks

- **Over-intervention**: Runner might inject too many directives, confusing test-loop. Mitigate: max 3 directives per Strategic Review.
- **Trend noise**: With only 3 rounds of data, trend detection may be noisy. Mitigate: require 3+ rounds of consistent signal before acting.
- **Meta-analysis cost**: Adding reasoning steps increases runner's own execution time. Mitigate: keep meta-analysis questions structured (not open-ended exploration).
- **Self-check overhead**: Reasoning self-check adds ~2-3 tool calls per runner invocation. Mitigate: only run `git log`/`git diff` when pre-flight data suggests potential issues; skip deep investigation when everything looks normal.
- **Rollback false positives**: Runner might rollback a legitimate framework evolution. Mitigate: runner records all rollback decisions to self-heal-recorder.sh with reasoning; patterns of incorrect rollbacks become visible in evolution timeline.
- **safety.yaml migration**: Changing from `blocked_paths` to `immutable_core`/`auto_fixable` might break test-loop's existing safety checks. Mitigate: test-loop reads `immutable_core` with same skip logic as old `blocked_paths`; add backward compatibility check.
