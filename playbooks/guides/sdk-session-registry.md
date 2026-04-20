# SDK Session Registry — 统一 Agent 观测

> 任何通过 SDK `query()` 创建的 agent session 都必须注册到 registry，确保 Agent Monitor 可观测。

## 1. 为什么

之前每个 `query()` 调用方自己管注册：case-session-manager 写 `sessions{}`，patrol 没注册，cron 自己管状态。
导致 Agent Monitor 要手动聚合多个来源，新功能容易漏注册。

**规则：调用 SDK `query()` = 必须注册到 registry。**

## 2. API

```typescript
import { sdkRegistry } from '../agent/sdk-session-registry.js'
```

### `register(opts)` → `SessionHandle`

注册一个新 agent session。返回 handle 用于后续生命周期管理。

```typescript
const handle = sdkRegistry.register({
  source: 'case',            // 'case' | 'patrol' | 'cron' | 'implement' | 'verify' | 'batch' | 'test'
  context: caseNumber,       // 显示标识（case number / issue id / job name）
  intent: 'Run act step',    // 人类可读的任务描述
  metadata?: {},             // 任意附加数据（如 stepName, trackId）
})
```

### `handle.onMessage(message)`

喂入 SDK message。自动处理：
- 提取 `sessionId`（从第一条带 session_id 的消息）
- 更新 `lastActivityAt`
- 检测 sub-agent 事件（`task_started`/`task_progress`/`task_notification`）→ 写入 subAgentStore
- 广播 SSE `agent-lifecycle` 事件
- 写入 session.jsonl 日志

### `handle.complete()` / `handle.fail(error)`

标记 session 结束。自动：
- 更新状态 → `completed` / `failed`
- 广播 SSE 完成事件
- 清理 sub-agent 映射

### `sdkRegistry.listAll()` → `MainAgent[]`

返回所有已注册 session（活跃 + 最近完成）。Agent Monitor 的 `/sessions/all` API 直接调用此方法。

### `sdkRegistry.getByContext(context)` → `MainAgent | null`

按 context 查找（用于 session resume 判断）。

## 3. 标准用法（新功能模板）

```typescript
import { sdkRegistry } from '../agent/sdk-session-registry.js'
import { query } from '@anthropic-ai/claude-agent-sdk'

// 在 route handler 或 orchestrator 中：
async function runNewFeature(caseNumber: string) {
  // ① 注册
  const handle = sdkRegistry.register({
    source: 'case',
    context: caseNumber,
    intent: 'Run new-feature',
  })

  try {
    for await (const message of query({
      prompt: `Case ${caseNumber}: do the thing`,
      options: { /* ... */ },
    })) {
      // ② 喂消息（一行搞定所有观测）
      handle.onMessage(message)
      // 你自己的业务逻辑...
      yield message
    }
    // ③ 完成
    handle.complete()
  } catch (err) {
    handle.fail((err as Error).message)
    throw err
  }
}
```

## 4. 数据模型

```typescript
interface MainAgent {
  /** Registry 分配的唯一 ID（注册时生成） */
  id: string
  /** SDK session ID（第一条消息后填入） */
  sessionId?: string
  /** 来源类型 */
  source: 'case' | 'patrol' | 'cron' | 'implement' | 'verify' | 'batch' | 'test'
  /** 显示标识 */
  context: string
  /** 任务描述 */
  intent: string
  /** 状态 */
  status: 'active' | 'paused' | 'completed' | 'failed'
  /** 时间戳 */
  registeredAt: string
  lastActivityAt: string
  completedAt?: string
  /** 附加数据 */
  metadata?: Record<string, any>
  /** 错误信息（failed 时） */
  error?: string
}
```

## 5. 与现有系统的关系

| 系统 | 关系 |
|------|------|
| `case-session-manager.ts` 的 `sessions{}` | **保留** — 用于 session resume 逻辑（`caseIndex`、`chatCaseSession`）。registry 是只读观测层，不干预 resume |
| `subAgentStore`（前端） | registry 的 `handle.onMessage()` 自动通过 SSE 推送 sub-agent 事件，前端 store 消费 |
| `/sessions/all` API | 改为调用 `sdkRegistry.listAll()`，不再手动聚合四个来源 |
| `observability-guide.md` | registry 的日志写入遵循 §4 日志架构（run 目录 + session.jsonl） |

## 6. SSE 事件

Registry 自动广播的事件：

| SSE Event | 触发时机 | 数据 |
|-----------|---------|------|
| `agent-registered` | `register()` | `{ id, source, context, intent }` |
| `agent-session-bound` | 首次 `onMessage()` 提取到 sessionId | `{ id, sessionId }` |
| `agent-completed` | `complete()` / `fail()` | `{ id, status, error? }` |

Sub-agent 事件复用 `case-step-progress`（`kind: agent-started/progress/completed`）。

## 7. Checklist — 新增 SDK query 调用

- [ ] 调用了 `sdkRegistry.register()` ？
- [ ] `for await` 循环里调了 `handle.onMessage(message)` ？
- [ ] 正常结束调了 `handle.complete()` ？
- [ ] catch 里调了 `handle.fail()` ？
- [ ] `source` 选了正确的类型？
- [ ] `context` 用了有意义的标识（case number / issue id / job name）？
- [ ] Agent Monitor 页面能看到这个 session ？

## 8. 迁移计划

现有 6 个 `query()` 调用点需逐步迁移：

| 文件 | 现有注册方式 | 迁移难度 |
|------|-------------|---------|
| `case-session-manager.ts` (processCaseSession) | 自己管 `sessions{}` | 低 — 加 registry.register，保留 sessions{} 用于 resume |
| `case-session-manager.ts` (chatCaseSession) | 复用已有 session | 低 — resume 时不需要新注册 |
| `patrol-orchestrator.ts` | 没注册 | 低 — 加一行 register |
| `issues.ts` (track-creation, implement) | issueTrackState | 中 — 替换或双写 |
| `cron-manager.ts` | 自己管 jobs 状态 | 低 — 加 register，jobs 状态保留用于调度 |
| `batch-orchestrator.ts` | 没注册 | 低 — 加一行 |
| `test-runner.ts` | 没注册 | 低 — 加一行 |
