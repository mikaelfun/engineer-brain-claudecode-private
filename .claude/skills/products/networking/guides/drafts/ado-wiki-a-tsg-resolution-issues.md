---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/DNS Private Resolver/TSG: Private Resolver - Troubleshooting resolution issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]
# TSG: Private Resolver - Troubleshooting resolution issues
---

## Useful tools
---

Use [DigWebInterface (aka.ms/digwebinterface)](https://digwebinterface.azurewebsites.net/PrivateDigQuery/PrivateSearch) to understand expected DNS resolution for a DNS-client in a given Azure Virtual Network from Azure Default DNS perspective.

Required information for use:
- Virtual Network ID
- Region

> aka.ms/digwebinterface is developed by DNS Serving Plane, ICM queue will be cloudnet -> DNSServingPlane.

## Understanding different flows for Inbound and Outbound endpoints

### On-premise to Azure workflow
---

On-premise DNS Client > Local DNS Forwarder (Recommended) > Inbound Endpoint > Private DNS zone (If applies) > Outbound endpoint > DNS Forwarding ruleset > DNS forwarder (based on rule match)

The on-premises DNS conditional forwarder must have a network connection to the virtual network. Reference [Inbound endpoints](https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#inbound-endpoints)

### Azure Virtual Network to on-premise workflow
---

Azure DNS Client > Private DNS zone (If applies) > Outbound endpoint > DNS Forwarding ruleset > DNS forwarder (based on rule match)

### Azure Virtual Network to Azure Virtual Network
---

Azure DNS Client > Private DNS zone (If applies) > Outbound endpoint (Virtual Network Link) > DNS Forwarding ruleset > Azure DNS Client > DNS forwarder (based on rule match)

> Connectivity to inbound endpoint is not required. VNets that are linked from a DNS forwarding ruleset will use the ruleset when performing name resolution, whether or not the linked vnet peers with the ruleset vnet.

## Troubleshooting

### Check connectivity (Inbound endpoint)
---
**Note:**
Connectivity to the inbound endpoint is generally only required to allow DNS resolution for workloads sourced from on-premise. However this might also be required for specific configurations when a virtual network "imitates on-premise" and does not leverage Ruleset links.

**VNET Encryption**

If you have already checked test connectivity along with routing, NVAs/firewalls and NSGs and connectivity to the inbound endpoint is still timing out or unreachable, make sure to check that VNET encryption is not enabled on the VNET.

> ⚠️ VNets with encryption enabled don't support Azure DNS Private Resolver.

References:
- [Private Resolver VNet restrictions](https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#virtual-network-restrictions)
- [VNet Encryption Limitations](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-encryption-overview#limitations)

Virtual networks with encryption enabled don't support Azure DNS Private Resolver, Application Gateway, and Azure Firewall.

#### Connectivity test tools

**PsPing** (Windows):
```
PsPing -t 10.10.10.4:53
```

**nping** (Linux):
```
sudo apt install nmap
nping -c 0 10.10.10.4 -p 53
```

**nc/netcat** (Linux):
```
nc -zv 10.10.10.4 53
```

**Test-NetConnection** (PowerShell):
```
Test-NetConnection 10.10.10.4 -port 53
tnc 10.10.10.4 -port 53
```

### See DNS queries
---

Use **DNSProxyQuery** in Jarvis Logs to confirm if the request has been received by the Private Resolver. The message `QueryReceived` for the specific **qName** (Query name) should show in at least one entry.

To confirm if the response has been sent by the Private Resolver back to the DNS client the message `ResponseSent` should show in at least one entry.

### Check for throttling
---
The following is a common message for **DNSProxyQuery**:

> ThrottleManager::UpdateForUdpQueryResponse - EndpointId not found in inflight query map for timing out packet.

This **does not** indicate the query has been throttled. To confirm actual throttling use **DNSProxyEndpointInfo** in Jarvis Logs.

If `InboundQueryThrottledInflightUdp` or `InboundQueryThrottledInflightTcp` are greater than 0, this indicates throttling.

Azure DNS Private Resolver throttling limits:

| Resource | Limit |
|-|-|
| QPS per endpoint | 10,000 |

### Confirm a virtual network is correctly linked
---
In order for DNS resolution to be modified by DNS Forwarding Rulesets, the virtual network where the Private resolver lives should be linked to the specific forwarding ruleset.

Confirm the link exists using ASC.

### Understand Resolution process priority
---
When using different Azure DNS solutions in conjunction with Private resolver the following Priority applies:

1. Customer DNS server at the VNET level (if any).
2. Private DNS zones with matching domain names attached to the VNET.
3. DNS Forwarding Rulesets (if linked)
4. If a match is found in DNS Forwarding Rulesets, the query is forwarded to the specified address.
5. If no match is found, no DNS forwarding occurs and Azure DNS is used to resolve the query.

### Understand rule match Priority
---

- If multiple rules are matched, the longest prefix match is used.
- If multiple DNS servers are entered as the destination for a rule, the first IP address entered is used unless it doesn't respond.
- If the domain is an Azure service and wildcard rules are also configured in the DNS forwarding ruleset, the specific rule for the domain will be ignored and the wildcard rule will take priority.

### Finding Loops
---

Having a rule forward to an inbound endpoint is fine on its own. However leveraging Private DNS zones to avoid unwanted loops is required.

> If a rule is present in the ruleset that has as its destination a private resolver inbound endpoint, do not link the ruleset to the VNet where the inbound endpoint is provisioned. This configuration can cause DNS resolution loops.

Options to resolve a loop:

- **Use a Private DNS zone for the specific domain name**: Private Zones take higher precedence than forwarding rules, so matching domains are not forwarded from the inbound endpoint back to itself.
- **Update the Rule Forwarding destination**: Setting the forwarding target to a public DNS server will not cause a loop.
- **Remove the link**: Unlinking the ruleset from the VNet with the inbound endpoint resolves the issue.

### Review VMSS for any host level issues
---
From ASC, pin Subscription 83a05a5b-87c2-4990-ad75-cd709aff4a89.
To find the VMSS resource, locate the Tenant information from the DnsProxyQuery table in Jarvis (e.g., azmresmaingw101.eastus2).

On the Subscription, change the view in ASC to Resource Group using the Tenant to find the Resource Group (e.g., g-prod-eastus2-main-gateway-109).

Use tools such as EagleEye to verify if there are any performance issues on any given VMSS Instance.

## Known issues
---
#43714
