---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Azure Resource Manager (ARM)/How to trace ARM requests to Azure Monitor resource providers in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FAzure%20Resource%20Manager%20(ARM)%2FHow%20to%20trace%20ARM%20requests%20to%20Azure%20Monitor%20resource%20providers%20in%20Kusto"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to trace ARM requests to Azure Monitor resource providers in Kusto

> Note: There may be a 15-30 minute delay for trace logging data to appear in Kusto.

## Before You Begin

You will need Kusto Explorer with a connection for the **Armprod** Kusto cluster. See [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

## Step 1: Get ARM request details

Connect to the **armprod** database and run:

```kusto
let subId = "AZURESUBSCRIPTIONIDGOESHERE";
let resourceProviders = dynamic(["Microsoft.Insights", "Microsoft.OperationalInsights", "Microsoft.OperationsManagement", "Microsoft.AlertsManagement", "Microsoft.WorkloadMonitor", "Microsoft.ResourceHealth"]);
let startTime = todatetime(ago(1d));
let endTime = todatetime(now());
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests", "HttpIncomingRequests")
| where PreciseTimeStamp between (startTime .. endTime)
| where subscriptionId =~ subId
| where targetResourceProvider in~ (resourceProviders)
| project PreciseTimeStamp, correlationId, TaskName, operationName, apiVersion, httpMethod, httpStatusCode, targetUri, targetResourceProvider, targetResourceType, userAgent
| sort by PreciseTimeStamp asc
```

### Result fields

| Property | Description |
|:---------|:------------|
| PreciseTimeStamp | Date and time in UTC |
| correlationId | ARM correlationId for tracking related events |
| TaskName | ARM task name |
| operationName | ARM operation being performed |
| apiVersion | REST API version used |
| httpMethod | GET, PUT, PATCH, POST, or DELETE |
| httpStatusCode | HTTP response code returned by ARM |
| targetUri | URI of the request submitted to ARM |
| targetResourceProvider | Azure resource provider targeted |
| targetResourceType | Type of Azure resource targeted |
| userAgent | Client identifier string |

### Additional filters

| Detail | Additional Filter |
|:-------|:------------------|
| Resource Provider | `\| where targetResourceProvider contains "Microsoft.Insights"` |
| Resource Type | `\| where targetResourceType contains "metrics"` |
| Azure Resource | `\| where targetUri contains "MyAzureResource"` |
| HTTP Method | `\| where httpMethod =~ "DELETE"` or `\| where httpMethod in~ ("PUT","PATCH")` |
| HTTP Status Code | `\| where httpStatusCode >= 400` |
| Operation Name | `\| where operationName contains "metrics"` |

## Step 2: Trace the outgoing request to the resource provider

Once you have the **correlationId**, use the `HttpOutgoingRequests` query to see what ARM sent to the backend resource provider and what response it received.

> The correlationId from ARM requests is the same as the correlationId used in activity logs. See [How to get details of an Activity Log event from Azure Support Center](/Monitoring-Essentials/Activity-Logs/How%2DTo/How-to-get-details-of-an-Activity-Log-event-from-Azure-Support-Center).
