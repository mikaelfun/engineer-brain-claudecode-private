---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Windows/Windows Error Dump"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FWindows%2FWindows%20Error%20Dump"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows Error Dump Collection

## Steps
1. Create registry key: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps`
2. Create DWORD **DumpType** = **2**
3. Create DWORD **DumpCount** = **10**
4. Create REG_EXPAND_SZ **DumpFolder** = `C:\data` (or desired folder)
5. Manually create the dump folder if it does not exist
6. Restart the machine

Reference: [Collecting User-Mode Dumps](https://docs.microsoft.com/en-us/windows/win32/wer/collecting-user-mode-dumps)
