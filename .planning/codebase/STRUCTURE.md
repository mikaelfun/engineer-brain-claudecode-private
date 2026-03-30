# Structure

## Root Directory Layout

```
EngineerBrain/
├── .claude/                    # Claude Code configuration
│   ├── agents/                 # Subagent definitions (7 .md files)
│   │   ├── casework.md
│   │   ├── data-refresh.md
│   │   ├── email-drafter.md
│   │   ├── stage-worker.md
│   │   ├── teams-search.md
│   │   ├── test-supervisor-runner.md
│   │   └── troubleshooter.md
│   └── skills/                 # Slash command skills (18 directories)
│       ├── casework/           # Full case processing orchestration
│       ├── compliance-check/   # Entitlement/21v validation
│       ├── data-refresh/       # D365 + ICM data pull
│       ├── draft-email/        # Email draft generation
│       ├── email-search/       # Mail MCP search
│       ├── inspection-writer/  # Case summary + todo generation
│       ├── issue/              # Issue tracker CLI
│       ├── onenote-export/     # OneNote → Markdown sync
│       ├── onenote-search/     # Knowledge base search
│       ├── patrol/             # Batch case scanning
│       ├── prd-creator/        # PRD document generator
│       ├── rag-sync/           # RAG vector DB sync
│       ├── stage-worker/       # Test loop execution
│       ├── status-judge/       # Case status determination
│       ├── teams-search/       # Teams message search
│       ├── test-supervisor/    # Test supervision
│       ├── troubleshoot/       # Technical analysis routing
│       └── conductor/          # (Project management — shared with GSD)
├── cases/                      # Case data storage
│   ├── active/                 # Active cases (16 case directories)
│   │   └── {case-id}/         # Per-case directory
│   │       ├── case-info.md
│   │       ├── casehealth-meta.json
│   │       ├── analysis/
│   │       ├── context/
│   │       ├── drafts/
│   │       └── todo/
│   ├── archived/               # Completed cases
│   └── bak/                    # Backups
├── conductor/                  # Project management (tracks, specs)
│   ├── tracks/                 # Implementation tracks
│   ├── tracks.md
│   ├── product.md
│   ├── tech-stack.md
│   └── workflow.md
├── dashboard/                  # Web Dashboard application
│   ├── src/                    # Backend (Hono + TypeScript)
│   │   ├── index.ts            # Server entry point
│   │   ├── config.ts           # Configuration
│   │   ├── agent/              # Claude Agent SDK integration
│   │   ├── middleware/         # Auth, CORS
│   │   ├── routes/             # API route handlers (13 files)
│   │   ├── services/           # Business logic (16 files)
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   └── watcher/            # File system watcher
│   └── web/                    # Frontend (React + Vite)
│       └── src/
│           ├── App.tsx         # Root component
│           ├── pages/          # Page components (13 files)
│           ├── components/     # UI components (14+ files)
│           ├── hooks/          # Custom React hooks
│           ├── stores/         # Zustand stores
│           ├── api/            # API client
│           ├── contexts/       # React contexts
│           └── utils/          # Frontend utilities
├── issues/                     # Issue tracker (ISS-001 to ISS-016)
├── memory/                     # AI memory system
│   ├── MEMORY.md               # Long-term memory
│   └── daily/                  # Daily memory logs
├── playbooks/                  # Domain knowledge
│   ├── schemas/                # Data structure definitions
│   ├── rules/                  # Business rules
│   ├── guides/                 # How-to guides
│   └── email-samples/          # Email templates
├── scripts/                    # Utility & test scripts
│   ├── *.ps1                   # PowerShell scripts (5 files)
│   ├── *.mjs                   # Node.js scripts (7 files)
│   └── *.js                    # JavaScript utilities
├── skills/                     # Domain tools (capability packages)
│   ├── d365-case-ops/          # D365 CRM operations
│   ├── kusto/                  # Kusto query templates (12 product dirs)
│   ├── humanizer/              # Email humanization
│   ├── humanizer-zh/           # Chinese email humanization
│   ├── agency-icm/             # ICM incident tools
│   ├── contentidea-kb-search/  # KB article search
│   ├── kb-article-generator/   # KB article creation
│   └── workiq/                 # WorkIQ integration
├── tests/                      # Automated test framework
│   ├── registry/               # Test definitions (7 categories)
│   ├── executors/              # Test runners (40+ bash scripts)
│   ├── results/                # Test output
│   ├── recipes/                # Test recipes
│   ├── schemas/                # Test schemas
│   ├── state.json              # State machine (round 28)
│   └── manifest.json           # Test manifest
├── .learnings/                 # Error logs and learnings
├── .mcp.json                   # MCP server configuration
├── config.json                 # Project configuration
├── CLAUDE.md                   # Agent instructions (primary)
└── PRD.md                      # Product requirements document
```

## Key Locations

| What | Where |
|------|-------|
| Main agent config | `CLAUDE.md` |
| Project config | `config.json` |
| MCP servers | `.mcp.json` |
| Active case data | `cases/active/{case-id}/` |
| Skill definitions | `.claude/skills/{name}/SKILL.md` |
| Agent definitions | `.claude/agents/{name}.md` |
| Domain scripts | `skills/{capability}/scripts/` |
| Dashboard backend | `dashboard/src/` |
| Dashboard frontend | `dashboard/web/src/` |
| Test definitions | `tests/registry/{category}/` |
| Test runners | `tests/executors/` |

## Naming Conventions

- **Skill directories**: kebab-case (`data-refresh`, `compliance-check`)
- **Agent files**: kebab-case.md (`teams-search.md`, `email-drafter.md`)
- **Case IDs**: Numeric strings (`2603250010001221`)
- **Issue IDs**: `ISS-XXX` format (`ISS-001`, `ISS-016`)
- **TypeScript files**: kebab-case (`case-reader.ts`, `todo-writer.ts`)
- **React components**: PascalCase files (`CaseDetail.tsx`, `TodoView.tsx`)
- **Test files**: `*.test.ts` / `*.test.tsx` co-located with source
- **PowerShell scripts**: kebab-case (`check-meta.ps1`, `validate-casework.ps1`)
- **Daily memory**: `YYYY-MM-DD.md` format
- **Todo files**: `YYMMDD-HHMM.md` format
