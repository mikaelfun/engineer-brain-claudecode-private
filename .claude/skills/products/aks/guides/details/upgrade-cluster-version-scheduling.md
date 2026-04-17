# AKS 集群版本升级 — scheduling -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Taints were applied manually at the node level (ku

### aks-796: After AKS upgrade, node taints are lost and pods schedule on unintended node poo...

**Root Cause**: Taints were applied manually at the node level (kubectl taint) instead of at the node pool level. AKS upgrades recreate nodes, so manually applied taints are not persisted.

**Solution**:
Configure taints at the node pool level using az aks nodepool update --node-taints. Combine with nodeSelector or nodeAffinity for deterministic scheduling.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Lost%20Taint%20After%20Upgrade)]`

## Phase 2: Cluster upgrade reprovisions all nodes and refresh

### aks-804: After upgrading AKS cluster to k8s >= 1.25, Windows2019 application pods are res...

**Root Cause**: Cluster upgrade reprovisions all nodes and refreshes all labels from scratch. Default Windows version for k8s >= 1.25 is Windows2022. Without explicit node selector for Windows2019, pods may be scheduled onto the new Windows2022 nodes.

**Solution**:
Before upgrading to k8s >= 1.25, add node affinity or selector to Windows2019 pods: Option A: Use affinity with NotIn operator for kubernetes.azure.com/os-sku: Windows2022. Option B: Recreate Windows2019 nodepools and add NodeSelector for Windows2019 os-sku. Ref: https://learn.microsoft.com/en-us/azure/aks/upgrade-windows-2019-2022

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs)]`

## Phase 3: AKS upgrades recreate nodes. Taints applied manual

### aks-974: After AKS upgrade, pods schedule on unintended node pools. Manually applied node...

**Root Cause**: AKS upgrades recreate nodes. Taints applied manually at the node level (kubectl taint) are not persisted through node recreation; only node pool-level taints survive.

**Solution**:
Configure taints at the node pool level: 'az aks nodepool update --node-taints key=value:NoSchedule'. Combine with nodeSelector/nodeAffinity and tolerations for deterministic scheduling.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FLost%20Taint%20After%20Upgrade)]`

## Phase 4: Pods configured with tolerations only without node

### aks-975: After AKS upgrade, pods schedule onto system or untainted node pools unexpectedl...

**Root Cause**: Pods configured with tolerations only without nodeSelector or nodeAffinity. Tolerations only ALLOW scheduling on tainted nodes but do NOT force or prefer it; the scheduler may place pods on any eligible node.

**Solution**:
Use both tolerations AND nodeSelector/nodeAffinity. Add nodeSelector: {agentpool: <target-pool>} to pod spec alongside toleration to ensure deterministic scheduling.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FMisunderstanding%20tolerations%20behavior)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade, node taints are lost and pods schedule on unintended node poo... | Taints were applied manually at the node level (kubectl tain... | Configure taints at the node pool level using az aks nodepoo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Lost%20Taint%20After%20Upgrade) |
| 2 | After upgrading AKS cluster to k8s >= 1.25, Windows2019 application pods are res... | Cluster upgrade reprovisions all nodes and refreshes all lab... | Before upgrading to k8s >= 1.25, add node affinity or select... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs) |
| 3 | After AKS upgrade, pods schedule on unintended node pools. Manually applied node... | AKS upgrades recreate nodes. Taints applied manually at the ... | Configure taints at the node pool level: 'az aks nodepool up... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FLost%20Taint%20After%20Upgrade) |
| 4 | After AKS upgrade, pods schedule onto system or untainted node pools unexpectedl... | Pods configured with tolerations only without nodeSelector o... | Use both tolerations AND nodeSelector/nodeAffinity. Add node... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FMisunderstanding%20tolerations%20behavior) |
