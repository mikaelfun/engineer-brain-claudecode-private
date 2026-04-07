# AKS Azure Disk CSI — general -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 11
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Disk mount fails - Disk cannot be attached because not in same zone as VM | Azure Disk LRS default; disk and node in different availabil... | Use node affinity with topology.disk.csi.azure.com/zone; or ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-disk-volume) |
| 2 | Azure Disk mount AuthorizationFailed - no authorization for Microsoft.Compute/di... | AKS identity lacks permissions on disk in different resource... | Assign Contributor role to AKS identity on disk scope | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-disk-volume) |
| 3 | Multi-Attach error - Volume already used by pod on different node | Azure Disk only supports ReadWriteOnce; can attach to one no... | Ensure disk not mounted by multiple pods on different nodes;... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-disk-volume) |
| 4 | Azure Disk mount fails - UltraSSD_LRS requires additionalCapabilities.ultraSSDEn... | Ultra disk attached to node pool without ultra disk support | Create node pool with --enable-ultra-ssd flag | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-disk-volume) |
| 5 | Azure Disk mount fails - applyFSGroup failed input/output error with many files | Kubernetes recursively changes ownership for all files when ... | Set fsGroupChangePolicy: OnRootMismatch in securityContext | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-disk-volume) |
| 6 | FailedScheduling - node(s) exceed max volume count | Node VM size reached maximum disk capacity limit | Add node pool with larger VM size; scale pool; delete unused... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-disk-volume) |
| 7 | Azure Disk mount fails with wrong fs type when setting uid/gid in mountOptions | ext4/xfs do not support uid=x,gid=x mount options | Use securityContext with runAsUser/fsGroup; or init containe... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/failure-setting-azure-disk-mount-options-uid-gid) |
| 8 | AKS node pool created with unexpected OS disk type; customer reports data loss o... | For VM sizes that support ephemeral OS disk (sufficient cach... | To force managed disk: add "--os-disk-type Managed" to az ak... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 9 | AKS PV/PVC mount fails with 403 LinkedAuthorizationFailed when disk is in a diff... | AKS service principal only has Contributor access to the nod... | Option 1: Create the disk in the node resource group (MC_*) ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | ACStor StoragePool creation fails: AzureDisk shows Waiting for pod diskpool-work... | AzureDisk: diskpool-worker pod not running. EphemeralDisk: V... | AzureDisk: check diskpool-worker pod status and capacity-pro... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20StoragePools%20Issues) |
| 11 | Pods stuck in Pending state due to PV Node Affinity mismatch after upgrading AKS... | Labels failure-domain.beta.kubernetes.io/zone and failure-do... | Migrate disk PV/PVC to CSI drivers with supported labels (to... | [Y] 4.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: Use node affinity with topology `[source: mslearn]`
2. Check: Assign Contributor role to AKS identity on disk scope `[source: mslearn]`
3. Check: Ensure disk not mounted by multiple pods on different nodes; use Azure Files for ReadWriteMany `[source: mslearn]`
