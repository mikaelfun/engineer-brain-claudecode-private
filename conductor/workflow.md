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

### Step 2: Acceptance Criteria Verification (推理驱动 + Recipe 自我演进)

**Trigger:** Unit tests all pass

**Architecture:** Conductor:Verify 采用推理驱动架构，LLM 读 spec 推理每条验收标准的验证方案，查找/复用 verification-recipes，执行后反思提取新经验。

**完整流程定义:** `.claude/skills/conductor/verify/SKILL.md`（5 步流程）

**流程概览:**
1. **Regression Guard** — `npm test` 作为回归安全网
2. **推理验证方案** — 读 spec 提取验收标准 → 查 `playbooks/guides/verification-recipes/_index.md` 匹配 recipe → 生成验证计划
3. **执行验证** — 有 recipe 按步骤执行 / 无 recipe 从零推理
4. **汇总报告** — per-criterion PASS/FAIL with evidence → 写 `metadata.json → verification`
5. **反思提取** — 满足触发条件时创建/更新 recipe（自我演进）

**Recipe 目录:** `playbooks/guides/verification-recipes/`
- `_index.md` — 匹配规则 + 演进日志
- `web-ui-playwright.md` — UI 验证（Edge + JWT + Playwright）
- `cli-script-output.md` — CLI/脚本输出验证
- `api-endpoint.md` — API 端点验证
- `file-content-check.md` — 文件内容/格式验证

**与 test-loop 的关系:** Conductor:Verify 独立运行验证，不再依赖 test-loop。test-loop 仍然作为持续测试框架运行，两者互不干扰。

#### Step 2a: Acceptance Criteria Classification（验收标准分类参考 — 仅供 LLM 推理参考，非强制）

> **注意：** 以下分类表是 LLM 推理验证方案时的**参考依据**，不是固定规则。LLM 应结合具体验收标准内容和 recipe 匹配结果灵活决定。

**核心原则：只要不是 D365 写入和执行操作，都可以自动化验收。**

| Test Type | When to Use | What to Do |
|-----------|-------------|------------|
| **E2E** | Workflow output, file generation, data pipeline, script behavior, performance | Backup → run actual workflow → verify outputs → restore |
| **Interaction** | User actions: clicking buttons, forms, dialogs, state transitions | Playwright: navigate → setup → click → assert state |
| **Visual** | Appearance: layout, styling, theme, responsive design | Navigate → screenshot → verify |
| **API** | Backend behavior: endpoint, response shape, data persistence | fetch/curl → assert response JSON |
| **Skip** | D365 write operations (add-note, record-labor, SAP) or dangerous executes | Document reason — **must be D365 write/execute related** |

**Classification rules (by Issue type and keywords):**

| Issue Type | Keywords | Default Type |
|------------|----------|-------------|
| refactor/feature (workflow) | "casework", "inspection", "todo", "script", "generate", "pipeline" | **E2E** |
| refactor/feature (backend) | "endpoint", "API", "response", "file output", "fallback" | **E2E** |
| feature (UI) | "button", "dialog", "modal", "panel", "click", "toggle" | Interaction |
| feature (UI) | "layout", "style", "theme", "color", "font", "responsive" | Visual |
| bug (UI) | "not showing", "disappears", "wrong state", "not updating" | Interaction |
| bug (UI) | "overflow", "truncated", "misaligned", "wrong color" | Visual |
| feature/bug (API-only) | "endpoint", "API", "response", "status code" | API |
| any | involves D365 write/execute | Skip |

**⚠️ 重要：** 即使没有 UI 变更，只要涉及工作流、脚本、文件生成等可执行验证的行为，都应使用 E2E 类型。

> **Note:** 详细的验证执行流程见 `.claude/skills/conductor/verify/SKILL.md`。Playwright/E2E 踩坑经验沉淀在 `playbooks/guides/verification-recipes/` 和 `tests/learnings.yaml`。

### Step 3: Report & Follow-up

**Output:**
- Unit test results: pass/fail count, coverage %
- Verification results: ✅/❌ per acceptance criterion (from test-loop or direct executor)
- Any new bugs found → auto-create follow-up Conductor track via `/conductor:new-track`

**Commit:** Only after both unit tests and verification pass. Commit includes:
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
