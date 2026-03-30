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

### 🔴 roundJourney Update Pattern (MANDATORY — every phase)

**Step A: BEFORE any phase logic** — capture wall-clock start + mark running:
```bash
START_TS=$(date +%s%3N)
echo '{"roundJourney":{"'$PHASE'":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --merge
```
⚠️ `START_TS` must be set via `date +%s%3N` (milliseconds). Do NOT use hardcoded values.

**Step B: AFTER phase completes** — calculate real duration + mark done:
```bash
DURATION_MS=$(( $(date +%s%3N) - START_TS ))
echo '{"roundJourney":{"'$PHASE'":{"status":"done","summary":"...","duration_ms":'$DURATION_MS',"completedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' \
  | bash tests/executors/state-writer.sh --merge
```
⚠️ `duration_ms` MUST be computed from `START_TS`. Never estimate or hardcode (e.g. 120000, 30000).

**Step C: On round transition** (VERIFY/TEST → SCAN, round++) — reset ALL phases:
```bash
echo '{"roundJourney":{"SCAN":{"status":"pending"},"GENERATE":{"status":"pending"},"TEST":{"status":"pending"},"FIX":{"status":"pending"},"VERIFY":{"status":"pending"}}}' \
  | bash tests/executors/state-writer.sh --merge
```
⚠️ This clears stale duration/status from previous round. Must happen BEFORE new SCAN starts.

### Recipe 查询通用原则

- Recipe 查询是 **advisory**，不是 mandatory — 找不到匹配时静默 fallback，不报错
- `tests/recipes/fix/_index.md` 不存在 → 跳过 recipe 查询，等价于无匹配
- Recipe 文件不存在（`_index` 引用但文件缺失）→ 跳过该条目，尝试下一个匹配
- 一个 failure 可匹配多个 recipe → 按 `_index.md` 优先级使用第一个可用 recipe
- Recipe 步骤是参考，不是死板流程 — LLM 应根据实际错误细节调整执行
- Recipe 修复后务必调用 `fix-recorder.sh` 并传入 `recipe_used` 参数

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
