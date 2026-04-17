---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Scan fails with an error/On-premise SQL Server"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FScan%20fails%20with%20an%20error%2FOn-premise%20SQL%20Server"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# On-premise SQL Server Scan Troubleshooting

Filter SHIR logs with Customer provided Report Id:

```kql
TraceGatewayLocalEventLog
| where UserReportId =="06c039b9-3fb8-4b29-88ec-7b5d772a535c"
| where LocalMessage contains "SQL2017" //If you know the SQL instance name 
| project PreciseTimeStamp, LocalMessage
| where LocalMessage contains "ExecutionDataScanActivity"
| order by PreciseTimeStamp desc
```

Use this query template to filter Self-Hosted Integration Runtime (SHIR) logs for on-premise SQL Server scan failures. Replace the UserReportId and SQL instance name with actual values from the customer's scan result.
