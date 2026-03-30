## Mode 7: `discoveries`

**项目质量发现**。展示测试为项目发现的 bug 及其修复状态。叙事主语是"测试帮项目拦截了什么问题"。

### 数据来源

| 数据 | 来源文件 |
|------|---------|
| 聚合汇总 | `tests/discoveries.json`（stats-reporter.sh 自动生成） |
| 每轮发现的失败 | `tests/results/{cycle}-{testId}.json` |
| 诊断分析 | `tests/results/fixes/{testId}-analysis.md` |
| 修复记录 | `tests/results/fixes/{testId}-fix.md` |
| 验证结果 | `tests/results/fixes/{testId}-verify.md` |
| 回归影响 | `tests/results/fixes/{testId}-regression.md` |
| 轮次汇总 | `tests/results/cycle-{N}-summary.json` |

### 执行步骤

1. 读取 `tests/discoveries.json`（如不存在，提示先运行 `bash tests/executors/stats-reporter.sh <cycle>`）
2. 用 Read 工具直接读 `tests/pipeline.json` 获取当前 cycle，读 `tests/queues.json` 获取 fixQueue（⚠️ 不要用 `cat | node` 管道，Windows 下 `/dev/stdin` 会报 ENOENT）
3. 对 discoveries.json 中每个 entry，如果 hasAnalysis/hasFix/hasVerify，读取对应 fixes/ 文件提取关键信息
4. 格式化输出：

```
🔍 Test Discoveries — What tests found & fixed for the project
═══════════════════════════════════════════════════════════════

📊 Impact Summary
   Bugs found: {total} | Fixed: {verified} | Diagnosed: {diagnosed}
   Retry needed: {retryNeeded} | Unaddressed: {unaddressed} | Regression: {regression}

─── Discovery Timeline ──────────────────────────────────
{for each discovery, grouped by foundCycle:}

📍 Cycle {foundCycle} — Discovered {count} issues

{status_emoji} {testId} — {status_label}
   Found: Cycle {foundCycle} — {firstFailedAssertion}
   {if rootCause:} Root cause: {rootCause}
   {if hasFix:}
   Fix: {from fix.md — Fix Type + Description}
   Modified: {from fix.md — Modified Files}
   {end if}
   {if hasVerify:} Verified: Cycle {verifiedCycle} {pass/fail}
   {if hasRegression:} ⚠️ Regression: {regression details}

{end for}

─── Still In Progress ───────────────────────────────────
{for each item in fixQueue:}
🔄 {testId} — retry #{retryCount} — {reason}
{end for}
{if fixQueue empty: "(none)"}

═══════════════════════════════════════════════════════════
```

### Status emoji 映射
- ✅ `verified` — 发现→诊断→修复→验证通过
- 🔧 `fixed-unverified` — 已修复但未验证
- 🔬 `diagnosed` — 已分析但尚未修复
- 🔄 `retry-needed` — 修复后验证仍失败
- ❓ `unaddressed` — 失败但未进入修复流程
- ⚠️ `regression` — 修复引入了新问题

### 读取 fix 生命周期文件

每个 testId 最多有 4 个文件，按阶段提取关键信息：

**{testId}-analysis.md** — 提取：
- `Failure Type:` 行的值
- `Is Env Issue:` 行的值
- `## Failed Assertions` 下的第一个 bullet

**{testId}-fix.md** — 提取：
- `Fix Type:` 行的值
- `Description:` 行的值
- `Modified Files:` 行的值

**{testId}-verify.md** — 提取：
- `Status:` 行的值（pass/fail）
- `Assertions:` 行的值

**{testId}-regression.md** — 提取：
- 是否存在（存在即表示该 fix 引入了回归风险）
- 回归内容摘要

---

