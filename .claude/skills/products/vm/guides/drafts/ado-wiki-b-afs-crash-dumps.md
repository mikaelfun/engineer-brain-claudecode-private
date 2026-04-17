---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 173 AFS Generating Crash Dumps filesyncsvc_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20173%20AFS%20Generating%20Crash%20Dumps%20filesyncsvc_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 173: Generating Crash Dumps for Azure File Sync (FileSyncSvc.exe)

Guide for generating and capturing crash dumps to troubleshoot Azure File Sync crashes and memory issues.

## Quick Check

Check if a dump already exists at:
- `C:\windows\minidump`
- `C:\windows\memory.dmp`

## Basic Crash Dump (On Demand)

Task Manager > Details > Right click FileSyncSvc.exe > Create dump file

Share the `filesyncsvc.dmp` file.

## Automatic Crash Dumps

Last 3 crash dumps are stored under `<install root>/CrashDumps` via WER LocalDumps registry settings:
- `DumpFolder`: `[AGENTINSTALLDIR]CrashDumps`
- `DumpCount`: 3
- `DumpType`: 2 (Full dump)

## Full Memory Dump with Stack Traces

For detailed analysis, enable usermode stack traces:

1. `gflags -i filesyncsvc.exe +ust` (enable stack trace database)
2. Restart the service
3. When memory is large, collect dump file
4. `gflags -i filesyncsvc.exe -ust` (disable stack trace database)
5. Restart service

GFlags.exe is in the "Debugging Tools for Windows" installation directory.

## Using Procdump

### Setup
1. Download procdump from https://docs.microsoft.com/en-us/sysinternals/downloads/procdump
2. Extract the archive
3. Run elevated command prompt
4. Create folder: `C:\Temp\CrashDumps`

### On-demand dump
```cmd
procdump filesyncsvc.exe -accepteula -ma -r c:\temp
```

### Capture dump on crash
```cmd
procdump.exe FileSyncSvc -ma -e -t -accepteula C:\Temp\CrashDumps
```

Flags:
- `-ma`: full dump
- `-n N`: number of dumps to capture
- `-w`: wait for process to launch
- `-e`: dump on unhandled exception
- `-t`: dump on process termination

### If process cannot be attached (method 1 - single crash)
```cmd
procdump FileSyncSvc -e -ma -n 1 -w -accepteula C:\Temp\CrashDumps
```

### If process cannot be attached (method 2 - multiple crashes)
Set procdump as interactive debugger to capture any crashing process (requires cleanup via `procdump -u`).

## Using Windows Error Reporting (WER)

Configure via registry:
```
HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\FileSyncSvc.exe
  DumpFolder = C:\Temp\CrashDumps
  DumpCount = 10
  DumpType = 2
```

## Watson

Watson crash dumps can be requested via ICM to the Azure File Sync PG team if other methods are not feasible.

## Notes

- Full memory dumps can be very large; ensure sufficient disk space
- For intermittent crashes, procdump with `-w -e` flags is recommended
- Stack trace database (`gflags +ust`) adds memory overhead; only enable when actively collecting dumps
