---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel Graph (MSG)/[TSG] - Hunting graph and Custom graph"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20Graph%20(MSG)/[TSG]%20-%20Hunting%20graph%20and%20Custom%20graph"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Hunting Graph & Custom Graph TSG

## Overview

Guide for troubleshooting Microsoft Sentinel Hunting graph and Custom graphs. Hunting graph is available to Sentinel Lake & Graph customers with XDR eligibility. Custom graphs use VS Code extension with Spark compute.

**Learn docs:**
- Advanced Hunting Graph in Microsoft Defender
- Graph icons and visualizations in Microsoft Defender

## Hunting Graph FAQs

### Prerequisites
- Must be Sentinel Lake & Graph customer with XDR eligibility
- At least Exposure Management read permissions required
- Access: Defender portal > Investigation & response > Incidents & alerts > Hunting > Advanced hunting > Map icon or plus button > Hunting graph

### Common Issues

**Empty/no graph presented:**
1. Check for error in notification center (e.g., "An error occurred while fetching graph data" -> open support ticket)
2. Graph being built notification -> wait up to 24h after initial onboarding
3. No Defender products deployed -> deploy and provision
4. Insufficient scope permissions -> check with Security Administrator

**Pre-defined scenario shows no results:**
- Check for grey notification: "No paths exist for this entity..." or "No paths exist between the specified entities..."
- Clear all filters and re-run
- If persists, no supporting data exists

**Changes not reflected:** Propagation time up to 24 hours

**Missing entities/data:** Verify sensors active, check Advanced Hunting tables, wait 24h for sync

**Filters not taking effect:** Refresh graph tab. If persists, file support ticket.

**Expansion limitations:** Not all nodes support expansion (plus sign). Limited to supported node schemas only.

## Custom Graphs

### Telemetry
- Logged in babylonMdsLogs
- Cluster: babylon.eastus2.kusto.windows.net

### Service Limits (Nov 2025)

| Quota | Limit |
|---|---|
| Ephemeral graphs/month | 90 |
| Persisted graphs (concurrent) | 5 |
| Queries on persisted graph/month | 1500 |
| Queries on session graph | 100 |
| Concurrent ephemeral graphs/tenant | 4 |
| Session timeout (ephemeral) | 90 min |
| Session timeout (persistent) | 10 hours |

### Prerequisites for Custom Graphs
1. Proper roles and permissions
2. Logged into Microsoft Sentinel extension
3. Latest VS Code extension installed
4. Graph spark pool selected (NOT notebook spark pools)
5. Microsoft Sentinel channel selected in Output pane for error logs

### Error Codes

| Code | Message | Category | Resolution |
|---|---|---|---|
| 2201 | Can't access table graph_kernel_... | AuthorizationFailure | Retry |
| 2203 | Can't access table. Restart session. | AuthorizationFailure | Restart session |
| N/A | LIVY_JOB_TIMED_OUT: Session state Dead | Timeout | Restart spark session |

### Searching for Errors in Kusto Logs

With CorrelationID:
```kql
// cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs')
GatewayEvent | where CorrelationId == $CorrelationId
```

Without CorrelationID:
```kql
GatewayEvent
| where CallerTenantId == $CustomerTenantId
| where Path contains "/interactive"
| order by ['time'] desc
```

### Common Issues & Resolutions

**Unable to access custom graphs:**
- Validate tenant onboarded to Custom Graphs (Gated Public Preview)
- Install latest VS Code extension
- Select Graph compute pool (Graph pool 32 vcores)

**Unable to access/query lake data:**
- Ensure tenant onboarded to Data Lake
- Confirm correct Microsoft Entra ID
- Validate permission prerequisites

**Notebook session issues:**
- Select Graph compute pool, restart Spark session
- Wait up to 5 min for initialization
- Avoid >20 min inactivity

**Errors calling graph methods:**
- Use Microsoft Sentinel Graph libraries
- Use graph notebook template
- Only call supported documented methods

**Errors building ontology:**
- Familiarize with Graph libraries and method arguments
- Review graph ontologies and required parameters

**Ephemeral graph building times out:**
- Limit/filter data during prototyping
- Precompute transformations in data frames
- Restart spark session after prolonged inactivity

**Cannot find newly created graph:**
- Load notebook in folder context
- Wait up to 2 min for new graph to appear in extension

**Graph stuck in Creating/Enabled state:**
- Build time depends on graph size and payload
- Building expires after 10 hours
- Monitor status in VS Code extension

### Escalation Paths
- MSEM: Ownership Matrix
- Sentinel: PG Dev lookup escalation path
- Defender Hunting: TBD
