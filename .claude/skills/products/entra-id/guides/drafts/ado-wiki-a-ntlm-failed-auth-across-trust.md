---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/NTLM/Workflow: NTLM: Troubleshooting/Workflow: NTLM: Failed authentication request accross a Trust"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/NTLM/Workflow%3A%20NTLM%3A%20Troubleshooting/Workflow%3A%20NTLM%3A%20Failed%20authentication%20request%20accross%20a%20Trust"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415473&Instance=415473&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415473&Instance=415473&Feedback=2)

___
<div id='cssfeedback-end'></div>

### Troubleshooting NTLM Authentication Failure Across a Trust

**Summary:** This article helps troubleshoot an NTLM authentication failure for a user trying to access a file server share in a trusting domain. The issue is diagnosed through error logs and network traces, leading to the resolution of a name resolution problem.

**Scenario:**

A user with the account Contoso\testuser cannot access a file server share hosted on a server from the trusting domain cigar.ga while logged on in the domain contoso.local.

Note: cigar.ga is a fake domain name and the top-level domain name is not an existing or approved one as of December 2020.

The access attempt fails with an unspecified error:
- Error while using Windows Explorer [\\192.168.100.135\test](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415473/Workflow-NTLM-Failed-authentication-request-accross-a-Trust)
  - Timestamp: 4:23  
 ![Workflow NTLM Failed authentication request across a Trust](/.attachments/NTLM/Workflow_NTLM_Failed_authentication_request_accross_a_Trust.png)

- Error while using the command line dir [\\192.168.100.135\test](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415473/Workflow-NTLM-Failed-authentication-request-accross-a-Trust)
  - Timestamp: 04:25  
   ![Workflow NTLM Failed authentication request across a Trust](/.attachments/NTLM/Workflow_NTLM_Failed_authentication_request_accross_a_Trust_1.png)

- The connection attempt fails for both attempts while using the server name or IP address.

  \\M82-DC2\test  
  \\192.168.100.135\test

- On the security event log of the server in the trusting domain cigar.ga that hosts the remote share, we can find the following events:

```plaintext
Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          30/04/2020 04:23:09
Event ID:      4625
Task Category: Logon
Level:         Information
Keywords:      Audit Failure
User:          N/A
Computer:      M82-DC2.CIGAR.ga
Description:
An account failed to log on.

Subject:
    Security ID: NULL SID
    Account Name: -
    Account Domain: -
    Logon ID: 0x0

Logon Type: 3

Account For Which Logon Failed:
    Security ID: NULL SID
    Account Name: testuser
    Account Domain: CONTOSO

Failure Information:
    Failure Reason: An Error occurred during Logon.
    Status: 0xC000005E
    Sub Status: 0x0

Process Information:
    Caller Process ID: 0x0
    Caller Process Name: -

Network Information:
    Workstation Name: CONT-W81
    Source Network Address: 192.168.100.51
    Source Port: 49892

Detailed Authentication Information:
    Logon Process: NtLmSsp
    Authentication Package: NTLM
    Transited Services: -
    Package Name (NTLM only): -
    Key Length: 0

This event is generated when a logon request fails. It is generated on the computer where access was attempted.
The Subject fields indicate the account on the local system which requested the logon. This is most commonly a service such as the Server service, or a local process such as Winlogon.exe or Services.exe.
The Logon Type field indicates the kind of logon that was requested. The most common types are 2 (interactive) and 3 (network).
The Process Information fields indicate which account and process on the system requested the logon.
The Network Information fields indicate where a remote logon request originated. Workstation name is not always available and may be left blank in some cases.
The authentication information fields provide detailed information about this specific logon request.
    - Transited services indicate which intermediate services have participated in this logon request.
    - Package name indicates which sub-protocol was used among the NTLM protocols.
    - Key length indicates the length of the generated session key. This will be 0 if no session key was requested.




Log Name:      Security 
Source:        Microsoft-Windows-Security-Auditing 
Date:          30/04/2020 04:21:36 
Event ID:      4625 
Task Category: Logon 
Level:         Information 
Keywords:      Audit Failure 
User:          N/A 
Computer:      M82-DC2.CIGAR.ga 
Description: 
An account failed to log on. 

Subject: 
    Security ID: NULL SID 
    Account Name: - 
    Account Domain: - 
    Logon ID: 0x0 

Logon Type: 3 

Account For Which Logon Failed: 
    Security ID: NULL SID 
    Account Name: testuser 
    Account Domain: CONTOSO 

Failure Information: 
    Failure Reason: An Error occured during Logon. 
    Status: 0xC000005E 
    Sub Status: 0x0 

Process Information: 
    Caller Process ID: 0x0 
    Caller Process Name: - 

Network Information: 
    Workstation Name: CONT-W81 
    Source Network Address: fe80::b56e:8722:b95d:5403 
    Source Port: 49883 

Detailed Authentication Information: 
    Logon Process: NtLmSsp  
    Authentication Package: NTLM 
    Transited Services: - 
    Package Name (NTLM only): - 
    Key Length: 0 

This event is generated when a logon request fails. It is generated on the computer where access was attempted.
The Subject fields indicate the account on the local system which requested the logon. This is most commonly a service such as the Server service, or a local process such as Winlogon.exe or Services.exe. 
The Logon Type field indicates the kind of logon that was requested. The most common types are 2 (interactive) and 3 (network). 
The Process Information fields indicate which account and process on the system requested the logon. 
The Network Information fields indicate where a remote logon request originated. Workstation name is not always available and may be left blank in some cases. 
The authentication information fields provide detailed information about this specific logon request. 
    - Transited services indicate which intermediate services have participated in this logon request. 
    - Package name indicates which sub-protocol was used among the NTLM protocols. 
    - Key length indicates the length of the generated session key. This will be 0 if no session key was requested. 
```

- On the server hosting the remote share (M82-DC2.CIGAR.ga) Netlogon Log, we can find evidence for the network logon for the affected user.

```plaintext
04/30 04:21:16 [LOGON] [8] SamLogon: Network logon of CONTOSO\testuser from CONT-W81 Entered
04/30 04:21:16 [ENCRYPT] [8] NlpSignOrSeal: 0.4: Session Key: d0c2e533 c2d5cbb3 ff376644 98a6063a   3.......Df7.:...
04/30 04:21:16 [ENCRYPT] [8] NlpSignOrSeal: 0.4: IV: c23bdfd8 ad9c91a4 1f11c73b c8f29c97   ..;.....;.......
04/30 04:21:16 [ENCRYPT] [8] NlpSignOrSeal: 0.4: Clear Seq: 986258aa 97afc4c4 3e30f2c2 a7821fdf   .Xb.......0>....
04/30 04:21:16 [ENCRYPT] [8] NlpSignOrSeal: 0.4: Encrypted Seq: ba460a39 a67c8031 99b1bc81 d7fa291d   9.F.1.|......)..
04/30 04:21:16 [SESSION] [8] SealMessage: 0.4: returns 0x0
04/30 04:21:21 [SESSION] [5000] DeleteSecurityContext: 0.5: called
04/30 04:21:21 [SESSION] [5000] DeleteContext: 0.5: context freed
04/30 04:21:21 [SESSION] [5000] FreeCredentialsHandle: 0.1: called
04/30 04:21:21 [SESSION] [5000] DeleteCredential: 0.1: credential dereferenced: 2
04/30 04:21:27 [SESSION] [1144] NlTimeoutApiClientSession Called
04/30 04:21:27 [MAILSLOT] [1144] Going to wait on mailslot. (Timeout: 45000)
04/30 04:21:31 [ENCRYPT] [8] NlpVerifyOrUnseal: 0.4: Session Key: d0c2e533 c2d5cbb3 ff376644 98a6063a   3.......Df7.:...
04/30 04:21:31 [ENCRYPT] [8] NlpVerifyOrUnseal: 0.4: IV: 92966875 80a803cc 9eca1dfc 695c9315   uh............\i
04/30 04:21:31 [ENCRYPT] [8] NlpVerifyOrUnseal: 0.4: Encrypted Seq: b9d1daba 98dd13b4 0b8efddf dd844d59   ............YM..
04/30 04:21:31 [ENCRYPT] [8] NlpVerifyOrUnseal: 0.4: Clear Seq: 7f9041db 6f68434f 3ddc9ee1 8210b67e   .A..OCho...=~...
04/30 04:21:31 [ENCRYPT] [8] NlpVerifyOrUnseal: 0.4: First Several of signature: c3dafd09 249c6f3e ef468ae7 a641ecc0   ....>o.$..F...A.
04/30 04:21:31 [SESSION] [8] UnsealMessage: 0.4: returns 0x0
04/30 04:21:31 [CRITICAL] [8] NlPrintRpcDebug: Couldn't get EEInfo for I_NetLogonSamLogonEx: 1761 (may be legitimate for 0xc000005e)
```

- The server forwards the request to its local domain controller (DC) [\\M82-DC1.CIGAR.ga](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415473/Workflow-NTLM-Failed-authentication-request-accross-a-Trust)

```plaintext
04/30 04:21:31 [CRITICAL] [8] CIGAR: NlFinishApiClientSession: timeout call to \\M82-DC1.CIGAR.ga.  Count: 1
04/30 04:21:31 [SESSION] [8] NlpUserValidateHigher: Seed = 3565ea70 1c333eb7 559dba1f ca61da0d   p.e5.>3....U..a.
04/30 04:21:31 [SESSION] [8] NlpUserValidateHigher: SessionKey = d0c2e533 c2d5cbb3 ff376644 98a6063a   3.......Df7.:...
```

- Here, there is evidence for the authentication failure.

```plaintext

04/30 04:21:31 [LOGON] [8] SamLogon: Network logon of CONTOSO\testuser from CONT-W81 Returns 0xC000005E
```

- The error 0xC000005E translates into "No Logon Servers."

 ![Workflow NTLM Failed authentication request across a Trust](/.attachments/NTLM/Workflow_NTLM_Failed_authentication_request_accross_a_Trust_2.png)

- Using the command `nltest /sc_query:CIGAR`, we can confirm that the secure channel is established with the domain controller M82-DC1.

![Workflow NTLM Failed authentication request across a Trust](/.attachments/NTLM/Workflow_NTLM_Failed_authentication_request_accross_a_Trust_3.png)

- On the domain controller for the CIGAR domain or a management workstation with RSAT installed, we can confirm that there is a two-way external trust between the domains cigar.ga and contoso.local.

 ![Workflow NTLM Failed authentication request across a Trust](/.attachments/NTLM/Workflow_NTLM_Failed_authentication_request_accross_a_Trust_4.png)

- If we look into the domain controller M82-DC1 Netlogon Log, there is evidence for the pass-through authentication request for the CONTOSO\testuser from CONT-W81, via the remote share server M82-DC2.

```plaintext
04/30 04:21:16 [LOGON] CIGAR: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via M82-DC2) Entered
04/30 04:21:16 [SESSION] CIGAR: CONTOSO: NlDiscoverDc: Start Synchronous Discovery
04/30 04:21:16 [MISC] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c01ffff1
04/30 04:21:16 [DNS] NetpDcFindDomainEntry: CONTOSO contoso.local: Found domain cache entry with quality 3/3
04/30 04:21:16 [DNS] Cache: CONTOSO contoso.local: Found existing domain cache entry
```

- The discovery process to locate a domain controller in contoso.local fails due to a name resolution problem.

```plaintext
04/30 04:21:16 [CRITICAL] NetpDcGetNameIp: contoso.local: No data returned from DnsQuery.
04/30 04:21:16 [MISC] NetpDcGetName: NetpDcGetNameIp returned 1355
04/30 04:21:16 [MAILSLOT] Sent 'Sam Logon' message to CONTOSO[1C] on all transports.
04/30 04:21:16 6c246b27 1e12c491 34a27e18 1e7e9a69   'k$l.....~.4i.~.
04/30 04:21:16 [MAILSLOT] contoso.local: Received 'Sam Logon Response Ex' response.
04/30 04:21:16 4ca10b45 23fbf17a b48da089 63456e8e   E..Lz..#.....nEc
04/30 04:21:16 [CRITICAL] NetpDcHandlePingResponse: contoso.local: Failed DNS resolution for CONT-DC.contoso.local (none): 0x232b
04/30 04:21:16 [MISC] NetpDcGetName: NetpDcGetNameNetbios returned 121
```

```plaintext
04/30 04:21:24 [MAILSLOT] Sent 'Sam Logon' message to CONTOSO[1C] on all transports.
04/30 04:21:24 6c246b27 1e12c491 34a27e18 1e7e9a69   'k$l.....~.4i.~.
04/30 04:21:24 [MAILSLOT] contoso.local: Received 'Sam Logon Response Ex' response.
04/30 04:21:24 4ca10b45 23fbf17a b48da089 63456e8e   E..Lz..#.....nEc
04/30 04:21:24 [CRITICAL] NetpDcHandlePingResponse: contoso.local: Failed DNS resolution for CONT-DC.contoso.local (none): 0x232b
04/30 04:21:24 [MISC] NetpDcGetName: NetpDcGetNameNetbios returned 121
04/30 04:21:31 [CRITICAL] CIGAR: CONTOSO: NlDiscoverDc: Cannot find DC.
04/30 04:21:31 [CRITICAL] CIGAR: CONTOSO: NlSessionSetup: Session setup: cannot pick trusted DC
```

```plaintext
04/30 04:21:31 [SESSION] CIGAR: CONTOSO: NlSetStatusClientSession: Set connection status to c000005e
04/30 04:21:31 [SESSION] CIGAR: CONTOSO: NlSessionSetup: Session setup Failed
04/30 04:21:31 [LOGON] CIGAR: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via M82-DC2) Returns 0xC000005E
```

- With this information, we should focus our efforts on understanding the cause of the name resolution issues (DNS client configuration, networking rules, network devices, etc.), engaging the necessary teams both internally and from the customer in the process.

- Using the domain controller network trace and filtering for any packet that might contain the trusted domain name:

- For example, with the Network Monitor Display Filter - description.contains("contoso")

- We can see evidence for several NetBIOS Name Service (NBNS) resolution attempts destined to the network's broadcast address, with no replies.

| Frame Number | Time and Date  | Time Delta | Time Offset | Process Name | Source  | Destination  | Protocol Name | Description  |
|--|--|--|--|--|--|--|--|--|
| 489  | 4:21:16 AM 4/30/2020  | 0.0000000  | 37.0787458 | (0) | m82-dc1.cigar.ga  | 192.168.100.255 | NbtNs  | NbtNs:Query Request for CONTOSO  <0x1C> Domain Controllers |
| 536 | 4:21:24 AM 4/30/2020 | 7.5087326  | 44.5874784 | (0) | m82-dc1.cigar.ga  | 192.168.100.255 | NbtNs  | NbtNs:Query Request for CONTOSO  <0x1C> Domain Controllers |
| 1296 | 4:22:54 AM 4/30/2020 | 90.3901651  | 134.9776435 | (0) | m82-dc1.cigar.ga  | 192.168.100.255 | NbtNs  | NbtNs:Query Request for CONTOSO  <0x1C> Domain Controllers |
| 1334 | 4:23:01 AM 4/30/2020 | 7.5006374  | 142.4782809 | (0) | m82-dc1.cigar.ga  | 192.168.100.255 | NbtNs  | NbtNs:Query Request for CONTOSO  <0x1C> Domain Controllers |
| 1898 | 4:24:27 AM 4/30/2020 | 85.4119661 | 227.8902470 | (0) | m82-dc1.cigar.ga  | 192.168.100.255 | NbtNs  | NbtNs:Query Request for CONTOSO  <0x1C> Domain Controllers |
| 1942 | 4:24:34 AM 4/30/2020  | 7.4934099 | 235.3836569 | (0) | m82-dc1.cigar.ga  | 192.168.100.255 | NbtNs  | NbtNs:Query Request for CONTOSO  <0x1C> Domain Controllers |

- NBNS serves a similar purpose as DNS does: translating human-readable names to IP addresses.
- The domain controller is not able to resolve the trusted DC name.
- Attempting to ping the trusted domain name confirms the failure.

  ![Workflow NTLM Failed authentication request across a Trust](/.attachments/NTLM/Workflow_NTLM_Failed_authentication_request_accross_a_Trust_5.png)

- There can be several causes for this issue. If fundamental name resolution troubleshooting is not successful, the network team should be involved to assist in the process.
- After correcting the name resolution issue, we enable Netlogon debug logging on all hosts and repeat the connection attempt

![image.png](/.attachments/image-3f45bde5-b23e-4bd0-a067-278d4945bd71.png)

- This time the attempt to access to the remote share access from the trsuted Domain is successful.

![image.png](/.attachments/image-b1bfaba7-344b-4ed5-aad2-f13ab65d21ae.png)


- On the Remote Share Server Security Event Log we can see the Event ID 4624, relative to the successfull log on using NTLM authentication.

```plaintext
Log Name:      Security 
Source:        Microsoft-Windows-Security-Auditing 
Date:          30/04/2020 05:41:12 
Event ID:      4624 
Task Category: Logon 
Level:         Information 
Keywords:      Audit Success 
User:          N/A 
Computer:      M82-DC2.CIGAR.ga 
Description: 
An account was successfully logged on. 

Subject: 
    Security ID: NULL SID 
    Account Name: - 
    Account Domain: - 
    Logon ID: 0x0 

Logon Information: 
    Logon Type: 3 
    Restricted Admin Mode: - 
    Virtual Account: No 
    Elevated Token: No 

Impersonation Level: Impersonation 

New Logon: 
    Security ID: S-1-5-21-591764230-1029101083-2802481191-1107 
    Account Name: testuser 
    Account Domain: CONTOSO 
    Logon ID: 0x4D35ED 
    Linked Logon ID: 0x0 
    Network Account Name: - 
    Network Account Domain: - 
    Logon GUID: {00000000-0000-0000-0000-000000000000} 

Process Information: 
    Process ID: 0x0 
    Process Name: - 

Network Information: 
    Workstation Name: CONT-W81 
    Source Network Address: 192.168.100.51 
    Source Port: 49983 

Detailed Authentication Information: 
    Logon Process: NtLmSsp  
    Authentication Package: NTLM 
    Transited Services: - 
    Package Name (NTLM only): NTLM V2 
    Key Length: 128 
```

- On the Remote Share Server Netlogon log, the Server Contacts the Local Domain Controller to authenticate the trusted domain user request

```plaintext
04/30 05:41:11 [LOGON] [680] SamLogon: Network logon of CONTOSO\testuser from CONT-W81 Entered 
04/30 05:41:11 [MISC] [680] NetpDcInitializeContext: DSGETDC_VALID_FLAGS is c0fffff1 
04/30 05:41:11 [MAILSLOT] [680] NetpDcPingListIp: CIGAR.ga.: Sent UDP ping to 192.168.100.130 
04/30 05:41:11 [MISC] [680] NlPingDcNameWithContext: Sent 1/1 ldap pings to M82-DC1.CIGAR.ga 
04/30 05:41:12 [MISC] [680] NetpDcAllocateCacheEntry: new entry 0x000002749CCC9190 -> DC:M82-DC1 DnsDomName:CIGAR.ga Flags:0x31fd  
04/30 05:41:12 [MISC] [680] NlPingDcNameWithContext: M82-DC1.CIGAR.ga responded over IP. 
04/30 05:41:12 [PERF] [680] NlSetServerClientSession: Not changing connection (000002749C3D0278): "\\M82-DC1.CIGAR.ga" 
```
- On the Local Domain Controller we can see evidence for the UDP ping request/response and for the Pass-trough authentication request

```plaintext
04/30 05:41:11 [CRITICAL] I_NetlogonLdapLookup: unrecognized filter parameter DnsHostName 
04/30 05:41:11 [MAILSLOT] Received ping from M82-DC2 CIGAR.ga. (null) on UDP LDAP 
04/30 05:41:11 [MAILSLOT] CIGAR: Ping response 'Sam Logon Response Ex' (null) to \\M82-DC2 Site: Default-First-Site-Name on UDP LDAP 
04/30 05:41:12 [CRITICAL] AcceptSecurityContext: fefefefe.0: Can't NlFindNamedServerSession for M82-DC2 
04/30 05:41:12 [CRITICAL] I_NetlogonLdapLookup: unrecognized filter parameter DnsHostName 
04/30 05:41:12 [MAILSLOT] Received ping from M82-DC2 CIGAR.ga. (null) on UDP LDAP 
04/30 05:41:12 [MAILSLOT] CIGAR: Ping response 'Sam Logon Response Ex' (null) to \\M82-DC2 Site: Default-First-Site-Name on UDP LDAP 
04/30 05:41:12 [SESSION] CIGAR: NetrServerAuthenticate entered: M82-DC2 (192.168.100.135) on account M82-DC2$ (Negot: 612fffff) 
04/30 05:41:12 [SESSION] CIGAR: NetrServerAuthenticate returns Success: M82-DC2 on account M82-DC2$ (Negot: 612fffff) 
04/30 05:41:12 [SESSION] [Unknown]: NetrLogonGetCapabilities: M82-DC2 1 Entered 
04/30 05:41:12 [SESSION] CIGAR: NetrLogonGetCapabilities: M82-DC2 1 Returns 0x0 
04/30 05:41:12 [SESSION] CIGAR: NetrLogonGetDomainInfo: M82-DC2 1 Entered 
04/30 05:41:12 [SESSION] CIGAR: NetrLogonGetDomainInfo: M82-DC2 is running NT 10.0 build 17763 (3) 
04/30 05:41:12 [DNS] NlSetClientAttributes: LsaISetClientDnsHostName(), status 0x0 
04/30 05:41:12 [MISC] CIGAR: NetrLogonGetDomainInfo: DnsHostName of M82-DC2 is M82-DC2.CIGAR.ga 
04/30 05:41:12 [SESSION] CIGAR: NetrLogonGetDomainInfo: M82-DC2 1 Returns 0x0 
04/30 05:41:12 [LOGON] CIGAR: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via M82-DC2) Entered 
04/30 05:41:12 [LOGON] CIGAR: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via M82-DC2) Returns 0x0 
04/30 05:44:12 [SESSION] CIGAR: CONTOSO: NlTimeoutApiClientSession: Unbind from server \\CONT-DC.contoso.local (TCP) 0. 
```

- On the Trusted Domain Contoso.local Domain Controller Netlogon log we can see evidence of the Pass-trough authentication request via the trusting Domain DC and the successful authentication

```plaintext
04/30 05:41:12 [LOGON] [5764] CONTOSO: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via M82-DC1) Entered 
04/30 05:41:12 [LOGON] [5764] CONTOSO: SamLogon: Transitive Network logon of CONTOSO\testuser from CONT-W81 (via M82-DC1) Returns 0x0 
```
- On the Remote Share Server Netlogon log we can see further evidence on the succesfull authentication.
```plaintext
04/30 05:41:12 [LOGON] [680] SamLogon: Network logon of CONTOSO\testuser from CONT-W81 Returns 0x0 
```