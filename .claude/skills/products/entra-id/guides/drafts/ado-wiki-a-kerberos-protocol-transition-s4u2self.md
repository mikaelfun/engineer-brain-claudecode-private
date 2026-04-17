---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Delegation/Kerberos: Protocol Transition, S4U2Self"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Delegation/Kerberos%3A%20Protocol%20Transition%2C%20S4U2Self"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151423&Instance=1151423&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151423&Instance=1151423&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**:   
This document provides a detailed explanation of the Kerberos protocol transitioning (S4U2Self) flow. It includes setup instructions, a step-by-step flow, and details on the KRB_TGS_REQ with PaData: PA-FOR-USER. This guide is part of the DS Kerberos wiki under "Delegation."

[[_TOC_]]

# Introduction
Allowed fallback when no evidence ticket is provided. The service accounts' identities on the involved server hops can be located in different realms, domains, or forests.

---

# Topics

- Protocol transition **S4U2Self** flow
- KRB_TGS_REQ with **PaData**: **PA-FOR-USER**

---

# Protocol transition S4U2Self flow

## Setup
- Same setup as in the S4U2Proxy example:
  - Microsoft Dynamics
  - NAV Frontend, SPN DynamicsNAV/ccnst.contosocc.com:7046
  - SQL Backend, SPN MSSQLSvc/ccsql.contosocc.com:1433

- Changed delegation setting:
  AD NAV service account, Tab Delegation, "Trust this user for delegation to specified services only" selected, with the "Use any authentication protocol" (option (4)) enabled.
  ![Delegation setting](/.attachments/image-4246f0c6-96ea-46dc-8733-76edbac1d93c.png)

- pane "Services to which this account can present delegated credentials" shows:
![Service delegation](/.attachments/image-6d8817a3-70b4-4ff1-8082-227d563f8ab5.png)
  - Service Type: MSSQLSVC, 
  - User or Computer: ccsql.contosocc.com, 
  - Port: 1433 (reflecting SPN MSSQLSvc/ccsql.contosocc.com:1433).


- Comparison: KDC does not send flag **ok_as_delegate**, no forwarded TGT is provided by the client, but also no evidence ticket is sent by the client.

---

## Flow
![Flow diagram](/.attachments/image-00f63a0c-937d-441e-9324-1e089beb0a6f.png)

1. Client has neither a forwardable TGT (Ticket Granting Ticket) for the user nor requests a TGS (Ticket Granting Service) for Frontend. It performs non-Kerberos authentication.
1. Frontend accepts the session, retrieving **cname** and **crealm** or the user's **certificate**.
1. Frontend requests TGS to its own **samAccountName** or **UPN** (User Principal Name) as **Sname**, with the field **PA-FOR-USER** (cname/crealm) or **PA-S4U-X509-USER** (certificate) for the user.
1. KDC (Key Distribution Center) returns a TGS session ticket for **User1**, similar to an **evidence ticket** in S4U2Proxy.
1. Delegate requests TGS for Server/Backend SPN with **Cname-In-Addl-Tkt** flag set, **AdditionalTickets** in ReqBody contains self-obtained evidence TGS from step 4.
1. KDC verifies the evidence TGS and authenticator, replies with Backend TGS for the user, **Cname**: **User1**.
1. KRB_AP_REQ contains the user's TGS. Authenticator is encrypted with the TGS-supplied **Backend/Server session key**.
1. KRB_AP_REP is handled as before with Mutual Authentication check.

---

## KRB_TGS_REQ with PaData: PA-FOR-USER

- Frontend has no "forwarded" user TGT or "evidence" ticket of the user, it needs to get one by itself.
- It requests a TGS ticket to itself, with **Sname** as **UPN** of the identity the Frontend service is running in, and **PA-FOR-USER** field for the user.

```plaintext
Kerberos: TGS Request Realm: CONTOSOCC.COM Sname: MyAppPoolAcct1@CONTOSOCC.COM
  KdcReq: KRB_TGS_REQ (12)
   MsgType: KRB_TGS_REQ (12)
      PaData: PA-TGS-REQ (1)
      PaData: PA-FOR-USER (129)
        PaDataType: PA-FOR-USER (129)
          UserName: user1@CONTOSOCC.COM
            NameType: NT-ENTERPRISE (10)
      ReqBody:
        KdcOptions: 0x40810000          # no request for S4U2proxy
        Realm: CONTOSOCC.COM
        Sname: MyAppPoolAcct1@CONTOSOCC.COM
```

- KDC checks if target **Sname** account is configured for S4U2Self then TGS Reply is done for User1.

```plaintext
Kerberos: TGS Response Cname: user1
  KdcRep: KRB_TGS_REP (13)
    MsgType: KRB_TGS_REP (13)
    Crealm: CONTOSOCC.COM
    Cname: user1
    Ticket: Realm: CONTOSOCC.COM, Sname: MyAppPoolAcct1@CONTOSOCC.COM
```

- Now Frontend has a TGS of the user it can decrypt with its Server Key: **{T}KS= {C, S, t, PAC, KC,S}KS,** similar to the evidence ticket
- It can continue proceeding as described in KCD.