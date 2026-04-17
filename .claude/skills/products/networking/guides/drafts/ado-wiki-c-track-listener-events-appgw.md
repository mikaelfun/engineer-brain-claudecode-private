---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Track Listener Add or Delete Events on Azure Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FTrack%20Listener%20Add%20or%20Delete%20Events%20on%20Azure%20Application%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Track Listener Add or Delete Events on Azure Application Gateway V2

[[_TOC_]]

## Overview

When customers report missing listeners on Azure Application Gateway, it can be difficult to determine when these components were added or removed — especially when we have high volume of PUT operations on gateways.

This guide provides a Kusto query template to identify when a specific listener was added or deleted.

## Kusto Query for Listener-Level Change Tracking

**Cluster:** `hybridnetworking.kusto.windows.net`  
**Database:** `aznwmds`

```kusto
let AutoscaleInstanceRefreshOp = toscalar(
    AsyncWorkerLogsTable
    | where PreciseTimeStamp between (todatetime("2025-05-01 18:28:00") .. todatetime("2025-08-02 20:28:21"))
    | where OperationName == "PutVMSSApplicationGatewayWorkItem"
    | where Message contains "Updating Instance List"
    | where Message contains "Listener_name"   // <-- replace with actual listener name
    | project "AutoscaleRefreshInstanceDetails"
);
AppGwOperationHistoryLogsTable
| where PreciseTimeStamp between (todatetime("2025-05-01 18:28:00") .. todatetime("2025-08-02 18:28:21"))
| where GatewayName == "APPGWNAME"             // <-- replace with actual gateway name
| where OperationName == "PutVMSSApplicationGatewayWorkItem"
| where ResourceDiff contains "Listener_name"  // <-- replace with actual listener name
| order by PreciseTimeStamp asc
| project-away TIMESTAMP, RoleInstance, Level, ProviderGuid, EventId, Pid, Tid, EventName, Id, ServicePrefix
| summarize ConfigDiff = make_list(ConfigDiff), ResourceDiff = make_list(ResourceDiff)
    by StartTimeUtc, Tenant, OperationType, OperationName, ActivityId, OperationId, Status,
       DurationInSecond, IsNewGateway, GatewayName, UpdateOperationType, FastUpdateResult,
       FastUpdateDurationInSecond
| project StartTimeUtc, Tenant, OperationType, OperationName,
    UpdateOperationType = coalesce(AutoscaleInstanceRefreshOp, UpdateOperationType),
    ActivityId, OperationId, GatewayName, Status, FastUpdateResult, DurationInSecond,
    FastUpdateDurationInSecond, IsNewGateway,
    ResourceDiff = strcat_array(ResourceDiff, ""),
    ConfigDiff = strcat_array(ConfigDiff, "")
```

**Usage:**
- Replace `Listener_name` with the actual listener name you're investigating.
- Replace `APPGWNAME` with the gateway name.
- Adjust the time range (`PreciseTimeStamp between`) to the investigation window.

## Contributors
- Eric Ashton
- Jagan Mohan Reddy Peddabavi
