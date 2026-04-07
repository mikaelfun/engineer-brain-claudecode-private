---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/Kerberos - How the AS request is evaluated at the KDC"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/Kerberos%20-%20How%20the%20AS%20request%20is%20evaluated%20at%20the%20KDC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053227&Instance=1053227&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053227&Instance=1053227&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This page is part of the DS Kerberos wiki, under "The Three-Phase Ticketing - Deep Dive" and describes how the Authentication Service (AS) request is evaluated at the domain controller.    
Full path: Workflow: Kerberos: Protocol Flow: The Three-Phase Ticketing - Deep Dive

[[_TOC_]]

---

# Author

Thanks to @<C47EE248-14D5-63AB-A86E-24B7519440A6> 

---

# Retrieving the user key
The Key Distribution Center (KDC) retrieves the user key (KC) from the Active Directory (AD) account database by performing a samAccountName lookup on the provided client name (Cname). Refer to [3.3.5.6.1 Client Principal Lookup](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/6435d3fb-8cf6-4df5-a156-1277690ed59c).

When the KDC receives a request from the Kerberos client on the user's workstation, it searches its database for the user, pulls up the account record, and takes the user key from a field in the record.

This process occurs only once when a user initially logs on. After accepting the user's password and deriving the user's long-term key (KC), the Kerberos client on the workstation requests a service ticket and Ticket Granting Service (TGS) session key that it can use in subsequent transactions with the KDC during this logon session.

---

# Verifying the user's identity
The KDC decrypts the pre-authentication data and evaluates the timestamp inside {C,n,t} (per PAData Type: PA-AS-REQ with timestamp or PA-PK-AS-REQ with certificate when using smart card (SC) logon). If the timestamp passes the test, the KDC can be assured that the pre-authentication data was encrypted with the user key and thus verify that the user is genuine.

After verifying the user's identity, the KDC creates credentials that the Kerberos client on the workstation can present to the ticket-granting service. For more information about how domain controllers create credentials in a Windows environment, see "[How Access Tokens Work](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc758849(v=ws.10))".

---

# ETL examples

## What to look for on server side

The important functions to look for:  
- **I_GetASTicket()** - Gets an authentication service ticket to the requested service.  
- **KdcNormalize()** - KDC searches for the ticket information in the database.  
- **KdcGetTicketInfo()** - Gets the information needed to build a ticket for a principal using the name of the principal.  
- **BuildTicketAS()** - Builds an AS ticket, including filling in the name fields and flag fields.  
- **KdcBuildTicketTimesAndFlags()** - Computes the times and flags for a new ticket.  

**Note**: The line "I_GetASTicket [Leaving] 0" indicates that the process ended with no issue. An error code would be present instead if the process failed.

### KDC.etl example

```plaintext
34 [0] 02CC.2CD4::06/09/24-16:16:22.5809938 [dll] getas_cxx4871 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/CONTOSO.COM
35 [0] 02CC.2CD4::06/09/24-16:16:22.5809963 [dll] getas_cxx4872 I_GetASTicket() - I_GetASTicket for client testuser
36 [0] 02CC.2CD4::06/09/24-16:16:22.5809981 [dll] tktutil_cxx1205 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0x233fefcf, ExtendedFields 0x2000001, PrincipalName 000001D46FF9E170, PrincipalRealm (null), RequestRealm CONTOSO.COM, TgtClientRealm (null), NameFlags 0x15, MappedAttr 0000000000000000
37 [0] 02CC.2CD4::06/09/24-16:16:22.5809999 [dll] tktutil_cxx1207 KdcNormalize() - PrincipalName testuser
38 [0] 02CC.2CD4::06/09/24-16:16:22.5810006 [dll] tktutil_cxx1273 KdcNormalize() - KdcNormalize checking sam for request realm CONTOSO.COM
39 [0] 02CC.2CD4::06/09/24-16:16:22.5810017 [dll] tktutil_cxx1765 KdcNormalize() - KdcNormalize checking name in SAM
40 [0] 02CC.2CD4::06/09/24-16:16:22.5810026 [dll] tktutil_cxx5481 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000001, GenericUserName testuser, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
41 [0] 02CC.2CD4::06/09/24-16:16:22.5810031 [dll] tktutil_cxx5483 KdcGetTicketInfo() - PrincipalName (empty)
42 [0] 02CC.2CD4::06/09/24-16:16:22.5813940 [dll] tktutil_cxx5899 KdcGetTicketInfo() - KdcGetTicketInfo getting user keys
43 [0] 02CC.2CD4::06/09/24-16:16:22.5814190 [dll] tktutil_cxx6004 KdcGetTicketInfo() - KdcGetTicketInfo enabling account for protocol transition via A2DF
44 [0] 02CC.2CD4::06/09/24-16:16:22.5814207 [dll] tktutil_cxx6150 KdcGetTicketInfo() - KdcGetTicketInfo [Leaving] 0
45 [0] 02CC.2CD4::06/09/24-16:16:22.5814214 [dll] tktutil_cxx2197 KdcNormalize() - KdcNormalize [Leaving] 0
46 [0] 02CC.2CD4::06/09/24-16:16:22.5814602 [dll] getas_cxx3468 KdcCheckPacRequestPreAuthData() - Setting BuildPac from pa-data to 1
47 [0] 02CC.2CD4::06/09/24-16:16:22.5814646 [dll] tktutil_cxx1205 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0, ExtendedFields 0, PrincipalName 000001D470D05FD0, PrincipalRealm (null), RequestRealm (null), TgtClientRealm (null), NameFlags 0x12, MappedAttr 0000000000000000
48 [0] 02CC.2CD4::06/09/24-16:16:22.5814676 [dll] tktutil_cxx1207 KdcNormalize() - PrincipalName krbtgt/CONTOSO.COM
49 [0] 02CC.2CD4::06/09/24-16:16:22.5814687 [dll] tktutil_cxx1923 KdcNormalize() - KdcNormalize checking name in SAM
50 [0] 02CC.2CD4::06/09/24-16:16:22.5814691 [dll] tktutil_cxx5481 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0, ExtendedFields 0, GenericUserName krbtgt, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
51 [0] 02CC.2CD4::06/09/24-16:16:22.5814696 [dll] tktutil_cxx5483 KdcGetTicketInfo() - PrincipalName (empty)
52 [0] 02CC.2CD4::06/09/24-16:16:22.5814702 [dll] tktutil_cxx5592 KdcGetTicketInfo() - KdcGetTicketInfo using cached ticket info for krbtgt account
53 [0] 02CC.2CD4::06/09/24-16:16:22.5814717 [dll] tktutil_cxx6150 KdcGetTicketInfo() - KdcGetTicketInfo [Leaving] 0
54 [0] 02CC.2CD4::06/09/24-16:16:22.5814720 [dll] tktutil_cxx2197 KdcNormalize() - KdcNormalize [Leaving] 0
55 [0] 02CC.2CD4::06/09/24-16:16:22.5814740 [dll] getas_cxx3827 BuildTicketAS() - Building an AS ticket to cname testuser for sname krbtgt
56 [0] 02CC.2CD4::06/09/24-16:16:22.5814746 [dll] tktutil_cxx2293 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags ClientPolicyFlags 0x87b, ServerPolicyFlags 0x87b, KdcOptions 0x40810010
57 [0] 02CC.2CD4::06/09/24-16:16:22.5814753 [dll] tktutil_cxx2425 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags SourceTicketFlags 0x50800000 by ClientPolicyFlags
58 [0] 02CC.2CD4::06/09/24-16:16:22.5814762 [dll] tktutil_cxx3003 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags Final Ticket Flags 0x40810000, times -
59 [0] 02CC.2CD4::06/09/24-16:16:22.5814765 [dll] tktutil_cxx3005 KdcBuildTicketTimesAndFlags() - RequestRenewTime = 09/13/00-05:48:05.0000000
60 [0] 02CC.2CD4::06/09/24-16:16:22.5814767 [dll] tktutil_cxx3006 KdcBuildTicketTimesAndFlags() - RequestEndTime = 09/13/00-05:48:05.0000000
61 [0] 02CC.2CD4::06/09/24-16:16:22.5814770 [dll] tktutil_cxx3007 KdcBuildTicketTimesAndFlags() - RequestStartTime = 01/01/01-03:00:00.0000000
62 [0] 02CC.2CD4::06/09/24-16:16:22.5814772 [dll] tktutil_cxx3008 KdcBuildTicketTimesAndFlags() - FinalRenewTime = 06/16/24-16:16:22.5668081
63 [0] 02CC.2CD4::06/09/24-16:16:22.5814775 [dll] tktutil_cxx3009 KdcBuildTicketTimesAndFlags() - FinalEndTime = 06/10/24-02:16:22.5668081
64 [0] 02CC.2CD4::06/09/24-16:16:22.5814777 [dll] tktutil_cxx3010 KdcBuildTicketTimesAndFlags() - FinalStartTime = 06/09/24-16:16:22.5668081
65 [0] 02CC.2CD4::06/09/24-16:16:22.5814779 [dll] tktutil_cxx3011 KdcBuildTicketTimesAndFlags() - SourceRenewTime = FileTimeToSystemTime error 0x57
66 [0] 02CC.2CD4::06/09/24-16:16:22.5814782 [dll] tktutil_cxx3012 KdcBuildTicketTimesAndFlags() - SourceEndTime = FileTimeToSystemTime error 0x57
67 [0] 02CC.2CD4::06/09/24-16:16:22.5814784 [dll] tktutil_cxx3013 KdcBuildTicketTimesAndFlags() - SourceStartTime = 06/09/24-16:16:22.5668081
68 [0] 02CC.2CD4::06/09/24-16:16:22.5814829 [dll] getas_cxx6571 I_GetASTicket() - I_GetASTicket KLIN(40319ab) build Pac
69 [0] 02CC.2CD4::06/09/24-16:16:22.5814865 [dll] tktutil_cxx7293 GetPacAndSuppCred() - GetPacAndSuppCred User testuser, FullName testuser, Upn testuser@Contoso.com, UserId 0x45c, UserAccountControl 0x210, ExtendedFields 0x2000059, WhichFields 0x273fefcf, Flags 0x18
70 [0] 02CC.2CD4::06/09/24-16:16:22.5814889 [dll] tktutil_cxx7215 KdcIsOurDomain() - 000001D470DE8E20
71 [0] 02CC.2CD4::06/09/24-16:16:22.5814892 [dll] tktutil_cxx7216 KdcIsOurDomain() - 000001D470DE8E38 add subauthority 4
72 [0] 02CC.2CD4::06/09/24-16:16:22.5814895 [dll] tktutil_cxx7219 KdcIsOurDomain() - Rid 201
73 [0] 02CC.2CD4::06/09/24-16:16:22.5814898 [dll] tktutil_cxx7481 GetPacAndSuppCred() - Adding 513 from 000001D470DE8E20
74 [0] 02CC.2CD4::06/09/24-16:16:22.5815443 [CommonIumSafe] tickets_cxx1253 KerbPackTicketEx() - KerbPackTicket: Using KeyVersion 0x2 and Algorithm 18 to encrypt ticket
75 [0] 02CC.2CD4::06/09/24-16:16:22.5815541 [dll] getas_cxx6770 I_GetASTicket() - I_GetASTicket: KerbPackTicket ServiceKeyVersion 0x2, KerbErr 0
76 [0] 02CC.2CD4::06/09/24-16:16:22.5815674 [CommonIumSafe] tickets_cxx1846 I_GetASTicket() - KerbPackKdcReplyBody: KeyVersion 0xc Algorithm 18 KerbErr 0x0
77 [0] 02CC.2CD4::06/09/24-16:16:22.5815737 [dll] getas_cxx7097 I_GetASTicket() - I_GetASTicket calling SuccessfulLogon
78 [0] 02CC.2CD4::06/09/24-16:16:22.5817330 [dll] getas_cxx1538 SuccessfulLogon() - KLIN(4030602) SamIUpdate Successfullogon StatsApply 0x5000000.
79 [0] 02CC.2CD4::06/09/24-16:16:22.5817544 [dll] getas_cxx7315 I_GetASTicket() - I_GetASTicket [Leaving] 0
```

## What to look for on client side
The important functions to look for:   
- **KerbProcessTargetNames()** - Takes the target names from both the negotiate hint and those supplied by the caller and creates the real Kerberos target name.  
- **KerbGetTicketGrantingTicket()** and **KerbGetAuthenticationTicketEx()** - Gets a Ticket Granting Ticket (TGT) for a set of credentials.  
- **KerbFindCommonPaEtype()** - Finds an encryption type common between the KDC and the client.  
- **KerbMakeSocketCallEx()** and **KerbCallKdcEx()** - Can be used to check which KDC is used.  

### Kerberos.etl

```plaintext
 17 [1] 0350.39E4::06/09/24-16:16:22.5313994 [KERBEROS] ctxtapi_cxx560 KerbProcessTargetNames() - Parsed name testuser ((null)) into:     name type 0x1, name count 1,      realm (null),      first part testuser
 18 [1] 0350.39E4::06/09/24-16:16:22.5314000 [KERBEROS] ctxtapi_cxx726 KerbProcessTargetNames() - Cracked name testuser
 19 [1] 0350.39E4::06/09/24-16:16:22.5314023 [KERBEROS] ctxtapi_cxx727 KerbProcessTargetNames() - into testuser
 20 [1] 0350.39E4::06/09/24-16:16:22.5314029 [KERBEROS] logonapi_cxx6365 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm CONTOSO.COM
 21 [1] 0350.39E4::06/09/24-16:16:22.5314061 [KERBEROS] logonapi_cxx2160 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client testuser
 22 [1] 0350.39E4::06/09/24-16:16:22.5314063 [KERBEROS] logonapi_cxx2161 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm CONTOSO.COM
 23 [1] 0350.39E4::06/09/24-16:16:22.5314090 [KERBEROS] logonapi_cxx2162 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/CONTOSO.COM
 24 [1] 0350.39E4::06/09/24-16:16:22.5314117 [KERBEROS] logonapi_cxx2376 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicketEx using default credentials CONTOSO.COM\testuser
 25 [1] 0350.39E4::06/09/24-16:16:22.5314134 [KERBEROS] logonapi_cxx2378 KerbGetAuthenticationTicketEx() - to service krbtgt/CONTOSO.COM
 26 [1] 0350.39E4::06/09/24-16:16:22.5314139 [KERBEROS] logonapi_cxx2465 KerbGetAuthenticationTicketEx() - AllowFast: 0
 27 [1] 0350.39E4::06/09/24-16:16:22.5314206 [KERBEROS] logonapi_cxx730 KerbBuildPreAuthData() - Skewing system time. System time is 06/09/24-16:16:22.5194625
 28 [1] 0350.39E4::06/09/24-16:16:22.5314209 [KERBEROS] logonapi_cxx731 KerbBuildPreAuthData() - Skewed time is 06/09/24-16:16:22.5194625
 29 [1] 0350.39E4::06/09/24-16:16:22.5314231 [KERBEROS] logonapi_cxx468 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of testuser@CONTOSO.COM
 32 [1] 0350.39E4::06/09/24-16:16:22.5428231 [KERBEROS] logonapi_cxx3224 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000000000000000
 33 [1] 0350.39E4::06/09/24-16:16:22.5428343 [KERBEROS] logonapi_cxx3283 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
 34 [1] 0350.39E4::06/09/24-16:16:22.5428357 [KERBEROS] kerbtick_cxx3077 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
 35 [1] 0350.39E4::06/09/24-16:16:22.5428485 [KERBEROS] kerbtick_cxx3402 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.100.2 for realm CONTOSO.COM, DesiredFlags 0, connection timeout: 0 secs
 36 [1] 0350.39E4::06/09/24-16:16:22.5428496 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.100.2
 37 [1] 0350.39E4::06/09/24-16:16:22.5435210 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.100.2
 38 [0] 0350.39E4::06/09/24-16:16:22.5435947 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x2544
 39 [1] 0350.39E4::06/09/24-16:16:22.5449057 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x2544
 40 [1] 0350.39E4::06/09/24-16:16:22.5449459 [KERBEROS] logonapi_cxx3340 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
 41 [1] 0350.39E4::06/09/24-16:16:22.5449532 [CommonIumSafe] tickets_cxx2794 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
 42 [1] 0350.39E4::06/09/24-16:16:22.5449539 [KERBEROS] logonapi_cxx3467 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
 43 [1] 0350.39E4::06/09/24-16:16:22.5449665 [CommonIumSafe] tickets_cxx2794 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
 44 [1] 0350.39E4::06/09/24-16:16:22.5449669 [CommonIumSafe] utils_cxx118 KerbUnpackErrorData() - KerbUnpackData failed to unpack typed data, trying error method data
 45 [1] 0350.39E4::06/09/24-16:16:22.5449679 [CommonIumSafe] tickets_cxx2794 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
 46 [1] 0350.39E4::06/09/24-16:16:22.5449690 [KERBEROS] logonapi_cxx3629 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x19, extendedStatus 0
 47 [0] 0350.39E4::06/09/24-16:16:22.5529401 [KERBEROS] logonapi_cxx730 KerbBuildPreAuthData() - Skewing system time. System time is 06/09/24-16:16:22.5507899
 48 [0] 0350.39E4::06/09/24-16:16:22.5529406 [KERBEROS] logonapi_cxx731 KerbBuildPreAuthData() - Skewed time is 06/09/24-16:16:22.5507899
 49 [0] 0350.39E4::06/09/24-16:16:22.5529484 [KERBEROS] logonapi_cxx468 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of testuser@CONTOSO.COM
 52 [0] 0350.39E4::06/09/24-16:16:22.5540899 [KERBEROS] logonapi_cxx3224 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 18, length 171, PrimaryCredentials->PublicKeyCreds 0000000000000000
 53 [0] 0350.39E4::06/09/24-16:16:22.5541004 [KERBEROS] logonapi_cxx3283 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
 54 [0] 0350.39E4::06/09/24-16:16:22.5541044 [KERBEROS] kerbtick_cxx3077 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
 55 [0] 0350.39E4::06/09/24-16:16:22.5541175 [KERBEROS] kerbtick_cxx3402 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.100.2 for realm CONTOSO.COM, DesiredFlags 0, connection timeout: 0 secs
 56 [0] 0350.39E4::06/09/24-16:16:22.5541184 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.100.2
 57 [1] 0350.39E4::06/09/24-16:16:22.5552326 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.100.2
 58 [1] 0350.39E4::06/09/24-16:16:22.5552732 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x2544
 59 [1] 0350.39E4::06/09/24-16:16:22.5566097 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x2544
 60 [1] 0350.39E4::06/09/24-16:16:22.5566565 [KERBEROS] logonapi_cxx3340 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
 61 [1] 0350.39E4::06/09/24-16:16:22.5566777 [KERBEROS] timesync_cxx184 KerbUpdateSkewTime() - Updating skew statistics: Skewed = 0, successful = 10, latest = Success
 64 [1] 0350.39E4::06/09/24-16:16:22.5601694 [KERBEROS] logonapi_cxx4751 KerbGetAuthenticationTicketEx() - Updating primary credentials user/realm names from AS_REP
 65 [1] 0350.39E4::06/09/24-16:16:22.5601745 [KERBEROS] logonses_cxx4001 KerbCleanupLogonSessionCredentials() - KerbCleanupLogonSessionCredentials: clean up credentials from logon session 0:3caf876, flags 0x400000
 66 [1] 0350.39E4::06/09/24-16:16:22.5601914 [KERBEROS] tktcache_cxx2141 KerbScheduleTgtRenewal() - Ticket 0000018AA8AD7380 will be renewed 35099 seconds from now
