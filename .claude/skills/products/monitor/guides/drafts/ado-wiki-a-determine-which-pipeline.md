---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Determine which pipeline is processing a given data type"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Determine%20which%20pipeline%20is%20processing%20a%20given%20data%20type"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
While troubleshooting potential ingestion issues, you will need to know which pipeline is processing the data, so you can follow the right troubleshooting guide (TSG).

Two pipelines exist: **INMEM** (legacy) and **NORTHSTAR** (new).

# Query using Kusto
---
## Pre-requisites
Connect to Log Analytics Kusto clusters.

## Kusto Query
Cluster: `cluster('omsgenevaodsprod.eastus.kusto.windows.net').database('OperationInsights_ODS_PROD')`

```kql
let _startTime = datetime(2024-04-05T08:08:00Z);
let _endTime = datetime(2024-04-12T08:08:00Z);
let workspaceID = '';
union ActivityCompletedEvent, ActivityFailedEvent
| where TIMESTAMP between (['_startTime'] .. ['_endTime'])
| where properties contains workspaceID
| parse properties with * "DataTypeId=[" datatype "]" *
| parse properties with * "LegacyPipelineProcessingFlag=[" LegacyPipelineProcessingFlag "]" *
| parse properties with * "NorthStarPipelineProcessingFlag=[" NorthStarPipelineProcessingFlag "]" *
| where datatype !="" and LegacyPipelineProcessingFlag !="" and NorthStarPipelineProcessingFlag !=""
| distinct datatype, LegacyPipelineProcessingFlag, NorthStarPipelineProcessingFlag
| extend Pipeline = case(
    LegacyPipelineProcessingFlag == "Process" and NorthStarPipelineProcessingFlag == "None", "INMEM",
    LegacyPipelineProcessingFlag == "None" and NorthStarPipelineProcessingFlag == "Process", "NORTHSTAR",
    LegacyPipelineProcessingFlag == "ProcessForTesting" and NorthStarPipelineProcessingFlag == "Process", "NORTHSTAR",
    "N/A")
| project datatype, Pipeline
```

# Using Jarvis
---
Jarvis query: https://jarvis-west.dc.ad.msft.net/6533EF0B

Fill in:
1 - Time range (shortest possible, UTC)
2 - Environment (workspace region)
3 - Workspace ID
4 - Data type ID

## Interpreting results
- **NorthStarPipelineProcessingFlag** = Process → NorthStar pipeline
- **LegacyPipelineProcessingFlag** = Process → legacy pipeline (InMem)
