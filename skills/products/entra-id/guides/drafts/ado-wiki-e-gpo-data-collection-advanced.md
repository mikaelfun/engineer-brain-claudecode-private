---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: Data Collection - Advanced"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Group%20Policy/Workflow%3A%20GPO%3A%20Data%20Collection%20-%20Advanced"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418749&Instance=418749&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418749&Instance=418749&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a detailed guide on advanced data collection methods for troubleshooting Group Policy issues, including the use of Process Monitor, Network Traces, Group Policy Preference Logging, Folder Redirection, NetLogon Logging, GPMC Logging, and GPEdit Logging.

[[_TOC_]]

For **Advanced Group Policy Management (AGPM)** related questions, please see [AGPM Workflow](/Group-Policy/Workflow:-GPO:-AGPM-workflow)

# Data collection - advanced description
This section covers additional data to collect when troubleshooting scenarios where one of the Group Policy Preferences (GPP) settings is not applied, folder redirection-related issues, or any other case where the initial data collection did not shed light on the root cause.

This is the list of additional pieces of data we describe below and their main uses:


| **Data** | **Uses**  |
|--|--|
| **Process Monitor** | Process Monitor (ProcMon) data helps you understand what is happening on the machine while Group Policy is applying: sequence of events, access to registry keys or files, results of those accesses, scripts being run, etc. <BR> Run it when GPOs are being processed (gpupdate or gpupdate /force). For issues at computer boot, you may need to use Process Monitor boot logging. |
| **Network Traces** | These traces are useful for cases where problems (errors or delays) come from the network (SMB, LDAP, Kerberos, etc.). <BR> You'll be able to capture data on connectivity, name resolution, and authentication while the Group Policy service is triggered. It also captures GPOs being retrieved over LDAP from AD and over SMB from Sysvol. |
| **GPP Tracing** | This logging is useful for those cases where Group Policy Preferences settings are involved.  |
| **Folder Redirection** | This logging is useful for those cases where Folder Redirection settings are involved.  |
| **NetLogon Logging** | This logging is useful for scenarios related to Domain Controller location or connectivity issues.  |
| **GPMC logging** | Only in scenarios with Group Policy Management Console problems.  |
| **GPEdit logging** | Only in scenarios with Group Policy Editor Console problems.  |



#Advanced data collection

##Process Monitor
1. Download Process Monitor (ProcMon) from here. 
2. Save the Procmon on c:\temp Folder. 
3. Extract Procmon.exe from the ZIP File.  

- In scenarios where the missing policy setting is related to Client-Side Extension (CSE) that runs in "background processing":
  1. Start Procmon.  
  2. Run from elevated command prompt:  
     ```cmd
     GPupdate /force  
     ```
  3. Stop the ProcMon trace.
  4. Save as PML file  

- In scenarios related to foreground processing failures (such as drive mapping, folder redirection, software installation, etc.) where a restart or re-login is required:  
  1. Start ProcMon and stop the trace.   
  ![A picture showing the button to stop the Procmon trace.](/.attachments/GroupPolicy/Workflow_GPO_D_Collectio_Advanced.png)
  2. Enable Process Monitor boot logging (Options -> "Enable Boot Logging").  
  ![A picture highlighting where to enable boot logging.](/.attachments/GroupPolicy/Workflow_GPO_D_Collectio_Advanced_1.png)
  3. Choose to generate profiling events every second:  
  ![A picture highlighting the boot logging options that should be enabled.](/.attachments/GroupPolicy/Workflow_GPO_D_Collectio_Advanced_2.png)
  4. Re-login or restart and login (depending on the scenario).
  5. Start ProcMon again. You should be presented with the following screen. Click on **Yes**. 
  ![A picture showing the confirmation window that should be agreed to.](/.attachments/GroupPolicy/Workflow_GPO_D_Collectio_Advanced_3.jpg)
  6. Save the log to a PML file.
  7. When the ProcMon tool comes up to show the PML file, please save it again to a second PML file. THis helps to avoid a problem in ProcMon where the first PML file written is detected as corrupt.

## Network Trace

- To start the capture, run the following command from an elevated command prompt:
  ```shell
  netsh trace start capture=yes persistent=yes tracefile=c:\bootcap.etl
  ```
  - **Note**: The `persistent=yes` parameter is needed if a tracing session across reboots is required.
- Run the following to stop the capture:
  ```shell
  netsh trace stop
  ```


##Group Policy Preference Logging 
Group Policy Preference logging needs to be activated if the GPO is applying but GPP settings are not.

GPP logging can be found under: Computer Configuration > Policies > Administrative Templates > System > Group Policy > Logging and tracing.

**Note**: that there is a logging setting for each GPP client side extension. Activate them accordingly.

![An image depicting group policy editor section navigated to by the previous mentioned location.](/.attachments/GroupPolicy/Workflow_GPO_D_Collectio_Advanced_4.png)

The folder c:\Trace (or accordingly) needs to be created manually on the machine where you have the problem. Alternatively, an existing folder can be used.

Set the logging as shown in the below screenshot:  
![A picture showing how to configure the logging.](/.attachments/GroupPolicy/Workflow_GPO_D_Collectio_Advanced_5.gif)


##Enable Folder redirection ( Fdeploy )  

Run the following command from an elevated Command Prompt:
```shell
Reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v FdeployDebugLevel /t REG_DWORD /d "0xF" /f
```
- **Note**: Starting with Windows Vista, adding the registry DWORD will simply add extra events in the event log.


##NetLogon Logging 

From an elevated command prompt, run the following command:
```shell
Nltest /DBFlag:2080FFFF
```
Reproduce the issue while logging is enabled. The netlogon log file can be found at:
```shell
%windir%\debug\netlogon.log
```
When the netlogon debug log is no longer needed, you can stop it with:
```shell
Nltest /DBFlag:0x0
```

For more information please [visit](https://learn.microsoft.com/en-US/troubleshoot/windows-client/windows-security/enable-debug-logging-netlogon-service)

##GPMC Logging 

You can enable GPMC logging by creating the following registry keys: 
```shell
HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics 
   Value Name: GPMgmtTraceLevel  
   Value Type: REG_DWORD  
   Value Data: 2 
```
```shell
HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics 
   Value Name: GPMgmtLogFileOnly  
   Value Type: REG_DWORD  
   Value Data: 1 
``` 

Log file will be found under:
```shell
%Temp%\gpmgmt.log
```
In some cases, the log file won't be found under this exact path. If that happens, use Process Monitor together with a filter "Path contains `gpmgmt.log`" which will point you to the exact location.

##GPEdit Logging

You can enable Group Policy Editor logging by creating the following registry key: 

```
HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon 
   Value Name: GPEditDebugLevel  
   Value Type: REG_DWORD  
   Value Data: 0x10002 
```
 

Log File will be found under: 
```
%windir%\debug\usermode\gpedit.log
```