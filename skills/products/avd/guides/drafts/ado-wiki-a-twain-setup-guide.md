---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/TWAIN/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2237287"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Prerequisites
-------------

Before configuring TWAIN, you need to ensure the following:
- Client/End User Machine
  - Windows App version must be 2.0.415.0 or newer (currently in Insider as of 5.27.25).
      - To download the Windows App Insider build please see: [What's new in Windows App - Windows App | Microsoft Learn](https://learn.microsoft.com/en-us/windows-app/whats-new?tabs=windows)
   - MSRDC version: 1.2.6220 or newer (currently in Insider as of 5.27.25).
     - To download the MSRDC Insider build please see: [What's new in the Remote Desktop client for Windows - Remote Desktop client | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/remote-desktop-client/whats-new-windows?tabs=windows-msrdc-msi)
- Server/Session Host
  - Run [qwinsta](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/qwinsta) on the session host.
     - The version should be rdp-sxs240929850 or newer.
  - Install twainredirector MSI  [TwainRedirectorMsi-Selfhost.msi](https://microsoft.sharepoint.com/:u:/t/WCXSharepoint/EeoeoQgv9J5AlM2lTZqLEgIBT7Ou8JsHgPxqsoHZYPd_TA?e=cDFrZR)

Enable TWAIN Redirection on the Session Host
--------------------------------------------

1. On the remote session host/VM, launch command line with admin privileges and run the following command:
  
         reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v fTWAINRedirectionEnabled /t REG_DWORD /d 1 /f

  -  For Public Preview, this will be supported by ADMX/GPO Policies and will be supported by Intune Settings Catalog.
2. On the remote session host/VM, install twainredirector MSI.

 **Note:** For Public Preview, this will be installed automatically by the agent.

3. On the remote session host/VM, install the scanner specific application(s) that the locally attached scanner requires to function.
   - This will vary based on the scanner you are leveraging so please consult the scanner for more information.

Scenarios to Validate
---------------------

1. Launch into an AVD/W365 remote session.
2. Plug in a TWAIN scanner to your local Windows endpoint device.
3. Launch the scanner application on session host.
4. Scan documents.
