---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/Microsoft Defender for Cloud Granular pricing and Resource level billing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/Microsoft%20Defender%20for%20Cloud%20Granular%20pricing%20and%20Resource%20level%20billing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Granular Pricing and Resource Level Billing

## API Version 2024-01-01

- 100% backward compatible
- Supports all existing subscription-level pricing capabilities
- Expands pricing API to support resource-level pricing

## REST API Usage

### GET pricing for a resource

```
GET https://management.azure.com/{scopeId}/providers/Microsoft.Security/pricings/{pricingName}?api-version=2024-01-01
```

Example:
```
GET https://management.azure.com/subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroup}/providers/Microsoft.Compute/virtualMachines/{VM}/providers/Microsoft.Security/pricings/VirtualMachines?api-version=2024-01-01
```

### UPDATE pricing

```
PUT https://management.azure.com/{scopeId}/providers/Microsoft.Security/pricings/{pricingName}?api-version=2024-01-01
```

Body: `"pricingTier": "Free"` to disable, `"pricingTier": "Standard"` to enable.

### Supported Bundle Names

`VirtualMachines`, `SqlServers`, `AppServices`, `StorageAccounts`, `SqlServerVirtualMachines`, `KubernetesService`, `ContainerRegistry`, `KeyVaults`, `Dns`, `Arm`, `OpenSourceRelationalDatabases`, `CosmosDbs`, `Containers`, `CloudPosture`, `Api`

## Azure Policy for Bulk Operations

| Policy | Definition ID |
|---|---|
| Enable Defender for Servers | `8e86a5b6-b9bd-49d1-8e21-4bb8a0862222` |
| Disable for all resources | `f6ff485a-7630-4730-854d-cd3ad855435e` |
| Enable P1 for tagged resources | `9e4879d9-c2a0-4e40-8017-1a5a5327c843` |
| Enable P1 for all resources | `1b8c0040-b224-4ea1-be6a-47254dd5a207` |
| Disable for tagged resources | `080fedce-9d4a-4d07-abf0-9f036afbc9c8` |

Note: Definition Id prefixed with `/providers/Microsoft.Authorization/policyDefinitions/`

## Investigating Granular Pricing with Kusto

```kusto
let lastCorrelationAzure = GetCurrentCorrelationId_Environments_Azure();
cluster('ascentitystoreprdeu.westeurope.kusto.windows.net').database('MDCGlobalData').Environments
| where TimeStamp >= toscalar(lastCorrelationAzure)
| where HierarchyId == "{subscriptionId}"
| where EnvironmentName == "Azure"
| where Level == "Resource"
| extend parts = split(Scope, '/')
| extend ResourceGroupName = tostring(parts[4])
| extend ResourceProvider = tostring(parts[6])
| extend ResourceType = tostring(parts[7])
| extend ResourceName = tostring(parts[-1])
| project TimeStamp, SubscriptionId=HierarchyId, ResourceName, ResourceType, ResourceProvider, ResourceGroupName,
Level, SecurityConnector, Plans, FreePlans, TenantId
```

## Troubleshooting

| Error | Solution |
|---|---|
| ScopeId not valid | Use valid Azure resource ID |
| Plan name not supported | Verify bundle name from supported list |
| Parent subscription enforces pricing | Set Enforce to false on subscription |
| Only P1 supported for resource-level | Resource-level only supports P1 subplan |

## References

- [Resource-level billing change blog](https://techcommunity.microsoft.com/t5/microsoft-defender-for-cloud/resource-level-billing-change-for-defender-for-servers-customers/ba-p/4098143)
- [Enable at Resource Level docs](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan#enable-defender-for-servers-at-the-resource-level)
