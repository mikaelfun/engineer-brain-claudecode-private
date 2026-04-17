# AKS Azure Files SMB — general -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 11
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Files mount with Managed Identity fails with setCredentialCache failed and... | Storage account SMBAuth (SMBOAuth) feature not enabled; requ... | Enable SMBAuth on storage account: PowerShell: Set-AzStorage... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Pods with Azure File Share (CSI) attached enter CrashLoopBackOff/CreateContainer... | K8s bug (kubernetes/kubernetes#117513): kubelet volume recon... | Upgrade AKS to K8s 1.28.x where the fix is included. Diagnos... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Get-SmbClientConfiguration or Set-SmbClientConfiguration cmdlets not found / Smb... | NanoServer-based container images (e.g. mcr.microsoft.com/po... | Use Windows Server Core image (mcr.microsoft.com/windows/ser... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FWindows%20Host%20Process%20Container) |
| 4 | PVC Pending - Failed to create file share: 403 AuthorizationFailure with dynamic... | Storage account firewall blocks persistentvolume-controller;... | Use static provisioning; or allow AKS VNET in storage accoun... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/create-file-share-failed-storage-account) |
| 5 | Azure File share mount error(13) Permission denied - storage account key mismatc... | Key rotated but Kubernetes secret still has old key | kubectl edit secret to update base64-encoded key; recreate p... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-file-share) |
| 6 | Azure File share mount error(13) - storage account Selected Networks missing AKS... | Storage account restricted to selected networks but AKS VNET... | Add AKS VNET and subnet to storage account networking | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-file-share) |
| 7 | Azure File share mount error(13) via private link - FQDN resolves to public IP i... | Private DNS zone missing virtual network link for AKS VNET | Create virtual network link for AKS VNET in privatelink.file... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-file-share) |
| 8 | Azure File share mount fails with 'host is down' after storage account key rotat... | Storage account key changed but Kubernetes secret azurestora... | Update azurestorageaccountkey in Kubernetes secret with base... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/file-share-mount-failures-azure-files) |
| 9 | After upgrading AKS to Kubernetes 1.19.7, Azure Files volume mount fails; pod se... | Bug in Kubernetes 1.19.7 broke Azure Files CSI driver namesp... | Upgrade to a patched AKS 1.19.x version; or manually create ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | Azure File share mount fails - encryption incompatible with AKS < 1.25 kernel | AKS < 1.25 kernel 5.4 only supports AES-128; Maximum securit... | Use Maximum compatibility profile or enable AES-128-GCM; AKS... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-file-share) |
| 11 | Azure File share mount error(13) - security profile without NTLM v2 authenticati... | SMB security profile requires NTLM v2 but disabled | Enable NTLM v2 or use Maximum compatibility profile | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-file-share) |

## Quick Troubleshooting Path

1. Check: Enable SMBAuth on storage account: PowerShell: Set-AzStorageAccount -ResourceGroupName <rg> -Name <s `[source: onenote]`
2. Check: Upgrade AKS to K8s 1 `[source: onenote]`
3. Check: Use Windows Server Core image (mcr `[source: ado-wiki]`
