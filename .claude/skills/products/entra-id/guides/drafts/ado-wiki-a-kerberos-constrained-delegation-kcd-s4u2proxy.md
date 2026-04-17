---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Delegation/Kerberos: Constrained Delegation KCD, S4U2Proxy"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Delegation/Kerberos%3A%20Constrained%20Delegation%20KCD%2C%20S4U2Proxy"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151412&Instance=1151412&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151412&Instance=1151412&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This page provides an example reference for Kerberos constrained delegation (KCD, S4U2Proxy), detailing the protocol flow and setup. It is part of the DS Kerberos wiki under "Delegation."

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

[[_TOC_]]

# Introduction

The preferred and most secure configuration is when the client can provide an evidence ticket. The service accounts' identities on the involved server hops need to be located in the same realm/domain.

# Topics

- Constrained delegation (S4U2Proxy) flow
- KRB_TGS_REQ with S4U2Proxy flag (**CnameInAddlTkt**)
- **Evidence ticket** and KRB_TGS_REP

## Constrained delegation S4U2Proxy flow

### New setup

- **Servers**
  - Microsoft Dynamics
  - NAV Frontend, SPN: DynamicsNAV/ccnst.contosocc.com:7046
  - SQL Backend, SPN: MSSQLSvc/ccsql.contosocc.com:1433

- **Delegation setting**
  - AD NAV service account:
    - Tab Delegation: "Trust this user for delegation to specified services only" selected, with "Use Kerberos only" (option 3) enabled.  
    ![Delegation setting screenshot](/.attachments/image-034f2cc4-30f9-4b1f-ab94-353a6ff745e8.png)
    - Pane "Services to which this account can present delegated credentials" shows:
![Services pane screenshot](/.attachments/image-10ba1fdd-b259-432e-a908-e1e0f0812056.png)
      - Service Type: MSSQLSVC
      - User or Computer: ccsql.contosocc.com
      - Port: 1433 (reflecting SPN MSSQLSvc/ccsql.contosocc.com:1433)  

- **Comparison**
  - The Key Distribution Center (KDC) does not send the flag **ok_as_delegate**.
  - No _forwarded_ Ticket Granting Ticket (TGT) is required from the client.

--- 
### Flow

![Flow diagram](/.attachments/image-766718a6-e0c9-4782-93db-d666bf4d3ff4.png)

1. The client has already obtained a forwardable TGT for the user and requests a Ticket Granting Service (TGS) for the target SPN of the delegate/frontend.
1. The KDC sends a TGS reply **without** the flag o**k_as_delegate**, **No forwarded TGT is required**; a forwardable TGS is sufficient.
1. The client uses the service ticket to connect to the delegate server and requests mutual authentication.
1. The client authenticates the delegate server.
1. The delegate requests a TGS for the server/backend SPN with the **Cname-In-Addl-Tkt flag set. AdditionalTickets** in ReqBody contains the evidence TGS from step 2.
1. The KDC verifies the evidence TGS and authenticator, replying with the backend TGS for the user, **Cname: User1**.
1. KRB_AP_REQ contains the user's TGS. The authenticator is encrypted with the TGS-supplied **backend/server session key**.
1. KRB_AP_REP is handled as before with mutual authentication check.

---
### KRB_TGS_REQ with S4U2Proxy flag CnameInAddlTkt

- There is no difference in flow compared to an undelegated setup. The client just requests a TGS for the application-specific SPN DynamicsNAV/ccnst.contosocc.com:7046.
- Kerberos: TGS Request Realm: FABRICAM.COM Sname: DynamicsNAV/ccnst.contosocc.com:7046 KrbFlags: 0x40810000.
- The frontend/delegate NAV server needs to access a remote resource, such as a SQL database accessed per SPN MSSQLSvc/ccsql.contosocc.com:1433.
- The delegate requests a TGS for SPN MSSQLSvc/ccsql.contosocc.com:1433 with the KrbFlag CNAME-IN-ADDL-TKT (0x20000) and the forwardable TGS from User1 in AdditionalTickets.
![KRB_TGS_REQ example from network trace](/.attachments/image-da65ef54-7f82-42b1-ae4c-6bb49845a555.png)

---
### Evidence ticket and KRB_TGS_REP

- The KDC validates if the backend SPN (MSSQLSvc) is enlisted in the frontend service account's _**msDS-AllowedToDelegateTo**_ attribute in AD.
- The KDC decrypts the provided _evidence ticket_. From the authenticator, it selects the identity for whom it will issue the server ticket to the requested backend SPN. This appears in the TGS response as Client Name (Cname):
  ```
  Kerberos: TGS Response Cname: user1
    KdcRep: KRB_TGS_REP (13)
      MsgType: KRB_TGS_REP (13)
      Crealm: CONTOSOCC.COM
      Cname: user1
      Ticket: Realm: CONTOSOCC.COM, Sname: MSSQLSvc/ccsql.contosocc.com:1433
  ```
- Now, the frontend/delegate can access the backend impersonated as User1.
- KRB_AP_REQ and KRB_AP_REP are handled as before, including mutual authentication.
- For SQL the protocol communication is encrypted and doesnt allow further Netmon Trace analysis.