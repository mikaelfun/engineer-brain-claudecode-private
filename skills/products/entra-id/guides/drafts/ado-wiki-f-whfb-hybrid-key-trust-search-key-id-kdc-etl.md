---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/Hybrid Key Trust/Authentication/Search key id in kdc etl"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FHybrid%20Key%20Trust%2FAuthentication%2FSearch%20key%20id%20in%20kdc%20etl"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/467068&Instance=467068&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/467068&Instance=467068&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document explains the process of searching for a key ID in the Key Distribution Center (KDC) ETL, detailing the roles of various flags and functions like `KdcNormalize()` and `KdcGetTicketInfo()`. It includes definitions and code snippets to aid in understanding.

**All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments.**


## Support Topic

There must be "NameFlags" with "KDC_NAME_KEY_ID" positioned during the call of "KdcNormalize()". Then, it will add "SAM_OPEN_BY_KEY_ID" in LookupFlags when it calls "KdcGetTicketInfo()", which itself calls Security Account Manager (SAM).

### LookupFlags 0x20000
```
[5] 0354.759C::07/11/19-12:29:43.0122534 - KdcNormalize checking name in SAM
[5] 0354.759C::07/11/19-12:29:43.0122542 - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000081, GenericUserName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA, LookupFlags 0x20000, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
```

### _samisrv.w_
Flag Definitions for SamIGetUserLogonInformation
```c
#define SAM_OPEN_BY_KEY_ID ((ULONG)0x00020000)
```

### _tktutil.cxx_
```c
// for KeyID 
if (NameFlags & KDC_NAME_KEY_ID)  
    LookupFlags |= SAM_OPEN_BY_KEY_ID;
```

### _tktutil.hxx_
**NameFlags**
```c
// Flags for Normalize 
#define KDC_NAME_CLIENT                 0x01  
#define KDC_NAME_SERVER                 0x02  
#define KDC_NAME_FOLLOW_REFERRALS       0x04  
#define KDC_NAME_INBOUND                0x08    // for trust, indicates name need not be outbound trust only  
#define KDC_NAME_CHECK_GC               0x10    // indicates that the client said this name should be canonicalized at the GC  
#define KDC_NAME_UPN_TARGET             0x20  
#define KDC_NAME_S4U_CLIENT             0x40    // causes name lookup to be done by AltSecId as well as UPN  
#define KDC_NAME_ALT_SEC_ID             0x80    // the client name is an AltSecID  
#define KDC_NAME_BRANCHID              0x100    // lookup by branch ID  
#define KDC_NAME_KEY_ID                0x200    // lookup by key ID
```

```c
// Behaviour flags for Normalize and GetTicketInfo 
#define KDC_NORMALIZE_RESTRICT_USER_ACCOUNTS       0x01    // restrict user-user  
#define KDC_NORMALIZE_NO_SECRETS                   0x02    // don't attempt to get the user secrets  
#define KDC_NORMALIZE_CHECK_ACCOUNT_LOCALITY       0x04    // perform minimal check to see if the account is local with local secrets  
#define KDC_NORMALIZE_INCLUDE_CLAIMS               0x08    // Lookup claims for the user as well
```
