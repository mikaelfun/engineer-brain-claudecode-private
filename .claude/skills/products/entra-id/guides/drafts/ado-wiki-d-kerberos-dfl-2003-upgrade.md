---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 11B.22 - KrbtgtFullPacSignature DefaultDomainSupportedEncTypes/Tips from Kerberos and Netlogon/Domain Functional level at 2003"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%2011B.22%20-%20KrbtgtFullPacSignature%20DefaultDomainSupportedEncTypes/Tips%20from%20Kerberos%20and%20Netlogon/Domain%20Functional%20level%20at%202003"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1266979&Instance=1266979&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1266979&Instance=1266979&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides guidance on identifying devices that do not support AES signing and addresses the process of raising the Domain Functional Level (DFL) from Windows Server 2003. It includes considerations for updating the krbtgt password and the impact on applications like Exchange.

[[_TOC_]]

# Audience
<SPAN style="color:red">****This content is internal, do not share****</SPAN>

# Context
Domain controllers are running Server 2016 with domain Functional level at 2003.

Identifying devices that dont support AES signing includes:

1. Legacy Windows devices that dont support AES signing.
2. Legacy non-Windows devices that dont support signing.
3. Non-intersecting encryption types between clients, services, and domain controllers (DCs) exposed by the install of 11B.
4. Entities using keytabs with RC4.
5. Trusts that dont support AES. For more details, refer to [Servicing: 1B.22: Kerberos auth fails with access denied + 40970 \ 0xc00002fd if AES not supported on trust and others](https://internal.evergreen.microsoft.com/en-us/topic/5648dcef-bdc1-1629-a729-fdf490e85cc2).

# Answers

Regarding your point 2: (2: Regenerate krbtgt main (and any RODC) password)

The best content created by the Exchange team can be found in [Considering updating your Domain functional level from Windows 2003? Read this!](https://techcommunity.microsoft.com/t5/exchange-team-blog/considering-updating-your-domain-functional-level-from-windows/ba-p/611208).

It is important to know that during the process of raising the [Domain Functional Level (DFL)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc754918(v=ws.10)?redirectedfrom=MSDN) of your Active Directory structure from 2003, the krbtgt account password gets changed. This password replication is a separate change within Active Directory and occurs after the DFL has been raised. This change should have no impact on any applications that depend on Active Directory, but sometimes it does cause applications to stop authenticating, one of them being Exchange.

This point is supported in [Kerberos & KRBTGT: Active Directorys Domain Kerberos Service Account  Active Directory Security](https://adsecurity.org/?p=483).

If your Active Directory domain/forest has been compromised and you cant rebuild the entire network from scratch, you will need to reset all passwords in the forest, including the KRBTGT account password(s). Microsoft states that resetting the KRBTGT account password is only supported in a Windows Server 2008 Domain Functional Level (DFL) or higher. When the DFL is raised from 2003 to 2008 or higher, the KRBTGT account password is changed automatically.

Refer to [Active Directory Domain Services Functional Levels in Windows Server](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels).

Authentication errors may occur on a domain controller after the domain functional level is raised to Windows Server 2008 or higher if the domain controller has already replicated the DFL change but has not yet refreshed the krbtgt password. In this case, a restart of the Key Distribution Center (KDC) service on the domain controller will trigger an in-memory refresh of the new krbtgt password and resolve related authentication errors.

Current updates and OS versions have resolved the circa 2014 issues that raising DFL has on resetting krbtgt password. For historical context, see [ADDS: Security: KDC may return KDC_ERR_ETYPE_NOTSUPP after Domain Functional Level change](https://internal.evergreen.microsoft.com/en-us/topic/d3d8519e-6cfd-5630-2797-f2d2c0b03b3f).

What happened in 11B with regards to DFL is that the KDCs now assume that all their peers will support AES encryption without needing to be at 2008 DFL due to Server 2003 no longer being supported. Heres the relevant code:

```
// Determine whether the realm can use AES, i.e. whether we assume that all KDCs support the cipher.
// This happens if the realm is at Longhorn function mode, if the realm crypto policy does not contain
// RC4, or if we're adding the new Krbtgt Full PAC Signature
KdcRealmSupportsAesChecksums()
```

```
// Don't allow the RC4-HMAC-MD5 checksum for krbtgt checksums if enforcing
KdcIsAllowedKrbtgtChecksum()
```

Until you raise the bar above the default setting to full enforcement, the KDCs can continue to use the keys that they have. If theyve never rolled the krbtgt password to generate AES keys, then this will still be RC4 and we will generate regular events to tell the admins to do so as soon as possible so we can use better crypto.

```
// We should have been allowed to use an AES checksum but were unable to find a key.
// Time to panic.  Remember that button I told you not to press?  Press capslock now
// AND TELL THE DOMAIN ADMINISTRATOR TO ROLL THE KRBTGT PASSWORD AS SOON AS POSSIBLE!!!
KdcAuditMissingKeys()
```