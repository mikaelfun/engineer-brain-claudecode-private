---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/Microsoft Defender for Cloud Billing and Usage workflow/Billing Kusto queries"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/Microsoft%20Defender%20for%20Cloud%20Billing%20and%20Usage%20workflow/Billing%20Kusto%20queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Billing Kusto Queries

Internal Kusto queries for MDC billing investigation. Dashboard: [Defender for Cloud - Plan Status and Billing report](https://dataexplorer.azure.com/dashboards/ea3bdd75-b953-49cf-b4a1-b2886177cebb)

## History of Bundle Changes

```kusto
cluster('Rometelemetrydata').database("RomeTelemetryProd").PricingSnapshot
| where SubscriptionId == '{SubscriptionId}'
| sort by TimeStamp desc
```

## Units Consumed Per Day with Meter Info

```kusto
cluster('Rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-1060d,now())
| where SubscriptionId == "{SubscriptionId}"
| sort by Day desc
```

## Daily Consumed Values by Resource Provider

```kusto
cluster("RometelemetryData").database("RomeTelemetryProd").BillingReportsByDayBundlePricingTierMethodAndSubscriptionId(now()-90d,now())
| where SubscriptionId == "{SubscriptionId}"
```

## VMs Billed Per Day

```kusto
let startDate = datetime("2024-06-01 00:00:00");
let endDate = datetime("2024-07-01 00:00:00");
find where TimeGenerated between(startDate .. endDate) project _BilledSize, _IsBillable, Computer, Type, TimeGenerated
| where _IsBillable == true and Type != "Usage"
| where isnotempty(Computer)
| summarize BillableDataGB = sum(_BilledSize)/1000000000 by bin(TimeGenerated, 1d), Computer
| sort by BillableDataGB desc nulls last
```

## Billable Events Per Computer

```kusto
find where TimeGenerated > ago(24h) project _IsBillable, Computer
| where _IsBillable == true and Type != "Usage"
| extend computerName = tolower(tostring(split(Computer, '.')[0]))
| summarize eventCount = count() by computerName
| sort by eventCount desc nulls last
```

## Consumed Compute Units by VM

```kusto
cluster("Romelogs").database("Prod").OmsHealthMonitoringOE
| where SubscriptionId == "{SubscriptionId}"
| summarize count() by VmId
```

## Last Reporting Date from All VMs

```kusto
cluster("Romelogs").database("Prod").LastOMSReportingDataForEachVm()
| where SubscriptionId == "{SubscriptionId}"
```

## Total Agents Installed and Billing Method

```kusto
cluster("Romelogs").database("Prod").WorkspaceHealthMonitoringOE
| where env_time > ago(300d)
| where SubscriptionId == "{SubscriptionId}"
| where operationName == "MonitorWorkspaceHealth"
| project env_time, SubscriptionId, Location, OmsWorkspaceResourceId, OmsWorkspaceCustomerId, OmsWorkspacePricingTier, IsConnectedToAscWorkspace, SearchType, IsSecurityStandardSolutionEnabled, IsSecurityFreeSolutionEnabled, IsUpdatesSolutionEnabled, IsAntimalwareSolutionEnabled, DirectAgentAzureCount, DirectAgentNonAzureCount, ScomAgentAzureCount, ScomAgentNonAzureCount, ScomServerAzureCount, ScomServerNonAzureCount, Summary, IsDefaultWorkspace
| summarize arg_max(env_time, *) by SubscriptionId, OmsWorkspaceResourceId
| order by env_time desc nulls last
```

## Pricing Tier Queries

### Current Pricing Tier

```kusto
cluster("Rometelemetrydata").database("RomeTelemetryProd").GetPricingTierByBundleAndSubscriptionId()
| where SubscriptionId == '{SubscriptionId}'
```

### VM Count

```kusto
cluster('Rometelemetrydata').database('RomeTelemetryProd').AscPricingAndVmsCountForAzureSubscriptions
| where SubscriptionId == "{SubscriptionId}"
| sort by RunQueryTimestamp desc
```
