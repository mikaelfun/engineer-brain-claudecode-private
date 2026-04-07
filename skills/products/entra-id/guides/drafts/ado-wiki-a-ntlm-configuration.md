---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/NTLM/Workflow: NTLM: References/Workflow: NTLM: Configuration Information"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/NTLM/Workflow%3A%20NTLM%3A%20References/Workflow%3A%20NTLM%3A%20Configuration%20Information"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415183&Instance=415183&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415183&Instance=415183&Feedback=2)

___
<div id='cssfeedback-end'></div>

## NTLM Configuration

The LAN Manager Authentication Level setting defines which authentication level is used. This policy setting determines which challenge or response authentication protocol is used for network logons. The configuration may be deployed via Group Policy Object (GPO) or registry key.

- It can be set locally via `secpol.msc` under:
  - Local policies\Security Options\Network Security: LAN Manager Authentication level
- Or via GPO Location:
  - **GPO_name\Computer Configuration\Windows Settings\Security Settings\Local Policies\Security Options\Network security: LAN Manager authentication level**
- Registry Location:
  - `HKLM\System\CurrentControlSet\Control\Lsa\LmCompatibilityLevel`
- Reference article: [Microsoft Documentation](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-lan-manager-authentication-level)
- Since Windows Vista, Windows Server 2008, Windows 7, and Windows Server 2008 R2, the default is Send NTLMv2 response only (3).
- **Restart requirement: None.** Changes to this policy become effective without a computer restart when they are saved locally or distributed through Group Policy.
- **Important:** Modifying this setting may affect compatibility with client devices, services, and applications.

## LmCompatibilityLevel

NTLMv2 is turned on using the LMCompatibilityLevel switch. The registry key specifies the mode of authentication and session security to be used for network logons.

- The Local Policy (`secpol.msc`) or the GPO will define the following registry key:
  - Registry Key: `HKLM\System\CurrentControlSet\Control\LSA`
  - `REG_DWORD: LMCompatibilityLevel`
  - Values: 0x0 - 0x5

- Possible Values:
  - Domain Controllers
  - 0-3: Accept All
  - 4: No LM
  - 5: Only NTLMv2

- **Activation method:** You must restart Windows to make changes to this entry effective.

LMCompatibilityLevel takes six different values, from 0 to 5.

- **Client Side** - Levels 0-3 affect the computer when acting as the client.

| Level | Group Policy Name | Sends | Accepts | Prohibits Sending |
|-------|-------------------|-------|---------|-------------------|
| 0     | Send LM and NTLM Responses | LM, NTLM (NTLMv2 Session Security is negotiated) | LM, NTLM, NTLMv2 | NTLMv2 / Session Security (on Windows 2000 below SRP1, Windows NT 4.0, and Windows 9x) |
| 1     | Send LM and NTLM - use NTLMv2 session security if negotiated | LM, NTLM (NTLMv2 Session Security is negotiated) | LM, NTLM, NTLMv2 | NTLMv2 |
| 2     | Send NTLM response only | NTLM (NTLMv2 Session Security is negotiated) | LM, NTLM, NTLMv2 | LM and NTLMv2 |
| 3     | Send NTLMv2 response only | NTLMv2 (Session Security is always used) | LM, NTLM, NTLMv2 | LM and NTLM |

- **Server Side** - Levels 4-5 affect the computer when acting as the authentication server.

| Level | Group Policy Name | Sends | Accepts | Prohibits Sending |
|-------|-------------------|-------|---------|-------------------|
| 4     | Send NTLMv2 response only/refuse LM | NTLMv2 Session Security | NTLM, NTLMv2 | LM |
| 5     | Send NTLMv2 response only/refuse LM and NTLM | NTLMv2, Session Security | NTLMv2 | LM and NTLM |

**Compatibility Matrix**

- This setting affects how a Windows computer handles NTLM authentication both as a client and as an authenticating server.
- The default level of (3) for current OSs allows Domain Controllers to be compatible with old clients going back to Windows 2000.

**CHECK FOR PICTURE HERE** ![Workflow NTLM Compatibility Matrix](/.attachments/NTLM/Workflow_NTLM_Compatibility_Matrix.png)

**Important Notes:**

- **Red - LM no longer used and should not be used** without notifying the customer that they are putting their environment at risk.
- **Blue - As a minimum** NTLM Version 1 should be used in the environment.
- **Green - Recommended to** strive to reach the highest level on LMCompatibility. LMCompatibilityLevel has been recommended in every security guide for Windows since 1998.
- NTLMv2 Session Security can be forced by setting the LMCompatibilityLevel setting, but it is also negotiated between the client and the server.

**Auditing and Restricting NTLM Usage**

- To find applications that use NTLMv1, enable Logon Success Auditing on the domain controller, and then look for Success auditing Event 4624, which contains information about the version of NTLM.
- This article introduces the steps to test any application that is using NT LAN Manager (NTLM) version 1 on a Windows Server-based domain controller: [KB4090105](https://support.microsoft.com/en-us/help/4090105/how-to-audit-domain-controller-use-of-ntlmv1-and-ntlmv2)
- The policy settings under `Computer Configuration\Windows Settings\Security Settings\Local Policies\Security Options\Network security: Restrict NTLM` can be used to restrict NTLM traffic in a variety of scenarios.
  - For example, in the domain, incoming and/or outgoing NTLM traffic.

- It is highly recommended to test extensively before deploying these settings in the production environment.

**Best Practices on Applying NTLM Restrictions**

1. First enforce the [Network Security: Restrict NTLM: Audit incoming NTLM traffic](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-audit-incoming-ntlm-traffic) or [Network Security: Restrict NTLM: Audit NTLM authentication in this domain](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-audit-ntlm-authentication-in-this-domain) policy setting and then review the operational event log to understand which servers are involved in these authentication attempts so you can decide which servers to exempt.

2. After you have set the server exception list using [Network security: Restrict NTLM: Add server exceptions in this domain](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-add-server-exceptions-in-this-domain), enforce the [Network Security: Restrict NTLM: Audit incoming NTLM traffic](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-audit-incoming-ntlm-traffic) or [Network Security: Restrict NTLM: Audit NTLM authentication in this domain](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-audit-ntlm-authentication-in-this-domain) policy setting and then review the operational event log again before setting the policies to block NTLM traffic.

**Note:** View the operational event log to see if your server exception list is functioning as intended. Audit and block events are recorded on this device in the operational event log located in **Applications and Services Log\Microsoft\Windows\NTLM**.

**Hardening the NTLM SSP**

- The `NtlmMinClientSec` and `NtlmMinServerSec` settings, which are known as some variant of "Minimum session security for NTLM SSP based (including secure RPC) clients" in Group Policy, govern which behaviors are allowed for applications using the NTLM Security Support Provider (SSP).
- The SSP Interface (SSPI) is used by applications that need authentication services.
- The `NtlmMinClientSec` and `NtlmMinServerSec` settings do not modify how the authentication sequence works. Rather, they are used to require certain behaviors in applications that use the SSPI.

Network security: Minimum session security for NTLM SSP based (including secure RPC) clients: [Microsoft Documentation](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-minimum-session-security-for-ntlm-ssp-based-including-secure-rpc-clients)

**Registry settings:**
`MACHINE\System\CurrentControlSet\Control\Lsa\MSV1_0\NTLMMinClientSec`

Network security: Minimum session security for NTLM SSP based (including secure RPC) servers: [Microsoft Documentation](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-minimum-session-security-for-ntlm-ssp-based-including-secure-rpc-servers)

**Registry settings:**
`MACHINE\System\CurrentControlSet\Control\Lsa\MSV1_0\NTLMMinServerSec`

**More Information**

**LmCompatibilityLevel** - Education Sources/Resources

- [Microsoft Documentation on Windows 2000 Server](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-2000-server/cc960646(v=technet.10))
- [Technet Magazine](https://docs.microsoft.com/en-us/previous-versions/technet-magazine/cc160954(v=msdn.10))
- [Microsoft Documentation on Network Security](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/network-security-lan-manager-authentication-level)
- [SS64 NTLM Syntax](https://ss64.com/nt/syntax-ntlm.html)
- [Microsoft Documentation on Network Security - Restrict NTLM](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/network-security-restrict-ntlm-add-remote-server-exceptions-for-ntlm-authentication)

This document provides a comprehensive overview of configuring NTLM settings, including LAN Manager Authentication Level, LMCompatibilityLevel, and best practices for auditing and restricting NTLM usage.