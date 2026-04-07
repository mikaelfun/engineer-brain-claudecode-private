---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414190&Instance=414190&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414190&Instance=414190&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**:    
This document provides essential knowledge for scoping questions Kerberos authentication support requests. It outlines the scoping questions which will help you understand the setup, expected Kerberos authentication flow, and the received Kerberos error in relation to the customer's setup implementation.

[[_TOC_]]

# Scoping a Kerberos Support Request

Kerberos is an authentication protocol used by many applications. When an error occurs, it is highly dependent on the application and trust setup, especially in multi-hop scenarios or when accessing intra- or inter-forest domains.

The following scoping questions will help you understand the setup, expected Kerberos authentication flow, and the received Kerberos error in relation to the customer's setup implementation.

**Be very precise** and always use Fully Qualified Domain Names (FQDNs) in the description. If using NetBIOS names, provide a reference to the related domain FQDN.

## What

- What is the setup about, and what should the user normally get?  
  If that information was not provided, collaborate with the application team to understand if this is related to a single-hop or multi-hop setup requiring Kerberos Delegation.

- What URL is the user entering in the browser or application on the client, and what Service Principal Name (SPN) should be reflected by this?

- Does the front-end need to perform Kerberos delegation to a further service on a remote computer?  
  What is the required Kerberos configuration to perform this per the application guide (service account used, delegation settings)?

- What specific Kerberos error was observed in a System Event log, in a Network Trace, or even already in a Kerberos Event Tracing for Windows (ETW) Trace?


## Where

- Where was a Kerberos error observed?  
  Between the client and a Key Distribution Center (KDC) to obtain a ticket to a front-end server, or between the front-end and its KDC to obtain a ticket to a back-end server?

- Does the problem only surface when accessing the front-end from a special location or domain?

- Does it matter in which domain the client computer resides when the user is from a different domain?

- When related to cross-domain access, what kind of trust is in place?


## When

- When did the problem start? Did anything change prior to the problem beginning?

- When is the error received? Is it reproducible?


## Extent

- How many users/computers are experiencing the issue? Do they have a common pattern (for example, from the same domain)?


## Precise Questioning About the Implemented Setup

For Kerberos troubleshooting, understanding and correctly describing the setup is key for efficient handling and solving the problem. The following may help to formulate the most precise setup description.

| FLOW example 1  | FLOW example 1 |
|:--:|:--:|
|![image.png](/.attachments/image-8709eea6-cfdc-40bf-a258-176a0892f550.png)|![image.png](/.attachments/image-65ab9289-c6e1-47c7-9f21-dd7e6f1b4db9.png)|)

1. User: Name, FQDN Domain, [logon style](https://learn.microsoft.com/en-us/windows/win32/secauthn/user-name-formats) (legacy Domain\UserName or User Principal Name (UPN) UserName@Domain_FQDN), [role](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-default-user-accounts)
2. Client: Name, IP, Site, FQDN Domain, OS and build version, Platform, DNS suffixes, [supportedEncryptionTypes-Policy](https://learn.microsoft.com/en-us/archive/blogs/petergu/interpreting-the-supportedencryptiontypes-registry-key)
3. Client Application: Name, Executable, used Server Name or URL (FQDN or NetBIOS Name) for [SPN](https://learn.microsoft.com/en-us/windows/win32/ad/service-principal-names), requirements to use Kerberos, Elevation level
4. KDC: Name, IP, OS and build, Platform, [Domain Mode DFL](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels)
5. Server: same as Client, roles
6. Server Application: Name, Executable, requirements to support Kerberos, Vendor setup instructions
7. Service Identity: Used Service Account, registered SPNs, [Delegation settings](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc772815(v=ws.10)#delegation-examples) - if Front-end needs to access remote servers too

**Repeat** the last three steps for any further middle-tier/back-end server when **[Kerberos Delegation](https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-constrained-delegation-overview)** is performed.


## Scoping Example

**Business impact:**  
The customer HR department fails to retrieve reports from their internal web portal.

**Issue definition:**  
The customer tries to access _http://hrweb.contoso.com_ using domain credentials and gets the error "_Logon failed for User contoso\mwallace_" reported in the browser.

The customer has tried accessing using different browsers (Edge, Chrome) from different clients.  
Credentials are provided in the form: _contoso\mwallace_  
Even trying with _mwallace@contoso.com_, the attempt fails.  
The issue is not persistent, but frequency is increasing, currently occurring _four times a day for about one hour_.

The error started to occur on mm\dd\yy, before it was working properly.  
The environment includes a single domain-single forest Active Directory (AD), a front-end IIS server (_WEBSRV1.contoso.com_), and a SQL back-end server (_SQLSRV1.contoso.com_).  
User, client machine, front-end server, and back-end server are in the same domain (_contoso.com_).  
Domain controllers, front-end, and back-end servers are _2019_.  
Clients are _Windows 10 22h2_  
Domain Functional Level (DFL) and Forest Functional Level (FFL) are _2016_

The front-end server is running IIS with pool account _svc_account_, configured with the following SPNs:  
_http/WEBSRV1  
http/WEBSRV1.contoso.com  
http/WEBSRV1.contoso.com:8080  
host/WEBSRV1  
host/WEBSRV1.contoso.com_

The pool account is configured with Kerberos Constrained Delegation (KCD), S4u2Proxy for the SPN: _MSSQLSVC/SQLSRV1.contoso.com:1433_

The back-end server is running MSSQL with service account _sql_svc_ configured with the following SPNs:  
_MSSQLSVC/SQLSRV1:1433  
MSSQLSVC/SQLSRV1.contoso.com:1433_

---
**Scope agreement:**  
The issue can be considered solved if the customer ...