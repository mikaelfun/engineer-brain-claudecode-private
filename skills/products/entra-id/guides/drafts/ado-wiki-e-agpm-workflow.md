---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: AGPM workflow"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Group%20Policy/Workflow%3A%20GPO%3A%20AGPM%20workflow"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/766305&Instance=766305&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/766305&Instance=766305&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document provides a comprehensive guide on Microsoft Advanced Group Policy Management (AGPM), including installation, scoping, data collection, supportability, learning resources, and known issues.

[[_TOC_]]

**Workflow owner**: ahawad <br>
**SAP**: Routing Windows V3\Group Policy\Group Policy\Group Policy management (GPMC or AGPM)

#AGPM Workflow

Microsoft Advanced Group Policy Management (AGPM) is a client/server application. The AGPM Server stores Group Policy Objects (GPOs) offline in the archive that AGPM creates on the server's file system. Group Policy administrators use the AGPM snap-in for the Group Policy Management Console (GPMC) to work with GPOs on the server that hosts the archive.

##How to install

AGPM is available as part of the Microsoft Desktop Optimization Pack (MDOP) for Software Assurance. Customers should download it from there.

You can download the installer for your internal lab and testing from: 
[AGPM-Installer](/.attachments/GPO/AGPM/agpm-installers.iso).
 
AGPM has a server component and a client component, each of which you install separately. 
1. Install the Group Policy Management Console (GPMC) and the server component on a server system that has access to the policies you want to manage.
2. Install GPMC and the AGPM client on any computer from which administrators will review, edit, and deploy policies.


The AGPM client integrates completely with GPMC. 

Administrators review, edit, and deploy GPOs within each domains Change Control folder. The GPOs you see in the Group Policy objects list on the Controlled tab are stored in the AGPM servers archive. Changes made to these GPOs dont affect the production environment until administrators with the Approver role deploy the GPOs to production.

![a picture showing the AGPM interface](/.attachments/GPO/AGPM/agpm.jpg)


A Step-by-Step installation guide can be found here:

[Step-by-Step installation guide](https://learn.microsoft.com/en-us/microsoft-desktop-optimization-pack/agpm/step-by-step-guide-for-microsoft-advanced-group-policy-management-40)




##Scoping

The following questions can be useful when scoping the issue:

- Do you have the latest AGPM updates? This is mandatory before going into deep troubleshooting.
 
  [March 2017 servicing release for Microsoft Desktop Optimization Pack](https://support.microsoft.com/en-us/topic/march-2017-servicing-release-for-microsoft-desktop-optimization-pack-f1c4a8d5-4af5-37f6-cb23-24fb934f416b)
 
 
- What type of activity is affected when the problem happens? Examples:
  - Controlling a policy or releasing control.
  - Checking a policy out for editing or checking it in.
  - Managing policy permissions.
  - Policy (differential) reporting.
 
- Does the problem also happen without AGPM involved?

  _Example_:
  When you transfer a policy with AGPM, the server uses GPMC APIs a lot like GP backup restore through scripts or the Backup and import/restore functions in GPMC. If the problem happens there as well, we likely have a general Group Policy problem.
 
- Do settings in the policy appear missing when editing the policy after checkout?
  - Are there errors when editing the policies that you have just checked out?
  - Do settings that you have just changed not appear in the policy settings report from the archive?

  The above behaviors may be the result of the issues described in:

  [GPHELP: AGPM adds complexity to DC selection when machines are in multiple sites](https://internal.evergreen.microsoft.com/en-us/topic/2dd3859b-f599-17c1-afc9-bd384c0fa5b4)

- Are permissions on policies in production not being kept as expected?

- Are policy files missing in the archive?





##Data collection

Depending on the issue, the following logs can be collected from the AGPM client, server and Domain Controllers:
 
- Network traces (client, server and DCs)
- Process Monitor logs (client and server)

- Group Policy Management Console (GPMC) logging (client and server):
  [Enable Logging for Group Policy Management Console | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc737379(v=ws.10)?redirectedfrom=MSDN)

- Advanced Group Policy Management logging (client and server):
  [Logging and Tracing Settings - Microsoft Desktop Optimization Pack | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-desktop-optimization-pack/agpm/logging-and-tracing-settings)

- Active Directory auditing can be enabled on DCs to track changes to GPOs.


##Supportability
AGPM has been in extended support since April 2018. For regular operational problems, there is no option to ask for a Quick Fix Engineering (QFE). The only issues that can meet the bar are Microsoft Security Response Center (MSRC) type security bugs.

| | **End of mainstream support** | **Original End of extended support** | **New End of extended support** |
|--|--|--|--|
| **AGPM v4 SP3** | April 10, 2018 | Jan 12, 2021 | **April 14, 2026** |

The internal KB has messaging for customers around the End of Life (EOL) and a link to a form to track customers interested in the tool: [GPHELP: AGPM | Customers Asking About AGPM EOL in April 2026 | Support for WS2022](https://internal.evergreen.microsoft.com/en-us/topic/0e520085-4b4b-2bf9-5f6e-49a897f5546e)

##Learning resources
- AGPM Under the Hood series
  - [AGPM Under The Hood (part 1)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-production-gpos-under-the-hood)
  - [AGPM Under The Hood (part 2)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-operations-under-the-hood-part-2-check-out)
  - [AGPM Under The Hood (part 3)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-operations-under-the-hood-part-3-check-in)
  - [AGPM Under The Hood (part 4)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-operations-under-the-hood-part-4-import-and-export)
- [Step-by-Step Guide for Microsoft Advanced Group Policy Management 4.0](https://learn.microsoft.com/en-us/microsoft-desktop-optimization-pack/agpm/step-by-step-guide-for-microsoft-advanced-group-policy-management-40)
- [Operations Guide for Microsoft Advanced Group Policy Management 4.0](https://learn.microsoft.com/en-us/microsoft-desktop-optimization-pack/agpm/operations-guide-for-microsoft-advanced-group-policy-management-40)
- [AGPM Least Privilege Scenario](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/agpm-least-privilege-scenario/ba-p/395881)
- [Advanced Group Policy Management Overview](/.attachments/GPO/AGPM/Advanced-Group-Policy-Management-Overview.docx)


##Known issues

- [3144314 GPHELP: AGPM adds complexity to DC selection when machines are in multiple sites](https://internal.evergreen.microsoft.com/en-us/topic/2dd3859b-f599-17c1-afc9-bd384c0fa5b4)
- [4471051 GPHELP: AGPM Difference Reporting does not list all settings as expected](https://internal.evergreen.microsoft.com/topic/4471051)
- [4462720 GPHelp: GPMC: AGPM GPO check-out fails with Naming Violation error when CNF objects exist for the GPO in AD](https://internal.evergreen.microsoft.com/topic/4462720)
- [4343998 GPHELP: AGPM issue - Changes to "Wired settings" (802.3) in GPO disappears after check-in/check out](https://internal.evergreen.microsoft.com/topic/4343998)
- [4077654 Servicing: 1B.18: GPHELP: GPO edit fails with 0x80071128: "data ...in the reparse point buffer is invalid" after installing 1B / 1C KBs](https://internal.evergreen.microsoft.com/topic/4077654)
- [4013706 GPHELP: GPMC import, export and "take control" operations fail if GP permissions reference 2-character SDDL user strings](https://internal.evergreen.microsoft.com/topic/4013706)
- [3175582 Servicing: MS16-072 / KB 3163622 : Configuring AGPM-managed policies to work with MS16-072](https://internal.evergreen.microsoft.com/topic/3175582)
- [2987708 AGPM and GPRESULT not working in Windows Server Core](https://support.microsoft.com/en-us/help/2987708)
- [2560842 AGPM error "Failed to generate HTML GPO settings report", invalid data in AGPM store](https://internal.evergreen.microsoft.com/topic/2560842)
- [GPHELP: Slow GPO deployment with AGPM 4.0 - up to 3 minutes](https://internal.evergreen.microsoft.com/en-us/topic/f7bbb520-816a-440a-e235-1b852d1524f4)