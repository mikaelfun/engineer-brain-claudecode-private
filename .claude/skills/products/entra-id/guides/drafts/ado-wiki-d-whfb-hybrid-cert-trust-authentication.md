---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking at logs/Hybrid Certificate Trust/Authentication"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20Looking%20at%20logs/Hybrid%20Certificate%20Trust/Authentication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430198&Instance=430198&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430198&Instance=430198&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This document provides a detailed step-by-step guide for troubleshooting Windows Hello for Business authentication issues. It includes logs and instructions for various stages of the authentication process, from the initial user interaction to the final successful authentication response. 

[[_TOC_]]

# Helpful logs
- lsa.etl
- kerberos.etl
- credprovauthUI.etl
- KDC.etl

These .etl files share the same TID.PID. You can start searching **KerbILogonUserEx** for the impacted user in kerberos.etl and then filter on all .etl files using the TID.PID.

---

# Step A

Authentication begins when the user dismisses the lock screen, which triggers winlogon to show the Windows Hello for Business credential provider. The user provides their Windows Hello gesture (PIN or biometrics). The credential provider packages these credentials and returns them to winlogon.

## credprovauthUI.etl

```
2176 [0]151C.0E00::10/05/20-16:19:48.8862451 [Microsoft.Windows.CredProvDataModel] [Perftrack_SubmitCredentials_Start] credProvScenario=0, providerId={d6886603-9d2f-4eb2-b667-1971041fa96b}
2177 [0]151C.0E00::10/05/20-16:19:48.8862704 [Microsoft.Windows.UI.Logon] [DisplayStatusActivity] wilActivity=threadId=3584, status=
2178 [0]151C.0E00::10/05/20-16:19:48.8862746 [Microsoft.Windows.UI.Logon] [UXStateChangedActivity] wilActivity=threadId=3584, UXState=9
2181 [0]151C.0E00::10/05/20-16:19:48.9017645 [Microsoft.Windows.UI.Logon] [DisplayStatusActivity] wilActivity=hresult=0 (0x00000000)
2183 [1]151C.01F4::10/05/20-16:19:48.9018126 [Microsoft.OSG.OSS.CredProvFramework] [GetSerializationStart]
2184 [0]151C.01F4::10/05/20-16:19:50.7770707 [Microsoft.OSG.OSS.CredProvFramework] [CGetSerializationJob::Do]
EventLevel=Information, Invoke=ICredentialProviderCredential::GetSerialization, ProviderCLSID={d6886603-9d2f-4eb2-b667-1971041fa96b}, CredentialId=15, CredentialProviderGetSerializationResponse=0x2, ResultCode=The operation completed successfully. (0x00000000)
2185 [0]151C.01F4::10/05/20-16:19:50.7771012 [Microsoft.OSG.OSS.CredProvFramework] [GetSerializationStop] ProviderGetSerializationResponse=2, ProviderStatusIcon=0, ProviderId={d6886603-9d2f-4eb2-b667-1971041fa96b}, NumberOfUserInputs=34, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={d6886603-9d2f-4eb2-b667-1971041fa96b}, AuthenticationPackage=0, CredSerializeProviderId={d6886603-9d2f-4eb2-b667-1971041fa96b}, UserTag=3, SessionId=2, IsRemoteSession=0, ProcessImage=LogonUI.exe
2186 [0]151C.0E00::10/05/20-16:19:50.7771663 [Microsoft.Windows.UI.Logon] [SerializationReceivedActivity] wilActivity=threadId=3584, SerializationResponse=2, CallBackNotNull=false
2188 [1]151C.01A8::10/05/20-16:19:50.7775370 [Microsoft.Windows.LogonController] [CLogonController_RequestCredentials_Activity] wilActivity=hresult=0 (0x00000000)
2190 [1]151C.01A8::10/05/20-16:19:50.7775515 [Microsoft.Windows.LogonUI.WinlogonRPC] [RequestCredentialsActivity] wilActivity=hresult=0 (0x00000000)
2192 [1]151C.01F4::10/05/20-16:19:50.7776206 [Microsoft.OSG.OSS.CredProvFramework] [CSetDisplayStateJob::Do] EventLevel=Information, Invoke=ICredentialProviderWithDisplayState::SetDisplayState, ResultCode=The operation completed successfully. (0x00000000), CurrentState=0x10021
2193 [1]151C.01F4::10/05/20-16:19:50.7776287 [Microsoft.OSG.OSS.CredProvFramework] [CSetDisplayStateJob::Do] EventLevel=Information, Invoke=ICredentialProviderWithDisplayState::SetDisplayState, ResultCode=The operation completed successfully. (0x00000000), CurrentState=0x10021
2196 [0]151C.0E00::10/05/20-16:19:50.7776641 [Microsoft.Windows.UI.Logon] [SerializationReceivedActivity] wilActivity=hresult=0 (0x00000000)
2199 [0]091C.070C::10/05/20-16:19:50.7777979 [Microsoft.Windows.Security.Winlogon] [WinLogonActivityStop] sessionId=2, reason=3, logonType=0, remoteSession=false, firstLogon=false, alreadyOnDesktop=false, forcedSwitchToDesktopError=0, onShellReady=0
2202 [0]091C.070C::10/05/20-16:19:50.7778880 [Microsoft-Windows-Winlogon/Operational] Authentication started.
2203 [0]151C.01A8::10/05/20-16:19:50.7781960 [Microsoft.Windows.LogonUI.WinlogonRPC] [DisplayStatusActivity] wilActivity=threadId=424
2205 [1]151C.0E00::10/05/20-16:19:50.7783752 [Microsoft.Windows.UI.Logon] [DisplayStatusActivity] wilActivity=threadId=3584, status=Welcome
2206 [1]151C.0E00::10/05/20-16:19:50.7783802 [Microsoft.Windows.UI.Logon] [UXStateChangedActivity] wilActivity=threadId=3584, UXState=9
2207 [1]151C.0E00::10/05/20-16:19:50.7789213 [Microsoft.Windows.UI.Logon] [UXStateChangedActivity] wilActivity=hresult=0 (0x00000000)
2209 [1]151C.0E00::10/05/20-16:19:50.7790305 [Microsoft.Windows.UI.Logon] [DisplayStatusActivity] wilActivity=hresult=0 (0x00000000)
2213 [0]151C.01A8::10/05/20-16:19:50.7790667 [Microsoft.Windows.LogonUI.WinlogonRPC] [DisplayStatusActivity] wilActivity=hresult=0 (0x00000000)
2215 [0]091C.070C::10/05/20-16:19:50.8053824 [Microsoft.Windows.Security.Winlogon] [AuthenticationActivityStart] SessionId=2, LogonType=2
```

The user provides their Windows Hello gesture (PIN or biometrics). The credential provider packages these credentials and returns them to winlogon. Winlogon passes the collected credentials to lsass. Lsass passes the collected credentials to the Kerberos.

## lsa.etl

```
1340 [0] 0284.06DC::08/03/20-17:00:00.9090806 [lsasrv] sspiex_cxx2458 SspiExLogonUser() - Dispatch logon: origin = Winlogon, pid 0000000000000220, package 0, type = 2, flags 0x80, logonid 0:0
1342 [0] 0284.06DC::08/03/20-17:00:00.9091196 [lsasrv] surrogatelogon_cxx59 LsapCallAuthPackagesForPreLogonSurrogate() - Pre-Logon surrogate for 0x00000000:0x00598F8D
1343 [0] 0284.06DC::08/03/20-17:00:00.9214919 [lsasrv] surrogatelogon_cxx84 LsapCallAuthPackagesForPreLogonSurrogate() - Pre-Logon surrogate call to CloudAP returned 0x8009030E (0x00000000)
1344 [0]0284.06DC::08/03/20-17:00:00.9214976 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStart]
1351 [0] 0284.06DC::08/03/20-17:00:00.9789533 [lsasrv] sphelp_cxx750 LsapCopyToClient() - [220] LsapCopyToClient(00000096DD5FCA38, 000001D0ACAF0000, 1731) = 0
1352 [0] 0284.06DC::08/03/20-17:00:00.9789635 [lsasrv] logons_cxx598 LsapCreateLsaLogonSession() - Creating logon session 0:598f96
1353 [0] 0284.06DC::08/03/20-17:00:00.9790467 [lsasrv] neglsa_cxx3988 NegLogonUserEx3Worker() - NegLogonUserEx3 interactive logon is cached, checking policy...
1354 [0] 0284.06DC::08/03/20-17:00:00.9790532 [lsasrv] sphelp_cxx917 LsapCopyFromClient() - [220] LsapCopyFromClient(000001D0ACAF0000, 0000024F19A63740, 1731) = 0
1355 [0] 0284.06DC::08/03/20-17:00:00.9872441 [lsasrv] sphelp_cxx750 LsapCopyToClient() - [220] LsapCopyToClient(0000024F19A637D8, 000001D0ACAF0098, 4) = 0
1356 [0]0284.06DC::08/03/20-17:00:00.9873251 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStop] logonType=2, isStandaloneManagedServiceAccount=0, status=0, apiSubStatus=0
1366 [0] 0284.06DC::08/03/20-17:00:00.9877495 [lsalib] aulogon_c2593 LsapAuApiDispatchLogonUser() - Updating logon session 0:598f96 for logon type 2
1367 [0] 0284.06DC::08/03/20-17:00:00.9877515 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package Negotiate with 0:598f96 = WHFBOPCT1
1368 [0] 0284.06DC::08/03/20-17:00:00.9877524 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package Kerberos with 0:598f96 = WHFBOPCT1
1369 [0] 0284.06DC::08/03/20-17:00:00.9877557 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package NTLM with 0:598f96 = WHFBOPCT1
1373 [0] 0284.06DC::08/03/20-17:00:01.0117527 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package TSSSP with 0:598f96 = WHFBOPCT1
1374 [0] 0284.06DC::08/03/20-17:00:01.0117558 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package CloudAP with 0:598f96 = WHFBOPCT1
1375 [0] 0284.06DC::08/03/20-17:00:01.1039951 [lsasrv] sphelp_cxx3502 LsapUpdateNamesAndCredentialsWorker() - Whacking package WDigest with 0:598f96 = WHFBOPCT1
1385 [0]0284.187C::08/03/20-17:00:01.1050882 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStart]
```

---

# Step B

The Kerberos provider gets domain hints from the domain-joined workstation to locate a domain controller for the user. The Kerberos provider sends the signed pre-authentication data and user's certificate, which includes the public key, to the Key Distribution Center (KDC) service running on the domain controller in the form of a KERB_AS_REQ.

## kerberos.etl

```
95 [0] 0284.187C::08/03/20-17:00:01.1051186 [KERBEROS] logonses_cxx1941 KerbCreateLogonSession() - KerbCreateLogonSession creating logon session for 0:0x59920d
96 [0] 0284.187C::08/03/20-17:00:01.1062676 [KERBEROS] logonses_cxx453 KerbCreateLogonSession() - INSERT logonsess 0000024F1968FA40 for 0:0x59920d
97 [0] 0284.187C::08/03/20-17:00:01.1062681 [KERBEROS] logonses_cxx2057 KerbCreateLogonSession() - KerbCreateLogonSession: created logon session 0000024F1968FA40 for LUID 0:59920d
98 [0] 0284.187C::08/03/20-17:00:01.1129622 [KERBEROS] logonapi_cxx9444 KerbILogonUserEx3() - LsaApLogonUserEx3: attempting to logon user ADFOREST4\WHFBOPCT1
99 [0] 0284.187C::08/03/20-17:00:01.1129848 [KERBEROS] ctxtapi_cxx558 KerbProcessTargetNames() - Parsed name WHFBOPCT1 ((null)) into: name type 0x1, name count 1, realm (null), first part WHFBOPCT1
100 [0] 0284.187C::08/03/20-17:00:01.1129861 [KERBEROS] ctxtapi_cxx724 KerbProcessTargetNames() - Cracked name WHFBOPCT1
101 [0] 0284.187C::08/03/20-17:00:01.1129890 [KERBEROS] ctxtapi_cxx725 KerbProcessTargetNames() - into WHFBOPCT1
102 [0] 0284.187C::08/03/20-17:00:01.1129897 [KERBEROS] logonapi_cxx5986 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm ADFOREST4
103 [0] 0284.187C::08/03/20-17:00:01.1130328 [KERBEROS] logonapi_cxx2193 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client WHFBOPCT1
104 [0] 0284.187C::08/03/20-17:00:01.1130339 [KERBEROS] logonapi_cxx2194 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm ADFOREST4
105 [0] 0284.187C::08/03/20-17:00:01.1130373 [KERBEROS] logonapi_cxx2195 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/ADFOREST4
106 [0] 0284.187C::08/03/20-17:00:01.1130395 [KERBEROS] logonapi_cxx2400 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicketEx using default credentials ADFOREST4\WHFBOPCT1
107 [0] 0284.187C::08/03/20-17:00:01.1130415 [KERBEROS] logonapi_cxx2402 KerbGetAuthenticationTicketEx() - to service krbtgt/ADFOREST4
108 [0] 0284.187C::08/03/20-17:00:01.1130502 [KERBEROS] logonapi_cxx722 KerbBuildPreAuthData() - Skewing system time. System time is 08/03/20-17:00:01.1025602
109 [0] 0284.187C::08/03/20-17:00:01.1130505 [KERBEROS] logonapi_cxx723 KerbBuildPreAuthData() - Skewed time is 08/03/20-17:00:01.1025602
110 [0] 0284.187C::08/03/20-17:00:01.1130607 [KERBEROS] logonapi_cxx3238 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000024F19B03850 <-- this is the public key, if = 00000, no certificate has been used.
111 [0] 0284.187C::08/03/20-17:00:01.1130682 [KERBEROS] logonapi_cxx3297 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
112 [0] 0284.187C::08/03/20-17:00:01.1130691 [KERBEROS] kerbtick_cxx3026 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
113 [0] 0284.187C::08/03/20-17:00:01.1130796 [KERBEROS] kerbtick_cxx3351 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.2.21 for realm ADFOREST4, DesiredFlags 0, connection timeout: 0 secs
114 [0] 0284.187C::08/03/20-17:00:01.1130805 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.x.xx
115 [0] 0284.187C::08/03/20-17:00:01.1138770 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.21
116 [0] 0284.187C::08/03/20-17:00:01.1138965 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x180c
117 [0] 0284.187C::08/03/20-17:00:01.1144821 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x180c
118 [0] 0284.187C::08/03/20-17:00:01.1145098 [KERBEROS] logonapi_cxx3354 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
119 [0] 0284.187C::08/03/20-17:00:01.1145135 [CommonIumSafe] tickets_cxx2702 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
120 [0] 0284.187C::08/03/20-17:00:01.1145138 [KERBEROS] logonapi_cxx3465 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
121 [0] 0284.187C::08/03/20-17:00:01.1145217 [CommonIumSafe] tickets_cxx2702 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
122 [0] 0284.187C::08/03/20-17:00:01.1145225 [CommonIumSafe] utils_cxx118 KerbUnpackErrorData() - KerbUnpackData failed to unpack typed data, trying error method data
123 [0] 0284.187C::08/03/20-17:00:01.1145231 [CommonIumSafe] tickets_cxx2702 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
124 [0] 0284.187C::08/03/20-17:00:01.1145234 [KERBEROS] logonapi_cxx3613 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x19, extendedStatus 0 <------this is not an error, this is the pre-auth requested by the KDC.
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

The domain controller determines the certificate is not self-signed certificate. The domain controller ensures the certificate chains to trusted root certificate, is within its validity period, can be used for authentication, and has not been revoked. It retrieves the public key and UPN from the certificate included in the KERB_AS_REQ and searches for the UPN in Active Directory. It validates the signed pre-authentication data using the public key from the certificate. On success, the KDC returns a TGT to the client with its certificate in a KERB_AS_REP.

## KDC.etl

Now those extracts is coming from a KDC:

```
62 [0] 027C.07EC::10/06/20-16:41:33.7545287 [dll] getas_cxx4780 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/ADFOREST4
63 [0] 027C.07EC::10/06/20-16:41:33.7545297 [dll] getas_cxx4781 I_GetASTicket() - I_GetASTicket for client WHFBOPCT1
67 [0] 027C.07EC::10/06/20-16:41:33.7545333 [dll] tktutil_cxx1759 KdcNormalize() - KdcNormalize checking name in SAM
68 [0] 027C.07EC::10/06/20-16:41:33.7545338 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering]
bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000001, GenericUserName WHFBOPCT1, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0
73 [0] 027C.07EC::10/06/20-16:41:33.7547980 [dll] getas_cxx3473 KdcCheckPreAuthData() - Setting BuildPac from pa-data to 0
86 [0] 027C.07EC::10/06/20-16:41:33.7852005 [dll] sockutil_cxx574 KdcAtqIoCompletion() - KdcAtqIoCompletion: first completion, increasing timeout for KdcContext 000002827F793220 to KdcExistingConnectionTimeout 0x32
87 [0] 027C.07EC::10/06/20-16:41:33.7852587 [dll] getas_cxx4780 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/ADFOREST4
88 [0] 027C.07EC::10/06/20-16:41:33.7852624 [dll] getas_cxx4781 I_GetASTicket() - I_GetASTicket for client WHFBOPCT1
90 [0] 027C.07EC::10/06/20-16:41:33.7852700 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName WHFBOPCT1
92 [0] 027C.07EC::10/06/20-16:41:33.7852731 [dll] tktutil_cxx1759 KdcNormalize() - KdcNormalize checking name in SAM
93 [0] 027C.07EC::10/06/20-16:41:33.7852746 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering]
bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000081, GenericUserName WHFBOPCT1, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x4
95 [0] 027C.07EC::10/06/20-16:41:33.7852765 [dll] tktutil_cxx5473 KdcGetTicketInfo() - check if account WHFBOPCT1 is local with local secrets
96 [0] 027C.07EC::10/06/20-16:41:33.7857623 [dll] tktutil_cxx5842 KdcGetTicketInfo() - KdcGetTicketInfo getting user keys
99 [0] 027C.07EC::10/06/20-16:41:33.7861894 [dll] pkserv_cxx1183 KdcVerifyClientCertName() - UPN from certificate is WHFBOPCT1@jobesanc.mit.litware.com
100 [0] 027C.07EC::10/06/20-16:41:33.7861934 [dll] tktutil_cxx1199 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0, ExtendedFields 0, PrincipalName 000002827F648FC0, PrincipalRealm (null), RequestRealm (null), TgtClientRealm (null), NameFlags 0x215, MappedAttr 0000000000000000
102 [0] 027C.07EC::10/06/20-16:41:33.7862002 [dll] tktutil_cxx1875 KdcNormalize() - KdcNormalize checking name in SAM
103 [0] 027C.07EC::10/06/20-16:41:33.7862011 [dll] tktutil_cxx5435 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0, ExtendedFields 0, GenericUserName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA, LookupFlags 0x20000 , PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2
108 [0] 027C.07EC::10/06/20-16:41:33.7871074 [dll] pkserv_cxx1249 KdcVerifyClientCertName() - KdcVerifyClientCertName found clientName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA
109 [0] 027C.07EC::10/06/20-16:41:33.7871084 [dll] pkserv_cxx1251 KdcVerifyClientCertName() - KdcVerifyClientCertName mapped account to key trust is WHFBOPCT1 , flags 0x86
110 [0] 027C.07EC::10/06/20-16:41:33.7911103 [dll] getas_cxx5480 I_GetASTicket() - KLIN(4031568) normalize account WHFBOPCT1 in the second pass
111 [0] 027C.07EC::10/06/20-16:41:33.7911173 [dll] tktutil_cxx1199 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0x233fefcf, ExtendedFields 0x2000081, PrincipalName 000002827F649350, PrincipalRealm (null), RequestRealm ADFOREST4, TgtClientRealm (null), NameFlags 0x215, MappedAttr 0000000000000000
112 [0] 027C.07EC::10/06/20-16:41:33.7911186 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA
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

# Step C

The Kerberos provider ensures it can trust the response from the domain controller. First, it ensures the KDC certificate chains to a root certificate that is trusted by the device. Next, it ensures the certificate is within its validity period and that it has not be revoked.

This is seen in capi2 log, Filter on lsass.exe process / then localize the name of a DC. Verify these call functions:


```
CertVerifyRevocation
CertGetCertificateChain
ChainElement
TrustStatus
CertVerifyCertificateChainPolicy
```

The Kerberos provider then verifies the certificate has the KDC Authentication present and that the subject alternate name listed in the KDC's certificate matches the domain name to which the user is authenticating.

This is done by the Strict KDC Validation mechanism if enabled !

The Hybrid joined device does not currently require the KDC Authentication OID to be present in the KDC certificate, to enable a successful WHfB sign-in. Without Enable KDC strict validation enabled on Hybrid devices, the client will not perform validation if DC certificate has the KDC EKU, only using Server Authentication EKU.

By default, Windows client computers using Kerberos authentication with smart card logon do not validate and require the key distribution center (KDC) Extended Key Usage (EKU). Although support was added in Windows Vista to enforce strict KDC validation, this functionality cannot be enabled by default because it would cause authentication failures until configuration preconditions are met.

[WHFB KDC EKU and Strict KDC Validation](https://internal.evergreen.microsoft.com/topic/8ce26ec0-c86e-0b41-94c7-237b5be7a37b?app=casebuddy&search=4539856%20)

---

# Step D

After passing this criteria, Kerberos returns the TGT to lsass, where it is cached and used for subsequent service ticket requests.
Lsass informs winlogon of the success authentication. Winlogon creates a logon session, loads the user's profile, and starts explorer.exe.

then caching of this information:

```
171 [0] 0284.187C::08/03/20-17:00:01.4685666 [KERBEROS] krbtoken_cxx4435 KerbCacheLogonInformation() - KerbCacheLogonInformation updating NLP Cache entry of ADFOREST4\WHFBOPCT1 , flags 0x100 <NULL>...
174 [0] 0284.187C::08/03/20-17:00:01.4823978 [KERBEROS] krbtoken_cxx4435 KerbCacheLogonInformation() - KerbCacheLogonInformation updating NLP Cache entry of (null)\ f213f266095a6c45058fb45fef878eba05458990a36729f8d67f62469d0570c4\WHFBOPCT1\ADFOREST4 , flags 0x148 <NULL>...
```

---

# Step E

While Windows loads the user's desktop, lsass passes the collected credentials to the Cloud Authentication security support provider, referred to as the Cloud AP provider. The Cloud AP provider requests a nonce from Azure Active Directory. Azure AD returns a nonce. The Cloud AP provider requests a nonce from Azure Active Directory. Azure AD returns a nonce.


```
1025 [1] 02B8.02EC::05/13/20-17:41:43.3918927 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0xc0000225 cloudapcache.cpp:1162 : GetCloudAPCacheNode:
11032 [1] 02B8.02EC::05/13/20-17:41:43.3920298 [wdigest] credapi_cxx74 SpAcceptCredentials() - SpAcceptCredentials: Entering
1033 [1] 02B8.02EC::05/13/20-17:41:43.3920302 [wdigest] credapi_cxx75 SpAcceptCredentials() - SpAcceptCredentials: Credential: LogonType 2
1034 [1] 02B8.02EC::05/13/20-17:41:43.3920307 [wdigest] credapi_cxx81 SpAcceptCredentials() - SpAcceptCredentials: Entering AccountName jstarr
1035 [1] 02B8.02EC::05/13/20-17:41:43.3920312 [wdigest] credapi_cxx92 SpAcceptCredentials() - SpAcceptCredentials: DomainName\DownlevelName ADFOREST1\jstarr
1036 [1] 02B8.02EC::05/13/20-17:41:43.3920317 [wdigest] credapi_cxx95 SpAcceptCredentials() - SpAcceptCredentials: UPN DnsDomainName jstarr@whfbHKT.jobesancmscloud1.com ADFOREST1.COM 
1040 [1] 02B8.02EC::05/13/20-17:41:43.3920405 [wdigest] credapi_cxx193 SpAcceptCredentials() - SpAcceptCredentials: Create New LogonSession - not an update
1047 [1] 02B8.02EC::05/13/20-17:41:43.3920499 [wdigest] credapi_cxx287 SpAcceptCredentials() - SpAcceptCredentials: No Primary ClearText Password -active logon created - no duplicates
1048 [1] 02B8.02EC::05/13/20-17:41:43.3920504 [wdigest] logsess_cxx593 LogSessHandlerNoPasswordInsert() - LogSessHandlerNoPasswordInsert: Entering LogonID (0:1499b6)
1049 [1] 02B8.02EC::05/13/20-17:41:43.3920520 [wdigest] logsess_cxx631 LogSessHandlerNoPasswordInsert() - LogSessHandlerNoPasswordInsert: LogonID (0:1499b6) not in list.
1050 [1] 02B8.02EC::05/13/20-17:41:43.3920523 [wdigest] logsess_cxx632 LogSessHandlerNoPasswordInsert() - LogSessHandlerNoPasswordInsert: Inserting in List
1051 [1] 02B8.02EC::05/13/20-17:41:43.3920529 [wdigest] logsess_cxx643 LogSessHandlerNoPasswordInsert() - LogSessHandlerNoPasswordInsert: Exiting LogonID (0:1499b6)
1052 [1] 02B8.02EC::05/13/20-17:41:43.3920533 [wdigest] credapi_cxx312 SpAcceptCredentials() - SpAcceptCredentials: Leaving status 0x0

1058 [1]02B8.1628::05/13/20-17:41:43.4411482 [Microsoft-Windows-AAD/Analytic ] AadCloudAPPlugin GetToken Start
1060 [1] 02B8.1628::05/13/20-17:41:43.4411596 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:DoGetToken enter

1073 [1]02B8.1628::05/13/20-17:41:43.4413184 [Microsoft-Windows-AAD/Analytic ] Realm discovery for: jstarr@whfbHKT.jobesancmscloud1.com authority: https://login.microsoftonline.com  fallback domain hint: whfbHKT.jobesancmscloud1.com  useUpn: 0
1077 [1] 02B8.1628::05/13/20-17:41:43.4413551 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::SendRequest enter
1078 [1]02B8.1628::05/13/20-17:41:43.4413660 [Microsoft-Windows-AAD/Analytic ] Endpoint Uri: https://login.microsoftonline.com/common/UserRealm/?user=whfbHKT.jobesancmscloud1.com&api-version=1.0&checkForMicrosoftAccount=false&fallback_domain=whfbHKT.jobesancmscloud1.com 

1080 [1] 02B8.1628::05/13/20-17:41:43.4413959 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::Connect enter

1144 [1] 02B8.1628::05/13/20-17:41:43.6400841 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:SendWebRequest exit: 0x0
1147 [1] 02B8.1628::05/13/20-17:41:43.6400930 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckDeviceCertificatePrivateKey enter
1159 [0] 02B8.1628::05/13/20-17:41:43.6428773 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000002 login.cpp:888 : Credential type:
1160 [0] 02B8.1628::05/13/20-17:41:43.6428837 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckVsmBindingKeys enter
1161 [0] 02B8.1628::05/13/20-17:41:43.6428854 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckVsmBindingKeys exit: 0x0
1162 [0] 02B8.1628::05/13/20-17:41:43.6428867 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:GetNonce enter
1165 [0]02B8.1628::05/13/20-17:41:43.6428953 [Microsoft-Windows-AAD/Analytic ] Endpoint Uri: https://login.microsoftonline.com/39b35923-4cbe-4adb-8ab2-24c70b83f77c/oauth2/token 
1166 [0] 02B8.1628::05/13/20-17:41:43.6429005 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 winhttptransport.cpp:89 : Endpoint URI:https://login.microsoftonline.com/39b35923-4cbe-4adb-8ab2-24c70b83f77c/oauth2/token 
1167 [0] 02B8.1628::05/13/20-17:41:43.6429059 [dll] dllmain_cpp35 WPPTraceLogA() - noncerequest.cpp:NonceRequest::BuildRequest enter b3ee-6d507a86bc7b/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/jstarr@whfbHKT.jobesancmscloud1.com
1680 [0] 02B8.1628::05/13/20-17:41:43.6986487 [dll] dllmain_cpp35 WPPTraceLogA() - request.h:WebRequest<class NonceResponse>::CreateResponse enter
1681 [0] 02B8.1628::05/13/20-17:41:43.6986521 [dll] dllmain_cpp35 WPPTraceLogA() - nonceresponse.cpp:NonceResponse::Parse enter
1687 [0] 02B8.1628::05/13/20-17:41:43.6986868 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:GetNonce exit: 0x0
```

---

# Step F

The Cloud AP provider signs the nonce using the user's private key and returns the signed nonce to the Azure Active Directory.


```
1688 [0] 02B8.1628::05/13/20-17:41:43.6987055 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:ProcessOAuthRequest enter
1689 [0] 02B8.1628::05/13/20-17:41:43.6987066 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp: SendOAuthRequest enter
1692 [0]02B8.1628::05/13/20-17:41:43.6987159 [Microsoft-Windows-AAD/Analytic ] Endpoint Uri: https://login.microsoftonline.com/39b35923-4cbe-4adb-8ab2-24c70b83f77c/oauth2/token 
1694 [0] 02B8.1628::05/13/20-17:41:43.6987257 [dll] dllmain_cpp35 WPPTraceLogA() - oauthrequest.cpp:OAuthTokenRequest::BuildRequest enter
1695 [0] 02B8.1628::05/13/20-17:41:43.6987271 [dll] dllmain_cpp35 WPPTraceLogA() - oauthrequest.cpp:OAuthTokenRequest:: BuildDeviceAuthAssertion enter
1696 [0] 02B8.1628::05/13/20-17:41:43.6987285 [dll] dllmain_cpp35 WPPTraceLogA() - unimpersonatehelper.cpp:UnImpersonateHelper::UnImpersonate enter
1697 [0] 02B8.1628::05/13/20-17:41:43.6987345 [dll] dllmain_cpp35 WPPTraceLogA() - unimpersonatehelper.cpp:UnImpersonateHelper::UnImpersonate exit: 0x0
1698 [1] 02B8.1628::05/13/20-17:41:43.6999105 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64Encode enter
1699 [1] 02B8.1628::05/13/20-17:41:43.6999226 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64Encode exit: 0x0
1700 [1] 02B8.1628::05/13/20-17:41:43.6999864 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlEncode enter
1701 [1] 02B8.1628::05/13/20-17:41:43.7001648 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlEncode exit: 0x0
1702 [1]02B8.1628::05/13/20-17:41:43.7001919 [Microsoft-Windows-AAD/Analytic ] NGC UserID Key: S-1-5-21-498230862-2924710955-1205587603-1119/27456e01-2f54-4324-b3ee-6d507a86bc7b/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/jstarr@whfbHKT.jobesancmscloud1.com
1703 [1] 02B8.1628::05/13/20-17:41:43.7002016 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 ngcgranttokenrequest.cpp:101 : NGC UserID key name:S-1-5-21-498230862-2924710955-1205587603-1119/27456e01-2f54-4324-b3ee-6d507a86bc7b/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/jstarr@whfbHKT.jobesancmscloud1.com
1705 [0] 02B8.1628::05/13/20-17:41:43.7505914 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::ComputeSha256Hash enter
1706 [0] 02B8.1628::05/13/20-17:41:43.7508235 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::ComputeSha256Hash exit: 0x0
1707 [0] 02B8.1628::05/13/20-17:41:43.7508252 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64Encode enter
1708 [0] 02B8.1628::05/13/20-17:41:43.7508314 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64Encode exit: 0x0
1709 [0] 02B8.1628::05/13/20-17:41:43.7528554 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlEncode enter
1710 [0] 02B8.1628::05/13/20-17:41:43.7528725 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlEncode exit: 0x0
1711 [0] 02B8.1628::05/13/20-17:41:43.7528773 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::StringFormat enter
1712 [0] 02B8.1628::05/13/20-17:41:43.7528806 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::StringFormat exit: 0x0
1731 [0] 02B8.1628::05/13/20-17:41:43.9025107 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::SignDataWithCert enter
1732 [0] 02B8.1628::05/13/20-17:41:43.9036323 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::ComputeSha256Hash enter
1733 [0] 02B8.1628::05/13/20-17:41:43.9038829 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::ComputeSha256Hash exit: 0x0
1734 [1] 02B8.1628::05/13/20-17:41:43.9081404 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::SignDataWithCert exit: 0x0
1741 [1] 02B8.1628::05/13/20-17:41:43.9082560 [dll] dllmain_cpp35 WPPTraceLogA() - oauthrequest.cpp:OAuthTokenRequest:: BuildDeviceAuthAssertion exit: 0x0
```


The Cloud AP provider receives the encrypted PRT with session key. Using the device's private transport key, the Cloud AP provider decrypt the session key and protects the session key using the device's TPM.


```
1761 [1] 02B8.1628::05/13/20-17:41:44.0441532 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::ProcessResponse enter
1762 [1] 02B8.1628::05/13/20-17:41:44.0442014 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x000000c8 winhttptransport.cpp:303 : request status:
1763 [1] 02B8.1628::05/13/20-17:41:44.0443676 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::ParseResponse enter
1764 [1] 02B8.1628::05/13/20-17:41:44.0443774 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes enter
1765 [1] 02B8.1628::05/13/20-17:41:44.0443814 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes exit: 0x0
1766 [1] 02B8.1628::05/13/20-17:41:44.0443845 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes enter
1767 [1] 02B8.1628::05/13/20-17:41:44.0443871 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes exit: 0x0
1768 [1] 02B8.1628::05/13/20-17:41:44.0444012 [dll] dllmain_cpp35 WPPTraceLogA() - request.h:WebRequest<class OAuthResponse>::CreateResponse enter
1770 [1] 02B8.1628::05/13/20-17:41:44.0444111 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::ParseJson enter
1771 [1] 02B8.1628::05/13/20-17:41:44.0444821 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::ParseIdTokenResponse enter
1772 [1] 02B8.1628::05/13/20-17:41:44.0444890 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode enter
1773 [1] 02B8.1628::05/13/20-17:41:44.0445284 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode exit: 0x0
1774 [1] 02B8.1628::05/13/20-17:41:44.0445293 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes enter
1775 [1] 02B8.1628::05/13/20-17:41:44.0445326 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes exit: 0x0
1778 [1] 02B8.1628::05/13/20-17:41:44.0445933 [dll] dllmain_cpp35 WPPTraceLogA() - 3 0x00000000 oauthresponse.cpp:350 : Password expiration claims:0 https://portal.microsoftonline.com/ChangePassword.aspx 
1779 [1]02B8.1628::05/13/20-17:41:44.0445987 [Microsoft-Windows-AAD/Analytic ] Password expiration claims. Seconds: 0 URI: https://portal.microsoftonline.com/ChangePassword.aspx 
1780 [1] 02B8.1628::05/13/20-17:41:44.0446086 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::ParseIdTokenResponse exit: 0x0
1787 [0] 02B8.1628::05/13/20-17:41:44.0547858 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::ParseJson exit: 0x0
1788 [0] 02B8.1628::05/13/20-17:41:44.0547937 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::Parse exit: 0x0
1791 [0] 02B8.1628::05/13/20-17:41:44.0548108 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::ProcessResponse exit: 0x0
1793 [1] 02B8.1628::05/13/20-17:41:44.0548764 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::FillTokenInfo enter
1794 [1] 02B8.1628::05/13/20-17:41:44.0573358 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::SaveDeviceTokenProperties enter
1797 [1] 02B8.1628::05/13/20-17:41:44.0575245 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::SaveDeviceTokenProperties exit: 0x0
1800 [1] 02B8.1628::05/13/20-17:41:44.0575304 [dll] dllmain_cpp35 WPPTraceLogA() - oauthresponse.cpp:OAuthResponse::FillTokenInfo exit: 0x10000000
1801 [1] 02B8.1628::05/13/20-17:41:44.0575333 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:BuildSupplementalCredentialsCollection enter
1802 [1] 02B8.1628::05/13/20-17:41:44.0575345 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:BuildSupplementalCredentialsCollection exit: 0x0

1826 [0]02B8.1628::05/13/20-17:41:44.0672775 [Microsoft-Windows-AAD/Analytic ] AadCloudAPPlugin GetKeys Start
1827 [0] 02B8.1628::05/13/20-17:41:44.0672813 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:AadPluginGetKeys enter
1829 [0] 02B8.1628::05/13/20-17:41:44.0672882 [dll] dllmain_cpp35 WPPTraceLogA() - serializetokeninfo.cpp:TokenInfoSerializeHelper::DeserializeTokenInfo enter
1830 [0] 02B8.1628::05/13/20-17:41:44.0672897 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes enter
1831 [0] 02B8.1628::05/13/20-17:41:44.0672962 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes exit: 0x0
1832 [0] 02B8.1628::05/13/20-17:41:44.0674176 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode enter
1833 [0] 02B8.1628::05/13/20-17:41:44.0674718 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode exit: 0x0
1836 [0] 02B8.1628::05/13/20-17:41:44.0675106 [dll] dllmain_cpp35 WPPTraceLogA() - serializetokeninfo.cpp:TokenInfoSerializeHelper::DeserializeTokenInfo exit: 0x0
1837 [0]02B8.1628::05/13/20-17:41:44.0675147 [Microsoft-Windows-AAD/Analytic ] AadCloudAPPlugin GetKeys Correlation ID: 00CFB2D7-E3AD-4D98-A60E-B1C6C71D8EBF.
1839 [0] 02B8.1628::05/13/20-17:41:44.0675186 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 aadcloudap.cpp:2654 : Get keys correlation ID:00CFB2D7-E3AD-4D98-A60E-B1C6C71D8EBF
1840 [0] 02B8.1628::05/13/20-17:41:44.0675201 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:GetCredentialKeys enter
1841 [0] 02B8.1628::05/13/20-17:41:44.0675217 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::GenRandom enter
1842 [0] 02B8.1628::05/13/20-17:41:44.0677604 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::GenRandom exit: 0x0
1843 [0] 02B8.1628::05/13/20-17:41:44.0677647 [dll] dllmain_cpp35 WPPTraceLogA() - endpointhelper.cpp:EndpointHelper::GetKeyDataEndPoint enter
1844 [0] 02B8.1628::05/13/20-17:41:44.0677685 [dll] dllmain_cpp35 WPPTraceLogA() - endpointhelper.cpp:EndpointHelper::GetKeyDataEndPoint exit: 0x0
1845 [0] 02B8.1628::05/13/20-17:41:44.0677817 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:SendWebRequest enter
1846 [0] 02B8.1628::05/13/20-17:41:44.0677846 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::SendRequest enter
1847 [0]02B8.1628::05/13/20-17:41:44.0677893 [Microsoft-Windows-AAD/Analytic ] Endpoint Uri: https://login.microsoftonline.com/common/getkeydata 
1848 [0] 02B8.1628::05/13/20-17:41:44.0677933 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 winhttptransport.cpp:89 : Endpoint URI:https://login.microsoftonline.com/common/getkeydata 
1849 [0] 02B8.1628::05/13/20-17:41:44.0677991 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::BuildRequest enter
1850 [0] 02B8.1628::05/13/20-17:41:44.0678007 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::CreateSignedRequest enter
1851 [0] 02B8.1628::05/13/20-17:41:44.0678051 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::CreateUnprotectedKeyJwe enter
1852 [0] 02B8.1628::05/13/20-17:41:44.0678146 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::GenRandom enter
1853 [0] 02B8.1628::05/13/20-17:41:44.0680568 [dll] dllmain_cpp35 WPPTraceLogA() - crypto.cpp:CryptoHelper::GenRandom exit: 0x0
1854 [0] 02B8.1628::05/13/20-17:41:44.0680583 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64Encode enter
1855 [0] 02B8.1628::05/13/20-17:41:44.0680623 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64Encode exit: 0x0
1858 [1] 02B8.1628::05/13/20-17:41:44.0694724 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlEncode enter
1859 [1] 02B8.1628::05/13/20-17:41:44.0694892 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlEncode exit: 0x0
1864 [1] 02B8.1628::05/13/20-17:41:44.0695163 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::StringFormat enter
1865 [1] 02B8.1628::05/13/20-17:41:44.0695215 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::StringFormat exit: 0x0
1866 [1] 02B8.1628::05/13/20-17:41:44.0695240 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::CreateUnprotectedKeyJwe exit: 0x0
1875 [1] 02B8.1628::05/13/20-17:41:44.0698423 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::ConstructRequest enter
1882 [1] 02B8.1628::05/13/20-17:41:44.0701157 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::ConstructRequest exit: 0x0
1887 [1] 02B8.1628::05/13/20-17:41:44.0708455 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::CreateSignedRequest exit: 0x0
1888 [1] 02B8.1628::05/13/20-17:41:44.0709311 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydatarequest.cpp:GetKeyDataRequest::BuildRequest exit: 0x0
1909 [0] 02B8.1628::05/13/20-17:41:44.3100995 [dll] dllmain_cpp35 WPPTraceLogA() - request.h:WebRequest<class GetKeyDataResponse>::CreateResponse enter
1910 [0] 02B8.1628::05/13/20-17:41:44.3101027 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydataresponse.cpp:GetKeyDataResponse::Parse enter
1911 [0] 02B8.1628::05/13/20-17:41:44.3101124 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode enter
1912 [0] 02B8.1628::05/13/20-17:41:44.3101196 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode exit: 0x0
1913 [0] 02B8.1628::05/13/20-17:41:44.3101211 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes enter
1914 [0] 02B8.1628::05/13/20-17:41:44.3101228 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes exit: 0x0
1915 [0] 02B8.1628::05/13/20-17:41:44.3101406 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydataresponse.cpp:GetKeyDataResponse::Parse exit: 0x0
1916 [0] 02B8.1628::05/13/20-17:41:44.3101418 [dll] dllmain_cpp35 WPPTraceLogA() - request.h:WebRequest<class GetKeyDataResponse>::CreateResponse exit: 0x0
1920 [0] 02B8.1628::05/13/20-17:41:44.3101755 [dll] dllmain_cpp35 WPPTraceLogA() - getkeydataresponse.cpp:GetKeyDataResponse::GetKeys enter
1921 [0] 02B8.1628::05/13/20-17:41:44.3101765 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode enter
1922 [0] 02B8.1628::05/13/20-17:41:44.3101801 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::Base64UrlDecode exit: 0x0
1927 [1] 02B8.1628::05/13/20-17:41:44.3111972 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes enter
1928 [1] 02B8.1628::05/13/20-17:41:44.3112022 [dll] dllmain_cpp35 WPPTraceLogA() - aadstring.cpp:StringUtility::DecodeBytes exit: 0x0
```

The Cloud AP provider returns a successful authentication response to lsass. Lsass caches the PRT.


```
1951 [1] 02B8.1628::05/13/20-17:41:44.3121746 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000002 utils.cpp:1913 : SetFileAttributesW:\?\C:\windows\system32\config\systemprofile\AppData\Local\Microsoft\Windows<mark>CloudAPCache\AzureAD

\c1464307b44f5f58c07a6c3248d31ec66b4a8b9cf82cc8bd7cefb1bd1322b245\Keys\d60e8104-d8a2-4685-a267-0694cf1d20f3
1956 [0] 02B8.1628::05/13/20-17:41:44.5149732 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0xc0000225 cloudapcache.cpp:866 : GetCloudAPCacheNode:
1957 [0] 02B8.1628::05/13/20-17:41:44.5149885 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000000 logonapi.cpp:5650 : Cached logon is allowed by plugin:
1958 [0] 02B8.1628::05/13/20-17:41:44.5149901 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000000 logonapi.cpp:5655 : Will re-enable optimized logon:
1959 [0] 02B8.1628::05/13/20-17:41:44.5149918 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000000 logonapi.cpp:5658 : Setting Kerberos callback creds:0
1960 [0] 02B8.1628::05/13/20-17:41:44.5152192 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000002 utils.cpp:1108 : RegOpenKeyExW:Name2Sid\c120302654f411f84109b9cfa78d555faad2ed03690a8020e284829738c3fd9e
1961 [0] 02B8.1628::05/13/20-17:41:44.5152224 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0xc0000225 utils.cpp:1118 : RegOpenKeyExW:Name2Sid\c120302654f411f84109b9cfa78d555faad2ed03690a8020e284829738c3fd9e
1962 [1] 02B8.1628::05/13/20-17:41:44.5320780 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000000 appluginpackage.cpp:1393 : logon success:0
1963 [1] 02B8.1628::05/13/20-17:41:44.5324202 [cloudAP] wppdebug_cpp38 WPPTraceLogA() - 0x00000000 appluginpackage.cpp:1501 : SurrogateLogonUser success:AzureAD
2099 [0]02D4.0AEC::05/13/20-17:41:44.9317552 [Microsoft.Windows.Security.TokenBroker] [TBStoredObjectInitializeEvent] ObjectFolderPath=C:\Users\jstarr\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts, ObjectFilePath=C:\Users\jstarr\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts\77eb4a0561928883258169f4953c9160a0e01d6a.tbacct
7618 [0]02D4.1894::05/13/20-17:42:02.2853324 [Microsoft.Windows.Security.TokenBroker] [TBStoredObjectInitializeEvent] ObjectFolderPath=C:\Users\jstarr\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts, ObjectFilePath=C:\Users\jstarr\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts\77eb4a0561928883258169f4953c9160a0e01d6a.tbacct
9070 [0]2234.1FF8::05/13/20-17:42:11.3286528 [Microsoft.Windows.Security.TokenBroker] [TBStoredObjectInitializeEvent] ObjectFolderPath=C:\Users\jstarr\AppData\Local\Microsoft\TokenBroker\Cache, ObjectFilePath=C:\Users\jstarr\AppData\Local\Microsoft\TokenBroker\Cache\5475cb191e478c39370a215b2da98a37e9dc813d.tbres
9072 [0]2234.1FF8::05/13/20-17:42:11.3286674 [Microsoft.Windows.Security.TokenBroker] [TBStoredObjectOpenFileForAccess] CreateDisposition=1, AccessType=0, ObjectFilePath=C:\Users\jstarr\AppData\Local\Microsoft\TokenBroker\Cache\5475cb191e478c39370a215b2da98a37e9dc813d.tbres
9074 [0]2234.1FF8::05/13/20-17:42:11.3286747 [Microsoft.Windows.Security.TokenBroker] [TBStoredObjectOpenFileEvent] AccessType=0, ObjectFilePath=C:\Users\jstarr\AppData\Local\Microsoft\TokenBroker\Cache\5475cb191e478c39370a215b2da98a37e9dc813d.tbres
9702 [1] 02B8.02EC::05/13/20-17:42:15.0611924 [pku2u] logonsess_cxx834 LsaApLogonTerminated() - LogonTerminated( 0:1b842a )
9703 [1] 02B8.02EC::05/13/20-17:42:15.0612091 [pku2u] logonsess_cxx834 LsaApLogonTerminated() - LogonTerminated( 0:1b842a )
9704 [0] 02B8.02EC::05/13/20-17:42:15.0898251 [wdigest] lsaap_cxx413 LsaApLogonTerminated() - LsaApLogonTerminated: Entering LogonID (0:1b842a)
```