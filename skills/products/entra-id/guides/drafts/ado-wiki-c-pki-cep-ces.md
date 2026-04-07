---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Server/Workflow: PKI Server: Certificate Enrollment Web Services (CEP | CES)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Server/Workflow%3A%20PKI%20Server%3A%20Certificate%20Enrollment%20Web%20Services%20%28CEP%20%7C%20CES%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414018&Instance=414018&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414018&Instance=414018&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:**
Routing Windows V3\Certificates and Public Key Infrastructure\Certificate web enrollment pages (CWE) 

#Summary
This document provides an in-depth guide on troubleshooting and resolving issues related to Certificate Enrollment Web Services in Active Directory Certificate Services. It includes steps for scoping, data collection, and debugging, along with known issues and training resources.

# Overview

Certificate web enrollment pages comprise:
- Certificate Enrollment Web Service (CES)
- Certificate Enrollment Policy Web Service (CEP)

# Documentation 

Please make sure to consult the CEP/CES Wiki article on Technet, a very detailed reference article that also covers data collection suggestions for various scenarios including the machine that is attempting the enrollment and the Certification Authority (CA): 

[Certificate Enrollment Web Services in Active Directory Certificate Services](https://social.technet.microsoft.com/wiki/contents/articles/7734.certificate-enrollment-web-services-in-active-directory-certificate-services.aspx)

# Scoping

- Schedule a remote session with the customer.
- Give the customer the opportunity to describe the issue on their own.
- What is the error message and where is it logged?
- Is the error experienced at the step where the list of available templates is gathered or is the error experienced when attempting to submit a certificate request?
- Are CEP and CES installed on the same server?
- What forest/domain do the servers belong to?
- What is the name and domain of the service account for CEP?
- What are the delegation settings for the CEP account?
- What is the name and domain of the service account for CES?
- What are the delegation settings for the CES account?
- Are the CEP/CES servers, CA, service accounts, and the security principals requesting certificates from the same domain/forest?
- If this is a cross-forest scenario, is a forest trust in place?
- What is the OS version of the CA?
- Which authentication method is supposed to be used for the enrollment: username and password, Kerberos, or certificate-based authentication?
- What is the OS version of the client machine that will use CEP/CES?
- What is the forest/domain/workgroup of the client machine that will use CEP/CES?
- Does the client machine have an account in Active Directory Domain Services (AD DS)? What is the account name and in which forest/domain does it belong?
- Do the users requesting certificates via CEP/CES have an account in AD DS? What is the account name and in which forest/domain does it belong?

CEP/CES is a very complex product, and before gathering data, we should try to narrow down from the symptoms if the error might be related to authentication, TLS communications, or RPC/DCOM errors.

- Are you configuring a new CEP/CES server, or troubleshooting an existing installation?
- What OS is running on the client computers?
- Are the enrolling clients in the same forest as the CA?
- Are the enrolling clients in a different forest from the CA?
- Are the enrolling clients non-domain joined?
- Has the CES server been configured for renewal only?

# Prepare for data collection

Run `certutil -v -CA > Output.txt` before and after reproducing the issue to see the available CAs and their configured templates, enrollment policy servers (CEP), enrollment web servers (CES), and authentication methods.

Prior to reproducing the issue, clear the enrollment policy cache on the client machine by deleting any files under `%ProgramData%\Microsoft\Windows\X509Enrollment\` (for the enrollment cache of the machine) or `%USERPROFILE%\AppData\Local\Microsoft\Windows\X509Enrollment` (for the enrollment cache of the user).

# Initial data collection 

An effective approach to troubleshooting issues with CEP/CES enrollment is to simultaneously collect the authentication scripts detailed in:

[ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity and related scenarios](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9)

on the following machines:
- the enrolling client
- the CEP/CES server(s)
- the CA
- if possible, the authenticating Domain Controller(s) (DCs)

together with additional tracing and logging while reproducing the manual enrollment or auto-enrollment attempt on the client.

Successful collection of this data will allow you to verify the authentication flow, how the client authenticates to CES, whether the CES is able to request authentication to the CA on behalf of the user, and what network traffic is flowing or being restricted between all relevant endpoints.

:memo:**NOTE:** The authentication scripts will also automate the collection of a network trace on each machine while reproducing your issue.

:memo:**NOTE:** On the workflow landing page, you can find the authentication, CA, client enrollment, and CEP/CES tracing scripts to automate most of the data collection steps below.

# CEP CES debug logging and CA debug logging

The instructions within this section are NOT included in the authentication scripts.

These instructions require manual setup and are usually useful after the authentication scripts have been analyzed.

Here follows a detailed action plan to gather logging and tracing on the relevant endpoints:

- On the CA:

Enable CA debug logging:
```
certutil -f -setreg debug 0xffffffff
certutil -setreg CA\Debug 0xffffffe3
certutil -setreg CA\LogLevel 4
Net stop certsvc && net start certsvc
```

- On the CEP/CES Server:

Open Event Viewer and make sure that event logging is enabled for both CEP and CES under:

Event Viewer > Application and Services Logs > Microsoft > Windows > EnrollmentPolicyWebService > Admin

Event Viewer > Application and Services Logs > Microsoft > Windows > EnrollmentWebService > Admin

Make sure to increase the maximum log size to at least 10048 KB (10 MB).

To enable advanced diagnostics for CEP or CES, we need to modify the `Web.Config` files corresponding to each of the application pools.

For CEP, we will have a `web.config` file under each of the following folders, corresponding to each of the authentication methods:

```
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_UsernamePassword\Traces
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_Kerberos\Traces
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_Certificate\Traces
```

For each authentication method we want to troubleshoot, under:
```
<system.diagnostics>
<sources>
```
for each of the sources, replace the value of Off with "Verbose".

![screenshot of Certificate Enrollment Web Services CEP CES Web.config file](/.attachments/PKI/Workflow_PKI_Server_Certificate_Enrollment_Web_Services_CEP_CES.GIF)

In the same file, we can also increase the event log level to verbose by adding the following line under `<appsettings>`: 

```
<add key="LogLevel" value="4" />
```

For CES, we will edit the same sections of the Web.config file under each of the following folders, corresponding to each of the authentication methods:

```
C:\Windows\SystemData\CES\EntCA_CES_UsernamePassword
C:\Windows\SystemData\CES\EntCA_CES_Kerberos
C:\Windows\SystemData\CES\EntCA_CES_Certificate
```

To enable ETL tracing for CEP/CES:

On the server, from an elevated command prompt, run the following commands:

```
logman create trace "cepces" -ow -o c:\cepces.etl -p "Microsoft-Windows-EnrollmentPolicyWebService" 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
logman update trace "cepces" -p "Microsoft-Windows-EnrollmentWebService" 0xffffffffffffffff 0xff -ets
```

Commit CEP/CES Trace log entries into XML log files by running the following command from an elevated command prompt:

```
Iisreset
```

- On the Client:

To enable client enrollment logging, from an elevated command prompt run the following command:

```
Certutil -setreg enroll\debug 0xffffffe3
```

After enabling all of the above, from an elevated command prompt, start the authentication scripts on all machines.

---

Reproduce the issue.

---

After reproducing the issue, stop and collect all traces:

From an elevated command prompt, stop the authentication scripts on all machines. This will generate and compile and gather numerous files in a directory called `Authlogs` under the directory where we ran the scripts from.

- On the CA:

Disable CA debug logging:

```
certutil -delreg debug
certutil -delreg CA\Debug
certutil -setreg CA\LogLevel 3
Net stop certsvc && net start certsvc
```

Collect logs in `C:\Windows\cert*.log`.

- On the CEP/CES Server(s):

Stop advanced CEP/CES diagnostics.

To disable advanced diagnostics for CEP or CES, we need to modify the `Web.Config` files corresponding to each of the application pools.

For CEP, we will have a `web.config` file under each of the following folders, corresponding to each of the authentication methods:

```
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_UsernamePassword\Traces
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_Kerberos\Traces
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_Certificate\Traces
```

For each authentication method we want to troubleshoot, under:
```
<system.diagnostics>
<sources>
```
for each of the sources, replace the value of "Verbose" with Off.

For CES, we will edit the same sections of the Web.config file under each of the following folders, corresponding to each of the authentication methods:

```
C:\Windows\SystemData\CES\EntCA_CES_UsernamePassword
C:\Windows\SystemData\CES\EntCA_CES_Kerberos
C:\Windows\SystemData\CES\EntCA_CES_Certificate
```

Commit CEP/CES Trace log entries into XML log files by running the following command from an elevated command prompt:

```
Iisreset
```

CEP/CES debug logs will be located as follows:

For CEP:

Depending on the authentication method, under any of the following folders:
```
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_UsernamePassword\Traces
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_Kerberos\Traces
C:\Windows\SystemData\CEP\ADPolicyProvider_CEP_Certificate\Traces
```

We are interested in the following files:

```
Traces-ADPolicyProvider.xml
Traces-ServiceModel-PolicyServer.xml
```

For CES:

Depending on the authentication method, under any of the following folders:
```
C:\Windows\SystemData\CES\EntCA_CES_UsernamePassword
C:\Windows\SystemData\CES\EntCA_CES_Kerberos
C:\Windows\SystemData\CES\EntCA_CES_Certificate
```

We are interested in the following files:

```
Traces-EnrollmentServer.xml
Traces-ServiceModel-EnrollmentServer.xml
```

Stop CEP CES ETL tracing:

From an elevated command prompt, run the following command:

```
logman stop "cepces" -ets
```

Collect the `c:\cepces.etl` file.

Collect the System, Application, Application and Services Logs > Microsoft > Windows > EnrollmentPolicyWebService > Admin and Application and Services Logs > Microsoft > Windows > EnrollmentWebService > Admin event logs from the CEP/CES server.

- On the Client:

Disable client enrollment logging:

From an elevated command prompt, run the following command:

```
Certutil -setreg enroll\debug 0x0
```

Collect logs in `C:\Windows\cert*.log`.

# IIS-specific data

An additional piece of data we can gather is IIS ETL logging by running the following from an elevated command prompt  this will allow us to monitor the requests being passed by IIS to the application layer:

```
logman create trace "inetsrv_iis" -ow -o c:\inetsrv_iis.etl -p "Microsoft-Windows-IIS-W3SVC-WP" 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
logman update trace "inetsrv_iis" -p "Microsoft-Windows-IIS-W3SVC" 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p "Microsoft-Windows-IIS" 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p {3A2A4E84-4C21-4981-AE10-3FDA0D9B0F83} 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p {06B94D9A-B15E-456E-A4EF-37C984A2CB4B} 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p {AFF081FE-0247-4275-9C4E-021F3DC1DA35} 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p {7ACDCAC8-8947-F88A-E51A-24018F5129EF} 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p {04C8A86F-3369-12F8-4769-24E484A9E725} 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p {7EA56435-3F2F-3F63-A829-F0B35B5CAD41} 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p "Microsoft-Windows-HttpService" 0xffffffffffffffff 0xff -ets
logman update trace "inetsrv_iis" -p "Microsoft-Windows-HttpEvent" 0xffffffffffffffff 0xff -ets
```

Again, to be sure that we capture all the relevant data, run an IISreset before reproducing the problem, by running from an elevated command prompt:

```
Iisreset
```

Ask the customer to reproduce the issue.

After the issue has been reproduced, stop IIS ETL logging by running:

```
logman stop "inetsrv_iis" -ets
```

We can convert the IIS ETL trace by running:

```
netsh trace convert input=inetsrv_iis.etl output=inetsrv_iis.txt
```

If needed, we can also activate IIS Failed Request Tracing (FRT):

Click Internet Information Services (IIS) Manager.

Expand the Server node, and then expand the Sites node.

In the tree view on the left, locate and click the name of the site.

Under IIS, double-click Failed Request Tracing Rules for the DefaultWebSite.

Click Edit Site Tracing.

Select the Enable check box and click OK.

To create a Failed Request Tracing rule, click Add.

Leave All content selected and click Next.

In the Status code(s) window, type the range 400  999 and click Next.

Leave all trace providers selected and click Finish.

Additional information about IIS FRT: 
[Troubleshooting Failed Requests Using Tracing in IIS 8.5](https://learn.microsoft.com/en-us/iis/troubleshoot/using-failed-request-tracing/troubleshooting-failed-requests-using-tracing-in-iis-85)

# Known issues
[CEP/CES KBR fails when Windows CES targets Windows CA with Third Party CA module](https://internal.evergreen.microsoft.com/en-us/topic/1f2a8c1c-916b-183f-f592-c0bd8120301a)

[Cannot select Windows Server 2016 CA-compatible certificate templates from Windows Server 2016 or later-based CAs or CEP servers](https://learn.microsoft.com/en-US/troubleshoot/windows-server/identity/cannot-select-windows-server-2016-ca-compatible-certificate-templates)

#Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Advanced** contains the following relevant modules for the CEP CES topic:

- M07 - CEP CES - Slide Deck

- M07 - CEP CES - Recording

- L07 - CPE CES - Lab Guide

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.
