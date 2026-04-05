## SCAN Phase — Discover gaps, recycle old issues

**Goal**: Scan project docs/code, compare with manifest.json, find untested features.

**Execution**: Main Agent directly (no spawn).

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"SCAN":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

### Step 0: Load State (only in SCAN — first stage of each cycle)

1. Read `tests/pipeline.json` + `tests/queues.json` → determine stage and queues
2. Read `tests/safety.yaml` → load safety rules
3. Read `tests/env.yaml` → load environment config (ports, passwords, case pool)
4. Read `tests/learnings.yaml` → load known issues
5. If `cycle >= maxCycles` → run `bash tests/executors/stats-reporter.sh <cycle>`, output final report, return (set currentStage=COMPLETE)
6. **Interrupt recovery**: If `currentTest` non-empty → previous execution was interrupted. Push `currentTest` back to queue head, clear `currentTest`, continue normally.

### Step 0 (SCAN sub-steps): Recycle + Skip Re-evaluate + Live Cases

**0. Recycle old issues** (every SCAN):
```bash
bash tests/executors/queue-recycler.sh
```
Checks regressionQueue / fixQueue(retryCount<3) / verifyQueue, moves recyclable items to testQueue. Record stageHistory if recycled.

**0.1. Skip re-evaluation** (every SCAN):
Check `queues.skipRegistry` for `reviewable: true` entries where `cycle - entry.cycle >= 3` → move back to testQueue, remove from skipRegistry. (`reviewable: false` like safety:blocked → never retry.)

**0.5. Refresh Live Case pool** (daily):
```bash
bash tests/executors/refresh-live-cases.sh
```
If `tests/fixtures/live-cases.yaml` `lastRefreshed` > 24h, scan `cases/active/` to update pool.

### SCAN Steps 1-7: Discovery

**Progress reporting**: Before each sub-step, write stageProgress so dashboard shows what's happening:
```bash
echo '{"stageProgress":{"current":STEP_NUM,"total":7,"testId":"STEP_DESCRIPTION"}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```
Example: `{"stageProgress":{"current":1,"total":7,"testId":"Scanning API endpoints"}}`

**1. Scan API endpoints**:
```bash
grep -r "app\.\(get\|post\|put\|patch\|delete\)" dashboard/src/routes/*.ts
```
Extract all HTTP endpoints → compare with `tests/registry/backend-api/`

**2. Scan UI components**:
```bash
ls dashboard/web/src/components/**/*.tsx
```
Extract all components → compare with `tests/registry/ui-interaction/` and `tests/registry/ui-visual/`

**3. Scan Skills/Workflows**:
```bash
ls .claude/skills/*/SKILL.md
```
Each skill → compare with `tests/registry/workflow-e2e/`

**4. Scan Issues** (requirement-driven):
```bash
bash tests/executors/issue-scanner.sh
```
- `tracked`/`implemented` (with trackId + spec) → extract AC, compare registry → output `ISSUE_GAP`
- `done` (with trackId + spec) → check regression coverage → `ISSUE_REGRESSION_GAP` or `ISSUE_COVERED`
- `pending` / no trackId → `ISSUE_SKIP`

Append `ISSUE_GAP` to gaps in pipeline.json (source: `issue-driven`).
Append `ISSUE_REGRESSION_GAP` to gaps in pipeline.json (source: `issue-regression`).

**4b. Auto-implement tracked issues** (optional, controlled by `env.yaml`):
Read `tests/env.yaml` → `automation.autoImplementTracked`.
- **false (default)** → skip, log note directive
- **true** → for tracked issues with plan.md, spawn `conductor:implement {trackId}` (max `max_auto_implement_per_round` per cycle, default 1). Record stageHistory.

**5. Scan Observability gaps**:
```bash
bash tests/executors/observability-scanner.sh
```
5 scans: agent config audit, SKILL prompt audit, bash anti-pattern, timing drift, learnings regression. Append gaps.

**5.5. Execute Observability Probes**:
```bash
bash tests/executors/probe-scheduler.sh {round}
```
Run all due probes directly (not via testQueue). Schedule: every `probe_schedule.interval_rounds` (default 5). Failed probes → record stageHistory warning.

**6. Scan Spec acceptance criteria**:
```bash
bash tests/executors/spec-scanner.sh
```
Scan `conductor/tracks/*/spec.md` AC → compare with registry → output `SPEC_GAP`. Append to gaps (source: `spec-driven`).

**6.5. Run Additional Scanners** (if activated by runner):

Check pre-flight briefing `activeScanners` array (from `tests/scan-strategies.yaml` scheduling).
For each activated scanner, run and collect GAP output lines:

| Scanner | Executor | Frequency | Description |
|---------|----------|-----------|-------------|
| design-fidelity | `design-fidelity-scanner.sh` | every_3_rounds | Compare spec AC with implementation code |
| ux-review | `ux-reviewer.sh` | every_5_rounds | Static UX anti-pattern detection |
| performance | `performance-scanner.sh` | every_3_rounds | API/timing vs baselines |
| architecture | `architecture-scanner.sh` | every_5_rounds | CLAUDE.md compliance + code anti-patterns |

```bash
# Example: run activated scanners
for scanner in "${activeScanners[@]}"; do
  bash "tests/executors/${scanner}"
done
```

**Scheduling logic** (runner decides, SCAN phase executes):
- `every_round` → always run (coverage scanner — this is the default Steps 1-6)
- `every_3_rounds` → run when `cycle % 3 == 0`
- `every_5_rounds` → run when `cycle % 5 == 0`
- Supervisor Diagnose step can override: force a scanner early or skip one

GAP output format from additional scanners:
```
GAP|{type}|{source}|{category}|{description}|{priority}|{impact}|{impactReason}
```
Append all GAP lines to `pipeline.json` gaps with the scanner's source tag.

**6.8. Impact Classification（优先级引擎）**

每个 GAP 必须附带 `impact` 和 `impactReason` 字段。分级规则详见 `playbooks/rules/impact-classification.md`。

**快速参考：**
- **P0 — 流程断裂**: 核心用户流程（casework/patrol/dashboard加载）完全不可用
- **P1 — 功能故障**: 功能存在但执行报错（按钮无响应、API 错误、生成失败）
- **P2 — 体验退化**: 能用但体验差（耗时过长、UI 错位、对比度不足）
- **P3 — 代码质量**: 不影响用户（架构问题、代码重复、类型不安全）

**写入 queues.json 时的格式**：
```json
{
  "testId": "xxx",
  "impact": "P1",
  "impactReason": "Todo执行是用户日常操作的核心功能",
  "... 其他现有字段 ...": "..."
}
```

**impactReason** 用一句话解释为什么是这个等级，供晨报展示。

**预算控制**

读取 `pipeline.json` 的 `priorityConfig`：
- `p0p1Only: true` → 只入队 P0 和 P1 gap，P2/P3 记录到事件日志但不入 testQueue
- `skipP3: true` → 不入队 P3 gap
- `maxP3Items: N` → P3 gap 最多入队 N 个

适用于时间紧张的短时运行。默认全部入队。

**6.9. SCAN 事件记录**

每发现一个 gap，写入事件：
```bash
bash tests/executors/event-writer.sh \
  --type bug_discovered \
  --impact {impact} \
  --area {area derived from category} \
  --detail "{gap description}"
```

特殊事件类型映射：
- 性能类 gap（performance scanner）→ `--type perf_regression --delta "{delta}"`
- UI/设计类 gap（design-fidelity scanner）→ `--type ui_issue`
- 流程断裂（E2E 整体失败）→ `--type flow_broken`

**7. Update manifest.json**: Add new features, update tested/untested, coverage stats.

### SCAN Decision

**🔴 Read queues.json gaps[] array. This is the authoritative source — not your judgment of "coverage".**

- `gaps.length > 0` → **MUST** set currentStage=GENERATE. Do NOT skip GENERATE. Do NOT decide "existing tests cover this". The GENERATE phase will decide what to generate.
- `gaps.length === 0` + testQueue non-empty (recycled items) → currentStage=TEST
- `gaps.length === 0` + testQueue empty → record `{ action: "no_work" }`, cycle++, currentStage=SCAN
