## GENERATE Phase — Create test definitions from gaps

**Goal**: For each gap found in SCAN, generate a test definition YAML file.

**Execution**: Main Agent directly (no spawn).

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"GENERATE":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

### Steps

1. Read gap list from `tests/pipeline.json`

2. **Recipe Lookup** (advisory — graceful degradation if files missing):

   a. Try to read `tests/recipes/generation/_index.md`
      - File not found → skip recipe matching, **all gaps use step 3 hardcoded classification**

   b. For each gap, match against the index priority table:
      - **Input signals**: gap `source` field × gap content/AC keywords
      - Walk the table top-down → **first match wins**
      - Matched → read the recipe `.md` file, extract:
        - **Category** (if recipe specifies; otherwise derive from template type)
        - **YAML template structure** — base steps + assertions skeleton
        - **Recommended assertion types** — prefer recipe suggestions over generic defaults
        - **Common pitfalls** — check "常见坑" to avoid known failure patterns
      - Record `recipe_used: {recipe-filename}` in generated test's metadata

   c. No match in index → mark gap as `recipe_used: none` → fall through to step 3

3. For gaps **without recipe match**, classify using hardcoded rules (fallback):

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
   - **design-fidelity gaps** (from design-fidelity-scanner.sh, source=`design-fidelity`):
     - Category already set by scanner (ui-interaction, backend-api, workflow-e2e, etc.)
     - Add `source: design-fidelity` and `trackId` fields
     - Template: spec-driven template with runtime verification steps
   - **ux-review gaps** (from ux-reviewer.sh, source=`ux-review`):
     - Default category: `ui-interaction`
     - Template: UX test with Playwright workflow steps (navigate → check → assert)
     - Focus: loading states, error handling, empty states, navigation consistency
   - **performance gaps** (from performance-scanner.sh, source=`performance`):
     - API response time issues → `backend-api` with timing assertions
     - Casework timing drift → `workflow-e2e` with timing_under assertions
     - Template: Performance test with `timing_under` assertion type, baseline reference
   - **architecture gaps** (from architecture-scanner.sh, source=`architecture`):
     - Code compliance issues → `workflow-e2e` with file_content/text_contains assertions
     - Template: Compliance check test (grep/file analysis), automated fix possible

4. For each gap (recipe-guided or hardcoded-classified):
   - **Write stageProgress** before generating each test:
     ```bash
     echo '{"currentTest":"{gap_description}","stageProgress":{"current":'$((i+1))',"total":{TOTAL_GAPS},"testId":"{gap_description}"}}' | bash tests/executors/state-writer.sh --target pipeline --merge
     ```
   - Check `tests/safety.yaml` for `safety_level`
   - Generate `tests/registry/{category}/{id}.yaml` per `tests/schemas/test-definition.yaml` format
   - If recipe-guided: follow recipe's YAML template structure and recommended assertions
   - If hardcoded-classified: use category-default template
   - Spec-driven gaps: add `source: spec-driven` and `trackId` fields
   - Design-fidelity gaps: add `source: design-fidelity` and `trackId` fields
   - Add testId to testQueue (via `state-writer.sh --target queues --merge`)

5. Update `tests/manifest.json` coverage
6. Set currentStage=TEST (via `state-writer.sh --target pipeline --merge`)
