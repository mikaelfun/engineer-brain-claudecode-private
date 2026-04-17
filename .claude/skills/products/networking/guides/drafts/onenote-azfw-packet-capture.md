# Azure Firewall / Gateway Packet Capture via Escort JIT

> Source: MCVKB/Net/10.18 | ID: networking-onenote-039 | Quality: guide-draft

## Purpose
Run packet capture on Azure Firewall, VPN Gateway, ExpressRoute Gateway, or VWAN instances in Mooncake using Escort JIT session and Jarvis actions.

## Prerequisites
- Escort JIT access (see VNet get operation guide for JIT flow)
- AZFW resource ID or Gateway resource ID
- Jumpbox RDP access

## Azure Firewall Packet Capture Steps

1. **Connect to jumpbox** via Escort JIT (see onenote-vnet-get-escort-jit.md)
2. **Open Jarvis action** for AZFW packet capture, click "get access" button
3. **Fill JIT request** with required information
4. **After JIT approval**, fill AZFW resource ID and capture parameters
5. **Set proper packet count** (default is only 1000 packets - increase as needed)
6. **Copy file path** once job is running (format: `YYYY/M/D/H:MM:SS/azfwpacketcapture`)
7. **Retrieve captures** via second Jarvis action - input file path to get download links per instance
8. **Download** via link (use SAW machine if authorization error from corp machine)

## Gateway Packet Capture (Jarvis Actions)

| Gateway Type | Jarvis Action Link |
|---|---|
| VPN Gateway | `portal.microsoftgeneva.com/5EF2B992` |
| ExpressRoute GW | `portal.microsoftgeneva.com/1A5D5D87` |
| VWAN | `portal.microsoftgeneva.com/7D801562` |

Gateway capture output includes SAS URLs for `.etl` trace files per instance (GatewayTenantWorker_IN_0, IN_1, etc.).

## References
- Public Azure wiki: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/691328
