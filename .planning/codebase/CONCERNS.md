# Concerns

## Technical Debt

### No Linting / Formatting Config
- No `.eslintrc`, `.prettierrc`, or `.editorconfig` found
- Code style consistency relies on convention, not enforcement
- **Risk**: Style drift across 46+ TypeScript files
- **Files**: All of `dashboard/src/`, `dashboard/web/src/`

### Mixed Language Documentation
- CLAUDE.md, playbooks, and skills mix Chinese and English
- No clear rule on when to use which language
- **Risk**: Confusion for contributors or AI agents parsing instructions

### Large CLAUDE.md
- `CLAUDE.md` is the single source of truth for agent behavior
- Contains architecture docs, rules, conventions, and configuration
- **Risk**: Context window pressure when injected into sessions

### Test Framework Complexity
- Custom test framework with 40+ bash executors, state machine, registries
- `tests/state.json` tracks complex multi-phase test loops
- **Risk**: Maintenance burden; hard to understand for new contributors
- **Location**: `tests/executors/`, `tests/state.json`

## Known Issues

### Issue Tracker (`issues/`)
- 16 tracked issues (ISS-001 through ISS-016, with ISS-013/014/015 gap)
- Issues managed via `/issue` CLI skill
- Linked to conductor tracks for implementation

### Learnings
- `.learnings/ERRORS.md` — Documents past errors and solutions
- `.learnings/LEARNINGS.md` — Accumulated knowledge
- `.learnings/FEATURE_REQUESTS.md` — User-requested features

## Security Concerns

### API Key in .mcp.json
- `local-rag` MCP server config contains an OpenAI API key in plaintext
- **File**: `.mcp.json` → `local-rag.env.OPENAI_API_KEY`
- **Risk**: Key exposure if `.mcp.json` is committed to public repo
- **Mitigation**: Should use environment variables or secret store

### D365 Credential Handling
- PowerShell scripts access D365 via organizational credentials
- Credential flow not documented in codebase
- **Risk**: Unclear how credentials are stored and refreshed

### Dashboard Auth
- JWT + bcrypt for dashboard login
- No rate limiting or brute force protection observed
- **Files**: `dashboard/src/routes/auth.ts`, `dashboard/src/middleware/`

## Performance Concerns

### File System as Database
- All case data stored as flat files
- Case listing requires directory scanning
- **Risk**: Performance degradation with many active cases
- **Location**: `dashboard/src/services/case-reader.ts`

### OneNote Export Size
- ~1.4GB of OneNote data in `~/Documents/EngineerBrain-Data/OneNote Export/`
- Full re-sync could be slow
- Vector DB (LanceDB) mitigates search performance

### MCP Server Startup
- 12 MCP servers configured; cold start latency for each
- `scripts/warm-agency-mcps.ps1` exists to pre-warm servers

## Fragile Areas

### Case Directory Schema
- Case directories must follow schema defined in `playbooks/schemas/case-directory.md`
- Skills and agents assume specific file locations (e.g., `casehealth-meta.json`, `context/case-summary.md`)
- **Risk**: Schema changes break multiple skills/agents simultaneously

### Agent Registration
- Agents defined in `.claude/agents/*.md` must have specific frontmatter fields
- Missing `name` field causes silent fallback to `general-purpose` agent
- New/modified agents require session restart
- **Documented in**: `CLAUDE.md` (Custom Subagent 注册 section)

### Git Bash Path Format
- All Bash commands must use POSIX paths (`/c/Users/...` not `C:\Users\...`)
- Variable assignment + pipe interaction causes silent failures
- **Risk**: Easy to introduce subtle bugs in skill scripts
- **Documented in**: `CLAUDE.md` (Git Bash 路径格式 section)

### Screenshot/Image Handling
- Screenshots in main session can exhaust context window
- Must use subagent pattern for any screenshot analysis
- **Documented in**: `CLAUDE.md` (截图验证必须走 subagent section)

## Maintenance Concerns

### Conductor vs Issues Dual Tracking
- Issues in `issues/ISS-XXX.json` and conductor tracks in `conductor/tracks/`
- Must stay synchronized (issue → track → implement → verify)
- **Risk**: State desync between the two systems

### Memory System
- Dual-layer: agent session memory + case directory files
- Session memory subject to compaction (can lose early context)
- Manual discipline required to write to `memory/MEMORY.md`
- **Risk**: Knowledge loss across sessions
