---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/Client Side Queries for Billing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/Client%20Side%20Queries%20for%20Billing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Client Side Queries for Billing

Customer-ready KQL queries to run from the customer's Log Analytics workspace under:
Security Center > Home > Log Analytics Workspace > Select Workspace > Logs

## DATA INGESTION PER GB AND SOLUTION - Billable

```kql
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == true
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), Solution
| project TimeGenerated = substring(TimeGenerated,0,10), Solution, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

## DATA INGESTION PER GB AND SOLUTION - Free

```kql
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == false
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), Solution
| project TimeGenerated = substring(TimeGenerated,0,10), Solution, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

## DATA INGESTION PER GB AND DATATYPE - Billable

```kql
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == true
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), DataType
| project TimeGenerated = substring(TimeGenerated,0,10), DataType, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

## DATA INGESTION PER GB AND DATATYPE - Free

```kql
_Usage
| where TimeGenerated > ago(90d)
| where IsBillable == false
| summarize TotalVolumeGB = sum(Quantity) / 1024 by startofday(TimeGenerated), DataType
| project TimeGenerated = substring(TimeGenerated,0,10), DataType, TotalVolumeGB
| order by TimeGenerated asc
| render barchart kind=default_
```

> Tip: Change the view to line graph for easier reading by the customer.
