---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking for known solutions | tips/Generic solutions/RDP/RDP behavior in Hybrid key trust model"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20for%20known%20solutions%20%7C%20tips%2FGeneric%20solutions%2FRDP%2FRDP%20behavior%20in%20Hybrid%20key%20trust%20model"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# RDP behavior in Hybrid key trust model

**Summary:**
This section explains the expected behavior when using a Windows Hello for Business (WHFB) certificate during a Remote Desktop Protocol (RDP) connection in a Key Trust deployment. The tests were conducted using a Windows 11 hybrid client and either a Windows 11 client or Windows Server 2022 as the destination.

## Goal
The purpose of this section is to show the expected behavior while using a Windows Hello for Business (WHFB) certificate during an RDP connection in a Key Trust deployment. Tests were done using a Windows 11 hybrid client and either a Windows 11 client as the destination or a Windows Server 2022.

## Without a certificate
The user gets an error while using RDP to a server and selecting Windows Hello for Business credential provider (PIN).

## With all requirements
After implementing all the needed requirements by following [Deploying Certificates to Key Trust Users to Enable RDP](https://docs.microsoft.com/windows/security/identity-protection/hello-for-business/hello-deployment-rdp-certs):

RDP is working after entering the PIN.

The same result was confirmed on Windows 10 21H2.
