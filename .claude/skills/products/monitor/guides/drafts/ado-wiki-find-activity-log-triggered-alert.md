---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to find the details of an activity log that triggered an alert"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20find%20the%20details%20of%20an%20activity%20log%20that%20triggered%20an%20alert"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to find the details of an activity log that triggered an alert

## Before You Begin

You need Kusto Explorer with connections for **Armprod** and **azalertsprodweu** clusters.

## Step 1: Find the correlation ID of the Activity Log that triggered the alert

### Using Azure Support Center
From the Execution History tab, identify the correlation ID from the fired alert.

### Using Kusto
Query to identify the Event ID of the Activity Log that triggered the alert:

```kql
let AlertRuleID = "/subscriptions/{subId}/resourceGroups/{rg}/providers/microsoft.insights/activityLogAlerts/{alertName}";
let starttime = datetime(2023-07-16 14:00);
let endtime = datetime(2023-07-16 15:00);
cluster('azalertsprodweu.westeurope').database('AzureAlertsManagement').
traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) contains AlertRuleID
| where tostring(customDimensions.MonitorCondition) == "Fired"
| summarize arg_max(env_time,*) by operation_ParentId
| parse customDimensions['SourceAlertId'] with eventId '_' *
| project operation_ParentId, env_time, tostring(customDimensions.MonitorService), tostring(customDimensions.AlertInstanceId), eventId
```

Then use the event ID to get the correlation ID from ARMProd:

```kql
let subId = "{subId}";
let StartTime = datetime(2023-07-16 12:00);
let EndTime = datetime(2023-07-16 17:00);
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (StartTime..EndTime)
| where subscriptionId =~ subId
| where eventInstanceId =~ "{eventId}"
| project TIMESTAMP, subscriptionId, correlationId, eventTimestamp, status, subStatus
```

## Step 2: Use the correlation ID to see Activity Log details

Using the correlation ID from Step 1, find Activity Log details via:
- Azure Support Center
- Jarvis (Subscription-level)
