---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Metric Alerts/How to query metric alert state change history from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FMetric%20Alerts%2FHow%20to%20query%20metric%20alert%20state%20change%20history%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to query metric alert state change history from Kusto

> ASC execution history tab shows state changes (up to 7 days). For older data, use this Kusto approach.

## Prerequisites

- Cluster: **icmbrain.kusto.windows.net** / Database: **AzureResourceHealth**
- Alert rule full ARM ID

## Kusto Query

```kql
let alertRuleId = "ALERTRULEIDGOESHERE";
let StartDate = ago(60d);
let EndDate = now();
let windowAroundAlert = 3h;
let toEpochString = (t: datetime) { tostring(tolong((t-datetime(1970-01-01))/1ms)) };
let generateDatasourceOverride = (key:string, replacement:string) { strcat('{"query":"//dataSources","key":"', key,'","replacement":"', replacement ,'"},') };
let generateDimensionOverride = (dims:dynamic, dimName:string) { strcat('{"query":"//*[id=', "'", dimName, "'", ']","key":"value","replacement":"', dims[dimName] ,'"}') };
cluster('icmbrain.kusto.windows.net').database('AzureResourceHealth').ResourceHealthAlertCorrelationEvent
| where env_time between (StartDate .. EndDate)
| extend replaced = replace_string(alertRuleId,"metricAlerts","metricalerts")
| extend AlertRuleResourceId_parsed = split(replaced,"metricalerts/")
| mv-expand AlertRuleResourceId_parsed[1]
| extend AlertRuleResourceId_tostring = tostring(AlertRuleResourceId_parsed[1])
| extend AlertRuleEnocoded = url_encode_component(AlertRuleResourceId_tostring)
| extend ReplaceDash = replace_string(AlertRuleEnocoded,"%2d","-")
| extend ReplaceUnderscore = replace_string(ReplaceDash,"%5f","_")
| extend ReplaceComma = replace_string(ReplaceUnderscore,"%2c",",")
| extend FinalRuleId = strcat(AlertRuleResourceId_parsed[0],"metricalerts/",ReplaceComma)
| where alertInstanceId contains alertRuleId or alertInstanceId contains "FinalRuleId"
| extend dimensions = todynamic(dimensions), monitorMetadata = todynamic(monitorMetadata)
| project env_time, alertState, startedTime, dimensions, env_cloud_environment, env_cloud_location,
    account = tenant, namespace = tostring(monitorMetadata.["Monitor.Component"]),
    metricName = tostring(monitorMetadata.["Monitor.Event"]), monitorName, monitorMetadata,
    alertName, alertInstanceId, subscriptionId, alertNotificationStartTime, alertNotificationEndTime, incidentCorrelationId
| parse monitorMetadata.["Monitor.MetricData"] with * "[TemplateData] [" samplingType "]" *
| extend samplingType = iff(isempty(samplingType), "Count", samplingType)
```

## Key Result Fields

| Field | Description |
|-------|-------------|
| alertState | Alert state: Active / Resolved |
| startedTime | Timestamp of state change |
| mdmLink | Auto-generated Jarvis link for metric visualization |
