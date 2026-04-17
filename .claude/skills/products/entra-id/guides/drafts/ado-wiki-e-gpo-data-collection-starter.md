---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: Data Collection - Starter"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Group%20Policy/Workflow%3A%20GPO%3A%20Data%20Collection%20-%20Starter"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418756&Instance=418756&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418756&Instance=418756&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a starter data collection plan for troubleshooting common Group Policy application problems or failures. It includes guidelines for data collection, listing all Group Policy Objects (GPOs), and collecting data from client machines.

[[_TOC_]]

#Data Collection Description 
This is the **starter data collection** plan for common Group Policy application problem or failure.  

You may find that, for specific issues, there's a need to collect extra data or logging, such as network trace, Procmon, Group Policy Preferences (GPP) logging, etc. Details for [**advanced data collection**](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418749) can be found in the corresponding section of this workflow.
#Data collection Plan

##Guidelines

- Get a detailed description of the problem. Use scoping questions to gather all possible information about the problem, environment, and deployment. 
- Enable Group Policy Service (GPSVC) debug log on the machine with the problem.
- Enable Netlogon debug logging on the affected machine if you suspect domain controller (DC) location/connectivity issues.
- For network-related issues, get a network trace from the machine with the problem.
- Gather a TSS trace using the Directory Services Support Diagnostic Package (SDP) if possible.
- Ensure the traces are taken all at the same time while reproducing the issue.

**Note:** Collecting data from a working and a non-working system can be helpful if you are having difficulty finding the issue with just the non-working data set. 

##Listing all GPOs
Listing all GPOs in the forest, including date created, modification time, and GPO's GUID for reference purposes:

1. Open elevated PowerShell and run the below script from a Windows client with Remote Server Administration Tools (RSAT) installed:
```powershell
# Create Temp folder if it doesn't exist 

Import-Module activedirectory 

Import-Module grouppolicy 

If (!(Test-Path -Path "c:\Temp" -ErrorAction SilentlyContinue )) { New-Item "c:\Temp" -Type Directory -ErrorAction SilentlyContinue | Out-Null } 
 

(get-ADForest).domains | foreach { get-GPO -all -Domain $_ | Select-Object @{n='Domain Name';e={$_.DomainName}}, @{n='GPO Name';e={$_.DisplayName}}, @{n='GPO Guid';e={$_.Id}} , @{n='Gpo Status';e={$_.GpoStatus}} , @{n='Creation Time';e={$_.CreationTime}} , @{n='Modification Time';e={$_.ModificationTime}} } | Export-Csv c:\temp\AllGPOsList.csv
```
2. Upload the CSV file c:\temp\AllGPOsList.csv



##Client machine data collection
Follow the steps below from a computer experiencing GPO application issues, from an elevated Command Prompt. If it's a user policy failing, make sure the logged-on user is one experiencing the problem.

###Option A, Automatic collection - use Authscripts

1. Download the log collection scripts and unzip them, from here: [http://aka.ms/authscripts](http://aka.ms/authscripts)
2. On the machine where the issue is reproduced, start PowerShell as Administrator  
a. Navigate to location where you unzipped the script in step 1.  
    **cd <the path of unzipped script from step 1>**  
b.	Start the log collection by running:  
    **.\start-auth.ps1**
3. Wait for the script to finish initializing the log collection.
4. Reproduce the issue.
5. Stop the traces by running:  
    **.\stop-auth.ps1**
6. Zip the Authlogs folder that was created by the log collection script and upload it to the workspace.

  
###Option B, Manual collection (Group policy specific logs) - use the following steps

**For Windows 11, Windows Server 2025 and newer:**

2. Enable Group Policy Service ETL logging by running:  
   ```cmd
   Reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d "0x00120002"
   ```
2. Capture Group Policy Service verbose logging by running:  
   ```cmd
     logman create trace "gpsvc" -ow -o %Temp%\gpsvc.etl -p {80d25b7f-facc-5141-9929-c0e6eb5e96c5} 0xffffffffffffffff 0xff -nb 16 16 -bs 2048 -mode Circular -f bincirc -max 4096 -ets
   ```
3. Refresh local and AD based Group Policy settings: 
   ```cmd
   gpupdate /force
   ```
   **Hint:** Use one of the below commands if you are troubleshooting a particular user or computer missing settings:
   ```cmd
   Gpupdate /force /target:computer
   Gpupdate /force /target:user
   ```
   **Note:** If the `GPupdate` output fails with a warning, please share the output's content (text in the CMD window).

4. Stop the GPSVC ETL data collection:
   ```cmd
       logman stop "gpsvc" -ets
   ```

5. Save the Resultant Set of Policy (RSoP) report to an HTML file: 
   ```cmd
   gpresult /h %Temp%\GPResult.html
   ```
6. Export the list of the available GPExtensions registry keys:
   ```cmd
   reg export "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions" %Temp%\GPExtensions.reg
   ```
7. Export the System, Application, and Group Policy Operational event viewer logs:
   ```cmd
   wevtutil.exe export-log Application %Temp%\Application.evtx /overwrite:true
   wevtutil.exe export-log System %Temp%\System.evtx /overwrite:true
   wevtutil.exe export-log Microsoft-Windows-GroupPolicy/Operational %Temp%\GroupPolicy.evtx /overwrite:true
   ```
8. Upload the following files to the workspace:
   - `%Temp%\Application.evtx`
   - `%Temp%\System.evtx`
   - `%Temp%\GroupPolicy.evtx`
   - `%Temp%\GPExtensions.reg`
   - `%Temp%\GPResult.txt`
   - `%Temp%\GPResult.html`
   - `%Temp%\gpsvc.etl`

9. When finished, you can stop Group Policy Service prepared for ETL logging:  
   ```cmd
   Reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d "0x00000000" /f
   ```

**For Windows 10, Windows Server 2022 and older:**
1. Capture Group Policy Service verbose logging by running:  
   ```cmd
   Md %windir%\debug\usermode  
   Reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d "0x00030002"
   ```
2. Refresh local and AD based Group Policy settings: 
   ```cmd
   gpupdate /force
   ```
   **Hint:** Use one of the below commands if you are troubleshooting a particular user or computer missing settings:
   ```cmd
   Gpupdate /force /target:computer
   Gpupdate /force /target:user
   ```
   **Note:** If the `GPupdate` output fails with a warning, please share the output's content (text in the CMD window).

3. Save the Resultant Set of Policy (RSoP) report to an HTML file: 
   ```cmd
   gpresult /h %Temp%\GPResult.html
   ```
4. Export the list of the available GPExtensions registry keys:
   ```cmd
   reg export "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions" %Temp%\GPExtensions.reg
   ```
5. Export the System, Application, and Group Policy Operational event viewer logs:
   ```cmd
   wevtutil.exe export-log Application %Temp%\Application.evtx /overwrite:true
   wevtutil.exe export-log System %Temp%\System.evtx /overwrite:true
   wevtutil.exe export-log Microsoft-Windows-GroupPolicy/Operational %Temp%\GroupPolicy.evtx /overwrite:true
   ```
6.Upload the following files to the workspace:
   - `%Temp%\Application.evtx`
   - `%Temp%\System.evtx`
   - `%Temp%\GroupPolicy.evtx`
   - `%Temp%\GPExtensions.reg`
   - `%Temp%\GPResult.txt`
   - `%Temp%\GPResult.html`
   - `%windir%\debug\usermode\gpsvc.log`

7. When finished, you can stop Group Policy Service logging:  
   ```cmd
   Reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d "0x00000000" /f
   ```