---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/TSS"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/TSS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1227046&Instance=1227046&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1227046&Instance=1227046&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides an overview of the TroubleshootingScript (TSS), a diagnostic tool by Microsoft. It includes information on how to obtain and use TSS, configuration requirements, usage instructions, error handling, and additional resources.

[[_TOC_]]

# Description

TroubleshootingScript (TSS) is a tool signed by Microsoft for data collection and diagnostics. Based on the selected switches, the script collects the logs required for the scenario that you are troubleshooting.

Public URL [https://aka.ms/tssinfo](https://aka.ms/tssinfo) introduces the toolset and provides answers to frequently asked questions:

- TSS does not change system configuration.
- TSS might put a minor load on the system. The load is usually at ignorable levels.
- By default, TSS runs in circular mode, so you can run it for a long time if needed. TSS also calculates disk space at the beginning of the data collection and may exit if there isn't sufficient disk space.

# How to get

There are three different TSS flavors described in the table below. Please refer to the internal URL [https://aka.ms/tssStart](https://aka.ms/tssStart) to get more TSS-related content.

| TSS version | Download URL | Description |
|-------------|---------------|-------------|
| TSS Full    | [https://aka.ms/getTSS](https://aka.ms/getTSS) | Includes several PowerShell scripts and executable files |
| TSS Light   | [https://aka.ms/getTSSLight](https://aka.ms/getTSSLight) | For customers who have security restrictions (no executable, no DLLs, no SDP) |
| TSS TTD     | \\\emea.europe.corp.microsoft.com\Shares\SDP-Check\TSS\TSS_TTD.zip<br/> \\\EMEA\Shares\SDP-Check\TSS\TSS_TTD.zip | Video  [TSS_Flavors_200](https://microsoft.sharepoint.com/teams/TSSEngineeringandEcosystemWork/_layouts/15/stream.aspx?id=%2Fteams%2FTSSEngineeringandEcosystemWork%2FShared%20Documents%2FIntro%20Videos%2F0%2E%20Difference%20between%20multiple%20versions%20of%20TSS%2FTSS%5FFlavors%5F200%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E042a7ec0%2D49dd%2D4641%2D8f36%2Deeb4db5b54c0) describes differences between TSS versions |

# Configuration

No configuration is required, but the following prerequisites should be met:

- Must be run in an elevated PowerShell window by accounts with administrator privileges on the local system.
- Running TSS in the Windows PowerShell Integrated Scripting Environment (ISE) isn't supported.
- The end-user license agreement (EULA) must be accepted. Once the EULA is accepted, the TSS toolset won't prompt for the EULA again.

# Usage

You can check the syntax for the TSS command in the articles below:

- [KB5026874](https://internal.evergreen.microsoft.com/en-us/topic/1baaa597-fafe-85f3-1dae-3dec5329f101) Getting Started with Windows TroubleshootingScript (TSS) Toolset
- [KB4619187](https://internal.evergreen.microsoft.com/en-us/topic/d0ce74a6-dce1-3e0a-1bcd-fc2d723ec8be) Tools and Features included in TroubleshootingScript (TSS) -  ShortURL [https://aka.ms/howto-tss](https://aka.ms/howto-tss)
- [KB4619196](https://internal.evergreen.microsoft.com/en-us/topic/a22d8100-3f02-3972-0e0d-760cafc1843a) TroubleshootingScript (TSS): Windows Active Directory Services (ADS) Guide
  - **Find option**: Benefits of this TSS parameter at video  [TSS_Find_Option](https://microsoft.sharepoint.com/teams/TSSEngineeringandEcosystemWork/_layouts/15/stream.aspx?id=%2Fteams%2FTSSEngineeringandEcosystemWork%2FShared%20Documents%2FIntro%20Videos%2F8%2E%20FindOption%2FTSS%5FFind%5FOption%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E631ee4df%2Dacdc%2D42b4%2D9fb7%2D7571bf0d9c5d)

TSS parameters -Scenario, -Component and -CollectLog work differently and collect different set of data. Please review  [TSS_Scenario_Component_CollectLog](https://microsoft.sharepoint.com/teams/TSSEngineeringandEcosystemWork/_layouts/15/stream.aspx?id=%2Fteams%2FTSSEngineeringandEcosystemWork%2FShared%20Documents%2FIntro%20Videos%2F4%2E%20Scenarios%5FComponents%5FCollectlog%2FTSS%5FScenario%5FComponent%5FCollectLog%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E26913d0e%2D2a7d%2D486e%2Db68c%2Dda5dafd2583e) to understand the difference.


The TSSGUI command-line builder at [https://aka.ms/TSSgui](https://aka.ms/TSSgui) has been decommissioned.

 It might be a good idea to **try the TSS command internally before sending it to the customer**. This way, you can ensure that the command works as expected and you get all the files required.

## -Waitevent

By adding the Waitevent parameter to the TSS command, it will monitor for matching events and automatically stop the capture as soon as an event is found. Examples are provided below.

Security EventID 4771  "Kerberos pre-authentication failed" containing user account and error code '0x18 bad password 

    .\TSS.ps1 -Scenario ADS_ACCOUNTLOCKOUT -Procmon -CollectEventLog Security -AcceptEula -WaitEvent Evt:4771:'Security':5:0:put_username_here/0x18

## -ETLOptions

Example which keeps ETL traces small (size of ETLs is in MB). Thanks to @Deborah Minifie

    .\TSS.ps1 -Scenario ADS_Auth  -WaitEvent  Evt:5719:'System' -ETLOptions circular:100


# Customer ready template (AUTH scenario)

1. Download TSS from [https://aka.ms/getTSS](https://aka.ms/getTSS) to all affected systems.
2. On your system(s), within an elevated PowerShell console, run the following TSS command(s):

   **Client machine**
   ```
   .\TSS.ps1 -Scenario ADS_AuthEx -Procmon
   ```

   **Server(s)**
   ```
   .\TSS.ps1 -Scenario ADS_AuthEx
   ```

   **Domain Controller(s)**
   ```
   .\TSS.ps1 -Scenario ADS_AuthEx -CollectEventLog Security
   ```

3. The first time TSS is started, the **EULA** (End User License Agreement) will be displayed. Click **Accept** to continue.
4. Based on the TSS parameters chosen, you may see the prompt below. Please press Y to allow recording and continue with the script execution:
   ```
   [Action-Privacy] We need your consent to allow Problem Step Recording and/or Screen-Video recording, please answer Y or N
   Press Y for Yes = allow recording, N for No [Y,N]?
   ```
5. After TSS initialization is completed, youll see the prompt below, but **please do not type Y yet**. Reproduce the problem first, and only after the repro is completed, move to the next step:
   ```
   Reproduce the issue and enter 'Y' key AFTER finishing the repro (with window focus here) [Y]?
   ```
6. Immediately after repro, press Y in the same prompt to stop traces and avoid frames with the issue captured from being overwritten.
7. Upload the resulting TSS data to the Microsoft workspace:

   **_<<CUSTOMER WORKSPACE LINK TO BE ADDED HERE>>_**

   **NOTE:** If TSS has been initiated on multiple devices involved in the issue, please do the same on all devices as soon as possible to have the script running concurrently on each machine. This will prevent the overwriting of the collected data that is pertinent to the issue.

More templates can be found at [TSS sample action plans](https://supportability.visualstudio.com/WindowsNetworking/_wiki/wikis/WindowsNetworking/585878/TSS-sample-action-plans).

# Unexpected errors

- **ExecutionPolicy**: If the current PowerShell execution policy doesn't allow running TSS, please set it to **RemoteSigned**.
  ```
  Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force
  ```

- **Existing trace running**: Use the command below if the previous TSS execution failed or when this is the first-time attempt but you get an error about an existing trace running:
  ```
  .\TSS.ps1 -Stop -noBasiclog -noXray
  ```

- **Return Code: 404** (Not found): If the script is unable to contact the Microsoft tools store (cesdiagtools.blob.core.windows.net) and this error occurs, add **-noupdate** to the end of the TSS command.
  ```
  .\TSS.ps1 [...] -noupdate
  ```

- **Resources error**: "_Insufficient system resources exist to complete the requested service_" or "_Not enough resources available_". You can **temporarily** (remember to restore to the default value) increase the number of available ETW sessions using the registry below. A reboot is required. Note: Available on Windows 10 1709 or above.
  ```
  HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\WMI
  Type: Dword
  Name: EtwMaxLoggers
  Value: 0x60 (to increase to 96)
  ```
- **Core server**: When running TSS within the Core server or remotely using Enter-PSSession or psexec, you can add the parameters `-NoPSR` or `-NoRecording` (=noVideo, noPSR) to avoid the error: 
`Exception calling ShowDiaglog with 0 argument(s): Showing a modal dialog box or form  [...] FullyQualifiedErrorId: Application is not running in UserInteractive mode is not a valid operation. Specify the Service Notification or DefaultDesktopOnly style to display a notification from a service application.`

- **TSS Logs**: If you face other issues while executing the TSS script, please review TSS log files (*__Log_transcript*, *__Log-Warn-Err-Info.txt*, *_ErrorVariable.txt*). You may use those error details if you need to check with the TSS Community.

# Other resources

- EE Submit 2024 sessions describing TSS architecture and how to develop new TSS components and create xray diagnostic functions:
  -  [EE-139 Tools - How to Implement New TSS Scenarios  Part 1](https://microsoft.sharepoint.com/teams/WDXUniversity/_layouts/15/stream.aspx?id=%2Fteams%2FWDXUniversity%2FShared%20Documents%2FRecordings%2FEE%20Summit%201%2E0%2FEE%2D139%20Tools%20%2D%20How%20to%20Implement%20New%20TSS%20Scenarios%20%E2%80%93%20Part%201%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ee97abca0%2D4366%2D46b9%2Dbac4%2Dfdb08cb3b421)
  -  [EE-139 Tools - How to Implement New TSS Scenarios  Part 2](https://microsoft.sharepoint.com/teams/WDXUniversity/_layouts/15/stream.aspx?id=%2Fteams%2FWDXUniversity%2FShared%20Documents%2FRecordings%2FEE%20Summit%201%2E0%2FEE%2D139%20Tools%20%2D%20How%20to%20Implement%20New%20TSS%20Scenarios%20%E2%80%93%20Part%201%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ee97abca0%2D4366%2D46b9%2Dbac4%2Dfdb08cb3b421)

# TSS community

- TSS Portal [http://aka.ms/tssportal](http://aka.ms/tssportal)
- Use [TSS Teams channel](https://teams.microsoft.com/l/team/19%3aab7dea29874747bd8bfff4a1bc51a530%40thread.skype/conversations?groupId=107ce661-276a-4ab0-869e-dc0a1f7feee1&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) to reach out for TSS support or ask for new features.
- Email tsscoreteam@microsoft.com
- TSS Newsflash ww-CSS-TSS@microsoft.com (click [here](https://idwebelements/GroupManagement.aspx?Group=ww-css-tss&Operation=join) to Join to this email distribution list)
