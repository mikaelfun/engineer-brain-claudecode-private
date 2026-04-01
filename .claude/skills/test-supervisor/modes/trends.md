## Mode 3: `trends`

**多周期趋势**。读取所有 cycle summary 文件展示变化。

### 执行步骤

1. 列出所有 cycle summary 文件：
   ```bash
   ls tests/results/cycle-*-summary.json 2>/dev/null | sort -V
   ```
2. 如果没有 summary 文件 → 输出 "No cycle summaries yet. Run stage-worker first." → 返回
3. 用 node 读取所有 summary 并汇总：
   ```bash
   SUMMARIES=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
     const fs = require('fs');
     const path = require('path');
     const dir = 'tests/results';
     const files = fs.readdirSync(dir)
       .filter(f => /^cycle-\d+-summary\.json$/.test(f))
       .sort((a,b) => {
         const na = parseInt(a.match(/cycle-(\d+)/)[1]);
         const nb = parseInt(b.match(/cycle-(\d+)/)[1]);
         return na - nb;
       });
     const summaries = files.map(f =>
       JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
     );
     console.log(JSON.stringify(summaries));
   ")
   ```
4. 格式化输出：

```
📈 Test Loop Trends ({N} cycles)
═══════════════════════════════════════

Pass/Fail/Fix per Cycle:
  Cycle | Pass | Fail | Fix  | Skip | Coverage
  ──────┼──────┼──────┼──────┼──────┼─────────
  0     | 2    | 1    | 0    | 0    | 11%
  1     | 5    | 2    | 1    | 0    | 32%
  ...

Coverage Trend:
  C0 ████████░░░░░░░ 11%
  C1 ████████████████ 32%
  ...

Queue Trend:
  Cycle | TestQ | FixQ
  ──────┼───────┼──────
  0     | 15    | 1
  1     | 10    | 2
  ...

Stage History Timeline:
  {from stageHistory in stats.json}
  [16:30] SCAN (15s) → [16:32] GENERATE (10s) → [16:35] TEST (5m) → ...
```

如果只有 1 个 cycle，不画趋势线，但仍展示该 cycle 数据。

---
