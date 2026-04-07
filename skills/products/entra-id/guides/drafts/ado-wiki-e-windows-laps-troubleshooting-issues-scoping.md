---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Password - Active Directory/Troubleshooting Issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Password%20-%20Active%20Directory/Troubleshooting%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/783075&Instance=783075&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/783075&Instance=783075&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a comprehensive guide on high-level Windows Local Administrator Password Solution (LAPS) scoping, including generic and specific scoping questions, troubleshooting workflows, and additional resources.

[[_TOC_]]

# High-level Windows LAPS scoping


![a diagram showing flow and how to start scoping](/.attachments/LAS-Scoping-2b05751d-a8ac-43a0-af5d-14ea177b3760.png)

# Generic scoping questions

(Copy and paste the questions as a frequently asked questions ready template)

1. Description of the issue
2. What is the operating system and build number of the impacted client machines?
3. Are all client machines facing the issue or only some client machines?
4. For how long have they been facing the issue (1 day, week, or month)?
5. Is the issue intermittent or persistent (can we reproduce the issue anytime)?

# Windows LAPS specific questions

1. Is the customer using legacy LAPS or Windows LAPS?
   - Customer is using legacy LAPS with MSI package.
   - Customer is using legacy LAPS in emulation mode.
2. Is the customer using Windows LAPS?
   - Where is the customer storing passwords? (Active Directory or Azure)
   - Where is the issue occurring? (Steps that customer is performing on domain controllers or client machines)
   - Type of client machine joined to the domain (domain joined or hybrid joined)
   - Issues reported on domain controller:
     - Extending the schema
     - Pushing Windows LAPS settings to client machines using Group Policy Object (GPO) or using Mobile Device Management (MDM) such as Intune
     - Organizational Unit (OU) permissions (machine account self-permissions)
     - Delegation of extended rights to users/groups
     - Directory Services Restore Mode (DSRM) configuration
     - Windows LAPS password management (PowerShell or Active Directory Users and Computers (ADUC) LAPS tab)
   - Issues reported on client machines (Windows clients or Windows servers as LAPS client):
     - GPO/MDM settings issues (Windows LAPS policy not getting applied)
     - Windows LAPS password management (PowerShell or ADUC LAPS tab)
     - Post-authentication issues
     - Issues encountered during Windows LAPS processing
3. Restoring Windows LAPS attribute values from backup
   - [Click here to learn how to restore attribute values](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/795299/Restoring-LAPS-Attributes-from-Active-Directory-Backup-Windows-LAPS)

# Issues reported on client machines (workflow)

![a image showing LAPS background processing flow](/.attachments/How_It_Works-Workflow%20-%20Page%203-b481e3ff-df2d-41f8-b457-f7c884f2399e.png)

## Windows LAPS - troubleshooting 101 - scenario 1 (How it works - Windows LAPS processing)

In this 1-hour demonstration video, you will learn about event logs and Event Tracing for Windows (ETW) tracing of Windows LAPS where the password is stored in Active Directory. In this scenario, you will learn "how things work" when a machine is enrolled for the first time to store a password in Active Directory.

**Watch this video on Windows LAPS:** [Windows LAPS troubleshooting 101 - scenario 1: How it works - Windows LAPS processing](https://cloudacademy.com/resource/windows-laps-troubleshooting-101-scenario1-how-it-works-windows-laps-processing-1854/)


# Need additional help or have feedback?

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |