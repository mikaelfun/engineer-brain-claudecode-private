---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Tips & Hints/How to clear WAM Cache?"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/559443"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**   
This guide provides step-by-step instructions on how to clear the Web Account Manager (WAM) cache on a device. Follow the instructions carefully to ensure a smooth process.

[[_TOC_]]

# Clear WAM cache

1. Rename this folder:  
`%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy` -> `%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy.backup` (needs a different admin account to rename)

1. Run the following PowerShell command:
   ```powershell
   Add-AppxPackage -Register "$env:windir\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Appxmanifest.xml" -DisableDevelopmentMode -ForceApplicationShutdown
   ```

1. Rename this registry key:   
From: `Computer\HKEY_CURRENT_USER\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount`  
To: `Computer\HKEY_CURRENT_USER\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount_backup`

1. Reboot the device.

[Primary Refresh Token (PRT)](https://docs.microsoft.com/azure/active-directory/devices/concept-primary-refresh-token) is stored in the TokenBroker cache only in the case of workplace-joined (Azure registered) devices.

For both Azure Active Directory Joined (AADJ) and Hybrid AADJ, its in the Local Security Authority (LSA) cache and stored in:   
`system32\config\systemprofile\AppData\Local\Microsoft\Windows\CloudAPCache`

More details about [Windows Authentication Manager (WAM)](https://www.osgwiki.com/wiki/Web_Account_Manager)