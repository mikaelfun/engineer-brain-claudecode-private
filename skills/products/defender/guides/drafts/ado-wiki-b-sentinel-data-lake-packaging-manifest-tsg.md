---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Packaging and Manifest Creation using the Visual Code Extension for Sentinel"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Packaging%20and%20Manifest%20Creation%20using%20the%20Visual%20Code%20Extension%20for%20Sentinel"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- Optional: Link to PG original TSG doc -->
Link to Product Group (PG) doc - [Original TSG Document Sentinel data lake - Packaging.docx](https://microsoft-my.sharepoint.com/:w:/p/adeoluwaj/EZc3cs6xmydLll9CBIG_jLoBgwRfunv_lZ3LsrFlSwc3kw?e=TVa98P)

---
<!-- �Required: Table of Contents -->
[[_TOC_]] 

<!-- �Required: Main title of the document -->
# Troubleshooting Guide for Sentinel data lake - Packaging and Manifest Creation using the Visual Code Extension for Sentinel

<!-- �Required: Training sessions resources and links-->
# Training sessions
|Date (DD/MM/YYYY)|Session Recording|Documents|Presenter|
|--|--|--|--|
|<Date-Placeholder>|<Recording-Placeholder>|<Documents-Placeholder>|<Presenter-Placeholder>|

---
<!--�Required: Brief introduction to the feature/s-->
# Overview
The Microsoft Sentinel data lake, available in the Microsoft Defender portal, is a centralized repository designed to store and manage vast amounts of security-related data from various sources. It enables your organization to collect, ingest, and analyze security data in a unified manner, providing a comprehensive view of your security landscape. Leveraging advanced analytics, machine learning, and artificial intelligence, the Microsoft Sentinel data lake helps in detecting threats, responding to incidents, investigating incidents, and improving overall security posture.

The updated Sentinel Extension for Visual Studio Code gives partners and end customers the ability to package solutions that can include Sentinel data lake notebook jobs or Security Copilot agents so they can publish them as offers to the Microsoft Security Store. This guide describes the packaging functionality in the extension.

Note Sentinel SIEM solutions that contain content elements published through Content Hub follow the existing process for publishing and managing solutions. This TSG only refers to creating packages for Sentinel data lake that contain Sentinel data lake notebook jobs and Security Copilot agents.

<!-- Required: Detailed description of the feature/s-->
### User Scenarios
      
- Create a package for publishing notebook jobs to the Microsoft Security Store
- Create a package for publishing notebook jobs and a Security Copilot Agent to the Microsoft Security Store

<!-- Required: Requirements to use the feature/s-->
## Prerequisites
---
The prerequisites for package creation are the same for Notebook support for Sentinel data lake, restated here for convenience. The ability to package a solution is included in the latest Visual Studio Code extension for Sentinel.

- Tenant and workspace must be onboarded to Microsoft Sentinel data lake
- Download Visual Studio Code (desktop app)
- Download and install Microsoft Sentinel extension for Visual Studio Code (available in VS Code extensions marketplace)
- GitHub copilot extension for Visual Studio Code (not mandatory to have, optional but recommended)

Once the customer is onboarded to the Microsoft Sentinel data lake in Public Preview, they can log into the VS Code Microsoft Sentinel extension and connect to their Microsoft Sentinel data lake instance.


<!-- Optional: Costs/Billing to use the feature/s-->
## Setup Instructions
---
       
Instructions on preparing solution components and packaging the solution are located at [Package and publish a Microsoft Sentinel platform solution](https://learn.microsoft.com/en-us/azure/sentinel/package-platform-solution)

Solution components need to be prepared before they can be packaged. Each solution must contain one AgentManifest.yaml file.

The package manifest is created in Visual Studio after the Visual Studio extention has been installed by right clicking on an empty section in the File Explorer and selecting Microsoft Sentinel > Create Package Manifest.

![Screenshot of VS Code Sentinel Package Demo](/.attachments/image-ef7279bf-f590-482a-b979-4d2addd533f7.png)

After selecting where to save the manifest, the extension brings up the editor

![Screenshot of VS Code Create Package Definition](/.attachments/==image_0==-35667d93-0280-43be-a3a1-6791686dc061.png)        


## Common issue/s
---
      
- **Customers may not be able to bring up the editor**. They need to right click on a blank space in the explorer, and not click on an individual file. Clicking on the individual file will not bring up the option to create the package.
- **Customers may not find the package (.zip file)**. After they click �Create Package Zip file� in the top right-hand corner of the editor, they may not realize the .zip file was created where they specified when they invoked the editor in the Save As dialog. They should look in that location for the new .zip file.
- **Packaging fails because customers have not properly created their components for packaging**. Packaging can fail if the user has not properly created their components because they have not following the requirements for each component, listed below.
  - **Inclusion of more than one Security Copilot agent manifest**. Only one AgentManifest.yaml file is allowed. If the customer includes more than one, they will see the �Failed to create zip package: Multiple SC agent files found. Only one SC agent file is allowed.� To correct, include only one agent manifest file.
  - **Packaging fails because the package manifest file has been deleted.** If the customer saves the PackageManifest.yaml file but later deletes it (either intentionally or by mistake) from the file explorer directory, the packaging process will not be able to locate the manifest and will fail. They will see an error such as �Failed to create zip package: No such file or directory, open <�>PackageManifest.yaml.� To correct, ensure that the package manifest file remains in the solution directory before attempting to create the package zip file.

### Issues related to offer creation in the Security Store
- Customers and partners create packages so they can create offers in the Security Store, which can then be purchased internally through private offers, or by external end customers. The following issues should be handled first by Security Store support.
      
  - **Offer not visible in Security Store:** The solution package doesn�t appear in the marketplace after publishing.
  - **Can�t publish/upload ZIP:** Uploading the package to the Security Store fails or is blocked.
  - **Install/disable/delete errors:** Problems occur when trying to install, disable, or remove the solution from the Security Store.
  - **Billing/entitlement glitches:** Issues with licensing, billing, or user entitlements prevent successful deployment.
      
### Issues related to Security Copilot agents
- Customers and partners may have issues when they or their end customers deploy agents from the Security Store. These issues should be handled first by Security Copilot support.
     
   - **Agent not discoverable after publish:** The deployed agent isn�t visible or available for use.
  - **Agent installed but not running:** The agent installs successfully but doesn�t execute as expected.
  - **Agent doesn�t trigger on expected output:** The agent fails to respond to the intended data or events.
    

### Issues related to Sentinel lake scheduled jobs
- Customers and partners may have issues with their Sentinel lake scheduled notebook jobs. Troubleshoot these issues by referring to [[TSG] - Sentinel data lake - Notebooks](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/12017/-TSG-Sentinel-data-lake-Notebooks)
  - **Job didn�t fire or write output:** Scheduled jobs don�t run or fail to produce results.
  - **No output rows/columns:** Expected data isn�t generated or is missing from notebook outputs.

<!-- Required: Details required to escalate issues to the Product Group-->
# Escalating to Product Group (PG)
---
Before creating the IcM, make sure you have exhausted all the steps in this document.

## IcM Escalation Path Lookup <!-- Required: Details to determine Escalation path, make sure to use the relevant link and check that the escalation path is listed-->
Refer to the [Microsoft Sentinel](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3314/Sentinel-PG-Dev-lookup-escalation-path) IcM escalation path lookup page to route your IcM to the appropriate team.

---
<!-- Optional: Frequently Asked Questions-->
# Frequently Asked Questions (FAQs)
---
**Why don�t I see the option to create a package manifest in VS Code?**
 - You must right click on an empty space in the File Explorer, not on a specific file.

**My package .zip file doesn�t appear after I select �Create Package Zip file.� Where is it?** 
 - The .zip file is created in the location you specified in the �Save As� dialog when invoking the editor.

**Can I include multiple Security Copilot agents in the same package?**
 - No. Only **one** AgentManifest.yaml file is allowed per solution package.

---
<!-- Required: Details required to escalate issues to the Product Group-->
# Additional Information
---
  - **Internal Documentation**
    - [Sentinel Lake and Graph - Documents - Build and publish Microsoft Sentinel solutions - All Documents](https://microsoft.sharepoint.com/teams/SecurityPlatform/Shared%20Documents/Forms/AllItems.aspx?id=%2Fteams%2FSecurityPlatform%2FShared%20Documents%2FField%20%26%20Support%20Readiness%20%2D%20Platform%20Launch%2FDocumentation%20Readiness%2FISV%2FBuild%20and%20publish%20Microsoft%20Sentinel%20solutions&viewid=ca945946%2D80dc%2D4daa%2Dafcc%2D11e520eb3551)
    - [ISV Blog for Sept 30.docx](https://microsoft-my.sharepoint.com/:w:/p/crhajduk/EfgUMgclbBFLhgQzGCg4FYUB-VSftwTi7Ixl_3hqdt7zDA?wdOrigin=TEAMS-MAGLEV.p2p_ns.rwc&wdExp=TEAMS-TREATMENT&wdhostclicktime=1758642385651&web=1)
  - **Public Documentation**
    - [Package and publish a Microsoft Sentinel platform solution](https://learn.microsoft.com/en-us/azure/sentinel/package-platform-solution)
    - [Sentinel solution quality guidelines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/sentinel-solution-quality-guidance)


---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Craig Hajduk | Creator | 30/09/2025 |
| James Ade| Creator | 30/09/2025 |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
