---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/AON Kusto Repo/ARC Infra Kusto Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FTools%20and%20Processes%2FAON%20Kusto%20Repo%2FARC%20Infra%20Kusto%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Description
KQL queries for Azure Arc Infrastructure logs.

## How to Access
- Cluster URL: https://azarccoreprod.eastus.kusto.windows.net/
- Hub cluster forwards queries to all regional clusters
- 3 databases: AzArcInfra, K8sConnectRP, ManagedOps360

## Query Format

**AzArcInfra**
```kql
macro-expand isfuzzy=true AzArcCore as X (
    X.database('AzArcInfra').<Table Name>
 | Query
)
```

**K8ConnectRP**
```kql
macro-expand isfuzzy=true AzArcCore as X (
    X.database('K8ConnectRP').<Table Name>
 | Query
)
```

**ManagedOps360**
```kql
macro-expand isfuzzy=true AzArcCore as X (
    X.database('ManagedOps360').<Table Name>
 | Query
)
```

## K8ConnectRPLogs - Check NAKS Arc Connection Status
```kql
macro-expand isfuzzy=true AzArcCore as X (
X.database('K8ConnectRP').K8ConnectRPLogs
 | where ['time'] between (datetime({startDate})..datetime({endDate}))
 | where ServiceName == "datasyncservice"
 | where ArmId has_all ("{Subscription ID}", "{NAKS Name}")
 | where Message startswith "BatchProcessHelper: Patch Connected Cluster Json"
 | where Message has "connectivityStatus"
 | parse Message with "BatchProcessHelper: Patch Connected Cluster Json: " jsonPayload
 | extend jsonData = parse_json(jsonPayload)
 | extend lastConnectivityTime = jsonData.properties.lastConnectivityTime
 | extend connectivityStatus = extract('"connectivityStatus":"([^"]+)"', 1, Message)
 | where isnotempty(connectivityStatus)
 | project ['time'], lastConnectivityTime, connectivityStatus, Message
)
```
