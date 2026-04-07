---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/How to Collaborate with Automation Account Team"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FHow%20to%20Collaborate%20with%20Automation%20Account%20Team"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collaborating with the Azure Automation Account Team

[[_TOC_]]

## Background

Azure Automation Runbooks utilize Azure Container Instances (ACI) as a backend to execute PowerShell scripts. The customer is not aware of the underlying infrastructure used by the product team. Engineers from the Automation Account team frequently assign collaboration tasks to the ACI support team via SAP (Azure\Container Instances\Configuration and Setup\Unable to deploy Windows ACI).

## Collaboration Guidelines

_For AKS Collaboration Owners:_

Please refrain from contacting the customer directly. Always communicate with the case owner.

[Kusto Repo ACI](/Azure-Kubernetes-Service-Wiki/ACT-Team/Tools/Kusto-Repo/Kusto-Repo-ACI)

_For Case Owners:_

Task note should including ACI resource ID issue description

**Known Issues:**

- [Known issues in ACI](https://supportability.visualstudio.com/AAAP_Code/_queries/query/?tempQueryId=0d3c4e4b-9e70-403a-8730-d8e5af5136cb)
- [known issues and limitations in docs](https://learn.microsoft.com/azure/automation/automation-runbook-types?tabs=lps72%2Cpy10#limitations-and-known-issues)
- [KI: Azure PowerShell cmdlet returns HttpRequestException](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1696336/KI-Azure-PowerShell-cmdlet-returns-HttpRequestException)
- [HT: Identify memory issues while jobs are running in ACI](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1696219/HT-Identify-memory-issues-while-jobs-are-running-in-ACI)

[Reference TSG: Debug container-based automation cloud job](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/745742/TSG-Debug-container-based-automation-cloud-job?anchor=known-issues)
