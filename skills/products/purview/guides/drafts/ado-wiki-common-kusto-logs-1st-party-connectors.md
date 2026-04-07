---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Kusto Queries/Common Kusto Logs for 1st Party connectors"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Tools/Kusto%20Queries/Common%20Kusto%20Logs%20for%201st%20Party%20connectors"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Some Common Queries: RUNID

## Get basic Information of the Scan

Pay attention to the errors, exceptions.

```log
//################scanningService/connectorService#################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "RUNID"
| order by ['time'] asc
| project PreciseTimeStamp, Type, Message, SourceFilePath, ContainerName, Uri, MemberName
//################scanningService/connectorService#################
```

## Get the backend Activities of the Scan

```log
//#######################Find activityId###########################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "RUNID"
| where Message contains "the data scan activities are:"
//#######################Find activityId###########################
```

## Get Database for the Scan Agent Log

```log
//#######################Find cluster##############################
cluster('catalogtelemetrykusto.eastus.kusto.windows.net').database("Scan").GetAgentCluster("RUNID")
//#######################Find cluster##############################
```

## Get the Scan Agent Log

Please pay attention to the errors/exceptions/Payload of the metadata generated using the related keyword.

```log
//#####################Find DataScanExecutor#######################
cluster("CONN from GetAgentCluster").database("DataScanLogs").CustomLogEvent
| where ActivityId in ("Find activityId")
| project TIMESTAMP, TraceMessage, Message, Level
| order by TIMESTAMP asc
//#####################Find DataScanExecutor#######################
```

## Try to get the potential Issues from Agent log

```log
//#####################Find DataScanAgent##########################
cluster('CONN from GetAgentCluster').database('DataScanLogs').DataScanAgentEvent
| where * contains "RUNID"
// | where Message contains "convertedEntities" or Message contains "SequenceNumber" (SequenceNumber is for split payload)
// | where Message !contains "Logging message failed" (this message is logged when payload split and no useful info in there)
| project env_time,Message,SourceNamespace,env_name, TracingLevel
| order by env_time asc
//#####################Find DataScanAgent##########################
```

## Get the metadata generated

```log
//#####################Find Processed Entities#####################
cluster("CONN from GetAgentCluster").database("DataScanLogs").CustomLogEvent
| where JobId == "RUNID"
// | where Message contains "convertedEntities"
//#####################Find Processed Entities#####################
```

## Detect the metadata handled by ingestion

Try to compare the payload with the one found from the agent log above.

```log
//#####################Ingestion###################################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetails
| where RequestId startswith "RUNID"
// | where Msg contains "KEYWORD YOU MAY BE INTERESTED"
| order by ['time'] asc
| project PreciseTimeStamp, Msg, Level
//#####################Ingestion###################################
```

## Review the metadata inserted into Data Map

```log
//#####################Ingestion###################################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierWebRequests
| where RequestId startswith "RUNID"
// | where Message contains "KEYWORD YOU MAY BE INTERESTED"
| project ['time'], Msg, Role, ApiCaller, CatalogName, CatalogId, RequestId, Method, RequestUrl, Status, Duration, Message, ErrorCode
| order by ['time'] asc
//#####################Ingestion###################################
```

## Detect the Ingestion Details

```log
//#####################IngestionWorker (Could find payload for particular ingestion)###################################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierIngestionDetails
| where TraceId contains "9e006096-02c0-4d87-8660-7b6b0fa49116_95c9894e-4a67-4e98-9f08-8aa577dea4b7-1_0_bb5b"
| project ['time'], RequestId, TraceId, Message, Level
| order by ['time'] asc
//#####################IngestionWorker (Could find payload for particular ingestion)###################################
```
