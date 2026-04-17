# AKS Azure Files SMB — csi-driver -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: onenote-aks-smb-csi-driver.md
**Generated**: 2026-04-07

---

## Phase 1: CSI Azure File driver version < 1.34 does not corr

### aks-065: Azure Files mount with Managed Identity fails on AKS < 1.34; MountVolume.SetUp f...

**Root Cause**: CSI Azure File driver version < 1.34 does not correctly handle Mooncake OIDC issuer endpoint; ClientAssertionCredential fails endpoint resolution

**Solution**:
Upgrade AKS to version >= 1.34.0 with CSI Driver enabled. Verify CSI driver version supports Mooncake OIDC issuer.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: CSI driver reuses pre-existing storage account in 

### aks-067: Dynamic Azure Files PVC provisioning fails with Kerberos auth error; CSI driver ...

**Root Cause**: CSI driver reuses pre-existing storage account in MC_XXX resource group that does not have SMBAuth enabled. PV/PVC creation uses AKS Control Plane identity while mount uses either User Assigned MI or Kubelet Identity.

**Solution**:
Manually enable SMBAuth on existing SAs in MC_XXX RG. Or delete pre-existing SA so CSI driver auto-creates new one with SMBAuth. Assign Storage File Data SMB MI Admin role to appropriate identity.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Kubernetes secret storing storage account key (azu

### aks-069: After rotating storage account key, AKS pods fail to mount Azure Files PV; Kuber...

**Root Cause**: Kubernetes secret storing storage account key (azure-storage-account-{name}-secret) is not auto-updated after key rotation.

**Solution**:
For new PVs: Set storeAccountKey=false in StorageClass to use kubelet MSI. For existing PVs: grant kubelet identity permission, delete azure-storage-account-{name}-secret secrets, recreate pods.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Azure Files NFS requires: 1) Premium FileStorage a

### aks-283: Need to mount Azure Files NFS share on AKS pods in Mooncake; default SMB-based A...

**Root Cause**: Azure Files NFS requires: 1) Premium FileStorage account (minimum 100GB share), 2) Secure transfer disabled (--https-only false), 3) Private endpoint with private DNS zone (privatelink.file.core.chinacloudapi.cn) linked to AKS VNET. Without these configurations, NFS mount will fail.

**Solution**:
1) Create Premium FileStorage account: az storage account create --sku Premium_LRS --kind FileStorage. 2) Disable secure transfer: az storage account update --https-only false. 3) Create NFS share: az storage share-rm create --enabled-protocol NFS --root-squash RootSquash --quota 100. 4) Create private endpoint for file group-id. 5) Create private DNS zone privatelink.file.core.chinacloudapi.cn and link to AKS VNET. 6) Add DNS A record pointing to private endpoint IP. 7) Create StorageClass with provisioner file.csi.azure.com and protocol nfs. 8) Create PV/PVC/Pod referencing NFS share.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 3.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Files mount with Managed Identity fails on AKS < 1.34; MountVolume.SetUp f... | CSI Azure File driver version < 1.34 does not correctly hand... | Upgrade AKS to version >= 1.34.0 with CSI Driver enabled. Ve... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Dynamic Azure Files PVC provisioning fails with Kerberos auth error; CSI driver ... | CSI driver reuses pre-existing storage account in MC_XXX res... | Manually enable SMBAuth on existing SAs in MC_XXX RG. Or del... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After rotating storage account key, AKS pods fail to mount Azure Files PV; Kuber... | Kubernetes secret storing storage account key (azure-storage... | For new PVs: Set storeAccountKey=false in StorageClass to us... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Need to mount Azure Files NFS share on AKS pods in Mooncake; default SMB-based A... | Azure Files NFS requires: 1) Premium FileStorage account (mi... | 1) Create Premium FileStorage account: az storage account cr... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
