# AKS Azure Files NFS -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-using-nfs-for-pod-storage.md
**Generated**: 2026-04-07

---

## Phase 1: NFS 3.0 protocol is keyless - it does not support 

### aks-135: Azure Blob NFS mount on AKS pods fails or is misconfigured; NFS 3.0 requests can...

**Root Cause**: NFS 3.0 protocol is keyless - it does not support account key authorization, Microsoft Entra security, or ACLs. NFS 3.0 storage account must be configured with private endpoint or selected VNET access only. AKS 1.27+ supports IP address changes for Blob NFS mounts via aznfs mount helper.

**Solution**:
1) Enable private endpoint or selected VNET for the storage account. 2) Install aznfs mount helper package on AKS 1.27+ for IP address change support. 3) Use no_root_squash carefully (security risk). Ref: https://learn.microsoft.com/azure/storage/blobs/network-file-system-protocol-support-how-to

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS nodes use Azure DNS by default and cannot reso

### aks-479: AKS worker nodes cannot resolve custom internal DNS names (e.g., NFS mount targe...

**Root Cause**: AKS nodes use Azure DNS by default and cannot resolve names managed by external/on-prem DNS servers unless explicitly configured.

**Solution**:
Deploy a DaemonSet in kube-system that uses nsenter (privileged, hostPID) to append DNS resolution results to /etc/hosts on each node. The DaemonSet container runs 'dig A +short <hostname> @<external-dns-ip>' and writes the result to /etc/hosts via nsenter --target 1 --mount.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Customizing%20node%20hosts%20file)]`

## Phase 3: Default NFS 3.0 container mount mode is 0750, prev

### aks-530: NFS 3.0 mounted blob storage is only accessible as root user in AKS pods; non-ro...

**Root Cause**: Default NFS 3.0 container mount mode is 0750, preventing non-root user access to the volume

**Solution**:
Install NFS CSI Driver for Kubernetes (csi-driver-nfs) which defaults mount permissions to 0777 allowing non-root access. Custom permissions can be set via '--set driver.mountPermissions=0755' during helm install. Use PV with driver: nfs.csi.k8s.io and volumeAttributes for blob NFS endpoint.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FUsing%20NFS%203.0%20to%20mount%20blob%20storage%20as%20non%20root%20user)]`

## Phase 4: fsGroup ownership setting takes extremely long wit

### aks-894: Blob PV mount fails with: 'rpc error: code = Aborted desc = An operation with th...

**Root Cause**: fsGroup ownership setting takes extremely long with large number of files in blob container. CSI driver retries mount while previous operation still runs (setting volume ownership), causing 'already exists' conflict and eventual timeout.

**Solution**:
Check file count in blob container. Use fsGroupChangePolicy: OnRootMismatch in pod securityContext to reduce ownership change time. Verify network connectivity. See MS Learn blob storage mount troubleshooting guide for other causes.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20mount%20error%20the%20given%20Volume%20ID%20already%20exists)]`

## Phase 5: NSG blocks port 443 (BlobFuse) or ports 111/2049 (

### aks-1304: BlobFuse/NFS 3.0 mount context deadline exceeded or volume ID already exists

**Root Cause**: NSG blocks port 443 (BlobFuse) or ports 111/2049 (NFS); or virtual appliance/firewall blocks traffic

**Solution**:
Check NSG allows outbound to storage on required ports; add route bypassing virtual appliance

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail)]`

## Phase 6: AKS VNET/subnet not added to storage account selec

### aks-1305: NFS 3.0 Blob mount access denied by server

**Root Cause**: AKS VNET/subnet not added to storage account selected networks

**Solution**:
Add AKS VNET and subnet to storage account networking firewall rules

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Blob NFS mount on AKS pods fails or is misconfigured; NFS 3.0 requests can... | NFS 3.0 protocol is keyless - it does not support account ke... | 1) Enable private endpoint or selected VNET for the storage ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS worker nodes cannot resolve custom internal DNS names (e.g., NFS mount targe... | AKS nodes use Azure DNS by default and cannot resolve names ... | Deploy a DaemonSet in kube-system that uses nsenter (privile... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Customizing%20node%20hosts%20file) |
| 3 | NFS 3.0 mounted blob storage is only accessible as root user in AKS pods; non-ro... | Default NFS 3.0 container mount mode is 0750, preventing non... | Install NFS CSI Driver for Kubernetes (csi-driver-nfs) which... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FUsing%20NFS%203.0%20to%20mount%20blob%20storage%20as%20non%20root%20user) |
| 4 | Blob PV mount fails with: 'rpc error: code = Aborted desc = An operation with th... | fsGroup ownership setting takes extremely long with large nu... | Check file count in blob container. Use fsGroupChangePolicy:... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20mount%20error%20the%20given%20Volume%20ID%20already%20exists) |
| 5 | BlobFuse/NFS 3.0 mount context deadline exceeded or volume ID already exists | NSG blocks port 443 (BlobFuse) or ports 111/2049 (NFS); or v... | Check NSG allows outbound to storage on required ports; add ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail) |
| 6 | NFS 3.0 Blob mount access denied by server | AKS VNET/subnet not added to storage account selected networ... | Add AKS VNET and subnet to storage account networking firewa... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail) |
