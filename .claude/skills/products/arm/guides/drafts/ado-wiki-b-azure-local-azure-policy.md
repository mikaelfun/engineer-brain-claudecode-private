---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Workloads/Azure Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FCustomer%20Scenarios%2FWorkloads%2FAzure%20Policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enforce standards through policies when creating new resources on Azure Local disconnected

Azure Policy ensures compliance with organizational standards by comparing resource properties to business rules. These rules, described in JSON format, are known as policy definitions. You can assign these rules to various scopes, such as subscriptions or individual resources within the Resource Manager scope.

For Azure Local disconnected operations, policy enforcement supports Arc-enabled Kubernetes and Arc-enabled servers. Operators can enable these policies by creating policy assignments on the target scope using the disconnected operations portal or CLI.
