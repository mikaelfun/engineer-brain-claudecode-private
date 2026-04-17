---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/dMSA - Delegated Managed Service Account/Sample log analysis/dMSA log analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FdMSA%20-%20Delegated%20Managed%20Service%20Account%2FSample%20log%20analysis%2FdMSA%20log%20analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1543092&Instance=1543092&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1543092&Instance=1543092&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

dMSA events explained
dMSA has 2 primarily has 2 components:

1. Kerberos Client <br>
1. KDC Server 

Below is a list of all dMSA events that Kerberos clients and KDC service can log with their explanation. During troubleshooting you can use these events to learn if the issue/problem is on the client side of kerberos side.  

**Kerberos Client:**

##**dMSA Kerberos events:** <br>
value 1-99    win:Critical  
value 100-199 win:Error     
value 200-299 win:Warning   
value 300-399 win:Informational <br>
value 400-499 win:Verbose 

###Error events

|  **Event ID** | **Message**                               | **Explanation** |
|----------|-------------------------------------|-------------|
| 105      | GmsaGetPasswordsFailure             |             |


___


___
###Informational events

|  **Event ID** |  **Message**                                 |  **Explanation** |
|----------|-----------------------------------------|-------------|
| 307      | DmsaMigration                           |             |
| 308      | DmsaPermissionAdd                       |             |
| 309      | DmsaKeyFetch                            |             |
____

##dMSA KDC events

###Error events

|  **Event ID** |  **Message**                               |  **Explanation** |
|----------|---------------------------------------|-------------|
| 314     | KdcDmsaAuthzFailure                               |             |

___

###Informational events

|  **Event ID** |  **Message**                               |  **Explanation** |
|----------|---------------------------------------|-------------|
| 315      | KdcDmsaKeyFetch                              |             |


#Log Analysis 

##New dMSA scenario
Below is a log analysis of the below scenario:

1.  Windows Server 2025 Domain Controller
2.  Windows Server 2025 Member Server
3.  SNMP Trap service running with an dMSA account 

The log is collected when the service is starting using the dMSA account.

**Network trace analysis:**

**1. Machine account is getting a KRBTGT.** 
```
2341	12:55:29 PM 7/2/2024		MemberServer	dc.contoso.com	KerberosV5	KerberosV5:TGS Request Realm: CONTOSO.COM Sname: krbtgt/CONTOSO 
2343	12:55:29 PM 7/2/2024		dc.contoso.com	MemberServer	KerberosV5	KerberosV5:TGS Response Cname: MEMBER$ 
 ```

**2. Using the above KRBTGT the member requests for an S4U to request ticket for the dMSA account**
```
2352	12:55:29 PM 7/2/2024		MemberServer	dc.contoso.com	KerberosV5	KerberosV5:TGS Request Realm: CONTOSO.COM Sname: krbtgt/CONTOSO 
PaData: PA-TGS-REQ (1)
Ticket: Realm: CONTOSO.COM, Sname: krbtgt/CONTOSO.COM
PaData: PA_S4U_X509_USER (130)
PaS4uX509User: 
2361	12:55:29 PM 7/2/2024		dc.contoso.com	MemberServer	KerberosV5	KerberosV5:TGS Response Cname: dMSASQLSvc$ 
```

**3. Further the dMSASQLSvc would request host and LDAP tickets.** 

```
2370	12:55:29 PM 7/2/2024		MemberServer	dc.contoso.com	KerberosV5	KerberosV5:TGS Request Realm: CONTOSO.COM Sname: host/member.contoso.com 
2372	12:55:29 PM 7/2/2024		dc.contoso.com	MemberServer	KerberosV5	KerberosV5:TGS Response Cname: dMSASQLSvc$ 
2414	12:55:30 PM 7/2/2024		MemberServer	dc.contoso.com	KerberosV5	KerberosV5:TGS Request Realm: CONTOSO.COM Sname: LDAP/DC.contoso.com/contoso.com 
2416	12:55:30 PM 7/2/2024		dc.contoso.com	MemberServer	KerberosV5	KerberosV5:TGS Response Cname: dMSASQLSvc$ 
```

**Kerberos ETL Log analysis on the client**

**1. Machine account requesting a TGS request (Starting the Kerberos trasaction)**
```
[1] 0384.03D4::07/02/24-12:55:29.8589838 [KERBEROS] credapi_cxx4870 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x384, luid (0:3e7) called
[1] 0384.03D4::07/02/24-12:55:29.8589881 [KERBEROS] credapi_cxx4974 SpAcquireCredentialsHandle() - SpAcquireCredHandle: Acquiring creds for CONTOSO.COM\member$
[1] 0384.03D4::07/02/24-12:55:29.8592309 [KERBEROS] ctxtapi_cxx561 KerbProcessTargetNames() - Parsed name ldap/DC.contoso.com/contoso.com@CONTOSO.COM ((null)) into:	 name type 0x2, name count 3, 	 realm CONTOSO.COM, 	 first part ldap/DC.contoso.com/contoso.com
```
2. Using the KRBTGT from the above transaction we are requesting a TGS for dMSASQLSvc 

```
[0] 0384.03D4::07/02/24-12:55:29.8952493 [KERBEROS] logonapi_cxx10477 KerbILogonUserEx3() - Logging on user dMSASQLSvc$, domain CONTOSO
[0] 0384.03D4::07/02/24-12:55:29.8952552 [KERBEROS] logonses_cxx1735 KerbCreateLogonSession() - KerbCreateLogonSession creating logon session for 0:0x13e0f79
[0] 0384.03D4::07/02/24-12:55:29.8952796 [KERBEROS] logonses_cxx433 KerbInsertOrLocateLogonSession() - INSERT logonsess 0000025740BD47F0 for 0:0x13e0f79
[0] 0384.03D4::07/02/24-12:55:29.8952800 [KERBEROS] logonses_cxx1857 KerbCreateLogonSession() - KerbCreateLogonSession: created logon session 0000025740BD47F0 for LUID 0:13e0f79
[0] 0384.03D4::07/02/24-12:55:29.8952806 [KERBEROS] logonapi_cxx11012 KerbILogonUserEx3() - LsaApLogonUserEx3: attempting to logon user CONTOSO\dMSASQLSvc$
[0] 0384.03D4::07/02/24-12:55:29.8952824 [KERBEROS] ctxtapi_cxx561 KerbProcessTargetNames() - Parsed name dMSASQLSvc$ ((null)) into:	 name type 0x1, name count 1, 	 realm (null), 	 first part dMSASQLSvc$
[0] 0384.03D4::07/02/24-12:55:29.8952835 [KERBEROS] ctxtapi_cxx727 KerbProcessTargetNames() - Cracked name dMSASQLSvc$
[0] 0384.03D4::07/02/24-12:55:29.8952870 [KERBEROS] ctxtapi_cxx728 KerbProcessTargetNames() - into dMSASQLSvc$
[0] 0384.03D4::07/02/24-12:55:29.8952927 [KERBEROS] kerbtick_cxx460 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0, SuppRealm (null), TargetDomain CONTOSO
[0] 0384.03D4::07/02/24-12:55:29.8952948 [KERBEROS] kerbtick_cxx563 KerbGetTgtForService() - KerbGetTgtForService is using the primary TGT even though we know this is a cross-realm target
[0] 0384.03D4::07/02/24-12:55:29.8952971 [KERBEROS] kerbs4u_cxx2267 KerbGetTgtToS4URealm() - Getting referral TGT for TargetTgtKdcName krbtgt/CONTOSO
[0] 0384.03D4::07/02/24-12:55:29.8952994 [KERBEROS] kerbs4u_cxx2268 KerbGetTgtToS4URealm() - ServiceName krbtgt/CONTOSO.COM
[0] 0384.03D4::07/02/24-12:55:29.8953027 [KERBEROS] kerbtick_cxx5725 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM
[0] 0384.03D4::07/02/24-12:55:29.8953033 [KERBEROS] kerbtick_cxx3823 __KerbGetTgsTicket() - KerbGetTgsTicket Flags 0, Tgt DomainName CONTOSO.COM, Tgt TargetDomainName CONTOSO.COM, TgtReply 0000000000000000, EvidenceTicket 0000000000000000
[0] 0384.03D4::07/02/24-12:55:29.8953047 [KERBEROS] kerbtick_cxx3824 __KerbGetTgsTicket() - TargetName krbtgt/CONTOSO
[0] 0384.03D4::07/02/24-12:55:29.8953166 [KERBEROS] kerbcredisoium_cxx37 KerbCredIsoIum::BuildEncryptedAuthData() - KerbCredIsoIum::ComputeTgsChecksum - Start call to LsaIso
[0] 0384.03D4::07/02/24-12:55:29.8966077 [KERBEROS] kerbcredisoium_cxx42 KerbCredIsoIum::BuildFastArmoredKdcRequest() - KerbCredIsoIum::ComputeTgsChecksum - End call to LsaIso
[0] 0384.03D4::07/02/24-12:55:29.8966133 [KERBEROS] kerbtick_cxx8348 KerbCreateApRequest() - Skewing system time. System time is 07/02/24-12:55:29.8983994
[0] 0384.03D4::07/02/24-12:55:29.8966136 [KERBEROS] kerbtick_cxx8349 KerbCreateApRequest() - Skewed time is 07/02/24-12:55:29.8983994
[0] 0384.03D4::07/02/24-12:55:29.8966159 [KERBEROS] kerbcredisoium_cxx37 KerbCredIsoIum::BuildEncryptedAuthData() - KerbCredIsoIum::CreateApReqAuthenticator - Start call to LsaIso
[0] 0384.03D4::07/02/24-12:55:29.8980551 [KERBEROS] kerbcredisoium_cxx42 KerbCredIsoIum::BuildFastArmoredKdcRequest() - KerbCredIsoIum::CreateApReqAuthenticator - End call to LsaIso
[0] 0384.03D4::07/02/24-12:55:29.8980895 [KERBEROS] kerbtick_cxx3127 KerbMakeSocketCallEx2() - KerbMakeSocketCall uses KdcToCall option 0.
[0] 0384.03D4::07/02/24-12:55:29.8982154 [KERBEROS] bndcache_cxx366 KerbLocateBindingCacheEntry() - **Using** KDC cache entry Realm: CONTOSO.COM, Addr: 192.168.2.106, DcFlags e007f1fc
[0] 0384.03D4::07/02/24-12:55:29.8982163 [KERBEROS] bndcache_cxx370 KerbLocateBindingCacheEntry() - CLOSE DC
[0] 0384.03D4::07/02/24-12:55:29.8982166 [KERBEROS] bndcache_cxx383 KerbLocateBindingCacheEntry() - -- BDC
[0] 0384.03D4::07/02/24-12:55:29.8982191 [KERBEROS] kerbtick_cxx3437 KerbMakeSocketCallEx2() - Retry #0 Calling kdc 192.168.2.106 for realm CONTOSO.COM, DesiredFlags 0x2000000, connection timeout: 0 secs
[0] 0384.03D4::07/02/24-12:55:29.8982204 [kerbcommint] sockets_cxx656 KerbCallKdcEx() - Calling KDC: 192.168.2.106
[2] 0384.03D4::07/02/24-12:55:29.8989016 [kerbcommint] sockets_cxx556 KerbBindSocketByAddress() - Successfully bound to 192.168.2.106
[2] 0384.03D4::07/02/24-12:55:29.8989119 [kerbcommint] sockets_cxx757 KerbCallKdcEx() - Socket being used for select is 0x1574
[3] 0384.03D4::07/02/24-12:55:29.9021174 [kerbcommint] sockets_cxx842 KerbCallKdcEx() - Socket being used for select is 0x1574
[3] 0384.03D4::07/02/24-12:55:29.9021591 [KERBEROS] logonapi_cxx5900 __KerbGetTgsTicket() - KerbTransferMessage: Returned from KDC status 0x0
[0] 0384.03D4::07/02/24-12:55:29.9093838 [KERBEROS] kerbtick_cxx3127 KerbMakeSocketCallEx2() - KerbMakeSocketCall uses KdcToCall option 0.
[0] 0384.03D4::07/02/24-12:55:29.9093974 [KERBEROS] bndcache_cxx366 KerbLocateBindingCacheEntry() - **Using** KDC cache entry Realm: CONTOSO.COM, Addr: 192.168.2.106, DcFlags e007f1fc
[0] 0384.03D4::07/02/24-12:55:29.9093980 [KERBEROS] bndcache_cxx370 KerbLocateBindingCacheEntry() - CLOSE DC
[0] 0384.03D4::07/02/24-12:55:29.9093983 [KERBEROS] bndcache_cxx383 KerbLocateBindingCacheEntry() - -- BDC
[0] 0384.03D4::07/02/24-12:55:29.9093998 [KERBEROS] kerbtick_cxx3437 KerbMakeSocketCallEx2() - Retry #0 Calling kdc 192.168.2.106 for realm CONTOSO.COM, DesiredFlags 0x2000000, connection timeout: 0 secs
[0] 0384.03D4::07/02/24-12:55:29.9094007 [kerbcommint] sockets_cxx656 KerbCallKdcEx() - Calling KDC: 192.168.2.106
[0] 0384.03D4::07/02/24-12:55:29.9101033 [kerbcommint] sockets_cxx556 KerbBindSocketByAddress() - Successfully bound to 192.168.2.106
[2] 0384.03D4::07/02/24-12:55:29.9172067 [KERBEROS] logonapi_cxx5900 __KerbGetTgsTicket() - KerbTransferMessage: Returned from KDC status 0x0
```
**Continuation about the above transaction**
```
[2] 0384.03D4::07/02/24-12:55:29.9172257 [KERBEROS] kerbcredisoium_cxx37 KerbCredIsoIum::BuildEncryptedAuthData() - KerbCredIsoIum::UnpackKdcReplyBody - Start call to LsaIso
[2] 037C.19CC::07/02/24-12:55:29.9180053 [KerberosCryptoPolicy] KerberosCryptoPolicy_cxx319 KerberosCryptoPolicy::SetPartnerAttributes() - SetPartnerAttributes msds-SET: 0; UAC: 0x100
[2] 0384.03D4::07/02/24-12:55:29.9196295 [KERBEROS] kerbcredisoium_cxx42 KerbCredIsoIum::BuildFastArmoredKdcRequest() - KerbCredIsoIum::UnpackKdcReplyBody - End call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9196569 [KERBEROS] kerbcredisoium_cxx37 KerbCredIsoIum::BuildEncryptedAuthData() - KerbCredIsoIum::SignS4UPreauthData - Start call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9203643 [KERBEROS] kerbcredisoium_cxx42 KerbCredIsoIum::BuildFastArmoredKdcRequest() - KerbCredIsoIum::SignS4UPreauthData - End call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9203690 [KERBEROS] kerbs4u_cxx2778 KerbCheckX509S4uReply() - KerbCheckX509S4uReply picking up cname from kdc reply
[2] 0384.03D4::07/02/24-12:55:29.9203872 [KERBEROS] tktcache_cxx2066 KerbScheduleTgtRenewal() - Ticket 0000025740B04C20 will be renewed 34617 seconds from now
Unknown
[2] 0384.03D4::07/02/24-12:55:29.9204263 [KERBEROS] logonapi_cxx11152 KerbILogonUserEx3() - Getting outbound ticket to host/member.contoso.com
[2] 0384.03D4::07/02/24-12:55:29.9204282 [KERBEROS] kerbtick_cxx460 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0x1, SuppRealm (null), TargetDomain CONTOSO.COM
[2] 0384.03D4::07/02/24-12:55:29.9204315 [KERBEROS] kerbtick_cxx7023 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName host/member.contoso.com
[2] 0384.03D4::07/02/24-12:55:29.9204339 [KERBEROS] kerbtick_cxx5725 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM
[2] 0384.03D4::07/02/24-12:55:29.9204345 [KERBEROS] kerbtick_cxx3823 __KerbGetTgsTicket() - KerbGetTgsTicket Flags 0x1, Tgt DomainName CONTOSO.COM, Tgt TargetDomainName CONTOSO.COM, TgtReply 0000000000000000, EvidenceTicket 0000000000000000
[2] 0384.03D4::07/02/24-12:55:29.9204367 [KERBEROS] kerbtick_cxx3824 __KerbGetTgsTicket() - TargetName host/member.contoso.com
[2] 0384.03D4::07/02/24-12:55:29.9204451 [KERBEROS] kerbcredisoium_cxx37 KerbCredIsoIum::BuildEncryptedAuthData() - KerbCredIsoIum::ComputeTgsChecksum - Start call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9212345 [KERBEROS] kerbcredisoium_cxx42 KerbCredIsoIum::BuildFastArmoredKdcRequest() - KerbCredIsoIum::ComputeTgsChecksum - End call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9212389 [KERBEROS] kerbtick_cxx8348 KerbCreateApRequest() - Skewing system time. System time is 07/02/24-12:55:29.9223021
[2] 0384.03D4::07/02/24-12:55:29.9212392 [KERBEROS] kerbtick_cxx8349 KerbCreateApRequest() - Skewed time is 07/02/24-12:55:29.9223021
[2] 0384.03D4::07/02/24-12:55:29.9212411 [KERBEROS] kerbcredisoium_cxx37 KerbCredIsoIum::BuildEncryptedAuthData() - KerbCredIsoIum::CreateApReqAuthenticator - Start call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9225486 [KERBEROS] kerbcredisoium_cxx42 KerbCredIsoIum::BuildFastArmoredKdcRequest() - KerbCredIsoIum::CreateApReqAuthenticator - End call to LsaIso
[2] 0384.03D4::07/02/24-12:55:29.9225762 [KERBEROS] kerbtick_cxx3127 KerbMakeSocketCallEx2() - KerbMakeSocketCall uses KdcToCall option 0.
[2] 0384.03D4::07/02/24-12:55:29.9225852 [KERBEROS] bndcache_cxx366 KerbLocateBindingCacheEntry() - **Using** KDC cache entry Realm: CONTOSO.COM, Addr: 192.168.2.106, DcFlags e007f1fc
[2] 0384.03D4::07/02/24-12:55:29.9225857 [KERBEROS] bndcache_cxx370 KerbLocateBindingCacheEntry() - CLOSE DC
[2] 0384.03D4::07/02/24-12:55:29.9225859 [KERBEROS] bndcache_cxx383 KerbLocateBindingCacheEntry() - -- BDC
[2] 0384.03D4::07/02/24-12:55:29.9225871 [KERBEROS] kerbtick_cxx3437 KerbMakeSocketCallEx2() - Retry #0 Calling kdc 192.168.2.106 for realm CONTOSO.COM, DesiredFlags 0x2000000, connection timeout: 0 secs
[2] 0384.03D4::07/02/24-12:55:29.9225880 [kerbcommint] sockets_cxx656 KerbCallKdcEx() - Calling KDC: 192.168.2.106
[2] 0384.03D4::07/02/24-12:55:29.9238955 [kerbcommint] sockets_cxx556 KerbBindSocketByAddress() - Successfully bound to 192.168.2.106
[2] 0384.03D4::07/02/24-12:55:29.9239057 [kerbcommint] sockets_cxx757 KerbCallKdcEx() - Socket being used for select is 0x10e8
[2] 0384.03D4::07/02/24-12:55:29.9263836 [kerbcommint] sockets_cxx842 KerbCallKdcEx() - Socket being used for select is 0x10e8
[2] 0384.03D4::07/02/24-12:55:29.9264447 [KERBEROS] logonapi_cxx5900 __KerbGetTgsTicket() - KerbTransferMessage: Returned from KDC status 0x0
[2] 0384.03D4::07/02/24-12:55:29.9313112 [KERBEROS] TicketLogonClient_cxx458 PacValidation::GetAuthorizationDataFromPac() - Taking authorization data from PAC for CONTOSO\dMSASQLSvc$
[2] 0384.03D4::07/02/24-12:55:29.9313122 [KERBEROS] TicketLogonClient_cxx523 PacValidation::GetAuthorizationDataFromPac() - Adding extra logon information to logon.  UPN = dMSASQLSvc$@contoso.com and DNS domain = CONTOSO.COM
[2] 0384.03D4::07/02/24-12:55:29.9313979 [KERBEROS] krbtoken_cxx1981 KerbMakeTokenInformationV3() - KerbMakeTokenInformationV3 LocalSystemSid 0, IsNetworkService 0, MaybeAddThisOrgCertSid 0
[2] 0384.03D4::07/02/24-12:55:29.9314437 [KERBEROS] kerbsuppcred_cxx33 KerbFindNtowfKey() - KerbFindNtowfKey - no NTOWF found for user
[2] 0384.03D4::07/02/24-12:55:29.9314561 [KERBEROS] krbtoken_cxx4523 KerbCacheLogonInformation() - KerbCacheLogonInformation updating NLP Cache entry of CONTOSO\dMSASQLSvc$, flags 0x100 <NULL>... 
[2] 0384.03D4::07/02/24-12:55:29.9536532 [KERBEROS] logonapi_cxx11590 KerbILogonUserEx3() - NameDisplay (empty)
[2] 0384.03D4::07/02/24-12:55:29.9536548 [KERBEROS] logonapi_cxx11619 KerbILogonUserEx3() - NameUserPrincipal dMSASQLSvc$@contoso.com
[2] 0384.03D4::07/02/24-12:55:29.9536552 [KERBEROS] logonapi_cxx11628 KerbILogonUserEx3() - NameDnsDomain CONTOSO.COM
[1] 0384.03D4::07/02/24-12:55:29.9589499 [KERBEROS] credapi_cxx4723 SpAcceptCredentials() - SpAcceptCredentials returned 0x0
```
**3. dMSA service account requesting LDAP ticket from the domain controller**
```
[1] 0384.03D4::07/02/24-12:55:29.9589476 [KERBEROS] credapi_cxx3093 SpAcceptCredentials() - SpAcceptCredentials called
[1] 0384.03D4::07/02/24-12:55:29.9589489 [KERBEROS] credapi_cxx3111 SpAcceptCredentials() - SpAcceptCredentials accepting credentials for 0:0x13e0f79, flag 0x1000, logon type 0x5, CONTOSO\dMSASQLSvc$ or dMSASQLSvc$@contoso.com at CONTOSO.COM, SupplementalCredentials 0000000000000000
[1] 0384.03D4::07/02/24-12:55:29.9589499 [KERBEROS] credapi_cxx4723 SpAcceptCredentials() - SpAcceptCredentials returned 0x0
[0] 0384.03D4::07/02/24-12:55:30.4868196 [KERBEROS] logonapi_cxx12269 LsaApPostLogonUser() - LsaApPostLogonUser: LogonId 0:13e0f79, LinkedLogonId 0:0
[0] 0384.03D4::07/02/24-12:55:30.4868249 [KERBEROS] logonapi_cxx12307 LsaApPostLogonUser() - LsaApPostLogonUser: logon session 0:13e0f79 is OK to clean up credentials, flags 0x400000
[0] 0384.03D4::07/02/24-12:55:30.4868255 [KERBEROS] logonses_cxx3977 KerbCleanupLogonSessionCredentials() - KerbCleanupLogonSessionCredentials: clean up credentials from logon session 0:13e0f79, flags 0x400000
[0] 0384.03D4::07/02/24-12:55:30.4948008 [KERBEROS] credapi_cxx4870 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x384, luid (0:13e0f79) called
[0] 0384.03D4::07/02/24-12:55:30.4948030 [KERBEROS] credapi_cxx4974 SpAcquireCredentialsHandle() - SpAcquireCredHandle: Acquiring creds for CONTOSO\dMSASQLSvc$
[0] 0384.03D4::07/02/24-12:55:30.4948143 [KERBEROS] credapi_cxx5164 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle returning success, handle = 00000257409FB6E0
[0] 0384.03D4::07/02/24-12:55:30.4948150 [KERBEROS] credapi_cxx5196 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x384, luid (0:13e0f79) returned 0x0
[0] 0384.03D4::07/02/24-12:55:30.4948175 [KERBEROS] credapi_cxx4870 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x384, luid (0:13e0f79) called
[0] 0384.03D4::07/02/24-12:55:30.4948180 [KERBEROS] credapi_cxx4974 SpAcquireCredentialsHandle() - SpAcquireCredHandle: Acquiring creds for CONTOSO\dMSASQLSvc$
[0] 0384.03D4::07/02/24-12:55:30.4948203 [KERBEROS] credmgr_cxx1625 KerbLocateCredential() - KerbLocateCredential found credential 00000257409FB6E0, supplied creds 0000000000000000, HandleCount 2
[0] 0384.03D4::07/02/24-12:55:30.4948209 [KERBEROS] credapi_cxx5164 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle returning success, handle = 00000257409FB6E0
[0] 0384.03D4::07/02/24-12:55:30.4948215 [KERBEROS] credapi_cxx5196 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x384, luid (0:13e0f79) returned 0x0
[0] 0384.03D4::07/02/24-12:55:30.4949476 [KERBEROS] KerberosTransportContext_cxx1185 SpInitLsaModeContext() - IAKerb velocity is disabled
[0] 0384.03D4::07/02/24-12:55:30.4949482 [KERBEROS] ctxtapi_cxx990 SpInitLsaModeContext_Old() - SpInitLsaModeContext 0000000000000000 called
[0] 0384.03D4::07/02/24-12:55:30.4949515 [KERBEROS] ctxtapi_cxx561 KerbProcessTargetNames() - Parsed name LDAP/DC.contoso.com/contoso.com@CONTOSO.COM ((null)) into:	 name type 0x2, name count 3, 	 realm CONTOSO.COM, 	 first part LDAP/DC.contoso.com/contoso.com
[0] 0384.03D4::07/02/24-12:55:30.4949527 [KERBEROS] ctxtapi_cxx727 KerbProcessTargetNames() - Cracked name LDAP/DC.contoso.com/contoso.com@CONTOSO.COM
[0] 0384.03D4::07/02/24-12:55:30.4949564 [KERBEROS] ctxtapi_cxx728 KerbProcessTargetNames() - into LDAP/DC.contoso.com/contoso.com
```

##KDC log ETL analysis


```
[0] 0374.1110::07/02/24-12:55:29.8998057 [kdcsvc] sockutil_cxx257 KdcAtqCreateContext() - Creating KdcContext 0000025CFF1A0730
[0] 0374.1110::07/02/24-12:55:29.8998063 [kdcsvc] sockutil_cxx403 KdcAtqConnectEx() - KdcAtqConnectEx: set timeout for KdcContext 0000025CFF1A0730 to KdcNewConnectionTimeout 0xa
[3] 0374.1140::07/02/24-12:55:29.8999462 [core] tktutil_cxx1182 KdcNormalizeWorker() - KdcNormalize [entering] normalizing name, WhichFields 0, ExtendedFields 0, PrincipalName 0000025C81D751A0, PrincipalRealm CONTOSO.COM, RequestRealm CONTOSO.COM, TgtClientRealm (null), NameFlags 0xa, MappedAttr 0000000000000000
[3] 0374.1140::07/02/24-12:55:29.8999505 [core] tktutil_cxx1184 KdcNormalizeWorker() - PrincipalName krbtgt/CONTOSO.COM
[3] 0374.1140::07/02/24-12:55:29.9000379 [core] tktutil_cxx1182 KdcNormalizeWorker() - KdcNormalize [entering] normalizing name, WhichFields 0, ExtendedFields 0, PrincipalName 0000025C81D673A0, PrincipalRealm (null), RequestRealm CONTOSO.COM, TgtClientRealm (null), NameFlags 0x1, MappedAttr 0000000000000000
[3] 0374.1140::07/02/24-12:55:29.9000393 [core] tktutil_cxx1184 KdcNormalizeWorker() - PrincipalName MEMBER$
[3] 0374.1140::07/02/24-12:55:29.9000399 [core] tktutil_cxx1255 KdcNormalizeWorker() - KdcNormalize checking sam for request realm CONTOSO.COM
[3] 0374.1140::07/02/24-12:55:29.9003639 [core] tktutil_cxx1184 KdcNormalizeWorker() - PrincipalName MEMBER$
[3] 0374.1140::07/02/24-12:55:29.9003643 [core] tktutil_cxx1255 KdcNormalizeWorker() - KdcNormalize checking sam for request realm CONTOSO.COM
[3] 0374.1140::07/02/24-12:55:29.9003647 [core] tktutil_cxx1736 KdcNormalizeWorker() - KdcNormalize checking name in SAM
[3] 0374.1140::07/02/24-12:55:29.9003667 [core] tktutil_cxx5416 KdcGetTicketInfoFull() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x1a2404, ExtendedFields 0, GenericUserName MEMBER$, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2
3] 0374.1140::07/02/24-12:55:29.9003677 [core] tktutil_cxx5418 KdcGetTicketInfoFull() - PrincipalName (empty)
[3] 0374.1140::07/02/24-12:55:29.9005796 [core] tktutil_cxx5837 KdcGetTicketInfoFull() - KdcGetTicketInfo getting user keys
[3] 0374.1140::07/02/24-12:55:29.9005804 [core] tktutil_cxx5937 KdcGetTicketInfoFull() - KdcGetTicketInfo enabling account for protocol transition via A2DF
[3] 0374.1140::07/02/24-12:55:29.9005815 [core] tktutil_cxx6039 KdcGetTicketInfoFull() - KdcGetTicketInfo [Leaving] 0
[3] 0374.1140::07/02/24-12:55:29.9005836 [core] tktutil_cxx2272 KdcNormalize() - KdcNormalize [Leaving] 0
[3] 0374.1140::07/02/24-12:55:29.9116593 [core] tktutil_cxx1184 KdcNormalizeWorker() - PrincipalName dMSASQLSvc$
[3] 0374.1140::07/02/24-12:55:29.9116598 [core] tktutil_cxx1255 KdcNormalizeWorker() - KdcNormalize checking sam for request realm (null)
[3] 0374.1140::07/02/24-12:55:29.9116605 [core] tktutil_cxx1736 KdcNormalizeWorker() - KdcNormalize checking name in SAM
[3] 0374.1140::07/02/24-12:55:29.9116624 [core] tktutil_cxx5416 KdcGetTicketInfoFull() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0, ExtendedFields 0, GenericUserName dMSASQLSvc$, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2
[3] 0374.1140::07/02/24-12:55:29.9116632 [core] tktutil_cxx5418 KdcGetTicketInfoFull() - PrincipalName (empty)
[3] 0374.1140::07/02/24-12:55:29.9118603 [core] tktutil_cxx5837 KdcGetTicketInfoFull() - KdcGetTicketInfo getting user keys
[3] 0374.1140::07/02/24-12:55:29.9118610 [core] tktutil_cxx5937 KdcGetTicketInfoFull() - KdcGetTicketInfo enabling account for protocol transition via A2DF
[3] 0374.1140::07/02/24-12:55:29.9118616 [core] tktutil_cxx6039 KdcGetTicketInfoFull() - KdcGetTicketInfo [Leaving] 0
[3] 0374.1140::07/02/24-12:55:29.9118700 [core] tktutil_cxx2272 KdcNormalize() - KdcNormalize [Leaving] 0
[3] 0374.1140::07/02/24-12:55:29.9118740 [core] gettgs_cxx8413 KdcFindS4UClientAndRealm() - KdcFindS4UClientAndRealm checking logonhours for client dMSASQLSvc$
[3] 0374.1140::07/02/24-12:55:29.9118782 [core] tktutil_cxx1182 KdcNormalizeWorker() - KdcNormalize [entering] normalizing name, WhichFields 0x1a2404, ExtendedFields 0, PrincipalName 0000025C81D686C0, PrincipalRealm (null), RequestRealm CONTOSO.COM, TgtClientRealm (null), NameFlags 0x1, MappedAttr 0000000000000000
[3] 0374.1140::07/02/24-12:55:29.9118795 [core] tktutil_cxx1184 KdcNormalizeWorker() - PrincipalName MEMBER$
[3] 0374.1140::07/02/24-12:55:29.9118800 [core] tktutil_cxx1255 KdcNormalizeWorker() - KdcNormalize checking sam for request realm CONTOSO.COM
[3] 0374.1140::07/02/24-12:55:29.9118804 [core] tktutil_cxx1736 KdcNormalizeWorker() - KdcNormalize checking name in SAM
[3] 0374.1140::07/02/24-12:55:29.9118824 [core] tktutil_cxx5416 KdcGetTicketInfoFull() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x1a2404, ExtendedFields 0, GenericUserName MEMBER$, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2
[3] 0374.1140::07/02/24-12:55:29.9118829 [core] tktutil_cxx5418 KdcGetTicketInfoFull() - PrincipalName (empty)
[3] 0374.1140::07/02/24-12:55:29.9120272 [core] tktutil_cxx5837 KdcGetTicketInfoFull() - KdcGetTicketInfo getting user keys
[3] 0374.1140::07/02/24-12:55:29.9120278 [core] tktutil_cxx5937 KdcGetTicketInfoFull() - KdcGetTicketInfo enabling account for protocol transition via A2DF
[3] 0374.1140::07/02/24-12:55:29.9120284 [core] tktutil_cxx6039 KdcGetTicketInfoFull() - KdcGetTicketInfo [Leaving] 0
[3] 0374.1140::07/02/24-12:55:29.9120302 [core] tktutil_cxx2272 KdcNormalize() - KdcNormalize [Leaving] 0
[3] 0374.1140::07/02/24-12:55:29.9120453 [core] gettgs_cxx9482 HandleTGSRequest() - S4USelf request: requestor = CONTOSO.COM
[3] 0374.1140::07/02/24-12:55:29.9120468 [core] gettgs_cxx9483 HandleTGSRequest() - SourceClientName MEMBER$
[3] 0374.1140::07/02/24-12:55:29.9120471 [core] gettgs_cxx9484 HandleTGSRequest() - S4USelf client realm CONTOSO
[3] 0374.1140::07/02/24-12:55:29.9120487 [core] gettgs_cxx9485 HandleTGSRequest() - S4UTicketInfo.PACCName dMSASQLSvc$
[3] 0374.1140::07/02/24-12:55:29.9120493 [core] gettgs_cxx9486 HandleTGSRequest() - HandleTGSRequest S4UTarget = (null)
[3] 0374.1140::07/02/24-12:55:29.9120511 [core] gettgs_cxx9487 HandleTGSRequest() - ServerName krbtgt/CONTOSO
[3] 0374.1140::07/02/24-12:55:29.9120514 [core] gettgs_cxx9547 HandleTGSRequest() - HandleTGSRequest getting new TGS ticket
[3] 0374.1140::07/02/24-12:55:29.9120592 [core] gettgs_cxx4376 I_GetTGSTicket() - I_GetTGSTicket [entering] trying to build a new ticket krbtgt/CONTOSO
[3] 0374.1140::07/02/24-12:55:29.9120599 [core] gettgs_cxx4421 I_GetTGSTicket() - I_GetTGSTicket requesting u2u? FALSE
[3] 0374.1140::07/02/24-12:55:29.9120604 [core] tktutil_cxx1182 KdcNormalizeWorker() - KdcNormalize [entering] normalizing name, WhichFields 0x10000000, ExtendedFields 0x2000804, PrincipalName 0000025C81D7A560, PrincipalRealm (null), RequestRealm CONTOSO.COM, TgtClientRealm CONTOSO.COM, NameFlags 0x16, MappedAttr 0000000000000000
```