---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Useful KQL Queries/Customer-facing queries (Log Analytics)/Agent Version and Type Finder for workspace (find multiple versions)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FUseful%20KQL%20Queries%2FCustomer-facing%20queries%20(Log%20Analytics)%2FAgent%20Version%20and%20Type%20Finder%20for%20workspace%20(find%20multiple%20versions)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Agent Version and Type Finder for Workspace

This query can be executed against a workspace to get a list of Agents with Version, Type, and LastHeartbeat for each machine in the workspace. You can uncomment line 4 to specify a particular computer to see if it has two agents, and when each last reported.

```kql
// v4 VersionType_Finder
Heartbeat
| where TimeGenerated > ago(7d)
// | where Computer == "vm_name"
| summarize arg_max(TimeGenerated, *) by Computer, Category, Version
| extend Category_Version_Bag = bag_pack("Category", Category, "Version", Version, "LastHeartbeat", format_datetime(TimeGenerated, "M/dd/yyyy h:mm:ss tt"))
    | sort by Category asc
| summarize Version_List = make_list(Category_Version_Bag) by Computer
    | extend Array_Length = array_length(Version_List)
    | extend Multiple_Versions = iff(Array_Length > 1, true, false)
    | sort by Multiple_Versions, Computer asc
    | project Computer, Multiple_Versions, Version_List
```

Results show each Computer with a flag indicating if multiple agent versions exist, and a list of each agent's Category, Version, and LastHeartbeat.
