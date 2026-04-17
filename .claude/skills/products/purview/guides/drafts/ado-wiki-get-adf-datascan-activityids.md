---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Get all ADF datascan activityIds for a scan run"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FGet%20all%20ADF%20datascan%20activityIds%20for%20a%20scan%20run"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Background
The number of activities usually start with four. For auto-scaling case, the count will grow to at most 8. In the case where you want to check out the rough vCore during the scan or you want to make sure all activities are running fine. Use below to get information for all activites

# Steps

- Find starting <PipelineRunId> from scanning service:
  ```
  ScanningLog 
  | where ScanResultId == "<ScanResultId>"
  | where Message contains "ADF Pipeline RunId"
  | project ['time'], Message
  ```

- Find activityIds for initializing/scaling DataScan sub-pipeline activities
  ```
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory"). 
  ActivityRuns 
  | where pipelineRunId == <PipelineRunId> 
  | where activityType == "ExecutePipeline"
  | where activityName =="InitialDataScanExcecutionPipeline" or activityName 
  =="ScalingDataScanExcecutionPipeline"
  | project PreciseTimeStamp, activityName, activityRunId
  // <activityRunId1>, <PreciseTimeStamp1>

  If no record is found above, use below
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory").
  ActivityRuns
  | where pipelineRunId == "31e6e0e7-a04c-49af-a71d-aa5fc8473ed8" //f3482963-f794-4825-96a8-020548de9364 
  | where activityName =="dataScan" 
  | project PreciseTimeStamp, activityName, activityRunId
  If you found activityRunId in this query, then you DO NOT have to go through the steps below and you already have the activityRunId.
  ```

- Find <DataScanPipelineRunId> for each initializing/scaling DataScan sub-pipeline
  ```
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory").
  AdfTraceEvent 
  | where env_time between (<PreciseTimeStamp minus 1m> .. 2m) 
  | where InternalCorrelationId == <activityRunId1> and Message has "pipeline run"
  | project env_time, InternalCorrelationId, Message
  ```

- Find DataScan activity runIds for each DataScan sub-pipeline
  ```
  //cluster("https://adfcus.kusto.windows.net").database("AzureDataFactory").
  cluster("https://adfneu.kusto.windows.net").database("AzureDataFactory").
  ActivityRuns 
  | where pipelineRunId == <DataScanPipelineRunId>
  | where activityName == "dataScan"
  | distinct activityRunId
  | project activityRunId
  ```
