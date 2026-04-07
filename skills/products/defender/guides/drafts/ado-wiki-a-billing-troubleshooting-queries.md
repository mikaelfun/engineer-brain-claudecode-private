---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/Microsoft Defender for Cloud Billing and Usage workflow/Billing troubleshooting queries"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/Microsoft%20Defender%20for%20Cloud%20Billing%20and%20Usage%20workflow/Billing%20troubleshooting%20queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Billing Troubleshooting Queries

## Scoping Questions

1. Which specific service (servers, storage, SQL, etc.) has billing issues?
2. Any recent changes to subscription plans?
3. Any unusual spikes in resource consumption?
4. What time period does the discrepancy cover?

## Data Collection

- **Subscription ID**: Essential for identifying billed resources
- **Time Period**: Start and end dates for analysis
- **Service Type**: VMs, storage, SQL databases, or other services

## ARG Queries (Azure Resource Graph)

### Defender Plans Status

```kql
securityresources
| where type == "microsoft.security/pricings"
| project name, parse_json(properties).pricingTier
```

## Log Analytics Workspace Queries

### Data Ingested By DataType

```kql
let StartTime = datetime(<STARTTIME>);
let EndTime = datetime(<ENDTIME>);
Usage
| where TimeGenerated between (StartTime..EndTime)
| where IsBillable == 'TRUE'
| project TimeGenerated, DataType, Solution, Quantity, QuantityUnit
| summarize DataConsumedPerDataType = sum(Quantity) by QuantityUnit, DataType
| sort by DataConsumedPerDataType desc
```

### Total Data Ingested

```kql
let StartTime = datetime(<STARTTIME>);
let EndTime = datetime(<ENDTIME>);
Usage
| where TimeGenerated between (StartTime..EndTime)
| where IsBillable == 'TRUE'
| project TimeGenerated, DataType, Solution, Quantity, QuantityUnit
| summarize DataConsumedPerDataType = sum(Quantity)
| sort by DataConsumedPerDataType desc
```

## Kusto Explorer Queries

### Servers - Daily Billing

```kusto
cluster('rometelemetrydata').database("RomeTelemetryProd").BillingReportsByDayBundlePricingTierMethodAndSubscriptionId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId in ('{subscriptionId}')
| where Bundle == 'VirtualMachines'
| project Day, Nodes, PricingTier, Bundle, ResourceProvider, SubscriptionId, Units, BillingMethod
| render timechart with (ycolumns=Units, series=PricingTier, Bundle, ResourceProvider)
```

### Servers - Total Units

```kusto
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId == '{SubscriptionID}'
| where Bundle contains "VirtualMachines"
| summarize TotalUnits = sum(Units) by Bundle
```

### Servers - List All Billed VMs

```kusto
cluster("Romelogs").database("RomeLogs").HybridOmsHealthMonitoringOE
| where env_time between (StartTime..EndTime)
| where SubscriptionId == '{SubscriptionID}'
| summarize by ComputerName, OsType, IsAzure, OmsWorkspaceAzureResourceId
| sort by ComputerName asc
```

### Storage ATP - Daily

```kusto
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId == '{SubscriptionID}'
| where Bundle contains "Storage"
| sort by Day desc
```

### SQL Database - Daily

```kusto
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId == '{SubscriptionID}'
| where Bundle contains "SQL"
| sort by Day desc
```

### AppService - Daily

```kusto
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-600d,now())
| where Day between (StartTime..EndTime)
| where SubscriptionId == '{SubscriptionID}'
| where Bundle contains "AppServices"
| sort by Day desc
```

### PricingSnapshot

```kusto
cluster('Rometelemetrydata').database("RomeTelemetryProd").PricingSnapshot
| where SubscriptionId == '{SubscriptionID}'
| sort by TimeStamp desc
```
