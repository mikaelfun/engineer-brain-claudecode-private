---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: How to check for ingestion errors"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20How%20to%20check%20for%20ingestion%20errors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# HT: How to check for ingestion errors

> **Note:** This page does not include information about the NorthStar pipeline. Only use when data type is being sent via **INMEM**. Check which pipeline first: HT: Determine which pipeline is processing a given data type.

## Scenario
Data might not be ingested due to errors not identifiable right away. On any troubleshooting for missing/incomplete data, rule out ingestion issues first.

## Check ingestion errors using Azure Support Center
Query the customer workspace in ASC using `_LogOperation` function:

```kql
_LogOperation | where Category == "Ingestion" | where Level == "Error"
```

> **Note:** `_LogOperation` may not include all activities. For full visibility, use the [Operation](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/operation) table instead. See [Monitor operational issues in your Azure Monitor Log Analytics workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/monitor-workspace).

## Check ingestion errors using Kusto - Public clouds
**Cluster:** `cluster('omsgenevainmemprod.eastus.kusto.windows.net').database('OperationInsights_InMem_PROD')`

```kql
ActivityFailedEvent
| where TIMESTAMP > ago(7d)
| where Role == "InMemoryTransferManagerRole"
| where properties contains "00000000-0000-0000-0000-000000000000" //customer workspaceID
| parse properties with * "DataTypeId=[" DataTypeId "]" *
| parse properties with * " ResourceId=[" resourceId "]" *
| parse resourceId with * "/PROVIDERS/" providerName "/" *
| parse properties with * "Fact=" TableName "," *
| summarize count() by DataTypeId, TableName, providerName, exception
| order by count_ desc
```

Depending on the error, may need to raise with Ingestion PG team, but **always** validate first with TA, SME or swarming channel.

## Check ingestion errors using Jarvis - Governance clouds
For Azure Gov and Mooncake (no Kusto access):

| Azure Gov | Mooncake |
|--|--|
| https://portal.microsoftgeneva.com/s/2FD92AE6 | https://portal.microsoftgeneva.com/s/E267FBAA |

Required details:
1. Workspace region
2. Workspace ID
3. Relevant timeframe (as short as possible)

> **Tip:** To see errors per Azure Resource ID, add `resourceId` to the summarize line.

## References
- [Monitor health of Log Analytics workspace](https://learn.microsoft.com//azure/azure-monitor/platform/monitor-workspace)
