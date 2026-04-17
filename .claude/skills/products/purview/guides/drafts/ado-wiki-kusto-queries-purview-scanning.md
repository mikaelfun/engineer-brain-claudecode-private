---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Kusto Queries for Purview Scanning"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FKusto%20Queries%20for%20Purview%20Scanning"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto Queries for Purview Scanning

- Retention: logs will be kept for 2-3 weeks only
- Required fields: Scan result Id or correlation ID (or timestamp + accountId/tenantID)

## Tips to Collect Info from Scanning Log

### Network ACL (account network settings)
Search for `networkACL` to find: networkAcl, managedResourcesPublicNetworkAccess, ingestionStorageAccountPublicNetworkAccess, isLineage settings.

### Ingestion Endpoint Details
Search for `secondary` to find BlobStorageUri and QueueStorageUri details.

### Source Type, ResourceSet Status, IR Type
Search for `customproperties` to find: dataSourceType, scanId, scanRunId, resourceSetProcessing, isSelfHostedIR, collectionPath, credentials type.

### IR Type and Scan Scope
Search for `IRTYPE` → `[Telemetry] Source: TryScaleOut, ScanName: ..., IRType: Managed, ScanScope: L1`

### Scan Level (Full vs Incremental)
Search for `ScanLevel` → `scanRunProperties: ScanLevel (Incremental/Full), IncrementalScanStartTime`

### Scan Name
Search for `scanName` → `ListScanHistory: dataSourceName=..., scanName=...`

### Pipeline Run ID
Search for `ADF Pipeline RunId`

### SHIR Version
Search for `runtime version`

### IR Name
Search for `irname` → `[Telemetry] Name: IntegrationRuntime-xxx`

### Scan Rule Set
Search for `ruleSetPropertiesModel` to find scan rule set details.

### Error Codes
Search for specific error codes in scan logs.

## MetadataDiscovery Stages (with timestamps)

```kql
let _scanId = "{scanResultId}";
cluster('{prod_cluster}').database('babylonMdsLogs').CustomerFacingEvent
| where * contains _scanId
| extend parsedProperties = parse_json(properties)
| project PreciseTimeStamp, _scanId, resultType
| limit 100
```

Also check MetadataDiscovery status, location, source type, discovered assets:
```kql
database("babylonMdsLogs").Scan_Results
| where scanResultId in ('{scanResultId}')
```

## Scenario 1: Azure IR or Managed VNet IR

### Step A: Get Account Region
```kql
ScanningLog
| where ScanResultId == "{scanResultId}"
| distinct Tenant
```

### Step B: Check if K8S
```kql
ScanningLog
| where ScanResultId == "{scanResultId}"
| where Message contains "k8s"
```

### Step C: Choose Correct Local Cluster
DataScan logs are in local cluster matching account region. Use [Kusto Cluster Details](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/azure-data-governance/security-platform-ecosystem/microsoft-purview/microsoft-purview-troubleshooting-guides/regionexpansion/regionexpansion/kustoclusterdetails).

- Non-K8S → `DataScanAgentEvent`
- K8S → `DataScanAgentLinuxEvent`

```kql
DataScanAgentLinuxEvent
| where Level == "2" or Level == "3"
// Level 2 = Error, Level 3 = Warning
// Optionally filter by Message contains "failed"/"Error"/"exception"/"memory"
```

### Scan Terminated Investigation
1. Verify job IDs:
```kql
DataScanAgentLinuxEvent
| where ScanResultId == "{scanResultId}"
| where Level == "2" or Level == "3"
| summarize by JobId
```

2. Summarize Task IDs per job:
```kql
DataScanAgentLinuxEvent
| where JobId == "{jobId}"
| summarize count() by TaskId
```

3. Investigate each task:
```kql
TaskHostingEvent
| where TaskId in ({taskIds})
| where Level == 2
| project ['time'], TaskId, Exception, Message
```

## Scenario 2: Windows Self-Hosted IR (SHIR)

### Collecting SHIR Logs
1. Open Computer Management → Event Viewer → Applications and Services Logs
2. Right-click "Connectors-Integration Runtime" → Properties
3. Select "Override event as needed" → Set max log size to 4000000 KB (4 GB) → Apply
4. Click "Clear Log" before running scan
5. Same for "Integration Runtime" but with 200 MB log size
6. Run new scan and collect: Scan ID, SHIR Report ID, troubleshooting package

### Verify SHIR Report ID Matches Scan
1. Get Pipeline Run ID and Activity ID:
```kql
ScanningLog
| where ScanResultId == "{scanResultId}"
| where Message contains "Data Scan" or Message contains "ADF pip"
| where Type != "Verbose"
```

2. Verify SHIR report contains activity/pipeline/scan IDs:
```kql
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == "{reportId}"
| where * contains "{activityId}" or * contains "{pipelineRunId}" or * contains "{scanResultId}"
```

### Investigate Using Scan Task ID
```kql
ScanningLog
| where ScanResultId == "{scanResultId}"
| where Message contains "Update task status for"
| where Uri contains "updateScanTask"
| extend K8sTaskID = extract(@"taskId: ([0-9a-fA-F-]+)", 1, Message)
| distinct K8sTaskID
```

Then use TaskID in TraceGatewayLocalEventLog for detailed analysis.

## Scenario 3: Kubernetes SHIR

### Log Upload Command
Run `./irctl log upload` and copy the log upload ID.

### Kusto Tables for K8s SHIR
```kql
OperatorOps
| where LogUploadId has "{logUploadId}"

ComputeDefaultLogEvent
| where LogUploadId has "{logUploadId}"

TaskHostingEvent
| where LogId has "{logUploadId}"
```

## Ingestion Investigation

### Asset Count Check
```kql
OnlineTierIngestionDetails
| where IngestionJobId == "{scanResultId}"
| where MessageID == "IngestionJobFinalState"
| extend info = parse_json(Message)
| extend assetToIngestion = toint(info.ProducerContext.Statistics.assets.processed)
| extend ingestionSucceeded = toint(info.ConsumerContext.Statistics.assets.succeeded)
| project assetToIngestion, ingestionSucceeded
```

### Ingestion Errors
```kql
OnlineTierIngestionDetails
| where IngestionJobId == "{scanResultId}"
| where Level == "Warning" or Level == "Error"
| project Message, Level, RequestId
```

### Detailed Ingestion Investigation
```kql
OnlineTierDetails
| where RequestId contains "{requestId}"
```

## Test Connection Troubleshooting
- Collect HAR file from browser during test connection
- For SHIR: collect SHIR report ID
- Query ScanningLog using correlation ID from test connection API
- Consider using DBEAVER to verify connectivity independently

## Common Ignorable Errors
- `ArtifactStoreException: The document could not be retrieved because it does not exist`
- `ArtifactStoreErrorCode: EntityNotFound`

## Key Notes
- SHIR logs retained for 14 days only
- For multi-node SHIR, collect report ID from ALL nodes
- Scan result report can be downloaded from UI
