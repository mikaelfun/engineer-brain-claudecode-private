# AKS Azure Container Storage — 21v-unsupported -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 6 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-VM-Storage-Fileshare-Performance-Troubleshooting.md, ado-wiki-a-acstor-escalation-steps.md, ado-wiki-acstor-geneva-actions.md, ado-wiki-acstor-geneva-logs.md, ado-wiki-b-Trident-Storage-NetApp.md, ado-wiki-b-acstor-error-codes.md
**Generated**: 2026-04-07

---

## Phase 1: Azure Container Storage is not available in Azure 

### aks-004: Customer asks for ETA of Azure Container Storage (ACSTOR) in Azure China or trie...

**Root Cause**: Azure Container Storage is not available in Azure China (21Vianet). No confirmed landing date as of 2024.

**Solution**:
Azure Container Storage is not supported in 21V. Use Azure Disk CSI driver, Azure File CSI driver, or Azure Blob CSI driver instead for persistent storage needs.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [21v-gap](https://learn.microsoft.com/en-us/azure/storage/container-storage/container-storage-introduction)]`

## Phase 2: ACStor volume nexus has remote replica that gets d

### aks-426: ACStor PersistentVolumes become ReadOnly with kernel I/O errors (blk_update_requ...

**Root Cause**: ACStor volume nexus has remote replica that gets disconnected. When remote replica is disconnected, the nexus loses all healthy replicas and the filesystem is shut down by XFS.

**Solution**:
1) Port-forward api-rest pod (kubectl port-forward <api-rest-pod> -n acstor 8081:8081). 2) Verify volume nexus and replica are Online via curl. 3) Scale down application pod. 4) Wait then scale back up to remount the volume.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FACStor%20PersistentVolumes%20becoming%20ReadOnly)]`

## Phase 3: Requested storage size exceeds available capacity 

### aks-427: ACStor PersistentVolume creation fails with Operation failed due to insufficient...

**Root Cause**: Requested storage size exceeds available capacity in the ACStor storage pool. Check capacity with kubectl get sp -n acstor.

**Solution**:
Add StoragePool to support requested volume. For AzureDisk, expanding the DiskPool also works. Check io-engine pod status, OpenEBS diskpool state, and csi-controller/io-engine/operator-diskpool logs for other issues.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20PersistentVolumes%20issues)]`

## Phase 4: Either storage capacity is insufficient for the sn

### aks-428: ACStor snapshot creation fails with Not enough suitable pools available or Canno...

**Root Cause**: Either storage capacity is insufficient for the snapshot, or the volume has reached the maximum limit of 10 snapshots.

**Solution**:
Delete some existing snapshots or volumes to free capacity. Check csi-snapshotter, csi-controller, api-rest, agent-core, and io-engine container logs for other issues.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20Snapshots%20Issues)]`

## Phase 5: Hit maximum number of Elastic SAN per subscription

### aks-432: ACStor ElasticSan StoragePool creation fails with Maximum possible number of Ela...

**Root Cause**: Hit maximum number of Elastic SAN per subscription per region.

**Solution**:
Check Elastic SAN scale targets for the region. Delete unused Elastic SAN resources or deploy in a different region.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACStor/TSG/Creating%20Or%20Deleting%20StoragePools%20Issues)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer asks for ETA of Azure Container Storage (ACSTOR) in Azure China or trie... | Azure Container Storage is not available in Azure China (21V... | Azure Container Storage is not supported in 21V. Use Azure D... | [B] 6.0 | [21v-gap](https://learn.microsoft.com/en-us/azure/storage/container-storage/container-storage-introduction) |
| 2 | ACStor PersistentVolumes become ReadOnly with kernel I/O errors (blk_update_requ... | ACStor volume nexus has remote replica that gets disconnecte... | 1) Port-forward api-rest pod (kubectl port-forward <api-rest... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FACStor%20PersistentVolumes%20becoming%20ReadOnly) |
| 3 | ACStor PersistentVolume creation fails with Operation failed due to insufficient... | Requested storage size exceeds available capacity in the ACS... | Add StoragePool to support requested volume. For AzureDisk, ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20PersistentVolumes%20issues) |
| 4 | ACStor snapshot creation fails with Not enough suitable pools available or Canno... | Either storage capacity is insufficient for the snapshot, or... | Delete some existing snapshots or volumes to free capacity. ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20Snapshots%20Issues) |
| 5 | ACStor ElasticSan StoragePool creation fails with Maximum possible number of Ela... | Hit maximum number of Elastic SAN per subscription per regio... | Check Elastic SAN scale targets for the region. Delete unuse... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACStor/TSG/Creating%20Or%20Deleting%20StoragePools%20Issues) |
