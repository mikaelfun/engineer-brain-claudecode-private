## GENERATE Phase — Create test definitions from gaps

**Goal**: For each gap found in SCAN, generate a test definition YAML file.

**Execution**: Main Agent directly (no spawn).

### Steps

1. Read gap list from `state.json`
2. For each gap, classify and generate:

   **Classification rules**:
   - **Normal gaps** (SCAN auto-discovered): API → `backend-api`, component → `ui-interaction`, skill → `workflow-e2e`, npm test → `unit-test`
   - **spec-driven gaps** (from spec-scanner.sh, source=`spec-driven`):
     - Workflow output/file generation/script behavior → `workflow-e2e` (E2E)
     - User interaction: click/form/dialog/state → `ui-interaction` (Interaction)
     - Appearance: layout/style/theme/screenshot → `ui-visual` (Visual)
     - Backend: endpoint/response format → `backend-api` (API)
     - Unit test/npm test/vitest → `unit-test`
     - Probe/baseline/audit → `observability`
     - D365 write/execute → **skip** (mark skip reason)
   - **issue-driven gaps**: same classification based on AC content

3. For each gap:
   - Check `tests/safety.yaml` for `safety_level`
   - Generate `tests/registry/{category}/{id}.yaml` per `tests/schemas/test-definition.yaml` format
   - Spec-driven gaps: add `source: spec-driven` and `trackId` fields
   - Add testId to `state.json.testQueue`

4. Update `tests/manifest.json` coverage
5. Set `state.json` phase=TEST
