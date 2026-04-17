# AKS Azure Files NFS -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Blob NFS mount on AKS pods fails or is misconfigured; NFS 3.0 requests can... | NFS 3.0 protocol is keyless - it does not support account ke... | 1) Enable private endpoint or selected VNET for the storage ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS worker nodes cannot resolve custom internal DNS names (e.g., NFS mount targe... | AKS nodes use Azure DNS by default and cannot resolve names ... | Deploy a DaemonSet in kube-system that uses nsenter (privile... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Customizing%20node%20hosts%20file) |
| 3 | NFS 3.0 mounted blob storage is only accessible as root user in AKS pods; non-ro... | Default NFS 3.0 container mount mode is 0750, preventing non... | Install NFS CSI Driver for Kubernetes (csi-driver-nfs) which... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FUsing%20NFS%203.0%20to%20mount%20blob%20storage%20as%20non%20root%20user) |
| 4 | Blob PV mount fails with: 'rpc error: code = Aborted desc = An operation with th... | fsGroup ownership setting takes extremely long with large nu... | Check file count in blob container. Use fsGroupChangePolicy:... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20mount%20error%20the%20given%20Volume%20ID%20already%20exists) |
| 5 | BlobFuse/NFS 3.0 mount context deadline exceeded or volume ID already exists | NSG blocks port 443 (BlobFuse) or ports 111/2049 (NFS); or v... | Check NSG allows outbound to storage on required ports; add ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail) |
| 6 | NFS 3.0 Blob mount access denied by server | AKS VNET/subnet not added to storage account selected networ... | Add AKS VNET and subnet to storage account networking firewa... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail) |

## Quick Troubleshooting Path

1. Check: 1) Enable private endpoint or selected VNET for the storage account `[source: onenote]`
2. Check: Deploy a DaemonSet in kube-system that uses nsenter (privileged, hostPID) to append DNS resolution r `[source: ado-wiki]`
3. Check: Install NFS CSI Driver for Kubernetes (csi-driver-nfs) which defaults mount permissions to 0777 allo `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-azure-files-nfs.md)
