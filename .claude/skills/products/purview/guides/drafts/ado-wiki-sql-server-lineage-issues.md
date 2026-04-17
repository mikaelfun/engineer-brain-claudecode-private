---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Known Issues/SQL Server Lineage Issues"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/SQL%20Server%20Lineage%20Issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SQL Server Lineage Issues

## Expected Issue Categories

### View Lineage

SQL DB metadata scan includes lineage extraction for views. Only new scans include the view lineage extraction. At times, customers don't see View lineage being rendered. Run Kusto queries from the section below to check for errors.

If the asset was already ingested to data map, the lineage won't show in a new scan. Suggest deleting the asset from data map and re-running the scan.

Often, issues originate from MITI. Check MITI Kusto logs and escalate to connectors team if errors are found.

### Stored Procedure Lineage

Enable the Lineage Extraction toggle when setting up a scan. Refer to public documentation for stored procedure lineage supported behaviors and known limitations.

## View Lineage Kusto Queries

### Check scan errors

```kql
cluster('babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '<scan-result-id>'
| where Message contains 'error'
| project ['time'], Message
```

### Check if View Lineage EC is enabled

```kql
cluster('https://babylontest.eastus2.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '<scan-result-id>'
| where Message contains "AutoExtractLineageSource enabled for"
| project ['time'], Message
```

### Check MITI errors

```kql
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == "<shir-report-id>"
| where LocalMessage contains "miti: ThreadID: main; TimeStamp:"
| order by LocalTimestamp asc
| project LocalTimestamp, LocalMessage, LocalTraceLevel
```

### Check DataMap relationship API invocation

```kql
cluster('babylontest.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierWebRequests
| where RequestId has "<scan-result-id>"
| project RequestUrl
```

### Check entities sent to data map

```kql
cluster('babylontest.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetailsPrivacy
| where RequestId has "<scan-result-id>"
```

## Stored Procedure Lineage Kusto Queries

### Trace stored procedure lineage logs

```kql
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

## Next Steps

- If errors found in Kusto logs → engage engineering team with the log evidence.
- If no errors → verify customer followed all steps in [public documentation](https://learn.microsoft.com/en-us/purview/register-scan-azure-sql-database?tabs=sql-authentication). If still no success, escalate to engineering team.
