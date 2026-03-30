## Mode 9: `auto-heal`

**框架自愈**。检测并修复测试框架自身的问题（不是项目代码）。

### 触发方式
- **自动触发**：dashboard/health 模式检测到 health-check.sh 失败时自动执行 state.json 修复（pre-check）
- **手动触发**：`/test-supervisor auto-heal` — 全面扫描框架健康状态

### 异常分类表

| 类型 | 触发条件 | 快速路径 | 通用路径 |
|------|---------|---------|---------|
| `data_integrity` | state.json JSON parse 失败 | `state-repair.sh` | — |
| `stale_progress` | `.progress-*.json` 文件 > 15 min | 清理文件 | — |
| `orphan_lock` | `currentTest` 非空但无 `.progress` 文件 | 清空 `currentTest` | — |
| `executor_crash` | 执行器非零退出且无结果文件 | — | Spawn agent 分析修复 |
| `unknown` | 其他异常 | — | Spawn agent 分析修复 |

### 执行步骤（手动触发）

1. **运行 health-check.sh**：
   ```bash
   bash tests/executors/health-check.sh
   ```
   如果输出含 `"error"` → 先运行 `state-repair.sh`，再重跑 health-check

2. **扫描已知快速修复模式**：

   **2a. state.json 完整性**：
   - 已在 Step 1 检查

   **2b. 清理过期 .progress 文件**（> 15 min）：
   ```bash
   # 列出所有 .progress 文件
   ls tests/results/.progress-*.json 2>/dev/null
   ```
   对每个文件检查 timestamp，如果 > 15 min 前 → 删除 → 记录

   **2c. 清理 orphan currentTest**：
   - 读取 `state.json.currentTest`
   - 如果非空 且 无对应 `.progress-{testId}.json` 且 上次 phaseHistory > 10 min 前
   - → 用 `state-writer.sh` 清空 currentTest

   **2d. 清理 stale progress from completed tests**：
   - 检查 `.progress-*.json` 中的 testId 是否已有结果文件 `tests/results/{round}-{testId}.json`
   - 如果已有结果 → 删除 stale progress 文件

3. **汇总修复结果**：
   ```
   🏥 Auto-Heal Report
   ═══════════════════════════════════════

   {for each repair action:}
   {emoji} {type}: {description}
      Action: {what was done}
      Result: {success/failed}
   {end for}

   {if no issues found:}
   ✅ No framework issues detected. All clear.
   ```

   Emoji 映射：
   - 修复成功 → 🔧
   - 修复失败 → ❌
   - 清理 → 🧹
   - 跳过（不需要） → ✅

4. **记录到 learnings**（如有修复）：
   ```bash
   bash tests/executors/learnings-writer.sh "auto-heal-$(date +%Y%m%d-%H%M)" "framework" "{问题描述}" "{修复动作}"
   ```

5. **记录到 evolution.json**（如有重大修复）：
   读取 `tests/evolution.json`（如不存在则创建），追加条目：
   ```json
   {
     "id": "auto-heal-{timestamp}",
     "date": "2026-03-28",
     "category": "reliability",
     "title": "{修复描述}",
     "before": "{问题状态}",
     "after": "{修复后状态}",
     "trigger": "supervisor-auto-heal"
   }
   ```

### 安全边界

Auto-heal **只**修改以下路径（符合 `tests/safety.yaml` 的 `supervisor_auto_heal` 规则）：

| 允许 | 路径 |
|------|------|
| ✅ | `tests/state.json`（通过 `state-writer.sh` 原子写入） |
| ✅ | `tests/results/.progress-*.json`（清理过期文件） |
| ✅ | `tests/results/backups/`（备份损坏的文件） |
| ✅ | `tests/learnings.yaml`（记录经验） |
| ✅ | `tests/evolution.json`（记录框架变更） |
| ❌ | `tests/executors/*.sh`（不自动修改执行器代码） |
| ❌ | `.claude/skills/**`（不修改 skill 定义） |
| ❌ | `dashboard/**`（不碰项目代码） |
| ❌ | `cases/**`（不碰 case 数据） |

**通用路径（Spawn agent）的额外约束**：仅在手动触发 `auto-heal` 且快速路径无法处理时，才 spawn opus agent 做深度分析。自动触发（pre-check）只走快速路径。

---

