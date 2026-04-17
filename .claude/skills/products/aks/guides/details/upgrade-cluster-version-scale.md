# AKS 集群版本升级 — scale -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Log Analytics workspace or its resource group was 

### aks-1147: AKS cluster upgrade or scale fails with Unable to get log analytics workspace in...

**Root Cause**: Log Analytics workspace or its resource group was deleted without first disabling the monitoring addon on the AKS cluster.

**Solution**:
If <14 days since deletion: recover workspace with New-AzOperationalInsightsWorkspace (recreate RG first if needed). If >14 days: disable monitoring addon with az aks disable-addons -a monitoring, then retry.

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-upgrade-scale-fail-log-analytics-workspace-missing)]`

## Phase 2: Race condition between AKS RP and cluster autoscal

### aks-749: AKS nodepool upgrade fails with GetSurgedVms_CountNotMatch or AgentCountNotMatch...

**Root Cause**: Race condition between AKS RP and cluster autoscaler: autoscaler forceDeletes surge nodes while RP is upgrading. ScaleDownDisabledReasonUpgrade annotation not applied to surge node. Bug 30155571, Issue 31289428.

**Solution**:
Disable cluster autoscaler before nodepool upgrades, re-enable after completion.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade)]`

## Phase 3: Regional compute quotas exceeded for the subscript

### aks-1142: Quota exceeded error during AKS cluster creation, scale up, or upgrade at large ...

**Root Cause**: Regional compute quotas exceeded for the subscription when provisioning additional VMs for large clusters.

**Solution**:
Create a support request in the subscription to increase regional compute quota for the corresponding VM resource type.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-at-scale-troubleshoot-guide)]`

## Phase 4: Tags or resource properties in MC_* node resource 

### aks-1153: AKS cluster upgrade or scale fails with 'Changing property imageReference is not...

**Root Cause**: Tags or resource properties in MC_* node resource group were modified or deleted, breaking SLO

**Solution**:
Add a new node pool, then delete the affected node pool

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/changing-property-imagereference-not-allowed)]`

## Phase 5: Each operation type must finish on the target reso

### aks-1179: AKS cluster cannot simultaneously upgrade and scale - second operation fails whi...

**Root Cause**: Each operation type must finish on the target resource before the next request runs. Concurrent upgrade+scale is not supported.

**Solution**:
Run az aks show to check ProvisioningState. If Upgrading: wait. If Failed: resolve per failed-state guidance. If Succeeded: retry the second operation.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrading-or-scaling-does-not-succeed)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster upgrade or scale fails with Unable to get log analytics workspace in... | Log Analytics workspace or its resource group was deleted wi... | If <14 days since deletion: recover workspace with New-AzOpe... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-upgrade-scale-fail-log-analytics-workspace-missing) |
| 2 | AKS nodepool upgrade fails with GetSurgedVms_CountNotMatch or AgentCountNotMatch... | Race condition between AKS RP and cluster autoscaler: autosc... | Disable cluster autoscaler before nodepool upgrades, re-enab... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade) |
| 3 | Quota exceeded error during AKS cluster creation, scale up, or upgrade at large ... | Regional compute quotas exceeded for the subscription when p... | Create a support request in the subscription to increase reg... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-at-scale-troubleshoot-guide) |
| 4 | AKS cluster upgrade or scale fails with 'Changing property imageReference is not... | Tags or resource properties in MC_* node resource group were... | Add a new node pool, then delete the affected node pool | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/changing-property-imagereference-not-allowed) |
| 5 | AKS cluster cannot simultaneously upgrade and scale - second operation fails whi... | Each operation type must finish on the target resource befor... | Run az aks show to check ProvisioningState. If Upgrading: wa... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrading-or-scaling-does-not-succeed) |
