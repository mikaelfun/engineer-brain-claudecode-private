---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Tags"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Architecture/Tags"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## What are tags in Azure?

Tags are metadata you can add to Azure resources, resource groups, and subscriptions to logically organize them into a taxonomy. Each tag consists of a name and a value pair. For example, you can apply the name **Environment** and the value *Production* to all the resources in production.

> We can also refer to tag **names** as tag **keys**.

## Where are tags stored?

Tags are stored by each resource provider along with the properties for that specific resource. This means **the resource provider is the source of truth** for what tags are assigned to a resource.

As part of the ARM cache, tags are also cached in the ARM layer. Based on this cache, ARM can allow to query resources based on a specific tag name and value, or provide a list of tag names and values available across the subscription.

This is the reason why Tags are a feature that is owned by the Azure Resource Manager team.

## Case sensitivity

Tag names are case-insensitive for operations. A tag with a tag name, regardless of casing, is updated or retrieved. However, the resource provider might keep the casing you provide for the tag name. You'll see that casing in cost reports.

Tag values are case-sensitive.

If the casing is not being stored the same way the customer defined it, the RP storing the tag name/value would need to investigate.

## What resources support tags?

Only tracked resources support tags. See [Resource routing types](https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Architecture/Resource routing types) - resources with routing type `default` (tracked resources) support tags, while proxy resources do not.

## How are tags created at the API level?

There are two ways to create tags from an API level perspective:

### Method 1: As a top level property of the resource
- Requires write permissions on the specific resource (modifying resource properties)
- PUT/PATCH request is sent directly to the RP to handle the tags update

### Method 2: As an extension resource (Microsoft.Resources/tags)
- Only requires permissions to write `Microsoft.Resources/tags` resource
- Does NOT require write access on the resource being tagged
- This is the method used by Azure Portal
- ARM processes the initial request, then sends a PATCH to the RP for backward compatibility

> Both methods work together. A tag created as a top level property can be queried using the tags extension resource and vice versa.

> **Exception:** `Microsoft.Resources/subscriptions` only supports tags as an extension resource (not as a top level property).

## Tags summarization

The tags summarization runs at the ARM level. It scans all resources in the ARM cache and creates a list of tag names and values.

**Key limit:** Summarization only works if unique tag name/value combinations is below **80,000** (at the time of writing). Each unique tag name + value pair counts as one combination. If the calculation exceeds 80k, the summarization process fails and returns an empty list.

The tags blade in Azure Portal populates its values by calling an ARM API that uses the Tags summarization API.

## Tags cleanup

When a resource is deleted, the tags associated with it are removed. However, ARM may not always clean up these tag name/value combinations from its tags cache - these are called **orphan tags**.

Orphan tags still count toward the 80k summarization calculation. To remove orphan tags:
- [Remove-AzTag PowerShell cmdlet](https://learn.microsoft.com/en-us/powershell/module/az.resources/remove-aztag)
- [az tag CLI command](https://learn.microsoft.com/en-us/cli/azure/tag)
- [Tags Delete Value REST API](https://learn.microsoft.com/en-us/rest/api/resources/tags/delete-value)

## Key Concepts

- **Orphan tags**: Tags still in ARM cache after resource deletion. Resource is no longer known to ARM regardless of whether it still exists at the RP.
- **Tags out of sync**: Tags exist for a resource in both ARM and RP, but tag name or value is inconsistent between the two.

## Additional information

- [Support scope and collaboration scenarios - Tags](https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Process/Support scope and collaboration scenarios&anchor=tags)
- [LEARN: Use tags to organize your Azure resources](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources)
