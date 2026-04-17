---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/Attributes for Image Gallery Definition & Version_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FAttributes%20for%20Image%20Gallery%20Definition%20%26%20Version_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

Below are the list of Attributes you could use for Image Gallery, Image Definition and Image Version and gives details on which ones are mandatory and optional.

## Attributes for Shared Image Gallery, Image Definition and Image Version

### Image Gallery

| Name | Required | Modifiable | Description |
|------|----------|------------|-------------|
| Resource Group | Yes | No | The resource group to host the gallery |
| Region | No | No | The region where the gallery will be located. Default: region of the resource group. |
| Name | Yes | No | The name to give the gallery container |
| Description | No | Yes | The description of the gallery container |

### Image Definition

| Name | Required | Modifiable | Description |
|------|----------|------------|-------------|
| Gallery | Yes | No | The parent gallery container for this image definition |
| Name | Yes | No | The name for this image definition |
| Region | No | No | The region where the image definition will be located. Default: region of the resource group. |
| Operating system state | No | No | Generalized or Specialized. Default: Generalized |
| Operating system type | Yes | No | Windows or Linux |
| Hyper-V Generation | No | No | V1 or V2. Default: V1 |
| Description | No | Yes | A description of the set of images in this definition |
| Publisher | Yes | No | Name of image publisher. Publisher+Offer+SKU must be unique within a gallery. |
| Offer | Yes | No | Type of image offer. Publisher+Offer+SKU must be unique within a gallery. |
| SKU | Yes | No | Image SKU. Publisher+Offer+SKU must be unique within a gallery. |
| End-user license agreement (EULA) | No | No | URI to EULA |
| Privacy Statement | No | No | URI to privacy statement |
| Release notes | No | No | URI to release notes |
| End-of-life date | No | Yes | Recommended default expiration date. Not strictly enforced. Format: yyyy-MM-dd or ISO 8601 |
| Min/Max vCPU recommendations | No | No | Not strictly enforced |
| Min/Max memory recommendations | No | No | Not strictly enforced |
| Disallowed disk types | No | No | Standard_LRS, Premium_LRS |
| Purchase plan: name | No | No | The name of the purchase plan |
| Purchase plan: product | No | No | The product name of the purchase plan |
| Purchase plan: publisher | No | No | The publisher name tied to the product and purchase plan |

### Image Version

| Name | Required | Modifiable | Description |
|------|----------|------------|-------------|
| Resource Group | Yes | No | The resource group to host the image version |
| Region | Yes | No | Must be same region as the source |
| Gallery | Yes | No | Parent gallery container |
| Image Definition | Yes | No | Parent image definition container |
| Name (version number) | Yes | No | Format: Major.Minor.Patch (integers) |
| Source | Yes | No | VM, managed image, disk, snapshot, or another image version |
| OS Disk | No | No | If using disks/snapshots as source, set the OS disk |
| Data disk | No | No | Managed disk or snapshot for data disk |
| LUN | No | No | LUN number for data disk |
| Exclude from latest | No | Yes | If true, not considered for latest version. Default: false |
| End of life date | No | Yes | Recommended expiration date. Not strictly enforced. Format: yyyy-MM-dd or ISO 8601 |
| Storage account type | No | Yes | Standard_LRS, Standard_ZRS, Premium_LRS. Default: Standard_LRS |
| Replica count | No | Yes | Number of copies per region. 1-10. Default: 1. Supports 20 simultaneous VM deployments or 600 VMSS deployments per copy. |
| Target regions | Yes | Yes | List of regions. Source region must be included. |
| Target regions encryption | No | No | Disk encryption sets to attach. Any OS or data disk encrypted in one region must be encrypted in all regions. |
