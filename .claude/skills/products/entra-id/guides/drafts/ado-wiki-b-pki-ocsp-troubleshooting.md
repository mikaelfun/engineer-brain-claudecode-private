---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Server/Workflow: PKI Server: Online Responder (OCSP)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FPKI%20-%20AD%20Certificate%20Services%2FWorkflow%3A%20PKI%20Server%2FWorkflow%3A%20PKI%20Server%3A%20Online%20Responder%20(OCSP)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414016&Instance=414016&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414016&Instance=414016&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Online Certificate Status Protocol (OCSP)

#Summary
This article provides a detailed guide on how to install, configure, and troubleshoot the Online Certificate Status Protocol (OCSP) in Windows environments. It includes steps for data collection, scoping, and training resources for support engineers.

# Documentation

[Online Responder Installation, Configuration, and Troubleshooting Guide](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc770413(v=ws.10))

[Configure a CA to Support OCSP Responders](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc732526(v=ws.11))

[How Certificate Revocation Works | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/ee619754(v=ws.10))

OCSP Tech Community Series:

[Implementing an OCSP responder: Part I - Introducing OCSP](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/implementing-an-ocsp-responder-part-i-introducing-ocsp/ba-p/396493)

[Implementing an OCSP responder: Part II - Preparing Certificate Authorities](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/implementing-an-ocsp-responder-part-ii-preparing-certificate/ba-p/396524)

[Implementing an OCSP responder: Part III - Configuring OCSP for use with Enterprise CAs](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/implementing-an-ocsp-responder-part-iii-configuring-ocsp-for-use/ba-p/396584)

[Implementing an OCSP responder: Part IV - Configuring OCSP for use with Standalone CAs](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/implementing-an-ocsp-responder-part-iv-configuring-ocsp-for-use/ba-p/396649)

[Implementing an OCSP responder: Part V High Availability](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/implementing-an-ocsp-responder-part-v-high-availability/ba-p/396882)

# Scoping

- Schedule a remote session with the customer.
- Give the customer the opportunity to describe the issue on their own.
- What is the error message and where is it logged?
- What operating system (OS) version is running on the OCSP servers?
- What OS version is running on the Certification Authority (CA)?
- What OS version is running on the Domain Controllers (DCs)?
- How many OCSP servers do we have?
- Are these servers in an OCSP array?
- For which CA is the OCSP server supposed to provide revocation status information?
- Is the error related to the revocation status response for a particular certificate? If so, we will export that certificate as a .cer file and we will run a few tests to get more detail about the issue.
- Are you configuring a new Online Responder, or troubleshooting an existing installation?
- Are you using a Microsoft CA or a third-party CA?
- Does the Online Responder start successfully?
- Can clients verify certificate revocation successfully?

# Data collection

For ease of troubleshooting, we usually gather data from two machines, the OCSP server itself and another machine acting as an OCSP client:

- From the OCSP server:

Export OCSP service registry configuration from:

```
HKLM\System\CurrentControlSet\Services\OcspSvc
```

Activate OCSP debug logging by running in an administrative command prompt on the OCSP server:

```
certutil -setreg -f Debug 0xffffffe3
```

Activate OCSP ETL logging by running in the command prompt:

```
logman create trace "ocsp" -ow -o c:\ocsp.etl -p "Microsoft-Windows-OnlineResponderWebProxy" 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets

logman update trace "ocsp" -p "Microsoft-Windows-OnlineResponderRevocationProvider" 0xffffffffffffffff 0xff -ets

logman update trace "ocsp" -p "Microsoft-Windows-OnlineResponder" 0xffffffffffffffff 0xff -ets
```

If we get an HTTP error code for the OCSP response, activate IIS Failed Request Tracing (FRT):

1. Click Internet Information Services (IIS) Manager.
2. Expand the Server node, and then expand the Sites node.
3. In the tree view on the left, locate and click the name of the site.
4. Under IIS, double-click Failed Request Tracing Rules for the DefaultWebSite.
5. Click Edit Site Tracing.
6. Select the Enable check box and click OK.
7. To create a Failed Request Tracing rule, click Add.
8. Leave All content selected and click Next.
9. In the Status code(s) window type the range 400  999 and click Next.
10. Leave all trace providers selected and click Finish.

Additional information about IIS FRT: 
[Troubleshooting Failed Requests Using Tracing in IIS 8.5](https://learn.microsoft.com/en-us/iis/troubleshoot/using-failed-request-tracing/troubleshooting-failed-requests-using-tracing-in-iis-85)

Enable IIS ETL logging by running in a command prompt:

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

To have the OCSP debug logging active, we will run:

```
iisreset

net stop ocspsvc & net start ocspsvc
```

The OCSP service debug log is now active.

The OCSP debug log will be created here:

```
c:\Windows\ServiceProfiles\networkservice\ocspsvc.log
```

Start a network trace from the OCSP server by running:

```
netsh trace start traceFile=c:\ocspserver.etl capture=yes
```

- From the OCSP client:

Start a network trace on the OCSP client by running:

```
netsh trace start traceFile=c:\ocspclient.etl capture=yes
```

If the error is related to the revocation status response for a particular certificate, we can export the affected certificate as a .cer file, for example as testcert.cer.

Run in a command prompt:

```
certutil -URL c:\tmp\testcert.cer
```

In the Retrieve section, select OCSP, and click the Retrieve button.

Once an error has been returned in the URL retrieval tool:

- On the OCSP client:

Stop the network trace by running:

```
netsh trace stop
```

Collect the network trace .etl and the matching .cab file.

- On the OCSP server:

Stop the network trace by running:

```
netsh trace stop
```

Stop the debug log collection by running:

```
logman stop "ocsp" -ets

certutil -setreg -f Debug 0x0

iisreset

net stop ocspsvc & net start ocspsvc

logman stop "inetsrv_iis" -ets
```

After the OCSP service has restarted successfully, we can collect the logs:

```
C:\ocsp.etl

c:\Windows\ServiceProfiles\networkservice\ocspsvc.log

c:\inetsrv_iis.etl
```

We can convert the ocsp.etl by running the command:

```
netsh trace convert input=ocsp.etl output=c:\ocsp.txt
```

Collect the system and application log from the OCSP server.

Collect IIS Failed Request Trace logs from:

```
C:\inetpub\logs\FailedReqLogFiles\W3SVC1
```

These are the `fr00000*.xml` files.

# Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure (PKI) topics and then test their knowledge.

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the OCSP topic:

- M08 - Certificate Validation (Chaining and Revocation) - Slide Deck
- M08 - Certificate Validation (Chaining and Revocation) - Recording
- L08 - OCSP - Lab Guide

**PKI Advanced** contains the following relevant modules for the OCSP topic:

- M04 - Online Certificate Status Protocol - Slide Deck
- M04 - Online Certificate Status Protocol - Recording
- L04 - OCSP - Lab Guide


The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.