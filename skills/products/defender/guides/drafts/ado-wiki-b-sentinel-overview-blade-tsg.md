---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Sentinel Overview Blade/[TSG] - Overview Blade"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FSentinel%20Overview%20Blade%2F%5BTSG%5D%20-%20Overview%20Blade"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG - Sentinel Overview Blade

## Description

The new Overview blade consists of 4 widgets, each one of them presents a different set of data.
The widgets are: **Incidents, Data, Automation, Analytics**. Unlike the old Overview blade the new one is populated with the results returned from an API call made to a specific SecurityInsights operation that does a service to service query in log analytics. The old UI queries the workspace directly.

## Useful KQL to triage the problematic in case of an issue

### From the Overview service

```kql
ServiceFabricOperations
| where env_time > ago(5d)
| where operationName == "Sentinel.Overview.OverviewArmApi.Controllers.OverviewController.ExecuteOverviewRequestInputParametersForSection"
| project env_time,serviceName, operationName, resultSignature, resultType, customData, durationMs, clusterName
| extend correlationId = customData["x-ms-correlation-request-id"]
| extend WS = tostring(customData.WorkspaceName)
| extend WSID = tostring(customData.WorkspaceId)
| extend section = tostring(customData.SectionKind)
| where WSID == ""
| where WS =~ ""
```

### From DataConnectors section

```kql
let startTime = ago(3d);
ServiceFabricOperations
| where env_time > startTime
| where operationName == "Sentinel.Overview.OverviewArmApi.Controllers.ConnectorsController.GetOverviewConnectorsData"
| project env_time,serviceName, operationName, resultSignature, resultType, customData, durationMs, deploymentId
| extend WSID = tostring(customData.workspaceId)
| where WSID == ""
```

### From LogAnalytics (LA query runs for specific workspace)

```kql
ServiceFabricOperations
| where env_time > ago(5d)
| where operationName == "Sentinel.LogAnalyticsClient.LogAnalyticsClient.RunQueryAsync"
| extend correlationId = customData["x-ms-forward-internal-correlation-id"]
| extend WSID = tostring(customData.WorkspaceId)
| where WSID == ""
| where correlationId == ""
```
