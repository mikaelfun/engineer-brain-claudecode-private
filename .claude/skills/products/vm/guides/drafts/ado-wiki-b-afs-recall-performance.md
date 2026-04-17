---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/Recall Performance Study_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FRecall%20Performance%20Study_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure File Sync - Recall Performance Study

Two important questions related to recall performance:

1. **Why do most of my IOs result in files being recalled?** Ideally, more than 90% of file access should be on "hot" files (not tiered). Only cold files not accessed regularly should be tiered.
2. **Why is the recall slow?** Usually compared to download tools such as AzCopy or StorageExplorer.

**First step**: Check server-to-Azure-DataCenter latency using https://azurespeedtest.azurewebsites.net/. Higher latency = slower download speed.

## Why do most of my IOs result in files being recalled?

Unnecessary recalls can be avoided by keeping hot files on disk and setting the ghosting policy appropriately. Factors:

**(a) SEP created on primary server with data to upload through sync with tiering:**
- Tiering policy based on last accessed/modified time. Azure File Sync uses NTFS modified time. Access time is tracked by the agent after SEP creation, so over time the agent understands the access pattern better.

**(b) SEP created on secondary server where data downloads as ghost files:**
- Files originally downloaded as stubs and recalled through lazy background thread. Even days after creation, large portion of data could be tiered. Background recall will be slow if recall throughput is slow.

**Speed up background recall on secondary servers:**
```powershell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll"
Invoke-StorageSyncFileRecall -Path <path-to-server-endpoint> -Order CloudTieringPolicy -ThreadCount 32
```

## Why is the recall slow?

Recall performance depends on network throughput, latency, etc.

**Key difference between AFS recall and direct download tools:**
- AFS recall: dedicates one thread per user request, reads ahead at most 4MB data, prioritizes data integrity and fairness to all users
- Direct download tools (AzCopy, browser): download specific file ASAP regardless of other server activity, use much larger download sizes than 4MB

**Fair comparison method**: Use AzCopy with modified parameters to match AFS recall conditions:
```
AzCopy -BlobType page -Destination <local path> -Source https://<storage>.file.core.windows.net/<share> -SourceSAS <SAS> -NC 1
```
- Use `-NC 1` to match single-thread behavior of AFS recall
- Compare throughput: if AzCopy with NC=1 shows similar speed, the bottleneck is network latency, not AFS

## Improving recall performance

- Reduce server-to-datacenter latency (consider moving storage closer to server)
- Increase network bandwidth
- For secondary server initial population, use multi-threaded recall cmdlet
- Set appropriate cloud tiering volume free space policy to keep more hot data local
