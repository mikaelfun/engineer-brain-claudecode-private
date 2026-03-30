# Implementation Plan: SCAN Multi-type Expansion

**Track ID:** scan-expansion_20260329
**Status:** [ ] In Progress

## Phase 1: Create Scanner Scripts (4 new executors)

- [x] Task 1.1: Create `design-fidelity-scanner.sh` — compare track spec AC with implementation code
- [x] Task 1.2: Create `ux-reviewer.sh` — static code analysis for UX anti-patterns
- [x] Task 1.3: Create `performance-scanner.sh` — API timing checks vs baselines.yaml
- [x] Task 1.4: Create `architecture-scanner.sh` — CLAUDE.md compliance + code anti-patterns

## Phase 2: Integrate into SCAN + GENERATE phases

- [x] Task 2.1: Update `phases/SCAN.md` — add Step 0.6 for additional scanner dispatch
- [x] Task 2.2: Update `phases/GENERATE.md` — handle new gap types in test generation
- [x] Task 2.3: Update `baselines.yaml` — add API response time baselines for performance scanner

## Phase 3: Test & Verify

- [x] Task 3.1: Run each scanner individually and verify GAP output format
- [x] Task 3.2: Verify SCAN phase integration (scanner dispatch based on scan-strategies.yaml)

## Post-Implementation Checklist
- [x] All 4 scanner scripts created and functional
- [x] SCAN.md updated with Step 6.5
- [x] GENERATE.md handles new gap types
- [x] baselines.yaml has API response time entries
- [x] Track metadata.json updated
- [x] tracks.md status updated
- [x] Bonus: Fixed common.sh read_json_path POSIX path bug on Windows
