---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Premium Files_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Premium%20Files_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 



[[_TOC_]]

# Description

[Premium Files(Generally Available)](https://azure.microsoft.com/en-us/blog/announcing-the-general-availability-of-azure-premium-files/) is a new performance tier that unlocks next level of performance for fully managed file services in the cloud. Premium tier is optimized to deliver consistent performance for IO-intensive workloads that require high-throughput and low latency. Premium file shares store data on the latest SSDs, making them suitable for a wide variety of workloads like databases, persistent volumes for containers, home directories, content and collaboration repositories, media and analytics, high variable and batch workloads, and enterprise applications that are performance sensitive. Our existing standard tier continues to provide reliable performance at a low cost for workloads less sensitive to performance variability, and is well-suited for general purpose file storage, development/test, backups, and applications that do not require low latency.

# Support

Premium Files feature is supported by IaaS Storage POD. No new support topics are created for this release. Please use the existing File Storage topics to route tickets to the IaaS storage team.

# Available Regions

Azure Files premium tier is currently available in 19 Azure regions globally. We are continually expanding regional coverage. You can check the [Azure region availability page](https://azure.microsoft.com/en-us/global-infrastructure/services/?products=storage) for the latest information.

# Contacts

Beta Engineer - Yakshit Gohel  
Feature PM - Gunjan Jain  
Dev - Ivo Zheglov  
CSS SME - Shaikh Mustaque Alli Tarafdar (SMAT)

# Redundancy

Premium file shares are available with LRS in most regions that offer storage accounts and with ZRS in a smaller subset of regions. To find out if premium file shares are currently available in your region, see the [products available by region](https://azure.microsoft.com/global-infrastructure/services/?products=storage) page for Azure. To find out what regions support ZRS, see [Support coverage and regional availability](https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy-zrs#support-coverage-and-regional-availability).

# Pricing

For premium files, the customer pays for the size of share they provision, and this comes with a fixed amount of IOPS and bandwidth.  
Refer Azure [Files Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/files/) page for more details.

# Known Issues

Currently, you cannot directly convert between a standard file share and a premium file share. If you would like to switch to either tier, you must create a new file share in that tier and manually copy the data from your original share to the new share you created. You can do this using any of the Azure Files supported copy tools, such as Robocopy or AzCopy.

# Shares and Files Provisioning and Limitation

## Provision Shares

Premium file shares (preview) are provisioned based on a fixed GiB/IOPS/throughput ratio. For each GiB provisioned, the share will be issued one IOPS and 0.1 MiB/s throughput up to the max limits per share. The minimum allowed provisioning is 100 GiB with min IOPS/throughput.  
  
On a best effort basis, all shares can burst up to three IOPS per GiB of provisioned storage for 60 minutes or longer depending on the size of the share. New shares start with the full burst credit based on the provisioned capacity.
All shares can burst up to at least 100 IOPS and target throughput of 100 MiB/s.  
  
Shares must be provisioned in 1 GiB increments. Minimum size is 100 GiB, next size is 101 GIB and so on.Share size can be increased at any time and decreased anytime but can be decreased once every 24 hours since the last increase. IOPS/Throughput scale changes will be effective within 24 hours after the size change.  
[![Provision Table.png](/.attachments/SME-Topics/Azure-Files-All-Topics/ddb69d02-d04d-c0bb-520c-101ee2daa187600px-Provision_Table.png)](/.attachments/SME-Topics/Azure-Files-All-Topics/ddb69d02-d04d-c0bb-520c-101ee2daa187600px-Provision_Table.png)  

    Tip:
    Baseline IOPS = 100 + 1 * provisioned GiB. (Up to a max of 100,000 IOPS).
    Burst Limit = 3 * Baseline IOPS. (Up to a max of 100,000 IOPS).
    Egress rate = 60 MiB/s + 0.06 provisioned GiB (up to 6 GiB/s)
    Ingress rate = 40 MiB/s + 0.04 provisioned GiB (up to 4 GiB)

More details here - [Provisioned Share](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-planning#provisioned-shares)

## Premium Files Storage Account Limit

Premium files use a unique storage account called **FileStorage**. This account type is designed for workloads with high IOPS, high throughput with consistent low-latency. Premium file storage scales with the provisioned share size.

https://docs.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#premium-filestorage-account-limits


## Bursting

Premium file shares can burst their IOPS up to a factor of three. Bursting is automated and operates based on a credit system. Bursting works on a best effort basis and the burst limit is not a guarantee, file shares can burst up to the limit.  
  
Credits accumulate in a burst bucket whenever traffic for your fileshares is below baseline IOPS. For example, a 100 GiB share has 100 baseline IOPS. If actual traffic on the share was 40 IOPS for a specific 1-second interval, then the 60 unused IOPS are credited to a burst bucket. These credits will then be used later when operations would exceed the baseline IOPs.  

    Tip:
    Size of the burst limit bucket = Baseline_IOPS * 2 * 3600.

More details here - [Premium File Share Bursting](https://learn.microsoft.com/en-us/azure/storage/files/understanding-billing#bursting)

## Azure Backup Support

Azure Backup is available for premium file shares and Azure Kubernetes Service supports premium file shares in version 1.13 and above.

# How To

## How to create Premium Files Account

1.  [Portal](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-create-premium-fileshare#create-a-premium-file-share-using-the-azure-portal)
2.  [PowerShell](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-create-premium-fileshare#create-a-premium-file-share-using-powershell)
3.  [CLI](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-create-premium-fileshare#create-a-premium-file-share-using-azure-cli)

## How to identify if a storage account is provisioned for Premium Files in ASC

1.  The properties of the Storage account will have the followings under Resource Explorer in ASC
    1.  Storage Type: Premium  
    2.  Kind: FileStorage  

[![ASCPremiumFiles.jpg](/.attachments/SME-Topics/Azure-Files-All-Topics/02d07129-d3e8-cdb3-3552-42ca59bb320b500px-ASCPremiumFiles.jpg)](/.attachments/SME-Topics/Azure-Files-All-Topics/02d07129-d3e8-cdb3-3552-42ca59bb320b500px-ASCPremiumFiles.jpg)

# TSG Scenarios

## Troubleshoot Performance issues

Product team has shared this [TSG](https://microsoft.sharepoint.com/teams/AzureSupportability/_layouts/OneNote.aspx?id=%2Fteams%2FAzureSupportability%2FShared%20Documents%2FTeam%20-%20Internal%2FSupportability%20Team%20Strategy-Notes%2FBeta&wd=target%28Engagement%20Projects%2FCloudNet%20and%20Storage%2FPremium%20Files.one%7CB7E38D40-AADC-40A6-968B-AC04B95D31AF%2FParsing%20XDS%20Perf%20logs%20and%20Power%20BI%20analysis%7CB20E0B7D-6FA5-4DBE-AD83-3011C9E500B0%2F%29onenote:https://microsoft.sharepoint.com/teams/AzureSupportability/Shared%20Documents/Team%20-%20Internal/Supportability%20Team%20Strategy-Notes/Beta/Engagement%20Projects/CloudNet%20and%20Storage/Premium%20Files.one#Parsing%20XDS%20Perf%20logs%20and%20Power%20BI%20analysis&section-id=%7BB7E38D40-AADC-40A6-968B-AC04B95D31AF%7D&page-id=%7BB20E0B7D-6FA5-4DBE-AD83-3011C9E500B0%7D&end) that shows how to analyze XDS Perf Logs using a PowerBI report. Storage EEEs and TAs who have access to XDS logs can use this to analyze Azure Premium Files performance issues.  

## Viewing Burst Credits for Premium File Shares

  - Open XDS on the tenant where the share is located.
  - Search all table server logs for the duration where you want to determine the burst credits using the following regex
      - SmbPremiumShareRequestAggregatorShareEntry::AdjustThrottlingParameters - Aggregated statistics for.\*\<accountname\>.\*\<sharename\>
  - It will return results like below where you are can see various statistics for the share including burst credits available, burst credits used in the last interval, etc

<!-- end list -->

    info: XTableServer.exe: SmbPremiumShareRequestAggregatorShareEntry::AdjustThrottlingParameters - Aggregated statistics for Accountname=pfsperfwus101D44EB7C0522265, Containername=testcontainer01D4EA7A7447C7E4, Base iops=30000, Max burst ios=216000000. Total used iops=239, Total throttled iops=0, Total used burst ios=0. Total estimated used iops without burst ios=239, Active partition count=2. Exceeded Ios=0. Previous throttling probability = 0.000000, Current throttling probability = 0.000000, New throttling probability=0.000000. Current burst ios available = 216000000, New burst ios available = 216000000. 
    04/18/2019 20:28:06.021507 - pid: 33260 tid: 60164 @ XStore::XTable::Server::SmbPremiumShareRequestAggregatorShareEntry::AdjustThrottlingParameters (smbpremiumsharerequestaggregator.cpp:750) 
    on XTableServer_IN_99  / cosmosLog_XTableServer.exe_020142.bin  /  6F6BCCB6-801D-0046-007B-F54695063460  /  6F6BCCB6-801D-0046-007B-F54695000000

## How to Verify if requests are getting throttled

All Premium storage accounts now have the ability to monitor if requests are getting throttled.You can check if your requests are getting throttled through Azure Metrics.  

  - Select your storage account, namespace as "File" and metric as "Transaction".
  - You can then add a filter for ResponseType and see if any of your requests got a response code of "SuccessWithThrottling"

[![Azure Metrics.png](/.attachments/SME-Topics/Azure-Files-All-Topics/3289bf7f-7ff0-6b36-9f58-43169fe0990cAzure_Metrics.png)](/.attachments/SME-Topics/Azure-Files-All-Topics/3289bf7f-7ff0-6b36-9f58-43169fe0990cAzure_Metrics.png)

## SMB Perf Logs

All the failed/throttled SMB requests are traced in this Jarvis table - (Diagnostic PROD -\> XStore -\> XSMBPerfMetric). Successes are sampled.(SamplingRate is also a column there, it?s a percentage).From Jarvis you can see throttled XSMB calls. Just do ?where TotalRetryBackoffCount \> 0? in ?XSMBPerfMetric? Jarvis table.  
[Sample Query](https://jarvis-west.dc.ad.msft.net/CF977368)

## REST Perf Logs

All the failed/throttled REST requests are traced in this Jarvis table - (Diagnostic PROD -\> XStore -\> FrontEndSummaryPerfLogs). Successes are sampled.(SamplingRate is also a column there, it?s a percentage).  
[Sample Query](https://jarvis-west.dc.ad.msft.net/1B029907)

# Trainings

  - [PG Troubleshooting Session](https://microsoft.sharepoint.com/:v:/t/VMHub/IQCiu9zmYnArSZqGVXrHD2ZTAYp1fureRSAKdmffOIDVe7s?e=Jf9Gdi)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
