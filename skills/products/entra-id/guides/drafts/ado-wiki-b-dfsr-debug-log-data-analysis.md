---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Looking for Known Solutions/Common Solutions/Root Cause Analysis (RCA)/Debug log Data Analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Looking%20for%20Known%20Solutions%2FCommon%20Solutions%2FRoot%20Cause%20Analysis%20(RCA)%2FDebug%20log%20Data%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DFSR Debug Log Data Analysis

## Debug Logging Blog Series Reference

Comprehensive examples are available in the "Understanding DFSR debug logging" blog series by Ned Pyle:

1. [Part 1: Logging Levels, Log Format, GUIDs](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-1-logging-levels-log-format-guids)
2. [Part 2: Nested Fields, Module IDs](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-2-nested-fields-module-ids)
3. [Part 3: File Added to Replicated Folder (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-3-the-log-scenario-format-file-added-to-replicated-folder-on-windows-server-2008)
4. [Part 4: Very Small File Added (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-4-a-very-small-file-added-to-replicated-folder-on-windows-server-2008)
5. [Part 5: File Modified (Server 2003 R2)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-5-file-modified-on-windows-server-2003-r2)
6. [Part 6: Office Word 97-2003 File Modified (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-6-microsoft-office-word-97-2003-file-modified-on-windows-server-2008)
7. [Part 7: Office Word 2007 File Modified (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-7-microsoft-office-word-2007-file-modified-on-windows-server-2008)
8. [Part 8: File Deleted (Server 2003 R2)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-8-file-deleted-from-windows-server-2003-r2)
9. [Part 9: File Renamed (Server 2003 R2)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-9-file-is-renamed-on-windows-server-2003-r2)
10. [Part 10: File Conflict (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-10-file-conflicted-between-two-windows-server-2008)
11. [Part 11: Directory Created (Server 2003 R2)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-11-directory-created-on-windows-server-2003-r2)
12. [Part 12: DC Bind and Config Polling (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-12-domain-controller-bind-and-config-polling-on-windows-server-2008)
13. [Part 13: New Replication Group Setup (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-13-a-new-replication-group-and-replicated-folder-between-two-windows-server-2008-members)
14. [Part 14: Sharing Violation - File Locked Upstream (Server 2008)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-14-a-sharing-violation-due-to-a-file-locked-upstream-between-two-windows-server-2008)
15. [Part 15: Pre-Seeded Data During Initial Sync](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-15-pre-seeded-data-usage-during-initial-sync)
16. [Part 16: File Modification with RDC (Debug Level 5)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-16-file-modification-with-rdc-in-very-granular-detail-uses-debug-severity-5)
17. [Part 17: Replication Failing - Blocked RPC Ports (Debug Level 5)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-17-replication-failing-because-of-blocked-rpc-ports-uses-debug-severity-5)
18. [Part 18: LDAP Queries Failing Due to Network (Debug Level 5)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-18-ldap-queries-failing-due-to-network-uses-debug-severity-5)
19. [Part 19: File Blocked by File Screen Filter Driver (Debug Level 5)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-19-file-blocked-inbound-by-a-file-screen-filter-driver-uses-debug-severity-5)
20. [Part 20: Skipped Temporary and Filtered Files (Debug Level 5)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-20-skipped-temporary-and-filtered-files-uses-debug-severity-5)
21. [Part 21: File Replication Performance from Throttling (Debug Level 5)](https://docs.microsoft.com/en-us/archive/blogs/askds/understanding-dfsr-debug-logging-part-21-file-replication-performance-from-throttling-uses-debug-severity-5)

## DFSR Event ID Reference
[KB2026172 - DFSR List of all event log messages as of Win2012 R2](https://internal.evergreen.microsoft.com/en-us/topic/dfsr-list-of-all-event-log-messages-as-of-win2012-r2-b0e2f146-5a47-111e-5d80-14558911f358)

## DFSRMiner Tool

DFSRMiner.exe is a utility for quickly searching through DFSR debug logs. Supports mining of GZ-compressed logs (best performance when left compressed).

### Usage
```
dfsrminer [-LogDir <path>] [-StartLog <index>] [-StopLog <index>]
  [-StartTime <TimeString>] [-StopTime <TimeString>]
  -Regex <pattern> [-CaseSensitive] [OutputFile] [-?]
```

### Key Parameters
- `-LogDir`: Directory containing log files (default: `C:\Windows\Debug`)
- `-StartLog` / `-StopLog`: First/last log file index to parse
- `-StartTime` / `-StopTime`: Time range filter
- `-Regex`: Regular expression pattern to match
- `-ConvertTimestamps` / `-DestinationTimezone`: Timezone conversion

### Example
```
dfsrminer -LogDir \\Contoso\C$\Windows\Debug -startLog 700 -stopLog 702
  -startTime "20100418 15:00:03.120" -stopTime "20100418 19:00:00.000"
  -Regex "VolumeManager::" C:\Temp\VolMan.txt
```

**Performance Hint**: Prefer mining compressed log files. Use `-startLog` and `-stopLog` to minimize files parsed.

## Common Debug Log Searches
- **Connection GUID**: Determine all activities over a specific connection
- **File UID**: Evaluate the history of a specific file
- **File name**: Best when file name is unique within the replicated folder
