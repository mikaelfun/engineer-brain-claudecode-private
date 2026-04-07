---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Server/Workflow: PKI Server: Network Device Enrollment Service (NDES)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Server/Workflow%3A%20PKI%20Server%3A%20Network%20Device%20Enrollment%20Service%20%28NDES%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414072&Instance=414072&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414072&Instance=414072&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Network Device Enrollment Services (NDES)

#Summary
This guide provides detailed instructions on testing, troubleshooting, and renewing Network Device Enrollment Services (NDES) certificates, including common issues and solutions, installation steps, and data collection methods.

# Documentation
- [Network Device Enrollment Service (NDES) in Active Directory Certificate Services (AD CS)](https://social.technet.microsoft.com/wiki/contents/articles/9063.active-directory-certificate-services-ad-cs-network-device-enrollment-service-ndes.aspx)
- NDES install and configuration:
[Ill take NDES in the DMZ, for 1000 Alex](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/i-8217-ll-take-ndes-in-the-dmz-for-1000-alex/ba-p/399435)

# NDES testing using Microsoft commands
You can assist customers with testing their NDES deployment to validate that it is able to successfully issue certificates outside of any third-party SCEP client or Intune software being used.


:memo:**Note:** DO NOT try this with the Intune Policy Module installed on the NDES Server. It will fail.

If you need to test an NDES Server that has the Intune Policy Module installed, please do the following steps to disable/remove it temporarily.

1. Launch `Regedit`.
2. Navigate to: `HKLM\Software\Microsoft\Cryptography\MSCEP.`
3. Export the key named Modules and save it as a .REG file on the users desktop.
4. Once the key has been backed up, delete the Modules key in the registry.
5. Open an elevated command prompt and type: `IISReset`.
6. Once testing has been completed, import the Modules key back by double-clicking on the .REG file on the users desktop.
7. Open an elevated command prompt and type: `IISReset`.


:memo:**Note:** For this testing, you **CANNOT REQUIRE SSL** for the `/CertSrv/MSCEP_Admin` page or the `/CertSrv/MSCEP` pages.

On a client computer, other than the NDES server, create a new text file with the name: `C:\SCEP_Req.inf`
```
[NewRequest]
Subject = "CN=Test User Certificate"
RequestType = SCEP
KeyLength = 2048
```

:memo:**Note:** Make sure that the `SCEP_Req.inf` file has the cursor ending on a blank line. Hit the Enter key after "2048".

Replace NDESDnsServerName.domainname.com with the NDES website's DNS name that the customer is using. Also, you should specify which store the private key should be generated in by typing either -User or -Machine for the first and last commands.

Run the following commands:  
```
CertReq [-User/-Machine] -v -config NDESDnsServerName.domainname.com -New C:\SCEP_Req.inf C:\SCEP_Request.req
```

Example: ```CertReq -User -v -config ndes.contoso.com -New C:\SCEP_REQ.INF C:\SCEP_Request.req```

```
CertReq -v -Config NDESDnsServerName.domainname.com -Submit C:\SCEP_Request.req
```

Example: ```CertReq -v -config ndes.contoso.com -Submit C:\SCEP_Request.req```

After running the above command, it will ask you to save the certificate to the system in PKCS#7 format ".P7B" file extension.

```
CertReq [-User/-Machine] -Accept c:\ndestest.p7b
```

Example: `CertReq -User -Accept c:\ndestest.p7b`

# Common issues

[Intune: "500 - Internal server error/ NDES URL" | Renew MSCEP-RA](https://internal.evergreen.microsoft.com/en-us/topic/2a74df28-d77d-74c8-5415-c03fe8c734f0)  

[Common Network Device Enrollment Service (NDES) configuration wizard failures](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/common-network-device-enrollment-service-ndes-configuration/ba-p/3879101)

[NDES and the dreaded 2 & 10 Event ids stating The parameter is incorrect"](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/ndes-and-the-dreaded-2-amp-10-event-ids-stating-the-parameter-is/ba-p/3906775)

[Workflow: UEX: DCOM: Resolving DCOM Event 10016](https://internal.evergreen.microsoft.com/en-us/topic/e0387881-7227-428e-dbf6-63985b748dda)

# Scoping

- Schedule a remote session with the customer.
- Give the customer the opportunity to describe the issue on their own.
- What is the operating system of the NDES server?
- Is the NDES server up to date with patches and updates?
- Is the NDES role installed directly on the CA?
- If the NDES role is NOT installed on the CA, was the CA rebooted prior to the issue?
- Is this a new NDES implementation?
- Is there a policy module being used with NDES (Intune, third party)?
- Is there a third-party certificate issuance application in front of NDES (JAMf Pro, Blackberry, Cisco ASA)?
- When did the issue start?
- Are you configuring a new NDES server or troubleshooting an existing installation?
- What types of devices will enroll against the NDES server? (Network hardware, mobile devices, etc.)

# NDES role installation with regard to the Certificate Services Service restart behavior

[Installing NDES restarts CertSvc service on target CA server](https://learn.microsoft.com/en-gb/archive/blogs/instan/installing-ndes-restarts-certsvc-service-on-target-ca-server)

The registry on the target CA server is also modified to add 'DeviceSerialNumber' with the OID 2.5.4.5 to the 'SubjectTemplate' list under
```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration\CA name\SubjectTemplate
```

The updated registry entry isn't read by the CA server until the CertSvc service is restarted, which is why the NDES installation initiates a restart of the service during the setup of NDES (regardless of if it's the same box or a different machine).

In addition, on the issuing CA that the NDES server is a proxy for, check the properties - Auditing tab and uncheck Start and stop Active Directory Certificate Services. This auditing setting may be preventing the CA CERTSVC from restarting in a timely manner, which will result in an RPC_SERVER_UNAVAILABLE error during the NDES role configuration.

![NDES role installation CA auditing tab screenshot](/.attachments/image-23f73639-fb0b-46c2-8813-102ba2a4ef26.png)

## Error while selecting the NDES service account during NDES setup
[SCEP/NDES: The implementation is not capable of performing the request](https://internal.evergreen.microsoft.com/en-us/topic/206aa674-bf70-6101-2019-1f268ec4a047)

# Common NDES events
## NDES service will not start

**Event ID: 2** - The Network Device Enrollment Service cannot be started.

This is usually due to the customer allowing the NDES certificates to expire.
## NDES cannot retrieve one of its required certificates

**Event ID: 10** - The Network Device Enrollment Service cannot retrieve one of its required certificates (%ErrorCode). %ErrorMessage.

This could be the NDES service account is disabled or the NDES service account lacks access to the private keys of the valid NDES certificates.

## NDES cannot encrypt the response to a client request

**Event ID: 13** - The Network Device Enrollment Service cannot encrypt the response to a client request (0xc00000bb).

Usually, this is due to the end entity using suite B keys (or other keys) not supported by NDES. NDES as a Microsoft component supports ECC suite B keys, and we can use that to get NDES encryption and signing certificate. But since end entities use the SCEP protocol (which is an RFC standard) to procure certificates from NDES, the SCEP protocol will not support ECC Suite B keys. SCEP only supports RSA-based cryptography.

# NDES troubleshooting

All NDES/MSCEP configuration settings are stored under one registry key:
```
HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\MSCEP
```

NDES logs events in the System Eventlogs with event source of NetworkDeviceEnrollmentService.

Verify communication between NDES and the CA by using the command:
```
certutil -config <ComputerName\CAName> -ping
```

Also, you want to look at the W3Svc (IIS) logging as well. Since NDES does run on top of IIS, the actual problem may not be with NDES but rather a setting that has been configured within IIS causing the issue and blocking the request from even arriving at the MSCEP.DLL file.
From a computer that is NOT the NDES server, try to access the MSCEP_ADMIN page.
Remember, you can only access the **certsrv/mscep_admin** NDES admin site if you are a LOCAL ADMINISTRATOR on the NDES server.

# NDES certificate renewal

There is no magic here. NDES administrators must keep up on the validity of the NDES certificates and renew before they expire.

The web server certificate and CEP encryption will attempt to renew without issue if the certificate templates are correctly configured. By default, the certificate will attempt renewal within 6 weeks of expiration or at 70  80 percent of lifetime.

The Exchange Enrollment (offline request) certificate will need some special attention when renewing as it is a **user-based certificate template**. Remember, the "Subject Type" of the certificate template "Exchange Enrollment Agent (Offline request)" is set to "User".

You must use the Certificates > Current User to enroll for the Exchange Enrollment Agent (Offline request) template. The logged-in user must have read and enroll permissions on this template. During the enrollment, you must make sure you select **"Make Private Key Exportable"**. After you successfully enroll for the template, you must export it from the USER store WITH THE PRIVATE KEY. Then you must import it into the Computer store and give the NDES service account read access to the private key.

### Regarding the NDES certificates (CEP encryption and Exchange Enrollment (offline request)
When it comes time for renewal the CEP encryption you can accomplish right from the computer certificate store MMC.
The NDES computer and the logged-in user must have read and enroll permissions on this template.

However, the Exchange Enrollment (offline request) will require some special attention.

The Exchange Enrollment (offline request) template is a USER template.

This renewal for the Exchange Enrollment (offline request) template can be done two ways.

#### Option 1: using the GUI

Log on to the NDES server with a user account that has read/enroll permissions to the Exchange Enrollment (offline request) template. The NDES server should have this already.

Load the MMC for the logged-on user and request the certificate using the Exchange Enrollment (offline request) template.

Specify the same information as the current Exchange Enrollment (offline request) certificate when you configure the request.

On the private key tab, make sure to make the private key exportable.

![Screenshot of Exchange Enrollment (offline request) private key exportable MMC enrollment option](/.attachments/image-d182901a-159b-47a3-a156-699ef61b6b67.png)

Once you procure the certificate in the user store, export it as a PFX (with private key) and import it into the computer store.

Give the NDES service account read access to the private key.

![Screenshot of NDES service account private key access in mmc](/.attachments/image-b86bb0ff-717b-4010-8792-38e0c16c493d.png)

#### Option 2: using certreq

A request file as follows (edited to reflect your customer's configuration):

To request the certificate for EnrollmentAgentOffline.

1. Save the below file as `EEoffline.inf`
```
[NewRequest] 
; Subject must be included in the file  
; The Subject name should be somewhat descriptive. A good format is   
; %COMPUTERNAME%-MSCEP-RA. Modify the Subject to fit your environment.   
;   
Subject = "CN=NDESSERVER01-MSCEP-RA,OU=Servers,O=Contoso,L=Redmond,S=Washington,C=US"   
Exportable = TRUE   
KeyLength = 2048   
KeySpec = 2   
KeyUsage = 0x80   
MachineKeySet = TRUE   
ProviderName = "Microsoft Enhanced Cryptographic Provider v1.0"   
ProviderType = 1   
   
[EnhancedKeyUsageExtension]   
OID = 1.3.6.1.4.1.311.20.2.1   
 
[RequestAttributes]   
CertificateTemplate = EnrollmentAgentOffline  
```

2. Run the below command to create the request.
```
certreq -new eeoffline.inf eeoffline.req
```

This command will generate the certificate request and save it as eeoffline.req. If you see the warning dialog that states "User context template conflicts with machine", click Ok.

This warning can be ignored.

3. Run the below command to submit the request.
```
certreq submit eeoffline.req eeoffline.cer
```

You will be prompted to select to which CA the request should be submitted. Once that is done, the request will be submitted and the issued certificate will be retrieved and saved as eeoffline.cer.

4. Run this command to install this certificate.
```
certreq -accept eeoffline.cer
```

This command will import the new certificate and move it into the Local Computer Personal store.

**Remember to give the NDES service account read access to the private keys of the new certificates.**

# NDES and Intune

Some Intune scenarios use NDES. If the customer is experiencing Intune errors, please start a collaboration with the Intune team so that the customer's scenario is investigated both from the NDES and Intune perspective.

# NDES and third-party products
There are a variety of third-party products that customers use to front NDES, such as MobileIron, AirWatch, JAMf Pro, etc. It is not your responsibility to troubleshoot these third-party vendor products.  
- Verify that Microsoft NDES is functional first using the methods described previously.  
- Can you successfully access the MSCEP_ADMIN page in a browser from a computer that is not the NDES server?  
- Can you access the MSCEP page from the same computer? <-- This is the URL used to submit certificate requests.  
- There is no point in testing access to the NDES server from the NDES server itself. This is not how the NDES server will be used by client devices requesting certificates from it.

# NDES certificate template information

NDES cannot use a Version 3 (V3) template as V3 uses KSP and NDES can only use a CSP. If a customer uses a custom template for either exchange enrollment (offline Request) or CEP encryption to fulfill some key size necessity, this may cause an issue.

You will need to recreate this template as a V2. This is accomplished when you are prompted to select the version of Windows Server (minimum supported CAs) for the duplicate certificate template - you select Windows Server 2003 Enterprise.

# Data collection

If the issue can be reliably reproduced, a good initial data set consists of having NDES debug logging enabled, collecting authentication scripts, a Process Monitor trace, and a Problem Steps Recorder (PSR) trace.

Enable NDES logging:

Follow the detailed instructions from [Active Directory Certificate Services (AD CS): Network Device Enrollment Service (NDES): Enable logging](https://social.technet.microsoft.com/wiki/contents/articles/9063.active-directory-certificate-services-ad-cs-network-device-enrollment-service-ndes.aspx#Enable_Logging).

This might collect a very significant volume of logs in a short time; therefore, the data collection should not be performed over long time frames, but only the time frame needed to reproduce the issue at least once and stopping data collection after that.

The customer can download the most recent version of Process Monitor from the public Microsoft website.

Problem Steps Recorder (PSR) is included in Windows and can be found by searching for "Steps recorder" in the search bar.

A new version of the Auth scripts has been released.

The new Auth scripts are written in PowerShell and have been digitally signed.

The batch file versions of the Auth scripts (start-auth.bat / Stop-auth.bat) have been decommissioned and should no longer be used or distributed.

The batch file version of the scripts is being decommissioned as per instruction from the Microsoft Trust & Integrity Protection (TrIP) team, as part of an Application Risk Assessment (ARA).

Please ensure that only the PowerShell version of the Auth Scripts are used after 11th July 2021.

Please note that the PowerShell version of the Auth Scripts are code signed to ensure that the customer can trust that they come from Microsoft and have not been altered.

The scripts should be sent out to the customers without any changes, to ensure that the digital signature remains valid and can be validated by the customer.

The internal article below has been updated with an overview of the data collection, usage (new switches), and script download location.
[ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity, and related scenarios](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9)

# Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge.

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Advanced** contains the following relevant modules for the NDES topic:

- M06 - Network Device Enrollment Services - Slide Deck
- M06 - Network Device Enrollment Services - Recording
- L06 - NDES - Lab Guide

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=training).

</br>


**Additional training content:**

---

[NDES Brownbag](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2FADDS%20%2D%20PKI%20%2D%20NDES%20Brownbag%2Emp4)

---

[ADDS: PKI: How to issue certificate from NDES using PowerShell](https://internal.evergreen.microsoft.com/en-us/topic/e70f98e7-6abf-c099-54f6-d7679ac92797)

---

[ADDS: PKI: How to automate stress test for NDES using PowerShell to send bulk requests](https://internal.evergreen.microsoft.com/en-us/topic/a7a46b54-5381-f197-32f3-669bc0e6726d)
