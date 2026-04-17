# AKS AGIC HTTP 错误码排查 — upgrade -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 2
**Kusto references**: auto-upgrade.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: On Azure CNI Overlay clusters with AGIC/AGC, the O

### aks-775: AKS upgrade/update fails with FailedToWaitForOverlayExtensionConfigCleanup. agic...

**Root Cause**: On Azure CNI Overlay clusters with AGIC/AGC, the OverlayExtensionConfig resource enters deletion but DNC-managed finalizer (finalizers.acn.azure.com/dnc-operations) cannot be removed due to DNC-RC cleanup failure (e.g. missing Cosmos DB SubnetTokenMap entry). OEC stays stuck, blocking control plane operation

**Solution**:
1) Verify OEC stuck: kubectl get oec -n kube-system agic-overlay-extension-config -o yaml (check deletionTimestamp + finalizer present); 2) Confirm no pending DNC cleanup activity via Kusto; 3) Only if AGIC extension is NOT actively in use: remove finalizer with kubectl edit/patch to unblock deletion; 4) If AGIC is actively in use, do NOT remove finalizer - escalate to PG

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup)]`

### aks-787: AKS upgrade/update fails with FailedToWaitForOverlayExtensionConfigCleanup; agic...

**Root Cause**: On Azure CNI Overlay clusters with AGIC/AGC, the OEC cleanup fails because the DNC-RC reconciler cannot remove the finalizer (missing Cosmos DB SubnetTokenMap entry), leaving OEC in terminating state

**Solution**:
1) Verify cluster uses overlay and OEC is stuck in deletion with finalizers.acn.azure.com/dnc-operations. 2) Confirm no pending DNC cleanup via Kusto. 3) kubectl edit oec and remove finalizers block. 4) Retry via cluster reconcile.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup)]`

## Phase 2: On Azure CNI Overlay clusters with AGIC/AGC, DNC-R

### aks-966: AKS upgrade or update fails with FailedToWaitForOverlayExtensionConfigCleanup. T...

**Root Cause**: On Azure CNI Overlay clusters with AGIC/AGC, DNC-RC cleanup failed (e.g. missing Cosmos DB SubnetTokenMap entry), leaving the finalizers.acn.azure.com/dnc-operations finalizer on the OEC resource and blocking control plane operations.

**Solution**:
1) Verify cluster uses overlay networking and agic-overlay-extension-config is stuck in deletion with dnc-operations finalizer. 2) Confirm no pending DNC cleanup activity via Kusto. 3) kubectl edit oec agic-overlay-extension-config -n kube-system and remove the finalizers block. 4) OEC auto-deletes, then reconcile the cluster.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FAKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS upgrade/update fails with FailedToWaitForOverlayExtensionConfigCleanup. agic... | On Azure CNI Overlay clusters with AGIC/AGC, the OverlayExte... | 1) Verify OEC stuck: kubectl get oec -n kube-system agic-ove... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup) |
| 2 | AKS upgrade/update fails with FailedToWaitForOverlayExtensionConfigCleanup; agic... | On Azure CNI Overlay clusters with AGIC/AGC, the OEC cleanup... | 1) Verify cluster uses overlay and OEC is stuck in deletion ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup) |
| 3 | AKS upgrade or update fails with FailedToWaitForOverlayExtensionConfigCleanup. T... | On Azure CNI Overlay clusters with AGIC/AGC, DNC-RC cleanup ... | 1) Verify cluster uses overlay networking and agic-overlay-e... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FAKS%20Upgrade%20FailedToWaitForOverlayExtensionConfigCleanup) |
