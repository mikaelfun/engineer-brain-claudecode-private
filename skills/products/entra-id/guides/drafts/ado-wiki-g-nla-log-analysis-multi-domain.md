---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: NLA/Kerberos: NLA: Log analysis for a Multi-domain or Forest scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20NLA/Kerberos%3A%20NLA%3A%20Log%20analysis%20for%20a%20Multi-domain%20or%20Forest%20scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699752&Instance=1699752&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699752&Instance=1699752&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article provides a detailed walkthrough for establishing an RDP connection between a client machine in a child domain and a server in a parent domain, focusing on the Kerberos authentication process. It includes network traces and Kerberos ETL traces for both the client and server sides.

[[_TOC_]]


# Scenario

User Child\Herbert is currently on the client machine Mem2.child.contoso.com and is attempting to establish a Remote Desktop Protocol (RDP) connection with the Contmem1.contoso.com server.

# Environment details

The following is a sample diagram that illustrates the relationship between the parent and child domains.

1. User domain: Child.contoso.com
2. Resource domain: Contoso.com
3. Network Level Authentication (NLA) enabled server: Contmem1.contoso.com (IP: 192.168.2.113)
4. Client machine: Mem2.child.contoso.com (IP: 192.168.2.109)
5. Username: Child\Herbert

![Picture of Multi-Domain NLA Diagram](/.attachments/image-7b2a7f50-1fe7-4623-9787-53945d02b27c.png)

# Network trace from the client machine (Mem2.child.contoso.com)

After the client obtained the Ticket Granting Ticket (TGT) for its own domain, the client is making the Ticket Granting Service (TGS) request call for the service krbtgt/Contoso.com. The ChildDC1 Domain Controller (DC) replies with a referral ticket for the Contoso.com realm to the user Child\Herbert.

```
13:26:43 26-08-2024  13:56:43 26-08-2024  1108  23.5322810  (780)  192.168.2.109  ChildDC1.Child.Contoso.com  KerberosV5  KerberosV5:TGS Request Realm: CHILD.CONTOSO.COM Sname: krbtgt/CONTOSO.COM 

13:26:43 26-08-2024  13:56:43 26-08-2024  1110  23.5370335  (0)  ChildDC1.Child.Contoso.com  192.168.2.109  KerberosV5  KerberosV5:TGS Response Cname: Herbert 
```

Client obtained the TGT and referral TGT for the Contoso.com realm. Now the client is making the TGS request call with the Ticket Granting Server (TGS) for the service TERMSRV/contmem1.contoso.com. The TGS replies that USER2USER-OUTBOUND is set and requests to encrypt the TGT in the user session key.

```
13:26:43 26-08-2024  13:56:43 26-08-2024  1118  23.5380300  (780)  192.168.2.109  192.168.2.100  KerberosV5  KerberosV5:TGS Request Realm: CONTOSO.COM Sname: TERMSRV/contmem1.contoso.com 

13:26:43 26-08-2024  13:56:43 26-08-2024  1120  23.5420219  (0)  192.168.2.100  192.168.2.109  KerberosV5  KerberosV5:TGS Response Cname: Herbert
```



 **Kerberos: TGS Request Realm: CONTOSO.COM Sname: TERMSRV/contmem1.contoso.com**
  - TgsReq: Kerberos TGS Request
  - ReqBody:
    - KdcOptions: **0x40810000** - This is the TGS_REQ without the flag EncTktInSkey enabled
    - KrbFlags: 0x40810000
      - Forwardable: (.1..............................) Ticket to be issued is to have its FORWARDABLE flag set
      - Renewable: (........1.......................) Ticket to be issued is to have its RENEWABLE flag set
      - Canonicalize: (...............1................)
      - EncTktInSkey: (............................0...) Ticket for the end server is to be encrypted in the session key
      - Realm: CONTOSO.COM
      - Sname: TERMSRV/contmem1.contoso.com


Client is making the TGS request call which includes the user TGT in the additional ticket (encrypted the TGT in the user's session key) with the Ticket Granting Server. The TGS replies with a service ticket to the user Child\Herbert.

```
13:26:43 26-08-2024  13:56:43 26-08-2024  1143  23.6227391  (780)  192.168.2.109  192.168.2.100  KerberosV5  KerberosV5:TGS Request Realm: CONTOSO.COM Sname: TERMSRV/contmem1.contoso.com 

13:26:43 26-08-2024  13:56:43 26-08-2024  1145  23.6270046  (0)  192.168.2.100  192.168.2.109  KerberosV5  KerberosV5:TGS Response Cname: Herbert
```

- **Kerberos: TGS Request Realm: CONTOSO.COM Sname: TERMSRV/contmem1.contoso.com**
  - TgsReq: Kerberos TGS Request
  - ReqBody:
    - KdcOptions: **0x40810008** - This is the TGS_REQ with the flag EncTktInSkey enabled
    - KrbFlags: 0x40810008
      - Forwardable: (.1..............................) Ticket to be issued is to have its FORWARDABLE flag set
      - Renewable: (........1.......................) Ticket to be issued is to have its RENEWABLE flag set
      - Canonicalize: (...............1................)
      - EncTktInSkey: (............................1...) Indicates that the ticket for the end server is to be encrypted in the session key from the additional TGT provided
      - Realm: CONTOSO.COM
      - Sname: TERMSRV/contmem1.contoso.com
    - **AdditionalTickets:**
      - Ticket: Realm: CONTOSO.COM, Sname: krbtgt/CONTOSO.COM
        - Realm: CONTOSO.COM
        - Sname: krbtgt/CONTOSO.COM

---

# Client-side Kerberos ETL trace

```
[3] 030C.0388::08/26/24-13:56:43.4395014 [KERBEROS] kerbtick_cxx6720 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName TERMSRV/contmem1.contoso.com

[3] 030C.0388::08/26/24-13:56:43.4395023 [KERBEROS] kerbtick_cxx7035 KerbGetServiceTicketInternal() - KerbGetServiceTicket loop RealTargetRealm CONTOSO.COM

[3] 030C.0388::08/26/24-13:56:43.4395026 [KERBEROS] kerbtick_cxx7052 KerbGetServiceTicketInternal() - got two different names: RealTargetRealm CONTOSO.COM, TGT TargetDomainName CHILD.CONTOSO.COM

[3] 030C.0388::08/26/24-13:56:43.4395038 [KERBEROS] kerbtick_cxx7075 KerbGetServiceTicketInternal() - Getting referral TGT for krbtgt/CONTOSO.COM

[3] 030C.0388::08/26/24-13:56:43.4452018 [KERBEROS] kerbtick_cxx5558 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM

[3] 030C.0388::08/26/24-13:56:43.4452028 [KERBEROS] kerbtick_cxx3670 __KerbGetTgsTicket() - KerbGetTgsTicket Flags 0x100000, Tgt DomainName CHILD.CONTOSO.COM, Tgt TargetDomainName CONTOSO.COM, TgtReply 0000000000000000, EvidenceTicket 0000000000000000

[3] 030C.0388::08/26/24-13:56:43.4502139 [KERBEROS] kerbtick_cxx10452 KerbBuildTgtRequest() - TargetName TERMSRV/contmem1.contoso.com

[3] 030C.0388::08/26/24-13:56:43.4502275 [KERBEROS] ctxtapi_cxx3122 SpInitLsaModeContext() - SpInitLsaModeContext (TGT in TGT reply) USER2USER-OUTBOUND set

[1] 030C.0388::08/26/24-13:56:43.5299346 [KERBEROS] ctxtapi_cxx723 KerbProcessTargetNames() - Cracked name TERMSRV/contmem1.contoso.com

[1] 030C.0388::08/26/24-13:56:43.5299401 [KERBEROS] ctxtapi_cxx1235 SpInitLsaModeContext() - SpInitLsaModeContext calling KerbUnpackTgtReply

[1] 030C.0388::08/26/24-13:56:43.5299412 [KERBEROS] kerbtick_cxx11339 KerbUnpackTgtReply() - KerbUnpackTgtReply is User2User set in ContextAttributes? yes

[1] 030C.0388::08/26/24-13:56:43.5299565 [KERBEROS] ctxtapi_cxx2533 SpInitLsaModeContext() - SpInitLsaModeContext: Getting outbound ticket for TERMSRV/contmem1.contoso.com ((null))

[1] 030C.0388::08/26/24-13:56:43.5299696 [KERBEROS] kerbtick_cxx6720 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName TERMSRV/contmem1.contoso.com

[1] 030C.0388::08/26/24-13:56:43.5299705 [KERBEROS] kerbtick_cxx5558 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM

[1] 030C.0388::08/26/24-13:56:43.5299717 [KERBEROS] kerbtick_cxx3670 __KerbGetTgsTicket() - KerbGetTgsTicket Flags 0x2100004, Tgt DomainName CHILD.CONTOSO.COM, Tgt TargetDomainName CONTOSO.COM, TgtReply 000002D3652F8030, EvidenceTicket 0000000000000000

[1] 030C.0388::08/26/24-13:56:43.5299734 [KERBEROS] kerbtick_cxx3671 __KerbGetTgsTicket() - TargetName TERMSRV/contmem1.contoso.com

[1] 030C.0388::08/26/24-13:56:43.5299776 [KERBEROS] kerbtick_cxx3919 __KerbGetTgsTicket() - KerbGetTgsTicket setting KERB_KDC_OPTIONS_enc_tkt_in_skey (index 0)

[3] 030C.0388::08/26/24-13:56:43.5352673 [KERBEROS] kerbtick_cxx6834 KerbGetServiceTicketInternal() - KerbGetReferralNames returns RealTargetRealm (null)

[3] 030C.0388::08/26/24-13:56:43.5352909 [KERBEROS] kerbtick_cxx2534 KerbBuildApRequest() - BuildApRequest using nonce 0x2f9a6586

[1] 030C.0388::08/26/24-13:56:43.5399345 [KERBEROS] kerbtick_cxx10158 KerbVerifyApReply() - Verifying AP reply: AP nonce = 0x2f848257, context nonce = 0x2f9a6586, receive nonce = 0x2f9a6586
```

---

# Network trace from the target server Contmem1.contoso.com

Here, Contmem1.contoso.com is initially obtaining a TGT for the user Child\Herbert from ChildDC1 (the user's domain). Following this, it acquires a service ticket for Host/Contmem1.contoso.com from ContDC1 (the resource domain) for the user Child\Herbert.

```
13:26:44 26-08-2024  13:56:44 26-08-2024  1337  63.5289007  (828)  192.168.2.113  ChildDC1.Child.Contoso.com  KerberosV5  KerberosV5:AS Request Cname: herbert Realm: CHILD.CONTOSO.COM Sname: krbtgt/CHILD.CONTOSO.COM 

13:26:44 26-08-2024  13:56:44 26-08-2024  1343  63.5314342  (0)  ChildDC1.Child.Contoso.com  192.168.2.113  KerberosV5  KerberosV5:AS Response Ticket[Realm: CHILD.CONTOSO.COM, Sname: krbtgt/CHILD.CONTOSO.COM] 

13:26:44 26-08-2024  13:56:44 26-08-2024  1351  63.5325620  (828)  192.168.2.113  ChildDC1.Child.Contoso.com  KerberosV5  KerberosV5:TGS Request Realm: CHILD.CONTOSO.COM Sname: krbtgt/CONTOSO.COM 

13:26:44 26-08-2024  13:56:44 26-08-2024  1354  63.5341911  (0)  ChildDC1.Child.Contoso.com  192.168.2.113  KerberosV5  KerberosV5:TGS Response Cname: Herbert 

13:26:44 26-08-2024  13:56:44 26-08-2024  1362  63.5355828  (828)  192.168.2.113  ContDC1.Contoso.com  KerberosV5  KerberosV5:TGS Request Realm: CONTOSO.COM Sname: host/contmem1.contoso.com 

13:26:44 26-08-2024  13:56:44 26-08-2024  1364  63.5386096  (4044)  ContDC1.Contoso.com  192.168.2.113  KerberosV5  KerberosV5:TGS Response Cname: Herbert 
```

---

# Server-side Kerberos ETL trace

```
[0] 033C.0B6C::08/26/24-13:56:44.6148122 [KERBEROS] ctxtapi_cxx727 KerbProcessTargetNames() - Cracked name herbert

[0] 033C.0B6C::08/26/24-13:56:44.6148179 [KERBEROS] logonapi_cxx2145 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client herbert

[0] 033C.0B6C::08/26/24-13:56:44.6148225 [KERBEROS] logonapi_cxx2360 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicketEx using default credentials CHILD.CONTOSO.COM\herbert

[3] 033C.0B6C::08/26/24-13:56:44.6362461 [KERBEROS] logonapi_cxx3332 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0

[3] 033C.0B6C::08/26/24-13:56:44.6364588 [KERBEROS] kerbtick_cxx6721 KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName host/contmem1.contoso.com

[3] 033C.0B6C::08/26/24-13:56:44.6364602 [KERBEROS] kerbtick_cxx7053 KerbGetServiceTicketInternal() - got two different names: RealTargetRealm CONTOSO.COM, TGT TargetDomainName CHILD.CONTOSO.COM

[3] 033C.0B6C::08/26/24-13:56:44.6364614 [KERBEROS] kerbtick_cxx7076 KerbGetServiceTicketInternal() - Getting referral TGT for krbtgt/CONTOSO.COM

[3] 033C.0B6C::08/26/24-13:56:44.6391114 [KERBEROS] kerbtick_cxx5559 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from CONTOSO.COM

[3] 033C.0B6C::08/26/24-13:56:44.6391145 [KERBEROS] kerbtick_cxx3672 __KerbGetTgsTicket() - TargetName host/contmem1.contoso.com

[0] 033C.0B6C::08/26/24-13:56:44.6439001 [KERBEROS] kerbtick_cxx7400 KerbGetServiceTicketInternal() - KerbGetReferralNames returns RealTargetRealm (null)

[0] 033C.0B6C::08/26/24-13:56:44.6439796 [KERBEROS] TicketLogonClient_cxx450 PacValidation::GetAuthorizationDataFromPac() - Taking authorization data from PAC for CHILD.CONTOSO.COM\Herbert

[0] 033C.0B6C::08/26/24-13:56:44.6439806 [KERBEROS] TicketLogonClient_cxx515 PacValidation::GetAuthorizationDataFromPac() - Adding extra logon information to logon.  UPN = Herbert@Child.Contoso.com and DNS domain = CHILD.CONTOSO.COM

[3] 033C.0B6C::08/26/24-13:56:44.6627829 [KERBEROS] credapi_cxx2989 SpAcceptCredentials() - SpAcceptCredentials accepting credentials for 0:0x9bbe83, flag 0x1001, logon type 0xa, CHILD\Herbert or Herbert@Child.Contoso.com at CHILD.CONTOSO.COM, SupplementalCredentials 0000000000000000

[3] 033C.0B6C::08/26/24-13:56:44.6627845 [KERBEROS] credapi_cxx4448 SpAcceptCredentials() - SpAcceptCredentials returned 0x0