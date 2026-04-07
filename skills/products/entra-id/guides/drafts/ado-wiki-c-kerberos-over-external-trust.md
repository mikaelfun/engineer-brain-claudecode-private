---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Trusts/Kerberos: over External Trust"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Trusts/Kerberos%3A%20over%20External%20Trust"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1191898&Instance=1191898&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1191898&Instance=1191898&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides an overview of using Kerberos over an external trust, including definitions, supportability notes, and technical requirements. It also covers SID filtering and security considerations for trusts.

[[_TOC_]]

# Introduction
Trust type often misused as a shortcut between forests.

# Topics
- External trust definition
- Kerberos over external trust
- SID filtering

# External trust definition
A trusting domain with resources trusts a trusted domain with user accounts: **Trusting** (outbound) ---- **trusts** ---> **Trusted** (inbound).

- Not transitive
- No name routing information for Kerberos (service principal names (SPNs) and user principal names (UPNs) will only be looked up in the local forest key distribution center (KDC)/global catalog (GC))
- Designed for NTLM, originally to allow NT4 trust for the migration phase

![Diagram showing the relationship between trusting and trusted domains](/.attachments/image-3b88abb5-7dd7-4d55-b8f9-04a3116da22c.png)

#  Supportability note
External trusts are **not** intended to be used in parallel with forest trusts, i.e., as a kind of shortcut trust between subordinate domains; refer to [When to create an external trust](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc755427(v=ws.10)).

# Kerberos over external trust
- By default, **no** Kerberos with trusted user on trusted or trusting client: for trusting resource SPN, SPN is only validated against the users' "trusted" KDC against the local forest with expected result error **KDC_ERR_S_PRINCIPAL_UNKNOWN**.
- **Kerberos V5 support** [External Trusts vs. Forest Trusts](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/dd560679(v=ws.10)?redirectedfrom=MSDN#external-trusts-vs-forest-trusts).

The following prerequisites must be in place to allow Kerberos to function over an external trust:
  - The trust has to be created using the fully qualified domain name (FQDN). Kerberos referral fails if the FQDN is missing from the trust domain object (TDO). The Windows Server 2003 Add Trust wizard does not create trusts with Windows 2000 and newer domains without DNS name resolution. For more information, see [DNS and NetBIOS Name Resolution to Create External, Realm, and Forest Trusts](https://go.microsoft.com/fwlink/?LinkID=198352).
  - User name syntax is UPN and the UPN suffix is resolvable to a domain controller (DC) in DNS (implicit UPN).
  - UDP 389, UDP/TCP 88, and UDP/TCP 464 (password change requests) ports are open for the domain controllers in the user domain.
  - The server name in the trusting resource domain has to be the FQDN, and the domain suffix of the server name has to match the Active Directory Domain Services (AD DS) domains DNS FQDN.
  - Applications building SPNs need to build three-part SPNs using the service/server@realm syntax. When "Service_prefix/ServerName@Trusting_Domain" is used, it provides explicit name routing information already in the request. The Kerberos client uses "@Trusting_Domain" requesting "Kerberos: TGS Request Realm: Trusted_Domain Sname: krbtgt/Trusting_Domain." From KDC, it receives a referral with the cross-realm ticket-granting ticket (TGT) and requests at the trusting KDC the TGS "Service_prefix/ServerName," stripped off "@Trusting_Domain." This is not well documented and is rarely used by other applications besides Winlogon (trusted logon). This explains why the Kerberos authentication service (AS) sequence over an external trust works, but any further ticket-granting service (TGS) request (submitted as two-part SPN) fails, and NTLM fallback is attempted.
  - Since it is an external trust, the cross-forest targets only cover the domains that have direct trusts. Only these DCs should be used to target Kerberos requests or Kerberos forest searches.
  - There may be additional scenarios, unknown today, where Kerberos over an external trust may fail. Microsoft recommends forest trusts where possible. Forest trusts ensure that Kerberos is used whenever possible. Kerberos provides better security and scalability over NTLM.

- **Alternative KFSO?**
  Sometimes customers refer to [Kerberos Forest Search Order (KFSO)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/hh921473(v=ws.10)) as an alternative, but you must implement a forest trust for forest search order policies to be supported. Refer to [Forest Search Order policy behavior when using an External Trust - TGS request may return KDC_ERR_S_PRINCIPAL_UNKNOWN](https://internal.evergreen.microsoft.com/en-us/topic/-forest-search-order-policy-behaviour-when-using-an-external-trust-tgs-request-may-return-kdc-err-s-principal-unknown-6bfe4dbd-94d7-ef5f-7bde-e49cfff69fe1). Limitation with External trust: see [Kerberos Forest Search Order may not work in an external trust and event ID 17 is returned](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/kfso-not-work-in-external-trust-event-is-17)  we recommend Forest Trusts for KFSO!

Refer to [ADDS: Security: Kerberos over down-level trusts between different forests](https://internal.evergreen.microsoft.com/en-us/topic/adds-security-kerberos-over-down-level-trusts-between-different-forests-f885a698-fc4a-4350-4c18-d34d0b1f75f3).

# SID filtering
Trust restrictions: SID filtering - Set by default on **outbound** external trusts to disable any SID from the privilege attribute certificate (PAC) not provided directly by the trusted domain.

You may get a popup during setup.

![Popup during setup](/.attachments/image-2c66e73c-49f3-43b4-866c-64d0ead5f559.png)

TrustAttributes: contains 0x4 = Quarantine (TRUST_ATTRIBUTE_QUARANTINED_DOMAIN).

Configurable with: `NETDOM TRUST /QUARANTINE:no` (disable SID filtering).

# [Security considerations for trusts](https://learn.microsoft.com)
