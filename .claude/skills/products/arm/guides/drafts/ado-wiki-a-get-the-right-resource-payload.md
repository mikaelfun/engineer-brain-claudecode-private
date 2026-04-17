---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Troubleshooting Guides/Get the right resource payload"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FTroubleshooting%20Guides%2FGet%20the%20right%20resource%20payload"
importDate: "2026-04-05"
type: troubleshooting-guide
---

When writing or troubleshooting a policy it is important to understand where policy obtains the resource data for **brownfield** or **greenfield** evaluation.

Obtaining the data from a different place might lead you to troubleshoot with incorrect information.

[[_TOC_]]

## Quick summary
For brownfield:
- Use the **collection GET on the subscription** when assignment scope is subscription or management group:
  `/subscriptions/{guid}/providers/{providerNamespace}/{resourceType}`
- Use the **collection GET on the RG** when assignment scope is a resource group:
  `/subscriptions/{guid}/resourceGroups/rgName/providers/{providerNamespace}/{resourceType}`
- **-INE definitions only**: Use the **resource GET** when the `details` section provides a `name` property:
  `/subscriptions/{guid}/resourceGroups/rgName/providers/{providerNamespace}/{resourceType}/{resourceName}`

For greenfield:
- Use the **incoming PUT or PATCH request payload** (ARM template, HAR trace, PowerShell `-Debug`, CLI `--debug`, or Fiddler).

> **Never** use an exported ARM template from an existing resource for writing or troubleshooting — it is not the raw data policy uses for evaluation.

## Determine brownfield or greenfield
- **Brownfield** → compliance results not as expected (audit / auditIfNotExists effects)
- **Greenfield** → policy enforcement not behaving as expected during resource create/update (deny / modify / append / deployIfNotExists effects)

## Brownfield

### Resource GET (applicable only to `details` section in -INE policies)
Only if the policy definition has a `name` condition to target a specific resource.

API format:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{providerNamespace}/{resourceType}/{resourceName}`

Options to obtain:
- **Jarvis**: [[JARVIS] Get resource from URI](https://jarvis-west.dc.ad.msft.net/220EAE93?genevatraceguid=e84d5ab5-4b5f-4873-be4c-d58cba224834)
- **API reference (Try it)**: [Azure REST API reference](https://learn.microsoft.com/en-us/rest/api/azure/) — use the "Get" operation
- **Resource Explorer**: `https://resources.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{providerNamespace}/{resourceType}/{resourceName}`

### Collection GET — Subscription/Management Group scope
API format:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/providers/{providerNamespace}/{resourceType}`

Options:
- **Jarvis**: [[JARVIS] Get Resources from Provider](https://jarvis-west.dc.ad.msft.net/DB5B966?genevatraceguid=8f7887a0-2920-4c92-9abb-f8d1f0026782)
- **API reference**: Use "List" or "List by subscription"
- **Resource Explorer**: `https://resources.azure.com/subscriptions/{subscriptionId}/providers/{providerNamespace}/{resourceType}`

### Collection GET — Resource Group scope
API format:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{providerNamespace}/{resourceType}`

Options:
- **Jarvis**: [[JARVIS] Get Resource Group Resources](https://jarvis-west.dc.ad.msft.net/44C96DF1?genevatraceguid=e84d5ab5-4b5f-4873-be4c-d58cba224834)
- **API reference**: Use "List by Resource Group"
- **Resource Explorer**: `https://resources.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{providerNamespace}/{resourceType}`

## Greenfield

Greenfield always uses a PUT or PATCH request payload. Ask the customer to provide the payload via one of:

| Customer tool | How to get payload |
|---|---|
| ARM template | Share the template (+ parameter file if needed) |
| Portal | Use "Export template for automation" on create experience; or capture a HAR trace |
| PowerShell | Add `-Debug` switch to the create/update command |
| CLI | Add `--debug` switch to the create/update command |
| Postman / cURL | Share the raw request payload |
| Other tools | Use Fiddler to capture the request |

> See also [[ARCH] How effects work](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623661/) for full context.
