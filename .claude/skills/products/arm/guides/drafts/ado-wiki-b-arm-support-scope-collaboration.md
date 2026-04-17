---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Process/Support scope and collaboration scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FProcess%2FSupport%20scope%20and%20collaboration%20scenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## General intro
ARM (Azure Resource Manager) consists of two layers - the ARM service itself, and the Resource Providers:
- ARM Service provides common features such as:
  - Management API and SDKs
  - Resource Locks and Tags
  - Azure Policy
  - AAD Authentication and RBAC authorization
  - Templates and Deployments
  - Resource Groups and Management Groups
  - Activity Logs
- Resource Providers provide Azure services such as:
  - Compute Resource Provider (CRP, Microsoft.Compute) - IaaS VMs, PaaS Cloud Services
  - Storage Resource Provider (SRP, Microsoft.Storage) - Storage accounts
  - Network Resource Provider (NRP, Microsoft.Network) - Load Balancers, Public IP addresses, Virtual Networks, etc
  - SQL (Microsoft.Sql) - SQL Databases
  - etc

## Support ownership
Support ownership is generally divided among these two layers, with a few exceptions such as RBAC and Marketplace.
  - ARM Service is owned by the Azure PaaS Developer pod
    - General ARM issues that are not resource provider specific. This means things that are provided directly by ARM such as Locks, Policies, Resource Groups, Tags, etc.
    - Deployment or Template related issues where the underlying failing resource provider cannot be identified (ie. a generic non-RP error from an ARM deployment) or a question about how to use general ARM template syntax and functions such as createArray or parameter files.
    - A general rule of thumb is that if the feature is documented under https://learn.microsoft.com/en-us/azure/azure-resource-manager/ then it is probably ARM service related.

  - Resource Providers are owned by the team that owns the underlying Azure service
    - For example, the IaaS pod owns the Microsoft.Compute resource provider and the Networking pod owns the Microsoft.Network resource provider, etc.
    - All aspects of the resource provider are owned by the team that owns the Azure service, this includes things such as the REST APIs and SDKs, Powershell cmdlets, ARM template syntax, deployment failures, service specific details in the ARM activity logs, etc.

  - Exceptions
    - AAD Authentication is a standard AAD issue owned by the AAD team.
    - RBAC is owned by the AAD team, but resource provider specific issues are owned by the team that owns the underlying resource provider or service.
    - Marketplace offerings are supported by the 3rd party that is providing that offering.

### Bicep
**Azure/Azure Resource Manager (ARM)/ARM Templates/Bicep**

ARM team has ownership on:
- Bicep syntax.
- Bicep compiler and de-compiler.
- Compiled ARM templates.

ARM team does **not** have ownership on (Each resource provider owns this):
- What values to provide to resources to enable/disable/configure a specific service feature.
- What properties a resource requires to accomplish a specific service configuration.
- Recommendations on what properties to declare on a specific resources.

### Copilot
Copilot for Azure includes handlers for Azure CLI and Az PowerShell module.

Any copilot use case is supported within the same boundaries currently existing outside of Copilot usage. ARM will own the AzCLI and PowerShell scenarios under the same boundaries those two clients are supported already.

In addition, the AzCLI and Az PowerShell product group has ownership of the Copilot handler for these two clients. Any issue with the handler itself is in the CSS ARM team support boundary.

### Portal
The Azure Management Portal (i.e. Ibiza, https://portal.azure.com) is divided into two main support ownership scenarios:

1. Portal-wide scenarios are owned by IaaS team (Use routing Azure/Portal).
2. Resource provider scenarios are owned by the team that owns that resource provider.

> Some SAPs within the **Azure/Portal** support product route to ARM supported queues.

### SDK Support
**Azure/Azure Resource Manager (ARM)/Client Tools/SDK**

Support for the Azure SDK is the same as it is for the management portal, ARM Templates, Powershell, CLI, REST API, etc. **Essentially, each team that owns an Azure service also owns all of the management interfaces for that Azure service.**

Escalation path for SDK issues:
1. Collab task to Azure Resource Manager (ARM) for generic SDK/dev related issues.
2. IcM to PG that owns the underlying Azure service.
3. IcM to [Azure SDK team](https://aka.ms/AzureManagementAPI_ICM) for SDK-specific issues (retry policies, connection failures, dependencies).

### Tags
**Azure/Azure Resource Manager (ARM)/Resource Management/Tags**

Tags as a feature is supported by ARM. Tag-related APIs like querying by tag or getting the list of existing tags on a subscription are scenarios the ARM team would support.

Tags are stored by the resource provider - if a request to add a tag is successful but the tag is not stored, that would be an RP-owned scenario.

#### Tags & Billing
Cost management leverages tag information for reports from billing data that each resource provider sends to Billing. ARM does not participate on this flow - billing tag issues go to Billing team + RP team.

### Template Specs
If problem is deemed specific to **Template Specs**, collaborate with ARM team by routing to **Azure/Azure Resource Manager (ARM)/ARM Templates/Template Specs**.

### Terraform
**Azure/Azure Resource Manager (ARM)/Client Tools/Terraform**

Terraform offering on Azure consists of 2 layers:
- Hashicorp Terraform Engine
- Terraform AzureRM or AzAPI providers

Support ownership:
- Hashicorp Terraform Engine and AzureRM/AzAPI providers: ARM team supports break/fix errors and setting up issues; may escalate to AzureRM PG or Hashicorp for core engine issues.
- Terraform Resource Provider configuration: Owned by the team that owns the underlying Azure service.

## Customer Experience
There is no top-level support product for ARM that customers can select when creating a support incident. Customers reach ARM team through internal routing from other CSS engineers.
