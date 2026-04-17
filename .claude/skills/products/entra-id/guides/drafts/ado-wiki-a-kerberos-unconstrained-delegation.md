---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Delegation/Kerberos: Unconstrained Delegation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Delegation/Kerberos%3A%20Unconstrained%20Delegation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1084266&Instance=1084266&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1084266&Instance=1084266&Feedback=2)

___
<div id='cssfeedback-end'></div>

### Summary
This document provides a detailed explanation of Kerberos Unconstrained Delegation, including its flow, the OK_AS_DELEGATE and FORWARDED flags in Ticket Granting Tickets (TGTs), the delegated Kerberos Ticket Granting Service Request (KRB_TGS_REQ), and hardening measures against unconstrained delegation. It is not recommended for custom setups due to potential security risks.

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

[[_TOC_]]

# Context
This page is part of the DS Kerberos wiki, under "Delegation" and describes Kerberos unconstrained delegation.  
Full path: Workflow: Kerberos: Protocol Flow: Example Reference

---

# Recommendation
**Not recommended** for custom setups, but still default when accessing a Domain Controller (DC) (always trusted for delegation).

 Unconstrained delegation could allow attackers to extract Kerberos keys from the isolated Local Security Authority (LSA) process. Any service can be abused if one of their delegation entries is sensitive. Use constrained or resource-based Kerberos delegation instead.

---

# Topics

- Unconstrained delegation flow
- OK_AS_DELEGATE and FORWARDED flag in TGT
- Delegated KRB_TGS_REQ
- KRB_TGS_REP and KRB_AP_REQ embedding
- Hardening against unconstrained delegation

---

## Unconstrained delegation flow

- Setup changes:   
  - Service account is configured for Option 2 - **Unconstrained Delegation**   
![Service account configuration for unconstrained delegation](/.attachments/image-b210573f-c8ba-475b-88c0-ee7934da62b3.png)

  - Delegation setting:   
    Active Directory (AD) account Tab Delegation // Trust this user for delegation to any service (Kerberos only)

  - On Internet Information Services (IIS):   
    Website, Basic Setting, Edit Site, Physical Path: \\rw8r2dc2.rw8r2.net\IIS_Redir\MyWebsite - pointing to remote share.  

Delegation: The Frontend service requests a ticket for the Backend Service as User1:

![Delegation flow](/.attachments/image-3d78d71b-41db-4ef6-904c-e3f995d2531f.png)

1. Client has already forwardable TGT for the user, requesting a Ticket Granting Service (TGS) for the target Service Principal Name (SPN) of the Delegate/Frontend.
1. Key Distribution Center (KDC) sends a TGS reply with flag ok_as_delegate reflecting account option Trust this user for delegation to any service (Kerberos only).
1. Client requests new TGT with forwarded flag set.
1. KDC sends TGT reply which can be used for forwarding. Clients cache this as forwarded.
1. The client uses the service ticket to connect to the delegate server and requests mutual authentication.
1. The client authenticates the delegate server.
1. Client sends the delegate server its forwarded TGT and a session key to be used in messages with KRB_CRED to the TGS (may happen already in step 5). The delegate can now request tickets to other resources in the user's name.
1. Delegate requests TGS for Server/Backend SPN on behalf of the user, forwarded flag is not set.
1. KDC replies with TGS as it was sent by the user, Cname: User1.
1. KRB_AP_REQ contains the user's credentials. The authenticator is encrypted with the TGS-supplied Backend/Server session key.
11. KRB_AP_REP is handled as before with Mutual Authentication check.

---

## OK_AS_DELEGATE and FORWARDED flag in TGT

Netmon Trace analysis requires **Client** and **Delegate** traces.

TGS reply with flag **ok_as_delegate** (0x40000), not visible in Client trace, but in client **KLIST** output:

![KLIST output](/.attachments/image-32ce1f95-20b6-49a0-85af-f9e405fcbfd6.png)

Receiving flag ok_as_delegate causes the Kerberos client to request a forwarded TGT (see Klist) with PaData:  
**PA-SUPPORTED-ENCTYPES (165)** (modern systems will support AES Etypes in this stage).

![PaData example](/.attachments/image-1d90621f-25b9-411b-87e2-4d96d533411a.png)

**KRB_AP_REQ** and **KRB_AP_REP** frames dont show a difference compared to non-delegation setup but provide the Frontend, also called **Delegate**, with the **User1s logon session key**, used for impersonation.

---

## Delegated KRB_TGS_REQ

Frontend/Delegate IIS Server needs to access a remote resource, his website files at SMB share  
\\rw8r2dc2.rw8r2.net\IIS_Redir\MyWebsite

He requests a TGS for SPN CIFS/rw8r2dc2.rw8r2.net, with the forwarded TGT from User1:

![Requesting TGS for SPN CIFS](/.attachments/image-228014a5-5159-4827-bd92-401096149825.png)

![TGS request example](/.attachments/image-7d309776-9b09-4fcc-be2d-785afe27c08d.png)

KRB_AP_REQ is now embedded in SMB protocol, similar to HTTP:

![KRB_AP_REQ in SMB protocol](/.attachments/image-ba1ab399-f0c6-4d2d-8ec1-44ab87854e5a.png)

KRB_AP_REP: Delegate performs Mutual Authentication check as described before.

Backend/Server creates session Token for impersonated User1 per his Privilege Attribute Certificate (PAC).

---

## Hardening against unconstrained delegation

You may enable **Windows Defender Credential Guard** on client computers. This prevents all unconstrained delegation from a computer that has Windows Defender Credential Guard enabled and running. See also [Kerberos considerations](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/credential-guard-considerations#kerberos-considerations).

 Since the mandatory security hardening in 2019, we will not allow unconstrained delegation cross-forest any longer.

[Updates to TGT delegation across incoming trusts in Windows Server](https://support.microsoft.com/en-us/topic/updates-to-tgt-delegation-across-incoming-trusts-in-windows-server-1a6632ac-1599-0a7c-550a-a754796c291e)

[Changes to Ticket-Granting Ticket (TGT) Delegation Across Trusts in Windows Server](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/changes-to-ticket-granting-ticket-tgt-delegation-across-trusts/ba-p/440261)

Windows Server 2012 introduced [Enforcement for Forest Boundary for Kerberos Full Delegation](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831747(v=ws.11)#enforcement-for-forest-boundary-for-kerberos-full-delegation). This feature enables an administrator to configure a trusted forest to delegate or deny [Ticket-Granting Tickets](https://learn.microsoft.com/en-us/windows/win32/secauthn/ticket-granting-tickets) (TGTs) to services in the forest. At that time, it was optional and configurable via:

```shell
netdom.exe trust fabrikam.com /domain:contoso.com /EnableTGTDelegation:No
```

### Recommendation
This flag should be set in the trusted domain (such as contoso.com) for each trusting domain (such as fabrikam.com). After the flag is set, the trusted domain will no longer allow TGTs to be delegated to the trusting domain. With the security hardening the recommended setting may be the default and not configurable any longer.