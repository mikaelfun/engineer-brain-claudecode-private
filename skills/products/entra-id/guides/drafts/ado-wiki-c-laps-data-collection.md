---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Legacy LAPS or LAPSv1/Workflow: LAPS: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20LAPS%2FLegacy%20LAPS%20or%20LAPSv1%2FWorkflow%3A%20LAPS%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567266&Instance=567266&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567266&Instance=567266&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed plan for collecting data to troubleshoot Group Policy Service and Local Administrator Password Solution (LAPS) issues. It includes steps for enabling verbose logging, refreshing policies, exporting necessary logs and settings, and uploading the files to a workspace.

[[_TOC_]]

# Data Collection Description

Before starting to collect data, it is important to understand what is the scenario
**Guidelines:** Get a detailed description of the problem. Make use of scoping questions and gather all possible information about the problem, the environment, and the deployment.

## Data collection plan


1. Capture Group Policy Service verbose logging by running:
   ```
   Reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d "0x00030002"
   ```

2. Enable the Local Administrator Password Solution (LAPS) logging by running the following command:
   ```
   reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}" /t REG_DWORD /v ExtensionDebugLevel /d 2 /f
   ```

3. Refresh local and Active Directory (AD) based Group Policy settings:
   ```
   gpupdate /force /target:computer
   ```

4. Save the Resultant Set of Policy (RSoP) report to an HTML file:
   ```
   gpresult /h %Temp%\GPResult.html /scope computer /f
   ```

5. Save the RSoP summary data to a text file:
   ```
   gpresult /r > %Temp%\GPResult.txt /scope computer /f
   ```

6. Export the Group Policy Extensions registry keys:
   ```
   reg export "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions" %Temp%\GPExtensions.reg
   ```

7. Export the LAPS policy settings:
   ```
   Reg query "HKLM\Software\Policies\Microsoft Services\AdmPwd" /s > %temp%\Laps_Pol_Settings.txt
   ```

8. Export the System, Application, and Group Policy Operational event viewer logs:
   ```
   wevtutil.exe export-log Application %Temp%\Application.evtx /overwrite:true
   wevtutil.exe export-log System %Temp%\System.evtx /overwrite:true
   wevtutil.exe export-log Microsoft-Windows-GroupPolicy/Operational %Temp%\GroupPolicy.evtx /overwrite:true
   ```

9. Upload the following files to the workspace:
   - %Temp%\Application.evtx
   - %Temp%\System.evtx
   - %Temp%\GroupPolicy.evtx
   - %Temp%\GPExtensions.reg
   - %Temp%\GPResult.txt
   - %Temp%\GPResult.html
   - %temp%\Laps_Pol_Settings.txt
   - %windir%\debug\usermode\gpsvc.log

10. When finished, you can stop Group Policy Service and LAPS logging:
    ```
    Reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d "0x00000000" /f
    Reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}" /t REG_DWORD /v ExtensionDebugLevel /d 0 /f
    ```