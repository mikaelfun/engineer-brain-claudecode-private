---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Investigate Workspace properties and Solutions changes (Delete, Create)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FWorkspace%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: Investigate Workspace properties and Solutions changes

## Scenario
Investigate changes on Workspace resource properties and Solutions using Log Analytics Control Plane telemetry.

- **WorkspaceSnapshot** table: workspace state snapshots of last 6 months (every 6 hours)
- **ResourceUpdates** table: tracks PUT/DELETE changes (retention up to 1 year, started June 2022). No user identity - use ARM Telemetry for that.

## Pre-requisites
Kusto cluster: https://oibeftprdflwr.kusto.windows.net
Security group: Azure Log Analytics Control Plane Partners (via https://idweb/)

## Solutions Operations

### Check when solutions were added/removed
```kql
let CustomerWorkspaceId = "00000000-0000-0000-0000-000000000000";
cluster("oibeftprdflwr").database("AMSTelemetry").WorkspaceSnapshot
| where WorkspaceId == CustomerWorkspaceId
| extend splitlist = split(Solutions, ",")
| order by SnapshotTimestamp asc
| extend addedSolutions=set_difference((splitlist), prev(splitlist))
| extend removedSolutions=set_difference(prev(splitlist), splitlist)
| extend WhenSolutionsChanged = strcat(prev(SnapshotTimestamp), " to ", SnapshotTimestamp)
| where addedSolutions != "[]" or removedSolutions != "[]"
| where removedSolutions !=""
| project WorkspaceId, WorkspaceName, addedSolutions, removedSolutions, CurrentSolutionsList=Solutions, WhenSolutionsChanged, WorkspaceCreationDate=CreatedDate
```

### Check specific solution change details
```kql
let CustomersWorkspaceName = "WSNAME";
cluster("oibeftprdflwr").database("AMSTelemetry").ResourceUpdates
| where resourceType == "solutions"
| where url has CustomersWorkspaceName
```

## Key Notes
- Use Workspace ResourceId (not name) as unique identifier
- Snapshots are 6-hour intervals; changes between intervals need ResourceUpdates
- User identity only available in ARM Telemetry (EventServiceEntries)
