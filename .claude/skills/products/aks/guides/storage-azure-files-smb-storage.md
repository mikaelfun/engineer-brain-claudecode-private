# AKS Azure Files SMB — storage -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 9
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Files PVC mount fails with MountVolume.MountDevice failed and mount error(... | Storage account access key was rotated but the Kubernetes se... | Delete the old Kubernetes secret and recreate it with the ne... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2Fstorage%20accesskey%20changed) |
| 2 | After migrating data between storage types (e.g., Managed Disk to Azure File Sha... | Different filesystems use different block sizes. ext4 defaul... | For Azure Managed Disks, configure the StorageClass with cus... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Analyzing%20Disk%20Utilization) |
| 3 | PVC expansion past 5TiB for Azure Files Standard shares fails with VolumeResizeF... | Azure File Standard-tier shares have a maximum quota of 5TiB... | Enable Large File Shares on the storage account: Azure Porta... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Azure%20File%20CSI%20PVC%20Expansion%205TiB%20fails) |
| 4 | Azure Files NFS PV mount fails with access denied by server when using a pre-cre... | Pre-created storage account network configuration is not set... | 1) Set storage account Public network access to Enabled from... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FIncorrect%20network%20configuration%20causes%20NFS%20mount%20failures) |
| 5 | PVC mount fails on Windows AKS node with New-SmbGlobalMapping: Multiple connecti... | SMB limitation on Windows: when two PVs referencing the same... | Instead of creating separate PVs for different folders in th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FMount%20failures%20on%20windows%20node) |
| 6 | Azure Files PV mount fails with MountVolume.MountDevice failed / mount failed: e... | The NVA or firewall present in the network path does not hav... | Update firewall rules to allow SMB traffic and access to sto... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FMountVolume.MountDevice%20failed%20for%20volume) |
| 7 | Mounting Azure Files fails on FIPS-enabled AKS nodes with default Azure Files pr... | Default Azure Files authentication methods (SMB with NTLM/Ke... | Install Azure File CSI driver (for AKS < 1.21; built-in for ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FMounting%20Azure%20Files%20on%20FIPS%20nodes) |
| 8 | PostgreSQL on Azure Files: could not change permissions of directory - Operation... | Azure Files uses CIFS/SMB - permissions cannot be changed af... | Use Azure Disk plugin instead; use subPath property | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/could-not-change-permissions-azure-files) |
| 9 | Customer needs to mount a non-Azure SMB share (e.g., Windows File Server in same... | AKS natively supports Azure Files SMB to Azure Storage only;... | 1) Install: helm repo add csi-driver-smb https://raw.githubu... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |

## Quick Troubleshooting Path

1. Check: Delete the old Kubernetes secret and recreate it with the new storage access key: kubectl delete sec `[source: ado-wiki]`
2. Check: For Azure Managed Disks, configure the StorageClass with custom blocksize parameter (e `[source: ado-wiki]`
3. Check: Enable Large File Shares on the storage account: Azure Portal > Storage Account > File shares > Enab `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-azure-files-smb-storage.md)
