---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Cluster Autoscaler/Kusto_queries_Cluster_AutoScaler"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/Kusto_queries_Cluster_AutoScaler"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kusto Queries for AKS Cluster AutoScaler

## Overview

Useful Kusto queries for troubleshooting AKS Cluster Autoscaler (CAS).

## Key References

- CAS GitHub repo: https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler
- Azure-specific docs: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/azure/README.md
- FAQ: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md
- Retrieve CAS logs: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler#retrieve-cluster-autoscaler-logs-and-status

## Check Scale Up / Scale Down

CAS logs in CCP logs (retained ~2 weeks):

```kusto
union cluster('akshuba.centralus.kusto.windows.net').database('AKSccplogs').ControlPlaneEvents,
      cluster('akshuba.centralus.kusto.windows.net').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > datetime(2023-01-27 03:20:10) and PreciseTimeStamp < datetime(2023-01-27 10:25:30)
| where namespace == "{ccpNamespace}"
| where category contains "autoscaler"
| where properties contains "linuxpool"
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend Log = extractjson('$.log', properties, typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend verb = tostring(_jlog.verb)
| extend user = tostring(_jlog.user.username)
| extend replicas = _jlog.responseObject.status.replicas
| extend readyReplicas = _jlog.responseObject.status.readyReplicas
| extend unavailableReplicas = _jlog.responseObject.status.unavailableReplicas
| project PreciseTimeStamp, category, requestURI, verb, user, Log, replicas, readyReplicas, unavailableReplicas
```

### Filter for scale-up/scale-down events:
```
| where properties contains "plan" or properties contains "increase"
```

Scale-up example log:
```text
I0124 10:18:13.657890  1 scale_up.go:477] Best option to resize: akspool02
I0124 10:18:13.657927  1 scale_up.go:481] Estimated 1 nodes needed in akspool02
I0124 10:18:13.658006  1 scale_up.go:604] Final scale-up plan: [{akspool02 0->1 (max: 50)}]
```

No unschedulable pods:
```text
I0124 09:20:23.228260  1 static_autoscaler.go:463] No unschedulable pods
```

## Check Node Unneeded / Deletion

No candidates: `No candidates for scale down`

Node unneeded (default 10min timeout):
```text
I0124 09:20:12.218705  1 scale_down.go:862] aks-xxx was unneeded for 10m2.834256816s
I0124 09:20:12.218863  1 scale_down.go:1146] Scale-down: removing empty node aks-xxx
I0124 09:20:13.029650  1 delete.go:104] Successfully added ToBeDeletedTaint on node aks-xxx
I0124 09:20:13.029864  1 azure_scale_set.go:677] Deleting vmss instances [...]
```

### Deallocate mode:
```
| where properties contains "deallocat"
```

### VMSS instance operations:
```
| where properties contains "starting vmss instances"
```

## Note on Kusto Clusters

Use union of ControlPlaneEvents + ControlPlaneEventsNonShoebox (not ControlPlaneEventsAll which may be empty).
