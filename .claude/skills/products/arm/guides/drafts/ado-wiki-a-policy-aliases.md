---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy aliases"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20aliases"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Policy Aliases — Reference Guide

## What is an Alias?

Aliases in Azure Policy are a list of fields mapped to resource properties. The links to those properties are **api-version agnostic** — an alias knows the correct path (and other metadata) for a property across all API versions that resource supports.

Aliases are **generated automatically** based on resource provider Swagger definitions.

### Example

The alias `Microsoft.Network/dnsZones/numberOfRecordSets` maps to the property at path `properties.numberOfRecordSets` on the `Microsoft.Network/dnsZones` resource type.

```json
{
  "id": "/subscriptions/{subscriptionId}/resourceGroups/{rg}/providers/Microsoft.Network/dnsZones/zone1",
  "properties": {
    "maxNumberOfRecordSets": 5000,
    "numberOfRecordSets": 2,
    "nameServers": ["ns1-01.azure-dns.com", "..."]
  }
}
```

The alias `Microsoft.Network/dnsZones/numberOfRecordSets` would return `2`.

## Determining the Resource Type from an Alias

The resource type is determined by the path **up to the last `/`** in the alias:

- `Microsoft.Network/networkSecurityGroups/securityRules/access`
  → property: **access**, resource type: `Microsoft.Network/networkSecurityGroups/securityRules`

- `Microsoft.Network/networkSecurityGroups/securityRules[*].access`
  → property: **securityRules[*].access**, resource type: `Microsoft.Network/networkSecurityGroups`

> ⚠️ If a policy definition has a condition that evaluates for a specific `type`, the aliases used **must match** that type.

## Array Aliases

Array aliases use `[*]` notation to indicate an array property. There are three variations:

### 1. `securityRules[*].access` — Property of each array element (iterating)
Returns the value of `access` for each position in the array. Policy evaluates by **iterating** — result: `[Allow, Allow]`.

### 2. `securityRules[*]` — Each full array element (iterating)
Returns each complete element object one at a time. Policy evaluates each element separately in iteration.

### 3. `securityRules` — The whole array (no iteration)
Returns the entire array from `[` to `]`. Policy evaluates the whole array at once. Useful for functions like `length()` to count array members.

## Troubleshooting Tips

- **Wrong alias type causing unexpected compliance**: Verify whether you need `[*].property` (per-element iteration) vs. the whole array alias. Using the wrong form often causes incorrect policy evaluation.
- **Alias not found for a property**: Check if the property exists in the resource provider's Swagger. If a new API version added a property, the alias may exist but only for recent API versions.
- **Finding the right alias**: See TSG → [Find the right alias](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623713/)
- **Array alias evaluation deep dive**: See ARCH → [Array aliases evaluation](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623659/)
