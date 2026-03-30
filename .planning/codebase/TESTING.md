# Testing

## Framework

| Component | Tool | Config |
|-----------|------|--------|
| Backend unit tests | Vitest ^4.1.0 | `dashboard/package.json` |
| Frontend unit tests | Vitest + React Testing Library | `dashboard/web/package.json` |
| Coverage | @vitest/coverage-v8 | Both backend and frontend |
| E2E / Integration | Custom bash executors | `tests/executors/` |
| Visual testing | Playwright MCP (Edge) | `.mcp.json` |

## Test Structure

### Dashboard Tests (Vitest)
- **Location**: Co-located with source files (`*.test.ts`, `*.test.tsx`)
- **Backend tests**: `dashboard/src/routes/*.test.ts`, `dashboard/src/services/*.test.ts`
- **Frontend tests**: `dashboard/web/src/pages/*.test.ts`, `dashboard/web/src/components/*.test.ts`
- **Run**: `npm test` in `dashboard/` (runs both backend + frontend)
- **Watch**: `npm run test:watch`

### Custom Test Framework (`tests/`)
- **Registry**: `tests/registry/` — 7 categories of test definitions
  - `backend-api/` — API endpoint tests
  - `frontend/` — Frontend component tests
  - `observability/` — Monitoring/health tests
  - `ui-interaction/` — UI interaction tests
  - `ui-visual/` — Visual regression tests
  - `unit-test/` — Unit test definitions
  - `workflow-e2e/` — End-to-end workflow tests
- **Executors**: `tests/executors/` — 40+ bash scripts for running tests
  - `api-runner.sh`, `ui-runner.sh`, `unit-runner.sh`, `visual-runner.sh`
  - `e2e-runner.sh`, `observability-runner.sh`
  - Support scripts: `common.sh`, `pre-flight.sh`, `health-check.sh`
  - Analysis: `fix-analyzer.sh`, `trend-analyzer.sh`, `pattern-detector.sh`
- **Results**: `tests/results/` — Test output and screenshots
- **State Machine**: `tests/state.json` — Tracks test loop phase, round, stats
  - Current state: Round 28, IDLE phase
  - Stats: 165 passed, 44 failed, 44 fixed, 13 skipped

### Test Loop Pattern (SCAN → GENERATE → TEST → FIX → VERIFY)
The test framework follows a cyclic pattern:
1. **SCAN**: Detect gaps (issue-driven, observability, spec-driven)
2. **GENERATE**: Create test cases from gaps
3. **TEST**: Execute tests
4. **FIX**: Auto-fix failures where possible
5. **VERIFY**: Confirm fixes

Managed by `test-supervisor` skill and `stage-worker` agent.

## Test Scripts (`scripts/`)
- `scripts/smoke-test-webui.mjs` (143 lines) — Dashboard smoke tests
- `scripts/stress-test.mjs` (116 lines) — Load/stress testing
- `scripts/visual-test.mjs` (55 lines) — Visual regression
- `scripts/interactive-test.mjs` — Interactive test harness
- `scripts/validate-casework.ps1` — Casework validation

## Mocking Patterns
- Vitest mocking (`vi.mock`, `vi.fn`)
- Service layer mocking for route tests
- File system mocking for service tests (case directory reads)

## Coverage
- `npm run test:coverage` — Backend + frontend combined
- `@vitest/coverage-v8` for both
- No enforced thresholds detected

## Safety
- Test safety redlines defined in `playbooks/rules/test-safety-redlines.md`
- Tests must not write to real D365 or send real emails
- Tests must not modify production case data
