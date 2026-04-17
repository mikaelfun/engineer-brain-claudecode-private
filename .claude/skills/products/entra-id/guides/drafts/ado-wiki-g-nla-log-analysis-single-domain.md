---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: NLA/Kerberos: NLA: Log analysis for a single-domain scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20NLA/Kerberos%3A%20NLA%3A%20Log%20analysis%20for%20a%20single-domain%20scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699662&Instance=1699662&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699662&Instance=1699662&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This document provides a detailed analysis of the client-side network trace during a Kerberos authentication process. It includes timestamps, IP addresses, and Kerberos protocol messages for better understanding.

[[_TOC_]]

---

# Client-side Network trace

Client already has obtained the Ticket Granting Ticket (TGT), and they are proceeding to make a Ticket Granting Service Request (TGS_REQ) call to the Ticket Granting Server (TGS) for the service TERMSRV/Fabmem. The TGS has responded, indicating that USER2USER-OUTBOUND is enabled, and has requested that the TGT be encrypted using the user's session key.

```
4458  13:13:08 01-02-2024  153.7801434  (840)  192.168.2.115  fabdc.fab.com  KerberosV5  KerberosV5:TGS Request Realm: FAB.COM Sname: TERMSRV/Fabmem 
4460  13:13:08 01-02-2024  153.7801535  (0)  fabdc.fab.com  192.168.2.115  KerberosV5  KerberosV5:TGS Response Cname: Maria 
```

- **Kerberos: TGS Request Realm: FAB.COM Sname: TERMSRV/Fabmem**
  - KdcReq: KRB_TGS_REQ (12)**
    - ReqBody:
      - KdcOptions: 0x40810000
        - **KrbFlags: 0x40810000 - This is the first TGS_REQ without the EncTktInSkey flag enabled**

          ```
          Reserved:              (0...............................)
          Forwardable:           (.1..............................) Ticket to be issued is to have its FORWARDABLE flag set
          Forwarded:             (..0.............................) This is not a request for forwarding
          Proxiable:             (...0............................) Ticket to be issued is not to have its PROXIABLE flag set
          Proxy:                 (....0...........................) This is not a request for a proxy
          AllowPostDate:         (.....0..........................) Ticket to be issued is not to have its MAY_POSTDATE flag set
          PostDated:             (......0.........................) This is not a request for a postdated ticket
          Renewable:             (........1.......................) Ticket to be issued is to have its RENEWABLE flag set
          Canonicalize:          (...............1................)
          DisableTransitedCheck: (..........................0.....) Checking of the transited field is enabled
          RenewableOk:           (...........................0....) Renewable ticket is not acceptable
          EncTktInSkey:          (............................0...) Ticket for the end server is to be encrypted in the session key
          Renew:                 (..............................0.) Present request is not for a renewal
          Validate:              (...............................0) Request is not to validate a postdated ticket
          ```

        - Realm: FAB.COM
        - Sname: TERMSRV/Fabmem

The client initiates a TGS_REQ call, incorporating Maria's user TGT within the additional ticket, which is encrypted using the user's session key. This request is sent to the Ticket Granting Server, which in turn responds by providing a service ticket to Maria.

```
4487  13:13:08 01-02-2024  35.7263939  (824)  192.168.2.115  fabdc.fab.com  KerberosV5  KerberosV5:TGS Request Realm: FAB.COM Sname: TERMSRV/Fabmem 
4489  13:13:08 01-02-2024  35.7282202  (0)  fabdc.fab.com  192.168.2.115  KerberosV5  KerberosV5:TGS Response Cname: Maria 
```

- **Kerberos: TGS Request Realm: FAB.COM Sname: TERMSRV/Fabmem**
  - TgsReq: Kerberos TGS Request
    - ReqBody:
      - KdcOptions: 0x40810008
        - **KrbFlags: 0x40810008 - This is the TGS_REQ with the EncTktInSkey flag enabled**

          ```
          Reserved:              (0...............................)
          Forwardable:           (.1..............................) Ticket to be issued is to have its FORWARDABLE flag set
          Forwarded:             (..0.............................) This is not a request for forwarding
          Proxiable:             (...0............................) Ticket to be issued is not to have its PROXIABLE flag set
          Proxy:                 (....0...........................) This is not a request for a proxy
          AllowPostDate:         (.....0..........................) Ticket to be issued is not to have its MAY_POSTDATE flag set
          PostDated:             (......0.........................) This is not a request for a postdated ticket
          Renewable:             (........1.......................) Ticket to be issued is to have its RENEWABLE flag set
          Canonicalize:          (...............1................)
          DisableTransitedCheck: (..........................0.....) Checking of the transited field is enabled
          RenewableOk:           (...........................0....) Renewable ticket is not acceptable
          EncTktInSkey:          (............................1...) Indicates that the ticket for the end server is to be encrypted in the session key from the additional TGT provided
          Renew:                 (..............................0.) Present request is not for a renewal
          Validate:              (...............................0) Request is not to validate a postdated ticket
          ```

        - Realm: FAB.COM
        - Sname: TERMSRV/Fabmem
        - Additional Tickets

          ```
          AdditionalTickets: 
            - Ticket: Realm: FAB.COM, Sname: krbtgt/FAB.COM
              - TktVno: 5
              - Realm: FAB.COM
              - Sname: krbtgt/FAB.COM
              - EncPart: 
          ```

---

# Client-side Kerberos ETL trace

```
Line 1546: [2] 0338.1C60::02/01/24-13:13:08.6631123 [KERBEROS] kerbtick_cxx6996 KerbGetServiceTicketInternal() - TargetName TERMSRV/Fabmem
Line 1562: [1] 0338.1C60::02/01/24-13:13:08.6658293 [KERBEROS] ctxtapi_cxx2786 SpInitLsaModeContext() - Building TGT request for TERMSRV/Fabmem
Line 1563: [1] 0338.1C60::02/01/24-13:13:08.6658306 [KERBEROS] kerbtick_cxx11063 KerbBuildTgtRequest() - KerbBuildTgtRequest TargetRealm (null)
Line 1564: [1] 0338.1C60::02/01/24-13:13:08.6658323 [KERBEROS] kerbtick_cxx11064 KerbBuildTgtRequest() - TargetName TERMSRV/Fabmem
Line 1565: [1] 0338.1C60::02/01/24-13:13:08.6658378 [KERBEROS] ctxtapi_cxx2804 SpInitLsaModeContext() - SpInitLsaModeContext built TGT request 0
Line 1566: [1] 0338.1C60::02/01/24-13:13:08.6658462 [KERBEROS] ctxtapi_cxx3229 SpInitLsaModeContext() - "SpInitLsaModeContext (TGT in TGT reply) USER2USER-OUTBOUND set
Line 1571: [0] 0338.1C60::02/01/24-13:13:08.7134937 [KERBEROS] ctxtapi_cxx725 KerbProcessTargetNames() - Cracked name TERMSRV/Fabmem
Line 1574: [0] 0338.1C60::02/01/24-13:13:08.7135001 [KERBEROS] ctxtapi_cxx1252 SpInitLsaModeContext() - SpInitLsaModeContext calling KerbUnpackTgtReply
Line 1575: [0] 0338.1C60::02/01/24-13:13:08.7135015 [KERBEROS] kerbtick_cxx11951 "KerbUnpackTgtReply() - KerbUnpackTgtReply is User2User set in ContextAttributes? yes
Line 1588: [0] 0338.1C60::02/01/24-13:13:08.7135344 [KERBEROS] kerbtick_cxx4018 __KerbGetTgsTicket() - TargetName TERMSRV/Fabmem
Line 1589: [0] 0338.1C60::02/01/24-13:13:08.7135386 [KERBEROS] kerbtick_cxx4266 __"KerbGetTgsTicket() - KerbGetTgsTicket setting KERB_KDC_OPTIONS_enc_tkt_in_skey (index 0)
Line 1595: [1] 0338.1C60::02/01/24-13:13:08.7146176 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.108
Line 1600: [1] 0338.1C60::02/01/24-13:13:08.7167653 [KERBEROS] ctxtapi_cxx2813 SpInitLsaModeContext() - Building AP request for connection oriented context
Line 1608: [1] 0338.1C60::02/01/24-13:13:08.7190288 [KERBEROS] ctxtapi_cxx725 KerbProcessTargetNames() - Cracked name TERMSRV/Fabmem
```

---

#Server-side network trace

After the client successfully receives the TGT and the service ticket TERMSRV/Fabmem for Maria, the target server should now obtain the TGT and the service ticket host/fabmem.fab.com on behalf of the client for Maria.

The designated server obtained the Ticket Granting Ticket (TGT) for the user named Maria.

```
1135  13:13:10 01-02-2024  47.2163210  (752)  192.168.2.111  fabdc.fab.com  KerberosV5  KerberosV5:AS Request Cname: Maria Realm: FAB.COM Sname: krbtgt/FAB.COM 
1136  13:13:10 01-02-2024  47.2182608  (1036)  fabdc.fab.com  192.168.2.111  KerberosV5  KerberosV5:AS Response Ticket[Realm: FAB.COM, Sname: krbtgt/FAB.COM] 
```

The target server successfully received the service ticket for the host/fabmem.fab.com from the Key Distribution Center (KDC) for the user Maria.

```
1144  13:13:10 01-02-2024  47.2197315  (752)  192.168.2.111  fabdc.fab.com  KerberosV5  KerberosV5:TGS Request Realm: FAB.COM Sname: host/fabmem.fab.com 
1149  13:13:10 01-02-2024  47.2613141  (1036)  fabdc.fab.com  192.168.2.111  KerberosV5  KerberosV5:TGS Response Cname: Maria 
```

---

# Server-side Kerberos ETL

We see that the target/Remote Desktop Protocol (RDP) server is getting TGT and host/fabmem.fab.com service ticket for the user Maria on behalf of the client.

```
Line 745: [3] 02F0.1544::02/01/24-13:13:10.4409246 [KERBEROS] logonapi_cxx5652 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm FAB.COM
Line 746: [3] 02F0.1544::02/01/24-13:13:10.4409270 [KERBEROS] logonapi_cxx2145 "KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client Maria"
Line 748: [3] 02F0.1544::02/01/24-13:13:10.4409291 [KERBEROS] logonapi_cxx2147 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/FAB.COM
Line 780: [2] 02F0.1544::02/01/24-13:13:10.4609318 [KERBEROS] logonapi_cxx3332 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Returned from KDC status 0x0
Line 785: [2] 02F0.1544::02/01/24-13:13:10.4610296 [KERBEROS] logonapi_cxx9159 KerbILogonUserEx2() - Getting outbound ticket to host/fabmem.fab.com
Line 787: [2] 02F0.1544::02/01/24-13:13:10.4610341 [KERBEROS] kerbtick_cxx6719 "KerbGetServiceTicketInternal() - KerbGetServiceTicket TargetName host/fabmem.fab.com
Line 788: [2] 02F0.1544::02/01/24-13:13:10.4610378 [KERBEROS] kerbtick_cxx5557 KerbGetTgsTicketEx() - KerbGetTgsTicketEx: Attempting to get a ticket from FAB.COM 
Line 790: [2] 02F0.1544::02/01/24-13:13:10.4610404 [KERBEROS] kerbtick_cxx3670 _KerbGetTgsTicket() - TargetName host/fabmem.fab.com
```