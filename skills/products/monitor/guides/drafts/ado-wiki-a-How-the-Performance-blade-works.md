---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Portal Experiences/How the Performance blade works"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FPortal%20Experiences%2FHow%20the%20Performance%20blade%20works"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Performance Blade

## What is it?

Shows traffic volume, request durations, and processing breakdown across three tabs: Operations, Dependencies, and Roles. Data is impacted by Sampling (uses itemCount).

## Operations Tab

Shows average duration and total count of operations by operation name. Uses TOP 10 so individual counts may not total the Overall value.

```kql
set truncationmaxrecords=10000;
set truncationmaxsize=67108864;
let m = requests 
| where timestamp > datetime("...") and timestamp < datetime("...") 
| where client_Type != "Browser" 
| project itemCount, duration, operation_Name; m 
| summarize sum(itemCount), avg_duration=sum(itemCount * duration) / sum(itemCount) by operation_Name 
| top 10 by sum_itemCount desc; m 
| summarize sum(itemCount), avg_duration=sum(itemCount * duration) / sum(itemCount), T='OVERALL';
```

## Dependencies Tab

Shows average duration and total count by dependency type and target.

```kql
let m = dependencies 
| where client_Type != "Browser" 
| project itemCount, duration, type=iff(tolower(type) == "http (tracked component)", "HTTP", type), 
  target=tostring(split(target, "| cid-v1")[0]), name; m 
| summarize sum(itemCount), avg_duration=sum(itemCount*duration)/sum(itemCount) by type, target, name 
| top 10000 by sum_itemCount desc;
```

## Roles Tab

Shows per cloud_RoleInstance metrics:
- **CPU**: `performanceCounters` where category=="Process" and counter=="% Processor Time Normalized"
- **Available Memory**: category=="Memory" and counter=="Available Bytes" (binary conversion: 1 Byte = 0.00000095367432 MB)
- **Process IO Rate**: category=="Process" and counter=="IO Data Bytes/sec"
- Request count/duration from `requests` table
- Dependency count/duration from `dependencies` table

## Key Notes

- Bytes to MB conversion is **binary**, not decimal (966,333,633 bytes = 921.57 MB, not 966.33 MB)
- Performance blade is impacted by **Sampling** because it uses `itemCount`
- Azure Functions are detected via `sdkVersion contains 'azurefunction'`
