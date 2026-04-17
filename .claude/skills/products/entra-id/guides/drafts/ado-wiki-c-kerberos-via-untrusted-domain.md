---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Trusts/Kerberos: via Untrusted domain"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Trusts/Kerberos%3A%20via%20Untrusted%20domain"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1190802&Instance=1190802&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1190802&Instance=1190802&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides guidelines for using Kerberos authentication in an untrusted domain scenario. It outlines different logon styles and the associated domain controller (DC) location methods. 

[[_TOC_]]

# Introduction

Cross-realm authentication occurs when the user account and/or the target Service Principal Name (SPN) are not in your own authority realm and no trust exists.

---

# Untrusted domain

A Windows client (for example, in CONTOSO.COM) attempts to use Kerberos against an untrusted Key Distribution Center (KDC) when the untrusted target account specified is provided in the following logon styles:

- Implicit User Principal Name (UPN): UserName@Domain_FQDN
- Legacy style: NetBiosDomain\UserName or Domain_FQDN\UserName

This is contingent on successful DNS or NetBIOS over TCP/IP (NBT) name resolution.

 [How domain controllers are located in Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/how-domain-controllers-are-located), [Active Directory DC locator changes](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/dc-locator-changes)

Examples - mapping a share from **untrusted.com** on a client in **contoso.com**:

- `NET USE * \\Server1.untrusted.com\Share /U:User3@untrusted.com`  
  - Implicit UPN. Note that an explicit UPN may be different; a generic UPN like **User3@unresolvable.name** not reflected in DNS is intended to fail.

- `NET USE * \\Server1.untrusted.com\Share /U:untrusted.com\User3`  
  - Both styles cause KDC location via **DNS SRV record: _kerberos._tcp.dc._msdcs.untrusted.com**.

- `NET USE * \\Server1.untrusted.com\Share /U:untrusted\User3`  
  - KDC location via **NbtNs: UNTRUSTED <0x1C>** (pre-cache from LMHosts, WINS, broadcasts, when enabled).  
 Note:  
This legacy NetBIOS style is not recommended at the enterprise level. Always use DNS to avoid introducing an unwanted NetBIOS dependency. In most cases, DNS name resolution for the "untrusting" target resource is already configured and can be utilized for authentication.
