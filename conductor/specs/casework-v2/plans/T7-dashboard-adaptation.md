# T7 — Dashboard WebUI V2 Adaptation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Dashboard 前后端从 V1 的 8 步 pipeline + 波次 patrol 模型适配为 V2 的 4 步 pipeline + 流水线 patrol 模型。

**Architecture:**
- 前端 4 步 pipeline（data-refresh → assess → act → summarize）+ Step 1/3 子任务展开
- 后端 file-watcher 新增 `.casework/events/*.json` + `pipeline-state.json` watch
- 步骤路由 steps.ts 映射到 V2 sub-skill（`/casework:data-refresh` 等）
- patrolStore 从波次模型→每 case 独立 pipeline 状态

**Tech Stack:** TypeScript, React, Zustand, Hono, SSE

---

## File Structure

| 文件 | 职责 | 行为 |
|------|------|------|
| `dashboard/web/src/components/pipeline/CaseworkPipeline.tsx` | 8步→4步 + 子任务展开 | **修改** |
| `dashboard/web/src/stores/caseSessionStore.ts` | pipelineSteps 8→4 | **修改** |
| `dashboard/web/src/hooks/useSSE.ts` | 新增事件类型 | **修改** |
| `dashboard/web/src/stores/patrolStore.ts` | 波次→流水线模型 | **修改** |
| `dashboard/src/watcher/file-watcher.ts` | 新增 events/ + pipeline-state watch | **修改** |
| `dashboard/src/routes/steps.ts` | 8步→4步路由 + skill 映射 | **修改** |
| `dashboard/src/agent/patrol-orchestrator.ts` | maxTurns 调大 | **修改** |

---

## Task 1: CaseworkPipeline.tsx — 8 步改 4 步 + 子任务

**Files:**
- Modify: `dashboard/web/src/components/pipeline/CaseworkPipeline.tsx`

- [ ] **Step 1: 替换 DEFAULT_CASEWORK_STEPS**

找到 L68-77 的 8 步定义，替换为：

```typescript
export const DEFAULT_CASEWORK_STEPS: PipelineStep[] = [
  { id: 'data-refresh', label: 'Data Refresh', status: 'pending' },
  { id: 'assess', label: 'Assess', status: 'pending' },
  { id: 'act', label: 'Act', status: 'pending' },
  { id: 'summarize', label: 'Summarize', status: 'pending' },
]
```

- [ ] **Step 2: 替换 STEP_ICONS**

找到 L55-64 的图标映射，替换为：

```typescript
const STEP_ICONS: Record<string, LucideIcon> = {
  'data-refresh': RefreshCw,
  assess: Scale,
  act: GitBranch,
  summarize: FileText,
}
```

删除不再需要的 icon imports（`GitCompare`, `Shield`）。保留 `Search`, `Mail` 备用。

- [ ] **Step 3: 验证编译通过**

Run: `cd dashboard && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/components/pipeline/CaseworkPipeline.tsx
git commit -m "refactor(dashboard): CaseworkPipeline 8-step → 4-step (T7.1)"
```

---

## Task 2: steps.ts — 步骤路由映射

**Files:**
- Modify: `dashboard/src/routes/steps.ts`

- [ ] **Step 1: 替换 CASEWORK_PIPELINE_STEPS 定义**

找到 L60-67 的 8 步定义（含 `.t_*` 标记），替换为：

```typescript
const CASEWORK_PIPELINE_STEPS = [
  { id: 'data-refresh', label: 'Data Refresh' },
  { id: 'assess', label: 'Assess' },
  { id: 'act', label: 'Act' },
  { id: 'summarize', label: 'Summarize' },
]
```

删除所有 `startMarker` / `endMarker` 引用（V2 不用 `.t_*` 文件）。

- [ ] **Step 2: 替换 step→skill 路由映射**

找到 L205-212 的 pattern 匹配表，替换为：

```typescript
const STEP_PATTERNS: { id: string; pats: string[] }[] = [
  { id: 'data-refresh', pats: ['data-refresh', 'fetch-case-info', 'fetch-emails', 'step 1'] },
  { id: 'assess', pats: ['assess', 'compliance', 'status-judge', 'step 2'] },
  { id: 'act', pats: ['act', 'troubleshoot', 'email-draft', 'route', 'step 3'] },
  { id: 'summarize', pats: ['summarize', 'inspection', 'case-summary', 'generate-todo', 'step 4'] },
]
```

- [ ] **Step 3: 更新 API 注释头**

找到 L5-11 的注释，更新为：

```typescript
/**
 *   POST /case/:id/step/data-refresh   → /casework:data-refresh
 *   POST /case/:id/step/assess         → /casework:assess
 *   POST /case/:id/step/act            → /casework:act
 *   POST /case/:id/step/summarize      → /casework:summarize
 */
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/routes/steps.ts
git commit -m "refactor(dashboard): steps.ts 8-step → 4-step route mapping (T7.2)"
```

---

## Task 3: file-watcher.ts — 新增 events/ + pipeline-state watch

**Files:**
- Modify: `dashboard/src/watcher/file-watcher.ts`

- [ ] **Step 1: 在 classifyChange() 中新增两个分类**

在 L44 的 `if (normalized.includes('/cases/active/'))` 块内，在 todo 检查之后、generic case-updated 之前，加入：

```typescript
    // V2: Step 1 subtask events (data-refresh progress)
    if (normalized.includes('/.casework/events/')) {
      const subtaskMatch = normalized.match(/events\/(\w+)\.json$/)
      const subtask = subtaskMatch?.[1] || 'unknown'
      try {
        const eventData = JSON.parse(readFileSync(filePath, 'utf-8'))
        return { type: 'case-subtask-progress' as SSEEventType, data: { caseNumber, subtask, ...eventData } }
      } catch { return null }
    }

    // V2: Cross-step pipeline state (patrol orchestration)
    if (normalized.includes('/.casework/pipeline-state.json')) {
      try {
        const state = JSON.parse(readFileSync(filePath, 'utf-8'))
        return { type: 'patrol-pipeline-update' as SSEEventType, data: { caseNumber, ...state } }
      } catch { return null }
    }
```

- [ ] **Step 2: 在 SSEEventType 中注册新类型**

找到 SSEEventType 定义（可能在同文件或 types 文件），添加 `'case-subtask-progress'` 和 `'patrol-pipeline-update'`。

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/watcher/file-watcher.ts
git commit -m "feat(dashboard): file-watcher watches events/ + pipeline-state.json (T7.3)"
```

---

## Task 4: useSSE.ts — 新增事件处理

**Files:**
- Modify: `dashboard/web/src/hooks/useSSE.ts`

- [ ] **Step 1: 在事件监听器中新增两个 handler**

找到 L375-386 附近的 `case-pipeline-step` 和 `case-agent-spawn` 监听器。在其后添加：

```typescript
    // V2: Step 1 subtask progress (from .casework/events/*.json)
    es.addEventListener('case-subtask-progress', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data)
        // Forward to caseSessionStore for subtask-level display
        useCaseSessionStore.getState().updatePipelineStep(data.caseNumber, {
          stepId: data.subtask,
          status: data.status,
          durationMs: data.durationMs,
        })
      } catch { /* ignore parse errors */ }
    })

    // V2: Cross-step pipeline state (from .casework/pipeline-state.json)
    es.addEventListener('patrol-pipeline-update', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data)
        usePatrolStore.getState().onPipelineUpdate?.(data)
      } catch { /* ignore parse errors */ }
    })
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/hooks/useSSE.ts
git commit -m "feat(dashboard): useSSE handles subtask-progress + pipeline-update events (T7.4)"
```

---

## Task 5: patrolStore.ts — 流水线模型

**Files:**
- Modify: `dashboard/web/src/stores/patrolStore.ts`

- [ ] **Step 1: 添加 onPipelineUpdate action**

在 PatrolState interface 和 store 实现中添加：

```typescript
// Interface
onPipelineUpdate?: (data: { caseNumber: string; currentStep: string; steps: Record<string, { status: string }> }) => void

// Implementation
onPipelineUpdate: (data) => set((state) => {
  const cases = [...(state.cases || [])]
  const idx = cases.findIndex((c: any) => c.caseNumber === data.caseNumber)
  const caseState = {
    caseNumber: data.caseNumber,
    currentStep: data.currentStep,
    steps: data.steps,
  }
  if (idx >= 0) {
    cases[idx] = { ...cases[idx], ...caseState }
  } else {
    cases.push(caseState as any)
  }
  return { cases }
}),
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/stores/patrolStore.ts
git commit -m "feat(dashboard): patrolStore.onPipelineUpdate for per-case pipeline tracking (T7.5)"
```

---

## Task 6: caseSessionStore.ts — pipelineSteps 清理

**Files:**
- Modify: `dashboard/web/src/stores/caseSessionStore.ts`

- [ ] **Step 1: 保持现有 API 兼容**

`pipelineSteps` 和 `agentSpawns` 的 store API 保持不变（其他组件可能引用）。V2 的变化只是**数据内容不同**——step IDs 变成 4 个而非 8 个。无需修改 store 代码，只需确保 `updatePipelineStep` 能接受新的 step IDs。

不需要代码修改——现有 `updatePipelineStep` 是 key-value 动态结构，天然支持任意 step ID。

- [ ] **Step 2: Commit（如有改动）或 Skip**

---

## Task 7: patrol-orchestrator.ts — maxTurns 调大

**Files:**
- Modify: `dashboard/src/agent/patrol-orchestrator.ts`

- [ ] **Step 1: 找到 maxTurns 设置**

搜索 `maxTurns`，改为 300（V2 事件循环需要更多 turns）。

- [ ] **Step 2: Commit**

```bash
git add dashboard/src/agent/patrol-orchestrator.ts
git commit -m "chore(dashboard): bump patrol maxTurns 200→300 for V2 event loop (T7.7)"
```

---

## Task 8: 编译验证

- [ ] **Step 1: TypeScript 编译检查**

```bash
cd dashboard && npx tsc --noEmit 2>&1 | tail -10
```

Expected: 0 errors

- [ ] **Step 2: 启动测试**

```bash
cd dashboard && npm run dev 2>&1 &
sleep 5
curl -s http://localhost:3010/api/health | head -1
curl -s http://localhost:5173 | head -1
```

- [ ] **Step 3: Commit smoke log**

```bash
echo "$(date -u +%FT%TZ) T7 DASHBOARD V2 ADAPTATION — tsc pass, dev server healthy" \
  >> conductor/specs/casework-v2/plans/T7-dashboard-adaptation.md.smoke.log
git add conductor/specs/casework-v2/plans/
git commit -m "test(dashboard): T7 WebUI V2 adaptation smoke pass (T7.8)"
```

---

## Verification Checklist

| 验证项 | 命令 | 期望 |
|--------|------|------|
| TSC 编译 | `npx tsc --noEmit` | 0 errors |
| 8步引用清除 | `grep -r "changegate\|status-judge" dashboard/web/src/` | 0 matches (除注释) |
| 4步定义存在 | `grep "assess\|summarize" dashboard/web/src/components/pipeline/CaseworkPipeline.tsx` | 有 |
| file-watcher 新 watch | `grep "events/\|pipeline-state" dashboard/src/watcher/file-watcher.ts` | 有 |
| steps 路由更新 | `grep "casework:assess\|casework:act" dashboard/src/routes/steps.ts` | 有 |
| maxTurns | `grep "maxTurns.*300" dashboard/src/agent/patrol-orchestrator.ts` | 有 |
