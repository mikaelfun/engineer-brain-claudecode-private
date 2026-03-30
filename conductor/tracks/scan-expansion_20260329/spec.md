# Specification: SCAN Multi-type Expansion

**Track ID:** scan-expansion_20260329
**Issue:** ISS-146
**Type:** Feature
**Created:** 2026-03-29
**Status:** Draft

## Summary

Expand the SCAN phase from "test coverage gap discovery only" to a multi-strategy scanner supporting 5 gap types: coverage (existing), design-fidelity, UX-review, performance, and architecture. Each scanner produces typed gaps that flow into the existing GENERATE→TEST→FIX→VERIFY pipeline. Runner's Strategic Review (Track 3) selects which scanners to activate per round via `scan-strategies.yaml`.

## Context

### Current SCAN coverage
- API endpoint presence (grep routes)
- UI component presence (ls components)
- Skill/workflow coverage (ls skills)
- Issue-driven gaps (issue-scanner.sh)
- Observability gaps (observability-scanner.sh)
- Spec acceptance criteria (spec-scanner.sh)

All of these ask the same question: **"Does this feature have a test?"**

### Missing gap types

| Gap Type | Question | Example |
|----------|----------|---------|
| Design-fidelity | "Does the implementation match the spec?" | "Spec says show timestamp, page doesn't" |
| UX-review | "Is the user experience good?" | "Todo list has no search/filter" |
| Performance | "Is the system fast enough?" | "API response time doubled since R15" |
| Architecture | "Is the code healthy?" | "e2e-runner.sh disabled set -u" |

## Motivation

The user's core goal: **"代替我不断的去 webui 测试功能，发现问题，提高效率"** — replace repetitive manual WebUI testing. This requires scanning for more than just missing tests.

## Success Criteria

- [ ] 4 new scanner scripts created and functional
- [ ] Each scanner outputs gaps in standard format compatible with GENERATE phase
- [ ] `phases/SCAN.md` updated to dispatch scanners based on `scan-strategies.yaml` selection
- [ ] Runner Strategic Review (Track 3) can activate/deactivate scanners per round
- [ ] New gap types can be converted to test definitions by GENERATE phase
- [ ] At least 1 real gap discovered by each new scanner type in first run

## Technical Design

### Gap output format (standard across all scanners)

All scanners output lines to stdout in a common format:
```
GAP|{type}|{source}|{category}|{description}|{priority}
```

Examples:
```
GAP|design-fidelity|spec-driven|ui-interaction|CaseDetail missing timestamp display per ISS-089 AC3|P2
GAP|ux-review|ux-scan|ui-interaction|Todo list has no search/filter capability|P3
GAP|performance|perf-scan|backend-api|GET /api/cases response time 2.3x baseline|P1
GAP|architecture|arch-scan|workflow-e2e|e2e-runner.sh uses set +u violating CLAUDE.md strict mode|P2
```

SCAN phase collects all GAP lines and appends to `state.json.gaps` array.

### Scanner 1: `design-fidelity-scanner.sh`

**Purpose**: Compare spec acceptance criteria with actual implementation.

**How it works**:
1. Read all `conductor/tracks/*/spec.md` files for completed (done) tracks
2. Extract `## Success Criteria` checklist items
3. For each criterion:
   - Parse the expected behavior ("show timestamp", "display badge", "sort by date")
   - Check if the implementation file exists and contains relevant code
   - For API criteria: check route handler for expected fields
   - For UI criteria: check component TSX for expected elements
4. Output GAP lines for criteria that appear unimplemented

**Limitations**: Static analysis only (grep/pattern matching). Cannot verify runtime behavior — that's what the generated test will do.

**Schedule**: every_3_rounds (from scan-strategies.yaml)

### Scanner 2: `ux-reviewer.sh`

**Purpose**: Walk core user workflows in WebUI, evaluate usability.

**How it works**:
1. Define 3-5 core user journeys (hardcoded in script):
   - `case-list → open case → view details → check todo`
   - `issue list → view issue → check track status`
   - `test lab → view pipeline → check discoveries`
   - `settings → modify config`
2. For each journey:
   - Use `curl` to hit API endpoints and verify response structure
   - Check for common UX anti-patterns:
     - Missing loading states (no Loading component)
     - Missing empty states (no EmptyState component)
     - Missing error boundaries (no ErrorBoundary)
     - Inconsistent navigation (sidebar links vs actual routes)
   - Compare against `playbooks/guides/dashboard-design-system.md` rules
3. Output GAP lines for UX issues found

**Note**: This scanner does NOT use Playwright (too heavy for SCAN phase). It uses static code analysis of TSX files + API endpoint testing. Actual Playwright UI tests are generated in TEST phase.

**Schedule**: every_5_rounds

### Scanner 3: `performance-scanner.sh`

**Purpose**: Check API and workflow performance against baselines.

**How it works**:
1. Read `tests/baselines.yaml` for thresholds
2. Hit key API endpoints with `curl` and measure response time:
   - `GET /api/health` (baseline: <500ms)
   - `GET /api/cases` (baseline: <2s)
   - `GET /api/tests/state` (baseline: <500ms)
   - `GET /api/todos` (baseline: <1s)
3. Check latest casework timing data (`tests/results/` for timing.json)
4. Compare actual vs baseline × warn_ratio
5. Output GAP lines for endpoints exceeding thresholds

**Prerequisite**: Dashboard must be running (`curl -sf localhost:3010/api/health`). If not running → skip with note.

**Schedule**: every_3_rounds

### Scanner 4: `architecture-scanner.sh`

**Purpose**: Check code health and CLAUDE.md compliance.

**How it works**:
1. **CLAUDE.md compliance**:
   - Check all `tests/executors/*.sh` for POSIX path format (no `C:\`)
   - Check for `; VAR=... |` anti-pattern (pipe + variable assignment)
   - Check all `.claude/agents/*.md` for required frontmatter fields
2. **Code anti-patterns**:
   - Check for `set +u` in shell scripts (should use `set -u`)
   - Check for hardcoded paths in scripts (should use `$TESTS_ROOT`)
   - Check for `browser_snapshot` usage (banned per CLAUDE.md)
   - Check for direct state.json writes (should use state-writer.sh)
3. **Dependency analysis**:
   - Check `dashboard/package.json` for outdated dependencies (npm outdated)
   - Check for unused imports in TSX files (basic grep check)
4. Output GAP lines for violations found

**Schedule**: every_5_rounds

### Modified: `phases/SCAN.md`

Add a new section at the top of SCAN.md:

```markdown
### Step 0.6: Run Additional Scanners (if activated by runner)

Check pre-flight briefing for `activeScanners` array. For each activated scanner:
1. Run `bash tests/executors/{scanner-name}.sh`
2. Collect GAP output lines
3. Append to state.json.gaps with source tag

Only `coverage` scanner runs every round by default.
Additional scanners are activated by runner's Strategic Review based on scan-strategies.yaml.
```

### GENERATE phase compatibility

New gap types need to map to test categories:

| Gap type | Default test category | Test definition template |
|----------|----------------------|------------------------|
| design-fidelity | Depends on criterion (ui-interaction, backend-api, workflow-e2e) | spec-driven template with `source: design-fidelity` |
| ux-review | ui-interaction | UX test template with Playwright workflow steps |
| performance | backend-api (or observability) | Performance test with timing assertions |
| architecture | unit-test (or workflow-e2e) | Compliance check test with grep/file analysis |

The GENERATE phase already handles `spec-driven` gaps. New gap types will use similar patterns with different `source` tags.

## Dependencies

- **Track 2 (ISS-144)**: Needs split `phases/SCAN.md` file to modify
- **Track 3 (ISS-145)**: Runner Strategic Review selects scanners via `scan-strategies.yaml`
- Dashboard running for performance scanner (graceful skip if not)
- `playbooks/guides/dashboard-design-system.md` for UX scanner rules

## Out of Scope

- Suggested issues from scanner findings (future enhancement)
- Playwright-based UX testing in SCAN phase (too slow; Playwright tests generated for TEST phase)
- Auto-remediation of architecture violations (scanners only discover, FIX phase repairs)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `tests/executors/design-fidelity-scanner.sh` | CREATE | Spec vs implementation comparison |
| `tests/executors/ux-reviewer.sh` | CREATE | UX workflow analysis |
| `tests/executors/performance-scanner.sh` | CREATE | API/timing performance check |
| `tests/executors/architecture-scanner.sh` | CREATE | Code health and compliance scan |
| `.claude/skills/test-loop/phases/SCAN.md` | MODIFY | Add Step 0.6 for additional scanners |
| `.claude/skills/test-loop/phases/GENERATE.md` | MODIFY | Handle new gap types in test generation |

## Testing

- Run each scanner individually → verify GAP output format
- Run SCAN phase with all scanners activated → verify gaps collected in state.json
- Run GENERATE → verify new gap types produce valid test definitions
- Run full cycle (SCAN→GENERATE→TEST) → verify new test types execute successfully
- Test performance scanner with dashboard down → verify graceful skip
- Test architecture scanner → verify it catches known violations (e.g., `set +u` in e2e-runner.sh)
