---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Server Side Encryption (SSE)/Disable SSE+CMK on Disks_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FServer%20Side%20Encryption%20(SSE)%2FDisable%20SSE%2BCMK%20on%20Disks_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Disable SSE+CMK on VM Disks

## Summary

How to disable SSE+CMK encryption and revert to SSE+PMK (platform-managed keys). When SSE+CMK is disabled, disks automatically revert to SSE+PMK.

**Prerequisite: VM must be deallocated before changing disk encryption.**

## Portal Instructions

1. Go to Azure Portal > select encrypted VM > **Disks**
2. Click on the OS or Data Disk Name
3. Click **Encryption** tab
4. Change Key Type to **Platform-Managed Key**
5. Click **Save**
6. Validate: Go back to Disks > Refresh > confirm encryption shows SSE+PMK

**Note:** Once SSE+CMK is disabled, the resource is no longer part of the associated Disk Encryption Set.

## PowerShell Instructions

```powershell
$rgName = "yourResourceGroupName"
$diskName = "yourDiskName"
New-AzDiskUpdateConfig -EncryptionType "EncryptionAtRestWithPlatformKey" | Update-AzDisk -ResourceGroupName $rgName -DiskName $diskName
```

## CLI Instructions

```bash
rgName="yourResourceGroupName"
diskName="yourDiskName"
az disk update -n $diskName -g $rgName --encryption-type EncryptionAtRestWithPlatformKey
```
