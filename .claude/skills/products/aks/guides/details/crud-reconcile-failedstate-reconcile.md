# AKS CRUD 操作与 Failed State 恢复 — reconcile -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-c-Update-or-Disable-SSH-Key.md
**Generated**: 2026-04-07

---

## Phase 1: A concurrent or previous operation left the cluste

### aks-795: Unable to update or delete AKS cluster due to EtagMismatch error: Operation is n...

**Root Cause**: A concurrent or previous operation left the cluster resource in an inconsistent state, causing etag precondition failures

**Solution**:
1) Reconcile: az resource update --ids <AKS cluster id>. 2) Or use Geneva action. 3) If persists, file IcM to AKS PG.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/EtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster)]`

## Phase 2: A concurrent or previous AKS operation left the cl

### aks-973: Unable to update or delete AKS cluster due to EtagMismatch error: 'Operation is ...

**Root Cause**: A concurrent or previous AKS operation left the cluster in an inconsistent state, causing etag mismatch between the client request and the current resource version.

**Solution**:
Reconcile the cluster: 1) Customer runs 'az resource update --ids <AKS resource id>'. 2) CSS can reconcile from Geneva. 3) If persists, file IcM to AKS PG.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FEtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster)]`

## Phase 3: By design: Kubernetes addon-manager reconciles res

### aks-052: Resources deployed with label 'addonmanager.kubernetes.io/mode: Reconcile' in ku...

**Root Cause**: By design: Kubernetes addon-manager reconciles resources with label 'addonmanager.kubernetes.io/mode: Reconcile' in kube-system namespace. It will delete any resource with this label that is not part of the expected addon set. User workloads deployed to kube-system with this label trigger addon-manager cleanup.

**Solution**:
1) Do NOT deploy user workloads to kube-system namespace — use 'default' or custom namespaces. 2) Remove the 'addonmanager.kubernetes.io/mode: Reconcile' label from your deployment YAML. 3) kube-system is reserved for core resources (DNS, proxy, dashboard). 4) Reference: https://github.com/kubernetes/kubernetes/tree/master/cluster/addons/addon-manager

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Failure of deleting underlying VM (in MC_ resource

### aks-195: AKS cluster deletion fails or hangs; customer cannot delete AKS cluster from por...

**Root Cause**: Failure of deleting underlying VM (in MC_ resource group) blocks the cluster deletion pipeline. The cluster remains in a stuck/failed state.

**Solution**:
1) Manually delete the blocking VM in the MC_ resource group first. 2) After VM is deleted, retry cluster deletion. 3) If still fails, contact AKS PG to perform cluster reconcile, then retry delete.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: Known bug where helm delete removed cloud-provider

### aks-277: AKS API server and controller manager crash after helm delete operation; cluster...

**Root Cause**: Known bug where helm delete removed cloud-provider-config in CCP. The config was originally managed by helm but was migrated to overlaymgr; during transition, helm delete could remove it, crashing apiserver and controller manager.

**Solution**:
Reconcile the cluster to recreate cloud-provider-config. The bug is fixed in newer versions where overlaymgr ensures cloud-provider-config is always created. If encountered, direct reconcile is the mitigation.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 3.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Unable to update or delete AKS cluster due to EtagMismatch error: Operation is n... | A concurrent or previous operation left the cluster resource... | 1) Reconcile: az resource update --ids <AKS cluster id>. 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/EtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster) |
| 2 | Unable to update or delete AKS cluster due to EtagMismatch error: 'Operation is ... | A concurrent or previous AKS operation left the cluster in a... | Reconcile the cluster: 1) Customer runs 'az resource update ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FEtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster) |
| 3 | Resources deployed with label 'addonmanager.kubernetes.io/mode: Reconcile' in ku... | By design: Kubernetes addon-manager reconciles resources wit... | 1) Do NOT deploy user workloads to kube-system namespace — u... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS cluster deletion fails or hangs; customer cannot delete AKS cluster from por... | Failure of deleting underlying VM (in MC_ resource group) bl... | 1) Manually delete the blocking VM in the MC_ resource group... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | AKS API server and controller manager crash after helm delete operation; cluster... | Known bug where helm delete removed cloud-provider-config in... | Reconcile the cluster to recreate cloud-provider-config. The... | [Y] 3.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
