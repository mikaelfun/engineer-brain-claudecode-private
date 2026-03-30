# Test Loop — 启动指南

## 单次手动运行

```
/test-loop
```

执行一轮测试循环：读取 `tests/state.json` → 判断 phase → 执行对应动作 → 更新状态。

### 指定阶段

```
/test-loop --phase SCAN       # 强制从 SCAN 开始
/test-loop --phase TEST       # 只执行 TEST
/test-loop --phase FIX        # 只执行 FIX
```

### 覆盖 maxRounds

```
/test-loop --max-rounds 10    # 设置最大轮次为 10
```

## 持续自动运行（推荐）

```
/loop 3m /test-loop
```

每 3 分钟自动执行一轮。会话期间持续运行，直到：
- 达到 `maxRounds` 限制
- 所有测试通过且无 gap
- 手动停止

> **并发安全**：Cron job 只在 REPL idle 时触发。如果上一轮还没跑完，本轮自动跳过，不会并发冲突。3 分钟间隔意味着一轮结束后最多等 3 分钟就会触发下一轮。

### 建议间隔

| 场景 | 间隔 | 说明 |
|------|------|------|
| 默认（推荐） | `/loop 3m /test-loop` | 多数测试 <5min，3 分钟间隔最高效 |
| 深度修复 | `/loop 8m /test-loop` | FIX/VERIFY 阶段 spawn opus agent，给更多时间 |

> **注意**：`/loop` 创建的 cron job 是 session-only 的，`/clear`、关闭终端、退出 Claude Code 都会丢失，需要重新创建。

## 首次启动前

1. 确保 Dashboard 运行中：
   ```bash
   curl -sf http://localhost:3010/api/health
   ```

2. 检查 state.json 状态：
   ```bash
   cat tests/state.json | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('Phase:',d.phase,'Round:',d.round,'/',d.maxRounds)"
   ```

3. 如需重置（全新开始）：
   ```bash
   # 重置 state.json
   node -e "const fs=require('fs');const s=JSON.parse(fs.readFileSync('tests/state.json','utf8'));s.phase='SCAN';s.round=0;s.testQueue=[];s.fixQueue=[];s.verifyQueue=[];s.regressionQueue=[];s.stats={totalTests:0,passed:0,failed:0,fixed:0,skipped:0,inProgress:0};fs.writeFileSync('tests/state.json',JSON.stringify(s,null,2)+'\n')"
   ```

## 查看进度

- 实时状态：`cat tests/state.json`
- 统计概览：`cat tests/stats.md`
- 某轮详情：`cat tests/results/round-N-summary.json`
- 测试结果：`cat tests/results/{round}-{testId}.json`
- 修复报告：`cat tests/results/fixes/{testId}-fix.md`

## 中断恢复

如果 session 中断，下轮启动时：
- `/test-loop` 自动从 `state.json` 记录的 phase 和 queues 恢复
- 不会重头开始，不会丢失进度
- `currentTest` 非空时 → 重新执行该测试（幂等）
