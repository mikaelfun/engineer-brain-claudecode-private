---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/Extensibility Providers"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FExtensibility%20Providers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Core ARM deployment functionality allows users to manage resources through the management plane (ARM APIs), for every resource provider in Azure.

To allow further management extensibility, ARM deployments and Bicep have implemented extensibility providers.

Extensibility providers allow users to manage additional Azure entities through their same Bicep code.

## Available extensibility providers

- **Kubernetes**
- **Graph**

These extensibility provider entities can be identified within the Bicep code with the following syntax:

```
{provider}:{type}@{version}
```

## Architecture

The extensibility provider implementation covers two areas:
- Bicep syntax for template authoring using the provider entities.
- ARM deployment handling for the extensibility provider entities.

The ARM deployment engine has been updated to be able to handle these non-resource entities and will forward these calls to specific extensibility providers (custom implementation) that will take care of the rest of the process.

Therefore, these extensibility provider entities are **not** processed as PUT operations to resource providers, but instead, passed on to the corresponding extensibility provider that will have its own implementation and processing.

Overall, the rest of the flow (Bicep > JSON > Deployment creation > JSON processing in ARM engine) works exactly the same.
