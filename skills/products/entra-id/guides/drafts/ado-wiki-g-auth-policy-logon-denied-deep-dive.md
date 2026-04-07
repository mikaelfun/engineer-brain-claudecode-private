---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/Troubleshooting/Deep-dive/Logon Denied"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/Troubleshooting/Deep-dive/Logon%20Denied"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924662&Instance=1924662&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924662&Instance=1924662&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides detailed instructions on troubleshooting using logs a logon denied only on a set of devices.

[[_TOC_]]

# Scenario
This scenario has a purpose of allowing a domain admin account to log on only on domain controllers (DC) servers, and prevent this account to log on on member servers and workstations.

#Configuration

- Policy linked to a silo  
  ![screenshot of authentication policy settings](/.attachments/image-144d11c6-1305-4c92-ad2d-23f09943c44a.png =800x400)

  ![screenshot of authentication policy settings](/.attachments/image-03124be6-95b6-4847-892f-538be1cedeb0.png =800x400)

- Silo linked to a policy   
  ![screenshot of authentication silo settings](/.attachments/image-726cc471-9fd3-433a-a98b-935efd4b9c7c.png =800x400)    
  ![screenshot of authentication silo settings](/.attachments/image-ae9a03a0-d5d7-4810-8a59-cbb75d03b106.png =800x200)

---
#Data analysis

You can use these .tat filters available here:

![kerbauthNPolicy&silo-0xc tat filter](/.attachments/image-9661f779-deb4-4bd9-ad28-b43c53eb1cec.png =200x150)

![kdcauthNPolicy&silo-0xc tat filter](/.attachments/image-4479f70f-7fcc-4c2c-8d0c-f1312bd9e334.png =200x150)

## Logon on Domain controller (DC) part of silo / successful logon as expected

![screenshot of whoami /claims](/.attachments/image-af0233b3-1d1b-4220-ac0d-1e70bc1422bf.png =800x300)

Klist show policy setting is honored, TGT lifetime is = 120 minutes (2 hours) and uses FAST.
```
Cached Tickets: (2)

#0>     Client: admin1 @ CONTOSO.COM
        Server: krbtgt/CONTOSO.COM @ CONTOSO.COM
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
        Ticket Flags 0x40a10000 -> forwardable renewable pre_authent name_canonicalize
        Start Time: 1/28/2025 6:35:06 (local)
        End Time:   1/28/2025 8:35:06 (local)
        Renew Time: 1/28/2025 8:35:06 (local)
        Session Key Type: AES-256-CTS-HMAC-SHA1-96
        Cache Flags: 0x40 -> FAST
        Kdc Called: DC2

#1>     Client: admin1 @ CONTOSO.COM
        Server: krbtgt/CONTOSO.COM @ CONTOSO.COM
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
        Ticket Flags 0x40e10000 -> forwardable renewable initial pre_authent name_canonicalize
        Start Time: 1/28/2025 6:35:06 (local)
        End Time:   1/28/2025 8:35:06 (local)
        Renew Time: 1/28/2025 8:35:06 (local)
        Session Key Type: AES-256-CTS-HMAC-SHA1-96
        Cache Flags: 0x41 -> PRIMARY FAST
        Kdc Called: DC2
```

## Logon on a device which is not a DC / logon denied as expected

The admin1 can only connect on DC per policy and silo.
Trying a logon on device WIN11SC1 leads to:

### Microsoft-Windows-Authentication/AuthenticationPolicyFailures-DomainController
using the following XML filter:  
`*[System[(EventID=105)]]and*[EventData[Data[@Name="TargetUserName"] = "admin1"]]`

```event
A Kerberos Ticket-granting-ticket (TGT) was denied because the device does not meet the access control restrictions.

Account Information:
	Account Name:		admin1
	Supplied Realm Name:	
	User ID:			CONTOSO\admin1

Authentication Policy Information:
	Silo Name:		DA2DCSilos
	Policy Name:		DA2DCs
	TGT Lifetime:		120

Device Information:
	Device Name:		WIN11SC1$

Service Information:
	Service Name:		krbtgt/CONTOSO
	Service ID:		S-1-5-21--0

Network Information:
	Client Address:		::ffff:192.168.x.x
	Client Port:		49971

Additional Information:
	Ticket Options:		0x87B
	Result Code:		0xC
	Ticket Encryption Type:	0x38
	Pre-Authentication Type:	0
```

### Kerberos.etl from client device

```
1051 [0] 0338.096C::01/09/25-17:45:27.8058997 [KERBEROS] logonapi_cxx9494 KerbILogonUserEx3() - Logging on user admin1, domain CONTOSO
1076 [0] 0338.096C::01/09/25-17:45:27.8105798 [KERBEROS] logonapi_cxx2158 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client admin1
1081 [0] 0338.096C::01/09/25-17:45:27.8105937 [KERBEROS] logonapi_cxx2463 KerbGetAuthenticationTicketEx() - AllowFast: 1
1082 [0] 0338.096C::01/09/25-17:45:27.8106000 [KERBEROS] krbfast_cxx725 KerbGetExtendedPolicies() - Probing domain CONTOSO.COM for extended policies
1083 [0] 0338.096C::01/09/25-17:45:27.8106027 [KERBEROS] krbfast_cxx726 KerbGetExtendedPolicies() - Using krbtgt/CONTOSO.COM
1085 [0] 0338.096C::01/09/25-17:45:27.8106101 [KERBEROS] kerbtick_cxx6973 KerbGetServiceTicketInternal() - got a probing ticket from the domain CONTOSO.COM
1087 [0] 0338.096C::01/09/25-17:45:27.8106177 [KERBEROS] krbfast_cxx805 KerbGetExtendedPolicies() - Probed extended policy for domain CONTOSO.COM: 0x50000
1088 [0] 0338.096C::01/09/25-17:45:27.8106185 [KERBEROS] logonapi_cxx2686 KerbGetAuthenticationTicketEx() - AS-REQ to domain CONTOSO using FAST
1089 [0] 0338.096C::01/09/25-17:45:27.8106189 [KERBEROS] logonapi_cxx2707 KerbGetAuthenticationTicketEx() - AS-REQ to claims capable domain CONTOSO
1090 [0] 0338.096C::01/09/25-17:45:27.8106231 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::BuildTicketArmorKey - Start call to LsaIso
1091 [0] 0338.096C::01/09/25-17:45:27.8126155 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::BuildTicketArmorKey - End call to LsaIso
1094 [0] 0338.096C::01/09/25-17:45:27.8126194 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::CreateApReqAuthenticator - Start call to LsaIso
1095 [0] 0338.096C::01/09/25-17:45:27.8141682 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::CreateApReqAuthenticator - End call to LsaIso
1100 [0] 0338.096C::01/09/25-17:45:27.8142243 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::BuildFastArmoredKdcRequest - Start call to LsaIso
1101 [0] 0338.096C::01/09/25-17:45:27.8158383 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::BuildFastArmoredKdcRequest - End call to LsaIso
1105 [0] 0338.096C::01/09/25-17:45:27.8158698 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 192.168.x.x
1112 [0] 0338.096C::01/09/25-17:45:27.8327897 [KERBEROS] kerbcredisoium_cxx37 TraceRpcStart() - KerbCredIsoIum::DecryptFastArmoredKerbError - Start call to LsaIso
1113 [1] 0338.096C::01/09/25-17:45:27.8343990 [KERBEROS] kerbcredisoium_cxx42 TraceRpcEnd() - KerbCredIsoIum::DecryptFastArmoredKerbError - End call to LsaIso
1114 [1] 0338.096C::01/09/25-17:45:27.8344177 [KERBEROS] logonapi_cxx3542 KerbGetAuthenticationTicketEx() - Received FAST armored KRB-ERROR in response to AS-REQ: 0xc
1115 [0] 0338.096C::01/09/25-17:45:27.8387513 [KERBEROS] logonapi_cxx3627 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0xc, extendedStatus 0xc0000070
1117 [1] 0338.096C::01/09/25-17:45:27.8545265 [KERBEROS] logonapi_cxx6822 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket: Showing Stale Cred Notification Balloon, Status 0xc0000070, BalloonType StaleCredentials, CacheLogonFlags 0x20, LogonSessionFlags 0x200001, UsedPrimaryLogonCreds y, ProtectedUser n
1118 [1] 0338.096C::01/09/25-17:45:27.8545478 [KERBEROS] logonapi_cxx1825 KerbPingWlBalloon() - Opening winlogon event Global\000000000038736a_WlballoonKerberosNotificationEventName failed 2
1119 [1] 0338.096C::01/09/25-17:45:27.8545537 [KERBEROS] logonapi_cxx10219 KerbILogonUserEx3() - LogonUser: Failed to get TGT for CONTOSO\admin1 : 0xc0000070
1121 [1] 0338.096C::01/09/25-17:45:27.8545598 [KERBEROS] logonapi_cxx11068 KerbILogonUserEx3() - LogonUser returned c000006e, c0000070
1130 [0] 0338.032C::01/09/25-17:45:38.0644882 [KERBEROS] logonapi_cxx11068 KerbILogonUserEx3() - LogonUser returned c000010b, 0
```

### Kdc.etl from DC

```
 918 [0] 02E0.0D30::01/09/25-17:45:27.8184190 [lib] getas_cxx4805 I_GetASTicket() - I_GetASTicket for client admin1
 934 [0] 02E0.0D30::01/09/25-17:45:27.8328868 [lib] getas_cxx5792 I_GetASTicket() - LogonRestriction check failed: LogonStatus: 0xc0000070 KRB: 0xc
 935 [0] 02E0.0D30::01/09/25-17:45:27.8328874 [lib] getas_cxx6062 I_GetASTicket() - KLIN(40317ae) Logon restriction check failed: LogonStatus: 0xc0000070 KRB: 0xc
 936 [0] 02E0.0D30::01/09/25-17:45:27.8328935 [lib] getas_cxx7662 I_GetASTicket() - KLIN(4031dee) Calling Failedlogon: LogonStatus: 0xc0000070 KRB: 0xc
```