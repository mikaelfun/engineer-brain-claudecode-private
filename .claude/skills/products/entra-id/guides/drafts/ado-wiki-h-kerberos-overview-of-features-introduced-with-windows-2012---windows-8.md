---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: overview of features introduced with Windows 2012 - Windows 8"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20overview%20of%20features%20introduced%20with%20Windows%202012%20-%20Windows%208"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1963067&Instance=1963067&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1963067&Instance=1963067&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides an overview of new features introduced with Windows 2012 and Windows 8, focusing on Kerberos enhancements such as KDC Proxy, Kerberos Armoring (FAST), and Dynamic Access Control. It includes detailed protocol flows, configuration guidelines, and supportability changes.

[[_TOC_]]

# Introduction

Further new features introduced with Windows Server 2012 and Windows 8.

---

# Topics

- KDC Proxy - Overview
- KDC Proxy - Protocol flow
- Kerberos Armoring - Flexible Authentication Secure Tunneling (FAST)
- Kerberos Armoring (FAST)  Protocol flow
- Kerberos Compound Authentication  FAST extension
- Network frames - FAST negotiation
- Dynamic Access Control (Claims) for legacy clients
- Windows Server 2012 RODC claims-awareness
- Disabling full delegation across forest trusts
- Supportability changes

---

# KDC Proxy

## Overview

- **KDC Proxy**: Uses TLS and HTTP to transport Kerberos AS and TGS requests to and from a computer residing on the Internet. The KDC Proxy consists of two components: the Kerberos proxy client (KPC) and the KDC proxy server (KPS).
- **Kerberos Proxy Client (KPC)**: Implemented within the Kerberos client (Kerberos.dll). KPC uses WinHttp APIs (winhttp.dll) to support TLS communication to the KPS. The client receives the KDC proxy URL from the DirectAccess or Remote Desktop client. For application use, configure GPO: `Computer Configuration\Policies\Administrative Templates\System\Kerberos\Specific KDC proxy servers for Kerberos clients`. Registry: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\KDCProxy`.
- **KDC Proxy Server Service (KPS)**: Implemented as a separate service in new Kpssvc.dll, uses server-side HTTP APIs (http.sys), running on any Windows Server 2012 in the context of Network Service, and may be placed in a DMZ. Server configuration settings are stored in the Registry at `HKLM\System\CurrentControlSet\Services\KPSSVC`. Default URI: `https://fqdn_computer_name/KdcProxy`.

## KDC Proxy - Protocol flow

![KDC Proxy Protocol Flow](/.attachments/image-b379743d-9434-4b72-8f5b-2dc7de423e84.png)

1. KPC uses WinHTTP to build the KPC-KPS channel.
1. KPC sends an HTTP POST over the KPC-KPS channel.
1. HTTP Service in KDC Proxy receives the HTTP POST request.
1. HTTP Service hands the HTTP POST request to Kerberos Proxy Server.
1. KPS extracts the Kerberos request from the HTTP POST and retrieves the target domain.
1. KPS sends the Kerberos request to the domain controller in the target domain.
1. KDC in the target domain processes the Kerberos request.
1. KDC produces the Kerberos response.
1. KDC sends the Kerberos response to KPS.
1. KPS receives the Kerberos response from KDC.
1. KPS hands the Kerberos response to HTTP service.
1. KDC Proxy includes the Kerberos response in the HTTP 200 response.
1. KDC Proxy (KPS) sends the HTTP 200 response over the KPC-KPS channel.
1. KPC extracts the Kerberos response from the HTTP 200 response, obtaining a ticket.

For more details, refer to [Reference: KDC Proxy](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/451641/Reference-KDC-Proxy) and [Kerberos - KDC Proxy flows and architecture](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/451639/Kerberos-KDC-Proxy-flows-and-architecture).

---

# Kerberos Armoring - Flexible Authentication Secure Tunneling (FAST)

## Overview

Introduces a further level of security/encryption on AS-REQ:

- Defined in RFC 6113.
- Kerberos armoring replaces the encrypted timestamp pre-authenticator with a KrbFastArmor structure containing an encoded AP-REQ.
- The encoded AP-REQ contains a negotiated subkey and an armor TGT.
- Two keys use FAST factor (key derivation functions, a pseudo-random function to combine two keys using different encryption types) to create an armor key.
- FAST uses the computer's TGT session key as the armor TGT for the user's AS message exchange and the user's TGT session key as the armor TGT for the user's TGS message exchange.

## Goal

Prevents offline dictionary attacks on captured AS-REQ messages and KDC spoofing to allow cryptographic downgrades to weaker NTLM via SPNego.

## Configuration via GPO

- On KDC via computer group policy: `Policies\Computer Configuration\Administrative Templates\System\KDC`, KDC support for claims, compound authentication, and Kerberos armoring (`HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\KDC\Parameters`, `EnabledCbacAndArmor=1`).
- When configured for:
  - Supported (`CbacAndArmorLevel=1`),
  - Always provide claims (`CbacAndArmorLevel=2`),
  - Fail unarmored authentication requests (`CbacAndArmorLevel=3`),
  the KDC sets the FAST supported (0x00010000) bit and claims supported bit (0x00040000) of the `msDS-SupportedEncryptionTypes` attribute on the `krbtgt` account.
- On Windows clients, via Kerberos computer group policy setting Kerberos client support for claims, compound authentication, and Kerberos armoring.
- Registry: `HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters`, `EnabledCbacAndArmor=1`.
- Once applied, Windows 8+ computers negotiate Kerberos armoring and are capable of requesting compound authenticated tickets.

## Kerberos Armoring (FAST)  Protocol flow

### Overview of Kerberos Armoring

Designed to protect the user pre-authenticated data sent during the user's AS-REQ for the domain. The user's AS-REQ, when using a key generated from a user's password, is the most vulnerable portion of the Kerberos exchange to offline-dictionary attacks.

### Protocol flow

![Kerberos Armoring Protocol Flow](/.attachments/image-0ce2c2a0-1f06-487e-99e7-d62ca4cb7d4d.png)

1. Computer/device with Kerberos armoring enabled sends AS-REQ to Windows Server 2012 KDC (AS-Ping).
1. KDC sends, either in AS-REP pre-authentication exchange or in AS-REP computer's TGT information, that the domain supports Kerberos armoring. Regardless of the discovery method, the computer caches the domain's capabilities, such as Kerberos armoring and claims.
1. User sends AS-REQ, the authenticator portion is armored using the computer's TGT, thereby protecting the authenticator from dictionary attacks. Note: If the user and computer are from different domains, then the computer uses Kerberos referrals to receive an inter-realm TGT from the user's domain. The user's AS-REQ is then armored using the inter-realm TGT shared between the two domains.
1. KDC validates the user authenticator presented in the AS-REQ. KDC builds an AS-REP, armors the AS-REP with a new key based on the computer's or inter-realm TGT, and sends the AS-REP to the user.
1. User receives its TGT for the domain from the armored AS-REP. The user sends TGS-REQ to the KDC, armored using a key based on the user's TGT.
1. KDC validates the user's incoming TGT and the SPN. It creates a service ticket and a service session key in a TGS-REP, which is armored using a new key derived from the user's TGT, and sends the TGS-REP to the user.

## Kerberos Armoring - FAST in a mixed Domain

KDC Group Policy setting KDC support for claims, compound authentication, and Kerberos armoring set to Supported.

![Kerberos Armoring in a Mixed Domain](/.attachments/image-0f24ed4c-d056-495b-8097-b2366166a6ec.png)

1. Windows Client sends a normal AS-REQ for pre-authentication, the AS-PING.
1. Down-level KDC returns KDC_ERR-PREAUTH-REQUIRED in AS-REP.
1. Client performs another AS-REQ but enables the request for claims bit in the PA-PAC-OPTIONS (along with the authenticator).
1. Down-level KDC sends AS-REP with PA-SUPPORTED-ENCTYPES field empty.
1. Windows client attempts to locate a Windows Server 2012+ domain controller via DsGetDcName. Client discards TGT received from down-level KDC and sends a new AS-REQ to the W2k12+ KDC with PA-PAC-OPTIONS: Claim bit enabled.
1. KDC sends AS-REP that includes the Kerberos Armoring and Claims bit enabled in the encrypted portion of the PA-SUPPORTED_ENCTYPES field.

## Kerberos Armoring for Always Provide Claims and Fail Unarmored Authentication Requests

Domain functional level DFL Windows Server 2012.

![Kerberos Armoring for Always Provide Claims](/.attachments/image-450bfb30-7ed8-45c0-82bd-49b6693297ee.png)

1. Windows Client sends a normal AS-REQ for pre-authentication, the AS-PING.
1. W2k12+ KDC returns KDC_ERR_PREAUTH_REQUIRED in AS-REP, including PA-FX-FAST option.
1. Client sends AS-REQ with PA-PAC-OPTIONS: Kerberos armoring and Claims bits enabled.
1. KDC sends session key and TGT in AS-REP that includes the Kerberos Armoring and Claims bit enabled in the encrypted portion of the PA-SUPPORTED_ENCTYPES field. Future User AS exchanges are armored using a key derived from the computer's TGT. All future User TGS exchanges are armored using a key derived from the user's TGT.
1. User authenticates to the domain by sending an AS-REQ armored with a key derived from the computer's TGT (further interaction as in FAST overview).

---

# Kerberos Compound Authentication  a FAST Extension

Enables Kerberos TGS requests to include two identities: the identity of the user and the identity of the users device for getting both claim types.

## Requirements

- Windows Server 2012+ domain controllers.
- All DCs configured with GPO KDC support for claims, compound authentication, and Kerberos armoring enabled.
- Client is capable of requesting a compound authenticated ticket.
- Resource to which the client is authenticating supports compound authentication.
- For both enabled by Kerberos computer Group Policy setting Support compound authentication or by using Windows PowerShell with cmdlets `Set-ADUser/Set-ADServiceAccount/Set-ADComputer` and `-CompoundIdentitySupported:$true`.
- `msDS-SupportedEncryptionTypes` attribute set to support compound authentication (bit 0x20000 enabled).
- Applications that support compound authentication can register their support under `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters\CompoundIdentity` and must support device-based access control.

## Concept

The Kerberos client discards the first acquired service ticket (TGS) and requests a new compound authentication service ticket armored with a key derived from the computer's TGT rather than the user's TGT, for obtaining device claims bound to the computer account.

Device claims provide you with the flexibility to control access and auditing using claims for both the computer and the user. Therefore, it is possible that a user claim meets the criteria for access, but the computer/device claims from which the user accesses the resource do not (for example, not having a TPM chip/drive encryption). In this scenario, Windows would not grant the user access to the resource.

Computers will authenticate to the resource domain if they do not possess a TGT for the domain, including Kerberos referral chasing. Those requests are armored using the inter-realm TGT of the trust.

## Kerberos Compound Authentication  Flow

Difference in Flow: Kerberos client discards the first acquired TGS and requests a new compound TGS, armored with a key derived from the computer's TGT rather than the user's TGT, receiving also the computer's device claims.

![Kerberos Compound Authentication Flow](/.attachments/image-9558db95-aeb7-4eda-9f64-bb6c0115398e.png)

1 - 6: As in standard FAST flow, AS-Ping and AS-REQ and AS-REP armored with computer TGT.  
7. Client sends TGS-REQ that includes the user's TGT and the targeted service principal name (SPN), armored with a key derived from the user's TGT.  
8. KDC locates SPN and checks `msDS-SupportedEncryptionTypes` bit 0x20000. KDC returns TGS-REP including the compound authentication flag and armored with a new key derived from the user's TGT.  
9. Client checks for compound authentication and discards the previous TGS and requests a new compound authentication TGS. Client sends a new TGS-REQ armored with a key derived from the computer's TGT rather than the user's TGT.  
10. TGS-REP is armored with a new key derived from the computer's or inter-realm trust's TGT.

### Network frames - FAST negotiation

**Netmon**

Client sends initial AS request (AS-Ping) for `krbtgt/ROOT.FABRIKAM.COM`, _PaData contains flag PA-FX-Fast_ (reassembled trace):

```plaintext
Kerberos: AS Request Cname: dhamilton Realm: ROOT.FABRIKAM.COM Sname: krbtgt/ROOT.FABRIKAM.COM 
AsReq: Kerberos AS Request 
   KdcReq: KRB_AS_REQ (10) 
     MsgType: KRB_TGS_REQ (10) 
     PaData: 
       PaData: PA-FX-Fast (136) 
         PaDataType: PA-FX-Fast (136) 
         PaFxFastRequest: 
           ArmoredData: 
             Armor: 
               ArmorType: FX_FAST_ARMOR_AP_REQUEST (1) 
     ReqBody: 
       KdcOptions: 0x40810010
```

Due to missing pre-authentication data (not visible in trace frame), KDC responses with error _KDC_ERR_PREAUTH_REQUIRED_ but also with _Padata: PA-FX-Fast (136)_

```plaintext
Kerberos: KRB_ERROR  - KDC_ERR_PREAUTH_REQUIRED (25) 
  KrbError: KRB_ERROR (30) 
  ErrorCode: KDC_ERR_PREAUTH_REQUIRED (25) 
  EData: 
    Padata: PA-FX-Fast (136)  
 # if not returned by KDC, clients performs uplevel KDC relocation 
    PaFxFastReply:  
      ArmoredData:  
        EncFastRep: 
          EType: aes256-cts-hmac-sha1-96 (18)
```

Client sends armored AS request with pre-authentication data (not visible in Netmon trace, request is just ~80 byte larger than AS-Ping), again PaData contains flag _PA-FX-Fast_

```plaintext
Kerberos: AS Request Cname: dhamilton Realm: ROOT.FABRIKAM.COM Sname: krbtgt/ROOT.FABRIKAM.COM 
AsReq: Kerberos AS Request 
   KdcReq: KRB_AS_REQ (10) 
       PaData: PA-FX-Fast (136) ... 
             ArmorType: FX_FAST_ARMOR_AP_REQUEST (1)
```

KDC returns the TGT, again with Padata: PA-FX-Fast (136)

```plaintext
Kerberos: AS Response Ticket[Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/ROOT.FABRIKAM.COM]     
  AsRep: Kerberos AS 
    KdcRep: KRB_AS_REP (11) 
    Padata: 
      PaData: PA-FX-Fast (136) 
    Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/ROOT.FABRIKAM.COM
```

Related TGS requests are also armored and continue having _Padata: PA-FX-Fast (136)_

Visibility on Network frame level is limited for security reasons, use KLIST for checking FAST and COMPOUND flags:

**CHECK FOR PICTURE HERE** ![Network Frames - FAST Negotiation](/.attachments/image-0f79d2fa-aadb-4502-9a32-fd7c1d7dd2b8.png)

---

# Dynamic Access Control

- Dynamic Access Control (Claims) for legacy clients (pre-Windows 8, obsolete in most conditions).
- Dynamic Access Control DAC feature: Works with operating systems earlier than Windows 8.
- Requirements: File Server runs Windows Server 2012.
- Configuration: Configure the file server to attempt S4U2Self authentication to obtain user claim information. GPO: `Computer Configuration\Policies\Windows Settings\Security Settings\Local Policies\Security Options\Microsoft network server: Attempt S4U2Self to obtain claim information`.
  -  Note: Cannot use device claims. Device claims require a Windows 8+ client computer.

---

# Windows Server 2012 RODC claims-awareness

Claims-aware KDCs on RODC must contact claims-aware KDC on a writable DC to process the TGS request when authentication is beyond the branch.

## RODC claims-awareness - Flow

**CHECK FOR PICTURE HERE** ![RODC Claims-Awareness Flow](/.attachments/image-53fbb698-2b3c-4978-bb0c-160d7546f3ce.png)

1. Windows Client sends AS-PING 
1. RODC KDC returns KDC_ERR_PREAUTH_REQUIRED 
1. Client send pre-authenticated AS-REQ 
1. RODC returns AS-REP, containing TGT sources from branch RODC 
1. Client sends TGS-REQ for Hub located resource and BRANCH_AWARE_BIT in the PA_PAC_OPTIONS 
1. If SPN target is not cached, KDC returns KDC_ERR_S_PRINCIPAL_UNKNOWN   
1. Clients sends AS-REQ with FORWARD_TO_FULL_DC   
1. RODC KDC forwards AS-REQ to writable domain controller in the hub  
1. Writeable KDC returns TGT in AS-REP to the branch RODC 
1. RODC sends AS-REP with Hub TGT to client   
a. Clients sends TGS-REQ with FORWARD_TO_FULL_DC   
b. RODC forwards to writable hub KDC  
c. Hub KDC returns TGS-REP to RODC   
d. RODC returns TGS-REP to client 

---
#Disabling Full Delegation Across Forest Trusts 

##Restriction for unconstrained delegation cross forest   
Disabled full delegation prevents any application requesting a forwarded TGT from authenticating to the server, which causes authentication between the client and the server to fail. 

##Requirement 
all domain controllers in the trusted forest's root run Windows Server 2012+ 

##Configuration
disable/enable full delegation using the NETDOM trust command using the /EnabledTGTDelegation argument 

Syntax: 
`NETDOM TRUST trustingDomainName /Domain:trustedDomainName /userO:trustingDomainAdministrator /passwordO:* /EnableTGTDelegation:no / yes` 
 
##TDO TrustAttributes
Disabling full delegation using the NETDOM TRUST command enables the 0x00000200 bit on the TrustAttributes attribute of the Trusted Domain object that resides in the trusted forest 

[Updates to TGT delegation across incoming trusts in Windows Server](https://support.microsoft.com/en-us/topic/updates-to-tgt-delegation-across-incoming-trusts-in-windows-server-1a6632ac-1599-0a7c-550a-a754796c291e)

---
#Supportability Changes 

##KDC Service more independent
- ability to be completely unloaded from the LSASS process 
- code refactoring among Kdcsvc.dll, Lsass.exe and Ntdsa.dll 
- new Kdcpw.dll loaded by Ntdsa.dll for AES/DES key generation for password changes 

##KDC Operational Log in Eventviewer for KDC Certificate handling
- new operational log at Applications and Services/Microsoft/Windows/Kerberos-Key-Distribution-Center/Operational  
- disabled by default, enable by right-clicking the Operational node under the Kerberos-Key-Distribution-Center node and click Enable Log 

##New KDC System Events
- Event 31 - warning event when the KDC issues a service ticket that exceeds a size threshold measured in kilobytes 
- Event 32  when KDC uses a certificate based on a certificate template that does not have the KDC extended key usage (EKU) 
- Event 33  when KDC fails to update the Active Directory krbtgt account with new msDS-SupportedEncryptionTypes values to support claims and compound authentication for Dynamic Access Control and Kerberos Armoring   
0x00010000     FAST supported   
0x00020000     Compound identity supported   
0x00040000     Claims supported   
0x00080000     Resource SID compression disabled   
- Event 34  when you configure Dynamic Access Control and Kerberos armoring option that requires the domain's functional level to be Windows Server 2012 and the current domain not at this domain functional level 

##Kerberos Client Operational Log
- new operational log at Applications and Services/Microsoft/Windows/Security-Kerberos/Operational  
- disabled by default, enable the Kerberos operational log by right-clicking the Operational node under the Security-Kerberos node and click Enable Log 
- Remarkable events: Error 100 - SPN not registered, Error 101 - duplicate SPN, Error 108 - S4U2proxy failure, Warning 200 - DC location failure 
 
##New NTDS Performance Counters for Domain Controllers
- General Counters, recommended for baseline monitoring 
  - Forwarded Kerberos Requests for read-only domain controllers 
  - KDC AS Requests for domain controllers 
  - KDC TGS Requests for domain controllers 
  - Kerberos Authentication for servers 

##Counters for new Kerberos features included in Windows 8 
- KDC claims-aware AS Requests 
- KDC armored AS Requests 
- KDC claims-aware TGS Requests  
- KDC claims-aware service asserted identity TGS requests  (S4U2Self requests for claims) 
- KDC armored TGS Requests 
- KDC classic type constrained delegation TGS Requests  
- KDC resource type constrained delegation TGS Requests  
 
##Tool SETSPN.EXE avoids SPN duplicates
- Setspn.exe's -a argument now behaves the same as its -s argument in previous versions, which prevents you from registering duplicate SPNs in the same domain 

##Resource SID Compression
- KDC checks target account msDS-SupportedEncryptionTypes attribute, a 32-bit number where bit 0x00080000 dictates the disabled status of SID compression 
- Without resource SID Compression, the KDC inserts all the SIDs added by the resource domain in the Extra-SID portion of the PAC structure 
- If enabled KDCsets the ResourceGroupID bit in the UserFlags structure to true. Then, the KDC writes the ResourceGroupDomainSID with the SID of the resource domain to which the target resource is a member. Finally, the KDC inserts only the RID portion of each resource SID into the ResourceGroupIds portion of the authentication data 
- Can be disabled by KDC via DisableResourceGroupsFields=1 (Dword) registry value under HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kdc\Parameters  
 
##Increase in the default Kerberos token buffer size (MaxTokenSize)
- Windows 8 increases the default Kerberos token buffer size from 12 to 48k.  This default value matches the maximum size for HTTP 's base64 encoding of authentication tokens 
 
##Group Policy setting for managing Kerberos token buffer size
- Windows 8 includes a Group Policy setting that enables you to manage the Kerberos token buffer size through centrally.  The computer policy setting Set maximum Kerberos SSPI context token buffer size 
- This policy setting modifies a registry value MaxTokenSize located at HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters  
Note:   
Group Policy does not manage values at this location.  Therefore, these settings remain persistent in the registry even if the Group Policy setting is no longer applies 
 
##KDC warning events for large Kerberos tickets 
- new KDC computer policy setting, Warning events for large Kerberos tickets applies to Windows Server 2012 KDCs.  When enabled, you configure a threshold value in bytes that the KDC uses when issuing tickets and logs Event 31 when exceeded.

