---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Blueprint/Process/Support scope and collaboration scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Blueprint%2FProcess%2FSupport%20scope%20and%20collaboration%20scenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Azure Blueprints functionality

The ARM team supports everything related to the Microsoft.Blueprint resource provider. This includes Blueprint assignments, definitions and artifacts, and the deny assignment used by the blueprint assignment to lock resources.

As with any other RP, the team that supports the RP, is also responsible to support its corresponding Portal experiences, CLI commands, PowerShell cmdlets, SDK libraries and APIs.

## Built-in blueprint samples

Microsoft provides a set of Azure Blueprint sample definitions targeting specific industry regulations and compliance requirements.  This offering essentially takes the concepts from the "Security and Compliance Blueprints" and puts them into the "Azure Blueprint" managed service as a pre-built definition that customers can then save as a Blueprint into their tenant, modify as desired, and deploy into their subscriptions using the standard Azure Blueprint service.  

A list of available blueprint samples is available at [[Portal] Create blueprint - Microsoft Azure](https://ms.portal.azure.com/#blade/Microsoft_Azure_Policy/CreateEditBlueprintsBlade).

## Supporting blueprint samples
There are generally 3 categories of issues or scenarios

### Technical problems during the deployment
1. Troubleshoot using standard Blueprint and ARM deployment troubleshooting processes, with support ownership of resource provider specific issues going to the team that owns those resources.  For example, if an IaaS VM fails during the deployment, then engage the IaaS support team.
2. Scripts and DSC in the blueprint will be supported just like any other customer script.

### Bugs in the blueprint scripts or ARM templates
If a problem is found in the blueprint itself engage the PG via ICM.

### Compliance or implementation questions
CSS does not provide support for the content or workload of the blueprint, for example questions about compliance, questions about how to integrate the blueprint into the customer's environment, questions about how to customize the blueprint, etc.  See below for guidance on handling specific issues.
1. Compliance related questions should be directed to the Blueprint's supporting documentation and to [Service Trust Portal](https://servicetrust.microsoft.com/) and [Microsoft Trust Center](https://www.microsoft.com/en-us/trustcenter/default.aspx). 
    - Customers can find details about how each control maps to the policies included in each regulatory Blueprint/regulatory initiative here ([[LEARN] Azure Blueprints samples](https://learn.microsoft.com/en-us/azure/governance/blueprints/samples/)). 
    - The mappings given do not necessarily indicate a strict requirement for implementing a specific control, nor does it indicate a guarantee that a specific control is implemented. We provide the mappings as a recommendation that customer should validate is appropriate for his environment. 
    - Customer is always responsible for thorough review of his Azure environment to ensure compliance with a framework. Microsoft cannot guarantee compliance status for customer's azure environment to any of the frameworks. Microsoft is providing indicators for customers to use so that customers can determine compliance state.
    - If the customer still needs assistance with compliance questions or implementation in their specific environment, you can direct them to their TAM or sales rep (or [Contact Sales](https://azure.microsoft.com/en-us/overview/sales-number/))
2. Azure resource related questions (i.e., changing the NSG settings on the subnet created in a blueprint, or adding certificates to an ASE environment) would be supported like normal by engaging the appropriate support team.  This support would be provided completely outside the scope of the Blueprint itself and CSS can't determine what impact it might have on the larger blueprint architecture or the compliance.

When in doubt, engage the [Blueprints SME channel](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623625/Start-Here?anchor=sme-channel).
