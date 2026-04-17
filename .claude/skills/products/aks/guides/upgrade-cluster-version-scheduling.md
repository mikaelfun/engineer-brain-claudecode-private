# AKS 集群版本升级 — scheduling -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade, node taints are lost and pods schedule on unintended node poo... | Taints were applied manually at the node level (kubectl tain... | Configure taints at the node pool level using az aks nodepoo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Lost%20Taint%20After%20Upgrade) |
| 2 | After upgrading AKS cluster to k8s >= 1.25, Windows2019 application pods are res... | Cluster upgrade reprovisions all nodes and refreshes all lab... | Before upgrading to k8s >= 1.25, add node affinity or select... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs) |
| 3 | After AKS upgrade, pods schedule on unintended node pools. Manually applied node... | AKS upgrades recreate nodes. Taints applied manually at the ... | Configure taints at the node pool level: 'az aks nodepool up... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FLost%20Taint%20After%20Upgrade) |
| 4 | After AKS upgrade, pods schedule onto system or untainted node pools unexpectedl... | Pods configured with tolerations only without nodeSelector o... | Use both tolerations AND nodeSelector/nodeAffinity. Add node... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FMisunderstanding%20tolerations%20behavior) |

## Quick Troubleshooting Path

1. Check: Configure taints at the node pool level using az aks nodepool update --node-taints `[source: ado-wiki]`
2. Check: Before upgrading to k8s >= 1 `[source: ado-wiki]`
3. Check: Configure taints at the node pool level: 'az aks nodepool update --node-taints key=value:NoSchedule' `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-scheduling.md)
