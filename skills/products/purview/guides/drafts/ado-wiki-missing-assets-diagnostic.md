---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Asset Schema is missing or incorrect/Missing Assets"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Missing Assets Diagnostic Guide

Asset or classification missing is a broad issue which might be caused by several causes:

- Scan didn't emit the assets or classifications
- The assets or classifications were lost/dropped before sending to Hot tier
- Ingest request failed leading assets or classifications not ingested
- Customer modified the assets where scan won't override the asset anymore
- Check if the issue still repros after clicking refresh or F5 browser reload
- The assets are deleted by offline tier after successfully ingested into the catalog

## Step 1: Check Scan Emission

Get the scan id from the customer, then check if the entity has schema (No schema = no detection):

**NOTE:** "OpInfo" is being replaced by "Entity info" — check the timeline for which keyword to use.

```kql
DataScanAgentEvent
| where ScanResultId == "<Scan Run Id>"
| where Message contains "OpInfo"
| where Message contains "<URI or Part of URI>"
| where Message !contains "Schema\":[]"
| project Message
```

For multi-cloud resources (Multi cloud DB):

```kql
let pipelineId = MultiCloudIRLog
| where Message contains "<RunId from UI>" and Message contains "PipelineId"
| extend parsedMessage = parse_json(Message)
| extend PipelineId = parsedMessage["PipelineId"]
| project tostring(PipelineId);
MultiCloudDataScanLog
| join kind = inner(pipelineId) on $left.CorrelationId == $right.PipelineId
| where Message contains "OpInfo"
| where Message contains "<URI or Part of URI>"
| where Message !contains "Schema\":[]"
| project Message
```

## Step 2: Check Hot Tier Delivery

Assets may be lost/dropped before sending to Hot Tier. Get traceId from scan run id (activityId + pipelineId → traceId).

```kql
OnlineTierDetails
| where RequestId == "{traceId}"
and Msg has "<some keyword>"
```

If no logs found → go back to Step 1 (scan didn't emit). Compare payload from HT logs with OpInfo to check if assets were dropped.

## Step 3: Check Ingest Failures

```kql
OfflineTierWarmPathAgentLogs
| where TraceId contains "{traceId}"
| where Message contains "resources processed"
```

If resources failed ("0 resources processed, X resources failed while importing"), check detailed errors:

```kql
OnlineTierWebRequests
| where RequestId == "{traceId}"
| where RequestUrl == "/api/atlas/v2/entity/bulk"
```

For detailed error logs:

```kql
OnlineTierDetails
| where RequestId == "{traceId}"
```

Filter "Level" column by "ERROR". Common errors: operation timeout, transient network failure, CatalogServiceException.

**SME: Charles Shen** for deep investigation.

## Step 4: Customer-Modified Assets

Per Apache Atlas behavior (section 2.5.3): If a user makes any changes to a schema, Data Scan can never change it. Changing a name, field classification, or description makes the entire schema definitive (confidence == 1). This is **by design**.

Contact **SME Charles Shen** to check if asset was user-modified using the asset FQN.

## Step 5: Search for Deletion Logs (PBI Scan Example)

1. Search scan-to-Data-Map logs using entity qualified name:

```kql
OnlineTierDetails
| where Msg contains "<entity-qualified-name>" and strlen(RequestId) > 36
```

2. Get related entity GUIDs from relationship 409 responses or creation logs

3. Search deletion logs using GUIDs:

```kql
OnlineTierDetails
| where Msg contains "<entity-guid>"
```

4. Share findings and request IDs to offline tier for further investigation

**Sample IcM**: Incident 212699017 - Missing reports and datasets from PBI Scan
