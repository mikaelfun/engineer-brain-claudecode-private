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
                        └─ has-actions → executing → inspecting → done
```

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
   rm -f "{patrolDir}/patrol-progress.json"  # 清理上次残留
   echo "starting" > "{patrolDir}/patrol-phase"
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
   python3 -c "
import json, os, time
p = '{patrolDir}/patrol-progress.json'
d = {'phase':'discovering','startedAt':'$(date -u +%FT%TZ)','source':'$SOURCE','updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
tmp = p + '.tmp.' + str(os.getpid())
json.dump(d, open(tmp,'w'), indent=2)
os.replace(tmp, p)
"
   ```

3. **获取活跃 Case 列表**
   ```
   pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/list-active-cases.ps1 -OutputJson
   ```

3. **筛选需要处理的 Case**

   **`--force` 模式**：如果用户传入 `--force`（或明确表示要强制巡检），跳过 `lastInspected` 检查，所有活跃 case 全部纳入处理。

   **常规模式**：读取 `config.json` 中 `patrolSkipHours`（默认 3 小时）。对每个 case，读取 `{casesRoot}/active/{case-id}/casework-meta.json` 的 `lastInspected`。
   满足以下**任一条件**即纳入处理：
   - `lastInspected` 距当前时间超过 `patrolSkipHours` 小时
   - 无 `casework-meta.json` 或无 `lastInspected` 字段（新 case，首次巡检）

   > **设计说明**：不使用 D365 `modifiedon` 作为筛选条件，因为新邮件是独立 Email Activity，不一定更新 Case 实体的 `modifiedon`，会导致漏检。

   **2.5. 归档/转移检测（含 AR 级联）**

   获取 active case 列表后，扫描本地 `{casesRoot}/active/` 目录，找出不在 D365 active list 中的 case：

   ```bash
   pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/detect-case-status.ps1 -CasesRoot {casesRoot}
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

   **3.5. Early-exit（ISS-223：0 cases 快速退出）**

   如果筛选后待处理 case 数量为 0（全部被 patrolSkipHours 过滤 + 归档排除）：
   - 跳过 Step 4/5/6/7（预热 + 处理）
   - 直接写 patrol-state.json（processedCases=0）
   - 释放 lock，退出
   - 输出：`📊 Patrol: 0 cases to process (all within skipHours). Done.`

4. **阶段 0：预热（并行执行，~40s）**

   写 phase 文件：
   ```bash
   echo "warming-up" > "{patrolDir}/patrol-phase"
   python3 -c "
import json, os, time
p = '{patrolDir}/patrol-progress.json'
d = {'phase':'warming-up','startedAt':'$(date -u +%FT%TZ)','source':'$SOURCE','updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
tmp = p + '.tmp.' + str(os.getpid())
json.dump(d, open(tmp,'w'), indent=2)
os.replace(tmp, p)
"
   ```

   两个预热任务并行执行：

   ```bash
   # IR/FDR/FWR 批量预填（~3s，纯 OData，不依赖 token daemon）
   pwsh -NoProfile -File .claude/skills/d365-case-ops/scripts/check-ir-status-batch.ps1 -SaveMeta -MetaDir {casesRoot}/active

   # Token Daemon warmup（Teams + DTM + ICM 统一预热，~37s）
   # 检查各 token cache，过期则启动 headless Edge + SSO 刷新
   # 输出: WARMUP_OK|daemon=inline|teams=cached(47m)|dtm=refreshed(4200)|icm=cached(163m)
   node .claude/skills/browser-profiles/scripts/token-daemon.js warmup
   ```

   **关键**：
   - `check-ir-status-batch.ps1` 不是 token 预热，是 SLA 数据，独立保留
   - `token-daemon.js warmup` 统一管理 Teams/DTM/ICM 三个 token：
     - 共享一个 Edge 实例 + SSO session（只需登录一次）
     - 有效 cache 直接跳过（几乎零耗时）
     - 无效 cache 依次刷新（首次 ~37s，后续带 SSO session ~15s）
   - 两者完全并行，无资源冲突
   - Token cache 位置不变：`$TEMP/teams-ic3-token.json`、`$TEMP/d365-case-ops-runtime/dtm-token-global.json`、`$TEMP/icm-token-cache.json`
   - 各 case 的消费者脚本（`teams-search-inline.sh`、`download-attachments.ps1`、`icm-discussion-ab.js`）无需改动，直接读取相同 cache 文件

5. **阶段 0.5：写 phase 文件（processing）**

   ```bash
   echo "processing" > "{patrolDir}/patrol-phase"
   python3 -c "
import json, os, time
p = '{patrolDir}/patrol-progress.json'
d = {'phase':'processing','startedAt':'$(date -u +%FT%TZ)','source':'$SOURCE','totalCases':$TOTAL_CASES,'changedCases':$CHANGED_CASES,'caseList':$CASE_LIST_JSON,'updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
tmp = p + '.tmp.' + str(os.getpid())
json.dump(d, open(tmp,'w'), indent=2)
os.replace(tmp, p)
"
   ```

6. **Streaming Pipeline：启动 casework(mode=patrol) + 推进**

   **6a. 全量并行启动 casework(mode=patrol)**

   对每个待处理的 case spawn casework(mode=patrol) agent：

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

   **6a-2. Agent Output → casework.log（追加 agent 完整输出）**

   每当 casework/troubleshooter/email-drafter/summarize **任一后台 agent 完成**（收到 `<task-notification>`），**必须**将 agent output 追加到该 case 的 casework.log：

   ```
   1. 从 task-notification 获取 output_file_path（e.g. /tmp/claude/.../tasks/xxx.output）
   2. Read(output_file_path) 读取完整内容
   3. Bash 追加到 casework.log：
      LOG="{caseDir}/.casework/logs/casework.log"
      echo "" >> "$LOG"
      echo "========== AGENT: {agent_type} | $(date -Iseconds) ==========" >> "$LOG"
      # 用 python3 追加 Read 到的内容（避免 shell 转义问题）
      python3 -c "
      content = '''{read_content}'''
      open('$LOG', 'a').write(content + '\n')
      "
      echo "========== END AGENT ==========" >> "$LOG"
   ```

   > ⚠️ output file 是临时文件。**收到 notification 后立即读取**，不要延迟到汇总阶段。
   > agent_type 取值：`casework-patrol` / `troubleshooter` / `email-drafter` / `summarize` / `challenger`

   - **一次性启动所有 Agent（全量并行）**—— 各 agent 写不同 case 目录，无资源竞争
   - 初始化每个 case 的状态追踪：`phase: "gathering"`

   **6b. 轮询模式分流（source 决定）**

   根据 Step 1 写入的 lock 文件中 `source` 字段分流：

   - **`source=cli`**：主动轮询模式（下方 6c）。每 12 秒检查状态、输出进度表、按需推进。CLI 用户需要实时反馈。
   - **`source=webui`**：被动等待模式。WebUI 有自己的 Dashboard 实时轮询 events 文件，agent 不需要主动输出进度。
     - 全量并行 spawn 所有 casework(mode=patrol) 后，**直接等待所有后台 agent 返回**（不 sleep 轮询）
     - 每个 agent 返回时检查 execution-plan.json → 按需 spawn troubleshooter/email-drafter/summarize（同样后台等待）
     - 不调用 patrol-progress.py，不输出进度表
     - 其余逻辑（归档检测、cleanup、写 patrol-state.json）与 cli 模式相同

   **6c. 统一轮询循环（CLI 模式，Streaming Pipeline 核心）**

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
               # Mark skipped steps in state.json
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step assess --status completed --case-number "{caseNumber}"
               python3 .claude/skills/casework/scripts/update-state.py \
                 --case-dir "{casesRoot}/active/{caseNumber}" --step act --status skipped --case-number "{caseNumber}"
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
               → 立即 spawn summarize（后台）
             
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
           
           if 該 case 所有 action 都已完成:
             → case.phase = "inspecting"
             → 立即 spawn summarize（后台）
         
         case "inspecting":
           检查 inspection agent 是否完成
           （判断方式：todo/ 目录下有本次 patrol 时间戳之后的文件）
           if 完成:
             → case.phase = "done"
     
     # 每轮输出进度表（调用 patrol-progress.py 渲染）
     python3 .claude/skills/patrol/scripts/patrol-progress.py \
       --cases-root {casesRoot} \
       --cases "{comma_separated_case_numbers}" \
       --phases '{json_phases_dict}' \
       --patrol-start "{patrol_start_iso}"
     # phases dict: {"caseNumber": "gathering|executing|inspecting|done", ...}
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

7. **阶段 2.5：清理**

   V2 不需要 queue drain 或 daemon stop（各 case 的 data-refresh.sh 已自行清理 agency proxy）。

   清理 orphan agency 进程（ISS-222: 实际 kill 而非仅检测）：
   ```bash
   AGENCY_COUNT=$(tasklist 2>/dev/null | grep -c -i agency.exe || echo 0)
   if [ "$AGENCY_COUNT" -gt 0 ]; then
     echo "⚠️ $AGENCY_COUNT orphan agency process(es) — killing..."
     taskkill /IM agency.exe /F 2>/dev/null || true
     echo "✅ agency cleanup done"
   fi
   ```
   > patrol 完成后不应有活跃的 agency 需求。teams-search-inline.sh 的 per-case agency 应在脚本退出时自行清理；残留的是异常退出的遗留。

8. **汇总 Todo + 结构化输出**

   写阶段文件：
   ```bash
   echo "aggregating" > "{patrolDir}/patrol-phase"
   python3 -c "
import json, os, time
p = '{patrolDir}/patrol-progress.json'
d = {'phase':'aggregating','startedAt':'$(date -u +%FT%TZ)','source':'$SOURCE','updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
tmp = p + '.tmp.' + str(os.getpid())
json.dump(d, open(tmp,'w'), indent=2)
os.replace(tmp, p)
"
   ```

   从各 case 的 `todo/` 目录提取最新 Todo 文件，按 🔴🟡✅ 分级汇总展示。

   从各 case 的 `.casework/logs/casework.log` 读取最后一行判断 status（`STEP B5 OK` / `STEP B6 OK` / `phase completed` → completed，否则 failed）。

   写结构化结果文件 `{patrolDir}/patrol-state.json`：
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
   `patrol-state.json` 是唯一的结果文件（CLI 和 WebUI 共用）。

   写最终阶段：
   ```bash
   echo "completed" > "{patrolDir}/patrol-phase"
   python3 -c "
import json, os, time
p = '{patrolDir}/patrol-progress.json'
d = {'phase':'completed','startedAt':'$(date -u +%FT%TZ)','source':'$SOURCE','processedCases':$PROCESSED_CASES,'updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
tmp = p + '.tmp.' + str(os.getpid())
json.dump(d, open(tmp,'w'), indent=2)
os.replace(tmp, p)
"
   ```

   **🔒 释放互斥锁**：
   ```bash
   rm -f "{patrolDir}/patrol.lock"
   ```

   > ⚠️ 如果 patrol 中途异常退出，lock 文件不会被删除。WebUI 和下次 CLI 启动时会检测 stale lock（PID 不存在或 lock 超过 60 分钟）并自动清理。

## Phase 文件协议

`{patrolDir}/patrol-phase`（单行文本），供 WebUI Dashboard 监听：
`discovering` → `warming-up` → `processing` → `aggregating` → `completed`
