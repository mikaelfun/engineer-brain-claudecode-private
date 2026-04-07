---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/SBSL - Slow Logon/Windows logon explained"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FSBSL%20-%20Slow%20Logon%2FWindows%20logon%20explained"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1313334&Instance=1313334&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1313334&Instance=1313334&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article outlines the Windows logon workflow from the operating system boot to the first interactive logon. It details the processes involved in initializing user sessions and handling user authentication.

[[_TOC_]]

The kernel-mode system thread that performs the final steps of initializing Windows Executive and Kernel components creates the system process called **Session Manager (smss.exe)**. This is the first process that operates in user mode, and its role is to launch and manage the user sessions.

##  Session 0  System Initialization

The main process **smss.exe** creates a duplicate of itself and performs the following actions:

- It creates the client/server runtime subsystem process (csrss.exe) for session 0.
- It creates an instance of the Session 0 Initial Command Wininit.
- Finally, this new smss.exe process exits, leaving the subsystem process and Wininit as parentless processes.

**Csrss.exe** handles the user-mode part of the Win32 subsystem (win32k.sys is the kernel-mode portion).

Its role is to expose some subset of the base Windows executive system services to application programs. Each subsystem can provide access to different subsets of the native services in Windows.

**Wininit.exe** performs startup tasks such as:

*   Creates Winsta0 (window station) and desktop objects (Winlogon, Default).
*   Sets default profile environment variables.
*   Starts:
    *   the Shutdown RPC server
    *   the Windows Shutdown Interface ((WSI - Modern apps all depend on it to properly shut down the system))
    *   the Service Control Manager (services.exe), which loads all services and device drivers marked for auto-start.
*   Checks if there was a previous system crash and, if so, starts the Windows Error Reporting process (werfault.exe), which carves the crash dump from a temporary dump file created by the main smss.exe from the page file.
*   Launches Local Security Authority Subsystem Service (lsass.exe) and, if enabled, Isolated LSA Trustlet (lsaiso.exe).

<br>

Process Explorer view:

![wininit.png](/.attachments/wininit-6ea29475-e055-4332-9fa1-1e4a7df7488e.png)

<br>

Wininit waits indefinitely for a system shutdown request.

The Local Session Manager (lsm.exe) service is also launched at this time.

<br>

##  Session 1  Interactive Logon Preparation

During the Windows boot process, the main **smss.exe** also creates a new instance of itself to initialize session 1 (interactive session).

This new smss.exe then creates a new process **csrss.exe**, which then creates **winlogon.exe** for the new session.

*   Winlogon spawns:
    *   a new instance of **fontdrvhost.exe** (UMDF font rendering)
    *   **dwm.exe** (Desktop Window Manager)
*   Creates Winsta0 with:
    *   the secure desktop (used by UAC, for instance)
    *   the default user desktop
*   Loads credential providers via **logonUI.exe**, which is responsible for displaying the logon interface.

<br>

Process Explorer view:

![winlogon.png](/.attachments/winlogon-9821d2dd-b1f6-4de6-9179-35b57035d015.png)

<br>

At this point, the system runs the session 0 used by system processes and services, and the session 1, which can be used by the first interactive console user.

Here is what you can see in WinDBG:

```
0: kd> !mex.session
Session Count: 2
Current session is: -1

ID  State        Processes Re-attach Count Committed Page Pool NonPage Pool Session Address
== ============ ========= =============== ========= ========= ============ ================
0   Disconnected       85                   0  2.77 MB  2.29 MB   204.00 KB  ffff80010c040000
1   Connected          5                    0  2.75 MB  2.25 MB   216.00 KB  ffff8000efdb6000
```

```
0: kd> !mex.tl -s 1
PID         Address          Name            Ses
===== ====== ================ =============== ===
0x328 0n808  ffff988fa2dc9140 csrss.exe       1
0x384 0n900  ffff988fa3445080 winlogon.exe    1
0x2b0 0n688  ffff988fa34ea200 fontdrvhost.exe 1
0x4c0 0n1216 ffff988fa3c10100 LogonUI.exe     1
0x534 0n1332 ffff988fa3c7c080 dwm.exe         1
```

<br>

##  First Interactive Logon

Winlogon.exe is notified of a user logon request when the user enters the **secure attention sequence (SAS)** keystroke combination (by default, **Ctrl+Alt+Del**) and is presented with the logon interface, **logonUI.exe**.

After capturing the credentials, they are sent to the Local Security Authentication Service process (**lsass.exe**) for authentication, and the logonUI.exe process terminates.

Lsass.exe calls the appropriate authentication package, implemented as a DLL, to perform the actual verification, such as checking whether a password matches what is stored in Entra ID, Active Directory, or the local SAM.

If Credential Guard is enabled, and this is a domain logon, Lsass.exe will communicate with the Isolated LSA Trustlet (**lsaiso.exe**) to obtain the machine key required to authenticate the legitimacy of the authentication request.

Upon successful authentication, lsass.exe generates an **access token** object that contains the users security profile.

If User Account Control (UAC) is used and the user logging on is a member of the administrators' group or has administrator privileges, lsass.exe will create a second, restricted version of the token. This access token will be used by Winlogon to create the initial process(es) in the users session.

For more details: [Workflow: User Account Control: How does it work ? - Overview](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2231718/Workflow-User-Account-Control-How-does-it-work-).

However, before that, Winlogon notifies registered network providers that a user has logged on, starting the **mpnotify.exe** process which enumerates all the network providers and notifies DLLs as needed.

Then, Winlogon checks for existing sessions that match the user logging in.
If a match is found, it may:
*   Transfer credentials to the existing session.
*   Reconnect the user to that session.
*   Or start a new session if no match is found (From session 2, as session 1 is already present for the console)

Then, Winlogon sends a **logon notification to all its subscribers** in the order stored in the registry under HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Winlogon\Notifications\Configurations\Default (a custom configuration can be created for third-party subscribers, for instance). The subscriber can then perform an action based on the notification.

By default (see table below), the logon notification would be sent to the **Profiles** subscriber before **GPClient** but the logoff notification would be sent after.

```
Logoff | *,TermSrv,GPClient,Profiles,SessionEnv,Wlansvc,Dot3svc
Logon  | SessionEnv,Profiles,Dot3svc,Wlansvc,GPClient,TermSrv,AUInstallAgent,*
```

The * means every other component not specifically listed under the registry key. They would still be notified if their settings are set under HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Winlogon\Notifications\Components\\[Component name].

For instance, for the User Profile Service service:

```
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Winlogon\Notifications\Components\Profiles]
"Events"="Logon,Logoff"
"ServiceName"="ProfSvc"
```

Then, Winlogon waits for the Shell Infrastructure Host (**sihost.exe**) to be launched by the **User Manager service** and starts the Shell by launching the executable or executables specified in HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WinLogon\Userinit (with multiple executables separated by commas) that by default points to %SystemDrive%\Windows\System32\Userinit.exe.

Note that Winlogon does not wait for the GP Processing completion to start the Shell in case of asynchronous processing.

Shell Infrastructure Host initializes the environment for the universal applications and runs for the duration of the session.

User Manager is responsible for managing information about the collection of users that are currently logged on to a Desktop version of Windows.

Then, **userinit.exe** performs the following steps:

1. Creates the per-session volatile Explorer Session key HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\SessionInfo\

2. Processes in this order : 
   - user logon scripts specified in HKCU\Software\Policies\Microsoft\Windows\System\Scripts
   - machine logon scripts in HKLM\SOFTWARE\Policies\Microsoft\Windows\System\Scripts
   - network provider logon scripts in HKCU\Environment\UserInitMprLogonScript

3. Launches the comma-separated shell or shells specified in HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell.

   If that value doesnt exist, Userinit.exe launches the shell or shells specified in HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell, which is by default Explorer.exe

4. If Group Policy specifies a user profile quota, starts %SystemRoot%\System32\Proquota.exe to enforce the quota for the current user.

UserInit.exe process terminates.

Winlogon.exe continues to run until the session is completely logged off.

<br>

##  WinDBG snippets when a session has been opened

The `!mex.session` command is used to display information about active sessions on a Windows system.

 Key Concepts

*   Session 0 is always Disconnected  used for system services and background tasks.
*   LoggedOn means a user has successfully authenticated and is actively using the session.
*   Connected means the session is active but the user hasn't logged on yet (e.g., at the logon screen).
*   The Processes column helps understand how "busy" or "populated" a session is.

 Example Interpretation

*   Session 0: 92 processes  system services and background tasks.
*   Session 1: 5 processes  waiting at logon screen.
*   Session 2: 28 processes  active user session with apps running.

<br>

 Console Logon Example

```
0: kd> !mex.session
Session Count: 4
Current session is: 3

ID         State        Processes Re-attach Count Committed Page Pool NonPage Pool Session Address
== ============ ========= =============== ========= ========= ============ ================
0   Disconnected       92                   0  2.71 MB  2.23 MB   204.00 KB ffffd6810a3a4000
1   LoggedOn           28                   0  7.93 MB  7.40 MB   248.00 KB ffffd680e1c62000
2   Connected          5                    0  4.75 MB  4.24 MB   220.00 KB ffffd680e85ac000
```

<br>

 Remote (RDP) Logon Example

```
0: kd> !mex.session
Session Count: 3
Current session is: -1

ID         State        Processes Re-attach Count Committed Page Pool NonPage Pool Session Address
== ==================== ========= =============== ========= ========= ============ ================
0   Disconnected       95                   0  2.86 MB  2.38 MB   204.00 KB ffffc5017213d000
1   Connected          5                    0  2.77 MB  2.27 MB   216.00 KB ffffc50189bae000
2   LoggedOn           28                   0  8.84 MB  8.27 MB   300.00 KB ffffc501608ff000
```

<br>


Credits : Olivier Bertin

Reviewer : Herbert Mauerer