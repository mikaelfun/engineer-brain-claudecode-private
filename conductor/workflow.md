# Workflow Preferences: EngineerBrain

## Development Approach
- **TDD:** Preferred for dashboard features when applicable
- **Commits:** Feature-based commits with clear descriptions
- **Language:** Code in English, comments/docs bilingual (EN/ZH)

## Code Conventions
- TypeScript strict mode
- Hono for backend routes
- React functional components with hooks
- TanStack Query for data fetching
- Zustand for client state
- Tailwind CSS for styling (no CSS modules)
- File-based data model (no ORM/database)

## Testing
- Unit tests via Vitest (`npm test`)
- Browser tests via Playwright (headless Chromium)
- Smoke tests via Node.js scripts
- Manual validation via dashboard UI

## Review Process
- Self-review via Claude Code
- Iterative refinement based on Finetune.txt feedback

## Track Workflow
1. Create track with spec + plan
2. Implement phase by phase
3. Verify each phase before proceeding (Phase-Level Verification)
4. Mark tasks complete in plan.md
5. **Automated verification** (see below)
6. Commit only after all tests pass

## Verification Strategy

All verification steps are executed as part of the track, after implementation is complete but **before the final commit**. Test files are committed together with the implementation code.

### Step 1: Unit Tests (via Vitest)

**Trigger:** All implementation tasks marked `[x]`

**Procedure:**
1. Read `conductor/tracks/{trackId}/plan.md` — identify all modified modules (backend AND frontend)
2. **Backend modules** (`dashboard/src/**`): generate unit tests covering:
   - Happy path (normal inputs → expected outputs)
   - Edge cases (empty input, boundary values, missing data)
   - Error handling (invalid input, file not found, permission errors)
   - Security (path traversal, injection, malformed data)
3. **Frontend modules** (`dashboard/web/src/**`): generate component/hook tests covering:
   - Render output per props/state (component)
   - Conditional display and CSS class application (component)
   - Side effects, state updates, cleanup on unmount (hook)
   - Edge cases (missing props, error states, empty data)
4. Place test files adjacent to source:
   - Backend: `dashboard/src/module-name.test.ts`
   - Frontend: `dashboard/web/src/components/Foo.test.tsx` or `dashboard/web/src/hooks/useFoo.test.ts`
5. Frontend tests **must** use `test-utils/`:
   - `import { renderWithProviders, screen, userEvent } from '../test-utils'` for components
   - `import { createMockCase, createMockSession } from '../test-utils'` for mock data
   - Mock Zustand stores via `vi.mock('../stores/xxxStore')`
   - Mock EventSource via `vi.stubGlobal('EventSource', MockEventSource)` for SSE hooks
6. Run `npm test` — all tests (backend + frontend) must pass
7. Run `npm run test:coverage` — review coverage report

**Frontend module identification rules:**
| Changed file pattern | Action |
|---------------------|--------|
| `dashboard/web/src/components/*.tsx` | Generate adjacent `.test.tsx` using `renderWithProviders` |
| `dashboard/web/src/hooks/*.ts` | Generate adjacent `.test.ts` using `renderHook` + mock providers |
| `dashboard/web/src/pages/*.tsx` | Generate adjacent `.test.tsx` — test loading/error states, mock API hooks |
| `dashboard/web/src/stores/*.ts` | Generate adjacent `.test.ts` — test state transitions and actions |
| `dashboard/web/src/api/*.ts` | Generate adjacent `.test.ts` — test request/response, mock `fetch` |

**Test Framework Setup:**
- Backend: Vitest (configured in `dashboard/vitest.config.ts`, node environment)
- Frontend: Vitest (configured in `dashboard/web/vitest.config.ts`, jsdom environment)
- Mocking: `vi.mock()` for fs, external modules, SDK, Zustand stores
- Assertions: `expect()` with Vitest matchers + `@testing-library/jest-dom` matchers (frontend)
- Commands: `npm test` (both), `npm run test:server` (backend only), `npm run test:web` (frontend only)

**Mock Patterns:**
```typescript
// Mock filesystem
vi.mock('fs')
const mockExistsSync = vi.mocked(existsSync)

// Mock internal modules (use relative path from test file)
vi.mock('./workspace.js', () => ({
  getCaseDir: vi.fn((id: string) => join('/mock/cases/active', id)),
}))

// Mock SDK/heavy dependencies
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({ query: vi.fn() }))

// Windows path safety: use join() in assertions, never hardcode '/'
const expectedPath = join('/mock', 'cases', 'active', caseNumber, 'todo', filename)
```

**What to Test (per module type):**
| Module Type | Test Focus |
|-------------|-----------|
| Route handler | Request/response shape, status codes, error responses |
| Service function | Input/output, file I/O mocking, edge cases |
| State manager | State transitions, flag toggling, concurrency guards |
| Utility | Pure function behavior, format validation |

### Frontend Tests (via Vitest + React Testing Library)

**Location:** `dashboard/web/src/**/*.test.{ts,tsx}`
**Config:** `dashboard/web/vitest.config.ts` (jsdom environment)
**Commands:** `npm --prefix web test` (run once), `npm --prefix web run test:watch` (dev)

**Test Utilities:**
- Render helper: `import { renderWithProviders, screen, userEvent } from '../test-utils'`
- Mock factories: `import { createMockCase, createMockSession } from '../test-utils'`

**Frontend Mock Patterns:**
```typescript
// Component test with providers (QueryClient + MemoryRouter)
import { renderWithProviders, screen } from '../test-utils'
import { MyComponent } from './MyComponent'

it('renders correctly', () => {
  renderWithProviders(<MyComponent />, { route: '/case/123' })
  expect(screen.getByText('Hello')).toBeInTheDocument()
})

// Mock Zustand stores
vi.mock('../stores/myStore', () => ({
  useMyStore: vi.fn((selector: (s: any) => any) => {
    const store = { value: 'mock', action: vi.fn() }
    return selector(store)
  }),
}))

// Mock EventSource for SSE hooks
class MockEventSource {
  listeners: Record<string, Function[]> = {}
  addEventListener(type: string, fn: Function) { ... }
  close() { this.readyState = 2 }
}
vi.stubGlobal('EventSource', MockEventSource)

// Mock localStorage
vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token')

// User interaction
import { userEvent } from '../test-utils'
const user = userEvent.setup()
await user.click(screen.getByRole('button'))
```

**What to Test (per frontend module type):**
| Module Type | Test Focus |
|-------------|-----------|
| Component | Render output per props, conditional display, CSS classes |
| Hook | Side effects, state updates, cleanup on unmount |
| Page | Route integration, loading/error states (mock API) |
| Store (Zustand) | State transitions, actions, selectors |

### Step 2: UI Tests (via Playwright)

**Trigger:** Unit tests all pass

**Procedure:**
1. Read `conductor/tracks/{trackId}/spec.md` — extract acceptance criteria
2. Read `conductor/tracks/{trackId}/plan.md` — extract all completed tasks and their descriptions
3. **Generate Issue-Driven Test Plan** (see below)
4. **Display test plan for user confirmation** (see below)
5. Start dev server (`cd dashboard && npm run dev`)
6. Wait for frontend (port 5173) and backend (port 3010) to be ready
7. Generate a valid JWT for testing:
   ```bash
   node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub:'engineer'}, process.env.JWT_SECRET||'engineer-brain-local-dev-secret-2026', {expiresIn:'1h'}))"
   ```
8. Execute each test from the approved plan
9. Take screenshots only at key verification points (JPEG, save to file only — **不传回会话**)
10. Stop dev server
11. Generate test report with pass/fail per acceptance criterion

#### Step 2a: Issue-Driven Test Plan Generation

Before executing any Playwright tests, generate a structured test plan that reflects the actual
user scenario described in the Issue.

**Input sources (read in order):**
1. **Issue JSON** — Read `issues/{issueId}.json` (found via track's `metadata.json → issueId` or `spec.md → Source`). Extract `title`, `description`, `type` to understand the real problem/feature.
2. **spec.md** — Extract acceptance criteria (the "what to verify")
3. **plan.md** — Extract completed tasks (the "what was changed")

**核心原则：只要不是 D365 写入和执行操作，都可以自动化验收。** 不用担心花费时间和本地数据操作——数据都是可恢复和重构的。优先选择 E2E 类型，只有确实无法自动化的才用 Skip。

**Classify each acceptance criterion into a test type:**

| Test Type | When to Use | What to Do |
|-----------|-------------|------------|
| **E2E** | Criterion involves backend workflow output, file generation, data pipeline, script behavior, performance, or any behavior that can be verified by running actual workflows and checking file outputs | Backup data → run actual workflow/script → verify file outputs + API responses + UI rendering → restore data |
| **Interaction** | Criterion involves user actions: clicking buttons, filling forms, opening/closing dialogs, state transitions, drag-drop | Multi-step Playwright test: navigate → setup data → click/type → wait → assert state change |
| **Visual** | Criterion involves appearance: layout, styling, theme, responsive design, icon display | Navigate → screenshot → verify via Read tool |
| **API** | Criterion involves backend behavior: new endpoint, changed response shape, data persistence | `fetch()` or `curl` call → assert response JSON |
| **Skip** | Criterion involves D365 write operations (add-note, record-labor, SAP update) or dangerous execute actions | Document reason for skipping — **must be D365 write/execute related** |

**Classification rules (by Issue type and keywords):**

| Issue Type | Keywords in Description | Default Test Type |
|------------|----------------------|-------------------|
| refactor/feature (workflow) | "casework", "inspection", "todo", "data-refresh", "script", "generate", "pipeline", "fast path", "performance" | **E2E** |
| refactor/feature (backend) | "endpoint", "API", "response", "file output", "fallback", "legacy" | **E2E** (prefer over API when workflow can be executed) |
| feature (UI) | "button", "dialog", "modal", "panel", "click", "toggle", "expand", "collapse" | Interaction |
| feature (UI) | "layout", "style", "theme", "color", "font", "spacing", "responsive" | Visual |
| bug (UI) | "not showing", "disappears", "wrong state", "not updating" | Interaction |
| bug (UI) | "overflow", "truncated", "misaligned", "wrong color" | Visual |
| feature/bug (API-only) | "endpoint", "API", "response", "status code" (no workflow execution involved) | API |
| any | involves D365 write/execute (add-note, record-labor, SAP, send email) | Skip |

**⚠️ 重要：`refactor/chore | no UI surface | Skip` 规则已废弃。** 即使没有 UI 变更，只要涉及工作流、脚本、文件生成等可执行验证的行为，都应使用 E2E 类型。

**Example — ISS-050 (Cancel Track Creation Button):**

| Criterion | Type | Test Steps |
|-----------|------|------------|
| Cancel button visible during track creation | Interaction | 1. POST `/api/issues` to create test issue<br>2. POST `/api/issues/{id}/create-track` to start track creation<br>3. Navigate to Issues page<br>4. Verify Cancel button appears in progress panel<br>5. Click Cancel button<br>6. Verify: issue status reverts to pending (via GET API)<br>7. Verify: progress panel disappears from DOM<br>8. Screenshot for evidence |
| Track creation can be restarted after cancel | Interaction | 1. After cancel (above), verify "New Track" button is clickable again<br>2. Screenshot |

**Example — ISS-030 (Design System Integration):**

| Criterion | Type | Test Steps |
|-----------|------|------------|
| Dark mode colors use CSS variables | Visual | 1. Navigate to Dashboard<br>2. Screenshot at 1440px<br>3. Read screenshot, verify dark theme palette |
| Light mode toggle works | Interaction | 1. Navigate to Settings<br>2. Click theme toggle<br>3. Screenshot<br>4. Verify body class changed |

**Example — ISS-113 (Inspection Refactor — case-summary + 规则化 todo):**

| Criterion | Type | Test Steps |
|-----------|------|------------|
| generate-todo.sh 规则矩阵正确 | E2E | 1. Backup existing todo/<br>2. 用不同 meta.json 场景运行 generate-todo.sh<br>3. 验证输出文件存在、🔴🟡✅ 分区正确、stdout 格式匹配<br>4. Restore |
| case-summary NO_CHANGE 跳过 | E2E | 1. 确保 case-summary.md 存在<br>2. 设 meta 为 NO_CHANGE 状态<br>3. 运行 inspection-writer（或模拟快速路径）<br>4. 验证 case-summary.md 未被修改（比较 mtime/hash）<br>5. 验证 todo 仍被生成 |
| Dashboard Summary tab 渲染 | E2E | 1. Backup case-summary.md<br>2. 删除 case-summary.md<br>3. 通过 API 验证返回 legacy fallback<br>4. 创建新 case-summary.md<br>5. 通过 API 验证返回 legacy=false<br>6. Playwright 截图验证 UI 显示<br>7. Restore |
| 旧 inspection fallback | E2E | 1. Backup case-summary.md → 临时删除<br>2. GET /api/cases/:id/inspection → assert legacy=true + 内容非空<br>3. Restore case-summary.md |
| casework 快速路径无 LLM | Skip | Backend-only timing 验证，需实际运行 casework（D365 交互，跳过） |

#### Step 2b: Test Plan Confirmation

Before executing the plan, display it to the user:

```
## UI Test Plan for {trackId}

Based on Issue {issueId}: {issue title}

| # | Criterion | Test Type | Steps Summary |
|---|-----------|-----------|---------------|
| 1 | {criterion} | Interaction | Navigate → Create issue → Click cancel → Verify state |
| 2 | {criterion} | Visual | Navigate → Screenshot → Verify layout |
| 3 | {criterion} | Skip | Backend-only, covered by unit tests |

Approve this test plan?
1. Yes, execute all tests
2. Skip some tests (specify which #)
3. Edit test steps
4. Skip UI tests entirely
```

#### Interaction Test Patterns (Playwright)

```javascript
// === Pattern 1: API-seeded data + UI interaction ===
// Use when test needs specific data state (e.g., an issue in a specific status)

// Seed: create test data via API (safe — uses POST /api/issues which is a local write)
const createRes = await fetch(`${BASE_URL}/api/issues`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
  body: JSON.stringify({ title: 'Test Issue for UI verification', type: 'bug', priority: 'P2' }),
})
const { id: testIssueId } = await createRes.json()

// Navigate and interact
await page.goto(`${BASE_URL}/issues`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)

// Find the test issue row and click action button
const issueRow = page.locator(`[data-issue-id="${testIssueId}"]`)
await issueRow.locator('button:has-text("New Track")').click()

// Wait for state change
await page.waitForSelector('[data-testid="track-progress-panel"]', { timeout: 5000 })

// Assert state
const panel = page.locator('[data-testid="track-progress-panel"]')
await expect(panel).toBeVisible()

// Cleanup: delete test issue after verification
await fetch(`${BASE_URL}/api/issues/${testIssueId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${TOKEN}` },
})


// === Pattern 2: State transition verification ===
// Use when testing a button that changes visible state

// Before click
const statusBefore = await page.locator('.issue-status').textContent()
console.log(`Status before: ${statusBefore}`)

// Click action
await page.locator('button:has-text("Cancel")').click()
await page.waitForTimeout(1000) // wait for API + React re-render

// After click — verify state changed
const statusAfter = await page.locator('.issue-status').textContent()
console.log(`Status after: ${statusAfter}`)
assert(statusAfter !== statusBefore, `Status should have changed from ${statusBefore}`)

// Screenshot for evidence
await page.screenshot({ path: 'scripts/screenshots/state-transition.png' })


// === Pattern 3: Dialog/Modal interaction ===
// Use when testing dialog open → interact → close flow

await page.locator('button:has-text("Edit")').click()
await page.waitForSelector('[role="dialog"]', { timeout: 3000 })

// Interact with dialog content
await page.fill('[name="title"]', 'Updated Title')
await page.locator('button:has-text("Save")').click()

// Verify dialog closed and changes reflected
await expect(page.locator('[role="dialog"]')).not.toBeVisible()
await expect(page.locator('.issue-title')).toHaveText('Updated Title')
```

**⚠️ Safety Guards for Interaction Tests:**
- **NEVER click**: "Execute" 按钮（触发 D365 写操作）
- **NEVER call**: `POST /api/todo/:id/execute`（唯一禁止的 POST 端点）
- **Safe to click**: "Full Process", "Troubleshoot", "Draft Email"（只读流程）, "New Track", "Cancel", "Edit", "Reopen", "Mark Done", "Verify", tab switches, sort headers, search input, theme toggle
- **Safe to call**: 所有 `GET` 端点, `POST /api/case/:id/process`, `POST /api/case/:id/step/*`, `POST /api/patrol`, `POST /api/issues`, `DELETE /api/issues/:id`, `PUT /api/issues/:id`, `PUT /api/settings`
- 完整安全边界见 `playbooks/rules/test-safety-redlines.md`

**Playwright Patterns (unchanged):**
```javascript
// Auth: inject token via storageState (no login flow needed)
storageState: {
  origins: [{ origin: BASE_URL, localStorage: [{ name: 'eb_token', value: TOKEN }] }]
}

// Navigation: use 'domcontentloaded' — NOT 'networkidle' (SSE keeps connections open)
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
await page.waitForTimeout(2000) // allow React + API data to settle

// Screenshots: JPEG + save to file only（不要传回会话）
await page.screenshot({ path: 'scripts/screenshots/<name>.jpeg', type: 'jpeg', quality: 70, fullPage: false })
```

#### E2E Test Patterns

E2E 测试验证完整的工作流输出，而非仅检查 UI 标签或静态断言。核心思路：**备份 → 修改/删除 → 执行实际工作流 → 验证输出 → 恢复 + 清理临时文件**。

**⚠️ 清理规则：所有 E2E 测试必须保证测试完成后（无论成功/失败）自动恢复原始数据并删除临时文件。**
- Bash 脚本：用 `trap '...' EXIT` 在 backup 创建后立即注册清理钩子
- JavaScript/Playwright：用 `try/finally` 包裹测试逻辑
- 截图文件（`scripts/screenshots/*.jpeg`）：验证通过后删除，不提交到 git

**📸 截图优化规则（防止撑爆 session context）：**
- **减少截图次数**：只在关键验证点截图（如最终结果页），不要每步操作都截
- **用 JPEG 代替 PNG**：`type: 'jpeg', quality: 70`，体积减小 70-80%
- **fullPage: false**：默认只截可视区域，不截全页（减少文件大小）
- **E2E / API / Interaction 类**：验证靠代码断言，截图**只保存到文件**（`scripts/screenshots/`），主会话不读取
- **Visual 类**（必须看截图判断布局/主题/样式）：**委托 subagent 查看截图**，主会话只收文字结论，避免图片留在主 context：
  ```
  Agent(subagent_type="general-purpose", prompt="""
    用 Read tool 查看以下截图文件，判断：
    1. 页面是否正常渲染（非空白/非报错/非登录页）
    2. 布局是否正确（无溢出、元素位置符合预期）
    3. {具体验证点}
    返回纯文本结论：PASS 或 FAIL + 原因。
    截图路径：scripts/screenshots/xxx.jpeg
  """)
  ```
  → subagent 结束后其 context（含图片）自动释放，主会话只收到 PASS/FAIL 文字
- **清理**：finally 块中 `rm -f scripts/screenshots/e2e-*.jpeg`

```bash
# === Pattern 1: Data Backup/Restore Wrapper ===
# 标准模式：备份现有数据 → 执行测试 → 恢复 + 清理

CASE_DIR="/c/Users/.../cases/active/2603260030005229"
BACKUP_DIR="/tmp/e2e-backup-$(date +%s)"

# Backup
mkdir -p "$BACKUP_DIR"
cp -r "$CASE_DIR/todo" "$BACKUP_DIR/" 2>/dev/null || true
cp "$CASE_DIR/case-summary.md" "$BACKUP_DIR/" 2>/dev/null || true
cp "$CASE_DIR/casehealth-meta.json" "$BACKUP_DIR/" 2>/dev/null || true

# ⚠️ 立即注册清理钩子（backup 创建后、测试开始前）
trap 'cp -r "$BACKUP_DIR"/* "$CASE_DIR/" 2>/dev/null; rm -rf "$BACKUP_DIR"' EXIT

# ... run tests (any failure will trigger trap automatically) ...
```

```bash
# === Pattern 2: Script Output Verification ===
# 运行实际脚本，验证输出文件和 stdout
# ⚠️ 必须包含 backup + trap，因为会覆盖 meta.json 和生成 todo 文件

BACKUP_DIR="/tmp/e2e-backup-$(date +%s)"
mkdir -p "$BACKUP_DIR"
cp "$CASE_DIR/casehealth-meta.json" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$CASE_DIR/todo" "$BACKUP_DIR/" 2>/dev/null || true
trap 'cp -r "$BACKUP_DIR"/* "$CASE_DIR/" 2>/dev/null; rm -rf "$BACKUP_DIR"' EXIT

# Setup: 构造特定测试场景的 meta.json
cat > "$CASE_DIR/casehealth-meta.json" << 'TESTMETA'
{
  "actualStatus": "pending-customer",
  "daysSinceLastContact": 4,
  "irSla": { "status": "Succeeded" },
  "compliance": { "entitlementOk": true }
}
TESTMETA

# Execute
OUTPUT=$(bash skills/d365-case-ops/scripts/generate-todo.sh "$CASE_DIR")

# Verify stdout format
echo "$OUTPUT" | grep -q "TODO_OK|" || { echo "FAIL: stdout format"; exit 1; }

# Verify file created
TODO_FILE=$(ls -t "$CASE_DIR/todo/"*.md 2>/dev/null | head -1)
[ -f "$TODO_FILE" ] || { echo "FAIL: no todo file"; exit 1; }

# Verify content structure
grep -q "🟡" "$TODO_FILE" || { echo "FAIL: missing yellow section"; exit 1; }
grep -q "follow-up" "$TODO_FILE" || { echo "FAIL: missing follow-up rule"; exit 1; }

# trap EXIT 自动恢复原始 meta.json + todo/ 并删除 BACKUP_DIR
```

```bash
# === Pattern 3: API + File Integration Verification ===
# 修改文件系统状态 → 通过 API 验证后端行为 → trap 自动恢复

BACKUP_DIR="/tmp/e2e-backup-$(date +%s)"
mkdir -p "$BACKUP_DIR"
cp "$CASE_DIR/case-summary.md" "$BACKUP_DIR/" 2>/dev/null || true
trap 'cp -r "$BACKUP_DIR"/* "$CASE_DIR/" 2>/dev/null; rm -rf "$BACKUP_DIR"' EXIT

TOKEN=$(node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub:'engineer'}, 'engineer-brain-local-dev-secret-2026', {expiresIn:'1h'}))")

# Scenario A: 有 case-summary.md → API 返回 legacy=false
echo "# Test Summary" > "$CASE_DIR/case-summary.md"
RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3010/api/cases/$CASE_NUMBER/inspection")
echo "$RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); process.exit(d.legacy === false ? 0 : 1)" \
  || { echo "FAIL: expected legacy=false"; exit 1; }

# Scenario B: 无 case-summary.md → API fallback 到 inspection-*.md, legacy=true
mv "$CASE_DIR/case-summary.md" "$BACKUP_DIR/_moved_summary.md"
RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3010/api/cases/$CASE_NUMBER/inspection")
echo "$RESP" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); process.exit(d.legacy === true ? 0 : 1)" \
  || { echo "FAIL: expected legacy=true fallback"; exit 1; }

# trap EXIT 自动恢复 case-summary.md 并删除 BACKUP_DIR
```

```javascript
// === Pattern 4: Full Workflow E2E (Playwright + File System) ===
// 最完整的模式：UI 操作触发后端工作流 → 验证文件输出 + UI 更新
// ⚠️ 必须用 try/finally 保证恢复

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const caseDir = '/c/Users/.../cases/active/2603260030005229'
const backupDir = execSync('mktemp -d').toString().trim()

// Backup
execSync(`cp -r "${caseDir}/todo" "${backupDir}/" 2>/dev/null || true`)

try {
  // Navigate to case detail
  await page.goto(`${BASE_URL}/cases/${caseNumber}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  // Verify Summary tab exists and renders
  const summaryTab = page.locator('button:has-text("Summary")')
  await expect(summaryTab).toBeVisible()
  await summaryTab.click()
  await page.waitForTimeout(1000)

  // Verify content loaded (not empty state)
  const content = await page.locator('.case-summary-content, [class*="summary"]').textContent()
  assert(content && content.length > 10, 'Summary content should be non-empty')

  // Screenshot for evidence（仅保存文件，不传回会话）
  await page.screenshot({ path: 'scripts/screenshots/e2e-summary-tab.jpeg', type: 'jpeg', quality: 70 })
} finally {
  // ⚠️ 无论成功失败都恢复数据 + 清理临时目录 + 删除截图
  execSync(`cp -r "${backupDir}/"* "${caseDir}/" 2>/dev/null || true; rm -rf "${backupDir}"`)
  execSync(`rm -f scripts/screenshots/e2e-*.jpeg 2>/dev/null || true`)
}
```

**⚠️ E2E 脚本常见踩坑（设计 + 执行 checklist）：**

| # | 坑 | 症状 | 解法 |
|---|-----|------|------|
| 1 | **API 调用缺 JWT** | 所有 API 返回 `Unauthorized` 或空 `{}` | 脚本**最前面**生成 JWT，所有 `fetch` 都带 `Authorization: Bearer {token}` |
| 2 | **ESM 脚本找不到 npm 包** | `ERR_MODULE_NOT_FOUND: Cannot find package 'jsonwebtoken'` | 脚本在项目根运行，但包在 `dashboard/node_modules`。用 `createRequire(join(cwd, 'dashboard', 'package.json'))` |
| 3 | **上次残留临时文件污染测试** | Legacy fallback 返回 `legacy: false`（被残留的 case-summary.md 覆盖） | **测试前也清理**：`try` 块开头先删临时文件；或用不同于真实数据的 test case 目录 |
| 4 | **Playwright locator 不匹配含 emoji 文本** | `button:has-text("Summary")` 对 `📋 Summary` 不生效 | 用 `page.locator('button', { hasText: 'Summary' }).first()` — `hasText` 是子字符串匹配 |
| 5 | **cleanup 用相对路径** | Git Bash `rm -f scripts/screenshots/...` → `No such file or directory` | cleanup 中**只用绝对路径变量**：`` execSync(`rm -f "${SCREENSHOT_DIR}"/e2e-*.jpeg`) `` |
| 6 | **finally 块里 process.exit 不执行** | 测试 pass 了但 cleanup 被跳过 | `process.exit()` 放在 `try` 块最后；`finally` 只做 cleanup 不做 exit |

**E2E 脚本设计模板（基于踩坑总结）：**
```javascript
import { createRequire } from 'module'
const require = createRequire(join(process.cwd(), 'dashboard', 'package.json'))
const jwt = require('jsonwebtoken')  // ← 从 dashboard/node_modules 加载
const { chromium } = require('playwright')

const token = jwt.sign({ sub: 'engineer' }, JWT_SECRET, { expiresIn: '1h' })
const headers = { 'Authorization': `Bearer ${token}` }  // ← 所有 API 调用都带

let tempFiles = []  // ← 追踪所有临时文件

try {
  // 测试前清理可能的残留
  cleanupTempFiles()

  // ... API tests (用 headers) ...
  // ... Playwright tests (用 token inject localStorage) ...
  // ... 截图用绝对路径 SCREENSHOT_DIR ...

  process.exit(0)  // ← exit 在 try 块里
} finally {
  cleanupTempFiles()  // ← finally 只做 cleanup
}
```

**E2E 安全边界：**
- ✅ **可以执行**: casework、troubleshooter、draft-email、patrol、data-refresh 等**所有只读流程**
- ✅ **可以执行**: bash 脚本、文件读写/备份/恢复、curl API、Playwright 导航和截图
- ✅ **可以调用**: `POST /api/case/:id/process`、`POST /api/case/:id/step/*`、`POST /api/patrol`（全是只读流程）
- ✅ **可以点击**: "Full Process"、"Troubleshoot"、"Draft Email" 按钮（触发只读流程）
- ✅ **可以修改**: case 目录下的文件（todo/、case-summary.md、meta.json）— 测试后恢复即可
- ❌ **绝对禁止**: D365 写操作脚本（add-note/record-labor/edit-sap 等）、`POST /api/todo/:id/execute`、UI 上的 "Execute" 按钮
- ⚠️ **注意**: casework/patrol 会创建本地文件 — 如需保持测试前状态，用 backup/restore 模式
- 📋 **完整清单**: 见 `playbooks/rules/test-safety-redlines.md`

### Step 3: Report & Follow-up

**Output:**
- Unit test results: pass/fail count, coverage %
- UI test results: ✅/❌ per acceptance criterion + screenshots
- Any new bugs found → auto-create follow-up Conductor track via `/conductor:new-track`

**Commit:** Only after both unit tests and UI tests pass. Commit includes:
- Implementation code
- Unit test files (`*.test.ts`)
- Updated `conductor/tracks/{trackId}/plan.md` and `metadata.json`

### Step 4: Issue & Track 状态收尾（必须）

**每次实现任务完成后（包括 plan mode 清空上下文的情况），必须执行以下收尾检查：**

1. **Issue 状态 — 不直接写** — Issue status 由 `deriveIssueStatus()` 从 track metadata 派生（`conductor-reader.ts`），**不要直接写 `issues/{issueId}.json → status`**。只需确保 track metadata 正确：
   - Track `status: "complete"` → issue 派生为 `implemented`
   - Track `verification.status: "passed"/"skipped"` → issue 派生为 `done`
   - 直接写 issue JSON 的 status 会被派生值覆盖，造成混淆
2. **Track metadata 同步** — 更新 `conductor/tracks/{trackId}/metadata.json` 的 status、tasks、updated 字段
3. **tracks.md 同步** — 更新 `conductor/tracks.md` 表格中对应行的状态标记

**为什么需要这一步：** Plan mode 会清空上下文，导致 agent 丢失"这是为哪个 issue 做的"这个业务关联。将收尾步骤显式写入 workflow 可以防止遗漏。

**Plan 模板规则：** 每个 plan 的最后一个阶段必须包含以下 checklist：
```markdown
## Post-Implementation Checklist
- [ ] 单元测试文件已创建并通过
- [ ] browser-test.mjs 已覆盖新页面/路由（如有 UI 变更）
- [ ] 关联 Issue JSON 状态已更新（注意：不直接写 status，由 track metadata 派生）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新
```

### Phase-Level Verification

For individual phase verification (step 3 in Track Workflow), use lighter checks:
- TypeScript compile: `npx tsc --noEmit` (both `dashboard/` and `dashboard/web/`)
- Run existing unit tests: `npm test`
- **UI 变更必须执行 Screenshot Verification**（见下方）

### UI Screenshot Verification（UI 改动必做）

**触发条件：** 任何涉及 `dashboard/web/src/` 下 `.tsx` / `.css` 文件改动的 track 或 task。

**流程：**

1. **确认 dev server 运行中**
   ```bash
   curl -s http://localhost:5173 -o /dev/null -w "%{http_code}"  # 前端
   curl -s http://localhost:3010/api/auth/status -o /dev/null -w "%{http_code}"  # 后端
   ```
   如果未启动：`cd dashboard && npm run dev`

2. **生成 JWT 并通过 Playwright 截图**
   ```javascript
   const { chromium } = require('playwright');
   const jwt = require('jsonwebtoken');

   const token = jwt.sign(
     { sub: 'engineer' },
     'engineer-brain-local-dev-secret-2026',  // 从 dashboard/.env 的 JWT_SECRET 读取
     { expiresIn: '1h' }
   );

   const browser = await chromium.launch();
   const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

   // 注入 token
   await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
   await page.evaluate((t) => { localStorage.setItem('eb_token', t); }, token);

   // 导航到目标页面（⚠️ 不要用 waitUntil: 'networkidle'，SSE 会导致超时）
   await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
   await page.waitForTimeout(3000);  // 等 React + API 数据渲染

   await page.screenshot({ path: 'screenshot.jpeg', type: 'jpeg', quality: 70, fullPage: false });
   await browser.close();
   ```

3. **截图覆盖范围**（根据改动类型选择）

   | 改动范围 | 必须截图的页面 | 视口宽度 |
   |---------|-------------|---------|
   | 全局样式 / Layout / CSS 变量 | Dashboard + CaseDetail + 1 其他页面 | 1440px |
   | 单个页面组件 | 该页面 | 1440px |
   | 响应式布局 | 该页面 | 1440px + 1280px + 1024px |
   | Sidebar / 导航 | Dashboard（含侧边栏） | 1440px |

4. **自检截图** — **主会话不直接读取截图文件**（防止图片撑爆 context）：
   - **E2E / API / Interaction 类**：验证靠代码断言，截图只保存文件
   - **Visual 类**：spawn subagent 读取截图并返回纯文本 PASS/FAIL 结论（subagent context 含图片，结束后自动释放）

5. **失败处理**
   - 截图显示登录页 → JWT_SECRET 不匹配，检查 `dashboard/.env`
   - 截图空白/报错 → 检查 dev server 日志、TypeScript 编译
   - 布局溢出 → 检查 `overflow-x: hidden` 和 `min-w-0`

**注意事项：**
- 截图文件用完即删，不提交到 git
- **主会话永远不直接读取截图** — Visual 类委托 subagent 查看，其他类靠代码断言
- 如果 case detail 页面需要真实数据，从 `cases/active/` 目录选取一个 case number
- 截图格式统一用 JPEG（`type: 'jpeg', quality: 70`），体积远小于 PNG

### 🚨 Safety Red Lines for Automated Testing

All generated tests **MUST** comply with `playbooks/rules/test-safety-redlines.md`。核心原则：**禁止的是 D365 写操作，不是读操作**。

1. **Unit tests**: Never import or call D365 write scripts (`add-note.ps1`, `record-labor.ps1`, etc.). Always mock `child_process.execSync`/`spawn` if the module under test invokes PowerShell write scripts.
2. **UI tests**: Never click "Execute" 按钮（触发 D365 写操作）。其他按钮（"Full Process"、"Troubleshoot"、"Draft Email"）都是只读流程，可以点击。Safe Issue operations: `New Track`, `Cancel`, `Edit`, `Reopen`, `Mark Done`, `Verify`.
3. **API tests**: 唯一禁止的端点是 `POST /api/todo/:id/execute`（D365 写操作）。其他 POST 端点（process、step、patrol）都是只读流程，可以调用。
4. **E2E tests**: 可以运行 casework/troubleshooter/patrol 等完整流程做回归测试。如需保持测试前数据状态，用 backup/restore 模式。

If a test scenario requires verifying a write operation's UI flow, test only up to the confirmation dialog — never submit it.

### When to Skip / Reduce Testing

| Scenario | Unit Tests | UI/E2E Tests |
|----------|-----------|----------|
| Full feature track (3+ tasks) | ✅ Required | ✅ Required (E2E preferred) |
| Bug fix track (< 3 tasks) | ✅ Required | ⚠️ Targeted E2E or Interaction |
| Backend workflow/script change | ✅ Required | ✅ E2E (backup → run → verify → restore) |
| Backend-only API change | ✅ Required | ✅ API or E2E (curl + file verify) |
| Refactor with behavior change | ✅ Required | ✅ E2E (verify output equivalence) |
| UI-only visual change | ✅ Required | ✅ Visual (screenshot) |
| Config/docs only | ❌ Skip | ❌ Skip |
| Involves D365 write/execute | ✅ Required (mock writes) | ⚠️ 只测到确认弹窗，不提交 |
| Skill/Agent 逻辑修改 | ✅ Required | ✅ 运行真实 casework/patrol 做回归 |
