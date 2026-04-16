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

**DELTA_EMPTY 判定**：所有源都报告无变化 → Step 2 直接复用上次 `actualStatus` + `recommendedActions`（读 meta），零 LLM 调用。

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

**端口分配**：`9900 + hash(case_number) % 100`。跨 case 端口可能冲突但后启动的会复用已有 proxy（Graph API 无状态），功能正确。

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
- 首次计算后**永久缓存**到 `casework-meta.json`
- 放在 Step 2 (Assess) 中作为 gate：`compliance.entitlementOk === false` → 阻断

Step 1 不做任何 compliance 相关工作。

### 2.6 Patrol 集成

```
patrol (depth=0):
  预热 → 对每个 case:
    spawn casework(mode=patrol) (depth=1):
      Step 1: data-refresh.sh (Bash, 全并行数据收集)
      Step 2: LLM assess (inline, 读 data-refresh-output.json)
      写 execution-plan.json → 返回给 patrol
    
    patrol 读 execution-plan.json:
      if has-actions:
        spawn troubleshooter/email-drafter (depth=1, 由 patrol 执行)
      spawn inspection-writer (depth=1, 由 patrol 执行)
```

casework(mode=patrol) 只执行 Step 1 + Step 2，不 spawn agent。
casework(mode=full) 执行全部 Step 1-4，包括自己 spawn agent。

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
- Compliance gate（仅 cache miss 时做 LLM 推理，结果永久缓存到 casework-meta.json）
- **Teams relevance scoring + digest 生成**：LLM 读取 teams/*.md 的消息内容，结合 case context 做 high/low 评分，提取 key facts，写 `_relevance.json` + `teams-digest.md`（仅当 Teams 数据有更新时）
- recommendedActions 输出格式
- DELTA_EMPTY 快速路径：复用上次 meta，不调 LLM（包括跳过 Teams scoring）
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
  └── execution-plan.json       ← Step 2 → Step 3 / patrol（行动计划）
```

**生命周期规则**：
- casework 启动时 `rm -rf {caseDir}/.casework && mkdir -p {caseDir}/.casework`
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

---

## 5. New Scripts

### 5.1 data-refresh.sh（取代 casework-light-runner.sh + casework-gather.sh）

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

### 5.2 teams-search-inline.sh 优化（保留，不新建 parallel.sh）

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

### 5.3 ICM：复用已有 `icm-discussion-ab.js`

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

2. **创建 subskills 目录 + 提取子文件**
   - 从 casework/SKILL.md 提取四个 subskill markdown
   - 从 status-judge/SKILL.md、inspection-writer/SKILL.md 提取核心规则
   - Compliance 规则移入 assess.md 作为 gate

3. **重写 casework/SKILL.md**
   - 四步编排模型，每步引用对应 subskill
   - 消除 AR 分支、changegate、fast-path、timing 样板、Agent Probe
   - 支持 `mode=full` 和 `mode=patrol` 参数

4. **创建 casework-ar/SKILL.md**
   - 从 casework 的 AR PATH 段提取
   - 复用 data-refresh.sh，AR 专用 assess 和 act 规则

5. **简化 patrol/SKILL.md**
   - 基于新 casework 的 mode=patrol 适配
   - 去掉 Teams queue agent 相关逻辑
   - 去掉 ICM daemon 相关逻辑

6. **Challenge 独立化**
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
| `teams-search-inline.sh` | **保留（已优化）** | 已改为并行拉取，不再需要新建 parallel.sh |
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
| ICM 获取模式 | daemon + queue + fingerprint | 内联 Playwright 增量 |

---

## 8. Non-Goals

- ❌ 不重写底层 PowerShell 脚本（fetch-all-data.ps1、fetch-emails.ps1 等）——它们已经稳定且自带增量
- ❌ 不改变 case 目录结构（case-info.md、emails.md 等保持不变）
- ❌ 不改变 execution-plan.json 格式——被 patrol 依赖
- ❌ 不合并 troubleshooter/email-drafter agent——它们是独立领域，保持分离
- ❌ 不做 Dashboard 适配（Dashboard 读 patrol-state.json 和 todo，这些不变）

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
