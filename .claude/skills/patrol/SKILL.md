---
name: patrol
displayName: 批量巡检
category: orchestrator
stability: stable
promptTemplate: |
  Execute patrol. Read .claude/skills/patrol/SKILL.md and follow all steps.
description: "批量巡检：获取所有活跃 Case 列表，筛选有变化的 Case，逐个执行 casework 流程，汇总 Todo。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /patrol — 批量巡检

对所有活跃 Case 执行巡检，生成汇总 Todo。

## 核心原则

**每个 case 的分析/路由/写作步骤必须使用 Agent 工具（独立子进程）处理，禁止在 patrol session 中 inline 执行 casework。**
这确保 patrol session 只保持轻量的调度状态，不会因 case 数据累积导致上下文溢出。

## 架构：预热 → Streaming Pipeline（完成即推进）

通过 **streaming pipeline** 设计：casework-light 完成一个就立即推进下一步，不等所有 case 完成。

```
阶段 0（预热，~15s）:
  ├── check-ir-status-batch.ps1 -SaveMeta     （~3s，批量 IR/FDR/FWR）
  └── warm-dtm-token.ps1                       （~10s，DTM token 预热）

阶段 0.5: spawn teams-search-queue（后台常驻，串行处理 Teams MCP）

阶段 1+2 合并（Streaming Pipeline，统一轮询循环）:
  全量并行启动 casework-light → 统一轮询循环：
    每轮检查每个 case 的状态，按需推进：

    Case A: casework-light 完成(37s) → no-action → 立即 spawn inspection ──→ done
    Case B: casework-light 完成(60s) → spawn email-drafter ──→ 完成后 spawn inspection → done
    Case C: casework-light 还在跑(200s)... → 完成后 spawn troubleshooter → challenger → email → inspection → done
    
  退出条件：所有 case 到达 done 状态
```

每个 case 的生命周期状态机：
```
gathering → plan-ready ─┬─ no-action → inspecting → done
                        └─ has-actions → executing → inspecting → done
```

### 为什么这样设计

- **depth=1 限制**：casework-light 作为 subagent 无法再 spawn，所以只做信息收集 + 决策
- **Teams 串行**：Teams MCP 有并发限制，通过 queue agent 串行处理
- **其他步骤并发**：data-refresh、onenote-search、compliance 在 casework-light 内用 Bash 后台进程并行
- **spawn 回到主 agent**：troubleshooter/challenger/email-drafter 由 patrol 主 agent（depth=0）spawn
- **DTM/IR 预热**：与之前相同，全局缓存避免 Playwright 互斥

## 执行步骤

1. **读取配置 + 互斥检查**
   读取 `config.json` 获取 `casesRoot` 和 `patrolDir`。**直接使用原始值，不做任何路径解析。**
   - `casesRoot` 默认 `./cases`
   - `patrolDir` 默认 `{casesRoot}/.patrol`（如果 config.json 未配置 patrolDir）

   **🔒 互斥检查**：检查 `{patrolDir}/patrol.lock` 是否存在：
   ```bash
   if [ -f "{patrolDir}/patrol.lock" ]; then
     LOCK_SOURCE=$(python3 -c "import json; print(json.load(open('{patrolDir}/patrol.lock'))['source'])")
     echo "ERROR: Patrol already running (source=$LOCK_SOURCE). Abort."
     exit 1
   fi
   ```
   如果 lock 存在，输出错误并终止。

   **写 lock 文件**：
   检测 prompt 中是否包含 `source=webui`，如果包含则 source 为 `webui`，否则为 `cli`。
   ```bash
   mkdir -p "{patrolDir}"
   echo '{"source":"cli","pid":'"$$"',"startedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","force":FORCE_VALUE}' > "{patrolDir}/patrol.lock"
   ```

   **🚨 路径硬规则（反复出问题，必须严格遵守）**：
   - `casesRoot` = `./cases`（直接用 config.json 原始值）
   - `projectRoot` = `.`（当前目录）
   - **所有 Bash 命令、Agent spawn prompt、python3 -c 内部**都用这些相对路径
   - **绝对禁止**：`C:\Users\...`、`C:/Users/...`、`/c/Users/...` 任何形式的绝对路径
   - 违反此规则会导致：文件写到错误位置、`__teams-queue__` 幽灵目录、path 中反斜杠被当转义符

2. **写 phase 文件（discovering）**
   ```bash
   echo "discovering" > "{patrolDir}/patrol-phase"
   ```

3. **获取活跃 Case 列表**
   ```
   pwsh -NoProfile -File skills/d365-case-ops/scripts/list-active-cases.ps1 -OutputJson
   ```

3. **筛选需要处理的 Case**

   **`--force` 模式**：如果用户传入 `--force`（或明确表示要强制巡检），跳过 `lastInspected` 检查，所有活跃 case 全部纳入处理。

   **常规模式**：读取 `config.json` 中 `patrolSkipHours`（默认 3 小时）。对每个 case，读取 `{casesRoot}/active/{case-id}/casehealth-meta.json` 的 `lastInspected`。
   满足以下**任一条件**即纳入处理：
   - `lastInspected` 距当前时间超过 `patrolSkipHours` 小时
   - 无 `casehealth-meta.json` 或无 `lastInspected` 字段（新 case，首次巡检）

   > **设计说明**：不使用 D365 `modifiedon` 作为筛选条件，因为新邮件是独立 Email Activity，不一定更新 Case 实体的 `modifiedon`，会导致漏检。

   **2.5. 归档/转移检测（含 AR 级联）**

   获取 active case 列表后，扫描本地 `{casesRoot}/active/` 目录，找出不在 D365 active list 中的 case：

   ```bash
   pwsh -NoProfile -File skills/d365-case-ops/scripts/detect-case-status.ps1 -CasesRoot {casesRoot}
   ```

   脚本输出 JSON 数组，每个元素包含 `caseNumber`, `status`（archived/transferred）, `reason`, `closureEmailEvidence`。

   > **AR 级联归档**：`detect-case-status.ps1` 内置 Step 3a 会自动检测 AR case（case number ≥ 19 位）的 main case（前 16 位）是否正在归档或已归档。当 main case resolved/archived 时，其 AR case 即使仍在 D365 active list 中也会被标记为 archived（reason: "AR cascade: main case {mainCaseId} resolved/archived"）。无需额外处理。

   对每个检测到的 case：
   - 确保 `{casesRoot}/archived/` 和 `{casesRoot}/transfer/` 目录存在（`mkdir -p`）
   - 根据 status 移动目录：
     ```bash
     # archived case
     mv "{casesRoot}/active/{caseNumber}" "{casesRoot}/archived/{caseNumber}"
     # transferred case
     mv "{casesRoot}/active/{caseNumber}" "{casesRoot}/transfer/{caseNumber}"
     ```
   - 记录日志到 `{patrolDir}/archive-log.jsonl`（append）：
     ```json
     {"timestamp":"ISO","caseNumber":"...","status":"archived|transferred","reason":"...","closureEmailEvidence":"...","from":"active/","to":"archived/|transfer/"}
     ```
   - 归档/转移的 case 从后续步骤 3 的待处理列表中**排除**，不再 spawn casework

4. **阶段 0：预热（并行执行，~15s）**

   写 phase 文件：
   ```bash
   echo "warming-up" > "{patrolDir}/patrol-phase"
   ```

   两个预热任务可并行执行：

   ```bash
   # IR/FDR/FWR 批量预填（~3s）
   pwsh -NoProfile -File skills/d365-case-ops/scripts/check-ir-status-batch.ps1 -SaveMeta -MetaDir {casesRoot}/active

   # DTM token 预热（~10s）
   pwsh -NoProfile -File skills/d365-case-ops/scripts/warm-dtm-token.ps1 -CasesRoot {casesRoot}
   ```

   **关键**：
   - `check-ir-status-batch.ps1` 不依赖 Playwright，可与 `warm-dtm-token.ps1` 并行
   - `warm-dtm-token.ps1` 使用 Playwright 导航 DTM 截获 token → 写入 `$env:TEMP/d365-case-ops-runtime/dtm-token-global.json`
   - 预热完成后，`download-attachments.ps1` 自动优先读取全局缓存，不再需要 Playwright 导航
   - 如果全局 token 缓存仍有效（<50 分钟），`warm-dtm-token.ps1` 会跳过 Playwright，几乎零耗时

5. **阶段 0.5：启动 Teams Search Queue（后台）**

   在预热完成后、casework 启动前，spawn 一个后台 agent 串行处理 Teams 搜索请求。
   这避免多个 casework agent 同时调用 Teams MCP 导致排队/超时。

   **⚠️ MCP 预检（主 agent 执行，不是 subagent）**：

   在 spawn queue agent 之前，主 agent 先调用一次 Teams MCP 验证可用性：
   ```
   SearchTeamMessagesQueryParameters(queryString="test", size=1)
   ```

   - **成功返回**（有 JSON 结果）→ Teams MCP 可用，继续 spawn queue agent
   - **返回错误**（`Connection closed` / `MCP error` / timeout）→ **跳过 Teams 搜索**：
     ```bash
     echo "TEAMS_MCP_UNAVAILABLE" > "{patrolDir}/teams-mcp-status"
     echo "⚠️ Teams MCP 不可用，跳过本次 Teams 搜索。请运行 /mcp 重启 Teams MCP server。"
     ```
     不 spawn queue agent，直接进入阶段 0.6。后续 casework-light 的 Teams request.json 不会被处理，
     patrol 结束时通过 orphan cleanup 清理。**在最终汇总中输出 Teams MCP 状态警告。**

   **预检通过后**，清理上次残留的信号文件：
   ```bash
   mkdir -p "{patrolDir}"
   rm -f "{patrolDir}/teams-queue-active" "{patrolDir}/teams-queue-stop" "{patrolDir}/teams-mcp-status"
   ```

   读取 `config.json` 中 `teamsSearchCacheHours`（默认 8）。

   ```
   Agent({
     subagent_type: "teams-search-queue",
     model: "haiku",
     prompt: "Serial Teams search queue for patrol. casesRoot={casesRoot}. teamsSearchCacheHours={cacheHours}. Read .claude/skills/teams-search-queue/SKILL.md and execute the full queue loop.",
     run_in_background: true
   })
   ```

   > 使用 `subagent_type: "teams-search-queue"` 加载 agent 定义（含 Teams MCP），`model: "haiku"` 覆盖模型。如果新 session 报 agent type not found，需重启 Claude Code 重新索引 `.claude/agents/`。

   记录 teams-queue agent 的 task ID，阶段 2 需要用来等待/清理。

   **启动 ICM Discussion Daemon（后台 node 进程）**：

   ICM discussion 抓取使用 playwright-core 直接控制 Edge（独立 profile，headless），不走 MCP。
   daemon 在 patrol 期间保持浏览器 session 开启，串行处理 ICM discussion 请求，避免重复 SSO。

   ```bash
   bash .claude/skills/icm-discussion/scripts/icm-discussion-warm.sh {casesRoot}
   ```

   输出 `ICM_DAEMON_READY|pid=xxx` 表示 daemon 已就绪。
   casework-light-runner.sh 在 ICM 需要刷新时自动写 request 到 `.patrol/icm-queue/`。

6. **阶段 0.6：写 phase 文件（processing）**

   ```bash
   echo "processing" > "{patrolDir}/patrol-phase"
   ```

7. **Streaming Pipeline：启动 casework-light + 统一轮询推进**

   **7a. 全量并行启动 casework-light**

   对每个待处理的 case spawn casework-light agent：

   ```
   Agent({
     subagent_type: "casework-light",
     prompt: "轻量 casework for Case {caseNumber}。
       caseDir: {casesRoot}/active/{caseNumber}/
       projectRoot: {projectRoot}
       casesRoot: {casesRoot}
       isAR: {isAR}
       mainCaseId: {mainCaseId}
       skipDataRefresh: false
       teamsSearchCacheHours: {cacheHours}
       请读取 .claude/agents/casework-light.md 获取完整执行步骤。",
     run_in_background: true
   })
   → 记录返回的 task_id 和 output_file_path
   ```

   - **一次性启动所有 Agent（全量并行）**—— 各 agent 写不同 case 目录，无资源竞争
   - 初始化每个 case 的状态追踪：`phase: "gathering"`

   **7b. 统一轮询循环（Streaming Pipeline 核心）**

   每个 case 维护独立的状态机，轮询循环每 **12 秒** 检查并推进所有 case：

   ```
   Case 状态机：
   gathering → plan-ready ─┬─ no-action ──────────────→ inspecting → done
                           └─ has-actions → executing → inspecting → done
   ```

   ```
   while (有未到达 done 的 case) {
     sleep 12s
     
     # 批量检查哪些 case 有新的 execution-plan.json
     Bash: for each case, check [ -f execution-plan.json ] && parse actions
     
     for each case:
       switch (case.phase):
       
         case "gathering":
           if execution-plan.json 存在:
             读取 plan，解析 actions
             if no-action:
               → case.phase = "inspecting"
               → 立即 spawn inspection-writer（后台）
             else:
               → case.phase = "executing"
               → 立即 spawn 无依赖的 action（troubleshooter/email-drafter）
         
         case "executing":
           检查已 spawn 的 action 是否完成：
           
           if troubleshooter spawned && claims.json 存在:
             # challenger gate
             读 claims.json：
             if triggerChallenge === true:
               → spawn challenger (前台等待)
               → 读结果 → if retry → re-spawn troubleshooter
             
             # 触发依赖的 email-drafter
             if email-drafter pending && dependsOn === "troubleshooter":
               → spawn email-drafter（后台）
           
           if 该 case 所有 action 都已完成:
             → case.phase = "inspecting"
             → 立即 spawn inspection-writer（后台）
         
         case "inspecting":
           检查 inspection agent 是否完成
           （判断方式：todo/ 目录下有本次 patrol 时间戳之后的文件）
           if 完成:
             → case.phase = "done"
     
     # 每轮 spawn 调用合并：同一轮内需要 spawn 的多个 agent 在一条消息中并行发出
     # 例如：Case A 需要 inspection + Case B 需要 email-drafter → 一次 spawn 两个
     
     输出进度表：
     ━━━ Patrol Progress [12:05:30] ━━━
       ✅ ...1969 — done (37s → no-action → inspection 15s)
       🔍 ...1137 — executing: email-drafter(closure) running (30s)
       📥 ...3153001 — gathering: data-refresh (120s)
       📋 ...1034 — inspecting (20s)
       ✅ ...1744 — done (66s → no-action → inspection 12s)
       📥 ...0748 — gathering: ICM query (180s)

       💬 Teams Queue — done=3 skip=2 pending=1

     📊 Done: 2/6 | Inspecting: 1 | Executing: 1 | Gathering: 2
   }
   ```

   **Spawn 规则**：
   - **inspection-writer 单独 spawn**：每个 case 独立一个 agent（并行，不串行批量）
   - **同一轮 spawn 合并**：如果一轮检查中多个 case 同时就绪，在一条消息中并行 spawn
   - troubleshooter/email-drafter/inspection 都是后台 spawn（`run_in_background: true`）
   - challenger 是前台等待（需要读结果决定下一步）

   **Inspection spawn 模板**：
   ```
   Agent({
     subagent_type: "casework",
     prompt: "仅执行 inspection-writer for Case {caseNumber}。caseDir: {caseDir}。
       请读取 .claude/skills/inspection-writer/SKILL.md 获取完整执行步骤。
       只做 inspection + todo 生成，不做其他步骤。",
     run_in_background: true
   })
   ```

   **循环退出条件**：
   - 所有 case 到达 `done` 状态
   - 或总时长超过 25 分钟（超时跳出，未完成 case 标记为 timeout）

8. **阶段 2.5：等待 Queue 排空 → 停止 Teams Queue**

   所有阶段 2 action 完成后，**先等待队列排空，再发停止信号**。

   > Teams queue 可能在阶段 1 就已处理完所有请求，但阶段 2.5 确保彻底清理。

   **排空检查循环**（最多等 5 分钟）：
   ```bash
   CASES_ROOT="{casesRoot}"
   MAX_WAIT=300  # 5 分钟（阶段 2 时大概率已排空）
   WAITED=0
   while [ $WAITED -lt $MAX_WAIT ]; do
     PENDING=$(find "$CASES_ROOT/active" -path "*/teams/request.json" -type f 2>/dev/null | wc -l)
     if [ "$PENDING" -eq 0 ]; then
       echo "QUEUE_DRAINED|all requests processed"
       break
     fi
     echo "QUEUE_DRAINING|pending=$PENDING|waited=${WAITED}s"
     sleep 15
     WAITED=$((WAITED + 15))
   done
   if [ $WAITED -ge $MAX_WAIT ]; then
     echo "QUEUE_DRAIN_TIMEOUT|pending=$PENDING|forcing stop"
   fi
   ```

   排空后（或超时后），发送停止信号：
   ```bash
   echo "$(date +%s)" > "{patrolDir}/teams-queue-stop"
   ```

   使用 `TaskOutput` 等待 teams-queue agent 退出（最多 5 分钟）。
   如果超时，跳过（queue agent 会自行退出）。

   清理信号文件：
   ```bash
   rm -f "{patrolDir}/teams-queue-active" "{patrolDir}/teams-queue-stop"
   ```

   **清理孤儿 request.json**（drain 超时时必须执行）：
   ```bash
   # Remove orphaned Teams request.json files that the queue never processed
   find "{casesRoot}/active" -path "*/teams/request.json" -type f -delete 2>/dev/null
   ORPHANS_CLEANED=$?
   echo "ORPHAN_CLEANUP|removed=$(find '{casesRoot}/active' -path '*/teams/request.json' -type f 2>/dev/null | wc -l) remaining"
   ```

   **停止 ICM Discussion Daemon**：
   ```bash
   echo "$(date +%s)" > "{patrolDir}/icm-queue-stop"
   ICM_PID=$(cat "{patrolDir}/icm-queue-pid" 2>/dev/null)
   if [ -n "$ICM_PID" ]; then
     for i in $(seq 1 30); do
       kill -0 $ICM_PID 2>/dev/null || break
       sleep 1
     done
   fi
   rm -f "{patrolDir}/icm-queue-active" "{patrolDir}/icm-queue-stop" "{patrolDir}/icm-queue-pid"
   ```

10. **汇总 Todo + 结构化输出**

   写阶段文件：
   ```bash
   echo "aggregating" > "{patrolDir}/patrol-phase"
   ```

   从各 case 的 `todo/` 目录提取最新 Todo 文件，按 🔴🟡✅ 分级汇总展示。

   从各 case 的 `logs/casework.log` 读取最后一行判断 status（`STEP B5 OK` / `STEP B6 OK` / `phase completed` → completed，否则 failed）。

   写结构化结果文件 `{patrolDir}/result.json`（兼容旧格式）和 `{patrolDir}/patrol-state.json`（WebUI 读取）：
   ```json
   {
     "startedAt": "ISO",
     "completedAt": "ISO",
     "source": "cli",
     "totalCases": 10,
     "changedCases": 5,
     "processedCases": 5,
     "phase": "completed",
     "caseResults": [
       { "caseNumber": "xxx", "status": "completed" }
     ]
   }
   ```
   **两个文件内容相同**，用 `cp` 复制即可。`patrol-state.json` 是 WebUI Dashboard 的唯一数据源。

   写最终阶段：
   ```bash
   echo "completed" > "{patrolDir}/patrol-phase"
   ```

   **🔒 释放互斥锁**：
   ```bash
   rm -f "{patrolDir}/patrol.lock"
   ```

   > ⚠️ 如果 patrol 中途异常退出，lock 文件不会被删除。WebUI 和下次 CLI 启动时会检测 stale lock（PID 不存在或 lock 超过 60 分钟）并自动清理。

## 注意
- patrol session 负责：列表获取 → 过滤 → 预热 → 启动 teams-queue → 全量并行 casework-light → **streaming pipeline 轮询**（plan ready → 立即 spawn action → action done → 立即 spawn inspection） → 停止 teams-queue → 读 todo 汇总 → 写结构化输出
- **Streaming Pipeline**：不等所有 casework-light 完成，每个 case 完成即推进下一步
- **Inspection 并行**：每个 case 独立 spawn inspection-writer，不串行批量
- **casework-light**（depth=1）执行信息收集 + 决策，不 spawn 任何 subagent
- patrol 主 agent（depth=0）根据 execution-plan.json 按需 spawn troubleshooter/challenger/email-drafter/inspection-writer（depth=1）
- 这种设计绕过 Claude Code subagent depth=1 的嵌套限制，同时最大化并行度
- patrol session **不读取** case-info.md、emails.md 等业务数据（由 casework-light 内联处理）

## 与 /casework 的关系
- `/casework {caseNumber}`（单 case 手动调用）→ 使用 `.claude/skills/casework/SKILL.md`，主 agent 内联执行（depth=0），**能 spawn troubleshooter/email-drafter**
- `/patrol`（批量巡检）→ 使用 `casework-light` agent（depth=1）做信息收集 + 决策，patrol 主 agent 做 spawn
- **两者完全独立，互不影响**。casework SKILL.md 无需任何修改

## 串行/并行边界总结
| 操作 | 执行位置 | 必须串行？ |
|------|---------|-----------|
| DTM token 获取 | 阶段 0 预热 | ❌ 全局缓存，各 case 直接读 |
| IR/FDR/FWR check | 阶段 0 预热 | ❌ 批量 API 一次完成 |
| data-refresh (D365 API) | casework-light 内联 | ❌ 各 case 并行 |
| onenote-search (ripgrep) | casework-light 内联 | ❌ 本地文件操作 |
| compliance-check | casework-light 内联 | ❌ 本地脚本 |
| status-judge | casework-light 内联 | ❌ LLM 分析 |
| Teams 搜索 (MCP 调用) | teams-search-queue | ✅ MCP 互斥 |
| Teams 后处理 (write-teams) | casework-light 内联 | ❌ 本地脚本 |
| troubleshooter (Kusto/docs) | streaming pipeline spawn | ❌ 各 case 并行 |
| challenger | streaming pipeline spawn | ❌ 前台等待 |
| email-drafter | streaming pipeline spawn | ❌ 各 case 并行 |
| inspection-writer | streaming pipeline spawn | ❌ **各 case 独立并行 spawn** |

## Phase 文件协议

Patrol 在各阶段写 `{patrolDir}/phase`（单行文本），供 WebUI Dashboard 监听：
- `discovering` → `filtering` → `warming-up` → `processing` → `aggregating` → `completed`

Patrol 结束写 `{patrolDir}/result.json`（结构化 JSON），包含 startedAt, completedAt, caseResults 等。
