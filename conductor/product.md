# Product Definition: EngineerBrain

## Vision
AI-driven case management and automation system for Azure Support Engineers, combining Claude-based orchestration with D365 automation to streamline case handling while keeping risky actions under human control.

## Core Value Proposition
- Automate repetitive D365 case operations (data refresh, compliance checks, status judgment)
- AI-powered troubleshooting with Kusto diagnostics across 12 Azure products
- Intelligent email drafting with context awareness
- Real-time dashboard for case monitoring, todo tracking, and workflow control
- Persistent per-case workspaces as filesystem-based data model

## Target Users
- Azure Support Engineers (primary: Kun Fang)
- Engineers managing multiple D365 support cases simultaneously

## Key Workflows
1. **Single-case processing** (`/casework`) - Full pipeline: data refresh → compliance → status → troubleshoot → draft
2. **Batch patrol** (`/patrol`) - Multi-case inspection and todo generation
3. **Interactive follow-up** - Resume sessions, chat with case context
4. **Dashboard operations** - Web-based case management, monitoring, and control

## Safety Boundaries
- AI can: analyze, summarize, draft, recommend
- AI cannot: directly send customer emails, write to D365 without confirmation
- Human must confirm: all D365 write operations

## Architecture Layers
1. `.claude/skills/` - Workflow orchestration (slash commands)
2. `.claude/agents/` - Spawnable agents with constrained context
3. `skills/` - Reusable domain capability packs (scripts, references, Kusto)
4. `playbooks/` - Domain rules, schemas, guides, samples
5. `cases/` - Filesystem-based case workspace (runtime data)
6. `dashboard/` - Full-stack web application (React + Hono)

## External Integrations (via MCP)
Teams, ICM, ADO, Kusto, Microsoft Learn, WorkIQ, Mail, Playwright
