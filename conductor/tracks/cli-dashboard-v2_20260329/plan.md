# Implementation Plan: CLI Dashboard Script-Rendered Output

**Track ID:** cli-dashboard-v2_20260329
**Status:** [x] Complete

## Phase 1: Core Implementation

- [x] Task 1.1: Create `tests/executors/dashboard-renderer.sh` — deterministic bash script that reads state.json + round summaries + discoveries + evolution + directives and outputs a formatted one-screen dashboard to stdout
- [x] Task 1.2: Simplify `.claude/skills/test-supervisor/modes/dashboard.md` — replace 140-line template with 5-line "run script → display output" instruction

### Phase 1 Verification
- TypeScript compile: N/A (pure bash)
- Run `bash tests/executors/dashboard-renderer.sh` → verify output format, ≤25 lines, attention-first layout
- Run 3 times → verify identical output (deterministic)
- Test with missing files → verify graceful fallback

## Post-Implementation Checklist
- [ ] dashboard-renderer.sh outputs complete formatted dashboard
- [ ] Output fits in ≤25 terminal lines
- [ ] Attention section appears before stats
- [ ] Trend indicators work across last 3 rounds
- [ ] Queue heads shown (first 2 items per queue)
- [ ] Probe status and directive summary included
- [ ] modes/dashboard.md reduced to ≤10 lines
- [ ] Output is deterministic (identical for same input)
- [ ] Track metadata.json updated
- [ ] tracks.md status updated
