---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Smart Detector Alert didn't fire when it should (Missed Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Smart%20Detector%20Alert%20didn't%20fire%20when%20it%20should%20(Missed%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Smart Detector Alert Didn't Fire (Missed Alert)

## Scenario
Smart detection alert that has been migrated did not fire when expected.

## Prerequisites
Kusto Explorer with connection to **azalertsprodweu** cluster (azalertsprodweu.westeurope.kusto.windows.net), database: DeepInsights.

## Applicable Alert Rule Types

| Alert rule name | Internal detector name |
|--|--|
| Response latency degradation | RequestPerformanceDegradationDetector |
| Dependency latency degradation | DependencyPerformanceDegradationDetector |
| Exception anomalies | ExceptionVolumeChangedDetector |
| Trace severity degradation | TraceSeverityDetector |
| Potential memory leak | MemoryLeakDetector |

## Information Needed
- Resource ID of the Alert rule
- Smart alert rule type (from table above)
- Application Insights application ID (from ASC under microsoft.insights/components)
- Timestamp in UTC where alert was expected to fire

## Troubleshooting

### Step 1: Check detector run logs
```kql
traces 
| where timestamp > ago(4d) 
| where customDimensions.SmartDetectorId == "DETECTORIDGOESHERE" 
| where customDimensions.["AppId"] == "APPLICATIONIDGOESHERE" 
| order by timestamp desc 
| summarize max(timestamp) by operation_ParentId 
| order by max_timestamp
```
> If query returns no results, there may have been very low failures (< 40). Check metrics chart instead.

### Step 2: Investigate specific run
```kql
traces 
| where timestamp > ago(21d) 
| where operation_ParentId =~ "OPERATIONIDGOESHERE" 
| order by timestamp desc
```

### Step 3: Analyze results
Lines indicating **alert should NOT have fired**:
- "Completed processing of detector ..., returning 0 detections."
- "Got 0 detections from extension ... analysis"
- "Found 0 performance degradation detections for application."
- "Detector returned 0 alerts."

### Step 4: Review metric charts
Use ASC to chart App Insights metrics:

| Alert rule | Metric Name | Aggregation |
|--|--|--|
| Response latency | requests/duration | Average |
| Dependency latency | dependencies/duration | Average |
| Exception anomalies | exceptions/count | Count |
| Trace severity | traces/count | Count |
| Memory leak | performanceCounters/processPrivateBytes | Average |
