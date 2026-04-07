---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to get Action Group change events from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAction%20Groups%20and%20Notifications%2FHow%20to%20get%20Action%20Group%20change%20events%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Action Group Change Events from Kusto

## Prerequisites

- Kusto Explorer installed with connection to **Azureinsights** cluster
- Select the **Insights** database

## KQL Query

```kql
let subId = "SUBSCRIPTIONIDGOESHERE";
let StartTime = todatetime(ago(7d));
let EndTime = todatetime(now());
EventData
| where TIMESTAMP between (StartTime..EndTime)
| where subscriptionId == subId
| where operationName =~ "microsoft.insights/actionGroups/write"
| sort by eventTimestamp desc
| parse resourceId with * "actionGroups/" actionGroupName
| project eventTimestamp, status, subStatus, operationName, resourceGroupName, actionGroupName, resourceId
```

## Result Fields

| Property | Description |
|----------|-------------|
| eventTimeStamp | Date/time of the event |
| status | Operation result (Succeeded/Failed) |
| subStatus | Often HTTP result code |
| operationName | ARM operation performed |
| resourceGroupName | Resource group of the target |
| actionGroupName | Name of the action group |
| resourceId | ARM resource ID |

## Usage Notes

- Adjust `StartTime` and `EndTime` for desired time range
- Replace subscription ID with customer's subscription
- Useful for investigating when action group was created or modified
