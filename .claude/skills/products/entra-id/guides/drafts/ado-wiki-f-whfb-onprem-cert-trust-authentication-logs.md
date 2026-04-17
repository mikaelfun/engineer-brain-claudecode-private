---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/On-Premises Certificate Trust/Authentication"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20at%20logs%2FOn-Premises%20Certificate%20Trust%2FAuthentication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430181&Instance=430181&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430181&Instance=430181&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a detailed step-by-step guide to troubleshooting Windows Hello for Business (WHfB) authentication issues using various log files. It expains how to analyze logs from different sources like `credprovauthUI.etl`, `lsa.etl`, `kerberos.etl`, and `kdc.etl` to identify and resolve authentication problems.

[[_TOC_]]

<SPAN style="color:red">_**All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments.**_</SPAN>

Helpful logs:   
- lsa.etl
- kerberos.etl
- credprovauthUI.etl
- KDC.etl

These .etl files share the same TID.PID.

You can start searching KerbILogonUserEx3 for the impacted user in kerberos.etl and then filter on all .etl using the TID.PID.

---

# Step A

_Authentication begins when the user dismisses the lock screen, which triggers Winlogon to show the Windows Hello for Business credential provider._

You can see in credprovauthUI.etl the Pin provider invoked:

```
[Microsoft.OSG.OSS.CredProvFramework] [GetSerializationStart]
[Microsoft.OSG.OSS.CredProvFramework] [CGetSerializationJob::Do] EventLevel=Information, Invoke=ICredentialProviderCredential::GetSerialization, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, CredentialId=15, CredentialProviderGetSerializationResponse=0x2, ResultCode=The operation completed successfully. (0x00000000)
2219 [0]19E8.1A98::08/03/20-17:00:01.1440188 [Microsoft.Windows.CredProvDataModel] [SignedInCredProv] credProviderGuid={D6886603-9D2F-4EB2-B667-1971041FA96B}, userType=2, logonUiReason=0, credProvScenario=0, ntsStatus=0, ntsSubstatus=0, PartA_UserSid=S-1-5-21-2426993522-1213947244-2524399092-1108, PartA_PrivTags=50331648
2522 [0]19E8.1B14::08/03/20-17:00:01.2564655 [Microsoft.OSG.OSS.CredProvFramework] [ReportResultStop] OptionalStatusText=The operation completed successfully., ProviderStatusIcon=3, Status=0, SubStatus=0, ProviderId={d6886603-9d2f-4eb2-b667-1971041fa96b}, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={d6886603-9d2f-4eb2-b667-1971041fa96b}, UserTag=3, SessionId=3, IsRemoteSession=0, ProcessImage=LogonUI.exe
5392 [0]2708.276C::08/03/20-17:01:08.4597109 [Microsoft.OSG.OSS.CredProvFramework] [_CreateEnumeratedCredentialDataForProvider] EventLevel=Information, Invoke=ICredentialProvider::GetCredentialCount, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, NumOfCredentials=2, DefaultIndex=4294967295, IsAutoLogon=false, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=20
5393 [0]2708.276C::08/03/20-17:01:08.4597140 [Microsoft.OSG.OSS.CredProvFramework] [_CreateAndAddCredentialDataAtIndexToProvider] EventLevel=Information, Invoke=ICredentialProvider::GetCredentialAt, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, CredentialIndex=0, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=0
5394 [0]2708.276C::08/03/20-17:01:08.4597178 [Microsoft.OSG.OSS.CredProvFramework] [_CreateAndAddCredentialDataAtIndexToProvider] EventLevel=Information, Invoke=pProviderData->AddCredentialData, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, CredentialIndex=0, CredentialId=16, ResultCode=The operation completed successfully. (0x00000000)
5397 [0]2708.276C::08/03/20-17:01:08.4597261 [Microsoft.OSG.OSS.CredProvFramework] [_CreateEnumeratedCredentialDataForProvider] EventLevel=Information, Invoke=_CreateAndAddCredentialDataAtIndexToProvider, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, DefaultIndex=4294967295, IsAutoLogon=false, ResultCode=The operation completed successfully. (0x00000000)
5932 [0]2708.276C::08/03/20-17:01:17.4893954 [Microsoft.OSG.OSS.CredProvFramework] [CAdviseCredProvsJob::Do] EventLevel=Information, Invoke=ICredentialProvider::UnAdvise, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, ResultCode=The operation completed successfully. (0x00000000)
```

_The user provides their Windows Hello gesture (PIN or biometrics). The credential provider packages these credentials and returns them to Winlogon. Winlogon passes the collected credentials to Lsass. Lsass passes the collected credentials to the Kerberos._

## Lsa.etl

```
1340 [0]0284.06DC::08/03/20-17:00:00.9090806 [lsasrv] sspiex_cxx2458 SspiExLogonUser() - Dispatch logon: origin=Winlogon, pid=0000000000000220, package=0, type=2, flags=0x80, logonid=0:0
1342 [0]0284.06DC::08/03/20-17:00:00.9091196 [lsasrv] surrogatelogon_cxx59 LsapCallAuthPackagesForPreLogonSurrogate() - Pre-Logon surrogate for 0x00000000:0x00598F8D
1343 [0]0284.06DC::08/03/20-17:00:00.9214919 [lsasrv] surrogatelogon_cxx84 LsapCallAuthPackagesForPreLogonSurrogate() - Pre-Logon surrogate call to CloudAP returned 0x8009030E (0x00000000)
1344 [0]0284.06DC::08/03/20-17:00:00.9214976 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStart]
1351 [0]0284.06DC::08/03/20-17:00:00.9789533 [lsasrv] sphelp_cxx750 LsapCopyToClient() - [220] LsapCopyToClient(00000096DD5FCA38, 000001D0ACAF0000, 1731) = 0
1352 [0]0284.06DC::08/03/20-17:00:00.9789635 [lsasrv] logons_cxx598 LsapCreateLsaLogonSession() - Creating logon session 0:598f96
1353 [0]0284.06DC::08/03/20-17:00:00.9790467 [lsasrv] neglsa_cxx3988 NegLogonUserEx3Worker() - NegLogonUserEx3 interactive logon is cached, checking policy...
1354 [0]0284.06DC::08/03/20-17:00:00.9790532 [lsasrv] sphelp_cxx917 LsapCopyFromClient() - [220] LsapCopyFromClient(000001D0ACAF0000, 0000024F19A63740, 1731) = 0
1355 [0]0284.06DC::08/03/20-17:00:00.9872441 [lsasrv] sphelp_cxx750 LsapCopyToClient() - [220] LsapCopyToClient(0000024F19A637D8, 000001D0ACAF0098, 4) = 0
1356 [0]0284.06DC::08/03/20-17:00:00.9873251 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStop] logonType=2, isStandaloneManagedServiceAccount=0, status=0, apiSubStatus=0
1366 [0]0284.06DC::08/03/20-17:00:00.9877495 [lsalib] aulogon_c2593 LsapAuApiDispatchLogonUser() - Updating logon session 0:598f96 for logon type 2
1367 [0]0284.06DC::08/03/20-17:00:00.9877515 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package Negotiate with 0:598f96 = WHFBOPCT1
1368 [0]0284.06DC::08/03/20-17:00:00.9877524 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package Kerberos with 0:598f96 = WHFBOPCT1
1369 [0]0284.06DC::08/03/20-17:00:00.9877557 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package NTLM with 0:598f96 = WHFBOPCT1
1373 [0]0284.06DC::08/03/20-17:00:01.0117527 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package TSSSP with 0:598f96 = WHFBOPCT1
1374 [0]0284.06DC::08/03/20-17:00:01.0117558 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package CloudAP with 0:598f96 = WHFBOPCT1
1375 [0]0284.06DC::08/03/20-17:00:01.1039951 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package WDigest with 0:598f96 = WHFBOPCT1
5 [0]0284.187C::08/03/20-17:00:01.1050882 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStart]
```

---

# Step B

_The Kerberos provider gets domain hints from the domain-joined workstation to locate a domain controller for the user._

The Kerberos provider sends the signed pre-authentication data and user's certificate, which includes the public key, to the Key Distribution Center (KDC) service running on the domain controller in the form of a KERB_AS_REQ.

## Kerberos.etl

```
95 [0]0284.187C::08/03/20-17:00:01.1051186 [KERBEROS] logonses_cxx1941 KerbCreateLogonSession() - KerbCreateLogonSession creating logon session for 0:0x59920d
96 [0]0284.187C::08/03/20-17:00:01.1062676 [KERBEROS] logonses_cxx453 KerbCreateLogonSession() - INSERT logonsess 0000024F1968FA40 for 0:0x59920d
97 [0]0284.187C::08/03/20-17:00:01.1062681 [KERBEROS] logonses_cxx2057 KerbCreateLogonSession() - KerbCreateLogonSession: created logon session 0000024F1968FA40 for LUID 0:59920d
98 [0]0284.187C::08/03/20-17:00:01.1129622 [KERBEROS] logonapi_cxx9444 KerbILogonUserEx3() - LsaApLogonUserEx3: attempting to logon user ADFOREST4\WHFBOPCT1
99 [0]0284.187C::08/03/20-17:00:01.1129848 [KERBEROS] ctxtapi_cxx558 KerbProcessTargetNames() - Parsed name WHFBOPCT1 ((null)) into: name type 0x1, name count 1, realm (null), first part WHFBOPCT1
100 [0]0284.187C::08/03/20-17:00:01.1129861 [KERBEROS] ctxtapi_cxx724 KerbProcessTargetNames() - Cracked name WHFBOPCT1
101 [0]0284.187C::08/03/20-17:00:01.1129890 [KERBEROS] ctxtapi_cxx725 KerbProcessTargetNames() - into WHFBOPCT1
102 [0]0284.187C::08/03/20-17:00:01.1129897 [KERBEROS] logonapi_cxx5986 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm ADFOREST4
103 [0]0284.187C::08/03/20-17:00:01.1130328 [KERBEROS] logonapi_cxx2193 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client WHFBOPCT1
104 [0]0284.187C::08/03/20-17:00:01.1130339 [KERBEROS] logonapi_cxx2194 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm ADFOREST4
105 [0]0284.187C::08/03/20-17:00:01.1130373 [KERBEROS] logonapi_cxx2195 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/ADFOREST4
106 [0]0284.187C::08/03/20-17:00:01.1130395 [KERBEROS] logonapi_cxx2400 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicketEx using default credentials ADFOREST4\WHFBOPCT1
107 [0]0284.187C::08/03/20-17:00:01.1130415 [KERBEROS] logonapi_cxx2402 KerbGetAuthenticationTicketEx() - to service krbtgt/ADFOREST4
108 [0]0284.187C::08/03/20-17:00:01.1130502 [KERBEROS] logonapi_cxx722 KerbBuildPreAuthData() - Skewing system time. System time is 08/03/20-17:00:01.1025602
109 [0]0284.187C::08/03/20-17:00:01.1130505 [KERBEROS] logonapi_cxx723 KerbBuildPreAuthData() - Skewed time is 08/03/20-17:00:01.1025602
110 [0]0284.187C::08/03/20-17:00:01.1130607 [KERBEROS] logonapi_cxx3238 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000024F19B03850 **<-- this is the public keys, if = 0, no certificate has been used.**
111 [0]0284.187C::08/03/20-17:00:01.1130682 [KERBEROS] logonapi_cxx3297 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
112 [0]0284.187C::08/03/20-17:00:01.1130691 [KERBEROS] kerbtick_cxx3026 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
113 [0]0284.187C::08/03/20-17:00:01.1130796 [KERBEROS] kerbtick_cxx3351 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.2.21 for realm ADFOREST4, DesiredFlags 0, connection timeout: 0 secs
114 [0]0284.187C::08/03/20-17:00:01.1130805 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.x.xx
115 [0]0284.187C::08/03/20-17:00:01.1138770 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.21
116 [0]0284.187C::08/03/20-17:00:01.1138965 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x180c
117 [0]0284.187C::08/03/20-17:00:01.1144821 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x180c
118 [0]0284.187C::08/03/20-17:00:01.1145098 [KERBEROS] logonapi_cxx3354 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
118 [0] 0284.187C::08/03/20-17:00:01.1145098 [KERBEROS] logonapi_cxx3354 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
119 [0] 0284.187C::08/03/20-17:00:01.1145135 [CommonIumSafe] tickets_cxx2702 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
120 [0] 0284.187C::08/03/20-17:00:01.1145138 [KERBEROS] logonapi_cxx3465 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
121 [0] 0284.187C::08/03/20-17:00:01.1145217 [CommonIumSafe] tickets_cxx2702 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
122 [0] 0284.187C::08/03/20-17:00:01.1145225 [CommonIumSafe] utils_cxx118 KerbUnpackErrorData() - KerbUnpackData failed to unpack typed data, trying error method data
123 [0] 0284.187C::08/03/20-17:00:01.1145231 [CommonIumSafe] tickets_cxx2702 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
124 [0] 0284.187C::08/03/20-17:00:01.1145234 [KERBEROS] logonapi_cxx3613 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x19, extendedStatus 0 <------this is not an error but pre-auth request from KDC
125 [0] 0284.187C::08/03/20-17:00:01.2301358 [KERBEROS] logonapi_cxx1234 KerbGetPreAuthDataForRealm() - KerbGetPreAuthDataForRealm: KDC offered no freshness token which we asked for. Update realm cache.
126 [0] 0284.187C::08/03/20-17:00:01.2302100 [KERBEROS] logonapi_cxx1267 KerbGetPreAuthDataForRealm() - KerbGetPreAuthDataForRealm: Swapping client preferred preauth 16 with KDC preference 19
127 [0] 0284.187C::08/03/20-17:00:01.2302114 [KERBEROS] logonapi_cxx722 KerbBuildPreAuthData() - Skewing system time. System time is 08/03/20-17:00:01.2275455
128 [0] 0284.187C::08/03/20-17:00:01.2302116 [KERBEROS] logonapi_cxx723 KerbBuildPreAuthData() - Skewed time is 08/03/20-17:00:01.2275455
132 [0] 0284.187C::08/03/20-17:00:01.3100446 [KERBEROS] pkauth_cxx3400 KerbBuildPkinitPreauthData() - KerbBuildPkinitPreauthData requesting OCSP responses
133 [0] 0284.187C::08/03/20-17:00:01.3100577 [KERBEROS] logonapi_cxx3238 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000024F19B03850
134 [0] 0284.187C::08/03/20-17:00:01.3100750 [KERBEROS] logonapi_cxx3297 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
135 [0] 0284.187C::08/03/20-17:00:01.3100813 [KERBEROS] kerbtick_cxx3026 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
136 [0] 0284.187C::08/03/20-17:00:01.3101020 [KERBEROS] kerbtick_cxx3351 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.2.21 for realm ADFOREST4, DesiredFlags 0, connection timeout: 0 secs
137 [0] 0284.187C::08/03/20-17:00:01.3101038 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.2.21
138 [0] 0284.187C::08/03/20-17:00:01.3111409 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.21
139 [0] 0284.187C::08/03/20-17:00:01.3111889 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x17e4
140 [0] 0284.187C::08/03/20-17:00:01.3180000 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x17e4
141 [0] 0284.187C::08/03/20-17:00:01.3180390 [KERBEROS] logonapi_cxx3354 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
```

_The domain controller determines the certificate is not self-signed certificate. The domain controller ensures the certificate chains to trusted root certificate, is within its validity period, can be used for authentication, and has not been revoked. It retrieves the public key and UPN from the certificate included in the KERB_AS_REQ and searches for the UPN in Active Directory. It validates the signed pre-authentication data using the public key from the certificate. On success, the KDC returns a TGT to the client with its certificate in a KERB_AS_REP_

## KDC.etl

Now those extracts are coming from a KDC :


```
62 [0] 027C.07EC::10/06/20-16:41:33.7545287 [dll] getas_cxx4780 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/ADFOREST4 63 [0] 027C.07EC::10/06/20-16:41:33.7545297 [dll] getas_cxx4781 I_GetASTicket() - I_GetASTicket for client WHFBOPCT1
67 [0] 027C.07EC::10/06/20-16:41:33.7545333 [dll] tktutil_cxx1759 KdcNormalize() - KdcNormalize checking name in SAM
68 [0] 027C.07EC::10/06/20-16:41:33.7545338 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000001, GenericUserName WHFBOPCT1, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
73 [0] 027C.07EC::10/06/20-16:41:33.7547980 [dll] getas_cxx3473 KdcCheckPreAuthData() - Setting BuildPac from pa-data to 0
86 [0] 027C.07EC::10/06/20-16:41:33.7852005 [dll] sockutil_cxx574 KdcAtqIoCompletion() - KdcAtqIoCompletion: first completion, increasing timeout for KdcContext 000002827F793220 to KdcExistingConnectionTimeout 0x32
87 [0] 027C.07EC::10/06/20-16:41:33.7852587 [dll] getas_cxx4780 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/ADFOREST4
88 [0] 027C.07EC::10/06/20-16:41:33.7852624 [dll] getas_cxx4781 I_GetASTicket() - I_GetASTicket for client WHFBOPCT1
90 [0] 027C.07EC::10/06/20-16:41:33.7852700 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName WHFBOPCT1
92 [0] 027C.07EC::10/06/20-16:41:33.7852731 [dll] tktutil_cxx1759 KdcNormalize() - KdcNormalize checking name in SAM
93 [0] 027C.07EC::10/06/20-16:41:33.7852746 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000081, GenericUserName WHFBOPCT1, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x4
95 [0] 027C.07EC::10/06/20-16:41:33.7852765 [dll] tktutil_cxx5473 KdcGetTicketInfo() - check if account WHFBOPCT1 is local with local secrets
96 [0] 027C.07EC::10/06/20-16:41:33.7857623 [dll] tktutil_cxx5842 KdcGetTicketInfo() - KdcGetTicketInfo getting user keys
99 [0] 027C.07EC::10/06/20-16:41:33.7861894 [dll] pkserv_cxx1183 KdcVerifyClientCertName() - UPN from certificate is WHFBOPCT1@jobesanc.mit.litware.com
100 [0] 027C.07EC::10/06/20-16:41:33.7861934 [dll] tktutil_cxx1199 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0, ExtendedFields 0, PrincipalName 000002827F648FC0, PrincipalRealm (null), RequestRealm (null), TgtClientRealm (null), NameFlags 0x215, MappedAttr 0000000000000000
102 [0] 027C.07EC::10/06/20-16:41:33.7862002 [dll] tktutil_cxx1875 KdcNormalize() - KdcNormalize checking name in SAM
103 [0] 027C.07EC::10/06/20-16:41:33.7862011 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0, ExtendedFields 0, GenericUserName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA, LookupFlags 0x20000, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2
108 [0] 027C.07EC::10/06/20-16:41:33.7871074 [dll] pkserv_cxx1249 KdcVerifyClientCertName() - KdcVerifyClientCertName found clientName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA
109 [0] 027C.07EC::10/06/20-16:41:33.7871084 [dll] pkserv_cxx1251 KdcVerifyClientCertName() - KdcVerifyClientCertName mapped account to key trust is WHFBOPCT1, flags 0x86
110 [0] 027C.07EC::10/06/20-16:41:33.7911103 [dll] getas_cxx5480 I_GetASTicket() - KLIN(4031568) normalize account WHFBOPCT1 in the second pass
111 [0] 027C.07EC::10/06/20-16:41:33.7911173 [dll] tktutil_cxx1199 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0x233fefcf, ExtendedFields 0x2000081, PrincipalName 000002827F649350, PrincipalRealm (null), RequestRealm ADFOREST4, TgtClientRealm (null), NameFlags 0x215, MappedAttr 0000000000000000 112 [0] 027C.07EC::10/06/20-16:41:33.7911186 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA
113 [0] 027C.07EC::10/06/20-16:41:33.7911191 [dll] tktutil_cxx1875 KdcNormalize() - KdcNormalize checking name in SAM
114 [0] 027C.07EC::10/06/20-16:41:33.7911442 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000081, GenericUserName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA, LookupFlags 0x20000, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
121 [0] 027C.07EC::10/06/20-16:41:33.7922399 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName krbtgt/ADFOREST4
122 [0] 027C.07EC::10/06/20-16:41:33.7922405 [dll] tktutil_cxx1875 KdcNormalize() - KdcNormalize checking name in SAM
123 [0] 027C.07EC::10/06/20-16:41:33.7922408 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0, ExtendedFields 0, GenericUserName krbtgt, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
125 [0] 027C.07EC::10/06/20-16:41:33.7922414 [dll] tktutil_cxx5540 KdcGetTicketInfo() - KdcGetTicketInfo using cached ticket info for krbtgt account
128 [0] 027C.07EC::10/06/20-16:41:33.7922473 [dll] getas_cxx3846 BuildTicketAS() - Building an AS ticket to cname WHFBOPCT1 for sname krbtgt
129 [0] 027C.07EC::10/06/20-16:41:33.7922488 [dll] tktutil_cxx2246 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags ClientPolicyFlags 0x7b, ServerPolicyFlags 0x7b, KdcOptions 0x40810010
130 [0] 027C.07EC::10/06/20-16:41:33.7922492 [dll] tktutil_cxx2378 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags SourceTicketFlags 0x50800000 by ClientPolicyFlags
131 [0] 027C.07EC::10/06/20-16:41:33.7922498 [dll] tktutil_cxx2953 KdcBuildTicketTimesAndFlags() - KdcBuildTicketTimesAndFlags Final Ticket Flags 0x40810000, times -
132 [0] 027C.07EC::10/06/20-16:41:33.7922499 [dll] tktutil_cxx2955 KdcBuildTicketTimesAndFlags() - RequestRenewTime = 09/13/37-04:48:05.0000000
133 [0] 027C.07EC::10/06/20-16:41:33.7922501 [dll] tktutil_cxx2956 KdcBuildTicketTimesAndFlags() - RequestEndTime = 09/13/37-04:48:05.0000000
134 [0] 027C.07EC::10/06/20-16:41:33.7922502 [dll] tktutil_cxx2957 KdcBuildTicketTimesAndFlags() - RequestStartTime = 01/01/01-02:00:00.0000000
135 [0] 027C.07EC::10/06/20-16:41:33.7922504 [dll] tktutil_cxx2958 KdcBuildTicketTimesAndFlags() - FinalRenewTime = 10/13/20-16:41:33.7904654
136 [0] 027C.07EC::10/06/20-16:41:33.7922506 [dll] tktutil_cxx2959 KdcBuildTicketTimesAndFlags() - FinalEndTime = 10/07/20-02:41:33.7904654
137 [0] 027C.07EC::10/06/20-16:41:33.7922507 [dll] tktutil_cxx2960 KdcBuildTicketTimesAndFlags() - FinalStartTime = 10/06/20-16:41:33.7904654
138 [0] 027C.07EC::10/06/20-16:41:33.7922509 [dll] tktutil_cxx2961 KdcBuildTicketTimesAndFlags() - SourceRenewTime = FileTimeToSystemTime error 0x 57
139 [0] 027C.07EC::10/06/20-16:41:33.7922510 [dll] tktutil_cxx2962 KdcBuildTicketTimesAndFlags() - SourceEndTime = FileTimeToSystemTime error 0x 57
140 [0] 027C.07EC::10/06/20-16:41:33.7922512 [dll] tktutil_cxx2963 KdcBuildTicketTimesAndFlags() - SourceStartTime = 10/06/20-16:41:33.7904654
141 [0] 027C.07EC::10/06/20-16:41:33.7922532 [dll] getas_cxx6395 I_GetASTicket() - I_GetASTicket KLIN(40318fb) build Pac
142 [0] 027C.07EC::10/06/20-16:41:33.7922546 [dll] tktutil_cxx6941 GetPacAndSuppCred() - GetPacAndSuppCred User WHFBOPCT1, FullName WHFBOPCT1, Upn WHFBOPCT1@jobesanc.mit.litware.com, UserId 0x454, UserAccountControl 0x10, ExtendedFields 0x2000059, WhichFields 0x273fefcf, Flags 0
143 [0] 027C.07EC::10/06/20-16:41:33.7922703 [dll] tktutil_cxx6859 GetPacAndSuppCred() - 000002827F7EC630
144 [0] 027C.07EC::10/06/20-16:41:33.7922705 [dll] tktutil_cxx6860 GetPacAndSuppCred() - 000002827F7EC648 add subauthority 4
145 [0] 027C.07EC::10/06/20-16:41:33.7922707 [dll] tktutil_cxx6863 GetPacAndSuppCred() - Rid 201
146 [0] 027C.07EC::10/06/20-16:41:33.7922709 [dll] tktutil_cxx7078 GetPacAndSuppCred() - Adding 513 from 000002827F7EC630
147 [0] 027C.07EC::10/06/20-16:41:33.7922711 [dll] tktutil_cxx6859 GetPacAndSuppCred() - 000002827F7ECDB0
148 [0] 027C.07EC::10/06/20-16:41:33.7922712 [dll] tktutil_cxx6860 GetPacAndSuppCred() - 000002827F7ECDC8 add subauthority 4
149 [0] 027C.07EC::10/06/20-16:41:33.7922714 [dll] tktutil_cxx6863 GetPacAndSuppCred() - Rid 452
150 [0] 027C.07EC::10/06/20-16:41:33.7922715 [dll] tktutil_cxx7078 GetPacAndSuppCred() - Adding 1106 from 000002827F7ECDB0
154 [0] 027C.07EC::10/06/20-16:41:33.7923230 [dll] getas_cxx6905 I_GetASTicket() - I_GetASTicket calling SuccessfulLogon
156 [0] 027C.07EC::10/06/20-16:41:33.7924519 [dll] getas_cxx7123 I_GetASTicket() - I_GetASTicket [Leaving] 0
```

---

#Step C 

_The Kerberos provider ensures it can trust the response from the domain controller. First, it ensures the KDC certificate chains to a root certificate that is trusted by the device. Next, it ensures the certificate is within its validity period and that it has not be revoked._  
 
This is seen in capi2 log, Filter on lsass.exe process / then localize the name of a DC.   
Verify these call functions: 
 

```
CertVerifyRevocation   
CertGetCertificateChain  
ChainElement    
TrustStatus   
CertVerifyCertificateChainPolicy
```
 


_The Kerberos provider then verifies the certificate has the KDC Authentication present and that the subject alternate name listed in the KDC's certificate matches the domain name to which the user is authenticating._ 
 
This is done by the Strict KDC Validation mechanism if enabled! 

The Hybrid joined device does not currently require the KDC Authentication OID to be present in the KDC certificate, to enable a successful WHfB sign-in. 
Without Enable KDC strict validation enabled on Hybrid devices, the client will not perform validation if DC certificate has the KDC EKU, only using Server Authentication EKU. 

[WHFB KDC EKU and Strict KDC Validation](https://internal.evergreen.microsoft.com/en-us/topic/8ce26ec0-c86e-0b41-94c7-237b5be7a37b?app=casebuddy&search=4539856%20)  

By default, Windows client computers using Kerberos authentication with smart card logon do not validate and require the key distribution center (KDC) Extended Key Usage (EKU). Although support was added in Windows Vista to enforce strict KDC validation, this functionality cannot be enabled by default because it would cause authentication failures until configuration preconditions are met. 

---
#Step D 

_After passing this criteria, Kerberos returns the TGT to lsass, where it is cached and used for subsequent service ticket requests.   
Lsass informs winlogon of the success authentication. Winlogon creates a logon session, loads the user's profile, and starts explorer.exe._
