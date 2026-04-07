---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Useful Tools and Commands/DFS Management Console tracing"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Useful%20Tools%20and%20Commands%2FDFS%20Management%20Console%20tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DFS Management Console Tracing

## How to Enable

1. Open `%windir%\system32\Dfsmgmt.dll.config` in Notepad

2. Modify the following values:

   ```xml
   <!-- Change from 0 to 1 -->
   <add key="DfsTraceListenerEnabled" value="1" />

   <!-- Change from 0 to 65535 -->
   <add name="DfsFrsTracing" value="65535" />

   <!-- Change from 0 to 65535 -->
   <add name="DfsFrsSnapIn" value="65535" />
   ```

3. Close and reopen DFS Management MMC (`dfsmgmt.msc`)

## Output

Log file: `C:\windows\debug\DfsMgmt\DfsMgmt.current.log`
