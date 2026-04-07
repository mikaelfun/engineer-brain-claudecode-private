---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Lineage/Troubleshooting Data Factory lineage issues"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FLineage%2FTroubleshooting%20Data%20Factory%20lineage%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

# Troubleshooting Data Factory Lineage issues

## Copy Activity
Refer the Troubleshooting Guide here to investigate ADF Copy Activity Lineage issues: https://dev.azure.com/Supportability/AzureDataFactory/_wiki/wikis/AzureDataFactory/704670/lineage-related-problem-investigation-process-and-TSG

## Data Flow Activity
Before troubleshooting Dataflow Activity Lineage check the following article and ensure that we don't hitting any limitation and the source & sink data sources are supported:

- [Data Flow Supported data sources](https://learn.microsoft.com/azure/purview/how-to-link-azure-data-factory#data-flow-support). Any data source/sink outside this table won't be supported for data flow lineage.
- Microsoft Purview currently doesn't support query or stored procedure for lineage or scanning
- Lineage is limited to table and view sources only
- Data flow lineage doesn't integrate with Microsoft Purview [resource set](https://learn.microsoft.com/azure/purview/concept-resource-sets)

### Query Dataflow Logs

Get the Dataflow ActivityID and query the Dataflow logs:

```kql
cluster('adfcus').database('AzureDataFactory').DataflowClusterLogs | union cluster('adfneu').database('AzureDataFactory').DataflowClusterLogs
| where ActivityRunId == "ef9f5b5b-xxxx-xxxx-xxxx-e7a0bd99f34c"  // Activity RunId
| where Caller contains "lineage"
```
You would see a request to create lineage entities, source and sink entities and all other entities list is sent to the Catalog.

You could further trace Lineage entries or any errors in the Catalog by checking the OnlineTier logs:

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetails
| where RequestId contains "ef9f5b5b-xxxx-xxxx-xxxx-e7a0bd99f34c" //ActivityId
| project PreciseTimeStamp, Level, Msg, CatalogId, CatalogName, RequestId | order by PreciseTimeStamp asc
```
