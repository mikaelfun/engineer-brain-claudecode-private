---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Get ARM template hash"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FGet%20ARM%20template%20hash"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Every deployment in Azure generates a hash based on the content of the template.

This hash is calculated using the Murmurhash64 algorithm off the **template** property of a **Microsoft.Resources/deployments PUT request.** If the property value is the same across multiple deployments, the calculated hash does not change.

Although the hash is calculated automatically on every deployment, it is possible to determine the hash of a template without deploying it using this API: [[REST API] Deployments - Calculate Template Hash](https://learn.microsoft.com/en-us/rest/api/resources/deployments/calculate-template-hash)

On a deployment, this hash is stored in **ARMPRODGBL** Kusto cluster > **Deployments** database > **Deployments** table > **templateHash** property.

The above API and Kusto reference can be used to determine the customer has provided the right template for a deployment.
