# Labor Estimate Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered labor time estimation skill that reads case files, estimates effort, lets users edit, and optionally writes to D365 — with CLI, WebUI, and calibration learning.

**Architecture:** CLI skill (`.claude/skills/labor-estimate/SKILL.md`) reads case files → AI estimates → outputs `labor-estimate.json` → user edits via CLI (AskUserQuestion) or WebUI (editable table) → submits via existing `record-labor.ps1`. Backend Hono routes handle WebUI API. Frontend React page renders batch editable table.

**Tech Stack:** Claude Code Skill (Markdown), Hono (backend API), React + TanStack Query (frontend), PowerShell (D365 write via existing script)

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `.claude/skills/labor-estimate/SKILL.md` | Skill definition — AI estimation logic, CLI interaction flow |
| `skills/labor-estimate/calibration.json` | Learned user preference multipliers (created on first use) |
| `dashboard/src/routes/labor-estimate.ts` | Backend API — estimate, submit, batch endpoints |
| `dashboard/src/services/labor-estimate-service.ts` | Backend logic — read case files, run record-labor.ps1, manage calibration |
| `dashboard/web/src/pages/LaborEstimatePage.tsx` | Frontend — batch editable table with submit |
| `dashboard/web/src/api/hooks.ts` | Add hooks: `useLaborEstimate`, `useLaborEstimateAll`, `useLaborSubmit`, `useLaborBatchSubmit` |

### Modified Files

| File | Change |
|------|--------|
| `dashboard/src/index.ts` | Register labor-estimate routes |
| `dashboard/web/src/App.tsx` | Add `/labor` route |
| `dashboard/web/src/components/Layout.tsx` | Add "Labor" nav item |

---

## Task 1: Create Calibration JSON + Initialization Script

**Files:**
- Create: `skills/labor-estimate/calibration.json`
- Create: `skills/labor-estimate/init-calibration.sh`

- [ ] **Step 1: Create default calibration.json**

Create `skills/labor-estimate/calibration.json`:

```json
{
  "adjustments": {
    "troubleshooting": { "multiplier": 1.0, "samples": 0 },
    "email": { "multiplier": 1.0, "samples": 0 },
    "research": { "multiplier": 1.0, "samples": 0 },
    "notes": { "multiplier": 1.0, "samples": 0 },
    "remote_session": { "multiplier": 1.0, "samples": 0 },
    "internal_consult": { "multiplier": 1.0, "samples": 0 },
    "analysis": { "multiplier": 1.0, "samples": 0 }
  },
  "history": [],
  "lastUpdated": ""
}
```

- [ ] **Step 2: Create init-calibration.sh helper**

Create `skills/labor-estimate/init-calibration.sh`:

```bash
#!/bin/bash
# Initialize calibration.json if it doesn't exist
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CAL_FILE="$SCRIPT_DIR/calibration.json"

if [ ! -f "$CAL_FILE" ]; then
  cat > "$CAL_FILE" << 'CALEOF'
{
  "adjustments": {
    "troubleshooting": { "multiplier": 1.0, "samples": 0 },
    "email": { "multiplier": 1.0, "samples": 0 },
    "research": { "multiplier": 1.0, "samples": 0 },
    "notes": { "multiplier": 1.0, "samples": 0 },
    "remote_session": { "multiplier": 1.0, "samples": 0 },
    "internal_consult": { "multiplier": 1.0, "samples": 0 },
    "analysis": { "multiplier": 1.0, "samples": 0 }
  },
  "history": [],
  "lastUpdated": ""
}
CALEOF
  echo "calibration.json created at $CAL_FILE"
else
  echo "calibration.json already exists at $CAL_FILE"
fi
```

- [ ] **Step 3: Commit**

```bash
git add skills/labor-estimate/calibration.json skills/labor-estimate/init-calibration.sh
git commit -m "feat(labor-estimate): add calibration.json and init script"
```

---

## Task 2: Create the SKILL.md

**Files:**
- Create: `.claude/skills/labor-estimate/SKILL.md`

- [ ] **Step 1: Write the skill definition**

Create `.claude/skills/labor-estimate/SKILL.md`:

```markdown
---
description: "根据 Case 当天进展估算 Labor 时间，支持单 Case 和批量模式。AI 推算 + 用户修改 + 自动学习偏好。"
name: labor-estimate
displayName: Labor 估算
category: inline
stability: experimental
requiredInput: caseNumber or "all"
estimatedDuration: 30s per case
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# /labor-estimate — Labor 时间估算

根据 Case 当天活动（排查、邮件、分析、笔记等）智能估算 Labor 时间。

## 参数
- `$ARGUMENTS` — Case 编号（单 case）或 `all`（批量）
- 可选 `--date YYYY-MM-DD` 指定日期（默认今天）

## 配置读取
读取 `config.json` 获取 `casesRoot`。
设置 `caseDir = {casesRoot}/active/{caseNumber}/`。

## D365 Classification 可选值
- Troubleshooting（常用）
- Research（常用）
- Communications（常用）
- Tech Review
- Scoping
- Recovery & Billing
- Admin Review

## 执行步骤

### 1. 确定目标日期
- 如有 `--date` 参数，使用指定日期
- 否则使用当天日期（`date '+%Y-%m-%d'`）

### 2. 读取校准数据
```bash
cat skills/labor-estimate/calibration.json
```
记住各 effort 类型的 multiplier。

### 3. 读取 Case 文件（单 case 模式）
读取以下文件，**只关注目标日期的活动**：

- `{caseDir}/case-summary.md` — 排查进展、关键发现
- `{caseDir}/emails.md`（**只读最后 100 行**）— 当天邮件数量和复杂度
- `{caseDir}/notes.md`（**只读最后 50 行**）— 当天 notes
- `{caseDir}/analysis/*.md` — 分析报告（检查文件修改时间是否是当天）
- `{caseDir}/case-info.md` — 产品、Severity、SLA
- `{caseDir}/teams/*.md`（**只读最后 50 行**）— 当天内部沟通

如果是 `all` 模式，先列出所有活跃 case：
```bash
ls -d {casesRoot}/active/*/
```
然后逐个执行步骤 3-6。

### 4. AI 估算
根据读取的文件内容，对每种 effort 类型估算时间：

| Effort 类型 | 基准范围 | 说明 |
|-------------|---------|------|
| troubleshooting | 15-60 min | Kusto 查询、日志分析、远程排查 |
| email | 5-15 min/封 | 邮件撰写/回复 |
| research | 10-30 min | 文档查阅、KB 搜索 |
| notes | 5-10 min | Case notes 更新 |
| remote_session | 30-90 min | 远程会话 |
| internal_consult | 10-30 min | 内部讨论 |
| analysis | 15-45 min | 生成分析报告 |

**校准**：每种类型的基准值 × `calibration.json` 中对应的 `multiplier`。

**Classification 选择**：根据占比最大的 effort 类型选择对应 D365 classification。

**Description**：用英文简述当天活动（1-2 句）。

如果当天没有任何活动 → 跳过此 case，不生成估算。

### 5. 保存估算结果
```bash
mkdir -p "{caseDir}/labor"
```

写入 `{caseDir}/labor/labor-estimate.json`：
```json
{
  "date": "YYYY-MM-DD",
  "caseNumber": "...",
  "estimated": {
    "totalMinutes": 45,
    "classification": "Troubleshooting",
    "description": "Investigated VM boot failure, analyzed boot diagnostics logs",
    "breakdown": [
      {"type": "troubleshooting", "minutes": 25, "detail": "..."},
      {"type": "email", "minutes": 10, "detail": "..."}
    ]
  },
  "final": null,
  "status": "pending"
}
```

### 6. 展示结果并用 AskUserQuestion 交互

**单 case 模式**：展示估算结果，然后用 AskUserQuestion 提供选项：

选项 1："Submit to D365" — 直接提交
选项 2："Edit duration" — 修改时长（追问具体分钟数）
选项 3："Edit classification" — 修改分类（提供下拉选项）
选项 4："Edit description" — 修改描述（追问新描述）
选项 5："Skip" — 保存到本地但不提交

用户修改后，更新 labor-estimate.json，再次展示确认。

**批量模式**：汇总表格展示所有 case，然后 AskUserQuestion：

选项 1："Submit all to D365"
选项 2："Edit individual cases" — 逐个编辑
选项 3："Submit selected" — 选择提交（追问哪些 case）
选项 4："Skip all"

### 7. 提交到 D365
对每个确认提交的 case，执行：
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/record-labor.ps1 \
  -Minutes {totalMinutes} \
  -Classification "{classification}" \
  -Description "{description}"
```

⚠️ 此脚本需要在 D365 已打开对应 case 的浏览器环境中运行。

成功后更新 `labor-estimate.json` 的 `status` 为 `submitted`，`final` 填入提交值。

### 8. 更新校准数据
如果用户修改了估算值（`final` ≠ `estimated`），更新 `calibration.json`：

对每种 effort 类型，如果用户调整了总时长：
- 计算比例：`ratio = userTotal / aiTotal`
- 更新 multiplier：`new = 0.3 * ratio + 0.7 * old`
- samples += 1

追加到 history：
```json
{
  "date": "...",
  "caseNumber": "...",
  "aiTotal": 45,
  "userTotal": 60
}
```

## 输出
- 每个 case 的 `{caseDir}/labor/labor-estimate.json`
- 更新后的 `skills/labor-estimate/calibration.json`（如有校准）
```

- [ ] **Step 2: Verify skill can be listed**

```bash
ls -la .claude/skills/labor-estimate/SKILL.md
```

Expected: File exists with correct content.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/labor-estimate/SKILL.md
git commit -m "feat(labor-estimate): add SKILL.md with AI estimation logic"
```

---

## Task 3: Backend Service — Labor Estimate Logic

**Files:**
- Create: `dashboard/src/services/labor-estimate-service.ts`

- [ ] **Step 1: Create the service file**

Create `dashboard/src/services/labor-estimate-service.ts`:

```typescript
/**
 * labor-estimate-service.ts — Backend logic for labor estimation
 *
 * Handles:
 * - Reading labor-estimate.json files from case directories
 * - Executing record-labor.ps1 to submit to D365
 * - Managing calibration.json updates
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'

const execAsync = promisify(exec)

// ===== Types =====

export interface EffortBreakdown {
  type: string
  minutes: number
  detail: string
}

export interface LaborEstimate {
  date: string
  caseNumber: string
  estimated: {
    totalMinutes: number
    classification: string
    description: string
    breakdown: EffortBreakdown[]
  }
  final: {
    totalMinutes: number
    classification: string
    description: string
  } | null
  status: 'pending' | 'confirmed' | 'submitted'
}

export interface CalibrationData {
  adjustments: Record<string, { multiplier: number; samples: number }>
  history: Array<{
    date: string
    caseNumber: string
    aiTotal: number
    userTotal: number
  }>
  lastUpdated: string
}

// ===== Paths =====

function getLaborDir(caseNumber: string): string {
  return join(config.activeCasesDir, caseNumber, 'labor')
}

function getLaborEstimatePath(caseNumber: string): string {
  return join(getLaborDir(caseNumber), 'labor-estimate.json')
}

function getCalibrationPath(): string {
  return join(config.projectRoot, 'skills', 'labor-estimate', 'calibration.json')
}

// ===== Read Operations =====

export function readLaborEstimate(caseNumber: string): LaborEstimate | null {
  const filePath = getLaborEstimatePath(caseNumber)
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

export function readAllLaborEstimates(): Array<LaborEstimate & { caseTitle?: string }> {
  const activeCasesDir = config.activeCasesDir
  if (!existsSync(activeCasesDir)) return []

  const results: Array<LaborEstimate & { caseTitle?: string }> = []
  const caseDirs = readdirSync(activeCasesDir).filter(d => {
    const fullPath = join(activeCasesDir, d)
    try { return require('fs').statSync(fullPath).isDirectory() } catch { return false }
  })

  for (const caseNumber of caseDirs) {
    const estimate = readLaborEstimate(caseNumber)
    if (estimate) {
      // Try to read case title from case-info.md
      let caseTitle: string | undefined
      const caseInfoPath = join(activeCasesDir, caseNumber, 'case-info.md')
      if (existsSync(caseInfoPath)) {
        try {
          const content = readFileSync(caseInfoPath, 'utf-8')
          const titleMatch = content.match(/^#\s+(.+)/m)
          if (titleMatch) caseTitle = titleMatch[1]
        } catch { /* ignore */ }
      }
      results.push({ ...estimate, caseTitle })
    }
  }

  return results
}

export function readCalibration(): CalibrationData {
  const calPath = getCalibrationPath()
  if (!existsSync(calPath)) {
    return {
      adjustments: {
        troubleshooting: { multiplier: 1.0, samples: 0 },
        email: { multiplier: 1.0, samples: 0 },
        research: { multiplier: 1.0, samples: 0 },
        notes: { multiplier: 1.0, samples: 0 },
        remote_session: { multiplier: 1.0, samples: 0 },
        internal_consult: { multiplier: 1.0, samples: 0 },
        analysis: { multiplier: 1.0, samples: 0 },
      },
      history: [],
      lastUpdated: '',
    }
  }
  try {
    return JSON.parse(readFileSync(calPath, 'utf-8'))
  } catch {
    return { adjustments: {}, history: [], lastUpdated: '' }
  }
}

// ===== Write Operations =====

export function saveLaborEstimate(caseNumber: string, estimate: LaborEstimate): void {
  const laborDir = getLaborDir(caseNumber)
  if (!existsSync(laborDir)) {
    mkdirSync(laborDir, { recursive: true })
  }
  writeFileSync(getLaborEstimatePath(caseNumber), JSON.stringify(estimate, null, 2), 'utf-8')
}

export function updateCalibration(
  caseNumber: string,
  aiTotal: number,
  userTotal: number
): void {
  if (aiTotal <= 0 || userTotal <= 0) return
  if (aiTotal === userTotal) return // No adjustment needed

  const cal = readCalibration()
  const ratio = userTotal / aiTotal
  const ALPHA = 0.3

  // Update all adjustment multipliers proportionally
  for (const [type, adj] of Object.entries(cal.adjustments)) {
    adj.multiplier = ALPHA * ratio + (1 - ALPHA) * adj.multiplier
    adj.samples += 1
  }

  // Append to history
  cal.history.push({
    date: new Date().toISOString().slice(0, 10),
    caseNumber,
    aiTotal,
    userTotal,
  })

  // Keep history manageable (last 100 entries)
  if (cal.history.length > 100) {
    cal.history = cal.history.slice(-100)
  }

  cal.lastUpdated = new Date().toISOString().slice(0, 10)

  const calPath = getCalibrationPath()
  writeFileSync(calPath, JSON.stringify(cal, null, 2), 'utf-8')
}

// ===== D365 Submit =====

export async function submitLaborToD365(
  caseNumber: string,
  minutes: number,
  classification: string,
  description: string
): Promise<{ success: boolean; message: string }> {
  const scriptPath = join(config.scriptsDir, 'record-labor.ps1')
  if (!existsSync(scriptPath)) {
    return { success: false, message: `Script not found: ${scriptPath}` }
  }

  const escapedDesc = description.replace(/'/g, "''")
  const escapedClass = classification.replace(/'/g, "''")
  const cmd = `pwsh -NoProfile -File "${scriptPath}" -Minutes ${minutes} -Classification '${escapedClass}' -Description '${escapedDesc}'`

  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 120000 })
    const output = (stdout + stderr).trim()

    // Update the labor-estimate.json status
    const estimate = readLaborEstimate(caseNumber)
    if (estimate) {
      estimate.status = 'submitted'
      estimate.final = {
        totalMinutes: minutes,
        classification,
        description,
      }
      saveLaborEstimate(caseNumber, estimate)

      // Update calibration if user changed the estimate
      if (estimate.estimated.totalMinutes !== minutes) {
        updateCalibration(caseNumber, estimate.estimated.totalMinutes, minutes)
      }
    }

    return { success: true, message: output || `Labor ${minutes}min recorded for Case ${caseNumber}` }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}

// ===== List Active Cases =====

export function listActiveCaseNumbers(): string[] {
  const activeCasesDir = config.activeCasesDir
  if (!existsSync(activeCasesDir)) return []
  try {
    return readdirSync(activeCasesDir).filter(d => {
      const fullPath = join(activeCasesDir, d)
      try {
        return require('fs').statSync(fullPath).isDirectory()
      } catch {
        return false
      }
    })
  } catch {
    return []
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd dashboard && npx tsc --noEmit src/services/labor-estimate-service.ts 2>&1 | head -20
```

Expected: No errors (or only import-related that resolve at build time).

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/services/labor-estimate-service.ts
git commit -m "feat(labor-estimate): add backend service for estimation, calibration, and D365 submit"
```

---

## Task 4: Backend Routes

**Files:**
- Create: `dashboard/src/routes/labor-estimate.ts`
- Modify: `dashboard/src/index.ts`

- [ ] **Step 1: Create the routes file**

Create `dashboard/src/routes/labor-estimate.ts`:

```typescript
/**
 * labor-estimate.ts — Labor estimation API routes
 *
 * POST /labor-estimate/:caseNumber         — Trigger AI estimation for single case
 * GET  /labor-estimate/:caseNumber         — Get existing estimate
 * GET  /labor-estimate                     — Get all existing estimates
 * POST /labor-estimate/all                 — Trigger AI estimation for all active cases
 * POST /labor-estimate/:caseNumber/submit  — Submit single case to D365
 * POST /labor-estimate/batch-submit        — Batch submit to D365
 * PUT  /labor-estimate/:caseNumber         — Update estimate (user edits)
 */
import { Hono } from 'hono'
import {
  readLaborEstimate,
  readAllLaborEstimates,
  saveLaborEstimate,
  submitLaborToD365,
  listActiveCaseNumbers,
  type LaborEstimate,
} from '../services/labor-estimate-service.js'
import { sdkQueue } from '../utils/sdk-queue.js'
import { processCaseSession } from '../agent/case-session-manager.js'
import { broadcastSDKMessages } from '../utils/sdk-message-broadcaster.js'

const laborEstimateRoutes = new Hono()

/**
 * GET / — List all existing labor estimates
 */
laborEstimateRoutes.get('/', (c) => {
  const estimates = readAllLaborEstimates()
  return c.json({ estimates, total: estimates.length })
})

/**
 * GET /:caseNumber — Get existing estimate for a case
 */
laborEstimateRoutes.get('/:caseNumber', (c) => {
  const caseNumber = c.req.param('caseNumber')
  const estimate = readLaborEstimate(caseNumber)
  if (!estimate) {
    return c.json({ estimate: null, exists: false })
  }
  return c.json({ estimate, exists: true })
})

/**
 * POST /:caseNumber — Trigger AI estimation for a single case
 * Spawns a Claude SDK session to run /labor-estimate skill
 */
laborEstimateRoutes.post('/:caseNumber', async (c) => {
  const caseNumber = c.req.param('caseNumber')

  try {
    const result = await sdkQueue.add(async () => {
      const prompt = `/labor-estimate ${caseNumber}`
      const response = await processCaseSession(caseNumber, prompt)
      return response
    })

    // After SDK session completes, read the generated estimate
    const estimate = readLaborEstimate(caseNumber)
    return c.json({
      success: true,
      estimate,
      message: `Estimation completed for Case ${caseNumber}`,
    })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

/**
 * POST /all — Trigger AI estimation for all active cases
 * Returns estimates as they complete
 */
laborEstimateRoutes.post('/all', async (c) => {
  const caseNumbers = listActiveCaseNumbers()

  if (caseNumbers.length === 0) {
    return c.json({ success: true, estimates: [], total: 0, message: 'No active cases found' })
  }

  const results: Array<{ caseNumber: string; success: boolean; estimate?: LaborEstimate | null; error?: string }> = []

  // Process sequentially to avoid overwhelming the SDK queue
  for (const caseNumber of caseNumbers) {
    try {
      await sdkQueue.add(async () => {
        const prompt = `/labor-estimate ${caseNumber}`
        await processCaseSession(caseNumber, prompt)
      })
      const estimate = readLaborEstimate(caseNumber)
      results.push({ caseNumber, success: true, estimate })
    } catch (err: any) {
      results.push({ caseNumber, success: false, error: err.message })
    }
  }

  return c.json({
    success: true,
    estimates: results,
    total: results.length,
    submitted: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  })
})

/**
 * PUT /:caseNumber — Update estimate with user edits
 * Body: { totalMinutes?: number, classification?: string, description?: string }
 */
laborEstimateRoutes.put('/:caseNumber', async (c) => {
  const caseNumber = c.req.param('caseNumber')
  const body = await c.req.json<{
    totalMinutes?: number
    classification?: string
    description?: string
  }>()

  const estimate = readLaborEstimate(caseNumber)
  if (!estimate) {
    return c.json({ error: 'No estimate found for this case' }, 404)
  }

  // Apply user edits to the estimated values (these become the "final" when submitted)
  if (body.totalMinutes !== undefined) {
    estimate.estimated.totalMinutes = body.totalMinutes
  }
  if (body.classification !== undefined) {
    estimate.estimated.classification = body.classification
  }
  if (body.description !== undefined) {
    estimate.estimated.description = body.description
  }
  estimate.status = 'confirmed'

  saveLaborEstimate(caseNumber, estimate)
  return c.json({ success: true, estimate })
})

/**
 * POST /:caseNumber/submit — Submit single case labor to D365
 * Body: { totalMinutes: number, classification: string, description: string }
 */
laborEstimateRoutes.post('/:caseNumber/submit', async (c) => {
  const caseNumber = c.req.param('caseNumber')
  const { totalMinutes, classification, description } = await c.req.json<{
    totalMinutes: number
    classification: string
    description: string
  }>()

  if (!totalMinutes || !classification || !description) {
    return c.json({ error: 'totalMinutes, classification, and description are required' }, 400)
  }

  const result = await submitLaborToD365(caseNumber, totalMinutes, classification, description)
  return c.json(result, result.success ? 200 : 500)
})

/**
 * POST /batch-submit — Batch submit multiple cases to D365
 * Body: { items: Array<{ caseNumber, totalMinutes, classification, description }> }
 */
laborEstimateRoutes.post('/batch-submit', async (c) => {
  const { items } = await c.req.json<{
    items: Array<{
      caseNumber: string
      totalMinutes: number
      classification: string
      description: string
    }>
  }>()

  if (!items || items.length === 0) {
    return c.json({ error: 'items array is required' }, 400)
  }

  const results: Array<{ caseNumber: string; success: boolean; message: string }> = []

  for (const item of items) {
    const result = await submitLaborToD365(
      item.caseNumber,
      item.totalMinutes,
      item.classification,
      item.description
    )
    results.push({ caseNumber: item.caseNumber, ...result })
  }

  return c.json({
    results,
    total: results.length,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  })
})

export { laborEstimateRoutes }
```

- [ ] **Step 2: Register routes in index.ts**

In `dashboard/src/index.ts`, add the import and route registration.

Add import after the existing imports (around line 33):

```typescript
import { laborEstimateRoutes } from './routes/labor-estimate.js'
```

Add auth middleware (around line 76, after the existing `app.use` blocks):

```typescript
app.use('/api/labor-estimate/*', authMiddleware)
app.use('/api/labor-estimate', authMiddleware)
```

Add route registration (around line 90, after the existing `app.route` calls):

```typescript
app.route('/api/labor-estimate', laborEstimateRoutes)
```

- [ ] **Step 3: Verify build compiles**

```bash
cd dashboard && npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/routes/labor-estimate.ts dashboard/src/index.ts
git commit -m "feat(labor-estimate): add backend API routes for estimation and D365 submit"
```

---

## Task 5: Frontend API Hooks

**Files:**
- Modify: `dashboard/web/src/api/hooks.ts`

- [ ] **Step 1: Add labor estimate hooks**

Append these hooks to `dashboard/web/src/api/hooks.ts` (at the end of the file, before any final export):

```typescript
// ===== Labor Estimate =====

export interface LaborEstimateItem {
  date: string
  caseNumber: string
  caseTitle?: string
  estimated: {
    totalMinutes: number
    classification: string
    description: string
    breakdown: Array<{ type: string; minutes: number; detail: string }>
  }
  final: {
    totalMinutes: number
    classification: string
    description: string
  } | null
  status: 'pending' | 'confirmed' | 'submitted'
}

export function useLaborEstimates() {
  return useQuery({
    queryKey: ['labor-estimates'],
    queryFn: () => apiGet<{ estimates: LaborEstimateItem[]; total: number }>('/labor-estimate'),
    refetchInterval: 10_000,
  })
}

export function useLaborEstimate(caseNumber: string) {
  return useQuery({
    queryKey: ['labor-estimate', caseNumber],
    queryFn: () => apiGet<{ estimate: LaborEstimateItem | null; exists: boolean }>(`/labor-estimate/${caseNumber}`),
    enabled: !!caseNumber,
  })
}

export function useLaborEstimateTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (caseNumber: string) =>
      apiPost<{ success: boolean; estimate: LaborEstimateItem | null }>(`/labor-estimate/${caseNumber}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborEstimateAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiPost<{
        success: boolean
        estimates: Array<{ caseNumber: string; success: boolean; estimate?: LaborEstimateItem | null; error?: string }>
        total: number
      }>('/labor-estimate/all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborEstimateUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseNumber, ...body }: {
      caseNumber: string
      totalMinutes?: number
      classification?: string
      description?: string
    }) => apiPut<{ success: boolean; estimate: LaborEstimateItem }>(`/labor-estimate/${caseNumber}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborSubmit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseNumber, ...body }: {
      caseNumber: string
      totalMinutes: number
      classification: string
      description: string
    }) => apiPost<{ success: boolean; message: string }>(`/labor-estimate/${caseNumber}/submit`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborBatchSubmit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: Array<{
      caseNumber: string
      totalMinutes: number
      classification: string
      description: string
    }>) => apiPost<{
      results: Array<{ caseNumber: string; success: boolean; message: string }>
      total: number
      succeeded: number
      failed: number
    }>('/labor-estimate/batch-submit', { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/api/hooks.ts
git commit -m "feat(labor-estimate): add frontend TanStack Query hooks for labor API"
```

---

## Task 6: Frontend Page — LaborEstimatePage

**Files:**
- Create: `dashboard/web/src/pages/LaborEstimatePage.tsx`

- [ ] **Step 1: Create the page component**

Create `dashboard/web/src/pages/LaborEstimatePage.tsx`:

```tsx
/**
 * LaborEstimatePage — Batch labor estimation with editable table
 *
 * Flow:
 * 1. "Estimate All" button triggers AI estimation for all active cases
 * 2. Results shown in editable table (minutes, classification, description)
 * 3. User can edit inline, select cases, and batch submit to D365
 */
import { useState, useCallback } from 'react'
import {
  useLaborEstimates,
  useLaborEstimateAll,
  useLaborEstimateUpdate,
  useLaborBatchSubmit,
  type LaborEstimateItem,
} from '../api/hooks'

const CLASSIFICATIONS = [
  'Troubleshooting',
  'Research',
  'Communications',
  'Tech Review',
  'Scoping',
  'Recovery & Billing',
  'Admin Review',
]

interface EditableRow {
  caseNumber: string
  caseTitle?: string
  totalMinutes: number
  classification: string
  description: string
  originalMinutes: number
  selected: boolean
  status: string
}

export default function LaborEstimatePage() {
  const { data, isLoading, refetch } = useLaborEstimates()
  const estimateAll = useLaborEstimateAll()
  const updateEstimate = useLaborEstimateUpdate()
  const batchSubmit = useLaborBatchSubmit()

  const [rows, setRows] = useState<EditableRow[]>([])
  const [estimating, setEstimating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitResults, setSubmitResults] = useState<Array<{ caseNumber: string; success: boolean; message: string }> | null>(null)

  // Initialize rows from loaded estimates
  const initRowsFromEstimates = useCallback((estimates: LaborEstimateItem[]) => {
    setRows(estimates
      .filter(e => e.status !== 'submitted')
      .map(e => ({
        caseNumber: e.caseNumber,
        caseTitle: (e as any).caseTitle,
        totalMinutes: e.estimated.totalMinutes,
        classification: e.estimated.classification,
        description: e.estimated.description,
        originalMinutes: e.estimated.totalMinutes,
        selected: true,
        status: e.status,
      }))
    )
  }, [])

  // Handle "Estimate All" button
  const handleEstimateAll = async () => {
    setEstimating(true)
    setSubmitResults(null)
    try {
      const result = await estimateAll.mutateAsync()
      await refetch()
      // Build rows from fresh estimates
      const freshEstimates = result.estimates
        .filter(r => r.success && r.estimate)
        .map(r => r.estimate!)
      initRowsFromEstimates(freshEstimates)
    } catch (err) {
      console.error('Estimation failed:', err)
    } finally {
      setEstimating(false)
    }
  }

  // Load existing estimates into rows
  const handleLoadExisting = () => {
    if (data?.estimates) {
      initRowsFromEstimates(data.estimates)
    }
  }

  // Update a row field
  const updateRow = (idx: number, field: keyof EditableRow, value: any) => {
    setRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  // Toggle select all
  const toggleSelectAll = () => {
    const allSelected = rows.every(r => r.selected)
    setRows(prev => prev.map(r => ({ ...r, selected: !allSelected })))
  }

  // Submit selected rows to D365
  const handleBatchSubmit = async () => {
    const selected = rows.filter(r => r.selected)
    if (selected.length === 0) return

    setSubmitting(true)
    setSubmitResults(null)
    try {
      const result = await batchSubmit.mutateAsync(
        selected.map(r => ({
          caseNumber: r.caseNumber,
          totalMinutes: r.totalMinutes,
          classification: r.classification,
          description: r.description,
        }))
      )
      setSubmitResults(result.results)
      // Remove submitted rows
      const succeededCases = new Set(result.results.filter(r => r.success).map(r => r.caseNumber))
      setRows(prev => prev.filter(r => !succeededCases.has(r.caseNumber)))
      await refetch()
    } catch (err) {
      console.error('Batch submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const totalMinutes = rows.reduce((sum, r) => sum + (r.selected ? r.totalMinutes : 0), 0)
  const selectedCount = rows.filter(r => r.selected).length
  const hasExistingEstimates = (data?.estimates?.length ?? 0) > 0
  const pendingEstimates = data?.estimates?.filter(e => e.status !== 'submitted') ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Labor Estimates</h1>
          <p className="text-sm text-muted mt-1">
            AI-powered labor time estimation for D365 cases
          </p>
        </div>
        <div className="flex gap-2">
          {pendingEstimates.length > 0 && (
            <button
              onClick={handleLoadExisting}
              className="px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors"
            >
              Load Existing ({pendingEstimates.length})
            </button>
          )}
          <button
            onClick={handleEstimateAll}
            disabled={estimating}
            className="px-4 py-2 text-sm rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {estimating ? (
              <>
                <span className="animate-spin">⏳</span>
                Estimating...
              </>
            ) : (
              <>🧮 Estimate All</>
            )}
          </button>
        </div>
      </div>

      {/* Submit Results */}
      {submitResults && (
        <div className={`p-4 rounded-lg border ${
          submitResults.every(r => r.success)
            ? 'border-accent-green/30 bg-accent-green/5'
            : 'border-accent-yellow/30 bg-accent-yellow/5'
        }`}>
          <h3 className="font-medium text-sm mb-2">Submit Results</h3>
          {submitResults.map((r, i) => (
            <div key={i} className="text-sm">
              {r.success ? '✅' : '❌'} Case {r.caseNumber}: {r.message}
            </div>
          ))}
        </div>
      )}

      {/* Editable Table */}
      {rows.length > 0 ? (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-secondary text-xs text-muted uppercase tracking-wider">
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={rows.every(r => r.selected)}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-left">Case</th>
                  <th className="p-3 text-left w-24">Minutes</th>
                  <th className="p-3 text-left w-48">Classification</th>
                  <th className="p-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, idx) => (
                  <tr key={row.caseNumber} className="hover:bg-surface-hover transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => updateRow(idx, 'selected', !row.selected)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">{row.caseNumber}</div>
                      {row.caseTitle && (
                        <div className="text-xs text-muted truncate max-w-[200px]">{row.caseTitle}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={row.totalMinutes}
                        onChange={(e) => updateRow(idx, 'totalMinutes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={480}
                        className="w-20 px-2 py-1 text-sm bg-surface border border-border rounded focus:border-accent-blue focus:outline-none text-foreground"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={row.classification}
                        onChange={(e) => updateRow(idx, 'classification', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-surface border border-border rounded focus:border-accent-blue focus:outline-none text-foreground"
                      >
                        {CLASSIFICATIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(idx, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-surface border border-border rounded focus:border-accent-blue focus:outline-none text-foreground"
                        placeholder="Labor description..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">
              {selectedCount} selected · Total: <span className="font-mono font-medium text-foreground">{totalMinutes}</span> min
            </div>
            <button
              onClick={handleBatchSubmit}
              disabled={submitting || selectedCount === 0}
              className="px-6 py-2 text-sm rounded-lg bg-accent-green text-white hover:bg-accent-green/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Submitting...
                </>
              ) : (
                <>📤 Submit Selected ({selectedCount})</>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-4">🧮</div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Labor Estimates</h3>
          <p className="text-sm">
            Click "Estimate All" to analyze today's activities across all active cases.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/pages/LaborEstimatePage.tsx
git commit -m "feat(labor-estimate): add frontend page with editable batch table"
```

---

## Task 7: Wire Up Frontend Routes and Navigation

**Files:**
- Modify: `dashboard/web/src/App.tsx`
- Modify: `dashboard/web/src/components/Layout.tsx`

- [ ] **Step 1: Add route in App.tsx**

In `dashboard/web/src/App.tsx`, add the import at the top (after other lazy/page imports):

```typescript
import LaborEstimatePage from './pages/LaborEstimatePage'
```

Add the route inside `<Routes>` (after the `/todo` route, around line 32):

```tsx
<Route path="/labor" element={<LaborEstimatePage />} />
```

- [ ] **Step 2: Add nav item in Layout.tsx**

In `dashboard/web/src/components/Layout.tsx`, add a nav entry in the `navItems` array (after the Todo entry, around line 26):

```typescript
{ path: '/labor', label: 'Labor', icon: '⏱️' },
```

- [ ] **Step 3: Verify frontend builds**

```bash
cd dashboard/web && npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/App.tsx dashboard/web/src/components/Layout.tsx
git commit -m "feat(labor-estimate): wire up frontend route and sidebar navigation"
```

---

## Task 8: Integration Test — Full Flow Smoke Test

**Files:** No new files — manual verification steps.

- [ ] **Step 1: Start the dashboard dev server**

```bash
cd dashboard && npm run dev &
```

Wait for server to start on port 3001.

- [ ] **Step 2: Test GET /api/labor-estimate returns empty list**

```bash
curl -s http://localhost:3001/api/labor-estimate | jq .
```

Expected:
```json
{ "estimates": [], "total": 0 }
```

- [ ] **Step 3: Verify the CLI skill is readable**

```bash
cat .claude/skills/labor-estimate/SKILL.md | head -15
```

Expected: Skill frontmatter with `name: labor-estimate`.

- [ ] **Step 4: Verify calibration.json exists**

```bash
cat skills/labor-estimate/calibration.json | jq .adjustments.troubleshooting
```

Expected:
```json
{ "multiplier": 1, "samples": 0 }
```

- [ ] **Step 5: Verify frontend page loads**

Navigate to `http://localhost:3001/labor` in browser. Should see:
- "Labor Estimates" heading
- "Estimate All" button
- Empty state with 🧮 icon

- [ ] **Step 6: Commit (if any fixes were needed)**

If any issues were found and fixed during testing:

```bash
git add -A
git commit -m "fix(labor-estimate): smoke test fixes"
```
