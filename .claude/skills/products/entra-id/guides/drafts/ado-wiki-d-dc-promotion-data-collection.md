---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DC Promotion/Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDC%20Promotion%2FData%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DC Promotion: Data Collection Guide

Steps to collect data from a server during an attempt to promote it as a Domain Controller (DC).

## Steps to Collect Data

1. **Identify where the DC promotion is being made**
   - Using Server Manager
   - Using DCPROMO.exe (older OS versions)
   - Using `Install-ADDSDomainController` (PowerShell)

2. **Examine DC Promotion logging files**
   - Check `%windir%\debug\DCPROMO.LOG` and `%windir%\debug\dcpromoui.log`
   - Work backwards from the errors to find indications of why the failure occurred

3. **Try suggested resolutions**
   - Refer to [failure code resolutions](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/troubleshooting-domain-controller-deployment#promotion-and-demotion-failure-codes)
   - Check [known issues and common support scenarios](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/troubleshooting-domain-controller-deployment#known-issues-and-common-support-scenarios)

4. **Enable the NETLOGON Debug Log** (only works if DC is already joined to the domain)
   ```shell
   NLTest.exe /dbflag:2080FFFF
   ```

5. **Start Problem Step Recorder** for precise timestamps
   ```shell
   psr.exe /start /output c:\%computername%_PSR.zip /maxsc 99 /sc 1
   ```

6. **Start Network Capture**
   ```shell
   netsh trace start capture=yes maxsize=2048 filemode=circular persistent=yes overwrite=yes traceFile=c:\%computername%_cap.etl
   ```

7. **Reproduce the issue, then stop captures**
   ```shell
   netsh trace stop
   psr.exe /stop
   ```

8. **Automate capture of other relevant files** using batch script:
   ```batch
   @echo off
   set mytime=%time: =%%
   set mytime=%mytime::=.%
   set folder=C:\temp\dcpromo-logs-%mytime%
   mkdir %folder%

   copy %windir%\debug\DCPROMO.LOG %folder%\%computername%_DCPROMO.log
   copy %windir%\debug\dcpromoui.log %folder%\%computername%_dcpromoui.log
   copy %windir%\debug\netlogon.log %folder%\%computername%_netlogon.log
   copy %windir%\debug\netlogon.bak %folder%\%computername%_netlogon.bak
   copy %windir%\System32\winevt\Logs\Microsoft-Windows-DirectoryServices-Deployment%%4Operational.evtx %folder%\
   copy "%windir%\System32\winevt\Logs\Directory Service.evtx" "%folder%\"
   copy "%windir%\System32\winevt\Logs\DFS Replication.evtx" "%folder%\"
   move "C:\%computername%_PSR.zip" %folder%\
   move "C:\%computername%_cap.etl" "%folder%\"
   repadmin /showrepl
   ```

9. **Compress** the `C:\temp\dcpromo-logs*` folder and upload to the workspace
