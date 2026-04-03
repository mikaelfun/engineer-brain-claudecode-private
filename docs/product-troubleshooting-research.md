# Product-Specific Troubleshooting Infrastructure Report
Date: 2026-03-31
## Executive Summary
EngineerBrain has 5 troubleshooting infrastructure layers:
1. Troubleshooter Agent (orchestration)
2. Kusto Skill (12 product sub-skills)
3. Knowledge Retrieval (4 systems)
4. D365 Case Operations
5. ICM Integration
## 1. Troubleshooter Agent
File: .claude/agents/troubleshooter.md
### MCP Servers & Tools
Tool | Type | Purpose
Kusto MCP | Telemetry | Query Azure platform logs
msft-learn MCP | Docs | Official Microsoft documentation
icm MCP | Metadata | Incident/outage information
local-rag MCP | KB | OneNote/markdown search
az devops CLI | Knowledge | ADO Wiki + ContentIdea search
Bash/Read/Write/Grep | Utilities | File operations
WebSearch | Web | Public resources (fallback)
### 5-Phase Workflow
1. Understand Problem (read case data)
2. Execute Kusto Queries (product skill)
3. Knowledge Search (OneNote -> Wiki -> Docs -> Web)
4. Cross-Analysis (correlate findings)
5. Generate Report (analysis + research)
## 2. Kusto Skill: 12 Product Sub-Skills
Total: 122 tables, 102 queries
### Products
VM/VMSS (24 tables, 15 queries)
AKS (24 tables, 14 queries)
ACR (6 tables, 10 queries)
ARM (12 tables, 7 queries)
AVD (11 tables, 10 queries)
Disk (6 tables, 10 queries)
Entra ID (8 queries)
Intune (11 tables, 13 queries)
Monitor (8 tables, 5 queries)
Networking (9 tables, 7 queries)
Purview (3 tables, 3 queries)
EOP (email security)
### Sub-Skill Structure
skills/{product}/
鈹溾攢鈹€ SKILL.md
鈹斺攢鈹€ references/
    鈹溾攢鈹€ kusto_clusters.csv
    鈹溾攢鈹€ tables/*.md
    鈹斺攢鈹€ queries/*.md
## 3. Knowledge Retrieval: 4 Systems
### OneNote RAG (local-rag MCP)
Search team knowledge base
Usage: /onenote-search keyword
Supports Chinese/English via ripgrep + LLM
### ADO Wiki & ContentIdea (az devops CLI)
ADO Wiki: internal TSGs + known issues
ContentIdea: published KB articles
Command: pwsh scripts/ado-search.ps1
### Microsoft Learn (msft-learn MCP)
- microsoft_docs_search
- microsoft_code_sample_search
- microsoft_docs_fetch
### ICM Integration (icm MCP)
18 tools for incident/impact/team metadata
## 4. D365 Case Operations
Three Elements:
1. Customer Problem (view-details.ps1)
2. Timeline/Pattern (view-timeline.ps1)
3. Resources (Case + SAP)
## 5. Non-Kusto Tools
Tool | When Used
OneNote RAG | Team KB (first line)
ADO Wiki | TSGs + known issues
ContentIdea | Published KB
Microsoft Docs | Features/APIs/config
Email Search | Communication context
ICM Lookup | Platform incidents
D365 Case | Extract context
Web Search | Fallback
## 6. What New Product Skill Needs
### Minimum (MVP)
1. SKILL.md (architecture + workflow)
2. kusto_clusters.csv (endpoints)
3. tables/*.md (schemas)
4. queries/*.md (10-15 templates)
5. known-issues.md (error codes)
6. decision-tree.md (diagnostic paths)
### Optional
7. Escalation criteria
8. Health check queries
9. Integration points
10. Troubleshooting workflow
## 7. Complete Data Flow
Case Input
    鈫?D365 Extraction
    鈫?Troubleshooter Route
    鈫?Parallel: Knowledge Search + Kusto
    鈫?Cross-Analysis
    鈫?Report Generation
    鈫?Output Files
## 8. Real Example: VM Skill
24 tables across 11 clusters
Diagnostic layers: ARM -> CRP -> Fabric -> Host -> Hardware
15 query templates
## 9. Key Design Patterns
Multi-Cluster: queries from 5-11 clusters
Parameterized: {paramName} substitution
Branching: Query N result determines Query N+1
Evidence Chain: trace finding to source
## 10. Integration Checklist
- Identify Kusto clusters
- Map diagnostic layers
- Collect schemas
- Write query templates
- Document issues
- Create decision tree
- Create SKILL.md
- Test with real cases
- Verify integration
- Document escalation
## 11. Key Insights
1. Kusto is primary, not only tool (8+ sources)
2. Multi-cluster architecture (5-11 per product)
3. Parameterized templates for reuse
4. Evidence chain required
5. Decision trees over linear
6. Non-Kusto tools provide context
Full infrastructure enables rapid product troubleshooting skill development.
