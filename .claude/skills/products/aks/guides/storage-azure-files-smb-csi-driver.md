# AKS Azure Files SMB — csi-driver -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Files mount with Managed Identity fails on AKS < 1.34; MountVolume.SetUp f... | CSI Azure File driver version < 1.34 does not correctly hand... | Upgrade AKS to version >= 1.34.0 with CSI Driver enabled. Ve... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Dynamic Azure Files PVC provisioning fails with Kerberos auth error; CSI driver ... | CSI driver reuses pre-existing storage account in MC_XXX res... | Manually enable SMBAuth on existing SAs in MC_XXX RG. Or del... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After rotating storage account key, AKS pods fail to mount Azure Files PV; Kuber... | Kubernetes secret storing storage account key (azure-storage... | For new PVs: Set storeAccountKey=false in StorageClass to us... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Need to mount Azure Files NFS share on AKS pods in Mooncake; default SMB-based A... | Azure Files NFS requires: 1) Premium FileStorage account (mi... | 1) Create Premium FileStorage account: az storage account cr... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |

## Quick Troubleshooting Path

1. Check: Upgrade AKS to version >= 1 `[source: onenote]`
2. Check: Manually enable SMBAuth on existing SAs in MC_XXX RG `[source: onenote]`
3. Check: For new PVs: Set storeAccountKey=false in StorageClass to use kubelet MSI `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-azure-files-smb-csi-driver.md)
