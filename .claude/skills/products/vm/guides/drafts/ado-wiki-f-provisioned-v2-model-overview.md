---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Provisioned V2 model Overview_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Provisioned%20V2%20model%20Overview_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-11-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


# Overview

The high-level purpose of the provisioned v2 model is to provide a billing model to Azure Files customers that is predictable, deterministic, and similar to on-premises solutions, with an additional focus on the experience provided by cloud file-sharing solutions from other hyperscale cloud providers. Customers should be able to understand how the different aspects of their chosen provisioning tie into their bill, and prospective customers should be able to predict, with a high degree of accuracy, what their Azure Files bill will be before deploying their first share in Azure Files.

## Provisioned v2 model

In a provisioned model, the primary costs of the Azure file share are based on the amount of storage, IOPS, and throughput you provision when you create or update your file share, irrespective of actual usage. With the provisioned v2 billing model, you can separately provision storage, IOPS, and throughput, although we will recommend IOPS and throughput provisioning to you based on the amount of provisioned storage you select. For more information on the provisioned v2 billing model, see understanding the provisioned v2 billing model.

With our provisioned v2 model, we are adopting a provisioned model similar, but not identical to, the provisioned model used by Premium SSD v2 disks. Customers will provision storage, IOPS, and throughput as separate quantities.

Our provisioned v2 model will recommend IOPS and throughput provisioning based on their requested storage provisioning. Customers can choose to accept our recommendations or go with different provisioned quantities that are higher or lower than our recommendations. Customers can also change the provisioning of all three quantities after share creation, enabling customers to optimize once they have a clearer idea of what their needs are. This is different behavior from Premium SSD v2 disks, where customers must explicitly provision storage, IOPS, and throughput. IOPS and throughput recommendations are based on telemetry such that the majority of existing customers are not throttled at expected provisioned storage sizes.

**Costs**

In a provisioned model, customers are charged for what they provisioned for each of these quantities, regardless of their actual usage. If the customer uses less than the amount they�ve provisioned of each quantity, the price of their file share will not change. If the customer uses more IOPS or throughput than what they have provisioned, their IOs will be throttled. If the customer fills up a share completely to the provisioned storage size, the share will become read-only.

**Changing the amount of IOPS and throughput**

The amount of storage, IOPS, and throughput you provision can be dynamically scaled up or down as your needs change. However, you can only decrease a provisioned quantity after 24 hours have elapsed since your last quantity increase. Storage, IOPS, and throughput changes are effective within a few minutes after a provisioning change.

### Availability

The provisioned v2 model is provided for file shares in storage accounts with the FileStorage storage account kind. At present, the following subsets of storage account SKUs are available:

| Storage account kind | Storage account SKU | Type of file share available |
|-|-|-|
| FileStorage | StandardV2_LRS | HDD provisioned v2 file shares with Local (LRS) redundancy specified. |
| FileStorage | StandardV2_ZRS | HDD provisioned v2 file shares with Zone (ZRS) redundancy specified. |
| FileStorage | StandardV2_GRS | HDD provisioned v2 file shares with Geo (GRS) redundancy specified. |
| FileStorage | StandardV2_GZRS | HDD provisioned v2 file shares with GeoZone (GZRS) redundancy specified. |

Currently, these SKUs are generally available in a limited subset of regions:

- France Central
- France South
- Australia East
- Australia Southeast
- East Asia
- Southeast Asia
- West US 2
- West Central US
- West Europe
- North Europe

- [For the latest updates see.](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#provisioned-v2-availability)

### Provisioned v2 provisioning detail

When you create a provisioned v2 file share, you specify the provisioned capacity for the file share in terms of storage, IOPS, and throughput. File shares are limited based on the following attributes:

| Item | HDD value |
|-|-|
| Storage provisioning unit | 1 GiB |
| IOPS provisioning unit | 1 IO / sec |
| Throughput provisioning unit | 1 MiB / sec |
| Minimum provisioned storage per file share | 32 GiB |
| Minimum provisioned IOPS per file share | 500 IOPS |
| Minimum provisioned throughput per file share | 60 MiB / sec |
| Maximum provisioned storage per file share | 256 TiB (262,144 GiB) |
| Maximum provisioned IOPS per file share | 50,000 IOPS |
| Maximum provisioned throughput per file share | 5,120 MiB / sec |
| Maximum provisioned storage per storage account | 4 PiB (4,194,304 GiB) |
| Maximum provisioned IOPS per storage account | 50,000 IOPS |
| Maximum provisioned throughput per storage account | 5,120 MiB / sec |
| Maximum number of file shares per storage account | 50 file shares |

By default, we recommend IOPS and throughput provisioning based on the provisioned storage you specify. These recommendation formulas are based on typical customer usage for that amount of provisioned storage for that media tier in Azure Files:

| Formula name | HDD formula |
|-|-|
| IOPS recommendation | `MIN(MAX(1000 + CEILING(0.2 * ProvisionedStorageGiB), 500), 50000)` |
| Throughput recommendation | `MIN(MAX(60 + CEILING(0.02 * ProvisionedStorageGiB), 60), 5120)` |

Depending on your individual file share requirements, you may find that you require more or less IOPS or throughput than our recommendations and can optionally override these recommendations with your own values as desired.

### Provisioned v2 bursting

Credit-based IOPS bursting provides added flexibility around IOPS usage. This flexibility is best used as a buffer against unanticipated IO spikes. For established IO patterns, we recommend provisioning for IO peaks.

Burst IOPS credits accumulate whenever traffic for your file share is below provisioned (baseline) IOPS. Whenever a file share's IOPS usage exceeds the provisioned IOPS and there are available burst IOPS credits, the file share can burst up to the maximum allowed burst IOPS limit. File shares can continue to burst if there are credits remaining, but this is based on the number of burst credits accrued. Each IO beyond provisioned IOPS consumes one credit. Once all credits are consumed, the share returns to the provisioned IOPS. IOPS against the file share do not have to do anything special to use bursting. Bursting operates on a best-effort basis.

Share credits have three states:

- Accruing, when the file share is using less than the provisioned IOPS.
- Declining, when the file share is using more than the provisioned IOPS and in the bursting mode.
- Constant, when the file share is using exactly the provisioned IOPS and there are either no credits accrued or used.

A new file share starts with the full number of credits in its burst bucket. Burst credits don't accrue if the share IOPS fall below the provisioned limit due to throttling by the server. The following formulas are used to determine the burst IOPS limit and the number of credits possible for a file share:

| Item | HDD formula |
|-|-|
| Burst IOPS limit | `MIN(MAX(3 * ProvisionedIOPS, 5000), 50000)` |
| Burst IOPS credits | `(BurstLimit - ProvisionedIOPS) * 3600` |

The following table illustrates a few examples of these formulas for various provisioned IOPS amounts:

| Provisioned IOPS | HDD burst IOPS limit | HDD burst credits |
|-|-|-|
| 500 | Up to 5,000 | 16,200,000 |
| 1,000 | Up to 5,000 | 14,400,000 |
| 3,000 | Up to 9,000 | 21,600,000 |
| 5,000 | Up to 15,000 | 36,000,000 |
| 10,000 | Up to 30,000 | 72,000,000 |
| 25,000 | Up to 50,000 | 90,000,000 |
| 50,000 | Up to 50,000 | 0 |

### Provisioned v2 snapshots

Azure Files supports snapshots, which are like volume shadow copies (VSS) on Windows File Server. For more information on share snapshots, see [Overview of snapshots for Azure Files](storage-snapshots-files.md).

Snapshots are always differential from the live share and from each other. In the provisioned v2 billing model, if the total differential size of all snapshots fits within the excess provisioned storage space of the file share, there is no extra cost for snapshot storage. If the size of the live share data plus the differential snapshot data is greater than the provisioned storage of the share, the excess used capacity of the snapshots is billed against the Overflow Snapshot Usage meter. The formula for determining the amount of overflow is: `MAX((LiveShareUsedGiB + SnapshotDifferentialUsedGiB) - ProvisionedStorageGiB, 0)`

Some value-added services for Azure Files use snapshots as part of their value proposition. See [value-added services for Azure Files](#value-added-services) for more information.

### Provisioned v2 soft-delete

Deleted file shares in storage accounts with soft-delete enabled are billed based on the used storage capacity of the deleted share for the duration of the soft-delete period. To ensure that a deleted file share can always be restored, the provisioned storage, IOPS, and throughput of the share count against the storage account's limits until the file share is purged, however, are not billed. For more information on soft-delete, see [How to enable soft delete on Azure file shares](storage-files-enable-soft-delete.md).

### Provisioned v2 billing meters

File shares provisioned using the provisioned v2 billing model are billed against the following five billing meters:

- **Provisioned Storage**: The amount of storage provisioned in GiB.
- **Provisioned IOPS**: The amount of IOPS (IO / sec) provisioned.
- **Provisioned Throughput MiBPS**: The amount of throughput provisioned in MiB / sec.
- **Overflow Snapshot Usage**: Any amount of differential snapshot usage in GiB that does not fit within the provisioned storage capacity. See [provisioned v2 snapshots](#provisioned-v2-snapshots) for more information.
- **Soft-Deleted Usage**: Used storage capacity in GiB for soft-deleted file shares. See [provisioned v2 soft-delete](#provisioned-v2-soft-delete) for more information.

Consumption against the provisioned v2 billing meters is emitted hourly in terms of hourly units. For example, for a share with 1024 GiB provisioned, you should see:

- 1,024 units against the **Provisioned Storage** meter for an individual hour.
- 24,576 units against the **Provisioned Storage** meter if aggregated for a day.
- A variable number of units if aggregated for a month depending on the number of days in the month:
  - 28 day month (normal February): 688,128 units against the **Provisioned Storage** meter.
  - 29 day month (leap year February): 712,704 units against the **Provisioned Storage** meter.
  - 30 day month: 737,280 units against the **Provisioned Storage** meter.
  - 31 day month: 761,856 units against the **Provisioned Storage** meter.

For more information about costs, see [Azure Files Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/files/?msockid=27ae1f9a9fbd611d086f0c919ea7608f).

# How to create a PV2 File share & manage

<details close>
<summary>Expand for details on the portal creation experience.</summary>
<br>

- [Create a provisioned v2 file share](https://learn.microsoft.com/en-us/azure/storage/files/storage-how-to-create-file-share?tabs=azure-portal#create-a-provisioned-v2-file-share)

1. Create a storage account kind *FileStorage*.
2. Create a file share with recommendations or manually specify IOPS and throughput.

**Create storage account type FileStorage with Pv2**

![PV2_create_stgacct.png](/.attachments/SME-Topics/Azure-Files-All-Topics/PV2_create_stgacct.png)

**Create PV2 file share with recommendation**

![PV2_create_fsrec.png](/.attachments/SME-Topics/Azure-Files-All-Topics/PV2_create_fsrec.png)

**Create PV2 file share manually specifying IOPS and throughput**

![PV2_create_fsman.png](/.attachments/SME-Topics/Azure-Files-All-Topics/PV2_create_fsman.png)

**Change file share size and performance post creation**

![PV2_fs_change.png](/.attachments/SME-Topics/Azure-Files-All-Topics/PV2_fs_change.png)
![PV2_fs_change2.png](/.attachments/SME-Topics/Azure-Files-All-Topics/PV2_fs_change2.png)
</details>
<br>

# Training - CSS Deep Dive

- [CSS Deep Dive | Azure Files Provisioned V2](https://microsofteur.sharepoint.com/:li:/t/dante/Ex_IuqjK-ttBqEF5lXv7ln0BauRF2BCpV7S-4Kan9dBvrA?e=XmTj6q)

# More information

- [File share total cost of ownership checklist](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#file-share-total-cost-of-ownership-checklist)
- [Provisioned v2 model](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#provisioned-v2-model)
- [Provisioned v1 model](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#provisioned-v1-model)
- [Azure Premium Files](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496161/Premium-Files_Storage?anchor=provision-shares)
- [How to Handle Storage Billing Inquiries_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496208)

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
