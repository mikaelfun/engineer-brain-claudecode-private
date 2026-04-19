# UI State Tracking & SSE 开发原则

> 涉及 patrol/casework 状态显示、SSE 实时更新、state.json 读写的改动，先读此文档。

## 1. 两层追踪，严格隔离

```
Patrol 全局层 (patrol-progress.json)     Case 个体层 (state.json per-case)
  phase / totalCases / currentAction       steps.* / subtasks / actions / result
  SSE: patrol-state                        SSE: patrol-case
  消费: PatrolSidebar, PatrolHeader        消费: PatrolCaseRow
```

- 两层文件不混写——全局不写 per-case 数据，per-case 不写全局 phase
- patrol agent 通过 `update-state.py` 写 case state.json 是合法的跨层操作（per-case 数据由 per-case 文件承载）

## 2. 三种入口，一套文件

WebUI / CLI patrol / CLI casework 共享同一套状态文件。file-watcher 不区分写入来源，CLI 执行时 WebUI 自动同步。

- **状态写入放脚本层**（data-refresh.sh / event-wrapper.sh / write-execution-plan.py），三种入口都会执行
- **不在 route handler 里写状态**（否则 CLI 看不到）
- **唯一例外**：`processCaseSession()` 的 `--init --step start --status active` 是 WebUI 专属，因为 CLI 有 SKILL.md 做同样的事

## 3. 状态文件生命周期

| 类型 | 初始化 | 更新 | 终结 | SSE |
|------|-------|------|------|-----|
| state.json | `--init` 原子重置 | 各 step 写入 | 自然留存 | ✅ 触发 |
| SDK JSONL (session.jsonl) | run 目录创建时 | 每条 SDK message 追加 | run 结束 | ❌ 不触发（SSE 由消息解析层发） |
| 脚本日志 (scripts/*.log) | 首次写入创建 | 覆盖写（每次 run 一份） | run 目录清理 | ❌ 不触发 |
| Sub-agent output (agents/*.log) | task_notification 触发 | 一次性写入 | run 目录清理 | ✅ patrol-agent / case-step-progress SSE |

- ❌ 禁止 `rm -f state.json`，用 `update-state.py --init`
- init 只在 session 发起者处调用一次，step 脚本不做 init
- 日志和状态不要混淆——生命周期完全不同

## 3a. 日志规范（ISS-231）

日志是 run 的产物，必须遵循统一的路径、命名、格式和生命周期规则。

### 目录结构

```
{caseDir}/.casework/
├── state.json                         # 实时状态（不属于 run）
└── runs/
    └── {YYMMDD-HHmm}_{type}/         # 一次执行 = 一个 run 目录
        ├── session.jsonl               # SDK 全量 JSONL（唯一结构化日志）
        ├── execution-plan.json         # assess 产物
        ├── delta-content.md            # data-refresh 变更摘要
        ├── output/                     # data-refresh 结构化输出
        │   ├── data-refresh.json
        │   └── subtasks/*.json
        ├── scripts/                    # 脚本 stdout/stderr
        │   └── {subtask-name}.log
        └── agents/                     # sub-agent output
            └── {agent-type}.log
```

Run 类型（`{type}`）：`patrol` | `casework` | `step-data-refresh` | `step-assess` | `step-act` | `step-summarize`

state.json 里通过 `runId` 字段指向当前 run 目录，供下游脚本读取路径。

### 格式规则

| 格式 | 用途 | 规则 |
|------|------|------|
| **JSONL** | SDK session 日志 | 每行一条 JSON（SDK message 原封不动）。唯一结构化日志，可机器解析、重放、派生视图 |
| **纯文本 .log** | 脚本 stdout/stderr | 外部进程输出，格式不可控。按 subtask/agent 命名，覆盖写（每 run 一份） |

❌ **禁止的格式**：
- markdown 摘要日志（`writeStepLog` 已删除，被 JSONL 替代）
- 混合格式（如旧 `casework.log` 混合 agent 文本 + 原始 SDK JSON）
- 无时间戳、无类型标识的日志文件名

### 命名规则

| 文件类型 | 命名 | 示例 |
|---------|------|------|
| Run 目录 | `{YYMMDD-HHmm}_{type}` | `260419-1856_patrol` |
| SDK JSONL | 固定 `session.jsonl` | — |
| 脚本日志 | `{subtask-name}.log` | `d365.log`, `teams.log` |
| Sub-agent output | `{agent-type}.log` | `troubleshooter.log`, `email-drafter.log` |
| Patrol 全局 SDK 日志 | `patrol-sdk-{YYYY-MM-DDTHH-MM-SS}.jsonl` | 在 `.patrol/logs/` |

### 生命周期

- **创建**：`update-state.py --init --run-type {type}` 创建 run 目录
- **清理**：保留最近 30 天的 run 目录，自动删除更早的
- **不可变**：run 完成后目录内容不再修改（只读快照）
- **state.json.runId** 指向最新 run，下游脚本通过它找到正确目录

### 消费者

| 消费者 | 读什么 | 用途 |
|--------|-------|------|
| WebUI `/api/patrol/logs` | `.patrol/logs/*.jsonl` | 展示 patrol SDK 日志 |
| WebUI AgentMonitor | SSE `patrol-agent` / `case-step-progress` | 实时 sub-agent 状态 |
| WebUI 消息恢复 | `GET /patrol/messages` | 刷新后恢复 patrol 主 agent 消息 |
| 脚本 `generate-digest.py` | `output/subtasks/*.json` | 生成 delta digest |
| 脚本 `finalize-state.sh` | `execution-plan.json` | 完成状态写入 |
| 调试 | `scripts/*.log` | 排查 data-refresh 子任务失败 |
| 复盘 | `session.jsonl` + `agents/*.log` | 分析 agent 决策和执行过程 |

### 反模式

- ❌ 日志直接写在 `.casework/` 根目录或 `logs/` 平铺目录
- ❌ 多次执行覆盖同一个日志文件（应该是每 run 隔离）
- ❌ Agent 指令驱动的日志写入（应该用脚本/TypeScript 自动保存）
- ❌ 只追加不清理的无界日志文件（旧 `casework.log`）
- ❌ 日志文件名不含类型/时间戳（无法区分来源和时间）

## 3b. SSE 消息持久化

SSE 是实时推送——浏览器刷新或 SSE 断连后消息丢失。长时间运行的操作（patrol 几十分钟、casework 几分钟）**必须有恢复机制**，否则用户刷新一次就丢失全部进度。

### 三层模型

```
① SSE 实时推送（瞬时）  →  浏览器接收  →  前端 store 渲染
② 后端内存持久化（session 级）  →  GET /xxx/messages API  →  前端刷新时恢复
③ 磁盘持久化（run 级）  →  session.jsonl  →  事后分析/复盘
```

每个 SSE 消息应该**同时写入三层**：
1. `sseManager.broadcast()` — 实时推送
2. 内存 store `.add()` — 刷新恢复
3. `appendFileSync(session.jsonl)` — 磁盘存档

### 各场景实现状态

| 场景 | ① SSE 推送 | ② 内存恢复 | ③ 磁盘 JSONL | 恢复 API |
|------|-----------|-----------|-------------|---------|
| Case step 主 agent | ✅ `case-step-progress` | ✅ `caseStepState.addMessage()` | ✅ `session.jsonl` | `GET /case/:id/step-progress` |
| Case step sub-agent | ✅ `case-step-progress` (kind: agent-*) | ✅ `caseStepState.addMessage()` | ✅ `session.jsonl` | 同上 |
| Patrol 主 agent | ✅ `patrol-main-progress` | ✅ `patrolMessageStore.add()` | ✅ `.patrol/logs/*.jsonl` | `GET /patrol/messages` |
| Patrol sub-agent | ✅ `patrol-agent` | ✅ `patrolMessageStore.add()` | ✅ `.patrol/logs/*.jsonl` | `GET /patrol/messages` |

### 设计规则

- **每个新 SSE 广播点，必须同时加内存持久化和磁盘写入**——不能只广播不存
- **恢复 API 是必需的**——没有恢复 API 的 SSE 消息等于不存在
- **内存 store 有上限**（如 500 条环形缓冲），防止 OOM
- **内存 store 在新 session 开始时清空**（patrol starting / case step 开始）
- **后端重启时**：内存 store 丢失，但 session.jsonl 在磁盘上。恢复 API 可以 fallback 读 JSONL
- **去重**：SSE 消息带 uuid，内存 store 和前端 store 都按 uuid 去重

### 反模式

- ❌ 只广播不持久化（刷新即丢）
- ❌ 内存 store 无上限（patrol 几千条消息 → OOM）
- ❌ 无恢复 API（内存 store 存了但前端没法取）
- ❌ 后端重启后恢复 API 返回空（应 fallback 读 JSONL）

## 4. 确定性优先

能用脚本写的状态就不依赖 agent。每新增一个状态写入，问：agent 忘了执行这行命令，UI 会怎样？

- 脚本写入 = 100% 确定（data-refresh.sh, event-wrapper.sh, write-execution-plan.py）
- Agent 写入 = 最终一致（patrol SKILL.md 指令，可能忘记）
- 将 agent 依赖的失败模式设计为"降级显示"而非"数据错误"

## 5. 数据格式：源头为准，不翻译

全链路一种 key 格式（源头原始字段名），不在中间层做映射。

```
subtask 脚本 → delta: { newEmails: 3 }
event-wrapper.sh → 直传
state.json → subtasks.d365.delta.newEmails
前端 formatDelta() → 读 newEmails 渲染
```

新增数据源时：脚本定义 key → 前端 formatDelta 加 case → 完。

## 6. 幂等性

StateManager 处理重复事件时不能覆写关键时间戳：

- 重置逻辑（如 patrol starting 初始化）必须在 **phase 实际变化的条件内**，不能无条件执行
- 同一 phase 的重复 update 只做字段 merge，不重置 phaseStartedAt

## 7. 改动 Checklist

### 状态/数据

- [ ] 谁写？脚本确定性还是 agent 依赖？
- [ ] file-watcher 能检测到？在监控范围内？
- [ ] 前端 store handler + UI 组件都有对应渲染？
- [ ] 数据 key 和源头一致？没引入映射层？
- [ ] WebUI / Patrol / CLI 三种入口都覆盖？
- [ ] 所有路径（正常/快速/skip/fail）都有写入？
- [ ] 重复写入不会覆写关键时间戳？
- [ ] Python dirname 层级 / Bash POSIX 路径正确？
- [ ] 改动涉及架构变更？先讨论方案再动手

### 日志（§3a）

- [ ] 日志写到 run 目录（`runs/{runId}/`），不是 `.casework/` 根目录？
- [ ] 文件命名符合规范（`session.jsonl` / `{name}.log`）？
- [ ] 格式正确？结构化数据用 JSONL，脚本输出用纯文本 .log
- [ ] 有清理策略？不会无限增长？
- [ ] 不依赖 agent 指令写日志？（用 TypeScript/脚本自动保存）

### SSE 新增

- [ ] SSE event type 注册到 `types/index.ts` 的 `SSEEventType`？
- [ ] 后端 `sseManager.broadcast()` 调用正确的 event type？
- [ ] 前端 SSE consumer 注册（sse.ts 或 store 的 onXxx handler）？
- [ ] 去重机制？（uuid dedup 防止重复广播）
- [ ] 数据污染防护？（`isRunning()` 守卫，防止非运行期间的旧文件触发）
