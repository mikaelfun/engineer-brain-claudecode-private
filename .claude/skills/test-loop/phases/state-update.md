## State Update + Continuation (read after every phase)

Post-phase logic: update state, run retrospective, decide continuation.

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

### Step 2.2: Phase Retrospective

**After state update, before continuation check.** Agent reviews phase execution for framework logic bugs.

**Self-ask checklist** (any "yes" → dig deeper):

1. **Input/output ratio reasonable?**
   - SCAN N gaps → GENERATE waste rate > 50%? (abnormal)
   - TEST N tests → all same failure? (same-cause rate > 80% → abnormal)
   - FIX N fixes → VERIFY all regressed? (regression rate > 60% → abnormal)

2. **Cross-round repeated waste?**
   - Same gaps reported 2+ rounds by SCAN but filtered by GENERATE? (idle loop)
   - Same test bouncing FIX→VERIFY→FIX 3+ times? (ping-pong)

3. **Root cause = environment or logic defect?**
   - Environment (port, permissions, network) → **don't escalate** (learnings handles it)
   - Logic defect (regex, condition, data structure) → **escalate**

4. **Can locate specific file/code?**
   - From error info, I/O comparison, logs → infer targetFile and targetLine

**Decision**:
- ✅ No anomaly → skip, go to Step 2.1
- 🔧 Logic bug found → execute 3 steps, then go to Step 2.1:

  **A. Record learning**:
  ```bash
  bash tests/executors/learnings-writer.sh "retro-{round}-{PHASE}" "framework" "{problem}" "{root cause}"
  ```

  **B. Create framework fix item** (fixQueue head, priority=1):
  ```bash
  # Read current fixQueue, prepend retroItem with retroContext, merge back
  echo '{"fixQueue":[retroItem, ...currentFQ]}' | bash tests/executors/state-writer.sh --merge
  ```
  retroContext schema: `{ phase, round, anomaly, rootCause, targetFile, targetLine }`

  **C. Record self-heal**:
  ```bash
  bash tests/executors/self-heal-recorder.sh "retro-{round}-{PHASE}" "logic_bug" "{signature}" "N/A" "{diagnosis}" "Created framework fix from Phase Retrospective"
  ```

**Constraints**:
- Max 1 retro fix item per phase per round
- Retrospective **never modifies code** — only creates fixQueue item
- No anomaly → zero output (no "all clear" noise)
- targetFile/targetLine are best-effort

### Step 2.1: Continuation Check

**After state update + retrospective**, decide whether to continue or return:

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
**⚠️ Retrospective may change next phase**: fixQueue additions can redirect SCAN→FIX.

### Step 2.5: COMPLETE State

When phase=COMPLETE:
1. Run `bash tests/executors/stats-reporter.sh <round>`
2. Output final report
3. Return — loop won't execute again
