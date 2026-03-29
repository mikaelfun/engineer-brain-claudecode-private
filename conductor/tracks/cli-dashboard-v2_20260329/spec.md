# Specification: CLI Dashboard Script-Rendered Output

**Track ID:** cli-dashboard-v2_20260329
**Issue:** ISS-143
**Type:** Enhancement
**Created:** 2026-03-29
**Status:** Draft

## Summary

Replace LLM-driven template filling for `/test-supervisor db` with a deterministic bash script (`dashboard-renderer.sh`) that reads all data sources and outputs formatted text directly. Simplify `modes/dashboard.md` from 140 lines to ~3 lines.

## Context

Current `/test-supervisor db` flow:
1. LLM reads `modes/dashboard.md` (140 lines of format specification)
2. Runs `health-check.sh` → gets JSON
3. LLM parses JSON and fills template sections manually

Problems:
- **Inconsistent formatting**: Every invocation produces slightly different layout
- **Wasted context**: 140-line template spec + JSON parsing consumes ~4KB per call
- **Unreliable**: LLM occasionally omits sections or miscalculates values
- **No trend data**: health-check.sh doesn't include cross-round trends

## Motivation

Dashboard is the most frequently used supervisor command. Making it deterministic (script-generated) and information-dense (attention-first, trends included) directly improves the operational experience.

## Success Criteria

- [ ] `bash tests/executors/dashboard-renderer.sh` outputs complete formatted dashboard to stdout
- [ ] Output fits in ≤25 terminal lines (one screen, no scroll)
- [ ] Attention section appears before stats (priority items first)
- [ ] Trend indicators (▲ ▼ ━) for passed/failed/fixed across last 3 rounds
- [ ] Queue heads shown (first 2 items per queue, not full list)
- [ ] Probe status and self-heal summary included
- [ ] `modes/dashboard.md` reduced to ≤10 lines (run script → display output → optional one-line comment)
- [ ] Output is identical for same state.json input (deterministic, no LLM variance)

## Technical Design

### New file: `tests/executors/dashboard-renderer.sh`

**Inputs** (all read from files):
- `tests/state.json` — phase, round, queues, stats, roundJourney, skipRegistry, observabilityStatus
- `tests/results/round-{N}-summary.json` (last 3 rounds) — trend data
- `tests/discoveries.json` — discovery stats
- `tests/evolution.json` — latest evolution entry
- `tests/directives.json` — paused state, pending count

**Output format** (plain text, fixed layout):

```
┌─────────────────────────────────────────────────────────┐
│  🧪 Test Supervisor   R{r}/{max} │ {phase} │ {health}  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  {SCAN}━━{s}━━▶{GEN}━━{s}━━▶{TEST}━━{s}━━▶{FIX}━━{s}━━▶{VER}│
│  {dur}      {dur}       {dur}       {dur}       {dur}   │
│                                                         │
│  ⚠️ Attention ─────────────────────────────────────────│
│  {priority items: 🔴 critical / 🟡 warning, max 3}     │
│  {if none: "✅ No issues requiring attention"}          │
│                                                         │
│  📊 {passed}✅ {failed}❌ {fixed}🔧 {skipped}⏭️ │ {cov}│
│                                                         │
│  📈 Trend (R{n-2}→R{n-1}→R{n})                        │
│  passed: {v}→{v}→{v} {arrow}  fixed: {v}→{v}→{v} {a}  │
│                                                         │
│  📋 Queues                                              │
│  T:{n} {head1}, {head2}  F:{n} {head}  V:{n}  R:{n}    │
│                                                         │
│  🔭 Probes: {pass}✅ {fail}❌ ({stale} stale)          │
│  📝 Directives: {n} pending │ {paused?}                 │
│  🧬 Evolution: {count} iterations │ last: {latest}      │
└─────────────────────────────────────────────────────────┘
```

**Attention rules** (computed by script, priority order):
1. 🔴 fixQueue items with `category: "framework"` and `priority: 1`
2. 🔴 health = `stuck` or `error`
3. 🟡 health = `stale` (with duration)
4. 🟡 regressions > 50% of total discoveries
5. 🟡 coverage flat for 3+ rounds
6. 🟡 stale probes (round delta > 10)
7. 🟡 fix success rate declining (last 3 rounds)

**Trend calculation**:
- Read `tests/results/round-{round-2}-summary.json`, `round-{round-1}-summary.json`, current state stats
- Compare passed/failed/fixed values
- Arrow: value increasing → `▲`, decreasing → `▼`, same → `━`

**Implementation approach**:
- Pure bash + node one-liners for JSON parsing (no Python dependency)
- Use `$TESTS_ROOT` from common.sh for paths
- All string formatting in bash (printf for alignment)
- Exit code 0 always (dashboard should never fail)

### Modified file: `.claude/skills/test-supervisor/modes/dashboard.md`

Replace 140 lines with:

```markdown
## Mode: dashboard
1. Run: `bash tests/executors/dashboard-renderer.sh`
2. Display the output verbatim (do not reformat)
3. If output contains "⚠️ Attention" lines, add one brief suggestion after the output
```

## Dependencies

- `tests/executors/common.sh` (for TESTS_ROOT, log functions)
- `tests/executors/health-check.sh` (reuse health determination logic, or inline)
- Node.js available at `$DASHBOARD_DIR/node_modules` (for JSON parsing)

## Out of Scope

- No changes to health-check.sh output format (dashboard-renderer.sh reads state.json directly)
- No changes to state.json schema
- No WebUI changes (that's Track 5 / ISS-147)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `tests/executors/dashboard-renderer.sh` | CREATE | Main dashboard rendering script |
| `.claude/skills/test-supervisor/modes/dashboard.md` | MODIFY | Simplify from 140 lines to ~5 lines |

## Testing

- Run `bash tests/executors/dashboard-renderer.sh` directly → verify output format
- Run `/test-supervisor db` → verify LLM displays script output verbatim
- Run 3 times → verify output is identical (deterministic)
- Test with empty state (no round summaries) → verify graceful fallback
- Test with all-healthy state → verify "No issues" in Attention section
