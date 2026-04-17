---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User Account Control/Workflow: User Account Control: User Experience"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%20Account%20Control/Workflow%3A%20User%20Account%20Control%3A%20User%20Experience"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232582&Instance=2232582&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232582&Instance=2232582&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document shows the User Account Control (UAC) user experience.

[[_TOC_]]

When UAC is enabled, the user experience for standard users is different from administrator users. The recommended and more secure method of running Windows, is to ensure your primary user account is a standard user. Running as a standard user helps to maximize security for a managed environment. 

With the built-in UAC elevation component, standard users can easily perform an administrative task by entering valid credentials for a local administrator account.
The default, built-in UAC elevation component for standard users is thecredential prompt.
The alternative to running as a standard user is to run as an administrator inAdmin Approval Mode. With the built-in UAC elevation component, members of the local Administrators group can easily perform an administrative task by providing approval.
The default, built-in UAC elevation component for an administrator account in Admin Approval Mode is called theconsent prompt.

<br>

# The credential prompt (OTS)

The credential prompt is presented when a standard user attempts to perform a task that requires a user's administrative access token. Administrators can also be required to provide their credentials by setting theUser Account Control: Behavior of the elevation prompt for administrators in Admin Approval Modepolicy setting value toPrompt for credentials.

![image.png](/.attachments/image-e6ed7f51-5eda-42b2-b527-3a3a491c37c3.png)

<br>

# The consent prompt (AAC)

The consent prompt is presented when an admin user attempts to perform a task that requires a user's administrative access token.

![image.png](/.attachments/image-73d4b96a-1f57-43c8-9c3f-8cab9c0a4a79.png)

<br>

# UAC elevation prompts

The UAC elevation prompts are color-coded to be app-specific, enabling for easier identification of an application's potential security risk. When an app attempts to run with an administrator's full access token, Windows first analyzes the executable file to determine its publisher. Apps are first separated into three categories based on the file's publisher:
*   Windows
*   Publisher verified (signed)
*   Publisher not verified (unsigned)
The elevation prompt color-coding is as follows:
*   Gray background: The application is a Windows administrative app, such as a Control Panel item, or an application signed by a verified publisher

    ![image.png](/.attachments/image-4320be54-1372-4202-8d20-077f053d6072.png)

*   Yellow background: the application is unsigned or signed but isn't trusted

    ![image.png](/.attachments/image-614791e6-64db-48cb-adb9-1183d2a37ec5.png)

<br>

#  Shield icon

Some Control Panel items, such asDate and Time, contain a combination of administrator and standard user operations. Standard users can view the clock and change the time zone, but a full administrator access token is required to change the local system time. The following is a screenshot of theDate and TimeControl Panel item.

![image.png](/.attachments/image-06cf4a88-17c6-4171-a8b7-542556f963e7.png)

The shield icon on theChange date and time...button indicates that the process requires a full administrator access token.

<br>

# Securing the elevation prompt

The elevation process is further secured by directing the prompt to theSecure Desktop. The consent and credential prompts are displayed on the Secure Desktop by default. Only Windows processes can access the secure desktop. For higher levels of security, we recommend keeping theUser Account Control: Switch to the secure desktop when prompting for elevationpolicy setting enabled.

In details:

Executing an image that requests administrative rights causes the application information service (AIS, contained in %SystemRoot%\System32\Appinfo.dll), which runs inside a standard service host process (SvcHost.exe), to launch %SystemRoot%\System32\Consent.exe. Consent captures a bitmap of the screen, applies a fade effect to it, switches to a desktop thats accessible only to the local system account (the Secure Desktop), paints the bitmap as the background, and displays an elevation dialog box that contains information about the executable. Displaying this dialog box on a separate desktop prevents any application present in the users account from modifying the appearance of the dialog box.

**_Note:_** _Starting inWindows Server 2019, it's not possible to paste the content of the clipboard on the secure desktop. This behavior is the same as the currently supported Windows client OS versions._
