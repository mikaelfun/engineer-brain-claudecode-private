---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Encrypted File System (EFS) and Personal Data Encryption (PDE)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Encrypted%20File%20System%20%28EFS%29%20and%20Personal%20Data%20Encryption%20%28PDE%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414080&Instance=414080&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414080&Instance=414080&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Windows V3\Certificates and Public Key Infrastructure\Encrypting File System (EFS)

#Summary
This document provides a comprehensive guide to troubleshooting and managing Encrypting File System (EFS) in Windows V3, including initial assessments, data collection, and training resources and basic concept about Personal Data Encryption (PDE).

# Documentation

[Troubleshooting EFS](http://technet.microsoft.com/en-us/library/cc962106.aspx)

[The Encrypting File System](http://technet.microsoft.com/en-us/library/cc700811.aspx)  

[Chapter 3: Encrypting File System | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions//cc162818(v=technet.10))

[Create and verify an Encrypting File System (EFS) Data Recovery Agent (DRA) certificate](https://learn.microsoft.com/en-us/windows/security/information-protection/windows-information-protection/create-and-verify-an-efs-dra-certificate)

[Protecting Data by Using EFS to Encrypt Hard Drives](https://learn.microsoft.com/en-us/previous-versions/tn-archive/cc875821(v=technet.10))

# Scoping questions 

**Important:** All EFS encryption and decryption operations happen locally on the machine where the EFS encrypted files are located 

- Schedule a remote session with the customer
- Give the customer the opportunity to describe the issue on their own
- What is the operating system version of the machine hosting the EFS encrypted files?
- Are the EFS certificates self-signed or issued by a certification authority?
- If they are issued by a certification authority, is key archival enabled on the CA? 
- Is there an EFS Data Recovery Agent defined for the environment? 
- Give us a few examples of file names that are EFS encrypted and that we have problems with 
- What is the actual error message? 

#Initial assessment

While we are logged in as the user who cannot access EFS encrypted files run: 

```
cipher /c encrypted_file_name > efsinfo.txt
```

We expect the following output in the efsinfo.txt file: 

```
Users who can decrypt:

Certificate thumbprint: ABCDEFG

Recovery Certificates:

Certificate thumbprint: ZZZZZZZ
```

- Does the customer have the PFX file for the recovery certificates thumbprint ```ZZZZZZZ``` listed above? If so, they can use the recovery certificate PFX to try to decrypt the user's data. 

We also want to understand what certificates are available in the user certificate store, what is their status (do they pass the encryption test?) and if we have any certificate with a thumbprint ABCDEFG matching the output above 

```
certutil -v -store -user my > user.txt
```

- If the customer has PFX backup file for the user certificate with thumbprint ```ABCDEFG```, they can use the user's certificate PFX to decrypt the user's data.

# Data collection 

Start tracing:

```
.\TSS.ps1 -Scenario ADS_BASIC -procmon -NetshScenario NetConnection -startnowait
```

Reproduce the issue

Stop tracing:

```
.\TSS.ps1 -Stop
```

# Personal Data Encryption (PDE)
Starting in Windows 11, version 24H2, Personal Data Encryption is a security feature that provides file-based data encryption capabilities to Windows.
Personal Data Encryption utilizes Windows Hello for Business to link_data encryption keys_with user credentials. When a user signs in to a device using Windows Hello for Business, decryption keys are released, and encrypted data is accessible to the user.  
When a user logs off, decryption keys are discarded and data is inaccessible, even if another user signs into the device.
The use of Windows Hello for Business offers the following advantages:
- It reduces the number of credentials to access encrypted content: users only need to sign-in with Windows Hello for Business
- The accessibility features available when using Windows Hello for Business extend to Personal Data Encryption protected content
Personal Data Encryption differs from BitLocker in that it encrypts files instead of whole volumes and disks. Personal Data Encryption occurs in addition to other encryption methods such as BitLocker.  
Unlike BitLocker that releases data encryption keys at boot, Personal Data Encryption doesn't release data encryption keys until a user signs in using Windows Hello for Business.

[Personal Data Encryption (PDE) MSIT Selfhost - OSGWiki](https://www.osgwiki.com/wiki/Personal_Data_Encryption_(PDE)_MSIT_Selfhost)

[Windows: Introduction to Personal Data Encryption(PDE) feature](https://internal.evergreen.microsoft.com/en-us/topic/5a191f13-1fe0-5d0d-4dcb-a97643374c1a)

[Personal Data Encryption | Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/personal-data-encryption/)

[Personal Data Encryption folder protection now available - Windows IT Pro Blog](https://techcommunity.microsoft.com/blog/windows-itpro-blog/personal-data-encryption-folder-protection-now-available/4358947)

[Section 7 from Introducing Windows 11, version 24H2 | QA Platform](https://platform.qa.com/resource/introducing-windows-11-version-24h2-1854/?context_id=15134&context_resource=lp)

#PDE Troubleshooting

[Windows Security Technologies: How To Troubleshoot PDE (Personal Data Encryption)](https://internal.evergreen.microsoft.com/en-us/topic/72ad708e-4223-1077-dff6-8d4808b263cd)

# Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the EFS topic:

- M09 - SChannel & LDAPS_EFS - Slide Deck
- M09 - SChannel & LDAPS_EFS - Recording
- L09.2 - EFS - Lab Guide

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.
</br>

**Additional training content:**

[ADDS: PKI: EFS decryption fails when using EFS certificates with ECC keys](https://internal.evergreen.microsoft.com/en-us/topic/53381928-c05c-9c37-3141-0b0811f9af6a)
