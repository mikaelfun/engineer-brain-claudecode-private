---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/DNS Private Resolver/TSG: Private Resolver - Troubleshooting CRUD issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]
# TSG: Private Resolver - Troubleshooting CRUD issues
---

The following article is meant to serve as a guideline when investigating Create/Read/Update/Delete (CRUD) operation errors for Azure Resources in the following scope:

- `Microsoft.Network/dnsResolvers`
- `Microsoft.Network/dnsResolvers/inboundEndpoints`
- `Microsoft.Network/dnsResolvers/outboundEndpoints`
- `Microsoft.Network/dnsForwardingRulesets`
- `Microsoft.Network/dnsForwardingRulesets/forwardingRules`
- `Microsoft.Network/dnsForwardingRulesets/virtualNetworkLinks`

## CRUD operation Flow
---
Azure Resource Manager **(ARM)** > Network Resource Provider **(NRP)** > **(ManagedResolver)**

## Region Availability
---
Azure DNS Private Resolver is not currently available in all Azure regions. Attempting to deploy any of the mentioned resource types in an unsupported region will fail.

For an updated list of supported regions see [Regional availability](https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#regional-availability)

## Known restrictions
---
There are several known restrictions publicly documented for private Resolver resources. These include (but are not limited to) the following:

- A DNS resolver can only reference a virtual network in the same region as the DNS resolver.
- A virtual network can't be shared between multiple DNS resolvers. A single virtual network can only be referenced by a single DNS resolver.
- The following **IP address space is reserved** and can't be used for the DNS resolver service: **10.0.1.0 - 10.0.16.255**
- A subnet must be a minimum of /28 address space or a maximum of /24 address space.
- An outbound endpoint **can't be deleted** unless the DNS forwarding ruleset and the virtual network links under it are deleted.
- You can't enter the Azure DNS IP address of **168.63.129.16** as the destination IP address for a rule. Attempting to add this IP address will output the error: **Exception while making add request for rule.**

For a full list see: [What is Azure DNS Private Resolver? | Restrictions](https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#restrictions)

## Troubleshooting
### Check ARM (HttpIncomingRequest)

The first component to check for any request will be Azure Resource Manager (ARM). For this step use:

```
cluster('armprodgbl.eastus.kusto.windows.net').Unionizer('Requests','HttpIncomingRequests')
```

In order to use Kusto to query this information having the following details is desired:
- correlationId
- preciseTimestamp

In case this information is not available the following details will be helpful:
- starttime / endtime
- subscriptionId
- resourcetype (contained in targetUri)
- resourcegroup (contained in targetUri)
- resourcename (contained in targetUri)
- operationName

### Check ARM (EventServiceEntries)
---

Use `EventServiceEntries` as this includes error message information for any operation exception that is properly escaped in successive components.

```
cluster('armprodgbl.eastus.kusto.windows.net').Unionizer('Requests','EventServiceEntries')
```

- Use the `correlationId` from HttpIncomingRequest to filter EventServiceEntries.
- Pull the error Message from `Properties`.

### Check NRP/FrontendOperationsEtwEvents
---

In case additional information is required, check the Network Resource Provider (NRP):

- Use FrontEndOperationEtwEvent Logs to understand any error related to NRP validation or dependency.
- Use `CorrelationId` to filter FrontEndOperationEtwEvent.
- Commonly exceptions returned at the NRP level will surface in `EventServiceEntries`.

### Check ManagedResolver Kusto Logs
---
This is the one source for all resource types related to Azure Private DNS Resolver.

#### ManagedResolver/FrontendQoS
---
1. Use ManagedResolver/FrontendQoS Kusto query as a common source for all operation failures specific to Azure Private DNS Resolver related resource types.
2. Use `CorrelationId` to link operation in this table with NRP and ARM sources.

Common errors shown at this level are:
- Regional restrictions.
- Rule configuration issues.
- Resource dependency issues.

#### OperationName Reference for ManagedResolver
---

| Resource Name | Create or Update operation | Delete operation |
|--|--|--|
| DNS private Resolver | ManagedResolver.PutDnsResolver | ManagedResolver.DeleteDnsResolver |
| Inbound Endpoint | ManagedResolver.PutInboundEndpoint | ManagedResolver.DeleteInboundEndpoint |
| Outbound Endpoint | ManagedResolver.PutOutboundEndpoint | ManagedResolver.DeleteOutboundEndpoint |
| DNS Forwarding Rulesets | ManagedResolver.PutDnsForwardingRuleset | ManagedResolver.DeleteDnsForwardingRuleset |
| DNS forwarding rules | ManagedResolver.PutForwardingRule | ManagedResolver.DeleteForwardingRule |
| Virtual Network Links | ManagedResolver.PutVirtualNetworkLink | ManagedResolver.DeleteVirtualNetworkLink |

### Further investigation
---
1. Use ManagedResolver detailed Tables in case additional details are required for your investigation.
2. Use `ActivityId` to link ManagedResolver specific operations across all its database tables.

## Known issues
---
