---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Managed Prometheus"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20Prometheus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Managed Prometheus Overview

Managed Prometheus **is primarily owned by the Monitoring team**. We are responsible for the addon installing correctly, and the control plane metrics being emitted (if enabled) as that is done on the CCP.

## Support boundary for Managed Prometheus

|**Scenario**|  **Ownership**  |
|--|--|
| Installation of Managed Prometheus addon and pods | AKS |
| Control Plane Metrics is not emitted even when Managed Prometheus is configured correctly | AKS |
| Issues related to Managed Prometheus Configuration | Managed Prometheus\Issues related to collecting data from your AKS clusters and other supported systems |
| Other questions on Managed Prometheus, Alerts, Graphana, Dashboards. etc | Managed Prometheus\<topic> |

## Control Plane Metrics

Customers can also enable control plane metrics in preview. This will allow customers to track metrics from the control plane (CCP) for the first time.

## Troubleshooting

### Suggested Troubleshooting workflow

First check if `ama-metrics-ccp` pod is running and steady in controlplane.

- If Pod steady without restarts: Check logs for prom-collector and configmap-watcher containers.
  - If pod steady and container logs indicate correct functioning, escalate to PG.
- If Pod not present: Check how OverlayMgr evaluates CCP Plugin enablement for cluster.
  - If feature logged not enabled, confirm it is enabled for subscription
  - If addon logged as not enabled or missing overlaymgr entries, confirm cluster has addon enabled
  - If addon and feature enabled, consider checking toggle values.
- If Pod present but restarting / otherwise unstable:
  - Check pod events.
  - Check ControlPlane status on underlay.
  - Check container logs for errors.

### Check how OverlayMgr evaluates CCP Plugin enablement

```kql
let clusterId = "{Cluster_ID}";
let toggle_parameter = 'azure-monitor-metrics-ccp';
cluster('Aks').database('AKSprod').OverlaymgrEvents
| where PreciseTimeStamp > ago(7d)
| where route == strcat("/v1/overlays/", clusterId ,"/reconcile")
| where method != "GET"
| where msg has (toggle_parameter)
| extend TimeStamp = todatetime(logPreciseTime)
| project TimeStamp, method, message = msg, level
```

### Check Preview Feature is enabled for the Subscription

```kql
let _startTime = datetime(2023-12-16T21:41:27Z);
let _endTime = datetime(2023-12-20T21:41:27Z);
let _subscription = "{Sub_ID}";
cluster('akshuba.centralus').database('AKSprod').ControlPlaneWrapperSnapshot
| where PreciseTimeStamp between (['_startTime'] .. ['_endTime'])
| where subscriptionID == "{Sub_ID}"
| where featureProfile.subscriptionRegisteredFeatures contains "AzureMonitorMetricsControlPlanePreview"
| take 1
```

### Check events related to feature flag enablement and toggle values

```kql
let clusterId = "{Cluster_ID}";
let toggle_parameter = dynamic(['azure-monitor-metrics-ccp', 'ama-metrics-ccp']);
cluster('Aks').database('AKSprod').OverlaymgrEvents
| where id == clusterId 
| where PreciseTimeStamp > ago(1h)
| where method != "GET"
| where msg has_any (toggle_parameter)
| extend TimeStamp = todatetime(logPreciseTime)
| project TimeStamp, method, message = msg, route, level
| top 2500 by TimeStamp desc
```

### Check pod events

```kql
let clusterId = "{Cluster_ID}";
cluster('Aks').database('AKSprod').OverlaymgrEvents
| where id == "{cluster_id}"
| where PreciseTimeStamp > ago(2h)
| where method != "GET"
| extend Pod = eventObjectName
| where Pod startswith "ama-metrics-ccp"
| extend TimeStamp = todatetime(logPreciseTime)
| project TimeStamp, Pod, message = eventMessage, level
| top 2500 by TimeStamp desc
```

This can also be found in ASI: `MC page -> Overlay -> CCP Events`

### Check ControlPlane status on underlay - Deployment status

```kql
let queryFrom = datetime("2023-12-20T19:37:09.192Z");
let queryTo = datetime("2023-12-20T20:37:05.705Z");
let queryUnderlay = "{Underlay_Name}";
let queryNamespace = "{ccpNamespace}";
UnderlayAuditLogs
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where isempty(queryUnderlay) or UnderlayName has queryUnderlay
| where level == "RequestResponse" and stage == "ResponseComplete"
| extend objectRef = parse_json(objectRef)
| where objectRef.resource == "deployments"
| where objectRef.namespace == tostring(queryNamespace)
| where objectRef.subresource == "status"
| extend requestObject = parse_json(requestObject)
| where requestObject.metadata.name == "ama-metrics-ccp"
| extend replicas = requestObject.spec.replicas
| extend readyReplicas = iff((isempty(requestObject.status.readyReplicas)), 0, requestObject.status.readyReplicas)
| mv-expand deploymentConditions = requestObject.status.conditions
| where toupper(deploymentConditions.type) == "AVAILABLE"
| extend IsReady = tostring(deploymentConditions.status)
| extend reason = tostring(deploymentConditions.reason)
| project StartTime = PreciseTimeStamp, ready=strcat(readyReplicas, "/", replicas), reason, IsReady
| sort by StartTime asc
```
