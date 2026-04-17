# Log Analytics Data Ingestion Flow & Troubleshooting

## Architecture
Log Analytics ingestion flows through: Resource → OBO → ODS → InMem → Query Engine

## Key Diagnostic Queries

### Check last record sent to each table
```kql
// Run in Azure Support Center → Resource Explorer → Microsoft.OperationalInsights/workspaces
search *
| summarize max(TimeGenerated) by $table
| sort by max_TimeGenerated desc
```

### Check workspace issues
```kql
Operation
| where OperationStatus in ("Error", "Failed", "Warning")
| summarize arg_max(TimeGenerated, *) by Detail, OperationStatus
```

## Common Scenarios

### Daily Cap Reached
- Workspace drops all additional data after hitting daily billable data limit
- ADO Wiki: How-to: Check if the daily cap was reached

### Custom Fields Limit Exceeded
- Error: "The number of custom fields 511 is above the limit of 510 fields per data type"
- Consider switching from AzureDiagnostics to resource-specific tables

## Latency Checking

### OBO Latency
- Cluster: azureinsights.kusto.windows.net / Database: Insights

### InMem Latency
- Cluster: omsgenevatlm.kusto.windows.net / Database: OperationInsights_InMem_PROD
- Jarvis: https://portal.microsoftgeneva.com/s/9FD9C196

## Useful ADO Wiki How-To References
1. Check Resource Provider registration
2. Check if resource sends data to OBO
3. Check if daily cap was reached
4. Recover a deleted workspace
5. Force delete a workspace
6. Check if workspace was force-deleted
7. Reset Capacity Reservation (Commitment Tiers)
8. Investigate workspace configuration changes
9. Increase ingestion rate limit (IRL)
10. One-time historic data export from Kusto to storage account
11. Check latency or delay

## Source
- OneNote: Mooncake POD Support Notebook / MONITOR / Log Analytics / Troubleshooting / Log A data ingestion flow
