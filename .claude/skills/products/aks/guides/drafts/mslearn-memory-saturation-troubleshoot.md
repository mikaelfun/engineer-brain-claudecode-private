---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/identify-memory-saturation-aks"
importDate: "2026-04-23"
type: guide-draft
---

# Troubleshoot Memory Saturation in AKS Clusters

## Symptoms

- Unschedulable pods (node near memory limit)
- Pod eviction by kubelet
- Node NotReady (kubelet/containerd unresponsive)
- OOM kills

## Step 1: Identify Saturated Nodes

### Via Container Insights
Cluster > Monitoring > Insights > Nodes tab > Memory working set

### Via kubectl
kubectl top node
kubectl describe node <node-name>

## Step 2: Process-Level Analysis (Inspektor Gadget)
kubectl gadget run top_process --sort -memoryRelative --max-entries 10
Filter by node/namespace/pod as needed.

## Related
- OOMkilled: troubleshoot-oomkilled-aks-clusters
