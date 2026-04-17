---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Tools/ADPerf: Data Review Tools/Setting up WPA for Data Analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Tools%2FADPerf%3A%20Data%20Review%20Tools%2FSetting%20up%20WPA%20for%20Data%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## How to set up Windows Performance Analyzer (WPA) for Lsass high CPU data analysis

**Download link for WPA Profiles**: https://aka.ms/get-adperfplugin/profiles

Apply the above profile for SBSL, Disk, CPU, and Memory.

In WPA, go to Profiles -> Apply -> Browse to the Above Startup File -> Press Apply

### To set up symbols and paths for the first time:
```
setx _NT_SYMBOL_PATH srv*C:\Symcache*http://symweb.azurefd.net;srv*c:\Symcache*http://ctxsym.citrix.com/symbols
setx _NT_SYMBOL_PATH_AUTO before
setx _NT_SYMCACHE_PATH C:\xperfSymcache
```

Please find out from an Enterprise Engineer (EE) the path for your local symbol server and replace it above. You may also change the paths on C:\ to wherever you would like to store them on your tools machine.
