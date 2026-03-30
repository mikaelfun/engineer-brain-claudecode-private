# Stack

## Languages

| Language | Usage | Locations |
|----------|-------|-----------|
| **TypeScript** | Primary — Dashboard backend + frontend | `dashboard/src/`, `dashboard/web/src/` |
| **PowerShell** | D365 operations, Kusto queries, validation scripts | `skills/d365-case-ops/scripts/`, `scripts/*.ps1` |
| **JavaScript (Node.js)** | Test executors, utility scripts, MJS scripts | `tests/executors/`, `scripts/*.mjs` |
| **Bash** | Test framework executors, CI scripts | `tests/executors/*.sh` |
| **Markdown** | Skills, agents, playbooks, documentation | `.claude/skills/`, `.claude/agents/`, `playbooks/` |

## Runtime

- **Node.js** — Dashboard server (Hono), test scripts, MCP servers
- **PowerShell** — D365 CRM operations via REST API, Kusto diagnostic queries
- **Claude Code CLI** — Main agent runtime (Claude Agent SDK sessions)
- **Git Bash (MSYS2)** — Shell environment on Windows

## Frameworks & Libraries

### Backend (Dashboard Server)

| Package | Version | Purpose |
|---------|---------|---------|
| `hono` | ^4.6.14 | Lightweight HTTP framework (API server) |
| `@hono/node-server` | ^1.13.7 | Node.js adapter for Hono |
| `@anthropic-ai/claude-agent-sdk` | ^0.2.77 | Claude Code SDK for per-case AI sessions |
| `bcryptjs` | ^2.4.3 | Password hashing (dashboard auth) |
| `jsonwebtoken` | ^9.0.2 | JWT authentication tokens |
| `chokidar` | ^4.0.3 | File system watching (case updates) |
| `dotenv` | ^17.3.1 | Environment variable loading |
| `uuid` | ^11.0.5 | Unique ID generation |

### Frontend (Dashboard Web)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | React DOM rendering |
| `react-router-dom` | ^7.1.1 | Client-side routing |
| `zustand` | ^5.0.2 | State management |
| `@tanstack/react-query` | ^5.62.2 | Server state / data fetching |
| `tailwindcss` | (via config) | Utility-first CSS |
| `@tailwindcss/typography` | ^0.5.19 | Prose styling |
| `lucide-react` | ^0.468.0 | Icon library |
| `react-markdown` | ^9.0.1 | Markdown rendering |
| `recharts` | ^2.15.0 | Charts and data visualization |
| `remark-gfm` | ^4.0.0 | GitHub Flavored Markdown |

### Dev / Testing

| Package | Purpose |
|---------|---------|
| `vitest` ^4.1.0 | Test runner (backend + frontend) |
| `@testing-library/react` ^16.3.2 | React component testing |
| `@testing-library/jest-dom` ^6.9.1 | DOM assertion matchers |
| `@testing-library/user-event` ^14.6.1 | User interaction simulation |
| `@vitest/coverage-v8` ^4.1.0 | Code coverage |
| `tsx` ^4.19.2 | TypeScript execution (dev server) |
| `typescript` ^5.7.2 | Type checking |
| `concurrently` ^9.1.0 | Run multiple dev processes |
| `vite` | Frontend build tool |

## Configuration

| File | Purpose |
|------|---------|
| `config.json` | Project-level config (casesRoot, dataRoot, teamsSearchCacheHours) |
| `.mcp.json` | MCP server definitions (12 servers) |
| `CLAUDE.md` | Agent instructions and architecture docs |
| `dashboard/package.json` | Backend dependencies |
| `dashboard/web/package.json` | Frontend dependencies |
| `dashboard/web/tailwind.config.js` | Tailwind CSS configuration |
| `dashboard/web/tsconfig.json` | Frontend TypeScript config |
| `tests/state.json` | Test framework state machine |
| `tests/manifest.json` | Test manifest |

## Build & Dev

- **Dev server**: `npm run dev` in `dashboard/` — runs Hono backend + Vite frontend concurrently
- **Build**: `npm run build` in `dashboard/` — builds Vite frontend
- **Tests**: `vitest run` (backend) + `npm --prefix web test` (frontend)
- **No CI/CD pipeline** — development is local, driven by Claude Code CLI sessions
