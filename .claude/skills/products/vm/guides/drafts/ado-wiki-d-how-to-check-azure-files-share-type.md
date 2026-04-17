---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/How to check the File Share type_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FHow%20to%20check%20the%20File%20Share%20type_Storage"
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




## Summary



This how-to guide instructs you on how to verify the customer file share type, specifically as it relates to Pv1, PV2, or pay-as-you-go pricing models for Azure Files.



## Understanding the Pricing Models: PV2, PV1, vs Pay-as-you-go Comparison



Azure Files offers multiple pricing models, including provisioned and pay-as-you-go options:



- **Provisioned Billing Models**: In a provisioned billing model, the primary costs of the file share are based on the amount of storage, IOPS (input and output operations per second), and throughput you provision when you create or update your file share, regardless of how much you use. Azure Files has two different provisioned models: *provisioned v2* and *provisioned v1*.

    - **Provisioned v2**: In the provisioned v2 model, you can separately provision storage, IOPS, and throughput, although we provide a recommendation to help you with first-time provisioning.

    - **Provisioned v1**: In the provisioned v1 model, you provision the amount of storage you need for the share while IOPS and throughput are determined based on how much storage you provision. The provisioned v1 model for Azure Files is only available for SSD file shares.

        

- **Pay-as-you-go Billing Model**: In a pay-as-you-go model, the cost of the file share is based on how much you use the share, in the form of used storage, transaction, and data transfer costs. The pay-as-you-go model for Azure Files is only available for HDD file shares. We recommend using the provisioned v2 model for new HDD file share deployments.

    

## Billing Model



| Management Model | Billing Model | Media Tier | Redundancy | SMB | NFS |

|-|-|-|-|:-:|:-:|

| Microsoft.Storage | Provisioned v2 | HDD (standard) | Local (LRS) | &#x2705; |  |

| Microsoft.Storage | Provisioned v2 | HDD (standard) | Zone (ZRS) | &#x2705; | |

| Microsoft.Storage | Provisioned v2 | HDD (standard) | Geo (GRS) | &#x2705;| |

| Microsoft.Storage | Provisioned v2 | HDD (standard) | GeoZone (GZRS) | &#x2705; | |

| Microsoft.Storage | Provisioned v1 | SSD (premium) | Local (LRS) | &#x2705; | &#x2705; |

| Microsoft.Storage | Provisioned v1 | SSD (premium) | Zone (ZRS) | &#x2705; | &#x2705;|

| Microsoft.Storage | Pay-as-you-go | HDD (standard) | Local (LRS) | &#x2705; | |

| Microsoft.Storage | Pay-as-you-go | HDD (standard) | Zone (ZRS) | &#x2705; | |

| Microsoft.Storage | Pay-as-you-go | HDD (standard) | Geo (GRS) | &#x2705; | |

| Microsoft.Storage | Pay-as-you-go | HDD (standard) | GeoZone (GZRS) | &#x2705; | |



## How to Identify a PV2 Account File Share



<details close>

<summary>Expand for details.</summary>

<br>



**Portal**



*Storage Account Overview*



![PV2_identify2.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PV2_identify2.png)



*JSON Output*



![PV2_identify3.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PV2_identify3.png)



**Note:** All provisioned V2 SKUs have this naming convention: *StandardV2_LRS*. The **StandardV2** is followed by the redundancy type.



**ASC**



![PV2_identify4asc.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PV2_identify4asc.png)

</details>

<br>



### New Portal Experience - Essentials Overview



> **Pro Tips:** This portion of the overview blade shows the limits applicable for this account. PV2 has limitations on the amount of storage provisioned and file share count. There are no limits on IOPS and throughput, but we surface the limits of the account to avoid customer confusion where they provision more than the account supports.



> If you fill up on IOPS, you cannot provision any more IOs for that share.



> A new file share count limit of 50 enables us to promote per share monitoring.



> The recommended values will change based on the provisioned size of the storage account in GB.



> We increased the maximum share size to 256 TB from 100 TB.



PV2_acctlimits.png (Storage account file share overview)



## How to Identify a PV1 Account File Share



<details close>

<summary>Expand for details.</summary>

<br>



**Note:** PV1 does not apply to premium SSD.



**Portal**



![PV1_identify.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PV1_identify.png)



*JSON Output*



![PV1_identify1.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PV1_identify1.png)



**ASC**



![PV1_identify2asc.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PV1_identify2asc.png)

</details>

<br>



## How to Identify a Pay-as-you-go Account File Share



<details close>

<summary>Expand for details.</summary>

<br>



**Portal**



*Storage Account Overview*



![PAYG_identify.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PAYG_identify.png)



*JSON Output*



![PAYG_identify1.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PAYG_identify1.png)



**ASC**



![PAYG_identify2asc.png](/.attachments/SME-Topics/Azure-Files-All-Topics/Azure-Files-PV2/PAYG_identify2asc.png)

</details>

<br>



## How to Manage PV2 Share



- [Manage PV2 Share](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1741391/Azure-Files-Provisioned-V2-model-Overview_Storage?anchor=how-to-create-a-pv2-file-share-%26-manage)



## More Information



- [Azure Files PV2 TSG](Place holder)

- [Azure Files Provisioned V2 Model Overview_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1741391)

- [Provisioned v2 Model](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#provisioned-v2-model)

- [Provisioned v1 Model](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#provisioned-v1-model)

- [Pay-as-you-go Model](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#pay-as-you-go-model)



::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::
