---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Useful KQL Queries/Customer-facing queries (Log Analytics)/Find Machines WITHOUT AMA or MMA"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FUseful%20KQL%20Queries%2FCustomer-facing%20queries%20(Log%20Analytics)%2FFind%20Machines%20WITHOUT%20AMA%20or%20MMA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Find "Unmonitored" Machines Without AMA or MMA

Many times a customer asks us how to ensure all machines have the AMA or MMA on them. Policy can help ensure the agents are deployed, but sometimes the customers want to track any machines that aren't yet monitored.

## Prerequisites

For this query to work, first you must **send your Activity Logs to Log Analytics by using "Export Activity Logs"**.

Reference: https://learn.microsoft.com/azure/azure-monitor/essentials/activity-log?tabs=powershell#send-to-log-analytics-workspace

## How it works

The query lists "unmonitored" machines by querying their power state changes (from AzureActivity) and comparing this list of machines to those that are Heartbeating to the workspace. A `leftanti` join returns only records from the left hand table (AzureActivity) that do NOT have a match from right hand table (Heartbeat).

**Tip:** Increase Activity Log retention and query time range to 365d for a highly responsive query that will show any machines _WITHOUT_ AMA or MMA.

```kql
// Make unmonitored machine list
let timeago = ago(30d);
AzureActivity
| where TimeGenerated > timeago
    and _ResourceId has "microsoft.compute/virtualmachines"
    and tolower(OperationNameValue) has "microsoft.compute/virtualmachines/start"
    or tolower(OperationNameValue) has "microsoft.compute/virtualmachines/deallocate"
| summarize Latest_Activity = arg_max(TimeGenerated, *) by Computer = tostring(split(_ResourceId, "/")[-1])
| join kind=leftanti 
    (Heartbeat
    | where TimeGenerated > timeago
    | summarize Latest_Heartbeats = arg_max(TimeGenerated, *) by Computer = tostring(split(_ResourceId, "/")[-1])) on Computer
| project Unmonitored_Computers = Computer, Latest_Activity, OperationNameValue, _ResourceId
```

This query can also be pinned to an Azure Dashboard for ongoing visibility.
