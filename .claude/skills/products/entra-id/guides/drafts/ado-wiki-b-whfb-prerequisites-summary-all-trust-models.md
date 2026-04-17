---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Scoping/WHAT is the Scenario : WHFB deployment model/Prerequisites summary"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20Scoping/WHAT%20is%20the%20Scenario%20%3A%20WHFB%20deployment%20model/Prerequisites%20summary"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431152&Instance=431152&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431152&Instance=431152&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article outlines the prerequisites for different trust types in a hybrid and on-premises environment, focusing on Microsoft Windows Hello for Business. It provides a detailed table summarizing the requirements for each scenario.

# Prerequisites

As you know which model is configured, please validate that those requirements are present.

Prerequisites summary:

All latest statements here: [Plan a Windows Hello for Business deployment](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/#deployment-options)


| Scenario | Hybrid Certificate trust type  | Hybrid Key trust type  | On-Premises Certificate trust type | On-Premises Hybrid Key trust type |
|:--:|:--:|:--:|:--:|:--:|
| Schema 2016 required | YES | YES | YES | YES |
| DC version | DC 2012 R2 or higher | DC 2016 (in each AD-Site where user resides) | DC 2012 R2 or higher | DC 2016 (in each AD-Site where user resides) |
| DC certificate required Hybrid: [DC Certificate](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cert-whfb-settings-pki) | YES | YES | YES | YES |
| Client certificate required | Yes (Certification Authority, Autoenrollment must be enabled) | Yes (self-signed, automatic) | Yes (Certification Authority, Autoenrollment must be enabled) | Yes (self-signed, automatic) |
| ADFS 2016 required | Yes for certificate enrollment (Registration Agent) | No | Yes for certificate enrollment (Registration Agent) and device registration | Yes for key registration and device registration |
| MFA required | Yes | Yes | Yes | Yes |
| Hello activation | GPO (or MDM) | GPO (or MDM) | GPO | GPO |
| CA | Any supported Windows Server versions | Any supported Windows Server versions | Any supported Windows Server versions | Any supported Windows Server versions |

At this point, you should be aware of:
- The failing component (provisioning, sign-in, etc.)
- The error code and how it is encountered
- The kind of trust type used

---
**NEXT STEP:**
Now you need details about the [devices](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431149/WHERE).
