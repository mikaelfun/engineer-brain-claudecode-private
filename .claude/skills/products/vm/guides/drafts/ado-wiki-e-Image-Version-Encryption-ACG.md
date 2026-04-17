---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/TSGs/Image Version Encryption_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20(ACG)%2FTSGs%2FImage%20Version%20Encryption_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

Azure Compute Gallery image versions were encrypted at rest with platform-managed keys, until now.

Now, the image versions can be encrypted through the below options:

- PMK - Platform Managed Keys
- CMK - Customer Managed Keys
- Dual encryption: PMK+CMK

You also have the option to encrypt Azure Compute Gallery image versions at a disk level.

## Prerequisites

You must already have a disk encryption set in each region where you want to replicate your image.

- To use only a customer-managed key, see the articles about enabling customer-managed keys with server-side encryption by using the Azure portal or PowerShell.
  https://learn.microsoft.com/en-us/azure/virtual-machines/windows/disks-enable-customer-managed-keys-powershell

- To use both platform-managed and customer-managed keys (for double encryption), see the articles about enabling double encryption at rest by using the Azure portal or PowerShell.
  https://learn.microsoft.com/en-us/azure/virtual-machines/disks-enable-double-encryption-at-rest-portal

## Steps

To create encrypted image version through Portal:

1. On the Create VM image version, select the **Encryption** tab.
2. In the Encryption type, select any one of the below options: PMK, CMK, or Dual encryption (PMK+CMK).
3. For Customer-managed key and Double encryption with PMK+CMK, you need to select the **Disk name** and **Disk Encryption set**.

## Limitations

When using customer-managed keys for encrypting images in an Azure Compute Gallery:

- Encryption key sets are regional resources, so each region requires a different encryption key set.
- After you've used your own keys to encrypt a disk or image, you can't go back to using platform-managed keys for encrypting those disks or images.
- This feature does not currently support the Image version Source as VM image version and Storage Blob (VHDs).

## Creating VM from Encrypted Image Version

You can create a VM from an image version and use customer-managed keys to encrypt the disks. When creating the VM in the portal, on the Disks tab, select **Encryption at-rest with customer-managed keys** or **Double encryption with platform-managed and customer-managed keys** for Encryption type. Then select the encryption set from the drop-down list.

## Public Documents

- https://learn.microsoft.com/en-us/azure/virtual-machines/image-version-encryption
- https://learn.microsoft.com/en-us/azure/virtual-machines/windows/disks-enable-customer-managed-keys-powershell
- https://learn.microsoft.com/en-us/azure/virtual-machines/disks-enable-double-encryption-at-rest-portal
