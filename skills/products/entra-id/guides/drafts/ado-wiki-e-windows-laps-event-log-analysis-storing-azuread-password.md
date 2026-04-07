---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Passwords in Azure/Event Log Analysis - Storing AzureAD Password"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Passwords%20in%20Azure/Event%20Log%20Analysis%20-%20Storing%20AzureAD%20Password"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/784445&Instance=784445&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/784445&Instance=784445&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document details the processing of Windows Local Administrator Password Solution (LAPS) policies in Azure for the first time. It includes logs and descriptions of each step in the process, from the initial policy processing to the successful update of the local administrator account password.

[[_TOC_]]


#Windows LAPS Azure Processing - First time processing

Windows LAPS Client started Processing 

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/22/2022 1:21:27 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      MyazureMachine
Description:
LAPS policy processing is now starting.
```

Windows LAPS Client identifying the Policy Source and in this example its CSP which means Intune. 
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:23:53 AM
Event ID:      10022
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
The current LAPS policy is configured as follows:
 
 Policy source: CSP
 Backup directory: Azure Active Directory
 Local administrator account name: Helpdeskadmin2
 Password age in days: 10
 Password complexity: 4
 Password length: 14
 Post authentication grace period (hours): 24
 Post authentication actions: 0x3

```
Windows LAPs client identifying that the Password of the managed account to be stored in AzureAD

```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:23:53 AM
Event ID:      10010
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
LAPS is configured to backup passwords to Azure Active Directory.
```
Windows LAPS client is processing the as per normal background processing instead of a trigger from the User
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:23:53 AM
Event ID:      10052
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
LAPS is processing the current policy per normal background scheduling.
 ```
Windows LAPS client identified that the Managed account password needs to be updated
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:23:53 AM
Event ID:      10015
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
The managed account password needs to be updated due to one or more reasons (0x13):
 
 The current password has expired
The policy authority has changed
Local state is missing and/or inconsistent with directory state
```
Windows LAPS client sending a message with the Password and device authentication to the Azure Enterprise Registration Endpoint.  
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:23:54 AM
Event ID:      10030
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
LAPS is sending a message to the following endpoint.
 
 https://enterpriseregistration.windows.net/manage/5933138b-9920-4d0e-b3f7-eb7424f01f53/lapsdevicepasswordupdate/8da0654a-4a75-491b-9d5a-6360a422a1c4?api-version=1.0&client-request-id={E35B9729-9838-43A0-935C-25D647614070}&return-client-request-id={E35B9729-9838-43A0-935C-25D647614070}
 ```
Acknowledgement form AzureAD that the Password has been successfully updated 
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:23:59 AM
Event ID:      10029
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
LAPS successfully updated Azure Active Directory with the new password.
```
Acknowledgement from the Client machine that the New password has been updated to the local SAM database
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:24:00 AM
Event ID:      10020
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
LAPS successfully updated the local admin account with the new password.
 
 Account name: helpdeskadmin2
 Account RID: 0x3ED
```
Windows LAPS completes the processing with a Success message. 
```
Log Name:      Microsoft-Windows-LAPS/Operational
Source:        Microsoft-Windows-LAPS
Date:          4/3/2023 1:24:00 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      Client1
Description:
LAPS policy processing succeeded.
```




# **Need additional help or have feedback?**

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |