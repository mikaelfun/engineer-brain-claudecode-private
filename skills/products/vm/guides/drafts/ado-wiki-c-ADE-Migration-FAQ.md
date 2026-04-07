---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/ADE Migration FAQ_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Encryption/How%20Tos/Azure%20Disk%20Encryption%20%28ADE%29/ADE%20Migration%20FAQ_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-01-2026
---


[[_TOC_]]

##Summary
This document was created to answer common questions customers may have regarding ADE feature retirement and migration.


##What is this about?
Microsoft has announced retirement of feature Azure Disk Encryption on September 15, 2028. 

##What is the call of action?
Migrating from Azure Disk Encryption to Encryption at Host. Customers will also be able to use other encryption types such as Server Side Encryption with Customer Mnanaged Keys (SSE+CMK) or Confidential VMs.
This will be up to the customer and their compliance needs.

##Why are we recommending Encryption at Host?
Encryption at Host encrypts at rest the OS and Data disks, the cache and temp drive, and the data also flows encrypted between the Storage and the Compute. It also has advantages over ADE such as not using the VM's CPU and also works with custom images as well.
You can check the comparison table in the following link: https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-overview#comparison 

##How do I migrate?
You can check our public documentation regarding [Migrate from Azure Disk Encryption to encryption at host](https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-migrate?tabs=azurepowershell%2CCLI2%2Cazurepowershell3%2CCLI4%2CCLI5%2CCLI-cleanup#create-a-new-vm-with-encryption)
or follow our tsg How to Migrate from ADE to Encryption at Host

##How much does it take for disks to be decrypted?
Decryption time will depend on the amount of data, we estimate that 127 GB takes around 30 min.

##What will happen with VMs encrypted with ADE after retirement date?
From backend, the relationship between the ADE extension and key vault will be removed, if the VM is stopped (deallocated) after this date for sure will fall into a non-boot. but will be possible to be decrypted.
Existing VMs in deallocated state will fall into a non-boot scenario, however it will be possible to gain access to the disks.
Existing VMs in a running state will continue working unless a stop/deallocate/platform unexpected event i.e node failure (either from platform or performed by the customers) occurs.

## What will happen to my encrypted backups?
We suggest customers to migrate their VMs to encryption at host  and create new vault so backups are no longer encrypted with ADE.

## Can I encrypt with something else?
As per our recommendation, the whole data path is encrypted with Encryption at host as well, however this will be up to customer’s need. You can check the comparison table in the following link: https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-overview#comparison 

## Why are we suggesting Encryption at Host only?
Because this is very similar to what ADE offered (encryption of caches, data flows encrypted between compute and storage, and offers benefits like not using CPU.
You can check table in the following link: https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-overview#comparison 

## How to unlock VMs after Sept 15th 2028?
It will be necessary to download the secret manually, so the Manual process should be applied here.
- [Manual unlock](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495071/Unlock-Encrypted-Windows-Disk_Encryption?anchor=manual-troubleshoot)
- [Manual unlock public documentation](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unlock-encrypted-disk-offline)
Please keep in mind this does not work on OS disk on Linux

## Who I should contact if my question is not listed here?
You can reach out to our SMEs via Ava channel

## References
- [Migrate from Azure Disk Encryption to encryption at host](https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption-migrate?tabs=azurepowershell%2CCLI2%2Cazurepowershell3%2CCLI4%2CCLI5%2CCLI-cleanup#create-a-new-vm-with-encryption)

## **Escalate to ADE Teams Channel**

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::



