---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Another way to identify the caller process - Kerberos scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FAnother%20way%20to%20identify%20the%20caller%20process%20-%20Kerberos%20scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179903&Instance=1179903&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179903&Instance=1179903&Feedback=2)

___
<div id='cssfeedback-end'></div>

This guide provides a common troubleshooting flow for account lockout issues, focusing on Kerberos scenarios. It includes steps to enable logging, identify relevant events, and analyze Kerberos ETL traces to pinpoint the process causing the lockout.

# Common troubleshooting flow for account lockout issues

<br>

1. Enable audit and netlogon debug log on all domain controllers (DCs), and wait for the next occurrence.
    - Enlarge the security event log maximum size if needed.
2. After re-occurrence, find event 4740 containing the concerned username on all DCs.
3. Filter out event 4771/4776 containing the concerned username on all DCs.
    - Kerberos or NTLM?
    - 4771 for NTLM, and 4776 for Kerberos.

<br>

This page discusses the troubleshooting methodology for Kerberos scenarios. For NTLM, please refer to [Another way to identify the caller process - NTLM scenario](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179901).

<br>

# Kerberos

<br>

The challenge in Kerberos scenarios is that on the network, its just a Kerberos Authentication Service (AS) Pre-Authentication Failure, AS-REQ, and then AS-REP. There is no Ticket Granting Service (TGS), so you dont know the target Service Principal Name (SPN), and no communication between the client and server yet.

The source port of the AS-REQ packet belongs to SYSTEM or Local Security Authority Subsystem Service (LSASS), not the process which incurred that AS-REQ.
![Diagram showing AS-REQ packet source port](/.attachments/image-d83978b9-dc39-4d48-861d-97d0d9947ae7.png)

How to move forward?

I used to think that we could only tackle it indirectly, such as trying to guess the pattern of all the AS-REQ packets. But now I have a direct way to spot it out.

Some prerequisite knowledge first. Below is a typical framework to establish an authenticated connection in a client/server (C/S) model, which is supported by many modern platforms. You should have heard of some related names, such as Security Support Provider Interface (**SSPI**), Generic Security Services Application Program Interface (**GSSAPI**), and Simple and Protected GSSAPI Negotiation Mechanism (**SPNEGO**). Its a generic framework regardless of the transport protocol between client and server, such as Server Message Block (SMB), Hypertext Transfer Protocol (HTTP), Remote Procedure Call (RPC), etc.

![Framework diagram for authenticated connection](/.attachments/image-f0573c10-7616-4bdc-9348-17baad77ddca.png)

The client always starts with a call to **AcquireCredentialsHandle** (ACH). A handle is returned. That handle is used in all ensuing **InitializeSecurityContext** (ISC) calls.

Similarly, the server also gets a handle by calling ACH. Then that handle is passed in all **AcceptSecurityContext** (ASC) calls.

The Kerberos (and NTLM) interaction occurs during those calls. You can learn more about that model from How Windows Single Sign-On Works.

So, we just need a way to identify which process has called those functions on the client side.

Fortunately, thats recorded in the Kerberos Event Trace Log (ETL) trace, by the function AcquireCredentialsHandle.

Here is an example.

```plaintext
[2] 02AC.0D78::07/27/23-22:48:26.0640724 [KERBEROS] credapi_cxx4819  SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x1038, luid (0:16f7bf4) called 
[2] 02AC.0D78::07/27/23-22:48:26.0640852 [KERBEROS] credapi_cxx2666 KerbCaptureSuppliedCreds() - Using user labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0640856 [KERBEROS] credapi_cxx2704 KerbCaptureSuppliedCreds() - Using domain 1flower
[2] 02AC.0D78::07/27/23-22:48:26.0641384 [KERBEROS] credmgr_cxx1836 KerbCreateCredential() - Got supplied credentials
[2] 02AC.0D78::07/27/23-22:48:26.0641403 [KERBEROS] credapi_cxx5113  SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle returning success, handle = 0000021B4D4A3B10 
[2] 02AC.0D78::07/27/23-22:48:26.0641409 [KERBEROS] credapi_cxx5155 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x1038, luid (0:16f7bf4) returned 0x0
[2] 02AC.0D78::07/27/23-22:48:26.0641838 [KERBEROS] credapi_cxx4819 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x1038, luid (0:16f7bf4) called
[2] 02AC.0D78::07/27/23-22:48:26.0642015 [KERBEROS] credapi_cxx2666 KerbCaptureSuppliedCreds() - Using user labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0642019 [KERBEROS] credapi_cxx2704 KerbCaptureSuppliedCreds() - Using domain 1flower
[2] 02AC.0D78::07/27/23-22:48:26.0642245 [KERBEROS] credmgr_cxx1433 KerbLocateCredential() - KerbLocateCredential found credential 0000021B4D4A3B10, supplied creds 0000021B4E5B1740, HandleCount 2
[2] 02AC.0D78::07/27/23-22:48:26.0642252 [KERBEROS] credapi_cxx5113 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle returning success, handle = 0000021B4D4A3B10
[2] 02AC.0D78::07/27/23-22:48:26.0642276 [KERBEROS] kerbs4u_cxx291 KerbAgeS4U2ProxyCache() - Reset expired S4U2Proxy cache 0000021B4E5B0DC0 flags for logon session: 0:16f7bf4, Flags 0, LastStatus 0, Expiry 0, RemoveAll 1
[2] 02AC.0D78::07/27/23-22:48:26.0642282 [KERBEROS] credapi_cxx5155 SpAcquireCredentialsHandle() - SpAcquireCredentialsHandle for pid 0x1038, luid (0:16f7bf4) returned 0x0
[2] 02AC.0D78::07/27/23-22:48:26.0644039 [KERBEROS] ctxtapi_cxx995 SpInitLsaModeContext() - SpInitLsaModeContext 0000000000000000 called
[2] 02AC.0D78::07/27/23-22:48:26.0644073 [KERBEROS] ctxtapi_cxx602 KerbProcessTargetNames() - Parsed name HTTP/sts1.1flower.com ((null)) into:             name type 0x2, name count 2,    realm (null),        first part HTTP/sts1.1flower.com
[2] 02AC.0D78::07/27/23-22:48:26.0644122 [KERBEROS] ctxtapi_cxx779 KerbProcessTargetNames() - Cracked name HTTP/sts1.1flower.com
[2] 02AC.0D78::07/27/23-22:48:26.0644155 [KERBEROS] ctxtapi_cxx780 KerbProcessTargetNames() - into HTTP/sts1.1flower.com
[2] 02AC.0D78::07/27/23-22:48:26.0644161 [KERBEROS] ctxtapi_cxx2145 SpInitLsaModeContext() - SpInitLsaModeContext: First call to Initialize
[2] 02AC.0D78::07/27/23-22:48:26.0644169 [KERBEROS] credmgr_cxx997 KerbReferenceCredentialEx() - Credential 000000FE1C77D3C8 is missing flags: needs 80000000
[2] 02AC.0D78::07/27/23-22:48:26.0644172 [KERBEROS] credmgr_cxx1019  KerbReferenceCredentialEx() - Getting missing TGT for credential 0000021B4D4A3B10 
[2] 02AC.0D78::07/27/23-22:48:26.0644182 [KERBEROS] kerbtick_cxx449 KerbGetTgtForService() - KerbGetTgtForService TargetFlags 0, SuppRealm (null), TargetDomain (null)
[2] 02AC.0D78::07/27/23-22:48:26.0644187 [KERBEROS] kerbtick_cxx589 KerbGetTgtForService() - KerbGetTgtForService refreshing primary TGT for account
[2] 02AC.0D78::07/27/23-22:48:26.0644190 [KERBEROS] kerbtick_cxx363 KerbGetTgtForService() - KerbRefreshPrimaryTgt getting new TGT for account
[2] 02AC.0D78::07/27/23-22:48:26.0644192 [KERBEROS] credmgr_cxx595 KerbGetTicketForCredential() - Got a credential && a logon session
[2] 02AC.0D78::07/27/23-22:48:26.0644201 [KERBEROS] ctxtapi_cxx602 KerbProcessTargetNames() - Parsed name labadmin ((null)) into:        name type 0x1, name count 1,    realm (null),        first part labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0644211 [KERBEROS] ctxtapi_cxx779 KerbProcessTargetNames() - Cracked name labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0644224 [KERBEROS] ctxtapi_cxx780 KerbProcessTargetNames() - into labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0644232 [KERBEROS] logonapi_cxx5525 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm 1flower
[2] 02AC.0D78::07/27/23-22:48:26.0644249 [KERBEROS] logonapi_cxx2137 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0644252 [KERBEROS] logonapi_cxx2138 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm 1flower
[2] 02AC.0D78::07/27/23-22:48:26.0644266 [KERBEROS] logonapi_cxx2139 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/1flower
[2] 02AC.0D78::07/27/23-22:48:26.0644280 [KERBEROS] logonapi_cxx2305 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket using supplied credentials 1flower\labadmin
[2] 02AC.0D78::07/27/23-22:48:26.0644290 [KERBEROS] logonapi_cxx2306 KerbGetAuthenticationTicketEx() - to ServiceName krbtgt/1flower
[2] 02AC.0D78::07/27/23-22:48:26.0644339 [KERBEROS] logonapi_cxx726 KerbBuildPreAuthData() - Skewing system time. System time is 07/27/23-22:48:26.0586298
[2] 02AC.0D78::07/27/23-22:48:26.0644342 [KERBEROS] logonapi_cxx727 KerbBuildPreAuthData() - Skewed time is 07/27/23-22:48:26.0586298
[2] 02AC.0D78::07/27/23-22:48:26.0644348 [KERBEROS] logonapi_cxx465 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current password of labadmin@1flower
[2] 02AC.0D78::07/27/23-22:48:26.0644408 [KERBEROS] logonapi_cxx3198 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000000000000000
[2] 02AC.0D78::07/27/23-22:48:26.0644483 [KERBEROS] logonapi_cxx3257 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
[2] 02AC.0D78::07/27/23-22:48:26.0644489 [KERBEROS] kerbtick_cxx3017 KerbMakeSocketCallEx() - KerbMakeSocketCall uses KdcToCall option 0.
[2] 02AC.0D78::07/27/23-22:48:26.0644535 [KERBEROS] kerbtick_cxx3334 KerbMakeSocketCallEx() - Retry #0 Calling kdc 192.168.2.56 for realm 1flower, DesiredFlags 0, connection timeout: 0 secs
[2] 02AC.0D78::07/27/23-22:48:26.0644542 [common2] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.2.56
[0] 02AC.0D78::07/27/23-22:48:26.0654441 [common2] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.56
[0] 02AC.0D78::07/27/23-22:48:26.0654633 [common2] sockets_cxx777 KerbCallKdcEx() - Socket being used for select is 0x14d8
[0] 02AC.0D78::07/27/23-22:48:26.0661885 [common2] sockets_cxx862 KerbCallKdcEx() - Socket being used for select is 0x14d8
[0] 02AC.0D78::07/27/23-22:48:26.0662383 [KERBEROS] logonapi_cxx3314 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
[0] 02AC.0D78::07/27/23-22:48:26.0662426 [commoniumsafe] tickets_cxx2784 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
[0] 02AC.0D78::07/27/23-22:48:26.0662431 [KERBEROS] logonapi_cxx3419 KerbGetAuthenticationTicketEx() - Failed to unpack KDC reply as AS: 0x3c
[0] 02AC.0D78::07/27/23-22:48:26.0662524 [commoniumsafe] tickets_cxx2784 KerbUnpackData() - KerbUnpackData Asn1Err 0xfffffc0d
[0] 02AC.0D78::07/27/23-22:48:26.0662531 [commoniumsafe] utils_cxx118 KerbUnpackErrorData() - KerbUnpackData failed to unpack typed data, trying error method data
[0] 02AC.0D78::07/27/23-22:48:26.0662577 [commoniumsafe] utils_cxx189 KerbUnpackErrorData() - KerbUnpackErrorData received failure from kdc 0x12 KLIN(0) NTSTATUS(0xc0000234)
[0] 02AC.0D78::07/27/23-22:48:26.0662588 [KERBEROS] logonapi_cxx3567 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0x12, extendedStatus 0xc0000234
[0] 02AC.0D78::07/27/23-22:48:26.0662633 [Microsoft.Windows.Security.Kerberos] [GetTgtStop] status=0xC0000234, kerberr=0x12, serviceNameFirstPart=krbtgt, kerbRunningIsolated=false, eType=0x0, pdu=0x0, pkCredsPresent=false, pwdCredsPresent=true, selfSignedCreds=false
[0] 02AC.0D78::07/27/23-22:48:26.0662679 [KERBEROS] kerbtick_cxx612 KerbGetTgtForService() - KerbGetTgtForService failed to refresh primary TGT: 0xc0000234
[0] 02AC.0D78::07/27/23-22:48:26.0662699 [KERBEROS] ctxtapi_cxx2173 SpInitLsaModeContext() - SpInitLsaModeContext failed to locate credential 0x0, InitialStatus 0xc0000234
[0] 02AC.0D78::07/27/23-22:48:26.0662711 [KERBEROS] ctxtapi_cxx3316 SpInitLsaModeContext() - SpInitLsaModeContext returned 0xc0000234, Context 0000000000000000, Pid 0x0
[0] 02AC.0D78::07/27/23-22:48:26.0662714 [KERBEROS] ctxtapi_cxx3317 SpInitLsaModeContext() - SpInitLsaModeContext returned 0xc0000234
```

![image.png](/.attachments/image-14ca3219-5d65-494d-b412-1a5438f9afc2.png)

# References

<br>

[JNA: AcquireCredentialsHandle, InitializeSecurityContext and AcceptSecurityContext - Establishing an Authenticated Connection  code.dblock.org | tech blog](https://code.dblock.org/2010/03/26/jna-acquirecredentialshandle-initializesecuritycontext-and-acceptsecuritycontext-establishing-an-authenticated-connection.html)

[How Windows Single Sign-On Works (syfuhs.net)](https://syfuhs.net/how-windows-single-sign-on-works)

[SpInitLsaModeContextFn (ntsecpkg.h) - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/api/ntsecpkg/nc-ntsecpkg-spinitlsamodecontextfn)