---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Server/Workflow: PKI Server: Certification Authority"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Server/Workflow%3A%20PKI%20Server%3A%20Certification%20Authority"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414074&Instance=414074&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414074&Instance=414074&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Active Directory Certificate Services (ADCS)

#Summary
This guide provides a comprehensive overview of troubleshooting and resolving issues related to Active Directory Certificate Services (ADCS). It includes scoping questions, common issues, data gathering methods, and training resources for support engineers.

# Scoping

- Schedule a remote session with the customer.
- Give the customer the opportunity to describe the issue on their own.
- The more information, the better.
- This guide does not include every question that should be asked; it is only a starting point that ideally generates more questions.
- Is this a public key infrastructure (PKI) client or a PKI server issue? Refer to the support topic description to determine the component class.

## General questions

- What is the customer's description of the problem?
- What error messages, if any, are displayed?
- Is the issue sporadic or can it be easily reproduced?
- Is the server virtualized (Hyper-V, VMWare)?
- What is the server operating system (OS) version and service pack level?
- Is this a setup or configuration issue?
- Has this ever worked?
- How many computers are affected?
- What has changed in the environment (recent updates to operating systems, group policy, certificate authority (CA) renewals, networking changes, certificate renewals)?

## Certification Authority (CA) specific questions

- Is this a new or existing installation?
- Are you using a Microsoft CA or a third-party CA?
- What is the Certificate Authority type (enterprise, standard)?
- What is the CA type of all CAs in the hierarchy (online root, offline root, enterprise issuing, policy CA)?
- Is your CA clustered?
- Does the CA use a hardware storage module (HSM)?
- Is Forefront Identity Manager Certificate Manager (FIM CM) installed on the CA?

# Documentation

[Windows PKI Documentation Reference and Library](https://social.technet.microsoft.com/wiki/contents/articles/987.windows-pki-documentation-reference-and-library.aspx)

[PKI Design Considerations: Certificate Revocation and CRL Publishing Strategies](https://learn.microsoft.com/en-us/archive/blogs/xdot509/pki-design-considerations-certificate-revocation-and-crl-publishing-strategies)

[Designing and Implementing a PKI: Part II Implementation Phases and Certificate Authority Installation](https://learn.microsoft.com/en-us/archive/blogs/askds/designing-and-implementing-a-pki-part-ii-implementation-phases-and-certificate-authority-installation)

[AD CS Migration: Migrating the Certification Authority](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ee126140(v=ws.10))

[Performing Post-Upgrade or Post-Migration Tasks](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc742471(v=ws.10))

# Common issues

Resources and information to help troubleshoot common issues with Certification Authority.

[Unable to Revoke Issued certificate from Enterprise CA console or CMD](https://internal.evergreen.microsoft.com/en-us/topic/0b27bc22-c224-4f9f-23ac-0bcc5a42a750)

Unable to renew CA certificate with the same key pair.

[Unable to Renew CA certificate when using KSP Provider](https://internal.evergreen.microsoft.com/en-us/topic/a29f5c2e-74ce-e0fe-8bd4-f0339c0c2468)

## CA service cannot start

This problem is usually caused by either failed verification of the CA certificate (the CA service verifies its own certificates during the start phase) or by missing keys of the CA certificates. Here are further details:

### CA certificate validation issues

If you see Event ID 48 in the CA Application log, for example:

*"Revocation status for a certificate in the chain for CA certificate 0 for <CA Name> could not be verified because a server is currently unavailable. The revocation function was unable to check revocation because the revocation server was offline. 0x80092013 (-2146885613)."*

and Event ID 7024 in the System Event Log

*"The Certificate Services service terminated with service-specific error 2148081683 (0x80092013)." the problem is during validation of the CA certificate.*

CAPI2 logging is the best tool for troubleshooting this issue, and the focus should be set to the error "Build Chain" event (it corresponds to the CertGetCertificateChain function). This event will show the certificate chain and identify which part of the chain is causing revocation problems. Most likely, one of the CAs higher in the PKI hierarchy failed to issue a certificate revocation list (CRL) or publishing of the CRL (in some cases, manual action is required) was not performed.

A temporary workaround for this problem is to run this command on the CA:

```
certutil -setreg ca\CRLFlags +CRLF_REVCHECK_IGNORE_OFFLINE
```

This command will ignore the unknown revocation status of the CA certificate, and the CA will start.

However, this should be considered a temporary workaround, and you will need to fix CRL unavailable problems (as described above, using the CAPI2 log).

To re-enable the CRL check at CA service start, run:

```
certutil -setreg ca\CRLFlags -CRLF_REVCHECK_IGNORE_OFFLINE
```

And restart the CA service by running:

```
net stop certsvc && net start certsvc
```

### Missing CA keys

If you see *Keyset does not exist 0x80090016 (-2146893802 NTE_BAD_KEYSET)* after a failed attempt to start the CA service, the issue is related to accessing the CA keys.

This can be confirmed by running the following two commands:

```
certutil -v -store my > computerstore.txt
certutil -v -verifykeys > verifykeys.txt
```

You should see "missing stored keyset" in the outputs.

```
certutil -v -store my
```

This will tell you further if the CA keys are stored in software-based CSP/KSP or on HSM.

- For software-based keys, you can identify the physical location of the key in the file system (for example, `Key Container = te-ae36bd7e-931d-4aae-b4a8-893df16651c1`). The key is usually stored in `C:\ProgramData\Microsoft\Crypto\Keys`. If not, use procmon to get the exact location.
- For HSM keys, the customer should involve the HSM vendor.

In some cases, a link between the CA certificate and the corresponding key could get broken. To solve this issue, use the `certutil -repairstore` command.

In order to start, the CA service must verify all CA certificates ever used by this CA (think about CA certificate renewals). Thumbprints of those certificates are listed in the `CACertHash` registry key (in `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration\<CA_Name>`). If the key of one of the previously used CA certificates is missing, the CA will also fail to start. You can work around this problem by replacing the thumbprint of the problematic CA certificate with `-`.

:memo:**Note:** Please use this option as the last option for solving this issue and only after the customer makes a backup of the registry hive. This option should not be used for thumbprints corresponding to certificates that are still valid.

### Cluster CA not starting due to RestoreInProgress registry key 
[Active Directory Certificate Services (AD CS) Clustering | Microsoft Learn](https://learn.microsoft.com/en-us/archive/technet-wiki/9256.active-directory-certificate-services-ad-cs-clustering#event-id-17)

**Active Directory Certificate Services fails to start and the event log shows Event ID 17  CertificationAuthority.**
This error can be caused when the ADCS database is marked for restore operations. Verify that the**RestoreInProgress**does not exist in the Registry Key HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration. If it does, note the cluster node owning the ADCS resource in the Cluster Administrator tool, remove the**RestoreInProgress**key on the node owning the service, and restart the cluster ADCS resource.

## Hard disk, where CA database is stored, is full

## CA host hardware needs to be replaced

You will need to move the CA from one machine to another.

AD CS backup consists of ADCS database, ADCS certificates and keys, configuration information in the registry `HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration`, CA Policy.inf, and a list of published templates.

The backup and recovery procedure matches the AD CS migration procedure [Active Directory Certificate Services Migration Guide](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ee126170(v=ws.10)).

Note that the host computer name (FQDN or NetBIOS name) does not have to match that of the original CA's host computer name. The migration is, however, simplified if they do.

But the destination CA name must match that of the source CA name.

The destination CA name must not be identical to the destination computer name.

## CA is down and cannot issue new CRLs for the foreseeable future

In some cases, you will need more time to fix the CA, and during that time, PKI-dependent apps must be able to complete revocation checks. For this situation, there are two options to provide temporary relief. Note: this approach should be considered a temporary workaround.

### Access to CA certificate and keys works

Use `certutil -v -store my` to confirm.

Scenario: AD CS is down and cannot sign new CRLs for a longer period of time.

Goal: Minimize impact on PKI-enabled apps that depend on valid revocation information.

Solution: Create and sign a new CRL using the `certutil sign` command.

Requirements: access to all the existing AD CS certificates and private keys and the current CRLs for each private key.

### CA keys are not accessible

Using Group Policy Object (GPO), it is possible to instruct clients to extend the validity of revocation information.

GPO > Computer Configuration > Policies > Windows Settings > Security Settings > Public Key Policies > Certificate Path Validation Settings > Revocation (tab) > Allow CRL and OCSP responses to be valid longer than their lifetime (not recommended).

Use this method if CA keys are not accessible.

# Data gathering

Troubleshooting methodology and what type of data to collect.

Step-by-step instructions to troubleshoot issues and collect the data needed to resolve issues with this technology.

Data collection can be simplified using TTS.

To start data collection, run the following command in an administrative PowerShell:

```
.\TSS.ps1 -ADS_ADCS -noBasicLog
```

Reproduce the issue.

Follow the on-screen instructions to stop the trace.

If manual collection is needed, depending upon the scenario, a combination of the following will be necessary:

## Application Event Log and System Event Log

By default, only errors will be logged in the application event log. For more verbose logging (warning and information), use the following command:

```
certutil.exe -f -setreg ca\loglevel 5
```

## Outputs of the following two certutil commands executed on the CA server

```
certutil -v -store my > computerstore.txt
certutil -v -verifykeys > verifykeys.txt
```

## Certificate Services Debug Logging

Enable CA debug logging:

```
certutil.exe -f -setreg ca\debug 0xffffffe3
```

CA Service must be restarted after running the above command.

This can be done by running:

```
net stop certsvc && net start certsvc
```

:memo:**Note:**
If after running the command above and restarting the CA service, the `%SystemRoot%\certsrv.log` is not created or updated, we should also try running the command `certutil -f -setreg debug 0xffffffe3` and restarting the CA service by running 
`net stop certsvc && net start certsvc`.

If this works, CA debug logging can be disabled by running `certutil -f -setreg debug 0x0` and restarting the CA service by running `net stop certsvc && net start certsvc`.

To disable CA debug logging, run:

```
certutil.exe -f -setreg ca\debug 0x0
```

And restart the CA service by running:

```
net stop certsvc && net start certsvc
```

## Relevant logs

CA service log (This is the main source of information for CA server problems.)
```
%SystemRoot%\certsrv.log
```

Certificate Enroll log (This is the main source of information for PKI client enrollment issues.)

```
%SystemRoot%\certenroll.log
```

Certutil log (This is the main source of information for certutil errors.)

```
%SystemRoot%\certutil.log
```

CA Setup log (This is the main source of information for CA setup issues.)

```
%SystemRoot%\certocm.log
```


## CA service registry export

Value path: 
```
HKLM\SYSTEM\CurrentControlSet\Services\Certsvc\Configuration\
```
You can get the CA registry configuration in text format using the command:

```
certutil -getreg CA >CA-reg.txt
```

## CAPI2 logging

[CAPI2 overview](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-vista/cc749296(v=ws.10)?redirectedfrom=MSDN#capi2-overview)

[Enabling and Saving the CAPI2 Log](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-vista/cc749296(v=ws.10)?redirectedfrom=MSDN#enabling-and-saving-the-capi2-log)

## If the issue can be easily reproduced in a short time frame

Collect also a Process Monitor trace while reproducing the issue.

# Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn public key infrastructure topics and then test their knowledge.

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the Certification Authority topic:

- M04 - Implementation, Feature Timeline, and Certificate Management Solutions - Slide Deck
- M04 - Implementation, Feature Timeline, and Certificate Management Solutions - Recording
- M05 - Certificate Authority and Hierarchy - Slide Deck
- M05 - Certificate Authority and Hierarchy - Recording
- M06 - Certificate Templates and Enrollment - Slide Deck
- M06 - Certificate Templates and Enrollment - Recording
- L05.1 - Install Standalone Root CA - Lab Guide
- L05.2 - Install Enterprise CA - Lab Guide
- L09.4 - AD CS Disaster Recovery - Lab Guide

**PKI Advanced** contains the following relevant modules for the Certification Authority topic:

- M01 - Introduction - Slide Deck
- M01 - Introduction - Recording
- L01 - PKI Introduction - Lab Guide

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.

**Additional training content:**

[Common troubleshooting scenarios for a 2 tier PKI](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2FADDS%20%2D%20PKI%20%2D%20Common%20troubleshooting%20scenarios%20for%202%20tier%20PKI%2Emp4)

[PKI: extensions, constraints, and CA Policy](https://microsoftapc.sharepoint.com/teams/InShorts/_layouts/15/stream.aspx?id=%2Fteams%2FInShorts%2FInShorts4DS%2F67InShorts4DS%20with%20Hamzeh%2DPKI%20extension%2C%20Constraints%20and%20CA%20Policy%2Emp4)

[PKI - Introduction to lab setup](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2FADDS%20%2D%20PKI%20%2D%20Introduction%20to%202%20Tier%20PKI%20Lab%20Setup%2Emp4)

[Cluster CA Setup and Certificate Renewal](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20%2D%20Temporary%2FPKI%2FADDS%20%2D%20PKI%20%2D%20Cluster%20CA%20Setup%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E11d1766a%2D61e3%2D4479%2D8b5e%2D7a4e2052b8c7)
