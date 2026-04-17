---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Other common scenarios/Domain Controller Latency or Disconnections"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Other%20common%20scenarios/Domain%20Controller%20Latency%20or%20Disconnections"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533509&Instance=1533509&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533509&Instance=1533509&Feedback=2)

___
<div id='cssfeedback-end'></div>

## ADPERF: Other scenarios: Domain controller latency or disconnections

This article provides guidance on addressing issues related to latency or disconnections with Domain Controllers (DCs). It includes scoping questions to help diagnose problems and offers a link to additional resources.

[[_TOC_]]

### Background / Common Issues

#### Scoping Questions

To diagnose issues related to Lightweight Directory Access Protocol (LDAP) or Active Directory (AD) latency or performance, consider the following questions:

- Describe the problem you are seeing related to LDAP or Active Directory latency or performance. Are LDAP queries failing or taking longer than expected? Are there alerts about poor LDAP performance or dropped connections?
- Which machines are affected, and what is their role? (For example, application servers, users' desktops)
- Does the problem only occur when targeting a specific Domain Controller or LDAP server?
- Is this problem affecting one particular application or multiple applications?
- When does the problem occur? (For example, when a specific action is performed, only under heavy load, or at a specific time of day)
- When the problem occurs, how long does it last?
- Does a reboot, unplugging the network cable, or any other action temporarily resolve the problem? If so, please state the action.
- List any relevant information that may not have been addressed in the questions above.

For more information on finding expensive, inefficient, and long-running LDAP queries in Active Directory, visit [this blog post](https://blogs.technet.microsoft.com/askpfeplat/2015/05/10/how-to-find-expensive-inefficient-and-long-running-ldap-queries-in-active-directory/).

![Domain Controller Latency or Disconnections 1](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=/WindowsDirectoryServices/.attachments/ADPERF/Domain_Controller_Latency_or_Disconnections_1.png)

#### Flowchart

 ![Domain Controller Latency or Disconnections 2](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=/WindowsDirectoryServices/.attachments/ADPERF/Domain_Controller_Latency_or_Disconnections_2.png)

For a more detailed set of questions, you can download the [LDAP Latency Scoping Questions email template](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=/WindowsDirectoryServices/.attachments/LDAP%20Latency%20Scoping%20Questions-d740739d-e971-4e80-becd-caf71fc9faa3.msg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master).

This guide aims to help you systematically approach and resolve issues related to Domain Controller latency or disconnections.