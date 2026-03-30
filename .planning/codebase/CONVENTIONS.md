# Conventions

## Code Style

### TypeScript (Dashboard)
- **Module system**: ES modules (`"type": "module"` in package.json)
- **Import style**: Named imports preferred, `import type` for type-only imports
- **File headers**: JSDoc block comments for main files (e.g., `/** index.ts — Hono API Server 入口 */`)
- **String quotes**: Single quotes in TypeScript
- **Semicolons**: Yes
- **Indentation**: 2 spaces
- **No explicit linting config** — no `.eslintrc`, `.prettierrc` detected

### PowerShell (Domain Scripts)
- **Execution policy**: Bypass (scripts called with `-ExecutionPolicy Bypass`)
- **Parameter blocks**: `param()` at top of scripts
- **Error handling**: `try/catch` with `$ErrorActionPreference`
- **Output**: JSON strings for machine-readable output, Write-Host for logging

### Markdown (Skills & Playbooks)
- **Skill format**: `SKILL.md` per skill directory with structured sections
- **Agent format**: Frontmatter YAML (`name`, `description`, `tools`, `mcpServers`, `model`)
- **Bilingual**: Mixed English/Chinese comments and documentation
- **Emoji usage**: Controlled — ❌ ✅ ⚠️ 🔴 🟡 for status indicators only

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Directories | kebab-case | `data-refresh`, `case-reader` |
| TS files | kebab-case | `case-reader.ts`, `todo-writer.ts` |
| React components | PascalCase | `CaseDetail.tsx`, `TodoView.tsx` |
| Test files | Co-located `.test.ts` | `case-reader.test.ts` |
| PS1 scripts | kebab-case | `check-meta.ps1` |
| Skill dirs | kebab-case matching command | `casework` → `/casework` |
| Agent files | kebab-case.md | `email-drafter.md` |
| Route files | kebab-case | `case-routes.ts` |
| Service files | kebab-case | `case-reader.ts` |

## Patterns

### Skill Definition Pattern
```markdown
---
(no frontmatter for skills — just SKILL.md)
---

# Steps
1. Step description
2. Step description

# Safety
- ❌ Don't do X
- ✅ Do Y
```

### Agent Definition Pattern
```yaml
---
name: agent-name
description: "What this agent does"
tools: Bash, Read, Write
mcpServers:
  - server-name
model: sonnet
---

Instructions for the agent...
```

### Service Layer Pattern (Dashboard)
- Services in `dashboard/src/services/` handle business logic
- Routes in `dashboard/src/routes/` handle HTTP request/response
- Services read from filesystem (case directories, JSON files)
- Services return structured data; routes format HTTP responses

### Error Handling
- **Dashboard**: try/catch in route handlers, HTTP status codes
- **Scripts**: PowerShell `try/catch`, exit codes
- **Skills**: Error sections with ❌/✅ markers
- **Learnings**: Errors logged to `.learnings/ERRORS.md`

### Configuration Pattern
- Project-level: `config.json` (casesRoot, dataRoot)
- MCP servers: `.mcp.json`
- Dashboard: `dashboard/src/config.ts`
- Tests: `tests/state.json`, `tests/manifest.json`

## Documentation Style
- **CLAUDE.md**: Comprehensive agent instructions with tables, code blocks, emoji markers
- **Playbook guides**: Task-oriented how-to documents
- **Playbook schemas**: Data structure definitions with examples
- **Memory files**: Freeform daily logs + structured long-term memory
- **Language**: Primarily Chinese for internal docs, English for code and technical specs
