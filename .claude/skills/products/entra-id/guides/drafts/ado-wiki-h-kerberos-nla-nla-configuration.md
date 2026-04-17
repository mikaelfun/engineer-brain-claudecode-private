---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: NLA/Kerberos: NLA: NLA configuration"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20NLA/Kerberos%3A%20NLA%3A%20NLA%20configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699760&Instance=1699760&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699760&Instance=1699760&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**: This article explains three methods to enable or disable Network Level Authentication (NLA) for Remote Desktop Services. The methods include using Group Policy Editor, configuring the registry manually, and using the remote settings GUI.

[[_TOC_]]

# Ways to enable or disable Network Level Authentication (NLA)

There are three ways to enable or disable Network Level Authentication (NLA):

1. Group Policy Editor (GPO)
2. Registry
3. Remote setting GUI
---
# 1. Group Policy Editor (GPO)

NLA can be configured via policy by navigating to the following path:

Computer Configuration > Policies > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Security > Require user authentication for remote connections by using Network Level Authentication

- Value: Enabled

**Registry location for this Group Policy**

- Path: `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services`
- Value Name: UserAuthentication
- Value Type: REG_DWORD
- Enabled Value: 1
- Disabled Value: 0

----

# 2. Configuring NLA manually via Registry

To configure NLA manually via the registry, navigate to:

**Path**: `HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\Winstations\rdp-tcp\UserAuthentication`

- Type: DWORD
- Enabled: 1
- Disabled: 0

### Command to enable NLA manually via registry

```plaintext
REG add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v UserAuthentication /t REG_DWORD /d 1 /f
```

###Command to disable NLA manually via registry

```plaintext
REG add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v UserAuthentication /t REG_DWORD /d 0
```
---
# 3. Enable or disable NLA via remote setting GUI

Ticking the checkbox activates the NLA setting, while leaving it unticked deactivates the NLA.

![image.png](/.attachments/image-c889383f-4564-4248-94b6-0204ed040f5e.png)

