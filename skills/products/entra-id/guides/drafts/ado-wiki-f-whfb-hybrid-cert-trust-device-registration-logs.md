---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/Hybrid Certificate Trust/Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FHybrid%20Certificate%20Trust%2FDevice%20Registration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430668&Instance=430668&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430668&Instance=430668&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a detailed overview of user device registration event logs and related information. It is particularly useful for those responsible for Azure Active Directory (AAD) and device management. 

[[_TOC_]]

Even if those steps are the responsibility of the Azure Identity (Azure Active Directory, AAD) team, here are the main event IDs and logs to verify:

# User device registration event log

![Device registration event log](/.attachments/WHfB/Device_registration.png)

# Device Registration Service (DRS) endpoint is AAD

![DRS endpoint is AAD](/.attachments/WHfB/Device_registration_19.png)

# Domain is AAD verified domain name

![AAD verified domain name](/.attachments/WHfB/Device_registration_20.png)

![AAD verified domain name example](/.attachments/WHfB/Device_registration_21.png)

```
+----------------------------------------------------------------------+ 
| Device Details                                                       | 
+----------------------------------------------------------------------+ 
DeviceId : b838f3be-7113-4c0a-a970-7ac52edc54d6 
Thumbprint : BD2F3AC33184B574763D05F512BB66F0DC26A1A0
DeviceCertificateValidity : [2020-01-17 08:29:05.000 UTC -- 2030-01-17 08:59:05.000 UTC] 
KeyContainerId : 794c68ab-5346-4370-8aa7-a0f6516829c6 
KeyProvider : Microsoft Software Key Storage Provider 
TpmProtected : NO
```

![Device details](/.attachments/WHfB/Device_registration_22.png)

![Device details example](/.attachments/WHfB/Device_registration_23.png)

![Device details example](/.attachments/WHfB/Device_registration_24.png)

![Device details example](/.attachments/WHfB/Device_registration_25.png)

# dsregcmd output

```
+----------------------------------------------------------------------+ 
| Device State                                                         | 
+----------------------------------------------------------------------+ 
AzureAdJoined : YES 
EnterpriseJoined : NO 
DomainJoined : YES 
DomainName : CONTOSO 

+----------------------------------------------------------------------+ 
| SSO State                                                            | 
+----------------------------------------------------------------------+ 
AzureAdPrt : YES 
AzureAdPrtUpdateTime : 2020-10-05 12:30:48.000 UTC 
AzureAdPrtExpiryTime : 2020-10-19 13:14:09.000 UTC 
AzureAdPrtAuthority : https://login.microsoftonline.com/9dc61dba-e80b-4201-b4fd-91929394957778 
EnterprisePrt : YES 
EnterprisePrtUpdateTime : 2020-10-05 12:30:49.000 UTC 
EnterprisePrtExpiryTime : 2020-10-19 12:30:49.000 UTC 
```
