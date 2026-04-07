---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Delegation/Kerberos: User-to-User Authentication, U2U"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Delegation/Kerberos%3A%20User-to-User%20Authentication%2C%20U2U"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1190796&Instance=1190796&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1190796&Instance=1190796&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This article explains the Kerberos User-to-User Authentication (U2U) process, detailing the situations requiring U2U, the protocol flow, error handling, and technical requirements. It includes examples and solutions for common issues related to U2U authentication.

[[_TOC_]]

# Situation requiring user-to-user authentication

- Most common:  
An application wants to perform an access check for a specific user. For that purpose, it needs a ticket for that user, only for getting the Privilege Attribute Certificate (PAC) containing the group memberships, which is needed for validation.

- Service A, acting as the user, starts another application executable called Service B (not via Service Control Manager (SCM)).

- Service B **does not have** the **User (private) Key**; only the User's **Ticket Granting Ticket (TGT)** and **Logon session key** are available.

- It cannot decrypt normal Ticket Granting Service (TGS) Tickets sent in KRB_AP_REQ due to the **missing User Key** and requires Service B to request a new **TGS** issued with the **User Logon session key** it was started with.

# Topics

- User-to-User Authentication U2U - Flow
- KRB_TGS_REP with KDC_ERR_S_PRINCIPAL_UNKNOWN
- MSONLY: KDC ETL - Flag KDC_ERR_MUST_USE_USER2USER
- KRB_TGS_REQ with flag EncTktInSkey
- U2U requirement and PAC information
- New logon session and logon security event 4624
- Logon session ticket cache
- MSONLY: KDC ETL - handling KdcOptions 0x40810008

# User-to-User Authentication U2U - Flow

![Kerberos U2U Flow](/.attachments/image-e965ba4b-e9d0-49ab-a8ab-e219ec04b1d0.png)

1. Client/User requests TGS per Service B SPN/UPN. KDC encrypts TGS with the User Key.
1. Client sends TGS in _KRB_AP_REQ_ to Service B.
1. Service B cant decrypt TGS and responds with an error, requesting **Encrypt Ticket with Session Key from TGT** (per WP).
   **<< OR >>**  
   KDC detects that provided **Sname** is **username** (SAM) **not** configured for **S4U2Self**, it sends back _**KDC_ERR_S_PRINCIPAL_UNKNOWN**_ with flag 0x1B (not in NM trace) _**KDC_ERR_MUST_USE_USER2USER**_.
1. Client requests TGS from KDC, now with flag _**ENC_TKT_IN_SKEY**_ and the **User's TGT** in the _**Additional Tickets**_ section. KDC gets the **TGS (Logon) Session Key** from TGT for encrypting the new TGS for Service B.
1. Now Service B can decrypt the TGS sent in the second KRB_AP_REQ because it also has the **TGS (Logon) Session Key** in its cache.

# KRB_TGS_REP with KDC_ERR_S_PRINCIPAL_UNKNOWN

- Common U2U scenario with **S4U2Self** (in CredSsp):  
  Run powershell.exe on a member server, execute method:  
  `system.security.principal.windowsidentity("user1@rw8r2.net")`

- The process needs to impersonate as User1, creating its own logon session, but missing the private Key for the account that started the process requires U2U ticketing.

- Client requests a TGS ticket to the username that started the process as in S4U2Self, Sname: administrator.

  ```plaintext
   Kerberos: TGS Request Realm: RW8R2.NET Sname: administrator
   KdcReq: KRB_TGS_REQ (12)
    MsgType: KRB_TGS_REQ (12)
      PaData: PA-TGS-REQ (1)
      PaData: PA_S4U_X509_USER (130)    # PaData for S4U2Self, Cert User
        PaS4uX509User:
          Cname: user1@rw8r2.net
      PaData: PA-FOR-USER (129)
        PaDataType: PA-FOR-USER (129)
          UserName: user1@rw8r2.net
      ReqBody:
        KdcOptions: 0x40810000          # no request for S4U2proxy
        Realm: RW8R2.NET
        Sname: administrator
                                        # no AdditionalTickets section
  ```

- KDC triggers U2U: Unless any SPN is registered on the target account, the KDC TGS replies with error _**KDC_ERR_S_PRINCIPAL_UNKNOWN**_ and flag 0x1B **KDC_ERR_MUST_USE_USER2USER** (not visible in Netmon Trace).
  ```plaintext
  Kerberos: KRB_ERROR  - KDC_ERR_S_PRINCIPAL_UNKNOWN (7)
  KrbError: KRB_ERROR (30)
    ErrorCode: KDC_ERR_S_PRINCIPAL_UNKNOWN (7)
    Sname: administrator
  ```

# MSONLY: KDC ETL - Flag KDC_ERR_MUST_USE_USER2USER

- Flag **KDC_ERR_MUST_USE_USER2USER** becomes visible only when **KDC Debug logging** is turned on (done by TSS or auth script on DC):
  - `logman start kdc -p "Security: KDC" 0x8c13 -o .\kdc.etl -ets`
  - `logman stop kdc -ets`

- In the debug log, you may notice the KDC attempting to find an appropriate UPN and SPN for the provided name "administrator", **KdcNormalize lookup up upn/spn administrator**, this fails to find an SPN and generates an initial error status 0x6 (**KDC_ERR_S_PRINCIPAL_UNKNOWN**).

Afterwards, the KDC tries to find the name via the SAM interface, **KdcNormalize checking name in SAM**, this is successful and triggers **KdcVerifyKdcRequest must use user2user** with subsequent error code **0x1B** (**KDC_ERR_MUST_USE_USER2USER**).

- KDC ETL example:

```plaintext
DEB_T_TICKETS,dll,tktutil_cxx1796,KdcNormalize(),"KdcNormalize lookup up upn/spn administrator
DEB_T_PAPI,dll,tktutil_cxx5084,KdcGetTicketInfo(),"KdcGetTicketInfo [entering] bRestrictUserAccounts true, WhichFields 0x10000000, ExtendedFields 0x4, GenericUserName administrator, LookupFlags 0x40, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x1
DEB_T_PAPI,dll,tktutil_cxx5086,KdcGetTicketInfo(),"PrincipalName (empty)
DEB_T_TICKETS,dll,tktutil_cxx5335,KdcGetTicketInfo(),"Could not open User administrator: 0xc0000225
DEB_T_PAPI,dll,tktutil_cxx5671,KdcGetTicketInfo(),"KdcGetTicketInfo [Leaving] 0x6
DEB_T_TICKETS,dll,tktutil_cxx1838,KdcNormalize(),"KdcNormalize checking name in SAM
DEB_T_PAPI,dll,tktutil_cxx5084,KdcGetTicketInfo(),"KdcGetTicketInfo [entering] bRestrictUserAccounts true, WhichFields 0x10000000, ExtendedFields 0x4, GenericUserName administrator, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x1
DEB_T_PAPI,dll,tktutil_cxx5086,KdcGetTicketInfo(),"PrincipalName (empty)
DEB_T_TICKETS,dll,tktutil_cxx5470,KdcGetTicketInfo(),"KdcGetTicketInfo getting user keys
DEB_ERROR,dll,tktutil_cxx5491,KdcGetTicketInfo(),"KdcVerifyKdcRequest must use user2user UserAccountControl 0x210, GenericUserName administrator
DEB_ERROR,dll,tktutil_cxx5492,KdcGetTicketInfo(),"PrincipalName (empty)
DEB_T_PAPI,dll,tktutil_cxx5671,KdcGetTicketInfo(),"KdcGetTicketInfo [Leaving] 0x1B
DEB_T_PAPI,dll,tktutil_cxx2111,KdcNormalize(),"KdcNormalize [Leaving] 0x1B
DEB_WARN,dll,gettgs_cxx3126,I_GetTGSTicket(),"KLIN(4040c36) failed to normalize 0x1B, ServiceName
DEB_WARN,dll,gettgs_cxx3127,I_GetTGSTicket(),"ServiceName administrator
DEB_T_PAPI,dll,gettgs_cxx3838,I_GetTGSTicket(),"I_GetTGSTicket [Leaving] 0x1B"
```

- This does not change the initial error **KDC_ERR_S_PRINCIPAL_UNKNOWN**, which is returned to the client, but together with sub-error **KDC_ERR_MUST_USE_USER2USER**.
- Hence, the returned error **KDC_ERR_S_PRINCIPAL_UNKNOWN** is a <u>false positive</u>, telling the client that User-to-User Authentication is required. The client will send a new request, with the KrbFlag **EncTktInSkey** set.

# KRB_TGS_REQ with flag EncTktInSkey

- The provided flag **KDC_ERR_MUST_USE_USER2USER** triggers the Kerberos Client to retry using User-to-User Authentication.
- The client now requests a TGS ticket with flag **EncTktInSkey** (Indicates that the ticket for the end server needs to be encrypted with the session key from the additional TGT) and the **process identities** (administrator account) available **TGT** in the **Additional Tickets** section.
  ```plaintext
  Kerberos: TGS Request Realm: RW8R2.NET Sname: administrator
   KdcReq: KRB_TGS_REQ (12)
    MsgType: KRB_TGS_REQ (12)
      PaData: PA-TGS-REQ (1)
      PaData: PA_S4U_X509_USER (130)     # PaData unchanged
        PaS4uX509User:
          Cname: user1@rw8r2.net
      PaData: PA-FOR-USER (129)
        PaDataType: PA-FOR-USER (129)
          UserName: user1@rw8r2.net
      ReqBody:
        KdcOptions: 0x40810008           # now with flag EncTktInSkey
        KrbFlags: 0x40810008             # 01000000100000010000000000001000
        EncTktInSkey:              (............................1...) Indicates that the ticket for the end server is to be  
         encrypted in the session key from the additional TGT provided
        Realm: RW8R2.NET
        Sname: administrator
        AdditionalTickets:              # new additional section compared to previous request
          Ticket: Realm: RW8R2.NET, Sname: krbtgt/RW8R2.NET
                                        # TGT from administrator context
  ```  

- KDC checks for flag **EncTktInSkey** and validates the TGT from **AdditionalTickets** against the account mapped to target Sname: administrator. When okay, it creates a ticket for user1 **{T}= {C, S, t, PAC, KC,S}** but uses the target accounts (logon) session key **KC,S**, instead of the user's private key **KS**, encrypting this TGS (**{T}KC,S** instead of **{T}KS**).

  ```plaintext
   Kerberos: TGS Response Cname: user1@rw8r2.net  
   KdcRep: KRB_TGS_REP (13)
    Cname: user1@rw8r2.net
    Ticket: Realm: RW8R2.NET, Sname: administrator
  ```

- The Kerberos Client opens a **new Logon Session** for user1, storing the obtained ticket.
- Since the TGS is now encrypted with the Logon session key the powershell.exe process has available, the (local) **KRB_AP_REQ** can be decrypted successfully.

# U2U requirement and PAC information

- WAAG/TGGAU  
 Note:  
  If KDC returns _**KDC_ERR_C_PRINCIPAL_UNKNOWN**_, the target does not have sufficient permissions to read the attributes of the user account in Active Directory (AD), which is by default granted via Windows Authorization Access Group (WAAG), ref. [Some applications and APIs require access to authorization information on account objects](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/apps-apis-require-access).

Example:

| Method  | Details |
|:--:|:--|
|**Method 1**|Add the computer account Server to the Windows Authorization Access group.<br>To do this, follow these steps:<br>-  Click Start, point to Administrative Tools, and then click Active Directory Users and Computers.<br>- In Active Directory Users and Computers, click Builtin, and then double-click Windows Authorization Access Group.<br>- Click the Members tab, and then add the Server computer account to the Members list.|
|**Method 2**|Make sure that the following access requirements match the Service-for-User (S4U) caller.<br>Example:<br> In this case, the S4U caller needs:<br>- The user object or the computer object.<br>- The Remote Access Information property.<br>- The Remote Access Information property.<br> Note:<br> _The GUID of this property is 037088f8-0ae1-11d2-b422-00a0c968f939. This property includes the following attributes:<br>msNPAllowDialin<br>msNPCallingStationID<br>msRADIUSCallbackNumber<br>msRADIUSFramedIPAddress<br>msRADIUSFramedRoute<br>msRADIUSServiceType<br>TokenGroups_<br>- The token-groups-global-and-universal (TGGAU) property.

## Solutions are:

- Giving Authenticated Users the required permission directly (assign to each user).
- Adding the security principal that is used by Server in Windows Authorization Access group or Pre-Windows 2000 Compatible Access.
- Adding Authenticated Users or everyone to Pre-Windows 2000 Compatible Access group.

If the domain is in pre-Windows 2000 compatibility access mode, the Everyone group has read access to the TGGAU attribute on user account objects and on computer account objects. In this mode, applications and functions have access to TGGAU.

If the domain isn't in pre-Windows 2000 compatibility access mode, you may have to enable certain applications to read the TGGAU. Because the Windows Authorization Access Group doesn't exist on Windows 2000, it's recommended that you create a domain local group for this purpose, and that you add the user or computer account that requires access to the TGGAU attribute to that group. This group would have to be given access to the tokenGroupsGlobalAndUniversal attribute on user objects, on computer objects, and on iNetOrgPerson objects.

The group WAAG provides access to the TGGAU [TokenGroupsGlobalAndUniversal] attribute on user objects and is required to build auth tokens for users. When using S4U [Service for you] it is recommended that the service account become part of that group.

For domains that use existing applications, you can handle these applications by adding the security contexts that those applications run as to the Pre-Windows 2000 Compatible Access group. Instead, you can select the "Permissions compatible with pre-Windows 2000 servers" option during the DCPromo process when you create a domain. (On Windows Server 2003, this option is worded as follows: "Permissions compatible only with Windows 2000 or Windows Server 2003 operating systems".) This selection adds the Everyone group to the Pre-Windows 2000 Compatible Access group, and thereby grants the Everyone group read access to the TGGAU attribute and to many other domain objects.

When a new Windows Server 2003 domain is created, the default access compatibility selection is Permissions compatible only with Windows 2000 or Windows Server 2003 operating systems. When this option is set, the Pre-Windows 2000 Compatibility Access group includes only the Authenticated Users built-in security identifier, and read access to the TGGAU attribute on objects is limited. In this case, applications that require access to the TGGAU group are denied access unless the account under which the applications run has domain administrator rights or similar user rights.

(To see the attribute TGGAU, on the attributes filter, select "Constructed" and "Backlinks"):  
[Some applications and APIs require access to authorization information on account objects](http://support.microsoft.com/en-us/kb/331951/en-us)

While based on Kerberos ticket with PAC: it is not the service account that needs to request TGGAU.  
Using a form-based authentication, it does not use Kerberos and needs to retrieve TGGAU, meaning it needs read permission on the attribute.

- Permissions  
  "Pre-windows 2000 Compatible Access" on OU where user accounts: assign read TGGAU (descendant User objects).

Allow BUILTIN\Windows Authorization Access Group  
  SPECIAL ACCESS for tokenGroupsGlobalAndUniversal  
  READ PROPERTY

 API for S4U2self

   ```plaintext
    LsaLogonUser() : KERB_S4U_LOGON
    Where } AuthenticationPackage = Kerberos
        } AuthenticationInformation = KERB_S4U_LOGON Structure  WindowsIdenity class object
                            
   typedef struct _KERB_S4U_LOGON {
   KERB_LOGON_SUBMIT_TYPE MessageType;
   ULONG Flags;
   UNICODE_STRING ClientUpn;
   UNICODE_STRING ClientRealm; } 
   KERB_S4U_LOGON;
   ```

- From the TGS **{T}= {C, S, t, PAC, KC,S}** in the **KRB_TGS_REP**, powershell.exe can show related PAC information:

  ```plaintext
  PS C:\> new-object system.security.principal.windowsidentity("user1@rw8r2.net")
  AuthenticationType : Kerberos
  ImpersonationLevel : Identification
  IsAuthenticated    : True
  IsGuest            : False
  IsSystem           : False
  IsAnonymous        : False
  Name               : RW8R2\user1
  Owner              : S-1-5-21-3055550381-1246328994-574607260-1118
  User               : SS-1-5-21-3055550381-1246328994-574607260-1118 
   Groups             : {S-1-5-21-3055550381-1246328994-574607260-513, S-1-1-0, S-1-5-32-545, S-1-5-2...} 
  Token              : 1556
  ```

#New Logon session for the target user and Logon Security Event 4624
The new Logon Session for user1 is also noted in the Logon Security Event 4624:

 ```plaintext
Kerberos: Log Name:      Security 
Source:        Microsoft-Windows-Security-Auditing 
Event ID:      4624 
Task Category: Logon 
Level:         Information 
Keywords:      Audit Success 
User:          N/A 
Computer:      RW8R2M1.RW8R2.NET 
Description:   An account was successfully logged on. 
Subject:        # this is the user and logon session information starting the process 
Security ID:        RW8R2\administrator 
Account Name:        administrator 
Account Domain:    RW8R2 
Logon ID:        0x70677 
Logon Type:        3
 
New Logon:       # this is the user and logon session information for the new logon 
Security ID:        RW8R2\user1              
Account Name:        user1 
Account Domain:    RW8R2 
Logon ID:        0x13ab991d8 
Logon GUID:        {1fb1d949-6b3d-4c29-f994-c1b05317fedb} 
 
Process Information: 
Process ID:        0xa04 
Process Name:        C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe  
                  # process created new logon 
 
Network Information: 
Workstation Name:    RW8R2M1 
Source Network Address:    - 
Source Port:        - 
 
Detailed Authentication Information: 
Logon Process:        C 
Authentication Package:    Kerberos 
Transited Services:    - 
Package Name (NTLM only):    - 
Key Length:         
 ```

--> The new Logon Session ID for RW8R2\user1 is 0x13ab991d8

#Logon session ticket cache
From an elevated prompt we can now check with **KLIST** the ticket content of the new Logon Session ID **0x13ab991d8**

Note:
The value 0x13ab991d8 has more than 8 digits. We need it to separate this into a low and high part for KLIST:
high 0x1 ; low 0x3ab991d8.

`KLIST Syntax: Klist.exe [-lh <LogonId.HighPart>] [-li <LogonId.LowPart>]`

 ```plaintext
C:\Users\administrator.RW8R2>klist -lh 0x1 -li 0x3ab991d8 
Current LogonId is 0:0x70677 
Targeted LogonId is 0x1:0x3ab991d8 
Cached Tickets: (1) 
#0>     Client: user1@rw8r2.net @ RW8R2.NET 
        Server: administrator @</SPAN> 
        KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96 
        Ticket Flags 0xa00000 -> renewable pre_authent     # limited usability 
        Start Time: 5/23/2012 13:37:08 (local) 
        End Time:   5/23/2012 13:52:08 (local) 
        Renew Time: 5/25/2012 17:51:23 (local) 
        Session Key Type: RSADSI RC4-HMAC(NT)
 ```

#MSONLY: KDC ETL - handling KdcOptions 0x40810008

**MSONLY**:   
During the retry the KDC evaluates AdditionalTickets section KdcNormalize(),"PrincipalName user1@rw8r2.net , notifies checking the extended KdcOptions KdcOptions 0x40810008 and "Inserting S4U authorization data into ticket.

 ```plaintext
DEB_T_TICKETS,dll,tktutil_cxx1796,KdcNormalize(),"KdcNormalize lookup up upn/spn administrator 

... 

DEB_T_PAPI,dll,tktutil_cxx5671,KdcGetTicketInfo(),"KdcGetTicketInfo [Leaving] 0x6   # again this is error KDC_ERR_C_PRINCIPAL_UNKNOWN at this stage 
DEB_T_TICKETS,dll,tktutil_cxx1838,KdcNormalize(),"KdcNormalize checking name in SAM 

... 

DEB_T_PAPI,dll,tktutil_cxx1180,KdcNormalize(),"KdcNormalize [entering] normalizing name, WhichFields 0x333fcbcf, ExtendedFields 0x1, PrincipalName 0000000004F8AFC0, PrincipalRealm (null), RequestRealm (null), TgtClientRealm (null), NameFlags 0x55, MappedAttr 0000000000000000 

DEB_T_PAPI,dll,tktutil_cxx1182,KdcNormalize(),"PrincipalName user1@rw8r2.net 

DEB_T_TICKETS,dll,tktutil_cxx1764,KdcNormalize(),"KdcNormalize checking UPN 

DEB_T_TICKETS,dll,tktutil_cxx1796,KdcNormalize(),"KdcNormalize lookup up upn/spn user1@rw8r2.net 

DEB_T_PAPI,dll,tktutil_cxx5084,KdcGetTicketInfo(),"KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x333fcbcf, ExtendedFields 0x1, GenericUserName user1@rw8r2.net, LookupFlags 0x200, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2 

DEB_T_PAPI,dll,tktutil_cxx5086,KdcGetTicketInfo(),"PrincipalName (empty) 

DEB_T_TICKETS,dll,tktutil_cxx5470,KdcGetTicketInfo(),"KdcGetTicketInfo getting user keys 

DEB_T_PAPI,dll,tktutil_cxx5671,KdcGetTicketInfo(),"KdcGetTicketInfo [Leaving] 0 

DEB_T_PAPI,dll,tktutil_cxx2111,KdcNormalize(),"KdcNormalize [Leaving] 0 

DEB_T_TICKETS,dll,tktutil_cxx2208,KdcBuildTicketTimesAndFlags(),"KdcBuildTicketTimesAndFlags ClientPolicyFlags 0, ServerPolicyFlags 0x7b, KdcOptions 0x40810008 

DEB_T_TICKETS,dll,tktutil_cxx2306,KdcBuildTicketTimesAndFlags(),"KdcBuildTicketTimesAndFlags SourceTicketFlags 0x40e00000 

DEB_ERROR,dll,tktutil_cxx2842,KdcBuildTicketTimesAndFlags(),"S4U - Turning off fwdable flag (svr restriction) 

DEB_T_TICKETS,dll,gettgs_cxx665,KdcInsertInitialS4UAuthorizationData(),"Inserting S4U authorization data into ticket. 

DEB_T_PAPI,dll,gettgs_cxx3838,I_GetTGSTicket(),"I_GetTGSTicket [Leaving] 0 

DEB_T_TICKETS,dll,gettgs_cxx6656,HandleTGSRequest(),"S4U Reply client name 

DEB_T_TICKETS,dll,gettgs_cxx6657,HandleTGSRequest(),user1@rw8r2.net 

DEB_T_TICKETS,dll,gettgs_cxx6658,HandleTGSRequest(),"Realm RW8R2.NET"
 ```

- This does change the initial error 0x6 KDC_ERR_S_PRINCIPAL_UNKNOWN,  
`I_GetTGSTicket [Leaving] 0, the ticket is now returned for Cname user1@rw8r2.net`