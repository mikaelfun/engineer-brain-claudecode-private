---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Passwords in Azure/Intune (MDM) Log analysis of logs showing Applying Intune Settings"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Passwords%20in%20Azure/Intune%20%28MDM%29%20Log%20analysis%20of%20logs%20showing%20Applying%20Intune%20Settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/895583&Instance=895583&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/895583&Instance=895583&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a comprehensive FAQ about Intune (Mobile Device Management) and troubleshooting scenarios for MDM/Intune issues, including policy settings, refresh frequency, and verification methods. It also includes steps for data collection for Intune support.

[[_TOC_]]

# Intune (MDM) FAQ:

1. **How does Intune (MDM) work? (Layman terms)**
**Answer:** Let's compare this to an Active Directory environment. There was the domain controller (DC) (compare: MDM server), and the DC provided the sysvol folders with policy files. On the client side, we had the group policy service (compare: MDM client), which simply used an SMB connection (compare: HTTPS) to get the files from the sysvol folders (there was a little more involved in that process like authentication, GPC lookup, etc., but for this comparison, I simplify it a little bit). The Windows client had so-called Client Side Extensions (CSEs) (compare: CSP) to process the input files and finally do the configuration. So, this is basically the same approach, but with MDM, it is standardized and designed to work perfectly over the air. You can think of the MDM stack as a logical evolution of the domain group policy processing.  
The input files on a domain client may be different depending on the CSE. Often a .pol file, sometimes a .ini, or a .xml file. In the modern MDM stack, this input was standardized (XML), and the instructions are built up in a tree structure.  


![a diagram showing the explained info above](/.attachments/image-e8f6f056-32b8-49c8-833a-9028a3ca5eb9.png)

2. **How does Intune (MDM) process policy settings?**
**Answer:** The client receives the configuration settings via the SyncML document data push, and the transferred OMA-URI maps to the corresponding Configuration Service Provider (CSP). The targeted CSPs are responsible for configuring the settings.  
If the policy changes on the MDM server, the updated policy is pushed down to the device, and the setting is set to the new value or the old value is enforced. If a setting should be the default value again, the setting must be configured to the default value again. Removing the assignment of the policy from the user or device does not revert the setting automatically to the default value (see Update below on this!). If we compare this with Group Policy Objects (GPOs), we would call this tattooing. The setting stays there until it is configured to a different value, even after removing the assignment of the policy.

3. **What is the frequency of the policy refresh? (Just like GPO which applies every 90 minutes)**
**Answer:** The frequency of the policy refresh happens every:
   a. Login
   b. Manual Sync
   c. Every 8 hours for Windows CSPs

**More information:** [Intune Policy Processing on Windows 10 Explained](https://oliverkieselbach.com/2019/07/18/intune-policy-processing-on-windows-10-explained/)

4. **Can we force refresh Intune settings (Ex: Gpupdate /force) on the client machine?**
**Answer:** On the client machine, you can force a sync, and that should get the settings applied. If you want to force refresh, then make a change in one of the settings or modify the description of one of the applied configuration profiles.

5. **Like GPResult, do we have a similar HTML-based logging which would show us applied settings?**
**Answer:** You can generate a report using the Account settings (shown below) and view the settings that have been applied to the client machine.

6. **I manually change a registry key on the client machine. How does Intune know that I have changed it, and will it re-apply the settings back?**
**Answer:** It appears there is a local copy of information on the registry keys that have been applied on the client machine. When a setting is manually changed, the settings are reverted back when you perform a manual sync.

# Troubleshooting Scenarios of MDM/Intune Issues

## Windows LAPS Azure Scenarios:

**Scenario 1:** Hybrid Machines (Password Stored On-Premises)  
**Scenario 2:** Azure AD Machines & Hybrid Machines (Password Stored On-Azure)

## Azure LAPS Supported Settings via Intune (MDM) or GPOs:

![a image showing the supported settings for LAPs via Intune](/.attachments/image-346b5e04-99d4-4e44-a667-6c91f2d55522.png)


## If there is an Intune or GPO configured, who would win?
Consider a scenario if a local or domain GPO is applied to a client machine and there is also an Intune setting applied to manage the same settings, then Intune (MDM) settings would win.

**Another Question:** Who decides who (GPO or MDM) should win?  
Typically, it is the application owner or the developer of the application who would write in their code who should win if both configurations are applied.

**Development guidelines to developers is that Intune (MDM) settings should always win over a GPO.**

## How to verify if Intune settings are getting applied
There are two methods to verify if Intune settings are getting applied on a client machine:

**Method 1: Using User accounts tab**

1. **Verify if the user has a license and if the device is being managed by Intune**

Open a normal command prompt in the logged-on user's context (AzureAD or AD account)  
Run `dsregcmd /status` and scroll down to the Diagnostic data section  


![a image showing the output of the dsregcmd command highlighting the machine is managed by MDM](/.attachments/image-358251e7-aad0-4d7e-b942-6c396967f1fb.png =800x200)  


2. **Getting a report of applied settings**

Click on Start - Settings - Accounts tab - Access work or school  

![a image showing the settings page highlighting account and then access work or school](/.attachments/image-f56e059d-8d49-4ddd-a288-f66afd0141ea.png =800x500)  

![a image showing the acess work or school setting page highlighting the info button](/.attachments/image-42935f37-22b1-4b25-a60b-fe0c7f15faec.png =700x400)  

![a image showing the info page highlighting the create report button](/.attachments/image-436cb923-b1a4-444b-8c14-68e8809f1351.png =800x500)  

![a image showing a report](/.attachments/image-c3e6a920-1e34-4fc3-88aa-ea32ab78aa46.png =800x400)  

**Open the MDMDiagnostics file located** in `C:\Users\Public\Documents\MDMDiagnostics\MDMDiagReport.html`  


![a image showing the account info hightlighting the sync button](/.attachments/image-53f8e31d-6c62-4e30-92f2-0e3536fba250.png =700x500)

**Method 2: Using SyncMLViewer tool**
In this method, you can view the raw XML file from Intune (MDM) and also get diagnostics.  
In the XML report, you can search for the CSP name (e.g., LAPS), and you can find if the CSP is getting applied to this machine.  
This report is similar to **GPRESULT** from a GPO perspective, which shows us the applied GPOs (rough comparison).

1. Download the SyncMLViewer tool from GitHub: [SyncMLViewer](https://github.com/okieselbach/SyncMLViewer)  

![a image showing the project and the code button hightlighting the download zip button](/.attachments/image-55ed8a98-197f-4030-8a9b-7531c489872b.png =800x400)

2. Extract the ZIP file and go to the folder where you have extracted the file:  
`SyncMLViewer-master\SyncMLViewer-master\SyncMLViewer\dist` (Look for the latest version in that repository)  
In the below example, `SyncMLViewer-v108` is the latest: Extract the contents and then execute the `SyncMLViewer.exe`  
(If you get a prompt for "**Windows Protected your PC**" then click on More info and choose "**Run anyway**")  

3. Once the SyncML Viewer opens, click on MDM Sync  


![a image showing SynML viewer hightlighting the MDM sync button](/.attachments/image-860be899-abc2-4ab6-9069-2145dbf8c31e.png =700x400)

![a image showing the result highlighting the LAPS section](/.attachments/image-79d5092d-1520-43e6-b37a-9208174fdf66.png =700x400)

4. **Creating a Report:**

![a image highlighting the actions then the button used for the report](/.attachments/image-f884a887-1f98-4113-bf66-64f25a612674.png =700x400)

Once the report submission is completed, you need to browse to the folder `C:\Users\Public\Documents\MDMDiagnostics\MdmDiagnosticsTool` to get the reports.

# Collaboration with Intune - Data Collection
If you have identified the issue is with Intune and you wish to collect data for the Intune team, then follow the below steps:

1. Download the `IntuneODCStandAlone.ps1` file from [IntuneODCStandAlone.ps1](https://raw.githubusercontent.com/markstan/IntuneOneDataCollector/master/IntuneODCStandAlone.ps1)  
(right-click and choose "save as..." in Internet Explorer and Chrome; Edge users should copy all text to a plain text file and save as 'IntuneODCStandAlone.ps1').

2. The script will attempt to automatically download its data collection settings. If you encounter problems during this phase, you can also manually download `Intune.xml` from [Intune.xml](https://raw.githubusercontent.com/markstan/IntuneOneDataCollector/master/Intune.xml) and place it in the same folder as `IntuneODCStandAlone.ps1`.

3. Open an elevated PowerShell window by right-clicking on your PowerShell shortcut and choosing 'Run as Administrator'.

4. In the PowerShell window, navigate to the folder where you downloaded `IntuneODCStandAlone.ps1` and type the command `PowerShell -ExecutionPolicy Bypass -File .\IntuneODCStandAlone.ps1`.

5. Wait for the script to complete. It will take some time (2-3 minutes typically).

6. An Explorer window will open in your download directory. Please upload the `CollectedData.zip` file to the Microsoft secure file transfer site provided to you.


# **Need additional help or have feedback?**

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |