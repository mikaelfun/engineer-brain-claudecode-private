---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/AON Kusto Repo/ARC for Servers Kusto Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FTools%20and%20Processes%2FAON%20Kusto%20Repo%2FARC%20for%20Servers%20Kusto%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Description
KQL queries for ARC for Servers (Azure Arc-enabled servers) Kusto Clusters for troubleshooting.

## How to Access
- Cluster URL: https://hcrpprod.kusto.windows.net/
- Database: hcrpprod

## HCRPEvents - Check Arc Resource Connection
Control plane telemetry for Azure Arc servers. Useful for BMM-related Arc connectivity troubleshooting.

```kql
HCRPEvents
| where TIMESTAMP > ago(7d)  // or between (datetime({startDate})..datetime({endDate}))
| where ResourceId has "{Resource Name}"  // Put BMM Name for BMM Arc connection investigation
| project TIMESTAMP, ['MachineName']=ResourceName, ['ConnectivityStatus']=AgentStatus, LastStatusChange, AgentVersion, ResourceId
```
