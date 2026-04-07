---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Failure Anomalies alert didn't fire when it should (Missed Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Failure%20Anomalies%20alert%20didn%27t%20fire%20when%20it%20should%20(Missed%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Failure Anomalies Alert Didn't Fire (Missed Alert)

## Scenario
Failure anomalies alert (Smart Detection) did not fire when expected.

## Before You Begin
Need Kusto Explorer with connection to **azalertsprodweu** cluster (azalertsprodweu.westeurope.kusto.windows.net).

## Information you will need
- Alert rule resource ID
- Application insights **resource location** and **application Id** (from ASC → microsoft.insights/components)
- Timestamp in UTC where alert was expected to fire

## Troubleshooting

### Step 1: Check detector run logs
Database: **azalertsprodweu / DeepInsights**

```kql
traces 
| where timestamp > ago(4d) 
| where customDimensions.SmartDetectorId == "FailureAnomaliesDetector" 
| where customDimensions.["Mdm_Monitor.Id"] endswith "FailureAnomalies"
| where customDimensions.["Mdm_Monitor.Dimension.ResourceId"] == "APPLICATIONIDGOESHERE"
| order by timestamp desc 
| summarize max(timestamp) by operation_ParentId 
| order by max_timestamp 
```

Returns list of operation IDs for each detector run.

**Note:** If query returns no results, may be because there were very few failures (less than 40). Check metrics chart instead.

### Step 2: Investigate a specific run
```kql
traces 
| where timestamp > ago(21d) 
| where operation_ParentId == "OPERATIONIDGOESHERE" 
| order by timestamp desc
```

### Step 3: Analyze results
Lines indicating alert should NOT have fired:
- _Detector returned 0 alerts_
- _AlertFlow: detection rejected due to FalseDetection._
- _AlertFlow finished - no alert was detected._

### Common causes for non-firing

1. **Minimum ratio rejection**:
   > _AlertFlow: detection rejected due to minimum ratio. Failure ratio: 0.023 MinRatio: 0.028, TotalRequests: 9681_
   
   Average failure ratio did not exceed the baseline minimum value.

2. **3-Sigma rejection**:
   > _Detection Rejected = 1, Rejection Reason = 3-Sigma_
   
   Spike rate (e.g., 0.079%) was below threshold = baseline average rate + 3 × standard deviation (e.g., 0.038 + 3×0.049 = 0.185%).

### Step 4: Review metric charts
- Failure rate chart: `https://jarvis-west.dc.ad.msft.net/dashboard/share/DB788594`
  - Account format: `ApplicationInsights_PROD_REGIONNAME`
  - ResourceId: customer's Application Insights Application Id
- Failed vs total requests chart: `https://jarvis-west.dc.ad.msft.net/dashboard/share/DFE0CF1F`

Failure anomalies algorithm detects spikes in the application's failure rate. See [public docs](https://docs.microsoft.com/azure/azure-monitor/app/proactive-failure-diagnostics#how-it-works).
