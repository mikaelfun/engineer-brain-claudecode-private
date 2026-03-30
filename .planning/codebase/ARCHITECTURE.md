# Architecture

## System Pattern: AI Agent Orchestration

EngineerBrain follows a **Main Agent + Subagent** pattern, where:
- A **Main Agent** (Claude Code CLI session) orchestrates case workflows
- **Subagents** are spawned for specialized tasks (Teams search, troubleshooting, email drafting)
- A **Dashboard** provides a web UI for human operators, creating per-case Claude sessions via the Agent SDK

## Layers

```
┌─────────────────────────────────────────────┐
│            Dashboard (Web UI)                │
│  React + Zustand + React Query              │
├─────────────────────────────────────────────┤
│            Dashboard API (Hono)              │
│  Routes → Services → Agent Sessions          │
├─────────────────────────────────────────────┤
│          Claude Agent SDK                    │
│  Per-case sessions with tools + MCP          │
├─────────────────────────────────────────────┤
│          Main Agent (CLAUDE.md)              │
│  Orchestrates skills + spawns agents         │
├───────────┬──────────┬──────────────────────┤
│  Skills   │  Agents  │  Domain Tools        │
│ (.claude/ │ (.claude/│  (skills/)           │
│  skills/) │  agents/)│  PowerShell/JS       │
├───────────┴──────────┴──────────────────────┤
│          MCP Servers (12)                    │
│  ICM, Teams, Kusto, Mail, RAG, etc.         │
├─────────────────────────────────────────────┤
│          External Services                   │
│  D365, Azure, Graph, Kusto, OneNote          │
└─────────────────────────────────────────────┘
```

## Data Flow

### Case Processing Flow
1. **Trigger**: User request or `/patrol` batch scan
2. **Data Refresh**: `data-refresh` skill pulls case info from D365 + ICM → writes to `cases/active/{id}/`
3. **Compliance Check**: `compliance-check` validates entitlement + 21v status
4. **Status Judge**: `status-judge` determines case status and days since contact
5. **Routing**: Based on status, route to troubleshooting, email drafting, or inspection
6. **Troubleshooting**: `troubleshooter` agent runs Kusto diagnostics, doc search → writes analysis report
7. **Email Draft**: `email-drafter` agent generates customer communication → writes to `drafts/`
8. **Inspection**: `inspection-writer` creates summary + todo items
9. **Todo**: User reviews and acts on todo items via Dashboard or CLI

### Dashboard ↔ Agent Flow
1. Dashboard `POST /api/case/:id/process` creates a Claude Agent SDK session
2. Session runs with case-specific context injected
3. Results streamed back via SSE or polling
4. `POST /api/case/:id/chat` resumes existing session for follow-ups

## Entry Points

| Entry Point | Location | Purpose |
|-------------|----------|---------|
| CLI slash commands | `.claude/skills/*/SKILL.md` | Direct invocation (e.g., `/casework 123`) |
| Dashboard API | `dashboard/src/index.ts` | Web UI backend |
| Dashboard Web | `dashboard/web/src/main.tsx` | React SPA |
| Test Framework | `tests/executors/*.sh` | Automated test loops |
| Patrol | `.claude/skills/patrol/SKILL.md` | Batch case scanning |

## Key Abstractions

### Skills (`.claude/skills/`)
- Each skill is a directory with `SKILL.md` defining execution steps
- Skills are invoked as slash commands by the Main Agent
- They can read/write case directory files and call MCP tools
- 18 skills covering the full case lifecycle

### Agents (`.claude/agents/`)
- Agent definitions with frontmatter (name, tools, mcpServers, model)
- Spawned by the Main Agent for tasks needing isolated context
- 6 registered agents: casework, data-refresh, teams-search, email-drafter, troubleshooter, stage-worker

### Playbooks (`playbooks/`)
- Domain knowledge organized as schemas, rules, guides, email samples
- Referenced by skills and agents during execution
- Not executable — pure reference material

### Case Directory (`cases/active/{id}/`)
- Persistent storage per case — survives session compaction
- Contains: case-info.md, casehealth-meta.json, analysis/, drafts/, todo/, context/
- Acts as "external memory" for the AI agent
