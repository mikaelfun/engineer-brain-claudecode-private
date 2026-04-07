---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Data sources/APIs/Custom Logs V2: Send Custom Logs(v2) using Log Ingestion API"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FData%20sources%2FAPIs%2FCustom%20Logs%20V2%3A%20Send%20Custom%20Logs(v2)%20using%20Log%20Ingestion%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Custom Logs V2: Log Ingestion API Troubleshooting

> **Scope**: This TSG is specific to custom log data sent using the Ingestion API. NOT applicable to agent-based logs (MMA/AMA) or legacy Data Collector API.

## Data to Collect
- DCR Immutable ID
- Stream name (e.g., Custom-MyCustomLog)
- Azure region of DCR and destination workspace (must match)
- Problem time frame (UTC timestamps)
- Log Analytics Workspace ID
- Application Object ID assigned "Monitoring Metrics Publisher" role on DCR

## Troubleshooting Steps

### Step 1: Check DCR Structure
- Validate DCR has valid structure and information
- Use: HT: Examining customer DCR
- Invalid? -> Recreate DCR per documentation

### Step 2: Check for Errors Sending Data to API Endpoint
Query `RequestReceived` table on GenevaNSProd (omsgenevatlm cluster):
```kql
let searchStartTime = datetime(YYYY-MM-DD HH:mm);
let searchEndTime = datetime(YYYY-MM-DD HH:mm);
let dcrId = "<dcr-id>";
let stream = "<stream-name>";
RequestReceived
| where TIMESTAMP between (searchStartTime ..searchEndTime)
| where RequestUri contains strcat("dataCollectionRules/", dcrId)
| where RequestUri contains strcat("streams/", stream)
| extend content = parse_json(ResponseContent)
| project TIMESTAMP, RequestUri, RequestId, HttpStatusCode = StatusCode, ErrorMessage = content.error.message, ErrorCode = content.error.code
```

**Scenarios:**
- HTTP 200/204 with empty response -> Normal, data accepted for processing
- Error code returned -> Check public troubleshooting docs
- HTTP 200/204 but data missing from table -> Go to Step 3

### Step 3: Check for Successful Delivery
Query `ProcessedChunk` table on GenevaNSProd:
```kql
let searchStartTime = datetime(YYYY-MM-DD HH:mm);
let searchEndTime = datetime(YYYY-MM-DD HH:mm);
let workspaceID = "<workspace-id>";
let tableName = "<table-name>";
let dcrId = "<dcr-id>";
ProcessedChunk
| where TIMESTAMP between (searchStartTime ..searchEndTime)
| where CustomerId == workspaceID
| where OutputType == tableName
| where DcrId == dcrId
| project TIMESTAMP, CorrelationId, workspaceID=CustomerId, tableName=OutputType, DcrId, InputBytes, OutputBytes, InputRows, OutputRows, ElapsedMilliseconds, Codes, Result
| order by TIMESTAMP desc
```

**Common Codes:**
- `NoExpectedStartArray` -> Body must be a JSON array
- `JsonParsingError` -> Invalid JSON in body
- `Filtered:NoLogAnalyticsDestination` -> Custom table doesn't exist on target workspace

**InputRows vs OutputRows** -> Shows what was sent vs ingested

**ProcessedDataTimeInfo missing** -> TimeGenerated field not in supported datetime format

### IcM Escalation
Follow Custom Log V2 and Transformations IcM Escalation Path
