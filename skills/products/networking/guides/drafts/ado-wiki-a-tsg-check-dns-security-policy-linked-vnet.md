---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Dns Security Policy/TSG Check If Dns Security Policy is Linked To Vnet"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FDns%20Security%20Policy%2FTSG%20Check%20If%20Dns%20Security%20Policy%20is%20Linked%20To%20Vnet"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> **IMPORTANT**: This Kusto query can surface data from other subscriptions that the customer may not be authorized to access. To maintain strict security and compliance, do not disclose any information unless customer access has been fully confirmed.

> **WARNING**: Because this Kusto query depends on Azure Resource Graph snapshots, it will only return results if changes were made within the specified time window. If no changes occurred during that period, the query will return no data.

# Kusto query to check if DNS Security Policies were linked to a virtual network on the previous day

```kusto
let vnetUri = "/subscriptions/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/resourceGroups/<ResourceGroup>/providers/Microsoft.Network/virtualNetworks/<vnetname>";
cluster("argwus2nrpone.westus2.kusto.windows.net").database("AzureResourceGraph").Resources
| where timestamp > ago(1d)
| where type =~ 'Microsoft.Network/dnsResolverPolicies/virtualnetworklinks'
| extend dnsZoneLink=id
| project-keep dnsZoneLink, properties
| extend dnsZoneVNet=tostring(properties.virtualNetwork.id)
| extend dnsResourceExtract = extract_all("(?i)(/subscriptions/([^/]+)/resourceGroups/([^/]+)/providers/Microsoft.Network/dnsResolverPolicies/([^/]+))/virtualnetworklinks/(.+)", dnsZoneLink)
| extend dnsZoneUri = tostring(dnsResourceExtract[0][0]), dnsZoneSub=tostring(dnsResourceExtract[0][1]),dnsZoneRg=tostring(dnsResourceExtract[0][2]), dnsZoneName=tostring(dnsResourceExtract[0][3]), dnsZoneLinkName=tostring(dnsResourceExtract[0][4])
| extend dnsZoneRegistrationEnabled=tostring(properties.registrationEnabled), dnsZoneProvisioningState=tostring(properties.provisioningState)
| extend dnsZoneVNetLinkState=tostring(properties.virtualNetworkLinkState)
| project-away dnsResourceExtract, properties
| summarize arg_max(dnsZoneVNet, *) by dnsZoneLink
| where dnsZoneVNet =~ vnetUri
```

**Usage**: Replace `vnetUri` with the full resource ID of the VNet you want to check. The query will return any DNS Resolver Policy VNet links where the VNet matches.
