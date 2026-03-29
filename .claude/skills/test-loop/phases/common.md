## Common Rules (read every invocation)

Shared rules for all test-loop phases. Read this BEFORE reading any phase file.

### 🔴 Safety (every invocation)
Read `tests/safety.yaml`. Check before any operation:
- **SAFE** → auto-execute
- **BLOCKED** → skip and log reason (never execute)
- Uncertain → mark warning, skip

### 🔴 state.json Writer Rule

**ALL state.json writes MUST use `state-writer.sh --merge`**. Never use Write tool, heredoc, `echo >`, or any direct write.

Reason: Non-atomic writes cause truncated JSON / trailing commas / corruption.

```bash
# ⭐ Only pass fields you want to change — rest is preserved
echo '{"phase":"TEST","stats":{"passed":10}}' | bash tests/executors/state-writer.sh --merge
```

**`--merge` behavior**:
- Unmentioned fields → **preserved** (won't lose maxRounds etc.)
- `stats` → **deep merge** (only changes specified sub-fields)
- `roundJourney` → **per-phase deep merge**
- `phaseHistory` → empty `[]` = reset; non-empty = **append** (concat)
- Arrays (`testQueue`, `fixQueue` etc.) → **full replace** (read-then-write)

**🔴 Forbidden**: full-replace mode (without `--merge`) — overwrites concurrent changes.

**Environment**: Use `process.env.STATE_PATH` in node, not hardcoded paths.

### 🔴 roundJourney Update Pattern

**Before** executing any phase logic, mark as `running`:
```bash
echo '{"roundJourney":{"'$PHASE'":{"status":"running"}}}' | bash tests/executors/state-writer.sh --merge
```

**After** phase completes, mark as `done` with summary + duration:
```bash
DURATION_MS=$(( $(date +%s%3N) - START_TS ))
echo '{"roundJourney":{"'$PHASE'":{"status":"done","summary":"...","duration_ms":'$DURATION_MS'}}}' \
  | bash tests/executors/state-writer.sh --merge
```

### Step 0.5: Process Directives (every phase)

Before executing phase logic, check `tests/directives.json`:

1. If file doesn't exist → skip
2. If `paused=true` and no pending `resume` directive → output "⏸️ Loop paused" → **return immediately**
3. Process pending directives (by `id` alphabetical order):

| type | action |
|------|--------|
| `pause` | set `paused=true`, mark processed, **return immediately** |
| `resume` | set `paused=false`, mark processed, continue |
| `skip_test` | remove from testQueue, stats.skipped++, mark processed |
| `add_requirement` | append to `gaps` array, mark processed |
| `add_tests` | add to testQueue (dedup), set phase=TEST if needed, mark processed |
| `prioritize` | move testId to testQueue head, mark processed |
| `force_phase` | set phase (SCAN/TEST/FIX/VERIFY only), mark processed |
| `adjust_config` | set state[key]=value (maxRounds/round only), mark processed |
| `add_learning` | run learnings-writer.sh, mark processed |
| `note` | acknowledge, mark processed |
| unknown | mark `status=rejected` |

4. Update each directive: `status=processed/rejected`, `processedAt`, `processedResult`
5. Write back directives.json (atomic) and state.json (via state-writer.sh)
