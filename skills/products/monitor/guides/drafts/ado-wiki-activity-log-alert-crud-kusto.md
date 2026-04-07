---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to get Activity Log Alert rule create, update and delete events from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20get%20Activity%20Log%20Alert%20rule%20create%2C%20update%20and%20delete%20events%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get Activity Log Alert rule create, update and delete events from Kusto

## Prerequisites

- Kusto Explorer installed with connection to **Armprod** Kusto cluster
- See: [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How-To/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer)

## Step 1: Query ARM for CRUD events

Cluster: **Armprodgbl** / Database: **ARMProd**

```kql
let subId = "SUBSCRIPTIONIDGOESHERE";
let StartTime = todatetime(ago(7d));
let EndTime = todatetime(now());
Unionizer("Requests", "HttpIncomingRequests") 
| where TIMESTAMP between (StartTime..EndTime)
| where subscriptionId =~ subId
| where httpMethod in ("PUT","PATCH","DELETE")
| where operationName contains "/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.INSIGHTS/ACTIVITYLOGALERTS/"
| sort by TIMESTAMP desc
| project-reorder TIMESTAMP, TaskName, ActivityId, correlationId, principalOid, operationName, httpStatusCode, errorCode, errorMessage, failureCause, exceptionMessage, targetUri
```

### Key Properties

| Property | Description |
|----------|-------------|
| TIMESTAMP | Date/time when request was processed |
| ActivityId | Unique identifier (same as correlationId for this query) |
| correlationId | Unique identifier (same as ActivityId) |
| httpStatusCode | HTTP status code (-1 for start of request) |
| exceptionMessage | Error details if an error occurred |
| targetUri | ARM resource the operation was executed against |

## Step 2: Get detailed traces

Capture the **ActivityId** from Step 1, then query:

Cluster: **Azalertsprodweu** / Database: **Insights**

```kql
let actId = "ACTIVITYIDGOESHERE";
traces
| where ActivityId == actId
| project TIMESTAMP, Message, RuleLocation, SubscriptionId, OperationName, ResourceType, ApiVersion, TargetUri
```

## Related

- [How to find the details of an activity log that triggered an alert](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1074791)
- [Troubleshooting Activity Log Alerts](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/782981)
