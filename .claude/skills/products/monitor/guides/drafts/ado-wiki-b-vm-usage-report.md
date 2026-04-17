---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Useful KQL Queries/Customer-facing queries (Log Analytics)/VM Usage Report for Subscription"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FUseful%20KQL%20Queries%2FCustomer-facing%20queries%20(Log%20Analytics)%2FVM%20Usage%20Report%20for%20Subscription"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# VM Usage Report for Subscription

Query to make a report of Disk Usage, Percentage CPU and Percent Memory per VM. Good for a daily or weekly report.

```kql
// VM Usage Report for Subscription
let basesearch = InsightsMetrics
    | where TimeGenerated > ago(48h)
    | parse _ResourceId with * "/subscriptions/" SubscriptionId "/resourcegroups/" ResourceGroup "/providers/" Provider "/" ResourceType "/" VMName
//| where SubscriptionId == ""
;
let PercentMemory = basesearch
    | where Namespace == "Memory"
        and Name == "AvailableMB"
    | extend TotalMemory = extract("[0-9]+[.]?[0-9]+", 0, Tags, typeof(real))
    | extend PercentMemory = Val/TotalMemory * 100
    | summarize PercentMemory = avg(PercentMemory) by VMName;
let PercentCPU = basesearch
    | where Namespace == "Processor"
        and Name == "UtilizationPercentage"
    | where Namespace == "Processor"
    | summarize PercentCPU = avg(Val) by VMName;
let DiskUsage = basesearch
    | where Namespace == 'LogicalDisk'
        and Name == 'FreeSpacePercentage'
    | extend Val = 100 - Val
    | extend Tags = strcat("{\"", split(Tags, "vm.azm.ms/")[1])
    | extend Tags_Parsed = parse_json(Tags)
    | evaluate bag_unpack(Tags_Parsed)
    | summarize DiskUsage = tostring(strcat(round(avg(Val), 2), "%")) by VMName, Disk = mountId
    | extend Disks = bag_pack(Disk, DiskUsage)
    | summarize Disks = make_bag(Disks) by VMName;
PercentCPU
| join PercentMemory on VMName
| join DiskUsage on VMName
| sort by PercentMemory
| extend 
    PercentCPU = strcat(round(PercentCPU, 2), "%"), 
    PercentMemory = strcat(round(PercentMemory, 2), "%"),
    DiskUsage = Disks
| project VMName, PercentCPU, PercentMemory, DiskUsage
| sort by VMName
```

Results show each VM with CPU %, Memory %, and per-disk usage percentages.
