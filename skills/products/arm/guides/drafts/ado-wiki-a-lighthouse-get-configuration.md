---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Lighthouse/Troubleshooting Guides/Get Configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Lighthouse%2FTroubleshooting%20Guides%2FGet%20Configuration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

The configuration for Azure Lighthouse is determined based on the properties of the **Microsoft.ManagedServices/registrationAssignments** and **Microsoft.ManagedServices/registrationDefinitions** resources on the delegated scopes.

See below for the different methods in which this data can be retrieved for troubleshooting.

## From our tools
### Lighthouse ASC tab
On a delegated subscription, go to **Resource Explorer** > Click on the subscription > **Azure Lighthouse** tab

### Azure Resource Graph ASC tab
On a delegated subscription, go to **Resource Explorer** > Click on the subscription > **Resource Graph** tab.

Then query the **managedservicesresources** table.

### From Jarvis
Use the **Get resources from provider** Jarvis action to list the **Microsoft.ManagedServices/registrationAssignments** and **Microsoft.ManagedServices/registrationDefinitions** resources on the delegated subscription.

## From customer side
### From the Azure Portal
On the Azure Portal, navigate to the **Azure Lighthouse** service.

From a delegated subscription, the **Delegations** blade will show the delegation information.

### From ARG
On a delegated subscription, query the **managedservicesresources** table.

### From the API
On a delegated subscription, list the respective configurations for registration assignments and registration definitions via the REST APIs.

- [[REST API] Registration Assignments - List](https://learn.microsoft.com/en-us/rest/api/managedservices/registration-assignments/list?view=rest-managedservices-2022-10-01&tabs=HTTP)
- [[REST API] Registration Definitions - List](https://learn.microsoft.com/en-us/rest/api/managedservices/registration-definitions/list?view=rest-managedservices-2022-10-01&tabs=HTTP)
