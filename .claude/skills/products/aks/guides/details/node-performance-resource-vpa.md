# AKS 节点性能与资源管理 — vpa -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: metrics-server default resource allocation insuffi

### aks-1102: metrics-server pod OOMKilled in kube-system namespace

**Root Cause**: metrics-server default resource allocation insufficient for cluster size/load

**Solution**:
Configure Metrics Server VPA to allocate extra resources

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters)]`

## Phase 2: Metrics-server VPA addon-resizer defaults (CPU=44+

### aks-1053: High CPU throttling on metrics-server pods in AKS 1.24+. kubectl top returns err...

**Root Cause**: Metrics-server VPA addon-resizer defaults (CPU=44+0.5n, Mem=51+4n MiB) use current node count, not max. During autoscaler scaling, metrics-server becomes under-provisioned.

**Solution**:
Apply ConfigMap metrics-server-config in kube-system with higher baseCPU/baseMemory (e.g. 100m/100Mi). Then kubectl rollout restart -n kube-system deploy metrics-server.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FMetrics-Server%20VPA)]`

## Phase 3: VPA-Recommender component is not calculating recom

### aks-1073: VPA object is created on AKS but recommendation values (CPU/MEM) are not populat...

**Root Cause**: VPA-Recommender component is not calculating recommendations correctly, possibly due to insufficient metrics data or misconfigured VPA object targeting.

**Solution**:
Check VPA-Recommender pod logs. If recommendations exist but pods not evicted, check VPA-Updater logs. If pods evicted but values not updated on new pods, check VPA-Admission-Controller (mutating webhook) logs. Escalate to PG if needed.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Vertical%20Pod%20Autoscaler)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | metrics-server pod OOMKilled in kube-system namespace | metrics-server default resource allocation insufficient for ... | Configure Metrics Server VPA to allocate extra resources | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters) |
| 2 | High CPU throttling on metrics-server pods in AKS 1.24+. kubectl top returns err... | Metrics-server VPA addon-resizer defaults (CPU=44+0.5n, Mem=... | Apply ConfigMap metrics-server-config in kube-system with hi... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FMetrics-Server%20VPA) |
| 3 | VPA object is created on AKS but recommendation values (CPU/MEM) are not populat... | VPA-Recommender component is not calculating recommendations... | Check VPA-Recommender pod logs. If recommendations exist but... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Vertical%20Pod%20Autoscaler) |
