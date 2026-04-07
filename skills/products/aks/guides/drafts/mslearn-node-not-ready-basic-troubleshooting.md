---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-basic-troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Basic Troubleshooting of Node Not Ready Failures in AKS

## Overview

AKS continuously monitors worker node health and automatically repairs unhealthy nodes. Node heartbeats use two mechanisms:
- **Node .status updates**: kubelet updates every 5 minutes (or on status change)
- **Lease objects**: kubelet updates every 10 seconds in kube-node-lease namespace (lightweight)

Default timeout for unreachable nodes: 40 seconds.

## Node Conditions

| Condition | Impact |
|-----------|--------|
| `Ready` | Pod scheduling allowed |
| `NotReady` / `Unknown` | Pod scheduling blocked |
| `MemoryPressure` | Must manage resources before scheduling extra pods |
| `DiskPressure` | Must manage resources before scheduling extra pods |
| `PIDPressure` | Must manage resources before scheduling extra pods |
| `NetworkUnavailable` | Must configure network correctly |

## Prerequisites Checklist

1. **Cluster state**: Must be `Succeeded (Running)` — check via Azure portal or `az aks show`
2. **Node pool state**: Provisioning state `Succeeded`, Power state `Running` — check via portal or `az aks nodepool show`
3. **Egress ports**: Required ports open in NSGs and firewall for API server IP access
4. **Node images**: Latest node images deployed
5. **Node VM state**: Must be `Running` (not Stopped/Deallocated)
6. **K8s version**: Must be AKS-supported version

## Key References

- [Kubernetes troubleshooting guide](https://kubernetes.io/docs/tasks/debug/debug-cluster/_print/)
- [feiskyer's Kubernetes handbook](https://github.com/feiskyer/kubernetes-handbook/blob/master/en/troubleshooting/index.md)
- [AKS support coverage for agent nodes](https://learn.microsoft.com/en-us/azure/aks/support-policies#user-customization-of-agent-nodes)
- [AKS outbound requirements](https://learn.microsoft.com/en-us/azure/aks/limit-egress-traffic#required-outbound-network-rules-and-fqdns-for-aks-clusters)

## Important Notes

- Modifying IaaS resources associated with agent nodes (SSH, package updates, network config changes) is **not supported** by AKS
- AKS manages lifecycle and operations of agent nodes
