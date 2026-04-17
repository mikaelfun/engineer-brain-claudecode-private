---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Single Hop No Kerberos Delegation/Kerberos: Single Hop: PAC Verification"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FKerberos%2FKerberos%3A%20Protocol%20Flow%2FKerberos%3A%20Example%20Reference%2FKerberos%3A%20Single%20Hop%20No%20Kerberos%20Delegation%2FKerberos%3A%20Single%20Hop%3A%20PAC%20Verification"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1428251&Instance=1428251&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1428251&Instance=1428251&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document explains the Privilege Attribute Certificate (PAC) verification process in Kerberos authentication, including its purpose, dependencies, and related troubleshooting steps. It provides detailed information on how PAC verification works, its impact on system performance, and how to manage it in different Windows Server versions.

[[_TOC_]]

# PAC verification

PAC: **P**rivilege **A**ttribute **C**ertificate - contains group memberships, used for authorization against resources (via Token).

PAC verification is an additional protection mechanism against tampering of the service on the obtained Security Identifiers (SIDs) when the service is not running as a local system, network system, local service, or does not have the TCB (Act as part of the Operating System) privilege.

Before the operating system generates the access token based on the SIDs provided, it validates them against a Domain Controller (DC) of the realm of the service account. For more detailed information, refer to the following blogs:
- [Quick Reference: Troubleshooting, Diagnosing, and Tuning MaxConcurrentApi Issues](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/quick-reference-troubleshooting-diagnosing-and-tuning/ba-p/256868)
- [Updated: NTLM and MaxConcurrentApi Concerns](https://techcommunity.microsoft.com/t5/microsoft-entra-azure-ad-blog/updated-ntlm-and-maxconcurrentapi-concerns/ba-p/243141)

In the Netlogon debug log, as referenced in [KB 109626](https://learn.microsoft.com/en-us/troubleshoot/windows-client/windows-security/enable-debug-logging-netlogon-service), you may note PAC verification as:

```
[LOGON] SamLogon: Generic logon of <domain name>\(null) from (null) Package: Kerberos Entered
```

PAC verification also causes a higher dependency on DC availability.

For Windows Server 2003 SP2, Microsoft introduced the possibility of disabling PAC verification via `ValidateKdcPacSignature`, as detailed in [internal KB 906736](https://internal.evergreen.microsoft.com/en-us/topic/db2f204a-b855-3d9a-12bc-62475923cf98?app=kbclient&search=%22906736%22%20).

For more public information about `ValidateKdcPacSignature`, refer to: [Why! Won't! PAC! Validation! Turn! Off!](https://techcommunity.microsoft.com/t5/microsoft-entra-azure-ad-blog/why-won-t-pac-validation-turn-off/ba-p/243144).

Since Windows Server 2008/Vista, PAC verification is turned off by default.

`ValidateKdcPacSignature = 0` does not apply to Internet Information Services (IIS), since IIS is a worker process, not a service. The registry key `ValidateKDCPACSignature` does not disable all PAC validation. It only disables PAC validation if the server is running as a service and is accepting security contexts with default credentials.

[PAC validation default behavior if the "ValidateKdcPacSignature" value is not present](https://internal.evergreen.microsoft.com/en-us/topic/pac-validation-default-behavior-if-the-validatekdcpacsignature-value-is-not-present-9b2c7810-b392-1fdd-d735-fac73b45ea68)

The validation is handled via Netlogon Remote Procedure Call (RPC) and may impact the available concurrent Netlogon API calls. See MaxConcurrentAPI (limit 10 on Windows Server 2003, 150 on Windows Server 2008+ with Hotfix [KB 975363](https://support.microsoft.com/en-us/topic/you-are-intermittently-prompted-for-credentials-or-experience-time-outs-when-you-connect-to-authenticated-services-4e36c631-cbfd-2958-9f42-1cd90a77a9b5)).

[Overview: Identify and remediate MaxConcurrentApi issues that affect user authentication](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/maxconcurrentapi-overview-identify-and-remediate-mca-issues)

Performance monitoring, tuning, and logging:
- [How to do performance tuning for NTLM authentication by using the MaxConcurrentApi setting](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/performance-tuning-ntlm-authentication-maxconcurrentapi)
- [New event log entries that track NTLM authentication delays and failures in Windows Server 2008 R2 are available](https://support.microsoft.com/en-us/topic/new-event-log-entries-that-track-ntlm-authentication-delays-and-failures-in-windows-server-2008-r2-are-available-f72c93de-cabd-f23f-c0ac-e4d6643163d4)

For troubleshooting, use an explicit SDP manifest for MaxConcurrentAPI and/or refer to:
- [Workflow: NTLM: MaxConcurrentAPI for NTLM Authentication](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415193/Workflow-NTLM-MaxConcurrentAPI-for-NTLM-Authentication)
- [NTLM Authentication: MaxConcurrentAPI issues (Bottleneck)](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/591763/NTLM-Authentication-MaxConcurrentAPI-issues-(Bottleneck))

## New protection

Since version 11b.22, `KrbtgtFullPacSignature` has been introduced.   
For more information, see [KB5020805: How to manage Kerberos protocol changes related to CVE-2022-37967](https://support.microsoft.com/en-us/topic/kb5020805-how-to-manage-kerberos-protocol-changes-related).  
From our [wiki](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1192424/Kerberos-11B.22-KrbtgtFullPacSignature-DefaultDomainSupportedEncTypes)

Since April 2024 (4b.24) updates, 'PacSignatureValidationLevel' has been introduced.  
For more information, see  [KB5037754: How to manage PAC Validation changes related to CVE-2024-26248 and CVE-2024-29056](https://support.microsoft.com/en-us/topic/kb5037754-how-to-manage-pac-validation-changes-related-to-cve-2024-26248-and-cve-2024-29056-6e661d4f-799a-4217-b948-be0a1943fef1)  
From our [wiki](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1474115/Kerberos-4B.24-PAC-Validation-changes)
