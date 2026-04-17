---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Trusts/Kerberos: Forest Trust"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FKerberos%2FKerberos%3A%20Protocol%20Flow%2FKerberos%3A%20Example%20Reference%2FKerberos%3A%20Trusts%2FKerberos%3A%20Forest%20Trust"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1190804&Instance=1190804&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1190804&Instance=1190804&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This page is part of the DS Kerberos wiki, under "Trusts" and describes the usage of Kerberos over a forest trust. 

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

---

# Introduction
The preferred Windows trust type, fully supporting Kerberos.

---

# Topics

- Forest trust definition
- Alternate UPN suffixes
- Name suffix routing
- msDS-SPNSuffixes for NetBios
- Forest-wide and selective authentication
- Trusted domain object (TDO)
- TDO attribute msDS-TrustForestTrustInfo
- Trust secret keys and encryption
- SID history
- Kerberos access via forest trust  flow
- KRB_TGS_REP with shortest transitive path referral

---

# Updates, news, and improvements:

## [Updates to TGT delegation across incoming trusts in Windows Server](https://support.microsoft.com/en-us/topic/updates-to-tgt-delegation-across-incoming-trusts-in-windows-server-1a6632ac-1599-0a7c-550a-a754796c291e)

## 1b.22

[Servicing: 1B.22: Summary of Active Directory and Kerberos hardening changes in January 11, 2022 and newer Windows Updates](https://internal.evergreen.microsoft.com/en-us/topic/48c472db-0f26-dc2c-a2d7-4c29bec696d1)

- [KB5010265 adds AES encryption protections to the MS-LSAD protocol for CVE-2022-21913](https://support.microsoft.com/en-us/topic/kb5010265-adds-aes-encryption-protections-to-the-ms-lsad-protocol-for-cve-2022-21913-e466887c-2802-4bd8-b97f-ace25952b0b9)  
  Adds AES encryption for auth data during Create & Update of Trusted Domain objects (TDO) to address Weak Crypto in MS-LSAD protocol

- [NTLM pass-through authentication security checks CVE-2022-21857 / MSRC 61318](https://internal.evergreen.microsoft.com/en-us/topic/b79e8d06-b5ea-09f2-e7c4-f55e48730e0a)  
  Windows domain controllers will enforce new security checks for NTLM pass-through authentication requests sent by a trusting domain over a domain or forest trust, or sent by a read-only domain controller (RODC) over a secure channel trust.

## Known issues 
- [Kerberos auth fails with access denied + 40970 \ 0xc00002fd if AES not supported on trust et al](https://internal.evergreen.microsoft.com/en-us/topic/servicing-1b-22-kerberos-auth-fails-with-access-denied-40970-0xc00002fd-if-aes-not-supported-on-trust-et-al-5648dcef-bdc1-1629-a729-fdf490e85cc2)

- [1B.22: ADDS: Listing or modifying name suffix routing on a trust fails with "Insufficient system resources exist to complete the requested service](https://internal.evergreen.microsoft.com/en-us/topic/servicing-1b-22-adds-listing-or-modifying-name-suffix-routing-on-a-trust-fails-with-insufficient-system-resources-exist-to-complete-the-requested-service-282a2efd-a364-3d66-d2b3-b7ad6bb5217e)

- [1B.22: NTLM fails with 0xc00000e5 (STATUS_INTERNAL_ERROR) over trust if Name Suffix Routing is empty](https://internal.evergreen.microsoft.com/en-us/topic/servicing-1b-22-ntlm-fails-with-0xc00000e5-status-internal-error-over-trust-if-name-suffix-routing-is-empty-2b363db9-958d-7198-6ccd-6e703561255f)

- ["Forest Search Order" policy behaviour when using an External Trust - TGS request may return KDC_ERR_S_PRINCIPAL_UNKNOWN](https://internal.evergreen.microsoft.com/en-us/topic/-forest-search-order-policy-behaviour-when-using-an-external-trust-tgs-request-may-return-kdc-err-s-principal-unknown-6bfe4dbd-94d7-ef5f-7bde-e49cfff69fe1)

---

# Forest trust definition 

- DOC Reference ["How Domain and Forest Trusts Work"](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc773178(v=ws.10)) 
- Possible with minimum Windows Server 2003 [functional forest level (FFL)](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels) on both partners 
- Supports Kerberos **shortest transitive path referrals** 
- Supports **NTLM Path-Through Authentication** 
- Provides **Name Routing information**: Top Level Names (TLNs) (Forest DNS root domain name structure) and **alternate UPN suffixes** 

---

# Setup example

![Setup example](/.attachments/image-e3771819-84ab-4dd9-bc12-3e6559af5e19.png)

---

# Alternate UPN suffixes 

Alternate UPN suffixes are defined at the forest level.

Available in UI via top node _**Properties**_ in domain.msc 

![Alternate UPN Suffixes](/.attachments/image-1c808504-2d07-410a-993f-d6b70d0b4fb2.png)

Mostly used for **simpler/shorter** UPN logon names and for **explicit routing** of **SPNs** different from the **domain FQDN** name (generic SPNs).

---

# Name suffix routing 

Forest trust name routing information can be found in Domain.msc, under Trust Properties, Tab _**Name Suffix Routing**_.

![Name Suffix Routing](/.attachments/image-5f2169a4-d510-4e26-a61b-066cc4818173.png)

Further information on suffix routing and how to avoid conflicts can be found in [KB4485415](https://internal.evergreen.microsoft.com/en-us/topic/c9aa1479-b266-387c-21c7-8f3da28f5856).

[UPN Suffixes, conflict between trusted forests, unsupported config](https://internal.evergreen.microsoft.com/en-us/topic/upnsuffixes-conflict-between-trusted-forests-unsupported-config-38e6fdce-8054-679b-0b90-f8f89ce943cc)

---

# msDS-SPNSuffixes for NetBios subordinate domain names 

## Issue
Missing **routing** information for NetBios domain names of TLN subordinate domains.

- KCD is used but KERB_S4U_LOGON struct is populated with NetBios name as Realm:    
  ```
  MessageType = KerbS4ULogon   
  ClientUpn = user name   
  ClientRealm = _**NetBios domain name**_   
  ```

- NetBios names of TLN **subordinate** domains are not populated in trusted forest name routing information.

## Solution  
1. In the **trusted** forest root domain, add the NetBios domain names to attribute **_msDS-SPNSuffixes_** at DN **CN=Partitions,CN=Configuration,_DC=DomainNamingContext_**, and restart NETLOGON for immediate update.
1. In the **trusting** forest root domain, select the trusted TDO in Domain.msc, update the information (via tab _**General**_, Validate or restart Netlogon) and in tab _**Name Suffix Routing**_ press **Refresh**. Select the offered NetBios name (Status New) and click _**Enable**_; Refer to [Attribute msDS-SPNSuffixes](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-ada2/45962704-ab54-4a48-8b9a-d1c327fafc3e?redirectedfrom=MSDN).

These DNS suffixes are shared with other forests that have cross-forest trust with this forest.

---

# Forest-wide and selective authentication 

## Trust options 
- Forest-wide authentication: unlimited transitive for all tree- and child-domains.
- Selective authentication: trusting server or service accounts objects need explicitly to grant permission _**Allowed to Authenticate**_ on trusted accounts.

## Kerberos
Validation is performed by the trusting KDC on SPN level. If required but not granted, KDC replies with error _**KDC_ERR_POLICY**_, per Network Monitor:

```
RW08M1.RW08.NET     RW8R2DC2.RW8R2.NET    KerberosV5 Kerberos: TGS Request Realm: RW8R2.NET Sname: cifs/rw8r2m1.rw8r2.net  
RW8R2DC2.RW8R2.NET   RW08M1.RW08.NET     KerberosV5 Kerberos: KRB_ERROR  - KDC_ERR_POLICY (12) 
  Sname: cifs/rw8r2m1.rw8r2.net
```
 
## NTLM
Validation by Netlogon Service of **trusting** DC returns _**0xC0000413**_, per Netlogon.log:   
```
[LOGON] RW8R2: SamLogon: Transitive Network logon of RW08\Administrator from RW08M1 (via RW8R2M1) Returns 0xC0000413
```

Per Network Monitor, the error is returned to the client in **SMB SESSION SETUP Response** by the server:

```
SMB Client Session setup request 
RW08M1.RW08.NET RW8R2M1.RW8R2.NET SMB2 SMB2Header: C SESSION SETUP (0x1),TID=0x0000, MID=0x0002, PID=0xFEFF, SID=0xD8000065 
  CSessionSetup: 
    securityBlob: # for validation this is passed-through per SC to trusting DCs Netlogon Svc in RW8R2.NET 
      GSSAPI: 
        NegTokenResp: 
          ResponseToken: NTLM AUTHENTICATE MESSAGEVersion:v2, Domain: RW08, User: Administrator, Workstation: RW08M1 
SMB Server Session Setup response (error returned from DC the server has its Domain Secure Channel SC with) 
RW8R2M1.RW8R2.NET   RW08M1.RW08.NET SMB2 SMB2: R  - NT Status: System - Error, Code = (1043) Unhandled Error code  SESSION SETUP (0x1) 
  SMB2Header: R SESSION SETUP (0x1),TID=0x0000, MID=0x0002, PID=0xFEFF, SID=0xD8000065 
    Status: 0xC0000413, Facility = FACILITY_SYSTEM, Severity = STATUS_SEVERITY_ERROR, Code = (1043) Unhandled Error code
```
Error code **0xC0000413** from ntstatus.h: **STATUS_AUTHENTICATION_FIREWALL_FAILED** _Logon Failure: The machine you are logging onto is protected **by an authentication firewall**.  The specified account is not allowed to authenticate to the machine_.

 Note:   
Error may be shown application specific as generic _**Access denied**_ (i.e., in Windows Explorer).

---

# Trusted domain object (TDO) 

## TDO DN locations  
- External trust: CN=remote_Domain_FQDN,CN=System,DC=local_Domain_DN 
- Forest trust: CN=remote_Forest_Root_FQDN,CN=System,DC=local_Forest_Root_Domain_DN
 
## TDO definition
ObjectClass _**trustedDomain**_; general Domain trust object with attributes     
Refer to [6.1.6.7 Essential Attributes of a Trusted Domain Object](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/c9efe39c-f5f9-43e9-9479-941c20d0e590?redirectedfrom=MSDN), most relevant:

- Name: DNS domain name 
- flatName: Netbios domain name 
- securityIdentifier: Domain SID 
- trustDirection: 1 Inbound, 2 Outbound, 3 Bidirectional 
- trustType: 1 Downlevel (NT4), 2 Uplevel (AD), 3 Kerberos (non-Windows), 4 DCE (not used) 
- trustAttributes: 0x0 none, 0x1 No Transitivity, 0x2 Uplevel Clients Only (W2k+), 0x4 Quarantine, 0x8 Forest Transitive, 0x10 Cross Organisation, 0x20 Within Forest, 0x40 Treat as external (SID History), 0x80 MIT RC4 Trust 
  Examples: IntraForest 0x20, Forest Trust 0x8/0x18, External 0x0 (inbound)/0x4 (outbound default) 
- trustPartner: string representing the DNS-style or NetBios name of partner domain 

## TDO attribute msDS-TrustForestTrustInfo 

- Forest trust has additional TDO attribute _**msDS-TrustForestTrustInfo**_
- Binary blob, contains forest root and tree DNS namespace TLNs (ForestTrustTopLevelName) records, exclusions (ForestTrustTopLevelNameEx), NetBIOS DomainInfo (ForestTrustDomainInfo) records, Domain SIDs, and alternate SPN suffixes; refer to [6.1.6.9.3.2 Building Well-Formed msDS-TrustForestTrustInfo Messages](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/2994b19c-04ff-430d-b788-c82d334b31bc?redirectedfrom=MSDN) 
- Only under TDO object in forest root domain
- Part of PAS, replicated to GCs
- Viewable via LDP.EXE, menu General Options, Binary (String)
![TDO attribute msDS-TrustForestTrustInfo](/.attachments/image-f3e6b445-b268-465e-a58d-1309c9af0eac.png)

## Trust secret keys and encryption 
- TDO trustAuthInfo Authentication attributes
  - trustAuthIncoming and trustAuthOutgoing per trust direction
  - not readable outside of LSA on DC, used in LSAPR_AUTH_INFORMATION    
    trustAuthIncoming is referencing to corresponding user account CN=**trusting_domain_NetBiosName$**,CN=Users,DC=trusted_domain_DN
  - Account properties:   
    sAMAccountType: 805306370 = ( TRUST_ACCOUNT )  
    userAccountControl: 0x820 = ( PASSWD_NOTREQD | INTERDOMAIN_TRUST_ACCOUNT ) 

- [Kerberos usages of trustAuthInfo attributes](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/cd20fbd1-eabe-4da2-bba3-31ab3036d019?redirectedfrom=MSDN)
  - Example: user in a primary domain wishes to authenticate to a service in the trusted domain using Kerberos  
  - There is a one-way trust in place. The referral TGT issued by the primary domain is encrypted based on the key in trustAuthIncoming, not trustAuthOutgoing.  
 Note:   
This is non-intuitive but fits the definition of an inbound trust.   
This direction of trust allows Kerberos to build a TGT for the trusted domain in the primary domain, fulfilling the definition of an inbound trust. 

- Password change of TDO account happens every 30 days. For high replication delay environments, you may extend _**AllowedReplicationLatency**_ (default 60 minutes), KDC parameters key.   
  Example:  
  1. Click Start, click Run, type regedit, and then click OK.
  1. Locate and then click the following registry subkey: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\kdc
  1. On the Edit menu, point to New, and then click DWORD Value.
  1. Type AllowedReplicationLatency, and then press ENTER.
  1. Right-click AllowedReplicationLatency, and then click Modify.
  1. Under Base, click Decimal.
  1. In the Value data box, type the value that you want, and then click OK.  
   Note:  
  The value that you type inside the Value data box is the number of minutes that domain controllers continue to use the old trust password. The default value is 60 minutes. You can adjust this value according to the actual network conditions. For example, domain controllers continue to use the old trust password for 24 hours if you set this value to 1440.
  8. Exit Registry Editor.

---

# SID history 

- For outbound forest trust to enable SID history in the PAC when SID filtering is turned on
- trustAttributes: 0x40 Treat as External (TRUST_ATTRIBUTE_TREAT_AS_EXTERNAL)
- Configurable with: `NETDOM TRUST /EnableSIDHistory:yes` (allowing SID history)

---

# Kerberos access via forest trust  flow 

- Client is in a different realm/domain/forest than the target server.
- The flow between domains of the same forest or between forests is essentially the same. The big difference is the routing information between forests, which we discussed before.
- Referral: KDC is not authoritative for the domain part of the SPN/target realm and provides shortest transitive path hint (referral), together with its inter-realm TGT to the next hop.

![Kerberos access via forest trust  flow](/.attachments/image-b4dec81a-f7d1-45bf-b006-873c3d709b0e.png)

1. Client sends TGS request to its own realm KDC.
1. KDC checks SPN against its DB or if target realm matches an external trust. If not, it builds a tree of known domain structures, including shortcut and forest trusts, and constructs the shortest transitive path to the target realm. Then it responds with its inter-realm TGT (referral flag KERB-PA-SERV-REFERRAL set) of the next hop in the trust path.
1. Client sends the received TGT in a new TGS to the provided next hop realm.
1. Parent KDC verifies TGT, performs same check, sends hint per domain tree structure and its  
inter-realm TGT (between forest it is the inter-forest TGT, having same funtionality) 
1. Client sends  KRB_TGS_REQ along with TGT it received from parent 
1. Target Realm KDC verifies TGT, responses with session key for the user to share with and the server service ticket TGS for admission to the server encrypted with the server key 
1. client sends the server a KRB_AP_REQ with its UPN, Server Ticket and Authenticator encrypted with the Server session key, Mutual Authentication performed as usual   

---
#KRB_TGS_REP with shortest transitive path referral 

##Setup
Microsoft Dynamics   
NAV Frontend, SPN DynamicsNAV/ccnst.contosocc.com:7046   
SQL Backend, SPN MSSQLSvc/ccsql.contosocc.com:1433   

But now Client and User2 are in Trusted Domain FABRICAM.COM (Forest Trust) , Source/Destination IP is now also interesting, since the Client has to ask different realm KDCs: 

```
192.168.0.11 (Client)     192.168.0.10 (KDC FABRICAM.COM)    KerberosV5:TGS Request Realm: FABRICAM.COM Sname: DynamicsNAV/ccnst.contosocc.com:7046 
ReqBody: 
   KdcOptions: 0x40810000 
   Realm: FABRICAM.COM       # initially the client just knows about its own realm 
   Sname: DynamicsNAV/ccnst.contosocc.com:7046   # target SPN in trusting realm
```
 
Trusted realm KDC checks for shortest transitive path and his Sname and Ticket contains the inter-realm trust TGT to the next hop: krbtgt/CONTOSOCC.COM 

```
192.168.0.10 (KDC FABRICAM.COM)     192.168.0.11 (Client) KerberosV5:TGS Response Cname: user2 
    KdcRep: KRB_TGS_REP (13)  
    MsgType: KRB_TGS_REP (13) 
    Crealm: FABRICAM.COM 
    Cname: user2 
    Ticket: Realm: FABRICAM.COM, Sname: krbtgt/CONTOSOCC.COM 
      Realm: FABRICAM.COM 
      Sname: krbtgt/CONTOSOCC.COM         # interrealm trust TGT 
        EncPart: 
          EType: rc4-hmac (23) 
          Cipher:                        # TGT to realm CONTOSOCC.COM 
      EncPart:
```
  
The KRB_TGS_REP flag KERB-PA-SERV-REFERRAL returned by the KDC is not visible in NetMon, but detectable when the returned Sname is again a krbtgt , with the domain FQDN name to be contacted next  the referral 

Client uses provided TGT to request the TGS against the determined next path hop KDC 


```
192.168.0.11     (Client)    192.168.0.1 (KDC CONTOSOCC.COM)    KerberosV5:TGS Request Realm: CONTOSOCC.COM Sname: DynamicsNAV/ccnst.contosocc.com:7046  
KdcReq: KRB_TGS_REQ (12) 
PaData: 
   PaData: PA-TGS-REQ (1) 
   KrbApReq: KRB_AP_REQ (14) 
   Ticket: Realm: FABRICAM.COM, Sname: krbtgt/CONTOSOCC.COM 
ReqBody: 
   KdcOptions: 0x40810000 
   Realm: CONTOSOCC.COM        # requested realm changed to next hop realm 
   Sname: DynamicsNAV/ccnst.contosocc.com:7046
```
Next hop KDC of CONTOSOCC.COM is already from target ream, reflected in Sname and returned Server Ticket  


```
192.168.0.1    (KDC CONTOSOCC.COM) 192.168.0.11 (Client) KerberosV5:TGS Response Cname: user2 
  KdcRep: KRB_TGS_REP (13)  
    MsgType: KRB_TGS_REP (13) 
    Crealm: FABRICAM.COM 
    Cname: user2 
    Ticket: Realm: CONTOSOCC.COM, Sname: DynamicsNAV/ccnst.contosocc.com:7046 
      Realm: CONTOSOCC.COM 
      Sname: DynamicsNAV/ccnst.contosocc.com:7046    # Ticket for Target SPN 
        EncPart: 
          EType: rc4-hmac (23) 
          Cipher:                                   # TGS for Target SPN
```
 
---
# [Security Considerations for Trusts](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc755321(v=ws.10))
