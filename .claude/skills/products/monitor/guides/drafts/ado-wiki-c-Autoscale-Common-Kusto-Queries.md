---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/Troubleshooting Guides/Common Kusto queries to identify auto scale issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/Troubleshooting%20Guides/Common%20Kusto%20queries%20to%20identify%20auto%20scale%20issue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Before You Begin
---
To query for Activity Log events for a given Azure subscription, you will need to ensure you have installed Kusto Explorer and added a connection for the **Azureinsights** Kusto cluster, or make sure your account has granted necessary permission to the cluster.
[cluster('azureinsights.kusto.windows.net').database('Insights')](https://dataexplorer.azure.com/clusters/azureinsights/databases/Insights)

# Queries
---
<b>List Autoscale completed actions for one resource</b>

This query returns any submitted scale actions (increase/decrease) from the resource Id of the <u>target resource</u>.
Supply the resource Id of the target resource, not the Microsoft.Insights/AutoscaleSetting resource Id.

```
ScaleAction
| where subscriptionId == "xxxxxxxxxxxxxxxxxxxx" // subscriptions ID
| where resourceId == "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // target resource ID
| project TIMESTAMP, PreciseTimeStamp,ActivityId, TaskName,Tenant, resourceId, direction, previousCapacity, newCapacity, reason
```
![image.png](/.attachments/image-d8bfbaf6-72e0-4dff-8818-31c3509a2136.png)
<br/><br/>


<b>List Autoscale completed operation details</b>

Only job being completed then record will be written into table ***ScaleAction***.
This query will return one specific resource auto scale submitted completed job details. distinct ***ActivityId*** from table ***ScaleAction*** and then query ***ActivityId*** in the ***JobTraces*** table, which helps us to understand the resource auto scale reason.
Supply the resource Id of the target resource and subscriptions ID.

```
JobTraces
| where ActivityId in (
ScaleAction
| where subscriptionId == "xxxxxxxxxxxxxxxxxxxx" // subscriptions ID
| where resourceId == "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // target resource ID
|distinct ActivityId)
| sort by PreciseTimeStamp asc
| project PreciseTimeStamp, Level,Tenant, operationName, message
```
![image.png](/.attachments/image-87d60c6c-886c-41d6-8793-9ef24dde5e6d.png)
<br/><br/>


<b>List all Autoscale operation details</b>

If no record return in the table ***ScaleAction*** or ***No Scale action were taken*** in the table ***JobHeartbeat*** then use this query to get more logs.
The following query result could help us to know what reason caused auto scale service didn't scale resource on demand.
Supply the ***subscriptions ID*** and try to modify ***timestamp*** to locate a specific time.

```
JobTraces
| where ActivityId in (
JobTraces
| where TIMESTAMP > ago (5m)
| where message contains "xxxxxxxxxxxxxxxxxxxxxx" // subscriptions ID
| distinct ActivityId
)
| sort by PreciseTimeStamp asc | project PreciseTimeStamp, Level,Tenant, operationName, message
```
![image.png](/.attachments/image-8b9db563-1039-4d62-a5d0-6a623f66c22e.png)
![image.png](/.attachments/image-50431cdc-c99c-430e-a0ee-025b2c9ead9c.png)
<br/><br/>


<b>List auto scale profile history</b>

This query is used to query auto scale profile history, we could track down auto scale profile changes.
Supply the resource Id of the target resource and subscriptions ID, modify the ***TIMESTAMP*** to locate a specific time.

```
JobTraces
| where ActivityId in (
JobTraces
| where TIMESTAMP > ago (5m)
| where message contains "xxxxxxxxxxxxxxxxxx" // subscriptions ID
| where message contains "xxxxxxxxxxxxxxxxxxxxxxxxx" // target resource ID
| distinct ActivityId)
| where operationName == "GetAutoscaleProfile"
| project TIMESTAMP, PreciseTimeStamp, operationName, message
```
![image.png](/.attachments/image-42d1c4bc-f279-4265-b6a6-957a7e77e3bd.png)
<br/><br/>


<b>List Autoscale profile scaling result for one resource</b>

This query result, which helps us to investigate whether the resource being scaled out or not, will give some insights to you about the auto scale history.
If you saw ***No Scale action were taken*** means this resource was ***NOT*** auto scale due to some reason.
Supply the resource Id of the ***Microsoft.Insights/AutoscaleSetting***.

```
JobHeartbeat
| where resourceId == "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // Microsoft.Insights/AutoscaleSetting resource ID
| project TIMESTAMP, resourceId, resultSignature
```
![image.png](/.attachments/image-f10d03ad-220f-441f-81f4-f7b386bf5981.png)
<br/><br/>


<b>List metric value</b>

Regarding metric-based auto scale, auto scale will trigger a call to ***MDM*** to get value of the target resource.
We use this query to identify the value from ***MDM***. Supply the resource Id of the target resource and subscription Id.

```
MetricEvaluation
| where ActivityId in (
JobTraces
| where ActivityId in (
ScaleAction
| where subscriptionId == "xxxxxxxxxxxxxxxxxxxx" // subscriptions ID
| where resourceId == "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // target resource ID
|distinct ActivityId)
| where operationName contains "metrics"
| distinct ActivityId)
| project PreciseTimeStamp, operationName, operationSucceeded,metricNamespace, metricName, metricValue, Tenant
```
![image.png](/.attachments/image-6bb3b959-d47c-4054-98c8-8974229163bb.png)
<br/><br/>


<b>List metric and auto scale profile</b>
This query is used to identify metric value and auto scale profile details, within this query which helps us to understand metric-based auto scale reason.
Supply the resource Id of the target resource and subscription Id, try to add timestamp to locate a specific time.

```
JobTraces
| where ActivityId in (
ScaleAction
| where subscriptionId == "xxxxxxxxxxxxxxxxxxxx" // subscriptions ID
| where resourceId == "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // target resource ID
|distinct ActivityId)
| sort by PreciseTimeStamp asc
| where operationName in ('GetMdmMetricsRawData','GetMdmMetrics', 'GetAutoscaleProfile')
| project PreciseTimeStamp, operationName, message
```
![image.png](/.attachments/image-41ff2b91-e690-434f-9666-c1f98b7a86e4.png)
<br/><br/>


<b>List auto scale triggers ARM call</b>
This query is used to check auto scale activity to ARM, you should look at ***httpVerb*** and ***statusCode*** to understand result.
If the return statusCode is not ***200*** then something happens in the ARM level, try to check ARM activity log for further investigation.
Supply the resource Id of the target resource, try to add timestamp to locate a specific time.

```
Requests
| where PreciseTimeStamp > ago(1h)
| where targetUri contains "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // target resource ID
| project TIMESTAMP, PreciseTimeStamp,subscriptionId, Role, httpVerb,statusCode, operationName, targetUri
```
![image.png](/.attachments/image-12d271b5-0b48-4a66-85cb-57aafdfddd4e.png)
<br/><br/>


<b>List incoming call to autoscale</b>
This query is used to identify client-side issues for create/change/delete Autoscale.
Supply the resource name and subscription Id, try to add timestamp to locate a specific time.

```
SvcIncomingRequests
| where * contains "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // subscriptions ID
| where operationName contains "autoscalesettings"
| where * contains "xxxxxxxxxxxxxxxxxxxxxxxx" // Autoscale resource name
| where operationName != "GET /AUTOSCALESETTINGS/*"
| project PreciseTimeStamp, httpVerb, operationName,statusCode,subscriptionId, requestUri
```
![image.png](/.attachments/image-d930cb9e-6af2-4cbd-8d61-64feb657947c.png)
<br/><br/>