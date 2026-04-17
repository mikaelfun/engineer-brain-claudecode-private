# AKS Azure Files SMB — smb -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS pod fails to mount Azure Files (CSI driver) with mount error; dynamic provis... | NSG on the AKS subnet blocks outbound TCP port 445 (SMB) to ... | 1) Check NSG rules on AKS node subnet: ensure outbound TCP 4... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Azure File shares on AKS Windows nodes show stale/inconsistent file visibility —... | Windows SMB client metadata caching defaults (DirectoryCache... | Deploy a HostProcess container CronJob to set DirectoryCache... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FWindows%20Host%20Process%20Container) |
| 3 | Azure Files mount to AKS pod fails with host is down error; DNS resolution retur... | Linux kernel DNS resolver regression in Ubuntu-azure-5.15.0-... | 1) Permanent fix: upgrade node OS to Ubuntu-azure-5.15.0-106... | [B] 7.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 4 | Azure File share mount error(2) No such file or directory - pod ContainerCreatin... | No connectivity on port 445: file share missing, NSG blocks,... | Verify file share exists; check port 445; check NSG; for FIP... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/fail-to-mount-azure-file-share) |
| 5 | chmod command does not take effect on Azure File share mounted in AKS pod. Custo... | Work by design. Azure Files (SMB) does not support POSIX fil... | 1) Set file/dir permissions at mount time using mountOptions... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Check NSG rules on AKS node subnet: ensure outbound TCP 445 is allowed to storage account IP or A `[source: onenote]`
2. Check: Deploy a HostProcess container CronJob to set DirectoryCacheLifetime=0 and FileNotFoundCacheLifetime `[source: ado-wiki]`
3. Check: 1) Permanent fix: upgrade node OS to Ubuntu-azure-5 `[source: onenote]`
