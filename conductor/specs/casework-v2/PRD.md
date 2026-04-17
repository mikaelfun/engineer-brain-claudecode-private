# PRD: Casework V2 — 四步架构重构

## 1. Executive Summary

### Problem
当前 casework 架构存在严重的结构性复杂度：
- `casework/SKILL.md` 602 行，`patrol/SKILL.md` 482 行
- 8+ 条执行路径（CHANGED/NO_CHANGE × AR/非AR × QUEUE/DIRECT × full/light）
- AR 逻辑散布在每个步骤中（6+ 处）
- casework-light 和 casework(full) 大量逻辑重复
- Timing/Agent Probe/缓存逻辑占 ~30% 的 SKILL.md 行数
- 独立的 data-refresh/compliance-check/status-judge/inspection-writer skills 增加维护负担
- Changegate 检测不全（只看 D365 计数器变化，漏掉 Teams/ICM Discussion/OneNote）且各数据源脚本自身已有增量能力
- Teams search 串行效率低 + 8h TTL 缓存是 MCP 时代的遗留
- ICM Discussion 获取依赖 daemon + queue 机制过于复杂

### Solution
将 casework 重构为**四步统一模型**：

```
Step 1: Data Refresh — 纯脚本全并行数据收集（每个源自带增量，无 changegate）
Step 2: Assess       — LLM 判断状态 + 决定行动（基于 delta summary）
Step 3: Act          — 按需 spawn agent（troubleshooter/email-drafter）
Step 4: Summarize    — LLM 写 summary + 脚本生成 todo
```

### Key Design Constraint
Claude Code CLI 的 subagent 不能嵌套（depth=1 限制）。Patrol spawn casework 后，casework 不能再 spawn subagent。因此：
- Step 1 的所有数据收集必须**全脚本化**（后台 Bash 并行）
- Patrol 模式下 Step 3 的 agent spawn 由 patrol 主 session 执行

### Objectives
1. SKILL.md 总行数减少 50%+（casework < 200 行）
2. 统一 casework/casework-light 为一个模型（mode 参数控制深度）
3. AR 逻辑独立为 `casework-ar/SKILL.md`
4. 每个 step 的 skill 变为 casework 的 subskill（不再独立存在）
5. 消除 changegate/fast-path/Agent Probe/timing 样板代码
6. Teams 搜索并行化（多 agency HTTP proxy 并行）
7. ICM Discussion 内联增量获取（取消 daemon + queue）

---

## 2. Architecture

### 2.1 四步模型

```
┌──────────────────────────────────────────────────────────┐
│                    casework/SKILL.md                      │
│                                                          │
│  Step 1: DATA REFRESH (data-refresh.sh)                  │
│  ├── D365 data    (fetch-all-data.ps1)           ─┐     │
│  ├── Labor        (view-labor.ps1)                │     │
│  ├── Teams        (teams-search-inline.sh)         │ bg  │
│  ├── OneNote      (onenote-search-inline.py)      │     │
│  ├── ICM          (icm-discussion-ab.js)           │     │
│  ├── Attachments  (download-attachments.ps1)      ─┘     │
│  └── Delta        (extract-delta.sh)                     │
│      OUTPUT: data-refresh-output.json                    │
│                                                          │
│  Step 2: ASSESS (LLM inline)                             │
│  ├── 读取 data-refresh-output.json 中的 delta + context  │
│  ├── Compliance gate（首次 LLM 推理，永久缓存）          │
│  ├── 判断 actualStatus + daysSinceLastContact            │
│  ├── 确定 recommendedActions                             │
│  └── OUTPUT: 更新 meta.json + execution-plan.json        │
│                                                          │
│  Step 3: ACT (按需 spawn agent)                          │
│  ├── troubleshooter (spawn, 后台)                        │
│  ├── email-drafter  (spawn, 前台)                        │
│  └── challenger     (手动触发 /challenge，不在自动流程中) │
│                                                          │
│  Step 4: SUMMARIZE (LLM + script)                        │
│  ├── case-summary.md 增量更新 (LLM)                      │
│  ├── generate-todo.sh (脚本)                             │
│  └── timing + meta update                                │
└──────────────────────────────────────────────────────────┘
```

### 2.2 取消 Changegate，Delta 下沉到数据源

**设计原则**：不再在外层做"是否有变化"的预判断。每个数据源脚本自带增量机制，直接跑就行。

**各数据源增量机制**：

| 数据源 | 增量机制 | 无更新时成本 |
|--------|---------|-------------|
| **D365 Emails** | `createdon ge lastFetch` 服务端过滤 + id 去重 | ~2-3s（API 返回 0 条新邮件） |
| **D365 Snapshot** | `CacheMinutes=10` 文件时间跳过 | ~0s（文件新鲜直接跳过） |
| **D365 Notes** | 全量拉取（量小） | ~2s |
| **Labor** | 全量拉取（量小） | ~2s |
| **Teams** | 每次都搜，可加 `sent>={lastFetchedAt}` 时间过滤减少结果 | ~5-10s |
| **OneNote** | 源文件 mtime vs 本地 mtime 比较 | ~0s（无更新跳过） |
| **ICM Discussion** | 对比本地最后一条 entry 日期 vs API 返回 | ~3-5s（无更新快速跳过） |
| **Attachments** | 本地已有同名文件跳过 | ~1s |

**数据源失败降级策略**：

数据源按重要性分三级，失败时采取不同策略：

| 级别 | 数据源 | 失败处理 | 理由 |
|------|--------|---------|------|
| **L1 必须** | D365 Snapshot, D365 Emails | **abort**——整个 Step 1 标记失败，不进 Step 2 | 没有 case-info 和邮件无法判断状态 |
| **L2 重要** | Teams, ICM Discussion | **degrade**——标记 degraded，Step 2 正常推理但在 context 中注明数据不完整 | 有价值但非必须，缺失不影响基本判断 |
| **L3 可选** | OneNote, Labor, Attachments, D365 Notes | **skip**——标记 skipped，Step 2 正常推理 | 辅助信息，缺失无影响 |

**data-refresh-output.json 中的表达**：

```json
{
  "refreshResults": {
    "d365":        { "status": "OK" },
    "teams":       { "status": "OK" },
    "icm":         { "status": "FAILED", "error": "SSO timeout after 15s" },
    "onenote":     { "status": "SKIP", "reason": "mtime unchanged" },
    "labor":       { "status": "OK" },
    "attachments": { "status": "OK" }
  },
  "overallStatus": "DEGRADED",
  "degradedSources": ["icm"],
  "failedSources": []
}
```

- `overallStatus`：`OK`（全部成功）/ `DEGRADED`（L2 失败但可继续）/ `FAILED`（L1 失败，中止）
- L1 失败 → `data-refresh.sh` 直接 exit 1，不生成 data-refresh-output.json
- L2/L3 失败 → 正常生成 output，Step 2 在推理 prompt 中包含 `⚠️ ICM Discussion 获取失败（SSO timeout），本次判断不含 ICM 数据`

**不做自动重试**——重试增加复杂度且延长总耗时。ICM SSO 超时通常是 token 过期，下次 patrol 自动恢复。

**Delta 分布式内联报告**：每个数据源脚本在执行时直接报告自己的 delta（而不是事后用独立脚本提取）：

| 数据源 | Delta 报告方式 |
|--------|---------------|
| **fetch-emails.ps1** | 增量拉取时已知新邮件数和内容，直接输出 `{"newEmails": 3, "content": "..."}` |
| **fetch-notes.ps1** | 同上，输出新增 notes |
| **teams-search-inline.sh** | 对比 `_chat-index.json` 的 `lastMessageTime`，输出有新消息的 chat 和内容 |
| **icm-discussion-ab.js** | 增量对比后输出新 entry 内容 |
| **onenote-search-inline.py** | mtime 变化时输出新增/变化内容 |
| **fetch-case-snapshot.ps1** | 覆盖前 diff 关键字段（status/severity/owner），输出变化 |
| **download-attachments.ps1** | 输出 downloaded vs skipped 文件列表 |

`data-refresh.sh` 收尾时只需**汇总**各源 delta 报告到 `data-refresh-output.json`，不做提取。

**取消 `extract-delta.sh`**——其职责已分解到各数据源脚本中。

**DELTA_EMPTY 判定**：所有源都报告无变化 → Step 2 跳过 LLM 推理，直接写 execution-plan.json：`actions: [], noActionReason: "DELTA_EMPTY"`。**不复用上次的 actions**——无新数据意味着无新行动，避免重复 spawn 已执行过的 troubleshooter/email-drafter。`actualStatus` 和 `daysSinceLastContact` 从 casework-meta.json 复用（状态不变无需重新判断）。

**取消的组件**：
- ❌ `check-case-changes.ps1`（changegate）
- ❌ `casework-fast-path.sh`（fast-path 4 层缓存检查）
- ❌ `agent-cache-check.sh`（Teams/OneNote spawn 决策）

### 2.3 Teams 搜索优化

**取消 8h TTL 缓存 + queue 机制**。利用已有的 `_chat-index.json`（chatId 缓存）实现真正增量：

**缓存结构**（已有）：`{caseDir}/teams/_chat-index.json`
```json
{
  "_lastFetchedAt": "2026-04-16T12:15:22Z",
  "19:xxx@unq.gbl.spaces": {
    "fileName": "chuck-zhang.md",
    "displayName": "Chuck Zhang",
    "lastMessageTime": "2026-04-02T08:55:19Z",
    "totalMessages": 20,
    "lastFetchedAt": "2026-04-16T12:15:22Z"
  }
}
```

**架构：每 case 1 个 proxy + 并行请求（已验证）**

实测结论（2026-04-16 基准测试）：
- 单个 Teams agency proxy **支持并发 ListChatMessages 请求**——1 proxy 并行 = N proxy 并行（均 ~7.5s/8 chats）
- 瓶颈是之前的 python for 循环串行调 curl（22.6s），改 ThreadPoolExecutor 后降至 7.5s（**3x 提速**）
- 多 proxy per case **无额外收益**，只增加启动开销（每个 agency.exe ~5s）
- ⚠️ 跨 case 共享单 proxy 会丢数据（Search 并发冲突），必须每 case 独立 proxy

**执行逻辑**：

```
teams-search-inline.sh (每 case 1 个 agency proxy):

  Phase 1: 全并行（KQL 搜索 + cached chatId 拉消息同时进行，ThreadPoolExecutor）
    ├── thread: KQL("{caseNumber}")                   ─┐
    ├── thread: KQL("from:{contactEmail}")              │
    ├── thread: KQL("{icmId}")  (如有 ICM)              │
    ├── thread: ListChatMessages(cachedChat_1)         │ 全部并行
    ├── thread: ListChatMessages(cachedChat_2)         │ 通过同一个 proxy
    └── ...（cached chatIds 从 _chat-index.json）     ─┘
    wait all → 合并 KQL 结果，识别新 chatId

  Phase 2: 增量拉取（仅全新 chatId，ThreadPoolExecutor 并行）
    新 chatId = KQL 搜索结果 - _chat-index.json 已有
    如果无新 chatId → 跳过 Phase 2
    ├── thread: ListChatMessages(newChat_1)            ─┐
    └── thread: ListChatMessages(newChat_2)             │ 并行
    wait all

  Cleanup: kill agency → 合并结果 → 更新 _chat-index.json → dump _mcp-raw.json
```

**端口分配**：`9900 + hash(case_number) % 100`。每 case 独立 proxy，跨 case 共享会导致 Search 并发丢数据。端口冲突时（两个 case hash 到同一端口），后启动的检测端口占用 → 自动重试下一个可用端口。

**增量判断**：Phase 2 拉取 cached chatId 消息后，对比 `lastMessageTime`——如果最新消息时间没变，该 chat 无新内容，后处理时跳过重写。

**首次运行**（无 `_chat-index.json`）：Phase 1 搜索发现所有 chatId，Phase 2 全部拉取。

### 2.4 ICM 内联增量

**取消 daemon + queue 机制**，改为内联 REST API 调用。

**已实现脚本**：`icm-discussion-ab.js`，一行调用即可：
```bash
OUTPUT=$(node .claude/skills/icm-discussion/scripts/icm-discussion-ab.js \
  --single "$ICM_ID" --case-dir "$CASE_DIR" 2>&1)
# 输出: ICM_OK|{incidentId}|entries=N|Xs|source=agent-browser
#       ICM_FAIL|{incidentId}|reason
```

**工作原理**：
1. **Token 三级 fallback**：
   - L1: 缓存 token（`$TEMP/icm-ab-token-cache.json`，170 分钟有效）→ 验证 → 直接用
   - L2: agent-browser (Edge headless, session=icm-discussion) → CDP 拦截 → 提取新 token
   - L3: Playwright daemon `--token-only`（最终回落）
2. **并行调两个 REST API**（`getdescriptionentries` + `GetIncidentDetails`）—— 纯 HTTPS 请求，不走浏览器
3. **写入 `{caseDir}/icm/_icm-portal-raw.json`**

**并行安全**：token 缓存文件共享（第一个 case 获取后其他 case 直接复用），API 调用无状态，多 case 并行完全安全。无 Playwright profile 锁冲突问题。

**预热**（patrol 阶段 0，可选）：
```bash
node .claude/skills/icm-discussion/scripts/icm-discussion-ab.js --token-only
# → TOKEN_OK|{length}
```
预热后 170 分钟内所有 case 的 ICM 调用直接走缓存 token，零 SSO 开销。

### 2.5 Compliance 定位

**Compliance 不是数据源，是判断层**，从 Step 1 移出：
- 基于 case-info.md 的 Entitlement/SAP 字段做规则匹配
- 结果缓存到 `casework-meta.json`，附带源字段 hash 用于自动失效
- 放在 Step 2 (Assess) 中作为 gate：`compliance.entitlementOk === false` → 阻断

**缓存失效机制**：Entitlement/SAP 可能随客户续约/升级变化，不能真正"永久"缓存。以源字段 hash 作为缓存 key：
```json
// casework-meta.json 中的 compliance 字段
{
  "compliance": {
    "entitlementOk": true,
    "sapPath": "...",
    "details": "...",
    "sourceHash": "a3f8c2...",   // sha256(entitlement + sapCode + supportPlan) 的前 8 位
    "checkedAt": "2026-04-17T09:00:00Z"
  }
}
```

Step 2 Assess 的 compliance gate 逻辑：
1. 读 `casework-meta.json.compliance.sourceHash`
2. 从当前 `case-info.md` 提取 Entitlement/SAP 字段，计算 hash
3. **hash 匹配** → 复用缓存结果，零 LLM 调用
4. **hash 不匹配**（字段变化）→ 重新推理，更新缓存

Step 1 不做任何 compliance 相关工作。

### 2.6 Patrol 集成：事件驱动流水线

**核心模型**：patrol 不分波次，每个 case 独立推进——完成一步立即进入下一步，跨 case 完全并行。

```
时间轴 →

Case A: ▓▓Step1+2▓▓──→▓▓troubleshooter▓▓──→▓▓email-drafter▓▓──→▓▓summarize▓▓──→ ✅
Case B:   ▓▓Step1+2▓▓──→(no action)──→▓▓summarize▓▓──→ ✅
Case C:     ▓▓Step1+2▓▓──→▓▓troubleshooter▓▓──→▓▓summarize▓▓──→ ✅

^全部同时启动         ^各自独立推进，互不等待
```

#### Phase 0: 预热

并行预热两个 token（共 ~10s）：
```bash
# ICM token (170 min cache)
node .claude/skills/icm-discussion/scripts/icm-discussion-ab.js --token-only

# DTM token
pwsh -NoProfile -File skills/d365-case-ops/scripts/warm-dtm-token.ps1
```

#### Phase 1→4: 流水线推进

1. **全并行启动**：所有 active case 同时 spawn casework(mode=patrol, background=true)
2. **完成即推进**：某 case 的 Step 1+2 完成 → patrol 立即读 execution-plan.json → spawn 下一个 agent
3. **跨 case 并行**：不同 case 的 Step 3 agent 可同时运行
4. **逐 case 闭环**：某 case 的 Step 3 全部完成 → 立即 spawn summarize(Step 4)

#### 编排伪代码

```python
# Phase 0
preheat_icm_token()   # bg
preheat_dtm_token()   # bg
wait_all()

# Phase 1: 全并行启动 Step 1+2
cases = get_active_cases()
for case in cases:
    spawn casework(mode=patrol, case=case, background=True)
    update_pipeline_state(case, step12="running")

# Event Loop: 监听完成通知，推进 pipeline
while not all_cases_done():
    notification = wait_for_agent_completion()
    case = notification.case

    match notification.finished_step:
        case "step12":
            update_pipeline_state(case, step12="completed")
            plan = read(f"{case.dir}/.casework/execution-plan.json")
            if not plan.actions:
                spawn summarize(case, background=True)
                update_pipeline_state(case, summarize="running")
            else:
                first_action = plan.actions[0]  # 按 priority 排序
                spawn first_action.type(case, background=True)
                update_pipeline_state(case, first_action.type="running")

        case "troubleshooter":
            update_pipeline_state(case, troubleshooter="completed")
            remaining = get_remaining_actions(case, after="troubleshooter")
            if remaining:  # email-drafter dependsOn troubleshooter
                spawn remaining[0].type(case, background=True)
                update_pipeline_state(case, remaining[0].type="running")
            else:
                spawn summarize(case, background=True)
                update_pipeline_state(case, summarize="running")

        case "email-drafter":
            update_pipeline_state(case, email_drafter="completed")
            spawn summarize(case, background=True)
            update_pipeline_state(case, summarize="running")

        case "summarize":
            update_pipeline_state(case, summarize="completed")
            mark_case_done(case)

# 汇总
generate_patrol_summary()
```

#### 两种 mode 对比

| | casework(mode=full) | casework(mode=patrol) |
|---|---|---|
| 调用者 | 用户直接 `/casework` | patrol spawn |
| depth | 0（主 session） | 1（subagent） |
| 执行范围 | Step 1→2→3→4 全流程 | Step 1→2 only |
| Step 3 agent | 自己 spawn（depth=1） | 不 spawn，patrol 做 |
| Step 4 | 自己 inline 执行 | patrol spawn summarize |
| pipeline-state | 可选（直接模式无 patrol） | 必须写（patrol 依赖） |

#### 状态追踪

patrol 通过文件追踪每个 case 的 pipeline 阶段（见 §4.4 的 pipeline-state.json）。
patrol 自身不维护全局状态文件——Dashboard 后端 watch 所有 case 的 pipeline-state.json 实时聚合全局视图。

### 2.7 AR 独立

AR casework 完全独立为 `casework-ar/SKILL.md`：
- 复用 data-refresh.sh（传 `--is-ar true --main-case-id XXX`）
- Step 2 用 AR 专用判断规则（communicationMode、scope 等）
- Step 3 路由表不同（收件人是 case owner 或客户）
- Step 4 summary 使用 AR 视角

主 casework 不再包含任何 AR 分支逻辑。

---

## 3. Subskill Architecture

### 3.1 目录结构变更

**Before（独立 skills）：**
```
.claude/skills/
  ├── casework/SKILL.md          # 602 行
  ├── data-refresh/SKILL.md      # 独立 skill
  ├── compliance-check/SKILL.md  # 独立 skill
  ├── status-judge/SKILL.md      # 独立 skill
  ├── inspection-writer/SKILL.md # 独立 skill
  └── patrol/SKILL.md            # 482 行
```

**After（casework 子 skill，支持独立调用 + WebUI 单步触发）：**
```
.claude/skills/
  ├── casework/
  │   ├── SKILL.md                      # < 200 行，四步编排（/casework）
  │   ├── data-refresh/SKILL.md         # Step 1（/casework:data-refresh）
  │   ├── assess/SKILL.md               # Step 2（/casework:assess）
  │   ├── act/SKILL.md                  # Step 3（/casework:act）
  │   └── summarize/SKILL.md            # Step 4（/casework:summarize）
  ├── casework-ar/
  │   ├── SKILL.md                      # AR 专用四步编排（/casework-ar）
  │   ├── assess-ar/SKILL.md            # AR 状态判断（/casework-ar:assess-ar）
  │   └── act-ar/SKILL.md               # AR 路由表（/casework-ar:act-ar）
  └── patrol/SKILL.md                   # 简化，只做调度
```

**WebUI 映射**：每个子 skill 对应 WebUI Dashboard 的一个按钮操作：
- `data-refresh` → WebUI "刷新数据" 按钮
- `assess` → WebUI "状态判断" 按钮
- `act` → WebUI "执行行动" 按钮（或自动跟在 assess 后）
- `summarize` → WebUI "生成 Summary" 按钮
- `casework` → WebUI "一键全流程" 按钮（依次调用四个子 skill）

**CLI 调用示例**：
```bash
/casework 2603260030005229                    # 全流程
/casework:data-refresh 2603260030005229       # 仅 Step 1
/casework:assess 2603260030005229             # 仅 Step 2
/casework:summarize 2603260030005229          # 仅 Step 4
```

### 3.2 子 Skill 内容

每个子 skill 都是完整的 `SKILL.md`，可独立调用，也可被 casework 主 SKILL.md 引用。

#### casework/data-refresh/SKILL.md
- 调用 data-refresh.sh 的参数说明
- data-refresh-output.json 输出 schema
- 各数据源的增量机制说明
- Teams 数据在此步只完成到 `write-teams.ps1`（raw → input → 每 chat 独立 .md 文件 + 更新 _chat-index.json）。Relevance scoring 和 digest 生成由 Step 2 的 LLM 完成
- WebUI alias: `data-refresh`

#### casework/assess/SKILL.md
- 读取 `.casework/data-refresh-output.json` 中的 delta + context
- actualStatus 枚举值和判断原则（从 status-judge/SKILL.md 提取）
- Compliance gate（源字段 hash 比对，hash 不匹配时重新推理，结果缓存到 casework-meta.json，见 §2.5）
- **Teams relevance scoring + digest 生成**：LLM 读取 teams/*.md 的消息内容，结合 case context 做 high/low 评分，提取 key facts，写 `_relevance.json` + `teams-digest.md`（仅当 Teams 数据有更新时）
- recommendedActions 输出格式
- DELTA_EMPTY 快速路径：`actions: []`（无新数据 = 无新行动），`actualStatus` 从 meta 复用，不调 LLM，不复用上次 actions（避免重复 spawn）
- 输出：更新 casework-meta.json + 写 `.casework/execution-plan.json`
- WebUI alias: `assess`

#### casework/act/SKILL.md
- 读取 `.casework/execution-plan.json` 的 actions
- 路由表（actualStatus → agent spawn）
- IR-first 规则
- spawn prompt 模板（troubleshooter/email-drafter）
- Challenge 改为手动触发（`/challenge {caseNumber}`）
- WebUI alias: `act`

#### casework/summarize/SKILL.md
- case-summary.md 增量更新规则（从 inspection-writer/SKILL.md 提取）
- 首次生成 vs 增量追加策略
- generate-todo.sh 调用（含 note-gap + labor 检查）
- casework-meta.json lastInspected 更新
- WebUI alias: `summarize` / `inspection`

**generate-todo.sh 新增检查项**（纯脚本，不需要 LLM）：

| 检查项 | 判断逻辑 | Todo 输出 |
|--------|---------|----------|
| **Note Gap** | 解析 `notes.md` 最后一条人工 note 日期，算间隔天数，超阈值（默认 3 天）触发 | 🟡 `Note Gap: 距上次 Note 已 {N} 天 → [检测并补充](/cases/{caseNumber}#notes)` |
| **Labor 缺失** | 读 `labor.md` 检查当天日期是否有记录 | 🟡 `Labor: 今天尚未记录 → [记录 Labor](/cases/{caseNumber}#notes)` |

**链接设计**：todo 中的链接直接跳转到 WebUI Case Detail 的 Notes & Labor tab（`/cases/{caseNumber}#notes`），页面内已有 `NoteGapCard`（检测 + 编辑 + 一键提交到 D365）和 `LaborEstimateCard`（AI 估算 + 修改 + 提交），用户点击即可操作，无需手动跑 CLI 命令。

### 3.3 独立 skill 处置

| 旧独立 skill | 处置 | 说明 |
|-------------|------|------|
| `/status-judge` | **删除** | 被 `/casework:assess` 完全替代 |
| `/compliance-check` | **删除** | 被 assess 的 compliance gate 替代，首次推理后永久缓存 |
| `/inspection-writer` | **删除** | 被 `/casework:summarize` 完全替代 |
| `/data-refresh` | **删除** | 被 `/casework:data-refresh` 完全替代 |

用户查看 case 状态直接看 `casework-meta.json` 的上次结果，或跑 `/casework:assess`。

---

## 4. Data Flow

### 4.1 Step 间数据传递 + 文件生命周期

**持久文件**（case 全生命周期保留）：
```
{caseDir}/
  ├── casework-meta.json            ← 跨次运行的累计元数据（actualStatus/compliance/...）
  ├── case-info.md              ← D365 snapshot
  ├── emails.md / notes.md      ← 邮件、笔记
  ├── case-summary.md           ← Step 4 产出（增量更新）
  ├── todo/*.md                 ← Step 4 产出
  ├── teams/ / icm/ / onenote/  ← 各数据源的持久缓存
  └── ...
```

**临时文件**（`.casework/` 子目录，每次 casework 开始时 `rm -rf && mkdir`）：
```
{caseDir}/.casework/            ← 每次 casework 清空重建
  ├── data-refresh-output.json  ← Step 1 → Step 2（打包的 delta + context）
  ├── execution-plan.json       ← Step 2 → Step 3 / patrol（行动计划）
  ├── pipeline-state.json       ← 跨 Step 编排状态（patrol 模式必须，见 §4.4）
  └── events/                   ← Step 1 子任务实时进度（见 §4.4）
      ├── d365.json
      ├── teams.json
      └── ...
```

**生命周期规则**：
- casework 启动时 `rm -rf {caseDir}/.casework && mkdir -p {caseDir}/.casework/events`
- `{caseDir}/logs/` 目录**不清理**，日志增量追加（`>>`），保留历史运行记录供回溯
- patrol 读 `.casework/execution-plan.json` 决定 spawn 什么 agent——文件不存在说明 casework 未完成或失败
- `casework-meta.json` 只做增量 upsert，永不清空
- 旧的 `context/runner-output.json` 迁移到 `.casework/data-refresh-output.json`

```
Step 1 输出:
  .casework/data-refresh-output.json    (delta + context)

Step 2 输出:
  casework-meta.json                        (持久，增量更新 actualStatus/days/recommendedActions)
  .casework/execution-plan.json         (临时，含 actions 列表)

Step 3 输出:
  analysis/*.md                         (持久，troubleshooter 产出)
  drafts/*.md                           (持久，email-drafter 产出)
  claims.json                           (持久，troubleshooter 产出)

Step 4 输出:
  case-summary.md                       (持久，增量更新)
  todo/*.md                             (持久，规则生成)
  timing.json                           (持久，执行统计)
```

### 4.2 data-refresh-output.json 格式

基于现有 runner-output.json 演化，改名并微调：
```json
{
  "caseNumber": "2603260030005229",
  "caseDir": "./cases/active/2603260030005229",
  "isAR": false,
  "refreshResults": {
    "d365": { "status": "OK", "newEmails": 3, "newNotes": 0 },
    "teams": { "status": "OK", "chats": 4, "msgs": 35, "elapsed": 8 },
    "onenote": { "status": "SKIP", "reason": "mtime unchanged" },
    "icm": { "status": "UPDATED", "newEntries": 2 },
    "attachments": { "status": "OK", "downloaded": 1, "skipped": 3 },
    "labor": { "status": "OK", "records": 5 }
  },
  "deltaStatus": "DELTA_OK",
  "deltaSummary": "新增 3 封邮件（客户回复 2 封 + PG 邮件 1 封），ICM 有 2 条新 discussion",
  "daysSinceLastContact": 3,
  "context": {
    "meta": { /* 当前 casework-meta.json */ },
    "deltaContent": "# Delta Since Last Judge\n...",
    "caseInfoHead": "...",
    "emailsTail": "...",
    "teamsDigest": "...",
    "icmSummary": "...",
    "icmDiscussions": "..."
  },
  "elapsed": 12.5
}
```

### 4.3 execution-plan.json 格式

保持不变（兼容 patrol streaming pipeline）：
```json
{
  "caseNumber": "...",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 3,
  "actions": [
    { "type": "troubleshooter", "priority": 1, "status": "pending" },
    { "type": "email-drafter", "priority": 2, "emailType": "follow-up", "dependsOn": "troubleshooter" }
  ],
  "noActionReason": null,
  "routingSource": "rule-table"
}
```

### 4.4 实时观测性（Pipeline + SSE）

**现有基础**：Dashboard 已有 `CaseworkPipeline` 组件（水平步骤条）+ SSE 事件推送。需要适配新四步模型 + 增加 Step 1 子任务细粒度。

#### Pipeline 结构：两层（Step + Subtask）

```
Step 1: Data Refresh ─────────── [active, 12.5s]
  ├── D365 fetch     [completed, 5s]   ✅  delta: +3 emails
  ├── Teams search   [active, 8s]      🔄  6/8 chats fetched
  ├── ICM            [completed, 3s]   ✅  2 new entries
  ├── OneNote        [skipped, 0s]     ⏭   mtime unchanged
  ├── Labor          [completed, 2s]   ✅
  └── Attachments    [completed, 1s]   ✅  1 downloaded, 3 skipped

Step 2: Assess ──────────────── [pending]
  (LLM output streaming via SSE)

Step 3: Act ─────────────────── [pending]
  ├── troubleshooter [pending]
  └── email-drafter  [pending]

Step 4: Summarize ──────────── [pending]
```

#### 事件协议：文件 → file-watcher → SSE

**Step 1 子任务**（纯脚本，通过事件文件通信）：

**原子写**：所有事件文件写入使用 tmp + mv，防止 file-watcher 读到半写 JSON：
```bash
EVENT_DIR="$CASE_DIR/.casework/events"
mkdir -p "$EVENT_DIR"

# 原子写辅助函数
write_event() {
  local file="$1" content="$2"
  echo "$content" > "${file}.tmp" && mv "${file}.tmp" "$file"
}
```

**Schema**：
```json
{
  "task": "teams",
  "status": "active | completed | failed",
  "startedAt": "2026-04-17T09:00:12Z",
  "completedAt": "...",
  "durationMs": 7500,
  "progress": { "done": 6, "total": 8 },
  "delta": { "newMessages": 12, "newChats": 1 },
  "error": "..."
}
```

- `status`: `active`（运行中）→ `completed`（成功）/ `failed`（失败）
- `progress`（可选）：中间进度，仅 `active` 状态时有意义。适用于可报告进度的子任务（Teams chat 拉取、附件下载等）
- `delta`（可选）：完成时的增量摘要
- `error`（可选）：失败时的错误信息

**写入示例**：
```bash
# 启动时
write_event "$EVENT_DIR/teams.json" \
  '{"task":"teams","status":"active","startedAt":"'"$(date -u +%FT%TZ)"'"}'

# 中间进度（Teams 拉取每完成一个 chat 更新一次）
write_event "$EVENT_DIR/teams.json" \
  '{"task":"teams","status":"active","startedAt":"...","progress":{"done":6,"total":8}}'

# 完成时
write_event "$EVENT_DIR/teams.json" \
  '{"task":"teams","status":"completed","startedAt":"...","completedAt":"...","durationMs":7500,"delta":{"newMessages":12}}'

# 失败时
write_event "$EVENT_DIR/icm.json" \
  '{"task":"icm","status":"failed","startedAt":"...","durationMs":15000,"error":"SSO timeout"}'
```

**哪些子任务支持中间进度**：

| 子任务 | 支持 progress？ | 说明 |
|--------|---------------|------|
| D365 | ❌ | fetch-all-data.ps1 内部并行 3 个 API，不易报告 |
| Teams | ✅ `{done: N, total: M}` | ThreadPoolExecutor 每完成一个 chat 回调更新 |
| ICM | ❌ | 单次 API 调用，无中间状态 |
| OneNote | ❌ | mtime 检查后要么跳过要么全量，无中间状态 |
| Labor | ❌ | 单次 API 调用 |
| Attachments | ✅ `{done: N, total: M}` | 逐个下载，可报告 |

Dashboard `file-watcher.ts` 监听 `.casework/events/*.json` → 广播 SSE：
```json
{
  "type": "case-step-progress",
  "caseNumber": "2603260030005229",
  "step": "data-refresh",
  "subtask": "teams",
  "status": "active",
  "progress": { "done": 6, "total": 8 },
  "durationMs": null,
  "delta": null
}
}
```

**Step 2/3/4**（LLM 调用）：已有 SSE 事件直接复用：
- `case-session-thinking` — LLM 思考过程实时输出
- `case-session-tool-call` — 工具调用
- `case-session-tool-result` — 工具返回结果

#### 前端 Pipeline 组件改动

`DEFAULT_CASEWORK_STEPS` 从 8 步改为 4 步 + Step 1 支持子任务展开：
```typescript
export const DEFAULT_CASEWORK_STEPS: PipelineStep[] = [
  { id: 'data-refresh', label: 'Data Refresh', status: 'pending', subtasks: [
    { id: 'd365', label: 'D365' },
    { id: 'teams', label: 'Teams' },
    { id: 'icm', label: 'ICM' },
    { id: 'onenote', label: 'OneNote' },
    { id: 'labor', label: 'Labor' },
    { id: 'attachments', label: 'Attachments' },
  ]},
  { id: 'assess', label: 'Assess', status: 'pending' },
  { id: 'act', label: 'Act', status: 'pending', subtasks: [
    { id: 'troubleshooter', label: 'Troubleshooter' },
    { id: 'email-drafter', label: 'Email Drafter' },
  ]},
  { id: 'summarize', label: 'Summarize', status: 'pending' },
]
```

Step 1 展开时显示子任务并行进度条，收起时只显示聚合状态（N/6 completed）。

#### Pipeline State 文件（Patrol 编排追踪）

`{caseDir}/.casework/pipeline-state.json`——跟踪 case 在流水线中的跨 Step 状态，供 patrol 编排和 Dashboard 聚合使用。

**与 `events/*.json` 的关系**：
- `events/*.json` = Step 1 **内部**子任务的细粒度进度（D365 完了、Teams 在跑…），每个 bg 进程写自己的文件，无并发冲突
- `pipeline-state.json` = **跨 Step** 的编排状态（Step 1+2 完了，正在跑 troubleshooter…），单写者模型

**Schema**：
```json
{
  "caseNumber": "2603260030005229",
  "mode": "patrol",
  "startedAt": "2026-04-17T09:00:00Z",
  "currentStep": "troubleshooter",
  "steps": {
    "step12":         { "status": "completed", "startedAt": "...", "completedAt": "..." },
    "troubleshooter": { "status": "running",   "startedAt": "..." },
    "email-drafter":  { "status": "pending" },
    "summarize":      { "status": "pending" }
  },
  "deltaStatus": "DELTA_OK",
  "actualStatus": "pending-engineer",
  "actions": ["troubleshooter", "email-drafter"]
}
```

**写入者**：

| 字段 | 写入者 | 时机 |
|------|--------|------|
| 初始化 + step12 | casework(mode=patrol) subagent | Step 1+2 执行期间和完成后 |
| troubleshooter/email-drafter | patrol 主 session | spawn 前标 running，完成通知后标 completed |
| summarize | patrol 主 session | spawn 前标 running，完成通知后标 completed |

**并发安全**：虽然有两个写入者（casework subagent + patrol），但它们是**时间隔离**的——casework subagent 写完 step12=completed 并退出后，patrol 才收到完成通知开始写下一步。同一时刻只有一个进程写该文件，无需文件锁。

**原子写保护**（防止 file-watcher 读到半写 JSON）：`update-pipeline-state.sh` 使用临时文件 + rename：
```bash
# update-pipeline-state.sh 内部实现
TMP="$CASE_DIR/.casework/pipeline-state.json.tmp"
python3 -c "
import json, sys
state = json.load(open('$STATE_FILE'))
state['steps']['$STEP']['status'] = '$STATUS'
state['currentStep'] = '$STEP' if '$STATUS' == 'running' else state.get('currentStep','')
json.dump(state, open('$TMP', 'w'), indent=2)
"
mv "$TMP" "$STATE_FILE"   # 原子 rename，file-watcher 不会读到半写
```

**调用方式**（辅助脚本，避免 patrol SKILL.md 内联样板）：
```bash
bash .claude/skills/casework/scripts/update-pipeline-state.sh \
  --case-dir "$CASE_DIR" \
  --step troubleshooter \
  --status running
```

#### Patrol 全局状态聚合

patrol 不维护全局 `patrol-state.json`——由 **Dashboard 后端实时聚合**：

```
Dashboard file-watcher.ts:
  watch: cases/active/*/.casework/pipeline-state.json
  → 聚合为全局 patrol 视图 → SSE 广播:

  {
    "type": "patrol-progress",
    "totalCases": 8,
    "completed": 3,
    "running": 4,
    "pending": 1,
    "cases": [
      { "caseNumber": "260326...", "currentStep": "summarize" },
      { "caseNumber": "260401...", "currentStep": "troubleshooter" },
      ...
    ]
  }
```

**优点**：patrol 只管写每个 case 的 pipeline-state，不用维护全局状态；Dashboard 解耦获取实时视图，即使 patrol session 崩溃，已完成的 case 状态仍可见。

---

## 5. Scripts（新建 + 优化）

### 5.1 data-refresh.sh（新建，取代 casework-light-runner.sh + casework-gather.sh）

统一的数据收集调度脚本。全并行，无 changegate。

```bash
# 用法
bash data-refresh.sh \
  --case-number 2603260030005229 \
  --case-dir ./cases/active/2603260030005229 \
  --project-root . \
  --cases-root ./cases \
  --is-ar false

# 输出
data-refresh-output.json   (DELTA_OK/DELTA_EMPTY/DELTA_FIRST_RUN)
```

内部并行启动：
1. `fetch-all-data.ps1`（bg）— D365 snapshot + emails + notes
2. `view-labor.ps1`（bg）— labor 记录
3. `teams-search-inline.sh`（bg）— Teams 搜索（单 proxy + ThreadPoolExecutor 并行拉取）
4. `onenote-search-inline.py`（bg）— OneNote 本地搜索
5. `icm-discussion-ab.js`（bg）— ICM discussion 增量（已有脚本，直接调用）
6. `download-attachments.ps1`（bg）— 附件下载

wait all → 汇总各源 delta 报告 → 打包 `data-refresh-output.json`

### 5.2 teams-search-inline.sh（优化，不新建）

在现有 `teams-search-inline.sh` 基础上优化，不新建脚本：

```
Phase 1: 串行搜索 (~3s)
  └── curl → SearchTeamMessagesQueryParameters (1-2 个关键词)

Phase 2: 并行拉取 (~7s for 8 chats)
  └── Python concurrent.futures.ThreadPoolExecutor
      └── 所有 ListChatMessages 通过同一个 proxy 并行发送

输出: _mcp-raw.json → 后处理 → teams-digest.md
```

**不需要 `teams-search-parallel.sh`**——实测单 proxy 并行 = N proxy 并行，
多 proxy 只增加 N×5s 启动开销。保持每 case 1 proxy 架构。

### 5.3 icm-discussion-ab.js（复用，不新建）

无需新建脚本。已有 `icm-discussion-ab.js` 完全满足需求：
- `--single {incidentId} --case-dir {dir}` 单次抓取
- `--token-only` 预热 token
- 三级 token fallback + 170 分钟缓存
- 并行安全（无 Playwright profile 锁）

---

## 6. Migration Plan

### 6.1 迁移步骤

0. **重命名 meta 文件**
   - `casehealth-meta.json` → `casework-meta.json`（改名，不并存）
   - 批量重命名现有 case 目录：`for d in {casesRoot}/active/*/; do [ -f "$d/casehealth-meta.json" ] && mv "$d/casehealth-meta.json" "$d/casework-meta.json"; done`
   - 全局搜索替换所有引用 `casehealth-meta.json` 的脚本（PowerShell / Bash / Python / SKILL.md）
   - archived/transfer 目录中的旧文件不迁移（已归档，不再被读取）

1. **新建脚本**
   - `data-refresh.sh` — 统一调度（基于 casework-gather.sh 改造）

2. **优化现有脚本**
   - `teams-search-inline.sh` — 加 ThreadPoolExecutor 并行拉取 + cached chatId + ICM KQL
   - `icm-discussion-ab.js` — 已完成，直接复用

3. **创建 subskills 目录 + 提取子文件**
   - 从 casework/SKILL.md 提取四个 subskill markdown
   - 从 status-judge/SKILL.md、inspection-writer/SKILL.md 提取核心规则
   - Compliance 规则移入 assess.md 作为 gate

4. **重写 casework/SKILL.md**
   - 四步编排模型，每步引用对应 subskill
   - 消除 AR 分支、changegate、fast-path、timing 样板、Agent Probe
   - 支持 `mode=full` 和 `mode=patrol` 参数

5. **创建 casework-ar/SKILL.md**
   - 从 casework 的 AR PATH 段提取
   - 复用 data-refresh.sh，AR 专用 assess 和 act 规则

6. **简化 patrol/SKILL.md**
   - 基于新 casework 的 mode=patrol 适配
   - 去掉 Teams queue agent 相关逻辑
   - 去掉 ICM daemon 相关逻辑

7. **Challenge 独立化**
   - B5a/B5b 的 challenge loop 从 casework 移除
   - 保留 `/challenge` 作为独立手动技能

### 6.2 可删除的文件

| 文件 | 取代方案 |
|------|---------|
| `check-case-changes.ps1` | 不再需要 changegate |
| `casework-fast-path.sh` | delta 判断下沉到 extract-delta.sh |
| `agent-cache-check.sh` | Teams 每次都搜，OneNote 脚本自判断 |
| `casework-light-runner.sh` | 被 data-refresh.sh 取代 |
| `casework-gather.sh` | 被 data-refresh.sh 取代 |
| `extract-delta.sh` | delta 分散到各数据源脚本内联报告 |
| `icm-discussion-daemon.js` | 被已有 `icm-discussion-ab.js` 取代 |
| `icm-discussion-warm.sh` | `icm-discussion-ab.js --token-only` 取代 |
| `icm-queue-submit.sh` | 不再需要 queue |
| `.claude/skills/status-judge/SKILL.md` | 被 casework/assess 替代 |
| `.claude/skills/compliance-check/SKILL.md` | 被 assess 的 compliance gate 替代 |
| `.claude/skills/inspection-writer/SKILL.md` | 被 casework/summarize 替代 |
| `.claude/skills/data-refresh/SKILL.md` | 被 casework/data-refresh 替代 |
| `.claude/agents/casework-light.md` | casework 统一，不再需要 light agent |
| `.claude/agents/teams-search-queue.md` | 不再需要 queue agent |
| `.claude/skills/teams-search-queue/SKILL.md` | 不再需要 queue skill |

### 6.3 风险控制

- 每步改完跑一轮 casework 测试（至少 3 个 case：普通、AR、NO_CHANGE）
- patrol 兼容性测试（spawn casework mode=patrol → 检查 execution-plan.json）
- 保留旧文件为 `.bak` 直到新版本稳定

---

## 7. Success Criteria

| Metric | Before | After |
|--------|--------|-------|
| casework/SKILL.md 行数 | 602 | < 200 |
| 执行路径数 | 8+（CHANGED/NO_CHANGE × AR × QUEUE/DIRECT × full/light） | 2（DELTA_EMPTY fast / DELTA_OK full） |
| AR 代码位置 | 散布 6+ 处 | 1 个独立文件 |
| patrol SKILL.md 行数 | 482 | < 300 |
| 独立 skill 文件数 | 4 个 | 0（变为 subskill） |
| Timing 样板行数 | ~180 行 | 0（移入脚本） |
| Agent Probe 代码 | 30 行 | 0（移除） |
| Challenge 自动化代码 | ~80 行 | 0（移为手动） |
| Changegate + Fast-path 代码 | ~250 行 | 0（取消） |
| Teams 搜索模式 | 串行 + 8h TTL + queue agent | 1 proxy + ThreadPoolExecutor 并行拉取，无缓存 |
| ICM 获取模式 | daemon + queue + fingerprint | 内联 REST API 增量 |

**性能指标**：

| Metric | Before（估算） | After（目标） | 说明 |
|--------|---------------|--------------|------|
| DELTA_EMPTY 快速路径 | N/A（changegate ~5-8s） | < 20s（data-refresh 全跑 + 零 LLM） | 所有源无更新时的端到端耗时 |
| Casework 单 case（DELTA_OK，含 troubleshooter） | ~8-12 min | < 6 min | P50，含 Step 1-4 全流程 |
| Casework 单 case（DELTA_OK，无 action） | ~4-6 min | < 2 min | Step 1+2+4，无 Step 3 |
| Step 1 Data Refresh | ~30-45s（串行 Teams + ICM daemon） | < 20s（全并行） | 所有源并行，最慢源决定耗时 |
| Teams 搜索（8 chats） | ~22s（串行 curl） | < 10s（ThreadPoolExecutor 并行） | 已验证基准 7.5s |
| Patrol 8 case 总耗时 | ~60-90 min（串行处理） | < 30 min（流水线并行） | 跨 case 并行 + Step 3 并行 |
| Patrol DELTA_EMPTY 8 case | ~15-20 min | < 5 min | 全部无更新，每 case ~20s + spawn 开销 |

---

## 8. Non-Goals

- ❌ 不重写底层 PowerShell 脚本（fetch-all-data.ps1、fetch-emails.ps1 等）——它们已经稳定且自带增量
- ❌ 不改变 case 目录结构（case-info.md、emails.md 等保持不变）
- ❌ 不改变 execution-plan.json 格式——被 patrol 依赖
- ❌ 不合并 troubleshooter/email-drafter agent——它们是独立领域，保持分离
- ❌ 不做 Dashboard 大规模重构——Pipeline 组件适配新四步模型 + file-watcher 监听 pipeline-state.json 属于 V2 范围（见 §4.4），但不做 Dashboard 架构变更

## 8.1 Post-V2: Skill 目录整理（V2 完成后执行）

V2 完成后统一整理 skill 目录结构。当前状态（60 个组件散布 3 个目录）：

| 目录 | 数量 | 定位 |
|------|------|------|
| `.claude/skills/` | 33 | slash commands（SKILL.md） |
| `skills/` | 13 | 脚本能力包（部分有 SKILL.md，部分纯脚本） |
| `.claude/agents/` | 14 | agent 定义 |

**问题**：
- 同名重叠 3 处（casework、email-search、labor-estimate 在两个目录都有）
- 功能重复（owa-email-search + owa-email-search-md）
- 死代码未清理（teams-search-queue、casework-light 已 DEPRECATED）
- 找功能不知道去哪个目录

**整理原则**：
- `.claude/skills/` = 唯一 skill 注册表（slash commands + SKILL.md）
- `skills/` = 纯脚本库（无 SKILL.md，被 `.claude/skills/` 引用）
- `.claude/agents/` = agent 定义（被 skill spawn）
- V2 删除的 skill（status-judge/compliance-check/inspection-writer/data-refresh/teams-search-queue）在 V2 中直接清理
- 重叠和重复在 V2 完成后统一处理

## 8.2 Phase 2: Dashboard 适配

V2 核心 skill/脚本完成后，Dashboard 需要适配新的四步模型和事件驱动流水线。

### 8.2.1 改动总览

```
前端                                    后端
├── CaseworkPipeline.tsx  ← 8步→4步     ├── case-session-manager.ts ← 步骤+标记
├── patrolStore.ts        ← 流水线模型   ├── file-watcher.ts        ← 新 watch 路径
├── caseSessionStore.ts   ← pipeline    ├── steps.ts               ← step 路由
├── useSSE.ts             ← 新事件类型   ├── patrol-orchestrator.ts ← 流水线适配
└── PatrolDashboard UI    ← 多case并行   └── case-routes.ts         ← step 名称
```

### 8.2.2 前端改动

#### CaseworkPipeline.tsx

**现有**：8 步平铺水平 stepper
```typescript
// 删除
const DEFAULT_CASEWORK_STEPS = [
  'changegate', 'data-refresh', 'compliance', 'status-judge',
  'route', 'troubleshoot', 'email-draft', 'inspection'
]
```

**新**：4 步 + Step 1/3 子任务可展开——完整定义见 §4.4 `DEFAULT_CASEWORK_STEPS`，此处不重复。

**Step 1 展开交互**：
- 默认收起，显示聚合状态（如 `4/6 ✅`）
- 点击展开显示子任务并行进度（每个子任务独立状态 + delta 摘要）
- Step 3 同理，展开显示 troubleshooter/email-drafter 状态

**Compact 模式**（patrol 中按 case 行显示）：4 个圆点代表 4 步，颜色表示状态。

#### patrolStore.ts

**现有**：波次模型——`phase: discovering | filtering | warming-up | processing | ...`

**新**：流水线模型——每个 case 独立跟踪 pipeline 进度

```typescript
interface PatrolCaseState {
  caseNumber: string
  currentStep: 'step12' | 'troubleshooter' | 'email-drafter' | 'summarize' | 'done'
  stepStatus: Record<string, 'pending' | 'running' | 'completed' | 'failed' | 'skipped'>
  actualStatus?: string
  deltaStatus?: 'DELTA_OK' | 'DELTA_EMPTY'
  startedAt: string
  completedAt?: string
}

interface PatrolStore {
  isRunning: boolean
  startedAt?: string
  totalCases: number
  cases: PatrolCaseState[]  // 每个 case 独立状态

  // 派生值（computed）
  completedCount: number    // cases.filter(c => c.currentStep === 'done').length
  runningCount: number
  pendingCount: number

  // Actions
  onPipelineStateChanged(caseNumber: string, state: PipelineState): void
  startNew(): void
  reset(): void
}
```

**数据源**：Dashboard 后端 watch `pipeline-state.json` → SSE `patrol-pipeline-update` → patrolStore 更新对应 case。

#### caseSessionStore.ts

**现有**：
```typescript
// 删除
pipelineSteps: ['changegate', 'data-refresh', 'compliance', ...]
agentSpawns: ['teams-search', 'onenote-search', 'troubleshooter', ...]
```

**新**：
```typescript
pipelineSteps: ['data-refresh', 'assess', 'act', 'summarize']
// agentSpawns 不再需要——Step 1 子任务通过 events/ 文件追踪
// Step 3 子任务通过 pipeline-state.json 追踪
```

#### useSSE.ts

新增事件处理：

```typescript
// Step 1 子任务进度（来自 .casework/events/*.json）
case 'case-subtask-progress':
  // { caseNumber, step: 'data-refresh', subtask: 'd365', status, delta }
  caseSessionStore.updateSubtaskProgress(data)
  break

// 跨 Step pipeline 状态（来自 .casework/pipeline-state.json）
case 'patrol-pipeline-update':
  // { caseNumber, currentStep, steps: {...} }
  patrolStore.onPipelineStateChanged(data.caseNumber, data)
  break
```

移除/重命名的事件：
- `case-pipeline-step` → 替换为 `case-subtask-progress`（更精确的子任务级别）
- `case-agent-spawn` → 不再需要（agent spawn 信息通过 pipeline-state 传递）

#### Patrol Dashboard UI

**现有**：显示 patrol 的阶段（discovering → filtering → processing...）+ 处理过的 case 列表

**新**：流水线视图——每个 case 一行，显示实时 pipeline 进度

```
┌─────────────────────────────────────────────────────────────┐
│ Patrol — 8 cases — 3 completed, 4 running, 1 pending        │
├─────────────────────────────────────────────────────────────┤
│ Case 260326... │ ●───●───●───◐   │ email-drafter running    │
│ Case 260401... │ ●───◐          │ troubleshooter running    │
│ Case 260410... │ ●───●───●───●  │ ✅ done                   │
│ Case 260412... │ ●───●         │ assess → no action         │
│ Case 260415... │ ◐              │ step12 running             │
│ ...                                                          │
├─────────────────────────────────────────────────────────────┤
│ ● = completed   ◐ = running   ○ = pending                   │
└─────────────────────────────────────────────────────────────┘
```

点击某 case 行 → 展开该 case 的完整 Pipeline 视图（复用 CaseworkPipeline 组件）。

### 8.2.3 后端改动

#### file-watcher.ts

**新增 watch 路径**：
```typescript
// Step 1 子任务事件（每个数据源一个文件）
'cases/active/*/.casework/events/*.json'   → broadcast('case-subtask-progress', ...)

// 跨 Step pipeline 状态（patrol 编排用）
'cases/active/*/.casework/pipeline-state.json' → broadcast('patrol-pipeline-update', ...)
```

**classifyChange() 新增分类**：
```typescript
case match('.casework/events/'):
  return { type: 'case-subtask-progress', caseNumber, subtask: filename }

case match('.casework/pipeline-state.json'):
  return { type: 'patrol-pipeline-update', caseNumber }
```

**移除的 watch**：
- `.t_*` 时间标记文件（被 events/ 替代）
- `case-phase.json`（被 pipeline-state.json 替代）

#### case-session-manager.ts

**删除**：
```typescript
// 删除 8 步定义
const CASEWORK_PIPELINE_STEPS = [
  { id: 'changegate', startMarker: '.t_changegate_start', endMarker: '.t_changegate_end' },
  // ... 7 more
]

// 删除 .t_* 时间标记文件的写入/读取逻辑
```

**替换为**：
```typescript
const CASEWORK_PIPELINE_STEPS = [
  { id: 'data-refresh', label: 'Data Refresh' },
  { id: 'assess', label: 'Assess' },
  { id: 'act', label: 'Act' },
  { id: 'summarize', label: 'Summarize' },
]

// Step 进度不再通过 .t_* 文件，而是通过：
// - Step 1: .casework/events/*.json（file-watcher 推送）
// - Step 2-4: SDK session 的 tool_call 事件（已有 SSE）
// - 跨 Step: .casework/pipeline-state.json（file-watcher 推送）
```

#### steps.ts（单步执行路由）

**现有**：`POST /api/case/:id/step/:step`，step 值为 8 个旧名称

**新**：step 值更新为 4 个新名称 + 映射到 subskill 调用

```typescript
const STEP_TO_SKILL: Record<string, string> = {
  'data-refresh': '/casework:data-refresh',
  'assess':       '/casework:assess',
  'act':          '/casework:act',
  'summarize':    '/casework:summarize',
}

// WebUI "一键全流程" → POST /api/case/:id/process
// WebUI 单步按钮    → POST /api/case/:id/step/data-refresh
```

#### patrol-orchestrator.ts

**调用方式**：WebUI 通过 SDK `query()` 调用 `/patrol` skill（depth=0），patrol 内部可 spawn subagent（depth=1）。V2 不改变 SDK 调用方式。

**现有**：
- `query()` 调用 `/patrol` skill，`tools` 包含 `'Agent'`
- 读 `.patrol/patrol-phase` 获取进度（5s 轮询）
- 波次模型（discovering → filtering → processing）
- `maxTurns: 200`

**V2 改动**：

```typescript
// maxTurns 调大（V2 事件循环 ~130 turns for 8 cases，留余量）
maxTurns: 300

// 移除：5s 轮询 patrol-phase
// 移除
function parsePhaseLine(line: string): { phase: string, progress?: string }
// 移除：patrol-phase 相关 SSE 广播逻辑

// 保留
async function runSdkPatrol(force: boolean): Promise<PatrolResult>
async function cancelSdkPatrol(): void
function isSdkPatrolRunning(): boolean
function loadPatrolLastRun(): PatrolResult | null

// 进度推送职责转移到 file-watcher.ts：
//   watch pipeline-state.json → SSE patrol-pipeline-update
//   patrol-orchestrator 不再主动广播进度
```

**职责精简**：

| | Before | After |
|---|---|---|
| 启动 patrol | ✅ SDK query() | ✅ SDK query()（不变） |
| 进度轮询 | ✅ 5s 读 patrol-phase | ❌ 删除（file-watcher 驱动） |
| 进度广播 | ✅ SSE broadcast | ❌ 删除（file-watcher 驱动） |
| 取消 patrol | ✅ abortController | ✅ 不变 |
| 结果读取 | ✅ patrol-state.json | ✅ 不变 |

#### case-routes.ts

**步骤名称更新**：所有引用旧 8 步名称的地方替换为新 4 步名称。

### 8.2.4 迁移兼容

| 旧机制 | 新机制 | 过渡策略 |
|--------|--------|---------|
| `.t_*` 时间标记文件 | `.casework/events/*.json` | 后端同时支持两种格式，前端只读新格式。旧 .t_* 文件不再生成 |
| `case-phase.json` | `pipeline-state.json` | 直接替换，不兼容 |
| `patrol-phase` 单行文件 | `pipeline-state.json` 聚合 | 可保留 `patrol-phase` 作为简易进度（`"processing|3/8"`），file-watcher 同时监听两种 |
| 8 步 `case-pipeline-step` SSE | 4 步 `case-subtask-progress` SSE | 前端 useSSE 同时处理新旧事件名，旧事件映射到新步骤 |
| `casehealth-meta.json` | `casework-meta.json` | 与 §6.1 步骤 0 同步迁移 |

### 8.2.5 不改动的部分

- ❌ CaseDetail.tsx 的 AI Panel（chat 交互不变）
- ❌ TodoView（读 todo/*.md，格式不变）
- ❌ AgentMonitor（独立的 session 监控，不依赖 casework 步骤）
- ❌ SSE 基础设施（sse-manager.ts、ring buffer、sequence replay）
- ❌ TestLab（独立的测试框架 UI）

---

## 9. Assumptions

1. 每个数据源脚本的自身增量机制已稳定（fetch-emails 的 createdon ge、snapshot 的 CacheMinutes 等）
2. Teams agency HTTP proxy：单 proxy 支持并发请求（已验证），但跨 case 共享会丢数据（已验证），所以每 case 独立 proxy
3. ICM Playwright 独立 profile 不与 D365 Playwright 冲突（已验证）
4. 用户接受 challenge gate 从自动化变为手动触发
5. 取消 changegate 后额外的 3-5s 数据收集成本可接受（换来架构简化）

---

## 10. Dependencies

**保留不变的**：
- `fetch-all-data.ps1`（D365 并行拉取）
- `fetch-emails.ps1`（增量邮件拉取）
- `fetch-case-snapshot.ps1`（缓存跳过 + 增量更新）
- `view-labor.ps1`（labor 拉取）
- `download-attachments.ps1`（DTM 附件下载）
- `generate-todo.sh`（todo 生成）
- `onenote-search-inline.py`（OneNote 搜索）
- `build-input-from-raw.py` + `write-teams.ps1`（Teams 后处理）
- Agent 定义：`troubleshooter.md`、`email-drafter.md`

**新增的**：
- `data-refresh.sh`（统一调度）

**优化的（不新建）**：
- `teams-search-inline.sh`（已改为 ThreadPoolExecutor 并行拉取，不再需要 parallel.sh）
- `email-search-inline.sh`（已改为 agency HTTP proxy + $search 全文搜索 + JSON 双输出）
