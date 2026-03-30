## Mode 3: `trends`

**多轮趋势**。读取所有 round summary 文件展示变化。

### 执行步骤

1. 列出所有 round summary 文件：
   ```bash
   ls tests/results/round-*-summary.json 2>/dev/null | sort -V
   ```
2. 如果没有 summary 文件 → 输出 "No round summaries yet. Run test-loop first." → 返回
3. 用 node 读取所有 summary 并汇总：
   ```bash
   SUMMARIES=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
     const fs = require('fs');
     const path = require('path');
     const dir = 'tests/results';
     const files = fs.readdirSync(dir)
       .filter(f => /^round-\d+-summary\.json$/.test(f))
       .sort((a,b) => {
         const na = parseInt(a.match(/round-(\d+)/)[1]);
         const nb = parseInt(b.match(/round-(\d+)/)[1]);
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
📈 Test Loop Trends ({N} rounds)
═══════════════════════════════════════

Pass/Fail/Fix per Round:
  Round | Pass | Fail | Fix  | Skip | Coverage
  ──────┼──────┼──────┼──────┼──────┼─────────
  0     | 2    | 1    | 0    | 0    | 11%
  1     | 5    | 2    | 1    | 0    | 32%
  ...

Coverage Trend:
  R0 ████████░░░░░░░ 11%
  R1 ████████████████ 32%
  ...

Queue Trend:
  Round | TestQ | FixQ
  ──────┼───────┼──────
  0     | 15    | 1
  1     | 10    | 2
  ...

Phase History Timeline:
  {from phaseHistory in state.json}
  [16:30] SCAN (15s) → [16:32] GENERATE (10s) → [16:35] TEST (5m) → ...
```

如果只有 1 个 round，不画趋势线，但仍展示该 round 数据。

---

