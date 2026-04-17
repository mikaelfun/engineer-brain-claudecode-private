---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/[TSG] - GigLA XDR Pipeline"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/[TSG]%20-%20GigLA%20XDR%20Pipeline"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GigLA XDR Pipeline TSG

## Overview

The XDR GigLa Ingestion Pipeline streams XDR data (currently MDE only) from XDR to customer's Log Analytics workspace and Data Lake for USX customers.

**ICM Queue:** XDR GigLa Ingestion Pipeline
**Team:** Sentinel XDR Ingestion Pipeline/Triage (Lead: Iulian Negroiu)
**Telemetry:** Kusto cluster `https://securityinsights.kusto.windows.net/`, database `SecurityInsightsProd`
**Access:** https://coreidentity.microsoft.com/manage/Entitlement/entitlement/sentinelsupp-253y

## Two Pipelines in Production

| Pipeline | Owner | Data Types | Status |
|---|---|---|---|
| **Old (shoebox-based)** | DevDataPlatform (Hodaya Shabtay, ILDC) | All XDR data | Default for Sentinel-only customers |
| **New (GigLA)** | Sentinel XDR Ingestion Pipeline (Iulian, Redmond) | MDE only (expanding) | For new MDE-only onboardings |

## Diagnostic Decision Tree

### Step 1: Is customer on the old pipeline?
```kql
cluster('azureinsights.kusto.windows.net').database('Insights').OdsTelemetry
| where TIMESTAMP > ago(1d)
| where serviceIdentity == "TENANT_MICROSOFT.WINDOWSDEFENDERATP"
| where customerFirstTagId == "<tenantId>"
| where category == "<table>"
```
If yes -> redirect to DevDataPlatform team (not this TSG).

### Step 2: Is customer on the new GigLA pipeline?
```kql
Span
| where serviceName == "giglaingestion-queueconsumer"
| where env_time > ago(24h)
| project TenantId = tostring(tenantId), WorkspaceId = tostring(env_properties["workspaceId"])
| where isnotempty(WorkspaceId)
| distinct TenantId, WorkspaceId
```
If tenant+workspace NOT in list -> XDR connector not setup correctly. Re-verify onboarding steps.

### Step 3: Is the LA workspace in active state?
```kql
let wsids = dynamic(["<wsId>"]);
Span
| where env_time > ago(7d)
| where name == "MetadataUpdater.CustomerMetadata.Observer.Updater.CustomerMetadataUpdater.UpdateIfNeeded"
| where env_properties has_any (wsids)
| extend customData = parse_json(env_properties)
| evaluate bag_unpack(customData, "props_")
| project env_time, WorkspaceStatus = props_WorkspaceStatus, WorkspaceStatusChangeTime = props_WorkspaceStatusChangeTime, WorkspaceId
| summarize arg_max(env_time, WorkspaceStatus, WorkspaceStatusChangeTime) by WorkspaceId
```

## Before Creating CRI

Include:
- What is the main source of problem?
- Has this worked before? Regression vs new setup?
- Sentinel Lake or Sentinel SIEM-only customer?
- Has XDR connector been deployed?
- Which XDR tables are selected?
- Analytics retention and total retention settings in table management?
