---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Windows LAPS - 24H2 new features/LAPS: 24H2: New PostAuthenticationAction for Terminating Individual Processes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FWindows%20LAPS%20-%2024H2%20new%20features%2FLAPS%3A%2024H2%3A%20New%20PostAuthenticationAction%20for%20Terminating%20Individual%20Processes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1716497&Instance=1716497&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1716497&Instance=1716497&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**: This article details the new improvements in the Windows Local Administrator Password Solution (LAPS) feature, Post-Authentication Action (PAA), available in Windows Server 2025 and Windows 11 24H2. The PAA now includes support for terminating individual processes.

[[_TOC_]]

### Key features

1. Enhanced post-authentication actions:
   - The new PAA option, Reset the password, log off the managed account, and terminate any remaining processes, is an extension of the previous "Reset the password and sign out the managed account" option.
   

   ![image.png](/.attachments/image-8d24d260-55b6-463b-bbe0-37bf35a954cb.png)
   
   - This new setting ensures that after authenticating with the local Admin and the LAPS password, not only is the password reset and the interactive sign-in sessions terminated after the grace period, but any remaining processes running under the Windows LAPS-managed local account identity are also terminated.

2. Configuration:
   - The PAA setting can be configured via Group Policy under Computer Configuration > Administrative Templates > System > LAPS > Post-authentication actions.
   - Once configured, the PAA will notify and then terminate any interactive sign-in sessions. It will also enumerate and terminate any remaining processes without prior notification.

3. Logging and insights:
   - Event logging messages during post-authentication action execution have been greatly expanded and provide deeper insights into the operation, helping administrators monitor and understand the actions taken by the system.

### Benefits

- Improved management: Administrators can ensure that all sessions and processes are properly closed, maintaining the integrity and security of the system.

### Example scenario

Consider a scenario where you set the policy settings "Reset the password, log off the managed account, and terminate any remaining processes" and a grace period of 1 hour.


![image.png](/.attachments/image-b25efdc4-edb5-4f44-a4b7-873e89032cc7.png) 

A helpdesk employee joins a remote session with a normal user who seeks help and shares their desktop.

The helpdesk user uses the runas.exe command followed by the built-in administrator's name and the current LAPS password to run some commands in the local Admin context to fix the user's problem. In this scenario, the PAA will terminate all the open processes that were launched using the runas.exe command within an hour from the use of the LAPS password.

This comprehensive approach ensures that the managed account is fully secured, and no residual processes are left running, which could potentially be exploited.



### More information:
[New PostAuthenticationAction support for terminating individual processes in Windows LAPS](https://blogs.windows.com/windows-insider/2023/07/12/announc)