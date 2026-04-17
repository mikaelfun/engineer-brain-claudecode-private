---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To: Checking windows Event logs using wevtutil.exe"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%3A%20Checking%20windows%20Event%20logs%20using%20wevtutil.exe"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Checking Windows Event Logs using wevtutil.exe

## Introduction
wevtutil.exe enables you to retrieve information about event logs and publishers. You can also use this command to install and uninstall event manifests, to run queries, and to export, archive, and clear logs.
This utility is available in `C:\Windows\System32\`

## Official Documentation
https://learn.microsoft.com/windows-server/administration/windows-commands/wevtutil

## Practical Use

### List all available Windows Event Logs
```cmd
C:\Windows\System32>wevtutil.exe el
```

### Get statistics of a specific log type (e.g., Security)
```cmd
C:\Windows\System32>wevtutil.exe gli Security
```
Output includes: creationTime, lastAccessTime, lastWriteTime, fileSize, attributes, numberOfLogRecords, oldestRecordNumber.

### Get a specific Event ID from a specific Event Log
```cmd
C:\Windows\System32>wevtutil qe System /q:"*[System[(EventID=507)]]" /c:1 /f:text /rd:true
```
Returns event details including Log Name, Source, Date, Event ID, Task, Level, User, Computer, and Description.

### Get first N entries from a log (e.g., Security)
```cmd
C:\Windows\System32>wevtutil.exe qe Security /c:2 /rd:true /f:text
```
Returns detailed event information including Subject (Security ID, Account Name, Domain, Logon ID) and Process Information.
