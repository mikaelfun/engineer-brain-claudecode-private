---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/On-Premises Certificate Trust/Device registration"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FOn-Premises%20Certificate%20Trust%2FDevice%20registration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430196&Instance=430196&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430196&Instance=430196&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a guide on user device registration event logs, focusing on Azure Active Directory (AAD) and Active Directory Federation Services (ADFS) on-premises. It includes event IDs, logs, and diagnostic commands for troubleshooting.

# User device registration event log

![image.png](/.attachments/image-07ef520f-dbc0-47f7-b98d-1797191ef1f5.png)

# DRS endpoint is ADFS on-premises

![image.png](/.attachments/image-a95ad42f-1921-46ef-a51e-ca7d8f6bcd92.png)

## Domain is ADFS service name

![image.png](/.attachments/image-6fea9ec0-43ba-4e6e-b5bc-5cddaa9ac9a3.png)  

![image.png](/.attachments/image-bd997b09-74d1-42f7-a365-87371be5478a.png)  

![image.png](/.attachments/image-49e3c164-5185-445d-aca8-a20c10251f91.png)

![image.png](/.attachments/image-209bccde-12e5-4e96-a5f1-c42a8396bbdf.png)

![image.png](/.attachments/image-aead8177-38a1-4dec-ae0b-0c6787ea01d3.png)

![image.png](/.attachments/image-c33fe695-e4ff-4848-9910-ebafd19c0037.png)

![image.png](/.attachments/image-ba89b783-d061-4028-a4e3-aa7f2c3d188c.png)

![image.png](/.attachments/image-f57e0d25-1645-4bab-b959-badd5a43596b.png)

![image.png](/.attachments/image-2a29f58e-b317-46ea-8869-2a515d003651.png)
---

# Ngc.etl

TPM-bound (preferred) RSA 2048-bit key-pair known as the device key (dkpub/dkpriv)  
Look for `[PCPKsp]` + `[drv]` performed by lsass in Ngc.etl

Dsregcmd output

```
+----------------------------------------------------------------------+ 
| Device State                                                         | 
+----------------------------------------------------------------------+ 
AzureAdJoined : NO 
EnterpriseJoined : YES 
DomainJoined : YES 
DomainName : ADFOREST4 

+----------------------------------------------------------------------+ 
| SSO State                                                            | 
+----------------------------------------------------------------------+ 
AzureAdPrt : NO 
AzureAdPrtAuthority :  
EnterprisePrt : YES 
EnterprisePrtUpdateTime : 2020-05-05 16:07:39.000 UTC 
EnterprisePrtExpiryTime : 2020-05-19 16:07:39.000 UTC 
```
