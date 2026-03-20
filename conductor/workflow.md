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
1. Read `conductor/tracks/{trackId}/plan.md` — identify all modified backend modules
2. For each modified module, generate unit tests covering:
   - Happy path (normal inputs → expected outputs)
   - Edge cases (empty input, boundary values, missing data)
   - Error handling (invalid input, file not found, permission errors)
   - Security (path traversal, injection, malformed data)
3. Place test files adjacent to source: `src/module-name.test.ts`
4. Run `npm test` — all tests must pass
5. Run `npm run test:coverage` — review coverage report

**Test Framework Setup:**
- Framework: Vitest (configured in `dashboard/vitest.config.ts`)
- Mocking: `vi.mock()` for fs, external modules, SDK
- Assertions: `expect()` with Vitest matchers
- Commands: `npm test` (run once), `npm run test:watch` (dev), `npm run test:coverage`

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

### Phase-Level Verification

For individual phase verification (step 3 in Track Workflow), use lighter checks:
- TypeScript compile: `npx tsc --noEmit` (both `dashboard/` and `dashboard/web/`)
- Run existing unit tests: `npm test`
- Spot-check affected pages via Playwright screenshot (no full test suite)

### When to Skip / Reduce Testing

| Scenario | Unit Tests | UI Tests |
|----------|-----------|----------|
| Full feature track (3+ tasks) | ✅ Required | ✅ Required |
| Bug fix track (< 3 tasks) | ✅ Required | ⚠️ Targeted only |
| Backend-only (no UI changes) | ✅ Required | ❌ Skip (use `curl` instead) |
| Chore/Refactor (no behavior change) | ⚠️ If applicable | ❌ Skip |
| Config/docs only | ❌ Skip | ❌ Skip |
