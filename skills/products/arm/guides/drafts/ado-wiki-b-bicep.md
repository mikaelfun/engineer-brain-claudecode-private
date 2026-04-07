---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/Bicep"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FBicep"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Bicep is a Domain Specific Language (DSL) for deploying Azure resources declaratively. It aims to drastically simplify the authoring experience with a cleaner syntax and better support for modularity and code re-use. Bicep is a transparent abstraction over ARM and ARM templates, which means anything that can be done in an ARM Template can be done in bicep (outside of temporary known limitations). All resource types, apiVersions, and properties that are valid in an ARM template are equally valid in Bicep on day one.

Bicep compiles down to standard ARM Template JSON files, which means the ARM JSON is effectively being treated as an Intermediate Language (IL).

## Links

- [[LEARN] What is Bicep?](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/bicep-overview)
- [[GH] Project repo - Bicep](https://github.com/Azure/bicep)
- [[Process] Support scope and collaboration scenarios - Bicep](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623776/Support-scope-and-collaboration-scenarios?anchor=bicep)
- [VS code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep)
