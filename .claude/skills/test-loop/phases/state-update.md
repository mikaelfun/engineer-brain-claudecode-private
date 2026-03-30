## State Update + Continuation (read after every phase)

Post-phase logic: update state, circuit-breaker check, decide continuation.

### Step 2: Update State

After each phase completes:

1. Update `tests/state.json` (phase, queues, stats) via state-writer.sh --merge
2. **🔴 Mark completed phase in roundJourney**:
   ```bash
   DURATION_MS=$(( $(date +%s%3N) - START_TS ))
   echo '{"roundJourney":{"'$PHASE'":{"status":"done","summary":"...","duration_ms":'$DURATION_MS'}}}' \
     | bash tests/executors/state-writer.sh --merge
   ```
   Summary by phase:
   - SCAN: `"{issue_gaps} issue gaps, {regression_gaps} regression gaps"`
   - GENERATE: `"{count} tests from {issue_count} issues"`
   - TEST: `"{passed} passed, {failed} failed"`
   - FIX: `"{fixed} fixed, {unfixable} unfixable"`
   - VERIFY: `"{verified} verified, {regressed} regressed"`

3. Append phaseHistory (**must include `round` field**):
   ```bash
   echo '{"phaseHistory":[{"phase":"TEST","action":"test_pass","testId":"xxx","round":5,"timestamp":"..."}]}' \
     | bash tests/executors/state-writer.sh --merge
   ```

4. **Round increment rule**: When full cycle ends (VERIFY/TEST → SCAN), round++
5. **On round switch**: Reset phaseHistory + roundJourney:
   ```bash
   echo '{"phaseHistory":[],"roundJourney":{"SCAN":{"status":"pending","summary":""},"GENERATE":{"status":"pending","summary":""},"TEST":{"status":"pending","summary":""},"FIX":{"status":"pending","summary":""},"VERIFY":{"status":"pending","summary":""}}}' \
     | bash tests/executors/state-writer.sh --merge
   ```
   Then: `bash tests/executors/stats-reporter.sh <round>`

6. If round >= maxRounds → set phase=COMPLETE

### Step 2.2: Circuit Breaker (lightweight)

**Quick check only — full analysis done by supervisor meta-analysis.**

After state update, check for catastrophic failure patterns that require immediate exit:

1. **TEST phase**: Did ALL tests in this batch fail with the same root error message?
   - Same-cause rate > 90% AND batch size ≥ 3 → **earlyExit**
   - Mark in roundJourney: `"earlyExit": true, "earlyExitReason": "same-cause catastrophic failure: {error}"`
   - Skip continuation → return summary immediately

2. **FIX phase**: Did ALL fix attempts fail (0 moved to verifyQueue)?
   - All-fail rate = 100% AND batch size ≥ 3 → **earlyExit**
   - Same marking as above

**If no catastrophic pattern → skip (zero output), proceed to Step 2.1.**

No anomaly analysis, no recipe checks, no framework fix injection — those are supervisor's job.

### Step 2.1: Continuation Check

**After state update + circuit breaker**, decide whether to continue or return:

```
Read updated state.json:

1. phase = COMPLETE → go to Step 2.5 (return)
2. next = SCAN or GENERATE → ⚡ continue (back to phase execution)
3. next = TEST and testQueue.length ≤ 2 → ⚡ continue
4. next = VERIFY and verifyQueue.length ≤ 2 → ⚡ continue
5. Otherwise (large queue TEST/FIX/VERIFY) → return summary
```

**Design**: SCAN (~30s) + GENERATE (~1min) are short — don't waste a tick. Chain SCAN→GENERATE→TEST in one invocation.

**⚠️ Before continuing**: Re-check directives (Step 0.5) — handle pause/resume.

### Step 2.5: COMPLETE State

When phase=COMPLETE:
1. Run `bash tests/executors/stats-reporter.sh <round>`
2. Output final report
3. Return — loop won't execute again
