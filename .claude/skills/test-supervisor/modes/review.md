## Mode 4: `review [round|testId]`

**详细审查**。按 round 或 testId 深入查看。

### 参数解析
```
subargs 第一个词:
  - 纯数字 → reviewType = "round", targetRound = 数字
  - 其他 → reviewType = "testId", targetTestId = 字符串
  - 空 → 默认 reviewType = "round", targetRound = state.json.round (最新)
```

### 4a. 审查指定 Round

1. 读取 `tests/results/round-{N}-summary.json`
2. 列出该 round 所有结果文件：
   ```bash
   ls tests/results/{N}-*.json 2>/dev/null
   ```
3. 对每个结果文件读取并汇总：

```
📋 Round {N} Review
═══════════════════════════════════════

Summary: {from round-N-summary.json}
  Phase: {phase} | Tests: {total} | Coverage: {coverage}%

Results:
  ✅ {testId} — {duration_ms}ms — {assertion_count} assertions
  ❌ {testId} — {duration_ms}ms — {failed_assertions}
     └ {first failed assertion name}: expected {expected}, got {actual}
  ...
```

### 4b. 审查指定 TestId

1. 找到所有 round 中该 testId 的结果：
   ```bash
   ls tests/results/*-{testId}.json 2>/dev/null | sort -V
   ```
2. 读取 `tests/results/fixes/{testId}-analysis.md`（如果存在）
3. 读取 `tests/results/fixes/{testId}-fix.md`（如果存在）
4. 读取 `tests/results/fixes/{testId}-verify.md`（如果存在）

```
🔍 Test History: {testId}
═══════════════════════════════════════

Results across rounds:
  Round 0: ❌ FAIL — {duration}ms
     Failures: {list failed assertions}
  Round 1: ✅ PASS — {duration}ms
  ...

{if fix analysis exists:}
📝 Fix Analysis:
  {content of fixes/{testId}-analysis.md}

{if fix record exists:}
🔧 Fix Applied:
  {content of fixes/{testId}-fix.md}

{if verify record exists:}
✅ Verification:
  {content of fixes/{testId}-verify.md}
```

---

