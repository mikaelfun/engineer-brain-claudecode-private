---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414188&Instance=414188&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414188&Instance=414188&Feedback=2)

___
<div id='cssfeedback-end'></div>

# Data Collection for Kerberos Support Requests

**Summary**  
This document provides guidelines on how to collect data for a Kerberos support request, ensuring a precise setup and problem description. It covers when, where, and how to gather data, and details commonly used logs.

[[_TOC_]]

## Introduction

Customers may not be able to provide exact setup information during the [Scoping](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/937192/Workflow-Kerberos-Scoping) phase. The information gathered during data collection helps to get the most precise setup and problem description by iteration. This may also include rescoping the case or changing the case type.

## Where to collect data

You may use existing system and Key Distribution Center (KDC) event logs to determine on which systems to start data collection. When the error location is unclear, you may need to collect data on several systems simultaneously while reproducing the error.

## When to collect data

For Service Principal Names (SPNs), there is a negative cache defined by the registry value `SpnCacheTimeout`, default 15 minutes (`KERB_SPN_CACHE_TIMEOUT=15`). See [Kerberos protocol registry entries and KDC configuration keys in Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/kerberos-protocol-registry-kdc-configuration-keys).

Applications may have their own caching behavior, not calling the Kerberos Client again when a previous attempt has failed. Data collection from a cached condition can be useless. Therefore, **you may restart the involved services and purge all Kerberos caches on systems** where you want to perform data collection.

To purge all available logon session Kerberos cache entries, run the following elevated PowerShell command:

```powershell
Get-WmiObject Win32_LogonSession | Where-Object {$_.AuthenticationPackage -ne 'NTLM'} | ForEach-Object {klist.exe purge -li ([Convert]::ToString($_.LogonId, 16))}
```

You may also purge DNS and NetBIOS name caches:
- `IPCONFIG /FLUSHDNS`
- `NBTSTAT -R` (uppercase "R")

## How to collect data

We have a common approach for simplified data collection, see KB [4487175](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9?app=kbclient&search=4487175) and/or [TroubleShootingScript (TSS): Windows Active Directory Services (ADS) Guide](https://internal.evergreen.microsoft.com/en-us/topic/a22d8100-3f02-3972-0e0d-760cafc1843a) ([TSS Ecosystem Work](https://microsoft.sharepoint.com/teams/TSSEngineeringandEcosystemWork/SitePages/Home.aspx)).

### Tools and scripts

- The [Authscripts](https://aka.ms/authscripts) can be downloaded from our CE&S Diagnostic toolbox.
- The scripts enable tracing/logging for Authentication components (Kerberos Client, KDC, NTLM), SSL ETL tracing, network trace, CAPI logging, and LSP logging.
- The scripts collect device/user information such as `ipconfig`, credential manager entries, device & current user certificate store information, environment variables, netsetup log, installed fixes, authentication component binary information, device build information, device services status, tasklist, and an export of registry keys used by authentication and related components.
- TSS with specific scenarios like `ADS_AccountLockout/ADS_AccountLockoutEx`, `ADS_Auth/ADS_AuthEx`.

Example of a scenario that can be used on all places (client, DC, front-end, back-end):
```powershell
.\TSS.ps1 -ADS_Auth
```
 Be sure to run:
```powershell
Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned
```

## Notes on commonly used logs from auth scripts

### ETLs

| Name  | Description |
|:--:|:--:|
| Kerb | Kerberos client ETL will show error codes, in hex, received from a DC or authentication point. When searching these logs, it is important to know what identity was trying to authenticate and what it was trying to reach (what SPN, URL, etc). Do not just blindly search for the keywords "fail" or "error." You may also use the netsh trace below to correlate timestamps for errors you are interested in. |
| KDC | This is important data to collect from a DC when the KDC service is returning an error such as `KDC_Err_C_Principal_Unknown` or `KDC_Err_Policy`. Remember this ETL is only used on the DC (KDC) side and will reveal more information about why the KDC failed to find an SPN, route a UPN, etc. |
| NTLM | While obviously not geared to Kerberos for this workflow, it is important to understand the traffic if Kerberos failed and we fell back to NTLM. The NTLM ETL can be helpful for understanding what type of NTLM is being used. For instance, when the NTResponse size is 0 and LM Response size is 0x18, then NTLMv1 is likely being used. If NtRespLen is 0x182, then we are using NTLMv2. This log can also easily show if the customer has any kind of restriction such as LoopBack detection or restricting NTLM incoming or outgoing traffic altogether via a policy. |

### Other logs

| Name  | Description |
|:--:|:--:|
| Netsh trace | This is usually the best starting point for any Kerberos case to first understand the error and even timestamp to correlate with other logs. *Please be sure to know what SPN or endpoint we are trying to reach to understand which (if multiple) Kerberos error is of interest. Also, of interesting note, Wireshark can display different and sometimes more specific Kerberos errors. | 
| Netlogon.log | PAC Validation is taken care of via Netlogon and can shed some light on whether or not the user was handled via Kerberos or NTLM. Overall, there is greater use for Netlogon for NTLM traffic and error codes for authenticating a user (whether that is user not found, bad password, etc).  _On Entra ID (Azure AD) joined devices, the NETLOGON service is set as Manual, so it is stopped by default, hence the NETLOGON.LOG file won't be created/collected by auth scripts._ |
| System Event Log | You can extend the default Kerberos client event logging as described in KB 262177, but ensure this is turned off again to avoid engagement requests on false positives. When already gathering data from the problem condition with the above auth scripts, no additional information is expected. The event log may still have its validity when long-term monitoring is required. | 
| LsaIso | Used in cases where Credential Guard is used. Keep in mind that from the Kerb ETL, you may see references to calls into LsaIso. Credential Guard has several prerequisites and will block authentication for the following reasons: <br>Kerberos DES encryption su... |

---

By following these guidelines, you can effectively gather the necessary data to troubleshoot and resolve Kerberos-related issues.

