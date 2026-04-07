---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/Troubleshooting/Basics verifications"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/Troubleshooting/Basics%20verifications"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1540108&Instance=1540108&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1540108&Instance=1540108&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides a detailed guide on different logon restriction methods and their corresponding log entries in a Windows Server environment. It covers three scenarios: Logon Restriction method, Deny log on locally, and Authentication Policy defining where a user can log on.

---

Thanks to @<A131E9B0-5237-652E-8BD7-DDAEE975CDBB> 

---

## Environment

Domain name: contoso.com  
DC name: ContosoDC1.contoso.com  
Workstations used: Client1.contoso.com / Client2.contoso.com  
User account used: User1@contoso.com

---

## Scenarios

### Scenario 1 - Logon restriction method

We will use the existing Logon Restrictions method and configure the "Log On To" section of "User1" to Client2, thus allowing the user to log on to the Client2 workstation only.
  
![Logon Restrictions Configuration](/.attachments/image-e108995f-48f2-40fb-8048-1b6841b23210.png)

![Logon Restrictions Result](/.attachments/image-7a8d07d6-2932-4e93-9c2e-1fed40fc99ff.png)

Attempting to interactively log on to another workstation (Client1) returns:

    "Your account is configured to prevent you from using this PC. Please try another PC."

#### From logs - Scenario 1

Network capture on DC shows KRB_ERROR - KDC_ERR_POLICY (12):

    2:55:40 PM 4/18/2024	Client1.contoso.com	contosodc1.contoso.com	KerberosV5	KerberosV5:AS Request Cname: user1 Realm: contoso Sname: krbtgt/contoso 
    2:55:40 PM 4/18/2024	contosodc1.contoso.com	Client1.contoso.com 	KerberosV5	KerberosV5:KRB_ERROR  - KDC_ERR_POLICY (12)

Security Events:

4768 (DC):

    "A Kerberos authentication ticket (TGT) was requested.
    
    Account Information:
        Account Name:        user1
        Supplied Realm Name: contoso
        User ID:             NULL SID
    
    Service Information:
        Service Name:        krbtgt/contoso
        Service ID:          NULL SID
    
    Network Information:
        Client Address:      ::ffff:192.168.2.65
        Client Port:         51507
    
    Additional Information:
        Ticket Options:      0x40810010
        Result Code:         0xC  -----> means "12" means "KDC_ERR_POLICY"
        Ticket Encryption Type: 0xFFFFFFFF
        Pre-Authentication Type: -
    
    Certificate Information:
        Certificate Issuer Name:        
        Certificate Serial Number:    
        Certificate Thumbprint:        
    
    Certificate information is only provided if a certificate was used for pre-authentication.
    
    Pre-authentication types, ticket options, encryption types, and result codes are defined in RFC 4120."

4625 (Client1):

    An account failed to log on.
    
    Subject:
        Security ID:        SYSTEM
        Account Name:       CLIENT1$
        Account Domain:     CONTOSO
        Logon ID:           0x3E7
    
    Logon Type:            10
    
    Account For Which Logon Failed:
        Security ID:        NULL SID
        Account Name:       user1
        Account Domain:     contoso
    
    Failure Information:
        Failure Reason:     User not allowed to log on at this computer.
        Status:             0xC000006E --> STATUS_ACCOUNT_RESTRICTION
        Sub Status:         0xC0000070 --> STATUS_INVALID_WORKSTATION
    
    Process Information:
        Caller Process ID:  0xc64
        Caller Process Name: C:\Windows\System32\svchost.exe
    
    Network Information:
        Workstation Name:   CLIENT1
        Source Network Address: 192.168.2.1
        Source Port:        0
    
    Detailed Authentication Information:
        Logon Process:      User32 
        Authentication Package: Negotiate
        Transited Services: -
        Package Name (NTLM only): -
        Key Length:         0

---

### Scenario 2 - Deny log on locally

On Client1's workstation, we configured user account User1 under Computer Configuration\Windows Settings\Security Settings\Local Policies\User Rights Assignment\Deny log on locally.

So, this user should no longer be allowed to interactively log on to Client1. Upon interactively logging in to the workstation, User1 gets the following error:

    "The sign in method you're trying to use isn't allowed. For more info, contact your network administrator."

Let's see how this looks in logs.

#### From logs - Scenario 2

Network capture shows we get a successful response from our DC in the AS REP phase:

    5:55:40 PM 4/19/2024	Client1.contoso.com  ContosoDC1.contoso.com	 KerberosV5	KerberosV5:AS Request Cname: user1 Realm: contoso Sname: krbtgt/contoso 
    5:55:40 PM 4/19/2024	ContosoDC1.contoso.com	Client1.contoso.com	KerberosV5	 KerberosV5:AS Response Ticket[Realm: CONTOSO.COM, Sname: krbtgt/CONTOSO.COM] 

Unlike the Logon Restriction method we presented in [Scenario 1](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1479217/From-Logs?anchor=scenario-1&_a=edit), where we were failing in the AS_REP phase of the authentication, here we do not fail at this stage. From DC's point of view, the authentication is successful (tickets acquired). In this scenario, the failure is on the target.

Security events:

4625 (Client1)

    Log Name:      Security
    Source:        Microsoft-Windows-Security-Auditing
    Date:          4/26/2024 12:18:44 AM
    Event ID:      4625
    Task Category: Logon
    Level:         Information
    Keywords:      Audit Failure
    User:          N/A
    Computer:      Client1.contoso.com
    Description:
    An account failed to log on.
    
    Subject:
        Security ID:        SYSTEM
        Account Name:       CLIENT1$
        Account Domain:     CONTOSO
        Logon ID:           0x3E7
    
    Logon Type:            2
    
    Account For Which Logon Failed:
        Security ID:        NULL SID
        Account Name:       User1
        Account Domain:     CONTOSO
    
    Failure Information:
        Failure Reason:     The user has not been granted the requested logon type at this machine.
        Status:             0xC000015B --> Logon type not granted.
        Sub Status:         0x0
    
    Process Information:
        Caller Process ID:  0xc64
        Caller Process Name: C:\Windows\System32\svchost.exe
    
    Network Information:
        Workstation Name:   CLIENT1
        Source Network Address: 127.0.0.1
        Source Port:        0
    
    Detailed Authentication Information:
        Logon Process:      User32 
        Authentication Package: Negotiate
        Transited Services: -
        Package Name (NTLM only): -
        Key Length:         0

---

### Scenario 3 - Authentication policy defining where user can log on

In this scenario, we configured an authentication policy, specifying that User1 can log on to Client1.

![Authentication Policy Configuration](/.attachments/image-91a6b16d-26d7-46a0-b2ae-28164b820d12.png)

If we attempt to log in to Client2, we get the following error:

    "Your account is configured to prevent you from using this PC. Please try another PC."

This shows that our policy is in place, as we are able to log on to the Client1 workstation but unable to log on to Client2, as per the configuration of the criteria within the policy.

#### From logs - Scenario 3

Kerberol.ETL:

```
 [0] 02CC.053C::04/26/24-11:34:20.9681276 [KERBEROS] logonapi_cxx5521 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket GetTicketRestart ClientRealm contoso
    [0] 02CC.053C::04/26/24-11:34:20.9681302 [KERBEROS] logonapi_cxx2134 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket getting authentication ticket for client user1
    [0] 02CC.053C::04/26/24-11:34:20.9681305 [KERBEROS] logonapi_cxx2135 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket in realm contoso
    [0] 02CC.053C::04/26/24-11:34:20.9681324 [KERBEROS] logonapi_cxx2136 KerbGetAuthenticationTicketEx() - for ServiceName krbtgt/contoso
    [0] 02CC.053C::04/26/24-11:34:20.9681339 [KERBEROS] logonapi_cxx2349 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicketEx using default credentials contoso\user1
    [0] 02CC.053C::04/26/24-11:34:20.9681355 [KERBEROS] logonapi_cxx2351 KerbGetAuthenticationTicketEx() - to service krbtgt/contoso
    
    [0] 02CC.053C::04/26/24-11:34:20.9681786 [KERBEROS] logonapi_cxx3253 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket: Calling KDC
    [1] 02CC.053C::04/26/24-11:34:20.9691878 [common2] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 192.168.2.51
    
    [1] 02CC.053C::04/26/24-11:34:20.9722229 [commoniumsafe] utils_cxx189 KerbUnpackErrorData() - KerbUnpackErrorData received failure from kdc 0xc KLIN(0) NTSTATUS(0xc0000070)
    [1] 02CC.053C::04/26/24-11:34:20.9722242 [KERBEROS] logonapi_cxx3563 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 0xc, extendedStatus 0xc0000070
    [2] 02CC.053C::04/26/24-11:34:20.9794790 [KERBEROS] krbtoken_cxx4413 KerbCacheLogonInformation() - KerbCacheLogonInformation failed to cache credentials: 0x0, 0xc000006d
    [2] 02CC.053C::04/26/24-11:34:20.9794974 [KERBEROS] logonapi_cxx1798 KerbPingWlBalloon() - Opening winlogon event Global\000000000103f9da_WlballoonKerberosNotificationEventName failed 2
    [2] 02CC.053C::04/26/24-11:34:20.9794979 [KERBEROS] logonapi_cxx5923 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket: Showing Stale Cred Notification Balloon, Status 0xc0000070, CacheLogonFlags 0x20, UsedPrimaryLogonCreds y, ProtectedUser n
    [1] 02CC.053C::04/26/24-11:34:20.9798685 [KERBEROS] logonapi_cxx9001 KerbILogonUserEx2() - LogonUser: Failed to get TGT for contoso\user1 : 0xc0000070

```
_error "0xc0000070" means "STATUS_INVALID_WORKSTATION // The user account is restricted such that it may not be used to log on from the source workstation."_

Network capture:

    11:34:20.9693487	192.168.2.66	192.168.2.51	KerberosV5	KerberosV5:AS Request Cname: user1 Realm: contoso Sname: krbtgt/contoso 
    11:34:20.9720672	192.168.2.51	192.168.2.66	KerberosV5	KerberosV5:KRB_ERROR  - KDC_ERR_POLICY (12)