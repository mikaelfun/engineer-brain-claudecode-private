# AKS Cluster Autoscaler — autoscaler -- Quick Reference

**Sources**: 4 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | New AKS nodes not registering with API server. VMSS creates VMs but they never j... | vmssCSE (Custom Script Extension) accidentally removed from ... | Create new agent pool, migrate workloads. Verify new VMSS ha... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNew%20nodes%20are%20not%20getting%20registered%20with%20AKS%20API%20server) |
| 2 | 429 Too Many Requests errors on AKS cluster: OperationNotAllowed, TooManyRequest... | Excessive HTTP calls to Azure Resource Manager from cluster ... | 1) Upgrade to K8s 1.18+ for better backoff. 2) Increase auto... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/429-too-many-requests-errors) |
| 3 | Virtual Machines (VMs) node pools fail or Cluster Autoscaler / node pool snapsho... | VMs node pools (non-VMSS based) have specific limitations: C... | For VMs node pool limitations: (1) Cluster Autoscaler - use ... | [B] 6.0 | [21v-gap](https://learn.microsoft.com/en-us/azure/aks/virtual-machines-node-pools) |
| 4 | AKS cluster autoscaler exhibits erratic scale-up/scale-down fluctuation on K8s 1... | Known bug in cluster autoscaler on K8s 1.24 preview causing ... | Upgrade to GA version of 1.24 or later. Workaround: set auto... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | After restarting a stopped AKS cluster, current node count is outside the autosc... | Expected behavior: cluster starts with node count needed for... | No fix needed - by design. Cluster will eventually enter des... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/node-count-is-not-in-autoscaler-min-max-range) |

## Quick Troubleshooting Path

1. Check: Create new agent pool, migrate workloads `[source: ado-wiki]`
2. Check: 1) Upgrade to K8s 1 `[source: mslearn]`
3. Check: For VMs node pool limitations: (1) Cluster Autoscaler - use manual scaling or VMSS-based node pool `[source: 21v-gap]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-cluster-autoscaler-autoscaler.md)
