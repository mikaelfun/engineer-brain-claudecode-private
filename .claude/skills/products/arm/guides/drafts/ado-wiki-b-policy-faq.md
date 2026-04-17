---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Policy FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FPolicy%20FAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Does Policy have Private Previews?
Policy Private Previews are under NDA, and they are handled directly by PG. If your customer is interested in joining private previews please refer them to policypm@microsoft.com.

## Does Policy support RegEx?
Not yet, but this is on the roadmap. There is no public ETA at this point. Customers can upvote this request in [Ideas](https://feedback.azure.com/d365community/idea/44a736be-f324-ec11-b6e6-000d3a4f0da0).

## Can alerts be created based on Policy events?
Policy does not support creating alerts as built-in functionality. However, Policy is supported as an Event Grid system topic. Through the system topic, customers can subscribe to compliance state changes, and integrate the functionality with other solutions. See [[LEARN] Reacting to Azure Policy state change events](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/event-overview)

## How do I export Policy compliance data?
We currently do not support exporting compliance data through the portal. This is currently possible using Azure Resource Graph or you can export compliance data through a [Rest API and/or Command line call](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/get-compliance-data).

## How can I get information on what's to come for Azure Policy?
If you are interested in getting more information on what the Azure Policy team is doing, join the monthly call on Azure Governance [here](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRxPH3jrBa8ZLgoOwxx0Zj5BUQlNBMTZPQVZJRzFYNjBQUDhMSVUwTDRISi4u).

## Who owns the built-in Policies and can make changes to them?
Built-in policies are owned by various engineering teams across Microsoft. The [[ADO] PolicyMetadata](https://msazure.visualstudio.com/One/_git/mgmt-Governance-Policy?path=/settings/BuiltInPolicies/PolicyMetadata.json&_a=contents&version=GBmaster) file contains a mapping from the Policy Definition Id to the [Service Tree](https://aka.ms/servicetree) Id of the team that owns the service. If the Service Tree Id is missing (or 000-000...) you can reach out to the [[ADO] Policy PG](https://msazure.visualstudio.com/One/_git/mgmt-Governance-Policy?path=/settings/BuiltInPolicies/owners.txt&_a=contents&version=GBmaster).
