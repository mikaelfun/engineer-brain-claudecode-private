---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Certificate chaining and validation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Certificate%20chaining%20and%20validation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414090&Instance=414090&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414090&Instance=414090&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Certificate revocation checking 

#Summary

This workflow helps troubleshoot certificate validation and chaining issues by guiding through scoping, data collection, and training steps.

#Scoping 

- Schedule a remote session with the customer

- Give the customer the opportunity to describe the issue on their own

- What error message is displayed? 

- What certificates are affected?  

- Does the problem appear on all machines?

- What certification authority issued the certificate?  

# Data collection 

Certificate validation is logged under Event viewer CAPI2 Logs. 

Event Viewer CAPI2 Logs is by default disabled.

Authentication scripts enable CAPI2 logging and set the log size to a value that ensures the logs are not overwritten during the usual time frame of data collection for an issue that can be reproduced at will.

##If the issue can be reproduced

The preferred data set consists of authentication scripts, process monitor and problem steps recorder (PSR).

This might collect a very significant volume of logs in a short time; therefore, the data collection should not be performed over long time frames, but only the time frame needed to reproduce the issue at least once and stopping data collection after that.

The customer can download the most recent version of Process Monitor from the public Microsoft web site.

Problem Steps Recorder (PSR) is included in Windows and can be found by searching for "Steps recorder" in the search bar.

A new version of the Auth scripts has been released.

The new Auth scripts are written in PowerShell and have been digitally signed.

The batch file versions of the Auth scripts (start-auth.bat / Stop-auth.bat) have been decommissioned and should no longer be used or distributed.

The batch file version of the scripts is being decommissioned as per instruction from the Microsoft Trust & Integrity Protection (TrIP) team, as part of an Application Risk Assessment (ARA).

Please ensure that only the PowerShell version of the Auth Scripts are used after 11th July 2021.

Please note that the PowerShell Version of the Auth Scripts are code signed to ensure that the customer can trust that they come from Microsoft and have not been altered.

The scripts should be sent out to the customers without any changes, to ensure that the digital signature remains valid and can be validated by the customer.

The internal article below has been updated with an overview of the data collection, usage (new switches), and script download location. 

[ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity and related scenarios](https://internal.evergreen.microsoft.com/en-us/topic/944d1348-83b9-87c0-7ef4-1d76b5c2e5f9)

##If the issue is sporadic

We need to enable CAPI2 logging.

###Enable CAPI2 via command line

```
wevtutil sl microsoft-windows-capi2/operational /e:true /ms:100000032
```

The above command enables the log and sets its size to approximately 100MB.

To stop CAPI2 logging from the command line and to export it to a file named *c:\capi2.evtx*, run the commands below:

```
wevtutil.exe set-log Microsoft-Windows-CAPI2/Operational /enabled:false
```

```
wevtutil.exe export-log Microsoft-Windows-CAPI2/Operational c:\%computername%-capi2.evtx /overwrite:true
```

###Enable CAPI2 logs from the graphical user interface

Open Event Viewer, select "Application and Services Logs", select Microsoft, select Windows, select Operational

Right click on Operational and from the options list select "Enable log"

Right click on Operational and from the options list select Properties

In the Properties windows, under "Maxium Log Size" set a value for example of 102784

![Workflow_PKI_Client_Certificate_chaining_and_validation.png](/.attachments/PKI/Workflow_PKI_Client_Certificate_chaining_and_validation.png)

Confirm the settings by clicking OK

Do not forget to help the customer disable CAPI2 logging once it is not needed anymore.

#Training

**Windows Commercial Public Key Infrastructure** provides a structured plan for support engineers to learn Public Key Infrastructure topics and then test their knowledge

The learning solution comprises **PKI Foundation** and **PKI Advanced**.

**PKI Foundation** contains the following relevant modules for the certificate chaining and validation topic:

- M08 - Certificate Validation (Chaining and Revocation) - Slide Deck
- M08 - Certificate Validation (Chaining and Revocation) - Recording

The links to the content of **Windows Commercial Public Key Infrastructure** are available on the PKI Workflow main page, under the [Trainings](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/413891/PKI-AD-Certificate-Services?anchor=trainings) section.

---

**Additional training content:**

---

[Introduction to PKI concepts](https://cloudacademy.com/course/ds300p-certificates-are-awesome-1425/ds300p-certificates-are-awesome/)

---

[How Certificate Validation and Revocation Works](https://microsoftapc.sharepoint.com/teams/InShorts/_layouts/15/stream.aspx?id=%2Fteams%2FInShorts%2FInShorts4DS%2F15InShorts4DS%20with%20Ashok%2D%20How%20Certificate%20Validation%20and%20Revocation%20Works%2Emp4)

---

[Common troubleshooting scenarios for a 2 tier PKI](https://microsoft.sharepoint.com/teams/CSSLearningWindowsCommercial/_layouts/15/stream.aspx?id=%2Fteams%2FCSSLearningWindowsCommercial%2FShared%20Documents%2FDirectory%20Services%2FDS%20Content%20from%20Streams%20-%20Temporary%2FPKI%2FADDS%20-%20PKI%20-%20Common%20troubleshooting%20scenarios%20for%202%20tier%20PKI%2Emp4)

---

[What are Digital Signatures and Catalog Files?](https://internal.evergreen.microsoft.com/en-us/topic/c4bf4408-b58c-aa5f-cea1-c7638a98aa8d)

---

[How Certificate Revocation Works | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/ee619754(v=ws.10))
