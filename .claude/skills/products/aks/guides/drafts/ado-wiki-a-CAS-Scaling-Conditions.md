---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Cluster Autoscaler/CAS Scaling Conditions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/CAS%20Scaling%20Conditions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Cluster Autoscaler Scaling Conditions

## Scale Up

Scale up occurs when pending pods exist that cannot be placed on existing nodes based on resource utilization and pod resource requests. Requirements:
- Pod could be placed on a new node
- Maximum node count not reached
- CAS checks for unschedulable pods every 10 seconds (configurable via --scan-interval)

Pod event on scale-up trigger:
```text
default 31s Normal TriggeredScaleUp pod/nginx-userpool-deployment-6dc7b4d69-5xspw pod triggered scale-up: [{aks-userpool-41179476-vmss 2->4 (max: 4)}]
```

CAS log entries:
```text
Schedulable pods present
newNodes: 0, currentTarget: 4, deallocated: 0, readinessReady: 4 ...
VMSS: aks-userpool-41179476-vmss, in-memory size: 4, new size: 4
```

Conditions preventing scale-up: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview#not-triggering-scale-up-operations

Pending pods with affinity/topology constraints: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-pods-remain-pending-state-scenario

## Scale Down

Scale down when node resource utilization falls below scale-down-utilization-threshold (sum of cpu/memory requests / allocatable).

kubectl events:
```text
13m Normal ScaleDown node/aks-userpool-41179476-vmss00000s marked as toBeDeleted/unschedulable
```

CAS log entries during scale-down evaluation:
```text
Simulating node aks-userpool-41179476-vmss00000s removal
aks-userpool-41179476-vmss00000s was unneeded for 0s
Successfully added DeletionCandidateOfClusterAutoscaler on node ...
```

No candidates: `No candidates for scale down`

Conditions preventing scale-down: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview#scale-down-operation-failures

## Cluster Autoscaler Profile

Configurable settings: https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler?tabs=azure-cli#cluster-autoscaler-profile-settings

Example: If workloads run every 15 minutes, adjust scale-down delay to 15-20 minutes.

## References

- https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler-overview
- https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md
