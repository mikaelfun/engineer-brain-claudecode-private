---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Query Customer Data tab"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Query%20Customer%20Data%20tab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ASC — Query Customer Data Tab for Application Insights

## Overview

The Query Customer Data tab in ASC allows querying customer Application Insights data directly, similar to Log Analytics. Customer must have granted diagnostic data sharing approval first.

> **Note:** It is NOT necessary to query Application Insights data from the Log Analytics experience — use this tab directly with the same KQL schema as the portal Logs experience. The `render` clause is NOT supported here.

## Common Diagnostic Scenarios

- **Missing telemetry + no ingestion drop**: Query tables to check for ingestion latency — data may have reached endpoint but not yet fully processed.
- **Multiple apps, one stopped**: Log queries can isolate which `cloud_RoleName` stopped sending when ingestion charts are ambiguous.
- **SDK version investigation**: `sdkVersion` column reveals language and instrumentation method (auto vs manual).

## Useful KQL Queries

### Overview of last telemetry per app/type
```kusto
union *
| where timestamp > ago(90d)
| summarize max(timestamp) by cloud_RoleName, itemType
| sort by max_timestamp asc
```

### Data flow by day, app, and telemetry type
```kusto
union *
| where timestamp > ago(7d)
| summarize count() by bin(timestamp,1d), cloud_RoleName, itemType
| order by timestamp asc
```

### Detailed view with SDK version
```kusto
union * 
| where timestamp > ago(90d) 
| summarize count() by bin(timestamp,1d), cloud_RoleName, cloud_RoleInstance, itemType, sdkVersion
| order by timestamp asc, cloud_RoleName, cloud_RoleInstance, itemType, sdkVersion
```

### Tables receiving data (7-day view)
```kusto
union * 
| summarize count() by bin(timestamp, 7d), itemType
| order by timestamp desc, itemType
```

### Last time each SDK version sent data
```kusto
requests 
| summarize arg_max(timestamp, *) by sdkVersion, itemType
| order by timestamp desc, sdkVersion
```

### Ingestion latency breakdown
```kusto
requests
| extend TimeEventOccurred = timestamp
| extend TimeRequiredtoGettoAzure = _TimeReceived - timestamp
| extend TimeRequiredtoIngest = ingestion_time() - _TimeReceived
| extend EndtoEndTime = ingestion_time() - timestamp
| project timestamp, TimeEventOccurred, _TimeReceived, TimeRequiredtoGettoAzure, ingestion_time(), TimeRequiredtoIngest, EndtoEndTime
```

### Sampling impact (100% = no sampling)
```kusto
union requests,dependencies,pageViews,browserTimings,exceptions,traces 
| where timestamp > ago(1d) 
| summarize RetainedPercentage = 100/avg(itemCount) by bin(timestamp, 1d), itemType
```

### Table schema
```kusto
traces | getschema
```

## Notes on cloud_RoleName / cloud_RoleInstance
- `cloud_RoleName` = typically App Service web app or Function app name
- `cloud_RoleInstance` = typically an instance of an App Service or container/machine instance
- Use SDK version to determine language and auto vs manual instrumentation

## Internal References
- [Break down SDKs used and their versions](/Application-Insights/How-To/Additional-Reference-Material/General-References/Break-down-SDKs-used-and-their-versions)
- [Use App Insights Query Converter Tool](/Application-Insights/How-To/Additional-Reference-Material/Query-and-REST-API-References/Use-App-Insights-Query-Converter-Tool)
