---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/Kerberos - Application Server Request | Response"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/Kerberos%20-%20Application%20Server%20Request%20%7C%20Response"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1080716&Instance=1080716&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1080716&Instance=1080716&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This section provides a detailed explanation of the Kerberos mutual authentication flow, detailing how a Ticket Granting Service (TGS) is used within an application and validated at the server. The steps also cover how mutual authentication is implemented.

[[_TOC_]]

# KRB_AP_REQ | KRB_AP_REP - Application server request | response

This section explains how a Ticket Granting Service (TGS) is used within an application, how the TGS is validated at the server, and how mutual authentication is implemented.  
![Kerberos mutual authentication flow](/.attachments/image-06e3c91b-5b9a-4d96-81a7-c15595bf03c7.png)

## Kerberos mutual authentication flow

1. The client application and server negotiate a security package and choose Kerberos. The application selects the Service Principal Name (SPN). The Kerberos client uses the SPN, Ticket Granting Ticket (TGT), and Authenticator to create the TGS request as before.

1. The Key Distribution Center (KDC) decrypts the TGT with its own secret key, extracting the user's logon session key to decrypt the authenticator. The KDC extracts the user's Privilege Attribute Certificate (PAC) from the TGT and creates the Service Key (KS) via the SPN associated account secret in Active Directory (AD).

1. The KDC encrypts one copy of the new session key (KC,S) with the user's logon session key and embeds another copy in a ticket, along with the user's authorization data. The service ticket is encrypted with the service key KS; {T}KS = {C,S, t, PAC, KC,S}KS. The KDC sends these credentials back to the client in a ticket-granting service reply (KRB_TGS_REP).

1. The Kerberos client receives the reply, uses the user's logon session key to decrypt the session key KC,S to use with the service, then extracts the ticket to the service and stores that in its cache as TGS.

1. The TGS is provided to the application as a Kerberos application request (KRB_AP_REQ), embedded in the client-server protocol, such as SMB or HTTP as {T}KS {Authenticator}KC,S, with {T}KS = {C,S, t, PAC, KC,S}KS and {Authenticator}KC,S = {C,...,t}KC,S.

1. The server decrypts the ticket, extracts the user's authorization data and session key, decrypts the user's authenticator, and evaluates the timestamp.

1. If the authenticator passes the test, the service looks for the mutual authentication flag in the client's request (default for Windows).

1. If set, the service uses the session key to encrypt the time from the user's authenticator and returns the result in a Kerberos application reply (KRB_AP_REP) as {t}KC,S. If the flag is not set, no response is needed.

1. The client receives the KRB_AP_REP, decrypts the service's authenticator with the session key it shares with the service, and compares the time returned by the service with the time in the client's original authenticator. If the times match, the client knows that the service is genuine and trusted. This is mutual authentication.

### ETL Examples

#### Client:

#### Kerberos.etl

```plaintext
[3] 0338.0474::06/28/24-04:12:52.6079689 [KERBEROS] kerbtick_cxx3758 __KerbGetTgsTicket() - TargetName HTTP/server1.contoso.com
[3] 0338.0474::06/28/24-04:12:52.6080074 [KERBEROS] kerbtick_cxx8323 KerbCreateApRequest() - Skewing system time. System time is 06/28/24-04:12:52.6082542
[3] 0338.0474::06/28/24-04:12:52.6080077 [KERBEROS] kerbtick_cxx8324 KerbCreateApRequest() - Skewed time is 06/28/24-04:12:52.6082542
[3] 0338.0474::06/28/24-04:12:52.6081096 [KERBEROS] kerbtick_cxx3075 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
[3] 0338.0474::06/28/24-04:12:52.6081180 [KERBEROS] kerbtick_cxx3400 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.2.51 for realm CONTOSO.COM, DesiredFlags 0, connection timeout: 0 secs
[3] 0338.0474::06/28/24-04:12:52.6081187 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.2.51
[0] 0338.0474::06/28/24-04:12:52.6089468 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.51
[0] 0338.0474::06/28/24-04:12:52.6089634 [kerbcomm] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x157c
[3] 0338.0474::06/28/24-04:12:52.6115824 [kerbcomm] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x157c
[3] 0338.0474::06/28/24-04:12:52.6116946 [KERBEROS] kerbtick_cxx7127 KerbGetServiceTicketInternal() - KerbGetReferralNames returns RealTargetRealm (null)
[3] 0338.0474::06/28/24-04:12:52.6117197 [KERBEROS] ctxtapi_cxx2807 SpInitLsaModeContext() - Building AP request for connection oriented context
[3] 0338.0474::06/28/24-04:12:52.6117204 [KERBEROS] kerbtick_cxx2581 KerbBuildApRequest() - BuildApRequest using nonce 0x4aacecb5
[3] 0338.0474::06/28/24-04:12:52.6118112 [KERBEROS] kerbtick_cxx8323 KerbCreateApRequest() - Skewing system time. System time is 06/28/24-04:12:52.6108534
[3] 0338.0474::06/28/24-04:12:52.6118116 [KERBEROS] kerbtick_cxx8324 KerbCreateApRequest() - Skewed time is 06/28/24-04:12:52.6108534
[2] 0338.0474::06/28/24-04:12:52.6130609 [KERBEROS] ctxtapi_cxx3356 SpInitLsaModeContext() - SpInitLsaModeContext returned 0x90312, Context 000001D64B293CC0, Pid 0x2a2c
[2] 0338.0474::06/28/24-04:12:52.6130615 [KERBEROS] ctxtapi_cxx3357 SpInitLsaModeContext() - SpInitLsaModeContext returned 0x90312
[3] 0338.0474::06/28/24-04:12:52.6279587 [KERBEROS] ctxtapi_cxx80 SpDeleteContext() - SpDeleteContext 000001D64B293CC0 called
[3] 0338.0474::06/28/24-04:12:52.6280145 [KERBEROS] ctxtapi_cxx141 SpDeleteContext() - SpDeleteContext returned 0x0, Context 000001D64B293CC0, Pid 0x2a2c
[3] 0338.0474::06/28/24-04:12:52.6280149 [KERBEROS] ctxtapi_cxx143 SpDeleteContext() - SpDeleteContext returned 0x0
```

#### Server:

#### Kerberos.etl

```plaintext
[0] 02B0.02D4::06/28/24-04:12:52.8431088 [KERBEROS] ctxtapi_cxx3425 SpAcceptLsaModeContext() - SpAcceptLsaModeContext 0000000000000000 called
[0] 02B0.02D4::06/28/24-04:12:52.8431937 [KERBEROS] ctxtapi_cxx4024 SpAcceptLsaModeContext() - Accepting connection first call
[0] 02B0.02D4::06/28/24-04:12:52.8431989 [KERBEROS] kerbtick_cxx8689 KerbVerifyApRequest() - KerbVerifyApRequest UseSuppliedCreds false
[0] 02B0.02D4::06/28/24-04:12:52.8432221 [KERBEROS] kerbtick_cxx8821 KerbVerifyApRequest() - KerbVerifyApRequest AP options = 0x20000000
[0] 02B0.02D4::06/28/24-04:12:52.8432241 [KERBEROS] kerbtick_cxx8152 KerbDecryptServiceTicket() - Skewing system time. System time is 06/28/24-04:12:52.8292081
[0] 02B0.02D4::06/28/24-04:12:52.8432244 [KERBEROS] kerbtick_cxx8153 KerbDecryptServiceTicket() - Skewed time is 06/28/24-04:17:52.8292081
[0] 02B0.02D4::06/28/24-04:12:52.8433073 [commoniumsafe] tickets_cxx1011 KerbCheckTicket() - KerbCheckTicket: Using sub session key from authenticator.
[0] 02B0.02D4::06/28/24-04:12:52.8433081 [KERBEROS] kerbtick_cxx8401 KerbDecryptServiceTicket() - KerbDecryptServiceTicket ticket check succeeded using key 0
[0] 02B0.02D4::06/28/24-04:12:52.8433121 [KERBEROS] logonses_cxx4512 KerbUpdateDecryptingCredential() - primary credential 0000013C175D3F68 already has the server name HTTP/server1.contoso.com.
[0] 02B0.02D4::06/28/24-04:12:52.8433376 [KERBEROS] timesync_cxx184 KerbUpdateSkewTime() - Updating skew statistics: Skewed = 0, successful = 10, latest = Success
[0] 02B0.02D4::06/28/24-04:12:52.8433386 [KERBEROS] ctxtapi_cxx4191 SpAcceptLsaModeContext() - AcceptLsaModeContext: Creating token from ticket
[0] 02B0.02D4::06/28/24-04:12:52.8433513 [KERBEROS] krbtoken_cxx1132 KerbVerifyPacSignature() - KerbVerifyPacSignature returning DnsDomainName CONTOSO.COM
[0] 02B0.02D4::06/28/24-04:12:52.8433519 [KERBEROS] krbtoken_cxx1160 KerbVerifyPacSignature() - KerbVerifyPacSignature returning UPN test_user@contoso.com, defaulted: false
[0] 02B0.02D4::06/28/24-04:12:52.8434111 [KERBEROS] krbtoken_cxx1941 KerbMakeTokenInformationV3() - KerbMakeTokenInformationV3 LocalSystemSid 0, IsNetworkService 0, MaybeAddThisOrgCertSid 0
[0] 02B0.02D4::06/28/24-04:12:52.8434227 [KERBEROS] krbtoken_cxx3348 KerbCreateTokenFromTicketEx() - CreateToken : ClientName - test_user
[0] 02B0.02D4::06/28/24-04:12:52.8434231 [KERBEROS] krbtoken_cxx3360 KerbCreateTokenFromTicketEx() - CreateToken : ClientSamDomain - CONTOSO
[0] 02B0.02D4::06/28/24-04:12:52.8434794 [KERBEROS] krbtoken_cxx3567 KerbCreateTokenFromTicketEx() - KerbCreateTokenFromTicket for CONTOSO\test_user, (null)
[0] 02B0.02D4::06/28/24-04:12:52.8530446 [KERBEROS] logonses_cxx2559 KerbCreateLogonSessionFromTicket() - KerbCreateLogonSessionFromTicket creating logon session for 0:0x302c0f, accepting 0:0x3e7, client test_user@CONTOSO.COM
[0] 02B0.02D4::06/28/24-04:12:52.8530595 [KERBEROS] logonses_cxx337 KerbInsertLogonSession() - INSERT logonsess 0000013C184F7670 for 0:0x302c0f
[0] 02B0.02D4::06/28/24-04:12:52.8530801 [KERBEROS] ctxtapi_cxx4261 SpAcceptLsaModeContext() - SpAcceptLsaModeContext: Building AP reply
[0] 02B0.02D4::06/28/24-04:12:52.8530821 [KERBEROS] kerbtick_cxx9688 KerbBuildApReply() - BuildApReply using nonce 0x4d0ccff9
[0] 02B0.02D4::06/28/24-04:12:52.8531352 [KERBEROS] userapi_cxx6218 KerbGenerateOrVerifyMechlistMIC() - NOT generating mechlist MIC for context 0000013C1844B5D0, not used by SPNEGO
[0] 02B0.02D4::06/28/24-04:12:52.8531448 [KERBEROS] ctxtapi_cxx4835 SpAcceptLsaModeContext() - SpAcceptLsaModeContext called KerbMapContext ContextAttributes 0xc405, 0
[0] 02B0.02D4::06/28/24-04:12:52.8531965 [KERBEROS] ctxtapi_cxx5078 SpAcceptLsaModeContext() - SpAcceptLsaModeContext returned 0x0, Context 0000013C1844B5D0, Pid 0x0
[0] 02B0.02D4::06/28/24-04:12:52.8531968 [KERBEROS] ctxtapi_cxx5079 SpAcceptLsaModeContext() - SpAcceptLsaModeContext (0000013C1844B5D0) returned 0x0
```
