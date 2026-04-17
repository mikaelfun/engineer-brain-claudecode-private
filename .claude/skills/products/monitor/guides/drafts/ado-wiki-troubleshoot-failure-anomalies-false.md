---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Failure Anomalies alert fired when it shouldn't have (False Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Failure%20Anomalies%20alert%20fired%20when%20it%20shouldn%27t%20have%20(False%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Failure Anomalies Alert Fired When It Shouldn't (False Alert)

## Scenario
Failure anomalies alert (Smart Detection) fired when it should not have.

## Before You Begin
Need Kusto Explorer with connection to **azalertsprodweu** cluster (azalertsprodweu.westeurope.kusto.windows.net).

## Information you will need
- Alert rule resource ID
- Application insights **resource location** and **application Id**
- Alert ID and timestamp in UTC when alert fired
  - Can determine from fired alerts history if customer didn't provide

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

### Step 2: Investigate a specific run
```kql
traces 
| where timestamp > ago(21d) 
| where operation_ParentId == "OPERATIONIDGOESHERE" 
| order by timestamp desc
```

### Step 3: Analyze results
Line indicating alert **should have fired**: _Number of returned alerts: 1_

### Step 4: Check smart alerts engine
Database: **azalertsprodweu / SmartAlerts**

```kql
customMetrics 
| where env_time between (datetime("2021-05-19") .. datetime("2021-05-22")) 
| where name == "Alert latency in seconds" 
| where customDimensions['AlertRuleResourceId'] contains "ALERTRULEIDGOESHERE" 
| project env_time, operation_Name, name, customDimensions
```
Results returned → alert was fired.

### Step 5: Check alerts management platform
Database: **azalertsprodweu / AzureAlertsManagement**

```kql
let startTime = datetime(2021-05-20 08:00:00); 
let endTime = datetime(2021-05-20 09:00:00); 
let alertRule = "ALERTRULEIDGOESHERE"; 
Events
| where timestamp between (startTime..endTime)
| where tostring(customDimensions.AlertRuleId) contains alertRule
| extend tostring(customDimensions.CorrelationId)
| where name startswith "ASC."
| summarize any(customDimensions) by name
```

Look for **PostAzNSRequest** action → indicates Alerts Management Platform sent request to notification service.

The AznsResponseLocationHeader contains notification ID:
> `https://su02.azns.microsofticm.com/BroadcastService/v1.0/cert/Status(3001002747092975)`

### Step 6: Review metric charts
- Failure rate chart: `https://jarvis-west.dc.ad.msft.net/dashboard/share/DB788594`
- Failed vs total requests: `https://jarvis-west.dc.ad.msft.net/dashboard/share/DFE0CF1F`
- Account format: `ApplicationInsights_PROD_REGIONNAME`
- ResourceId: customer's Application Insights Application Id

See [public docs](https://docs.microsoft.com/azure/azure-monitor/app/proactive-failure-diagnostics#how-it-works).
