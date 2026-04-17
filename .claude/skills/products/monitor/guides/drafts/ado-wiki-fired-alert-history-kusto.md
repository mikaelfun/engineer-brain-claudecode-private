---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/All Alerts/How to get history of fired alerts from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAll%20Alerts%2FHow%20to%20get%20history%20of%20fired%20alerts%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get History of Fired Alerts from Kusto

## Prerequisites
- Access to cluster `azalertsprodweu.westeurope`, database `AzureAlertsManagement`
- Alert rule ARM resource ID (obtain from ASC Resource Explorer)

## Metric Alerts

```kql
let AlertRuleID = "ALERTRULEIDGOESHERE";
let starttime = datetime(2021-11-03 00:00);
let endtime = datetime(2021-11-05 00:00);
cluster('azalertsprodweu.westeurope').database('AzureAlertsManagement').
traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) =~ AlertRuleID
| where operation_Name == "POST alerts/createorupdate"
| summarize arg_max(env_time,*) by operation_ParentId
| project operation_ParentId, env_time, customDimensions.FiredTimestamp, tostring(customDimensions.MonitorCondition), tostring(customDimensions.AlertInstanceId)
```

## Activity Log Alerts

```kql
let AlertRuleID = "ALERTRULEIDGOESHERE";
let starttime = datetime(2023-04-05 00:00);
let endtime = datetime(2023-05-06 00:00);
cluster('azalertsprodweu.westeurope').database('AzureAlertsManagement').
traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) contains AlertRuleID
// Change 'contains' to '=~' if there are multiple alerts with similar names in the same resource group
| where tostring(customDimensions.MonitorCondition) == "Fired"
| summarize arg_max(env_time,*) by operation_ParentId
| project operation_ParentId, env_time, tostring(customDimensions.MonitorService), tostring(customDimensions.AlertInstanceId)
```

## Log Search Alerts

```kql
let AlertRuleID = "ALERTRULEIDGOESHERE";
let starttime = datetime(2023-04-05 00:00);
let endtime = datetime(2023-05-06 00:00);
cluster('azalertsprodweu.westeurope').database('AzureAlertsManagement').
traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) contains AlertRuleID
// Change 'contains' to '=~' if there are multiple alerts with similar names in the same resource group
| where tostring(customDimensions.MonitorCondition) in("Fired","Resolved")
| summarize arg_max(env_time,*) by operation_ParentId
| project operation_ParentId, env_time, customDimensions.FiredTimestamp, tostring(customDimensions.MonitorCondition), tostring(customDimensions.AlertInstanceId)
```

## Get Full Trace for an Alert (by Operation ID)

```kql
let starttime = datetime(2021-11-04 00:00);
let endtime = datetime(2021-11-05 14:00);
cluster('azalertsprodweu.westeurope').database('AzureAlertsManagement').
traces
| where env_time between (starttime..endtime)
| where operation_ParentId == "OPERATIONIDGOESHERE"
| project env_time, message, customDimensions
```

## Get Notification Flow Only

```kql
let starttime = datetime(2021-11-04 00:00);
let endtime = datetime(2021-11-05 14:00);
cluster('azalertsprodweu.westeurope').database('AzureAlertsManagement').
traces
| where env_time between (starttime..endtime)
| where operation_ParentId == "OPERATIONIDGOESHERE"
| where cloud_RoleName == "Microsoft.AlertsMgmt.Notification"
| project env_time, message, customDimensions
```
