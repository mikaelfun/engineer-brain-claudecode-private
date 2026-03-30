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
| `[trackId\|ISS-xxx]` (no flags) | **Verify** | Reasoning-driven verification via SKILL.md |
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

### Step 3: Execute Reasoning-Driven Verification (SKILL.md)

**Delegate to `.claude/skills/conductor/verify/SKILL.md`.**

Read the SKILL.md file and execute its complete 5-step verification flow:

1. **Step 1 — Regression Guard**: Run `cd dashboard && npm test` as a safety net
2. **Step 2 — 推理验证方案**: Read spec.md → extract AC → classify type → match recipe → build plan → ask user to confirm
3. **Step 3 — 执行验证**: For each AC, follow matched recipe or reason from scratch → record PASS/FAIL/SKIP + evidence
4. **Step 4 — 汇总报告**: Display result summary → write `metadata.json` with new criteria-based format:
   ```json
   {
     "verification": {
       "status": "passed" | "failed" | "skipped",
       "timestamp": "ISO_TIMESTAMP",
       "regression": "pass" | "fail",
       "criteria": [
         { "id": "AC1", "description": "...", "result": "pass", "evidence": "...", "recipe": "..." }
       ]
     }
   }
   ```
5. **Step 5 — 反思提取**: Only if triggered (retries ≥2, pitfall, long script, recipe outdated) → create/update recipes

**After SKILL.md completes:**
- Update `conductor/tracks.md` status based on result:
  - Passed/skipped → keep `[x]`
  - Failed → change to `[~]`
- Display final summary with issue derivation status

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
- Unit test command fails to execute: Report npm error, ask user whether to continue
- spec.md has no acceptance criteria: Warn and offer `--mark-done`
- Recipe file missing/corrupt: Warn and fallback to from-scratch reasoning
- Playwright browser launch fails: Check msedge availability, suggest `mcp__playwright__browser_install`
- metadata.json write fails: Retry once, then display manual fix instructions
