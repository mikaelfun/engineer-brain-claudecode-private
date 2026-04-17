---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Glossary"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FGlossary"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## AINE
AuditIfNotExists. See [Policy effect](#Policy-effect).
## Alias
Aliases in Azure Policy are a list of fields that are mapped to the resource properties. The links to those properties are api-version agnostic, which means an alias knows what the correct path (and other metadata) is for a property for all api-versions that resource supports. See [Policy aliases](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623673/).
## Applicability
Result of conditions to determine whether a resource will be scanned by the policy or not. See [[LEARN] What is applicability in Azure Policy?
](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/policy-applicability).
## Brownfield
Brownfield evaluation determines compliance state for already existing resources. It is done by calling resources or collection GETs and it is evaluated over the payload of the responses of those GET requests.
## Control Plane
Calls and properties that exists at the ARM layer, as opposed to a specific endpoint that calls the RP directly.
## CP
See [Control Plane](#Control-Plane).
## CRUD operation
Create/Update operation.
## Data Plane
Calls and properties that do not exist at the ARM layer, these usually go straight to a resource provider endpoint.
## DINE
DeployIfNotExists. See [Policy effect](#Policy-effect).
## DP
See [Data Plane](#Data-Plane).
## Greenfield
Greenfield evaluation is initiated by a CRUD operation, i.e., a PUT/PATCH operation. It is evaluated in real time over the incoming payload of the PUT/PATCH request.
## HAR trace
HAR stands for Http Archive. A HAR trace allows us to see API requests and responses including headers, host and body, from the client side.
Related topics:
- Policy: [[TSG] Get right resource payload](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623716/)
## Policy Effect
Specifies the type of behavior policy will apply over the resources.
## Resource payload
## Resource Provider Contract
## Resource Provider Manifest
The Resource Provider Manifest provides RPs a mechanism for configuring and customizing ARM's handling of said RP. In order to route requests to a RP, a manifest is required.
## RPC
See [Resource Provider Contract](#Resource-Provider-Contract).
## Top level properties (Policy)
These properties are not resource specific. They are called top level properties because they are outside of the `"properties"` object of the resource json representation.

Top level properties do not require aliases and can be used directly instead of an alias as follows:
- `"field":"name"`
- `"field":"fullname"`
- `"field":"id"`
- `"field":"kind"`
- `"field":"location"`
- `"field":"identity.type"`
- `"field":"tags"`

Refer to [[LEARN] Azure Policy definition structure - Fields](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure#fields) for more information.
## UI
User Interface, mainly used to refer to the Azure Portal
