# AKS Azure Disk CSI — storage -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 10
**Last updated**: 2026-04-07

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Option 1: Use ZRS disks (skuname: StandardSSD_ZRS) `[source: onenote]`
2. Check: 1 `[source: ado-wiki]`
3. Check: Set cachingmode: none in the StorageClass parameters or PV spec for disks >= 4 TiB `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-azure-disk-storage.md)
