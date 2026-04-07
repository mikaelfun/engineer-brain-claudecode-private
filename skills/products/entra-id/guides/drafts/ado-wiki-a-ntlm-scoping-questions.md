---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/NTLM/Workflow: NTLM: Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/NTLM/Workflow%3A%20NTLM%3A%20Scoping%20Questions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415477&Instance=415477&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415477&Instance=415477&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**

This article explains the process of NTLM authentication, including scoping, setup, and troubleshooting steps. NTLM authentication is used to validate client identity, usually through a designated third-party authority like a Domain Controller or Local SAM. The article provides detailed guidelines for scoping and troubleshooting NTLM pass-through authentication issues.

**Overview**

Authentication is the process of validating a client identity, usually by means of a designated third-party authority. The client might be an end user, computer, application, or service. The client's identity is called a security principal. In NTLM (New Technology LAN Manager) authentication on Windows, the trusted third-party authority is the Domain Controller in Active Directory Environments or the Local Security Account Manager (SAM) in workgroup environments.

To authenticate with a server application, the client provides some form of credentials to allow the server to verify the client's identity. After the client's identity is confirmed, the application can authorize the principal to perform operations and access resources.

**Scoping**

NTLM pass-through authentication is used in a variety of scenarios. The scoping questions should help to understand the exact scenario, the security principals, and applications/endpoints involved. It is likely that NetBIOS names and/or IP addresses will be used to connect to the relevant applications/endpoints. As such, it is important to provide a reference to the related Domain Name and Fully Qualified Domain Name (FQDN).

**Remember**: Always scope before sending an action plan to ensure that all parties share a clear understanding of the scenario and agree upon the issue to address.

**WHAT**

- What is the setup about? What is the expected result in regular/normal operation? If that information was not yet provided, collaborate with the application team to understand the details.
- What is the exact error message produced?
- What application specifically are we troubleshooting? Identify the application name and version (in particular if it is a third-party).
  - Identify both the client application and server applications name and versions.
- How exactly is the connection established? Using the NetBIOS Name/IP address/URL? Be very detailed.
- Does the authentication problem also occur if using the FQDN to connect to the applications/endpoints?
- What version of Windows is in use by the client and server?
- What are the Domain Controller's OS versions?
- What third-party OS versions and patch levels? If applicable.

**WHERE**

- Where exactly was the error observed?
- Does it matter in which domain the client computer resides when the user is from a different domain?
- Can you correlate the failures with load on the infrastructure (affected servers and/or Domain Controllers)?
- When related to cross-domain access, what kind of trust is in place? In scenarios where a trust is involved, obtain the trust information details: trust type, trust direction, trust configured authentication type, and also the list of domain names (FQDN) from both sides of the trust.

**WHEN**

- When did the problem start?
- How frequent are the failures?
- Were there any changes introduced in the environment?
- When is the error received? Is it reproducible?
- Can you correlate the failures with peak business hours?

**EXTENT**

- How many users/computers are experiencing the issue??Do they have a common pattern (i.e. from same domain)?