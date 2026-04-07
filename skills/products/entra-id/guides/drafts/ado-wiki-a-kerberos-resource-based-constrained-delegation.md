---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Delegation/Resource-based Kerberos Constrained Delegation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Delegation/Resource-based%20Kerberos%20Constrained%20Delegation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1166831&Instance=1166831&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1166831&Instance=1166831&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Summary**
This page is part of the DS Kerberos wiki, under "Delegation" and describes Kerberos Resource-Based Constrained Delegation (RBCD).  
Full path: Workflow: Kerberos: Protocol Flow: Example Reference

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

---

# S4U extension in Windows Server 2012 (Microsoft proprietary)

## Topics

- Resource-based KCD - Feature Concept
- Resource-based KCD - Cross-forest setup
- Resource-based KCD - Flow Overview
- Network frames, S4U2proxy referrals cross forest
- Resource-based KCD - Backend KDC Behavior

---

### Resource-based KCD - Feature Concept

#### Key Concept
Instead of configuring the **Frontend/Middletier** service account via the _Delegation_ tab ("Services to which this account can present delegated credentials" // account attribute `msDS-AllowedToDelegateTo` [A2D2]), you configure the **Backend service account** via PowerShell with Security Principals that are allowed to authenticate (account attribute `msDS-AllowedToActOnBehalfOfOtherIdentity`).

#### Advantages

- Easier SPN (Service Principal Name) handling  no need for Frontend to know Backend SPNs
- Point of Delegation  Backend Admin can control who is allowed
- Scope of delegation  Front and Backend service accounts do not need to be from the same domain; it now works cross-forest

#### Requirements

- Windows Server 2012 KDCs (Key Distribution Centers) must reside in the front-end account domain
- Windows Server 2012 KDCs must reside in the back-end account domain
- The front-end server must run Windows Server 2012

#### Management

Depending on the **account type**, use Windows PowerShell cmdlets to set and get configuration:

- `Set-ADComputer`, `Set-ADUser`, `Set-ADServiceAccount`
  ```powershell
  Set-ADUser username -PrincipalsAllowedToDelegateToAccount principal1, principal2, 
  ```
- `Get-ADComputer`, `Get-ADUser`, `Get-ADServiceAccount`
  ```powershell
  Get-ADUser userName -Property PrincipalsAllowedToDelegateToAccount
  ```

#### Security Implications of Resource-based Constrained Delegation

- When no evidence ticket for S4U2Proxy is provided, fallback to S4U2Self is allowed by default.
- If S4U2Self is not wanted, it can be limited via ACL at the resource, using two newly introduced groups with well-known SIDs. See the relevant section in the KDC overview.

---

### Resource-based KCD - Cross-forest setup

#### Flow
There is no difference from S4U2Proxy when the Frontend and Backend service are in the same domain. Since this scope limitation is now obsolete, we observe the cross-forest setup flow.

#### New Cross Forest Setup

- Generic web application/Frontend accessing a SQL service in a trusting forest
- Web Frontend, SPN `http/root-2012-app1.root.fabrikam.com`, running under System/Network Service Account; client is `root\dhamilton`
- SQL Backend, SPN `MSSQL/corp-2012-app1.corp.contoso.com`, running under `sqlsvc@corp.contoso.com`

#### Delegation settings

- Frontend: no delegation setting, server account `root-2012-app1` has "Do not trust this computer for delegation"
- Backend: no delegation setting in UI, user account `sqlsvc` has "Do not trust this user for delegation" but has attribute `msDS-AllowedToActOnBehalfOfOtherIdentity` set via:
  ```powershell
  $c=Get-ADGroup Group_AllowedToDelegateTo_SQLSVC
  Set-ADUser sqlsvc -principalsAllowedToDelegateToAccount $c
  ```
   **Note**: Using a Domain Local Group is recommended because `Set-ADUser` has only replace functionality, but you can add other identities by adding them into the Domain Local Group, such as `root\root-2012-app1`.

#### Verification

```powershell
Get-Aduser sqlsvc -property principalsAllowedToDelegateToAccount
```
Output:
```
DistinguishedName                    : CN=sqlsvc,CN=Users,DC=corp,DC=contoso,DC=com
Enabled                              : True
GivenName                            : sqlsvc
Name                                 : sqlsvc
ObjectClass                          : user
ObjectGUID                           : 97cf00d1-79fc-4bba-895b-fa2eb1c8d617
PrincipalsAllowedToDelegateToAccount : {CN=Group_AllowedToDelegateTo_SQLSVC,CN=Users,DC=corp,DC=contoso,DC=com}
SamAccountName                       : sqlsvc
SID                                  : S-1-5-21-2837634694-2433664535-3790681168-1106
Surname                              :
UserPrincipalName                    : sqlsvc@corp.contoso.com
```

---

### Resource-based KCD - Flow Overview

![Flow Overview](/.attachments/image-53818000-766a-4011-ac22-0a4cd3897498.png)

1. Front-end service sends an S4U2Proxy TGS-REQ with an evidence Ticket ([cname-in-addl-tkt](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-sfu/17b9af82-d45a-437d-a05c-79547fe969f5)) as in standard KCD.
1. KDC <2012 replies with KRB-ERR-BADOPTION or KRB-ERR-POLICY. Windows client (Windows 8 and later) retries DC relocation with DsGetDCName flag DS_DIRECTORY_SERVICE_8_REQUIRED. If OK, KDC responds with a referral ticket; Sname has the trusting forest krbtgt.
1. Front-end service sends a TGS-REQ for itself to the KDC in `root.fabrikam.com` for a service ticket for the backend krbtgt.
1. KDC returns a TGS-REP that includes a referral inter-realm trust TGT for `corp.contoso.com`.
1. Front-end service sends a TGS-REQ for itself to the KDC in `corp.contoso.com` for a service ticket for the backend krbtgt, containing the inter-realm trust TGT.
1. The KDC in `corp.contoso.com` sends a TGS-REP that includes a TGT for the back-end realm.
1. Front-end service sends an S4U2Proxy TGS-REQ to the KDC in `corp.contoso.com` requesting a service ticket for the back-end service on behalf of the user present in the evidentiary ticket (similar to step 1).
1. KDC in `corp.contoso.com` retrieves account information from Active Directory using `SamIGetUserLogonInformation`, impersonates the front-end service, and performs an access check using the security descriptor in the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute.

---

### Network frames, S4U2proxy referrals cross forest

- For the client, there is no difference in flow compared to normal KCD; the new feature is transparent. The client just requests a TGS for application-specific Frontend SPN `http/root-2012-app1.root.fabrikam.com`.
- Frontend requests a TGS for SPN `MSSQL/corp-2012-app1.corp.contoso.com`, with KrbFlag CNAME-IN-ADDL-TKT (0x20000) and the forwardable TGS from User `root\dhamilton` in AdditionalTickets.

  ```plaintext
  Kerberos: TGS Request Realm: ROOT.FABRIKAM.COM Sname: MSSQL/corp-2012-app1.corp.contoso.com
  TgsReq: Kerberos TGS Request
   KdcReq: KRB_TGS_REQ (12)
     MsgType: KRB_TGS_REQ (12)
     PaData:
       PaDataType: PA-TGS-REQ (1)
       KrbApReq: KRB_AP_REQ (14)
        Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/ROOT.FABRIKAM.COM
                                                   
                                                 ****TGT from Frontend***
 
     ReqBody:
       KdcOptions: 0x40830000
         KrbFlags: 0x40830000    # 01000000100000110000000000000000
           CnameInAddlTkt:        (..............1.................)
                                 
                               ****This is a request for S4U2proxy functionality****
 
       Sname: MSSQL/corp-2012-app1.corp.contoso.com
       EncAuthorizationData:
       AdditionalTickets:
         Ticket: Realm: ROOT.FABRIKAM.COM, Sname: http/root-2012-app1.root.fabrikam.com
                                                           
                                                 ****TGS from the client, the evidence ticket**** 
           Realm: CONTOSOCC.COM
  ```

- KDC `root-2012-dc1.root.fabrikam.com` receiving TGS request for SPN `MSSQL/corp-2012-app1.corp.contoso.com` detects cross-forest relation and sends a Referral with its cross-realm TGT for the User (S4U referral TGT).

  ```plaintext
  Kerberos: TGS Response Cname: ROOT-2012-APP1$
  TgsRep: Kerberos TGS Response
    KdcRep: KRB_TGS_REP (13)
      Crealm: ROOT.FABRIKAM.COM
      Cname: ROOT-2012-APP1$
      Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/CORP.CONTOSO.COM
                                                    
                                              ****no TGS, cross realm TGT for user****
  ```

   **Note**:   
KDC below OS W2k12 may respond with KDC_ERR_BADOPTION, then Frontend tries KDC relocation.

- Frontend is chasing referral and requests a TGS for Sname: `krbtgt/CORP.CONTOSO.COM` for itself, but still against its own Realm KDC.

  ```
  Kerberos: TGS Request Realm: ROOT.FABRIKAM.COM Sname: krbtgt/CORP.CONTOSO.COM
  TgsReq: Kerberos TGS Request
   KdcReq: KRB_TGS_REQ (12)
     MsgType: KRB_TGS_REQ (12)
     PaData:
       PaDataType: PA-TGS-REQ (1)
       KrbApReq: KRB_AP_REQ (14)
         Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/ROOT.FABRIKAM.COM  
                                                   
                                                  ****TGT from Frontend**** 

     ReqBody:
       KdcOptions: 0x40810000
       Realm: ROOT.FABRIKAM.COM
       Sname: krbtgt/CORP.CONTOSO.COM
  ```

- KDC `root-2012-dc1.root.fabrikam.com` sends a Referral for `krbtgt/CORP.CONTOSO.COM`, with a cross-realm TGT for Frontend.

  ```
  Kerberos: TGS Response Cname: ROOT-2012-APP1$
  TgsRep: Kerberos TGS Response
    KdcRep: KRB_TGS_REP (13)
      Crealm: ROOT.FABRIKAM.COM
      Cname: ROOT-2012-APP1$
      Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/CORP.CONTOSO.COM
                                                  
                                              ****cross realm TGT for Frontend****
  ```

- Frontend is chasing referral and requests a TGS for Sname: `krbtgt/CORP.CONTOSO.COM` for itself, but now against trusting Realm KDC `corp-2012-dc1.corp.contoso.com`.

  ```
  Kerberos: TGS Request Realm: CORP.CONTOSO.COM Sname: krbtgt/CORP.CONTOSO.COM
  TgsReq: Kerberos TGS Request
   KdcReq: KRB_TGS_REQ (12)
     MsgType: KRB_TGS_REQ (12)
     PaData:
       PaDataType: PA-TGS-REQ (1)
       KrbApReq: KRB_AP_REQ (14)
         Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/CORP.CONTOSO.COM
                                                      
                                                  ****TGT for Frontend**** 

     ReqBody:
       KdcOptions: 0x40810000
                     
                 ****no S4U2proxy request**** 
       Realm: CORP.CONTOSO.COM  
  ```

- Trusting KDC `corp-2012-dc1.corp.contoso.com` provides TGT `krbtgt/CORP.CONTOSO.COM` for Frontend.

  ```
  Kerberos: TGS Response Cname: ROOT-2012-APP1$
  TgsRep: Kerberos TGS Response
    KdcRep: KRB_TGS_REP (13)
      Crealm: ROOT.FABRIKAM.COM
      Cname: ROOT-2012-APP1$
      Ticket: Realm: CORP.CONTOSO.COM, Sname: krbtgt/CORP.CONTOSO.COM
                                                   
                                              ****trusting realm TGT for Frontend****
   ```

   **Note**:   
  You may note an extra interaction in the trace not mentioned in the Flow diagram; Frontend requests a TGS for itself, SPN `MSSQL/corp-2012-app1.corp.contoso`.

- Frontend has a cross-realm TGT for the user (S4U referral TGT) and a TGT for itself for `krbtgt/CORP.CONTOSO.COM`. It can now perform the S4U2proxy request for the Backend target SPN `MSSQL/corp-2012-app1.corp.contoso.com`, against the trusting Realm KDC.

  ```
  Kerberos: TGS Request Realm: CORP.CONTOSO.COM Sname: MSSQL/corp-2012-app1.corp.contoso.com
  TgsReq: Kerberos TGS Request
   KdcReq: KRB_TGS_REQ (12)
     MsgType: KRB_TGS_REQ (12)
     PaData:
       PaDataType: PA-TGS-REQ (1)
       KrbApReq: KRB_AP_REQ (14)
       Ticket: Realm: CORP.CONTOSO.COM, Sname: krbtgt/CORP.CONTOSO.COM
                                               
                                               ****TGT for Frontend**** 

     ReqBody:
       KdcOptions: 0x40830000   # S4U2proxy request
       Realm: CORP.CONTOSO.COM
       Sname: MSSQL/corp-2012-app1.corp.contoso.com
     AdditionalTickets:
       Ticket: Realm: ROOT.FABRIKAM.COM, Sname: krbtgt/CORP.CONTOSO.COM
                                                
                                              ****cross realm TGT for User**** 
   ```

- Trusting KDC provides proxy TGS `MSSQL/corp-2012-app1.corp.contoso.com` for User `DHamilton` to Frontend.

  ```
  Kerberos: TGS Response Cname: dhamilton
  TgsRep: Kerberos TGS Response
    KdcRep: KRB_TGS_REP (13)
      Crealm: ROOT.FABRIKAM.COM
      Cname: dhamilton
      Ticket: Realm: CORP.CONTOSO.COM, Sname: MSSQL/corp-2012-app1.corp.contoso.com
                                                
                            ****trusting realm TGS for Frontend to authenticate on behalf of User _dhamilton_ against the 
   Backend****
   ```

- Now it is up to the Backend to build the Token from the Ticket PAC and allow the access per the granted privileges.

---

### Resource-based KCD - Backend KDC Behavior

#### KDC Decision Flow

  
![KDC Decision Flow](/.attachments/image-10705a0c-f5dc-4a80-83b8-da83f28d4e8d.png)

- KDC provides **referrals** in case he is not the right target for the S4U2Proxy request, i.e. to **subordinate** domains (more information about Kerberos referrals is outlined later) 

- If Resource-based KCD is not configured via _**msDS-AllowedToActOnBehalfOfOtherIdentity**_ or fails the access check, standard KCD via _**msDS-AllowedToDelegateTo [A2D2]**_ is **fallback** mechanism  expected to fail cross forest