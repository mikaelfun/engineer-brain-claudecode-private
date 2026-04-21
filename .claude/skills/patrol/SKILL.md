---
name: patrol
displayName: 批量巡检
category: orchestrator
stability: stable
promptTemplate: |
  Execute patrol. Read .claude/skills/patrol/SKILL.md and follow all steps.
description: "批量巡检 v4：casework 自闭环简单路径 + troubleshooter 外部 spawn + phase2 闭环排查后流程。"
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

**casework agent 自闭环简单路径（A/B/C），patrol 不再管理 email/summarize/challenger/reassess。**
**patrol 主 agent 仅负责：spawn casework → 等待 → spawn troubleshooter → 等待 → spawn phase2 → 等待 → 进度展示。**

**Streaming Pipeline**：casework(mode=patrol) 完成一个就立即推进下一步。每个 case 独立状态机：
```
gathering ─┬─ casework 自闭环（summarize.status=completed）→ done
           └─ act.status=waiting-troubleshooter → troubleshooting ─┬─ phase2 完成 → done
                                                                    └─ needs-retroubleshoot → troubleshooting（重试）
```

## 执行步骤

1. **初始化（patrol-init.sh）**

   一个脚本完成所有预处理：配置读取、互斥检查、Case 列表获取、筛选、归档检测、预热。

   检测 prompt 中是否包含 `source=webui`，如果包含则 SOURCE 为 `webui`，否则为 `cli`。
   检测 prompt 中是否包含 `--force`，如果包含则加 `--force` 参数。
   检测 prompt 中是否包含 `--new` 或 `new-cases`，如果包含则加 `--mode new-cases` 参数（筛选本地不存在的新 case，跳过归档检测）。

   读取 `config.json` 获取 `casesRoot` 和 `patrolDir`：
   ```bash
   eval $(python3 -c "
   import json
   c = json.load(open('config.json', encoding='utf-8'))
   print(f\"CASES_ROOT={c.get('casesRoot', '../data/cases')}\")
   print(f\"PATROL_DIR={c.get('patrolDir', '../data/.patrol')}\")
   ")
   ```

   执行初始化脚本：
   ```bash
   INIT_JSON=$(bash .claude/skills/patrol/scripts/patrol-init.sh \
     --cases-root "$CASES_ROOT" --patrol-dir "$PATROL_DIR" \
     --source "$SOURCE" [--force] [--mode new-cases])
   ```

   解析输出 JSON：
   - `status=error` → 输出 `.error` 字段，终止
   - `status=early-exit` → 输出 `📊 Patrol: 0 cases to process (all within skipHours). Done.`，终止
   - `status=ok` → 提取字段继续：
     ```bash
     CASES=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(','.join(json.load(sys.stdin)['cases']))")
     TOTAL_FOUND=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['totalFound'])")
     CHANGED_CASES=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['changedCases'])")
     WARMUP_STATUS=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['warmupStatus'])")
     CASE_LIST_CSV="$CASES"
     TOTAL_CASES="$CHANGED_CASES"
     PATROL_START_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
     RUN_ID=$(echo "$INIT_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('runId',''))")
     ```

   **🚨 路径硬规则（反复出问题，必须严格遵守）**：
   - `casesRoot` 和 `patrolDir` 直接使用 config.json 原始值（相对路径）
   - **所有 Bash 命令、Agent spawn prompt、python3 -c 内部**都用这些相对路径
   - **绝对禁止**：`C:\Users\...`、`C:/Users/...`、`/c/Users/...` 任何形式的绝对路径
   - 违反此规则会导致：文件写到错误位置、`__teams-queue__` 幽灵目录、path 中反斜杠被当转义符

2. **Streaming Pipeline：spawn casework → troubleshooter → phase2（v4 三阶段）**

   **2a. 全量并行启动 casework(mode=patrol)**

   对每个待处理的 case spawn casework(mode=patrol) agent：

   **先写 start=active（SDK 冷启动计时起点，同时 --init 清除上次状态）**：
   ```bash
   # new-cases mode: 新 case 没有本地目录，先创建
   # if MODE == "new-cases": mkdir -p "{casesRoot}/active/{caseNumber}/.casework"
   python3 .claude/skills/casework/scripts/update-state.py \
     --case-dir "{casesRoot}/active/{caseNumber}" --init --run-type patrol --step start --status active \
     --case-number "{caseNumber}" --parent-run-id "$RUN_ID"
   ```

   **casework(patrol) spawn 模板**：
   ```
   Agent({
     prompt: "Patrol mode casework for Case {caseNumber}。
       caseDir: {casesRoot}/active/{caseNumber}/
       projectRoot: .
       casesRoot: {casesRoot}
       mode: patrol

       读取 .claude/skills/casework/SKILL.md，按 mode=patrol 流程执行。
       简单路径（无 troubleshooter）在 agent 内完成全部步骤后退出。
       排查路径（有 troubleshooter）在 IR email（如有）后标记 waiting-troubleshooter 退出。",
     run_in_background: true,
     model: "opus"
   })
   → 记录返回的 task_id 和 output_file_path
   ```

   **2a-2. Agent Output（ISS-231：自动保存到 runs/{runId}/agents/）**

   每当 casework/troubleshooter/casework-phase2 **任一后台 agent 完成**（收到 `<task-notification>`），Dashboard 的 patrol-orchestrator.ts 会自动将 output 保存到 `{caseDir}/.casework/runs/{runId}/agents/{agentType}.log`。
   **不需要** patrol agent 手动读取和追加 output。

   - **一次性启动所有 Agent（全量并行）**—— 各 agent 写不同 case 目录，无资源竞争
   - 初始化每个 case 的状态追踪：`phase: "gathering"`

   **2b. 轮询模式分流（source 决定）**

   根据 Step 1 写入的 lock 文件中 `source` 字段分流：

   - **`source=cli`**：主动轮询模式（下方 2c）。每 12 秒检查状态、输出进度表、按需推进。CLI 用户需要实时反馈。
   - **`source=webui`**：被动等待模式。WebUI 有自己的 Dashboard 实时轮询 events 文件，agent 不需要主动输出进度。
     - 全量并行 spawn 所有 casework(mode=patrol) 后，**直接等待所有后台 agent 返回**（不 sleep 轮询）
     - 每个 agent 返回时检查 state.json → 按需 spawn troubleshooter → phase2（同样后台等待）
     - 不调用 patrol-progress.py，不输出进度表
     - 其余逻辑（归档检测、cleanup、写 patrol-state.json）与 cli 模式相同

   **2c. 统一轮询循环（CLI 模式，v4 三阶段核心）**

   每个 case 只有 3 个阶段：`gathering` → `troubleshooting` → `done`。轮询循环每 **12 秒** 检查并推进：

   ```
   while (有未到达 done 的 case) {
     sleep 12s
     
     for each case:
       # 读 state.json 判断当前状态
       STATE_INFO=$(python3 -c "
       import json
       try:
         s = json.load(open('{casesRoot}/active/{caseNumber}/.casework/state.json', encoding='utf-8'))
         act = s.get('steps',{}).get('act',{})
         summ = s.get('steps',{}).get('summarize',{})
         print(f'{act.get(\"status\",\"\")},{summ.get(\"status\",\"\")}')
       except: print(',')
       ")
       ACT_STATUS=$(echo "$STATE_INFO" | cut -d, -f1)
       SUMM_STATUS=$(echo "$STATE_INFO" | cut -d, -f2)
       
       switch (case.phase):
       
         case "gathering":
           if SUMM_STATUS == "completed":
             # casework 自闭环完成（路径 A/B/C）
             → case.phase = "done"
           
           elif ACT_STATUS == "waiting-troubleshooter":
             # casework 退出，需要 troubleshooter
             → case.phase = "troubleshooting"
             → spawn troubleshooter [后台]
         
         case "troubleshooting":
           # 检查 troubleshooter agent 是否返回
           if troubleshooter task 已返回 && claims.json 存在:
             if phase2 未 spawn:
               → spawn casework-phase2 [后台]
               → case.sub_phase = "phase2-running"
           
           # 检查 phase2 是否完成
           if phase2 task 已返回:
             SUMM_STATUS_2 = 重新读 state.json → summarize.status
             if SUMM_STATUS_2 == "completed":
               → case.phase = "done"
             elif phase2 output 含 "needs-retroubleshoot":
               → 重新 spawn troubleshooter [后台]
               → case.sub_phase = "ts-retry"
     
     # 更新 patrol 级进度
     DONE_COUNT = count(case.phase == "done")
     python3 .claude/skills/patrol/scripts/patrol-progress.py \
       --cases-root {casesRoot} \
       --cases "{comma_separated_case_numbers}" \
       --phases '{json_phases_dict}' \
       --patrol-start "{patrol_start_iso}"
     # phases dict: {"caseNumber": "gathering|troubleshooting|done", ...}
     
     # WebUI 模式：每轮更新 patrol-progress.json（供 file-watcher → SSE 推送）
     # CLI 模式也写，确保 sidebar 实时更新 currentAction + processedCases
     python3 .claude/skills/patrol/scripts/update-phase.py \
       --patrol-dir "{patrolDir}" --phase processing \
       --total-cases $TOTAL_CASES --changed-cases $CHANGED_CASES \
       --processed-cases $DONE_COUNT --current-action "$CURRENT_ACTION"
   }
   ```

   **Spawn 规则（v4 简化）**：
   - **casework(patrol)**：第一轮全量并行，后台
   - **troubleshooter**：按需，后台（casework 标记 waiting-troubleshooter 后）
   - **casework-phase2**：troubleshooter 完成后，后台
   - 同一轮多个 case 就绪 → 一条消息并行 spawn
   - **不再 spawn**：email-drafter、summarize、challenger、reassess（全部由 casework/phase2 inline 处理）

   **troubleshooter spawn 模板**：
   ```
   Agent({
     prompt: "Case {caseNumber}，caseDir={casesRoot}/active/{caseNumber}/。
       读取 .claude/agents/troubleshooter.md 获取完整执行步骤，然后执行。",
     run_in_background: true,
     model: "opus"
   })
   ```

   **casework-phase2 spawn 模板**：
   ```
   Agent({
     prompt: "执行 phase2 for Case {caseNumber}。
       caseDir: {casesRoot}/active/{caseNumber}/
       projectRoot: .

       读取 .claude/skills/casework/phase2/SKILL.md 获取完整执行步骤。
       Inline 执行 challenger→reassess→[email]→summarize 全部步骤。",
     run_in_background: true,
     model: "opus"
   })
   ```

   **循环退出条件**：
   - 所有 case 到达 `done` 状态
   - 或总时长超过 25 分钟（超时跳出，未完成 case 标记为 timeout）

3. **收尾（patrol-finalize.sh）**

   一个脚本完成所有收尾：orphan 进程清理、结果聚合、patrol-state.json 写入、lock 释放。

   ```bash
   FINAL_JSON=$(bash .claude/skills/patrol/scripts/patrol-finalize.sh \
     --cases-root "$CASES_ROOT" --patrol-dir "$PATROL_DIR" \
     --cases "$CASE_LIST_CSV" --source "$SOURCE" \
     --started-at "$PATROL_START_ISO")
   ```

   收尾完成后，从各 case 的 `todo/` 目录提取最新 Todo 文件，按 🔴🟡✅ 分级汇总展示给用户。

   > ⚠️ 如果 patrol 中途异常退出，lock 文件不会被删除。WebUI 和下次 CLI 启动时会检测 stale lock（PID 不存在或 lock 超过 60 分钟）并自动清理。

## Phase 文件协议

`{patrolDir}/patrol-phase`（单行文本），供 WebUI Dashboard 监听：
`discovering` → `warming-up` → `processing` → `aggregating` → `completed`
