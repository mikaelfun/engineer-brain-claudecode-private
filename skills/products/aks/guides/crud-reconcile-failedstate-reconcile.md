# AKS CRUD 操作与 Failed State 恢复 — reconcile -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Unable to update or delete AKS cluster due to EtagMismatch error: Operation is n... | A concurrent or previous operation left the cluster resource... | 1) Reconcile: az resource update --ids <AKS cluster id>. 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/EtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster) |
| 2 | Unable to update or delete AKS cluster due to EtagMismatch error: 'Operation is ... | A concurrent or previous AKS operation left the cluster in a... | Reconcile the cluster: 1) Customer runs 'az resource update ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FEtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster) |
| 3 | Resources deployed with label 'addonmanager.kubernetes.io/mode: Reconcile' in ku... | By design: Kubernetes addon-manager reconciles resources wit... | 1) Do NOT deploy user workloads to kube-system namespace — u... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS cluster deletion fails or hangs; customer cannot delete AKS cluster from por... | Failure of deleting underlying VM (in MC_ resource group) bl... | 1) Manually delete the blocking VM in the MC_ resource group... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | AKS API server and controller manager crash after helm delete operation; cluster... | Known bug where helm delete removed cloud-provider-config in... | Reconcile the cluster to recreate cloud-provider-config. The... | [Y] 3.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Reconcile: az resource update --ids <AKS cluster id> `[source: ado-wiki]`
2. Check: Reconcile the cluster: 1) Customer runs 'az resource update --ids <AKS resource id>' `[source: ado-wiki]`
3. Check: 1) Do NOT deploy user workloads to kube-system namespace — use 'default' or custom namespaces `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/crud-reconcile-failedstate-reconcile.md)
