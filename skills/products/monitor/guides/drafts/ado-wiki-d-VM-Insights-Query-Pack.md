---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Concepts/VM Insights Query Pack"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FConcepts%2FVM%20Insights%20Query%20Pack"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Insights Query Pack

## Case Triage Queries

### Check which tables a VM is writing to
```kusto
search '/subscriptions/SUBID/resourceGroups/RESOURCEGROUP/providers/Microsoft.Compute/virtualMachines/VMNAME'
| summarize max(TimeGenerated) by $table
```
Look for: Heartbeat, InsightsMetrics (AMA/MMA), VMComputer, VMProcess, VMConnection, VMBoundPort (Dependency Agent).
If VM has DA installed and only sends to VMProcess, check kernel version - DA might be in degraded mode.

### Check InsightsMetrics for performance counter collection
```kusto
InsightsMetrics
| where _ResourceId has '/subscriptions/SUBID/resourcegroups/RESOURCEGROUP/providers/microsoft.compute/virtualmachines/VMNAME'
| summarize max(TimeGenerated) by Name
```
If only Heartbeat appears, the VM may not have picked up the DCR configuration.

## Performance Queries

### Min/Max FreeSpaceMB per drive
```kusto
let startDateTime = datetime('2023-12-17T14:00:00.000Z');
let endDateTime = datetime('2023-12-19T19:13:00.000Z');
InsightsMetrics
| where TimeGenerated between (startDateTime .. endDateTime)
| where Origin == 'vm.azm.ms' and (Namespace == 'LogicalDisk' and Name == 'FreeSpaceMB')
| summarize min(Val), max(Val) by Computer, Tags, Hour=bin(TimeGenerated, 1h)
| sort by Hour asc, Computer asc
```

## Azure Monitor Baseline Alert Queries

### VM Data Disk Read Latency
```kusto
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "LogicalDisk" and Name == "ReadLatencyMs"
| extend Disk=tostring(todynamic(Tags)["vm.azm.ms/mountId"])
| where Disk !in ('C:','/')
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated,15m), Computer, _ResourceId, Disk
```

### VM Data Disk Free Space Percentage
```kusto
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "LogicalDisk" and Name == "FreeSpacePercentage"
| extend Disk=tostring(todynamic(Tags)["vm.azm.ms/mountId"])
| where Disk !in ('C:','/')
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated,15m), Computer, _ResourceId, Disk
```

### VM Processor Utilization
```kusto
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Processor" and Name == "UtilizationPercentage"
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

### VM Available Memory Percentage
```kusto
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Memory" and Name == "AvailableMB"
| extend TotalMemory = toreal(todynamic(Tags)["vm.azm.ms/memorySizeMB"])
| extend AvailableMemoryPercentage = (toreal(Val) / TotalMemory) * 100.0
| summarize AggregatedValue = avg(AvailableMemoryPercentage) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

## Resources

- [VM Insights Log Queries](https://learn.microsoft.com/azure/azure-monitor/vm/vminsights-log-query)
- [Azure Monitor Baseline Alerts](https://azure.github.io/azure-monitor-baseline-alerts/patterns/alz/Alerts-Details/#vm-insights-log-alerts)
