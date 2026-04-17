---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in Windows/How to collect valid SHIR Logs"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20Windows%2FHow%20to%20collect%20valid%20SHIR%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Collect Valid SHIR Logs

## Where SHIR logs are stored
SHIR logs are stored in Event Viewer on Windows: Application and Service Logs → Integration Runtime.

## Log Retention
No specific retention period. New logs overwrite oldest logs once max log size is reached.

## When to Increase Log Size
- If scan discovers thousands of assets → increase log size before reproducing
- Check asset count via:
```kql
database("babylonMdsLogs").Scan_Results
| where scanResultId == "<run-id>"
| project TIMESTAMP, scanResultId, resultType, TotalScanTimeTakenInMinutes, assetsDiscovered, dataSourceType, AccountName
| limit 1
```

## How to Increase Log Size
1. Event Viewer → Applications and Services Logs
2. Right-click Connectors-Integration Runtime → Properties
3. Change maximum log size to 4GB
4. Ensure Enable logging is selected

## How to Upload SHIR Log
Integration Runtime Configuration Manager → Diagnostics → Send logs → collect Report ID

## When to Upload Event Viewer Log
Upload immediately after issue is reproduced. Collect:
- Scan run ID
- Report ID
- Troubleshooting package for 3rd party data sources
- Scan monitor logs if scan completed with exception

## How to Validate Report ID
```kql
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == '<report-id>'
| where LocalTimestamp > <scan-start-time-UTC>
| where LocalTimestamp < <scan-finish-time-UTC>
| where * contains "<scan-run-id>"
| project LocalTimestamp, LocalTraceLevel, LocalMessage
| order by LocalTimestamp asc
```

## Log Retention in Kusto
Log retention in Kusto is **3 weeks**. If uploaded > 3 weeks ago, reproduce and recollect.
