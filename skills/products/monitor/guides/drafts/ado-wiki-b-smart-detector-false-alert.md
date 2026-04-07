---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Smart Detector Alert fired when it shouldn't have (False Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Troubleshooting%20Guides/Troubleshooting%20Smart%20Detector%20Alert%20fired%20when%20it%20shouldn't%20have%20(False%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Smart Detector Alert Fired When It Shouldn't Have (False Alert)

## Scenario

This troubleshooting guide applies to a smart alert that fired when it should not. Applies to Smart detection alerts that have been migrated per "Migrate Azure Monitor Application Insights smart detection to alerts".

## Prerequisites

- Kusto Explorer with connections to **azalertsprodweu** cluster (azalertsprodweu.westeurope.kusto.windows.net)
- See "How to add Kusto clusters needed by Azure Monitor to Kusto Explorer"

## Information Needed

- Resource ID of the Alert rule
- Smart alert rule type (see applicable detector types below)
- Application Insights application ID (from ASC under microsoft.insights/components)
- Alert ID and timestamp in UTC

## Applicable Smart Alert Rule Types

| Alert Rule Name | Internal Detector Name |
|---|---|
| Response latency degradation | RequestPerformanceDegradationDetector |
| Dependency latency degradation | DependencyPerformanceDegradationDetector |
| Exception anomalies | ExceptionVolumeChangedDetector |
| Trace severity degradation | TraceSeverityDetector |
| Potential memory leak | MemoryLeakDetector |

## Troubleshooting Steps

### Step 1: Check the alert rule detector run logs

Query the **DeepInsights** database on azalertsprodweu cluster:

```kql
traces 
| where timestamp > ago(4d) 
| where customDimensions.SmartDetectorId == "DETECTORIDGOESHERE" 
| where customDimensions.["AppId"] == "APPLICATIONIDGOESHERE" 
| order by timestamp desc 
| summarize max(timestamp) by operation_ParentId 
| order by max_timestamp
```

### Step 2: Investigate a specific run

Use the operation_ParentId from Step 1 matching the timestamp:

```kql
traces 
| where timestamp > ago(21d) 
| where operation_ParentId == "OPERATIONIDGOESHERE" 
| order by timestamp desc
```

### Step 3: Analyze results

Look for lines indicating an alert should have fired:
- "Detector returned 1 alerts"
- "Total Alerts Sent = 1"

### Step 4: Check smart alerts engine for the alert record

Query the **SmartAlerts** database:

```kql
customMetrics 
| where env_time between (datetime("START_DATE") .. datetime("END_DATE")) 
| where name == "Alert latency in seconds" 
| where customDimensions['AlertRuleResourceId'] =~ "ALERTRULEIDGOESHERE" 
| project env_time, operation_Name, name, customDimensions
```

### Step 5: Check if the alert reached Alerts Management Platform (AMP)

Query the **AzureAlertsManagement** database:

```kql
let startTime = datetime(START_TIME); 
let endTime = datetime(END_TIME); 
let alertRule = "ALERTRULEIDGOESHERE"; 
Events
| where timestamp between (startTime..endTime)
| where tostring(customDimensions.AlertRuleId) =~ alertRule
| extend tostring(customDimensions.CorrelationId)
| where name startswith "ASC."
| summarize any(customDimensions) by name
```

Look for PostAzNSRequest action → the number in parenthesis of AznsResponseLocationHeader is the notification ID.

### Step 6: Review metric charts (optional)

Chart the App Insights component metric data in ASC using relevant metrics:

| Alert Rule | Namespace | Metric | Aggregation |
|---|---|---|---|
| Response latency degradation | microsoft.insights/components | requests/duration | Average |
| Dependency latency degradation | microsoft.insights/components | dependencies/duration | Average |
| Exception anomalies | microsoft.insights/components | exceptions/count | Count |
| Trace severity degradation | microsoft.insights/components | traces/count | Count |
| Potential memory leak | microsoft.insights/components | performanceCounters/processPrivateBytes | Average |
