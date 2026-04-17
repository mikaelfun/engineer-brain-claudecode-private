---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/Kerberos - KRB_AS_REQ - Authentication Request"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/Kerberos%20-%20KRB_AS_REQ%20-%20Authentication%20Request"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053230&Instance=1053230&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053230&Instance=1053230&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article explains the details of the initial Kerberos Authentication Request (KRB_AS_REQ) and the process involved in obtaining a Ticket Granting Ticket (TGT) from the Key Distribution Center (KDC). It includes steps for purging Kerberos tickets, flushing DNS, and requesting a Ticket Granting Service (TGS). 

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

[[_TOC_]]

---
# Author

Thanks to @<31DF4045-43AB-67EE-8ADD-5E1F35D00145>   

---
# KRB_AS_REQ
The following outlines the details about the initial Kerberos Authentication Request (KRB_AS_REQ): an identity sends to its domain controller (KDC) (Key Distribution Center). 
![KRB_AS_REQ Process](/.attachments/image-7b32046e-4b97-4872-a9dd-ad57726d546e.png)

KRB_AS_REQ (C,KrbTgt {C,n,t}KC) includes:   

- The user principal name (Cname), legacy or UPN 
- The name of the account domain/realm (KrbTgt)
- Both are sent unencrypted and visible via Wireshark or Netmon, along with other unencrypted information (PaData, KDC options, Etypes)
- Pre-authentication data encrypted with the user's key: Client name (C); nonce (n) (random value for replay detection) and timestamp (t).  

##  Good to know 

- The user provides a username of Contoso\User and a password. At that moment, LSASS on the client encrypts the time using the user's password and sends an AS request to the domain controller, including the pre-authentication data. It will send the username, the realm (domain name), and this time encrypted with the user's password.
- The pre-authentication data of the user that is encrypted by the user's private key. It will send it to the KDC. The KDC only does a search in the Active Directory database to whom that SAM account name belongs. It will decrypt the pre-authentication data with the client's private key. After decrypting it properly, and validating the credentials, the KDC checks the account and the private key are matching and validates it.
- The domain controller receives the requestor, checks if the request is valid, meaning that the DC pulls out the time using the hash of the user's password because it got this information from the Active Directory database. It also checks if the time skew is less than five minutes.
- If so, the authentication is successful. If there is a time skew of five minutes or more, the authentication fails. It could be due to other reasons, like if the password is not correct or if the request is not valid. Once the user is validated, the DC sends the AS reply to the client and should issue a TGT (Ticket Granting Ticket), meaning that it is sending a TGT encrypted with the password of a special identity called KRBTGT.
- If the request is valid, the KDC will send an AS reply including the TGT. The ticket will be encrypted by the Kerberos TGT account password called KRBTGT. Now the client has its own TGT. This ticket is saved into the cache.
- Now the client can properly communicate with the domain controller using the session key provided within the TGT.

Token means it contains all user group membership from AD as well as from the local machine.

![Whoami groups](/.attachments/Whoami%20groups-8c95da0b-f89c-4824-9b8f-ec607ed8216c.png)  
![Whoami exported](/.attachments/Whoami%20exported-3c73df65-c184-47de-a7c0-7d7315fc0af1.png)

**Useful article:**  
[ADDS Information about the effects of group scopes, trust settings and group types on the list of SIDs in the Access token](https://internal.evergreen.microsoft.com/en-us/topic/adds-information-about-the-effects-of-group-scopes-trust-settings-and-group-types-on-the-list-of-sids-in-the-access-token-ab6792f0-82ab-04ee-2f55-de4b3aa758bd) 

The client now has a ticket granting ticket, saved into the cache, and can communicate with the domain controller to ask for a Ticket Granting Service (TGS) to access Kerberos resources.

# Scenario

We have a client that needs to get a ticket from KDC.

Client: 10.160.46.7 

To determine which DC has been used to get a Kerberos ticket, use the command `klist query_bind`.

![klist query_bind](/.attachments/klist%20query_bind-4f250f48-8589-47f3-a5a6-18bec81250c8.png)

## Purge Kerberos tickets and flush DNS

It's good practice to purge the Kerberos cached tickets and flush the DNS cache using the following commands when you are collecting authentication logs:

Flush DNS and Kerberos cache: 

```
ipconfig /flushdns  
nbtstat -R  
nbtstat -RR  
klist purge  
klist purge -li 0x3e7
```

## Request a TGS

To reproduce and get a ticket from KDC, open CMD and type the following command:  
`klist get cifs/VMDC1-Cont`

We can see the user is able to get a ticket.

![Kerberos Ticket](/.attachments/Kerb%20Ticket-33ca84f4-9eb0-4ef9-9f0a-2f49ef498ca2.png)

We collected a network trace and Kerberos.etl while executing the above commands.

- The user provides a username of Contoso\entadm and the password. The pre-authentication data of the user is encrypted by the user's private key. It will send it to the domain controller.
  ```plaintext
  [1] 0310.0C68::06/11/24-11:10:43.2545193 [KERBEROS] ctxtapi_cxx558 KerbProcessTargetNames() - Parsed name entadm ((null)) into: 
  name type 0x1, name count 1, realm (null), first part entadm  

  [1] 0310.0C68::06/11/24-11:10:43.2545250 [KERBEROS] logonapi_cxx6865 KerbGetTicketGrantingTicket() - KerbGetTicketGrantingTicket 
   GetTicketRestart ClientRealm CONTOSO.COM

  [1] 0310.0C68::06/11/24-11:10:43.2545337 [KERBEROS] logonapi_cxx2374 KerbGetAuthenticationTicketEx() - 
  KerbGetAuthenticationTicketEx using default credentials CONTOSO.COM\entadm

  [1] 0310.0C68::06/11/24-11:10:43.2545356 [KERBEROS] logonapi_cxx2376 KerbGetAuthenticationTicketEx() - to service 
  krbtgt/CONTOSO.COM
  ```

- Building Pre-auth Data and including time skew

  ```plaintext
  [1] 0310.0C68::06/11/24-11:10:43.2545428 [KERBEROS] logonapi_cxx728 KerbBuildPreAuthData() - Skewing system time. System time is 
  06/11/24-11:10:43.2455574

  [1] 0310.0C68::06/11/24-11:10:43.2545430 [KERBEROS] logonapi_cxx729 KerbBuildPreAuthData() - Skewed time is 06/11/24- 
  11:10:43.2455574
  ```

- The domain controller receives the requestor, checks if the request is valid, meaning that the DC pulls out the time using the hash of the user's password because it got this information from the Active Directory database. It also checks if the time skew is less than five minutes.
  ```plaintext
  [1] 0310.0C68::06/11/24-11:10:43.2545439 [KERBEROS] logonapi_cxx467 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current 
  password of entadm@CONTOSO.COM

  [1] 0310.0C68::06/11/24-11:10:43.2545994 [KERBEROS] logonapi_cxx3214 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket 
  sending preauth enctype 0, length 0, PrimaryCredentials->PublicKeyCreds 0000000000000000

  [1] 0310.0C68::06/11/24-11:10:43.2546165 [KERBEROS] kerbtick_cxx3416 KerbMakeSocketCallEx() - Retry #0 Calling KDC 10.160.46.4 for 
  realm CONTOSO.COM, DesiredFlags 0, connection timeout: 0 secs

  [1] 0310.0C68::06/11/24-11:10:43.2546178 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 10.160.46.4
  [0] 0310.0C68::06/11/24-11:10:43.2565810 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 10.160.46.4
  ```

## From network trace we can see 

**Client sent to DC AS_req** 

![AS_req from wireshark](/.attachments/AS_req-3d6c809c-1e7e-4676-b7a3-4889f6a86842.png)

Kerberos frame details

  ```plaintext
   as-req
    msg-type: krb-as-req (10)
    req-body
        cname
            name-type: kRB5-NT-PRINCIPAL (1)
            CNameString: entadm
        realm: CONTOSO.COM
        etype: 6 items
            ENCTYPE: eTYPE-AES256-CTS-HMAC-SHA1-96 (18)
            ENCTYPE: eTYPE-AES128-CTS-HMAC-SHA1-96 (17)
            ENCTYPE: eTYPE-ARCFOUR-HMAC-MD5 (23)
            ENCTYPE: eTYPE-ARCFOUR-HMAC-MD5-56 (24)
            ENCTYPE: eTYPE-ARCFOUR-HMAC-OLD-EXP (-135)
            ENCTYPE: eTYPE-DES-CBC-MD5 (3)
   Client Hostname
    addresses: 1 item VM1WIN11-Cont<20>
        HostAddress VM1WIN11-Cont<20>
   ```

- The client will send a request with missing pre-authentication (PA data), considered as an empty Kerberos ping by the domain controller. The first time the client makes a TGT request, it doesnt put PREAUTH data into the AS request. The client is just sending an empty request to KDC to learn the supportive encryption types by KDC.
  ```
  [0] 0310.0C68::06/11/24-11:10:43.2582365 [KERBEROS] logonapi_cxx3589 KerbGetAuthenticationTicketEx() - KerbCallKdc failed: error 
  0x19, extendedStatus 0
  ```

When you look for this error in the internal DB, you will find KDC_ERR_PREAUTH_REQUIRED, same in network trace.

![Kerberos Ticket](/.attachments/Kerb%20Ticket-e2e85aa2-c899-4930-9336-1924c89093ca.png)  
![Err_pre_auth_req](/.attachments/Err_pre_auth_req-3f2bfde6-1edf-474c-aa3f-ffa66a06bcb0.png)

```
krb-error
    msg-type: krb-error (30)
    error-code: eRR-PREAUTH-REQUIRED (25)
    realm: CONTOSO.COM
    sname
        PA-DATA pA-ETYPE-INFO2
        PA-DATA pA-ENC-TIMESTAMP
            padata-type: pA-ENC-TIMESTAMP (2)
                padata-value: <MISSING>
        PA-DATA pA-PK-AS-REQ
            padata-type: pA-PK-AS-REQ (16)
                padata-value: <MISSING>
        PA-DATA pA-PK-AS-REP-19
            padata-type: pA-PK-AS-REP-19 (15)
                padata-value: <MISSING>
```

- Another request is sent to the domain controller for entadm.

  ```
  [0] 0310.0C68::06/11/24-11:10:43.2623311 [KERBEROS] logonapi_cxx728 KerbBuildPreAuthData() - Skewing system time. System time is 
  06/11/24-11:10:43.2611853

  [1] 0310.0C68::06/11/24-11:10:43.2789777 [KERBEROS] logonapi_cxx467 KerbFindCommonPaEtype() - KerbFindCommonPaEtype using current 
  password of entadm@CONTOSO.COM

  [1] 0310.0C68::06/11/24-11:10:43.2790181 [KERBEROS] logonapi_cxx3214 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket 
  sending preauth enctype 18, length 32, PrimaryCredentials->PublicKeyCreds 0000000000000000

  [1] 0310.0C68::06/11/24-11:10:43.2790247 [KERBEROS] logonapi_cxx3273 KerbGetAuthenticationTicketEx() - 
  KerbGetAuthenticationTicket: Calling KDC

  [1] 0310.0C68::06/11/24-11:10:43.2790406 [kerbcomm] sockets_cxx676 KerbCallKdcEx() - Calling KDC: 10.160.46.4

  [0] 0310.0C68::06/11/24-11:10:43.2807823 [kerbcomm] sockets_cxx576 KerbBindSocketByAddress() - Successfully bound to 10.160.46.4

  [0] 0310.0C68::06/11/24-11:10:43.2825904 [KERBEROS] logonapi_cxx3330 KerbGetAuthenticationTicketEx() - 
  KerbGetAuthenticationTicket: Returned from KDC status 0x0

  [0] 0310.0C68::06/11/24-11:10:43.2826099 [KERBEROS] timesync_cxx184 KerbUpdateSkewTime() - Updating skew statistics: Skewed = 0, 
  successful = 10, latest = Success
  ```

**From network trace we can see**

![AS_req01](/.attachments/AS_req01-fbd513f3-f5b0-43e8-8970-e9bde8ca7002.png)  
![as_req02png](/.attachments/as_req02png-4a76ec70-b2be-4a59-9948-8ce9c4c6a2af.png)

Kerberos

```
Record Mark: 304 bytes
as-req
  
    msg-type: krb-as-req (10)
  
    req-body
       
        cname
            name-type: kRB5-NT-PRINCIPAL (1)
            cname-string: 1 item
                CNameString: entadm
        realm: CONTOSO.COM
        sname
        
        etype: 6 items

            ENCTYPE: **eTYPE-AES256-CTS-HMAC-SHA1-96** (18)
            ENCTYPE: eTYPE-AES128-CTS-HMAC-SHA1-96 (17)
            ENCTYPE: eTYPE-ARCFOUR-HMAC-MD5 (23)
            ENCTYPE: eTYPE-ARCFOUR-HMAC-MD5-56 (24)
            ENCTYPE: eTYPE-ARCFOUR-HMAC-OLD-EXP (-135)
            ENCTYPE: eTYPE-DES-CBC-MD5 (3)
        addresses: 1 item VM1WIN11-Cont<20>
            HostAddress VM1WIN11-Cont<20>
                addr-type: nETBIOS (20)
                NetBIOS Name: VM1WIN11-Cont<20> (Server service)
```
