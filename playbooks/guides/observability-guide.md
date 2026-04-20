# Observability Guide — 状态 · 日志 · SSE

> 涉及 patrol/casework 的状态文件、日志架构、SSE 推送/持久化的改动，先读此文档。

## 写入准则

- **只写原则和约束**，不写具体实现步骤（实现细节在各 SKILL.md）
- **每条原则一句话**，附 ✅/❌ 示例即可，不展开解释
- **新增原则前先检查是否已被现有条目覆盖**，避免重复
- **脚本用法不记在这里**，记在脚本自身的 docstring 或 SKILL.md

## 1. 两层追踪，严格隔离

```
Patrol 全局层 (patrol-progress.json)     Case 个体层 (state.json per-case)
  phase / totalCases / currentAction       steps.* / subtasks / actions / result
  SSE: patrol-state                        SSE: patrol-case
```

两层文件不混写。全局不写 per-case 数据，per-case 不写全局 phase。

## 2. 三种入口，一套文件

WebUI / CLI patrol / CLI casework 共享同一套状态文件。

- 状态写入放脚本层（data-refresh.sh / update-state.py / write-execution-plan.py），三种入口都会执行
- 不在 route handler 里写状态（否则 CLI 看不到）

## 3. 状态文件

- ❌ 禁止 `rm -f state.json`，用 `update-state.py --init`
- init 只在 session 发起者处调用一次，step 脚本不做 init
- 重复 update 只做字段 merge，不重置 phaseStartedAt（幂等性）

## 4. 日志架构（ISS-231）

**核心原则：日志按 run 隔离，每次执行一个独立目录。**

```
.casework/
├── state.json                    # 实时状态（不属于 run）
└── runs/{YYMMDD-HHmm}_{type}/   # 一次执行的完整快照
    ├── session.jsonl              # SDK 全量（唯一结构化日志）
    ├── execution-plan.json        # assess 产物
    ├── output/subtasks/*.json     # data-refresh 结构化输出
    ├── scripts/*.log              # 脚本 stdout/stderr（纯文本）
    └── agents/*.log               # sub-agent output（纯文本）
```

Run 类型：`patrol` | `casework` | `step-{name}`

**格式规则**：
- 结构化数据 → JSONL（`session.jsonl`，每行一条 SDK message）
- 脚本输出 → 纯文本 `.log`（外部进程 stdout，格式不可控）
- ❌ 禁止：markdown 摘要、混合格式、无时间戳文件名、平铺在根目录

**生命周期**：
- `update-state.py --init --run-type {type}` 创建 run 目录，写 `runId` 到 state.json
- 保留 30 天，自动清理
- Run 完成后不可变（只读快照）

## 5. SSE 三层持久化

**每条 SSE 消息必须同时写入三层**：

```
① sseManager.broadcast()          → 实时推送到浏览器
② 内存 store.add()                → 刷新恢复（GET /xxx/messages API）
③ appendFileSync(session.jsonl)    → 磁盘存档（后端重启后 fallback）
```

- ❌ 只广播不持久化 = 刷新即丢
- ❌ 无恢复 API = 内存 store 白存
- 内存 store 有上限（环形缓冲），新 session 开始时清空
- SSE 消息带 uuid 去重

## 6. 确定性优先

能用脚本写的就不依赖 agent。问：agent 忘了执行这行命令，UI 会怎样？

- 脚本写入 = 100% 确定
- Agent 写入 = 最终一致（可能忘记）
- 数据格式源头为准，全链路不翻译 key 名

## 7. Checklist

**状态**：谁写（脚本/agent）？file-watcher 能检测到？前端有渲染？三种入口都覆盖？所有路径都有写入？

**日志**：写到 run 目录？命名规范？JSONL/纯文本格式正确？有清理策略？不依赖 agent 写日志？

**SSE**：event type 注册到 SSEEventType？三层都写了（broadcast + 内存 + 磁盘）？有恢复 API？uuid 去重？isRunning() 数据污染守卫？

## 8. 计时

- 统一用脚本写计时（casework: `update-state.py`，patrol: `update-phase.py`），禁止内联 python
- 谁跑谁计时 — `--status active` 记 `startedAt`，`--status completed` 自动算 `durationMs`
- ❌ 禁止：`.t_*_start/end` 文件打点、`${SECONDS}` inline 算术、调用者手动传 `--duration-ms`（已有 auto-compute）

## 9. SDK Session Registry

新增 SDK `query()` 调用时，必须注册到统一 registry 以确保 Agent Monitor 可观测。

详见 → `playbooks/guides/sdk-session-registry.md`
