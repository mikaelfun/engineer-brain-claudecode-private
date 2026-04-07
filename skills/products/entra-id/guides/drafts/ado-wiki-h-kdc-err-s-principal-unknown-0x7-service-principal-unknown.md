---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Looking for known solutions/KDC_ERR_S_PRINCIPAL_UNKNOWN (0x7) [Service Principal Unknown]"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Looking%20for%20known%20solutions/KDC_ERR_S_PRINCIPAL_UNKNOWN%20%280x7%29%20%5BService%20Principal%20Unknown%5D"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1500195&Instance=1500195&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1500195&Instance=1500195&Feedback=2)

___
<div id='cssfeedback-end'></div>

# KDC_ERR_S_PRINCIPAL_UNKNOWN (0x7) [Service Principal Unknown]

**Summary**  
This page is part of the DS Kerberos wiki, under the "Looking for known solutions" section and describes the most common issues and solutions when a domain controller responds with the message "KDC_ERR_S_PRINCIPAL_UNKNOWN" during a Ticket Granting Service (TGS) Request.

[[_TOC_]]

## Context
_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

---

## Summary
This document addresses the common issues and solutions when encountering the error "KDC_ERR_S_PRINCIPAL_UNKNOWN" during a TGS Request in Kerberos. This error can often be a false positive, especially when NTLM fallback is expected.

---

## KDC_ERR_S_PRINCIPAL_UNKNOWN (0x7) [Service Principal Unknown]

In many cases, this error is a false positive when NTLM fallback is expected for customer configuration reasons.

 **Note** that this fallback is restricted to some specific scenarios since the update labeled as "1b.22".

[Servicing: 1B.22: Kerberos-> NTLM Fallback hardening in CVE-2022-21920 / MSRC 66746 may affect authentication with 3-part SPNs](https://internal.evergreen.microsoft.com/en-us/topic/4ef09fc4-a7d8-e75a-1cc9-07fa656e053a)  
[Servicing: 1B.22: Summary of Active Directory and Kerberos hardening changes in January 11, 2022 and newer Windows Updates](https://internal.evergreen.microsoft.com/en-us/topic/48c472db-0f26-dc2c-a2d7-4c29bec696d1?app=kbclient&search=%221b.22%22)

For more information about logging false positives, see also [KB 262177 // How to enable Kerberos event logging](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/enable-kerberos-event-logging).

When this error is involved in Kerberos Constrained Delegation (KCD) setup, with Services for User to Proxy (S4U2Proxy) and needed to work as an Evidence ticket, it can be a terminating failure.

---

### Malformed SPN

An application using Kerberos is responsible for passing the correct Service Principal Name (SPN). Malformed SPNs not intended to be registered at any account are not a problem of the Windows Kerberos Client.

- Client sends the SPN (provided by the application) within the KRB_TGS_REQ.
- Check the SPN within the KRB_TGS_REP from the Key Distribution Center (KDC) logs:
  - In network trace:  
    ![network trace example](/.attachments/image-f76a258e-170a-4e52-8733-501cf8b7329e.png)
  - In kdc.etl:
    ```
    796 [1] 030C.0E74::04/02/24-15:18:48.5242820 [dll] gettgs_cxx3827 I_GetTGSTicket() - I_GetTGSTicket [entering] trying to build a new ticket uups/Caeint33
    797 [1] 030C.0E74::04/02/24-15:18:48.5242829 [dll] gettgs_cxx3877 I_GetTGSTicket() - I_GetTGSTicket requesting u2u? FALSE
    812 [1] 030C.0E74::04/02/24-15:18:48.5244445 [dll] gettgs_cxx3901 I_GetTGSTicket() - KLIN(4040f3d) failed to normalize 0x7, ServiceName
    813 [1] 030C.0E74::04/02/24-15:18:48.5244472 [dll] gettgs_cxx3902 I_GetTGSTicket() - ServiceName uups/Caeint33
    814 [1] 030C.0E74::04/02/24-15:18:48.5244488 [dll] gettgs_cxx4899 I_GetTGSTicket() - I_GetTGSTicket [Leaving] 0x7
    ```

#### Resolution
- If the application is Microsoft, involve the proper team. Otherwise, suggest the customer to involve the vendor.

---

### Invalid SPN per DNS suffix

- Client performs DNS Name Resolution with an Alias Name not registered at the intended target account, resulting in an invalid SPN.
- Server NetBIOS Name appended DNS suffix matches only to a DNS Host record, but not to an according SPN.

#### Resolution
- Avoid using Flat NetBIOS names for cross-domain/forest resources.
- Reconsider/correct name resolution or register the alternate SPN to the corresponding computer account object.  
  To register the alternate SPN to a computer account, use setspn.exe. Reference article about publishing an SPN: [Manually Registering SPNs](https://social.technet.microsoft.com/wiki/contents/articles/717.service-principal-names-spn-setspn-syntax.aspx#Manually_Registering_SPNs)  
  [Setspn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc731241(v=ws.11))  
  [Example with Web applications](https://techcommunity.microsoft.com/t5/iis-support-blog/how-to-use-spns-when-you-configure-web-applications-that-are/ba-p/324648)  
  [Example with SQL](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/register-a-service-principal-name-for-kerberos-connections?view=sql-server-ver16)
- This is only possible on non-DCs due to SPN protection (custom SPNs are removed every 15 minutes), unless specified in _msDS-additionalDnsHostName_ (not recommended, intended for DC rename operation).

---

### SPN not registered/unique

This error is not only returned when the SPN is not registered but also when the KDC detects the SPN as not uniquehence as duplicate. With the Windows Server 2012 Feature [SPN and UPN uniqueness](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/component-updates/spn-and-upn-uniqueness) the frequency of the error was reduced. As [this feature can be bypassed](https://support.microsoft.com/en-us/topic/duplicate-spn-check-on-windows-server-2012-r2-based-domain-controller-causes-restore-domain-join-and-migration-failures-aa11508f-7dfd-4444-835b-7febc303ed5e), the below steps are still valid.

#### Resolution
- Search Active Directory to see if the SPN is registered or registered to multiple accounts in the whole forest (using parameter /t 3268 to contact a Global Catalog (GC)):  
  Use LDIFDE to search the directory ("http/" after "serviceprincipalname=" should be modified by the SPN that is missing. * is a wildcard):  
  ```
  LDIFDE /f spn.txt /t 3268 -r (serviceprincipalname=http/*) /l serviceprincipalname
  ```
  - Review the spn.txt output file and see where, if anywhere, the SPN is registered and resolve the SPN issue if found.

- Alternative:
  - ```
    SETSPN -T <domain> -F -Q http/*
    ```
    It will find all SPNs of the form http/* registered in the forest to which <domain> belongs.
  - ```
    setspn -X
    ```
    -F Perform queries at the forest, rather than domain level.  
      For example, to register SPN "http/daserver" for computer "daserver1" if no such SPN exists in the forest:  
      ```
      setspn -F -S http/daserver daserver1
      ```
    -T Perform query on the specified domain or forest (when -F is also used).  
      Usage: setspn -T domain (switches and other parameters). Use "" or * to indicate the current domain or forest.  
      For example, to report all duplicate registration of SPNs in this domain and contoso domain:  
      ```
      setspn -T * -T contoso -X
      ```
      To find all SPNs of the form */daserver registered in the forest to which contoso domain belongs:  
      ```
      setspn -T contoso -F -Q */daserver
      ```

---

### Implicit SPN not contained in alias list _sPNMappings_

- Many SPNs are already registered as implicit on the machine account.
- Table of Implicit SPN prefixes, mapped to explicit SPN prefix HOST:

  | SPN            | SPN             | SPN               | SPN             |
  |:--------------:|:---------------:|:-----------------:|:---------------:|
  | alerter        | http            | policyagent       | scm             |
  | appmgmt        | ias             | protectedstorage  | seclogon        |
  | browser        | iisad           | rasman            | snmp            |
  | cifs           | min             | remoteaccess      | spooler         |
  | cisvc          | messenger       | replicator        | tapisrv         |
  | clipsrv        | msiserver       | rpc               | time            |
  | dcom           | mcsvc           | rpclocator        | trksvr          |
  | dhcp           | netdde          | rpcss             | trkwks          |
  | dmserver       | netddedsm       | rsvp              | ups             |
  | dns            | netlogon        | samss             | w3svc           |
  | dnscache       | netman          | scardsvr          | wins            |
  | eventlog       | nmagent         | scesrv            | www             |
  | eventsystem    | oakley          | schedule          | fax             |
  | plugplay       |                 |                   |                 |

  [The built-in SPNs that are recognized for computer accounts are](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc731241(v=ws.10)?redirectedfrom=MSDN)

  [KB5008382Verification of uniqueness for user principal name, service principal name, and the service principal name alias (CVE-2021-42282)](https://support.microsoft.com/en-us/topic/kb5008382-verification-of-uniqueness-for-user-principal-name-service-principal-name-and-the-service-principal-name-alias-cve-2021-42282-4651b175-290c-4e59-8fcb-e4e5cd0cdb29)

#### Resolution
- This mapping can be verified and defined by the Active Directory (AD) attribute **_sPNMappings_** on dn: CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=contoso,DC=com.
- LDIFDE command to dump the object and check the attribute:  
  ```
  ldifde -f DirectoryServiceOBJExport.ldf -d "CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=contoso,DC=com"
  ```

  ![LDIFDE command output example](/.attachments/image-e7b6be14-1bc7-4bf5-bac6-08fb42d63096.png)

---

### User-to-User Authentication (U2U) is required

- The Sname doesn't specify an SPN but a samAccountName, and no SPN is registered on this user account.
- KDC returns **KDC_ERR_S_PRINCIPAL_UNKNOWN**, but together with sub error **KDC_ERR_MUST_USE_USER2USER** (only visible in KDC ETL).
- Hence the returned error KDC_ERR_S_PRINCIPAL_UNKNOWN is a false positive, and can be safely ignored, just telling the client that User-to-User Authentication is required. Client will send a new request, with the KrbFlag EncTktInSkey set.

#### Resolution
- None required, the false positive will trigger a client retry.

---

### Cross Forest Access

Generic SPN  
- When the error is returned during a **cross forest access** for a generic SPN, not reflecting the Fully Qualified Domain Name (FQDN) of the trusting Forest, like _HTTP/MyWebSite.VirtualDomain.com_, while the pool account where the SPN is registered is located in forest _Contoso.com_, you need to add _VirtualDomain.com_ as an alternate UPN Suffix to Forest _Contoso.com_ to be populated to any trusted Forest for Kerberos routing.  
  For more information on this topic and potential registration conflicts, please see [KB 4485415 
  ADDS: Conflict status reported in trust Name Suffix Routing tab, after registering a Virtual parent UPN](https://internal.evergreen.microsoft.com/en-us/topic/c9aa1479-b266-387c-21c7-8f3da28f5856).  
  **Note**: **_<u>Please do not use<u>_** "[Kerberos Forest Search Order (KFSO)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/hh921473(v%3dws.10))" as an alternative solution for this error. KFSO is the VERY LAST resort. It is expensive and does not scale well. This is nothing you want to be used in high-volume environments. The highest effort goes into SPNs you dont find anywhere. This is then a potential DoS surface as this can make you run out of DC ATQ worker threads.

#### Resolution
- After checking potential registration conflict, add the alternative UPN suffix to the trusting forest following the steps described in this article [Enable or Disable an Existing Name Suffix from Routing](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc731648%28v%3dws.10%29).
- **Please notice that you may experience also the error if an alternative UPN suffix is being re-used**:  
  If an alternative UPN suffix was previously configured on a different forest in the infrastructure and was then removed and re-used in a different forest, domain controllers for all the domains in the previously "owning" forests should be restarted, otherwise KDC_ERR_S_PRINCIPAL_UNKNOWN may be returned and the error "The security database on the server does not have a computer account for this workstation trust relationship" may be experienced. See KB [4017730 - Attempt to access trusting domain via Forest Trust fails from child domains when a conflicting alternate UPN was configured](https://internal.evergreen.microsoft.com/en-us/topic/a60b756f-92a8-8105-7500-4050e642f49e).

---

### Bi-directional forest trust is needed for SU42self

- Kerberos Constrained Delegation, with option Use Kerberos Only (SU42proxy) is designed so that the Frontend just passes the received user ticket (called evidence ticket) to the KDC when requesting a ticket to a further hop/Backend. Hence all the ticket information for user authentication and authorization is already provided, and only needs adoption for the next hop, done by the delegation.
- When no Kerberos evidence ticket is provided to the Frontend by the application (like in WinRM double hop remoting), and Protocol Transition (SU42self) is allowed, a bi-directional trust is required. This also applies to resource-based constrained delegation, where SU42self is available as fallback by default.
- Without any ticket information from the user, the Kerberos client tries to get this by its own. For this purpose, Kerberos on the Frontend is simulating the user access to itself to get a ticket (similar to the evidence ticket), later used for getting the TGS for the backend. As the user is from a different Forest, an inter-realm ticket to the account forest is needed.
- To accomplish this, the Frontend requests a TGS for SName krbtgt/accountForest to its resourceForest KDC. But when accountForest is not trusting the resourceForest, the asked KDC has no routing information for this cross-forest TGS request and just responds with KRB_ERROR - KDC_ERR_S_PRINCIPAL_UNKNOWN (7). The SU42self attempt fails.
- Kerberos ETL:  **Services for User to Proxy** (Kerberos constrained delegation, Kerberos only)  
  ```
  [winnt5] Attempting S4U2Proxy: caller logon session 0:3e4, caller process id 696, logon session 0:7a0c4021, client credential user@domain.com
  ```
- Dump the frontend Account using ldifde and check that msDS-AllowedToDelegateTo is properly populated.
- Kerberos ETL: **Services for User to Self** (Kerberos constrained delegation with protocol transition)  
  ```
  [winnt5] build KerbGetS4USelfServiceTickets4u TargetName frontendAccount@contoso.com
  ```
- When the user account and the front end are in different forests, **a two-way forest trust is required**. If the trust is external/one-way, it has to be recreated. If a two-way trust is not present, the following error may be shown on the frontend:
  ```
  [0]0258.CCF4::12/29/17-07:50:37.6243218 [winnt5]TargetName krbtgt/UserDomain
  [0]0258.CCF4::12/29/17-07:50:37.6244267 [winnt5]KerbMakeSocketCall uses KdcToCall option 0.
  [0]0258.CCF4::12/29/17-07:50:37.6244355 [winnt5]Retry #0 Calling kdc 153.112.105.6 for realm contoso.com, DesiredFlags 0, connection timeout: 0 secs
  [0]0258.CCF4::12/29/17-07:50:37.6291873 [winnt5]KerbGetTgsTicket failed to unpack KDC reply: 0x3c --> generic error
  [0]0258.CCF4::12/29/17-07:50:37.6292008 [winnt5]KerbGetTgsTicket KDC error reply: 0x7, ExtendedStatus 0 
  [0]0258.CCF4::12/29/17-07:50:37.6292087 [winnt5]TargetName krbtgt/UserDomain 
  [0]0258.CCF4::12/29/17-07:50:37.6292097 [winnt5]KerbGetTgsTicket KerbCallKdc: error 0x7
  ```
  
### Resolution
Establish a Bi-directional Forest Trust

