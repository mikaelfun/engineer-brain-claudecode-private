## Mode: `story`

**叙事摘要**。读取测试数据文件，输出自然语言故事，让人快速理解测试框架发生了什么。

### 执行步骤

1. 读取核心数据文件：
   ```bash
   PROJECT_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain"
   DASHBOARD_DIR="$PROJECT_DIR/dashboard"

   # state.json — roundJourney, stats, scanStrategy, cycle/stage
   STATE=$(cat "$PROJECT_DIR/tests/state.json")

   # discoveries.json — discovery summary and individual test stories
   DISCOVERIES=$(cat "$PROJECT_DIR/tests/discoveries.json")

   # learnings.yaml — documented lessons learned
   LEARNINGS=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
     const yaml = require('yaml');
     const fs = require('fs');
     const data = yaml.parse(fs.readFileSync('$PROJECT_DIR/tests/learnings.yaml', 'utf8'));
     console.log(JSON.stringify(data));
   ")

   # Recent fix reports (last 5-10 by modification time)
   FIX_REPORTS=$(ls -t "$PROJECT_DIR/tests/results/fixes/"*-fix.md 2>/dev/null | head -10)
   ```

2. 如果任何核心文件不存在 → 输出 "No test data yet. Run `/test-supervisor` first to start the test loop." → 返回

3. 解析数据并生成以下格式的叙事输出：

```
# 🧪 Test Framework Story — Cycle {N}/{max}

## 📖 本轮发生了什么

{Read roundJourney for each completed stage this cycle, convert to natural language paragraph}
{Example: "第40轮扫描发现了1个UX问题（页面缺少空状态处理）和5个架构问题（Windows路径格式、变量pipe陷阱、硬编码路径等）。随后生成了5个新测试用例来覆盖这些问题。"}

{If scanStrategy has overrideReason, explain why: "扫描策略因回归率55%触发了回归聚焦扫描配方"}

## 📊 累计战绩

- ✅ **{verified}** 个问题被发现、修复并稳定通过验证
- 🔧 **{fixedUnverified}** 个已修复但还没来得及验证
- 🔄 **{regression}** 个修好了又坏了（回归）
- 🔁 **{retryNeeded}** 个反复尝试修复中
- 📋 共发现 **{total}** 个测试场景

## 🏆 成功修复的问题（Top 5）

{For each verified discovery with hasFix=true, read the fix report if available}
{Format: "**{testId}**: {从fix report提取description，用自然语言描述修了什么}"}

## ⚠️ 还在挣扎的问题（Top 5 回归）

{For each regression discovery}
{Format: "**{testId}**: 根因是{rootCause}，第{foundRound}轮发现，修复后又回退了"}

## 📝 学到的经验

{Read learnings.yaml, list recent 5 entries}
{Format: "- **{id}** ({category}): {problem} → 解决方案: {solution的第一行}"}

## ⏭️ 下一步

{Based on current stage and queues, describe what will happen next}
```

### 数据提取规则

#### state.json 字段映射
- `state.cycle` → 当前轮次 N
- `state.maxCycles` → 最大轮次 max
- `state.stage` → 当前阶段（SCAN/GENERATE/TEST/FIX/VERIFY）
- `state.roundJourney` → 数组，每项含 `{stage, summary, timestamp}`
- `state.scanStrategy.overrideReason` → 扫描策略覆盖原因（可选）

#### discoveries.json 字段映射
- 按 `status` 分组统计:
  - `verified` → verified 计数
  - `fixed` → fixedUnverified 计数
  - `regression` → regression 计数
  - `retry-needed` → retryNeeded 计数
  - 总数 = 所有 discovery 条数
- Top 5 verified: 按 `lastVerifiedRound` 降序，取 `hasFix=true` 的前5个
- Top 5 regression: 按 `foundRound` 升序，取 `status=regression` 的前5个

#### learnings.yaml 字段映射
- 每条 learning 含 `{id, category, problem, solution, addedInCycle}`
- 按 `addedInCycle` 降序取最近5条

#### fix reports 提取
- 文件名格式: `{testId}-fix.md`
- 从 Markdown 中提取第一个 `## ` 标题或 `**描述**:` 行作为 description
- 如果 fix report 不存在，用 discovery 自身的 `description` 字段

### 输出风格

- 使用中文叙事风格，像给同事讲故事一样
- 数字用粗体突出
- 如果某个 section 没有数据（如没有回归），输出 "暂无" 而不是空白
- roundJourney 转叙事时，合并相邻阶段，避免机械列举

---
