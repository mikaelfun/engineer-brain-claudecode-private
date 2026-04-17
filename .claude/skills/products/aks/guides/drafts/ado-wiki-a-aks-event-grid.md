---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/AKS Event Grid"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Event%20Grid"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Introduction

AKS provides useful events for their customers relating to their ManagedClusters. Currently, we notify on the following events:

- NewKubernetesVersionAvailable
- ClusterSupportEnded
- ClusterSupportToBeEnded
- NodePoolRollingStarted
- NodePoolRollingCompleted
- NodePoolRollingFailed

The Azure documentation for the specifics of each event can be found [here](https://learn.microsoft.com/en-us/azure/event-grid/event-schema-aks?tabs=event-grid-event-schema).

# Expected Frequency of Events

### NewKubernetesVersionAvailable, ClusterSupportEnded, ClusterSupportToBeEnded

These events are triggered upon rp-async pod restart and deduplicated by Service Bus in a 7-day window. This means that we expect at most one event to be published per cluster per 7-day window. If rp-async pods do not restart (perhaps during CCOA), these events will not trigger.

### NodePoolRollingStarted, NodePoolRollingCompleted, NodePoolRollingFailed

These events are triggered during rolling of nodes. We expect one event to be published per operation per node pool. For example, if a two node pool cluster undergoes an upgrade successfully. We would expect 4 total messages: 2 NodePoolRollingStarted and 2 NodePoolRollingCompleted.

# Event Path / Architecture

Please refer to [these diagrams](https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/509604/Event-Path-for-Event-Grid-Integrations) as reference for the eventing flow

# Alerting

### Agentpool rolling publish (for AKS Event Grid) failure rate > 10% in ${REGION}

This alert is independent of the QoS of Agentpool Upgrade / Put operations. I.e. QoS could be doing poorly without the alert firing and vice versa. If the alert is firing, it is likely related to issues in the interaction between rp-async and service bus.
<https://aks.kusto.windows.net/AKSProd>

```
cluster("Aks").database("AKSprod").AsyncContextActivity
| where TIMESTAMP > ago(1h)
| where msg startswith_cs "Failed to publish agent pool rolling"
| where msg contains "{VMSS_URI}"
```

# TSG for Potential IcMs

Errors occurring during the subscription of the events via Azure Event Grid (via portal, cli, etc) are supported by Azure Event Grid and we have little visibility. Such tickets should not be handled by AKS.

The Kusto tables for all below queries can be found at <https://aks.kusto.windows.net/AKSProd>.

1) Make sure clusters are appropriately subscribed to AKS Events. (Out of scope for AKS)

2) Check if our Event Grid Handler successfully published event. If it has and customer has still not received event, transfer incident to `Event Grid DRI`.

```
Eventgrid
| where TIMESTAMP > ago(1h)
| where msg startswith "publish $EVENT_NAME"
| where msg contains "/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.Compute/ManagedCluster/$MC_NAME"
```

3) Check if Event Grid Listener has received and processed event successfully.

```
Eventgrid
| where TIMESTAMP > ago(1h)
| where msg contains "processing $EVENT_NAME for $MCNAME:"
```

4) Check if source message (that is supposed to be sent to AKS Event Grid) was sent. The former query is for NodePoolRolling while the latter for ClusterSupport.

```
cluster("Aks").database("AKSprod").AsyncContextActivity
| where TIMESTAMP > ago(1h)
| where msg startswith_cs "Failed to publish agent pool rolling"
| where msg contains "{VMSS_URI}"
```

```
RegionalLooperEvents
| where TIMESTAMP > ago(1h)
| where msg startswith_cs "publishing outofsupport event"
| where msg contains $MCNAME
```

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
