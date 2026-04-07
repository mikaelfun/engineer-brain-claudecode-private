---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Setup User Mode Dump_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FSetup%20User%20Mode%20Dump_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-02-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

This article describes how to set up a Windows machine to create a user-mode dump from a crashing process or service. You may want to use this whenever you:

- Have a service that is failing to start. This will appear in `System.evtx` logs with IDs 7034, 7009, 7000, 10005, and related events if the service has failed to restart correctly ([error 1053 means 'The service did not respond to the start or control request in a timely fashion'](https://windowsinternalservices.azurewebsites.net/Static/Errors/?1053)):

  ```log
  LogName:       System
  Source:        Microsoft-Windows-DistributedCOM
  Date:          6/2/2023, 5:30:12 PM
  Event ID:      10005
  Task Category: None
  Level:         Error
  User:          S-1-5-18
  Computer:      rdpCrashVM
  Description:
  DCOM got error "1053" attempting to start the service TermService with arguments "Unavailable" in order to run the server:
  {F9A874B6-F8A8-4D73-B5A8-AB610816828B}

  ---

  LogName:       System
  Source:        Service Control Manager
  Date:          6/2/2023, 5:30:12 PM
  Event ID:      7000
  Task Category: None
  Level:         Error
  User:          N/A
  Computer:      rdpCrashVM
  Description:
  The Remote Desktop Services service failed to start due to the following error: 
  %%1053

  ---

  LogName:       System
  Source:        Service Control Manager
  Date:          6/2/2023, 5:30:12 PM
  Event ID:      7009
  Task Category: None
  Level:         Error
  User:          N/A
  Computer:      rdpCrashVM
  Description:
  A timeout was reached (30000 milliseconds) while waiting for the Remote Desktop Services service to connect.

  ---

  LogName:       System
  Source:        Service Control Manager
  Date:          6/2/2023, 5:30:08 PM
  Event ID:      7034
  Task Category: None
  Level:         Error
  User:          N/A
  Computer:      rdpCrashVM
  Description:
  The Remote Desktop Services service terminated unexpectedly. It has done this 12 time(s).
  ```

  - In this example where `TermService` is failing to start, we also see event 17 in the `TerminalServices-LocalSessionManager/Operational.evtx` log indicating reason code -2147023843 (['The service did not respond to the start or control request in a timely fashion.'](https://windowsinternalservices.azurewebsites.net/Static/Errors/?1067)):

  ```log
  LogName:       Microsoft-Windows-TerminalServices-LocalSessionManager/Operational
  Source:        Microsoft-Windows-TerminalServices-LocalSessionManager
  Date:          6/2/2023, 5:30:12 PM
  Event ID:      17
  Task Category: 
  Level:         Error
  User:          S-1-5-18
  Computer:      rdpCrashVM
  Description:
  Remote Desktop Service start failed. The relevant status code was -2147023843.
  ```

- Have a process that is crashing. This will appear in `Application.evtx` logs (with Application Error event 1000 for every crash and Information level 1001 event for log collection by Windows Error Reporting):

  ```log
  LogName:       Application
  Source:        Application Error
  Date:          6/2/2023, 5:30:02 PM
  Event ID:      1000
  Task Category: Application Crashing Events
  Level:         Error
  User:          N/A
  Computer:      rdpCrashVM
  Description:
  Faulting application name: svchost.exe_TermService, version: 10.0.17763.3346, time stamp: 0xb6a0daab
  Faulting module name: ntdll.dll, version: 10.0.17763.4377, time stamp: 0xac56554b
  Exception code: 0xc0000409
  Fault offset: 0x000000000008fc3f
  Faulting process id: 0x11d8
  Faulting application start time: 0x01d99575d30d5779
  Faulting application path: C:\Windows\System32\svchost.exe
  Faulting module path: C:\Windows\SYSTEM32\ntdll.dll
  Report Id: fb2d158e-d657-4d70-a671-3f13ed872676
  Faulting package full name: 
  Faulting package-relative application ID: 

  ---

  LogName:       Application
  Source:        Windows Error Reporting
  Date:          6/2/2023, 5:30:08 PM
  Event ID:      1001
  Task Category: None
  Level:         Information
  User:          N/A
  Computer:      rdpCrashVM
  Description:
  Fault bucket 1350231146951001754, type 5
  Event Name: BEX64
  Response: Not available
  Cab Id: 0

  Problem signature:
  P1: svchost.exe_TermService
  P2: 10.0.17763.3346
  P3: b6a0daab
  P4: ntdll.dll
  P5: 10.0.17763.4377
  P6: ac56554b
  P7: 000000000008fc3f
  P8: c0000409
  P9: 000000000000000a
  P10: 

  Attached files:
  \\?\C:\ProgramData\Microsoft\Windows\WER\Temp\WER19B9.tmp.dmp
  \\?\C:\ProgramData\Microsoft\Windows\WER\Temp\WER1A66.tmp.WERInternalMetadata.xml
  \\?\C:\ProgramData\Microsoft\Windows\WER\Temp\WER1A76.tmp.xml
  \\?\C:\ProgramData\Microsoft\Windows\WER\Temp\WER1A8A.tmp.csv
  \\?\C:\ProgramData\Microsoft\Windows\WER\Temp\WER1A9B.tmp.txt

  These files may be available here:
  \\?\C:\ProgramData\Microsoft\Windows\WER\ReportArchive\AppCrash_svchost.exe_Term_793e851e59347a66b962cbbc3d8e44171839c3_33fd83c3_118b2784

  Analysis symbol: 
  Rechecking for solution: 0
  Report Id: fb2d158e-d657-4d70-a671-3f13ed872676
  Report Status: 268435456
  Hashed bucket: 367587d3ee96102d12bcfc1306aec69a
  Cab Guid: 0
  ```

  - In this example where `TermService` is crashing, we also see event 40 in the `TerminalServices-LocalSessionManager/Operational.evtx` log indicating reason code 1067 (['The process terminated unexpectedly.'](https://windowsinternalservices.azurewebsites.net/Static/Errors/?1067)):

  ```log
  LogName:       Microsoft-Windows-TerminalServices-LocalSessionManager/Operational
  Source:        Microsoft-Windows-TerminalServices-LocalSessionManager
  Date:          6/2/2023, 4:30:05 PM
  Event ID:      40
  Task Category: 
  Level:         Information
  User:          S-1-5-18
  Computer:      rdpCrashVM
  Description:
  Session 2 has been disconnected, reason code 1067
  ```

  - Can also be detected in Kusto:

  ```kusto
  // Search Application.evtx faulting errors: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495124/Get-User-Mode-Dump-Hanging-Process_RDP-SSH
  
  cluster('Azcsupfollower').database('rdos').GuestAgentGenericLogs
  | where PreciseTimeStamp > ago(1d)
  //| where SubscriptionId == "SUB_ID"
  | where RoleInstanceName has "rdpCrashVM" // Insert VM Name
  | where Context1 has "Faulting"
  | where Context3 == "Application"
  | project Context1, Context2, Context3, TIMESTAMP, RoleInstanceName, OSVersion, EventName, CapabilityUsed, GAVersion, Region, ContainerId, NodeId
  | sort by TIMESTAMP desc
  ```

  | Context1 | Context2 | Context3 | TIMESTAMP | RoleInstanceName | OSVersion | EventName | CapabilityUsed | GAVersion | Region | ContainerId | NodeId |
  | -------- | -------- | -------- | ---------- | ---------------- | --------- | -------- | -------------- | --------- | ------ | ----------- | ------ |
  | Faulting application name: svchost.exe_TermService, version: 10.0.17763.3346, time stamp: 0xb6a0daab Faulting module name: ntdll.dll, version: 10.0.17763.4377, time stamp: 0xac56554b Exception code: 0xc0000409 Fault offset: 0x000000000008fc3f Faulting process id: 0x11d8 Faulting application start time: 0x01d99575d30d5779 Faulting application path: C:\Windows\System32\svchost.exe Faulting module path: C:\Windows\SYSTEM32\ntdll.dll Report Id: fb2d158e-d657-4d70-a671-3f13ed872676 Faulting package full name: Faulting package-relative application ID: | 2023-06-02T17:30:02.939Z | Application | 2023-06-02 17:32:26.1064917 | _rdpCrashVM | Windows:Windows Server 2019 Datacenter-10.0.17763.4377 | Application Error | Error | 2.7.41491.1083 | eastus | [obfuscated] | [obfuscated] |

**Per-Application Dump Settings_Process.md**

Detailed guide on configuring specific dump settings for individual applications, which will override the global settings.
#### Steps for Configuring Per-Application Dump Settings

1. **Create a New Key for the Application**
  - Navigate to the registry path: `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\Windows Error Reporting\LocalDumps`.
  - Create a new key for the application under this path.
  - For example: `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\Windows Error Reporting\LocalDumps\MyApplication.exe`.

2. **Add Custom Dump Settings**
  - Under the newly created application-specific key, add your custom dump settings.
  - These settings can include options such as `DumpFolder`, `DumpCount`, and `DumpType`.

#### How It Works
When an application crashes, Windows Error Reporting (WER) will first check the global settings and then apply any application-specific overrides. By following these steps, you can ensure that detailed user-mode dumps are generated and stored locally, which can help in diagnosing application crashes.

#### Important Notes
- **Global vs. Application-Specific Settings**: WER will prioritize application-specific settings over global settings if they are configured.
- **Registry Path**: Ensure that the registry path is correctly specified to avoid any configuration issues.

#### Reference
[Collecting User-Mode Dumps](https://learn.microsoft.com/en-us/windows/win32/wer/collecting-user-mode-dumps)

## LabBox

<https://aka.ms/LabBox>

For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. The dump has been configured to save to the data disk but this can be modified following the steps below. This lab is not to be shared with customers.

[![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/termServiceCrashes.json)

## Instructions

### Setup Windows Error Reporting

1. If you are working in _ONLINE_ mode, then just run the following on an elevated PowerShell:

   ```PowerShell
   # Setup the Guest OS to collect user mode dumps on a service crash event
   $key = 'HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps'
   if ((Test-Path -Path $key) -eq $false) {(New-Item -Path 'HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting' -Name LocalDumps)}
   New-ItemProperty -Path $key -name DumpFolder -Type ExpandString -force -Value "c:\CrashDumps" # Change "c:\CrashDumps" if we want to save to another location
   New-ItemProperty -Path $key -name CrashCount -Type DWord -force -Value 10
   New-ItemProperty -Path $key -name DumpType -Type DWord -force -Value 2
   ```

2. If you are working in _OFFLINE_ mode, then just run the following on an elevated PowerShell:

   ```PowerShell
   # Load the hives - If your attached disk is not F, replace the letter assignment here
   reg load HKLM\BROKENSOFTWARE F:\windows\system32\config\SOFTWARE.hiv
   
   # Setup the Guest OS to collect user mode dumps on a service crash event
   $key = 'HKLM:\BROKENSOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps'
   if ((Test-Path -Path $key) -eq $false) {(New-Item -Path 'HKLM:\BROKENSOFTWARE\Microsoft\Windows\Windows Error Reporting' -Name LocalDumps)}
   New-ItemProperty -Path $key -name DumpFolder -Type ExpandString -force -Value "c:\CrashDumps" # Change "c:\CrashDumps" if we want to save to another location
   New-ItemProperty -Path $key -name CrashCount -Type DWord -force -Value 10
   New-ItemProperty -Path $key -name DumpType -Type DWord -force -Value 2
   
   # Unload the hive
   reg unload HKLM\BROKENSOFTWARE
   ```

**Notes:**

- The folder `c:\CrashDumps` will be created on the first application crash.
- For every service crashing, this will create a full dump for that service. If there are more than 10 crashes, the 11th will overwrite the 1st dump.
- On the OFFLINE steps, this will assume that the disk is drive `F:`, if this is not your case, update the letter assignment.

### Windows Error Reporting Services

Ensure the service Windows Error Reporting is started and if it is started, recycle the service for those changes to kick in.

- By default, 'Windows Error Reporting Service' will be set to manual. Change this to automatic startup:
  - If the OS is loaded, then change the key `HKLM\SYSTEM\CurrentControlSet\Services\WerSvc -> Start` from 3 to 2:

   ```PowerShell
   # PowerShell as admin, Set startup to automatic
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\WerSvc" -Name "Start" -Value 2
   ```

  - If we are working on an attached disk then:
    1. Check which ControlSet the machine is booting from. You will see its key number in `HKLM\BROKENSYSTEM\Select\Current`.
    2. Now change the key `HKLM\BROKENSYSTEM\ControlSet00x\Services\WerSvc -> Start` from 3 to 2.

### How to Recycle the Windows Error Reporting Service

1. To recycle the service locally:

   ```PowerShell
   # CMD as admin
   net stop wersvc
   net start wersvc
   sc query wersvc

   # Or PowerShell as admin
   Restart-Service wersvc
   get-service wersvc
   
   # Or open Services console and restart the 'Windows Error Reporting' service
   services.msc

   # Or open Task Manager and restart the 'wersvc' service
   taskmgr.exe
   ```

2. To recycle the service from another machine on the same VNET, we can use either the Services.msc console or [PStools](http://technet.microsoft.com/en-us/sysinternals/bb896649.aspx).

   ```PowerShell
   # CMD as admin
   Psservice \\"<<DESTINATIONIP>>" -u "<<USERNAME>>" -p "<<PASSWORD>>" restart wersvc
   ```

## References

For further reference, please refer to [Collecting User-Mode Dumps](https://msdn.microsoft.com/en-us/library/windows/desktop/bb787181\(v=vs.85\).aspx)

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
