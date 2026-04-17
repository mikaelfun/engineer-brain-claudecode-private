# AKS Azure Files SMB — storage -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: mslearn-mountoptions-azure-files.md
**Generated**: 2026-04-07

---

## Phase 1: Storage account access key was rotated but the Kub

### aks-815: Azure Files PVC mount fails with MountVolume.MountDevice failed and mount error(...

**Root Cause**: Storage account access key was rotated but the Kubernetes secret (azure-storage-account-{accountname}-secret) used by CSI driver still contains the old key, causing CIFS mount authentication failure.

**Solution**:
Delete the old Kubernetes secret and recreate it with the new storage access key: kubectl delete secret <secret-name> -n <ns> && kubectl create secret generic azure-storage-account-{accountname}-secret --from-literal=azurestorageaccountname=xxx --from-literal=azurestorageaccountkey=xxx --type=Opaque -n <ns>. Then restart the deployments.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2Fstorage%20accesskey%20changed)]`

## Phase 2: Different filesystems use different block sizes. e

### aks-888: After migrating data between storage types (e.g., Managed Disk to Azure File Sha...

**Root Cause**: Different filesystems use different block sizes. ext4 defaults to 4096-byte blocks while CIFS uses 512-byte blocks. Small files waste different amounts of space due to internal fragmentation, causing apparent utilization differences.

**Solution**:
For Azure Managed Disks, configure the StorageClass with custom blocksize parameter (e.g., blocksize: '512') to match destination filesystem. Azure File Shares do not support block size customization. Efficient disk utilization requires understanding customer usage patterns.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Analyzing%20Disk%20Utilization)]`

## Phase 3: Azure File Standard-tier shares have a maximum quo

### aks-889: PVC expansion past 5TiB for Azure Files Standard shares fails with VolumeResizeF...

**Root Cause**: Azure File Standard-tier shares have a maximum quota of 5TiB (5120 GiB) unless Large File Share feature is enabled. Attempting to resize beyond this limit causes persistent 400 errors. Resizing down is also unsupported.

**Solution**:
Enable Large File Shares on the storage account: Azure Portal > Storage Account > File shares > Enable 'Large file shares' > Save. Or CLI: az storage account update --name <name> -g <rg> --enable-large-file-share. Max bumps to 100 TiB.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Azure%20File%20CSI%20PVC%20Expansion%205TiB%20fails)]`

## Phase 4: Pre-created storage account network configuration 

### aks-1028: Azure Files NFS PV mount fails with access denied by server when using a pre-cre...

**Root Cause**: Pre-created storage account network configuration is not set to Enabled from selected virtual networks and IP addresses with the AKS subnet authorized. The CSI driver auto-configures this for dynamically created accounts, but static provisioning requires manual network setup.

**Solution**:
1) Set storage account Public network access to Enabled from selected virtual networks and IP addresses. 2) Add the AKS subnet to the authorized virtual networks list. 3) Wait several minutes for propagation, then redeploy pods.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FIncorrect%20network%20configuration%20causes%20NFS%20mount%20failures)]`

## Phase 5: SMB limitation on Windows: when two PVs referencin

### aks-1029: PVC mount fails on Windows AKS node with New-SmbGlobalMapping: Multiple connecti...

**Root Cause**: SMB limitation on Windows: when two PVs referencing the same Azure Files storage account but different folder names are mounted on the same node, the second mount fails due to SMB single-session-per-server constraint.

**Solution**:
Instead of creating separate PVs for different folders in the same share, use a single PV and use subPath in the pod volumeMounts to mount different subdirectories.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FMount%20failures%20on%20windows%20node)]`

## Phase 6: The NVA or firewall present in the network path do

### aks-1030: Azure Files PV mount fails with MountVolume.MountDevice failed / mount failed: e...

**Root Cause**: The NVA or firewall present in the network path does not have rules allowing SMB traffic to the Azure File Share. Connection attempts to the storage account URL time out.

**Solution**:
Update firewall rules to allow SMB traffic and access to storage wildcard domains (*.file.core.windows.net). Alternatively, use Private Endpoints (requires GPv2 storage) or Service Endpoints on the AKS subnet to bypass the firewall for storage traffic.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FMountVolume.MountDevice%20failed%20for%20volume)]`

## Phase 7: Default Azure Files authentication methods (SMB wi

### aks-1031: Mounting Azure Files fails on FIPS-enabled AKS nodes with default Azure Files pr...

**Root Cause**: Default Azure Files authentication methods (SMB with NTLM/Kerberos) conflict with FIPS encryption requirements on FIPS-enabled nodes, causing mount operations to fail.

**Solution**:
Install Azure File CSI driver (for AKS < 1.21; built-in for >= 1.21) and create a custom StorageClass with protocol: nfs. Ensure AKS node pool identity has Storage Contributor role on the target resource group. Remove manual driver installation before upgrading to 1.21+.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FMounting%20Azure%20Files%20on%20FIPS%20nodes)]`

## Phase 8: Azure Files uses CIFS/SMB - permissions cannot be 

### aks-1286: PostgreSQL on Azure Files: could not change permissions of directory - Operation...

**Root Cause**: Azure Files uses CIFS/SMB - permissions cannot be changed after mount

**Solution**:
Use Azure Disk plugin instead; use subPath property

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/could-not-change-permissions-azure-files)]`

## Phase 9: AKS natively supports Azure Files SMB to Azure Sto

### aks-041: Customer needs to mount a non-Azure SMB share (e.g., Windows File Server in same...

**Root Cause**: AKS natively supports Azure Files SMB to Azure Storage only; mounting arbitrary SMB servers requires open-source kubernetes-csi/csi-driver-smb (community-supported, NOT Microsoft official support scope)

**Solution**:
1) Install: helm repo add csi-driver-smb https://raw.githubusercontent.com/kubernetes-csi/csi-driver-smb/master/charts && helm install csi-driver-smb csi-driver-smb/csi-driver-smb --namespace kube-system; 2) Create credentials: kubectl create secret generic smbcreds --from-literal username=X --from-literal password=Y; 3) Create PV YAML: csi.driver=smb.csi.k8s.io, volumeAttributes.source="//IP/shareName", nodeStageSecretRef=smbcreds, accessModes=ReadWriteMany (required), unique volumeHandle; 4) Create PVC with storageClassName="" (empty string, explicit) bound to PV; 5) Mount via Deployment volumeMounts. CAVEATS: Kubernetes does NOT enforce PV capacity for SMB/NFS — capacity field is informational only; SMB server must be in same or peered VNET; this is github community scope only — for Azure File issues escalate to product team

`[Score: [B] 5.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

---

## Known Issues Quick Reference

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
