# AKS Azure Container Storage — 21v-unsupported -- Quick Reference

**Sources**: 2 | **21V**: None | **Entries**: 5
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer asks for ETA of Azure Container Storage (ACSTOR) in Azure China or trie... | Azure Container Storage is not available in Azure China (21V... | Azure Container Storage is not supported in 21V. Use Azure D... | [B] 6.0 | [21v-gap](https://learn.microsoft.com/en-us/azure/storage/container-storage/container-storage-introduction) |
| 2 | ACStor PersistentVolumes become ReadOnly with kernel I/O errors (blk_update_requ... | ACStor volume nexus has remote replica that gets disconnecte... | 1) Port-forward api-rest pod (kubectl port-forward <api-rest... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FACStor%20PersistentVolumes%20becoming%20ReadOnly) |
| 3 | ACStor PersistentVolume creation fails with Operation failed due to insufficient... | Requested storage size exceeds available capacity in the ACS... | Add StoragePool to support requested volume. For AzureDisk, ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20PersistentVolumes%20issues) |
| 4 | ACStor snapshot creation fails with Not enough suitable pools available or Canno... | Either storage capacity is insufficient for the snapshot, or... | Delete some existing snapshots or volumes to free capacity. ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20Snapshots%20Issues) |
| 5 | ACStor ElasticSan StoragePool creation fails with Maximum possible number of Ela... | Hit maximum number of Elastic SAN per subscription per regio... | Check Elastic SAN scale targets for the region. Delete unuse... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACStor/TSG/Creating%20Or%20Deleting%20StoragePools%20Issues) |

## Quick Troubleshooting Path

1. Check: Azure Container Storage is not supported in 21V `[source: 21v-gap]`
2. Check: 1) Port-forward api-rest pod (kubectl port-forward <api-rest-pod> -n acstor 8081:8081) `[source: ado-wiki]`
3. Check: Add StoragePool to support requested volume `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-acstor-21v-unsupported.md)
