# Skill Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SKILL.md frontmatter the single source of truth for WebUI skill invocation, replacing hardcoded stepPrompts in the backend.

**Architecture:** A SkillRegistryService scans `.claude/skills/*/SKILL.md` at startup, parses YAML frontmatter into a typed registry, and exposes `getPrompt(name, params)` for the session manager. File watcher enables hot-reload. A `/api/skills` endpoint lets the frontend dynamically discover available skills.

**Tech Stack:** TypeScript, Hono.js, gray-matter (YAML frontmatter parser), chokidar (file watching)

**Spec:** `docs/superpowers/specs/2026-04-01-skill-registry-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `dashboard/src/services/skill-registry.ts` | Parse SKILL.md frontmatter, build registry, expose getPrompt/listSkills |
| Create | `dashboard/src/routes/skill-routes.ts` | `GET /api/skills`, `GET /api/skills/:name` endpoints |
| Modify | `.claude/skills/*/SKILL.md` (all 21) | Add registry frontmatter fields |
| Modify | `dashboard/src/agent/case-session-manager.ts:956-970` | Replace `stepPrompts` dict with registry calls |
| Modify | `dashboard/src/routes/steps.ts:45-54` | Replace `VALID_STEPS` with registry lookup |
| Modify | `dashboard/src/watcher/file-watcher.ts:207-221,180-203` | Add SKILL.md watch path + classifyChange case |
| Modify | `dashboard/src/index.ts:71-81` | Register skill-routes |
| Modify | `dashboard/web/src/components/CaseAIPanel.tsx:32,417-423` | Dynamic skill list from API |

---

### Task 1: Install gray-matter dependency

**Files:**
- Modify: `dashboard/package.json`

- [ ] **Step 1: Install gray-matter**

```bash
cd dashboard && npm install gray-matter
```

- [ ] **Step 2: Verify installation**

```bash
cd dashboard && node -e "const m = require('gray-matter'); console.log('gray-matter OK', typeof m)"
```
Expected: `gray-matter OK function`

- [ ] **Step 3: Commit**

```bash
git add dashboard/package.json dashboard/package-lock.json
git commit -m "chore: add gray-matter for SKILL.md frontmatter parsing"
```

---

### Task 2: Add frontmatter to all SKILL.md files (WebUI-exposed skills)

These 8 skills are currently in the `stepPrompts` dictionary and need full registry frontmatter. Existing frontmatter fields (`description`, `allowed-tools`, `name`) are preserved; new fields are added.

**Files:**
- Modify: `.claude/skills/data-refresh/SKILL.md`
- Modify: `.claude/skills/compliance-check/SKILL.md`
- Modify: `.claude/skills/status-judge/SKILL.md`
- Modify: `.claude/skills/teams-search/SKILL.md`
- Modify: `.claude/skills/troubleshoot/SKILL.md`
- Modify: `.claude/skills/draft-email/SKILL.md`
- Modify: `.claude/skills/inspection-writer/SKILL.md`
- Modify: `.claude/skills/casework/SKILL.md`

- [ ] **Step 1: Add frontmatter to data-refresh/SKILL.md**

Add these fields to the existing YAML frontmatter (keep existing `description` and `allowed-tools`):

```yaml
---
name: data-refresh
displayName: 数据刷新
description: "拉取 Case 最新数据 + ICM 信息。可独立调用 /data-refresh {caseNumber}，也被 casework 内联执行。"
category: inline
stability: stable
requiredInput: caseNumber
mcpServers: [icm]
estimatedDuration: 30s
promptTemplate: |
  Execute data-refresh for Case {caseNumber}. Read .claude/skills/data-refresh/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---
```

- [ ] **Step 2: Add frontmatter to compliance-check/SKILL.md**

```yaml
---
name: compliance-check
displayName: 合规检查
description: "Entitlement 合规检查 + 21v Convert 检测 + RDSE CC Finder，upsert casehealth-meta.json。可独立调用 /compliance-check {caseNumber}，也被 casework 内联执行。"
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 20s
promptTemplate: |
  Execute compliance-check for Case {caseNumber}. Read .claude/skills/compliance-check/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
---
```

- [ ] **Step 3: Add frontmatter to status-judge/SKILL.md**

```yaml
---
name: status-judge
displayName: 状态判断
description: "判断 Case 的 actualStatus 和 daysSinceLastContact，upsert 到 casehealth-meta.json。可独立调用 /status-judge {caseNumber}，也被 casework 内联执行。"
category: inline
stability: stable
requiredInput: caseNumber
mcpServers: [icm]
estimatedDuration: 15s
promptTemplate: |
  Execute status-judge for Case {caseNumber}. Read .claude/skills/status-judge/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---
```

- [ ] **Step 4: Add frontmatter to teams-search/SKILL.md**

```yaml
---
name: teams-search
displayName: Teams 搜索
description: "Teams 消息搜索（KQL 并行）+ 落盘到 teams/"
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 25s
promptTemplate: |
  Execute teams-search for Case {caseNumber}{forceRefresh}{fullSearch}. Read .claude/skills/teams-search/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
---
```

Note: `{forceRefresh}` and `{fullSearch}` are optional params that the registry fills as ` --force-refresh` or empty string.

- [ ] **Step 5: Add frontmatter to troubleshoot/SKILL.md**

```yaml
---
name: troubleshoot
displayName: 技术排查
description: "单独技术排查：对指定 Case 执行 Kusto 诊断、文档搜索等技术分析，输出分析报告。"
category: agent
stability: stable
requiredInput: caseNumber
mcpServers: [kusto, msft-learn, icm, local-rag]
estimatedDuration: 120s
promptTemplate: |
  Execute troubleshoot for Case {caseNumber}. Read .claude/skills/troubleshoot/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---
```

- [ ] **Step 6: Add frontmatter to draft-email/SKILL.md**

```yaml
---
name: draft-email
displayName: 邮件草稿
description: "单独写邮件草稿：对指定 Case 生成指定类型的邮件草稿（initial-response/follow-up/closure 等）。"
category: agent
stability: stable
requiredInput: caseNumber
estimatedDuration: 60s
promptTemplate: |
  Execute draft-email for Case {caseNumber}.{emailTypeInstruction} Read .claude/skills/draft-email/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - Agent
---
```

Note: `{emailTypeInstruction}` is filled by the step handler based on user selection.

- [ ] **Step 7: Add frontmatter to inspection-writer/SKILL.md**

```yaml
---
name: inspection-writer
displayName: 汇总 & Todo
description: "case-summary 增量更新 + 规则化 todo 生成。可独立调用 /inspection-writer {caseNumber}，也被 casework 内联执行。"
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 30s
webUiAlias: inspection
promptTemplate: |
  Execute inspection-writer for Case {caseNumber}. This updates case-summary.md (incremental narrative) and generates todo via generate-todo.sh. Read .claude/skills/inspection-writer/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
---
```

Note: `webUiAlias: inspection` maps the WebUI step name "inspection" to this skill.

- [ ] **Step 8: Add frontmatter to casework/SKILL.md (orchestrator)**

```yaml
---
name: casework
displayName: Case 全流程处理
description: "Case 全流程处理：数据刷新 → 合规检查 → 状态判断 → 技术排查/邮件 → Inspection。用于处理单个 D365 Case。"
category: orchestrator
stability: stable
requiredInput: caseNumber
steps:
  - data-refresh
  - compliance-check
  - status-judge
  - teams-search
  - troubleshoot
  - draft-email
  - inspection-writer
promptTemplate: |
  Process Case {caseNumber}. Read .claude/skills/casework/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---
```

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/*/SKILL.md
git commit -m "feat: add skill registry frontmatter to all WebUI-exposed skills"
```

---

### Task 3: Add frontmatter to remaining SKILL.md files (non-WebUI skills)

These skills are CLI-only or utility skills. They get minimal frontmatter with `stability: dev` so they don't appear in WebUI.

**Files:**
- Modify: `.claude/skills/email-search/SKILL.md`
- Modify: `.claude/skills/icm-fill/SKILL.md`
- Modify: `.claude/skills/kusto-query/SKILL.md`
- Modify: `.claude/skills/onenote-export/SKILL.md`
- Modify: `.claude/skills/onenote-search/SKILL.md`
- Modify: `.claude/skills/patch-compact/SKILL.md`
- Modify: `.claude/skills/patrol/SKILL.md`
- Modify: `.claude/skills/prd-creator/SKILL.md`
- Modify: `.claude/skills/product-learn/SKILL.md`
- Modify: `.claude/skills/rag-sync/SKILL.md`
- Modify: `.claude/skills/issue/SKILL.md`
- Modify: `.claude/skills/stage-worker/SKILL.md`
- Modify: `.claude/skills/test-supervisor/SKILL.md`

- [ ] **Step 1: Add frontmatter to patrol/SKILL.md**

patrol is special — it's WebUI-exposed via `/api/patrol` but not as a step. Mark it stable.

```yaml
---
name: patrol
displayName: 批量巡检
description: "批量巡检：获取所有活跃 Case 列表，筛选有变化的 Case，逐个执行 casework 流程，汇总 Todo。"
category: orchestrator
stability: stable
promptTemplate: |
  Execute patrol. Read .claude/skills/patrol/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---
```

- [ ] **Step 2: Add frontmatter to email-search/SKILL.md**

```yaml
---
name: email-search
displayName: 邮件搜索
description: "通过 Office Mail MCP 搜索 Case 相关邮件完整内容。"
category: inline
stability: dev
requiredInput: caseNumber
promptTemplate: |
  Execute email-search for Case {caseNumber}. Read .claude/skills/email-search/SKILL.md for full instructions.
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__mail__SearchMessagesQueryParameters
  - mcp__mail__GetMessage
---
```

- [ ] **Step 3: Add minimal frontmatter to remaining CLI-only skills**

For each of these files, add `name`, `displayName`, `description`, `category: inline`, `stability: dev` to existing frontmatter. No `promptTemplate` needed (CLI-only).

Files: `icm-fill`, `kusto-query`, `onenote-export`, `onenote-search`, `patch-compact`, `prd-creator`, `product-learn`, `rag-sync`, `issue`, `stage-worker`, `test-supervisor`.

Example for `icm-fill/SKILL.md`:
```yaml
---
name: icm-fill
displayName: ICM 填写
description: "ICM 模板填写：从 case 数据自动生成 ICM 内容，支持浏览器自动填写。"
category: inline
stability: dev
# ... keep existing allowed-tools ...
---
```

For `issue/SKILL.md`, `rag-sync/SKILL.md`, `stage-worker/SKILL.md`, `test-supervisor/SKILL.md` — these currently have no frontmatter. Add a new frontmatter block before the existing `# Title` line:

```yaml
---
name: issue
displayName: Issue Tracker
description: "记录问题/需求到 issues/ 目录"
category: inline
stability: dev
---
# Issue — CLI Issue Tracker
...
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/*/SKILL.md
git commit -m "feat: add registry frontmatter to CLI-only skills (stability: dev)"
```

---

### Task 4: Create SkillRegistryService

**Files:**
- Create: `dashboard/src/services/skill-registry.ts`

- [ ] **Step 1: Create the service file**

```typescript
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import matter from 'gray-matter'

export interface SkillMeta {
  name: string
  displayName: string
  description: string
  category: 'inline' | 'agent' | 'orchestrator'
  stability: 'stable' | 'beta' | 'dev'
  requiredInput?: string
  mcpServers?: string[]
  estimatedDuration?: string
  version?: string
  promptTemplate?: string
  steps?: string[]
  webUiAlias?: string
}

const REQUIRED_FIELDS: (keyof SkillMeta)[] = ['name', 'displayName', 'description', 'category', 'stability']
const VALID_CATEGORIES = ['inline', 'agent', 'orchestrator'] as const
const VALID_STABILITIES = ['stable', 'beta', 'dev'] as const

class SkillRegistryService {
  private registry = new Map<string, SkillMeta>()
  private aliasMap = new Map<string, string>() // webUiAlias → name
  private skillsDir: string

  constructor(projectRoot: string) {
    this.skillsDir = join(projectRoot, '.claude', 'skills')
  }

  /**
   * Scan .claude/skills/star/SKILL.md and build registry.
   */
  initialize(): void {
    if (!existsSync(this.skillsDir)) {
      console.warn(`[skill-registry] Skills directory not found: ${this.skillsDir}`)
      return
    }

    const dirs = readdirSync(this.skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const dir of dirs) {
      this.loadSkill(dir)
    }

    console.log(`[skill-registry] Loaded ${this.registry.size} skills (${[...this.registry.values()].filter(s => s.stability !== 'dev').length} WebUI-visible)`)
  }

  /**
   * Load or reload a single skill from its directory.
   */
  loadSkill(dirName: string): void {
    const skillPath = join(this.skillsDir, dirName, 'SKILL.md')
    if (!existsSync(skillPath)) return

    try {
      const content = readFileSync(skillPath, 'utf-8')
      const { data } = matter(content)

      if (!data || Object.keys(data).length === 0) {
        console.warn(`[skill-registry] No frontmatter in ${skillPath}, skipping`)
        return
      }

      // Validate required fields
      const missing = REQUIRED_FIELDS.filter(f => !data[f])
      if (missing.length > 0) {
        console.warn(`[skill-registry] ${dirName}: missing required fields: ${missing.join(', ')}, skipping`)
        return
      }

      // Validate enum values
      if (!VALID_CATEGORIES.includes(data.category)) {
        console.warn(`[skill-registry] ${dirName}: invalid category "${data.category}", skipping`)
        return
      }
      if (!VALID_STABILITIES.includes(data.stability)) {
        console.warn(`[skill-registry] ${dirName}: invalid stability "${data.stability}", skipping`)
        return
      }

      const meta: SkillMeta = {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        category: data.category,
        stability: data.stability,
        requiredInput: data.requiredInput,
        mcpServers: data.mcpServers,
        estimatedDuration: data.estimatedDuration,
        version: data.version,
        promptTemplate: data.promptTemplate,
        steps: data.steps,
        webUiAlias: data.webUiAlias,
      }

      this.registry.set(meta.name, meta)

      // Register alias if present
      if (meta.webUiAlias) {
        this.aliasMap.set(meta.webUiAlias, meta.name)
      }
    } catch (err) {
      console.error(`[skill-registry] Error loading ${skillPath}:`, err)
    }
  }

  /**
   * Get skill by name or webUiAlias.
   */
  getSkill(nameOrAlias: string): SkillMeta | undefined {
    return this.registry.get(nameOrAlias) ?? this.registry.get(this.aliasMap.get(nameOrAlias) ?? '')
  }

  /**
   * List all skills, optionally including dev-stability skills.
   */
  listSkills(options?: { includeDev?: boolean }): SkillMeta[] {
    const all = [...this.registry.values()]
    if (options?.includeDev) return all
    return all.filter(s => s.stability !== 'dev')
  }

  /**
   * Get prompt for a skill with variable substitution.
   * Returns null if skill not found or has no promptTemplate.
   */
  getPrompt(nameOrAlias: string, params: Record<string, string>): string | null {
    const skill = this.getSkill(nameOrAlias)
    if (!skill?.promptTemplate) return null

    let prompt = skill.promptTemplate
    for (const [key, value] of Object.entries(params)) {
      prompt = prompt.replaceAll(`{${key}}`, value)
    }
    return prompt.trim()
  }

  /**
   * Reload a single skill when its SKILL.md changes.
   */
  reloadSkill(changedPath: string): void {
    // Extract skill directory name from path like .claude/skills/data-refresh/SKILL.md
    const normalized = changedPath.replace(/\\/g, '/')
    const match = normalized.match(/\.claude\/skills\/([^/]+)\/SKILL\.md/)
    if (!match) return

    const dirName = match[1]
    const oldSkill = this.registry.get(dirName)
    this.registry.delete(dirName)

    // Remove old alias
    if (oldSkill?.webUiAlias) {
      this.aliasMap.delete(oldSkill.webUiAlias)
    }

    this.loadSkill(dirName)
    console.log(`[skill-registry] Reloaded skill: ${dirName}`)
  }

  /**
   * Get the orchestrator's step list, resolved to full SkillMeta objects.
   */
  getOrchestratorSteps(orchestratorName: string): SkillMeta[] {
    const orchestrator = this.getSkill(orchestratorName)
    if (!orchestrator?.steps) return []

    return orchestrator.steps
      .map(stepName => this.getSkill(stepName))
      .filter((s): s is SkillMeta => s !== undefined)
  }
}

// Singleton instance — initialized in index.ts
let _instance: SkillRegistryService | null = null

export function initSkillRegistry(projectRoot: string): SkillRegistryService {
  _instance = new SkillRegistryService(projectRoot)
  _instance.initialize()
  return _instance
}

export function getSkillRegistry(): SkillRegistryService {
  if (!_instance) throw new Error('SkillRegistryService not initialized. Call initSkillRegistry() first.')
  return _instance
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd dashboard && npx tsc --noEmit src/services/skill-registry.ts
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/services/skill-registry.ts
git commit -m "feat: add SkillRegistryService with frontmatter parsing and hot-reload"
```

---

### Task 5: Create skill-routes API endpoint

**Files:**
- Create: `dashboard/src/routes/skill-routes.ts`
- Modify: `dashboard/src/index.ts`

- [ ] **Step 1: Create skill-routes.ts**

```typescript
import { Hono } from 'hono'
import { getSkillRegistry } from '../services/skill-registry.js'

const skillRoutes = new Hono()

/**
 * GET /api/skills
 * List all registered skills (excludes dev by default).
 * Query: ?includeDev=true to include dev-stability skills.
 */
skillRoutes.get('/', (c) => {
  const includeDev = c.req.query('includeDev') === 'true'
  const skills = getSkillRegistry().listSkills({ includeDev })
  return c.json(skills.map(s => ({
    name: s.name,
    displayName: s.displayName,
    description: s.description,
    category: s.category,
    stability: s.stability,
    requiredInput: s.requiredInput,
    estimatedDuration: s.estimatedDuration,
    steps: s.steps,
    webUiAlias: s.webUiAlias,
  })))
})

/**
 * GET /api/skills/:name
 * Get a single skill's details.
 */
skillRoutes.get('/:name', (c) => {
  const name = c.req.param('name')
  const skill = getSkillRegistry().getSkill(name)
  if (!skill) {
    return c.json({ error: `Skill "${name}" not found` }, 404)
  }
  return c.json({
    name: skill.name,
    displayName: skill.displayName,
    description: skill.description,
    category: skill.category,
    stability: skill.stability,
    requiredInput: skill.requiredInput,
    mcpServers: skill.mcpServers,
    estimatedDuration: skill.estimatedDuration,
    version: skill.version,
    steps: skill.steps,
    webUiAlias: skill.webUiAlias,
  })
})

export { skillRoutes }
```

- [ ] **Step 2: Register route in index.ts**

In `dashboard/src/index.ts`, add import and route registration:

```typescript
// Add import at top with other route imports:
import { skillRoutes } from './routes/skill-routes.js'

// Add route registration after existing routes (after line 81):
app.route('/api/skills', skillRoutes)

// Add auth middleware (after line 68):
app.use('/api/skills', authMiddleware)
app.use('/api/skills/*', authMiddleware)
```

- [ ] **Step 3: Initialize registry in index.ts**

Add registry initialization before route registration:

```typescript
// Add import:
import { initSkillRegistry } from './services/skill-registry.js'

// Add before routes (around line 70):
initSkillRegistry(config.projectRoot)
```

- [ ] **Step 4: Verify compilation**

```bash
cd dashboard && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/routes/skill-routes.ts dashboard/src/index.ts
git commit -m "feat: add /api/skills endpoint and initialize skill registry"
```

---

### Task 6: Replace stepPrompts with registry in case-session-manager

**Files:**
- Modify: `dashboard/src/agent/case-session-manager.ts:956-970`
- Modify: `dashboard/src/routes/steps.ts:45-54`

- [ ] **Step 1: Refactor stepCaseSession to use registry**

In `dashboard/src/agent/case-session-manager.ts`, replace the `stepPrompts` dictionary (lines 956-969) with:

```typescript
import { getSkillRegistry } from '../services/skill-registry.js'

// Inside stepCaseSession function, replace lines 956-969:

  // Build dynamic params for prompt template
  const promptParams: Record<string, string> = {
    caseNumber,
  }

  // Handle step-specific params
  if (stepName === 'draft-email') {
    const emailTypeInstruction = (() => {
      if (!options?.emailType || options.emailType === 'auto') return ''
      return ` The email type is: "${options.emailType}". Draft accordingly.`
    })()
    promptParams.emailTypeInstruction = emailTypeInstruction
  }

  if (stepName === 'teams-search') {
    promptParams.forceRefresh = options?.forceRefresh ? ' --force-refresh' : ''
    promptParams.fullSearch = options?.fullSearch ? ' --full-search' : ''
  }

  // Look up prompt from skill registry
  const prompt = getSkillRegistry().getPrompt(stepName, promptParams)
  if (!prompt) {
    const available = getSkillRegistry().listSkills().map(s => s.webUiAlias || s.name)
    throw new Error(`Unknown step: ${stepName}. Available: ${available.join(', ')}`)
  }
```

Also remove the old `emailTypeInstruction` block (lines 948-953) since it's now inlined above.

- [ ] **Step 2: Replace VALID_STEPS in steps.ts with registry lookup**

In `dashboard/src/routes/steps.ts`, replace the hardcoded `VALID_STEPS` array (lines 45-54):

```typescript
import { getSkillRegistry } from '../services/skill-registry.js'

// Replace lines 45-56:
function getValidSteps(): string[] {
  const registry = getSkillRegistry()
  const skills = registry.listSkills()
  const steps: string[] = []
  for (const skill of skills) {
    steps.push(skill.webUiAlias || skill.name)
  }
  return steps
}

type StepName = string
```

Update the validation in the step route handler to use `getValidSteps()`:

```typescript
// Replace the static check with:
const validSteps = getValidSteps()
if (!validSteps.includes(stepName)) {
  return c.json({ error: `Invalid step: ${stepName}. Valid: ${validSteps.join(', ')}` }, 400)
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd dashboard && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 4: Manual test — start server and call API**

```bash
cd dashboard && npm run dev:server &
sleep 5
curl -s http://localhost:3010/api/skills | jq '.[].name'
curl -s http://localhost:3010/api/skills/data-refresh | jq '.name, .promptTemplate'
```
Expected: Skills listed, prompt template shown for data-refresh

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/agent/case-session-manager.ts dashboard/src/routes/steps.ts
git commit -m "refactor: replace hardcoded stepPrompts with SkillRegistryService"
```

---

### Task 7: Add SKILL.md file watching for hot-reload

**Files:**
- Modify: `dashboard/src/watcher/file-watcher.ts`

- [ ] **Step 1: Add watch path and classifyChange case**

In `file-watcher.ts`, add to the `watchPaths` array (after line 221):

```typescript
join(config.projectRoot, '.claude', 'skills', '**', 'SKILL.md'),
```

Add to `classifyChange()` function (before the `return null` at line 203):

```typescript
  if (normalized.includes('/.claude/skills/') && normalized.endsWith('/SKILL.md')) {
    // Hot-reload skill registry
    try {
      const { getSkillRegistry } = await import('../services/skill-registry.js')
      getSkillRegistry().reloadSkill(normalized)
    } catch (e) {
      console.warn('[watcher] Failed to reload skill registry:', e)
    }
    return { type: 'skill-registry-updated', data: {} }
  }
```

Note: `classifyChange` needs to become `async` or use a fire-and-forget pattern. Since the watcher callback already handles this, use a sync approach: import at top level instead.

Alternative (simpler — import at top level):

```typescript
// At top of file-watcher.ts:
import { getSkillRegistry } from '../services/skill-registry.js'

// In classifyChange(), before return null:
  if (normalized.includes('/.claude/skills/') && normalized.endsWith('/SKILL.md')) {
    try { getSkillRegistry().reloadSkill(normalized) } catch {}
    return { type: 'skill-registry-updated', data: {} }
  }
```

- [ ] **Step 2: Verify compilation**

```bash
cd dashboard && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Manual test — modify a SKILL.md while server runs**

Start server, then modify a SKILL.md. Check logs for `[skill-registry] Reloaded skill:` message.

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/watcher/file-watcher.ts
git commit -m "feat: add SKILL.md hot-reload via file watcher"
```

---

### Task 8: Add generate-kb to skill registry

The `generate-kb` step is currently in `stepPrompts` but doesn't have its own SKILL.md directory. It needs special handling.

**Files:**
- Create: `.claude/skills/generate-kb/SKILL.md`

- [ ] **Step 1: Create generate-kb SKILL.md**

```bash
mkdir -p .claude/skills/generate-kb
```

Create `.claude/skills/generate-kb/SKILL.md`:

```yaml
---
name: generate-kb
displayName: 知识库文章
description: "Case 关闭时生成 Knowledge Base 文章"
category: inline
stability: beta
requiredInput: caseNumber
estimatedDuration: 60s
promptTemplate: |
  Case {caseNumber} is being closed. Read all case data from the case directory and generate a Knowledge Base article. Save to the case directory under kb/kb-article.md.
---

# Generate KB Article

Read all case data and generate a structured Knowledge Base article for future reference.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/generate-kb/
git commit -m "feat: add generate-kb skill with registry frontmatter"
```

---

### Task 9: Frontend — dynamic skill list from API (Phase 2)

**Files:**
- Modify: `dashboard/web/src/components/CaseAIPanel.tsx`
- Modify: `dashboard/web/src/api/hooks.ts` (add useSkills hook)

- [ ] **Step 1: Add useSkills hook**

In `dashboard/web/src/api/hooks.ts`, add:

```typescript
export interface SkillInfo {
  name: string
  displayName: string
  description: string
  category: 'inline' | 'agent' | 'orchestrator'
  stability: 'stable' | 'beta' | 'dev'
  requiredInput?: string
  estimatedDuration?: string
  steps?: string[]
  webUiAlias?: string
}

export function useSkills() {
  return useQuery<SkillInfo[]>({
    queryKey: ['skills'],
    queryFn: () => apiFetch('/api/skills'),
    staleTime: 60_000, // 1 minute — skills don't change often
  })
}
```

- [ ] **Step 2: Replace hardcoded quickActions in CaseAIPanel**

In `CaseAIPanel.tsx`, replace the hardcoded `quickActions` array (lines 417-424) and the `AIAction` type (line 32) with dynamic data:

```typescript
// Remove hardcoded AIAction type (line 32)
// Replace with:
type AIAction = 'process' | string  // dynamic from registry

// Replace quickActions (lines 417-424) with:
const { data: skills } = useSkills()

// Icon mapping for known skills
const SKILL_ICONS: Record<string, typeof RefreshCw> = {
  'data-refresh': RefreshCw,
  'teams-search': MessageSquare,
  'status-judge': GitBranch,
  'troubleshoot': Search,
  'inspection': FileText,     // webUiAlias
  'inspection-writer': FileText,
  'generate-kb': BookOpen,
  'draft-email': Mail,
  'compliance-check': Shield,
}

const SKILL_COLORS: Record<string, string> = {
  'data-refresh': 'var(--accent-blue)',
  'teams-search': 'var(--accent-purple)',
  'status-judge': 'var(--accent-amber)',
  'troubleshoot': 'var(--accent-red)',
  'inspection-writer': 'var(--accent-blue)',
  'generate-kb': 'var(--accent-purple)',
}

const quickActions = (skills ?? [])
  .filter(s => s.category !== 'orchestrator' && s.stability !== 'dev')
  .filter(s => s.name !== 'draft-email' && s.name !== 'compliance-check') // these have special UI
  .map(s => ({
    id: s.webUiAlias || s.name,
    icon: SKILL_ICONS[s.webUiAlias || s.name] || Zap,
    label: s.displayName,
    color: SKILL_COLORS[s.webUiAlias || s.name] || 'var(--accent-blue)',
    stability: s.stability,
  }))
```

- [ ] **Step 3: Add beta badge to skill buttons**

In the button rendering loop, add a beta indicator:

```typescript
{action.stability === 'beta' && (
  <span className="text-[9px] text-amber-400 ml-0.5">beta</span>
)}
```

- [ ] **Step 4: Verify frontend compiles**

```bash
cd dashboard/web && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add dashboard/web/src/api/hooks.ts dashboard/web/src/components/CaseAIPanel.tsx
git commit -m "feat: frontend dynamic skill list from /api/skills registry"
```

---

### Task 10: End-to-end verification

- [ ] **Step 1: Start full stack**

```bash
cd dashboard && npm run dev
```

- [ ] **Step 2: Verify API returns skills**

```bash
curl -s http://localhost:3010/api/skills | jq '.[].name'
```
Expected: `data-refresh`, `compliance-check`, `status-judge`, `teams-search`, `troubleshoot`, `draft-email`, `inspection-writer`, `casework`, `patrol`, `generate-kb`

- [ ] **Step 3: Verify dev skills are excluded**

```bash
curl -s http://localhost:3010/api/skills | jq 'length'
curl -s "http://localhost:3010/api/skills?includeDev=true" | jq 'length'
```
Expected: Second number is larger (includes dev skills)

- [ ] **Step 4: Verify step execution still works**

Open WebUI at `http://localhost:5173`, navigate to a case, click "Refresh" button. Verify it triggers data-refresh via the registry prompt.

- [ ] **Step 5: Verify hot-reload**

Edit a SKILL.md frontmatter field (e.g., change `estimatedDuration`), check server logs for `[skill-registry] Reloaded skill:` message, then call the API to verify the change is reflected.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: skill registry fully operational — CLI-first architecture complete"
```
