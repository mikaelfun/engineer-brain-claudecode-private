---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/identify-high-cpu-consuming-containers-aks"
importDate: "2026-04-23"
type: guide-draft
---

# Troubleshoot High CPU Usage in AKS Clusters

## Symptoms

- CPU starvation: intensive apps slow down others
- Slow state changes: pods take longer to get ready
- NotReady node state

## Step 1: Identify High CPU Nodes/Containers

### Via Container Insights
Cluster > Monitoring > Insights > Nodes > CPU Usage (millicores)

### Via kubectl
kubectl top node
kubectl top pods on specific node, sort by CPU

## Best Practices
- Set appropriate resource requests and limits
- Enable Horizontal Pod Autoscaler (HPA)
- Use higher SKU VMs for CPU-intensive workloads
- Isolate system and user workloads in separate node pools
