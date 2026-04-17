---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/How the TGS request is evaluated at the KDC"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/How%20the%20TGS%20request%20is%20evaluated%20at%20the%20KDC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053228&Instance=1053228&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053228&Instance=1053228&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Summary:**
This page is part of the DS Kerberos wiki, under "The Three-Phase Ticketing - Deep Dive" and describes how the Ticket Granting Service (TGS) request is evaluated at the domain controller.    
Full path: Workflow: Kerberos: Protocol Flow: The Three-Phase Ticketing - Deep Dive

---

## KDC processing 

The Key Distribution Center (KDC) decrypts the Ticket Granting Ticket (TGT) to fetch the session key _KC,K_ and decrypts the Authenticator with this session key. 

TGTs enable the KDC to avoid the performance penalties of looking up a user's long-term key every time the user requests a service. The KDC looks up the user key only once, when it grants an initial TGT. For all other exchanges with this user, the KDC can decrypt the TGT with its own long-term key, extract the logon session key  
**{TGT}KK =  {Client, KrbTgt, t, PAC, KC,K}KK**, and use that to validate the user's authenticator. 

---

## ETL examples

### What to look for on server side

The important functions to look for:  
- **HandleTGSRequest()** and **I_GetTGSTicket()**: Gets a ticket using a KDC ticket (TGT).
- **KdcNormalize()**: KDC searching for the ticket information in the database.
- **KdcGetTicketInfo()**: Gets the info needed to build a ticket for a principal using the name of the principal.
- **KdcVerifyPacSignature()**: Verifies a Privilege Attribute Certificate (PAC) by checksumming it and comparing the result with the server checksum. If the PAC wasn't created by another realm (server ticket info is not an interdomain account), it also verifies the KDC signature on the PAC.
- **BuildTicketTGS()**: Builds (most of) a TGS ticket.
- **KdcBuildTicketTimesAndFlags()**: Computes the times and flags for a new ticket.
- **KdcInsertAuthorizationData()**: Inserts authorization data into a newly created ticket.

**Note:**   
This from the last line: "I_GetTGSTicket [Leaving] 0". The number at the end is "0" when the process ended with no issue, but an error code could be there instead if the process failed.  

#### KDC.etl example

```plaintext
105 [0] 02CC.2CD4::06/09/24-16:48:58.1174044 [dll] gettgs_cxx9909 HandleTGSRequest() - HandleTGSRequest getting new TGS ticket
106 [0] 02CC.2CD4::06/09/24-16:48:58.1174110 [dll] gettgs_cxx5377 I_GetTGSTicket() - I_GetTGSTicket [entering] trying to build a new ticket ldap/dc2.contoso.com
107 [0] 02CC.2CD4::06/09/24-16:48:58.1174115 [dll] gettgs_cxx5427 I_GetTGSTicket() - I_GetTGSTicket requesting u2u? FALSE
108 [0] 02CC.2CD4::06/09/24-16:48:58.1174120 [dll] tktutil_cxx1205 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0x10000000, ExtendedFields 0x2000804, PrincipalName 000001D470E4F3B0, PrincipalRealm (null), RequestRealm CONTOSO.COM, TgtClientRealm CONTOSO.COM, NameFlags 0x16, MappedAttr 0000000000000000
109 [0] 02CC.2CD4::06/09/24-16:48:58.1174137 [dll] tktutil_cxx1207 KdcNormalize() - PrincipalName ldap/dc2.contoso.com
110 [0] 02CC.2CD4::06/09/24-16:48:58.1174142 [dll] tktutil_cxx1807 KdcNormalize() - KdcNormalize checking UPN
111 [0] 02CC.2CD4::06/09/24-16:48:58.1174146 [dll] tktutil_cxx1839 KdcNormalize() - KdcNormalize lookup up upn/spn ldap/dc2.contoso.com
112 [0] 02CC.2CD4::06/09/24-16:48:58.1174150 [dll] tktutil_cxx5481 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts true, WhichFields 0x10000000, ExtendedFields 0x2000804, GenericUserName ldap/dc2.contoso.com, LookupFlags 0x40, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x1
113 [0] 02CC.2CD4::06/09/24-16:48:58.1174155 [dll] tktutil_cxx5483 KdcGetTicketInfo() - PrincipalName (empty)
114 [0] 02CC.2CD4::06/09/24-16:48:58.1176066 [dll] tktutil_cxx5899 KdcGetTicketInfo() - KdcGetTicketInfo getting user keys
115 [0] 02CC.2CD4::06/09/24-16:48:58.1176422 [dll] tktutil_cxx6004 KdcGetTicketInfo() - KdcGetTicketInfo enabling account for protocol transition via A2DF
116 [0] 02CC.2CD4::06/09/24-16:48:58.1176432 [dll] tktutil_cxx6150 KdcGetTicketInfo() - KdcGetTicketInfo [Leaving] 0
117 [0] 02CC.2CD4::06/09/24-16:48:58.1176438 [dll] tktutil_cxx2197 KdcNormalize() - KdcNormalize [Leaving] 0
118 [0] 02CC.2CD4::06/09/24-16:48:58.1176496 [dll] pac_cxx2166 KdcVerifyPacSignature() - KDCVerifyPacSignature uses tgt key type 0x12(18) to verify server signature.
119 [0] 02CC.2CD4::06/09/24-16:48:58.1178358 [dll] gettgs_cxx3684 BuildTicketTGS() - BuildTicketTGS building a TGS ticket Referral? false, CommonEType 0x12
120 [0] 02CC.2CD4::06/09/24-16:48:58.1178371 [dll] tktutil_cxx2293 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags ClientPolicyFlags 0, ServerPolicyFlags 0x97b, KdcOptions 0x40810000
121 [0] 02CC.2CD4::06/09/24-16:48:58.1178380 [dll] tktutil_cxx2391 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags SourceTicketFlags 0x40e10000
122 [0] 02CC.2CD4::06/09/24-16:48:58.1178389 [dll] tktutil_cxx3003 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags Final Ticket Flags 0x40a50000, times -
123 [0] 02CC.2CD4::06/09/24-16:48:58.1178394 [dll] tktutil_cxx3005 KdcBuildTicketTimesAndFlags() -   RequestRenewTime = FileTimeToSystemTime error 0x      57
124 [0] 02CC.2CD4::06/09/24-16:48:58.1178398 [dll] tktutil_cxx3006 KdcBuildTicketTimesAndFlags() -   RequestEndTime = 09/13/00-05:48:05.0000000
125 [0] 02CC.2CD4::06/09/24-16:48:58.1178401 [dll] tktutil_cxx3007 KdcBuildTicketTimesAndFlags() -   RequestStartTime = 01/01/01-03:00:00.0000000
126 [0] 02CC.2CD4::06/09/24-16:48:58.1178404 [dll] tktutil_cxx3008 KdcBuildTicketTimesAndFlags() -   FinalRenewTime = 06/16/24-16:16:22.0000000
127 [0] 02CC.2CD4::06/09/24-16:48:58.1178409 [dll] tktutil_cxx3009 KdcBuildTicketTimesAndFlags() -   FinalEndTime = 06/10/24-02:48:58.0000000
128 [0] 02CC.2CD4::06/09/24-16:48:58.1178413 [dll] tktutil_cxx3010 KdcBuildTicketTimesAndFlags() -   FinalStartTime = 06/09/24-16:48:58.1062772
129 [0] 02CC.2CD4::06/09/24-16:48:58.1178417 [dll] tktutil_cxx3011 KdcBuildTicketTimesAndFlags() -   SourceRenewTime = 06/16/24-16:16:22.0000000
130 [0] 02CC.2CD4::06/09/24-16:48:58.1178420 [dll] tktutil_cxx3012 KdcBuildTicketTimesAndFlags() -   SourceEndTime = 06/10/24-02:48:58.0000000
131 [0] 02CC.2CD4::06/09/24-16:48:58.1178423 [dll] tktutil_cxx3013 KdcBuildTicketTimesAndFlags() -   SourceStartTime = 06/09/24-16:48:58.0000000
132 [0] 02CC.2CD4::06/09/24-16:48:58.1178468 [dll] gettgs_cxx6349 I_GetTGSTicket() - I_GetTGSTicket signing PAC with server key
133 [0] 02CC.2CD4::06/09/24-16:48:58.1178477 [dll] gettgs_cxx2185 KdcInsertAuthorizationData() - KdcInsertAuthorizationData recreate-pac 0, S4UTicketInfo 00000064C82FF1F0, OriginalServerInfo 00000064C82FE9E0
134 [0] 02CC.2CD4::06/09/24-16:48:58.1178482 [dll] gettgs_cxx2281 KdcInsertAuthorizationData() - KdcInsertAuthorizationData EvidenceTicket is SourceTicket (TGT in TGS AP request)
135 [0] 02CC.2CD4::06/09/24-16:48:58.1178486 [dll] gettgs_cxx2309 KdcInsertAuthorizationData() - KdcInsertAuthorizationData: using Session key & salt
136 [0] 02CC.2CD4::06/09/24-16:48:58.1178686 [dll] gettgs_cxx2354 KdcInsertAuthorizationData() - KdcInsertAuthorizationData using supplied authorization data
137 [0] 02CC.2CD4::06/09/24-16:48:58.1178710 [dll] gettgs_cxx2475 KdcInsertAuthorizationData() - KdcInsertAuthorizationData extracted PAC from evidence ticket
138 [0] 02CC.2CD4::06/09/24-16:48:58.1178716 [dll] gettgs_cxx2519 KdcInsertAuthorizationData() - KdcInsertAuthorizationData OriginalServerInfo (null)\krbtgt
139 [0] 02CC.2CD4::06/09/24-16:48:58.1178748 [dll] pac_cxx2166 KdcVerifyPacSignature() - KDCVerifyPacSignature uses tgt key type 0x12(18) to verify server signature.
140 [0] 02CC.2CD4::06/09/24-16:48:58.1180307 [dll] gettgs_cxx6517 I_GetTGSTicket() - I_GetTGSTicket [Leaving] 0
```

### What to look for on client side
The important functions to look for:   
- **KerbProcessTargetNames()**: Takes the target names from both the negotiate hint and supplied by the caller and creates the real Kerberos target name.
- **KerbGetTgtForService()**: Gets a TGT for the domain of the specified service. If a cached one is available, it uses that one. Otherwise, it calls the KDC to acquire it.
- **KerbFindCommonPaEtype()**: Finds an encryption type in common between KDC and client.
- **KerbGetServiceTicketInternal()**: Gets a ticket to a service and handles cross-domain referrals.
- **KerbGetTgsTicketEx()** and **__KerbGetTgsTicket()**: Gets a ticket to the specified target with the specified options.
- **KerbMakeSocketCallEx()** and **KerbCallKdcEx()**: Can be used to check which KDC is used.

**Note:** This from the last line: "**KerbGetServiceTicketInternal()** - KerbGetReferralNames returns RealTargetRealm (null)". This is an example of a process that completed successfully. The example below is a process that failed in comparison: "**KerbGetServiceTicketInternal()** - Failed to get TGS ticket for service 0xc000018b".

#### Kerberos.etl

```plaintext
114 [0] 0350.3B20::06/09/24-16:48:57.9549019 [KERBEROS] miscapi_cxx5640 KerbRetrieveEncodedTicket() - Retrieving encoded ticket
118 [0] 0350.3B20::06/09/24-16:48:57.9549277 [KERBEROS] ctxtapi_cxx560 KerbProcessTargetNames() - Parsed name ldap/dc2.contoso.com ((null)) into:     name type 0x2, name count 2,      realm (null),      first part ldap/dc2.contoso.com
119 [0] 0350.3B20::06/09/24-16:48:57.9549318 [KERBEROS] ctxtapi_cxx726 KerbProcessTargetNames() - Cracked name ldap/dc2.contoso.com
120 [0] 0350.3B20::06/09/24-16:48:57.9549370 [KERBEROS] ctxtapi_cxx727 KerbProcessTargetNames() - into ldap/dc2.contoso.com
121 [0] 0350.3B20::06/09/24-16:48:57.9550232 [KERBEROS] credman_cxx2209 KerbCheckCredMgrForGivenTarget() - No credentials from the cred mgr 0xc0000225!
122 [0] 0350.3B20::06/09/24-16:48:57.9550511 [KERBEROS] kerbtick_cxx458 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0x2140020, SuppRealm (null), TargetDomain (null)
123 [0] 0350.3B20::06/09/24-16:48:57.9550534 [KERBEROS] kerbtick_cxx583 KerbGetTgtForService() - KerbGetTgtForService refreshing primary TGT for account
124 [0] 0350.3B20::06/09/24-16:48:57.9550538 [KERBEROS] kerbtick_cxx345 KerbRefreshPrimaryTgt() - KerbRefreshPrimaryTgt attempting to renew primary TGT
125 [0] 0350.3B20::06/09/24-16:48:57.9550559 [KERBEROS] kerbtick_cxx5710 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM
126 [0] 0350.3B20::06/09/24-16:48:57.9550577 [KERBEROS] kerbtick_cxx3759 __KerbGetTgsTicket() - KerbGetTgsTicket Flags 0, Tgt DomainName CONTOSO.COM, Tgt TargetDomainName CONTOSO.COM, TgtReply 0000000000000000, EvidenceTicket 0000000000000000
127 [0] 0350.3B20::06/09/24-16:48:57.9550608 [KERBEROS] kerbtick_cxx3760 __KerbGetTgsTicket() - TargetName krbtgt/CONTOSO.COM
128 [0] 0350.3B20::06/09/24-16:48:57.9550899 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::ComputeTgsChecksum - Start call to LsaIso
129 [0] 0350.3B20::06/09/24-16:48:57.9563431 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::ComputeTgsChecksum - End call to LsaIso
130 [0] 0350.3B20::06/09/24-16:48:57.9563567 [KERBEROS] kerbtick_cxx8330 KerbCreateApRequest() - Skewing system time. System time is 06/09/24-16:48:57.9564230
131 [0] 0350.3B20::06/09/24-16:48:57.9563571 [KERBEROS] kerbtick_cxx8331 KerbCreateApRequest() - Skewed time is 06/09/24-16:48:57.9564230
132 [0] 0350.3B20::06/09/24-16:48:57.9563645 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::CreateApReqAuthenticator - Start call to LsaIso
133 [0] 0350.3B20::06/09/24-16:48:57.9571351 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::CreateApReqAuthenticator - End call to LsaIso
134 [0] 0350.3B20::06/09/24-16:48:57.9571811 [KERBEROS] kerbtick_cxx3077 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
135 [0] 0350.13BC::06/09/24-16:48:57.9574333 [KERBEROS] spncache_cxx241 KerbAgeSpnCache() - Aging the SPN cache
136 [0] 0350.3B20::06/09/24-16:48:57.9604290 [KERBEROS] bndcache_cxx364 KerbLocateBindingCacheEntry() - Purging KDC cache entry Realm: CONTOSO.COM, Addr: 192.168.100.2, DcFlags e003f37c
137 [1] 0350.3B20::06/09/24-16:48:58.0675777 [KERBEROS] bndcache_cxx577 KerbCacheBinding() - Adding Binding Cache Entry - CONTOSO.COM : 192.168.100.2, DcFlags e003f37d CacheFlags 0
138 [1] 0350.3B20::06/09/24-16:48:58.0675791 [KERBEROS] bndcache_cxx594 KerbCacheBinding() - Caching as BDC
139 [1] 0350.3B20::06/09/24-16:48:58.0675873 [KERBEROS] kerbtick_cxx3402 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.100.2 for realm CONTOSO.COM, DesiredFlags 0, connection timeout: 0 secs
140 [1] 0350.3B20::06/09/24-16:48:58.0675891 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.100.2
141 [1] 0350.3B20::06/09/24-16:48:58.0708796 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.100.2
142 [0] 0350.3B20::06/09/24-16:48:58.0709781 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x19e0
143 [0] 0350.3B20::06/09/24-16:48:58.0725394 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x19e0
144 [0] 0350.3B20::06/09/24-16:48:58.0726022 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::UnpackKdcReplyBody - Start call to LsaIso
145 [0] 0350.3B20::06/09/24-16:48:58.0736490 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::UnpackKdcReplyBody - End call to LsaIso
146 [0] 0350.3B20::06/09/24-16:48:58.0736933 [KERBEROS] tktcache_cxx2477 KerbTgtRenewalReaper() - removing renew task for ticket cache entry 0000018AA8AD7380 (CredId = 0)
147 [0] 0350.3B20::06/09/24-16:48:58.0737026 [KERBEROS] tktcache_cxx2141 KerbScheduleTgtRenewal() - Ticket 0000018AA8E54540 will be renewed 35099 seconds from now
148 [0] 0350.3B20::06/09/24-16:48:58.0737198 [KERBEROS] kerbtick_cxx7008 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName ldap/dc2.contoso.com
149 [0] 0350.3B20::06/09/24-16:48:58.0737256 [KERBEROS] kerbtick_cxx5710 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM
150 [0] 0350.3B20::06/09/24-16:48:58.0737263 [KERBEROS] kerbtick_cxx3759 __KerbGetTgsTicket() - KerbGetTgsTicket Flags 0x2140020, Tgt DomainName CONTOSO.COM, Tgt TargetDomainName CONTOSO.COM, TgtReply 0000000000000000, EvidenceTicket 0000000000000000
151 [0] 0350.3B20::06/09/24-16:48:58.0737286 [KERBEROS] kerbtick_cxx3760 __KerbGetTgsTicket() - TargetName ldap/dc2.contoso.com
152 [0] 0350.3B20::06/09/24-16:48:58.0737416 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::BuildEncryptedAuthData - Start call to LsaIso
153 [0] 0350.3B20::06/09/24-16:48:58.0740974 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::BuildEncryptedAuthData - End call to LsaIso
154 [0] 0350.3B20::06/09/24-16:48:58.0741101 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::ComputeTgsChecksum - Start call to LsaIso
155 [0] 0350.3B20::06/09/24-16:48:58.0743066 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::ComputeTgsChecksum - End call to LsaIso
156 [0] 0350.3B20::06/09/24-16:48:58.0743115 [KERBEROS] kerbtick_cxx8330 KerbCreateApRequest() - Skewing system time. System time is 06/09/24-16:48:58.0666487
157 [0] 0350.3B20::06/09/24-16:48:58.0743118 [KERBEROS] kerbtick_cxx8331 KerbCreateApRequest() - Skewed time is 06/09/24-16:48:58.0666487
158 [0] 0350.3B20::06/09/24-16:48:58.0743148 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::CreateApReqAuthenticator - Start call to LsaIso
159 [0] 0350.3B20::06/09/24-16:48:58.0749402 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::CreateApReqAuthenticator - End call to LsaIso
160 [0] 0350.3B20::06/09/24-16:48:58.0749756 [KERBEROS] kerbtick_cxx3077 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
161 [0] 0350.3B20::06/09/24-16:48:58.0749873 [KERBEROS] kerbtick_cxx3402 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.100.2 for realm CONTOSO.COM, DesiredFlags 0, connection timeout: 0 secs
162 [0] 0350.3B20::06/09/24-16:48:58.0749882 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.100.2
163 [0] 0350.3B20::06/09/24-16:48:58.0756196 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.100.2
164 [0] 0350.3B20::06/09/24-16:48:58.0756640 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x19e0
165 [0] 0350.3B20::06/09/24-16:48:58.0772736 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x19e0
166 [0] 0350.3B20::06/09/24-16:48:58.0773341 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::UnpackKdcReplyBody - Start call to LsaIso
167 [0] 0350.3B20::06/09/24-16:48:58.0785149 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::UnpackKdcReplyBody - End call to LsaIso
168 [0] 0350.3B20::06/09/24-16:48:58.0785407 [KERBEROS] kerbtick_cxx7134 KerbGetServiceTicketInternal() - KerbGetReferralNames returns RealTargetRealm (null)
```
