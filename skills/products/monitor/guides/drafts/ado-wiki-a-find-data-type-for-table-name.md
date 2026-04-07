---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Find the data type corresponding to a specific table name"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Find%20the%20data%20type%20corresponding%20to%20a%20specific%20table%20name"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# HT: Find the data type corresponding to a specific table name

## Scenario
While troubleshooting potential ingestion issues, you need to know the data type that corresponds to a determined table name.

## Common Mappings

| Data type | Table name |
|--|--|
| HEALTH_ASSESSMENT_BLOB | Heartbeat |
| GENERIC_PERF_BLOB | Perf |
| LINUX_PERF_BLOB | Perf |
| GENERIC_EVENT_BLOB | Event |
| LINUX_SYSLOGS_BLOB | Syslog |
| SECURITY_EVENT_BLOB | SecurityEvent |
| AzureDiagnostics | AzureDiagnostics |

## Pre-requisites
- Workspace ID
- Table name

## Finding the data type
Data type should not vary between pipelines (InMem vs NorthStar), but some new data types may only be available in NorthStar. **Query NorthStar first.**

### NorthStar Pipeline (Query First)
**Cluster:** `https://omsgenevatlm.kustomfa.windows.net/GenevaNSProd`

```kql
let workspaceID = "REPLACE_WITH_CUSTOMER_WORKSPACE_ID";
ProcessedChunk
| where TIMESTAMP > ago(12h)
| where CustomerId == workspaceID
| where OutputBytes > 0
| summarize makeset(InputType) by OutputType
| order by OutputType asc
```

The `OutputType` column = table name, `set_InputType` = corresponding data type(s).

### InMem Legacy Pipeline
**Cluster:** `https://omsgenevainmemprod.eastus.kustomfa.windows.net/OperationInsights_InMem_PROD`

```kql
let workspaceID = "REPLACE_WITH_WORKSPACEID";
ActivityCompletedEvent
| where TIMESTAMP > ago(2d)
| where activityName == "EventhubMonitor"
| where properties contains workspaceID
  and properties !has "DynamicWorkflowEnabled=[True]"
  and properties has "shouldForwardToPss=[True]"
| parse properties with * " DataTypeId=[" dataType "]" *
  " RowsProcessed=[" rowsProcessed:int "]" *
  " SourceService=[" sourceService "]" *
| where dataType !startswith "CUSTOM_LOG_BLOB"
| parse properties with * " FactName=[" tableName "]" *
| extend sourceService = case(
    sourceService contains ":", substring(sourceService, 0, indexof(sourceService, ":")),
    sourceService startswith_cs "ScanningRole_", "ScanningRole",
    sourceService)
| extend dataType = case(
    sourceService == "OBO", dataType,
    properties has "DynamicWorkflowEnabled=[True]", "CustomLogJSON",
    dataType startswith "CUSTOM_LOG_BLOB.", "CustomLogFILE",
    dataType)
| summarize count() by sourceServiceInMem=sourceService, tableName, dataType
```
