---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Certificate Root Update Program"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Certificate%20Root%20Update%20Program"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414078&Instance=414078&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414078&Instance=414078&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Certificate Root Update Program

---
#Summary
This article provides an overview of the Certificate Trust List (CTL) in Windows, its importance, retrieval, storage, and troubleshooting steps for issues related to CTL updates.

# Overview

- ##What does CTL stand for?

  CTL stands for Certificate Trust List

- ##Why do we need the untrusted and trusted CTLs?
 
  The untrusted CTL is a digitally signed list of Root CA's that had been compromised.

  The trusted CTL is a digitally signed list of Root CA's that are members of the Microsoft Root CA program. 
 
- ##What is their content?
 
  Both the untrusted and the trusted CTLs are a digitally signed list.

  Their contents are not visible in a GUI but can be listed via certutil commands.

  Additionally, when an application tries to use a certificate that chains to a Root CA listed in the trusted CTL, the respective Root CA certificate is automatically added to the computer Trusted Root CA certificate.

- ##Where are the CTLs retrieved from?

  In the default configuration Windows will attempt to download the CTLs from the Internet via an automatic mechanism called the CTL updater.

  The public URLs used by the CTL updater are: 
 
  http://ctldl.windowsupdate.com/msdownload/update/v3/static/trustedr/en/disallowedcertstl.cab 

  http://ctldl.windowsupdate.com/msdownload/update/v3/static/trustedr/en/authrootstl.cab 

- ##Where are they stored on a device?
 
  The downloaded CTLs are stored on a device in registry under: 
 
  For the untrusted CTL:

  ```
  HKLM:\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\DisallowedCertEncodedCtl
  ```

  For the trusted CTL:

  ```
  HKLM:\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\EncodedCtl
  ```

  Each time each CTL is successfully updated, the time stamp of the update is stored under:	

  For the untrusted CTL:

  ```
  HKLM:\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\DisallowedCertLastSyncTime
  ```

  For the trusted CTL:

  ```
  HKLM:\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\LastSyncTime
  ```

- ##How can we view the contents of the CTL in a GUI?

  **The contents of the CTLs are not visible in a GUI.**

  The contents of the disallowed CTL from a computer can be listed from Windows 8 / Windows Server 2012 or newer by running the command below in an elevated administrative command prompt:

  ```
  certutil -verifyCTL Disallowed > untrusted.txt
  ```

  The contents of the trusted CTL from Windows 8 / Windows Server 2012 or newer can be listed by running the command below in an elevated administrative command prompt:

  ```
  certutil -verifyCTL AuthRoot > trusted.txt
  ```

- ##What if the customer cannot allow Internet access to the public URLs?

  The customer can configure either an internal HTTP or file share to distribute the CTLs

  The CTL location is configured under: 
 
  ```
  HKLM\Software\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\RootDirURL
  ```
 
  We have published sample ADM files for the GPEditor to allow administrators to manage all the auto updater settings via GPO, these are included in the public documentation mentioned in the next section

- ##How often does the CTL updater run?

  The Trusted Root CA CTL updater runs every 7 days

  The Disallowed CTL updater runs every 1 day

- ##Is there any public documentation about the feature?

  The feature is described in the article:

  [Certificates and trust in Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/certificate-trust)

---

# Scoping

**We should never recommend to customers to disable the CTL updater for untrusted CTLs.**

- Schedule a remote session with the customer

- Give the customer the opportunity to describe the issue on their own

- Does the customer experience an issue with getting the CTL updates from the public URLs or from the internal URLs?

    - Are the internal URLs a file share or a web server URL?

    - What are the actual internal URLs that the customer is attempting to use?

- Does the customer want to use the CTL updater just for the disallowed CTLs, or for both the untrusted and trusted CTL? 

# Troubleshooting

## Disallowed updater workflow

Customers attempting to use the automatic update for disallowed certificates often expect that untrusted certificates will be provisioned and visible in the computer untrusted certificate store.

This will not happen because the disallowed CTL is a digitally signed list and not a collection of certificates.

The contents of the disallowed CTL are not visible in a GUI.

The contents of the disallowed CTL from a computer can be listed from Windows 8 / Windows Server 2012 or newer by running the command below in an elevated administrative command prompt:

```
certutil -verifyCTL Disallowed > untrusted.txt
```

---

## Trusted Root CA certificates workflow

Customers attempting to use the automatic update for trusted Root CA certificates, which are members of the Microsoft Root Certificate Program, often expect that all Root CA certificates (currently around 400) will be provisioned immediately in the computer Trusted Root CA certificate store.

This will not immediately happen because a Root CA certificate is added to the computer Trusted Root CA certificate store only when an application tries to use a certificate that chains to a Root CA listed in the trusted CTL.

This workflow is attempting to keep the installed Trusted Root CA certificates to a minimum, because in some TLS server configurations problems can occur with an excessive number of installed Trusted Root CA certificates.

The automatic update for trusted Root CA certificates is a two-stage process:

Stage 1: 
The automatic update downloads the trusted CTL which is a digitally signed list. 

Stage 2: An application attempts tries to use a leaf certificate that chains to a relevant Root CA.
The certificate chaining and revocation engine determines that the relevant Root CA certificate is present on the trusted CTL, and the automatic updater automatically installs the respective Root CA certificate in the computer Trusted Root CA store.

---

## Initial assessment

Before attempting data collection, we need to work with the customer to understand their current CTL updater configuration by exporting the following registry keys and clarifying with them that the current registry values reflect their intended configuration:

```
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\SystemCertificates\AuthRoot\DisableRootAutoUpdate
```

A value of **1 disables** the Windows AutoUpdate of the trusted CTL.

The above registry key will tell us if the automatic updater for trusted Root CA certificates is enabled

---

```
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\SystemCertificates\AuthRoot\EnableDisallowedCertAutoUpdate
```

A value of **1 enables** the Windows AutoUpdate of the untrusted CTL.

The above registry key will tell us if the automatic updater for untrusted Root CA certificates is enabled

---

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\RootDirUrl
``` 

configures the shared location (the HTTP or the FILE path).

---

We should check with the customer that on their internal server hosting the HTTP or FILE path they have successfully ran the command ```Certutil -syncWithWU -f -f folder``` to synchronize the files needed by the automatic updater.

The synchronization of the files must happen from the Internet to the local ```folder``` on their internal server, which is published to client devices from their internal infrastructure as HTTP or FILE path.

In the folder there will be a lot of Root CA certificates and the disallowedcertstl.cab which contains the disallowedcert.stl as well as the authrootstl.cab which contains the authroot.stl

---
## How can we list the contents of the .stl files from the folder?

We need to extract each .stl from the respective .cab and then we can run 

```
certutil disallowedcert.stl > disallowed.txt
```
  
and

```
certutil authroot.stl > authroot.txt
```

- ###Sample disallowed.txt output
```
PKCS7 Message:
CMSG_SIGNED(2)
CMSG_SIGNED_DATA_PKCS_1_5_VERSION(1)
Content Type: 1.3.6.1.4.1.311.10.1 Certificate Trust List
PKCS7 Message Content:
================ Begin Nesting Level 1 ================
Certificate Trust List:
Version: 1
Usage Entries: 1
[0] 1.3.6.1.4.1.311.10.3.30 Disallowed List
List Identifier: "DisallowedCert_AutoUpdate_1"
Sequence Number: 01d71a3617153aff 16/03/2021 08:29
ThisUpdate: 16/03/2021 08:29
NextUpdate: EMPTY
Subject Algorithm:
Algorithm ObjectId: 1.3.6.1.4.1.311.10.11.15 disallowedHash
Algorithm Parameters:*   
05 00
CTL Entries: 74
```
**ThisUpdate** indicates the date when CTL has been issued  
**CTL Entries** indicates the number of entries  

---

- ###Sample authroot.txt output
```
PKCS7 Message:
CMSG_SIGNED(2)
CMSG_SIGNED_DATA_PKCS_1_5_VERSION(1) 
Content Type: 1.3.6.1.4.1.311.10.1 Certificate Trust List
PKCS7 Message Content: 
================ Begin Nesting Level 1 ================
Certificate Trust List:
Version: 1
Usage Entries: 1
[0] 1.3.6.1.4.1.311.10.3.9 Root List Signer 
Sequence Number: 1401d87b065a5612cd
ThisUpdate: 08/06/2022 08:07
NextUpdate: EMPTY
Subject Algorithm:
Algorithm ObjectId: 1.3.14.3.2.26 sha1 (sha1NoSign)
Algorithm Parameters:
05 00  
CTL Entries: 438
```
**ThisUpdate** indicates the date when CTL has been issued  
**CTL Entries** indicates the number of entries

The above outputs will allow us to understand the expected details of the respective CTLs when we examine them from the registry of a device.

---

## How can we check if a device has up to date CTL information?

**We should never recommend to customers to disable the CTL updater for untrusted CTLs.**

We should initially focus to understand if the affected device has up to date untrusted CTL information.

For this we can run 
```
certutil -verifyCTL Disallowed > untrusted.txt
```
on the customers device and compare the output with the *disallowed.txt* output which we had created on our good case reference device

---

- ###Sample untrusted.txt output
```
LastSyncTime = "22/07/2022 17:28"
[DisallowedCTL]
ListIdentifier = "DisallowedCert_AutoUpdate_1"
SequenceNumber = 01d71a3617153aff 16/03/2021 08:29 
ThisUpdate = "16/03/2021 08:29"
NextUpdate = EMPTY
SubjectAlgorithm = 1.3.6.1.4.1.311.10.11.15, "disallowedHash"
Extensions: 0
ERROR = "Strong signatures: 0"
SignerExpiration = "02/12/2021 22:25", "-231.8 Days"
ERROR = "A required certificate is not within its validity period when verifying against the current system clock or the timestamp in the signed file. 0x800b0101  (-2146762495 CERT_E_EXPIRED)", "SignerExpiration"
CTLEntries = 74
```

**LastSyncTime**  indicates the time and date when the updater for untrusted CTL has run

**LastSyncTime**  indicates the date when CTL has been issued  

**CTL Entries:** indicates the number of entries

---

If the customer also would like to use the automatic updater for trusted certificates, we can run 
```
certutil -verifyCTL AuthRoot > trusted.txt
```
and compare the output with the *authroot.txt* output which we had created on our good case reference device

- ###Sample trusted.txt output

```
LastSyncTime = "22/07/2022 12:28"  
[AuthRootCTL]  
SequenceNumber = 1401d87b065a5612cd  
ThisUpdate = "08/06/2022 08:07"
NextUpdate = EMPTY  
SubjectAlgorithm = 1.3.14.3.2.26, "sha1"  
Extensions: 0  
ERROR = "Strong signatures: 0"  
SignerExpiration = "01/09/2022 19:22", "41.1 Days"  
WARNING = "SignerExpiration: Less than 180 Days"  
CTLEntries = 438
```
**LastSyncTime** indicates the time and date when the updater for trusted CTL has run

**LastSyncTime** indicates the date when CTL has been issued

**CTL Entries:** indicates the number of entries

---

If the current registry configuration reflects their intended configuration and the internal server hosting the HTTP or FILE path has the files needed by the automatic updater, but the output of *certutil -verifyCTL Disallowed > untrusted.txt* indicates that the untrusted CTL is not updated or the output of *certutil -verifyCTL AuthRoot > trusted.txt* indicates that the trusted CTL is not updated, we can proceed to the data collection action plan.

Usually once we get the updater for the disallowed CTL to work, the allowed CTL updater will also function as expected. Therefore, our main effort will be to get the disallowed CTL updater to work.

Therefore, our main effort will be to get the disallowed CTL updater to work.

---

# Data collection

All commands below should be run in an administrative command prompt.

## Use TSS syntax

Accessthe**latest version** of the **TSS scripts** from [here](http://aka.ms/gettss)

Start TSS trace:

```
.\TSS.ps1 -Start -ADS_AUTH -procmon -NetshScenario NetConnection -startnowait
```

Wait for the TSS trace to start then trigger the disallowed CTL updater by running:
 
```
certutil -verifystore root
```
 
Wait 30 seconds

Stop TSS trace:

```
.\TSS.ps1 -Stop
```

Export relevant registry keys:

```
Reg query HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\ /s > authroot-machine.txt
Reg query HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\SystemCertificates\AuthRoot /s > authroot-policy.txt
```

Run the command below to list the current contents of the local untrusted CTL:

```
certutil -verifyCTL Disallowed > untrusted.txt
```

## If TSS doesnt work

Get the data set docummented below:

Download Process Monitor

Enable CAPI2 logging: 

```
wevtutil.exe set-log Microsoft-Windows-CAPI2/Operational /enabled:true
wevtutil.exe clear-log Microsoft-Windows-CAPI2/Operational
wevtutil.exe sl Microsoft-Windows-CAPI2/Operational /ms:102400000
```
 
Start network trace with WinHTTP debug logging:
 
```
netsh trace start NetConnection capture=yes maxsize=400 traceFile=c:\%computername%_cap.etl
```
 
Start a process monitor trace

Trigger the disallowed CTL updater by running:
 
```
certutil -verifystore root
```
 
Wait 30 seconds

Stop the process monitor trace and save the output as .pml
 
Stop the network trace by running:
 
```
netsh trace stop
```
 
Stop and export CAPI2 log by running:
 
```
wevtutil.exe set-log Microsoft-Windows-CAPI2/Operational /enabled:false
wevtutil.exe export-log Microsoft-Windows-CAPI2/Operational c:\capi2.evtx /overwrite:true
```
 
Export the relevant registry keys:

```
Reg query HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\ /s > authroot-machine.txt
Reg query HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\SystemCertificates\AuthRoot /s > authroot-policy.txt
```

Run the command below to list the current contents of the local untrusted CTL:

```
certutil -verifyCTL Disallowed > untrusted.txt
```

Collect all the output files

# Data analysis

First check the *untrusted.txt* to see if the customers device has an untrusted CTL and if so, from which date.

Usually, the main issue is connectivity or authentication of the device to the internal HTTP or FILE server.

The network trace and CAPI2 will provide valuable information about this.

Process monitor will indicate if there are any issues accessing the relevant registry keys.

# More information

The following workflow provides details about a scenario where the Certificate Root Update Program is relevant:
["Microsoft Root Authority" certificate showing Revoked](/PKI-%2D-AD-Certificate-Services/Step-by-Step-Guides/"Microsoft-Root-Authority"-certificate-showing-Revoked)
