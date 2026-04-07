---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/AFS v11.1 Portal Improvements_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FAFS%20v11.1%20Portal%20Improvements_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AFS v11.1 Portal Improvements

With the release of Azure File Sync agent V11.1 the following improvements were made to the portal to communicate the status of Azure File Sync better to customers:

## Initial Cloud Change Enumeration

1. A banner indicates cloud change enumeration is in progress. Learn more link redirects the customer to the performance documentation (20 items/sec) and formula to calculate ETA - [Azure Files scalability and performance targets](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#initial-one-time-provisioning)

2. Server endpoint properties will indicate sync will resume once cloud change enumeration is complete

## Azure File Sync Errors

3. The Issue description is user friendly
4. The Remediation is user friendly and the Learn more link takes the customer directly to the specific section in the public TSG - Link for error code 0x80C8031A - [Troubleshoot Azure File Sync](https://docs.microsoft.com/en-us/azure/storage/files/storage-sync-files-troubleshoot?tabs=portal1%2Cazure-portal#-1906441711)

## Upcoming in V12

1. ETA for long running sync scenarios (cloud change enumeration, initial upload)
2. Improvements to server endpoint creation/deletion errors

[Main File Sync TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/510939/)
