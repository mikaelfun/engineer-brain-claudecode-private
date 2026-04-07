---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User Account Control/Workflow: User Account Control: How does it work ?"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%20Account%20Control/Workflow%3A%20User%20Account%20Control%3A%20How%20does%20it%20work%20%3F"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2231718&Instance=2231718&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2231718&Instance=2231718&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document explains the User Account Control (UAC) principles and slider settings.

[[_TOC_]]

##  Overview: What is User Account Control?

User Account Control (UAC) is a Windows security feature designed to protect the operating system from unauthorized changes.
When changes to the system require administrator-level permission, UAC notifies the user, giving the opportunity to approve or deny the change.
      
Without administrative rights, users cannot accidentally (or deliberately) modify system settings, malware cant normally alter system security settings or disable antivirus software, and users cant compromise the sensitive information of other users on shared computers. Running with standard user rights can thus mitigate the impact of malware and protect sensitive data on shared computers.


Processes launched using astandard user tokenmight perform tasks using access rights granted to a standard user. For instance, Windows Explorer automatically inherits standard user level permissions. Any applications that are started using Windows Explorer (for example, by opening a shortcut) also run with the standard set of user permissions. Most applications, including the ones included with the operating system, are designed to work properly this way.

Other applications / tasks might require more permissions to run successfully. When a user tries to perform an action that requires administrative privileges, UAC triggers aconsent prompt. The prompt notifies the user that a change is about to occur, asking for their permission to proceed:
*   If the user approves the change, the action is performed with the highest available privilege
*   If the user doesn't approve the change, the action isn't performed and the application that requested the change is prevented from running

UAC is enabled by default (highly recommended), and you can configure it if you have administrative privileges.

<br>

#Sign in and Elevation
The flowchart below explains what happens when the user signs in and starts an application, depending of the available token and requirements of the application.

![UAC workflow.jpg](/.attachments/UAC%20workflow-8bbe57d6-1073-455d-af0a-b31ea0c6b4f2.jpg)
 
By default, both standard and administrator users access resources and execute apps in the security context of a standard user.

When a standard user signs in, the system creates an access token for that user:
*   Contains the same user-specific information as the administrator access token, but the administrative Windows privileges and SIDs are removed
*   Is used to start applications that don't perform administrative tasks (standard user apps)
*   Is used to display the desktop by executing the processexplorer.exe. Explorer.exe is the parent process from which all other user-initiated processes inherit their access token. As a result, all apps run as a standard user unless a user provides consent or credentials to approve an app to use a full administrative access token A user that is a member of the Administrators group can sign in, browse the Web, and read e-mail while using a standard user access token. When the administrator needs to perform a task that requires the administrator access token, Windows automatically prompts the user for approval. This prompt is called anelevation prompt, and its behavior can be configured via policy or registry.

For administrators,two access tokensare created:
*   Afiltered admin token (same as standard user token)used by default for non-admin tasks
*   Anadministrator token(used only when elevated privileges are needed)
      
All processes created under the users session will normally have the filtered admin token in effect so that applications that can run with standard user rights will do so.
However, the administrative user can run a program or perform other functions that require full
Administrator rights through UAC elevation.

<br>

This behavior actually applies to more than just the administrator user. In fact, any account that is a member of the following privileged groups receives two access tokens:
      
| Domain | Any computer | Server SKU |
|--|--|--|
| Domain Admins  Global Group | Administrators  Local | Print Operators  Local |
| Enterprise Admins  Universal Group | Backup Operators  Local |  |
| Schema Admins  Universal Group | Cryptographic Operators  Local |  |
| Account Operators  Domain Local | Network Configuration Operators  Local |  |
| Server Operators  Domain Local | Power Users (deprecated)  Local |  |
| Group Policy Creator Owners  Global Group |  |  |

<br>

The elevation process follows these steps:
1.  User Action: A user attempts to perform a task requiring admin rights (e.g., installing software).
2.  Elevation Check: The system checks if the action requires elevation.
3.  Prompt Triggered: If elevation is needed, UAC displays a prompt:
    *   Admins: Consent prompt unless auto-elevation is used
    *   Standard Users: Must enter admin credentials
4.  Token Switching: If approved, the process is launched with a full administrative token

<br>

Auto-elevation:
In the default configuration, most Windows executables and control panel applets do not result in elevation prompts for administrative users, even if they need administrative rights to run. This is because of a mechanism called _auto-elevation_. Auto-elevation is intended to preclude administrative users from seeing elevation prompts for most of their work; the programs will automatically run under the
users full administrative token.



<br>

# Virtualization

Windows includes file and registry virtualization technology for apps that aren't UAC-compliant and that requires an administrator's access token to run correctly.

When an administrative app that isn't UAC-compliant attempts to write to a protected folder, such as_Program Files_, UAC gives the app its own virtualized view of the resource it's attempting to change. The virtualized copy is maintained in the user's profile. This strategy creates a separate copy of the virtualized file for each user that runs the noncompliant app.

Most app tasks operate properly by using virtualization features. Although virtualization allows most applications to run, it's a short-term fix and not a long-term solution. App developers should modify their apps to be compliant as soon as possible, rather than relying on file, folder, and registry virtualization.

Virtualization isn't an option in the following scenarios:
*   Virtualization doesn't apply to apps that are elevated and run with a full administrative access token
*   Virtualization supports only 32-bit apps. Nonelevated 64-bit apps receive an access denied message when they attempt to acquire a handle (a unique identifier) to a Windows object. Native Windows 64-bit apps are required to be compatible with UAC and to write data into the correct locations
*   Virtualization is disabled if the app includes an app manifest with a requested execution level attribute

For more information about this topic, please refer to the Windows Internal Part1 book.

<br>

# Settings
UAC can be configured through the Control Panel \ User Accounts\ User account Control settings

![UAC slider.jpg](/.attachments/UAC%20slider-d7006a55-3369-48d9-b09b-a1624fe3e480.jpg)

See a a summary of the behavior:

|Slider Position|When admin user not running with admin rights attempts to change Windows settings |When admin user not running with admin rights attempts to install software or run a program whose manifest calls for elevation or uses "Run as Administrator" |Remarks |
|--|--|--|--|
|Highest position (always notify) |UAC elevation prompt on Secure Desktop |UAC elevation prompt on Secure Desktop  |Vista behavior |
|Second position |UAC elevation occurs automatically with no prompts or notification |UAC elevation prompt on Secure Desktop  |Default setting |
|Third position |UAC elevation occurs automatically with no prompts or notification |UAC elevation prompt on user's normal desktop  |Not recommended |
|Lowest position (Never notify)|UAC turned off for admin users |UAC turned off for admin users |Not recommended |

<br>

In more details:
  
*   Always notifywill:
    *   Notify you when programs try to install software or make changes to your computer.
    *   Notify you when you make changes to Windows settings.
    *   Freeze other tasks until you respond.
    *   Recommended if you often install new software or visit unfamiliar websites.

*   Notify me only when programs try to make changes to my computerwill:
    *   Notify you when programs try to install software or make changes to your computer.
    *   Not notify you when you make changes to Windows settings.
    *   Freeze other tasks until you respond.
    *   Recommended if you don't often install apps or visit unfamiliar websites.

*   Notify me only when programs try to make changes to my computer (do not dim my desktop)will:
    *   Notify you when programs try to install software or make changes to your computer.
    *   Not notify you when you make changes to Windows settings.
    *   Not freeze other tasks until you respond.
    *   Not recommended. Choose this option only if it takes a long time to dim the desktop on your computer.

*   Never notify (Disable UAC prompts)will:
    *   Not notify you when programs try to install software or make changes to your computer.
    *   Not notify you when you make changes to Windows settings.
    *   Not freeze other tasks until you respond.
    *   Not recommended due to security concerns.

**Attention**: _The slider never turns off UAC completely._ 

If you set it toNever notify, it will:
*   Keep the UAC service running
*   Cause all elevation request initiated by administrators to be autoapproved without showing a UAC prompt
*   Automatically deny all elevation requests for standard users

**Important**:  
In order to fully disable UAC, you must disable the policyUser Account Control: Run all administrators in Admin Approval Mode. Some Universal Windows Platform apps might not work when UAC is disabled.

<br>

Note that UAC behavior is highly configurable via Group Policy, Registry, Intune, or Configuration Service Providers (CSP). See [Workflow: User Account Control: Configuration Settings - Overview](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232580/Workflow-User-Account-Control-Configuration-Settings)
