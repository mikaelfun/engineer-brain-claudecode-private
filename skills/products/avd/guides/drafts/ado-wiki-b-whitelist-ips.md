---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Whitelist IP's"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/Whitelist%20IP%27s"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Marked as Outdated - Needs review if still useful"
---

# Whitelist AVD IP Addresses

There are a few ways of leveraging the list of Azure Virtual Desktop IP datacenter ranges:

1. **Download the JSON** from the download site: [Download Azure IP Ranges and Service Tags - Public Cloud](https://www.microsoft.com/en-us/download/details.aspx?id=56519)
   - Challenge: The list is updated weekly and Virtual Desktop addresses can change.

1. **Use Azure native services with Service Tags** — always current with the list of underlying IP addresses. [Azure service tags overview](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview)
   - Service tags can be used in Azure Firewall, for example.

1. **Recommended for 3rd party products (e.g., ZScaler): use the Service Tag Discovery API** [Azure service tags overview - API](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#use-the-service-tag-discovery-api-public-preview)
   - REST API and command line tools available for retrieving IP address ranges
   - Can automate updates via 3rd party product automation
   - Ideally 3rd parties will integrate with the Azure API

**Note**: In the JSON list of IP Addresses, the section to use is: `"WindowsVirtualDesktop"`

## Retrieve AVD IP Addresses via REST API

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://management.azure.com/subscriptions/<subscription-id>/providers/Microsoft.Network/locations/eastus/serviceTags?api-version=2021-02-01 \
  | jq '[.values[] | select(.name == "WindowsVirtualDesktop") .properties .addressPrefixes]'
```
