---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Check ExpressRoute Gateway Migration Eligibility"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Check%20ExpressRoute%20Gateway%20Migration%20Eligibility"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

# ExpressRoute Gateway Migration Guidance

## IP Address Retirement Notice

Per Microsoft documentation and customer alerts, on **September 30, 2025**, Basic SKU IP addresses will be retired. Customers utilizing ExpressRoute Gateways with Basic SKU IP addresses must migrate to a gateway utilizing a **Standard SKU Public IP Address**.

## Gateway SKU Recommendations

Microsoft strongly suggests customers move away from the **Standard**, **HighPerformance**, and **UltraPerformance** ExpressRoute Gateway SKUs. These SKUs are often used with Basic SKU IP Addresses and **do not support Zone Redundancy**.

## Migration Limitations

The documentation regarding ExpressRoute Gateway SKU migrations includes the following limitations:

- **ExpressRoute Only**: The migration tool is designed for ExpressRoute virtual network gateways. It does not support VPN gateways or other gateway types.
- **Same Virtual Network Requirement**: Migration is only supported within the same virtual network. Cross-subscription, cross-region, or cross-gateway-type migrations (e.g., to/from VPN gateways) aren't supported.
- **No Downgrades**: Downgrading from an Az-enabled SKU to a non-Az-enabled SKU is not supported.
- **GatewaySubnet Size**: The GatewaySubnet must have a /27 prefix or longer to proceed with migration. See https://learn.microsoft.com/ for more information.
- **Private Endpoint Connectivity**: Private endpoints (PEs) connected via ExpressRoute private peering may experience connectivity issues during migration. Refer to guidance in the https://learn.microsoft.com/.
- **Legacy Gateways**: ExpressRoute gateways created or connected to circuits in 2017 or earlier aren't supported.
- **Unsupported SKUs**: Gateways using the "default" SKU aren't eligible for migration. Check migration eligibility via Advisor notification.


## Migration Eligibility Checks via Kusto

Checking these manually on even a single gateway can be time consuming and error prone. The product group has developed a way to check via Kusto by either **Gateway ID** or **Resource URI**. These queries allow checking multiple gateways at a time and enable customers to supply resource information.

If you receive an error running these queries in Azure Data Explorer (ADX) please comment out the cluster portion, as there seems to be a UI update which allows you to simply select the cluster+database with no requirement to include the cluster+database in the actual query.

Finally, this query requires access to Azure Resource Graph, which should be included in access to Cluster Argwus2nrpone.westus2, available to Support Engineers [Here](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/argnetworkin-tv1j) as part of ARG Networking Stamp Users access. [Wiki Reference](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/401004/Kusto-Clusters-and-Requirements?anchor=kusto-cluster-clouds)

### Check by Gateway ID
```
cluster('hybridnetworking.kusto.windows.net').database('aznwmds');
let gwList = dynamic(["Gateway ID"]); 
// Multiple GW IDs can be input at once, separated by commas, ex: let gwList = dynamic(["Gateway ID 1", "Gateway ID 2", "etc"]); The final ID is in "" with no comma after it.
AreGatewaysApplicableForMigration(gwList)
```

Example Scenario: customer has an issue with migration, or questions about a single resource. You pull the Gateway ID from ASC, and check migration eligibility and confirm if the gateway is eligible to use the Migration Tool. This can confirm if there is an issue with the backend processing, or if the gateway itself is not eligible for migration.

### Check by Resource URI
```
cluster('hybridnetworking.kusto.windows.net').database('aznwmds');
let uriList = dynamic(["Gateway URI/Resource ID example: /subcriptions/sub number/resource groups/group name/providers/Microsoft.Network/virtualNetworkGateways/name"]);
// Multiple URIs can be input at once, separated by commas, ex: let uriList = dynamic(["URI 1", "URI 2", "etc"]); The final URI is in "" with no comma after it.
AreExRGatewayUrisApplicableForMigration(uriList)
```
Example Scenario: while a support engineer could also check by Resource URI, this is very helpful as customers do not have access to gateway IDs, they can provide us with Resource URIs. It is a little more cumbersome to use, which is why internally the Gateway ID option is more desirable, but this allows us to take customer supplied data and immediately check the status of their gateways with regard to migration eligibility.


Lastly, please be wary of the HOBO IP or Automatically Assigned IP address which will very likely be assigned to all migrated gateways, as these gateways are effectively newly created gateways. This can confuse customers as they will no longer see a Public IP associated with their gateway in the portal, and the Public IP of their old gateway will sometimes not be automatically deleted, causing understandable concern their IP address was "left behind" in the migration. This is completely normal, and can be checked in ASC. The Public IP on ExpressRoute Gateway is solely for MSFT management, and does not have any effect on customer traffic. Customers were previously charged for the Public IP assigned to their ExpressRoute Gateway, but are now no longer billed for HOBO/Automatically Assigned IP addresses on ExpressRoute Gateways.

### Public Document Reference

Upgrade Basic Public IP Address to Standard SKU in Azure
[Upgrade Basic Public IP Address to Standard SKU in Azure | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-basic-upgrade-guidance)

About ExpressRoute virtual network gateways
[About ExpressRoute Virtual Network Gateways | Microsoft Learn](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways)

About ExpressRoute Gateway Migration
[About migrating to an availability zone-enabled ExpressRoute virtual network gateway - Azure ExpressRoute | Microsoft Learn](https://learn.microsoft.com/en-us/azure/expressroute/gateway-migration)

Migrate to an availability zone-enabled ExpressRoute virtual network gateway in Azure portal
[Migrate to an availability zone-enabled ExpressRoute virtual network gateway in Azure portal - Azure ExpressRoute | Microsoft Learn](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-gateway-migration-portal)

Migrate to an availability zone-enabled ExpressRoute virtual network gateway using PowerShell
[Migrate to an availability zone-enabled ExpressRoute virtual network gateway using PowerShell - Azure ExpressRoute | Microsoft Learn](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-gateway-migration-powershell)

Auto-Assigned Public IP
[Auto-Assigned Public IP Address | Microsoft Learn](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways#auto-assigned-public-ip)

How to convert your legacy ExpressRoute gateway connections
[How to convert your legacy ExpressRoute gateway connections | Microsoft Learn](https://learn.microsoft.com/en-us/azure/expressroute/howto-recreate-connections)

Special thanks to Joseph Abel and Rachel Chu for their assistance in getting this Wiki and Kusto!
