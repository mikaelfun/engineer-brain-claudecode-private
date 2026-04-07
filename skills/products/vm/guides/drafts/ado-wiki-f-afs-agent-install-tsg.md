---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 222 AFS Agent Installation troubleshooting_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20222%20AFS%20Agent%20Installation%20troubleshooting_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 222: AFS Agent Installation Troubleshooting

## Overview

Covers troubleshooting for both agent installer (MSI first-time install) and agent update (MSP patching).

## Agent Installer (MSI) Troubleshooting

### Step 1 - Find the Installation Log

| Installation Mode | Log Location |
|---|---|
| Double-click MSI (UI mode) | Before v5: `%LocalAppData%\Temp` (MSI*.log, StorageSync*.log) |
| Command line (msiexec.exe) | If `/l*v` switch used: specified path. Otherwise: `%LocalAppData%\Temp` |
| v5+ (any mode) | `C:\Program Files\Azure\StorageSyncAgent\MAAgent\Diagnostic\InstallerLog` |

### Step 2 - Analyze the Log

**Search patterns:**

1. **Failure code** at end of log - look for "Installation failed" or exit code
2. **"Sandbox" string** - custom action failures that caused rollback
3. **"1603" string** - fatal error code (unless action marked to ignore)

### Known Error Patterns

| Error | Root Cause | Fix |
|---|---|---|
| SetRegPIIAclSettings fails, -2147287035 (ACCESS_DENIED), PowerShell "ServicePointManager threw exception" | PowerShell process is broken | Engage Windows Support to fix PowerShell before retrying |
| 0x80070002 (NOT_FOUND) on all PowerShell actions | %PATH% missing PowerShell directory | Add `%SystemRoot%\system32\WindowsPowerShell\v1.0` to system PATH |
| Error 1921: FileSyncSvc could not be stopped | Service cannot stop during patching | Manually stop service, taskkill if needed, reboot |
| CompareProductVersion: "Cannot proceed with upgrade" | Same/older version being installed | Use newer version or uninstall/reinstall |

## Agent Update (MSP) Troubleshooting

### Find Update Logs

| Update Method | Log Location |
|---|---|
| Manual command line | Per `/l*v` switch, or `%LocalAppData%\Temp` |
| Microsoft Update (MU) | `C:\Windows\Temp` (Msi*.log, StorageSync*.log) |
| Updater UI/cmdlets | `%LocalAppData%\Temp` (AfsUpdater*.log, Msi*.log) |
| v5+ | `C:\Program Files\Azure\StorageSyncAgent\MAAgent\Diagnostic\InstallerLog` |

### Analyze Update Log

- Verify the update command matches KB documentation (e.g., `msiexec.exe /p packagename.msp REINSTALLMODE=OMUS REINSTALL=StorageSyncAgent,...`)
- Search for failure code, "sandbox", "1603", "1921" patterns same as MSI

**AfsDiag output** can provide valuable registry and system info - request on case-by-case basis.
