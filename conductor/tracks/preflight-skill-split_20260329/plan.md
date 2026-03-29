# Implementation Plan: Pre-flight Script + SKILL.md Phase Split

**Track ID:** preflight-skill-split_20260329
**Status:** [x] Complete

## Phase 1: Pre-flight Script (CREATE `tests/executors/pre-flight.sh`)

- [x] Task 1.1: Create `tests/executors/pre-flight.sh` that combines health-check, gate logic, trend data, and queue heads into a single compact JSON output. Reuses `common.sh` for paths. Calls `health-check.sh` internally for health determination, then adds gate decision (pass/paused/complete/stuck/error), trend data from round summary files, queue head snapshots (testQueueHead, fixQueueHead), and auto-repair logic (calls `state-repair.sh` if state.json corrupt).
- [x] Task 1.2: Test pre-flight.sh — run it manually and verify JSON output matches spec schema. Test edge cases: paused directives → gate=paused, phase=COMPLETE → gate=complete, corrupt state.json → auto-repair + gate=error.

**Phase 1 Verification:** `bash tests/executors/pre-flight.sh` outputs valid JSON with all spec fields.

## Phase 2: SKILL.md Phase Split (7 new files + 1 rename + 1 rewrite)

- [x] Task 2.1: Rename current `SKILL.md` → `SKILL-reference.md` (preserve original for human reference).
- [x] Task 2.2: Create `phases/common.md` (~30-40 lines) — extract state-writer rules (🔴 `--merge` only), safety gate check, Step 0.5 directives processing, and roundJourney update pattern. This is read at start of every invocation.
- [x] Task 2.3: Create `phases/SCAN.md` (~120 lines) — extract Step 0 (load state + env + learnings + maxRounds check + interrupt recovery) + all SCAN sub-steps (0→0.1→0.5→1-7 + decision logic). Self-contained, no cross-references.
- [x] Task 2.4: Create `phases/GENERATE.md` (~40 lines) — extract GENERATE phase: gap-to-test-definition generation, category classification, safety check, YAML writing, queue update.
- [x] Task 2.5: Create `phases/TEST.md` (~60 lines) — extract TEST phase: batch loop, per-category agent spawn prompts, result recording, queue management.
- [x] Task 2.6: Create `phases/FIX.md` (~80 lines) — extract FIX phase: priority sorting, framework vs test fix paths, fix-analyzer, opus agent spawn, fix-recorder, retry/skip logic.
- [x] Task 2.7: Create `phases/VERIFY.md` (~60 lines) — extract VERIFY phase: verify-rerun loop, self-heal check (pattern-detector), regression queue handling, baseline updates.
- [x] Task 2.8: Create `phases/state-update.md` (~80 lines) — extract Step 2 (roundJourney done + phaseHistory + round increment + stats-reporter) + Step 2.2 (Phase Retrospective) + Step 2.1 (continuation logic).
- [x] Task 2.9: Create new overview `SKILL.md` (~100 lines) — trigger info, safety red lines, state-writer rule, phase file index table, state machine diagram, output files table, key notes. Points to phase files.

**Phase 2 Verification:** Each phase file is self-contained. All content from SKILL-reference.md is accounted for in phase files + overview. No orphaned instructions.

## Phase 3: Runner Integration

- [x] Task 3.1: Update `.claude/agents/test-supervisor-runner.md` — Step 1 changes from running `health-check.sh` to running `pre-flight.sh`. Step 2 gate logic uses pre-flight JSON fields directly (no more reading directives.json/state.json separately). Step 3 spawn prompt passes pre-flight JSON as structured briefing and instructs test-loop to read phase-specific files instead of full SKILL.md.
- [x] Task 3.2: Verify the updated runner flow end-to-end by dry-reading the agent definition — confirm the spawn prompt correctly references `phases/common.md`, `phases/{PHASE}.md`, and `phases/state-update.md` in sequence.

**Phase 3 Verification:** Runner reads ~3 files (pre-flight JSON + agent definition) instead of 5+. Test-loop reads ~3 phase files (~250 lines total) instead of 1 monolith (800 lines).

## Phase 4: Post-Implementation Checklist

- [x] All phase files created and content-complete (no lost instructions)
- [x] `SKILL-reference.md` preserved (original 800-line file renamed)
- [x] `pre-flight.sh` executable and outputs valid JSON
- [x] Runner agent definition updated with new spawn prompt
- [x] No behavioral changes to test execution logic
- [x] Track metadata.json updated
- [x] tracks.md status updated
