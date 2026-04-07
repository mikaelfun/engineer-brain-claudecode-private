---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] ACI billing related issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20billing%20related%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG ACI billing related issues

## Problem

The customer states their container instance is still running after stop or deletion. Billing on ACI is pretty simple. So, most of the time if a customer is complaining about billing, the root of the issue is something else (example: leaked deployment).

Billing starts when we start a deployment successfully and stops when the deployment is stopped. There is a job that runs and gathers up all the deployments from the deployment index (SubscriptionDeploymentIndex) and reports their usage.

## Mitigation

Use the queries below to answer these questions.

1. Verify the customer did in fact stop the resource.
2. Verify the customer resource is being billed.
3. Have the customer create a new container instance with the same resourceId in the same region to force cleanup in the ACI backend. This resource can be deleted immediately after creation.
4. If the customer wants a refund, take the billing table data for the time period after the stop and copy the total core and memory charges into the incident. Ask the CSS engineer to reach out to the Commerce team to refund the customer.

## Investigation

First you want to make sure that the emitted billing meters makes sense for the deployments that happened, the way to do this is to look at the start/stopped events for the cluster and correlate the difference in time to the amount billed for that cluster. Keep in mind that the cpu/mem values will be proportional to the hours. If you see 1 CpuCoreHours reported for a CG that uses 2 cpu cores, then that means it ran for a half hour.

Then you can summarize the billing data per cluster and get the totals to check against the calculated time diff for the deployment start/stop (again scaled by the requested cpu/mem).

Another sanity check is to make sure there are not multiple clusters emitting billing data, if you see this then there is likely a leaked subscription deployment.

### KQL: Billing meters with deployment events

```kql
// Gets the billing meters along with the subscription deployment events to help correlate deployment start/end and the corresponding meters
let desiredSubscriptionId = "";
let desiredResourceGroup = "";
let desiredContainerGroup = "";
let desiredResourceId = "";
let startTime = ago(1d);
let endTime = now();
union cluster('accprod').database('accprod').SubscriptionDeployments, cluster('accprod').database('accprod').BillingUsageEvents
| where TIMESTAMP >= startTime
| where TIMESTAMP <= endTime
| where TaskName == "SubscriptionDeploymentNodeAssigned" or TaskName == "SubscriptionDeploymentSucceeded" or TaskName == "SubscriptionDeploymentStopped" or TaskName == "BillingUsageDuration"
| where iff( desiredSubscriptionId == "", "True" , tostring(subscriptionId == desiredSubscriptionId)) == "True"
| where (iff( desiredResourceGroup == "", "True" , tostring(resourceGroup == desiredResourceGroup)) == "True") or (iff( desiredResourceGroup == "", "True", tostring(resourceUri contains desiredResourceGroup)) == "True")
| where (iff( desiredContainerGroup == "", "True" , tostring(containerGroup == desiredContainerGroup)) == "True") or (iff( desiredContainerGroup == "", "True", tostring(resourceUri contains desiredContainerGroup)) == "True")
| where (iff( desiredResourceId == "", "True" , tostring(resourceUri == desiredResourceId)) == "True") or (iff( desiredResourceId == "", "True" , tostring(strcat("/subscriptions/", subscriptionId,"/resourceGroups/", resourceGroup, "/providers/Microsoft.ContainerInstance/containerGroups/", containerGroup) == desiredResourceId)) == "True")
| extend meterType=case(meterType == "CoreSecond", "CpuCoreHours", meterType == "GbSecond", "GbHours", "")
| project TIMESTAMP, TaskName, quantity, meterType, clusterId, subscriptionId, resourceGroup, containerGroup, cpu, ['memory'], features
| order by clusterId asc, TIMESTAMP asc
```

### KQL: Billing totals by resource and cluster

```kql
// Gets the total count for the meters in the requested timeframe summarized by resourceId and clusterId
let desiredSubscriptionId = "";
let desiredResourceGroup = "";
let desiredContainerGroup = "";
let desiredResourceId = "";
let startTime = ago(1d);
let endTime = now();
cluster('accprod').database('accprod').BillingUsageEvents
| where TIMESTAMP >= startTime
| where TIMESTAMP <= endTime
| where TaskName == "BillingUsageDuration"
| where iff( desiredSubscriptionId == "", "True" , tostring(subscriptionId == desiredSubscriptionId)) == "True"
| where iff( desiredResourceGroup == "", "True", tostring(resourceUri contains desiredResourceGroup)) == "True"
| where iff( desiredContainerGroup == "", "True", tostring(resourceUri contains desiredContainerGroup)) == "True"
| where iff( desiredResourceId == "", "True" , tostring(resourceUri == desiredResourceId)) == "True"
| extend meterType=case(meterType == "CoreSecond", "CpuCoreHours", meterType == "GbSecond", "GbHours", "")
| summarize total=sum(quantity) by resourceId=resourceUri, clusterId, meterType
```

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**
- Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
