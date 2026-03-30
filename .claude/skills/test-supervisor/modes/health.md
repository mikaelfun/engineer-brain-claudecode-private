## Mode 2: `health`

**深度诊断**。分析反复失败、阶段停留、探针违规。

### 执行步骤

1. 运行 `bash tests/executors/health-check.sh` → 获取基础 JSON
   - **Auto-heal pre-check**：同 dashboard 模式 Step 2（如果输出含 `"error"` → `state-repair.sh` → 重跑）
2. 读取 `tests/state.json` 获取完整 fixQueue 和 phaseHistory
3. 分析并输出：

#### 2a. 反复失败测试分析
```
读取 state.json → fixQueue
按 retryCount 降序排列
输出:
  🔴 Stuck Tests (retryCount >= 3):
     - {testId}: {retryCount} retries — {reason}
  🟡 Failing Tests (retryCount < 3):
     - {testId}: {retryCount} retries — {reason}
```

#### 2b. 阶段停留时间分析
```
读取 state.json → phaseHistory
计算每个 phase 的累计停留时间:
  Phase     | Entries | Total Duration
  SCAN      | 2       | 30s
  GENERATE  | 1       | 10s
  TEST      | 3       | 15m
  FIX       | 1       | 5m
  VERIFY    | 1       | 2m
```

#### 2c. Observability 探针违规
```
从 health-check.sh 的 observabilityStatus.lastResults 中:
对每个已执行的探针，读取完整结果文件:
  tests/results/{round}-{probeId}.json
检查 assertions 中 pass=false 的项:
  🔴 Probe Violations:
     - {probeId} round {N}: {assertion.name} — expected {expected}, got {actual}
如果没有违规:
  ✅ All executed probes passing
```

#### 2d. 建议动作
```
基于以上分析生成建议:
- retryCount >= 3 → "建议跳过 {testId}，已失败 {N} 次: /test-supervisor directive skip {testId} \"retries exhausted\""
- phase 停留过长 → "SCAN/GENERATE 累计时间超过总时间 50%，建议优化或强制跳到 TEST"
- 探针失败 → "修复 {probeId} 违规后重跑"
- stale → "Loop 超过 20 分钟无活动，检查是否 session 中断"
- paused → "Loop 已暂停，恢复: /test-supervisor directive resume"
```

---

