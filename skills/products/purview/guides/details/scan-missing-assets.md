# Purview 扫描后资产丢失 -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-convertedentities-scan-log-queries.md](..\guides/drafts/ado-wiki-a-convertedentities-scan-log-queries.md), [ado-wiki-activity-explorer-search-audit-log-missing-event.md](..\guides/drafts/ado-wiki-activity-explorer-search-audit-log-missing-event.md), [ado-wiki-label-missing-on-asset.md](..\guides/drafts/ado-wiki-label-missing-on-asset.md), [ado-wiki-missing-assets-diagnostic.md](..\guides/drafts/ado-wiki-missing-assets-diagnostic.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-convertedentities-scan-log-queries.md

1. Check scan logs using "ConvertedEntities" instead of "OpInfo" `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
2. Each asset will emit an entity - "convertedEntities" `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
3. For an incremental scan, "convertedEntities" will be emitted only for new assets/modified assets since last scan `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
4. For a full scan, all assets in data source are classified and "convertedEntities" emitted `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
5. Timeline by data source regions for "OpInfo" keyword removal `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
6. KQL Tips for checking ConvertedEntities `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
7. 1. Checking a certain file `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
8. 2. Checking a certain folder `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
9. 3. Checking classification tag and confidence for columns `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`
10. 4. Checking if entity has schema `[source: ado-wiki-a-convertedentities-scan-log-queries.md]`

### Phase 2: Data Collection (KQL)

```kusto
DataScanAgentLinuxEvent
| where * contains "<RunID>"  // RunID from UI
| where Message startswith "convertedEntities:"
| where Message contains "\"isLeafNode\":\"true\""
| where Message contains "<FileName>"  // Target file/asset
```
`[tool: ado-wiki-a-convertedentities-scan-log-queries.md]`

```kusto
DataScanAgentLinuxEvent
| where * contains "<RunID>"  // RunID from UI
| where Message startswith "convertedEntities:"
| where Message contains "\"isLeafNode\":\"false\""
| where Message contains "<FolderURL>"  // Target folder
```
`[tool: ado-wiki-a-convertedentities-scan-log-queries.md]`

```kusto
DataScanAgentEvent
| where ScanResultId == "<Scan Run Id>"
| where Message contains "OpInfo"
| where Message contains "<URI or Part of URI>"
| where Message !contains "Schema\":[]"
| project Message
```
`[tool: ado-wiki-missing-assets-diagnostic.md]`

```kusto
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
`[tool: ado-wiki-missing-assets-diagnostic.md]`

```kusto
OnlineTierDetails
| where RequestId == "{traceId}"
and Msg has "<some keyword>"
```
`[tool: ado-wiki-missing-assets-diagnostic.md]`

```kusto
OfflineTierWarmPathAgentLogs
| where TraceId contains "{traceId}"
| where Message contains "resources processed"
```
`[tool: ado-wiki-missing-assets-diagnostic.md]`

```kusto
OnlineTierWebRequests
| where RequestId == "{traceId}"
| where RequestUrl == "/api/atlas/v2/entity/bulk"
```
`[tool: ado-wiki-missing-assets-diagnostic.md]`

```kusto
OnlineTierDetails
| where RequestId == "{traceId}"
```
`[tool: ado-wiki-missing-assets-diagnostic.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Audit log export from Purview does not display Chinese/Unicode characters correc... | Missing BOM (Byte Order Mark) in exported CSV file (PG Bug: ... | PG known issue. Workaround: Open CSV in text editor, re-save with UTF-8 BOM enco... |
| Asset deleted from data source is not automatically removed from Purview catalog... | Scan scope is set to individual items (tables/files) rather ... | Adjust scan scope to the direct parent level or higher (e.g., database level for... |
| Deleted asset still visible in Purview catalog after running scan. Scan scope wa... | Scan scope must be configured to the DIRECT PARENT or higher... | 1) Set scan scope to include direct parent folder/container of deleted asset (or... |
| Assets or classifications missing after scan in Purview Data Map. Scan completes... | Customer previously modified the asset (name, field classifi... | This is by design. Verify if customer modified the asset by checking the asset F... |
| Assets missing after scan. Scan OpInfo shows assets were emitted, but they do no... | Ingest request failed due to operation timeout, transient ne... | Check ingest status: OfflineTierWarmPathAgentLogs / where TraceId contains "{tra... |
| Assets or classifications missing. Scan emitted assets correctly (OpInfo confirm... | Assets or classifications were lost/dropped in transit betwe... | Get traceId from scan run id (activityId + pipelineId). Check OnlineTierDetails ... |
| Assets or classifications missing after scan. Need to verify if scan actually em... | Scan did not emit the assets or classifications. Asset has n... | Check scan logs: DataScanAgentEvent / where ScanResultId == "<ScanRunId>" / wher... |
| Assets or classifications missing after scan completes in Microsoft Purview Data... | Scan did not emit the assets/classifications — entity has em... | Check DataScanAgentEvent with ScanResultId and filter for OpInfo/Entity info con... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Audit log export from Purview does not display Chinese/Unicode characters correctly in Excel - garbl... | Missing BOM (Byte Order Mark) in exported CSV file (PG Bug: Task 4393871, ICM 60... | PG known issue. Workaround: Open CSV in text editor, re-save with UTF-8 BOM encoding, then open in E... | 🔵 7.5 | MCVKB/Purview known issue.md |
| 2 | Asset deleted from data source is not automatically removed from Purview catalog after subsequent sc... | Scan scope is set to individual items (tables/files) rather than their direct pa... | Adjust scan scope to the direct parent level or higher (e.g., database level for SQL, parent folder ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FAsset%20deletion%20auto%20detect) |
| 3 | Deleted asset still visible in Purview catalog after running scan. Scan scope was not set to include... | Scan scope must be configured to the DIRECT PARENT or higher level of the delete... | 1) Set scan scope to include direct parent folder/container of deleted asset (or higher). 2) Trigger... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Deleted asset not going away) |
| 4 | Assets or classifications missing after scan in Purview Data Map. Scan completes successfully but ce... | Customer previously modified the asset (name, field classification, or descripti... | This is by design. Verify if customer modified the asset by checking the asset FQN with SME. Once a ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 5 | Assets missing after scan. Scan OpInfo shows assets were emitted, but they do not appear in the cata... | Ingest request failed due to operation timeout, transient network failure, or co... | Check ingest status: OfflineTierWarmPathAgentLogs / where TraceId contains "{traceId}" / where Messa... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 6 | Assets or classifications missing. Scan emitted assets correctly (OpInfo confirms), but assets not f... | Assets or classifications were lost/dropped in transit between scan emission and... | Get traceId from scan run id (activityId + pipelineId). Check OnlineTierDetails / where RequestId ==... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 7 | Assets or classifications missing after scan. Need to verify if scan actually emitted the entities. | Scan did not emit the assets or classifications. Asset has no schema (Schema:[])... | Check scan logs: DataScanAgentEvent / where ScanResultId == "<ScanRunId>" / where Message contains "... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 8 | Assets or classifications missing after scan completes in Microsoft Purview Data Map; entities not a... | Scan did not emit the assets/classifications — entity has empty schema (Schema:[... | Check DataScanAgentEvent with ScanResultId and filter for OpInfo/Entity info containing the asset UR... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 9 | Assets or classifications missing after scan — scan emitted correctly but entities not in catalog | Assets were lost/dropped between scan emission and Hot Tier ingestion; payload w... | Get traceId from scan run (activityId + pipelineId). Check OnlineTierDetails with RequestId=traceId ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 10 | Scan log queries using OpInfo keyword return no results after Microsoft removed OpInfo structure fro... | Microsoft phased out the OpInfo keyword from scan logs across all regions (compl... | Replace OpInfo with ConvertedEntities in all Kusto scan log queries. The ConvertedEntities keyword p... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FCheck%20scan%20logs%20using%20%22ConvertedEntities%22%20instead%20of%20%22OpInfo%22) |