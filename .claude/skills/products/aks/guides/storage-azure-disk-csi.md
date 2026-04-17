# AKS Azure Disk CSI — csi -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Pod stuck in Pending after mounting Azure Disk created from CMK-encrypted disk s... | When migrating data by snapshotting a CMK (Customer Managed ... | 1) Grant Contributor role to AKS managed identity on the res... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 2 | Slow Azure Disk attach/detach operations with in-tree driver kubernetes.io/azure... | In-tree Azure Disk driver performs attach/detach sequentiall... | Migrate to CSI driver (file.csi.azure.com / disk.csi.azure.c... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/slow-attach-detach-operations-azure-disk) |
| 3 | Azure Disk PVC stuck in Attached state and cannot be detached from deleted/faile... | Pod was force-deleted or node went down without clean unmoun... | Method 1: Use Azure Disk CSI volume snapshots to create new ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Grant Contributor role to AKS managed identity on the resource group containing the Disk Encrypti `[source: onenote]`
2. Check: Migrate to CSI driver (file `[source: mslearn]`
3. Check: Method 1: Use Azure Disk CSI volume snapshots to create new disk from snapshot `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-azure-disk-csi.md)
