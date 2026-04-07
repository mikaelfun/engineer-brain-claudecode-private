---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/Troubleshooting/Deep-dive/TGS Request fail"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/Troubleshooting/Deep-dive/TGS%20Request%20fail"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924664&Instance=1924664&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924664&Instance=1924664&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides detailed instructions on troubleshooting TGS acquisition failure for specific users, devices and SPNs.

[[_TOC_]]

#Scenario

This scenario has a purpose of allowing an account to access a specific kerberos protected resource and prevent others users to reach the same resource. 
In this example, we will use ADFS SSO page with Edge configured to use WIA.  
Then allowed user will be able to request and obtain a TGS for SPN HTTP/name_of_adfs_farm


#Configuration

Policy  
![Screenshot of authentication policy settings](/.attachments/image-1b197382-2f67-49ae-9e1c-44c823124376.png)

![Screenshot of authentication policy settings](/.attachments/image-edb00ef4-8abc-4281-9dce-6870a0bc3d27.png)

![Screenshot of authentication policy settings](/.attachments/image-3932097e-ac42-42d8-b4cb-6b06c4cd2ce1.png)

 We are not using Silo here.

---
# Data analysis
based on the configuration only userstd can request a TGS for HTTP/name_of_adfs_farm.

If another user, userstd1 is trying to access the adfs signon page or try to acquire the SPN manually, it fails and the user either is prompted and get an error: 

![screenshot of prompt in edge and klist failure](/.attachments/image-614f6abd-de9f-4067-8695-d9cf68cb0574.png)

![screenshot of tat filter for kdc](/.attachments/image-5521e57f-b0cd-4ea4-86db-cc0927a25be7.png =200x150)

![screenshot of tat filter for kerberos](/.attachments/image-86c9ef84-4089-4b6a-b296-8dca01f1a798.png =200x150)

## Allowed user

TGT is 60 minutes and TGS is obtained:

```
#0>     Client: userstd @ CONTOSO.COM
        Server: krbtgt/CONTOSO.COM @ CONTOSO.COM
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
        Ticket Flags 0x40e10000 -> forwardable renewable initial pre_authent name_canonicalize
        Start Time: 1/20/2025 8:47:44 (local)
        End Time:   1/20/2025 9:47:44 (local)
        Renew Time: 1/20/2025 9:47:44 (local)
        Session Key Type: AES-256-CTS-HMAC-SHA1-96
        Cache Flags: 0x41 -> PRIMARY FAST
        Kdc Called: DC1

#1>     Client: userstd @ CONTOSO.COM
        Server: HTTP/adfsjo1.contoso.com @ CONTOSO.COM
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96
        Ticket Flags 0x40a10000 -> forwardable renewable pre_authent name_canonicalize
        Start Time: 1/20/2025 8:51:49 (local)
        End Time:   1/20/2025 9:47:44 (local)
        Renew Time: 1/20/2025 9:47:44 (local)
        Session Key Type: AES-256-CTS-HMAC-SHA1-96
        Cache Flags: 0x40 -> FAST
        Kdc Called: DC1.Contoso.com
```

## Microsoft-Windows-Authentication/AuthenticationPolicyFailures-DomainController

`*[System[(EventID=105)]]and*[EventData[Data[@Name="TargetUserName"] = "userstd1"]]`

```
A Kerberos service ticket was denied because the user, device, or both does not meet the access control restrictions.

Account Information:
	Account Name:		UserStd1@CONTOSO.COM
	Account Domain:		CONTOSO.COM
	Logon GUID:		{00000000-0000-0000-0000-000000000000}

Authentication Policy Information:
	Silo Name:		
	Policy Name:		RestrictTGS-ADFS-CIFS

Device Information:
	Device Name:		

Service Information:
	Service Name:		STSJOGmsa$
	Service ID:		CONTOSO\STSJOGmsa$

Network Information:
	Client Address:		::ffff:192.168.100.13
	Client Port:		51314

Additional Information:
	Ticket Options:		0x87B
	Ticket Encryption Type:	0x1C
	Failure Code:		0xC
	Transited Services:	-
```


## Kerberos.etl from client

```
353 [0] 033C.2D24::01/20/25-14:15:24.3212230 [KERBEROS] kerbtick_cxx7008 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName HTTP/adfsjo1.contoso.com
357 [0] 033C.2D24::01/20/25-14:15:24.3214667 [KERBEROS] krbfast_cxx725 KerbGetExtendedPolicies() - Probing domain CONTOSO.COM for extended policies
358 [0] 033C.2D24::01/20/25-14:15:24.3215209 [KERBEROS] krbfast_cxx726 KerbGetExtendedPolicies() - Using krbtgt/CONTOSO.COM
360 [0] 033C.2D24::01/20/25-14:15:24.3216270 [KERBEROS] kerbtick_cxx6973 KerbGetServiceTicketInternal() - got a probing ticket from the domain CONTOSO.COM
363 [0] 033C.2D24::01/20/25-14:15:24.3218091 [KERBEROS] krbfast_cxx805 KerbGetExtendedPolicies() - Probed extended policy for domain CONTOSO.COM: 0x50000
364 [0] 033C.2D24::01/20/25-14:15:24.3218624 [KERBEROS] kerbtick_cxx4170 __KerbGetTgsTicket() - TGS-REQ to domain CONTOSO.COM using FAST
365 [0] 033C.2D24::01/20/25-14:15:24.3219149 [KERBEROS] kerbtick_cxx4214 __KerbGetTgsTicket() - TGS-REQ to domain CONTOSO.COM requesting claims
391 [1] 033C.2D24::01/20/25-14:15:24.5032480 [KERBEROS] kerbtick_cxx4756 __KerbGetTgsTicket() - Received FAST armored KRB-ERROR in response to TGS-REQ: 0xc
393 [1] 033C.2D24::01/20/25-14:15:24.5082997 [KERBEROS] kerbtick_cxx4856 __KerbGetTgsTicket() - KerbGetTgsTicket KDC error reply: 0xc, ExtendedStatus 0xc0000413
395 [1] 033C.2D24::01/20/25-14:15:24.5609317 [KERBEROS] kerbtick_cxx7111 KerbGetServiceTicketInternal() - Failed to get TGS ticket for service 0xc0000413
397 [1] 033C.2D24::01/20/25-14:15:24.5610392 [KERBEROS] ctxtapi_cxx2706 SpInitLsaModeContext() - SpInitLsaModeContext failed to get outbound ticket, KerbGetServiceTicket <NULL> failed with 0xc0000413
```

## From Kdc.etl from DC

```
161 [0] 02E4.0D74::01/20/25-14:15:24.5009034 [lib] gettgs_cxx5489 I_GetTGSTicket() - I_GetTGSTicket [entering] trying to build a new ticket HTTP/adfsjo1.contoso.com
162 [0] 02E4.0D74::01/20/25-14:15:24.5009043 [lib] gettgs_cxx5539 I_GetTGSTicket() - I_GetTGSTicket requesting u2u? FALSE
163 [0] 02E4.0D74::01/20/25-14:15:24.5009049 [lib] tktutil_cxx1262 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0x10000000, ExtendedFields 0x2000804, PrincipalName 000001C3D4804530, PrincipalRealm (null), RequestRealm CONTOSO.COM, TgtClientRealm CONTOSO.COM, NameFlags 0x16, MappedAttr 0000000000000000
164 [0] 02E4.0D74::01/20/25-14:15:24.5009079 [lib] tktutil_cxx1264 KdcNormalize() - PrincipalName HTTP/adfsjo1.contoso.com
165 [0] 02E4.0D74::01/20/25-14:15:24.5009085 [lib] tktutil_cxx1864 KdcNormalize() - KdcNormalize checking UPN
166 [0] 02E4.0D74::01/20/25-14:15:24.5009097 [lib] tktutil_cxx1896 KdcNormalize() - KdcNormalize lookup up upn/spn HTTP/adfsjo1.contoso.com
167 [0] 02E4.0D74::01/20/25-14:15:24.5009102 [lib] tktutil_cxx5629 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts true, WhichFields 0x10000000, ExtendedFields 0x2000804, GenericUserName HTTP/adfsjo1.contoso.com, LookupFlags 0x40, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x1
168 [0] 02E4.0D74::01/20/25-14:15:24.5009108 [lib] tktutil_cxx5631 KdcGetTicketInfo() - PrincipalName (empty)
169 [0] 02E4.0D74::01/20/25-14:15:24.5011914 [lib] tktutil_cxx6053 KdcGetTicketInfo() - KdcGetTicketInfo getting user keys
170 [0] 02E4.0D74::01/20/25-14:15:24.5012185 [lib] tktutil_cxx6159 KdcGetTicketInfo() - KdcGetTicketInfo enabling account for protocol transition via A2DF
171 [0] 02E4.0D74::01/20/25-14:15:24.5012192 [lib] tktutil_cxx6260 KdcGetTicketInfo() - KdcGetTicketInfo UserName: STSJOGmsa$, TicketOpts: 0x87b, PasswordExpires: FileTimeToSystemTime error 0x      57
172 , LockoutThreshold: 4294967295l, UserAccountControl: 0x7fffffff, SupportedEncryptionTypes 0x0, WhenCreated: 01/01/01-04:20:25.9084416
173 [0] 02E4.0D74::01/20/25-14:15:24.5012198 [lib] tktutil_cxx6340 KdcGetTicketInfo() - KdcGetTicketInfo [Leaving] 0
174 [0] 02E4.0D74::01/20/25-14:15:24.5012210 [lib] tktutil_cxx2303 KdcNormalize() - KdcNormalize [Leaving] 0
175 [0] 02E4.0D74::01/20/25-14:15:24.5012330 [lib] newpac_cxx1134 KdcVerifyPacSignature() - Using tgt key type 0x12(18) to verify server signature.
176 [0] 02E4.0D74::01/20/25-14:15:24.5012447 [lib] newpac_cxx1342 KdcVerifyPacSignature() - Skipping additional signature verification when source ticket is TGT.
177 [0] 02E4.0D74::01/20/25-14:15:24.5015182 [lib] gettgs_cxx6612 I_GetTGSTicket() - I_GetTGSTicket [Leaving] 0xc
```