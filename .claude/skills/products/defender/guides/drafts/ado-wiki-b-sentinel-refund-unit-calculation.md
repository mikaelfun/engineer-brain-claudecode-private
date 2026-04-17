---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Billing/Sentinel Refund Unit Calculation and Procedure"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FBilling%2FSentinel%20Refund%20Unit%20Calculation%20and%20Procedure"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Sentinel Refund Unit Calculation and Procedure

## Scenarios

### Spike in Sentinel billing
The team owning the data source causing the spike + CSS SE + Sentinels data collection team (if needed).
Example: if MDE tables caused the spike, Sentinel + MDE need to be involved.

### Refund request due to PG bug
If the bug is confirmed and resolved:
1. Customers found an issue/problem/bug
2. Customers create a technical case/reach the technical support
3. The issue is fixed -> We have an RCA for the issue/problem. Keep in mind the team owning the bug needs to do this - only route to Sentinel billing if this is pure billing issue.
4. With the RCA, the Azure subscription management team (ASMS) checks if a credit can be provided based on the credit policy.
   - [ASMS Handling Credit Requests and Refunds](https://internal.evergreen.microsoft.com/en-us/topic/e48b6390-1a3c-094a-57b5-04a931821df9)
   - [AzMon Wiki - Initiate a refund process](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750181/HT-Initiate-a-refund-process)
5. If the credit can be provided, the subscription management calculates the amount and request the approvals. Credit can be approved or rejected.
6. The subscription management team provides the credit status to the customer.

If the bug is not confirmed or resolved, route to PG team owning the bug.

### Refund request - customer issue
Route to Azure Subscription Management/Azure Billing.

### Understand billing / question
Sentinel Billing team handles this.

### Benefits (Defender for Cloud 500MB)
For [Defender for Cloud benefit (500MB)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/faq-defender-for-servers#is-the-500-mb-of-free-data-ingestion-allowance-applied-per-workspace-or-per-machine-) issues, the Sentinel Billing team neither manages nor enforces this benefit; it is under the responsibility of the Microsoft Defender for Cloud team.
CRIs should be directed towards *Defender for CSPM/Defenders - CRIs*.

## Queries to Identify Units / Meter IDs

### Query 1: Check GBs per table
```kusto
let timeSeriesStart = datetime(12/7/2022);
let timeSeriesEnd = datetime(03/03/2023);
cluster('oibeftprdflwr').database('AMSTelemetry').WorkspaceSnapshot
| where SnapshotTimestamp between (timeSeriesStart..timeSeriesEnd)
| where Solutions has "SecurityInsights"
| where WorkspaceId contains "<workspace-id>"
| distinct TenantId, WorkspaceId
| join kind=inner cluster('oibeftprdflwr').database('KcmTelemetry').BillingStatistics on $left.WorkspaceId == $right.CustomerId
| where StartTime between (timeSeriesStart..timeSeriesEnd)
| project Table, BillableSize, RecordCount, CustomerId, TenantId
| summarize CustomerCount = dcount(TenantId), GBytes=sum(BillableSize)/1024/1024/1024 by Table
```

### Query 2: Identify the meterName
```kusto
let timeSeriesStart = datetime(12/7/2022);
let timeSeriesEnd = datetime(03/03/2023);
let meterInfo = materialize(cluster('Appinsightstlm').database("AzureMonitorUsage").MeterInfo);
cluster('appinsightstlm').database("AzureMonitorUsage").UsageByResourceEx
| where resourceUri contains "<resource-uri>"
| where usageTime between (timeSeriesStart..timeSeriesEnd)
| extend YearMonth=strcat(datetime_part("Year", usageTime),"-",iff(datetime_part("Month",usageTime)<10,"0",""), datetime_part("Month",usageTime))
| where meterId in ((meterInfo | where meterName contains "Benefit" | project meterId))
| join kind=leftouter (meterInfo) on meterId
| project units, meterName, meterId, YearMonth
| summarize GBytes = sum(units) by meterName, YearMonth
```

## Required Access
- To get access to the appinsightstlm cluster: [CoreIdentity](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/tmapplicatio-ze14) and join TM-ApplicationInsights (ReadOnly).
- To query these tables: http://idweb and join the security group AzureMonitorUsageReader.
