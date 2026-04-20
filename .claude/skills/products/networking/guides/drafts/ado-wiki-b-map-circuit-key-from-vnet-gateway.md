---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/How To Map a Circuit Key from a VNet Id or Gateway Id"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/How%20To%20Map%20a%20Circuit%20Key%20from%20a%20VNet%20Id%20or%20Gateway%20Id"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# How To Map a Circuit Key from a VNet Id

[[_TOC_]]

## Useful Scenarios
There are times when you need to map an ExpressRoute circuit key from a VNet Id or Gateway Id. Such scenarios include but are not limited to:
- ASC not loading or unable to find Circuit from Gateway (VWAN scenario)
- Unlinking a legacy (SM) VNet from a circuit when the customer does not know the relevant information
- Troubleshooting CRUD issues if Gateway Manager and NRP are out of sync

## How-to
### Prerequisites:
- VNet Id: This is found in ASC on the Virtual Network or Classic Virtual Network properties pane and is in the form of a GUID
- Gateway ID: This is found in ASC on the Virtual Network Gateway properties pane and is in the form of a GUID

Use [Kusto Explorer](http://aka.ms/ke) and run the following query:
#### Vnet Id
```
cluster('hybridnetworking.kusto.windows.net').database('aznwmds').DedicatedCircuitLinkTable
| where PreciseTimeStamp > ago(5d)
| where VirtualNetworkId == "00000000-0000-0000-0000-000000000000"
```
*This assumes the customer's VNet Id is: ``00000000-0000-0000-0000-000000000000`` which is obviously fictitious.*

#### Gateway ID
```
cluster('hybridnetworking.kusto.windows.net').database('aznwmds').DedicatedCircuitLinkTable
| where PreciseTimeStamp > ago(5d)
| where * contains "00000000-0000-0000-0000-000000000000"
```
*This assumes the customer's Gateway Id is: ``00000000-0000-0000-0000-000000000000`` which is obviously fictitious.*

### Classic
For classic VNet unlink scenarios, please reference the following wiki: 

[Deprovisioning a Classic ExpressRoute Dedicated Circuit Gateway and VNET Gracefully](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/503591/Deprovisioning-a-Classic-ExpressRoute-Dedicated-Circuit-Gateway-and-VNET-gracefully)

# Contributors
- @<AAD67C1A-C862-4157-995E-B930B4652CED>
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>

