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

**Streaming Pipeline**：casework(mode=patrol) 完成一个就立即推进下一步，不等所有 case 完成。每个 case 独立状态机：
```
gathering → plan-ready ─┬─ no-action → inspecting → done
                        └─ has-actions → executing ─┬─ (no deferred) → inspecting → done
                                                    └─ (has deferred) → investigating → reassessing → inspecting → done
```

## 执行步骤

1. **初始化（patrol-init.sh）**

   一个脚本完成所有预处理：配置读取、互斥检查、Case 列表获取、筛选、归档检测、预热。

   检测 prompt 中是否包含 `source=webui`，如果包含则 SOURCE 为 `webui`，否则为 `cli`。
   检测 prompt 中是否包含 `--force`，如果包含则加 `--force` 参数。

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
     --source "$SOURCE" [--force])
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

2. **Streaming Pipeline：启动 casework(mode=patrol) + 推进**

   **2a. 全量并行启动 casework(mode=patrol)**

   对每个待处理的 case spawn casework(mode=patrol) agent：

   **先写 start=active（SDK 冷启动计时起点，同时 --init 清除上次状态）**：
   ```bash
   python3 .claude/skills/casework/scripts/update-state.py \
     --case-dir "{casesRoot}/active/{caseNumber}" --init --run-type patrol --step start --status active \
     --case-number "{caseNumber}" --parent-run-id "$RUN_ID"
   ```

   ```
   Agent({
     subagent_type: "casework",
     prompt: "Patrol mode casework for Case {caseNumber}。
       caseDir: {casesRoot}/active/{caseNumber}/
       projectRoot: .
       casesRoot: {casesRoot}
       mode: patrol

       执行 Step 1 + Step 2：
       1. 读取 .claude/skills/casework/data-refresh/SKILL.md，执行 data-refresh（bash .claude/skills/casework/scripts/data-refresh.sh）
       2. 读取 .claude/skills/casework/assess/SKILL.md，执行 assess 流程
       3. 产出 .casework/execution-plan.json 后退出

       ⚠️ patrol mode：不执行 Step 3 (act) 和 Step 4 (summarize)，由 patrol 主 agent 处理。",
     run_in_background: true
   })
   → 记录返回的 task_id 和 output_file_path
   ```

   **2a-2. Agent Output（ISS-231：自动保存到 runs/{runId}/agents/）**

   每当 casework/troubleshooter/email-drafter/summarize **任一后台 agent 完成**（收到 `<task-notification>`），Dashboard 的 patrol-orchestrator.ts 会自动将 output 保存到 `{caseDir}/.casework/runs/{runId}/agents/{agentType}.log`。
   **不需要** patrol agent 手动读取和追加 output。

   - **一次性启动所有 Agent（全量并行）**—— 各 agent 写不同 case 目录，无资源竞争
   - 初始化每个 case 的状态追踪：`phase: "gathering"`

   **2b. 轮询模式分流（source 决定）**

   根据 Step 1 写入的 lock 文件中 `source` 字段分流：

   - **`source=cli`**：主动轮询模式（下方 6c）。每 12 秒检查状态、输出进度表、按需推进。CLI 用户需要实时反馈。
   - **`source=webui`**：被动等待模式。WebUI 有自己的 Dashboard 实时轮询 events 文件，agent 不需要主动输出进度。
     - 全量并行 spawn 所有 casework(mode=patrol) 后，**直接等待所有后台 agent 返回**（不 sleep 轮询）
     - 每个 agent 返回时检查 execution-plan.json → 按需 spawn troubleshooter/email-drafter/summarize（同样后台等待）
     - 不调用 patrol-progress.py，不输出进度表
     - 其余逻辑（归档检测、cleanup、写 patrol-state.json）与 cli 模式相同

   **2c. 统一轮询循环（CLI 模式，Streaming Pipeline 核心）**

   每个 case 维护独立的状态机（见核心原则），轮询循环每 **12 秒** 检查并推进所有 case：

   ```
   while (有未到达 done 的 case) {
     sleep 12s
     
     # 批量检查哪些 case 有新的 .casework/execution-plan.json
     Bash: for each case, check [ -f .casework/execution-plan.json ] && parse actions
     
     for each case:
       switch (case.phase):
       
         case "gathering":
           if .casework/execution-plan.json 存在:
             eval $(bash .claude/skills/casework/act/scripts/read-plan.sh \
               "{casesRoot}/active/{caseNumber}/.casework/execution-plan.json")
             # 读 deltaStatus
             DELTA=$(python3 -c "import json; print(json.load(open('{casesRoot}/active/{caseNumber}/.casework/data-refresh-output.json')).get('deltaStatus','DELTA_OK'))" 2>/dev/null || echo "DELTA_OK")
             
             if ACTION_COUNT == 0 && DELTA == "DELTA_EMPTY":
               # ⚡ 快速路径：无新数据 + 无 action → 主 agent 直接脚本完成，不 spawn summarize agent
               # 省去 ~70s agent 冷启动
               # Step 1: Mark intermediate UI states BEFORE doing work (act skipped, summarize active)
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step act --status skipped --case-number "{caseNumber}"
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step summarize --status active --case-number "{caseNumber}"
               # Step 2: Do the actual inline summarize work
               bash .claude/skills/casework/scripts/generate-todo.sh "{casesRoot}/active/{caseNumber}"
               python3 -c "
               import json, time
               p = '{casesRoot}/active/{caseNumber}/casework-meta.json'
               try: m = json.load(open(p, encoding='utf-8'))
               except: m = {}
               m['lastInspected'] = time.strftime('%Y-%m-%dT%H:%M:%S+08:00', time.localtime())
               m['lastAssessedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
               json.dump(m, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
               "
               # Step 3: Mark summarize completed AFTER work is done
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step summarize --status completed \
                 --case-number "{caseNumber}"
               → case.phase = "done"  # 直接完成，不经过 inspecting
             
             elif ACTION_COUNT == 0:
               # DELTA_OK 但无 action（如 unsent draft exists）→ 仍需 spawn summarize（可能要更新 summary）
               # Mark skipped steps in state.json
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step assess --status completed --case-number "{caseNumber}"
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step act --status skipped --case-number "{caseNumber}"
               → case.phase = "inspecting"
               # Mark summarize active for UI
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step summarize --status active --case-number "{caseNumber}"
               → 立即 spawn summarize（后台）
             
             else:
               → case.phase = "executing"
               # Update state.json for UI: assess done, act starts
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step assess --status completed --case-number "{caseNumber}"
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step act --status active --case-number "{caseNumber}"
               → 立即 spawn 无依赖的 action（troubleshooter/email-drafter）
         
         case "executing":
           检查已 spawn 的 action 是否完成：
           
           if troubleshooter spawned && claims.json 存在:
             # challenger gate
             读 claims.json：
             if triggerChallenge === true:
               → spawn challenger (前台等待)
               → 读结果 → if retry → re-spawn troubleshooter
             
             # Check if execution-plan has deferredActions (reassess path)
             eval $(bash .claude/skills/casework/act/scripts/read-plan.sh \
               "{casesRoot}/active/{caseNumber}/.casework/execution-plan.json")
             if HAS_DEFERRED == "true":
               → case.phase = "investigating"
               CURRENT_ACTION="{caseNumber} troubleshooter done → launching reassess"
               → spawn reassess agent（后台）:
                 Agent({
                   subagent_type: "casework",
                   prompt: "执行 reassess for Case {caseNumber}。caseDir: {casesRoot}/active/{caseNumber}/。
                     请读取 .claude/skills/casework/reassess/SKILL.md 获取完整执行步骤。",
                   run_in_background: true,
                   model: "opus"
                 })
             else:
               # 原有逻辑：直接触发 email-drafter
               if email-drafter pending && dependsOn === "troubleshooter":
                 → spawn email-drafter（后台）
           
           if 該 case 所有 action 都已完成 && case.phase still "executing":
             → case.phase = "inspecting"
             # Update state.json for UI: act done, summarize starts
             python3 .claude/skills/casework/scripts/update-state.py \
               --case-dir "{casesRoot}/active/{caseNumber}" --step act --status completed --case-number "{caseNumber}"
             python3 .claude/skills/casework/scripts/update-state.py \
               --case-dir "{casesRoot}/active/{caseNumber}" --step summarize --status active --case-number "{caseNumber}"
             → 立即 spawn summarize（后台）
         
         case "investigating":
           # Troubleshooter done, reassess running
           # 检查 execution-plan.json 是否有 phase=="reassess" 的 plan entry
           ep = "{casesRoot}/active/{caseNumber}/.casework/execution-plan.json"
           HAS_REASSESS = python3 -c "
             import json
             try:
               p = json.load(open('$ep', encoding='utf-8'))
               plans = p.get('plans', [])
               has = any(x.get('phase') == 'reassess' for x in plans)
               print('true' if has else 'false')
             except: print('false')
           "
           if HAS_REASSESS == "true":
             # Reassess complete — read its actions
             eval $(bash .claude/skills/casework/act/scripts/read-plan.sh "$ep")
             # read-plan.sh with phase=reassess context gives reassess plan's actions
             reassess_plan = python3 -c "
               import json
               p = json.load(open('$ep', encoding='utf-8'))
               plans = p.get('plans', [])
               rp = next((x for x in plans if x.get('phase') == 'reassess'), {})
               conclusion = rp.get('conclusion', {})
               actions = rp.get('actions', [])
               has_email = any(a.get('type') == 'email-drafter' for a in actions)
               print(f\"{conclusion.get('type','?')}|{conclusion.get('suggestedNextAction','?')}|{has_email}\")
             "
             
             # Backfill reassess action result in state.json
             bash .claude/skills/casework/scripts/finalize-state.sh \
               "{casesRoot}/active/{caseNumber}" act
             
             if reassess has email-drafter action:
               → case.phase = "reassessing"
               CURRENT_ACTION="{caseNumber} reassess: {type} → launching email({emailType})"
               → spawn email-drafter with reassess-derived emailType（后台）
             else:
               CURRENT_ACTION="{caseNumber} reassess: {type} → no email → summarizing"
               → case.phase = "inspecting"
               → spawn summarize（后台）
         
         case "reassessing":
           # Post-reassess email-drafter running
           # 检查 email-drafter 是否完成（drafts/ 目录有新文件）
           if email-drafter 完成:
             → case.phase = "communicating"  # brief transition state
             CURRENT_ACTION="{caseNumber} email draft ready → summarizing"
             # Backfill email-drafter result
             bash .claude/skills/casework/scripts/finalize-state.sh \
               "{casesRoot}/active/{caseNumber}" act
             → case.phase = "inspecting"
             # Mark summarize active for UI
             python3 .claude/skills/casework/scripts/update-state.py \
               --case-dir "{casesRoot}/active/{caseNumber}" --step summarize --status active --case-number "{caseNumber}"
             → spawn summarize（后台）
         
         case "inspecting":
           检查 inspection agent 是否完成
           （判断方式：todo/ 目录下有本次 patrol 时间戳之后的文件）
           if 完成:
             # Mark summarize completed for UI
             python3 .claude/skills/casework/scripts/update-state.py \
               --case-dir "{casesRoot}/active/{caseNumber}" --step summarize --status completed --case-number "{caseNumber}"
             → case.phase = "done"
     
     # 每轮输出进度表（调用 patrol-progress.py 渲染）
     python3 .claude/skills/patrol/scripts/patrol-progress.py \
       --cases-root {casesRoot} \
       --cases "{comma_separated_case_numbers}" \
       --phases '{json_phases_dict}' \
       --patrol-start "{patrol_start_iso}"
     # phases dict: {"caseNumber": "gathering|executing|investigating|reassessing|inspecting|done", ...}
     
     # WebUI 模式：每轮更新 patrol-progress.json（供 file-watcher → SSE 推送）
     # CLI 模式也写，确保 sidebar 实时更新 currentAction + processedCases
     DONE_COUNT=$(echo '{json_phases_dict}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(sum(1 for v in d.values() if v=='done'))")
     python3 .claude/skills/patrol/scripts/update-phase.py \
       --patrol-dir "{patrolDir}" --phase processing \
       --total-cases $TOTAL_CASES --changed-cases $CHANGED_CASES \
       --processed-cases $DONE_COUNT --current-action "$CURRENT_ACTION"
     # 每轮 spawn 调用合并：同一轮内需要 spawn 的多个 agent 在一条消息中并行发出
   }
   ```

   **Spawn 规则**：
   - **summarize 单独 spawn**：每个 case 独立一个 agent（并行，不串行批量）
   - **同一轮 spawn 合并**：如果一轮检查中多个 case 同时就绪，在一条消息中并行 spawn
   - troubleshooter/email-drafter/summarize 都是后台 spawn（`run_in_background: true`）
   - challenger 是前台等待（需要读结果决定下一步）

   **Summarize spawn 模板**（替代旧 inspection-writer）：
   ```
   Agent({
     subagent_type: "casework",
     prompt: "仅执行 summarize for Case {caseNumber}。caseDir: {casesRoot}/active/{caseNumber}/。
       请读取 .claude/skills/casework/summarize/SKILL.md 获取完整执行步骤。
       只做 summary + todo 生成 + meta 更新，不做其他步骤。",
     run_in_background: true
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
