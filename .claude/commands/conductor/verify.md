---
description: "Verify a completed track: run tests, mark done, or reopen"
argument-hint: "[trackId|ISS-xxx] [--mark-done | --reopen]"
---

# Verify Track

Verify a completed track by running tests, manually mark it done, or reopen for re-verification. Aligns CLI behavior with WebUI verify/mark-done/reopen buttons.

## Pre-flight Checks

1. Verify Conductor is initialized:
   - Check `conductor/tracks.md` exists
   - Check `conductor/tracks/` directory exists
   - If missing: Display error and suggest running `/conductor:setup` first

## Mode Detection

Parse arguments to determine operation mode:

| Argument Pattern | Mode | Description |
|-----------------|------|-------------|
| `[trackId\|ISS-xxx]` (no flags) | **Verify** | Run unit + UI tests, write result to metadata |
| `--mark-done [trackId\|ISS-xxx]` | **Mark Done** | Skip verification, mark as done (manual) |
| `--reopen [trackId\|ISS-xxx]` | **Reopen** | Clear verification, return to implemented |
| (none) | **Interactive** | Show implemented tracks, let user choose |

---

## Track Resolution

### If argument matches `ISS-\d+`:

1. Read `issues/{argument}.json`
2. Extract `trackId` field
3. If no `trackId`: Error — "Issue {id} has no associated track"
4. Use the resolved `trackId` for all subsequent operations

### If argument is a track ID:

1. Validate `conductor/tracks/{argument}/metadata.json` exists
2. If not found: Search for partial matches, suggest corrections

### If no argument:

1. Read `conductor/tracks.md`
2. Scan for completed tracks (status `[x]`) that have NOT been verified yet
3. Also scan for tracks with `[~]` status (reopened)
4. Display selection menu:

   ```
   Select a track to verify:

   Implemented (awaiting verification):
   1. [x] feature-abc_20260323 - Feature ABC (no verification)
   2. [~] bugfix-xyz_20260322 - Bugfix XYZ (verification cleared)

   Enter number or track ID:
   ```

---

## Mode: Verify (default)

### Step 1: Pre-flight Validation

1. Read `conductor/tracks/{trackId}/metadata.json`
2. Check `status` is `complete` or `completed`
   - If not: Error — "Track must be completed before verification. Current status: {status}"
3. Check `verification.status` — if already `passed`:
   - Ask: "This track already passed verification. Re-verify? (y/n)"

### Step 2: Find Associated Issue

1. Scan `issues/ISS-*.json` files for one with `trackId` matching current track
2. Store the issue ID for later status display (informational only — status is derived)

### Step 3: Run Unit Tests

1. Display: `🧪 Running unit tests...`
2. Execute:
   ```bash
   cd dashboard && npm test -- --reporter=verbose
   ```
3. Capture exit code and output
4. Display result:
   - ✅ `Unit tests passed (XX tests, XX suites)`
   - ❌ `Unit tests FAILED` + show failure output

### Step 4: Run UI Tests (only if unit tests pass)

1. If unit tests failed: Skip with message `⏭️ Skipping UI tests (unit tests failed)`

2. Check if frontend is reachable:
   ```bash
   curl -s http://localhost:5173 -o /dev/null -w "%{http_code}"
   ```
   - If not reachable: Display warning — `⚠️ Frontend not running at localhost:5173. UI tests skipped.`
   - Set uiTest as `{ success: false, output: "Frontend not reachable" }`

3. Read `conductor/tracks/{trackId}/plan.md`
4. Extract `## Verification Plan` section
5. If Verification Plan exists:
   - Follow `conductor/workflow.md` Step 2 procedure:
     - Generate JWT for testing
     - Execute each test from the Verification Plan using Playwright
     - Take screenshots at key points
     - Report pass/fail per acceptance criterion
   - **⚠️ Respect safety red lines** from CLAUDE.md — never click dangerous buttons
6. If no Verification Plan:
   - Check if `scripts/browser-test.mjs` exists → run it
   - Otherwise: `uiTest = { success: true, output: "No Verification Plan, UI tests skipped" }`

### Step 5: Write Verification Result

Read current `conductor/tracks/{trackId}/metadata.json` and update:

**If tests passed (unit ✅ AND ui ✅):**

```json
{
  "verification": {
    "status": "passed",
    "method": "auto",
    "result": {
      "unitTest": { "success": true, "output": "..." },
      "uiTest": { "success": true, "output": "..." },
      "verifiedAt": "ISO_TIMESTAMP"
    }
  }
}
```

Update `conductor/tracks.md`: keep status as `[x]`

**If tests failed:**

```json
{
  "verification": {
    "status": "failed",
    "method": "auto",
    "result": {
      "unitTest": { "success": true/false, "output": "..." },
      "uiTest": { "success": true/false, "output": "..." },
      "verifiedAt": "ISO_TIMESTAMP"
    }
  }
}
```

Update `conductor/tracks.md`: change status to `[~]` (needs attention)

### Step 6: Display Summary

```
═══════════════════════════════════════
  Verification Result: {trackId}
═══════════════════════════════════════

  Unit Tests:  ✅ Passed / ❌ Failed
  UI Tests:    ✅ Passed / ❌ Failed / ⏭️ Skipped
  ─────────────────────────────────
  Overall:     ✅ PASSED → Issue derives to "done"
               ❌ FAILED → Issue stays "implemented"

  Issue: ISS-XXX ({issue title})
  Track: {trackId}
═══════════════════════════════════════
```

---

## Mode: Mark Done (`--mark-done`)

### Step 1: Pre-flight Validation

1. Read `conductor/tracks/{trackId}/metadata.json`
2. Check `status` is `complete` or `completed`
   - If not: Error — "Track must be completed before marking done"

### Step 2: Write Verification as Skipped

Update `conductor/tracks/{trackId}/metadata.json`:

```json
{
  "verification": {
    "status": "skipped",
    "method": "manual"
  }
}
```

### Step 3: Update tracks.md

Change track status to `[x]` in `conductor/tracks.md`

### Step 4: Display Confirmation

```
✅ Track {trackId} marked as done (verification skipped)

  Issue: ISS-XXX → status derives to "done"
  Method: Manual (no automated tests)
```

---

## Mode: Reopen (`--reopen`)

### Step 1: Pre-flight Validation

1. Read `conductor/tracks/{trackId}/metadata.json`
2. Check `status` is `complete` or `completed`
   - If not: Error — "Only completed tracks can be reopened"
3. Check that verification exists
   - If no verification field: Warning — "Track has no verification to clear"

### Step 2: Clear Verification

Update `conductor/tracks/{trackId}/metadata.json`:
- **Remove** the `verification` field entirely

### Step 3: Update tracks.md

Change track status to `[~]` in `conductor/tracks.md`

### Step 4: Display Confirmation

```
🔄 Track {trackId} reopened (verification cleared)

  Issue: ISS-XXX → status derives to "implemented"
  tracks.md: [~] (needs re-verification)

  Next steps:
  - /conductor:verify {trackId}     — run tests again
  - /conductor:verify --mark-done {trackId}  — skip tests, mark done
```

---

## State Machine Reference

This command operates on the verification lifecycle within a completed track:

```
Track completed (status: complete)
        │
        ├── /conductor:verify ──────────┐
        │                               │
        │                    ┌──── tests pass ────→ verification.status = "passed"
        │                    │                      issue derives → "done"
        │                    │
        │                    └──── tests fail ────→ verification.status = "failed"
        │                                           issue derives → "implemented"
        │
        ├── /conductor:verify --mark-done ────────→ verification.status = "skipped"
        │                                           issue derives → "done"
        │
        └── /conductor:verify --reopen ───────────→ verification = (cleared)
                                                    issue derives → "implemented"
```

**Key rule**: Issue status is ALWAYS derived from track metadata via `deriveIssueStatus()` in `conductor-reader.ts`. This command never writes issue status directly — it only writes `verification` to track metadata.

---

## Error Handling

- Track not found: Suggest available tracks
- Issue not found (ISS-xxx): Report error with file path
- Unit test command fails to execute: Report npm error, skip UI tests
- Playwright not available: Skip UI tests with warning
- metadata.json write fails: Report error, do not update tracks.md
