# Tech Stack: EngineerBrain

## Dashboard Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Hono (web framework)
- **Server:** @hono/node-server
- **AI SDK:** @anthropic-ai/claude-agent-sdk
- **Auth:** jsonwebtoken + bcryptjs
- **File Watching:** chokidar
- **Config:** dotenv
- **Build/Run:** tsx, concurrently

## Dashboard Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router
- **Data Fetching:** TanStack React Query
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** lucide-react
- **Markdown:** react-markdown + remark-gfm

## Automation Layer
- **Scripting:** PowerShell (D365 operations, 30+ scripts)
- **Test Utilities:** Node.js .mjs scripts
- **Browser Automation:** Playwright (via MCP)

## Data Model
- **Storage:** Filesystem-based (no database)
- **Case Data:** JSON + Markdown files per case directory
- **Session State:** .case-sessions.json
- **Config:** config.json + .env

## External Systems (MCP)
- agency.exe for Teams, ICM, ADO, Kusto, WorkIQ, Mail
- Playwright MCP for browser automation
- Microsoft Learn MCP for documentation

## Development
- **Version Control:** Git
- **Package Manager:** npm
- **IDE:** Claude Code
