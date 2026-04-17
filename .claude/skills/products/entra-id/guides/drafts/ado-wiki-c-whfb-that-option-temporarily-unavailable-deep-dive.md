---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking for known solutions | tips/Hybrid Key Trust/That option is temporarily unavailable/Deep dive troubleshooting steps"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/830118"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/830118&Instance=830118&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/830118&Instance=830118&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document addresses an issue with logging into a Windows 10 client machine using a PIN. The troubleshooting steps reveal discrepancies in the msDS-KeyCredentialLink attribute between Azure AD and on-premises AD. The resolution involves re-enabling device write-back in Azure AD Connect and ensuring proper synchronization.


[[_TOC_]]

**All domain names, tenant names, user account IDs, and associated GUIDS used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments.**

_**Thanks Cara for all your great job.**_

Problematic user account test123, which is an on-premises user account synchronized to Azure by Azure AD (AAD) connect.  
There is a Windows Server 2016 Domain Controller (DC) and a Windows Server 2012 R2 DC in the environment.  
Test123 will log on to a Windows 10 client machine to reproduce the Windows Hello for Business (WHfB) error.

---
# Issue

When I tried to log on to the Windows 10 client machine with test123, the setup PIN page is successfully displayed.  
Then I entered the PIN code for test123; it says All set!  it looks like it's almost there!  
However, when I tried to log on with this newly set up PIN, the That option is temporarily unavailable error prompted as below:

![image.png](/.attachments/image-65250eb9-167b-4b73-8c8b-fe296645e77e.png)
 
---
# Troubleshooting

Based on previous experience, I suspect its AAD sync didnt write the user certificate info back to on-premises Active Directory (AD) in its msDS-KeyCredentialLink attribute, but it looks like this attribute value is updated.

![image.png](/.attachments/image-c5431b8c-1a3a-47b8-922c-1f21752f2941.png)
 
We have to troubleshoot further.

---
## Troubleshooting steps

### 1. Access issue symptom:  
a. We successfully dismissed the logon screen.  
b. We saw the WHfB credential provider.  
c. We provided the gesture to unlock the credential.  
d. Hit error  

### 2. Check the [hybrid key trust scenario workflow](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-how-it-works-authentication).  
We dont know if the collected credentials have reached the Kerberos provider, if a Kerberos request has been sent over the wire to the Windows Server 2016 or newer domain controller, or if that domain controller has provided a response.

Updated the workflow in our scenario:

![image.png](/.attachments/image-5c40e7c3-9c81-4b10-8db1-efa200dd1839.png)

### 3. The network trace will allow us to quickly assess if a Kerberos request was sent to the Windows 2016 or newer domain controller and if that domain controller has provided a response.  
In order to get all details, I collect auth scripts on three machines:  
Windows 10 client machine, Windows Server 2012 R2 DC, Windows Server 2016 DC.

### 4. Inside the client log folder, we can find DsRegCmdStatus.txt to get the device info:  
AzureAdJoined: YES  
DomainJoined: YES  
DomainName: M***  
Device Name: win10-2004-1.dom.lab.com  
TenantName: M....  
TenantId: 2b505a0xxxx

### 5. Check client-side user registration event log to see if theres any error  skip this as I didnt get any clue from there.

### 6. Check user self-signed certificate in certmgr.msc:  
Note:  
In the workflow above for step B:  
_The Kerberos provider sends the signed pre-authentication data and the user's public key **in the form of a self-signed certificate** to the Key Distribution Center (KDC) service running on the 2016 domain controller in the form of a KERB_AS_REQ.  
The 2016 domain controller determines the certificate is a self-signed certificate. It retrieves the public key from the certificate included in the KERB_AS_REQ and searches for the public key in Active Directory. It validates the User Principal Name (UPN) for the authentication request matches the UPN registered in Active Directory and validates the signed pre-authentication data using the public key from Active Directory. On success, the KDC returns a Ticket Granting Ticket (TGT) to the client with its certificate in a KERB_AS_REP._

![image.png](/.attachments/image-d666cb42-aa6f-4938-9278-a47870d2f1fd.png)

Highlighted the key info from the certificate:

| certutil.exe -v -silent -user -store my  | Highlights |
|:--:|:--:|
|================ Certificate 0 ================<br/>X509 Certificate:<br/>Version: 3<br/>Serial Number:7093ea7d5f41808c47d3a174533fdb80<br/>---<br/>Issuer: CN=S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com<br/>NotBefore: 10/26/2020 4:21 PM<br/>NotAfter: 10/26/2050 4:31 PM<br/>Subject: CN=S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com<br/>---<br/>Enhanced Key Usage<br/>Smart Card Logon (1.3.6.1.4.1.311.20.2.2)<br/>Root Certificate: Subject matches Issuer<br/>---<br/>Key Id Hash(bcrypt-sha256): 60f5b22366e3279b828e7e8fb1504d8768880814b3063cf0890d2f24584fa763<br/>CERT_KEY_PROV_INFO_PROP_ID(2):Key Container = S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com<br/>Provider = Microsoft Passport Key Storage Provider<br/>Encryption test passed| Serial Number: 7093ea7d5f41808c47d3a174533fdb80<br/>Issuer:CN=S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com<br/><br/>Subject: CN=S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com<br/><br/>We have identical subject and issuer, which makes this certificate a self-issued certificate. This is expected for a WHfB certificate for key-based sign-in.<br/><br/>The content of the subject and issuer field is rich in information:<br/>	The user accounts UPN is test123@dom.lab.com<br/>	The user certificate can be used to authenticate to Azure AD login.windows.net<br/>	The Azure AD tenant ID is 2b505axxxx - this is the same tenant ID which we had seen in the DsRegCmdStatus.txt<br/>	The users key ID is f5f32xxxx<br/>	The users account Security Identifier (SID) is S-1-5-21-17381xxxx<br/><br/>We can summarize the user certificate store information:<br/>The user has a time-valid certificate issued to test123@dom.lab.com from the Azure AD tenant id 2b505axxxx, with key ID f5f32xxxx, user SID S-1-5-21-17381xxxx and for which we dont expect any cryptographic key material problems.|

We should now check the network trace to get a quick overview of the Kerberos-related traffic.

### 7. Checking network trace from client machine:  
At 4:45 pm test123 PIN logon failed. Below is the Kerberos error returned by KDC:_  
```
28497 4:45:59 PM 10/26/2020 144.6176478 (736) 192.x.x.x 192.y.y.y KerberosV5 KerberosV5:AS Request Cname: test123 Realm: DOM Sname: krbtgt/DOM  
28498 4:45:59 PM 10/26/2020 144.6194968 (0) 192.y.y.y  192.x.x.x KerberosV5 KerberosV5:KRB_ERROR - KDC_ERR_PREAUTH_REQUIRED (25)  
28505 4:45:59 PM 10/26/2020 144.6618032 (736) 192.x.x.x 192.y.y.y  KerberosV5 KerberosV5:AS Request Cname: test123 Realm: DOM Sname: krbtgt/DOM  
28507 4:45:59 PM 10/26/2020 144.6653013 (4164) 192.y.y.y  192.x.x.x KerberosV5 KerberosV5:KRB_ERROR - KDC_ERR_CLIENT_NAME_MISMATCH
```

Firstly confirmed that 192.y.y.y is a Windows Server 2016 DC.  
As mentioned in the workflow, in step B, the Kerberos provider sends the signed pre-authentication data and the user's public key (in the form of a self-signed certificate) to the Key Distribution Center (KDC) service running on the 2016 domain controller in the form of a KERB_AS_REQ.  

So lets take a closer look at the second KERB_AS_REQ package:
Here we can see EncapContentInfo: IdPkinitAuthData (1.3.6.1.5.2.3.1) (0x1) which indicates that we are indeed looking at Public Key Cryptography for Initial Authentication (PKINIT) data.

![image.png](/.attachments/image-7967e4cf-6c5f-4d91-ad50-3db47316118a.png) 

To see the certificate used to sign the data, expand the node before Certificates, we can now see the details of the user WHfB certificate:

```   
Frame: Number = 28505, Captured Frame Length = 3180, MediaType = NetEvent  
EncapContentInfo: **IdPkinitAuthData** (1.3.6.1.5.2.3.1) (0x1)  
Certificates:   
SetOfHeader:   
Cert:   
Certificate: Issuer: S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com, Subject: S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com  
TbsCertificate: Issuer: S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com, Subject: S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com  
SerialNumber: 0x7093ea7d5f4xxxx
Issuer: S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com  
Validity: From: 10/26/20 08:21:29 UTC To: 10/26/2050 08:31:29 UTC  
Subject: S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com</SPAN>
```

We can conclude that the WHfB user certificate has been used to sign the Kerberos authentication data, and the certificate matches the self-signed user certificate in the local user certificate store.

### 8. So we further checked the KDC Event Trace Log (ETL) trace collected on the Windows Server 2016 DC side to see why the ```KerberosV5:KRB_ERROR - KDC_ERR_CLIENT_NAME_MISMATCH``` error returned:
 
We see the initial AS request which is replied with a pre-authentication required message:  
(Filter function I_GetASTicket()) 
```
Line 72: [1] 02A0.0898::10/26/20-16:45:59.8840790 [dll] getas_cxx4933 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/DOM  
Line 73: [1] 02A0.0898::10/26/20-16:45:59.8840825 [dll] getas_cxx4934 I_GetASTicket() - I_GetASTicket for client test123  
Line 84: [1] 02A0.0898::10/26/20-16:45:59.8849737 [dll] getas_cxx7267 I_GetASTicket() - I_GetASTicket [Leaving] ```0x19 (0x19 means KDC_ERR_PREAUTH_REQUIRED kerberr.h)
```
  
We see that the next request fails with 0x4b:
  
```
Line 97: [1] 02A0.0898::10/26/20-16:45:59.9285831 [dll] getas_cxx4933 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/DOM  
Line 98: [1] 02A0.0898::10/26/20-16:45:59.9285866 [dll] getas_cxx4934 I_GetASTicket() - I_GetASTicket for client test123  
Line 122: [1] 02A0.0898::10/26/20-16:45:59.9303444 [dll] getas_cxx5573 I_GetASTicket() - ```KdcCheckClientCertificateAndBuildChain failed: 0x4b```  
Line 123: [1] 02A0.0898::10/26/20-16:45:59.9303645 [dll] getas_cxx7267 I_GetASTicket() - I_GetASTicket [Leaving] ```0x4b (0x4 means KDC_ERR_CLIENT_NAME_MISMATCH kerberr.h)
```

To see why 0x4b occurred, we checked further the KDC ETL trace, and found below error:    

```
[1] 02A0.0898::10/26/20-16:45:59.9303078 [dll] pkserv_cxx1470 KdcCheckClientCertificateAndBuildChain() - KDC failed to verify client's identity from cert: 0x4b  
[1] 02A0.0898::10/26/20-16:45:59.9303432 [dll] pkserv_cxx1688 KdcCheckClientCertificateAndBuildChain() - Failed to check CLIENT certificate: 0x4b
``` 

Further before that error, we have 0x6 error returned by KDC:    
```
[1] 02A0.0898::10/26/20-16:45:59.9303029 [dll] tktutil_cxx2148 KdcNormalize() - KdcNormalize [Leaving] 0x6
```

0x6 means:  
KDC_ERR_C_PRINCIPAL_UNKNOWN kerberr.h  
6 Client not found in Kerberos database

Again, in the workflow above for step B, the Kerberos provider sends the signed pre-authentication data and the user's public key (in the form of a self-signed certificate) to the Key Distribution Center (KDC) service running on the 2016 domain controller in the form of a KERB_AS_REQ.  
The 2016 domain controller determines the certificate is a self-signed certificate.  
It retrieves the public key from the certificate included in the KERB_AS_REQ and searches for the public key in Active Directory.  
It validates the UPN for the authentication request matches the UPN registered in Active Directory and validates the signed pre-authentication data using the public key from Active Directory.  
On success, the KDC returns a TGT to the client with its certificate in a KERB_AS_REP.

Complete KDC ETL log:

```
[1] 02A0.0898::10/26/20-16:45:59.9285831 [dll] getas_cxx4933 I_GetASTicket() - I_GetASTicket getting an AS ticket to server krbtgt/DOM [1] 02A0.0898::10/26/20-16:45:59.9285866 [dll] getas_cxx4934 I_GetASTicket() - I_GetASTicket for client test123 
[1] 02A0.0898::10/26/20-16:45:59.9285903 [dll] tktutil_cxx1199 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0x233fefcf, ExtendedFields 0x2000081, PrincipalName 0000028FC7A9A6A0, PrincipalRealm (null), RequestRealm DOM, TgtClientRealm (null), NameFlags 0x15, MappedAttr 0000000000000000 
[1] 02A0.0898::10/26/20-16:45:59.9285941 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName test123 
[1] 02A0.0898::10/26/20-16:45:59.9285960 [dll] tktutil_cxx1267 KdcNormalize() - KdcNormalize checking sam for request realm DOM 
[1] 02A0.0898::10/26/20-16:45:59.9285980 [dll] tktutil_cxx1759 KdcNormalize() - KdcNormalize checking name in SAM 
[1] 02A0.0898::10/26/20-16:45:59.9285996 [dll] tktutil_cxx5428 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0x233fefcf, ExtendedFields 0x2000081, GenericUserName test123, LookupFlags 0, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x4 
[1] 02A0.0898::10/26/20-16:45:59.9286008 [dll] tktutil_cxx5430 KdcGetTicketInfo() - PrincipalName (empty) 
[1] 02A0.0898::10/26/20-16:45:59.9286016 [dll] tktutil_cxx5466 KdcGetTicketInfo() - check if account test123 is local with local secrets 
[1] 02A0.0898::10/26/20-16:45:59.9289799 [dll] tktutil_cxx5835 KdcGetTicketInfo() - KdcGetTicketInfo getting user keys 
[1] 02A0.0898::10/26/20-16:45:59.9289842 [dll] tktutil_cxx6070 KdcGetTicketInfo() - KdcGetTicketInfo [Leaving] 0 
[1] 02A0.0898::10/26/20-16:45:59.9289855 [dll] tktutil_cxx2148 KdcNormalize() - KdcNormalize [Leaving] 0 
[1] 02A0.0898::10/26/20-16:45:59.9294664 [dll] pkserv_cxx1178 KdcVerifyClientCertName() - UPN from certificate is @@@CN=S-1-5-21-17381xxxx/f5f32xxxx/login.windows.net/2b505axxxx/test123@dom.lab.com 
[1] 02A0.0898::10/26/20-16:45:59.9294717 [dll] tktutil_cxx1199 KdcNormalize() - KdcNormalize [entering] normalizing name, WhichFields 0, ExtendedFields 0, PrincipalName 0000028FC9333080, PrincipalRealm (null), RequestRealm (null), TgtClientRealm (null), NameFlags 0x215, MappedAttr 0000000000000000 
[1] 02A0.0898::10/26/20-16:45:59.9294790 [dll] tktutil_cxx1201 KdcNormalize() - PrincipalName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA 
[1] 02A0.0898::10/26/20-16:45:59.9294814 [dll] tktutil_cxx1875 KdcNormalize() - KdcNormalize checking name in SAM [1] 02A0.0898::10/26/20-16:45:59.9294827 [dll] tktutil_cxx5428 KdcGetTicketInfo() - KdcGetTicketInfo [entering] bRestrictUserAccounts false, WhichFields 0, ExtendedFields 0, GenericUserName ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA, LookupFlags 0x20000, PrincipalName 0000000000000000, MappedAttr 0000000000000000, NormalizeFlags 0x2 
[1] 02A0.0898::10/26/20-16:45:59.9294840 [dll] tktutil_cxx5430 KdcGetTicketInfo() - PrincipalName (empty) 
[1] 02A0.0898::10/26/20-16:45:59.9302987 [dll] tktutil_cxx5690 KdcGetTicketInfo() - Could not open User ???a?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????aA: 0xc0000225 
[1] 02A0.0898::10/26/20-16:45:59.9303017 [dll] tktutil_cxx6070 KdcGetTicketInfo() - KdcGetTicketInfo [Leaving] 0x6 
[1] 02A0.0898::10/26/20-16:45:59.9303029 [dll] tktutil_cxx2148 KdcNormalize() - KdcNormalize [Leaving] 0x6 
[1] 02A0.0898::10/26/20-16:45:59.9303062 [dll] pkserv_cxx1344 KdcVerifyClientCertName() - username does not have altsecid mapping 
[1] 02A0.0898::10/26/20-16:45:59.9303078 [dll] pkserv_cxx1470 KdcCheckClientCertificateAndBuildChain() - KDC failed to verify client's identity from cert: 0x4b 
[1] 02A0.0898::10/26/20-16:45:59.9303432 [dll] pkserv_cxx1688 KdcCheckClientCertificateAndBuildChain() - Failed to check CLIENT certificate: 0x4b 
[1] 02A0.0898::10/26/20-16:45:59.9303444 [dll] getas_cxx5573 I_GetASTicket() - KdcCheckClientCertificateAndBuildChain failed: 0x4b 
[1] 02A0.0898::10/26/20-16:45:59.9303645 [dll] getas_cxx7267 I_GetASTicket() - I_GetASTicket [Leaving] 0x4b
```

### 9. Account details in Active Directory

We should now take a closer look at the account details in Active Directory (AD).

The Windows Hello for Business (WHfB) specific mapping is implemented via the `msDS-KeyCredentialLink` attribute. We have seen instances where the `msDS-KeyCredentialLink` attribute had not been populated due to issues such as missing write permissions for the Azure AD (AAD) Sync service account.

We can use LDIFDE to dump the details of the users account to check if the Key ID that is sent by the Kerberos provider in the AS request is mapped to the users account for a WHfB sign-in. If the Key ID is not mapped to the `msDS-KeyCredentialLink`, we would get an error stating that the account cannot be found.

We can see test123 has this attribute written back already. However, we need to verify whether this Key ID in AD matches the certificate Key ID sent from the Windows 10 client side.

![Details in AD](/.attachments/image-8323970a-4d58-4b77-ab08-5432db341668.png)

### Run LDIFDE to dump all user attributes:

```plaintext
ldifde -f test123-ldifde.txt -d "CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com"
dn: CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
changetype: add
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: test123
givenName: test123
distinguishedName: CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
msDS-KeyCredentialLink: B:854:00020000200001CEF8A780E7F086935EEF8A8AExxxx:CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
```

The attribute is not readable, so we use `ldp.exe` to see the readable version:

```plaintext
Dn: CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
displayName: test123;
distinguishedName: CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com;
msDS-KeyCredentialLink:
Source:0x1(AAD) -> Source tells us where these keys have originated from, we expect AAD for a hybrid key-based WHfB sign-in
Usage:0x1(NGC) -> Usage indicates if the key can be used for a WHfB sign-in, we expect NGC for a WHfB sign-in
Flags:0x0(none)
CreationTime:12/6/18233 12:11:12 AM China Standard Time
LLTS:11/8/16214 9:24:02 PM China Standard Time
cbKeyID:0x20
KeyID:cef8a780e7fxxx -> KeyID tells us the unique identifier of the key
cbKeyMaterial:0x11b
KeyMaterial:52534131000800000300000000010000...;
whenChanged: 10/20/2020 5:06:23 PM China Standard Time;
whenCreated: 11/29/2019 11:35:57 AM China Standard Time;
```

### Root cause

We can see the Key ID for `msDS-KeyCredentialLink` in the AD database is as follows:

```plaintext
KeyID: cef8a780e7fxxx
```

Now lets check back the user certificate `certutil` output, we can find the certificate Key ID is as follows:

```plaintext
Key Id Hash(bcrypt-sha256): 60f5b22366e3279b828e7e8fb1504d8768880814b3063cf0890d2f24584fa763
```

We can see the Key ID from the user certificate and from the AD database do not match. We can also see the `whenChanged` update time is 10/20/2020 5:06:23 PM China Standard Time; however, I provisioned the account today on 10/27/2020.

Thus, I suspect the issue is related to Azure AD Connect sync. I went to the AAD sync server and tried to initiate a delta sync by using the PowerShell command:

![Delta sync command](/.attachments/image-3e034b1b-e1eb-4604-afb7-d27fa60c5e58.png)

The result is successful, but still, the attribute is not updated. I confirmed that device write-back is enabled. After various tries on the AAD sync server, I disabled device write-back and re-enabled it. Then I performed a delta sync again using the same command. Then I went to AD `ldp.exe`, and now I get the attribute updated:

```plaintext
Expanding base 'CN=test123,OU=win10-OU,DC=menw,DC=msftonlinelab,DC=com'...
Getting 1 entries:
Dn: CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
msDS-KeyCredentialLink (2): Source:0x1(AAD) Usage:0x1(NGC) Flags:0x0(none) CreationTime:12/6/18233 12:11:12 AM China Standard Time LLTS:11/8/16214 9:24:02 PM China Standard Time cbKeyID:0x20 KeyID:cef8a780e7f086935eef8a8ae2955437f343568543e87de6fe2f35a63890274b cbKeyMaterial:0x11b KeyMaterial:52534131000800000300000000010000...; Source:0x1(AAD) Usage:0x1(NGC) Flags:0x0(none) CreationTime:9/3/18234 5:55:42 AM China Standard Time LLTS:11/8/16214 9:24:02 PM China Standard Time cbKeyID:0x20
KeyID:60f5b22366e3279b828e7e8fb1504d8768880814b3063cf0890d2f24584fa763 cbKeyMaterial:0x11b
whenChanged: 10/27/2020 1:05:12 PM China Standard Time;
whenCreated: 11/29/2019 11:35:57 AM China Standard Time;
```

Now we have the new Key ID updated in the user's `msDS-KeyCredentialLink` attributes:

```plaintext
KeyID: cef8a780e7f086935eef8a8ae2955437f343568543e87de6fe2f35a63890274b
KeyID: 60f5b22366e3279b828e7e8fb1504d8768880814b3063cf0890d2f24584fa763
```

The second Key ID matches what weve seen in the `certutil` command output of the user certificate:

```plaintext
60f5b22366e3279b828e7e8fb1504d8768880814b3063cf0890d2f24584fa763
```

Then we tried to log on again with test123 on the same Windows 10 client machine, and now PIN logon is successful.

---

### Reflections

#### Question: Are you able to find the details of that self-signed certificate from Azure AD? That can also be another strong proof of a device write-back problem.

If we could find the self-signed certificate information directly from Azure AD, it would be much quicker for us to narrow down the issue. This is described here:
- [4594367 How to check the msDS-KeyCredentialLink attribute](https://internal.evergreen.microsoft.com/topic/d80dc046-0e42-8037-6136-14686d32a15f)
- [ADDS: Security: NGC Keys Deep Dive](https://internal.evergreen.microsoft.com/topic/3e200072-73d2-2dae-f0fe-bfea70fde4d6)
- [4524961 How is msDS-KeyCredentialLink populated and written back to AD](https://internal.evergreen.microsoft.com/topic/8e46d5d9-9c4d-4dbf-84d3-0391a91544d1)

### Key Information:

We will track the target user Key ID from three locations:
1. Win10 client machine
2. Azure AD
3. On-premises DC

When a user on an Azure AD-joined Windows 10 device sets up Windows Hello, a public/private key pair is generated. The private key goes into the TPM chip on the device. The public key, however, goes on a journey.

#### Part A - Win10 client machine
On the Win10 client machine, the user's public key can be found in a self-signed certificate in the user certificate store on the device:

![User public key in self-signed certificate](/.attachments/image-0130d8cc-8629-4497-a31c-710289db5f44.png)

We will use the 10 bytes `a3a353ac8fab08724015` to keep track of the key in this example.

#### Part B  Azure AD
Windows 10 then writes this key into the Azure AD object of the user. The users Azure AD object accumulates all keys from all devices where that user set up Windows Hello for Business. These Windows Hello for Business keys go into the attribute searchableDeviceKey, from where they can be accessed using the Azure AD Graph API: 

`https://graph.windows.net/<TenantId>/users/<UserUPN>?api-version=1.6-internal&$select=searchableDeviceKey`

Here is the PowerShell result:

```plaintext
usage : NGC
keyIdentifier : YPWyI2bjJ5uCjn6PsVBNh2iICBSzBjzwiQ0vJFhPp2M=
keyMaterial:UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABo6NTrI+rCHJAFWR1dypqGk0ubZLTEscSTXtqXQuAbdf4NrrmZl/uAYcBP2Fpf6U6XBv0fwX/SsCSY3OZVwe1UN8G1COwUiMan1h2FzAZ5FNLL0iZk61mR1j+5dP4j0Q+A+lQPyxsTCDcvobsnFNgQrAfB01p1wNAzAZ6TbMoO6KCi+/4meutCeETGWTSaX00jgHFmkqHEe9zAKF68yHyU/m59bdXBXnv87hTxHjmrmJatS0EXIr/SmUGb6IqMwZjnnxx+enlVaZ+TbP3SXsnp8NDIQ/crcprYt1BTwW8AV5HpuS6YeH15oOAFi0NfWcO8tvmKoHiqa85tkVEFGj4tQ==
creationTime : 2020-10-26T08:31:39.5769176Z
deviceId : 42fd471b-1e0a-48b4-9e1f-dd0f985d5ac7
customKeyInformation : AQAAAAACAAAAAAAAAAAA
fidoAaGuid : 
fidoAuthenticatorVersion : 
fidoAttestationCertificates : {} 
usage : NGC
keyIdentifier : zvingOfwhpNe74qK4pVUN/NDVoVD6H3m/i81pjiQJ0s=
keyMaterial : UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABx6fRdj3K8zXoEgM5Rxi2n2EO3axTmEnbPfs20Eg+m+IYai7hHor7oQoiyNkRZGv3t gG/H6WvMg+rLwYjBfqWbK7IuoPXq65zPRu+NbwfyID5QLQY/KwHyCgFuoZcpC/K2C4wavz8zJ3pew43MePZr1Pd0usAEjvu11Re9l BUZuRU2D5BiT7DR+OIzATdvvG7iDX+3V9KpIWuqIFD+DGBXtZC4l4o7dTn6XvHyYmLeTaIesoHyy4902fIiQDlwmT7TSgkCH28JYB drdqUqZVMrouuWVaISdw4a0lGbUWVOSSoFd2ZrsK7tsNS5nzfVrfp3QGcppER+3Z72li3orEpqQ==
creationTime : 2020-01-29T02:47:09.6845479Z
deviceId : 1c01bb23-20bc-40d1-99e2-5fd5f36e24a2
customKeyInformation : AQAAAAACAAAAAAAAAAAA
fidoAaGuid : 
fidoAuthenticatorVersion : 
fidoAttestationCertificates : {}
```

As the first key has the latest timestamp, it should be the new one which the user is currently using. So we will take this one as an example. The base64 encoded key material from the first key is:

```plaintext
UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABo6NTrI+rCHJAFWR1dypqGk0ubZLTEscSTXtqXQuAbdf4NrrmZl/uAYcBP2Fpf6U6X
Bv0fwX/SsCSY3OZVwe1UN8G1COwUiMan1h2FzAZ5FNLL0iZk61mR1j+5dP4j0Q+A+lQPyxsTCDcvobsnFNgQrAfB01p1wNAzAZ6Tb
MoO6KCi+/4meutCeETGWTSaX00jgHFmkqHEe9zAKF68yHyU/m59bdXBXnv87hTxHjmrmJatS0EXIr/SmUGb6IqMwZjnnxx+enlVaZ
+TbP3SXsnp8NDIQ/crcprYt1BTwW8AV5HpuS6YeH15oOAFi0NfWcO8tvmKoHiqa85tkVEFGj4tQ==
```

Convert Base64 to Hex via https://base64.guru/converter/decode/hex, get the below output:

```plaintext
525341310008000003000000000100000000000000000000010001_a3a353ac8fab08724015_6475772a6a1a4d2e6d92d312c7124d7b6a5d0b806dd7f836bae6665fee0187013f61697fa53a5c1bf47f05ff4ac0926373995707b550df06d423b052231a9f5876173019e4534b2f489993ad664758fee5d3f88f443e03e9503f2c6c4c20dcbe86ec9c536042b01f074d69d70340cc067a4db3283ba2828beff899ebad09e1131964d2697d348e01c59a4a8711ef7300a17af321f253f9b9f5b7570579eff3b853c478e6ae625ab52d045c8aff4a65066fa22a3306639e7c71f9e9e555a67e4db3f7497b27a7c343210fdcadca6b62dd414f05bc015e47a6e4ba61e1f5e68380162d0d7d670ef2dbe62a81e2a9af39b645441468f8b5
```

We can see it has the same tracking ID as the one on the Win10 client machine user certificate.

#### Part C  On-prem DC
Now, Azure AD Connect takes over and synchronizes the key from `searchableDeviceKey` to the users on-premises AD object into the attribute `msDS-KeyCredentialLink`. Note that `msDS-KeyCredentialLink` is introduced with the Windows Server 2016 AD schema, and only Windows Server 2016 domain controllers can make use of it.

We can see the value of `msDS-KeyCredentialLink` with `ldp.exe`. We can see the second entry matches the tracking ID with the Win10 client machine user cert and the Azure AD PowerShell command output:

```plaintext
ldifde -f test123 -ldifde.txt -d "CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com"

dn: CCN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
msDS-KeyCredentialLink: 
B:854:00020000200001CEF8A780E7F086935EEF8A8AE2955437F343568543E87DE6FE2F35A638
90274B20000236F84429BC9B47A7F213330FDCF3C6A19C0B9788A19DFEE600F1AD3A0E28F0891B
0103525341310008000003000000000100000000000000000000010001C7A7D1763DCAF335E812
03394718B69F610EDDAC539849DB3DFB36D0483E9BE2186A2EE11E8AFBA10A22C8D911646BF7B6
01BF1FA5AF320FAB2F062305FA966CAEC8BA83D7ABAE733D1BBE35BC1FC880F940B418FCAC07C8
2805BA865CA42FCAD82E306AFCFCCC9DE97B0E3731E3D9AF53DDD2EB00123BEED7545EF6505466
E454D83E41893EC347E388CC04DDBEF1BB8835FEDD5F4AA485AEA88143F831815ED642E25E28ED
D4E7E97BC7C9898B7936887ACA07CB2E3DD367C88900E5C264FB4D2824087DBC25805DADDA94A9
954CAE8BAE59568849DC386B49466D45953924A815DD99AEC2BBB6C352E67CDF56B7E9DD019CA6
9111FB767BDA58B7A2B129A9010004010100050110000623BB011CBC20D14099E25FD5F36E24A2
0F00070100000000020000000000000000000800080000000000000040080009A768358965A4D7
48:CN=CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
msDS-KeyCredentialLink:   
B:854:0002000020000160F5B22366E3279B828E7E8FB1504D8768880814B3063CF0890D2F2458
4FA763200002AB94C9F3C753AEAB5EF618E3622781E047277CE70D353535846B270401B546AF1B
0103525341310008000003000000000100000000000000000000010001```A3A353AC8FAB08724015```
6475772A6A1A4D2E6D92D312C7124D7B6A5D0B806DD7F836BAE6665FEE0187013F61697FA53A5C
1BF47F05FF4AC0926373995707B550DF06D423B052231A9F5876173019E4534B2F489993AD6647
58FEE5D3F88F443E03E9503F2C6C4C20DCBE86EC9C536042B01F074D69D70340CC067A4DB3283B
A2828BEFF899EBAD09E1131964D2697D348E01C59A4A8711EF7300A17AF321F253F9B9F5B75705
79EFF3B853C478E6AE625AB52D045C8AFF4A65066FA22A3306639E7C71F9E9E555A67E4DB3F749
7B27A7C343210FDCADCA6B62DD414F05BC015E47A6E4BA61E1F5E68380162D0D7D670EF2DBE62A
81E2A9AF39B645441468F8B501000401010005011000061B47FD420A1EB4489E1FDD0F985D5AC7
0F0007010000000002000000000000000000080008000000000000004008000958EF5E8F8979D8
48:CN=CN=test123,OU=win10xx,DC=dom,DC=lab,DC=com
```

By using this method, we can quickly know whether the target user certificate Key ID matches in the client machine, Azure AD, and on-premises DC.

FYI. We can also get the user certificate public key info from the network trace in KerberosV5:AS Request as below:

![image.png](/.attachments/image-29474b2a-d5ad-4746-a7cf-dea592527d48.png)