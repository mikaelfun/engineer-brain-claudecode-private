# AKS Azure Disk CSI — csi -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-azure-disk-csi-driver-v2.md
**Generated**: 2026-04-07

---

## Phase 1: When migrating data by snapshotting a CMK (Custome

### aks-030: Pod stuck in Pending after mounting Azure Disk created from CMK-encrypted disk s...

**Root Cause**: When migrating data by snapshotting a CMK (Customer Managed Key / DiskEncryptionSet) encrypted disk from one cluster and mounting it in another, the target StorageClass lacks the diskEncryptionSetID parameter. Without the correct DES configured, the platform cannot locate the Key Vault key and the attach operation times out.

**Solution**:
1) Grant Contributor role to AKS managed identity on the resource group containing the Disk Encryption Set. 2) Ensure Disk Encryption Set managed identity has Key Vault key Wrap/Unwrap permissions. 3) Create new StorageClass YAML with diskEncryptionSetID: /subscriptions/.../diskEncryptionSets/<DES-name> explicitly specified. 4) Create PV/PVC/Pod using new StorageClass. Ref: https://docs.microsoft.com/en-us/azure/aks/azure-disk-customer-managed-keys

`[Score: [B] 6.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4]]`

## Phase 2: In-tree Azure Disk driver performs attach/detach s

### aks-1306: Slow Azure Disk attach/detach operations with in-tree driver kubernetes.io/azure...

**Root Cause**: In-tree Azure Disk driver performs attach/detach sequentially; >10 ops on single VM or >3 on VMSS

**Solution**:
Migrate to CSI driver (file.csi.azure.com / disk.csi.azure.com)

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/slow-attach-detach-operations-azure-disk)]`

## Phase 3: Pod was force-deleted or node went down without cl

### aks-114: Azure Disk PVC stuck in Attached state and cannot be detached from deleted/faile...

**Root Cause**: Pod was force-deleted or node went down without clean unmount; Azure Disk still shows as attached to old VMSS instance in ARM

**Solution**:
Method 1: Use Azure Disk CSI volume snapshots to create new disk from snapshot. Method 2: Take VMSS instance snapshot, create managed disk, copy data at filesystem level. Also consider CSI volume cloning.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Pod stuck in Pending after mounting Azure Disk created from CMK-encrypted disk s... | When migrating data by snapshotting a CMK (Customer Managed ... | 1) Grant Contributor role to AKS managed identity on the res... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 2 | Slow Azure Disk attach/detach operations with in-tree driver kubernetes.io/azure... | In-tree Azure Disk driver performs attach/detach sequentiall... | Migrate to CSI driver (file.csi.azure.com / disk.csi.azure.c... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/slow-attach-detach-operations-azure-disk) |
| 3 | Azure Disk PVC stuck in Attached state and cannot be detached from deleted/faile... | Pod was force-deleted or node went down without clean unmoun... | Method 1: Use Azure Disk CSI volume snapshots to create new ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
