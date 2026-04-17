# Azcopy Support Reference & Performance Considerations

> Source: OneNote — Customer Tools/Azcopy + Customer solution
> Quality: guide-draft (pending SYNTHESIZE review)

## Documentation Map

| Scope | Doc Link | Notes |
|-------|----------|-------|
| Tool reference | [azcopy CLI](https://learn.microsoft.com/en-us/azure/storage/common/storage-ref-azcopy) | Per-command options differ |
| Azure Blob copy | [Copy/move data with AzCopy v10](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10) | upload, download, sync, AWS-Azure |
| Azure Files | [Transfer data to Azure Files](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-files) | Azure Files migration recommends Robocopy over azcopy |
| Migration tools comparison | [Azure Storage migration tools](https://learn.microsoft.com/en-us/azure/storage/solution-integration/validated-partners/data-management/migration-tools-comparison) | - |
| File Share Migration | [Migrate to Azure file shares](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-migration-overview) | Robocopy outperforms azcopy for many small files |
| Network restrictions | [Copy blobs with access restriction](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/copy-blobs-between-storage-accounts-network-restriction) | - |
| Performance tuning | [Optimize AzCopy v10](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-optimize) | Server-to-server: increase concurrency; sync: memory-intensive |
| Source code | [GitHub azure-storage-azcopy](https://github.com/Azure/azure-storage-azcopy) | - |

## Support Workflow

1. If the issue is NOT tool-specific → follow regular storage TSG
2. Check [GitHub issues](https://github.com/Azure/azure-storage-azcopy/issues) for known issues (do NOT point customer to GitHub — use internally only)
3. If issue not listed → submit ICM via xstore template, follow with PG
4. Feature requests → create ICM with EEEs, do NOT ask customer to submit on GitHub

## Contacts

| Alias | Scope |
|-------|-------|
| azcopyvteam@microsoft.com | Engineers + SME (preferred) |
| azcopysg@microsoft.com | Engineering only |

## ADO Wiki

- [AzCopy v10 (Storage)](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496096/AzCopy-v10_Storage)
- [AzCopy (Dev_Storage)](https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_Storage/1833078/AzCopy)

## Performance Lessons from Customer Cases

- **500TB/1B files blob migration**: Multiple azcopy instances in parallel + custom sync tool for cutover (8h downtime window)
- **500GB/5M files/5M folders to Azure Files**: azcopy sync took days at 60%. Switch to Azure File Sync (real-time, minimal downtime) or Robocopy (180GB/2M files in 12h with /MT)
- **Key insight**: azcopy sync indexes both sides first → very memory-intensive with millions of files
