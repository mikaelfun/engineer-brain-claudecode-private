---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/Hybrid Key Trust/Device registration"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FHybrid%20Key%20Trust%2FDevice%20registration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430185&Instance=430185&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430185&Instance=430185&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides useful event IDs and logs to verify for device registration in Azure Active Directory (AAD). It includes details about the Device Registration Service (DRS) endpoint, device details, and the output of the `dsregcmd` command.

[[_TOC_]]

**Note:** All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain personally identifiable information (PII) from customer environments.


## DRS endpoint is AAD

![Device Registration 11](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_11.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

![Device Registration 12](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_12.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

![Device Registration 13](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_13.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

![Device Registration 14](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_14.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

## Device details

```
+----------------------------------------------------------------------+   
DeviceId : b838f3xx-xx-4xx-axx-7acxxx   
Thumbprint : BD2F3AC33184B5xxxxx   
DeviceCertificateValidity : [ 2020-01-17 08:29:05.000 UTC -- 2030-01-17 08:59:05.000 UTC ]   
KeyContainerId : 794c68ab-xxxx-a0f6516829c6   
KeyProvider : Microsoft Software Key Storage Provider   
TpmProtected : NO  
+----------------------------------------------------------------------+
```

A certificate is retrieved:

![Device Registration 15](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_15.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

![Device Registration 16](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_16.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

![Device Registration 17](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_17.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

![Device Registration 18](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FDevice_registration_18.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

## Dsregcmd output

```
+----------------------------------------------------------------------+   
Device State                                                           
+----------------------------------------------------------------------+   
AzureAdJoined : YES  
EnterpriseJoined : NO  
DomainJoined : YES   
DomainName : CONTOSO   
+----------------------------------------------------------------------+   
SSO State                                                               
+----------------------------------------------------------------------+   
AzureAdPrt : YES  
AzureAdPrtUpdateTime : 2020-10-08 12:39:31.000 UTC   
AzureAdPrtExpiryTime : 2020-10-22 12:39:30.000 UTC   
AzureAdPrtAuthority : https://login.microsoftonline.com
+----------------------------------------------------------------------+
```
