# AKS 集群版本升级 — vmss -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Customer manually resized VMSS OS disks at the Iaa

### aks-794: AKS upgrade fails with CreateVMSSAgentPoolFailed: Cannot complete the operation ...

**Root Cause**: Customer manually resized VMSS OS disks at the IaaS level, causing a mismatch between AKS control plane expected config and actual VMSS disk size

**Solution**:
Identify affected node pools by per-nodepool upgrade. Compare AKS config vs CRP config via Jarvis. Delete and recreate affected node pools with correct OS disk size, then re-run AKS upgrade.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Disk%20size%20mismatch%20causes%20upgrade%20failures)]`

### aks-972: AKS upgrade fails with CreateVMSSAgentPoolFailed: 'Cannot complete the operation...

**Root Cause**: Customer manually resized VMSS OS disks at the IaaS level outside the AKS API, causing mismatch between the AKS control plane expected disk size and the actual VMSS configuration.

**Solution**:
Identify affected node pools by running per-nodepool upgrades. Delete and recreate them (same name) with the correct OS disk size via az CLI, then re-run the AKS upgrade.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FDisk%20size%20mismatch%20causes%20upgrade%20failures)]`

## Phase 2: Race condition between AKS RP and cluster autoscal

### aks-952: During nodepool upgrade, autoscaler deletes the surge node causing GetSurgedVms_...

**Root Cause**: Race condition between AKS RP and cluster autoscaler. AKS RP failed to annotate the surge node with ScaleDownDisabledReasonUpgrade tag, allowing autoscaler to issue forceDelete on the surge node while upgrade was in progress.

**Solution**:
1) Recommend customer disable cluster autoscaler before performing nodepool upgrades; 2) Re-enable autoscaler after upgrade completes; 3) Bug tracked: ADO work items 30155571 / 31289428; 4) Check AsyncContextActivity for surge node creation and CRP logs for VMSS scale events.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade)]`

## Phase 3: AKS uses best-effort zone balancing in VMSS. Durin

### aks-123: AKS upgrade with Availability Zones causes temporary zone imbalance; surge nodes...

**Root Cause**: AKS uses best-effort zone balancing in VMSS. During upgrade surge, zone for surge nodes is unknown, causing temporary imbalance until surge nodes deleted

**Solution**:
Set upgrade surge to multiple of 3 nodes so VMSS can balance across AZs. Original zone balance restored after upgrade

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS upgrade fails with CreateVMSSAgentPoolFailed: Cannot complete the operation ... | Customer manually resized VMSS OS disks at the IaaS level, c... | Identify affected node pools by per-nodepool upgrade. Compar... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Disk%20size%20mismatch%20causes%20upgrade%20failures) |
| 2 | During nodepool upgrade, autoscaler deletes the surge node causing GetSurgedVms_... | Race condition between AKS RP and cluster autoscaler. AKS RP... | 1) Recommend customer disable cluster autoscaler before perf... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade) |
| 3 | AKS upgrade fails with CreateVMSSAgentPoolFailed: 'Cannot complete the operation... | Customer manually resized VMSS OS disks at the IaaS level ou... | Identify affected node pools by running per-nodepool upgrade... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FDisk%20size%20mismatch%20causes%20upgrade%20failures) |
| 4 | AKS upgrade with Availability Zones causes temporary zone imbalance; surge nodes... | AKS uses best-effort zone balancing in VMSS. During upgrade ... | Set upgrade surge to multiple of 3 nodes so VMSS can balance... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
