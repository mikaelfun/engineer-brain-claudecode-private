---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for DevOps/[TSG] - DevOps Hardening"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Defender%20for%20DevOps/%5BTSG%5D%20-%20DevOps%20Hardening"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# DevOps Hardening

In today's cybersecurity landscape, DevOps Source Code Management (SCM) systems and Continuous Integration / Continuous Delivery (CI/CD) pipelines have come under the spotlight, with events such as the SolarWinds supply chain attack underscoring the critical importance of strong DevOps security. Given their intricate technical architecture, Source Code Management (SCM) and Continuous Integration / Continuous Delivery (CI/CD) pipelines often possess intricate configurations. Unfortunately, it's not uncommon for developers to inadvertently misconfigure these resources, leaving them vulnerable to malicious attacks.

To address DevOps-related risks, the DevOps Hardening solution uses the Azure DevOps Scanner and GitHub Scanner tools developed by Microsoft's Digital Security & Resilience (DSR) team. These scanners detect and highlight security gaps within Azure DevOps and GitHub with actionable remediation advice. The scanners evaluate security settings across a myriad of resources, spanning various layers, from organizational to repository levels. Through these comprehensive evaluations and subsequent corrective measures, customers can improve their DevOps security posture through Microsoft Defender for Cloud (MDC).

# Product Knowledge

## Azure DevOps and GitHub Scanners (owned by Digital Security & Resilience team)

* Azure DevOps Scanner: Helps ensure that various Azure DevOps artifacts such as organization/project settings, build configurations, service connections, variable groups, and secure files are configured securely.
* GitHub Scanner: Provides visibility of security configuration details in GitHub Enterprise Cloud instances.
* The scanners run as Azure Function applications and query the public REST Application Programming Interfaces (APIs) of DevOps platforms using OAuth app-based scanning to leverage the token acquired by Microsoft Defender for Cloud (MDC) when the DevOps connector gets created.
* The findings from the scanners are processed to Static Analysis Results Interchange Format (SARIF), a results-based output format.
* Each finding maps to a recommendation in Microsoft Defender for Cloud (MDC) with affected resources in unhealthy states.
* The recommendation will be considered healthy only if all resources are remediated.

## Architecture

* As part of the connector provisioning for GitHub and Azure DevOps, the Scanner Function Applications are provisioned with an Azure Storage Account for storing results on the backend. This means that the customer does not need to deploy the scanners or configure their build pipelines.
* The Scanners periodically run and write findings to the Azure Storage Account.
* An Event Grid topic and subscription relays the Static Analysis Results Interchange Format (SARIF) output of the findings to a SARIF Processing Function.
* The SARIF Processing Function sends the scanner results to Microsoft Defender for Cloud (MDC) to be presented to customers in the form of recommendations.

![Picture1.png](/.attachments/Picture1-a1578656-e017-4820-964d-ae3dcfffecef.png)
*Image Description: Diagram illustrating the architecture of the Azure DevOps and GitHub Scanners, including Azure Function applications, Azure Storage Account, Event Grid, and SARIF Processing Function.*

## Recommendations

For the Public Preview release, there will be 13 recommendations in Microsoft Defender for Cloud (MDC) that are related to DevOps Hardening. 5 of these recommendations are for Azure DevOps and the remaining 8 are for GitHub. These recommendations update every eight hours, but the official Service Level Agreement (SLA) for customers is 24 hours.

The recommendations and relevant resource types being assessed are as follows:

| Source       | Resource Type                                                                                                                        | Description                                                                                                                                                                                               | Recommendation(s)                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure DevOps | [Service Connection](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml) | Connections that are used in Azure Pipelines to connect to external and remote services for executing tasks in a pipeline job (e.g., deploy a resource from an Infrastructure-as-Code template to Azure). | - Do not use Azure Classic connections.<br>- Do not make service connections accessible to all pipelines.                                                                                                                           |
| Azure DevOps | [Variable Group](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml)       | Groups that store values and secrets that are passed into YAML pipelines. Secret variables are protected resources.                                                                                       | - Do not grant all pipelines access on variable groups with secrets.                                                                                                                                                                 |
| Azure DevOps | [Secure File](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/secure-files?view=azure-devops)                       | Protected resources that can be shared across pipelines. Typical files include signing certificates, SSH keys, and Apple Provisioning Profiles.                                                           | - Do not make secure files accessible to all pipelines.                                                                                                                                                                              |
| Azure DevOps | [Build](https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/what-is-azure-pipelines?view=azure-devops)              | Pipelines that automatically build and test code projects.                                                                                                                                                | - Do not make secrets accessible to forked builds.                                                                                                                                                                                   |
| GitHub       | [Organization/Owner](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations)        | Shared accounts where businesses can collaborate across many projects at once, with built-in security and administrative features. Each organization can have one or more repositories.                   | \- Automatically enable secret push protection for new repositories.<br>\- Action workflows should have read-only permissions by default.<br>\- Allow minimum base permissions.<br>\- Have minimum required number of administrators. |
| GitHub       | [Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories)                          | Containers used to manage code and collaborate with others. A repository contains all files and each files revision history.                                                                             | \- Enable secret scanning push protection.<br>\- Do not allow force pushes to the default branch.<br>\- Protect default branch.<br>\- Self-hosted runners should not be used to run action workflows.                                 |

# Troubleshooting Guide (TSG)

For each of the queries below, get the connector identifier (ID) you are looking for and then add an additional file for -> body contains [connector ID]:

* Geneva logs for Publish Scan Connector Orchestrator Function App: [Geneva Logs](https://portal.microsoftgeneva.com/s/D737270D)
* Geneva logs for Azure DevOps Scanner Config Update Processor (creates a config file for Azure DevOps Scanner tool): [Geneva Logs](https://portal.microsoftgeneva.com/s/4352E62D)
* Geneva logs for GitHub Scanner Config Update Processor (creates a config file for GitHub Scanner tool): [Geneva Logs](https://portal.microsoftgeneva.com/s/737FF871)
* Geneva logs for Static Analysis Results Interchange Format (SARIF) processor that processes the SARIF file generated by the Azure DevOps and GitHub Scanner tools and sends them to Microsoft Defender for Cloud (MDC): [Geneva Logs](https://portal.microsoftgeneva.com/s/4402E318)

**Create Incident Management (ICM)** - [Create Incident - Incident Management (ICM) Template#733O2J](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=733O2J)

# Frequently Asked Questions (FAQs)

1. If a connector, repository/organization, or resource is removed, when will it be deleted from Microsoft Defender for Cloud (MDC)?

   1. Recommendations are deleted when Organizations/Projects/Repositories are deleted in Azure DevOps and GitHub after approximately 5 days since it was last seen.
   2. Recommendations are deleted when Connectors are deleted from Microsoft Defender for Cloud (MDC) after approximately 5 days.
   3. Resources (e.g., Service Connections) are deleted within 48 hours from when they were deleted in the Source Code Management (SCM). A Deletion Function runs every four hours to retrieve all DevOps Hardening resources that haven't been updated in the last 48 hours from the Cosmos Database (DB) Inventory instance. When resources are discovered, the function calls the Publish Delete DevOps Hardening Resource Message Function for each resource to be deleted. If the delete fails, the next run will attempt to delete the same data again.

![Picture2.png](/.attachments/Picture2-9d0a63ef-9bfb-497f-9bbe-5908906bb4c3.png)
*Image Description: Flowchart detailing the process of resource deletion and communication between various functions involved in DevOps Hardening.*

2. How will DevOps Hardening be billed?

DevOps Hardening is part of Foundational Cloud Security Posture Management in Microsoft Defender for Cloud (MDC), which is provided for free. The customer must configure the Azure DevOps and GitHub connectors to benefit from this feature. Ingestion of the findings to the Cloud Map for Attack Path Analysis and Cloud Security Explorer capabilities are only part of the paid Defender Cloud Security Posture Management offering.

# Resources

* [GitHub Scanner Docs (Internal)](https://congenial-couscous-61517bde.pages.github.io/)
* [Azure DevOps Scanner Docs](https://github.com/azsk/ADOScanner-docs)
* [DevOps Hardening Overview - Customer Service  Support (CSS).pptx](https://microsoft.sharepoint.com/:p:/t/CSPMDevSecOpsTeam/Eal6dfIbpnVJt1prYaZu5CkBrXQV44nsvMKfcLLPQFcBjg?e=7lgJe6)

## For Other Issues Related to DevOps Security

* [How to delete GitHub connector on customer's behalf - Overview (azure.com)](https://dev.azure.com/SecurityTools/DefenderForDevOps/_wiki/wikis/DefenderForDevOps.wiki/2262/How-to-delete-GitHub-connector-on-customer's-behalf)
* [Unable to find Azure DevOps Organization Error (KeyNotFoundException) when creating Azure DevOps Connectors - Overview](https://dev.azure.com/SecurityTools/DefenderForDevOps/_wiki/wikis/DefenderForDevOps.wiki/2237/Unable-to-find-Azure-DevOps-Organization-Error(KeyNotFoundException)-when-creating-ADO-Connectors)
* [Troubleshooting Connector Creation Issues - Overview (azure.com)](https://dev.azure.com/SecurityTools/DefenderForDevOps/_wiki/wikis/DefenderForDevOps.wiki/2147/Troubleshooting-Connector-Creation-Issues)
* [Common Errors and Resolution - Overview (azure.com)](https://dev.azure.com/SecurityTools/DefenderForDevOps/_wiki/wikis/DefenderForDevOps.wiki/2145/Common-Errors-and-Resolution)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
