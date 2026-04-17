---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/LDAP Signing & Channel Binding Changes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FLDAP%20Signing%20%26%20Channel%20Binding%20Changes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1712891&Instance=1712891&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1712891&Instance=1712891&Feedback=2)

___
<div id='cssfeedback-end'></div>

![VNext-Banner.png](/.attachments/VNext-Banner-098bb40b-bb91-44b9-9e54-14a3e12b6701.png)
[[_TOC_]]


**Note:** Before diving into the details of the new feature, this document provides a primer on the topic to ensure readers have the necessary background and context to fully understand the changes.

**Pre-reqs:**
##External:
- Frequently asked questions about changes to Lightweight Directory Access Protocol [Click here](https://support.microsoft.com/en-us/topic/frequently-asked-questions-about-changes-to-lightweight-directory-access-protocol-41a40287-810a-e799-d067-f578fca055fc)

- 2020, 2023, and 2024 LDAP channel binding and LDAP signing requirements for Windows (KB4520412) [Click here](https://support.microsoft.com/en-us/topic/2020-2023-and-2024-ldap-channel-binding-and-ldap-signing-requirements-for-windows-kb4520412-ef185fb8-00f7-167d-744c-f299a66fc00a)

- How to enable LDAP signing in Windows Server [Click here](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/enable-ldap-signing-in-windows-server)

##Internal:

- Servicing: 3B.20: LDAP Channel binding Audit events for all supported client and server OS versions including ADV190023 [Click here](https://internal.evergreen.microsoft.com/en-us/topic/f02816d1-c937-6eb9-5303-1e78ab51def0)

- ADDS: REPADMIN error 8232: A more secure authentication method is required.... if LDAP signing mismatch exists [Click here](https://internal.evergreen.microsoft.com/en-us/topic/d08f854d-670c-691c-c257-84ef69bab9a9)

- Servicing: 3B.20: ADV190023 / MSRC 51117 - Microsoft Guidance for Enabling LDAP Channel Binding and LDAP Signing [Click here](https://internal.evergreen.microsoft.com/en-us/topic/604d7d13-bba5-b172-27ab-87bbe5dd3ed0)

- Servicing: 3B.20: Apple McIntosh OS Support for LDAP signing and channel binding in support of ADV190023 [Click here](https://internal.evergreen.microsoft.com/en-us/topic/611375f6-a5ca-c128-e718-d6cbfe6b22a4)

- Servicing: 3B.20: Microsoft-Windows-ActiveDirectory_DomainService event 3039 logged if LdapEnforceChannelBinding = 1 / "when supported" & intermediate device issues new connection [Click here](https://internal.evergreen.microsoft.com/en-us/topic/91acd60c-40ba-9421-0a5e-4665d9c79a6a)

#LDAP Signing and Channel Binding
In today's security-conscious environment, ensuring the integrity and confidentiality of communication between clients and servers is paramount. LDAP (Lightweight Directory Access Protocol) is widely used to authenticate and retrieve directory information in Active Directory (AD) environments. However, without proper security measures, it is susceptible to attacks like man-in-the-middle (MITM). To combat these threats, LDAP Signing was introduced, adding a layer of security that ensures the authenticity of LDAP traffic.

**What is LDAP Signing:**

LDAP Signing is a security feature that digitally signs LDAP communications to verify the authenticity of the data. By enabling LDAP Signing, both the client and the server can ensure that the data received has not been tampered with during transmission. This process helps mitigate MITM attacks by preventing unauthorized modifications to LDAP messages in transit.

LDAP Signing works by using a Secure Sockets Layer (SSL) or Transport Layer Security (TLS) connection, where LDAP messages are signed cryptographically. When LDAP Signing is enforced, any unsigned or improperly signed requests are rejected, thus improving the security of communications between clients and servers.

## **LDAP Channel Binding**
Channel Binding Tokens (CBT) are used to bind the application layer's security (such as an SSL/TLS session) with the lower network layer. Essentially, CBT ensures that the encrypted channel established between the client and the LDAP server remains secure, preventing attackers from hijacking the session or downgrading the encryption. This is particularly crucial in scenarios where NTLM or Simple Bind over SSL/TLS is used for authentication.

Without CBT enforcement, even though SSL/TLS encrypts the session, it is still vulnerable to MITM attacks, where an attacker could intercept or tamper with the connection. By binding the session and the security context together, CBT mitigates such risks.

**What Changed with LDAP Signing?** 

The security of Active Directory domain controllers can be significantly improved by configuring the server to reject Simple Authentication and Security Layer (SASL) LDAP binds that do not request signing (integrity verification) or to reject LDAP simple binds that are performed on a clear text (non-SSL/TLS-encrypted) connection. SASLs may include protocols such as the Negotiate, Kerberos, NTLM, and Digest protocols.

Unsigned network traffic is susceptible to replay attacks in which an intruder intercepts the authentication attempt and the issuance of a ticket. The intruder can reuse the ticket to impersonate the legitimate user. Additionally, unsigned network traffic is susceptible to man-in-the-middle (MiTM) attacks in which an intruder captures packets between the client and the server, changes the packets, and then forward them to the server. If this occurs on an Active Directory Domain Controller, an attacker can cause a server to make decisions that are based on forged requests from the LDAP client. LDAPS uses its own distinct network port to connect clients and servers. The default port for LDAP is port 389, but LDAPS uses port 636 and establishes SSL/TLS upon connecting with a client.

Channel binding tokens help make LDAP authentication over SSL/TLS more secure against man-in-the-middle attacks.

Microsoft has been steadily enhancing LDAP security over the years, and LDAP Signing has played a crucial role in these improvements. Initially, LDAP communications could occur without any signing, leaving them vulnerable to attacks. Heres a timeline of significant changes:

- **January 2020:** Microsoft announced its plan to enforce stricter LDAP security by requiring LDAP Signing in Active Directory environments. The company released an advisory encouraging administrators to enable LDAP Signing to protect against potential attacks.

- **March 2020:** In response to customer feedback, Microsoft postponed the enforcement of mandatory LDAP Signing but continued to stress its importance.

- **August 2020:** Microsoft rolled out patches that added warning events in the event logs to notify administrators if unsigned LDAP connections were being made, urging them to take action to enforce signing.

- **January 2021:** LDAP Signing became a more critical security focus as part of overall hardening measures for Active Directory

**More information:** 
[2020, 2023, and 2024 LDAP channel binding and LDAP signing requirements for Windows (KB4520412)](https://support.microsoft.com/en-us/topic/2020-2023-and-2024-ldap-channel-binding-and-ldap-signing-requirements-for-windows-kb4520412-ef185fb8-00f7-167d-744c-f299a66fc00a)

##**Group Policy Configurations:**
Current Group Policy settings which can be configured to enforce LDAP Signing and LDAP Channel Bindings

**LDAP Signing:**<br>

**Domain Controller:** <br>
**Policy Path:** Default Domain Controller Policy > Computer Configuration > Policies > Windows Settings > Security Settings > Local Policies, and then select Security Options. <br>
**Policy Name:** Domain controller: **LDAP server signing requirements**

**Client machine or Member Servers:**
**Policy Path:**Local Computer Policy > Computer Configuration > Policies > Windows Settings > Security Settings > Local Policies and then select Security Options. <br>
**Policy Name:** Network security: **LDAP client signing requirements**

**LDAP Channel Binding:**<br>

**Policy Path:** Default Domain Controller Policy > Computer Configuration > Policies > Windows Settings > Security Settings > Local Policies, and then select Security Options. <br>
**Policy Name:** Domain controller: **LDAP server channel binding token requirements**

##**Events**

LDAP Signing and LDAP Channel Binding events play a crucial role in troubleshooting and monitoring the security of LDAP communications. By understanding these events, customers can proactively identify potential issues, ensure compliance, and strengthen their security posture in Active Directory environments.


##Key LDAP Signing Events

1. **Event ID 2886**: **LDAP Signing not required**
   - **Description**: This event is logged when the domain controller allows unsigned LDAP communications. This occurs if the Group Policy setting **Domain controller: LDAP server signing requirements** is set to None or Negotiate signing and clients are sending unsigned LDAP traffic.
   - **Recommended Action**: This event serves as a warning that LDAP traffic is vulnerable to MITM attacks. Administrators should evaluate whether all clients support signing and, if possible, configure the domain controller to **require LDAP Signing** by changing the policy setting.

2. **Event ID 2887**: **Unsigned LDAP binds detected**
   - **Description**: This event is logged if a client makes an unsigned simple bind or LDAP bind using SASL (Simple Authentication and Security Layer) that is not protected by SSL/TLS.
   - **Recommended Action**: Investigate the clients generating these requests. Ensure that all clients and applications are configured to use LDAP over SSL (LDAPS) or signing for LDAP communications. After resolving the issues, consider setting the domain controller policy to **require LDAP Signing**.

3. **Event ID 2888**: **LDAP Signing disabled for all communications**
   - **Description**: This event is logged when the domain controller allows all LDAP traffic to be unsigned. It occurs when the LDAP server signing requirements are set to **None**.
   - **Recommended Action**: This is a critical event, indicating a **highly vulnerable state**. Administrators should immediately investigate and consider enabling LDAP Signing to protect their environment.

4. **Event ID 2889**: **Signed LDAP communications**
   - **Description**: This event is logged to notify that LDAP communications are signed. It indicates that the domain controller is successfully handling signed LDAP requests.
   - **Recommended Action**: No action is required. This is a normal event showing secure traffic.

## **LDAP Channel Binding Events**

LDAP Channel Binding ensures that the encrypted SSL/TLS channel cannot be intercepted or hijacked during communication. It uses **Channel Binding Tokens (CBT)** to bind the upper-layer security (e.g., NTLM or Kerberos) to the lower-layer SSL/TLS session, offering additional protection from MITM attacks.

#### Key LDAP Channel Binding Events

1. **Event ID 3039**: **Channel Binding not supported by the client**
   - **Description**: This event is logged when a client does not support Channel Binding Tokens (CBT), and the domain controller policy is set to enforce channel binding.
   - **Recommended Action**: Investigate the clients generating these events and confirm whether they can be updated or reconfigured to support Channel Binding. If the client cannot be updated, the enforcement policy may need to be adjusted temporarily to avoid service disruptions while migrating.

2. **Event ID 3040**: **Channel Binding failure**
   - **Description**: This event is logged when a client attempts to bind using CBT, but the binding fails due to mismatched tokens or other reasons.
   - **Recommended Action**: Investigate the configuration of the client and the network settings. Ensure that the SSL/TLS channel is properly established and that the binding token matches what the domain controller expects. This might require checking certificates and network configurations.

3. **Event ID 3041**: **Channel Binding successful**
   - **Description**: This event is logged when a client successfully uses Channel Binding with an LDAP request.
   - **Recommended Action**: No action required. This event confirms that secure communication using Channel Binding Tokens has been successfully established.

### How to Use These Events for Troubleshooting

1. **Enable Auditing**: To capture these events, make sure that auditing for LDAP Signing and Channel Binding is enabled. This can be done through the **Advanced Audit Policy Configuration** in Group Policy under **Audit Directory Service Access**.

2. **Monitor Event Logs**: Regularly monitor event logs in **Event Viewer** under the **Directory Service** category for LDAP Signing and Channel Binding events. This can help detect when unsigned or improperly signed LDAP requests are being made.

3. **Identify Problematic Clients**: If you see frequent logs for **Event ID 2887** or **Event ID 3039**, investigate the clients or applications generating these requests. You may need to update the client configuration or enable support for signed and channel-bound LDAP traffic.

4. **Check Domain Controller Policies**: Ensure that the **Domain controller: LDAP server signing requirements** and **LDAPEnforceChannelBinding** policies are set to enforce signed and channel-bound communications. 
   - Gradually implement signing and binding by first setting LDAP Signing to **Negotiate** and Channel Binding to **When Supported**, and then move toward full enforcement after ensuring client compatibility.

5. **Perform a Rollout Plan**: If enforcement of signing or binding is causing disruptions, roll out changes in stages. Begin by setting LDAP Signing and Channel Binding to **audit-only** modes and identifying incompatible clients. After resolving any compatibility issues, move to **full enforcement**.

6. **Upgrade Legacy Systems**: Older clients that do not support LDAP Signing or Channel Binding need to be updated. If they cannot be updated, consider isolating them on a separate network segment or replacing them.


# **Whats New with LDAP Signing in Windows Server 2025 Domain Controllers?**

With the release of Windows Server 2025, Microsoft introduced enhanced LDAP Signing capabilities, focusing on performance, flexibility, and ease of configuration. Here are some of the new features and changes:

1. **Mandatory LDAP Signing for All New Deployments:** In Windows Server 2025, LDAP Signing is now mandatory by default for all new Active Directory deployments, ensuring higher security from the start.

**New Group Policy:**

**Domain Controller:** <br>
**Policy Path:** Default Domain Controller Policy > Computer Configuration > Policies > Windows Settings > Security Settings > Local Policies, and then select Security Options. <br>
**Policy Name:** LDAP server signing requirements Enforcement

**Values:**
- **Not Configured:** This means DC will enforce signing requirements
- **Enabled:** Setting overrides the LDAP Server Signing requirements unless its explicitly disabled 
- **Disabled:** would make the LDAP Signing policy will be in use


2. LDAP Channel Binding is set to "**When Supported**"
3. LDAP Client encryption is preferred by default
4. LDAP Channel Binding auditing is enabled by default

# **Whats New with LDAP Signing in Windows Server 2025 & Windows Client 24H2? (Client feature)**
**LDAP Client Performanc Counters:**
Beginning with Windows Server 2025, you can use Active Directory Lightweight Directory Access Protocol (LDAP) client performance counters to monitor the performance of LDAP clients. These counters provide valuable insights into the performance of LDAP clients, including the number of binds, connections, and operations that are being processed.

LDAP client performance counters can be monitored per process running on the local client machine. Multiple processes can be assessed simultaneously. Examples of available counters include binds, connections, and operations.

The performance counters would help to identify key metrics of process and will help in troubleshoot ADPERF scenarios, performance fine tuning, 

| **Counter name** | **Type** | **Description** |
|-----|-----|-----|
| `Digest Binds/sec` | Binds | The number of binds per second performed using digest authentication with LDAP and SASL. |
| `Negotiate Binds/sec` | Binds | The number of binds per second performed using negotiated authentication with LDAP and SASL. |
| `NTLM Binds/sec` | Binds | The number of binds per second performed using NTLM authentication with LDAP and SASL. |
| `Simple Binds/sec` | Binds | The number of binds per second performed using simple authentication with LDAP and SASL. |
| `Total Binds/sec` | Binds | The total number of binds per second performed with LDAP and SASL. |
| `New Connections/sec` | Connections | The number of new connections per second to the LDAP server. |
| `New TCP Connections/sec` | Connections | The number of new TCP connections per second to the LDAP server. |
| `New TLS Connections/sec` | Connections | The number of new TLS connections per second to the LDAP server. |
| `New LDP Connections/sec` | Connections | The number of new LDP connections per second to the LDAP server. |
| `Open Connections` | Connections | The total number of open connections to the LDAP server. |
| `Abandons/sec` | Operations | The number of abandoned operations per second. |
| `Adds/sec` | Operations | The number of add operations per second. |
| `Deletes/sec` | Operations | The number of LDAP delete operations per second. |
| `Modify/sec` | Operations | The number of LDAP modify operations per second. |
| `New Requests/sec` | Requests | The number of new LDAP requests per second. |
| `Request Count` | Requests | The total number of LDAP requests since monitoring began. |
| `Average Response Time` | Responses | The average response time for LDAP requests since monitoring began. |
| `Failure Polling Responses/sec` | Responses | The number of failed polling responses per second. |
| `Failure Responses/sec` | Responses | The number of failed LDAP responses per second. |
| `Pending Responses` | Responses | The number of LDAP responses pending a response. |
| `Successful Polling Responses/sec` | Responses | The number of successful LDAP polling responses per second. |
| `Successful Responses/sec` | Responses | The number of successful LDAP responses per second. |
| `Base Searches/sec` | Searches | The number of LDAP base searches per second. |
| `Subtree Searches/sec` | Searches | The number of LDAP subtree searches per second. |


#References:

##External:
[Frequently asked questions about changes to Lightweight Directory Access Protocol](https://support.microsoft.com/en-us/topic/frequently-asked-questions-about-changes-to-lightweight-directory-access-protocol-41a40287-810a-e799-d067-f578fca055fc)

[2020, 2023, and 2024 LDAP channel binding and LDAP signing requirements for Windows (KB4520412)](https://support.microsoft.com/en-us/topic/2020-2023-and-2024-ldap-channel-binding-and-ldap-signing-requirements-for-windows-kb4520412-ef185fb8-00f7-167d-744c-f299a66fc00a)

[How to enable LDAP signing in Windows Server](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/enable-ldap-signing-in-windows-server)

##Internal:

[Servicing: 3B.20: LDAP Channel binding Audit events for all supported client and server OS versions including ADV190023](https://internal.evergreen.microsoft.com/en-us/topic/f02816d1-c937-6eb9-5303-1e78ab51def0)

[ADDS: REPADMIN error 8232: A more secure authentication method is required.... if LDAP signing mismatch exists](https://internal.evergreen.microsoft.com/en-us/topic/d08f854d-670c-691c-c257-84ef69bab9a9)

[Servicing: 3B.20: ADV190023 / MSRC 51117 - Microsoft Guidance for Enabling LDAP Channel Binding and LDAP Signing](https://internal.evergreen.microsoft.com/en-us/topic/604d7d13-bba5-b172-27ab-87bbe5dd3ed0)

[Servicing: 3B.20: Apple McIntosh OS Support for LDAP signing and channel binding in support of ADV190023](https://internal.evergreen.microsoft.com/en-us/topic/611375f6-a5ca-c128-e718-d6cbfe6b22a4)

[Servicing: 3B.20: Microsoft-Windows-ActiveDirectory_DomainService event 3039 logged if LdapEnforceChannelBinding = 1 / "when supported" & intermediate device issues new connection](https://internal.evergreen.microsoft.com/en-us/topic/91acd60c-40ba-9421-0a5e-4665d9c79a6a)