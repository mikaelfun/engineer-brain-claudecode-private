# Integrations

## MCP Servers (12 configured in `.mcp.json`)

| Server | Provider | Purpose |
|--------|----------|---------|
| `icm` | Agency CLI | Incident management — get incident details, impacted customers, AI summaries |
| `teams` | Agency CLI | Teams messaging — search chats, list/post messages, manage channels |
| `kusto` | Agency CLI | Kusto queries — Azure telemetry diagnostics (intunecn cluster) |
| `msft-learn` | Agency CLI | Microsoft docs search — official documentation and code samples |
| `mail` | Agency CLI | Outlook email — search, read, draft, send, reply, forward |
| `workiq` | Agency CLI | Microsoft 365 Copilot — natural language queries over M365 data |
| `ado-msazure` | Agency CLI | Azure DevOps (msazure org) — work items, wikis |
| `ado-contentidea` | Agency CLI | Azure DevOps (contentidea org) |
| `ado-supportability` | Agency CLI | Azure DevOps (supportability org) |
| `playwright` | npx @playwright/mcp | Browser automation (Edge only) |
| `OfficeMCP` | uvx officemcp | Microsoft Office control (Word, Excel) via Python |
| `local-rag` | Custom Node.js | Local RAG — vector search over OneNote knowledge base |

## External APIs (via PowerShell Scripts)

### Dynamics 365 (D365 CRM)
- **Location**: `skills/d365-case-ops/scripts/`
- **Operations**: Case search, read, update, create notes, add labor time, SAP integration
- **Auth**: Azure AD / organizational credentials
- **Environment**: OneSupport (D365 instance for Microsoft support)

### Kusto (Azure Data Explorer)
- **Location**: `skills/kusto/` (product-specific query templates)
- **Cluster**: `intunecn.chinanorth2.kusto.chinacloudapi.cn` (Azure China)
- **Products covered**: Intune, AKS, ARM, AVD, Disk, Entra ID, EOP, Monitor, Networking, Purview, VM, ACR

### ICM (Incident Management)
- **Location**: `skills/agency-icm/`
- **Operations**: Get incident details, impacted customers, similar incidents, mitigation hints
- **Access**: Via Agency CLI MCP proxy

## Data Stores

### File System (Primary)
- **Case data**: `cases/active/{case-id}/` — structured directories per case
- **Case artifacts**: `case-info.md`, `casehealth-meta.json`, `analysis/`, `drafts/`, `todo/`, `context/`
- **Issues**: `issues/ISS-XXX.json` — JSON issue tracker
- **Memory**: `memory/MEMORY.md`, `memory/daily/YYYY-MM-DD.md`
- **Learnings**: `.learnings/ERRORS.md`, `.learnings/LEARNINGS.md`

### LanceDB (Vector Database)
- **Location**: `~/Documents/EngineerBrain-Data/lancedb/`
- **Content**: OneNote knowledge base embeddings
- **Embedding**: OpenAI `text-embedding-3-small` via custom endpoint
- **Access**: `local-rag` MCP server

### OneNote Export
- **Location**: `~/Documents/EngineerBrain-Data/OneNote Export/` (~1.4GB)
- **Content**: Exported OneNote notebooks as Markdown
- **Synced**: Via `/onenote-export` and `/rag-sync` skills

## Authentication

| Service | Method |
|---------|--------|
| D365 CRM | Azure AD organizational credentials (PowerShell) |
| Kusto | Azure AD token (via Agency CLI) |
| Teams/Mail/WorkIQ | Microsoft Graph API (via Agency CLI) |
| Dashboard | JWT + bcrypt (local auth) |
| Local RAG | OpenAI-compatible API key (custom endpoint) |
| Azure DevOps | Azure AD (via Agency CLI) |

## External Service Dependencies

- **Azure China (Mooncake)** — Primary cloud environment for Kusto diagnostics
- **Microsoft Graph** — Teams, Mail, WorkIQ integrations
- **Microsoft Learn** — Documentation search
- **Claude API (Anthropic)** — AI agent sessions via Claude Agent SDK
- **Custom OpenAI endpoint** (`kunnewapi.net`) — Text embeddings for RAG
