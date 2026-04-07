# Azure File Sync: How to Check Enumeration ETA

## Diagnostics Log Collection
```powershell
cd "c:\Program Files\Azure\StorageSyncAgent"
Import-Module .\afsdiag.ps1
Debug-AFS -OutputDirectory C:\output -KernelModeTraceLevel Verbose -UserModeTraceLevel Verbose
```

## Event Log (Server-side)
- Path: `Event Viewer > Applications and Services Logs > Microsoft > FileSync > Agent > Telemetry`
- **Event ID 9133** — Monitor sync progress (ETA calculation)
- **Event ID 9100** — Final sync result
- **Event ID 9144** — Indicates inaccessible volume issue has returned

### ETA Formula (from Event 9133 fields)
```
ETA (seconds) = ((NamespaceDirectoryCount + NamespaceFileCount) - (DirectoriesScannedThisRun + FilesScannedThisRun)) / ItemsPerSecondThisRun
```

## Jarvis Queries (21v / Mooncake)
1. **Sync Session Status**: https://portal.microsoftgeneva.com/s/63B729E0
2. **Per-item Errors**: https://portal.microsoftgeneva.com/s/C0E4F134
3. **Server Enumeration ETA**: https://portal.microsoftgeneva.com/s/46D060CB

## TSG Reference
- [TSG 170 AFS Formatting Server Telemetry Events in DGrep](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784046/TSG-170-AFS-Formatting-Server-Telemetry-Events-in-DGrep_Storage)
