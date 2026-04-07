---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Terraform/Terraform on Azure"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Architecture/Terraform/Terraform on Azure"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Terraform Azure providers

### AzureRM provider
Official Azure provider owned by Hashicorp but maintained both by Hashicorp and Microsoft. It allows users to manage stable Azure resources and their control plane configuration.

Each version of the AzureRM provider is hardcoded to specific supported resources, properties and API versions — any API version change or missing resource or property requires a new provider version to be released.

### AzAPI provider
Allows users to manage Azure resources and functionality using the Azure Resource Manager APIs directly. It acts as a thin layer on top of the Azure ARM REST APIs.

Benefits:
- Supports all Azure services (private preview, public preview, all API versions)
- Full Terraform state file fidelity
- No dependency on swagger
- Common and consistent Azure authentication

### Transition between providers
1. While the service or feature is in preview, use the AzAPI provider.
2. Once the service is officially released, use the AzureRM provider.

The AzAPI2AzureRM tool helps users migrate from the AzAPI provider to the AzureRM provider.

## Azure Export for Terraform (aztfexport)
Formerly known as Terrafy (aztfy). Allows you to import state and configuration from existing Azure resources. Supported through GitHub only.

In Terraform version 1.5.0, HashiCorp introduced "Import Block" — native functionality for importing remote resources into Terraform state and generating corresponding configuration.
