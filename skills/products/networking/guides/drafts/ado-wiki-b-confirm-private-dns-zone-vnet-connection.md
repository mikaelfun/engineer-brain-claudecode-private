---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Private DNS zones/How to confirm if a Private DNS zone is connected to a Virtual Network"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FHow%20to%20confirm%20if%20a%20Private%20DNS%20zone%20is%20connected%20to%20a%20Virtual%20Network"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# How to confirm if a Private DNS zone is connected to a Virtual Network

## Description

How to determine if a given Azure Virtual Network is linked to an Azure Private DNS zone.

This information might not be easy to assess, especially if both the VNet and the Private DNS zones are in **different subscriptions**, since ASC will not display this information. The Private DNS zone's VNet link is not imported as an attribute in the NRP object representing a virtual network.

## Resolution

### Option 1 — Jarvis Action (Elevated TA access required)

Use the following Jarvis Action:

[Private DNS Global > Private DNS Global Support Operations > Support LIST Virtual Network Links in Virtual Network Operation](https://portal.microsoftgeneva.com/524D5AF?genevatraceguid=cb521d91-8e83-4842-a67f-9e1e6dbaafad)

### Option 2 — Jarvis Logs Workaround

1. Use JarvisLogs **PrivateDnsRr/IdnsPlugin** — filter by VNETID. The `vNetId` shows under the `message` field. Scope by **Region** and filter by Private DNS zone name. [Reference](https://portal.microsoftgeneva.com/5CF9D431)

2. Under the same `message` field, find the **Bucket** ID:
   > ZoneName:privatelink.azure.com,Bucket:**00000000-0000-0000-0000-000000000000**,

3. Use this **Bucket** value to filter JarvisLogs **PrivateDnsBilling/PrivateZoneEvent** by `PrivateZoneBucketId`. The Bucket ID correlates with the Private DNS zone. Subscription, resource group, and zone name are in the same log. [Reference](https://portal.microsoftgeneva.com/95FC41C5)

### Option 3 — Kusto Query (AzureResourceGraph)

```kusto
let vnetId = tolower("/subscriptions/<your-subscription-id>/resourceGroups/wireguardnva/providers/Microsoft.Network/virtualNetworks/<VNET-name>");

cluster("argwus2nrpone.westus2.kusto.windows.net").database("AzureResourceGraph").Resources
| where type =~ "microsoft.network/privatednszones/virtualnetworklinks"
| where timestamp > ago(2d)
| extend linkedVnetId = tolower(tostring(properties.virtualNetwork.id))
| where linkedVnetId == vnetId
| extend dnsZoneResourceId = substring(id, 0, indexof(id, "/virtualNetworkLinks/"))
| project
    timestamp,
    dnsZoneLinkId = id,
    dnsZoneName   = name,
    dnsZoneResourceId,
    linkName      = split(id, "/")[-1],
    dnsZoneSub    = tostring(split(id, "/")[2]),
    dnsZoneRg     = tostring(split(id, "/")[4]),
    registrationEnabled = tobool(properties.registrationEnabled),
    provisioningState   = tostring(properties.provisioningState),
    vnetLinkState       = tostring(properties.virtualNetworkLinkState)
| order by dnsZoneName asc
```

## Reference

- ICM: [231939797](https://portal.microsofticm.com/imp/v3/incidents/details/231939797/home)
- Contributors: Daniele Gaiulli, Michael Hartle, Oscar Artavia, Karthikeyan Ravichandran, Aaron Sanders
