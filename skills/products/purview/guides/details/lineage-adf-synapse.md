# Purview ADF / Synapse 血缘 -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-adf-related-lineage-tsg.md](..\guides/drafts/ado-wiki-a-adf-related-lineage-tsg.md), [ado-wiki-adb-lineage-openlineage-solution-accelerator.md](..\guides/drafts/ado-wiki-adb-lineage-openlineage-solution-accelerator.md), [ado-wiki-sql-server-lineage-issues.md](..\guides/drafts/ado-wiki-sql-server-lineage-issues.md), [ado-wiki-troubleshooting-data-factory-lineage-issues.md](..\guides/drafts/ado-wiki-troubleshooting-data-factory-lineage-issues.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-adb-lineage-openlineage-solution-accelerator.md, ado-wiki-a-adf-related-lineage-tsg.md

1. ADF-Related Lineage Problems `[source: ado-wiki-a-adf-related-lineage-tsg.md]`
2. Training Resources `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
3. Other Resources `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
4. Troubleshooting `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
5. Limitations `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
6. Troubleshooting doc `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
7. How to contact OpenLineage Product Group `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
8. Additional Information `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
9. Unable to access github documentation `[source: ado-wiki-adb-lineage-openlineage-solution-accelerator.md]`
10. SQL Server Lineage Issues `[source: ado-wiki-sql-server-lineage-issues.md]`

### Phase 2: Data Collection (KQL)

```kusto
cluster('babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '<scan-result-id>'
| where Message contains 'error'
| project ['time'], Message
```
`[tool: ado-wiki-sql-server-lineage-issues.md]`

```kusto
cluster('https://babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '<scan-result-id>'
| where Message contains "AutoExtractLineageSource enabled for"
| project ['time'], Message
```
`[tool: ado-wiki-sql-server-lineage-issues.md]`

```kusto
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == "<shir-report-id>"
| where LocalMessage contains "miti: ThreadID: main; TimeStamp:"
| order by LocalTimestamp asc
| project LocalTimestamp, LocalMessage, LocalTraceLevel
```
`[tool: ado-wiki-sql-server-lineage-issues.md]`

```kusto
cluster('babylontest.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierWebRequests
| where RequestId has "<scan-result-id>"
| project RequestUrl
```
`[tool: ado-wiki-sql-server-lineage-issues.md]`

```kusto
cluster('babylontest.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetailsPrivacy
| where RequestId has "<scan-result-id>"
```
`[tool: ado-wiki-sql-server-lineage-issues.md]`

```kusto
cluster('https://babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == "<scan-result-id>"
| where Message contains "OneProvenance Configuration: "  // OneProvenanceModule executed
// Uncomment filters as needed:
//| where Message contains "Finding blobs modified after"  // AzBlobXelCollector executed
//| where Message contains "Starting xel batch processing, xel count"  // xel files for xevents
//| where Message contains "Malformed entity"
//| where Message contains "Relationship: {\"typeName\":\"azure_sql_stored_procedure_stored_procedure_runs\""
| sort by ['time'] asc
| project ['time'], ScanResultId, Message
```
`[tool: ado-wiki-sql-server-lineage-issues.md]`

```kusto
cluster('adfcus').database('AzureDataFactory').DataflowClusterLogs | union cluster('adfneu').database('AzureDataFactory').DataflowClusterLogs
| where ActivityRunId == "ef9f5b5b-xxxx-xxxx-xxxx-e7a0bd99f34c"  // Activity RunId
| where Caller contains "lineage"
```
`[tool: ado-wiki-troubleshooting-data-factory-lineage-issues.md]`

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetails
| where RequestId contains "ef9f5b5b-xxxx-xxxx-xxxx-e7a0bd99f34c" //ActivityId
| project PreciseTimeStamp, Level, Msg, CatalogId, CatalogName, RequestId | order by PreciseTimeStamp asc
```
`[tool: ado-wiki-troubleshooting-data-factory-lineage-issues.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Azure Databricks lineage missing in Purview after scan completes; lineage tab sh... | Only NOTEBOOK entity type lineage is supported. Tables/noteb... | (1) Verify lineage is from NOTEBOOK type. (2) Confirm within scan workspace scop... |
| Lineage not appearing for stored procedures invoked from Azure Data Factory (ADF... | Remote Procedure Calls (RPC) from ADF are not supported in S... | Known limitation. Stored procedures invoked from ADF are not supported for linea... |
| View lineage not rendered after SQL DB metadata scan. Customer does not see view... | If the asset was already ingested to data map before the lin... | Delete the asset from data map, then re-run the scan. If errors persist, check K... |
| Synapse Analytics lineage missing despite successful ADF dataflow; ADF-Purview l... | ADF-Purview connection not established correctly; adcPropert... | Verify ADF-Purview connection per docs. Try disconnect/reconnect Synapse. Kusto:... |
| Data factory disappears from the Purview portal Lineage connection list | The data factory service principal was removed from the Purv... | 1) Go to Purview → Collection page → check if the data factory is still listed a... |
| Cross-workspace lineage for Databricks Unity Catalog is not supported in Purview... | By design. Purview does not support cross-workspace lineage ... | No workaround. Feature request FR-2772. |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Databricks lineage missing in Purview after scan completes; lineage tab shows no data | Only NOTEBOOK entity type lineage is supported. Tables/notebooks must be in same... | (1) Verify lineage is from NOTEBOOK type. (2) Confirm within scan workspace scope. (3) Query DataSca... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/Azure%20Databricks%20Lineage%20and%20Authentication%20Issues) |
| 2 | Lineage not appearing for stored procedures invoked from Azure Data Factory (ADF) in Azure SQL DB li... | Remote Procedure Calls (RPC) from ADF are not supported in SQL provenance lineag... | Known limitation. Stored procedures invoked from ADF are not supported for lineage extraction. Only ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Lineage/SQL%20Server%20Provenance%2C%20PowerBI%20sub-artifact%20lineage%20and%20PowerBI%20scan%20through%20VNET) |
| 3 | View lineage not rendered after SQL DB metadata scan. Customer does not see view lineage for scanned... | If the asset was already ingested to data map before the lineage-enabled scan, t... | Delete the asset from data map, then re-run the scan. If errors persist, check Kusto logs (DataScanA... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/SQL%20Server%20Lineage%20Issues) |
| 4 | Synapse Analytics lineage missing despite successful ADF dataflow; ADF-Purview linking incorrect | ADF-Purview connection not established correctly; adcProperties show empty/wrong... | Verify ADF-Purview connection per docs. Try disconnect/reconnect Synapse. Kusto: DataflowClusterLogs... | 🔵 7.0 | ado-wiki |
| 5 | Data factory disappears from the Purview portal Lineage connection list | The data factory service principal was removed from the Purview root collection'... | 1) Go to Purview → Collection page → check if the data factory is still listed as a Data Curator in ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FLineage%2FConnecting%20to%20lineage%20sources%2FTroubleshoot%20Data%20factory%20disappears%20or%20gets%20disconnected%20on%20Purview%20portal) |
| 6 | Cross-workspace lineage for Databricks Unity Catalog is not supported in Purview. | By design. Purview does not support cross-workspace lineage extraction from Data... | No workaround. Feature request FR-2772. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |