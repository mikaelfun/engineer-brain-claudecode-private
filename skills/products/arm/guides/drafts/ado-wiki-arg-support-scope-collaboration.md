---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Graph/Process/Support scope and collaboration scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Graph%2FProcess%2FSupport%20scope%20and%20collaboration%20scenarios"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Support scope
The PaaS developer POD ARM vertical is responsible for all PowerShell cmdlets, CLI commands and REST APIs that interact with the **Microsoft.ResourceGraph** resource provider. The RP itself is also part of the support scope.

### ARG Explorer
Unlike most experiences in the Azure Portal where the RP also builds the UI for its service, the ARG Explorer is built and owned by the Azure Portal PG.

For ARG Explorer (strictly UI related) related issues, we can escalate to ARG PG and they will transfer the IcM over to the Portal Experience team.

### Queries
All Kusto Query Language supported in ARG queries is also within scope. This includes syntax and authoring questions.

Authoring might require collaborations to identify which specific resource types or properties contain the information the customer requires.

### Table data
Although ARG caches the data from multiple sources, issues with the data on ARG tables might need to go to the specific RP.

#### Resources and Resource Containers table
Data for this table comes from RP APIs, therefore, if the data is incorrect on the API, it will be incorrect in ARG. Those issues need to be addressed by the RP. ARG ingests the data for this tables, which means the ingestion process and the consistency with APIs is within ARG scope. ARG team has full ownership on the `resources` and `resourceContainers` tables.

##### Tracked resources
All tracked resource types are available in ARG by default.

##### Proxy resource types
Proxy resource types need to be onboarded by the RP for them to become available in ARG. Whether a resource is supported or not in ARG, can be checked on [Azure Resource Graph table and resource type reference](https://learn.microsoft.com/en-us/azure/governance/resource-graph/reference/supported-tables-resources).

> Asks to support a proxy resource type to ARG need to go to the RP team, as it is the RP who needs to onboard the resource type into ARG.

#### Resource specific tables
Table data on tables like `securityResources` or `policyResources` (among others) is fed into ARG by the RP, therefore, if the data is lagging or inconsistent with RP APIs, the RP needs to investigate on why the data ingestion process is not working correctly.

## Collaboration scenarios

### RPs calling into ARG
When a RP calls into ARG (either from backend or UI), the query is usually hardcoded into the service. The RP would own client related issues (a bad request like a 400 for instance), and ARG would own service side issues (errors 5xx).

For data related issues, look at the support scope table data section to determine if ARG owns the data or the RP does.

### Authoring questions
ARG team can collaborate with other teams to find out the specific resource type or property that would contain the information the customer is looking for.
