---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Back-Up Azure File Share_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FBack-Up%20Azure%20File%20Share_Storage"
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

## Summary

This article summarizes some of the available methods to Backup Azure File Shares and its different benefits.

## More Information

Find below different methods that can be used to backup Azure Files shares

### Azure Backup with Azure Files(Preview)

Azure Backup enables a native backup solution for Azure file shares, a key addition to the feature arsenal to enable enterprise adoption of Azure Files. Using Azure Backup, via Recovery Services vault, to protect your file shares is a straightforward way to secure your files and be assured that you can go back in time instantly.

**Overview**

Azure File Share backup is a feature in Azure Backup and it enables customers to:

  - Discover unprotected file shares
  - Backup multiple files at a time
  - Schedule and forget
  - Instant restore
  - Browse individual files/folders

**Benefits**

  - Zero infrastructure solution
  - Comprehensive backup solution
  - Directly recover files from the Azure portal
  - Cost effective

**How To**

  - [Configuring backup for an Azure file share](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files#configuring-backup-for-an-azure-file-share)
  - [Create an on-demand backup](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files#create-an-on-demand-backup)
  - [Restore from backup of Azure file share](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files#restore-from-backup-of-azure-file-share)
  - [Restore individual files or folders from backup of Azure file shares](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files#restore-individual-files-or-folders-from-backup-of-azure-file-shares)
  - [Manage Azure file share backups](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files#manage-azure-file-share-backups)

**Further Information**

  - Public [Back up Azure file shares](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files)
  - [FAQ for Azure file share backup](https://docs.microsoft.com/en-us/azure/backup/backup-azure-files-faq)
  - [Troubleshoot Azure file share backup](https://docs.microsoft.com/en-us/azure/backup/troubleshoot-azure-files)

### Azure File Share Snapshots

**Overview**

Azure File Share Snapshot is a new feature in Azure File Share and it enables customers to:

  - Take a point in time back up of a file share
  - Pick and choose to restore a file from a snapshot
  - Mount the snapshot share as a drive and restore the entire snapshot

**Benefits**

  - Protection against application error and data corruption
  - Protection against accidental deletions or unintended changes
  - General backup purpose

**How To**

Working with share snapshots in:

  - [Portal](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-portal#create-and-modify-share-snapshots)
  - [PowerShell](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-powershell#create-and-modify-share-snapshots)
  - [CLI](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-cli#create-and-modify-share-snapshots)

**Further Information**

  - Public [Overview of share snapshots for Azure Files](https://docs.microsoft.com/en-us/azure/storage/files/storage-snapshots-files)

### Using RoboCopy

There are a few RoboCopy modes that allow you to keep directories in sync. For example:

1.  **/MIR** - One-time mirroring of one directory with another directory.
2.  **/MON:n** - Monitor the source directory. If there have been n changes, /MIR it with the destination directory.
3.  **/MOT:m** - Monitor the source directory. When m minutes have passed, /MIR it with the destination directory.

#### Example

    Robocopy.exe Z:\ E:\Backup /MOT:180 /E /R:1
    Robocopy.exe Z:\ E:\Backup /MIR /E /R:1

## References

<https://docs.microsoft.com/en-us/azure/backup/backup-azure-files>
<https://docs.microsoft.com/en-us/azure/storage/files/storage-snapshots-files>
