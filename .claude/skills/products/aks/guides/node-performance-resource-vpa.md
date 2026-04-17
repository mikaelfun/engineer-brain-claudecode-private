# AKS 节点性能与资源管理 — vpa -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | metrics-server pod OOMKilled in kube-system namespace | metrics-server default resource allocation insufficient for ... | Configure Metrics Server VPA to allocate extra resources | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters) |
| 2 | High CPU throttling on metrics-server pods in AKS 1.24+. kubectl top returns err... | Metrics-server VPA addon-resizer defaults (CPU=44+0.5n, Mem=... | Apply ConfigMap metrics-server-config in kube-system with hi... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FMetrics-Server%20VPA) |
| 3 | VPA object is created on AKS but recommendation values (CPU/MEM) are not populat... | VPA-Recommender component is not calculating recommendations... | Check VPA-Recommender pod logs. If recommendations exist but... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Vertical%20Pod%20Autoscaler) |

## Quick Troubleshooting Path

1. Check: Configure Metrics Server VPA to allocate extra resources `[source: mslearn]`
2. Check: Apply ConfigMap metrics-server-config in kube-system with higher baseCPU/baseMemory (e `[source: ado-wiki]`
3. Check: Check VPA-Recommender pod logs `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-performance-resource-vpa.md)
