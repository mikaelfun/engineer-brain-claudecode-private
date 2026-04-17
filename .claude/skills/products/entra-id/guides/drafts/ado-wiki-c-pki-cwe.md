---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Server/Workflow: PKI Server: Certification Authority Web Enrollment Pages (CWE)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Server/Workflow%3A%20PKI%20Server%3A%20Certification%20Authority%20Web%20Enrollment%20Pages%20%28CWE%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414014&Instance=414014&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414014&Instance=414014&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Certificate web enrollment pages (CWE)

#Summary
This article provides a comprehensive guide on routing Windows V3 certificates and public key infrastructure, specifically focusing on Certificate Web Enrollment (CWE) pages. It includes steps for documentation, troubleshooting, data collection, and training, ensuring users can effectively manage certificate requests.

# Overview

Important: Not to be confused with Certificate Enrollment Web Services (CEP/CES).

CWE's URL is `https://CWE.contoso.com/certsrv` and it is accessed directly via Internet Explorer.

CWE offers an HTTPS page to which a user can connect via Internet Explorer to request certificates.

CWE will present a list of available templates for the user.

CWE will then act as an enrollment proxy and send the user's request to the Certificate Authority (CA) which will process it.

CEP CES is accessed via Microsoft Management Console (MMC) and not directly via Internet Explorer.

# Documentation

[How to use Certificate Services Web enrollment pages together with Windows Vista or Windows Server 2008](https://support.microsoft.com/en-gb/topic/how-to-use-certificate-services-web-enrollment-pages-together-with-windows-vista-or-windows-server-2008-5c90d10b-ce1b-c966-e6fc-dafa1c919447)

# Internet Explorer support lifecycle and CA web enrollment

With the [Internet Explorer lifecycle](https://learn.microsoft.com/en-us/lifecycle/products/internet-explorer-11) removing support for IE 11 for an increasing number of Windows versions, customers might not even have IE 11 available on their devices.

When this happens, we must use Edge with IE mode to access the CWE web page. Edge IE mode enables backward compatibility and will be supported through at least 2029, as per the [Internet Explorer lifecycle](https://learn.microsoft.com/en-us/lifecycle/products/internet-explorer-11).

Customers can use the information from [Internet Explorer mode (IE mode)](https://www.microsoft.com/en-us/edge/business/ie-mode?form=MA13FJ) to set up Edge with IE mode. If customers need assistance setting up Edge with IE mode in the specifics of their environment, we should engage the Edge support team via a collaboration task to assist the customer with the Edge configuration.

If the customer is using a Windows version where IE 11 is still supported, we should use IE 11 to access the CWE page. For a list of the Windows versions on which IE 11 is still supported, check [Lifecycle FAQ - Internet Explorer and Microsoft Edge](https://learn.microsoft.com/en-us/lifecycle/faq/internet-explorer-microsoft-edge#what-is-the-lifecycle-policy-for-internet-explorer-).

# TLS 1.0 and TLS 1.1 are disabled by default on IE 11, Edge, and Edge IE mode on September 2022 and newer Windows updates

[Servicing: 9C.22: TLS 1.0/ TLS 1.1 disabled by default on IE 11, EdgeHTML, and IE mode on September 2022 and newer Windows updates](https://internal.evergreen.microsoft.com/en-us/topic/2984a3e1-9a82-49d6-93e9-b52e4f9f66da)

# Scoping

- Schedule a remote session with the customer.
- Give the customer the opportunity to describe the issue on their own.
- Do we have only one CWE server or do we have multiple CWE servers set up in a Network Load Balancing (NLB) cluster?
- Is CWE set up with a service account or is it using the default installation options?
- Can we reproduce the error from a client machine with a regular user account? Many customers attempt to enroll with an administrative account from the CWE server itself, which often complicates troubleshooting.
- Can we reproduce the error from Internet Explorer? Many customers attempt to enroll from Chrome or Firefox, and these have not been tested to work with CWE.
- At which step in the request workflow do we see an error? For example, when just accessing the enrollment page, when trying to see the available templates, when submitting the request, or when retrieving the certificate?
- Did this ever work? If so, what has recently changed?

# Troubleshooting

On the client, in Internet Explorer make sure that the following configuration options are present:

1. Add the HTTPS CWE website to the local intranet zone (IE menu -> Internet Options -> Security tab -> Local Intranet).
2. Enable Initialize and script ActiveX controls not marked as safe for scripting for the Local intranet zone.

![Internet Option Control Panel Setting for Certification Authority Web Enrollment Pages](/.attachments/PKI/Workflow_PKI_Server_Certification_Authority_Web_Enrollment_Pages_CWE.png)

From the client, attempt to connect to the default IIS web page, for example, `https://CWE.contoso.com`.

The expected result is to be able to see the IIS logo.

If this fails, this is part of the problem and needs to be fixed before proceeding to any other steps.

This can, for example, fail because of an SSL/TLS handshake error between the client and CWE or customization of the IIS security options on the CWE side.

Access to the CWE page `https://CWE.contoso.com/certsrv` will not work if access to the default IIS page `https://CWE.contoso.com` fails.

# Data collection

If we are not able to connect to `https://CWE.contoso.com/certsrv`, collect data just from the client and CWE server.

If we are able to connect to `https://CWE.contoso.com/certsrv` and see the initial enrollment web page, we will collect data from three machines: client machine, CWE server, and CA.

The usual issues that we see with CWE are either SSL/TLS handshake errors between client and CWE or authentication issues either between client and CWE, CWE to Active Directory Domain Services (AD DS), or CWE to the CA.

We will generally want to collect the Authentication Scripts for network and authentication-related data, together with client and CA certificate enrollment/component debug logging.

- On the client machine

  Start the Authentication scripts in an elevated command prompt.

  All traffic between the client machine and CWE will be over HTTPS and encrypted.

  If we have an authentication issue between the client and CWE, this will be relevant.

  If the HTTPS handshake between the client and CWE fails, this data will be useful.

  To enable client enrollment logging:

  ```
  Certutil -setreg enroll\debug 0xffffffe3
  ```

- On the CWE server

  :memo:**Note:** if there are multiple CWEs in an NLB, collect the logs from all the CWEs

  Start the Authentication scripts in an elevated command prompt.

  All traffic between the client machine and CWE will be over HTTPS and encrypted.

  If we have an authentication issue between the client and CWE, this will be relevant.

  If the HTTPS handshake between the client and CWE fails, this data will be useful.

  Any HTTPS handshake issues between CWE and client will be captured in the authentication scripts.

  We want to see the CWE server's interaction with the Domain Controller and the CA.

- On the CA:

  Enable CA debug logging:

  ```
  Certutil -f -setreg debug 0xffffffff
  Certutil -setreg CA\Debug 0xffffffe3
  Certutil -setreg CA\LogLevel 4
  Net stop certsvc && net start certsvc
  ```

  We also want to see the CA's interaction with the CWE server and the Domain Controller.

  Start the Authentication scripts in an elevated command prompt.

---

Reproduce the issue.

---

Stop the logs after the issue has occurred.

- Client machine:

  Stop the Authentication scripts from an elevated command prompt.

  This will generate and compile and gather numerous files in a directory called `Authlogs` under the directory where we ran the scripts from.

  To disable client enrollment logging, run the following command from an elevated command prompt:

  ```
  Certutil -setreg enroll\debug 0x0
  ```

  Collect logs in `C:\Windows\cert*.log`.

- CWE server:

  (Note: if there are multiple CWEs in an NLB, collect the logs from all the CWEs):

  Stop the Authentication scripts from an elevated command prompt.

  This will generate and compile and gather numerous files in a directory called `Authlogs` under the directory where we ran the scripts from.

- On the CA:

  Disable CA debug logging:

  ```
  Certutil -delreg debug
  Certutil -delreg CA\Debug
  Certutil -setreg CA\LogLevel 3
  Net stop certsvc && net start certsvc
  ```

  Collect logs in `C:\Windows\cert*.log`.

  Stop the Authentication scripts from an elevated command prompt.

  This will generate and compile and gather numerous files in a directory called `Authlogs` under the directory where we ran the scripts from.

# Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge.

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the CA Web Enrollment topic:

- M06 - Certificate Templates and Enrollment - Slide Deck
- M06 - Certificate Templates and Enrollment - Recording
- L06.2 - Configure CA for HTTPS Web Enrollment - Lab Guide

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.
