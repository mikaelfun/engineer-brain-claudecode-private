---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/DFSR: Preseeding"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FDFSR%3A%20Preseeding"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1518927&Instance=1518927&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1518927&Instance=1518927&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This guide provides detailed instructions for Preseeding a Distributed File System Replication (DFSR) member to reduce initial synchronization time for new members of a replication group.

# Preseeding for DFSR

Preseeding for Distributed File System Replication (DFSR) is the process of copying data to a new member that will be added to a new or existing replication group. This process involves creating an exact duplicate of the original data to speed up the initial replication and sync process. Preseeding is also used as a precursor to cloning a DFSR database.

The most common method for preseeding is to use Robocopy. We have a public document to share with customers with details.

[Use Robocopy to pre-seed files for DFS Replication](https://learn.microsoft.com/en-us/windows-server/storage/dfs-replication/preseed-dfsr-with-robocopy)

Robocopy is included in all currently supported versions of Windows Server OS.

## Sample Command

```plaintext
robocopy.exe "\\srv01\e$\rf01" "d:\rf01" /e /b /copyall /r:6 /w:5 /MT:64 /xd DfsrPrivate /tee /log:c:\temp\pre-seedsrv02.log
```

- `<source replicated folder path>` Specifies the source folder to pre-seed on the destination server.
- `<destination replicated folder path>` Specifies the path to the folder that will store the pre-seeded files.

The destination folder must not already exist on the destination server. To get matching file hashes, Robocopy must create the root folder when it pre-seeds the files.

## Parameters Explained

- `/e` - Copies subdirectories and their files, as well as empty subdirectories.
- `/b` - Copies files in Backup mode.
- `/copyall` - Copies all file information, including data, attributes, timestamps, the NTFS access control list (ACL), owner information, and auditing information.
- `/r:6` - Retries the operation six times when an error occurs.
- `/w:5` - Waits 5 seconds between retries.
- `/MT:64` - Copies 64 files simultaneously.
- `/xd DfsrPrivate` - Excludes the DfsrPrivate folder.
- `/tee` - Writes status output to the console window, as well as to the log file.
- `/log <log file path>` - Specifies the log file to write. Overwrites the file's existing contents. (To append the entries to the existing log file, use `/log+ <log file path>`.)
- `/v` - Produces verbose output that includes skipped files.

## Another Commonly Used Example

This example works for the first data copy or additional copy passes to update changes. Some parameters can be changed for performance or efficiency purposes based on your specific scenario.

```plaintext
robocopy "<source replicated folder path>" "<destination replicated folder path>" /e /b /copyall /r:1 /w:1 /xo /xd DfsrPrivate /tee /log:<log file path> /v
```

- `/e` - Copy all files and folders, including empty ones.
- `/b` - Use backup mode.
- `/copyall` - Copy all permissions.
- `/r:1` - Retry 1 time.
- `/w:1` - Wait 1 second for the retry.
- `/xo` - Exclude older files.
- `/xd DfsrPrivate` - Exclude the DFSRPrivate directory.
- `/tee` - Writes status output to the console window, as well as to the log file.
- `/log:<log file path>` - Path to write the log to.
- `/v` - Use verbose logging.

## Notes and Examples of Changes

1. **Change the Retries (`/r`)** to a lower or higher number. It is often more efficient to use 1 instead of 6 retries.  
   I normally will use 1 instead of 6 with the thought that if it fails once it will likely fail 6 times.
1. **Change the Waits (`/w`)** to a lower or higher number. Using 1 second is usually more efficient.  
   I normally will use 1 (seconds), If I have a file fail, I want to move on as soon as possible. If 1K files fail at one second each that is over 16 minutes of delay added to the copy job, at 5 seconds each that is 1 hour and 13 minutes of added delay.
   
   **Note:** Do not use Robocopy without specifying the `/r` and `/w` parameters. The default values are 1 million retries and 30-second waits, which can cause the process to stall indefinitely.

1. **Additional Passes**: If you are doing additional passes of the copy job to keep the data up to date with changes, you can add the `/xo` switch to exclude the same or older files.
1. **Use of the `/MT` switch**: This may cause the job to appear as if it is stalled. It will continue to run and will dump a bunch of information in the log all at once, then hang for a period of time, and repeat.

###

_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._