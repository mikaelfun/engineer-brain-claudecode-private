---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Purview Billing/Billing Refund/Look Up Billing Charges"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Purview%20Billing/Billing%20Refund/Look%20Up%20Billing%20Charges"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Billing Overview

Detailed Pricing information: https://azure.microsoft.com/en-us/pricing/details/purview/

Direct and indirect costs: https://learn.microsoft.com/en-us/azure/purview/concept-guidelines-pricing

Best Practices for Scanning (cost optimization): https://learn.microsoft.com/en-us/azure/purview/concept-best-practices-scanning

When a customer provisions a Purview account, the first 1MB in the Data Map is free. Fixed cost: $300/month for 1 CU (always on, no pause functionality).

Billing is mainly composed of 4 components: **Scanning Service, Insights Service, Ingestion Service, Data Map**.

## Information Needed for Escalation

- CU and Storage Size Monitoring UI from Purview in the Azure Portal
- Cost Analysis in the Cost Management Center Portal
- Resource ID (e.g., `/subscriptions/XXX/resourceGroups/my-group/providers/Microsoft.Purview/accounts/my-purview`)

## Check Which Service Billing Charge is Too High

```kusto
BillingLogEvent
| where ResourceId == "<customer_Full ResourceURI>"
| summarize sum(Quantity) by Component
| order by Component
```

## Action Plan: Data Map (Catalog/CU) Charges Too High

Check metadata size in Azure Portal → 1 Capacity Unit = 10GB metadata (~$300/month per CU). If metadata size is root cause, reduce by deleting unused assets.

## Action Plan: Ingestion Service Charges Too High

Usually caused by ADF, Synapse, or Power BI pushing lineage to Purview without customer awareness. Verify in Purview Studio (Monitor > Data Map Population). Disconnect lineage connection if needed: https://learn.microsoft.com/en-us/azure/synapse-analytics/catalog-and-governance/quickstart-connect-azure-purview

## Kusto Queries

### General Query: Scanning Cost by Date

```kusto
let accountName = "";
let scanResultId = "";
let subId = "";
let startdate = datetime(2023-09-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
iff(MeterId contains "811e3118-5380-5ee8-a5d9-01d48d0a0627", "Scanning - Charged",
iff(MeterId contains "5d157295-441c-5ea7-ba7c-5083026dc456", "Scanning - Free SQL/PBI",
iff(MeterId contains "053e2dcb-82c0-5e50-86cd-1f1c8d803705", "Scanning - Free SQL/PBI",
iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other"))))))
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
| where AccountName == accountName
| extend date_time = format_datetime(TIMESTAMP, 'yyyy-MM-dd')
| summarize round(sum(Quantity),2) by Meter, CatalogName, OrganizationName, TPID, date_time
| sort by date_time asc
```

### Visualize Changes in Charges by Account

```kql
let accountName = "";
let scanResultId = "";
let subId = "";
let startdate = datetime(2023-12-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
iff(MeterId contains "811e3118-5380-5ee8-a5d9-01d48d0a0627", "Scanning - Charged",
iff(MeterId contains "5d157295-441c-5ea7-ba7c-5083026dc456", "Scanning - Free SQL/PBI",
iff(MeterId contains "053e2dcb-82c0-5e50-86cd-1f1c8d803705", "Scanning - Free SQL/PBI",
iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other"))))))
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
| where AccountName == accountName
| extend date_time = format_datetime(TIMESTAMP, 'yyyy-MM-dd')
| summarize sum(Quantity) by bin(TIMESTAMP,5m), Meter
| render timechart
```

### Calculate Scan Service Billing by Scan Result ID

```kql
let accountName = "";
let scanResultId = "";
let subId = "";
let startdate = datetime(2023-09-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
iff(MeterId contains "811e3118-5380-5ee8-a5d9-01d48d0a0627", "Scanning - Charged",
iff(MeterId contains "5d157295-441c-5ea7-ba7c-5083026dc456", "Scanning - Free SQL/PBI",
iff(MeterId contains "053e2dcb-82c0-5e50-86cd-1f1c8d803705", "Scanning - Free SQL/PBI",
iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other"))))))
| where IsInternal != 1
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
| where AccountName == accountName
| extend date_time = format_datetime(TIMESTAMP, 'yyyy-MM-dd')
| where Meter == "Scanning - Charged"
| where Component == "Scanning Service"
| where AdditionalProperties contains scanResultId
| summarize round(sum(Quantity),2) by Meter, CatalogName, OrganizationName, TPID, date_time
| sort by date_time asc
```

### Correlate Insights Charges

```kql
let accountName = "";
let subId = "";
let startdate = datetime(2023-09-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
    iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
    iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other") ) )
| where IsInternal != 1
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
```

### Scan Charges - Identify Scan Name

Use correlation ID from BillingLogEvent AdditionalProperties to map to GatewayEvent:

```kql
let corrId = "";
let accountName = "";
let scanId = "";
let subId = "";
GatewayEvent
| where AccountName == accountName
| where CorrelationId == corrId
| project AccountName, Source, PreciseTimeStamp, RequestId, Status, CorrelationId, CallerObjectId, Message, Query
```

```kql
let scanId = "";
ScanningLog
| where ScanResultId == scanId
| where * contains "Enq"
```

### Ingestion Charges - Identify Source

```kql
let accountName = "";
let ingestionId = "";
GatewayEvent
| where * contains accountName
| where TIMESTAMP between (datetime(2023-02-24) .. datetime(2023-02-25))
| where * contains ingestionId
```

### Ingestion Charges from ADF - Identify Pipeline

```kql
let resourceId = "";
let startTime = datetime();
let endTime = datetime();
BillingLogEvent
| where ResourceId == resourceId
| where TIMESTAMP between (startTime .. endTime)
| extend AdditionalProperties_json = parse_json(AdditionalProperties)
| extend IngestionJobId = tostring(AdditionalProperties_json.IngestionJobId)
| extend Source = tostring(AdditionalProperties_json.Source)
| extend Hours = toreal(AdditionalProperties_json.Hours)
| project ['time'], IngestionJobId, Quantity, Source, Hours
| where Source == "DataFactory"
| join kind=leftouter (OnlineTierIngestionDetails | where Message startswith "Ingestion job context: SourceName"| project Message, IngestionJobId | parse Message with * "SourceName" SourceName "SourcePath" SourcePath) on IngestionJobId
| summarize sum(Quantity), sum(Hours) by SourceName, SourcePath, bin(['time'], 1d)
| order by sum_Quantity
```

## Unhappy Customer Due to Costs

Update the Supportability Excel Spreadsheet (internal SharePoint link).
