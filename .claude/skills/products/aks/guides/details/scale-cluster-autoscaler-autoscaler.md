# AKS Cluster Autoscaler — autoscaler -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 3
**Source drafts**: ado-wiki-cluster-upgrades-using-arm.md, ado-wiki-getting-container-throttling-values.md
**Kusto references**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: vmssCSE (Custom Script Extension) accidentally rem

### aks-753: New AKS nodes not registering with API server. VMSS creates VMs but they never j...

**Root Cause**: vmssCSE (Custom Script Extension) accidentally removed from VMSS. Without CSE, nodes cannot bootstrap kubelet/CNI. Required: vmssCSE, AKSLinuxBilling, AKSLinuxExtension.

**Solution**:
Create new agent pool, migrate workloads. Verify new VMSS has all 3 required extensions.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server)]`

## Phase 2: Excessive HTTP calls to Azure Resource Manager fro

### aks-1141: 429 Too Many Requests errors on AKS cluster: OperationNotAllowed, TooManyRequest...

**Root Cause**: Excessive HTTP calls to Azure Resource Manager from cluster autoscaler, cloud provider, or third-party tools exceed subscription quota limits.

**Solution**:
1) Upgrade to K8s 1.18+ for better backoff. 2) Increase autoscaler scan interval. 3) Reconfigure third-party apps to reduce GET frequency. 4) Split clusters into different subscriptions/regions. Use AKS Diagnose and Solve > Azure Resource Request Throttling.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/429-too-many-requests-errors)]`

## Phase 3: VMs node pools (non-VMSS based) have specific limi

### aks-008: Virtual Machines (VMs) node pools fail or Cluster Autoscaler / node pool snapsho...

**Root Cause**: VMs node pools (non-VMSS based) have specific limitations: Cluster Autoscaler is not supported, Node pool snapshot is not supported, max 5 VM sizes per pool and must be same VM family.

**Solution**:
For VMs node pool limitations: (1) Cluster Autoscaler - use manual scaling or VMSS-based node pool. (2) Node pool snapshot - not supported, plan accordingly. (3) VM size mixing - all sizes must be same family (e.g., all D-series). Note: Mooncake had a bug noted in 2026/3, verify via github.com/Azure/container-service-for-azure-china.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [21v-gap](https://learn.microsoft.com/en-us/azure/aks/virtual-machines-node-pools)]`

## Phase 4: Known bug in cluster autoscaler on K8s 1.24 previe

### aks-118: AKS cluster autoscaler exhibits erratic scale-up/scale-down fluctuation on K8s 1...

**Root Cause**: Known bug in cluster autoscaler on K8s 1.24 preview causing rapid oscillation between scale-up and scale-down decisions

**Solution**:
Upgrade to GA version of 1.24 or later. Workaround: set autoscaler profile with --scale-down-delay-after-add and --scale-down-unneeded-time to prevent rapid oscillation.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: Expected behavior: cluster starts with node count 

### aks-1168: After restarting a stopped AKS cluster, current node count is outside the autosc...

**Root Cause**: Expected behavior: cluster starts with node count needed for current workloads, not autoscaler settings. Min/max only apply during subsequent scaling operations.

**Solution**:
No fix needed - by design. Cluster will eventually enter desired autoscaler range after scaling operations occur.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/node-count-is-not-in-autoscaler-min-max-range)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | New AKS nodes not registering with API server. VMSS creates VMs but they never j... | vmssCSE (Custom Script Extension) accidentally removed from ... | Create new agent pool, migrate workloads. Verify new VMSS ha... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server) |
| 2 | 429 Too Many Requests errors on AKS cluster: OperationNotAllowed, TooManyRequest... | Excessive HTTP calls to Azure Resource Manager from cluster ... | 1) Upgrade to K8s 1.18+ for better backoff. 2) Increase auto... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/429-too-many-requests-errors) |
| 3 | Virtual Machines (VMs) node pools fail or Cluster Autoscaler / node pool snapsho... | VMs node pools (non-VMSS based) have specific limitations: C... | For VMs node pool limitations: (1) Cluster Autoscaler - use ... | [B] 6.0 | [21v-gap](https://learn.microsoft.com/en-us/azure/aks/virtual-machines-node-pools) |
| 4 | AKS cluster autoscaler exhibits erratic scale-up/scale-down fluctuation on K8s 1... | Known bug in cluster autoscaler on K8s 1.24 preview causing ... | Upgrade to GA version of 1.24 or later. Workaround: set auto... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | After restarting a stopped AKS cluster, current node count is outside the autosc... | Expected behavior: cluster starts with node count needed for... | No fix needed - by design. Cluster will eventually enter des... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/node-count-is-not-in-autoscaler-min-max-range) |
