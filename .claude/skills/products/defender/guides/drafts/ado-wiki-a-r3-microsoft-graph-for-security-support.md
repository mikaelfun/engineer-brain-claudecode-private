---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/[Boundaries] - Microsoft Graph Support"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/[Boundaries]%20-%20Microsoft%20Graph%20Support"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# What is Microsoft Graph?
---
Microsoft Graph is the gateway to data and intelligence across Microsoft cloud services.�
It serves as a unique entry point into Microsoft's ecosystem for software developers and it simplifies authentication and data access by allowing authentication to multiple services using a single token and exposing a unified schema across most products and services.�

![MSGraph diagram.png](/.attachments/==image_0==-5e72f562-0c6c-4048-ab16-d6370e25f469.png)

For more information please visit�[Microsoft Graph overview - Microsoft Graph | Microsoft Learn](https://learn.microsoft.com/en-us/graph/overview)�and�[Microsoft Graph REST API v1.0 endpoint reference - Microsoft Graph v1.0 | Microsoft Learn](https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0&preserve-view=true).

# Why is this relevant?
---
Microsoft Graph has existed for a number of years as a support product, with capabilities across Directory Services and Microsoft 365.�
Today, a number of security features spanning almost all of the Security and Compliance products are exposed under Microsoft Graph, but SCIM S&C didn't have the right taxonomies in place to call code and route the cases to the relevant teams.�
In absence of these taxonomies, there was no way for customers to create cases directly for Microsoft Graph security related issues and there was no mechanism for teams across CSS to move volume into the appropriate Security and Compliance teams, adding unnecessary delays in customers receiving solutions for their queries.�
In addition, Independent Software Vendors (ISVs) using Microsoft technologies and services are vital to Microsoft because they expand the ecosystem with innovative solutions and can drive cloud adoption and revenue growth through the commercial marketplace.�

# What is changing?
---
We are introducing a new support product called�**_"Microsoft Graph for Security"_**�with the associated support area path taxonomy.�
At this point, ownership over this product will not sit with a single team, instead, different support area paths will route to different teams as indicated further down in this e-mail.�

**IMPORTANT CALL TO ACTION**:
It is important that all support roles who come across Microsoft Graph related cases call code the cases correctly with one of the support area paths below. This will help us better understand the demand and volumes as well as understand what skills and capabilities we need to invest in within our teams.�

## New support area paths and business ownership
---
### Support Area Paths
The list below contains the Microsoft Graph for Security SAP Paths and the corresponding business line mapping. 

| **Support Area Path** | **Topic** |  **Business Line Ownership** |
| --- | --- |  --- |
| Security/Microsoft�Graph for Security/Secure Score | [Secure Score](https://learn.microsoft.com/en-us/graph/api/resources/securescore?view=graph-rest-beta) | [Infrastructure Solutions (MSEM)](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Microsoft%20Security%20Exposure%20Management%20(MSEM)/11764/Secure-Score) |
| Security/Microsoft�Graph for Security/Secure score control profile |  [Secure score control profile](https://learn.microsoft.com/en-us/graph/api/resources/securescorecontrolprofiles?view=graph-rest-beta) | [Infrastructure Solutions (MSEM)](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Microsoft%20Security%20Exposure%20Management%20(MSEM)/11764/Secure-Score)|
|  |  |    |
| Security/Microsoft�Graph for Security/Audit log query | [Audit log query](https://learn.microsoft.com/en-us/graph/api/resources/security-auditlogquery?view=graph-rest-beta) |   [Purview Compliance](https://dev.azure.com/ASIM-Security/Compliance) |
| Security/Microsoft�Graph for Security/Compliance | [Compliance ](https://learn.microsoft.com/en-us/graph/api/resources/complianceapioverview?view=graph-rest-beta)  | [Purview Compliance](https://dev.azure.com/ASIM-Security/Compliance) |
| Security/Microsoft�Graph for Security/eDiscovery | [eDiscovery](https://learn.microsoft.com/en-us/graph/api/resources/security-ediscovery-apioverview?view=graph-rest-beta)  |  [Purview Compliance](https://dev.azure.com/ASIM-Security/Compliance) |
| Security/Microsoft�Graph for Security/Information Protection | [Information Protection](https://learn.microsoft.com/en-us/graph/api/resources/informationprotectionlabel?view=graph-rest-beta) |   [Purview Compliance](https://dev.azure.com/ASIM-Security/Compliance) |
| Security/Microsoft�Graph for Security/Records management |  [Records management](https://learn.microsoft.com/en-us/graph/api/resources/security-recordsmanagement-overview?view=graph-rest-beta) |  [Purview Compliance](https://dev.azure.com/ASIM-Security/Compliance) |
|  |  |    |
| Security/Microsoft�Graph for Security/Advanced hunting | [Advanced Hunting](https://learn.microsoft.com/en-us/graph/api/resources/security-huntingqueryresults?view=graph-rest-1.0) | [Endpoint Protection](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/1117/Endpoint-Protection-POD) |
| Security/Microsoft�Graph for Security/Alerts and Incidents | [Alerts and Incidents](https://learn.microsoft.com/en-us/graph/api/security-list-incidents?view=graph-rest-1.0&tabs=http)  | [Endpoint Protection](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/1117/Endpoint-Protection-POD) |
| Security/Microsoft�Graph for Security/Detection rule | [Detection Rules](https://learn.microsoft.com/en-us/graph/api/resources/security-detectionrule?view=graph-rest-beta)  | [Endpoint Protection](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/1117/Endpoint-Protection-POD) |
| Security/Microsoft�Graph for Security/Security action | [Security Action](https://learn.microsoft.com/en-us/graph/api/resources/securityaction?view=graph-rest-beta_) | [Endpoint Protection](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/1117/Endpoint-Protection-POD) |
| Security/Microsoft�Graph for Security/Threat intelligence |  [Threat Intelligence](https://learn.microsoft.com/en-us/graph/api/resources/security-threatintelligence-overview?view=graph-rest-beta) | [Endpoint Protection](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/1117/Endpoint-Protection-POD) |
| Security/Microsoft�Graph for Security/Threat intelligence indicator |  [Threat Intelligence Indicator](https://learn.microsoft.com/en-us/graph/api/resources/tiindicator?view=graph-rest-beta) | [Endpoint Protection](https://dev.azure.com/ASIM-Security/Endpoint%20Protection/_wiki/wikis/Defender%20for%20Endpoint/1117/Endpoint-Protection-POD) |
|  |  |    |
| Security/Microsoft�Graph for Security/Discovered�Could�Apps | [Discovered�Could�Apps](https://learn.microsoft.com/en-us/graph/api/resources/security-cloudappdiscovery-overview?view=graph-rest-beta)  | [Threat Analytics](https://dev.azure.com/ASIM-Security/Threat%20Analytics/_wiki/wikis/Threat%20Analytics/25/Welcome-to-Threat-Analytics) |
| Security/Microsoft�Graph for Security/Identities | [Identities](https://learn.microsoft.com/en-us/graph/api/resources/security-healthissue?view=graph-rest-beta)  | [Threat Analytics](https://dev.azure.com/ASIM-Security/Threat%20Analytics/_wiki/wikis/Threat%20Analytics/25/Welcome-to-Threat-Analytics) |
|  |  |    |
| Security/Microsoft�Graph for Security/Attack simulation and training | [Attack simulation and training](https://learn.microsoft.com/en-us/graph/api/resources/simulation?view=graph-rest-beta)  | [Messaging Protection](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7853/Messaging-Protection-SAPs-Contacts) |
| Security/Microsoft�Graph for Security/Email and collaboration protection | [Email and collaboration protection](https://learn.microsoft.com/en-us/graph/api/resources/security-analyzedemail?view=graph-rest-beta) |  [Messaging Protection](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7853/Messaging-Protection-SAPs-Contacts) |
| Security/Microsoft�Graph for Security/Threat submission |  [Threat Submission](https://learn.microsoft.com/en-us/graph/api/resources/security-threatsubmission?view=graph-rest-beta) | [Messaging Protection](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7853/Messaging-Protection-SAPs-Contacts) |


## What is in scope?
---
### Types of cases
All support cases for customer requesting support with security or compliance related APIs when:
1.  making REST API calls to any of the APIs listed under�[Microsoft Graph REST API beta endpoint reference - Microsoft Graph beta | Microsoft Learn](https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-beta)
2.  running PowerShell cmdlets included in the�[Microsoft Graph PowerShell documentation | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/microsoftgraph/?view=graph-powershell-1.0)�PowerShell module
3.  using the�[Microsoft Graph�SDK�overview - Microsoft Graph | Microsoft Learn](https://learn.microsoft.com/en-us/graph/sdks/sdks-overview)�or the�[GitHub - microsoftgraph/msgraph-sdk-dotnet: Microsoft Graph Client Library for .NET!](https://github.com/microsoftgraph/msgraph-sdk-dotnet)

### API versions
Microsoft Graph support is offered to customers utilizing both the�**_v1.0_**�and�**_beta_**�version of the API.

Engineers�**_must not refuse_**�to offer support to customer using the�_beta_�version of the API for grounds of it being a preview version. As far as the Microsoft Graph engineering group is concerned, both API versions are fully supported.�

### Entitlements
All entitlements, excluding free support tickets, are in scope.�
However, case routing and handling will follow the same rules as for other support tickets, meaning that Broad Commercial volume will be supported by Delivery Partners, whereas Enterprise Support will be supported by Internal Delivery.�

**Support boundaries**  
The support boundaries are documented at�https://aka.ms/MicrosoftGraphSupportBoundaries
For anything relating to taxonomies or boundaries, please contact�SPM [Andrei Ghita](https://teams.microsoft.com/l/chat/0/0?users=catagh@microsoft.com).  

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
