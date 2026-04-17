---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Identify if Sampling is enabled"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Identify%20if%20Sampling%20is%20enabled"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purpose

Understand the types of sampling offered and what type is being used, if any.

## Key Facts

- Sampling is operation-based.
- Querying data in the AI Component is the means to determine if Sampling is impacting a situation, but it alone does not determine if it is Enabled or not.
- Adaptive Sampling: may not show sampling when volume is too low to trigger it.
- Fixed Rate and Ingestion-side sampling are always set at a certain rate.
- Only .Net Framework and .Net Core support Adaptive Sampling today.
- Fixed Rate can in some instances be configured to NOT sample certain telemetry types.

# Query: Determine if Sampling is Impacting Data

Classic:
```kusto
union requests, dependencies, pageViews, browserTimings, exceptions, traces  
| where timestamp > ago(1d)  
| summarize RetainedPercentage = 100/avg(itemCount) by bin(timestamp, 1d), itemType, cloud_RoleName, sdkVersion  
| order by timestamp, itemType, cloud_RoleName, sdkVersion
```

Workspace-based:
```kusto
union AppRequests, AppDependencies, AppPageViews, AppBrowserTimings, AppExceptions, AppTraces 
| where TimeGenerated > ago(1d) 
| summarize RetainedPercentage = 100/avg(ItemCount) by bin(TimeGenerated, 1d), Type
| order by TimeGenerated, Type
```

**Interpretation:**
- `RetainedPercentage = 100` → no sampling impact (for this time bin/type)
- `RetainedPercentage < 100` → sampling is occurring

> If Adaptive Sampling is enabled but traffic volume is low, RetainedPercentage may still show 100% even though sampling is "on".

# Query: Retained vs Dropped Telemetry

Classic:
```kusto
union requests, dependencies, pageViews, browserTimings, exceptions, traces
| where timestamp between(datetime(2023-11-20 00:00:00)..1d)
| summarize TelemetrySavedPercentage = 100/avg(itemCount), TelemetryDroppedPercentage = 100-100/avg(itemCount) by bin(timestamp, 1d), itemType
| sort by timestamp asc
```

Workspace-based:
```kusto
union AppRequests, AppDependencies, AppPageViews, AppBrowserTimings, AppExceptions, AppTraces 
| where TimeGenerated between(datetime(2023-11-20 00:00:00)..1d)
| summarize TelemetrySavedPercentage = 100/avg(ItemCount), TelemetryDroppedPercentage = 100-100/avg(ItemCount) by bin(TimeGenerated, 1d), Type
| sort by TimeGenerated asc
```

# Quick Check: itemCount > 1

Classic:
```kusto
requests
| where timestamp > ago(90d)
| where itemCount > 1
| order by timestamp desc
```

Workspace-based:
```kusto
AppRequests
| where TimeGenerated > ago(90d)
| where ItemCount > 1
| order by TimeGenerated desc
```

If any rows return, sampling has occurred. `itemCount = N` means N records existed but only 1 was sent to Application Insights.

# Investigation Process

The key column is `RetainedPercentage` = `100 / avg(itemCount)`.
- `itemCount = 1` for all rows → no sampling
- `itemCount > 1` for some rows → sampling occurred

Drill-down query (requests + dependencies):

Classic:
```kusto
union requests, dependencies, pageViews, browserTimings, exceptions, traces 
| where timestamp > ago(1d) 
| summarize RetainedPercentage = 100/avg(itemCount) by bin(timestamp, 1d), itemType
```

Workspace-based:
```kusto
union AppRequests, AppDependencies, AppPageViews, AppBrowserTimings, AppExceptions, AppTraces 
| where TimeGenerated > ago(1d) 
| summarize RetainedPercentage = 100/avg(ItemCount) by bin(TimeGenerated, 1d), Type 
```

Count vs sum to understand the ratio:

Classic:
```kusto
union requests, dependencies, pageViews, browserTimings, exceptions, traces 
| summarize count(), sum(itemCount) by itemType
```

Workspace-based:
```kusto
union AppRequests, AppDependencies, AppPageViews, AppBrowserTimings, AppExceptions, AppTraces 
| summarize count(), sum(ItemCount) by Type
```
