## Mode 8: `evolution`

**框架自我进化时间线**。展示测试框架自身的能力成长和架构变更。叙事主语是"框架自己变强了多少"。

### 数据来源

| 数据 | 来源文件 |
|------|---------|
| 框架架构变更 | `tests/evolution.json`（手动补充） |
| 自愈记录 | `tests/results/fixes/{pattern-id}-self-heal.md` |
| 轮次汇总 | `tests/results/round-{N}-summary.json`（用于 metrics 计算） |
| 阶段时间线 | `tests/state.json` → phaseHistory |

### 执行步骤

1. 读取 `tests/evolution.json`（如不存在提示 "No evolution records yet"）
2. 扫描 `tests/results/fixes/*-self-heal.md`，提取自愈记录
3. 读取所有 `tests/results/round-*-summary.json`，计算 metrics 变化
4. 读取 `tests/state.json` 获取 phaseHistory
5. 格式化输出：

```
🧬 Framework Evolution — How the test system grew
══════════════════════════════════════════════════

📈 Capability Growth
   {from earliest to latest round summary:}
   R0: {pass0}/{total0} pass ({coverage0}%) → R{N}: {passN}/{totalN} pass ({coverageN}%)
   Entries: {evolution.json entry count} architecture changes
   Self-heals: {self-heal file count} automatic recoveries

─── Architecture Changes ────────────────────────
{for each entry in evolution.json:}
{category_emoji} [{id}] {title} ({date})
   {if issueId:} Issue: {issueId}
   {if trackId:} Track: {trackId}
   Before: {before}
   After:  {after}
   Impact: {files_changed} files changed
{end for}

─── Self-Heal Records ──────────────────────────
{for each self-heal file:}
🛡️ [{pattern-id}] {signature}
   Type: {systemic|stuck}
   Affected: {test-ids}
   Diagnosis: {diagnosis}
   Actions: {actions taken}
   Timestamp: {timestamp}
{end for}
{if no self-heal files: "(none)"}

─── Phase Efficiency ───────────────────────────
{from phaseHistory, aggregate per-phase durations:}
   Phase     | Entries | Avg Duration
   SCAN      | {n}     | {avg}s
   TEST      | {n}     | {avg}s
   FIX       | {n}     | {avg}s
   VERIFY    | {n}     | {avg}s

══════════════════════════════════════════════════
```

### Category emoji 映射

- `architecture` → 🏗️
- `throughput` → ⚡
- `observability` → 🔭
- `reliability` → 🛡️
- `usability` → 🎯
- other → 🔧

---

