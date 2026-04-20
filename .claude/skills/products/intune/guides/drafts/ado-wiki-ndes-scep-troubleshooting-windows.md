---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP/Troubleshooting/Windows"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Device%20Config%20Certificates%20Email%20VPN%20Wifi/NDES%20and%20SCEP/Troubleshooting/Windows"
importDate: "2026-04-20"
type: guide-draft
---

# Windows 🖥

_Applies to_

<div style="text-align: left; display: inline-block; display: flex; flex-wrap: wrap; justify-content: space-between;">
<span style="flex: 1 1 auto;background-color: rgb(000, 120, 215); color: white; border: 1.5px solid black;"><b>&nbsp;Intune&nbsp;</b></span>
<span style="flex: 1 1 auto;background-color: rgb(0, 0, 204); color: white; border: 1.5px solid black;"><b>&nbsp;Windows&nbsp;</b></span>

</div><br>

Author: @<65A43B31-1210-6D44-B708-AAAF766C2FBC> 

[[_TOC_]]

# Windows Profiles  

This guide provides an overview of SCEP certificate profile deployment to **Windows profiles** in Microsoft Intune, including how to verify that each step is successful. It also provides troubleshooting suggestions for some of the most common issues that you may encounter during the deployment process.

It's assumed that you have configured the NDES server, Trusted certificate profiles (complete chain) and SCEP profile. In the example in this guide, the Trusted Root and SCEP profiles are named as follows:  

- <u>Trusted Root Profile</u>: "Win - BIT Root CA"
  - PolicyID: a7ea56ac-xxxx-xxxx-xxxx-690414cf9e92
  - Thumbprint: 177419bbb70710039e2ab093a2327baf59e3bc35
- <u>Trusted Intermediate Profile</u>: "Win - BIT Issuing CA"
  - PolicyID: 90497af1-xxxx-xxxx-xxxx-0b2652d1329a
  - Thumbprint: 8a8b483a7ca1f3a1fc1ade265e795d71af0b8885
- <u>SCEP profile</u>: "Win - SCEP User"
  - PolicyID: 323b8974-xxxx-xxxx-xxxx-f4958f1c9fb1
  - Thumbprint: 61327876024dff695e233dc0d1dea4a9d4340aa8


## Logs to collect.  

When troubleshooting, it's very important to know which logs to collect and why. Before SCEP policy deployment, let's take a look at the different logs. These log files provide important insight to problems that might occur and help you understand the overall flow.  

### Logs on the server side ("NDES" server).  

<br>

**Microsoft Intune Connector Logs**  

<div class="relative overflow-hidden shadow-md rounded-lg">
    <table class="table-auto w-full text-left">
        <thead class="uppercase bg-[#4682B4] text-[#e5e7eb]" style="background-color: #4682B4; color: #e5e7eb;">
            <tr>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"><div style="text-align: center;"><b>File</b></div></td>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"><div style="text-align: center;"><b>Location</b></div></td>
                <td class="py-1 border text-center font-bold p-4" contenteditable="true"><div style="text-align: center;"><b>Description</b></div></td>
        </thead>
        <tbody class="bg-white text-gray-500 bg-[#FFFFFF] text-[#6b7280]" style="background-color: #FFFFFF; color: #6b7280;">
            <tr class="py-5">
                <td class="py-5 border text-center  p-4" contenteditable="true">Admin.evtx
                </td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > <b>Admin</b>  
                </td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">This log contains one log event per request to the connector. Events include either a success with information about the request, or an error with information about the request and the error. 
                </td>   
            </tr> 
             <tr class="py-5">
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Operational.evtx</td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > <b>Operational</b>  
                </td>
                <td class="py-5 border text-center  p-4 align-top" contenteditable="true">This log displays all the operations and transactions occurring during the certificate request. This can be of use in debugging issues.
                </td>   
            </tr>            
    </table>
</div>


To collect these logs, go the location in Event Viewer and right click -> "Save all events as...", save it as .evtx file.

**IIS Logs**  


|File  |Location  |Description  |
|---------|---------|---------|
| u_ex<time stamp>.log (Example: u_ex240820.log) |%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\ |This logs the calls requests made by the device to the IIS server. |

To collect this log, go to the location and grab the most recent file by date.

### Logs on the Windows device.  

<br>

**Event Viewer Logs** - *(Application and Services-Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Admin)*

**SyncMLViewer Logs**  
The SyncMLViewer tool will record in real time the XML information for all profiles being syncronized from Intune to the device: [*SyncMLViewer tool* :link:](https://github.com/okieselbach/SyncMLViewer)

## SCEP certificate deployment process.  

The overall process can be divided in 5 steps:  
- Step 1: Deploy the SCEP certificate profile.
- Step 2: The device gets the SCEP profile.
- Step 3: The device contacts the NDES server.
- Step 4: The request is validated and passed to issue the certificate.
- Step 5: The certificate is issued and sent to the device.

### Step 1: Deploy the SCEP certificate profile.  

#### **A. Certificate chain**

As a pre-requisite, you **must** deploy the Trusted Root profile along with any intermediate or issuing certificates.
Windows does <u>not require</u> the entire chain deployed, but it is **strongly** recommended. Especially if using it for Wi-Fi authentication, since some Radius vendors might validate the entire chain.

>:closed_book: **IMPORTANT**: The Trusted Certificate profile in Intune should only be used to deliver either root or intermediate certificates. The purpose of deploying such certificates is to establish a chain of trust. Using the trusted certificate profile to deliver certificates other than root or intermediate certificates is not supported by Microsoft.  <br><br>

**Troubleshooting**

Deploying a trusted certificate profile is very simple, however, always validate that the correct trusted root is deployed. For detailed troubleshooting, first check:
[*Intune: Troubleshooting Trusted Root and SCEP Certificate Device configuration policies using Assist 365* :link:](https://internal.evergreen.microsoft.com/en-us/topic/fb713f8d-971c-5b5d-1d4e-e24c5c21867e) review the section named "**Checking for Root profiles**".
Take note of the Thumbprint value on each of the certificates that make part of the chain (Root and Intermediates).

The profile comes down as a XML and you can find it in SyncML log as follows:  
**Keyword**: search for "<font color=blue>**RootCATrustedCertificates**</font>" and you should see the Trusted certificate thumbprints.

```powershell
<Add>
  <LocURI>./Device/Vendor/MSFT/RootCATrustedCertificates/Root/177419BBB70710039E2AB093A2327BAF59E3BC35/EncodedCertificate</LocURI>
<Add>
  <LocURI>./Device/Vendor/MSFT/RootCATrustedCertificates/CA/8A8B483A7CA1F3A1FC1ADE265E795D71AF0B8885/EncodedCertificate</LocURI>
```

**Kusto**  

You can use the following Kusto query to validate that the Trusted and SCEP profiles were delivered and applied:  

```powershell
DeviceManagementProvider 
| where env_time > ago(1d) 
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == "IntuneDeviceID" 
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| where applicablilityState == "Applicable"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState, EventMessage
```

Look in 'typeAndCategory' for TrustedRootCertificate as your Root and Intermediates, and ClientAuthCertificate for SCEP.

**Result:**

```powershell
policyId	typeAndCategory	applicablilityState	reportComplianceState
a7ea56ac-xxxx-xxxx-xxxx-690414cf9e92	ConfigurationPolicy;TrustedRootCertificate	Applicable	Compliant
90497af1-xxxx-xxxx-xxxx-0b2652d1329a	ConfigurationPolicy;TrustedRootCertificate	Applicable	Compliant
323b8974-xxxx-xxxx-xxxx-f4958f1c9fb1	ConfigurationPolicy;ClientAuthCertificate	Applicable	Compliant
```

If a policy does not show, you can remove the "Applicable" line and see if profile does show as NotApplicable. If so, or if it does not show at all, there will likely be some conflict with assignments. Review all dependent profiles are assigned to the same group type (all to Users only or all to Devices only).  


##### <font size=3>How to view the Root certificate in the device.</font>  

- Open certs in Microsoft Management Console:
- Open Run and type mmc > File > Add/Remove Snap-in > Certificates > Add > Computer Account > Finish > Ok
- Under the Console Root, expand Certificates (Local Computer) > Trusted Root Certification Authorities > Certificates. This will contain all trusted certificates that have been installed by any site or app. Scroll down to find the certificate issued by the CA.

    ![](../../../.attachments/Dev-Config-Certs/Troubleshooting/winroot.png)
    
- For the Intermediate certificates, go to Certificates (Local Computer) > Intermediate Certification Authorities > Certificates

    ![](../../../.attachments/Dev-Config-Certs/Troubleshooting/winint.png)

#### B. Deploy the SCEP Profile.

Check [*Intune: Troubleshooting Trusted Root and SCEP Certificate Device configuration policies using Assist 365* :link:](https://internal.evergreen.microsoft.com/en-us/topic/fb713f8d-971c-5b5d-1d4e-e24c5c21867e) and review all the information in Assist365 to make sure the profile is created correctly for Windows profiles and that it is assigned correctly.

### Step 2: The device gets the SCEP profile.  

There is **no** notification in the device when the SCEP certificate is installed.
In this step, the device receives the SCEP profile and tries to contact the NDES server via IIS request. The **Event Viewer logs** will show the following events:

SyncML shows the XML file sent by Intune, with all the fields requested for the certificate:

**Keywords**: search for "<font color=blue>**ClientCertificateInstall**</font>"
```powershell-interactive
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/ServerURL</LocURI>
  <Data>https://ndesproxy-tenant.msappproxy.net/certsrv/mscep/mscep.dll</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/Challenge</LocURI>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/EKUMapping</LocURI>
  <Data>1.3.6.1.5.5.7.3.2</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/KeyUsage</LocURI>
 <Data>160</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/SubjectName</LocURI>
 <Data>CN=win</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/KeyProtection</LocURI>
  <Data>2</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/RetryDelay</LocURI>
  <Data>1</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/RetryCount</LocURI>
  <Data>3</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/TemplateName</LocURI>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/KeyLength</LocURI>
  <Data>2048</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/HashAlgorithm</LocURI>
  <Data>SHA-1;SHA-2</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/CAThumbprint</LocURI>
  <Data>177419BBB70710039E2AB093A2327BAF59E3BC35</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/SubjectAlternativeNames</LocURI>
  <Data>11+win@domain.com;3+WinScepUser</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/ValidPeriod</LocURI>
  <Data>Years</Data>
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/ValidPeriodUnits</LocURI>
  <Data>1</Data>
```  
<br></br>

**Keywords**: search for "<font color=blue>**Event 306**</font>"  

<font size="2" face="Courier New">Information	8/20/2024 9:49:42 AM	DeviceManagement-Enterprise-Diagnostics-Provider	**306**	None</font>
```powershell-interactive
SCEP: CspExecute for UniqueId : (ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741) InstallUserSid : (S-1-12-1-1040038417-1116844459-1519109262-633658448) InstallLocation : (user) NodePath : (clientinstall)  KeyProtection: (0x2) Result : (Unknown Win32 Error code: 0x2ab0003).
```

Here we can see that the device received the SCEP profile. You can validate it is the correct SCEP profile by checking the Policy ID, which you find as "LogicalName_SCEPpolicyID"  
LogicalName_<mark>323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1</mark>

:bulb: **TIP**: Notice that the policyID in the logs is shown divided by underscore. In Assist, the policyID appears separated by dashes. So keep that in mind when cross-checking between Assist365 and Console log or Kusto.

### Step 3: The device contacts the NDES server.  

Next you will see the following events in logs:  

**Keywords**: search for "<font color=blue>**Event 36**</font>"  

<font size="2" face="Courier New">Information	8/20/2024 9:49:44 AM	DeviceManagement-Enterprise-Diagnostics-Provider	**36**	None</font>
```powershell
SCEP: Certificate request generated successfully. Enhanced Key Usage: (1.3.6.1.5.5.7.3.2), NDES URL: (https://ndesproxy-tenant.msappproxy.net/certsrv/mscep/mscep.dll/pkiclient.exe), Container Name: (), KSP Setting: (0x2), Store Location: (0x1).
```  

This connection to the NDES server is also logged in IIS logs (%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\):  
Keep in mind that IIS will not differentiate within specific devices (no IDs, names). If several platforms are in use, you must identify a proper timestamp of the deliver with other logs and sync times. Additionally, Windows entries will include "+Win32".  

**Keywords**: "GetCACert&message=ca", "GetCACaps&message=ca", "PKIOperation"

```powershell
2024-08-20 16:49:42 ::1 GET /certsrv/mscep/mscep.dll/pkiclient.exe operation=GetCACaps&message=default 443 - ::1 Mozilla/4.0+(compatible;+Win32;+NDES+client+10.0.22621.2506/ni_release_svc_prod3) - 200 0 0 0
2024-08-20 16:49:42 ::1 GET /certsrv/mscep/mscep.dll/pkiclient.exe operation=GetCACert&message=default 443 - ::1 Mozilla/4.0+(compatible;+Win32;+NDES+client+10.0.22621.2506/ni_release_svc_prod3) - 200 0 0 0
2024-08-20 16:49:44 ::1 POST /certsrv/mscep/mscep.dll/pkiclient.exe operation=PKIOperation 443 - ::1 Mozilla/4.0+(compatible;+Win32;+NDES+client+10.0.22621.2506/ni_release_svc_prod3) - 200 0 0 583
```

The way we validate this step is by the **200 status** code. For more information about HTTP status code check [HTTP status code overview - Internet Information Services :link:](https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/www-administration-management/http-status-code).  

If you see a different status code, follow this instructions:  
1. Go to the SCEP profile in Intune portal
2. Copy the **SCEP Server URL**  

    ![](../../../.attachments/Dev-Config-Certs/Troubleshooting/droidWurlp.png)  

3. Open a browser, paste the URL and navigate to it. The expected result is <font color=red>**HTTP Error 403.0 - Forbidden**</font>.  

    ![](../../../.attachments/Dev-Config-Certs/Troubleshooting/droidWurle.png)  

    **If you don't get HTTP Error 403.0 - Forbidden**, check [*Intune: Troubleshooting Trusted Root and SCEP Certificate Device configuration policies using Assist 365* :link:](https://internal.evergreen.microsoft.com/en-us/topic/fb713f8d-971c-5b5d-1d4e-e24c5c21867e) in the section Checking for SCEP profiles part 3 and follow the troubleshooting for the message you got.  

    In the **Microsoft-Intune-CertificateConnectors/Operational** log, you will see the incoming request:  
    **Keyword**: "<font color=blue>**Event ID: 4003 - ScepRequestReceived**</font>"

    ![](../../../.attachments/Dev-Config-Certs/Troubleshooting/win4003.png)  

    Here you can validate:  
    - The Intune deviceID.
    - The SCEP policy ID.
    - Timestamp.
    - Name of the template used.  
    
    Once the device has made the connection to the NDES server, if the request received fails, the details will be shown in this log.  

### Step 4: The request is validated and passed to issue the certificate.  

Then the request will be verified by Intune service; if successful, you will see the following entry in the Operational log:
**Keyword**: "<font color=Blue>Event ID: 4004 - ScepVerifySuccess</font>"


![](../../../.attachments/Dev-Config-Certs/Troubleshooting/win4004.png)  

Here you can validate:
-The Intune deviceID.
-The SCEP policy ID.
-Timestamp.
-Name of the template used.

If the request is verified successfully, it will then request a certificate to the certificate authority.  

### Step 5: The certificate is issued and sent to the device.  

In the **Connector log** -> **Operational**, you will see the following:
**Keyword**: "<font color=Blue>**Event ID: 4006 - ScepIssuedSuccess**</font>"

![](../../../.attachments/Dev-Config-Certs/Troubleshooting/win4006.png) 

Here you can validate:
- The Intune deviceID.
- The SCEP policy ID.
- Timestamp.
- Thumbprint of the SCEP certificate issued.
- Subject name of the SCEP certificate issued.  

In SyncML logs you can see entry:  
**Keywords**: "<font color=Blue>**ClientCertificateInstall, Enroll**"</font>  
```powershell
<LocURI>./User/Vendor/MSFT/ClientCertificateInstall/SCEP/ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741/Install/Enroll</LocURI>
```

In Console log, you will see the following events indicating successful delivery of the SCEP certificate:

**Keywords**: "<font color=Blue>**Events 39, 256 and 309**"</font>  

<font size="2" face="Courier New">Information	8/20/2024 9:49:44 AM	DeviceManagement-Enterprise-Diagnostics-Provider	**39**	None</font>  
```powershell
SCEP: Certificate installed successfully.
```  

<font size="2" face="Courier New">Information	8/20/2024 9:49:44 AM	DeviceManagement-Enterprise-Diagnostics-Provider	**256**	None</font>
```powershell
OmaDmLogOmaDmApiInitiateSession: Result: (The operation completed successfully.), Account Id: (B6609DA9-17A2-49AB-A828-A76F109211F5), Initiation Id: ({8D370D7A-F8AE-484B-81FE-7062BCA0C1CB}), Mode: (2), Origin: (33), AutoDelete: (false), Alert Count: (1), First Alert Name: (com.microsoft:mdm.SCEPcertinstall.result), User Sid: (S-1-12-1-1040038417-1116844459-1519109262-633658448), User Only: (true), All Active Users: (false), Process Name: (C:\Windows\system32\svchost.exe), System Or Admin: (true).
```  


<font size="2" face="Courier New">Information	8/20/2024 9:49:53 AM	DeviceManagement-Enterprise-Diagnostics-Provider	**309**	None</font>
```powershell
SCEP: InstallFromRegEntries. CorrelationGuid : ({7D45CADC-C874-4332-9243-B81A90FF0EA5}) UniqueId : (ModelName_AC_fd19e485-e013-44c2-b74d-633899d2861d_LogicalName_323b8974_xxxx_xxxx_xxxx_f4958f1c9fb1_Hash_2107323741) Certificate Thumbprint : (61327876024DFF695E233DC0D1DEA4A9D4340AA8) Respondent Server : (https://ndesproxy-tenant.msappproxy.net/certsrv/mscep/mscep.dll/pkiclient.exe) Install Status : (0x1) Current Retry Count :  (0x1) Result : (The operation completed successfully.)
```
This last Event also shows the certificate thumbprint.  

#### Validate that the SCEP certificate is in the device.  

Finally, to validate on the device side that the SCEP certificate was delivered:
- Open certs in Microsoft Management Console:
- Open Run and type mmc > File > Add/Remove Snap-in > Certificates > Add
  - Here you will need to select the appropriate container depending on the Certificate Profile Type. If looking for a User certificate, then snap-in 'My User Account'. If looking for a Device certificate, then snap-n 'Computer Account'
- Finish > Ok
- Under the Console Root, expand either 'Certificates - Current User' (*for User certificates*) or 'Certificates (Local Computer)' (*for Device certificates*) > Personal > Certificates.   
   This will contain all certificates that have been issued to this user or device.  
   
    ![](../../../.attachments/Dev-Config-Certs/Troubleshooting/winscep.png)


To see the details you can find in the certificates once installed on the device, go to this article: 
[**View Certificates** :link: :eyes:](../../.././Device-Config-Certificates-Email-VPN-Wifi/NDES-and-SCEP/View-Certificates.md)  


------------
:thought_balloon:Have feedback on this workflow? Please contact: [Jesus Santaella](mailto:jesantae@microsoft.com)