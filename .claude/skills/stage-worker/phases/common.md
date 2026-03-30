## Common Rules (read every invocation)

Shared rules for all stage-worker stages. Read this BEFORE reading any stage file.

### 🔴 Safety (every invocation)
Read `tests/safety.yaml`. Check before any operation:
- **SAFE** → auto-execute
- **BLOCKED** → skip and log reason (never execute)
- Uncertain → mark warning, skip

### 🔴 State Writer Rule

**ALL state writes MUST use `state-writer.sh --merge`** (supports `--target pipeline|queues|stats`). Never use Write tool, heredoc, `echo >`, or any direct write.

Reason: Non-atomic writes cause truncated JSON / trailing commas / corruption.

```bash
# ⭐ Only pass fields you want to change — rest is preserved
echo '{"currentStage":"TEST","stats":{"passed":10}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

**`--merge` behavior**:
- Unmentioned fields → **preserved** (won't lose maxCycles etc.)
- `stats` → **deep merge** (only changes specified sub-fields)
- `stages` → **per-stage deep merge**
- `stageHistory` → empty `[]` = reset; non-empty = **append** (concat)
- Arrays (`testQueue`, `fixQueue` etc.) → **full replace** (read-then-write)

**🔴 Forbidden**: full-replace mode (without `--merge`) — overwrites concurrent changes.

**Environment**: Use `process.env.STATE_PATH` in node, not hardcoded paths.

### 🔴 stages Update Pattern (MANDATORY — every stage)

**Step A-pre: BEFORE any stage logic** — mark pipeline as running (authoritative status):
```bash
echo '{"pipelineStatus":"running"}' | bash tests/executors/state-writer.sh --target pipeline --merge
```
⚠️ This tells all consumers (dashboard, WebUI, health-check) that stage-worker is actively executing. Only write this once at the start of the first stage in a session; skip if already running.

**Step A: Capture wall-clock start + mark stage running:**
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"'$STAGE'":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```
⚠️ `START_TS` must be set via `date +%s%3N` (milliseconds). Do NOT use hardcoded values.

**Step B: AFTER stage completes** — calculate real duration + mark done:
```bash
DURATION_MS=$(( $(date +%s%3N) - START_TS ))
echo '{"stages":{"'$STAGE'":{"status":"done","summary":"...","duration_ms":'$DURATION_MS',"completedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' \
  | bash tests/executors/state-writer.sh --target pipeline --merge
```
⚠️ `duration_ms` MUST be computed from `START_TS`. Never estimate or hardcode (e.g. 120000, 30000).

**Step C: On cycle transition** (VERIFY/TEST → SCAN, cycle++) — reset ALL stages:
```bash
echo '{"stages":{"SCAN":{"status":"pending"},"GENERATE":{"status":"pending"},"TEST":{"status":"pending"},"FIX":{"status":"pending"},"VERIFY":{"status":"pending"}}}' \
  | bash tests/executors/state-writer.sh --target pipeline --merge
```
⚠️ This clears stale duration/status from previous cycle. Must happen BEFORE new SCAN starts.

### Recipe 查询通用原则

- Recipe 查询是 **advisory**，不是 mandatory — 找不到匹配时静默 fallback，不报错
- `tests/recipes/fix/_index.md` 不存在 → 跳过 recipe 查询，等价于无匹配
- Recipe 文件不存在（`_index` 引用但文件缺失）→ 跳过该条目，尝试下一个匹配
- 一个 failure 可匹配多个 recipe → 按 `_index.md` 优先级使用第一个可用 recipe
- Recipe 步骤是参考，不是死板流程 — LLM 应根据实际错误细节调整执行
- Recipe 修复后务必调用 `fix-recorder.sh` 并传入 `recipe_used` 参数

### Step 0.5: Process Directives (every stage)

Before executing stage logic, check `tests/directives.json`:

1. If file doesn't exist → skip
2. If `paused=true` and no pending `resume` directive → output "⏸️ Loop paused" → **return immediately**
3. Process pending directives (by `id` alphabetical order):

| type | action |
|------|--------|
| `pause` | set `paused=true`, mark processed, **return immediately** |
| `resume` | set `paused=false`, mark processed, continue |
| `skip_test` | remove from testQueue, stats.skipped++, mark processed |
| `add_requirement` | append to `gaps` array, mark processed |
| `add_tests` | add to testQueue (dedup), set currentStage=TEST if needed, mark processed |
| `prioritize` | move testId to testQueue head, mark processed |
| `force_stage` | set currentStage (SCAN/TEST/FIX/VERIFY only), mark processed |
| `adjust_config` | set state[key]=value (maxCycles/cycle only), mark processed |
| `add_learning` | run learnings-writer.sh, mark processed |
| `note` | acknowledge, mark processed |
| unknown | mark `status=rejected` |

4. Update each directive: `status=processed/rejected`, `processedAt`, `processedResult`
5. Write back directives.json (atomic) and state via state-writer.sh
