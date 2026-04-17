---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Smartcard logon"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Smartcard%20logon"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414088&Instance=414088&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414088&Instance=414088&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Workflow SME:** Jim Tierney

**Support Topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Smart card logon

##Summary

This article provides a detailed workflow for engineers to scope, diagnose, and troubleshoot issues with smart card usage, specifically focusing on the smart card logon process. It includes steps for scoping, troubleshooting, data collection, and solution delivery, along with additional training resources.

## The smartcard logon process

This is a very distilled flow of the Smartcard Logon process from the client and KDC perspective for high level understanding. 

**Smart Card Logon Process**

What follows is a distilled version of the SmartCard Logon Process.  This is a very high-level breakdown of what happens during a SmartCard (CAC Card) Logon.   

**On the client device**

1. The user inserts a smart card into a card reader attached to the computer. 
 
2. The insertion of the card signals an event that displays a modified logon dialog box, which prompts the user for their personal identification number (PIN). 

3. User enters their PIN, and LogonUI sends the PIN and a copy of the user certificate to the Local Security Authority (LSA). 

4. The LSA uses the PIN for access to the smart card and extracts the users private key. 

5. The Kerberos (SSP) security service provider on the client sends an authentication service (AS_REQ) request to the KDC service running on a DC to request authentication and a Ticket Granting Ticket (TGT).  This request includes the users certificate (read from the smart card) in the pre-authentication data fields of the AS request.  An authenticator is also included in the pre-authentication data fields.  The Authenticator is digitally signed by the users private key (also extracted from the smartcard) so that the KDC can verify the AS request originated from the owner of the accompanying certificate. 

**On the KDC (Domain Controller)**

6. The KDC verifies the digital signature placed on the authenticator portion of the pre-authentication data in the AS_REQ against the public key also included in the AS_REQ.  

7. The KDC verifies the certification path of the user certificate using the CryptoAPI. (Root cert must be trusted, revocation checking must occur, etc). It then checks to see if the issuing CA is authorized to issue domain authentication certificates (the requirement is that the CA must be an enterprise CA published in AD and present in the NTAUTH store).  The KDC verifies that the KDC Realm, KDC Name, and service realm contained in the Authenticator are correct.  The KDC then validates a timestamp in the authenticator for a time skew. 

8. The Pre-authentication field of the KERB_AS_REP is built.  The KDC creates a temporary symmetric key based on the desired algorithm specified in the Encryption Type field of the AS_REQ body.  The KDC encrypts the TGT with a random session key, and then encrypts this random key with the users public key from their certificate (sent in the AS_REQ).  

9. The KDC finds the user information in AD based on the UPN (user principal name) in the certificate and constructs a TGT (Ticket Granting Ticket), which will include the users Security ID (SID), the SIDs for any domain groups to which the user belongs, and potentially the SIDs for any universal groups in which the user is a member. This info is returned in the authorization data fields of the TGT. 

The KDC then signs the reply with its private key (from domain controller certificate) so that the client can verify the reply is from a trusted KDC. The KDC also signs the TGTs authorization data using the servers key that is then signed with the KDCs secret key (the password of the krbtgt user account is used to create the secret key) so that a rogue service cannot alter the authorization data after the TGT has been issued.  The reply body itself is then encrypted using the symmetric key contained in the Pre-authentication field 

**Response is sent by the KDC to the client device**

10. The client unpacks the key package from the Pre-authentication data field.  The client then uses their private key (on the smart card) to decrypt the logon session key and TGT.  The client verifies the KDCs signature by building a certification path from the KDCs certificate to a trusted root CA certificate, and then using the KDCs public key to verify the reply signature (Root cert must be trusted, revocation checking must occur, etc).  All cryptographic operations that use these keys take place on the smart card. The rest of the authentication process is the same as for a standard logon session.  

11. Both the client and the KDC then use this logon session key in all future communications with one another.   The following is cached on the client:  Session key, StartTime, EndTime, & UntilTime, realm, servername, client realm, client name and the Ticket itself.  

Further study that goes a bit deeper [The Smart Card Cryptographic Service Provider Cookbook](https://learn.microsoft.com/en-us/previous-versions/ms953432(v=msdn.10)?redirectedfrom=MSDN)


##Scoping

- Schedule a remote session with the customer
- Give the customer the opportunity to describe the issue on their own
- Is this a smartcard issue with local logon to a device? If so, which Windows version is the device where the smartcard is locally connected?
- Is this an RDP smartcard logon issue? If so, which Windows version is the RDP server and which Windows version is the device where the smartcard is locally connected?
- Is this an issue when attempting to use smart card credentials in an application?
- Does the user see the SC PIN dialogue where they should enter the PIN? 
- Does the error occur after entering the PIN? 
- Does the error occur instantly?
- What is the exact error message user is seeing, if any? 
- Detail what customer is trying to do with the smartcard:
  - Trying to enrol a certificate on the smartcard?
  - Trying to open a Windows logon session (either locally or through RDP)?
  - Authenticating to a website?
  - Signing an email or a document? 
- Who is the card manufacturer (Company name)?  
- What is the card model? 
- Is there a third party CSP or a MiniDriver (BaseCSP) involved?
- Has the customer contacted the card manufacturer to be sure they have installed the most recent version of the smart card driver, smart card reader driver, and 3rd party CSP / KSP / minidriver?
- Has the customer card manufacturer to enable any card manufacturer specific logs, so the issue is investigated both by Microsoft and the card manufacturer (via the card manufacturer specific logs)?

##Troubleshooting
###**Smartcard local logon to a device (not RDP) preliminary steps**

The Smartcard logon process is all accomplished via Kerberos.

####Check the System event log on the domain controller for relevant smartcard events

>Event ID 19 or KDC Event ID 29 would indicate the KDC cannot find a valid certificate to use for
smartcard logon.

The client must be able to validate the KDC certificate (chaining/CDP verification) in the system
context. The KDC must be able to validate the client smartcard certificate (chaining/CDP verification) in the system context.

####Verify the KDC certificate
The KDC on Windows Server 2008 R2 and newer will look for one of three conditions when parsing its certificate store for KDC certificates to use:  
**The OID for KDC Authentication (1.3.6.1.5.2.3.5)**

The presence of the Template Name DomainController in the certificate (all flavors of MS CAs stamp
this on certificates if it is a part of the request file received)  
**The OID for SmartcardLogon (1.3.6.1.4.1.311.20.2.2)**

If one of these is present in the certificate, the KDC will consider it potentially usable as a DC
certificate capable of servicing smartcard logons.  The last two are present in the W2k3 code while the first one was introduced with Windows Server 2008.

In addition to this, the direct issuer of the potential KDC certificate needs to be in the NTAuth store of the DC and all certificates in the chain except the Root CA need to pass revocation checking as well. If the certificates in the smartcard chain are not in the NTAuth store they will not be trusted and Smartcard logon will fail. This is true for any certificate being used for authentication.

Command to dump the NTAUTH store
 
```
certutil -store -enterprise NTAuth
```

####Cross validation of certificates

Export the KDC certificate and copy to the client. Using PSEXEC, spawn a command prompt as the system on the client computer.

Export the client smartcard certificate (verify certificate propagation service is running) and copy to the KDC. Using PSEXEC, spawn a command prompt as the system on the KDC. 

Run the following on both exported certificates and check for any errors -

```
certutil -verify -urlfetch CERTNAME.cer > output.txt
```

In some cases, there may be third party certificate validation software installed on the KDC (AXWAY,  Tumbleweed). This validation service needs to start BEFORE the KDC server or else Smartcard logon will fail until the KDC service is restarted.

See the following:

[ADDS: Security: Smartcard logon fails with "Signing in with a smart card isnt supported for your account" after DC reboot triggers race condition](https://internal.evergreen.microsoft.com/en-us/topic/bccc0c28-236e-d2f4-505a-b2bd26976a56)  

and
  
[Known issues with Tumbleweed Desktop Validator OCSP client and server running on Windows Server 2008](https://internal.support.services.microsoft.com/en-us/help/2009593/known-issues-with-tumbleweed-desktop-validator-ocsp-client-and-server)

###Smartcard RDP logon - preliminary steps 
The user's smart card is physically present at the client device, not at the RDP terminal server. The terminal server must access the card in order to perform any of the aforementioned operations.  All the calls into the smart card, via Windows Cryptography and the Cryptographic Service Provider (CSP), must be redirected from the terminal server to the terminal client.&nbsp; This is heavily dependent on network bandwidth and latency and in some cases middleware.

If your link has a relatively high latency (&gt;245 ms). This will introduce natural delay for accessing those client side CSPs (i.e. making the many calls to the various smartcard functions in winscard.dll).

In RDP Smartcard logon everything mentioned in domain logon in regard to chaining and validation is also necessary.

- If the users device is domain-joined and its domain does not trust the forest of the resource.

A user can supply a smart card (with a certificate with all the appropriate information required to find the untrusted domains DCs) when the application prompts to connect to the resource. People forget that the devices domain membership it not relevant except in the case where applications provide insufficient information to find domains. A domain-joined device will try its DC when a DC for another realm/domain cannot be located.

- I want to sign-in a domain-joined device with a certificate issued for another forest.

Domain Controllers have various ways to find user accounts when certificates are used. For you to map a certificate from another forest, you cannot use implicit mapping since the UPN will not be appropriate for the forest.

In addition, the issuing CA is probably not assed in the NTAuth store since the other forest is not trusted. This means you are limited to the explicit mapping options which do not check the NTAuth store policy. Key trust would do this which requires WS2016 DCs.

We also have AltSecId which is supported on all supported versions of Windows. X509 username hints must be enabled on the device so the user can specify the domain during sign-in.

Smartcard ETL tracing may be necessary on the client and destination RDP server.

The authentication scripts collect all the necessary traces for an initial analysis.

##Looking for Known Solutions

###Common solutions for this topic 
KDC does not have a certificate valid for smartcard logon  
KDC certificate for smartcard logon has expired and has not been renewed.  
KDC certificate for smartcard logon has been superseded by another that is not valid for smartcard
logon.  
The CA Certificate for CA that issued the KDC and/or the client smartcard certificate is not in the NTAUTH store in AD.  
Desktop Validator/Tumbleweed middleware service is not starting before the KDC service.  
The KDC certificate CDP locations cannot be verified.  
The smartcard certificate cannot be verified.  
The KDC certificate cannot be validated by the client.  
One of the CA certificates in the KDC smartcard logon certificate is not trusted by the client.  
One of the CA certificates in the client smartcard logon certificate is not trusted by the KDC.

###Other Resources 
1. Use your internal knowledge. If you know the solution, fix it and document as needed.
2. Check Knowledge Search for solutions via [DFM Knowledge](https://aka.ms/onesupport)
3. Check DOCS for published articles via [Technical documentation](https://docs.microsoft.com/en-us/documentation/)
4. Smartcard Discussion alias - sctalk@microsoft.com  

[The Smart Card Cryptographic Service Provider Cookbook](https://learn.microsoft.com/en-us/previous-versions/ms953432(v=msdn.10)?redirectedfrom=MSDN)

[2022.5B Certificate Mapping Changes | User certificate authentication results](https://internal.evergreen.microsoft.com/en-us/topic/63323d48-9a9a-6341-fe68-d4017381547e)

[Windows 10: Issue with RDP in combination with Smart Card authentication](https://internal.evergreen.microsoft.com/en-us/topic/77945f97-0456-3541-085d-3ca1aabfdd1c) - Issue is also reproduced with Windows 11 and Server 2025

Virtual Smart Card TLS 1.3 support  
[ADDS: PKI: Virtual Smart Card fails with SCARD_E_UNSUPPORTED_FEATURE for PAD PSS when authenticating using TLS](https://internal.evergreen.microsoft.com/en-us/topic/551ca7d6-aeeb-6322-29bb-2718f4723bd9)

##Solution Delivery
###**Customer facing**
1. Deliver the action plan to the customer.
2. Assist the customer in implementing the action plan.
3. Verify that the action plan has resolved the issue.

###**Internal Follow-up**
1. Close the case with this article as a resource.
2. If you resolved this issue by finding a KB, TechNet, blog or MSDN page that was either incomplete or needed some corrections, then submit your content idea by following the steps [here](https://contentidea/)
3. If you resolved this issue without finding a KB article and:  
There is a clearly defined issue statement.  
There is a clearly defined resolution to the issue.  
Document the issue in an [article](https://contentidea/) so that it can be quickly resolved in the future.


##Data Collection
The next steps will guide you in collecting data while customer reproduces the issue.

###**Data collection preparation**

If the issue is persistent and it can be easily reproduced, then we collect data as follows: 
- for a local SC logon, from the client device
- for RDP scenarios, also from the RDP server, at the same time as the data collection from the client device.

The usual data set is composed of authentication scripts, process monitor trace and a Problem Steps Recorder (PSR).

This might collect a very significant volume of logs in a short time; therefore, the data collection should not be performed over long time frames, but only the time frame needed to reproduce the issue at least once and stopping data collection after that.

The customer can download the most recent version of Process Monitor from the public Microsoft web site.

Problem Steps Recorder (PSR) is included in Windows and can be found by searching for "Steps recorder" in the search bar.

A new version of the Auth scripts has been released.

The new Auth scripts are written in PowerShell and have been digitally signed.

The batch file versions of the Auth scripts (start-auth.bat / Stop-auth.bat) have been decommissioned and should no longer be used or distributed.

The batch file version of the scripts are being decommissioned as per instruction from the Microsoft Trust & Integrity Protection (TrIP) team, as part of an Application Risk Assessment (ARA).

Please ensure that only the PowerShell version of the Auth Scripts are used after 11th July 2021.

Please note that the PowerShell Version of the Auth Scripts are code signed to ensure that the customer can trust that they come from Microsoft and have not been altered.

The scripts should be sent out to the customers without any changes, to ensure that the digital signature remains valid and can be validated by the customer.

The internal article has been updated with an overview of the data collection, usage (new switches) and script location.

[ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity and related scenarios](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9)

###Data Collection Detailed Step by Step

If possible, collect PSR from the client device so we can see the actions that the customer has done, as well as the time stamps when these actions were done.

If no PSR is possible, kindly ask the customer to write down the time stamps in hh:mm:ss of important actions such as: inserting the SC in the reader, selecting the SC in the logon dialogue, clicking OK after typing the SC PIN. These timestamps will be helpful during the data analysis.

1. Enable CAPI2 logging on every Domain Controller in the same site as the client, and don't forget to increase the size of the CAPI2 log.

The below command enables the CAPI2 log and sets its size to approximately 100MB.

```
wevtutil sl microsoft-windows-capi2/operational /e:true /ms:100000032
```

2. Remove the SC from the reader and reboot the client device
3. Log on with local admin with username and password to the client device and start auth scripts, a process monitor trace and any smart card vendor specific logging
4. Lock the local admin session, have the user insert the SC in the reader
5. If the issue is a failed local SC logon, attempt the local SC logon 
6. If this is an RDS scenario, now is the time to start auth scripts, the process monitor on the RDS server and any smart card vendor specific logging, with a local admin or another domain user than the affected user. Now attempt the RDS SC logon from the client device to the RDS server
7. After the issue has reproduced, stop the process monitor, auth scripts and any smart card vendor specific logging on the client device and RDS server. 
8. Export the CAPI2 logs from every Domain Controller in the same site as the client by running the commands below on each of them

```
wevtutil.exe set-log Microsoft-Windows-CAPI2/Operational /enabled:false
```

```
wevtutil.exe export-log Microsoft-Windows-CAPI2/Operational c:\%computername%-capi2.evtx /overwrite:true
```

The customer should share the smart card vendor specific logging with the smart card vendor for further analysis while Microsoft analyses the Microsoft logs.

## Trainings

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the smart card logon topic:

- M09.1 - SmartCard & AD CS Disaster Recovery - Slide Deck
- M09.1 - SmartCard & AD CS Disaster Recovery - Recording
- L09.3 - Smartcard - Lab Guide

**PKI Advanced** contains the following relevant modules for the smart card logon topic:

- M05 - Smart Card - Slide Deck
- M05 - Smart Card - Recording
- L05 - Smart Card- Lab Guide

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.

---

**Additional training content:**

[Troubleshooting Smart Card Logon: What is a Smart Card and How it works](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2F16%2E%20%23Inshorts4DS%2Dwith%2DByron%20Hu%2DWhat%20is%20Smart%20Card%20and%20How%20it%20works%2Emp4)

---

[Troubleshooting Smart Card Logon: Smart Card Card Reader Issue](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2F17%2E%20%23Inshorts4DS%2Dwith%2DByron%20Hu%2DTroubleshooting%20Smart%20Card%20Logon%5FSmart%20Card%20Card%20Reader%20Issue%2Emp4)

---

[Troubleshooting Smart Card Logon: Certificate Issue](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2F18%2E%20%23Inshorts4DS%2Dwith%2DByron%20Hu%2DTroubleshooting%20Smart%20Card%20Logon%5FCertificate%20Issue%2Emp4)

---

[Troubleshooting Smart Card Logon: Kerberos Logon Issue](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2F19%2E%20%23Inshorts4DS%2Dwith%2DByron%20Hu%2DTroubleshooting%20Smart%20Card%20Logon%5FKerberos%20Logon%20Issue%2Emp4)

---

[Virtual Smart Card Lab Setup](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2FSession%201%20Smart%20Card%20Lab%20Setup%2Ewmv)

---

[ADDS: Internal Guide: Strong Name Mapping Enforcement: Production Impact Cases](https://internal.evergreen.microsoft.com/en-us/topic/f27e9f28-664f-5746-654b-540f60f2839d)
