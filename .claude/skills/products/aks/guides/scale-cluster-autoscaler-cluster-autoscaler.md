# AKS Cluster Autoscaler — cluster-autoscaler -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cluster autoscaler deletes AKS nodes running batch Jobs, causing job interruptio... | The safe-to-evict annotation is either not set, or is incorr... | Add annotation 'cluster-autoscaler.kubernetes.io/safe-to-evi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FPreventing%20cluster%20autoscaler%20from%20deleting%20a%20running%20job) |
| 2 | AKS with CAS shows wrong node count; fewer nodes registered than CAS target (e.g... | VMSS instances failed bootstrap with CSE exit code (e.g. 50)... | Identify failed VMSS instances. Reimage (Use Temp Disk for E... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/AKS_not_showing_correct_node_count_when_CAS_is_enabled) |
| 3 | CAS not scaling down to MIN count; nodes not suitable for removal can reschedule... | calico-typha deployment uses hostPort binding each replica 1... | Set CAS MIN COUNT >= 3 (matching calico-typha replica needs)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/Cluster%20Autoscaler%20is%20not%20scaling%20down%20when%20using%20Calico%20typha%20Operator) |
| 4 | PUT Agent Pool request containing node initialization taints returns Bad Request... | Due to a limitation in cluster autoscaler, PUT AP (Agent Poo... | Customer should perform managed cluster level operations (PU... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints) |
| 5 | AKS cluster autoscaler does not scale up even though actual node count is below ... | Cluster autoscaler only triggers scale-up when there are pen... | Understand that min count prevents scale-down below threshol... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | Cluster autoscaler not scaling up or down with 'failed to fix node group sizes: ... | Upstream cluster autoscaler race condition causes deadlock (... | Disable and re-enable the cluster autoscaler to break the de... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cluster-autoscaler-fails-to-scale) |

## Quick Troubleshooting Path

1. Check: Add annotation 'cluster-autoscaler `[source: ado-wiki]`
2. Check: Identify failed VMSS instances `[source: ado-wiki]`
3. Check: Set CAS MIN COUNT >= 3 (matching calico-typha replica needs) or use manual scaling for fewer nodes `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-cluster-autoscaler-cluster-autoscaler.md)
