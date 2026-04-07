---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Troubleshooting Guides/Find the right alias"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FTroubleshooting%20Guides%2FFind%20the%20right%20alias"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## What do you need to start?
The resource type and properties that will be evaluated.

## Where do we look for the alias?
There are a few ways to get the list of supported aliases.

### From PowerShell
`(Get-AzPolicyAlias -NamespaceMatch '{providerNamespace}' -resourceTypeMatch '{resourceType}').Aliases`

Example:

`(Get-AzPolicyAlias -NamespaceMatch 'Microsoft.Compute' -resourceTypeMatch 'virtualMachines').Aliases`

### From CLI
`az provider show --namespace {providerNamespace} --expand "resourceTypes/aliases" --query "resourceTypes[].aliases[].name"`

Example:

`az provider show --namespace Microsoft.Compute --expand "resourceTypes/aliases" --query "resourceTypes[].aliases[].name"`

## What now?
### Identify what aliases are applicable for the resource type
You can determine for which type the alias is created based on the last `/` in the alias.

An alias will always have one segment more than the resource type (where each segment is separated by a `/`).

For example, on the alias `Microsoft.Network/networkSecurityGroups/securityRules/access` the property being accessed is **access** and the resource type for the alias is **Microsoft.Network/networkSecurityGroups/securityRules**.

Another alias that is similar to the one above is `Microsoft.Network/networkSecurityGroups/securityRules[*].access`. Do notice the location of the last `/` on this one, this indicates the property being accessed is **securityRules[*].access** and the resource type this alias is for is **Microsoft.Network/networkSecurityGroups**. If the policy definition contains a condition that evaluates for a specific type, the aliases must match the type being evaluated.

By identifying the aliases applicable for your type and knowing what property needs to be evaluated, you should be able to locate the right alias needed at this point.

### But what if this is an array alias?
- Use the `property[*].{property}` alias if evaluating a specific value inside the array.
- Use the `property[*]` alias if evaluating one position of the array (from `{` to `}`).
- Use the `property` alias if evaluating the whole array (from `[` to `]`).

See [[ARCH] Policy aliases - Array aliases](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623673/Policy-aliases?anchor=array-aliases) for a more detailed explanation.

Once you know what aliases to use, you can get back to writing your policy definition.
