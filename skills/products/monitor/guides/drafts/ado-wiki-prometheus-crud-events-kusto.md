---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Prometheus alerts (public preview)/How to get Prometheus rule group create, update and delete events from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FPrometheus%20alerts%20(public%20preview)%2FHow%20to%20get%20Prometheus%20rule%20group%20create%2C%20update%20and%20delete%20events%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get Prometheus rule group create, update and delete events from Kusto

## Before You Begin

You need Kusto Explorer with connections to **Armprodgbl** and **Azalertsprodweu** clusters.

For details on adding Kusto clusters, see: [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How-To/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

## Step 1: Query ARM for CRUD Events

Cluster: **Armprodgbl** → Database: **ARMProd**

```kql
let subId = "SUBSCRIPTIONIDGOESHERE";
let StartTime = todatetime(ago(1d));
let EndTime = todatetime(now());
Unionizer("Requests", "HttpIncomingRequests")
| where TIMESTAMP between (StartTime..EndTime)
| where subscriptionId =~ subId
| where httpMethod in ("PUT","PATCH","DELETE")
| where operationName contains "/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.ALERTSMANAGEMENT/PROMETHEUSRULEGROUPS/"
| sort by TIMESTAMP desc
| project-reorder TIMESTAMP, TaskName, ActivityId, correlationId, principalOid, operationName, httpStatusCode, errorCode, errorMessage, failureCause, exceptionMessage, targetUri
```

### Key Properties

| Property | Description |
|----------|-------------|
| TIMESTAMP | Date/time when the request was processed |
| ActivityId | Unique identifier to correlate with other tables (same as correlationId) |
| correlationId | Unique identifier to correlate with other tables (same as ActivityId) |
| httpStatusCode | HTTP status code returned (-1 for start of request) |
| exceptionMessage | Error message if an error occurred |
| targetUri | ARM resource the operation was executed against |

## Step 2: Get Detailed Traces

Capture the **ActivityId** from Step 1, then query:

Cluster: **Azalertsprodweu** → Database: **Insights**

```kql
let actId = "ACTIVITYIDGOESHERE";
traces
| where ActivityId == actId
| project TIMESTAMP,Message,RuleLocation,SubscriptionId,OperationName,ResourceType,ApiVersion,TargetUri
```

### Output Details

- WARNING or ERROR levels are highlighted
- Request payload details in log line where **Message** starts with "Request payload"
- Failed operations show highlighted line starting with "**Operation PutAsync failed**"
