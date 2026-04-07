---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Large File Share Overview_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FLarge%20File%20Share%20Overview_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-09-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

# Description

Large File Shares enable you to create larger file shares with 100TiB capacity. With the release of large file shares, a single standard file share in a general purpose account can now support up to 100 TiB capacity, 10K IOPS, and 300 MiB/s throughput. All premium file shares in Azure FileStorage accounts support large file shares by default.

# Available Regions

**<span style="color:green">Update: GA Enablement Roll-out progress </span> We have enabled large file shares (on new and existing storage accounts) in all regions except <u>China East 2 </u> (this region is still in preview but expected to GA by the end June 2024).**

- For Standard Storage Account - https://docs.microsoft.com/en-us/azure/storage/files/storage-files-planning#regional-availability
- For Premium File Storage Account - https://azure.microsoft.com/en-us/global-infrastructure/services/?products=storage

# <span style="color:green">Update: Azure Files geo-redundancy for large file shares is now GA!!</span>

Azure Files geo-redundancy for large file shares significantly improves capacity and performance for standard SMB file shares when using geo-redundant storage (GRS) and geo-zone redundant storage (GZRS) options. 

Azure Files has offered 100 TiB standard SMB shares for years with locally redundant storage (LRS) and zone-redundant storage (ZRS). However, geo-redundant file shares had a 5 TiB capacity limit and were sometimes throttled due to IO operations per second (IOPS) and throughput limits. Now, geo-redundant standard SMB file shares support up to 100 TiB capacity with significantly improved IOPS and throughput limits.

## Geo-redundant storage options

Azure maintains multiple copies of your data to ensure durability and high availability. For protection against regional outages, you can configure your storage account for GRS or GZRS to copy your data asynchronously in two geographic regions that are hundreds of miles apart. This feature adds GRS and GZRS support for standard storage accounts that have the large file shares feature enabled.

- **Geo-redundant storage (GRS)** copies your data synchronously three times within a single physical location in the primary region. It then copies your data asynchronously to a single physical location in the secondary region. Within the secondary region, your data is copied synchronously three times.

- **Geo-zone-redundant storage (GZRS)** copies your data synchronously across three Azure availability zones in the primary region. It then copies your data asynchronously to a single physical location in the secondary region. Within the secondary region, your data is copied synchronously three times.

If the primary region becomes unavailable for any reason, you can [initiate an account failover](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496078/Storage-Account-Failover_Storage) to the secondary region.  


##  Register for the preview 

**<span style="color:red">Note: Feature registration is no longer required for GA regions.</span>**

<u>To get started, register for the feature using Azure portal or PowerShell. This step is required for regions that are in **preview** and is no longer required for regions that are **generally available**.</u>

**Option 1:** Portal 

1. Sign in to the Azure portal.
2. Search for and select Preview features.
3. Click the Type filter and select Microsoft.Storage.
4. Select Azure Files geo-redundancy for large file shares preview and click Register.

**Option 2:** Powershell 

To register your subscription using Azure PowerShell, run the following commands. Replace *<your-subscription-id>* and *<your-tenant-id>* with your own values.

```
Connect-AzAccount -SubscriptionId <your-subscription-id> -TenantId <your-tenant-id> 
Register-AzProviderFeature -FeatureName AllowLfsForGRS -ProviderNamespace Microsoft.Storage
```

- For more details see, [Azure Files geo-redundancy for large file shares (preview).](https://review.learn.microsoft.com/en-us/azure/storage/files/geo-redundant-storage-for-large-file-shares?branch=main&branchFallbackFrom=pr-en-us-238562&tabs=portal)



# Azure Files Scalability and Performance Targets

https://docs.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets

Enabling large file shares when using geo-redundant storage (GRS) and geo-zone-redundant storage (GZRS) significantly increases your standard file share capacity and performance limits: 

| **Attribute** | **Previous limit** | **New limit** |
|---------------|-------------------|---------------|
| Capacity per share | 5 TiB | 100 TiB (20x increase) |
| Max IOPS per share | 1,000 IOPS | Up to [storage account limits](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#storage-account-scale-targets) (20x increase) |
| Max throughput per share | Up to 60 MiB/s | Up to [storage account limits](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#storage-account-scale-targets) (150x increase) |

# Pricing

Standard file shares' increased capacity and scale on your general-purpose accounts come at zero additional cost. Refer to the [pricing page](https://azure.microsoft.com/en-us/pricing/details/storage/files/) for further details.

# How To

Initially, standard file shares could only scale up to 5 TiB; now, large file shares can scale up to 100 TiB. Premium file shares scale up to 100 TiB by default.

To scale up to 100 TiB using standard file shares, you must enable your storage account to use large file shares. You can allow an existing account or create a new one to use large file shares.

https://docs.microsoft.com/en-us/azure/storage/files/storage-files-how-to-create-large-file-share


## Configure geo-redundancy and 100 TiB capacity for standard SMB file shares

In regions that are now generally available:

- All standard SMB file shares (new and existing) support up to 100 TiB capacity and you can select any redundancy option supported in the region. Since all standard SMB file shares now support up to 100 TiB capacity, the LargeFileSharesState property on storage accounts is no longer used and will be removed in the future.
- If you have existing file shares, you can now increase the file share size up to 100 TiB (share quotas aren't automatically increased).
- Performance limits (IOPS and throughput) for your file shares have automatically increased to the storage account limits.

Perform the following steps to configure 100TiB shares and geo-redundancy for new and existing SMB file shares:

## Portal Experience 

<u>New storage account creation:</u>

![lfs_geo_newstgaccount.png](/.attachments/SME-Topics/Azure-Files-All-Topics/lfs_geo_newstgaccount.png)

<u>Existing storage account creation:</u>

![ilfs_geo_existingstgacct.png](/.attachments/SME-Topics/Azure-Files-All-Topics/lfs_geo_existingstgacct.png)

- Customers can turn off the large file shares (LargeFileSharesState) property via PowerShell, CLI, ARM template, etc., but we ignore the property state because all file shares are LFS enabled.
  - If a customer disables the property, the portal will still show it as enabled, but if they use PowerShell, CLI, etc., it will report as disabled. I know this is confusing, but we had to make this change for GA (preserve property state) to prevent a breaking change. 

### File Share capacity metrics 

<span style="color:red">**Important Note:** Given the recent decision to enable large file shares on all shares, we've observed customer confusion regarding file capacity metrics while navigating the portal. They ask why their share capacity has risen to 100 TB. The capacity on the overview blade intends to indicate if the share supports 5TiB or 100TiB. We do not automatically increase the quota for existing shares. Therefore, we have removed capacity from the account-level overview to eliminate confusion.  
</span>

- Storage Account overview blade (<span style="color:red">We have removed the capacity metric from this blade.</span>)

![file_share_capacity_100tb.png](/.attachments/SME-Topics/Azure-Files-All-Topics/file_share_capacity_100tb.png)

- File Share overview blade

![file_share_capacity_blade.png](/.attachments/SME-Topics/Azure-Files-All-Topics/file_share_capacity_blade.png)

# FAQ - Generally Available Regions


- All standard SMB file shares (new and existing) support up to 100 TiB capacity and customers can select any redundancy option supported in the region. 
- We value our customers' needs. Hence, those with existing file shares can now flexibly increase their file share quota to 100 TiB, a change we do not automatically implement to ensure we accommodate their evolving storage requirements.
The performance limits (IOPS and throughput) of existing file shares have automatically increased to the storage account limits.
- The large file shares (LargeFileSharesState) property on storage accounts is no longer used and will be removed in the future (timeline TBD).
- The portal will show the large file shares (LargeFileSharesState) property as enabled and cannot be disabled
- We are removing the capacity metric from the account overview blade. (See the portal experience section above.)

**<span style="color:red">Note: Roll out update per the Product Group. Internal only. Do not share with customers.</span>**

```
Hi Team,
 
As outlined in the Region Deployment Plan  (Web view), we're implementing GA DC in certain regions. Once completed, every account will become LFS; starting the splitting process, customers can create shares with a default size of 100TB, and GRS/RAGRS or any supported account type can be created with LFS. Our enabling process depends on SRP DC and follows this sequence:
 
1.	Stamp DC: We'll activate Stamp DC XSmbByPassLfsforGrsAFECCheckForGA.
2.	SRP DC: Activation of SRP DC will follow Stamp DC once enabled in the region.
3.	Declare GA: Confirmation comes after Stamp DC and SRP DC are fully enabled.
 
There might be some confusion leading to CRI between Step #1 and Step #3:
 
4. If Stamp DC is enabled but SRP DC isn't, Partitions can split, IOPS will be higher due to no share-level throttling, and customers can create 100TB shares using PowerShell but not from the portal. This change in behavior might confuse customers and lead to CRI. It's important for us to be aware of this potential impact and work towards minimizing it.
5. If both Stamp DC and SRP DC are enabled but GA isn't declared: Although all DCs are enabled, GA declaration might take some time. Customers might need clarification as the large file option is unavailable, and the share size remains 100TB. The portal might not display options to convert to large files. Rest assured, once GA is declared, these issues will be resolved.
```


# Troubleshooting 

<details close> 
<summary><span style="color:green">Expand for details on troubleshooting well-known challenges.</span></summary>
<br>

## Scenario 1: Customer is not able to enable LFS on their storage account

**Cause:**

There are certain regions without upgraded stamps for Standard Storage Accounts to support the Large File Shares feature. In such scenarios, customers would get an error when enabling LFS on their storage account. 

**Solution:**

When this happens, please verify if the storage account's stamp supports LFS by using [this Power BI Report](https://msit.powerbi.com/groups/7c45cd1a-5203-4ed2-bf7f-1214e31067b8/reports/6ec60b7d-60bc-4e5b-90dc-ec40aa1b3345/ReportSection09932f45d7d622d05ea4). 

If not, proceed to file an ICM with TA approval. 

Example:

![LFSWiki.png](/.attachments/SME-Topics/Azure-Files-All-Topics/LFSWiki-076dfb2a-9245-4bae-a8b6-4cc001926143.png)

## Scenario 2: Changing existing LRS and ZRS storage accounts to GRS and GZRS may fail with an invalid SKU error. 

**Cause:** If the Storage account's located on a stand-alone tenant that doesn't support geo-redundancy. Open an ICM incident with the capacity team to migrate the storage account to a tenant that supports geo-redundancy (GRS/GZRS). 

![LFS_sku_error.png](/.attachments/SME-Topics/Azure-Files-All-Topics/LFS_sku_error.png)

**Solution:**

Open an ICM incident with the capacity team to migrate the storage account to a tenant that supports geo-redundancy (GRS/GZRS). 

- [How to verify via Xportal](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1307407/Values-for-request-parameters-are-invalid-SKU_Storage?anchor=resolution-for-cause-1---standalone-stamp)

## Scenario 3: The Large file share setting is greyed out when using GRS or GZRS redundancy on new or existing storage accounts.

![LFS_greyed_out.png](/.attachments/SME-Topics/Azure-Files-All-Topics/LFS_greyed_out.png)

**Cause:**

Verify the customer is enrolled in the public preview and is testing in a region that supports the feature. For guidance on how to enroll, see [register for preview.](https://review.learn.microsoft.com/en-us/azure/storage/files/geo-redundant-storage-for-large-file-shares?branch=main&branchFallbackFrom=pr-en-us-238562&tabs=portal#register-for-the-preview)


## Scenario 4: Failover is blocked 

![LFS_failover_blocked.png](/.attachments/SME-Topics/Azure-Files-All-Topics/LFS_failover_blocked.png)

**Cause:**

Failover is blocked if a system snapshot (geo-snapshot) doesn't exist in the secondary region. System snapshots are created every 15 minutes and replicated to the secondary region. 

**Solution:**

After an hour, if the failover is still in a blocked state, please open an ICM incident with TA approval. 

## Scenario 5: Last Sync Time (LST) is further behind than expected. 

**Cause:**

The Last Sync Time is not updated if the file share is idle and there are no changes. If the file share is active (changes recently) and the LST is further than one hour behind. 

**Solution:**

File an ICM with TA approval. 

- [How to get the last sync time for a storage account](https://learn.microsoft.com/en-us/azure/storage/common/last-sync-time-get?tabs=azure-powershell)

</details>

# Training

- [Troubleshooting Session](https://microsoft.sharepoint.com/:v:/t/VMHub/EY6EokCBdLhMsi4dyTP8QRYBq9Oe5_fMH2uXD7lCz1dBVQ?e=2It1u6)

# More information

- [Azure Files geo-redundancy for large file shares](https://learn.microsoft.com/en-us/azure/storage/files/geo-redundant-storage-for-large-file-shares?tabs=portal)

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
