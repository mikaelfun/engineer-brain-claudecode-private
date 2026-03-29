# Specification: Pre-flight Script + SKILL.md Phase Split

**Track ID:** preflight-skill-split_20260329
**Issue:** ISS-144
**Type:** Enhancement
**Created:** 2026-03-29
**Status:** Draft

## Summary

Two complementary optimizations to reduce test-loop agent startup overhead:
1. **Pre-flight script**: Merge health-check + gate + trend summary into one bash call, replacing runner's 5+ separate file reads.
2. **SKILL.md phase split**: Break the 800-line monolith into phase-specific instruction files so test-loop only reads ~150 lines per invocation.

## Context

### Current startup waste (observed from actual runner trace)

Runner agent (`test-supervisor-runner`) uses **14+ tool calls** before any real work:
- `health-check.sh` ×1 (necessary)
- `state.json` ×3 (redundant reads)
- `SKILL.md` ×2 (head, then full cat — 800 lines)
- `test-loop.md` ×1 (agent definition)
- `directives.json` ×1 (necessary)
- `safety.yaml` + `env.yaml` ×1 (premature — only needed by test-loop)
- tool-results cache ×1

Then test-loop agent repeats:
- `SKILL.md` full read again (800 lines)
- `state.json` again
- `safety.yaml` again
- `env.yaml` again
- `learnings.yaml` (necessary)

**Total**: ~20 tool calls, ~2400 lines read, before first test executes.

### CLAUDE.md constraint

> 不要在 spawn prompt 中注入大段 SKILL 内容。实测注入 vs 让 agent 自己读 SKILL.md，注入反而慢 15s。

This applies to injecting the full 800-line SKILL.md. **Injecting ~200 bytes of structured state data is fine** — it's structured, small, and eliminates redundant reads.

## Motivation

- Reduce runner startup from ~14 tool calls to ~3
- Reduce test-loop context load from 800 lines to ~150 lines per phase
- Faster turnaround per `/loop` tick → more work done per round

## Success Criteria

- [ ] `bash tests/executors/pre-flight.sh` outputs compact JSON with gate result + state summary + trends
- [ ] Runner reads pre-flight JSON once instead of reading 5+ files separately
- [ ] Phase files exist: `phases/{common,SCAN,GENERATE,TEST,FIX,VERIFY,state-update}.md`
- [ ] Each phase file is self-contained (includes relevant rules, no cross-references to other phase files)
- [ ] `common.md` contains state-writer rules, safety rules, roundJourney update rules (~30 lines)
- [ ] `state-update.md` contains Step 2 + Step 2.1 + Step 2.2 logic (~80 lines)
- [ ] Original SKILL.md preserved as `SKILL-reference.md` (not deleted, for human reference)
- [ ] New SKILL.md is a ~100-line overview pointing to phase files
- [ ] Runner spawn prompt includes pre-flight JSON as structured briefing
- [ ] Test-loop spawn prompt specifies only current phase file to read
- [ ] All existing tests still pass after refactoring (no behavioral change)

## Technical Design

### New file: `tests/executors/pre-flight.sh`

Combines health-check, gate logic, and trend data into a single JSON output.

**Output schema**:
```json
{
  "gate": "pass|paused|complete|stuck|error",
  "gateReason": "string (only if gate != pass)",
  "phase": "TEST",
  "round": 26,
  "maxRounds": 80,
  "health": "healthy|stale|stuck|warning",
  "staleSince": "ISO timestamp or null",
  "queues": {
    "test": 4,
    "fix": 1,
    "verify": 0,
    "regression": 0
  },
  "testQueueHead": ["wf-iss142-retro-skill", "wf-iss142-retro-retrocontext"],
  "fixQueueHead": [{"testId": "retro-fix-26-SCAN", "category": "framework", "priority": 1}],
  "paused": false,
  "pendingDirectives": 0,
  "coverage": "95.2%",
  "trends": {
    "passedDelta": [148, 156, 162],
    "failedDelta": [34, 34, 34],
    "fixedDelta": [18, 18, 18],
    "coverageTrend": "flat"
  },
  "autoRepaired": false
}
```

**Gate logic** (same as current runner Step 2, consolidated):
- health-check error → `gate: "error"`
- directives paused && no resume pending → `gate: "paused"`
- phase=COMPLETE → `gate: "complete"`
- health=stuck after cleanup attempt → `gate: "stuck"`
- Otherwise → `gate: "pass"`

**Auto-repair**: If state.json is corrupt, run `state-repair.sh` inline, set `autoRepaired: true`.

### SKILL.md split structure

```
.claude/skills/test-loop/
├── SKILL.md                  # Overview (~100 lines): trigger, safety red lines, state-writer rules, state machine diagram, file table
├── SKILL-reference.md        # Full original (renamed, human reference only)
└── phases/
    ├── common.md             # ~30 lines: state-writer --merge rules, safety gate check, roundJourney update pattern
    ├── SCAN.md               # ~120 lines: Step 0 + 0.1 + 0.5 + 1-7 (all SCAN sub-steps)
    ├── GENERATE.md           # ~40 lines: gap-to-test-definition generation
    ├── TEST.md               # ~60 lines: batch test execution, per-test agent spawn, result recording
    ├── FIX.md                # ~80 lines: fix-analyzer, framework vs test fix paths, retry logic
    ├── VERIFY.md             # ~60 lines: verify-rerun, self-heal check, regression queue handling
    └── state-update.md       # ~80 lines: Step 2 (roundJourney done), Step 2.1 (continuation), Step 2.2 (Phase Retrospective)
```

**Content migration rules**:
- Each phase file starts with `## {PHASE} Phase` and a one-line goal
- Each file includes only the instructions for that specific phase
- `common.md` is read at start of every invocation (shared rules)
- `state-update.md` is read after every phase completes (shared post-phase logic)
- Phase files do NOT reference each other (self-contained)
- Step 0 (load state) is in SCAN.md since SCAN is always the first phase of a round; other phases skip it
- Step 0.5 (directives) is in common.md since it runs before every phase

### Modified: `test-supervisor-runner.md`

Runner's Step 3 changes from:
```
Agent(
  subagent_type: "test-loop",
  prompt: "读取 .claude/skills/test-loop/SKILL.md 获取完整执行步骤"
)
```

To:
```
Agent(
  subagent_type: "test-loop",
  prompt: |
    == Pre-flight Briefing ==
    {pre-flight.sh JSON output}

    Gate: PASSED. Phase: {phase}, Round: {round}/{maxRounds}.

    执行步骤：
    1. 读取 .claude/skills/test-loop/phases/common.md（通用规则）
    2. 读取 .claude/skills/test-loop/phases/{PHASE}.md（当前阶段指令）
    3. 执行当前阶段
    4. 读取 .claude/skills/test-loop/phases/state-update.md（状态更新 + 续跑判断）
    5. 如果续跑：回到步骤 2 读下一个 phase 文件
    6. 返回简要摘要
)
```

**Key**: Pre-flight JSON is ~200 bytes of structured data, NOT "大段 SKILL 内容". This eliminates test-loop needing to read state.json at startup.

### New overview SKILL.md (~100 lines)

```markdown
# Test Loop — Overview

## Trigger
/test-supervisor run  (recommended)
/test-loop            (direct)

## 🔴 Safety (read every invocation)
Read `tests/safety.yaml`. BLOCKED = never execute. SAFE = auto.

## 🔴 State Writer Rule
ALL state.json writes via `state-writer.sh --merge`. Never direct write.

## Phase Files
Read phases/common.md first, then phases/{PHASE}.md for current phase.
After each phase: read phases/state-update.md.

## State Machine
SCAN → GENERATE → TEST → FIX → VERIFY → round++ → SCAN

## Phase File Index
| Phase | File | Lines | Purpose |
|-------|------|-------|---------|
| (shared) | phases/common.md | ~30 | Writer rules, safety, directives |
| SCAN | phases/SCAN.md | ~120 | Discover gaps |
| GENERATE | phases/GENERATE.md | ~40 | Create test definitions |
| TEST | phases/TEST.md | ~60 | Execute tests |
| FIX | phases/FIX.md | ~80 | Fix failures |
| VERIFY | phases/VERIFY.md | ~60 | Verify fixes |
| (shared) | phases/state-update.md | ~80 | Update state, continuation |
```

## Dependencies

- `tests/executors/common.sh` (for TESTS_ROOT, shared functions)
- `tests/executors/health-check.sh` (pre-flight.sh reuses health determination logic)
- Round summary files in `tests/results/round-*-summary.json` (for trend data)

## Out of Scope

- No changes to test execution logic (only how instructions are loaded)
- No changes to state.json schema
- No changes to any executor scripts (except creating pre-flight.sh)
- Runner Strategic Review / Meta-analysis (that's Track 3 / ISS-145)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `tests/executors/pre-flight.sh` | CREATE | Combined health + gate + trend JSON |
| `.claude/skills/test-loop/SKILL.md` | MODIFY | Reduce to ~100-line overview |
| `.claude/skills/test-loop/SKILL-reference.md` | CREATE | Rename original full SKILL.md |
| `.claude/skills/test-loop/phases/common.md` | CREATE | Shared rules (~30 lines) |
| `.claude/skills/test-loop/phases/SCAN.md` | CREATE | SCAN phase instructions |
| `.claude/skills/test-loop/phases/GENERATE.md` | CREATE | GENERATE phase instructions |
| `.claude/skills/test-loop/phases/TEST.md` | CREATE | TEST phase instructions |
| `.claude/skills/test-loop/phases/FIX.md` | CREATE | FIX phase instructions |
| `.claude/skills/test-loop/phases/VERIFY.md` | CREATE | VERIFY phase instructions |
| `.claude/skills/test-loop/phases/state-update.md` | CREATE | Post-phase state update + continuation |
| `.claude/agents/test-supervisor-runner.md` | MODIFY | Use pre-flight.sh + phase-specific spawn prompt |

## Testing

- Run `bash tests/executors/pre-flight.sh` → verify JSON output matches schema
- Run pre-flight with corrupt state.json → verify auto-repair and gate=error
- Run pre-flight with paused directives → verify gate=paused
- Compare each phase file against corresponding SKILL.md section → verify no content lost
- Run `/test-supervisor run` → verify test-loop reads only current phase file (not full SKILL.md)
- Run full round (SCAN→GENERATE→TEST) → verify no behavioral regression
- Measure tool call count before/after → expect reduction from ~20 to ~8

## Risks

- **Content drift**: Phase files may drift from SKILL-reference.md over time. Mitigate: SKILL-reference.md is for human reference, phase files are source of truth.
- **Cross-phase dependencies**: Some logic spans phases (e.g., Step 0 loads state for all phases). Mitigate: common.md handles shared concerns.
- **Continuation logic**: state-update.md's Step 2.1 decides next phase. Test that reading a different phase file mid-session works correctly.
