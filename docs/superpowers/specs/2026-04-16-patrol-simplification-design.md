# Patrol State Simplification — Design Spec

**Date:** 2026-04-16
**Status:** Approved

## Problem

Patrol 的状态文件过于分散和复杂：
- `patrol-orchestrator.ts`（900+ 行）在 TypeScript 里重新实现了 SKILL.md 的 patrol 逻辑，两套逻辑容易 drift
- WebUI 和 CLI 各写各的状态文件（patrol-state.json、result.json、phase），格式不统一
- 无法互斥：CLI 和 WebUI 可以同时发起 patrol
- WebUI 无法感知 CLI 发起的 patrol 实时进度，反之亦然

## Goal

CLI 和 WebUI patrol 体验一致：
1. **单一逻辑源**：所有 patrol 逻辑只在 SKILL.md 中定义
2. **统一状态文件**：CLI 写、WebUI 读，共享同一份文件
3. **互斥执行**：任何时刻只能有一个 patrol 运行
4. **来源标识**：关键位置标明 `source: "cli" | "webui"`

## Architecture

### 两层状态分离

```
{patrolDir}/                          ← Patrol 级别（整体进度）
  ├── patrol.lock                     ← 互斥锁
  ├── patrol-phase                    ← 单行文本，高频更新
  └── patrol-state.json               ← 完整结果

{casesRoot}/active/{caseNumber}/      ← Case 级别（per-case 进度）
  ├── case-phase.json                 ← casework-light 写的实时 phase
  └── casehealth-meta.json            ← 已有，保持不变
```

### 文件格式

**patrol.lock**（运行中存在，结束时删除）：
```json
{
  "source": "cli" | "webui",
  "pid": 12345,
  "startedAt": "2026-04-16T10:00:00Z",
  "force": true
}
```

**patrol-phase**（单行文本，每处理一个 case 更新一次）：
```
processing|3/6
```
格式：`{phase}` 或 `{phase}|{done}/{total}`

有效 phase 值：`discovering` → `warming-up` → `processing` → `aggregating` → `completed` / `failed`

**patrol-state.json**（patrol 结束时一次性写入）：
```json
{
  "source": "cli",
  "startedAt": "2026-04-16T10:00:00Z",
  "completedAt": "2026-04-16T10:15:00Z",
  "phase": "completed",
  "totalCases": 10,
  "changedCases": 5,
  "processedCases": 5,
  "wallClockMinutes": 15,
  "caseResults": [
    { "caseNumber": "xxx", "status": "completed" }
  ]
}
```

**case-phase.json**（per-case，casework-light 和后续 agent 写入）：
```json
{
  "phase": "gathering",
  "updatedAt": "2026-04-16T10:02:00Z",
  "detail": "fetching D365 data"
}
```

有效 case phase 值：`gathering` → `inspecting` → `executing` → `done` / `error`

## Component Changes

### 1. patrol-orchestrator.ts — 900 行 → ~100 行

**Before:** TypeScript 重新实现了 case 发现、过滤、SDK query 编排、结果汇总等全流程。

**After:** 薄 launcher：
```typescript
export async function runSdkPatrol(force: boolean): Promise<void> {
  // 1. 检查 patrol.lock → 已有则拒绝
  // 2. 写 patrol.lock { source: "webui", pid, startedAt }
  // 3. SDK query({ prompt: "Execute /patrol" + (force ? " --force" : "") })
  // 4. query 完成后删除 patrol.lock
  // 5. 异常时也删除 patrol.lock
}

export function cancelSdkPatrol(): boolean {
  // abort SDK query + 删除 patrol.lock
}

export function isSdkPatrolRunning(): boolean {
  // 检查 patrol.lock 存在 + 进程是否活着
}
```

实时进度不由 orchestrator 推送——**file-watcher 监听 patrol-phase 文件变化自动广播 SSE**。

### 2. cli-patrol-manager.ts — 删除

功能完全合并到简化版 orchestrator。不再需要 spawn 子进程。

### 3. SKILL.md — 增加 lock 和 phase 写入

patrol SKILL.md 新增步骤：
1. **启动时**：写 `patrol.lock`（source 从 prompt 参数获取，默认 "cli"）
2. **各阶段**：写 `patrol-phase`（已有，格式不变）
3. **结束时**：写 `patrol-state.json` + 删除 `patrol.lock`
4. **启动前**：检查 `patrol.lock` 是否存在，存在则报错并退出

### 4. casework-light — 新增 case-phase.json 写入

casework-light agent 在各步骤写入 `{caseDir}/case-phase.json`：
- `gathering`：拉取数据
- `inspecting`：inspection-writer 运行中
- `executing`：action 执行中（email draft 等）
- `done`：完成
- `error`：异常

### 5. file-watcher.ts — 更新监听路径

```typescript
// 监听：
config.patrolDir + '/patrol-phase'        → 广播 patrol-progress SSE
config.patrolDir + '/patrol-state.json'   → 广播 patrol-updated SSE
config.patrolDir + '/patrol.lock'         → 广播 patrol-lock-changed SSE
config.activeCasesDir + '/**/case-phase.json' → 广播 case-progress SSE
```

### 6. meta-reader.ts — 简化

不再需要 mtime 比较逻辑。直接读 `patrol-state.json`，没有 fallback。

### 7. case-routes.ts — 简化

```typescript
// POST /patrol       → runSdkPatrol(force)
// POST /patrol/cancel → cancelSdkPatrol()
// GET  /patrol/status → { running, lock, lastRun }
```

删除对 cli-patrol-manager 的 import 和引用。

## 互斥机制详细设计

### 写 lock

```bash
# CLI (SKILL.md)
if [ -f "{patrolDir}/patrol.lock" ]; then
  LOCK_SOURCE=$(python3 -c "import json; print(json.load(open('{patrolDir}/patrol.lock'))['source'])")
  echo "ERROR: Patrol already running (source=$LOCK_SOURCE). Abort."
  exit 1
fi
echo '{"source":"cli","pid":'"$$"',"startedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > "{patrolDir}/patrol.lock"
```

```typescript
// WebUI (patrol-orchestrator.ts)
if (existsSync(lockFile)) {
  const lock = JSON.parse(readFileSync(lockFile, 'utf-8'))
  throw new Error(`Patrol already running (source=${lock.source}, since ${lock.startedAt})`)
}
writeFileSync(lockFile, JSON.stringify({ source: 'webui', pid: process.pid, startedAt }))
```

### Stale lock 检测

如果 lock 文件存在但进程已死（PID 不存在），自动清理：
- WebUI：`process.kill(lock.pid, 0)` 检查进程
- CLI：`kill -0 $PID 2>/dev/null` 检查进程

超过 60 分钟的 lock 也视为 stale（patrol 正常不应超过 60 分钟）。

## 删除列表

| 文件/代码 | 原因 |
|-----------|------|
| `patrol-orchestrator.ts` 中 900 行编排逻辑 | 被 SKILL.md 替代 |
| `cli-patrol-manager.ts` | 合并到简化版 orchestrator |
| `result.json` | 合并到 patrol-state.json |
| `casehealth-state.json`（旧名） | 被 patrol-state.json 替代 |
| `patrol-last-run.json`（dashboard/.runtime） | 被 patrol-state.json 替代 |
| `meta-reader.ts` 的 mtime 比较 fallback 逻辑 | 单一数据源，无需 fallback |

## 迁移

1. 首次启动检测旧文件（casehealth-state.json / result.json），如果存在则复制为 patrol-state.json
2. 旧文件保留不删除，但不再读取

## Verification

1. CLI `/patrol` → patrol.lock 写入 + patrol-phase 更新 + 结束写 patrol-state.json + 删 lock
2. WebUI POST /patrol → 同上（通过 SDK query 触发）
3. CLI 运行中 → WebUI POST /patrol 返回 409
4. WebUI 运行中 → CLI `/patrol` 报错退出
5. Dashboard 实时显示整体 phase + per-case phase
6. Stale lock 自动清理
