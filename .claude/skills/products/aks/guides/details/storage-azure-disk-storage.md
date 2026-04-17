# AKS Azure Disk CSI — storage -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-backup-restore-aks-velero.md, ado-wiki-expand-or-resize-persistent-volume.md, ado-wiki-migrating-disks-lrs-to-zrs.md
**Generated**: 2026-04-07

---

## Phase 1: LRS disk replicates only within single AZ. When sc

### aks-045: Pod fails to start after migrating to new node in different AZ; Azure Disk PV mo...

**Root Cause**: LRS disk replicates only within single AZ. When scheduler moves pod to node in different AZ, pod cannot access LRS disk. K8s scheduler does not consider disk location by default.

**Solution**:
Option 1: Use ZRS disks (skuname: StandardSSD_ZRS). Option 2: Add nodeAffinity with topology.disk.csi.azure.com/zone to pin pod to same AZ. Check disk type via kubectl get pv + kubectl get sc. Check node AZ via kubectl describe nodes | grep topology.kubernetes.io/zone.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Accidental deletion of AKS cluster and associated 

### aks-529: Customer accidentally deleted AKS cluster and related resources, needs to recove...

**Root Cause**: Accidental deletion of AKS cluster and associated resources; disks may be soft-deleted rather than hard-deleted

**Solution**:
1. Verify disks are 'soft-deleted' via ASC (Resource Group → Microsoft.Compute → disks → check Disk Event). Hard-deleted disks cannot be restored. 2. Open collab with Disk Storage team using SAP 'Azure > Disk Storage > Disk Recovery'. 3. Advise customer to create new AKS cluster and attach recovered disks. Recommend Delete Locks and regular backups (e.g., Velero) as preventive measures.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FRecovering%20deleted%20disks)]`

## Phase 3: Azure Managed Disks of 4 TiB and larger only suppo

### aks-822: Disk attach fails with Only Disk CachingType None is supported for disk with siz...

**Root Cause**: Azure Managed Disks of 4 TiB and larger only support cachingmode=None. If the StorageClass or PV spec has cachingmode set to ReadOnly or ReadWrite, the disk attach operation is rejected by the compute API.

**Solution**:
Set cachingmode: none in the StorageClass parameters or PV spec for disks >= 4 TiB. For existing PVs: edit the PV to change cachingmode to None, delete and recreate the pod. Ref: https://docs.microsoft.com/en-us/azure/virtual-machines/windows/premium-storage-performance#disk-caching

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FDiskCachingInvalidForDiskSize%20-%20Only%20Disk%20CachingType%20%27None%27%20is%20supported%20for%20disk%20with%20size%20greater%20than%204095%20GB)]`

## Phase 4: For Azure Disks >= 4TiB, host-level disk caching (

### aks-890: StatefulSet pods fail to mount Azure Disk after PVC resize (e.g., 300Gi to 13Ti)...

**Root Cause**: For Azure Disks >= 4TiB, host-level disk caching (cachingMode: ReadOnly) is not supported. Using caching on large disks causes stale metadata and filesystem corruption during resize/reuse.

**Solution**:
Set cachingMode: None in StorageClass parameters for large disks (>= 4TiB). Recovery: scale StatefulSet to 0, delete corrupted PVC/PV, scale back up for fresh disk. YAML: parameters: { cachingMode: None }

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Azure%20disk%20corrupted%20data)]`

## Phase 5: Azure Disk CSI driver < 1.11 does not support onli

### aks-896: Azure Disk PV fails to mount: 'MountVolume.MountDevice failed while expanding vo...

**Root Cause**: Azure Disk CSI driver < 1.11 does not support online volume resizing. If PV/PVC capacity mismatch (e.g., disk resized in Portal without updating PV/PVC), mount fails.

**Solution**:
1) Scale down to 0. 2) Update PV and PVC capacity to match actual disk size. 3) If resized via Portal, snapshot disk then update PV/PVC. 4) If still failing, recreate PV/PVC at desired size, restore from snapshot. Upgrade CSI driver >= 1.11 for online resize.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Disk%20fails%20to%20mount%20due%20to%20node%20expansion%20errors)]`

## Phase 6: Default StorageClass managed-premium sets cachingm

### aks-1027: Attaching Azure Disk >= 4TiB to AKS pod fails with FailedAttachVolume: Only Disk...

**Root Cause**: Default StorageClass managed-premium sets cachingmode=ReadOnly, but Azure Managed Disks >= 4TiB only support CachingType=None. The disk provisioning succeeds but the attach operation is rejected by CRP.

**Solution**:
Create a custom StorageClass with cachingmode: None (e.g. managed-premium-caching-none) and reference it in the PVC. The CSI driver in newer versions silently forces caching to None for >4095GB disks, but the PV describe may still show the original setting.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FDiskCachingInvalidForDiskSize)]`

## Phase 7: A previous disk detach operation on the VM/VMSS in

### aks-1032: PVC attach fails with AttachDiskWhileBeingDetached: Cannot attach data disk to V...

**Root Cause**: A previous disk detach operation on the VM/VMSS instance either has not completed or failed, leaving the disk in a limbo state that prevents new attach operations.

**Solution**:
1) Confirm in VMSS instances that the disk is not actually attached. 2) Run az vm update (for VMs) or az vmss update-instances (for VMSS) to reconcile the VM state and clear the stale detach.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FPVC%20failure%20with%20error%20%22AttachDiskWhileBeingDetached%22)]`

## Phase 8: Inline ephemeral volumes in StatefulSets create PV

### aks-1033: PVCs stuck in Pending after Azure Backup restore; pod error: PVC was not created...

**Root Cause**: Inline ephemeral volumes in StatefulSets create PVCs with ownerReferences pointing to the pod. Azure Backup restore recreates PVCs without the ownerReferences metadata, so pods do not recognize the restored PVCs as owned by them, causing a deadlock.

**Solution**:
Configure the Azure Backup plan to exclude ephemeral volumes: 1) Add labels (e.g. notbackup=1) to the ephemeral volumeClaimTemplate metadata in StatefulSet spec. 2) Set backup label exclusion rule. Ephemeral volumes should not be backed up since their lifecycle is tied to the pod.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FPVC%20in%20pending%20after%20restoration)]`

## Phase 9: PremiumV2_LRS disks only support VMs in Availabili

### aks-1035: Pod fails to start with volume attachment is being deleted after scaling deploym...

**Root Cause**: PremiumV2_LRS disks only support VMs in Availability Zones. Initial attach to non-zonal VM succeeds (bug) but detach always fails with error about PremiumV2_LRS requiring AZ VMs, leaving a stale VolumeAttachment with detach error that blocks new attachments.

**Solution**:
Immediate: Delete the VolumeAttachment finalizers (kubectl edit volumeattachment and remove the finalizers section) to allow the stale attachment to be cleaned up. Long-term: Ensure PremiumV2_LRS PVs are only used with node pools in Availability Zones.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FPod%20fails%20to%20start%20with%20volume%20attachment%20is%20being%20deleted%20error)]`

## Phase 10: AKS only supports the managed version of Azure Dis

### aks-635: Customer reports Azure Disk CSI Driver issues but cluster uses the upstream OSS ...

**Root Cause**: AKS only supports the managed version of Azure Disk CSI Driver v2. The upstream open-source version is not supported by Microsoft and may have compatibility issues with AKS infrastructure.

**Solution**:
1) Check ASI (https://azureserviceinsights.trafficmanager.net/) to verify if managed version is enabled (blue check mark in Feature section); 2) If using OSS version, direct customer to upstream TSG and GitHub issues; 3) For managed version issues, classify by type: Creation/Deletion (check csi-azuredisk-controller in CCP), Attach/Detach (check controller + VM nodes), Mount/Unmount (check csi-azuredisk-node on customer nodes + kubelet logs).

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FAzure%20Disk%20CSI%20Driver%20v2)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Pod fails to start after migrating to new node in different AZ; Azure Disk PV mo... | LRS disk replicates only within single AZ. When scheduler mo... | Option 1: Use ZRS disks (skuname: StandardSSD_ZRS). Option 2... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Customer accidentally deleted AKS cluster and related resources, needs to recove... | Accidental deletion of AKS cluster and associated resources;... | 1. Verify disks are 'soft-deleted' via ASC (Resource Group →... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FRecovering%20deleted%20disks) |
| 3 | Disk attach fails with Only Disk CachingType None is supported for disk with siz... | Azure Managed Disks of 4 TiB and larger only support caching... | Set cachingmode: none in the StorageClass parameters or PV s... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FDiskCachingInvalidForDiskSize%20-%20Only%20Disk%20CachingType%20%27None%27%20is%20supported%20for%20disk%20with%20size%20greater%20than%204095%20GB) |
| 4 | StatefulSet pods fail to mount Azure Disk after PVC resize (e.g., 300Gi to 13Ti)... | For Azure Disks >= 4TiB, host-level disk caching (cachingMod... | Set cachingMode: None in StorageClass parameters for large d... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Azure%20disk%20corrupted%20data) |
| 5 | Azure Disk PV fails to mount: 'MountVolume.MountDevice failed while expanding vo... | Azure Disk CSI driver < 1.11 does not support online volume ... | 1) Scale down to 0. 2) Update PV and PVC capacity to match a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Disk%20fails%20to%20mount%20due%20to%20node%20expansion%20errors) |
| 6 | Attaching Azure Disk >= 4TiB to AKS pod fails with FailedAttachVolume: Only Disk... | Default StorageClass managed-premium sets cachingmode=ReadOn... | Create a custom StorageClass with cachingmode: None (e.g. ma... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FDiskCachingInvalidForDiskSize) |
| 7 | PVC attach fails with AttachDiskWhileBeingDetached: Cannot attach data disk to V... | A previous disk detach operation on the VM/VMSS instance eit... | 1) Confirm in VMSS instances that the disk is not actually a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FPVC%20failure%20with%20error%20%22AttachDiskWhileBeingDetached%22) |
| 8 | PVCs stuck in Pending after Azure Backup restore; pod error: PVC was not created... | Inline ephemeral volumes in StatefulSets create PVCs with ow... | Configure the Azure Backup plan to exclude ephemeral volumes... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FPVC%20in%20pending%20after%20restoration) |
| 9 | Pod fails to start with volume attachment is being deleted after scaling deploym... | PremiumV2_LRS disks only support VMs in Availability Zones. ... | Immediate: Delete the VolumeAttachment finalizers (kubectl e... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FPod%20fails%20to%20start%20with%20volume%20attachment%20is%20being%20deleted%20error) |
| 10 | Customer reports Azure Disk CSI Driver issues but cluster uses the upstream OSS ... | AKS only supports the managed version of Azure Disk CSI Driv... | 1) Check ASI (https://azureserviceinsights.trafficmanager.ne... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FAzure%20Disk%20CSI%20Driver%20v2) |
