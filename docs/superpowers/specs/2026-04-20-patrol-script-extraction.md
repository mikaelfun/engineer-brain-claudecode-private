# Patrol 脚本化提取

## 问题

patrol SKILL.md 的 Steps 1-5（配置、互斥、列表、筛选、归档、预热）和 Steps 7-8（清理、汇总）是 100% 确定性逻辑，但当前由 LLM agent 逐行生成命令执行，每步一个 inference turn。

**现状**：~22 个 LLM turns 用于预处理，每 turn ~3-5s = ~60-90s 纯 LLM 推理开销。实际执行只需 ~15s。

**目标**：将确定性步骤提取为 bash 脚本，LLM agent 只做需要 Agent tool 的工作（spawn 子进程 + 轮询状态机）。

## 架构约束

- patrol 永远由 LLM agent 驱动（CLI 或 WebUI → SDK query → spawn patrol agent → agent 执行）
- 脚本由 agent 调用（跟 casework 的 data-refresh.sh 模式一致）
- 不在后端直接执行 patrol 逻辑

## 设计

### 新增脚本

#### 1. `patrol-init.sh`（Steps 1-5）

**输入**（命令行参数）：
```bash
bash .claude/skills/patrol/scripts/patrol-init.sh \
  --cases-root ./cases \
  --patrol-dir ../data/.patrol \
  --source cli \
  [--force]
```

**内部流程**（串行/并行，与当前 SKILL.md 逻辑完全一致）：

1. 读 `config.json` → 获取 `casesRoot`, `patrolDir`, `patrolSkipHours`
2. 互斥检查：检查 `patrol.lock`，存在则输出错误退出
3. 写 lock 文件
4. update-phase → `discovering`
5. `list-active-cases.ps1 -OutputJson` → 获取活跃 case 列表
6. update-phase → `filtering`
7. 筛选：读每个 case 的 `casework-meta.json`，按 `patrolSkipHours` 过滤
8. 归档检测：`detect-case-status.ps1` → cp/rm 归档/转移 → 写 `archive-log.jsonl`
9. update-phase → filtering（含 archived/transferred counts）
10. Early-exit 检查：如果 0 cases，写 patrol-state.json + 释放 lock + 退出
11. 预热（并行）：`check-ir-status-batch.ps1` + `token-daemon.js warmup`
12. update-phase → `processing`

**输出**（stdout JSON）：
```json
{
  "status": "ok",
  "cases": ["2601290030000748", "2601150020002341"],
  "totalFound": 12,
  "changedCases": 5,
  "skippedCount": 7,
  "archivedCount": 1,
  "transferredCount": 0,
  "warmupStatus": "WARMUP_OK|daemon=alive|teams=cached(47m)|dtm=cached(10m)|icm=cached(134m)",
  "source": "cli",
  "force": false
}
```

Early-exit 时输出：
```json
{
  "status": "early-exit",
  "cases": [],
  "totalFound": 12,
  "changedCases": 0,
  "message": "All cases within skipHours"
}
```

错误时输出：
```json
{
  "status": "error",
  "error": "Patrol already running (source=webui)"
}
```

**退出码**：0=ok/early-exit, 1=error（lock 冲突等）

#### 2. `patrol-finalize.sh`（Steps 7-8）

**输入**：
```bash
bash .claude/skills/patrol/scripts/patrol-finalize.sh \
  --cases-root ./cases \
  --patrol-dir ../data/.patrol \
  --cases "2601290030000748,2601150020002341" \
  --source cli
```

**内部流程**：

1. 清理 orphan agency 进程（taskkill）
2. 聚合各 case 的 todo/ 和 state.json → 构建 caseResults
3. 写 `patrol-state.json`
4. update-phase → `completed`
5. 释放 `patrol.lock`

**输出**（stdout JSON）：
```json
{
  "status": "ok",
  "processedCases": 5,
  "caseResults": [
    {"caseNumber": "2601290030000748", "status": "completed"},
    {"caseNumber": "2601150020002341", "status": "completed"}
  ]
}
```

### SKILL.md 变更

当前 SKILL.md 529 行，Steps 1-5 占 ~200 行命令细节。变更后：

**Steps 1-5 替换为**：
```markdown
1. **初始化（patrol-init.sh）**

   ```bash
   INIT_JSON=$(bash .claude/skills/patrol/scripts/patrol-init.sh \
     --cases-root {casesRoot} --patrol-dir {patrolDir} --source "$SOURCE" [--force])
   ```

   解析输出：
   - `status=error` → 输出错误信息，终止
   - `status=early-exit` → 输出 "0 cases to process"，终止
   - `status=ok` → 提取 cases 列表，继续 Step 6
```

**Step 6 保持不变**（spawn agents + 轮询状态机 = LLM 核心职责）

**Steps 7-8 替换为**：
```markdown
7. **收尾（patrol-finalize.sh）**

   ```bash
   bash .claude/skills/patrol/scripts/patrol-finalize.sh \
     --cases-root {casesRoot} --patrol-dir {patrolDir} \
     --cases "$CASE_LIST_CSV" --source "$SOURCE"
   ```
```

### 不变的部分

- Step 6（Streaming Pipeline）: agent spawn + 轮询循环 — 完全保留在 SKILL.md
- `update-phase.py`, `update-state.py`, `patrol-progress.py` — 被脚本和 LLM 共同调用，不变
- casework/troubleshooter/email-drafter/summarize 的 Agent spawn 模板 — 不变
- patrol agent 的注册方式（SDK query → spawn）— 不变

### 效果预估

| 指标 | 当前 | 优化后 |
|------|------|--------|
| Steps 1-5 LLM turns | ~15-22 | **1** |
| Steps 7-8 LLM turns | ~4-5 | **1** |
| Steps 1-5 耗时 | ~60-90s | **~15s** |
| Steps 7-8 耗时 | ~15-20s | **~3s** |
| SKILL.md 行数 | ~529 | ~350（-180 行命令细节） |
| Step 6 | 不变 | 不变 |

## 实施范围

1. 新建 `patrol-init.sh`（~150 行 bash）
2. 新建 `patrol-finalize.sh`（~60 行 bash）
3. 修改 `patrol/SKILL.md`（Steps 1-5 和 7-8 替换为脚本调用）
4. 更新 SKILL.md 中 warmup 注释（daemon alive 时 <1s，非 ~37s）
