---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User Account Control/Workflow: User Account Control: Configuration Settings"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%20Account%20Control/Workflow%3A%20User%20Account%20Control%3A%20Configuration%20Settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232580&Instance=2232580&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232580&Instance=2232580&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document explains the User Account Control (UAC) configuration settings.

[[_TOC_]]

# User Account Control configuration

To configure UAC, you can use:
- Group policy
- Registry
- CSP (Configuration Service Provider)
- Intune (not covered here)


<br>

## GPO
[User Account Control settings and configuration | Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/settings-and-configuration?tabs=gpo#user-account-control-configuration)

The policies can be configured locally by using the Local GPO or configured for the domain, OU, or specific groups by group policy.
The policy settings are located under:
Computer Configuration\Windows Settings\Security Settings\Local Policies\Security Options.

| Group Policy setting<br> | Default value<br> |
| --- | --- |
| User Account Control: Admin Approval Mode for the built-in Administrator account<br> | Disabled<br> |
| User Account Control: Allow UIAccess applications to prompt for elevation without using the secure desktop<br> | Disabled<br> |
| User Account Control: Behavior of the elevation prompt for administrators in Admin Approval Mode<br> | Prompt for consent for non-Windows binaries<br> |
| User Account Control: Behavior of the elevation prompt for standard users<br> | Prompt for credentials<br> |
| User Account Control: Detect application installations and prompt for elevation<br> | Enabled (default for home edition only)<br>Disabled (default)<br> |
| User Account Control: Only elevate executables that are signed and validated<br> | Disabled<br> |
| User Account Control: Only elevate UIAccess applications that are installed in secure locations<br> | Enabled<br> |
| User Account Control: Run all administrators in Admin Approval Mode<br> | Enabled<br> |
| User Account Control: Switch to the secure desktop when prompting for elevation<br> | Enabled<br> |
| User Account Control: Virtualize file and registry write failures to per-user locations<br> | Enabled<br> |

<br>

## Registry
[User Account Control settings and configuration | Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/settings-and-configuration?tabs=reg#user-account-control-configuration)

The registry keys are found under the key:HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System.

Here are the main registry values based on the slider position:

| Slider position | ConsentPromptBehaviorAdmin | ConsentPromptBehaviorUser | EnableLUA | PromptSecureDesktop |
|--|--|--|--|--|
| Highest position | 2 (display AAC UAC elevation prompt)| 3 (display OTS UAC elevation prompt)| 1 (enabled) | 1 (enabled) |
| Second position | 5 (display AAC UAC elevation prompt, except for changes to windows settings)| 3 | 1 | 1 |
| Third Position | 5 | 3 | 1 | 0 (disabled: UAC prompt appears on user's normal desktop) |
| Lowest Position | 0 | 3 | 0 (disabled; logins to admin accounts do not create a restricted admin access token) | 0 |

OTS (over-the-shoulder) requires the entry of credentials for an account thats a member of the Administrators group, something thats usually completed by a privileged user typing over the shoulder of a standard user.

AAC: elevation performed by an admin user where the user simply has to approve the assignment of his administrative rights.

<br>

Here is the exhaustive list of the registry values:

| Setting name<br> | Registry key name<br> | Value<br> |
| --- | --- | --- |
| Admin Approval Mode for the built-in Administrator account<br> | FilterAdministratorToken<br> | 0 (Default) = Disabled<br>1 = Enabled<br> |
| Allow UIAccess applications to prompt for elevation without using the secure desktop<br> | EnableUIADesktopToggle<br> | 0 (Default) = Disabled<br>1 = Enabled<br> |
| Behavior of the elevation prompt for administrators in Admin Approval Mode<br> | ConsentPromptBehaviorAdmin<br> | 0 = Elevate without prompting<br>1 = Prompt for credentials on the secure desktop<br>2 = Prompt for consent on the secure desktop<br>3 = Prompt for credentials<br>4 = Prompt for consent<br>5 (Default) = Prompt for consent for non-Windows binaries<br> |
| Behavior of the elevation prompt for standard users<br> | ConsentPromptBehaviorUser<br> | 0 = Automatically deny elevation requests<br>1 = Prompt for credentials on the secure desktop<br>3 (Default) = Prompt for credentials<br> |
| Detect application installations and prompt for elevation<br> | EnableInstallerDetection<br> | 1 = Enabled (default for home only)<br>0 = Disabled (default)<br> |
| Only elevate executables that are signed and validated<br> | ValidateAdminCodeSignatures<br> | 0 (Default) = Disabled<br>1 = Enabled<br> |
| Only elevate UIAccess applications that are installed in secure locations<br> | EnableSecureUIAPaths<br> | 0 = Disabled<br>1 (Default) = Enabled<br> |
| Run all administrators in Admin Approval Mode<br> | EnableLUA<br> | 0 = Disabled<br>1 (Default) = Enabled<br> |
| Switch to the secure desktop when prompting for elevation<br> | PromptOnSecureDesktop<br> | 0 = Disabled<br>1 (Default) = Enabled<br> |
| Virtualize file and registry write failures to per-user locations<br> | EnableVirtualization<br> | 0 = Disabled<br>1 (Default) = Enabled<br> |
| Prioritise network logons over cached logons<br> | InteractiveLogonFirst<br> | 0 (Default) = Disabled<br>1 = Enabled<br> |

<br>

## CSP

[User Account Control settings and configuration | Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/settings-and-configuration?tabs=csp#user-account-control-configuration)

| Setting | CSP Name |
| --- | --- |
| Admin Approval Mode for the built-in Administrator account | UserAccountControl_UseAdminApprovalMode |
| Allow UIAccess applications to prompt for elevation without using the secure desktop | UserAccountControl_AllowUIAccessApplicationsToPromptForElevation |
| Behavior of the elevation prompt for administrators in Admin Approval Mode | UserAccountControl_BehaviorOfTheElevationPromptForAdministrators |
| Behavior of the elevation prompt for standard users | UserAccountControl_BehaviorOfTheElevationPromptForStandardUsers |
| Detect application installations and prompt for elevation | UserAccountControl_DetectApplicationInstallationsAndPromptForElevation |
| Only elevate executables that are signed and validated | UserAccountControl_OnlyElevateExecutableFilesThatAreSignedAndValidated |
| Only elevate UIAccess applications that are installed in secure locations | UserAccountControl_OnlyElevateUIAccessApplicationsThatAreInstalledInSecureLocations |
| Run all administrators in Admin Approval Mode | UserAccountControl_RunAllAdministratorsInAdminApprovalMode |
| Switch to the secure desktop when prompting for elevation | UserAccountControl_SwitchToTheSecureDesktopWhenPromptingForElevation |
| Virtualize file and registry write failures to per-user locations | UserAccountControl_VirtualizeFileAndRegistryWriteFailuresToPerUserLocations |

<br>

# User Account Control settings explained

The following list shows the available settings to configure the UAC behavior, and their default values.
*   Admin Approval Mode for the built-in Administrator account: Controls the behavior of Admin Approval Mode for the built-in Administrator account.
    *   Enabled: The built-in Administrator account uses Admin Approval Mode. By default, any operation that requires elevation of privilege prompts the user to prove the operation.
    *   Disabled (default): The built-in Administrator account runs all applications with full administrative privilege.

*   Behavior of the elevation prompt for administrators in Admin Approval Mode: Controls the behavior of the elevation prompt for administrators.
    *   Elevate without prompting: Allows privileged accounts to perform an operation that requires elevation without requiring consent or credentials.
    *   Prompt for credentials on the secure desktop: When an operation requires elevation of privilege, the user is prompted on the secure desktop.
    *   Prompt for consent on the secure desktop: When an operation requires elevation of privilege, the user is prompted on the secure desktop to select either Permit or Deny.
    *   Prompt for credentials: When an operation requires elevation of privilege, the user is prompted to enter an administrative user name and password.
    *   Prompt for consent: When an operation requires elevation of privilege, the user is prompted to select either Permit or Deny.
    *   Prompt for consent for non-Windows binaries (default): When an operation for a non-Microsoft application requires elevation of privilege, the user is prompted on the secure desktop to select either Permit or Deny.

*   Behavior of the elevation prompt for standard users: Controls the behavior of the elevation prompt for standard users.
    *   Prompt for credentials (default): When an operation requires elevation of privilege, the user is prompted to enter an administrative user name and password.
    *   Automatically deny elevation requests: When an operation requires elevation of privilege, a configurable access denied error message is displayed.
    *   Prompt for credentials on the secure desktop: When an operation requires elevation of privilege, the user is prompted on the secure desktop to enter a different user name and password.

*   Detect application installations and prompt for elevation: Controls the behavior of application installation detection for the computer.
    *   Enabled (default): When an app installation package is detected that requires elevation of privilege, the user is prompted to enter an administrative user name and password. If the user enters valid credentials, the operation continues with the applicable privilege.
    *   Disabled: App installation packages aren't detected and prompted for elevation. Enterprises that are running standard user desktops and use delegated installation technologies, such as Microsoft Intune, should disable this policy setting. In this case, installer detection is unnecessary.

*   Only elevate executables that are signed and validated: Enforces signature checks for any interactive applications that request elevation of privilege. Enabled: Enforces the certificate certification path validation for a given executable file before it's permitted to run.
    *   Disabled (default): Doesn't enforce the certificate certification path validation before a given executable file is permitted to run.

*   Only elevate UIAccess applications that are installed in secure locations: Controls whether applications that request to run with a User Interface Accessibility (UIAccess) integrity level must reside in a secure location in the file system.
    *   Enabled (default): If an app resides in a secure location in the file system, it runs only with UIAccess integrity.
    *   Disabled: An app runs with UIAccess integrity even if it doesn't reside in a secure location in the file system.
    *   Secure locations are limited to the following folders:
    *   %ProgramFiles%, including subfolders
    *   %SystemRoot%\system32\
    *   %ProgramFiles(x86)%, including subfolders

    Note: Windows enforces a digital signature check on any interactive apps that request to run with a UIAccess integrity level regardless of the state of this setting.

*   Run all administrators in Admin Approval Mode: Controls the behavior of all UAC policy settings.
    *   Enabled (default): Admin Approval Mode is enabled. This policy must be enabled and related UAC settings configured. The policy allows the built-in Administrator account and members of the Administrators group to run in Admin Approval Mode.
    *   Disabled: Admin Approval Mode and all related UAC policy settings are disabled.Note:If this policy setting is disabled,Windows Securitynotifies you that the overall security of the operating system is reduced.

*   Switch to the secure desktop when prompting for elevation: This policy setting controls whether the elevation request prompt is displayed on the interactive user's desktop or the secure desktop.
    *   Enabled (default): All elevation requests go to the secure desktop regardless of prompt behavior policy settings for administrators and standard users.
    *   Disabled: All elevation requests go to the interactive user's desktop. Prompt behavior policy settings for administrators and standard users are used.
