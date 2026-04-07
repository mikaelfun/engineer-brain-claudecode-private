---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Get Log Analytics Workspace ResourceID"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Get%20Log%20Analytics%20Workspace%20ResourceID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# WorkspaceID
You have the WorkspaceId, but need the ResourceID.
[Azure Data Explorer](https://aznscluster.southcentralus.kusto.windows.net/AzNSPROD)

```
//Search by workspaceId
cluster('oibeftprdflwr.kusto.windows.net').database('AMSTelemetry').WorkspaceSnapshot
| where WorkspaceId contains "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
| summarize arg_max(SnapshotTimestamp, *)
```

# SubscriptionID
You have the SubscriptionID, but need the ResourceID or WorkspaceID.
[Azure Data Explorer](https://aznscluster.southcentralus.kusto.windows.net/AzNSPROD)

```
cluster('oibeftprdflwr.kusto.windows.net').database('AMSTelemetry').WorkspaceSnapshot
| where SubscriptionId contains "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
| summarize arg_max(SnapshotTimestamp, *) by ResourceId
```

# WorkspaceName
You have the WorkspaceName, but need the ResourceID or WorkspaceID.
[Azure Data Explorer](https://aznscluster.southcentralus.kusto.windows.net/AzNSPROD)

```
let LogAnalyticsWorkspaceName = "law-azmon-dev-westus2-001";
cluster('oibeftprdflwr.kusto.windows.net').database('AMSTelemetry').WorkspaceSnapshot
| where WorkspaceName contains LogAnalyticsWorkspaceName
| summarize arg_max(SnapshotTimestamp, *) by ResourceId
```