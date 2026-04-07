---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User Account Control/Workflow: User Account Control: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%20Account%20Control/Workflow%3A%20User%20Account%20Control%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232587&Instance=2232587&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2232587&Instance=2232587&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed data collection plan for troubleshooting common UAC problems or failures.

[[_TOC_]]

# Data collection for common UAC problems

The logs must be enabled in a parallel user session if the affected user has no local admin privilege on the machine.

1. Log on by a local admin or domain admin account.

2. Launch a Command Prompt window with "run as administrator" and execute the following commands to start capturing UAC ETW trace:
      ```
      logman create trace "UAC" -ow -o c:\UAC.etl -p "Microsoft-Windows-UserAccountControl" 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
      logman update trace "UAC" -p {CBB61B6D-A2CF-471A-9A58-A4CD5C08FFBA} 0xffffffffffffffff 0xff -ets
      logman update trace "UAC" -p "Microsoft-Windows-UAC" 0xffffffffffffffff 0xff -ets
      ```
3. Switch user to a non-admin user and reproduce the issue
4. After reproduction, switch user back to the admin.
5. Stop UAC tracing with command `logman stop "UAC" -ets`. Log file is at `c:\UAC.etl`.
6. Please export the following registry key: HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System
6. Send the data to the Microsoft workspace.

<br>

# Application side data collection

You may also need to verify the manifest of the application with Sigcheck (https://learn.microsoft.com/en-us/sysinternals/downloads/sigcheck) as this is the most common way of requesting administrative rights for an executable.

For instance,
```
C:\sigcheck -m C:\Windows\System32\eventvwr.exe
```
```
...
<trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
        <requestedPrivileges>
            <requestedExecutionLevel
                level="highestAvailable"
                uiAccess="false"
            />
        </requestedPrivileges>
    </security>
</trustInfo>
<asmv3:application>
   <asmv3:windowsSettings xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">
        <autoElevate>true</autoElevate>
   </asmv3:windowsSettings>
</asmv3:application>
...
```

It is also possible to achieve the same by opening the application executable in Visual Studio as per the following screenshots.

![VSEventvwr.jpg](/.attachments/VSEventvwr-3ff9c12f-e7dc-4df2-a32f-95906492c139.jpg)

![Manifest.jpg](/.attachments/Manifest-869bb42d-c0fa-462d-bd4f-72dcae5a0e87.jpg)

The requestedExecutionLevel tag can have multiple values:

| Elevation Level | Meaning | Usage |
|--|--|--|
| Asinvoker | No need for admin rights; never ask for elevation | Typical user apps that don't need admin rights |
| HighestAvailable | Request approval for highest rights available. If the user is logged on as a standard user, the process will be launched as invoker; otherwise, an AAM elevation prompt will appear, and the process will run with full admin rights.| Apps that can work without full admin rights but expect users to want full access if possible (regedit for instance) |
| RequireAdministrator | Always request admin rights. An OTS elevation prompt will appear to standard users. | Apps that require admin rights to work (Firewall settings for instance) |
