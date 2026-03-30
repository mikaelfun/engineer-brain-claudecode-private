# Conductor: Verify Track

Verify a completed track's implementation against its acceptance criteria using **推理驱动 + Recipe 自我演进** architecture.

## Arguments

- `{trackId}` — required, the track ID to verify (e.g. `verify-redesign_20260329`)
- `--mark-done` — optional, skip tests and mark track as verified (sets `verification.status: "skipped"`)

## Pre-flight Checks

1. Verify track exists: `conductor/tracks/{trackId}/spec.md` and `plan.md`
2. Verify track status is `complete` or `in_progress` (reject `pending`)
3. Load files:
   - `conductor/tracks/{trackId}/spec.md` — acceptance criteria source
   - `conductor/tracks/{trackId}/plan.md` — task completion status
   - `conductor/tracks/{trackId}/metadata.json` — current state

## `--mark-done` Fast Path

If `--mark-done` flag is present:
1. Write to `metadata.json`:
   ```json
   {
     "verification": {
       "status": "skipped",
       "reason": "mark-done by user",
       "timestamp": "ISO_TIMESTAMP"
     }
   }
   ```
2. Update `tracks.md` status to `[x]`
3. Display: "Track marked done (verification skipped). Issue derived as `done`."
4. **Exit** — skip all remaining steps.

---

## Step 1: Regression Guard

**Purpose:** Catch regressions introduced by the implementation. This is NOT the core verification — just a safety net.

### Procedure

1. Run unit tests:
   ```bash
   cd dashboard && npm test 2>&1
   ```
2. If tests fail:
   - Display failing tests
   - Ask user: "Unit tests failing. Fix first or continue verification?"
   - Do NOT auto-continue
3. If tests pass: proceed to Step 2

### Output
- `regression: PASS | FAIL`
- Failing test names (if any)

---

## Step 2: 推理验证方案

**Purpose:** Read spec, extract each acceptance criterion, and reason about how to verify it.

### Procedure

1. **Read spec**: `conductor/tracks/{trackId}/spec.md`
2. **Extract acceptance criteria**: Parse all `- [ ] AC*:` lines from `## Acceptance Criteria` section
3. **Read recipe index**: `playbooks/guides/verification-recipes/_index.md`
4. **For each criterion, reason:**

   a. **Classify verification type** — use the matching rules from `_index.md`:
      | 关键词 | Recipe |
      |-------|--------|
      | UI 页面、组件、布局、按钮、主题 | `web-ui-playwright.md` |
      | CLI、脚本、shell、命令行输出 | `cli-script-output.md` |
      | API 端点、HTTP 响应、curl | `api-endpoint.md` |
      | 文件内容、行数、格式、JSON | `file-content-check.md` |
      | 以上都不匹配 | LLM 从零推理 |

   b. **Check for matching recipe** — if a recipe matches:
      - Read the recipe file
      - Extract relevant steps for this specific criterion
      - Note any "常见坑" to watch for

   c. **Determine if verifiable** — some criteria require running full casework/LLM:
      - If criterion involves LLM reasoning (can't test deterministically) → classify as `SKIP` with justification
      - Otherwise → generate verification plan

5. **Build verification plan table:**

   ```
   | # | Criterion | Type | Recipe | Verifiable | Plan |
   |---|-----------|------|--------|------------|------|
   | 1 | AC1: ... | file | file-content-check | YES | Check file exists + sections |
   | 2 | AC2: ... | ui | web-ui-playwright | YES | Navigate + click + assert |
   | 3 | AC3: ... | - | none | SKIP | Requires LLM runtime |
   ```

6. **Display plan and ask user:**
   ```
   Verification plan for {trackId}:
   {table}

   Proceed with verification?
   1. Yes, run all verifiable criteria
   2. Skip verification, mark done
   3. Edit plan
   ```

### Output
- Verification plan table
- Per-criterion: type, recipe reference, verifiable flag, plan summary

---

## Step 3: 执行验证

**Purpose:** Execute the verification plan from Step 2.

### Procedure

For each verifiable criterion (in order):

1. **Announce:** `Verifying AC{N}: {criterion description}...`

2. **If recipe matched:**
   - Read the recipe file (`playbooks/guides/verification-recipes/{recipe}.md`)
   - Follow the recipe's **前置检查** section first
   - Execute the recipe's **执行步骤** adapted to this specific criterion
   - Watch for issues listed in **常见坑**

3. **If no recipe matched (from-scratch reasoning):**
   - LLM reasons about what to check
   - Generate verification commands/script
   - Execute step by step
   - Track retries and issues encountered

4. **Record result per criterion:**
   ```
   {
     "criterion": "AC1: ...",
     "type": "file | cli | api | ui | custom",
     "recipe": "file-content-check.md" | null,
     "result": "PASS" | "FAIL",
     "evidence": "5 files found, all sections present",
     "retries": 0,
     "issues_encountered": []
   }
   ```

5. **On failure:**
   - Display the failure details
   - Ask: "AC{N} failed. Continue remaining criteria or stop?"
   - Record failure evidence for report

### Execution Tracking

Track the following for Step 5 (reflection):
- `retries_per_criterion`: number of retry attempts per AC
- `issues_encountered`: list of unexpected problems (env, tools, etc.)
- `scripts_generated`: any verification script > 10 lines
- `recipe_mismatches`: cases where recipe steps were incorrect/outdated

### Output
- Per-criterion: PASS/FAIL + evidence
- Execution tracking data for reflection

---

## Step 4: 汇总报告

**Purpose:** Compile results into a summary and write to metadata.json.

### Procedure

1. **Display summary:**
   ```
   ═══════════════════════════════════════════
   Verification Report: {trackId}
   ═══════════════════════════════════════════

   Regression Guard: ✅ PASS (all unit tests passing)

   Acceptance Criteria:
     ✅ AC1: {description} — {evidence}
     ❌ AC2: {description} — {failure details}
     ⏭️ AC3: {description} — SKIPPED (requires LLM runtime)
     ✅ AC4: {description} — {evidence}

   Result: {PASSED | FAILED | PARTIAL}
   Passed: X/Y verifiable criteria
   Skipped: Z criteria (justified)
   ═══════════════════════════════════════════
   ```

2. **Determine overall status:**
   - All verifiable PASS → `"passed"`
   - Any FAIL → `"failed"`
   - All skipped → `"skipped"`

3. **Write to metadata.json:**
   ```json
   {
     "verification": {
       "status": "passed" | "failed" | "skipped",
       "timestamp": "ISO_TIMESTAMP",
       "regression": "pass" | "fail",
       "criteria": [
         {
           "id": "AC1",
           "description": "...",
           "result": "pass" | "fail" | "skip",
           "evidence": "...",
           "recipe": "file-content-check.md" | null
         }
       ]
     }
   }
   ```

4. **Update tracks.md:**
   - If passed/skipped: change `[~]` → `[x]`
   - If failed: keep `[~]`

### Output
- Summary report displayed to user
- `metadata.json` updated with verification results
- Issue status automatically derived:
  - `verification.status: "passed"/"skipped"` → issue becomes `done`
  - `verification.status: "failed"` → issue stays `implemented`

---

## Step 5: 反思提取（Recipe Evolution）

**Purpose:** After verification, reflect on the process and extract new recipes or update existing ones.

### Trigger Conditions

**Only perform reflection if ANY of these are true:**

| Condition | Check | Action |
|-----------|-------|--------|
| Retries >= 2 on any criterion | `retries_per_criterion[i] >= 2` | Extract as new recipe |
| Encountered environment/tool pitfall | `issues_encountered` non-empty | Append to existing recipe's "常见坑" |
| Generated script > 10 lines | `scripts_generated` has long scripts | Consider extracting as recipe |
| Existing recipe had wrong/outdated steps | `recipe_mismatches` non-empty | Update the recipe |

**If none triggered:** Skip reflection entirely. Display: "Verification smooth — no recipe updates needed."

### Procedure (when triggered)

1. **Self-reflection prompt:**
   ```
   Reflecting on verification of {trackId}...

   Questions:
   1. Did any verification take > 2 exploration steps?
   2. Were there unexpected pitfalls (port, auth, tool config)?
   3. Are these experiences already in existing recipes?
   4. Were any existing recipe steps incorrect?
   ```

2. **For new recipe extraction:**
   - Create `playbooks/guides/verification-recipes/{new-recipe-name}.md`
   - Follow the standard recipe format (匹配条件 / 前置检查 / 执行步骤 / 常见坑)
   - Update `_index.md`:
     - Add new row to matching rules table
     - Add entry to 演进日志

3. **For recipe updates:**
   - Edit the specific recipe file
   - If adding a new 常见坑 entry: append to the table
   - If fixing a step: update in-place with comment about what changed
   - Update `_index.md` 演进日志:
     ```
     | {date} | {recipe} | {what changed} | {why} |
     ```

4. **Display changes:**
   ```
   Recipe Evolution:
   - Updated: web-ui-playwright.md — added new pitfall about SSE timeout
   - Created: workflow-e2e.md — new recipe for casework pipeline verification
   ```

### Output
- Recipe files created/updated (or "no changes needed")
- `_index.md` 演进日志 updated

---

## Error Handling

| Error | Response |
|-------|----------|
| Track not found | Display error with closest track ID match |
| spec.md has no acceptance criteria | Warn and offer `--mark-done` |
| npm test hangs > 120s | Kill and report timeout |
| Playwright browser launch fails | Check msedge availability, suggest `mcp__playwright__browser_install` |
| Recipe file missing/corrupt | Warn and fallback to from-scratch reasoning |
| metadata.json write fails | Retry once, then display manual fix instructions |
