---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Firewall Manager - Using Secure Hub (VWAN) Routing"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages/Azure%20Firewall/Features%20%26%20Functions/Firewall%20Manager%20-%20Using%20Secure%20Hub%20(VWAN)%20Routing"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Overview

When a customer deploys a VWAN HUB, they have the option of turning it into a SECURE HUB:
- Azure Firewall is deployed into the VWAN HUB
- Routing which forces spoke VNet traffic is managed by the Route Service (no UDRs needed on spoke VNet subnets)
- Caveat: customer could use a 3rd party security vendor for default route 0.0.0.0/0 traffic
- Known Issue with Routing: https://docs.microsoft.com/en-us/azure/firewall-manager/overview#known-issues (e.g., Branch to Branch, Branch to P2S Client not supported)

# Securing Internet Traffic

Forces spoke VNet routing to Azure Firewall with 0.0.0.0/0 next-hop AZFW.
- VM effective routes show Virtual Network Gateway with AZFW Private IP
- Test traffic shows Route Target VPN (not NVA)
- Process Tuples: Destination IP changes to PA of AZFW ILB (not public IP, not Route Service IP, not Gateway IP)

# Securing Private Traffic

Forces RFC 1918 space (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) or custom private ranges to Azure Firewall.
- Customer can customize Private Prefixes
- Traceroute shows hop through AZFW instance

## Private Connections - Subnet to Subnet (Same VNet)

By default, even with Private Prefix secured, subnet-to-subnet traffic in same spoke VNet goes via local VNet route (more specific prefix than RFC 1918).

**Workaround:** Manually add UDR/Route Table on VNet subnets forcing VNet range to AZFW Private ILB IP.

**PRIVATE PREFIXES does NOT work for this:** Adding spoke VNet ranges to Private Prefix text box does not propagate overriding routes to source VNet effective routes.

# 3rd Party Security Providers

SAAS environments (Zscaler, Iboss, Checkpoint) connected via VWAN VPN.
- VPN GWs receive 0.0.0.0/0 from VPN BGP connection, broadcast to selected VNets via RS

## Scenario 1: Only Security Partner for Internet

- Route Service advertises 0.0.0.0/0 to configured VNets
- VM effective routes show VPN Gateway IPs as next hop

## Scenario 2: Security Partner (Internet) + AZFW (Private)

- All traffic (default route + private ranges) appears to go through AZFW
- 0.0.0.0/0 goes to AZFW IP even though Security Partner is configured for internet
- This is BY DESIGN to prevent asymmetric routing
- Traffic routes through AZFW first, then egresses to VPN GW and Security Partner
- Internet traffic rules must also be created on AZFW
