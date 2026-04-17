---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to get the Draft request ID for a Log Alert evaluation and other Draft related information"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20get%20the%20Draft%20request%20ID%20for%20a%20Log%20Alert%20evaluation%20and%20other%20Draft%20related%20information"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get the Draft request ID for a Log Alert evaluation

## Prerequisites

- Operation Parent ID of the alert evaluation (from ASC Execution History)
- Approximate start and end time of the alert evaluation

## Kusto Query

Cluster: **azalertsprodweu.westeurope** / Database: **LogSearchRule**

```kql
let startTime = datetime(2024-09-03 06:18);
let endTime = datetime(2024-09-03 06:22);
let operationParentID = '';
cluster('azalertsprodweu.westeurope').database('LogSearchRule').lsa_dependencies
| where timestamp between(startTime..endTime)
| where operation_ParentId == operationParentID
| where name =~ "draft"
| extend querystats = tostring(customDimensions["Kusto.QueryStatistics"])
| parse querystats with * 'datasetStatistics":['  datasetStatistics '],"crossClusterResourceUsage' *
| project timestamp, success, resultCode, target,
    DraftRequestID = tostring(customDimensions.["Headers.x-ms-client-request-id"]),
    KustoErrors = customDimensions["Kusto.Errors"],
    DraftFailureResponse = customDimensions.['Draft.FailureResponse'],
    DraftFailureReason = customDimensions.['Draft.FailureReason'],
    datasetStatistics,
    requestPermissionObject = customDimensions["Request.PermissionObject"],
    requestManagedIdentity = customDimensions["Request.ManagedIdentity"],
    requestTargetResourceId = customDimensions["Request.TargetResourceId"],
    requestQuery = customDimensions["Request.Query"],
    isOptimized = customDimensions["IsOptimized"],
    requestTimespan = customDimensions["Request.Timespan"]
```

## Result Fields Reference

| Field | Description |
|-------|-------------|
| timestamp | Time Log Analytics returned data from the log alert's query |
| success | Whether query succeeded on Draft's side (True for partial errors) |
| resultCode | Result code from Draft (200 for partial errors) |
| target | Query target (e.g., workspace, subscription) |
| DraftRequestID | Request ID needed to investigate query issues further |
| KustoErrors | Errors returned from Kusto |
| DraftFailureResponse | Failures returned from Draft |
| DraftFailureReason | Reason for Draft failure |
| datasetStatistics | Number of rows returned from Draft |
| requestPermissionObject | Permission object of the request |
| requestManagedIdentity | Managed identity used to query Draft |
| requestTargetResourceId | Target resource ID of the query |
| requestQuery | Query made to Draft (may contain scrubbed data) |
| isOptimized | Whether the request was optimized |
| requestTimespan | Timespan of Draft request |

> For further investigation of query issues, use the DraftRequestID with [Common Queries Issues and How to Handle Them](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750401/Common-queries-issues-and-how-to-handle-them).
