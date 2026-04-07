---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/AKS Communication Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Communication%20Manager"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS Communication Manager

## Feature Enablement

This feature is enabled for all clusters by default. The notifications are sent to Azure Resource Graph (ARG) and can be queried. To receive notifications through email, cx needs to set up system topic subscription.

## [Customer and Support Engineer] Sample Azure Resource Graph (ARG) query for notifications of a cx cluster

1. Go to the portal ARG query blade:
<https://ms.portal.azure.com/#view/HubsExtension/ArgQueryBlade>

2. Query the containerserviceeventresources table:

```
containerserviceeventresources
| where type == "microsoft.containerservice/managedclusters/scheduledevents"
| where id contains "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername"
```

## [Support Engineer Only] In Depth Debug of Issues

### If no notification is received in ARG

The notification follows the following travelling path:

**Auto upgrader -> Event grid domain (deployed by AKS team) -> ARN service -> ARG service**

1. From Auto upgrader -> Event grid domain (deployed by AKS team)

Check logs for debug issues. If an issue is suspected when publishing message for a cx cluster, use the following query with a cx cluster resource id to check error details:

```
AutoUpgraderEvents
| where msg contains "Failed to publish event" and msg contains "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername"
```

A sample error message looks like:

"Failed to publish event when transitioning /subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername to terminal state with error: reason xyz."

2. From Event grid domain (deployed by AKS team) -> ARN service -> ARG service

If something goes wrong in these two steps. Engineer should involve ARN team to debug. Record the resource name "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername" and the time a message is supposed to be sent and pass the information to the ARN team so they can search on their end for lost messages.

The ARN team alias in IcM is: azure resource notifications -> triage team

### If notification is received in ARG, but the subscriber to the system topic does not receive any notification

Engineer should also involve ARN team to debug. Record the resource name "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername" and the time a message is supposed to be sent and pass the information to the ARN team so they can search on their end for lost messages.

The ARN team alias in IcM is: azure resource notifications -> triage team

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

