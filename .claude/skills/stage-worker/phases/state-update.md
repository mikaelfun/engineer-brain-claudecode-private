## State Update + Continuation (read after every stage)

Post-stage logic: update state, circuit-breaker check, decide continuation.

### Step 2: Update State

After each stage completes:

1. Update state (currentStage, queues, stats) via state-writer.sh --merge
2. **🔴 Mark completed stage in stages** (and clear progress):
   ```bash
   DURATION_MS=$(( $(date +%s%3N) - START_TS ))
   echo '{"stages":{"'$STAGE'":{"status":"done","summary":"...","duration_ms":'$DURATION_MS'}},"currentTest":"","stageProgress":null}' \
     | bash tests/executors/state-writer.sh --target pipeline --merge
   ```
   Summary by stage (use actual queues.json data, not scanner raw output):
   - SCAN: `"{gaps_count} uncovered gaps, {stale_count} stale skipped, {fresh_count} fresh"` — gaps_count = queues.json gaps[].length (NOT scanner total)
   - GENERATE: `"{count} tests generated from {gaps_count} gaps"`
   - TEST: `"{passed} passed, {failed} failed"`
   - VALIDATE: `"{fix} fix, {stale} stale, {env} env_issue, {fw} framework, {review} reviewed"`
   - FIX: `"{fixed} fixed, {unfixable} unfixable"`
   - VERIFY: `"{verified} verified, {regressed} regressed, {fw_accepted} fw-auto-accepted"`

3. Append stageHistory (**must include `cycle` field**):
   ```bash
   echo '{"stageHistory":[{"stage":"TEST","action":"test_pass","testId":"xxx","cycle":5,"timestamp":"..."}]}' \
     | bash tests/executors/state-writer.sh --target stats --merge
   ```

4. **Cycle increment rule**: When full cycle ends (VERIFY/TEST → SCAN), cycle++
5. **On cycle switch**: Reset stageHistory + stages + cycleStats.
   **🔴 MUST null out all temporal fields** (startedAt, completedAt, duration_ms) — deep merge preserves old values otherwise:
   ```bash
   echo '{"stageHistory":[],"stages":{"SCAN":{"status":"pending","summary":null,"startedAt":null,"completedAt":null,"duration_ms":null},"GENERATE":{"status":"pending","summary":null,"startedAt":null,"completedAt":null,"duration_ms":null},"TEST":{"status":"pending","summary":null,"startedAt":null,"completedAt":null,"duration_ms":null},"VALIDATE":{"status":"pending","summary":null,"startedAt":null,"completedAt":null,"duration_ms":null},"FIX":{"status":"pending","summary":null,"startedAt":null,"completedAt":null,"duration_ms":null},"VERIFY":{"status":"pending","summary":null,"startedAt":null,"completedAt":null,"duration_ms":null}}}' \
     | bash tests/executors/state-writer.sh --target pipeline --merge
   echo '{"cycleStats":{"passed":0,"failed":0,"fixed":0,"skipped":0}}' \
     | bash tests/executors/state-writer.sh --target stats --merge
   ```
   Then: `bash tests/executors/stats-reporter.sh <cycle>`

6. If cycle >= maxCycles → set currentStage=COMPLETE

### Step 2.05: Queue Priority Sort（仅 SCAN 后）

如果刚完成的阶段是 `SCAN` 且 `testQueue` 非空：

```bash
bash tests/executors/queue-sorter.sh
```

确保高优先级（P0）的测试最先执行。排序基于 queue item 的 `impact` 字段。
无 `impact` 字段的 item 视为 P3。

### Step 2.2: Circuit Breaker (lightweight)

**Quick check only — full analysis done by supervisor meta-analysis.**

After state update, check for catastrophic failure patterns that require immediate exit:

1. **TEST stage**: Did ALL tests in this batch fail with the same root error message?
   - Same-cause rate > 90% AND batch size ≥ 3 → **earlyExit**
   - Mark in stages: `"earlyExit": true, "earlyExitReason": "same-cause catastrophic failure: {error}"`
   - **Mark pipeline idle**: `echo '{"pipelineStatus":"idle"}' | bash tests/executors/state-writer.sh --target pipeline --merge`
   - Skip continuation → return summary immediately

2. **FIX stage**: Did ALL fix attempts fail (0 moved to verifyQueue)?
   - All-fail rate = 100% AND batch size ≥ 3 → **earlyExit**
   - Same marking as above

**If no catastrophic pattern → skip (zero output), proceed to Step 2.1.**

No anomaly analysis, no recipe checks, no framework fix injection — those are supervisor's job.

### Step 2.1: Continuation Check

**After state update + circuit breaker**, decide whether to continue or return:

```
Read updated pipeline.json + queues.json:

1. currentStage = COMPLETE → go to Step 2.5 (return)
2. next = SCAN or GENERATE → ⚡ continue (back to stage execution)
3. **🔴 After SCAN: if gaps[] is non-empty, currentStage MUST be set to GENERATE and continue. Never skip GENERATE when there are unprocessed gaps.**
4. next = TEST and testQueue.length ≤ 8 → ⚡ continue
5. next = VALIDATE and fixQueue.length ≤ 8 → ⚡ continue
6. next = FIX and fixQueue.length ≤ 5 → ⚡ continue (FIX spawns agents, each costs more context)
7. next = VERIFY and verifyQueue.length ≤ 8 → ⚡ continue (note: fixType=framework_fix items are auto-accepted without test execution, so VERIFY is fast for these)
8. Otherwise (large queue) → return summary with stopReason
```

**Rationale**: supervisor overhead (observe→diagnose→decide) costs ~20% of each tick. Higher thresholds = fewer ticks = less waste. Opus model context supports processing 8 items per stage comfortably.

**🔴 CRITICAL RULE**: SCAN and GENERATE must NEVER be the last stage before returning. If you just completed SCAN or GENERATE, you MUST continue to the next stage — even if a cycle boundary was crossed. A single run that only scans but never tests is wasted work.

**Before returning** (cases 1 and 5, i.e., when NOT continuing), mark pipeline idle **with reason**:
```bash
# Case 1 (COMPLETE):
echo '{"pipelineStatus":"idle","stopReason":"cycle_complete","stopDetail":"Cycle finished all stages"}' | bash tests/executors/state-writer.sh --target pipeline --merge

# Case 5 (large queue):
echo '{"pipelineStatus":"idle","stopReason":"queue_handoff","stopDetail":"'{STAGE}' queue has '${QUEUE_SIZE}' items — returning for next tick"}' | bash tests/executors/state-writer.sh --target pipeline --merge
```
For circuit breaker exits (Step 2.2), the stopReason is written there:
```bash
echo '{"pipelineStatus":"idle","stopReason":"circuit_breaker","stopDetail":"..."}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

When **continuing** to next stage, clear any previous stopReason:
```bash
echo '{"pipelineStatus":"running","stopReason":null,"stopDetail":null}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

**Design**: SCAN (~30s) + GENERATE (~1min) are short — don't waste a tick. Chain SCAN→GENERATE→TEST in one invocation.

**⚠️ Before continuing**: Re-check directives (Step 0.5) — handle pause/resume.

### Step 2.5: COMPLETE State

When currentStage=COMPLETE:
1. Run `bash tests/executors/stats-reporter.sh <cycle>`
2. Output final report
3. Return — loop won't execute again
