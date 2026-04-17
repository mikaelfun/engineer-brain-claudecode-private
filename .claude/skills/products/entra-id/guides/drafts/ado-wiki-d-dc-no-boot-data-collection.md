---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: DC no boot/DC No Boot: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Database%20and%20DC%20Boot%20Failures%2FWorkflow%3A%20AD%20Database%3A%20DC%20no%20boot%2FDC%20No%20Boot%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415173&Instance=415173&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415173&Instance=415173&Feedback=2)

___
<div id='cssfeedback-end'></div>

This document provides a comprehensive data collection plan for addressing "no boot" issues in a Data Center (DC). It outlines the steps to diagnose and troubleshoot these issues, including running hardware checks, booting into different modes, and collecting necessary logs. 

[[_TOC_]]

# Data collection description
This is the data collection plan for DC no boot issues.

# Data collection plan

- Have the customer run a hardware check and involve the server or storage vendor.
- Boot into Directory Services (DS) Restore Mode. Does this succeed?
- If not, boot from a DVD or USB stick (maybe with Windows Preinstallation Environment (WinPE)) to access the target system volume. Alternatively, attach a virtual disk image with the operating system (OS), database, and log volumes to another host/guest OS.
- Collect event logs off the disk from _%windir%\system32\winevt\logs - Application, System, Directory Services, DFS Replication, DNS Server, Microsoft-Windows-CodeIntegrity%4Operational:_ 
```
Cd %SystemRoot%\System32\Winevt\Logs
copy /Y "Directory Service.evtx" %Temp%%computername%_Directory_Service.evtx 
copy /Y "DNS Server.evtx" %Temp%%computername%_DNS_Server.evtx 
copy /Y "Microsoft-Windows-CodeIntegrity%4Operational.evtx" %Temp%%computername%_CodeIntegrity.evtx 
copy /Y "DFS Replication.evtx" %Temp%%computername%_DFSReplication.evtx 
wevtutil.exe export-log Application %Temp%%computername%_Application.evtx /overwrite:true 
wevtutil.exe export-log System %Temp%%computername%_System.evtx /overwrite:true 
```
 
We have the Code Integrity Eventlog as images might be blocked due to integrity issues (ID 3033).

- Get the database and logs of the faulty DC. Send them to Microsoft (MS) on request and after clearance from your security leads.
- If DS Restore Mode is OK: Run `sfc /scannow`.
- **Do NOT run destructive tests in esentutl /r or /p**.
- Run through this checklist for database paths and settings: [Troubleshoot Jet database errors and recovery steps](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/jet-database-errors-recovery-steps).

- The above link also runs non-destructive database checks and repairs:

  - Integrity checks: "NTDSUTIL FILES INTEGRITY"
  - Semantic check: [How to complete a semantic database analysis for the Active Directory database by using Ntdsutil.exe](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/complete-semantic-database-analysis-ad-db)