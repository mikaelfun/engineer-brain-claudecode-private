---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 4B.24 PAC Validation changes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%204B.24%20PAC%20Validation%20changes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1474115&Instance=1474115&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1474115&Instance=1474115&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This document provides an overview of the changes and protections introduced in the 4B.24 PAC Validation updates released on and after April 9, 2024. It includes information on registry keys, event logs, and known issues.

[[_TOC_]]

# Context
This page is part of the DS Kerberos wiki, under "Security Enhancements & Changes." It provides a summary of important details regarding 4B.24 PAC Validation changes. The full path is: Workflow: Kerberos: Security Enhancements & Changes.

# Introduction
Windows Updates released on and after April 9, 2024, contain protections for an elevation of privilege vulnerability in the [Kerberos Privilege Attribute Certificate (PAC) Validation Protocol](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-apds/82b7b7c6-413d-4d66-b6b7-4a9224549782). The vulnerability allows a user of the process calling [AcceptSecurityContext](https://learn.microsoft.com/en-us/windows/win32/api/sspi/nf-sspi-acceptsecuritycontext) to not belong to the computer's domain with respect to PAC validation, which violates the security boundary at forest boundaries.

Windows Updates released on and after April 9, 2024, provide protections against this exploit by requesting the service's Domain Controller (DC) to validate the PAC after a client completes the Kerberos Authentication Service (AS) and Ticket-Granting Service (TGS) flow.

# Contributors
@<3E97C74B-0048-609E-896B-2D88E7873973>

# Keyword in DFM Knowledge
"**4B.24**" or "**Servicing: 4B.24**"

# Email Alias
There is a distribution list (DL) created specifically to discuss 4B.24-related topics not covered by existing articles: KerbPacBypassIn4B24@microsoft.com

Join the Kerberos PAC Bypass in 4B.24 distribution group: [https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=KerbPacBypassIn4B24](https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=KerbPacBypassIn4B24)

# Public Articles
[KB5037754: How to manage PAC Validation changes related to CVE-2024-26248 and CVE-2024-29056](https://support.microsoft.com/en-us/topic/kb5037754-how-to-manage-pac-validation-changes-related-to-cve-2024-26248-and-cve-2024-29056-6e661d4f-799a-4217-b948-be0a1943fef1)

# Internal Articles 
[Servicing: 4B.24: Protections for Kerberos PAC Validation Protocol Elevation of Privilege (EOP) for CVE-2024-26248 and CVE-2024-29056 in Windows Updates released on and after April 9, 2024](https://internal.evergreen.microsoft.com/en-us/topic/18ec9f91-e93b-71a3-8cb7-a1d377df8de5)

# About the New Hardening

## What is PAC Verification?
PAC Verification is an additional protection mechanism against tampering of the service on the obtained Security Identifiers (SIDs) when the service is not running as a local system, network system, local service, or does not have the Act as part of the Operating System (TCB) privilege. Before the operating system generates the access token based on the SIDs provided, it validates them against a DC of the realm of the service account.

The user of the process calling AcceptSecurityContext may not belong to the computers domain when doing PAC validation. The existing PAC validation uses generic passthrough, which is a mechanism by which we ask Netlogon to deliver a request to the named security package on a domain controller for the named domain. It is only the users domain that looks inside the PAC.

This violates the security boundary at forest boundaries. If a user in Forest B is logged in to a computer in Forest A, then PAC validation can prevent them from performing a local elevation of privilege in isolation. They can still perform the elevation of privilege on the Forest A computer if they have the cooperation of the Forest B Key Distribution Centers (KDCs).

## How Do These Protections Work?
1. After a client completes the Kerberos AS and TGS flow, it then has the service ticket and authenticates to it.
2. The service calls AcceptSecurityContext (ASC) in Local Security Authority Subsystem Service (LSASS). If the service is not "Trusted," then it will proceed to request the service's DC to validate the PAC.
3. Kerberos then calls Netlogon:
   - Old behavior: Kerberos packs the signatures and uses generic passthrough to reach the service DC.
   - New behavior: Kerberos packs the service ticket (additional Ticket Granting Ticket (TGT) for User-to-User (U2U)).
4. Netlogon sends the request to the DC (or Read-Only Domain Controller (RODC)), and the request keeps being passed through until it reaches the service's DC.
5. Netlogon calls KDC to validate the PAC signatures and sends user/device information back.

## Registry Key Location & Information
:warning: The following registry keys controlling the behavior only need to be deployed to the Kerberos server that accepts inbound Kerberos authentication and performs PAC Validation.

**Registry Path:** `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters`

**PacSignatureValidationLevel**  
Regkey data:  
- **2**  Default (Compatibility with unpatched environment). Adds new behavior but does not enforce it.
- **3**  Enforce. Enforces the new behavior.

**CrossDomainFilteringLevel**  
Regkey data:  
- **2**  Default (Compatibility with unpatched environment). Adds new behavior but does not enforce it.
- **4**  Enforce. Enforces the new behavior.

## AuditKerberosTicketLogonEvents
This registry key can be deployed to both Windows servers accepting inbound Kerberos authentication, as well as any Windows Domain Controller that is validating the new Network Ticket Logon flow along the way.

**Registry Path:** `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters`

Regkey data:  
- **0**  Do not log Netlogon events.
- **1**  Default (log critical events).
- **2**  Log all Netlogon events.

# Event Logs
The following Kerberos audit events will be generated on the Kerberos server that accepts inbound Kerberos authentication. This Kerberos server will be doing PAC Validation, which uses the new Network Ticket Logon Flow.

## Kerberos Ticket Logon Action
This event is shown when a Domain Controller took a non-fatal action during a Network Ticket Logon flow. The following actions are logged:

- User SIDs were filtered.
- Device SIDs were filtered.
- Compound identity was removed due to SID filtering disallowing the device's identity.
- Compound identity was removed due to SID filtering disallowing the device's domain name.

|  |  |
|--|--|
| **Event Log** | System |
| **Event Type** | Informational |
| **Event Source** | Security-Kerberos |
| **Event ID** | 21 |
| **Event Text** | During Kerberos Network Ticket Logon, the service ticket for Account <Account> from Domain <Domain> had the following actions done to it by DC <Domain Controller>. For more information, please visit https://go.microsoft.com/fwlink/?linkid=2262558. |

## Kerberos Ticket Logon Failure
This event is shown when a Domain Controller denied the Network Ticket Logon request for the reasons shown in the event.

|  |  |
|--|--|
| **Event Log** | System |
| **Event Type** | Error |
| **Event Source** | Security-Kerberos |
| **Event ID** | 22 |
| **Event Text** | During Kerberos Network Ticket Logon, the service ticket for Account <Account> from Domain <Domain> was denied by DC <DC> due to the reasons below. For more information, please visit https://go.microsoft.com/fwlink/?linkid=2262558.<br>Reason: <Reason><br>ErrorCode: <Error Code> |

## Kerberos Ticket Logon Fallback
- This event is shown as a warning if PacSignatureValidationLevel **and** CrossDomainFilteringLevel are not set to **Enforce** or stricter. When logged as a warning, the event indicates that the Network Ticket Logon flows contacted a Domain Controller or equivalent device that did not understand the new mechanism. The authentication was allowed to fallback to previous behavior.
- This event shows as an error if PacSignatureValidationLevel **or** CrossDomainFilteringLevel is set to **Enforce** or stricter. This event as error indicates that the Network Ticket Logon flow contacted a Domain Controller or equivalent device that did not understand the new mechanism. The authentication was denied and could not fallback to previous behavior.

|  |  |
|--|--|
| **Event Log** | System |
| **Event Type** | Warning or Error |
| **Event Source** | Security-Kerberos |
| **Event ID** | 23 |
| **Event Text** | During Kerberos Network Ticket Logon, the service ticket for Account <account_name> from Domain <domain_name> could not be forwarded to a Domain Controller to service the request. For more information, please visit https://go.microsoft.com/fwlink/?linkid=2262558. |

## Netlogon Unexpected Failure
This event is generated whenever Netlogon encountered an unexpected error during a Network Ticket logon request. This event is logged when **AuditKerberosTicketLogonEvents** is set to (1) or higher.

|  |  |
|--|--|
| **Event Log** | System |
| **Event Type** | Error |
| **Event Source** | Netlogon |
| **Event ID** | 5842 |
| **Event Text** | The Netlogon service encountered an unexpected error when processing a Kerberos Network Ticket Logon request. For more information, please visit https://go.microsoft.com/fwlink/?linkid=2261497.<br>Service Ticket Account: <Account><br>Service Ticket Domain: <Domain><br>Workstation Name: <Machine Name><br>Status: <Error Code> |

## Netlogon Unable to Forward
This event is generated whenever Netlogon could not complete the Network Ticket Logon because a Domain Controller did not understand the changes. Because of limitations in the Netlogon protocol, the Netlogon client is unable to determine whether the Domain Controller that the Netlogon client is talking to directly is the one that does not understand the changes, or whether it is a Domain Controller along the forwarding chain that does not understand the changes.

- If the Service Ticket Domain is the same as the machine accounts domain, it is likely that the Domain Controller in the event log does not understand Network Ticket logon flow.
- If the Service Ticket Domain is different from the machine accounts domain, one of the Domain Controllers along the way from the Machine Accounts Domain to the Service Accounts Domain did not understand the Network Ticket Logon flow.

This event is off-by-default. Microsoft recommends that users first update their entire fleet before turning the event on.

:warning: This event is logged when **AuditKerberosTicketLogonEvents** is set to (2).

|  |  |
|--|--|
| **Event Log** | System |
| **Event Type** | Warning |
| **Event Source** | Netlogon |
| **Event ID** | 5843 |
| **Event Text** | The Netlogon service failed to forward a Kerberos Network Ticket Logon request to the Domain Controller <DC>. For more information, please visit https://go.microsoft.com/fwlink/?linkid=2261497.<br>Service Ticket Account: <Account><br>Service Ticket Domain:<Domain><br>Workstation Name: <Machine Name> |

# Known Issues
Known issues in this area are well documented in internal articles usually prefixed with: **"Servicing: 4B.24"**.

| Article ID/URL | Title |
|--|--|
|[5039041](https://internal.evergreen.microsoft.com/en-us/topic/48569275-90fe-71bf-fa23-14b96b2236d3)|Servicing: 4B.24: Summary of friction in Windows Updates released April 9, 2024|
|[5039045](https://internal.evergreen.microsoft.com/en-us/topic/d778a9ec-e3e0-66f9-1c94-129f2df9dee0)|Servicing: 4B.24: NTLM authentication fails for cached credential logons to 4B.24-patched, VSM-enabled, RS1+ devices unable to unseal VSM Master Key - NTLM proxy edition|
|[5038336](https://internal.evergreen.microsoft.com/en-us/topic/b8efbf8a-c91c-a818-8a92-5b8a19eb1211)|Servicing: 4B.24: Small, known memory leak on April 9, 2024-patched, pre-1809 KDCs in cross-forest runas scenarios|
|[5038647](https://internal.evergreen.microsoft.com/en-us/topic/f951f04f-e573-d3ff-2246-9e473f6990e7)|Servicing: 4B.24: LSASS Crash on KerbDecryptServiceTicket on April 9, 2024 patched devices (ICM 497095364)|
|[5038540](https://internal.evergreen.microsoft.com/en-us/topic/9531fab9-a252-d497-c165-3df6e9066e6a)|Servicing: 4B.24: ADDS LSASS Access Violation in NTDLL.DLL due to double free on April 9, 2024 Patched DCs (ICM 495268929)|
|[5038612](https://internal.evergreen.microsoft.com/en-us/topic/3053dcc7-8f1d-101b-bd4e-61508201a23f)|Servicing: 4B.24: Excessive NTLM auth forwarding regression by the Kerberos PAC hardening change on April 9, 2024-patched DCs (ICM 496533574)|
|[5038052](https://internal.evergreen.microsoft.com/en-us/topic/18ec9f91-e93b-71a3-8cb7-a1d377df8de5)|Servicing: 4B.24: Protections for Kerberos PAC Validation Protocol EOP for CVE-2024-26248 and CVE-2024-29056 in Windows Updates released on and after April 9, 2024|
|[5038684](https://internal.evergreen.microsoft.com/en-us/topic/93b75ac5-72d4-8561-ed55-696f3dd532de?app=casebuddy&search=servicing%20%224b.24%22)|Servicing: 4B.24: Summary of issues in Windows Updates released April 9, 2024|