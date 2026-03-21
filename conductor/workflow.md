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
3. Start dev server (`cd dashboard && npm run dev`)
4. Wait for frontend (port 5173) and backend (port 3010) to be ready
5. Generate a valid JWT for testing:
   ```bash
   node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub:'engineer'}, process.env.JWT_SECRET||'engineer-brain-local-dev-secret-2026', {expiresIn:'1h'}))"
   ```
6. Use Playwright (headless Chromium) to test each acceptance criterion
7. Take screenshots at key verification points
8. Stop dev server
9. Generate test report with pass/fail per acceptance criterion

**Playwright Patterns:**
```javascript
// Auth: inject token via storageState (no login flow needed)
storageState: {
  origins: [{ origin: BASE_URL, localStorage: [{ name: 'eb_token', value: TOKEN }] }]
}

// Navigation: use 'domcontentloaded' — NOT 'networkidle' (SSE keeps connections open)
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
await page.waitForTimeout(2000) // allow React + API data to settle

// Screenshots for evidence
await page.screenshot({ path: 'scripts/screenshots/<name>.png', fullPage: true })
```

**Test Scope (derived from spec.md):**
- For each acceptance criterion → generate 1+ specific UI assertions
- For UI changes → screenshot at relevant pages
- For API changes → verify via both `curl` API call and frontend display
- For error handling → test both happy path and error path

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

1. **关联 Issue 状态同步** — 如果本次任务来源于某个 Issue（ISS-XXX），更新该 issue 的 status：
   - 实现完成 + 测试通过 → `status: "done"`
   - 实现完成但测试未通过 → `status: "in-progress"`（保持）
   - 读取方式：检查 plan 文件中的 Source/Issue 引用，或检查 conductor track 的 spec.md
2. **Track metadata 同步** — 更新 `conductor/tracks/{trackId}/metadata.json` 的 status、tasks、updated 字段
3. **tracks.md 同步** — 更新 `conductor/tracks.md` 表格中对应行的状态标记

**为什么需要这一步：** Plan mode 会清空上下文，导致 agent 丢失"这是为哪个 issue 做的"这个业务关联。将收尾步骤显式写入 workflow 可以防止遗漏。

**Plan 模板规则：** 每个 plan 的最后一个阶段必须包含以下 checklist：
```markdown
## Post-Implementation Checklist
- [ ] 单元测试文件已创建并通过
- [ ] browser-test.mjs 已覆盖新页面/路由（如有 UI 变更）
- [ ] 关联 Issue JSON 状态已更新
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

   await page.screenshot({ path: 'screenshot.png', fullPage: false });
   await browser.close();
   ```

3. **截图覆盖范围**（根据改动类型选择）

   | 改动范围 | 必须截图的页面 | 视口宽度 |
   |---------|-------------|---------|
   | 全局样式 / Layout / CSS 变量 | Dashboard + CaseDetail + 1 其他页面 | 1440px |
   | 单个页面组件 | 该页面 | 1440px |
   | 响应式布局 | 该页面 | 1440px + 1280px + 1024px |
   | Sidebar / 导航 | Dashboard（含侧边栏） | 1440px |

4. **自检截图** — 用 Read tool 查看每张截图，确认：
   - ✅ 页面正常渲染（非空白 / 非登录页 / 非报错）
   - ✅ 主题颜色正确（暗色/亮色都使用 CSS 变量，无硬编码色值）
   - ✅ 布局不溢出（无水平滚动条，AI Panel 不被推出视口）
   - ✅ 改动的视觉效果与预期一致

5. **失败处理**
   - 截图显示登录页 → JWT_SECRET 不匹配，检查 `dashboard/.env`
   - 截图空白/报错 → 检查 dev server 日志、TypeScript 编译
   - 布局溢出 → 检查 `overflow-x: hidden` 和 `min-w-0`

**注意事项：**
- 截图文件用完即删，不提交到 git
- 不要截图后直接确认通过，必须用 Read tool 实际查看图片内容
- 如果 case detail 页面需要真实数据，从 `cases/active/` 目录选取一个 case number

### 🚨 Safety Red Lines for Automated Testing

All generated tests (unit and UI) **MUST** comply with the safety red lines defined in `CLAUDE.md § 自动化测试安全红线`. Before generating or running any test:

1. **Unit tests**: Never import or call D365 write scripts (`add-note.ps1`, `record-labor.ps1`, etc.). Always mock `child_process.execSync`/`spawn` if the module under test invokes PowerShell.
2. **UI tests**: Never click action buttons (`Full Process`, `Troubleshoot`, `Draft Email`, `Execute`). Only use read-only interactions: navigation, screenshots, visibility checks, tab switching, sorting.
3. **API tests**: Only call `GET` endpoints and safe `PUT /api/settings`. Never call `POST /api/todo/:id/execute`, `POST /api/case/:id/process`, `POST /api/case/:id/step/*`, or `POST /api/patrol`.

If a test scenario requires verifying a write operation's UI flow, test only up to the confirmation dialog — never submit it.

### When to Skip / Reduce Testing

| Scenario | Unit Tests | UI Tests |
|----------|-----------|----------|
| Full feature track (3+ tasks) | ✅ Required | ✅ Required |
| Bug fix track (< 3 tasks) | ✅ Required | ⚠️ Targeted only |
| Backend-only (no UI changes) | ✅ Required | ❌ Skip (use `curl` instead) |
| Chore/Refactor (no behavior change) | ⚠️ If applicable | ❌ Skip |
| Config/docs only | ❌ Skip | ❌ Skip |
